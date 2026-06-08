/**
 * Matriz Experto-País
 * Mapeo de prompts por país y disciplina - IMPORTS ESTÁTICOS para compatibilidad con Firebase
 */

import type { AnalysisContext, AnalysisType } from "@/lib/types";

// Imports estáticos de todos los expertise
import * as colombiaLegal from "./colombia/legal";
import * as colombiaFinancial from "./colombia/financial";
import * as colombiaTax from "./colombia/tax";
import * as colombiaHr from "./colombia/hr";
import * as colombiaProposals from "./colombia/proposals";

import * as usaLegal from "./usa/legal";
import * as usaFinancial from "./usa/financial";
import * as usaTax from "./usa/tax";
import * as usaHr from "./usa/hr";

import * as brasilLegal from "./brasil/legal";
import * as brasilFinancial from "./brasil/financial";
import * as brasilTax from "./brasil/tax";
import * as brasilHr from "./brasil/hr";

type ExpertiseKey = "legal" | "financial" | "tax" | "hr" | "proposals";

const EXPERTISE_MAP: Record<string, Record<ExpertiseKey, { PROMPT: string }>> = {
  colombia: {
    legal: colombiaLegal,
    financial: colombiaFinancial,
    tax: colombiaTax,
    hr: colombiaHr,
    proposals: colombiaProposals,
  },
  usa: {
    legal: usaLegal,
    financial: usaFinancial,
    tax: usaTax,
    hr: usaHr,
    proposals: colombiaProposals, // Usamos el de Colombia para USA por ahora
  },
  brasil: {
    legal: brasilLegal,
    financial: brasilFinancial,
    tax: brasilTax,
    hr: brasilHr,
    proposals: colombiaProposals, // Usamos el de Colombia para Brasil por ahora
  },
};

/**
 * Obtiene el prompt específico según país y tipo de herramienta.
 * Usa imports estáticos para garantizar compatibilidad con Firebase Functions.
 */
export function getExpertisePrompt(country: string, toolType: ExpertiseKey): string {
  const countryKey = country.toLowerCase();
  const countryMap = EXPERTISE_MAP[countryKey];

  if (!countryMap) {
    throw new Error(`País no soportado: ${country}. Países disponibles: ${Object.keys(EXPERTISE_MAP).join(", ")}`);
  }

  const toolModule = countryMap[toolType];
  if (!toolModule || !toolModule.PROMPT) {
    throw new Error(`Herramienta no disponible para ${country}: ${toolType}. Herramientas disponibles: ${Object.keys(countryMap).join(", ")}`);
  }

  console.log(`[Expertise] Loading prompt: country=${countryKey}, toolType=${toolType}, promptLength=${toolModule.PROMPT.length}`);
  return toolModule.PROMPT;
}

/**
 * Construye el prompt final reemplazando las variables de plantilla.
 */
export function buildExpertisePrompt(
  country: string,
  toolType: ExpertiseKey,
  context: AnalysisContext,
  analysisType: AnalysisType,
): string {
  const basePrompt = getExpertisePrompt(country, toolType);

  const userRole = context.userRole ?? "No aplica";
  const contractType = context.contractType ?? "No aplica";

  // Solo añadir instrucción de flujo libre para contratos (toolType legal), no para propuestas
  const freeTextInstruction = toolType === "legal" ? `

Instrucción crítica de flujo libre:
Si el contexto del usuario es vago, incompleto o no incluye país, rol, fechas, tipo de contrato o condiciones específicas, NO rechaces la solicitud y NO devuelvas errores de validación.
Genera un análisis preliminar con lo que puedas deducir del PDF y del texto libre del usuario.
Utiliza obligatoriamente el campo "keyQuestions" de la respuesta JSON para listar exactamente 3 preguntas específicas que necesitas que el usuario responda para perfeccionar el blindaje.
` : "";

  return `${basePrompt}${freeTextInstruction}`
    .replace(/\{\{userRole\}\}/g, userRole)
    .replace(/\{\{contractType\}\}/g, contractType)
    .replace(/\{\{analysisType\}\}/g, analysisType);
}
