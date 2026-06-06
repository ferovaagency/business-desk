import { PDFParse } from "pdf-parse";

export async function extractPdfText(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const parser = new PDFParse({ data: Buffer.from(arrayBuffer) });

  try {
    const result = await parser.getText();
    return result.text.trim();
  } finally {
    await parser.destroy();
  }
}
