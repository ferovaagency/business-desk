import { cert, getApps, initializeApp, type AppOptions, type ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

function normalizePrivateKey(key: string | undefined): string | undefined {
  if (!key) return undefined;
  let parsed = key.trim();
  // Quitar comillas envolventes si las hay
  if ((parsed.startsWith('"') && parsed.endsWith('"')) || (parsed.startsWith("'") && parsed.endsWith("'"))) {
    parsed = parsed.slice(1, -1);
  }
  // Convertir secuencias escapadas a saltos de línea reales
  parsed = parsed.replace(/\\n/g, "\n").replace(/\|n\|/g, "\n");
  return parsed;
}

function resolveServiceAccount(): ServiceAccount | undefined {
  // Opción 1 (recomendada): JSON completo del service account en base64
  const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (base64) {
    try {
      const json = JSON.parse(Buffer.from(base64, "base64").toString("utf8"));
      return {
        projectId: json.project_id,
        clientEmail: json.client_email,
        privateKey: json.private_key,
      };
    } catch (error) {
      console.error("[firebase-admin] FIREBASE_SERVICE_ACCOUNT_BASE64 inválido:", error);
    }
  }

  // Opción 2: JSON completo del service account en texto plano
  const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (rawJson) {
    try {
      const json = JSON.parse(rawJson);
      return {
        projectId: json.project_id,
        clientEmail: json.client_email,
        privateKey: normalizePrivateKey(json.private_key),
      };
    } catch (error) {
      console.error("[firebase-admin] FIREBASE_SERVICE_ACCOUNT inválido:", error);
    }
  }

  // Opción 3: variables individuales
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = normalizePrivateKey(process.env.FIREBASE_ADMIN_PRIVATE_KEY);
  if (projectId && clientEmail && privateKey) {
    return { projectId, clientEmail, privateKey };
  }

  return undefined;
}

const serviceAccount = resolveServiceAccount();

const options: AppOptions = {
  projectId: serviceAccount?.projectId ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
};

if (serviceAccount) {
  try {
    options.credential = cert(serviceAccount);
  } catch (error) {
    console.error("[firebase-admin] No se pudieron cargar las credenciales del service account:", error);
  }
} else {
  console.warn("[firebase-admin] No hay credenciales de service account configuradas. Las operaciones de Admin (Storage/Firestore) fallarán.");
}

const adminApp = getApps().length ? getApps()[0] : initializeApp(options);

export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
export const adminStorage = getStorage(adminApp);
