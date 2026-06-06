"use client";

import { RiskLevel } from "@/lib/types";

const riskConfig: Record<string, { label: string; bg: string; text: string; border: string; dot: string; bar: string }> = {
  "Risiko Rendah":   { label: "Risiko Rendah",   bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30", dot: "bg-emerald-400", bar: "from-emerald-500 to-emerald-400" },
  "Risiko Sedang":   { label: "Risiko Sedang",   bg: "bg-amber-500/15",   text: "text-amber-400",   border: "border-amber-500/30",   dot: "bg-amber-400",   bar: "from-amber-500 to-amber-400"   },
  "Risiko Tinggi":   { label: "Risiko Tinggi",   bg: "bg-orange-500/15",  text: "text-orange-400",  border: "border-orange-500/30",  dot: "bg-orange-400",  bar: "from-orange-500 to-orange-400"  },
  "Risiko Kritis":   { label: "Risiko Kritis",   bg: "bg-red-500/15",     text: "text-red-400",     border: "border-red-500/30",     dot: "bg-red-400",     bar: "from-red-600 to-red-400"     },
  "Low Risk":        { label: "Low Risk",         bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30", dot: "bg-emerald-400", bar: "from-emerald-500 to-emerald-400" },
  "Medium Risk":     { label: "Medium Risk",      bg: "bg-amber-500/15",   text: "text-amber-400",   border: "border-amber-500/30",   dot: "bg-amber-400",   bar: "from-amber-500 to-amber-400"   },
  "High Risk":       { label: "High Risk",        bg: "bg-orange-500/15",  text: "text-orange-400",  border: "border-orange-500/30",  dot: "bg-orange-400",  bar: "from-orange-500 to-orange-400"  },
  "Critical Risk":   { label: "Critical Risk",    bg: "bg-red-500/15",     text: "text-red-400",     border: "border-red-500/30",     dot: "bg-red-400",     bar: "from-red-600 to-red-400"     },
};

const defaultConfig = {
  label: "Tidak Dapat Ditentukan",
  bg: "bg-slate-500/15",
  text: "text-slate-400",
  border: "border-slate-500/30",
  dot: "bg-slate-400",
  bar: "from-slate-500 to-slate-400",
};

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

// For the overall risk score — larger display with percentage bar
export function RiskScoreDisplay({ score, percentage }: { score: string; percentage?: number }) {
  const isKritis = score.toLowerCase().includes("kritis") || score.toLowerCase().includes("critical");
  const isTinggi = score.toLowerCase().includes("tinggi") || score.toLowerCase().includes("high");
  const isSedang = score.toLowerCase().includes("sedang") || score.toLowerCase().includes("medium");

  const config = isKritis
    ? { gradient: "from-red-600 to-red-500", glow: "shadow-red-500/40", bar: "from-red-600 to-red-400", text: "text-red-300" }
    : isTinggi
    ? { gradient: "from-orange-600 to-orange-500", glow: "shadow-orange-500/40", bar: "from-orange-500 to-orange-400", text: "text-orange-300" }
    : isSedang
    ? { gradient: "from-amber-500 to-amber-400", glow: "shadow-amber-500/40", bar: "from-amber-500 to-amber-400", text: "text-amber-300" }
    : { gradient: "from-emerald-600 to-emerald-500", glow: "shadow-emerald-500/40", bar: "from-emerald-500 to-emerald-400", text: "text-emerald-300" };

  const pct = typeof percentage === "number" ? Math.min(100, Math.max(0, percentage)) : null;

  return (
    <div className="space-y-3">
      {/* Risk Label Badge */}
      <div
        className={`inline-flex items-center rounded-2xl bg-gradient-to-r ${config.gradient} px-5 py-2.5 shadow-lg ${config.glow} shadow-lg`}
      >
        <span className="text-lg sm:text-xl font-bold text-white tracking-wide">{score}</span>
        {pct !== null && (
          <span className="ml-3 rounded-xl bg-white/20 px-2.5 py-0.5 text-base font-extrabold text-white">
            {pct}%
          </span>
        )}
      </div>

      {/* Percentage Progress Bar */}
      {pct !== null && (
        <div className="w-full max-w-xs">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-slate-500 font-medium">Skor Risiko Fraud</span>
            <span className={`text-xs font-bold ${config.text}`}>{pct} / 100</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${config.bar} transition-all duration-700`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
