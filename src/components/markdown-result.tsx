"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownResult({ content }: { content: string }) {
  return (
    <article className="prose-business max-w-none rounded-3xl border border-slate-800 bg-slate-950/50 p-6 leading-7 shadow-2xl shadow-black/20">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </article>
  );
}
