"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownResult({ content }: { content: string }) {
  return (
    <article className="prose-business max-w-none rounded-3xl border border-[#cac4d0]/12 bg-[#211f26] p-6 leading-7 shadow-[0_1px_2px_rgba(0,0,0,0.35),0_4px_12px_rgba(0,0,0,0.28)]">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </article>
  );
}
