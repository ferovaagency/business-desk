import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";

export async function assertAndConsumeCredit(uid: string) {
  const userRef = adminDb.collection("users").doc(uid);
  await adminDb.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(userRef);
    const credits = Number(snapshot.data()?.credits ?? 0);
    if (!snapshot.exists || credits < 1) {
      throw new Error("INSUFFICIENT_CREDITS");
    }
    transaction.update(userRef, {
      credits: FieldValue.increment(-1),
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
}

export async function addCredits(uid: string, credits: number) {
  await adminDb.collection("users").doc(uid).set(
    {
      credits: FieldValue.increment(credits),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}
