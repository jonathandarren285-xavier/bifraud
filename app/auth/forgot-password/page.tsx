"use client";

import { useState } from "react";
import Link from "next/link";
import { Shield, Mail, ArrowLeft, Loader2, AlertCircle, CheckCircle2, Sparkles } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Terjadi kesalahan. Silakan coba lagi.");
        setLoading(false);
        return;
      }

      setSent(true);
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gradient-bg min-h-screen flex items-center justify-center px-4 py-12">

      {/* Decorative blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-amber-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-orange-500/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md space-y-7">

        {/* ── Branding ─────────────────────────────────────────────── */}
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

        {/* ── Card ─────────────────────────────────────────────────── */}
        <div className="glass rounded-3xl p-7 sm:p-8 space-y-6 shadow-2xl shadow-black/40">

          {!sent ? (
            <>
              <div>
                <h2 className="text-xl font-bold text-white">Lupa Password?</h2>
                <p className="text-sm text-slate-400 mt-1">
                  Masukkan email Anda dan kami akan mengirim link reset password.
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5">
                  <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label htmlFor="forgot-email" className="block text-sm font-medium text-slate-300">
                    Email Terdaftar
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-500">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      id="forgot-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="bisnis@email.com"
                      required
                      autoComplete="email"
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 pl-10 pr-4"
                    />
                  </div>
                </div>

                <button
                  id="forgot-password-btn"
                  type="submit"
                  disabled={loading || !email}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:from-amber-400 hover:to-orange-400 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                  {loading ? "Mengirim…" : "Kirim Link Reset"}
                </button>
              </form>
            </>
          ) : (
            /* ── Success State ─────────────────────────────────────── */
            <div className="text-center space-y-5 py-4">
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-500/30">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Email Terkirim!</h2>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                  Kami telah mengirim link reset password ke{" "}
                  <span className="text-amber-400 font-medium">{email}</span>.
                  Periksa inbox (dan folder spam) Anda.
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-left space-y-2">
                <p className="text-xs font-semibold text-slate-300">Langkah selanjutnya:</p>
                {[
                  "Buka email dari BiFraud",
                  "Klik link 'Reset Password'",
                  "Masukkan password baru",
                  "Login dengan password baru",
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-xs font-bold text-amber-400">
                      {i + 1}
                    </div>
                    <p className="text-xs text-slate-400">{step}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => { setSent(false); setEmail(""); }}
                className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
              >
                Kirim ulang ke email lain
              </button>
            </div>
          )}

          <div className="flex items-center justify-center">
            <Link
              href="/auth/signin"
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke halaman login
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
