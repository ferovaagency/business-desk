import { FieldValue } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api-auth";
import { adminDb } from "@/lib/firebase-admin";
import { generateBusinessAnalysis } from "@/lib/gemini";
import { extractPdfTextFromBuffer } from "@/lib/pdf";
import { CONTRACT_REVIEW_PROMPT, PROPOSAL_COMPARISON_PROMPT } from "@/lib/prompts";
import { downloadTemporaryPdf, uploadTemporaryPdf } from "@/lib/storage";
import type { AnalysisType } from "@/lib/types";

export const runtime = "nodejs";

const ANALYSIS_PRICE_USD = 10;
const STEP_TIMEOUT_MS = 120000;

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`${label} excedió ${Math.round(ms / 1000)}s.`)), ms);
    }),
  ]);
}

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const startedAt = Date.now();
  let analysisRef: FirebaseFirestore.DocumentReference | null = null;

  try {
    console.log(`[PayPal API][${requestId}] Request started`);
    const user = await requireUser(request);
    const formData = await request.formData();
    const type = formData.get("type") as AnalysisType | null;
    const promoCode = String(formData.get("promoCode") ?? "");
    const files = formData.getAll("files").filter((file): file is File => file instanceof File);
    console.log(`[PayPal API][${requestId}] Authenticated uid=${user.uid} type=${type} files=${files.length} promo=${promoCode === "MAFE_DEV_2026" ? "valid-test-code" : "standard"}`);

    if (type !== "contract" && type !== "proposals") {
      return NextResponse.json({ error: "Invalid analysis type." }, { status: 400 });
    }

    if (type === "contract" && files.length !== 1) {
      return NextResponse.json({ error: "Upload exactly one contract PDF." }, { status: 400 });
    }

    if (type === "proposals" && (files.length < 2 || files.length > 4)) {
      return NextResponse.json({ error: "Upload between 2 and 4 proposal PDFs." }, { status: 400 });
    }

    console.log(`[PayPal API][${requestId}] Uploading files to storage`, files.map((file) => ({ name: file.name, size: file.size, type: file.type })));
    const storagePaths = await withTimeout(
      Promise.all(files.map((file) => uploadTemporaryPdf(user.uid, file))),
      STEP_TIMEOUT_MS,
      "La subida de archivos",
    );
    console.log(`[PayPal API][${requestId}] Files uploaded`, storagePaths);
    const title = type === "contract" ? files[0].name : files.map((file) => file.name).join(", ");
    analysisRef = await withTimeout(
      adminDb.collection("analyses").add({
        uid: user.uid,
        type,
        title,
        status: "processing",
        amount: ANALYSIS_PRICE_USD,
        currency: "USD",
        provider: "paypal-prototype",
        storagePaths,
        fileNames: files.map((file) => file.name),
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      }),
      STEP_TIMEOUT_MS,
      "La creación del registro de análisis",
    );
    console.log(`[PayPal API][${requestId}] Analysis document created id=${analysisRef.id}`);

    try {
      const sections = await Promise.all(
        storagePaths.map(async (path, index) => {
          console.log(`[PayPal API][${requestId}] Downloading PDF index=${index} path=${path}`);
          const buffer = await withTimeout(downloadTemporaryPdf(path), STEP_TIMEOUT_MS, "La descarga del PDF");
          console.log(`[PayPal API][${requestId}] Extracting PDF text index=${index} bytes=${buffer.length}`);
          const text = await withTimeout(extractPdfTextFromBuffer(buffer), STEP_TIMEOUT_MS, "La extracción de texto del PDF");
          if (!text) {
            throw new Error(`No se pudo extraer texto del archivo ${files[index]?.name ?? path}. Verifica que el PDF no sea una imagen escaneada.`);
          }
          console.log(`[PayPal API][${requestId}] PDF text extracted index=${index} chars=${text.length}`);
          const label = type === "contract" ? "Contract" : `Proposal ${index + 1}`;
          return `${label} - ${files[index]?.name ?? path}:\n\n${text}`;
        }),
      );

      const prompt = type === "contract" ? CONTRACT_REVIEW_PROMPT : PROPOSAL_COMPARISON_PROMPT;
      const content = type === "contract" ? sections[0] : sections.join("\n\n---\n\n");
      console.log(`[PayPal API][${requestId}] Sending content to Gemini chars=${content.length}`);
      const result = await withTimeout(generateBusinessAnalysis(prompt, content), STEP_TIMEOUT_MS + 15000, "La generación del informe con Gemini");
      console.log(`[PayPal API][${requestId}] Gemini completed resultChars=${result.length}`);

      await withTimeout(analysisRef.update({
        result,
        status: "completed",
        completedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      }), STEP_TIMEOUT_MS, "La actualización final del análisis");

      console.log(`[PayPal API][${requestId}] Request completed in ${Date.now() - startedAt}ms`);
      return NextResponse.json({ analysisId: analysisRef.id, status: "completed", result, requestId });
    } catch (error) {
      const message = errorMessage(error);
      console.error(`[PayPal API][${requestId}] Analysis failed`, { message, stack: error instanceof Error ? error.stack : undefined });
      await analysisRef.update({
        status: "failed",
        error: message,
        failedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      return NextResponse.json({ analysisId: analysisRef.id, status: "failed", error: message, requestId }, { status: 500 });
    }
  } catch (error) {
    const message = errorMessage(error);
    console.error(`[PayPal API][${requestId}] Request failed`, { message, stack: error instanceof Error ? error.stack : undefined });
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized.", requestId }, { status: 401 });
    }
    if (analysisRef) {
      await analysisRef.update({
        status: "failed",
        error: message,
        failedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
    return NextResponse.json({ error: message || "Could not process the PayPal prototype analysis.", requestId }, { status: 500 });
  }
}







