"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Shield, Eye, EyeOff, Loader2, Mail, Lock,
  AlertCircle, CheckCircle2, ArrowRight, Sparkles,
} from "lucide-react";

/* ─── Google SVG ────────────────────────────────────────────────────────────── */
function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

/* ─── Input component ────────────────────────────────────────────────────────── */
function InputField({
  id, label, type, value, onChange, placeholder, icon, rightSlot, autoComplete,
}: {
  id: string; label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
  icon?: React.ReactNode; rightSlot?: React.ReactNode; autoComplete?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-slate-300">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-500">
            {icon}
          </div>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full rounded-xl border border-white/10 bg-white/5 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-amber-500/50 focus:bg-white/8 focus:ring-1 focus:ring-amber-500/30 pl-10 pr-4"
        />
        {rightSlot && (
          <div className="absolute inset-y-0 right-3 flex items-center">{rightSlot}</div>
        )}
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────────── */
export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email: email.toLowerCase().trim(),
      password,
      redirect: false,
    });

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSuccess(true);
      router.push(callbackUrl);
      router.refresh();
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl });
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
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-2xl shadow-amber-500/40 animate-float">
              <Shield className="h-8 w-8 text-white" strokeWidth={2.5} />
              <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 opacity-30 blur animate-pulse-glow" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white text-glow">
              Bi<span className="text-amber-400">Fraud</span>
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Platform Deteksi Fraud Keuangan Berbasis AI
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">
            <Sparkles className="h-3 w-3" />
            Powered by GPT-4o
          </div>
        </div>

        {/* ── Sign-In Card ──────────────────────────────────────────── */}
        <div className="glass rounded-3xl p-7 sm:p-8 space-y-6 shadow-2xl shadow-black/40">

          <div>
            <h2 className="text-xl font-bold text-white">Masuk ke Akun</h2>
            <p className="text-sm text-slate-400 mt-1">
              Selamat datang kembali — masukkan kredensial Anda
            </p>
          </div>

          {/* ── Google OAuth ─────────────────────────────────────────── */}
          <button
            id="google-signin-btn"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 active:scale-[0.98] transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {googleLoading
              ? <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
              : <GoogleIcon size={18} />
            }
            Masuk dengan Google
          </button>

          {/* ── Divider ──────────────────────────────────────────────── */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#0d1424] px-4 text-xs text-slate-500">atau masuk dengan email</span>
            </div>
          </div>

          {/* ── Error Banner ─────────────────────────────────────────── */}
          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 animate-in fade-in slide-in-from-top-2 duration-200">
              <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* ── Success Banner ────────────────────────────────────────── */}
          {success && (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              <p className="text-sm text-emerald-300">Login berhasil! Mengalihkan…</p>
            </div>
          )}

          {/* ── Credentials Form ─────────────────────────────────────── */}
          <form onSubmit={handleCredentialsSignIn} className="space-y-4">
            <InputField
              id="signin-email"
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="bisnis@email.com"
              icon={<Mail className="h-4 w-4" />}
              autoComplete="email"
            />
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="signin-password" className="block text-sm font-medium text-slate-300">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
                >
                  Lupa password?
                </Link>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="signin-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-amber-500/50 focus:bg-white/8 focus:ring-1 focus:ring-amber-500/30 pl-10 pr-10"
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
            </div>

            {/* ── Remember Me ───────────────────────────────────────── */}
            <label htmlFor="remember-me" className="flex items-center gap-2.5 cursor-pointer group">
              <div className="relative">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="h-4 w-4 rounded border border-white/20 bg-white/5 peer-checked:bg-amber-500 peer-checked:border-amber-500 transition-all flex items-center justify-center">
                  {rememberMe && (
                    <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors select-none">
                Ingat saya selama 30 hari
              </span>
            </label>

            <button
              id="credentials-signin-btn"
              type="submit"
              disabled={loading || !email || !password || success}
              className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:from-amber-400 hover:to-orange-400 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              {loading ? "Memproses…" : "Masuk Sekarang"}
            </button>
          </form>

          {/* ── Register Link ────────────────────────────────────────── */}
          <p className="text-center text-sm text-slate-400">
            Belum punya akun?{" "}
            <Link href="/auth/register" className="font-semibold text-amber-400 hover:text-amber-300 transition-colors">
              Daftar Gratis
            </Link>
          </p>
        </div>

        {/* ── Footer ───────────────────────────────────────────────── */}
        <p className="text-center text-xs text-slate-600">
          © 2025 BiFraud · AI Financial Fraud Detection Platform
        </p>
      </div>
    </div>
  );
}
