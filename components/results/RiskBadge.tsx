"use client";

import { RiskLevel } from "@/lib/types";

const riskConfig: Record<string, { label: string; bg: string; text: string; border: string; dot: string }> = {
  "Risiko Rendah":   { label: "Risiko Rendah",   bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30", dot: "bg-emerald-400" },
  "Risiko Sedang":   { label: "Risiko Sedang",   bg: "bg-amber-500/15",   text: "text-amber-400",   border: "border-amber-500/30",   dot: "bg-amber-400"   },
  "Risiko Tinggi":   { label: "Risiko Tinggi",   bg: "bg-orange-500/15",  text: "text-orange-400",  border: "border-orange-500/30",  dot: "bg-orange-400"  },
  "Risiko Kritis":   { label: "Risiko Kritis",   bg: "bg-red-500/15",     text: "text-red-400",     border: "border-red-500/30",     dot: "bg-red-400"     },
  "Low Risk":        { label: "Low Risk",         bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30", dot: "bg-emerald-400" },
  "Medium Risk":     { label: "Medium Risk",      bg: "bg-amber-500/15",   text: "text-amber-400",   border: "border-amber-500/30",   dot: "bg-amber-400"   },
  "High Risk":       { label: "High Risk",        bg: "bg-orange-500/15",  text: "text-orange-400",  border: "border-orange-500/30",  dot: "bg-orange-400"  },
  "Critical Risk":   { label: "Critical Risk",    bg: "bg-red-500/15",     text: "text-red-400",     border: "border-red-500/30",     dot: "bg-red-400"     },
};

const defaultConfig = { label: "Unknown", bg: "bg-slate-500/15", text: "text-slate-400", border: "border-slate-500/30", dot: "bg-slate-400" };

interface RiskBadgeProps {
  level: string;
  size?: "sm" | "md" | "lg";
}

export function RiskBadge({ level, size = "md" }: RiskBadgeProps) {
  const config = riskConfig[level] || defaultConfig;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
    lg: "px-3 py-1.5 text-sm gap-2",
  };

  const dotSizes = { sm: "h-1.5 w-1.5", md: "h-2 w-2", lg: "h-2.5 w-2.5" };

  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold tracking-wide ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]}`}
    >
      <span className={`rounded-full ${config.dot} ${dotSizes[size]} flex-shrink-0`} />
      {config.label}
    </span>
  );
}

// For the overall risk score — larger display
export function RiskScoreDisplay({ score }: { score: string }) {
  const isKritis = score.toLowerCase().includes("kritis") || score.toLowerCase().includes("critical");
  const isTinggi = score.toLowerCase().includes("tinggi") || score.toLowerCase().includes("high");
  const isSedang = score.toLowerCase().includes("sedang") || score.toLowerCase().includes("medium");

  const color = isKritis
    ? "from-red-500 to-red-600"
    : isTinggi
    ? "from-orange-500 to-orange-600"
    : isSedang
    ? "from-amber-500 to-amber-600"
    : "from-emerald-500 to-emerald-600";

  const glow = isKritis
    ? "shadow-red-500/40"
    : isTinggi
    ? "shadow-orange-500/40"
    : isSedang
    ? "shadow-amber-500/40"
    : "shadow-emerald-500/40";

  return (
    <div
      className={`inline-flex items-center rounded-2xl bg-gradient-to-r ${color} px-5 py-2.5 shadow-lg ${glow} shadow-lg`}
    >
      <span className="text-lg sm:text-xl font-bold text-white tracking-wide">{score}</span>
    </div>
  );
}
