"use client";

import { CheckCircle2, HelpCircle, Loader2, Target, ThumbsDown, ThumbsUp, TrendingUp, XCircle, Zap } from "lucide-react";
import type { ProposalComparisonResult, ProposalItem } from "@/lib/types";

function AlignmentBar({ score, label }: { score: number; label: string }) {
  const color =
    score >= 75 ? "#6dd58c" :
    score >= 50 ? "#a8c7fa" :
    score >= 30 ? "#ffb86c" : "#f2b8b5";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[#e6e1e5]">{label}</span>
        <span
          className="text-2xl font-bold tabular-nums"
          style={{ color }}
        >
          {score}%
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-[#121212]/50">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function ProposalCard({ proposal, isWinner }: { proposal: ProposalItem; isWinner: boolean }) {
  const scoreColor =
    proposal.alignmentScore >= 75 ? "#6dd58c" :
    proposal.alignmentScore >= 50 ? "#a8c7fa" :
    proposal.alignmentScore >= 30 ? "#ffb86c" : "#f2b8b5";

  return (
    <section
      className={`overflow-hidden rounded-[1.75rem] border shadow-[0_2px_8px_rgba(0,0,0,0.32)] transition-all ${
        isWinner
          ? "border-[#6dd58c]/40 bg-[#6dd58c]/8 ring-1 ring-[#6dd58c]/25"
          : "border-[#cac4d0]/12 bg-[#211f26]"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-[#cac4d0]/10 p-6">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {isWinner && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#6dd58c]/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#6dd58c]">
                <Zap className="h-3 w-3" /> Recomendada
              </span>
            )}
          </div>
          <h4 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-[#e6e1e5]">{proposal.name}</h4>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs font-medium uppercase tracking-widest text-[#cac4d0]">Alineación</p>
          <p className="text-4xl font-bold tabular-nums" style={{ color: scoreColor }}>
            {proposal.alignmentScore}%
          </p>
        </div>
      </div>

      <div className="space-y-5 p-6">
        {/* What it contributes */}
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#6dd58c]">
            <ThumbsUp className="h-4 w-4" />
            Qué aporta al negocio
          </div>
          <ul className="space-y-2">
            {proposal.whatItContributes.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 rounded-2xl bg-[#6dd58c]/8 px-4 py-3 text-sm text-[#e6e1e5]">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#6dd58c]" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* What it lacks */}
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#f2b8b5]">
            <ThumbsDown className="h-4 w-4" />
            Qué le falta
          </div>
          <ul className="space-y-2">
            {proposal.whatItLacks.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 rounded-2xl bg-[#f2b8b5]/8 px-4 py-3 text-sm text-[#e6e1e5]">
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#f2b8b5]" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Strengths & Weaknesses in two columns */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#a8c7fa]">Fortalezas</p>
            <ul className="space-y-1.5">
              {proposal.strengths.map((item, i) => (
                <li key={i} className="rounded-xl bg-[#a8c7fa]/8 px-3 py-2 text-xs leading-5 text-[#d7e3f8]">{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#ffb86c]">Debilidades</p>
            <ul className="space-y-1.5">
              {proposal.weaknesses.map((item, i) => (
                <li key={i} className="rounded-xl bg-[#ffb86c]/8 px-3 py-2 text-xs leading-5 text-[#ffd9ad]">{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ProposalComparisonCards({
  result,
  questionAnswers,
  onAnswerChange,
  onRefine,
  isRefining,
}: {
  result: ProposalComparisonResult;
  questionAnswers?: Record<string, string>;
  onAnswerChange?: (question: string, answer: string) => void;
  onRefine?: () => void;
  isRefining?: boolean;
}) {
  const sortedProposals = [...result.proposals].sort((a, b) => b.alignmentScore - a.alignmentScore);
  const winner = sortedProposals[0];

  return (
    <article className="space-y-6">
      {/* Business Objective */}
      <div className="rounded-[1.75rem] border border-[#a8c7fa]/20 bg-[#a8c7fa]/8 p-6">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#a8c7fa]/15 text-[#a8c7fa]">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#a8c7fa]">Objetivo del negocio detectado</p>
            <p className="mt-2 text-base leading-7 text-[#e6e1e5]">{result.businessObjective}</p>
          </div>
        </div>
      </div>

      {/* Alignment Score Overview */}
      <div className="rounded-[1.75rem] border border-[#cac4d0]/12 bg-[#211f26] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.28)]">
        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#a8c7fa]/12 text-[#a8c7fa]">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#cac4d0]">Comparativa de alineación</p>
            <p className="text-lg font-semibold text-[#e6e1e5]">% orientación a tus objetivos</p>
          </div>
        </div>
        <div className="space-y-4">
          {sortedProposals.map((p) => (
            <AlignmentBar key={p.name} score={p.alignmentScore} label={p.name} />
          ))}
        </div>
      </div>

      {/* Summary & Recommendation */}
      <div className="rounded-[1.75rem] border border-[#cac4d0]/12 bg-[#211f26] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.28)]">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#cac4d0]">Resumen ejecutivo</p>
        <p className="mt-3 leading-7 text-[#cac4d0]">{result.summary}</p>
        <div className="mt-5 rounded-2xl border border-[#6dd58c]/25 bg-[#6dd58c]/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#6dd58c]">✅ Recomendación</p>
          <p className="mt-2 text-sm leading-7 text-[#e6e1e5]">{result.recommendation}</p>
        </div>
      </div>

      {/* Per-proposal breakdown */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold tracking-[-0.02em] text-[#e6e1e5]">Análisis por propuesta</h3>
        {sortedProposals.map((proposal) => (
          <ProposalCard
            key={proposal.name}
            proposal={proposal}
            isWinner={proposal.name === winner?.name}
          />
        ))}
      </div>

      {/* Negotiation Tips */}
      {result.negotiationTips.length > 0 && (
        <div className="rounded-[1.75rem] border border-[#ffb86c]/25 bg-[#ffb86c]/8 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.28)]">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#ffd9ad]">
            <Zap className="h-5 w-5 text-[#ffb86c]" />
            Tips de negociación
          </div>
          <ul className="space-y-2">
            {result.negotiationTips.map((tip, i) => (
              <li key={i} className="rounded-2xl bg-[#121212]/35 px-4 py-3 text-sm leading-6 text-[#e6e1e5]">{tip}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Key Questions */}
      {result.keyQuestions.length > 0 && (
        <div className="rounded-[1.75rem] border border-[#a8c7fa]/25 bg-[#a8c7fa]/8 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.28)]">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#d7e3f8]">
            <HelpCircle className="h-5 w-5 text-[#a8c7fa]" />
            Preguntas para refinar el análisis
          </div>
          {onAnswerChange ? (
            <div className="space-y-4">
              {result.keyQuestions.map((question, index) => (
                <div key={index} className="space-y-2">
                  <label className="text-sm font-medium text-[#e6e1e5]">{question}</label>
                  <input
                    type="text"
                    value={questionAnswers?.[question] || ""}
                    onChange={(e) => onAnswerChange(question, e.target.value)}
                    placeholder="Tu respuesta..."
                    className="w-full rounded-2xl border border-[#938f99]/25 bg-[#1c1b1f] px-4 py-3 text-sm text-[#e6e1e5] placeholder:text-[#cac4d0]/50 focus:border-[#a8c7fa] focus:outline-none focus:ring-2 focus:ring-[#a8c7fa]/20"
                  />
                </div>
              ))}
              <button
                onClick={onRefine}
                disabled={isRefining}
                className="mt-2 inline-flex h-12 w-full items-center justify-center gap-3 rounded-full bg-[#a8c7fa] px-6 text-sm font-bold text-[#062e6f] shadow-[0_2px_8px_rgba(168,199,250,0.22)] transition hover:bg-[#d7e3f8] focus:outline-none focus:ring-4 focus:ring-[#a8c7fa]/20 disabled:cursor-not-allowed disabled:bg-[#938f99]/35 disabled:text-[#cac4d0]/60"
              >
                {isRefining ? <Loader2 className="h-5 w-5 animate-spin" /> : <HelpCircle className="h-5 w-5" />}
                {isRefining ? "Refinando análisis..." : "Enviar respuestas y refinar análisis"}
              </button>
            </div>
          ) : (
            <ul className="space-y-2">
              {result.keyQuestions.map((q, i) => (
                <li key={i} className="rounded-2xl bg-[#121212]/35 px-4 py-3 text-sm leading-6 text-[#e6e1e5]">{q}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </article>
  );
}
