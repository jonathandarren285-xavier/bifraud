import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const analyses = await prisma.analysis.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        fileNames: true,
        overallRiskScore: true,
        findingsCount: true,
        title: true,
      },
    });

    return NextResponse.json({ analyses });
  } catch (error: any) {
    console.error("[HISTORY ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}
