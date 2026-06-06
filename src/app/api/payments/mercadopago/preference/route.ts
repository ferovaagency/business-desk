import { MercadoPagoConfig, Preference } from "mercadopago";
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api-auth";

export const runtime = "nodejs";

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN ?? "" });

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const preference = new Preference(client);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const response = await preference.create({
      body: {
        items: [
          {
            id: "credits-5",
            title: "Business Desk - Paquete de 5 créditos",
            quantity: 1,
            currency_id: "COP",
            unit_price: 25000,
          },
        ],
        metadata: {
          uid: user.uid,
          credits: 5,
        },
        back_urls: {
          success: appUrl,
          failure: appUrl,
          pending: appUrl,
        },
        notification_url: `${appUrl}/api/webhooks/mercadopago`,
      },
    });

    return NextResponse.json({ initPoint: response.init_point ?? response.sandbox_init_point });
  } catch (error) {
    return NextResponse.json({ error: "No se pudo crear la preferencia de pago." }, { status: 500 });
  }
}
