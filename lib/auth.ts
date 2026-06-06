import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  // No PrismaAdapter — we use JWT sessions (stateless).
  // Mixing PrismaAdapter with strategy:"jwt" causes OAuthCallback errors.

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
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60,
  },

  // cookies block removed so NextAuth handles production vs development cookies automatically

  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      // For Google OAuth — upsert the user into our database
      if (account?.provider === "google" && profile?.email) {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: profile.email },
          });

          if (!existingUser) {
            await prisma.user.create({
              data: {
                email: profile.email,
                name: profile.name ?? user.name ?? null,
                image: (profile as any).picture ?? user.image ?? null,
                role: "user",
              },
            });
          }
        } catch (error) {
          console.error("[AUTH] Error upserting Google user:", error);
          return false;
        }
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

    async jwt({ token, user, account, trigger, session }) {
      // On first sign-in (user object is present), populate token from DB
      if (user || account) {
        const email = user?.email ?? token.email;
        if (email) {
          const dbUser = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              businessName: true,
              companyName: true,
              phoneNumber: true,
              role: true,
            },
          });
          if (dbUser) {
            token.sub = dbUser.id;
            token.role = dbUser.role;
            token.businessName = dbUser.businessName;
            token.companyName = dbUser.companyName;
            token.phoneNumber = dbUser.phoneNumber;
          }
        }
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
    async signOut({ token }) {
      console.log(`[AUTH] User signed out: ${(token as any)?.email}`);
    },
  },
};

export default NextAuth(authOptions);
