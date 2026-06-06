import { MercadoPagoConfig, Payment } from "mercadopago";
import { NextRequest, NextResponse } from "next/server";
import { addCredits } from "@/lib/credits";
import { adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN ?? "" });

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const paymentId = payload?.data?.id ?? payload?.id;

  if (!paymentId) {
    return NextResponse.json({ received: true });
  }

  const paymentClient = new Payment(client);
  const payment = await paymentClient.get({ id: paymentId });

  if (payment.status !== "approved") {
    return NextResponse.json({ received: true });
  }

  const uid = payment.metadata?.uid as string | undefined;
  const credits = Number(payment.metadata?.credits ?? 5);

  if (!uid) {
    return NextResponse.json({ received: true });
  }

  const eventRef = adminDb.collection("paymentEvents").doc(String(paymentId));
  const eventSnapshot = await eventRef.get();

  if (!eventSnapshot.exists) {
    await addCredits(uid, credits);
    await eventRef.set({
      uid,
      credits,
      status: payment.status,
      provider: "mercadopago",
      processedAt: new Date().toISOString(),
    });
  }

  return NextResponse.json({ received: true });
}
