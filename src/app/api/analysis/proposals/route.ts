import { FieldValue } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api-auth";
import { assertAndConsumeCredit } from "@/lib/credits";
import { adminDb } from "@/lib/firebase-admin";
import { generateBusinessAnalysis } from "@/lib/gemini";
import { extractPdfText } from "@/lib/pdf";
import { PROPOSAL_COMPARISON_PROMPT } from "@/lib/prompts";
import { uploadTemporaryPdf } from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const formData = await request.formData();
    const files = formData.getAll("files").filter((file): file is File => file instanceof File);

    if (files.length < 2 || files.length > 4) {
      return NextResponse.json({ error: "Debes subir entre 2 y 4 propuestas PDF." }, { status: 400 });
    }

    await assertAndConsumeCredit(user.uid);
    const sections = await Promise.all(
      files.map(async (file, index) => {
        await uploadTemporaryPdf(user.uid, file);
        const text = await extractPdfText(file);
        return `Propuesta ${index + 1} - ${file.name}:\n\n${text}`;
      }),
    );
    const result = await generateBusinessAnalysis(PROPOSAL_COMPARISON_PROMPT, sections.join("\n\n---\n\n"));

    await adminDb.collection("analyses").add({
      uid: user.uid,
      type: "proposals",
      title: files.map((file) => file.name).join(", "),
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
    return NextResponse.json({ error: "No se pudieron comparar las propuestas." }, { status: 500 });
  }
}
