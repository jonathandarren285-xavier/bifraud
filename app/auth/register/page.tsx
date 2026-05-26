"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import {
  Shield, Eye, EyeOff, Loader2, Mail, Lock,
  User, Building2, AlertCircle, CheckCircle2,
  Phone, MapPin, Briefcase, ArrowRight, ArrowLeft, Sparkles,
} from "lucide-react";

/* ─── Google icon ──────────────────────────────────────────────────────────── */
function GoogleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

/* ─── Input Field ──────────────────────────────────────────────────────────── */
function InputField({
  id, label, type = "text", value, onChange, placeholder, icon,
  rightSlot, required = true, autoComplete, hint,
}: {
  id: string; label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
  icon?: React.ReactNode; rightSlot?: React.ReactNode;
  required?: boolean; autoComplete?: string; hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-slate-300">
        {label} {required && <span className="text-amber-400">*</span>}
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
          required={required}
          autoComplete={autoComplete}
          className="w-full rounded-xl border border-white/10 bg-white/5 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 pl-10 pr-4"
        />
        {rightSlot && (
          <div className="absolute inset-y-0 right-3 flex items-center">{rightSlot}</div>
        )}
      </div>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

/* ─── Password Strength ────────────────────────────────────────────────────── */
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

/* ─── Step Indicator ────────────────────────────────────────────────────────── */
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i < current ? "bg-amber-400 w-6" : i === current ? "bg-amber-500 w-8" : "bg-white/10 w-4"
          }`}
        />
      ))}
      <span className="ml-1 text-xs text-slate-500">
        Langkah {current + 1} dari {total}
      </span>
    </div>
  );
}

/* ─── Industry options ──────────────────────────────────────────────────────── */
const INDUSTRIES = [
  "Perbankan & Keuangan", "Akuntan & Audit", "Manufaktur", "Perdagangan & Retail",
  "Properti & Konstruksi", "Teknologi & IT", "Kesehatan & Farmasi",
  "Pendidikan", "Transportasi & Logistik", "Energi & Pertambangan",
  "Pemerintahan & BUMN", "Konsultan", "Lainnya",
];

/* ─── Main Register Page ────────────────────────────────────────────────────── */
export default function RegisterPage() {
  const [step, setStep] = useState(0); // 0 = personal, 1 = company, 2 = security
  const TOTAL_STEPS = 3;

  // Step 0 — Personal
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Step 1 — Company
  const [companyName, setCompanyName] = useState("");
  const [companyIndustry, setCompanyIndustry] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");

  // Step 2 — Security
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreePolicy, setAgreePolicy] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  /* ── Validation per step ────────────────────────────────────── */
  const step0Valid = name.trim().length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const step1Valid = companyName.trim().length >= 2 && companyIndustry !== "";
  const step2Valid =
    password.length >= 8 && password === confirmPassword && agreePolicy;

  const handleNext = () => {
    setError("");
    if (step === 0 && !step0Valid) {
      setError("Nama lengkap minimal 2 karakter dan email harus valid.");
      return;
    }
    if (step === 1 && !step1Valid) {
      setError("Nama perusahaan dan industri wajib diisi.");
      return;
    }
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  };

  /* ── Submit ─────────────────────────────────────────────────── */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok.");
      return;
    }
    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }
    if (!agreePolicy) {
      setError("Anda harus menyetujui Kebijakan Privasi untuk melanjutkan.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          phoneNumber: phone,
          companyName,
          companyIndustry,
          companyAddress,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Pendaftaran gagal. Silakan coba lagi.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      // Auto sign-in after register
      setTimeout(async () => {
        await signIn("credentials", { email, password, callbackUrl: "/" });
      }, 1500);
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="gradient-bg min-h-screen flex items-center justify-center px-4 py-12">

      {/* Decorative blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-amber-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-orange-500/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md space-y-7">

        {/* ── Branding ──────────────────────────────────────────── */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-2xl shadow-amber-500/40">
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
                Buat Akun Gratis
              </span>
            </div>
          </div>
        </div>

        {/* ── Card ─────────────────────────────────────────────── */}
        <div className="glass rounded-3xl p-7 sm:p-8 space-y-6 shadow-2xl shadow-black/40">

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">Daftar Akun</h2>
            <StepIndicator current={step} total={TOTAL_STEPS} />
          </div>

          {/* ── Google OAuth ─────────────────────────────────────── */}
          {step === 0 && (
            <>
              <button
                id="google-register-btn"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 active:scale-[0.98] transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {googleLoading
                  ? <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                  : <GoogleIcon />
                }
                Daftar dengan Google
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-[#0d1424] px-4 text-xs text-slate-500">atau isi form di bawah</span>
                </div>
              </div>
            </>
          )}

          {/* ── Error / Success ───────────────────────────────────── */}
          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5">
              <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-emerald-300">Akun berhasil dibuat!</p>
                <p className="text-xs text-emerald-400/70">Mengalihkan ke dashboard…</p>
              </div>
            </div>
          )}

          {!success && (
            <form onSubmit={step === TOTAL_STEPS - 1 ? handleRegister : (e) => { e.preventDefault(); handleNext(); }}>

              {/* ─── STEP 0: Personal Info ─────────────────────────── */}
              {step === 0 && (
                <div className="space-y-4">
                  <InputField
                    id="reg-name"
                    label="Nama Lengkap"
                    value={name}
                    onChange={setName}
                    placeholder="John Doe"
                    icon={<User className="h-4 w-4" />}
                    autoComplete="name"
                  />
                  <InputField
                    id="reg-email"
                    label="Email Bisnis"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="bisnis@email.com"
                    icon={<Mail className="h-4 w-4" />}
                    autoComplete="email"
                  />
                  <InputField
                    id="reg-phone"
                    label="Nomor Telepon"
                    type="tel"
                    value={phone}
                    onChange={setPhone}
                    placeholder="+62 812 3456 7890"
                    icon={<Phone className="h-4 w-4" />}
                    autoComplete="tel"
                    required={false}
                  />
                </div>
              )}

              {/* ─── STEP 1: Company Info ──────────────────────────── */}
              {step === 1 && (
                <div className="space-y-4">
                  <InputField
                    id="reg-company"
                    label="Nama Perusahaan"
                    value={companyName}
                    onChange={setCompanyName}
                    placeholder="PT. Contoh Tbk"
                    icon={<Building2 className="h-4 w-4" />}
                  />
                  <div className="space-y-1.5">
                    <label htmlFor="reg-industry" className="block text-sm font-medium text-slate-300">
                      Industri Perusahaan <span className="text-amber-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-500">
                        <Briefcase className="h-4 w-4" />
                      </div>
                      <select
                        id="reg-industry"
                        value={companyIndustry}
                        onChange={(e) => setCompanyIndustry(e.target.value)}
                        required
                        className="w-full rounded-xl border border-white/10 bg-white/5 py-3 text-sm text-white outline-none transition-all focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 pl-10 pr-4 appearance-none"
                      >
                        <option value="" disabled className="bg-[#0d1424]">Pilih industri…</option>
                        {INDUSTRIES.map((ind) => (
                          <option key={ind} value={ind} className="bg-[#0d1424]">{ind}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="reg-address" className="block text-sm font-medium text-slate-300">
                      Alamat Perusahaan
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute top-3.5 left-3.5 text-slate-500">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <textarea
                        id="reg-address"
                        value={companyAddress}
                        onChange={(e) => setCompanyAddress(e.target.value)}
                        placeholder="Jl. Sudirman No. 1, Jakarta Pusat"
                        rows={2}
                        className="w-full rounded-xl border border-white/10 bg-white/5 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 pl-10 pr-4 resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ─── STEP 2: Security ──────────────────────────────── */}
              {step === 2 && (
                <div className="space-y-4">
                  {/* Password */}
                  <div className="space-y-1.5">
                    <label htmlFor="reg-password" className="block text-sm font-medium text-slate-300">
                      Password <span className="text-amber-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-500">
                        <Lock className="h-4 w-4" />
                      </div>
                      <input
                        id="reg-password"
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
                    <label htmlFor="reg-confirm" className="block text-sm font-medium text-slate-300">
                      Konfirmasi Password <span className="text-amber-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-500">
                        <Lock className="h-4 w-4" />
                      </div>
                      <input
                        id="reg-confirm"
                        type={showConfirm ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Ulangi password"
                        required
                        autoComplete="new-password"
                        className={`w-full rounded-xl border bg-white/5 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all focus:ring-1 pl-10 pr-10 ${
                          confirmPassword && confirmPassword !== password
                            ? "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/30"
                            : confirmPassword && confirmPassword === password
                            ? "border-emerald-500/40 focus:border-emerald-500/50 focus:ring-emerald-500/30"
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
                    {confirmPassword && confirmPassword === password && (
                      <p className="text-xs text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Password cocok
                      </p>
                    )}
                  </div>

                  {/* Privacy Policy */}
                  <label htmlFor="reg-policy" className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative mt-0.5 flex-shrink-0">
                      <input
                        id="reg-policy"
                        type="checkbox"
                        checked={agreePolicy}
                        onChange={(e) => setAgreePolicy(e.target.checked)}
                        className="peer sr-only"
                        required
                      />
                      <div className="h-4 w-4 rounded border border-white/20 bg-white/5 peer-checked:bg-amber-500 peer-checked:border-amber-500 transition-all flex items-center justify-center">
                        {agreePolicy && (
                          <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors leading-relaxed select-none">
                      Saya setuju dengan{" "}
                      <Link href="/privacy" className="text-amber-400 hover:text-amber-300 font-medium" target="_blank">
                        Kebijakan Privasi
                      </Link>{" "}
                      dan{" "}
                      <Link href="/terms" className="text-amber-400 hover:text-amber-300 font-medium" target="_blank">
                        Syarat & Ketentuan
                      </Link>{" "}
                      BiFraud
                    </span>
                  </label>
                </div>
              )}

              {/* ── Navigation Buttons ───────────────────────────────── */}
              <div className={`flex gap-3 mt-6 ${step > 0 ? "justify-between" : "justify-end"}`}>
                {step > 0 && (
                  <button
                    type="button"
                    onClick={() => { setError(""); setStep((s) => s - 1); }}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali
                  </button>
                )}

                {step < TOTAL_STEPS - 1 ? (
                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:from-amber-400 hover:to-orange-400 active:scale-[0.98] transition-all"
                  >
                    Lanjutkan
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    id="register-submit-btn"
                    type="submit"
                    disabled={loading || !step2Valid}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:from-amber-400 hover:to-orange-400 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    {loading ? "Mendaftarkan…" : "Buat Akun Sekarang"}
                  </button>
                )}
              </div>
            </form>
          )}

          <p className="text-center text-sm text-slate-400">
            Sudah punya akun?{" "}
            <Link href="/auth/signin" className="font-semibold text-amber-400 hover:text-amber-300 transition-colors">
              Masuk
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-600">
          © 2025 BiFraud · AI Financial Fraud Detection Platform
        </p>
      </div>
    </div>
  );
}
