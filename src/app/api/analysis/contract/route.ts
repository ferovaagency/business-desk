import { FieldValue } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api-auth";
import { assertAndConsumeCredit } from "@/lib/credits";
import { adminDb } from "@/lib/firebase-admin";
import { generateBusinessAnalysis } from "@/lib/gemini";
import { extractPdfText } from "@/lib/pdf";
import { CONTRACT_REVIEW_PROMPT } from "@/lib/prompts";
import { uploadTemporaryPdf } from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const formData = await request.formData();
    const files = formData.getAll("files").filter((file): file is File => file instanceof File);

    if (files.length !== 1) {
      return NextResponse.json({ error: "Debes subir exactamente un contrato PDF." }, { status: 400 });
    }

    await assertAndConsumeCredit(user.uid);
    await uploadTemporaryPdf(user.uid, files[0]);
    const text = await extractPdfText(files[0]);
    const result = await generateBusinessAnalysis(CONTRACT_REVIEW_PROMPT, `Contrato:\n\n${text}`);

    await adminDb.collection("analyses").add({
      uid: user.uid,
      type: "contract",
      title: files[0].name,
      result,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ result });
  } catch (error) {
    if (error instanceof Error && error.message === "INSUFFICIENT_CREDITS") {
      return NextResponse.json({ error: "Créditos insuficientes." }, { status: 402 });
    }
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }
    return NextResponse.json({ error: "No se pudo analizar el contrato." }, { status: 500 });
  }
}
