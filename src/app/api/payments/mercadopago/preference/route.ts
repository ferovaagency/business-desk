import { FieldValue } from "firebase-admin/firestore";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api-auth";
import { adminDb } from "@/lib/firebase-admin";
import { uploadTemporaryPdf } from "@/lib/storage";
import type { AnalysisType } from "@/lib/types";

export const runtime = "nodejs";

const ANALYSIS_PRICE_COP = 15000;

function getMercadoPagoClient() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error("MERCADOPAGO_ACCESS_TOKEN is required");
  }
  return new MercadoPagoConfig({ accessToken });
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const formData = await request.formData();
    const type = formData.get("type") as AnalysisType | null;
    const files = formData.getAll("files").filter((file): file is File => file instanceof File);

    if (type !== "contract" && type !== "proposals") {
      return NextResponse.json({ error: "Tipo de análisis inválido." }, { status: 400 });
    }

    if (type === "contract" && files.length !== 1) {
      return NextResponse.json({ error: "Debes subir exactamente un contrato PDF." }, { status: 400 });
    }

    if (type === "proposals" && (files.length < 2 || files.length > 4)) {
      return NextResponse.json({ error: "Debes subir entre 2 y 4 propuestas PDF." }, { status: 400 });
    }

    const storagePaths = await Promise.all(files.map((file) => uploadTemporaryPdf(user.uid, file)));
    const title = type === "contract" ? files[0].name : files.map((file) => file.name).join(", ");
    const analysisRef = await adminDb.collection("analyses").add({
      uid: user.uid,
      type,
      title,
      status: "awaiting_payment",
      amount: ANALYSIS_PRICE_COP,
      currency: "COP",
      storagePaths,
      fileNames: files.map((file) => file.name),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const preference = new Preference(getMercadoPagoClient());
    const response = await preference.create({
      body: {
        items: [
          {
            id: `analysis-${type}`,
            title: type === "contract" ? "Business Desk - Revisión de contrato" : "Business Desk - Comparador de propuestas",
            description: "Análisis individual con IA bajo modalidad pago por uso.",
            quantity: 1,
            currency_id: "COP",
            unit_price: ANALYSIS_PRICE_COP,
          },
        ],
        payer: {
          email: user.email ?? undefined,
          name: user.name ?? undefined,
        },
        metadata: {
          uid: user.uid,
          analysis_id: analysisRef.id,
          analysis_type: type,
        },
        external_reference: analysisRef.id,
        back_urls: {
          success: `${appUrl}/?analysisId=${analysisRef.id}&payment=success`,
          failure: `${appUrl}/?analysisId=${analysisRef.id}&payment=failure`,
          pending: `${appUrl}/?analysisId=${analysisRef.id}&payment=pending`,
        },
        notification_url: `${appUrl}/api/webhooks/mercadopago`,
        statement_descriptor: "BUSINESSDESK",
      },
    });

    const initPoint = response.init_point ?? response.sandbox_init_point;

    if (!initPoint) {
      throw new Error("MercadoPago did not return init point");
    }

    await analysisRef.update({
      mercadoPagoPreferenceId: response.id,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ initPoint, analysisId: analysisRef.id });
  } catch (error) {
    console.error("MercadoPago preference error", error);
    return NextResponse.json({ error: "No se pudo crear la preferencia de pago." }, { status: 500 });
  }
}

