import * as XLSX from "xlsx";
import type { Part } from "@google/genai";

// ── Types ──────────────────────────────────────────────────────────────────────
export interface ParsedFile {
  name: string;
  parts: Part[]; // One or more Gemini content parts for this file
}

// ── PDF / Image parser — native Gemini inlineData ─────────────────────────────
function parseBinaryAsInlineData(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): ParsedFile {
  const base64 = buffer.toString("base64");
  return {
    name: fileName,
    parts: [
      {
        text: `\n=== DOKUMEN: ${fileName} ===\n`,
      },
      {
        inlineData: {
          mimeType,
          data: base64,
        },
      },
    ],
  };
}

// ── DOCX Parser — extract text via mammoth ────────────────────────────────────
async function parseDocx(buffer: Buffer, fileName: string): Promise<ParsedFile> {
  try {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value?.trim() || "(Dokumen Word kosong atau tidak dapat dibaca)";
    return {
      name: fileName,
      parts: [{ text: `\n=== DOKUMEN: ${fileName} ===\n${text}` }],
    };
  } catch {
    return {
      name: fileName,
      parts: [{ text: `\n=== DOKUMEN: ${fileName} ===\n(Gagal memproses file DOCX)` }],
    };
  }
}

// ── Excel Parser ───────────────────────────────────────────────────────────────
function parseExcel(buffer: Buffer, fileName: string): ParsedFile {
  try {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheets: string[] = [];

    workbook.SheetNames.forEach((sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      // Use sheet_to_json for richer data extraction, then format as readable text
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" }) as Record<string, unknown>[];
      const csvData = XLSX.utils.sheet_to_csv(worksheet);
      if (csvData.trim()) {
        // Include both CSV (for structure) and a note about row count
        sheets.push(`--- Sheet: ${sheetName} (${jsonData.length} baris data) ---\n${csvData}`);
      }
    });

    const content = sheets.join("\n\n") || "(File Excel kosong)";
    return {
      name: fileName,
      parts: [{ text: `\n=== DOKUMEN: ${fileName} ===\n${content}` }],
    };
  } catch {
    return {
      name: fileName,
      parts: [{ text: `\n=== DOKUMEN: ${fileName} ===\n(Gagal memproses file Excel)` }],
    };
  }
}

// ── CSV / Plain Text Parsers ───────────────────────────────────────────────────
function parsePlainText(buffer: Buffer, fileName: string): ParsedFile {
  const content = buffer.toString("utf-8");
  return {
    name: fileName,
    parts: [{ text: `\n=== DOKUMEN: ${fileName} ===\n${content}` }],
  };
}

// ── Main Dispatcher ────────────────────────────────────────────────────────────
export async function parseFile(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<ParsedFile> {
  const ext = fileName.toLowerCase().split(".").pop();

  // PDF — send as native inline data so Gemini can read tables, scanned text, etc.
  if (ext === "pdf" || mimeType === "application/pdf") {
    return parseBinaryAsInlineData(buffer, fileName, "application/pdf");
  }

  // Images — send as native inline data so Gemini Vision can read them
  if (ext === "jpg" || ext === "jpeg" || mimeType === "image/jpeg") {
    return parseBinaryAsInlineData(buffer, fileName, "image/jpeg");
  }
  if (ext === "png" || mimeType === "image/png") {
    return parseBinaryAsInlineData(buffer, fileName, "image/png");
  }

  // Word Documents
  if (
    ext === "docx" ||
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return parseDocx(buffer, fileName);
  }

  // Excel
  if (
    ext === "xlsx" ||
    ext === "xls" ||
    mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    mimeType === "application/vnd.ms-excel"
  ) {
    return parseExcel(buffer, fileName);
  }

  // CSV / TXT
  return parsePlainText(buffer, fileName);
}

// ── Combine Multiple Files into array of Parts ────────────────────────────────
export function combineIntoParts(files: ParsedFile[]): Part[] {
  const allParts: Part[] = [];
  for (const file of files) {
    allParts.push(...file.parts);
  }
  return allParts;
}

// Legacy helper for backward compat (no longer used by AI but kept for safety)
export function combineExtractedText(files: ParsedFile[]): string {
  return files
    .map(
      (f) =>
        `========================================\nDOKUMEN: ${f.name}\n========================================\n` +
        f.parts
          .filter((p) => "text" in p)
          .map((p) => (p as { text: string }).text)
          .join("\n")
    )
    .join("\n\n");
}
