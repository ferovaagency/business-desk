"use client";

import { AlertTriangle, CheckCircle2, FileText, HelpCircle, Loader2, ShieldCheck, Siren } from "lucide-react";
import type { StructuredAnalysisResult } from "@/lib/types";

function normalizeItems(items: string[] | undefined) {
  return items?.filter(Boolean).length ? items.filter(Boolean) : ["No se identificaron puntos específicos en esta sección."];
}

function Card({ title, subtitle, items, tone, icon }: { title: string; subtitle: string; items: string[]; tone: "green" | "red" | "blue" | "orange"; icon: React.ReactNode }) {
  const styles = {
    green: "border-[#6dd58c]/25 bg-[#6dd58c]/10 text-[#b8f7c7]",
    red: "border-[#f2b8b5]/25 bg-[#f2b8b5]/10 text-[#f2b8b5]",
    blue: "border-[#a8c7fa]/25 bg-[#a8c7fa]/10 text-[#d7e3f8]",
    orange: "border-[#ffb86c]/25 bg-[#ffb86c]/10 text-[#ffd9ad]",
  }[tone];

  return (
    <section className={`rounded-[1.75rem] border p-6 shadow-[0_1px_3px_rgba(0,0,0,0.28),0_6px_18px_rgba(0,0,0,0.26)] ${styles}`}>
      <div className="flex items-start gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10">{icon}</div>
        <div>
          <h4 className="text-xl font-semibold tracking-[-0.02em]">{title}</h4>
          <p className="mt-1 text-sm text-[#e6e1e5]/72">{subtitle}</p>
        </div>
      </div>
      <ul className="mt-5 space-y-3 text-sm leading-6 text-[#e6e1e5]">
        {items.map((item, index) => (
          <li key={`${title}-${index}`} className="rounded-2xl bg-[#121212]/35 p-4">{item}</li>
        ))}
      </ul>
    </section>
  );
}

export function AnalysisCards({ result, questionAnswers, onAnswerChange, onRefine, isRefining }: { result: StructuredAnalysisResult; questionAnswers?: Record<string, string>; onAnswerChange?: (question: string, answer: string) => void; onRefine?: () => void; isRefining?: boolean }) {
  return (
    <article className="space-y-6">
      <div className="rounded-[1.75rem] border border-[#cac4d0]/12 bg-[#211f26] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.28)]">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#a8c7fa]/12 text-[#a8c7fa]"><FileText className="h-6 w-6" /></div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#cac4d0]">Resumen Ejecutivo</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#e6e1e5]">Análisis listo para decisión</h3>
            <p className="mt-3 leading-7 text-[#cac4d0]">{result.summary}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card title="Lo Correcto" subtitle="Puntos fuertes y equilibrio contractual." items={normalizeItems(result.correct)} tone="green" icon={<CheckCircle2 className="h-6 w-6" />} />
        <Card title="Peligro para la Parte 1" subtitle="Riesgos para contratante, empleador, arrendador o quien paga/emite." items={normalizeItems(result.riskPartyOne)} tone="red" icon={<AlertTriangle className="h-6 w-6" />} />
        <Card title="Peligro para la Parte 2" subtitle="Riesgos para contratista, empleado, arrendatario o quien ejecuta." items={normalizeItems(result.riskPartyTwo)} tone="red" icon={<AlertTriangle className="h-6 w-6" />} />
        <Card title="Cómo protegerte" subtitle="Cambios concretos priorizados para tu rol." items={normalizeItems(result.protection)} tone="blue" icon={<ShieldCheck className="h-6 w-6" />} />
        <Card title="Lo que falta" subtitle="Cláusulas o elementos vitales ausentes." items={normalizeItems(result.missing)} tone="orange" icon={<Siren className="h-6 w-6" />} />
      </div>

      <Card title="🔍 Preguntas Clave para Refinar tu Blindaje" subtitle="Preguntas precisas basadas en vacíos detectados en el documento." items={normalizeItems(result.keyQuestions)} tone="blue" icon={<HelpCircle className="h-6 w-6" />} />

      {onAnswerChange && result.keyQuestions.length > 0 && (
        <div className="rounded-[1.75rem] border border-[#a8c7fa]/25 bg-[#a8c7fa]/10 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.28)]">
          <h4 className="mb-4 text-lg font-semibold text-[#d7e3f8]">Responde para refinar el análisis</h4>
          <div className="space-y-4">
            {result.keyQuestions.map((question, index) => (
              <div key={index} className="space-y-2">
                <label className="text-sm font-medium text-[#e6e1e5]">{question}</label>
                <input
                  type="text"
                  value={questionAnswers?.[question] || ""}
                  onChange={(e) => onAnswerChange?.(question, e.target.value)}
                  placeholder="Tu respuesta..."
                  className="w-full rounded-2xl border border-[#938f99]/25 bg-[#1c1b1f] px-4 py-3 text-sm text-[#e6e1e5] placeholder:text-[#cac4d0]/50 focus:border-[#a8c7fa] focus:outline-none focus:ring-2 focus:ring-[#a8c7fa]/20"
                />
              </div>
            ))}
          </div>
          <button
            onClick={onRefine}
            disabled={isRefining}
            className="mt-6 inline-flex h-12 w-full items-center justify-center gap-3 rounded-full bg-[#a8c7fa] px-6 text-sm font-bold text-[#062e6f] shadow-[0_2px_8px_rgba(168,199,250,0.22)] transition hover:bg-[#d7e3f8] focus:outline-none focus:ring-4 focus:ring-[#a8c7fa]/20 disabled:cursor-not-allowed disabled:bg-[#938f99]/35 disabled:text-[#cac4d0]/60"
          >
            {isRefining ? <Loader2 className="h-5 w-5 animate-spin" /> : <HelpCircle className="h-5 w-5" />}
            {isRefining ? "Refinando análisis..." : "Enviar respuestas y refinar análisis"}
          </button>
        </div>
      )}

    </article>
  );
}
