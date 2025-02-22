import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    address?: string;
    chainId?: string;
    accessToken?: string;
    user: {
      id?: string;
      address?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    address: string;
    chainId: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    address?: string;
    chainId?: string;
    accessToken?: string;
    iat?: number;
  }
}
