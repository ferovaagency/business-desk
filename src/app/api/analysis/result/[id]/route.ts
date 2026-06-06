import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api-auth";
import { adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request);
    const { id } = await params;
    const snapshot = await adminDb.collection("analyses").doc(id).get();

    if (!snapshot.exists) {
      return NextResponse.json({ error: "Análisis no encontrado." }, { status: 404 });
    }

    const data = snapshot.data();

    if (data?.uid !== user.uid) {
      return NextResponse.json({ error: "No autorizado." }, { status: 403 });
    }

    return NextResponse.json({ id: snapshot.id, ...data });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }
    return NextResponse.json({ error: "No se pudo consultar el análisis." }, { status: 500 });
  }
}

