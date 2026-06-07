import { extractText, getDocumentProxy } from "unpdf";

export async function extractPdfText(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  return extractPdfTextFromBuffer(Buffer.from(arrayBuffer));
}

export async function extractPdfTextFromBuffer(buffer: Buffer) {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(pdf, { mergePages: true });
  return text.trim();
}

