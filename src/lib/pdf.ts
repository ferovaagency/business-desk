import { PDFParse } from "pdf-parse";

export async function extractPdfText(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  return extractPdfTextFromBuffer(Buffer.from(arrayBuffer));
}

export async function extractPdfTextFromBuffer(buffer: Buffer) {
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();
    return result.text.trim();
  } finally {
    await parser.destroy();
  }
}

