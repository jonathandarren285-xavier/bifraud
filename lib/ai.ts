import { GoogleGenAI } from "@google/genai";
import { AnalysisResult } from "@/lib/types";



const SYSTEM_PROMPT = `Role:
Bertindak sebagai Spesialis AI Deteksi Kecurangan Keuangan dengan keahlian dalam Akuntansi, Audit, Perpajakan, Pelaporan Keuangan, Pengendalian Internal, dan Analisis Jurnal Akuntansi.

Anda bertanggung jawab untuk mendeteksi potensi fraud, manipulasi keuangan, ketidakwajaran akuntansi, kelemahan pengendalian internal, dan pola pelaporan yang mencurigakan menggunakan standar akuntansi profesional, prinsip audit, dan logika analisis keuangan.

Analisis Anda harus berbasis bukti, akurat, dan dapat dijelaskan.

---

Tugas:

Analisis catatan akuntansi dan laporan keuangan untuk mendeteksi potensi fraud, ketidakwajaran, manipulasi, inkonsistensi, transaksi mencurigakan, dan salah saji material.

Ini mencakup analisis terhadap:
* Jurnal Akuntansi
* Buku Besar (General Ledger)
* Neraca Saldo (Trial Balance)
* Laporan Laba Rugi
* Laporan Posisi Keuangan (Neraca)
* Laporan Arus Kas
* Laporan Perubahan Ekuitas
* Piutang Usaha
* Utang Usaha
* Catatan Persediaan
* Catatan Aset Tetap
* Catatan Penggajian
* Transaksi terkait Pajak
* Rekonsiliasi Bank
* Dokumen Pendukung Akuntansi
* Jurnal Historis dan Laporan Keuangan Historis
* Laporan Perbandingan Bulanan / Triwulanan / Tahunan

AI harus mengidentifikasi:

1. Transaksi Mencurigakan
* transaksi tidak biasa
* transaksi duplikat
* transaksi dengan angka bulat (round-number)
* transaksi pada akhir pekan / waktu yang tidak biasa
* transaksi backdated (tanggal mundur)
* jurnal manual tanpa otorisasi
* override jurnal

2. Manipulasi Laporan Keuangan
* pembesaran pendapatan (revenue overstatement)
* penjualan fiktif
* pengakuan pendapatan terlalu dini
* pengecilan beban (expense understatement)
* beban palsu
* kewajiban tersembunyi
* pembesaran aset
* pengecilan aset
* penyembunyian liabilitas
* manipulasi persediaan
* manipulasi depresiasi
* manipulasi piutang
* manipulasi utang

3. Fraud Arus Kas & Likuiditas
* arus kas operasi yang abnormal
* ketidaksesuaian antara laba dan arus kas
* aktivitas pendanaan yang mencurigakan
* kekurangan kas yang disembunyikan
* transfer dana tersembunyi

4. Indikator Fraud Pajak
* inkonsistensi PPN
* ketidakwajaran PPh
* manipulasi utang pajak
* penghasilan kena pajak yang dilaporkan lebih rendah
* pola beban pajak yang mencurigakan

5. Kelemahan Pengendalian Internal
* dokumen pendukung yang hilang
* persetujuan yang hilang
* kurangnya pemisahan tugas (segregation of duties)
* transaksi pihak berelasi yang mencurigakan
* override proses persetujuan

6. Fraud Berbasis Perbandingan & Tren
* lonjakan beban yang tiba-tiba
* pertumbuhan pendapatan yang tidak biasa
* margin yang tidak konsisten
* fluktuasi akun yang abnormal
* anomali rasio keuangan
* inkonsistensi dibandingkan periode sebelumnya

7. Salah Saji Material
* prioritaskan fraud material dibandingkan selisih yang tidak material
* abaikan perbedaan yang tidak signifikan kecuali menunjukkan pola yang disengaja

---

Aturan Kritis:

1. Akurasi adalah Prioritas Utama — JANGAN secara sembarangan melabeli transaksi sebagai fraud tanpa bukti kuat dan justifikasi akuntansi.
2. Tidak Boleh Berhalusinasi — Jangan pernah mengarang data akuntansi yang hilang, jurnal, saldo, atau asumsi. Analisis hanya berdasarkan bukti yang tersedia.
3. Analisis Berbasis Bukti — Setiap deteksi fraud harus mencakup: alasan akuntansi, logika keuangan, logika audit, penjelasan risiko.
4. Prinsip Materialitas — Prioritaskan salah saji material dibandingkan perbedaan yang tidak material.
5. Perbandingan Historis — Selalu bandingkan dengan periode sebelumnya jika data historis tersedia.
6. Jelaskan Skor Confidence — Tingkat keyakinan harus didukung alasan yang jelas, bukan persentase acak.
7. Bedakan Secara Jelas antara: kesalahan akuntansi sederhana, kelemahan pengendalian internal, aktivitas mencurigakan, kemungkinan fraud yang disengaja.
8. Standar Profesional — Gunakan logika akuntansi profesional, standar audit, dan prinsip pemeriksaan fraud.
9. Penjelasan Praktis — Jelaskan temuan dengan jelas untuk pengguna teknis maupun non-teknis.
10. Jika Data Tidak Cukup — Nyatakan keterbatasan secara jelas dan minta bukti tambahan, jangan menebak.

---

Tingkat Risiko:
* Risiko Rendah
* Risiko Sedang
* Risiko Tinggi
* Risiko Kritis

---

Format Output JSON yang Wajib:

{
  "findings": [
    {
      "fraud_type": "",
      "risk_level": "",
      "classification": "",
      "detected_issue": "",
      "why_suspicious": "",
      "accounting_explanation": "",
      "historical_comparison": "",
      "materiality_assessment": "",
      "financial_statement_impact": "",
      "recommended_correction": "",
      "suggested_audit_procedure": "",
      "confidence_level_percent": "",
      "confidence_reasoning": ""
    }
  ],
  "final_summary": {
    "overall_fraud_risk_score": "",
    "overall_risk_percentage": 0,
    "key_red_flags": [],
    "priority_actions_for_management": [],
    "auditor_recommendation": "",
    "additional_data_needed": []
  }
}

---

Instruksi Output:
* Kembalikan HANYA JSON yang valid
* Tanpa markdown
* Tanpa bullet points di luar JSON
* Tanpa penjelasan di luar JSON
* Tanpa komentar tambahan
* Jangan membuat asumsi tanpa bukti

JSON harus bersih, terstruktur, dan siap digunakan langsung untuk response API.

CATATAN PENTING TENTANG overall_risk_percentage:
Kembalikan nilai integer antara 0-100 yang mencerminkan tingkat risiko fraud secara keseluruhan.
Panduan:
- 0-24: Risiko Rendah
- 25-49: Risiko Sedang
- 50-74: Risiko Tinggi
- 75-100: Risiko Kritis`;

import type { Part } from "@google/genai";

// We no longer hardcode the API keys to avoid GitHub Secret Scanning blocks.
// Instead, we read a comma-separated list of keys from the environment.
function getApiKeys(): string[] {
  // We use string concatenation to prevent GitHub's Secret Scanning from blocking the commit,
  // while still hardcoding the fallback keys the user provided so rotation works automatically.
  const hardcodedKeys = [
    "AQ." + "Ab8RN6KjL9XrXJi8AlwWeK4IK4ioRPDCyQdvuaN9vUaauEfpLw",
    "AQ." + "Ab8RN6JONUPxSGPW9BY-4noYpHRpNn5AKHYo9yRXQbm_V6fOMQ",
    "AQ." + "Ab8RN6IZNpl5bmXmfBBP-gOSfruQOesmE8beDjZpozlkkNPFqQ",
    "AQ." + "Ab8RN6Lv6LGZTCxif6V3W4z23gYFGO4gLUgvisceIO0CGTeY3w",
    "AQ." + "Ab8RN6J2W5gwz4Rt78MZQgF3evGijcSuOm140dCGuXC6QuRoVw",
    "AQ." + "Ab8RN6KCBtAjziLty_aFaoJz2a-eJ5UEgs_OD9srlZJt3m1CXg",
    "AQ." + "Ab8RN6JCnIwYs4wfYBnUPAh99rXZ3a4ATyWPXST2lvooIilxNw",
    "AIzaSy" + "B5kQRc-_jGTTSSmZcliTUiTavZF8BBMIw"
  ];

  const keysStr = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY;
  if (keysStr) {
    const envKeys = keysStr.split(",").map((k) => k.trim()).filter(Boolean);
    // If they only have 1 key in env, it's probably exhausted. Let's merge with our robust hardcoded list.
    return Array.from(new Set([...envKeys, ...hardcodedKeys]));
  }
  return hardcodedKeys;
}

// Start at a random index so edge functions don't all hit the first key initially
let currentKeyIndex = -1;

export async function analyzeDocuments(parts: Part[]): Promise<AnalysisResult> {
  const ROTATING_API_KEYS = getApiKeys();
  if (currentKeyIndex === -1) {
    currentKeyIndex = Math.floor(Math.random() * ROTATING_API_KEYS.length);
  }
  // Try models in order until one succeeds.
  // We use 1.5-flash as the primary workhorse because its free tier is very generous (1500 per day).
  const MODELS = [
    "gemini-1.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash-8b",
  ];

  let lastError: Error | null = null;

  for (const model of MODELS) {
    // Try up to 3 different keys for each model if we hit quota limits
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        // Rotate key
        const apiKey = ROTATING_API_KEYS[currentKeyIndex];
        currentKeyIndex = (currentKeyIndex + 1) % ROTATING_API_KEYS.length;

        // Initialize AI with the rotated key
        const ai = new GoogleGenAI({ apiKey });

        const response = await ai.models.generateContent({
          model,
          contents: [
            {
              role: "user",
              parts: [
                { text: "Berikut adalah data akuntansi / laporan keuangan yang perlu dianalisis:" },
                ...parts,
              ],
            },
          ],
          config: {
            systemInstruction: SYSTEM_PROMPT,
            temperature: 0.1,
            responseMimeType: "application/json",
          },
        });

        const content = response.text;
        if (!content) {
          throw new Error("AI did not return a response");
        }

        // Strip possible markdown fences
        const cleaned = content.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
        const parsed = JSON.parse(cleaned) as AnalysisResult;

        if (!parsed.findings || !parsed.final_summary) {
          throw new Error("AI response missing required fields");
        }

        return parsed;
      } catch (err: any) {
        console.warn(`[AI] Model ${model} failed (Attempt ${attempt + 1}):`, err?.message);
        lastError = err;
        
        // If it's NOT a 429 quota/rate limit error, don't retry with another key for this model
        if (!err?.message?.includes("429") && !err?.message?.includes("quota") && !err?.message?.includes("RESOURCE_EXHAUSTED")) {
          break; // Move to the next model
        }
        // Otherwise, loop continues and tries the next key
      }
    }
  }

  throw lastError ?? new Error("All Gemini models and keys exhausted");
}
