# Business Desk

Business Desk es una suite SaaS de operaciones bajo demanda para freelancers y startups. Usa Next.js, Firebase, Gemini y MercadoPago Colombia en COP.

## Configuración local

1. Ejecuta `npm install`.
2. Copia `.env.local.example` a `.env.local`.
3. Reemplaza las credenciales de Firebase, Gemini y MercadoPago sandbox.
4. Ejecuta `npm run dev`.

## Variables requeridas

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `GEMINI_API_KEY`
- `MERCADOPAGO_ACCESS_TOKEN`
- `NEXT_PUBLIC_APP_URL`

## Flujo de créditos

- Cada usuario inicia con `0` créditos.
- El frontend bloquea análisis sin créditos.
- El backend vuelve a validar créditos en transacción antes de llamar a Gemini.
- MercadoPago suma créditos por webhook cuando el pago queda `approved`.
