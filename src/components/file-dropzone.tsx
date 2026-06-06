"use client";

import { UploadCloud } from "lucide-react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";

type FileDropzoneProps = {
  files: File[];
  onFilesChange: (files: File[]) => void;
  multiple?: boolean;
  maxFiles?: number;
};

export function FileDropzone({ files, onFilesChange, multiple = false, maxFiles = 1 }: FileDropzoneProps) {
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
    <div>
      <div
        {...getRootProps()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-slate-600 bg-slate-950/40 p-10 text-center transition",
          isDragActive && "border-violet-400 bg-violet-500/10",
        )}
      >
        <input {...getInputProps()} />
        <UploadCloud className="mb-4 h-10 w-10 text-violet-300" />
        <p className="text-lg font-semibold">Arrastra PDFs aquí o haz clic para seleccionar</p>
        <p className="mt-2 text-sm text-slate-400">Archivos permitidos: PDF. Máximo {maxFiles}.</p>
      </div>
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file) => (
            <div key={`${file.name}-${file.size}`} className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-300">
              {file.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
