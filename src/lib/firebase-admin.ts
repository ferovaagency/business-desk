import { cert, getApps, initializeApp, type AppOptions } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

function parsePrivateKey(key: string | undefined): string | undefined {
  if (!key) return undefined;
  
  // Reemplazar \n con saltos de línea reales
  let parsed = key.replace(/\\n/g, "\n");
  
  // Si aún no tiene saltos de línea, intentar otros formatos
  if (!parsed.includes("\n")) {
    // Intentar formato con |n|
    parsed = parsed.replace(/\|n\|/g, "\n");
  }
  
  return parsed;
}

const privateKey = parsePrivateKey(process.env.FIREBASE_ADMIN_PRIVATE_KEY);
const hasServiceAccount = Boolean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && process.env.FIREBASE_ADMIN_CLIENT_EMAIL && privateKey);

const options: AppOptions = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
};

if (hasServiceAccount) {
  try {
    options.credential = cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey,
    });
  } catch (error) {
    console.error("Error parsing Firebase admin credentials:", error);
    // Continuar sin credenciales de servicio si falla
  }
}

const adminApp = getApps().length ? getApps()[0] : initializeApp(options);

export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
export const adminStorage = getStorage(adminApp);
