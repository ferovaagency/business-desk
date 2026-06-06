"use client";

import { ArrowRight, BriefcaseBusiness, CheckCircle2, Clock3, FileSearch, Languages, Loader2, LogOut, Scale, ShieldCheck, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { AuthProvider, useAuth } from "@/components/auth-provider";
import { FileDropzone } from "@/components/file-dropzone";
import { MarkdownResult } from "@/components/markdown-result";
import { cn } from "@/lib/utils";
import type { AnalysisType } from "@/lib/types";

type View = "contract" | "proposals" | "history";
type Locale = "es" | "en";
type PaymentStage = "idle" | "paypal-opened" | "processing";

type ResultState = {
  id?: string;
  status: string;
  result?: string;
  error?: string;
};

const PAYPAL_URL = "https://www.paypal.com/ncp/payment/34PTNK5D9Z8KS";
const PRICE_LABEL = "$10 USD";

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
  },
} satisfies Record<Locale, Record<string, string>>;

function AppShell() {
  const { user, profile, loading, login, logout } = useAuth();
  const [locale, setLocale] = useState<Locale>("es");
  const [view, setView] = useState<View>("contract");
  const [contractFiles, setContractFiles] = useState<File[]>([]);
  const [proposalFiles, setProposalFiles] = useState<File[]>([]);
  const [resultState, setResultState] = useState<ResultState | null>(null);
  const [paymentStage, setPaymentStage] = useState<PaymentStage>("idle");
  const [pendingAnalysisType, setPendingAnalysisType] = useState<AnalysisType | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const t = copy[locale];

  const nav = useMemo(
    () => [
      { id: "contract" as const, label: t.contract, icon: Scale, description: t.contractDescription },
      { id: "proposals" as const, label: t.proposals, icon: BriefcaseBusiness, description: t.proposalsDescription },
      { id: "history" as const, label: t.history, icon: Clock3, description: t.historyDescription },
    ],
    [t],
  );

  const currentFiles = view === "contract" ? contractFiles : proposalFiles;
  const validFiles = view === "contract" ? contractFiles.length === 1 : proposalFiles.length >= 2 && proposalFiles.length <= 4;
  const activeTool = nav.find((item) => item.id === view);

  function openPaypal() {
    setBusy(true);
    setError("");
    setResultState(null);

    try {
      window.open(PAYPAL_URL, "_blank", "noopener,noreferrer");
      setPendingAnalysisType(view === "history" ? null : view);
      setPaymentStage("paypal-opened");
      setView("history");
    } catch {
      setError(t.paymentError);
    } finally {
      setBusy(false);
    }
  }

  async function confirmPaymentAndAnalyze(type: AnalysisType, files: File[]) {
    if (!user) return;
    setPaymentStage("processing");
    setError("");
    setResultState({ status: "processing" });

    try {
      const token = await user.getIdToken();
      const formData = new FormData();
      formData.append("type", type);
      files.forEach((file) => formData.append("files", file));

      const response = await fetch("/api/analysis/paypal", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        setResultState({ id: data.analysisId, status: data.status ?? "failed", error: data.error ?? t.analysisError });
        setError(data.error ?? t.analysisError);
        return;
      }

      setResultState({ id: data.analysisId, status: data.status, result: data.result });
      setPaymentStage("idle");
    } catch {
      setResultState({ status: "failed", error: t.analysisError });
      setError(t.analysisError);
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
    return (
      <main className="grid min-h-screen place-items-center px-6 py-10">
        <section className="w-full max-w-6xl overflow-hidden rounded-[2rem] border border-[#cac4d0]/12 bg-[#1c1b1f]/92 shadow-[0_8px_24px_rgba(0,0,0,0.38)] backdrop-blur-xl">
          <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
            <div className="p-8 md:p-12 lg:p-14">
              <div className="mb-10 inline-flex items-center gap-2 rounded-full bg-[#a8c7fa]/12 px-4 py-2 text-xs font-medium tracking-[0.12em] text-[#d7e3f8]">
                <Sparkles className="h-4 w-4" /> {t.badge}
              </div>
              <h1 className="max-w-3xl text-5xl font-medium tracking-[-0.04em] text-[#e6e1e5] md:text-7xl">{t.heroTitle}</h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#cac4d0]">{t.heroDescription}</p>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <button onClick={login} className="group inline-flex h-14 items-center gap-3 rounded-full bg-[#a8c7fa] px-7 text-sm font-bold text-[#062e6f] shadow-[0_2px_8px_rgba(168,199,250,0.24)] transition hover:bg-[#d7e3f8] focus:outline-none focus:ring-4 focus:ring-[#a8c7fa]/20">
                  {t.login} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </button>
                <LanguageSwitch locale={locale} onChange={setLocale} />
              </div>
            </div>
            <div className="border-t border-[#cac4d0]/12 bg-[#211f26] p-8 lg:border-l lg:border-t-0 md:p-12">
              <div className="space-y-4">
                {nav.slice(0, 2).map((item) => (
                  <div key={item.id} className="rounded-3xl bg-[#2b2930] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.32)]">
                    <div className="flex items-start gap-4">
                      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#a8c7fa]/12 text-[#a8c7fa]"><item.icon className="h-5 w-5" /></div>
                      <div>
                        <h2 className="font-medium text-[#e6e1e5]">{item.label}</h2>
                        <p className="mt-1 text-sm leading-6 text-[#cac4d0]">{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen text-[#e6e1e5]">
      <aside className="fixed inset-y-0 left-0 hidden w-80 border-r border-[#cac4d0]/10 bg-[#1c1b1f]/88 px-4 py-6 shadow-[0_4px_16px_rgba(0,0,0,0.36)] backdrop-blur-xl lg:block">
        <div className="mb-8 flex items-center gap-3 px-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#a8c7fa] text-[#062e6f]"><Sparkles className="h-5 w-5" /></div>
          <div>
            <p className="text-lg font-medium tracking-[-0.02em]">Business Desk</p>
            <p className="text-xs text-[#cac4d0]">{t.subtitle}</p>
          </div>
        </div>

        <div className="mb-6 px-3">
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

        <div className="absolute bottom-6 left-4 right-4 space-y-4">
          <div className="rounded-3xl bg-[#2b2930] p-4 text-sm shadow-[0_1px_3px_rgba(0,0,0,0.28)]">
            <div className="flex items-center gap-2 font-medium text-[#d7e3f8]"><ShieldCheck className="h-4 w-4 text-[#a8c7fa]" /> {t.payPerUse}</div>
            <p className="mt-2 text-xs leading-5 text-[#cac4d0]">{t.payPerUseText}</p>
          </div>
          <button onClick={logout} className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[#938f99]/25 text-sm font-medium text-[#cac4d0] transition hover:bg-[#2b2930] hover:text-[#e6e1e5]"><LogOut className="h-4 w-4" /> {t.logout}</button>
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

          {view !== "history" && (
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
                {view === "contract" ? (
                  <FileDropzone files={contractFiles} onFilesChange={setContractFiles} title={t.dropzoneTitle} description={t.dropzoneDescription} />
                ) : (
                  <FileDropzone files={proposalFiles} onFilesChange={setProposalFiles} multiple maxFiles={4} title={t.dropzoneTitle} description={t.dropzoneDescription} />
                )}
                <button disabled={busy || !validFiles} onClick={openPaypal} className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-full bg-[#a8c7fa] px-7 text-sm font-bold text-[#062e6f] shadow-[0_2px_8px_rgba(168,199,250,0.22)] transition hover:bg-[#d7e3f8] focus:outline-none focus:ring-4 focus:ring-[#a8c7fa]/20 disabled:cursor-not-allowed disabled:bg-[#938f99]/35 disabled:text-[#cac4d0]/60 md:w-auto">
                  {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileSearch className="h-5 w-5" />}
                  {busy ? t.preparing : t.payButton}
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
                  <button onClick={() => pendingAnalysisType && confirmPaymentAndAnalyze(pendingAnalysisType, pendingAnalysisType === "contract" ? contractFiles : proposalFiles)} className="mt-5 inline-flex h-12 items-center gap-3 rounded-full bg-[#a8c7fa] px-6 text-sm font-bold text-[#062e6f] transition hover:bg-[#d7e3f8]">
                    <ArrowRight className="h-4 w-4" /> {t.completedPaypal}
                  </button>
                </div>
              )}
              {paymentStage === "processing" && <div className="mt-8 flex items-center gap-3 rounded-3xl bg-[#2b2930] p-5 text-sm text-[#d7e3f8]"><Loader2 className="h-5 w-5 animate-spin text-[#a8c7fa]" /> {t.generating}</div>}
              {!resultState && paymentStage === "idle" && <p className="mt-8 rounded-3xl bg-[#2b2930] p-5 text-sm text-[#cac4d0]">{t.emptyResult}</p>}
              {resultState && resultState.status !== "completed" && resultState.status !== "processing" && <div className="mt-8 flex items-center gap-3 rounded-3xl bg-[#2b2930] p-5 text-sm text-[#d7e3f8]"><Loader2 className="h-5 w-5 animate-spin text-[#a8c7fa]" /> {t.status}: {resultState.status}. {t.autoUpdate}</div>}
              {resultState?.error && <div className="mt-8 rounded-3xl bg-[#f2b8b5]/12 p-5 text-sm text-[#f2b8b5]">{resultState.error}</div>}
              {resultState?.result && <div className="mt-8"><MarkdownResult content={resultState.result} /></div>}
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

export default function Home() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}













