"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { UploadCloud, X, FileText, FileSpreadsheet, File, Image, FileType } from "lucide-react";

const ACCEPTED_TYPES = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  "application/vnd.ms-excel": [".xls"],
  "text/csv": [".csv"],
  "text/plain": [".txt"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
};

function FileIcon({ name }: { name: string }) {
  const ext = name.toLowerCase().split(".").pop();
  if (ext === "pdf") return <File className="h-5 w-5 text-red-400" />;
  if (ext === "xlsx" || ext === "xls") return <FileSpreadsheet className="h-5 w-5 text-green-400" />;
  if (ext === "csv") return <FileSpreadsheet className="h-5 w-5 text-blue-400" />;
  if (ext === "docx") return <FileType className="h-5 w-5 text-blue-300" />;
  if (ext === "jpg" || ext === "jpeg" || ext === "png")
    return <Image className="h-5 w-5 text-purple-400" />;
  return <FileText className="h-5 w-5 text-slate-400" />;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

interface UploadZoneProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
}

export function UploadZone({ files, onFilesChange }: UploadZoneProps) {
  const { t } = useLanguage();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const combined = [...files, ...acceptedFiles];
      // Deduplicate by name
      const unique = combined.filter(
        (f, idx, arr) => arr.findIndex((x) => x.name === f.name) === idx
      );
      onFilesChange(unique);
    },
    [files, onFilesChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    multiple: true,
  });

  const removeFile = (name: string) => {
    onFilesChange(files.filter((f) => f.name !== name));
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-all duration-300 ${
          isDragActive
            ? "border-amber-400 bg-amber-500/10 scale-[1.01]"
            : "border-white/20 bg-white/5 hover:border-amber-500/50 hover:bg-amber-500/5"
        }`}
      >
        <input {...getInputProps()} />

        {/* Animated background glow when dragging */}
        {isDragActive && (
          <div className="absolute inset-0 rounded-2xl bg-amber-400/5 animate-pulse" />
        )}

        <div className="relative flex flex-col items-center gap-4">
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300 ${
              isDragActive ? "bg-amber-400/20 scale-110" : "bg-white/10"
            }`}
          >
            <UploadCloud
              className={`h-8 w-8 transition-colors duration-300 ${
                isDragActive ? "text-amber-400" : "text-slate-400"
              }`}
            />
          </div>

          <div>
            <p className={`text-base sm:text-lg font-semibold transition-colors ${isDragActive ? "text-amber-400" : "text-white"}`}>
              {isDragActive ? t.dragActive : t.uploadDesc}
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Format didukung: PDF, Excel (.xlsx), CSV, TXT, DOCX, JPG, PNG
            </p>
            <p className="mt-0.5 text-xs text-slate-500">{t.uploadMultiple}</p>
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.name}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition-all hover:bg-white/8"
            >
              <FileIcon name={file.name} />
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-white">{file.name}</p>
                <p className="text-xs text-slate-400">{formatBytes(file.size)}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(file.name);
                }}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
                aria-label={t.removeFile}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
