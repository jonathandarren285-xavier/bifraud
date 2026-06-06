import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";

// ── GET: Validate Token ──────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ valid: false, error: "Token hilang" }, { status: 400 });
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken || resetToken.expires < new Date()) {
      return NextResponse.json({ valid: false, error: "Token tidak valid atau kedaluwarsa" }, { status: 400 });
    }

    return NextResponse.json({ valid: true });
  } catch (error: any) {
    console.error("[RESET PASSWORD GET ERROR]", error);
    return NextResponse.json({ valid: false, error: "Terjadi kesalahan" }, { status: 500 });
  }
}

// ── POST: Reset Password ─────────────────────────────────────────────────
const Schema = z.object({
  token: z.string().min(1, "Token hilang"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = Schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Input tidak valid" },
        { status: 400 }
      );
    }

    const { token, password } = parsed.data;

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken || resetToken.expires < new Date()) {
      return NextResponse.json(
        { error: "Token reset password tidak valid atau sudah kedaluwarsa." },
        { status: 400 }
      );
    }

    // Update the user's password
    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword },
    });

    // Delete the used token
    await prisma.passwordResetToken.delete({
      where: { token },
    });

    return NextResponse.json({
      success: true,
      message: "Password berhasil diubah.",
    });
  } catch (error: any) {
    console.error("[RESET PASSWORD POST ERROR]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menyimpan password baru." },
      { status: 500 }
    );
  }
}
