"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Shield, History, LogOut, Menu, X, Globe } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();
  const { t, locale, toggleLocale } = useLanguage();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/", label: t.navHome },
    { href: "/history", label: t.navHistory },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0A0F1E]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30 transition-transform group-hover:scale-110">
            <Shield className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            Bi<span className="text-amber-400">Fraud</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                pathname === link.href
                  ? "bg-amber-500/20 text-amber-400"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Right */}
        <div className="hidden md:flex items-center gap-3">
          {/* Language Toggle */}
          <button
            onClick={toggleLocale}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all"
            aria-label="Toggle language"
          >
            <Globe className="h-3.5 w-3.5" />
            {locale === "id" ? "EN" : "ID"}
          </button>

          {/* User Menu */}
          {session?.user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5">
                {session.user.image && (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="h-8 w-8 rounded-full ring-2 ring-amber-500/30"
                  />
                )}
                <div className="hidden lg:block">
                  <p className="text-sm font-medium text-white leading-none">
                    {session.user.name}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{session.user.email}</p>
                </div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t.signOut}</span>
              </button>
            </div>
          ) : (
            <Link
              href="/auth/signin"
              className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-sm font-semibold text-amber-400 hover:bg-amber-500/20 hover:text-amber-300 transition-all"
            >
              {t.signIn}
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-all"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0A0F1E]/95 backdrop-blur-xl px-4 py-4 space-y-2">
          {session?.user && (
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
              {session.user.image && (
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="h-10 w-10 rounded-full ring-2 ring-amber-500/30"
                />
              )}
              <div>
                <p className="text-sm font-medium text-white">{session.user.name}</p>
                <p className="text-xs text-slate-400">{session.user.email}</p>
              </div>
            </div>
          )}

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                pathname === link.href
                  ? "bg-amber-500/20 text-amber-400"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              {link.href === "/" ? <Shield className="h-4 w-4" /> : <History className="h-4 w-4" />}
              {link.label}
            </Link>
          ))}

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={toggleLocale}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/10 transition-all"
            >
              <Globe className="h-4 w-4" />
              {locale === "id" ? "Switch to English" : "Ganti ke Indonesia"}
            </button>

            {session?.user ? (
              <button
                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 py-2.5 text-sm text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-all"
              >
                <LogOut className="h-4 w-4" />
                {t.signOut}
              </button>
            ) : (
              <Link
                href="/auth/signin"
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 py-2.5 text-sm font-semibold text-amber-400 hover:bg-amber-500/20 hover:text-amber-300 transition-all"
                onClick={() => setMobileOpen(false)}
              >
                {t.signIn}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
