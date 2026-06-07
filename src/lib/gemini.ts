import { GoogleGenAI } from "@google/genai";

type VertexCredentials = {
  projectId: string;
  credentials: { client_email: string; private_key: string };
};

function getVertexCredentials(): VertexCredentials | null {
  const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  const rawJson = base64
    ? Buffer.from(base64, "base64").toString("utf8")
    : process.env.FIREBASE_SERVICE_ACCOUNT;

  if (!rawJson) return null;

  try {
    const json = JSON.parse(rawJson);
    if (!json.project_id || !json.client_email || !json.private_key) return null;
    return {
      projectId: json.project_id,
      credentials: {
        client_email: json.client_email,
        private_key: String(json.private_key).replace(/\\n/g, "\n"),
      },
    };
  } catch (error) {
    console.error("[gemini] Service account inválido:", error);
    return null;
  }
}

function createClient(): GoogleGenAI {
  const useVertex = process.env.GEMINI_USE_VERTEX !== "false";
  const vertexCreds = getVertexCredentials();

  // Camino preferido: Vertex AI con el service account (usa el billing de Cloud)
  if (useVertex && vertexCreds) {
    return new GoogleGenAI({
      vertexai: true,
      project: vertexCreds.projectId,
      location: process.env.GEMINI_LOCATION ?? "us-central1",
      googleAuthOptions: { credentials: vertexCreds.credentials },
    });
  }

  // Alternativa: Gemini API (AI Studio) con API key
  if (process.env.GEMINI_API_KEY) {
    return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  throw new Error(
    "No hay credenciales de Gemini configuradas. Define FIREBASE_SERVICE_ACCOUNT_BASE64 (Vertex AI) o GEMINI_API_KEY (AI Studio).",
  );
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Gemini no respondió en ${ms / 1000}s (timeout).`)), ms),
    ),
  ]);
}

export async function generateBusinessAnalysis(systemInstruction: string, content: string) {
  const ai = createClient();
  const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
  const timeoutMs = Number(process.env.GEMINI_TIMEOUT_MS ?? 120000);

  const response = await withTimeout(
    ai.models.generateContent({
      model,
      contents: content,
      config: {
        systemInstruction,
      },
    }),
    timeoutMs,
  );

  return response.text ?? "No se pudo generar una respuesta.";
}
