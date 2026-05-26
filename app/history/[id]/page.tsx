"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/ui/Navbar";
import { ResultsDashboard } from "@/components/results/ResultsDashboard";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { AnalysisResult } from "@/lib/types";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";

export default function AnalysisDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/history/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setAnalysis(data.analysis);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load analysis");
        setLoading(false);
      });
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm("Hapus analisis ini? Tindakan ini tidak dapat dibatalkan.")) return;
    setDeleting(true);
    try {
      await fetch(`/api/history/${params.id}`, { method: "DELETE" });
      router.push("/history");
    } catch {
      setDeleting(false);
    }
  };

  return (
    <div className="gradient-bg min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Back + Actions */}
        <div className="flex items-center justify-between mb-8 gap-4">
          <Link
            href="/history"
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.backToHistory}
          </Link>

          {analysis && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50"
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Hapus</span>
            </button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 text-amber-400 animate-spin" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="glass rounded-2xl p-8 text-center">
            <p className="text-red-400 font-medium">{error}</p>
            <Link href="/history" className="mt-4 inline-block text-sm text-amber-400 hover:underline">
              {t.backToHistory}
            </Link>
          </div>
        )}

        {/* Analysis Detail */}
        {!loading && analysis && (
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                {analysis.title || `${t.analysisTitle} #${analysis.id.slice(-6)}`}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {new Date(analysis.createdAt).toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <ResultsDashboard
              result={analysis.rawResult as AnalysisResult}
              fileNames={analysis.fileNames}
            />
          </div>
        )}
      </main>
    </div>
  );
}
