import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,

  providers: [
    // ── Google OAuth ─────────────────────────────────────────────────
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),

    // ── Email + Password ─────────────────────────────────────────────
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan password wajib diisi");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });

        if (!user) {
          throw new Error("Akun tidak ditemukan. Silakan daftar terlebih dahulu.");
        }

        if (!user.password) {
          throw new Error(
            "Akun ini terdaftar melalui Google. Gunakan tombol 'Masuk dengan Google'."
          );
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!passwordMatch) {
          throw new Error("Password salah. Silakan coba lagi.");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
    // Persistent login — 30 days
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },

  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
  },

  callbacks: {
    async signIn({ user, account }) {
      // Allow all users — remove the previous email whitelist restriction.
      // For Google OAuth users, ensure they exist in the database.
      if (account?.provider === "google") {
        // The PrismaAdapter handles upsert automatically for OAuth users.
        return true;
      }
      return true;
    },

    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = token.role as string | undefined;
        session.user.companyName = token.companyName as string | undefined;
        session.user.businessName = token.businessName as string | undefined;
        session.user.phoneNumber = token.phoneNumber as string | undefined;
      }
      return session;
    },

    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.sub = user.id;
        token.role = (user as any).role;

        // Fetch extended fields on first login
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            businessName: true,
            companyName: true,
            phoneNumber: true,
            role: true,
          },
        });
        token.businessName = dbUser?.businessName;
        token.companyName = dbUser?.companyName;
        token.phoneNumber = dbUser?.phoneNumber;
        token.role = dbUser?.role;
      }

      // Allow session update from client
      if (trigger === "update" && session) {
        return { ...token, ...session };
      }

      return token;
    },
  },

  events: {
    async signIn({ user }) {
      console.log(`[AUTH] User signed in: ${user.email}`);
    },
    async signOut({ session, token }) {
      console.log(`[AUTH] User signed out: ${(token as any)?.email}`);
    },
  },
};

export default NextAuth(authOptions);
