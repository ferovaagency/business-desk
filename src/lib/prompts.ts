import type { AnalysisContext, AnalysisType } from "@/lib/types";

const COUNTRY_LABELS = {
  CO: "Colombia",
};

const ROLE_LABELS = {
  issuer: "Soy el Contratante / Empleador / Arrendador",
  receiver: "Soy el Contratista / Empleado / Arrendatario",
};

const CONTRACT_TYPE_LABELS = {
  lease: "Arrendamiento",
  business_alliance: "Vinculación Empresarial / Alianza",
  credit_card_or_credit: "Adquisición de Tarjeta / Crédito",
  purchase_sale: "Compraventa",
  other: "Otro",
};

export function buildStructuredAnalysisPrompt(type: AnalysisType, context: AnalysisContext) {
  const country = COUNTRY_LABELS[context.country] ?? context.country;
  const userRole = context.userRole ? ROLE_LABELS[context.userRole] : "No aplica";
  const contractType = context.contractType ? CONTRACT_TYPE_LABELS[context.contractType] : "No aplica";
  const userContext = context.userContext || context.companyContext || "Sin contexto adicional.";

  return `Actúa como un analista legal, comercial y financiero senior para Business Desk.

Debes analizar el documento basándote estrictamente en la legislación y práctica comercial de: ${country}.
Tipo de análisis: ${type === "contract" ? "Auditor de Contratos" : "Comparador de Propuestas Comerciales"}.
Rol del usuario: ${userRole}.
Tipo de contrato: ${contractType}.
Contexto del usuario: ${userContext}.

Reglas obligatorias:
1. Prioriza la defensa del usuario según su rol en la sección "protection".
2. Si falta información, dilo de forma concreta en "missing"; no inventes hechos.
3. Sé accionable: incluye textos sugeridos, cláusulas a exigir o cambios concretos cuando aplique.
4. Responde únicamente con JSON válido, sin markdown, sin backticks, sin explicación adicional.
5. Cada array debe tener entre 3 y 7 puntos claros.

Formato exacto de respuesta:
{
  "summary": "Resumen ejecutivo breve de máximo 500 caracteres.",
  "correct": ["Punto fuerte 1", "Punto fuerte 2"],
  "riskPartyOne": ["Riesgo para contratante/empleador/arrendador o quien emite/paga"],
  "riskPartyTwo": ["Riesgo para contratista/empleado/arrendatario o quien ejecuta"],
  "protection": ["Recomendación exacta para proteger al usuario según su rol"],
  "missing": ["Elemento vital ausente que debería incluirse"],
  "metadata": {
    "country": "${country}",
    "userRole": "${userRole}",
    "contractType": "${contractType}",
    "analysisType": "${type}"
  }
}`;
}
