"use client";

import { FileText, UploadCloud, X } from "lucide-react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";

type FileDropzoneProps = {
  files: File[];
  onFilesChange: (files: File[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  title: string;
  description: string;
};

export function FileDropzone({ files, onFilesChange, multiple = false, maxFiles = 1, title, description }: FileDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const nextFiles = multiple ? [...files, ...acceptedFiles].slice(0, maxFiles) : acceptedFiles.slice(0, 1);
      onFilesChange(nextFiles);
    },
    [files, maxFiles, multiple, onFilesChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple,
    maxFiles,
    accept: { "application/pdf": [".pdf"] },
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "group flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-[#938f99]/40 bg-[#211f26]/90 p-10 text-center shadow-[0_1px_2px_rgba(0,0,0,0.35),0_2px_6px_rgba(0,0,0,0.25)] transition duration-200 hover:border-[#a8c7fa]/70 hover:bg-[#2b2930]",
          isDragActive && "border-[#a8c7fa] bg-[#a8c7fa]/10",
        )}
      >
        <input {...getInputProps()} />
        <div className="mb-5 grid h-16 w-16 place-items-center rounded-3xl bg-[#a8c7fa]/14 text-[#a8c7fa] transition group-hover:scale-105">
          <UploadCloud className="h-8 w-8" />
        </div>
        <p className="text-xl font-medium tracking-[-0.01em] text-[#e6e1e5]">{title}</p>
        <p className="mt-2 max-w-md text-sm leading-6 text-[#cac4d0]">{description}</p>
      </div>
      {files.length > 0 && (
        <div className="grid gap-3">
          {files.map((file) => (
            <div key={`${file.name}-${file.size}`} className="flex items-center justify-between rounded-2xl border border-[#cac4d0]/12 bg-[#1c1b1f] px-4 py-3 text-sm text-[#cac4d0] shadow-[0_1px_2px_rgba(0,0,0,0.28)]">
              <span className="flex min-w-0 items-center gap-3 truncate"><FileText className="h-4 w-4 shrink-0 text-[#a8c7fa]" /> <span className="truncate">{file.name}</span></span>
              <button onClick={() => onFilesChange(files.filter((item) => item !== file))} className="ml-4 rounded-full p-2 text-[#cac4d0] transition hover:bg-[#36343b] hover:text-[#e6e1e5]" type="button">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
