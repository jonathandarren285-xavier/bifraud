import * as XLSX from "xlsx";

export interface ParsedFile {
  name: string;
  content: string;
}

// ── PDF Parser ─────────────────────────────────────────────────────────────────
async function parsePdf(buffer: Buffer, fileName: string): Promise<ParsedFile> {
  try {
    // Dynamic import to avoid SSR issues
    const pdfParseModule = await import("pdf-parse");
    const pdfParse = (pdfParseModule as any).default || pdfParseModule;
    const data = await pdfParse(buffer);
    return {
      name: fileName,
      content: data.text || "(PDF tidak dapat dibaca — kemungkinan file hasil scan)",
    };
  } catch {
    return {
      name: fileName,
      content: "(Gagal memproses file PDF)",
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
      const csvData = XLSX.utils.sheet_to_csv(worksheet);
      if (csvData.trim()) {
        sheets.push(`=== Sheet: ${sheetName} ===\n${csvData}`);
      }
    });

    return {
      name: fileName,
      content: sheets.join("\n\n") || "(File Excel kosong)",
    };
  } catch {
    return {
      name: fileName,
      content: "(Gagal memproses file Excel)",
    };
  }
}

// ── CSV Parser ─────────────────────────────────────────────────────────────────
function parseCsv(buffer: Buffer, fileName: string): ParsedFile {
  return {
    name: fileName,
    content: buffer.toString("utf-8"),
  };
}

// ── Plain Text Parser ──────────────────────────────────────────────────────────
function parseText(buffer: Buffer, fileName: string): ParsedFile {
  return {
    name: fileName,
    content: buffer.toString("utf-8"),
  };
}

// ── Main Dispatcher ────────────────────────────────────────────────────────────
export async function parseFile(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<ParsedFile> {
  const ext = fileName.toLowerCase().split(".").pop();

  if (ext === "pdf" || mimeType === "application/pdf") {
    return parsePdf(buffer, fileName);
  }

  if (
    ext === "xlsx" ||
    ext === "xls" ||
    mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    mimeType === "application/vnd.ms-excel"
  ) {
    return parseExcel(buffer, fileName);
  }

  if (ext === "csv" || mimeType === "text/csv") {
    return parseCsv(buffer, fileName);
  }

  // Default: treat as plain text
  return parseText(buffer, fileName);
}

// ── Combine Multiple Files ─────────────────────────────────────────────────────
export function combineExtractedText(files: ParsedFile[]): string {
  return files
    .map(
      (f) =>
        `========================================\nDOKUMEN: ${f.name}\n========================================\n${f.content}`
    )
    .join("\n\n");
}
