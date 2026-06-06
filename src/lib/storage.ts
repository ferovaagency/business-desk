import { adminStorage } from "@/lib/firebase-admin";

export async function uploadTemporaryPdf(uid: string, file: File) {
  const bucket = adminStorage.bucket();
  const bytes = Buffer.from(await file.arrayBuffer());
  const path = `temporary/${uid}/${Date.now()}-${file.name}`;
  await bucket.file(path).save(bytes, {
    contentType: file.type || "application/pdf",
    resumable: false,
    metadata: {
      cacheControl: "private, max-age=0, no-store",
    },
  });
  return path;
}
