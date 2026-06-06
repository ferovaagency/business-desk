import { FieldValue } from "firebase-admin/firestore";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { generateBusinessAnalysis } from "@/lib/gemini";
import { extractPdfTextFromBuffer } from "@/lib/pdf";
import { CONTRACT_REVIEW_PROMPT, PROPOSAL_COMPARISON_PROMPT } from "@/lib/prompts";
import { downloadTemporaryPdf } from "@/lib/storage";
import type { AnalysisType } from "@/lib/types";

export const runtime = "nodejs";

function getMercadoPagoClient() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error("MERCADOPAGO_ACCESS_TOKEN is required");
  }
  return new MercadoPagoConfig({ accessToken });
}

async function runPaidAnalysis(analysisId: string) {
  const analysisRef = adminDb.collection("analyses").doc(analysisId);
  const snapshot = await analysisRef.get();

  if (!snapshot.exists) {
    throw new Error("Analysis not found");
  }

  const analysis = snapshot.data() as {
    uid: string;
    type: AnalysisType;
    title: string;
    status: string;
    storagePaths: string[];
    fileNames: string[];
  };

  if (analysis.status === "completed" || analysis.status === "processing") {
    return;
  }

  await analysisRef.update({
    status: "processing",
    updatedAt: FieldValue.serverTimestamp(),
  });

  try {
    const sections = await Promise.all(
      analysis.storagePaths.map(async (path, index) => {
        const buffer = await downloadTemporaryPdf(path);
        const text = await extractPdfTextFromBuffer(buffer);
        const label = analysis.type === "contract" ? "Contrato" : `Propuesta ${index + 1}`;
        return `${label} - ${analysis.fileNames[index] ?? path}:\n\n${text}`;
      }),
    );

    const prompt = analysis.type === "contract" ? CONTRACT_REVIEW_PROMPT : PROPOSAL_COMPARISON_PROMPT;
    const content = analysis.type === "contract" ? sections[0] : sections.join("\n\n---\n\n");
    const result = await generateBusinessAnalysis(prompt, content);

    await analysisRef.update({
      result,
      status: "completed",
      completedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error("Paid analysis processing error", error);
    await analysisRef.update({
      status: "failed",
      error: error instanceof Error ? error.message : "Error desconocido procesando el análisis.",
      updatedAt: FieldValue.serverTimestamp(),
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const paymentId = payload?.data?.id ?? payload?.id;

    if (!paymentId) {
      return NextResponse.json({ received: true });
    }

    const payment = await new Payment(getMercadoPagoClient()).get({ id: paymentId });

    if (payment.status !== "approved") {
      return NextResponse.json({ received: true });
    }

    const analysisId = String(payment.external_reference ?? payment.metadata?.analysis_id ?? "");

    if (!analysisId) {
      return NextResponse.json({ received: true });
    }

    const eventRef = adminDb.collection("paymentEvents").doc(String(paymentId));
    const eventSnapshot = await eventRef.get();

    if (!eventSnapshot.exists) {
      await eventRef.set({
        analysisId,
        status: payment.status,
        provider: "mercadopago",
        processedAt: FieldValue.serverTimestamp(),
      });
      await runPaidAnalysis(analysisId);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("MercadoPago webhook error", error);
    return NextResponse.json({ received: true });
  }
}

