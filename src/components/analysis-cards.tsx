"use client";

import { AlertTriangle, CheckCircle2, Download, FileText, HelpCircle, ShieldCheck, Siren } from "lucide-react";
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

function downloadPrintableReport(result: StructuredAnalysisResult) {
  const sections: [string, string[]][] = [
    ["Lo Correcto", result.correct],
    ["Peligro para la Parte 1", result.riskPartyOne],
    ["Peligro para la Parte 2", result.riskPartyTwo],
    ["Cómo protegerte", result.protection],
    ["Lo que falta", result.missing],
    ["🔍 Preguntas Clave para Refinar tu Blindaje", result.keyQuestions],
  ];
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Reporte Business Desk</title><style>body{font-family:Arial,sans-serif;margin:40px;color:#1d1b20}h1{font-size:28px}h2{margin-top:28px;color:#0b57d0}.meta{color:#5f6368}.card{border:1px solid #dadce0;border-radius:18px;padding:18px;margin:14px 0}li{margin:8px 0;line-height:1.5}</style></head><body><h1>Reporte Business Desk</h1><p class="meta">${result.summary}</p><p class="meta">País: ${result.metadata.country} | Rol: ${result.metadata.userRole || "No aplica"} | Tipo: ${result.metadata.contractType || result.metadata.analysisType}</p>${sections.map(([title, items]) => `<div class="card"><h2>${title}</h2><ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul></div>`).join("")}</body></html>`;
  const printWindow = window.open("", "_blank", "noopener,noreferrer");
  if (!printWindow) return;
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

export function AnalysisCards({ result }: { result: StructuredAnalysisResult }) {
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

      <button onClick={() => downloadPrintableReport(result)} className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-full bg-[#d0bcff] px-7 text-sm font-bold text-[#381e72] shadow-[0_2px_10px_rgba(208,188,255,0.28)] transition hover:bg-[#eaddff] md:w-auto">
        <Download className="h-5 w-5" /> Descargar Reporte en PDF
      </button>
    </article>
  );
}
