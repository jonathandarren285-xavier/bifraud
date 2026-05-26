"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { locales, Locale, LocaleStrings } from "@/lib/locales";

type AnyLocaleStrings = typeof locales.id | typeof locales.en;

interface LanguageContextType {
  locale: Locale;
  t: AnyLocaleStrings;
  toggleLocale: () => void;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: "id",
  t: locales.id,
  toggleLocale: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("id");

  useEffect(() => {
    const stored = localStorage.getItem("bifraud-locale") as Locale | null;
    if (stored && (stored === "id" || stored === "en")) {
      setLocale(stored);
    }
  }, []);

  const toggleLocale = () => {
    const next = locale === "id" ? "en" : "id";
    setLocale(next);
    localStorage.setItem("bifraud-locale", next);
  };

  return (
    <LanguageContext.Provider value={{ locale, t: locales[locale], toggleLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
