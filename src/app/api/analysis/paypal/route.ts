import { FieldValue } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api-auth";
import { adminDb } from "@/lib/firebase-admin";
import { generateBusinessAnalysis } from "@/lib/gemini";
import { extractPdfTextFromBuffer } from "@/lib/pdf";
import { downloadTemporaryPdf, uploadTemporaryPdf } from "@/lib/storage";
import { buildExpertisePrompt } from "@/expertise";
import type { AnalysisContext, AnalysisType, ContractType, ContractUserRole, StructuredAnalysisResult, ProposalComparisonResult, SupportedCountry, ExpertiseTool } from "@/lib/types";

export const runtime = "nodejs";

const ANALYSIS_PRICE_USD = 10;
const STEP_TIMEOUT_MS = 120000;

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function parseStructuredResult(raw: string, context: AnalysisContext): StructuredAnalysisResult {
  const clean = raw.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
  const parsed = JSON.parse(clean) as Partial<StructuredAnalysisResult>;
  const ensureArray = (value: unknown) => Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [];

  return {
    summary: typeof parsed.summary === "string" ? parsed.summary : "Análisis generado correctamente.",
    correct: ensureArray(parsed.correct),
    riskPartyOne: ensureArray(parsed.riskPartyOne),
    riskPartyTwo: ensureArray(parsed.riskPartyTwo),
    protection: ensureArray(parsed.protection),
    missing: ensureArray(parsed.missing),
    keyQuestions: ensureArray(parsed.keyQuestions),
    metadata: {
      country: parsed.metadata?.country ?? context.country,
      userRole: parsed.metadata?.userRole ?? context.userRole,
      contractType: parsed.metadata?.contractType ?? context.contractType,
      analysisType: "contract",
    },
  };
}

function parseProposalResult(raw: string, context: AnalysisContext): ProposalComparisonResult {
  const clean = raw.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
  const parsed = JSON.parse(clean) as Partial<ProposalComparisonResult>;
  const ensureStringArray = (value: unknown) =>
    Array.isArray(value)
      ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      : [];

  const proposals = Array.isArray(parsed.proposals)
    ? parsed.proposals.map((p, i) => ({
        name: typeof p?.name === "string" && p.name.trim() ? p.name : `Propuesta ${String.fromCharCode(65 + i)}`,
        alignmentScore: typeof p?.alignmentScore === "number" ? Math.min(100, Math.max(0, Math.round(p.alignmentScore))) : 0,
        strengths: ensureStringArray(p?.strengths),
        weaknesses: ensureStringArray(p?.weaknesses),
        whatItContributes: ensureStringArray(p?.whatItContributes),
        whatItLacks: ensureStringArray(p?.whatItLacks),
      }))
    : [];

  return {
    businessObjective: typeof parsed.businessObjective === "string" ? parsed.businessObjective : "Objetivo no especificado.",
    summary: typeof parsed.summary === "string" ? parsed.summary : "Comparación generada correctamente.",
    recommendation: typeof parsed.recommendation === "string" ? parsed.recommendation : "Ver detalles en cada propuesta.",
    proposals,
    negotiationTips: ensureStringArray(parsed.negotiationTips),
    keyQuestions: ensureStringArray(parsed.keyQuestions),
    metadata: {
      country: parsed.metadata?.country ?? context.country,
      analysisType: "proposals",
    },
  };
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`${label} excedió ${Math.round(ms / 1000)}s.`)), ms);
    }),
  ]);
}

function removeUndefinedValues<T extends Record<string, unknown>>(value: T): Partial<T> {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined)) as Partial<T>;
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
    const context: AnalysisContext = removeUndefinedValues({
      country: (String(formData.get("country") ?? "CO") || "CO") as SupportedCountry,
      userRole: String(formData.get("userRole") ?? "") as ContractUserRole || undefined,
      contractType: String(formData.get("contractType") ?? "") as ContractType || undefined,
      userContext: String(formData.get("userContext") ?? "").trim(),
      companyContext: String(formData.get("companyContext") ?? "").trim(),
    }) as AnalysisContext;
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

    const normalizedCountry = context.country.toLowerCase();
    if (normalizedCountry !== "co" && normalizedCountry !== "colombia") {
      return NextResponse.json({ error: "País no soportado todavía." }, { status: 400 });
    }

    const countryForExpertise = normalizedCountry === "co" ? "colombia" : normalizedCountry;

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
        context,
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

      const toolType: ExpertiseTool = type === "contract" ? "legal" : "proposals";
      const prompt = buildExpertisePrompt(countryForExpertise, toolType, context, type);
      const content = type === "contract" ? sections[0] : sections.join("\n\n---\n\n");
      
      console.log(`[PayPal API][${requestId}] Analysis type: ${type}, Tool type: ${toolType}`);
      console.log(`[PayPal API][${requestId}] Prompt preview (first 200 chars): ${prompt.substring(0, 200)}...`);
      console.log(`[PayPal API][${requestId}] Sending content to Gemini chars=${content.length}`);
      const rawResult = await withTimeout(generateBusinessAnalysis(prompt, content), STEP_TIMEOUT_MS + 15000, "La generación del informe con Gemini");
      const result = type === "proposals"
        ? parseProposalResult(rawResult, context)
        : parseStructuredResult(rawResult, context);
      console.log(`[PayPal API][${requestId}] Gemini completed resultChars=${rawResult.length}`);

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







