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

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const formData = await request.formData();
    const type = formData.get("type") as AnalysisType | null;
    const files = formData.getAll("files").filter((file): file is File => file instanceof File);

    if (type !== "contract" && type !== "proposals") {
      return NextResponse.json({ error: "Invalid analysis type." }, { status: 400 });
    }

    if (type === "contract" && files.length !== 1) {
      return NextResponse.json({ error: "Upload exactly one contract PDF." }, { status: 400 });
    }

    if (type === "proposals" && (files.length < 2 || files.length > 4)) {
      return NextResponse.json({ error: "Upload between 2 and 4 proposal PDFs." }, { status: 400 });
    }

    console.log("[PayPal API] Uploading files to storage...");
    const storagePaths = await Promise.all(files.map((file) => uploadTemporaryPdf(user.uid, file)));
    console.log("[PayPal API] Files uploaded:", storagePaths);
    const title = type === "contract" ? files[0].name : files.map((file) => file.name).join(", ");
    const analysisRef = await adminDb.collection("analyses").add({
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
    });

    try {
      const sections = await Promise.all(
        storagePaths.map(async (path, index) => {
          const buffer = await downloadTemporaryPdf(path);
          const text = await extractPdfTextFromBuffer(buffer);
          const label = type === "contract" ? "Contract" : `Proposal ${index + 1}`;
          return `${label} - ${files[index]?.name ?? path}:\n\n${text}`;
        }),
      );

      const prompt = type === "contract" ? CONTRACT_REVIEW_PROMPT : PROPOSAL_COMPARISON_PROMPT;
      const content = type === "contract" ? sections[0] : sections.join("\n\n---\n\n");
      const result = await generateBusinessAnalysis(prompt, content);

      await analysisRef.update({
        result,
        status: "completed",
        completedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      return NextResponse.json({ analysisId: analysisRef.id, status: "completed", result });
    } catch (error) {
      console.error("[PayPal API] Analysis failed:", error);
      if (error instanceof Error) {
        console.error("[PayPal API] Error message:", error.message);
        console.error("[PayPal API] Error stack:", error.stack);
      }
      const message = error instanceof Error ? error.message : "Unknown analysis error.";
      await analysisRef.update({
        status: "failed",
        error: message,
        updatedAt: FieldValue.serverTimestamp(),
      });
      return NextResponse.json({ analysisId: analysisRef.id, status: "failed", error: message }, { status: 500 });
    }
  } catch (error) {
    console.error("[PayPal API] Request failed:", error);
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    return NextResponse.json({ error: "Could not process the PayPal prototype analysis." }, { status: 500 });
  }
}






