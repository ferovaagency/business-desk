"use client";

import { BarChart3, BriefcaseBusiness, FileText, LogOut, Scale, Sparkles, WalletCards } from "lucide-react";
import { useMemo, useState } from "react";
import { AuthProvider, useAuth } from "@/components/auth-provider";
import { FileDropzone } from "@/components/file-dropzone";
import { MarkdownResult } from "@/components/markdown-result";
import { formatCop } from "@/lib/utils";

type View = "dashboard" | "contract" | "proposals";

function AppShell() {
  const { user, profile, loading, login, logout } = useAuth();
  const [view, setView] = useState<View>("dashboard");
  const [contractFiles, setContractFiles] = useState<File[]>([]);
  const [proposalFiles, setProposalFiles] = useState<File[]>([]);
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const nav = useMemo(
    () => [
      { id: "dashboard" as const, label: "Dashboard", icon: BarChart3 },
      { id: "contract" as const, label: "Revisión de Contratos", icon: Scale },
      { id: "proposals" as const, label: "Comparador de Propuestas", icon: BriefcaseBusiness },
    ],
    [],
  );

  async function buyCredits() {
    if (!user) return;
    setBusy(true);
    setError("");
    const token = await user.getIdToken();
    const response = await fetch("/api/payments/mercadopago/preference", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    setBusy(false);
    if (!response.ok) {
      setError(data.error ?? "No se pudo crear la preferencia de pago.");
      return;
    }
    window.location.href = data.initPoint;
  }

  async function runAnalysis(type: "contract" | "proposals", files: File[]) {
    if (!user) return;
    if ((profile?.credits ?? 0) < 1) {
      setError("Necesitas al menos 1 crédito para ejecutar este análisis.");
      return;
    }
    setBusy(true);
    setError("");
    setResult("");
    const token = await user.getIdToken();
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    const response = await fetch(`/api/analysis/${type}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await response.json();
    setBusy(false);
    if (!response.ok) {
      setError(data.error ?? "No se pudo completar el análisis.");
      return;
    }
    setResult(data.result);
  }

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center bg-background text-slate-200">Cargando Business Desk...</main>;
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#312E81,#070B14_48%)] px-6">
        <section className="max-w-2xl rounded-[2rem] border border-white/10 bg-white/5 p-10 text-center shadow-2xl shadow-black/40 backdrop-blur">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/20 text-violet-200">
            <Sparkles className="h-8 w-8" />
          </div>
          <h1 className="text-5xl font-black tracking-tight text-white">Business Desk</h1>
          <p className="mt-5 text-lg leading-8 text-slate-300">Suite SaaS de operaciones bajo demanda para revisar contratos y comparar propuestas comerciales con IA.</p>
          <button onClick={login} className="mt-8 rounded-2xl bg-white px-6 py-3 font-bold text-slate-950 transition hover:bg-violet-100">Ingresar con Google</button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-slate-100">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-800 bg-slate-950/80 p-6 lg:block">
        <div className="flex items-center gap-3 text-xl font-black"><Sparkles className="text-violet-300" /> Business Desk</div>
        <nav className="mt-10 space-y-2">
          {nav.map((item) => (
            <button key={item.id} onClick={() => setView(item.id)} className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${view === item.id ? "bg-violet-500 text-white" : "text-slate-400 hover:bg-slate-900 hover:text-white"}`}>
              <item.icon className="h-5 w-5" /> {item.label}
            </button>
          ))}
        </nav>
        <button onClick={logout} className="absolute bottom-6 left-6 right-6 flex items-center justify-center gap-2 rounded-2xl border border-slate-800 py-3 text-slate-300 hover:bg-slate-900"><LogOut className="h-4 w-4" /> Salir</button>
      </aside>

      <section className="lg:pl-72">
        <header className="flex items-center justify-between border-b border-slate-800 bg-slate-950/40 p-6">
          <div>
            <p className="text-sm text-slate-400">Bienvenido</p>
            <h2 className="text-2xl font-bold">{profile?.displayName ?? user.displayName ?? "Usuario"}</h2>
          </div>
          <div className="rounded-2xl border border-violet-400/30 bg-violet-500/10 px-5 py-3 font-bold text-violet-100">{profile?.credits ?? 0} créditos</div>
        </header>

        <div className="mx-auto max-w-6xl p-6 lg:p-10">
          {error && <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-100">{error}</div>}

          {view === "dashboard" && (
            <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
              <section className="rounded-3xl border border-slate-800 bg-panel p-8">
                <WalletCards className="mb-6 h-10 w-10 text-violet-300" />
                <h3 className="text-3xl font-black">Saldo de créditos</h3>
                <p className="mt-3 text-6xl font-black">{profile?.credits ?? 0}</p>
                <p className="mt-4 text-slate-400">Cada análisis exitoso consume 1 crédito.</p>
                <button disabled={busy} onClick={buyCredits} className="mt-8 rounded-2xl bg-violet-500 px-6 py-3 font-bold text-white disabled:opacity-50">Comprar 5 créditos por {formatCop(25000)}</button>
              </section>
              <section className="rounded-3xl border border-slate-800 bg-panel p-8">
                <h3 className="text-2xl font-black">Historial de análisis</h3>
                <p className="mt-4 text-slate-400">Los análisis se guardan en Firestore después de completarse. La lista en tiempo real queda lista para extenderse con filtros y búsqueda.</p>
              </section>
            </div>
          )}

          {view === "contract" && (
            <section className="space-y-6 rounded-3xl border border-slate-800 bg-panel p-8">
              <div><h3 className="text-3xl font-black">Revisión de Contratos</h3><p className="mt-2 text-slate-400">Sube un contrato PDF. Costo: 1 crédito.</p></div>
              <FileDropzone files={contractFiles} onFilesChange={setContractFiles} />
              <button disabled={busy || contractFiles.length !== 1} onClick={() => runAnalysis("contract", contractFiles)} className="rounded-2xl bg-violet-500 px-6 py-3 font-bold disabled:opacity-50">Analizar contrato</button>
              {result && <MarkdownResult content={result} />}
            </section>
          )}

          {view === "proposals" && (
            <section className="space-y-6 rounded-3xl border border-slate-800 bg-panel p-8">
              <div><h3 className="text-3xl font-black">Comparador de Propuestas</h3><p className="mt-2 text-slate-400">Sube de 2 a 4 propuestas PDF. Costo: 1 crédito.</p></div>
              <FileDropzone files={proposalFiles} onFilesChange={setProposalFiles} multiple maxFiles={4} />
              <button disabled={busy || proposalFiles.length < 2 || proposalFiles.length > 4} onClick={() => runAnalysis("proposals", proposalFiles)} className="rounded-2xl bg-violet-500 px-6 py-3 font-bold disabled:opacity-50">Comparar propuestas</button>
              {result && <MarkdownResult content={result} />}
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
