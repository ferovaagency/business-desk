"use client";

import { ArrowRight, BriefcaseBusiness, CheckCircle2, Clock3, FileSearch, Loader2, LogOut, Scale, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AuthProvider, useAuth } from "@/components/auth-provider";
import { FileDropzone } from "@/components/file-dropzone";
import { MarkdownResult } from "@/components/markdown-result";
import { cn, formatCop } from "@/lib/utils";
import type { AnalysisType } from "@/lib/types";

type View = "contract" | "proposals" | "history";

type ResultState = {
  id: string;
  status: string;
  result?: string;
  error?: string;
};

const ANALYSIS_PRICE = 15000;

function AppShell() {
  const { user, profile, loading, login, logout } = useAuth();
  const [view, setView] = useState<View>("contract");
  const [contractFiles, setContractFiles] = useState<File[]>([]);
  const [proposalFiles, setProposalFiles] = useState<File[]>([]);
  const [resultState, setResultState] = useState<ResultState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const nav = useMemo(
    () => [
      { id: "contract" as const, label: "Revisión de Contratos", icon: Scale, description: "Detecta riesgos y obligaciones clave" },
      { id: "proposals" as const, label: "Comparador de Propuestas", icon: BriefcaseBusiness, description: "Evalúa ofertas y recomienda una opción" },
      { id: "history" as const, label: "Resultado", icon: Clock3, description: "Consulta el análisis pagado" },
    ],
    [],
  );

  async function fetchAnalysis(analysisId: string) {
    if (!user) return;
    const token = await user.getIdToken();
    const response = await fetch(`/api/analysis/result/${analysisId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (response.ok) {
      setResultState({ id: analysisId, status: data.status, result: data.result, error: data.error });
    }
  }

  useEffect(() => {
    if (!user) return;
    const analysisId = new URLSearchParams(window.location.search).get("analysisId");
    if (!analysisId) return;

    setView("history");
    fetchAnalysis(analysisId);
    const interval = window.setInterval(() => fetchAnalysis(analysisId), 5000);
    return () => window.clearInterval(interval);
  }, [user]);

  async function payAndAnalyze(type: AnalysisType, files: File[]) {
    if (!user) return;
    setBusy(true);
    setError("");
    setResultState(null);

    try {
      const token = await user.getIdToken();
      const formData = new FormData();
      formData.append("type", type);
      files.forEach((file) => formData.append("files", file));

      const response = await fetch("/api/payments/mercadopago/preference", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "No se pudo crear la preferencia de pago.");
        return;
      }

      window.location.href = data.initPoint;
    } catch {
      setError("No se pudo iniciar el pago. Revisa la conexión e inténtalo de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center px-6">
        <div className="inline-flex items-center gap-3 rounded-full bg-[#2b2930] px-6 py-3 text-sm font-medium text-[#e6e1e5] shadow-[0_2px_8px_rgba(0,0,0,0.32)]">
          <Loader2 className="h-4 w-4 animate-spin text-[#a8c7fa]" /> Cargando Business Desk
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
                <Sparkles className="h-4 w-4" /> MATERIAL AI WORKSPACE
              </div>
              <h1 className="max-w-3xl text-5xl font-medium tracking-[-0.04em] text-[#e6e1e5] md:text-7xl">Business Desk</h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#cac4d0]">Operaciones críticas de negocio con IA: revisión de contratos y comparación de propuestas bajo un modelo simple de pago por uso.</p>
              <button onClick={login} className="group mt-10 inline-flex h-14 items-center gap-3 rounded-full bg-[#a8c7fa] px-7 text-sm font-bold text-[#062e6f] shadow-[0_2px_8px_rgba(168,199,250,0.24)] transition hover:bg-[#d7e3f8] focus:outline-none focus:ring-4 focus:ring-[#a8c7fa]/20">
                Ingresar con Google <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </button>
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

  const currentFiles = view === "contract" ? contractFiles : proposalFiles;
  const validFiles = view === "contract" ? contractFiles.length === 1 : proposalFiles.length >= 2 && proposalFiles.length <= 4;
  const activeTool = nav.find((item) => item.id === view);

  return (
    <main className="min-h-screen text-[#e6e1e5]">
      <aside className="fixed inset-y-0 left-0 hidden w-80 border-r border-[#cac4d0]/10 bg-[#1c1b1f]/88 px-4 py-6 shadow-[0_4px_16px_rgba(0,0,0,0.36)] backdrop-blur-xl lg:block">
        <div className="mb-10 flex items-center gap-3 px-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#a8c7fa] text-[#062e6f]"><Sparkles className="h-5 w-5" /></div>
          <div>
            <p className="text-lg font-medium tracking-[-0.02em]">Business Desk</p>
            <p className="text-xs text-[#cac4d0]">Material AI Workspace</p>
          </div>
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
            <div className="flex items-center gap-2 font-medium text-[#d7e3f8]"><ShieldCheck className="h-4 w-4 text-[#a8c7fa]" /> Pago por uso</div>
            <p className="mt-2 text-xs leading-5 text-[#cac4d0]">Sin saldos. Cada análisis cuesta {formatCop(ANALYSIS_PRICE)}.</p>
          </div>
          <button onClick={logout} className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[#938f99]/25 text-sm font-medium text-[#cac4d0] transition hover:bg-[#2b2930] hover:text-[#e6e1e5]"><LogOut className="h-4 w-4" /> Salir</button>
        </div>
      </aside>

      <section className="lg:pl-80">
        <header className="sticky top-0 z-10 border-b border-[#cac4d0]/10 bg-[#121212]/78 px-6 py-5 backdrop-blur-xl lg:px-10">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#cac4d0]">Workspace</p>
              <h2 className="mt-1 text-2xl font-medium tracking-[-0.02em] text-[#e6e1e5]">{profile?.displayName ?? user.displayName ?? "Usuario"}</h2>
            </div>
            <div className="hidden rounded-full bg-[#2b2930] px-5 py-3 text-sm font-medium text-[#d7e3f8] md:block">{formatCop(ANALYSIS_PRICE)} por análisis</div>
          </div>
        </header>

        <div className="mx-auto max-w-6xl px-6 py-8 lg:px-10 lg:py-10">
          {error && <div className="mb-6 rounded-3xl bg-[#f2b8b5]/12 p-4 text-sm font-medium text-[#f2b8b5]">{error}</div>}

          {view !== "history" && (
            <section className="overflow-hidden rounded-[2rem] bg-[#1c1b1f] shadow-[0_6px_18px_rgba(0,0,0,0.36)] ring-1 ring-[#cac4d0]/10">
              <div className="grid gap-6 border-b border-[#cac4d0]/10 p-7 md:grid-cols-[1fr_auto] md:p-9">
                <div>
                  <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#a8c7fa]/12 px-4 py-2 text-xs font-medium tracking-[0.12em] text-[#d7e3f8]">
                    {activeTool?.icon && <activeTool.icon className="h-4 w-4" />} GEMINI AGENT
                  </div>
                  <h1 className="text-4xl font-medium tracking-[-0.035em] text-[#e6e1e5] md:text-5xl">{view === "contract" ? "Revisión de Contratos" : "Comparador de Propuestas"}</h1>
                  <p className="mt-4 max-w-3xl text-base leading-7 text-[#cac4d0]">{view === "contract" ? "Sube un contrato en PDF. Gemini identifica riesgos, fechas clave, obligaciones y recomendaciones accionables." : "Sube entre 2 y 4 propuestas. Gemini genera una matriz comparativa y una recomendación ejecutiva."}</p>
                </div>
                <div className="rounded-3xl bg-[#2b2930] p-5 md:min-w-48 md:text-right">
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#cac4d0]">Pago único</p>
                  <p className="mt-2 text-2xl font-medium text-[#e6e1e5]">{formatCop(ANALYSIS_PRICE)}</p>
                </div>
              </div>

              <div className="space-y-6 p-7 md:p-9">
                {view === "contract" ? <FileDropzone files={contractFiles} onFilesChange={setContractFiles} /> : <FileDropzone files={proposalFiles} onFilesChange={setProposalFiles} multiple maxFiles={4} />}
                <button disabled={busy || !validFiles} onClick={() => payAndAnalyze(view, currentFiles)} className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-full bg-[#a8c7fa] px-7 text-sm font-bold text-[#062e6f] shadow-[0_2px_8px_rgba(168,199,250,0.22)] transition hover:bg-[#d7e3f8] focus:outline-none focus:ring-4 focus:ring-[#a8c7fa]/20 disabled:cursor-not-allowed disabled:bg-[#938f99]/35 disabled:text-[#cac4d0]/60 md:w-auto">
                  {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileSearch className="h-5 w-5" />}
                  {busy ? "Preparando pago..." : `Pagar y Analizar (${formatCop(ANALYSIS_PRICE)})`}
                </button>
              </div>
            </section>
          )}

          {view === "history" && (
            <section className="rounded-[2rem] bg-[#1c1b1f] p-8 shadow-[0_6px_18px_rgba(0,0,0,0.36)] ring-1 ring-[#cac4d0]/10">
              <div className="flex items-center gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#a8c7fa]/12 text-[#a8c7fa]"><CheckCircle2 className="h-6 w-6" /></div>
                <div>
                  <h3 className="text-3xl font-medium tracking-[-0.03em] text-[#e6e1e5]">Resultado del análisis</h3>
                  <p className="mt-1 text-sm text-[#cac4d0]">Cuando MercadoPago confirme el pago, el webhook procesará el documento y aparecerá aquí.</p>
                </div>
              </div>
              {!resultState && <p className="mt-8 rounded-3xl bg-[#2b2930] p-5 text-sm text-[#cac4d0]">Aún no hay un análisis seleccionado. Completa un pago para consultar el resultado.</p>}
              {resultState && resultState.status !== "completed" && <div className="mt-8 flex items-center gap-3 rounded-3xl bg-[#2b2930] p-5 text-sm text-[#d7e3f8]"><Loader2 className="h-5 w-5 animate-spin text-[#a8c7fa]" /> Estado: {resultState.status}. Esta pantalla se actualiza automáticamente.</div>}
              {resultState?.error && <div className="mt-8 rounded-3xl bg-[#f2b8b5]/12 p-5 text-sm text-[#f2b8b5]">{resultState.error}</div>}
              {resultState?.result && <div className="mt-8"><MarkdownResult content={resultState.result} /></div>}
            </section>
          )}
        </div>
      </section>
    </main>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
