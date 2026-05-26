import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BiFraud — Deteksi Fraud Keuangan Berbasis AI",
  description:
    "Platform deteksi fraud keuangan berbasis AI. Unggah jurnal akuntansi dan laporan keuangan untuk analisis otomatis oleh GPT-4o.",
  keywords: ["fraud detection", "deteksi fraud", "akuntansi", "audit", "AI", "keuangan"],
  authors: [{ name: "BiFraud Team" }],
  openGraph: {
    title: "BiFraud — AI Financial Fraud Detection",
    description: "AI-powered financial fraud detection for accounting documents",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-[#0A0F1E] font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
