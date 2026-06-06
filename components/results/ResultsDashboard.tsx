"use client";

import { AnalysisResult } from "@/lib/types";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { FindingCard } from "./FindingCard";
import { RiskScoreDisplay } from "./RiskBadge";
import { useState } from "react";
import {
  ShieldAlert,
  ListChecks,
  Zap,
  UserCheck,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

interface ResultsDashboardProps {
  result: AnalysisResult;
  fileNames: string[];
}

function SectionCard({
  title,
  icon,
  children,
  className = "",
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6 ${className}`}>
      <div className="flex items-center gap-2.5 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
          {icon}
        </div>
        <h3 className="font-semibold text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export function ResultsDashboard({ result, fileNames }: ResultsDashboardProps) {
  const { t } = useLanguage();
  const [expandAll, setExpandAll] = useState(false);
  const { findings, final_summary } = result;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ── Overall Risk Score ───────────────────────────────────── */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-5 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
              {t.overallRisk}
            </p>
            <RiskScoreDisplay
              score={final_summary.overall_fraud_risk_score}
              percentage={final_summary.overall_risk_percentage}
            />
          </div>
          <div className="flex gap-4 sm:gap-6 text-center">
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-white">{findings.length}</p>
              <p className="text-xs text-slate-400">{t.findingsCount}</p>
            </div>
            <div className="w-px bg-white/10" />
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-white">{fileNames.length}</p>
              <p className="text-xs text-slate-400">{t.filesUploaded}</p>
            </div>
          </div>
        </div>

        {fileNames.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {fileNames.map((name) => (
              <span
                key={name}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400"
              >
                {name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Summary Grid ─────────────────────────────────────────── */}
      <div className="grid gap-4 sm:gap-5 grid-cols-1 md:grid-cols-2">
        {/* Key Red Flags */}
        {final_summary.key_red_flags?.length > 0 && (
          <SectionCard title={t.keyRedFlags} icon={<ShieldAlert className="h-4 w-4" />}>
            <ul className="space-y-2.5">
              {final_summary.key_red_flags.map((flag, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <ChevronRight className="h-4 w-4 flex-shrink-0 mt-0.5 text-red-400" />
                  <span className="text-sm text-slate-300 leading-relaxed">{flag}</span>
                </li>
              ))}
            </ul>
          </SectionCard>
        )}

        {/* Priority Actions */}
        {final_summary.priority_actions_for_management?.length > 0 && (
          <SectionCard title={t.priorityActions} icon={<Zap className="h-4 w-4" />}>
            <ul className="space-y-2.5">
              {final_summary.priority_actions_for_management.map((action, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-xs font-bold text-amber-400">
                    {i + 1}
                  </span>
                  <span className="text-sm text-slate-300 leading-relaxed">{action}</span>
                </li>
              ))}
            </ul>
          </SectionCard>
        )}

        {/* Auditor Recommendation */}
        {final_summary.auditor_recommendation && (
          <SectionCard title={t.auditorRec} icon={<UserCheck className="h-4 w-4" />}>
            <p className="text-sm text-slate-300 leading-relaxed">
              {final_summary.auditor_recommendation}
            </p>
          </SectionCard>
        )}

        {/* Additional Data Needed */}
        {final_summary.additional_data_needed?.length > 0 && (
          <SectionCard title={t.additionalData} icon={<AlertCircle className="h-4 w-4" />}>
            <ul className="space-y-2.5">
              {final_summary.additional_data_needed.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <ListChecks className="h-4 w-4 flex-shrink-0 mt-0.5 text-slate-500" />
                  <span className="text-sm text-slate-300 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </SectionCard>
        )}
      </div>

      {/* ── Detailed Findings ─────────────────────────────────────── */}
      {findings.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">{t.findingsTitle}</h2>
            <button
              onClick={() => setExpandAll(!expandAll)}
              className="text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors"
            >
              {expandAll ? t.collapseAll : t.expandAll}
            </button>
          </div>
          <div className="space-y-3">
            {findings.map((finding, i) => (
              <FindingCard
                key={i}
                finding={finding}
                index={i}
                defaultOpen={expandAll || i === 0}
              />
            ))}
          </div>
        </div>
      )}

      {findings.length === 0 && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-8 text-center">
          <p className="text-lg font-semibold text-emerald-400">{t.noFindings}</p>
        </div>
      )}
    </div>
  );
}
