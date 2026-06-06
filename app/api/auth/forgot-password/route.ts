import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { prisma } from "@/lib/db";

const Schema = z.object({
  email: z.email("Format email tidak valid").toLowerCase().trim(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = Schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Email tidak valid" },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    // Always return success to avoid email enumeration attacks
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      // Delete any existing reset tokens for this email
      await prisma.passwordResetToken.deleteMany({ where: { email } });

      // Generate a secure token
      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.passwordResetToken.create({
        data: { email, token, expires },
      });

      // ── Send email ──────────────────────────────────────────────
      // NOTE: Integrate with your email provider here.
      // Example using Resend (https://resend.com):
      //
      // import { Resend } from "resend";
      // const resend = new Resend(process.env.RESEND_API_KEY);
      // await resend.emails.send({
      //   from: process.env.EMAIL_FROM!,
      //   to: email,
      //   subject: "Reset Password BiFraud",
      //   html: `
      //     <p>Klik link di bawah untuk mereset password Anda:</p>
      //     <a href="${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}">
      //       Reset Password
      //     </a>
      //     <p>Link berlaku selama 1 jam.</p>
      //   `,
      // });

      // For development — log the reset URL to the console
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/reset-password?token=${token}`;
      console.log(`[FORGOT PASSWORD] Reset URL for ${email}: ${resetUrl}`);
    }

    // Always return 200 (prevent email enumeration)
    return NextResponse.json({
      success: true,
      message: "Jika email terdaftar, link reset telah dikirim.",
    });
  } catch (error: any) {
    console.error("[FORGOT PASSWORD ERROR]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
