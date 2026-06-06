"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/ui/Navbar";
import { UploadZone } from "@/components/upload/UploadZone";
import { ResultsDashboard } from "@/components/results/ResultsDashboard";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { AnalysisResult } from "@/lib/types";
import { Shield, Sparkles, ArrowRight, RefreshCw, Loader2 } from "lucide-react";

type PageState = "idle" | "analyzing" | "results" | "error";

export default function HomePage() {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const router = useRouter();

  const [files, setFiles] = useState<File[]>([]);
  const [pageState, setPageState] = useState<PageState>("idle");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = async () => {
    if (files.length === 0) return;
    setPageState("analyzing");
    setErrorMsg("");

    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setResult(data.result);
      setAnalysisId(data.analysisId);
      setPageState("results");

      // Scroll to results on mobile
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err: any) {
      setErrorMsg(err.message || t.errorDesc);
      setPageState("error");
    }
  };

  const handleReset = () => {
    setFiles([]);
    setResult(null);
    setPageState("idle");
    setErrorMsg("");
    setAnalysisId(null);
  };

  return (
    <div className="gradient-bg min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* ── Hero Header ────────────────────────────────────── */}
        {pageState === "idle" && (
          <div className="mb-10 sm:mb-14 text-center space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-400">
              <Sparkles className="h-3.5 w-3.5" />
              Powered by Gemini 3.5 Flash
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white text-glow">
              {t.appTagline}
            </h1>
            <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-400 leading-relaxed">
              {t.appDescription}
            </p>
          </div>
        )}

        {/* ── Results Header ─────────────────────────────────── */}
        {pageState === "results" && result && (
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">{t.resultsTitle}</h1>
              {analysisId && (
                <p className="text-xs text-slate-500 mt-1">ID: {analysisId}</p>
              )}
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all"
            >
              <RefreshCw className="h-4 w-4" />
              {t.analyzeAnother}
            </button>
          </div>
        )}

        {/* ── Upload Panel ────────────────────────────────────── */}
        {(pageState === "idle" || pageState === "error") && (
          <div className="glass rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20">
                <Shield className="h-5 w-5 text-amber-400" />
              </div>
              <h2 className="text-lg font-bold text-white">{t.uploadTitle}</h2>
            </div>

            <UploadZone files={files} onFilesChange={setFiles} />

            {/* Error Message */}
            {pageState === "error" && errorMsg && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
                <p className="text-sm font-medium text-red-400">{t.error}</p>
                <p className="text-xs text-red-300/70 mt-0.5">{errorMsg}</p>
              </div>
            )}

            {/* Analyze Button */}
            {session?.user ? (
              <button
                onClick={handleAnalyze}
                disabled={files.length === 0}
                className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:from-amber-400 hover:to-orange-400 active:scale-[0.98] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:from-amber-500 disabled:hover:to-orange-500"
              >
                <Sparkles className="h-5 w-5" />
                {t.analyzeBtn}
                <ArrowRight className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={() => router.push("/auth/signin")}
                className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-slate-900/20 hover:from-slate-600 hover:to-slate-700 active:scale-[0.98] transition-all duration-150"
              >
                {t.signIn}
                <ArrowRight className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        {/* ── Analyzing State ─────────────────────────────────── */}
        {pageState === "analyzing" && (
          <div className="glass rounded-3xl p-12 sm:p-16 text-center space-y-6">
            <div className="flex justify-center">
              <div className="relative flex h-20 w-20 items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping" />
                <div className="absolute inset-2 rounded-full bg-amber-500/10 animate-pulse" />
                <Loader2 className="h-10 w-10 text-amber-400 animate-spin relative z-10" />
              </div>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-white">{t.analyzing}</p>
              <p className="text-slate-400 text-sm mt-2">{t.analyzingDesc}</p>
            </div>
            <div className="mx-auto max-w-xs space-y-2">
              {files.map((f) => (
                <div key={f.name} className="shimmer rounded-lg h-8 w-full" />
              ))}
            </div>
          </div>
        )}

        {/* ── Results ─────────────────────────────────────────── */}
        {pageState === "results" && result && (
          <div ref={resultsRef}>
            <ResultsDashboard result={result} fileNames={files.map((f) => f.name)} />
          </div>
        )}

        {/* ── Feature Info (idle only) ─────────────────────────── */}
        {pageState === "idle" && (
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { title: "7 Kategori Fraud", desc: "Transaksi mencurigakan, manipulasi laporan, fraud pajak, dan lebih banyak lagi" },
              { title: "Gemini 3.5 Flash Analysis", desc: "Analisis mendalam berbasis standar audit profesional dan prinsip akuntansi" },
              { title: "Laporan Terstruktur", desc: "JSON terstruktur dengan tingkat risiko, justifikasi, dan rekomendasi audit" },
            ].map((item, i) => (
              <div key={i} className="glass rounded-2xl p-5 space-y-2">
                <h3 className="font-bold text-white text-sm">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
