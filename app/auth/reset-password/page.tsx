"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Shield, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, XCircle, Sparkles,
} from "lucide-react";

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "Min. 8 karakter", ok: password.length >= 8 },
    { label: "Huruf besar", ok: /[A-Z]/.test(password) },
    { label: "Angka", ok: /[0-9]/.test(password) },
    { label: "Simbol", ok: /[^a-zA-Z0-9]/.test(password) },
  ];
  if (!password) return null;
  const score = checks.filter((c) => c.ok).length;
  const barColor =
    score <= 1 ? "bg-red-500" : score === 2 ? "bg-orange-400" : score === 3 ? "bg-amber-400" : "bg-emerald-400";
  return (
    <div className="space-y-2 mt-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < score ? barColor : "bg-white/10"}`} />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {checks.map((c) => (
          <div key={c.label} className="flex items-center gap-1">
            <div className={`h-1.5 w-1.5 rounded-full ${c.ok ? "bg-emerald-400" : "bg-slate-600"}`} />
            <span className={`text-xs ${c.ok ? "text-emerald-400" : "text-slate-500"}`}>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setValidating(false);
      setTokenValid(false);
      return;
    }
    fetch(`/api/auth/reset-password?token=${token}`)
      .then((r) => r.json())
      .then((d) => { setTokenValid(d.valid); })
      .catch(() => setTokenValid(false))
      .finally(() => setValidating(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Password tidak cocok.");
      return;
    }
    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal mereset password.");
        setLoading(false);
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/auth/signin"), 3000);
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
      setLoading(false);
    }
  };

  return (
    <div className="gradient-bg min-h-screen flex items-center justify-center px-4 py-12">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-amber-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-orange-500/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md space-y-7">
        {/* ── Branding ─────────────────────────────────────────── */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-2xl shadow-amber-500/40 animate-float">
              <Shield className="h-7 w-7 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white text-glow">
              Bi<span className="text-amber-400">Fraud</span>
            </h1>
            <div className="flex justify-center mt-1">
              <span className="inline-flex items-center gap-1 text-xs text-amber-400 border border-amber-500/20 bg-amber-500/10 rounded-full px-2.5 py-0.5">
                <Sparkles className="h-3 w-3" />
                Reset Password
              </span>
            </div>
          </div>
        </div>

        {/* ── Card ─────────────────────────────────────────────── */}
        <div className="glass rounded-3xl p-7 sm:p-8 space-y-6 shadow-2xl shadow-black/40">

          {/* Loading state */}
          {validating && (
            <div className="text-center py-8 space-y-4">
              <Loader2 className="h-8 w-8 text-amber-400 animate-spin mx-auto" />
              <p className="text-sm text-slate-400">Memvalidasi token…</p>
            </div>
          )}

          {/* Invalid / Expired token */}
          {!validating && !tokenValid && (
            <div className="text-center space-y-5 py-4">
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/20 border border-red-500/30">
                  <XCircle className="h-8 w-8 text-red-400" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Link Tidak Valid</h2>
                <p className="text-sm text-slate-400 mt-2">
                  Link reset password sudah kedaluwarsa atau tidak valid.
                  Silakan minta link baru.
                </p>
              </div>
              <Link
                href="/auth/forgot-password"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/30 hover:from-amber-400 hover:to-orange-400 transition-all"
              >
                Minta Link Baru
              </Link>
            </div>
          )}

          {/* Success state */}
          {!validating && success && (
            <div className="text-center space-y-5 py-4">
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-500/30">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Password Berhasil Diubah!</h2>
                <p className="text-sm text-slate-400 mt-2">
                  Password Anda telah diperbarui. Mengalihkan ke halaman login…
                </p>
              </div>
              <Loader2 className="h-5 w-5 text-amber-400 animate-spin mx-auto" />
            </div>
          )}

          {/* Reset form */}
          {!validating && tokenValid && !success && (
            <>
              <div>
                <h2 className="text-xl font-bold text-white">Buat Password Baru</h2>
                <p className="text-sm text-slate-400 mt-1">
                  Masukkan password baru untuk akun Anda.
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5">
                  <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* New Password */}
                <div className="space-y-1.5">
                  <label htmlFor="new-password" className="block text-sm font-medium text-slate-300">
                    Password Baru <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-500">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 karakter"
                      required
                      autoComplete="new-password"
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <PasswordStrength password={password} />
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label htmlFor="confirm-new-password" className="block text-sm font-medium text-slate-300">
                    Konfirmasi Password <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-500">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      id="confirm-new-password"
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ulangi password baru"
                      required
                      autoComplete="new-password"
                      className={`w-full rounded-xl border bg-white/5 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all focus:ring-1 pl-10 pr-10 ${
                        confirmPassword && confirmPassword !== password
                          ? "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/30"
                          : "border-white/10 focus:border-amber-500/50 focus:ring-amber-500/30"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      tabIndex={-1}
                      className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== password && (
                    <p className="text-xs text-red-400">Password tidak cocok</p>
                  )}
                </div>

                <button
                  id="reset-password-btn"
                  type="submit"
                  disabled={loading || !password || !confirmPassword}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:from-amber-400 hover:to-orange-400 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  {loading ? "Menyimpan…" : "Simpan Password Baru"}
                </button>
              </form>
            </>
          )}

          <div className="flex items-center justify-center">
            <Link href="/auth/signin" className="text-sm text-slate-400 hover:text-white transition-colors">
              ← Kembali ke Login
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600">
          © 2025 BiFraud · AI Financial Fraud Detection Platform
        </p>
      </div>
    </div>
  );
}
