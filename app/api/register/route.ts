import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";

// ── Zod schema ────────────────────────────────────────────────────────────────
const RegisterSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(100).trim(),
  email: z.email("Format email tidak valid").toLowerCase().trim(),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .max(128, "Password terlalu panjang"),
  phoneNumber: z.string().max(20).trim().optional(),
  companyName: z.string().max(200).trim().optional(),
  companyIndustry: z.string().max(100).trim().optional(),
  companyAddress: z.string().max(500).trim().optional(),
  // Legacy field — kept for backwards compatibility
  businessName: z.string().max(200).trim().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // ── Validate with Zod ───────────────────────────────────────────────────
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message ?? "Validasi gagal" },
        { status: 400 }
      );
    }

    const {
      name,
      email,
      password,
      phoneNumber,
      companyName,
      companyIndustry,
      companyAddress,
      businessName,
    } = parsed.data;

    // ── Check existing user ─────────────────────────────────────────────────
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email sudah terdaftar. Silakan masuk atau gunakan email lain." },
        { status: 409 }
      );
    }

    // ── Hash password ───────────────────────────────────────────────────────
    const hashedPassword = await bcrypt.hash(password, 12);

    // ── Create user ─────────────────────────────────────────────────────────
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phoneNumber: phoneNumber || null,
        companyName: companyName || null,
        companyIndustry: companyIndustry || null,
        companyAddress: companyAddress || null,
        // Populate businessName for legacy compatibility
        businessName: companyName || businessName || null,
        role: "user",
      },
      select: { id: true, email: true, name: true },
    });

    console.log(`[REGISTER] New user created: ${user.email}`);

    return NextResponse.json({
      success: true,
      message: "Akun berhasil dibuat. Silakan masuk.",
      userId: user.id,
    });
  } catch (error: any) {
    console.error("[REGISTER ERROR]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mendaftarkan akun" },
      { status: 500 }
    );
  }
}
