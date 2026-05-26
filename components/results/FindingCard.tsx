"use client";

import { useState } from "react";
import { FraudFinding } from "@/lib/types";
import { RiskBadge } from "./RiskBadge";
import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  BookOpen,
  TrendingUp,
  Scale,
  FileWarning,
  Wrench,
  Search,
  BarChart2,
  MessageSquare,
} from "lucide-react";

interface FindingCardProps {
  finding: FraudFinding;
  index: number;
  defaultOpen?: boolean;
}

interface FieldRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function FieldRow({ icon, label, value }: FieldRowProps) {
  if (!value || value.trim() === "") return null;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
        {icon}
        {label}
      </div>
      <p className="text-sm text-slate-200 leading-relaxed pl-5">{value}</p>
    </div>
  );
}

export function FindingCard({ finding, index, defaultOpen = false }: FindingCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { t } = useLanguage();

  const confidenceNum = parseInt(finding.confidence_level_percent?.replace("%", "") || "0");
  const confidenceColor =
    confidenceNum >= 80 ? "bg-red-500" : confidenceNum >= 60 ? "bg-orange-500" : "bg-amber-500";

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-all duration-200 hover:border-white/20">
      {/* Card Header — always visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-start gap-4 p-4 sm:p-5 text-left hover:bg-white/5 transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 text-sm font-bold text-slate-300">
          {index + 1}
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <RiskBadge level={finding.risk_level} size="sm" />
            <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-slate-400">
              {finding.classification}
            </span>
          </div>
          <p className="text-sm sm:text-base font-semibold text-white leading-snug">
            {finding.fraud_type}
          </p>
          <p className="text-xs sm:text-sm text-slate-400 line-clamp-2">
            {finding.detected_issue}
          </p>
        </div>

        {/* Confidence + Chevron */}
        <div className="flex flex-shrink-0 flex-col items-end gap-2">
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-16 sm:w-20 rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full rounded-full ${confidenceColor} transition-all`}
                style={{ width: `${confidenceNum}%` }}
              />
            </div>
            <span className="text-xs font-medium text-slate-300">{finding.confidence_level_percent}</span>
          </div>
          <div className="text-slate-500">
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </div>
      </button>

      {/* Expanded Content */}
      {isOpen && (
        <div className="border-t border-white/10 px-4 sm:px-5 py-5 space-y-5">
          <FieldRow
            icon={<AlertTriangle className="h-3.5 w-3.5" />}
            label={t.whySuspicious}
            value={finding.why_suspicious}
          />
          <FieldRow
            icon={<BookOpen className="h-3.5 w-3.5" />}
            label={t.accountingExplanation}
            value={finding.accounting_explanation}
          />
          <FieldRow
            icon={<TrendingUp className="h-3.5 w-3.5" />}
            label={t.historicalComparison}
            value={finding.historical_comparison}
          />
          <FieldRow
            icon={<Scale className="h-3.5 w-3.5" />}
            label={t.materialityAssessment}
            value={finding.materiality_assessment}
          />
          <FieldRow
            icon={<FileWarning className="h-3.5 w-3.5" />}
            label={t.fsImpact}
            value={finding.financial_statement_impact}
          />
          <FieldRow
            icon={<Wrench className="h-3.5 w-3.5" />}
            label={t.recommendedCorrection}
            value={finding.recommended_correction}
          />
          <FieldRow
            icon={<Search className="h-3.5 w-3.5" />}
            label={t.auditProcedure}
            value={finding.suggested_audit_procedure}
          />

          {/* Confidence Reasoning */}
          {finding.confidence_reasoning && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
                <MessageSquare className="h-3.5 w-3.5" />
                {t.confidenceReasoning}
              </div>
              <p className="text-sm text-amber-200/80 leading-relaxed pl-5">
                {finding.confidence_reasoning}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
