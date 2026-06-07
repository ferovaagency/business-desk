"use client";

import { ArrowRight, BriefcaseBusiness, CheckCircle2, Clock3, FileSearch, Languages, Loader2, LogOut, MessageCircle, Scale, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnalysisCards } from "@/components/analysis-cards";
import { useAuth } from "@/components/auth-provider";
import { FileDropzone } from "@/components/file-dropzone";
import { MarkdownResult } from "@/components/markdown-result";
import { cn } from "@/lib/utils";
import type { AnalysisContext, AnalysisType, ContractType, ContractUserRole, StructuredAnalysisResult, SupportedCountry } from "@/lib/types";

type View = "contract" | "proposals" | "history" | "support";
type Locale = "es" | "en";
type PaymentStage = "idle" | "paypal-opened" | "processing";

type ResultState = {
  id?: string;
  status: string;
  result?: string | StructuredAnalysisResult;
  error?: string;
};

const PAYPAL_URL = "https://www.paypal.com/ncp/payment/34PTNK5D9Z8KS";
const PRICE_LABEL = "$10 USD";
const ANALYSIS_TIMEOUT_MS = 180000;

function isStructuredResult(result: ResultState["result"]): result is StructuredAnalysisResult {
  return typeof result === "object" && result !== null && "correct" in result && "protection" in result;
}

const copy = {
  es: {
    loading: "Cargando Business Desk",
    badge: "MATERIAL AI WORKSPACE",
    heroTitle: "Business Desk",
    heroDescription: "Operaciones críticas de negocio con IA: revisión de contratos y comparación de propuestas bajo un modelo simple de pago por uso internacional.",
    login: "Ingresar con Google",
    workspace: "Workspace",
    subtitle: "Material AI Workspace",
    pricePerAnalysis: `${PRICE_LABEL} por análisis`,
    payPerUse: "Pago por uso",
    payPerUseText: `Sin saldos. Cada análisis cuesta ${PRICE_LABEL}.`,
    logout: "Salir",
    contract: "Revisión de Contratos",
    contractDescription: "Detecta riesgos y obligaciones clave",
    proposals: "Comparador de Propuestas",
    proposalsDescription: "Evalúa ofertas y recomienda una opción",
    history: "Resultado",
    historyDescription: "Consulta el análisis pagado",
    support: "Soporte",
    supportDescription: "Contacto y facturación",
    geminiAgent: "GEMINI AGENT",
    contractIntro: "Sube un contrato en PDF. Gemini identifica riesgos, fechas clave, obligaciones y recomendaciones accionables.",
    proposalsIntro: "Sube entre 2 y 4 propuestas. Gemini genera una matriz comparativa y una recomendación ejecutiva.",
    oneTimePayment: "Pago único",
    dropzoneTitle: "Sube documentos PDF",
    dropzoneDescription: "Arrastra archivos o haz clic para seleccionarlos. Tus PDFs se analizan en este prototipo después de abrir el pago de PayPal.",
    payButton: `Pagar y Analizar (${PRICE_LABEL})`,
    payButtonFree: "Ejecutar Análisis de Prueba (Gratis)",
    promoCodeLabel: "Código de prueba / Promo code",
    promoCodePlaceholder: "Ingresa código de prueba",
    preparing: "Abriendo PayPal...",
    processingPayment: "Procesando pago...",
    paymentTransition: "Una vez completado en PayPal, haz clic aquí para ver tu informe.",
    completedPaypal: "Ya completé el pago en PayPal. Ver mi informe",
    generating: "Generando informe con Gemini...",
    paymentOpened: "Se abrió PayPal en una nueva pestaña.",
    resultTitle: "Resultado del análisis",
    resultSubtitle: "Después de confirmar el pago de PayPal, el prototipo ejecuta Gemini y muestra el informe aquí.",
    emptyResult: "Aún no hay un análisis seleccionado. Completa un pago para consultar el resultado.",
    status: "Estado",
    autoUpdate: "Esta pantalla se actualiza automáticamente.",
    paymentError: "No se pudo iniciar el pago. Revisa la conexión e inténtalo de nuevo.",
    analysisError: "No se pudo generar el informe con Gemini.",
    supportTitle: "Soporte y Contacto",
    supportInfo: "PayPal envía automáticamente un recibo a tu correo. Si necesitas un Invoice corporativo formal a nombre de Ferova o tienes un problema técnico, escríbenos por aquí. Para solicitudes formales o invoices de Ferova, nuestro equipo te responderá desde gerencia@seoparaecommerce.co.",
    supportEmail: "gerencia@seoparaecommerce.co",
    supportCategoryLabel: "Tipo de Solicitud",
    supportCategoryInvoice: "Solicitar Factura / Invoice",
    supportCategoryTechnical: "Problema Técnico",
    supportCategoryGeneral: "Duda o Sugerencia",
    supportSubjectLabel: "Asunto",
    supportSubjectPlaceholder: "Breve descripción del tema",
    supportMessageLabel: "Mensaje",
    supportMessagePlaceholder: "Describe tu solicitud en detalle...",
    supportSubmit: "Enviar Mensaje",
    supportSuccess: "¡Mensaje enviado! Te responderemos en menos de 24 horas.",
  },
  en: {
    loading: "Loading Business Desk",
    badge: "MATERIAL AI WORKSPACE",
    heroTitle: "Business Desk",
    heroDescription: "Critical business operations with AI: contract review and proposal comparison under a simple international pay-per-use model.",
    login: "Sign in with Google",
    workspace: "Workspace",
    subtitle: "Material AI Workspace",
    pricePerAnalysis: `${PRICE_LABEL} per analysis`,
    payPerUse: "Pay per use",
    payPerUseText: `No balances. Each analysis costs ${PRICE_LABEL}.`,
    logout: "Sign out",
    contract: "Contract Review",
    contractDescription: "Find risks and key obligations",
    proposals: "Proposal Comparison",
    proposalsDescription: "Evaluate offers and recommend one",
    history: "Result",
    historyDescription: "View the paid analysis",
    support: "Support",
    supportDescription: "Contact and billing",
    geminiAgent: "GEMINI AGENT",
    contractIntro: "Upload a contract PDF. Gemini identifies risks, key dates, obligations and actionable recommendations.",
    proposalsIntro: "Upload 2 to 4 proposals. Gemini generates a comparison matrix and executive recommendation.",
    oneTimePayment: "One-time payment",
    dropzoneTitle: "Upload PDF documents",
    dropzoneDescription: "Drag files or click to select them. In this prototype, your PDFs are analyzed after opening the PayPal payment.",
    payButton: `Pay and Analyze (${PRICE_LABEL})`,
    payButtonFree: "Run Test Analysis (Free)",
    promoCodeLabel: "Test code / Promo code",
    promoCodePlaceholder: "Enter test code",
    preparing: "Opening PayPal...",
    processingPayment: "Processing payment...",
    paymentTransition: "Once completed in PayPal, click here to view your report.",
    completedPaypal: "I completed the PayPal payment. View my report",
    generating: "Generating report with Gemini...",
    paymentOpened: "PayPal opened in a new tab.",
    resultTitle: "Analysis result",
    resultSubtitle: "After you confirm the PayPal payment, the prototype runs Gemini and shows the report here.",
    emptyResult: "No analysis selected yet. Complete a payment to view the result.",
    status: "Status",
    autoUpdate: "This screen updates automatically.",
    paymentError: "Could not start the payment. Check the connection and try again.",
    analysisError: "Could not generate the Gemini report.",
    supportTitle: "Support & Contact",
    supportInfo: "PayPal automatically sends a receipt to your email. If you need a formal corporate Invoice in Ferova's name or have a technical issue, write to us here. For formal requests or Ferova invoices, our team will reply from gerencia@seoparaecommerce.co.",
    supportEmail: "gerencia@seoparaecommerce.co",
    supportCategoryLabel: "Request Type",
    supportCategoryInvoice: "Request Invoice",
    supportCategoryTechnical: "Technical Issue",
    supportCategoryGeneral: "Question or Suggestion",
    supportSubjectLabel: "Subject",
    supportSubjectPlaceholder: "Brief description of the topic",
    supportMessageLabel: "Message",
    supportMessagePlaceholder: "Describe your request in detail...",
    supportSubmit: "Submit Ticket",
    supportSuccess: "Message sent! We will reply within 24 hours.",
  },
} satisfies Record<Locale, Record<string, string>>;

export function Dashboard() {
  const { user, profile, loading, login, logout } = useAuth();
  const searchParams = useSearchParams();
  const [locale, setLocale] = useState<Locale>("es");
  const [view, setView] = useState<View>("contract");
  const [contractFiles, setContractFiles] = useState<File[]>([]);
  const [proposalFiles, setProposalFiles] = useState<File[]>([]);
  const [resultState, setResultState] = useState<ResultState | null>(null);
  const [paymentStage, setPaymentStage] = useState<PaymentStage>("idle");
  const [pendingAnalysisType, setPendingAnalysisType] = useState<AnalysisType | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [contextText, setContextText] = useState("");
  const [supportCategory, setSupportCategory] = useState<"invoice" | "technical" | "general">("invoice");
  const [supportSubject, setSupportSubject] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [supportSent, setSupportSent] = useState(false);
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, string>>({});
  const [isRefining, setIsRefining] = useState(false);
  const t = copy[locale];

  // Redirigir a / si no está autenticado
  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/";
    }
  }, [loading, user]);

  // Seleccionar herramienta automáticamente desde URL
  useEffect(() => {
    const toolParam = searchParams.get("tool");
    if (toolParam === "contract" || toolParam === "proposals") {
      setView(toolParam);
    }
  }, [searchParams]);

  const nav = useMemo(
    () => [
      { id: "contract" as const, label: t.contract, icon: Scale, description: t.contractDescription },
      { id: "proposals" as const, label: t.proposals, icon: BriefcaseBusiness, description: t.proposalsDescription },
      { id: "history" as const, label: t.history, icon: Clock3, description: t.historyDescription },
      { id: "support" as const, label: t.support, icon: MessageCircle, description: t.supportDescription },
    ],
    [t],
  );

  const currentFiles = view === "contract" ? contractFiles : proposalFiles;
  const validFiles = view === "contract" ? contractFiles.length === 1 : proposalFiles.length >= 2 && proposalFiles.length <= 4;
  const activeTool = nav.find((item) => item.id === view);

  function buildContext(type: AnalysisType): AnalysisContext {
    return { country: "CO", userContext: contextText.trim() };
  }

  function openPaypal() {
    setBusy(true);
    setError("");
    setResultState(null);

    if (promoCode === "MAFE_DEV_2026") {
      const type = view === "history" ? (contractFiles.length ? "contract" : "proposals") : view === "support" ? "contract" : view;
      const files = view === "contract" ? contractFiles : view === "proposals" ? proposalFiles : contractFiles;
      setView("history");
      confirmPaymentAndAnalyze(type, files, buildContext(type));
      return;
    }

    try {
      window.open(PAYPAL_URL, "_blank", "noopener,noreferrer");
      const pendingType = view === "history" || view === "support" ? null : view;
      setPendingAnalysisType(pendingType);
      setPaymentStage("paypal-opened");
      setView("history");
      setBusy(false);
    } catch {
      setError(t.paymentError);
      setBusy(false);
    }
  }

  async function confirmPaymentAndAnalyze(type: AnalysisType, files: File[], context: AnalysisContext) {
    if (!user) {
      setBusy(false);
      return;
    }
    setPaymentStage("processing");
    setError("");
    setResultState({ status: "processing" });

    try {
      const token = await user.getIdToken();
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), ANALYSIS_TIMEOUT_MS);
      const formData = new FormData();
      formData.append("type", type);
      formData.append("country", context.country);
      if (context.userRole) formData.append("userRole", context.userRole);
      if (context.contractType) formData.append("contractType", context.contractType);
      if (context.userContext) formData.append("userContext", context.userContext);
      if (context.companyContext) formData.append("companyContext", context.companyContext);
      files.forEach((file) => formData.append("files", file));
      formData.append("promoCode", promoCode);

      const response = await fetch("/api/analysis/paypal", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
        signal: controller.signal,
      }).finally(() => window.clearTimeout(timeoutId));
      const data = await response.json().catch(() => ({ error: t.analysisError }));

      if (!response.ok) {
        setResultState({ id: data.analysisId, status: data.status ?? "failed", error: data.error ?? t.analysisError });
        setError(data.error ?? t.analysisError);
        setPaymentStage("idle");
        return;
      }

      setResultState({ id: data.analysisId, status: data.status, result: data.result });
      setPaymentStage("idle");
    } catch (error) {
      const message = error instanceof DOMException && error.name === "AbortError"
        ? "El análisis tardó demasiado y fue cancelado. Intenta con un PDF más corto o revisa los logs."
        : error instanceof Error
          ? error.message
          : t.analysisError;
      setResultState({ status: "failed", error: message });
      setError(message);
      setPaymentStage("idle");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center px-6">
        <div className="inline-flex items-center gap-3 rounded-full bg-[#2b2930] px-6 py-3 text-sm font-medium text-[#e6e1e5] shadow-[0_2px_8px_rgba(0,0,0,0.32)]">
          <Loader2 className="h-4 w-4 animate-spin text-[#a8c7fa]" /> {t.loading}
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen text-[#e6e1e5]">
      <aside className="fixed inset-y-0 left-0 hidden h-screen w-80 border-r border-[#cac4d0]/10 bg-[#1c1b1f]/88 backdrop-blur-xl lg:block">
        <div className="flex h-full flex-col overflow-y-auto px-4 py-6 select-none">
          <div className="mb-8 flex items-center gap-3 px-3 shrink-0">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#a8c7fa] text-[#062e6f]"><Sparkles className="h-5 w-5" /></div>
            <div>
              <p className="text-lg font-medium tracking-[-0.02em]">Business Desk</p>
              <p className="text-xs text-[#cac4d0]">{t.subtitle}</p>
            </div>
          </div>

          <div className="mb-6 px-3 shrink-0">
            <LanguageSwitch locale={locale} onChange={setLocale} />
          </div>

          <nav className="space-y-1">
            {nav.map((item) => (
              <button key={item.id} onClick={() => setView(item.id)} className={cn("group flex w-full items-center gap-3 rounded-full px-4 py-3 text-left transition", view === item.id ? "bg-[#a8c7fa]/20 text-[#d7e3f8]" : "text-[#cac4d0] hover:bg-[#2b2930] hover:text-[#e6e1e5]") }>
                <item.icon className={cn("h-5 w-5", view === item.id ? "text-[#a8c7fa]" : "text-[#cac4d0]")} />
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-[#cac4d0]/75">{item.description}</p>
                </div>
              </button>
            ))}
          </nav>

          <div className="mt-auto space-y-4 px-3 shrink-0">
            <div className="rounded-3xl bg-[#2b2930] p-4 text-sm shadow-[0_1px_3px_rgba(0,0,0,0.28)]">
              <div className="flex items-center gap-2 font-medium text-[#d7e3f8]"><ShieldCheck className="h-4 w-4 text-[#a8c7fa]" /> {t.payPerUse}</div>
              <p className="mt-2 text-xs leading-5 text-[#cac4d0]">{t.payPerUseText}</p>
            </div>
            <button onClick={logout} className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[#938f99]/25 text-sm font-medium text-[#cac4d0] transition hover:bg-[#2b2930] hover:text-[#e6e1e5]"><LogOut className="h-4 w-4" /> {t.logout}</button>
          </div>
        </div>
      </aside>

      <section className="lg:pl-80">
        <header className="sticky top-0 z-10 border-b border-[#cac4d0]/10 bg-[#121212]/78 px-6 py-5 backdrop-blur-xl lg:px-10">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#cac4d0]">{t.workspace}</p>
              <h2 className="mt-1 text-2xl font-medium tracking-[-0.02em] text-[#e6e1e5]">{profile?.displayName ?? user.displayName ?? "Usuario"}</h2>
            </div>
            <div className="hidden rounded-full bg-[#2b2930] px-5 py-3 text-sm font-medium text-[#d7e3f8] md:block">{t.pricePerAnalysis}</div>
          </div>
        </header>

        <div className="mx-auto max-w-6xl px-6 py-8 lg:px-10 lg:py-10">
          {error && <div className="mb-6 rounded-3xl bg-[#f2b8b5]/12 p-4 text-sm font-medium text-[#f2b8b5]">{error}</div>}

          {(view === "contract" || view === "proposals") && (
            <section className="overflow-hidden rounded-[2rem] bg-[#1c1b1f] shadow-[0_6px_18px_rgba(0,0,0,0.36)] ring-1 ring-[#cac4d0]/10">
              <div className="grid gap-6 border-b border-[#cac4d0]/10 p-7 md:grid-cols-[1fr_auto] md:p-9">
                <div>
                  <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#a8c7fa]/12 px-4 py-2 text-xs font-medium tracking-[0.12em] text-[#d7e3f8]">
                    {activeTool?.icon && <activeTool.icon className="h-4 w-4" />} {t.geminiAgent}
                  </div>
                  <h1 className="text-4xl font-medium tracking-[-0.035em] text-[#e6e1e5] md:text-5xl">{view === "contract" ? t.contract : t.proposals}</h1>
                  <p className="mt-4 max-w-3xl text-base leading-7 text-[#cac4d0]">{view === "contract" ? t.contractIntro : t.proposalsIntro}</p>
                </div>
                <div className="rounded-3xl bg-[#2b2930] p-5 md:min-w-48 md:text-right">
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#cac4d0]">{t.oneTimePayment}</p>
                  <p className="mt-2 text-2xl font-medium text-[#e6e1e5]">{PRICE_LABEL}</p>
                </div>
              </div>

              <div className="space-y-6 p-7 md:p-9">
                <div className="rounded-[1.75rem] bg-[#2b2930] p-5 ring-1 ring-[#cac4d0]/10">
                  <label className="space-y-2 text-sm font-medium text-[#e6e1e5]">
                    Contexto del Documento
                    <textarea value={contextText} onChange={(e) => setContextText(e.target.value)} rows={5} className="w-full resize-none rounded-2xl border border-[#938f99]/25 bg-[#1c1b1f] px-4 py-3 text-sm text-[#e6e1e5] placeholder:text-[#cac4d0]/50 focus:border-[#a8c7fa] focus:outline-none focus:ring-2 focus:ring-[#a8c7fa]/20" placeholder="Ej: Soy el contratista en Colombia, es un contrato de arrendamiento y quiero revisar penalidades ocultas..." />
                  </label>
                </div>
                {view === "contract" ? (
                  <FileDropzone files={contractFiles} onFilesChange={setContractFiles} title={t.dropzoneTitle} description={t.dropzoneDescription} />
                ) : (
                  <FileDropzone files={proposalFiles} onFilesChange={setProposalFiles} multiple maxFiles={4} title={t.dropzoneTitle} description={t.dropzoneDescription} />
                )}
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder={t.promoCodePlaceholder}
                    className="h-11 flex-1 rounded-full border border-[#938f99]/25 bg-[#2b2930] px-4 text-sm text-[#e6e1e5] placeholder:text-[#cac4d0]/50 focus:border-[#a8c7fa] focus:outline-none focus:ring-2 focus:ring-[#a8c7fa]/20"
                  />
                  <span className="text-xs text-[#cac4d0]/75">{t.promoCodeLabel}</span>
                </div>
                <button disabled={busy || !validFiles} onClick={openPaypal} className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-full bg-[#a8c7fa] px-7 text-sm font-bold text-[#062e6f] shadow-[0_2px_8px_rgba(168,199,250,0.22)] transition hover:bg-[#d7e3f8] focus:outline-none focus:ring-4 focus:ring-[#a8c7fa]/20 disabled:cursor-not-allowed disabled:bg-[#938f99]/35 disabled:text-[#cac4d0]/60 md:w-auto">
                  {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileSearch className="h-5 w-5" />}
                  {busy ? t.preparing : promoCode === "MAFE_DEV_2026" ? t.payButtonFree : t.payButton}
                </button>
              </div>
            </section>
          )}

          {view === "history" && (
            <section className="rounded-[2rem] bg-[#1c1b1f] p-8 shadow-[0_6px_18px_rgba(0,0,0,0.36)] ring-1 ring-[#cac4d0]/10">
              <div className="flex items-center gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#a8c7fa]/12 text-[#a8c7fa]"><CheckCircle2 className="h-6 w-6" /></div>
                <div>
                  <h3 className="text-3xl font-medium tracking-[-0.03em] text-[#e6e1e5]">{t.resultTitle}</h3>
                  <p className="mt-1 text-sm text-[#cac4d0]">{t.resultSubtitle}</p>
                </div>
              </div>
              {paymentStage === "paypal-opened" && (
                <div className="mt-8 rounded-3xl bg-[#2b2930] p-6 text-[#d7e3f8]">
                  <p className="text-lg font-medium">{t.processingPayment}</p>
                  <p className="mt-2 text-sm text-[#cac4d0]">{t.paymentTransition}</p>
                  <p className="mt-3 text-xs text-[#cac4d0]/80">{t.paymentOpened}</p>
                  <button onClick={() => pendingAnalysisType && confirmPaymentAndAnalyze(pendingAnalysisType, pendingAnalysisType === "contract" ? contractFiles : proposalFiles, buildContext(pendingAnalysisType))} className="mt-5 inline-flex h-12 items-center gap-3 rounded-full bg-[#a8c7fa] px-6 text-sm font-bold text-[#062e6f] transition hover:bg-[#d7e3f8]">
                    <ArrowRight className="h-4 w-4" /> {t.completedPaypal}
                  </button>
                </div>
              )}
              {paymentStage === "processing" && <div className="mt-8 flex items-center gap-3 rounded-3xl bg-[#2b2930] p-5 text-sm text-[#d7e3f8]"><Loader2 className="h-5 w-5 animate-spin text-[#a8c7fa]" /> {t.generating}</div>}
              {!resultState && paymentStage === "idle" && <p className="mt-8 rounded-3xl bg-[#2b2930] p-5 text-sm text-[#cac4d0]">{t.emptyResult}</p>}
              {resultState?.status === "processing" && paymentStage !== "processing" && <div className="mt-8 flex items-center gap-3 rounded-3xl bg-[#2b2930] p-5 text-sm text-[#d7e3f8]"><Loader2 className="h-5 w-5 animate-spin text-[#a8c7fa]" /> {t.status}: {resultState.status}. {t.autoUpdate}</div>}
              {resultState && resultState.status !== "completed" && resultState.status !== "processing" && !resultState.error && <div className="mt-8 rounded-3xl bg-[#2b2930] p-5 text-sm text-[#d7e3f8]">{t.status}: {resultState.status}</div>}
              {resultState?.error && <div className="mt-8 rounded-3xl bg-[#f2b8b5]/12 p-5 text-sm text-[#f2b8b5]">{resultState.error}</div>}
              {resultState?.result && <div className="mt-8">{isStructuredResult(resultState.result) ? <AnalysisCards result={resultState.result} questionAnswers={questionAnswers} onAnswerChange={(question, answer) => setQuestionAnswers(prev => ({ ...prev, [question]: answer }))} onRefine={async () => {
                setIsRefining(true);
                try {
                  const token = await user.getIdToken();
                  const answersText = Object.entries(questionAnswers).map(([q, a]) => `Pregunta: ${q}\nRespuesta: ${a}`).join("\n\n");
                  const refinedContext = `${contextText}\n\n---\n\nRespuestas a preguntas de refinamiento:\n${answersText}`;
                  const type = resultState.id ? (contractFiles.length ? "contract" : "proposals") : "contract";
                  const files = contractFiles.length ? contractFiles : proposalFiles;
                  await confirmPaymentAndAnalyze(type, files, { country: "CO", userContext: refinedContext });
                } catch {
                  console.error("Failed to refine analysis");
                } finally {
                  setIsRefining(false);
                }
              }} isRefining={isRefining} /> : <MarkdownResult content={resultState.result} />}</div>}
            </section>
          )}

          {view === "support" && (
            <section className="rounded-[2rem] bg-[#1c1b1f] p-8 shadow-[0_6px_18px_rgba(0,0,0,0.36)] ring-1 ring-[#cac4d0]/10">
              <div className="flex items-center gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#a8c7fa]/12 text-[#a8c7fa]"><MessageCircle className="h-6 w-6" /></div>
                <div>
                  <h3 className="text-3xl font-medium tracking-[-0.03em] text-[#e6e1e5]">{t.supportTitle}</h3>
                  <p className="mt-1 text-sm text-[#cac4d0]">{t.supportDescription}</p>
                </div>
              </div>
              <div className="mt-8 grid gap-8 md:grid-cols-2">
                <div className="rounded-[1.75rem] bg-[#2b2930] p-6 ring-1 ring-[#cac4d0]/10">
                  <p className="text-sm leading-7 text-[#cac4d0]">{t.supportInfo}</p>
                  <p className="mt-4 text-sm font-medium text-[#d7e3f8]">{t.supportEmail}</p>
                </div>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (!user) return;
                  try {
                    const { getFirestore, collection, addDoc, serverTimestamp } = await import("firebase/firestore");
                    const db = getFirestore();
                    await addDoc(collection(db, "support_tickets"), {
                      userId: user.uid,
                      userEmail: user.email,
                      category: supportCategory,
                      subject: supportSubject,
                      message: supportMessage,
                      notificationEmail: "gerencia@seoparaecommerce.co",
                      sourcePlatform: "Business Desk",
                      createdAt: serverTimestamp(),
                    });
                    setSupportSent(true);
                    setSupportCategory("invoice");
                    setSupportSubject("");
                    setSupportMessage("");
                    setTimeout(() => setSupportSent(false), 5000);
                  } catch {
                    console.error("Failed to submit support ticket");
                  }
                }} className="space-y-4">
                  <label className="space-y-2 text-sm font-medium text-[#e6e1e5]">
                    {t.supportCategoryLabel}
                    <select value={supportCategory} onChange={(e) => setSupportCategory(e.target.value as "invoice" | "technical" | "general")} className="h-12 w-full rounded-2xl border border-[#938f99]/25 bg-[#1c1b1f] px-4 text-sm text-[#e6e1e5] focus:border-[#a8c7fa] focus:outline-none focus:ring-2 focus:ring-[#a8c7fa]/20">
                      <option value="invoice">{t.supportCategoryInvoice}</option>
                      <option value="technical">{t.supportCategoryTechnical}</option>
                      <option value="general">{t.supportCategoryGeneral}</option>
                    </select>
                  </label>
                  <label className="space-y-2 text-sm font-medium text-[#e6e1e5]">
                    {t.supportSubjectLabel}
                    <input type="text" value={supportSubject} onChange={(e) => setSupportSubject(e.target.value)} placeholder={t.supportSubjectPlaceholder} className="h-12 w-full rounded-2xl border border-[#938f99]/25 bg-[#1c1b1f] px-4 text-sm text-[#e6e1e5] placeholder:text-[#cac4d0]/50 focus:border-[#a8c7fa] focus:outline-none focus:ring-2 focus:ring-[#a8c7fa]/20" />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-[#e6e1e5]">
                    {t.supportMessageLabel}
                    <textarea value={supportMessage} onChange={(e) => setSupportMessage(e.target.value)} rows={4} placeholder={t.supportMessagePlaceholder} className="w-full resize-none rounded-2xl border border-[#938f99]/25 bg-[#1c1b1f] px-4 py-3 text-sm text-[#e6e1e5] placeholder:text-[#cac4d0]/50 focus:border-[#a8c7fa] focus:outline-none focus:ring-2 focus:ring-[#a8c7fa]/20" />
                  </label>
                  <button type="submit" className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-full bg-[#a8c7fa] px-7 text-sm font-bold text-[#062e6f] shadow-[0_2px_8px_rgba(168,199,250,0.22)] transition hover:bg-[#d7e3f8] focus:outline-none focus:ring-4 focus:ring-[#a8c7fa]/20">
                    <MessageCircle className="h-5 w-5" /> {t.supportSubmit}
                  </button>
                </form>
              </div>
              {supportSent && <div className="mt-6 rounded-3xl bg-[#6dd58c]/12 p-5 text-sm text-[#b8f7c7]">{t.supportSuccess}</div>}
            </section>
          )}
        </div>
      </section>
    </main>
  );
}

function LanguageSwitch({ locale, onChange }: { locale: Locale; onChange: (locale: Locale) => void }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-[#2b2930] p-1 text-sm font-medium text-[#cac4d0]">
      <Languages className="ml-3 h-4 w-4 text-[#a8c7fa]" />
      {(["es", "en"] as const).map((item) => (
        <button key={item} onClick={() => onChange(item)} className={cn("rounded-full px-3 py-1.5 transition", locale === item ? "bg-[#a8c7fa] text-[#062e6f]" : "hover:bg-[#36343b] hover:text-[#e6e1e5]")} type="button">
          {item.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
