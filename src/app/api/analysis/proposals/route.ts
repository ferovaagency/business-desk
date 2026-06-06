import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json({ error: "Este endpoint fue reemplazado por el flujo de pago por uso." }, { status: 410 });
}
