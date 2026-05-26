import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      businessName?: string | null;
    };
  }

  interface User {
    id: string;
    businessName?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    businessName?: string | null;
  }
}
