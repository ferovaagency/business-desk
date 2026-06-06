import { adminStorage } from "@/lib/firebase-admin";

export async function uploadTemporaryPdf(uid: string, file: File) {
  const bucket = adminStorage.bucket();
  const bytes = Buffer.from(await file.arrayBuffer());
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const path = `temporary/${uid}/${Date.now()}-${safeName}`;
  await bucket.file(path).save(bytes, {
    contentType: file.type || "application/pdf",
    resumable: false,
    metadata: {
      cacheControl: "private, max-age=0, no-store",
    },
  });
  return path;
}

export async function downloadTemporaryPdf(path: string) {
  const [buffer] = await adminStorage.bucket().file(path).download();
  return buffer;
}

