"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/ui/Navbar";
import { RiskBadge } from "@/components/results/RiskBadge";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { History, FileText, ChevronRight, Clock, Loader2 } from "lucide-react";

interface HistoryItem {
  id: string;
  createdAt: string;
  fileNames: string[];
  overallRiskScore: string;
  findingsCount: number;
  title: string | null;
}

function HistoryCard({ item }: { item: HistoryItem }) {
  const { t } = useLanguage();
  const date = new Date(item.createdAt);
  const formattedDate = date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Link href={`/history/${item.id}`} className="block group">
      <div className="glass rounded-2xl p-5 sm:p-6 space-y-4 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all duration-200">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <RiskBadge level={item.overallRiskScore} size="sm" />
              <span className="text-xs text-slate-500">{item.findingsCount} {t.findingsCount}</span>
            </div>
            <p className="text-sm sm:text-base font-semibold text-white truncate">
              {item.title || `${t.analysisTitle} #${item.id.slice(-6)}`}
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-amber-400 transition-colors flex-shrink-0 mt-1" />
        </div>

        {/* File names */}
        <div className="flex flex-wrap gap-1.5">
          {item.fileNames.slice(0, 3).map((name) => (
            <span
              key={name}
              className="flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-slate-400"
            >
              <FileText className="h-3 w-3" />
              <span className="truncate max-w-[120px]">{name}</span>
            </span>
          ))}
          {item.fileNames.length > 3 && (
            <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-slate-500">
              +{item.fileNames.length - 3} {t.files}
            </span>
          )}
        </div>

        {/* Date */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Clock className="h-3.5 w-3.5" />
          {formattedDate}
        </div>
      </div>
    </Link>
  );
}

export default function HistoryPage() {
  const { t } = useLanguage();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/history")
      .then((r) => r.json())
      .then((data) => {
        setItems(data.analyses || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="gradient-bg min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20">
            <History className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{t.historyTitle}</h1>
            {!loading && (
              <p className="text-sm text-slate-400 mt-0.5">{items.length} analisis tersimpan</p>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 text-amber-400 animate-spin" />
          </div>
        )}

        {/* Empty */}
        {!loading && items.length === 0 && (
          <div className="glass rounded-3xl p-12 sm:p-16 text-center space-y-4">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
                <History className="h-8 w-8 text-slate-500" />
              </div>
            </div>
            <div>
              <p className="text-lg font-semibold text-white">{t.historyEmpty}</p>
              <p className="text-sm text-slate-400 mt-1">{t.historyEmptyDesc}</p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500/20 px-5 py-2.5 text-sm font-semibold text-amber-400 hover:bg-amber-500/30 transition-all"
            >
              {t.navHome}
            </Link>
          </div>
        )}

        {/* Grid */}
        {!loading && items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item) => (
              <HistoryCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
