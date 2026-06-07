/**
 * Matriz Experto-País
 * Mapeo dinámico de prompts por país y disciplina.
 */

import type { AnalysisContext, AnalysisType } from "@/lib/types";

type ExpertiseKey = "legal" | "financial" | "tax" | "hr";

const EXPERTISE_MAP: Record<string, Record<ExpertiseKey, () => { PROMPT: string }>> = {
  colombia: {
    legal: () => require("./colombia/legal"),
    financial: () => require("./colombia/financial"),
    tax: () => require("./colombia/tax"),
    hr: () => require("./colombia/hr"),
  },
  usa: {
    legal: () => require("./usa/legal"),
    financial: () => require("./usa/financial"),
    tax: () => require("./usa/tax"),
    hr: () => require("./usa/hr"),
  },
  brasil: {
    legal: () => require("./brasil/legal"),
    financial: () => require("./brasil/financial"),
    tax: () => require("./brasil/tax"),
    hr: () => require("./brasil/hr"),
  },
};

/**
 * Obtiene el prompt específico según país y tipo de herramienta.
 * Si no existe la combinación, lanza un error claro.
 */
export function getExpertisePrompt(country: string, toolType: ExpertiseKey): string {
  const countryKey = country.toLowerCase();
  const countryMap = EXPERTISE_MAP[countryKey];

  if (!countryMap) {
    throw new Error(`País no soportado: ${country}. Países disponibles: ${Object.keys(EXPERTISE_MAP).join(", ")}`);
  }

  const toolLoader = countryMap[toolType];
  if (!toolLoader) {
    throw new Error(`Herramienta no disponible para ${country}: ${toolType}. Herramientas disponibles: ${Object.keys(countryMap).join(", ")}`);
  }

  const module = toolLoader();
  return module.PROMPT;
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

  return basePrompt
    .replace(/\{\{userRole\}\}/g, userRole)
    .replace(/\{\{contractType\}\}/g, contractType)
    .replace(/\{\{analysisType\}\}/g, analysisType);
}
