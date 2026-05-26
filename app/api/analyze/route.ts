import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { parseFile, combineExtractedText } from "@/lib/parsers";
import { analyzeDocuments } from "@/lib/ai";
import { prisma } from "@/lib/db";

export const maxDuration = 120; // 2 minutes for AI analysis

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse multipart form data
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // Validate file types
    const ALLOWED_EXTENSIONS = ["pdf", "xlsx", "xls", "csv", "txt"];
    for (const file of files) {
      const ext = file.name.toLowerCase().split(".").pop();
      if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
        return NextResponse.json(
          { error: `File type not supported: ${file.name}. Allowed: PDF, Excel, CSV, TXT` },
          { status: 400 }
        );
      }
    }

    // Parse all files
    const parsedFiles = await Promise.all(
      files.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        return parseFile(buffer, file.name, file.type);
      })
    );

    // Combine into single prompt text
    const combinedText = combineExtractedText(parsedFiles);

    // Check if there's actually content to analyze
    if (combinedText.trim().length < 50) {
      return NextResponse.json(
        { error: "Files appear to be empty or could not be read" },
        { status: 400 }
      );
    }

    // Call GPT-4o
    const analysisResult = await analyzeDocuments(combinedText);

    // Save to database
    const savedAnalysis = await prisma.analysis.create({
      data: {
        userId: session.user.id,
        fileNames: files.map((f) => f.name),
        rawResult: analysisResult as any,
        overallRiskScore: analysisResult.final_summary.overall_fraud_risk_score,
        findingsCount: analysisResult.findings.length,
        title: `Analisis ${files.map((f) => f.name).join(", ")}`,
      },
    });

    return NextResponse.json({
      success: true,
      analysisId: savedAnalysis.id,
      result: analysisResult,
    });
  } catch (error: any) {
    console.error("[ANALYZE ERROR]", error);

    if (error?.message?.includes("JSON")) {
      return NextResponse.json(
        { error: "AI returned an invalid response. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
