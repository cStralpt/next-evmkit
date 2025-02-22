import { getToken } from "next-auth/jwt";
import { type NextRequest, NextResponse } from "next/server";
import { generateNonce } from "siwe";
import {
  setNonce,
  verifyNonce as verifyStoredNonce,
  getAllNonces,
} from "./nonce-store";
import { PrismaAdapter } from "@auth/prisma-adapter"
import { type NextAuthOptions } from "next-auth"
import DiscordProvider from "next-auth/providers/discord"
import GoogleProvider from "next-auth/providers/google"
import AppleProvider from "next-auth/providers/apple"
import { prisma } from "./prisma"
import NextAuth from "next-auth"

const rateLimiter = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = {
  MAX_REQUESTS: 5,
  WINDOW_MS: 60 * 1000,
};

export function createNonce() {
  try {
    const nonce = generateNonce();
    setNonce(nonce);

    console.log("Auth: Created nonce:", {
      nonce,
    });

    return nonce;
  } catch (error) {
    console.error("Auth: Error creating nonce:", error);
    throw error;
  }
}

export function verifyNonce(nonce: string): boolean {
  try {
    console.log("Auth: Verifying nonce:", nonce);
    console.log("Auth: Current nonces:", getAllNonces());

    return verifyStoredNonce(nonce);
  } catch (error) {
    console.error("Auth: Error verifying nonce:", error);
    return false;
  }
}

function checkRateLimit(ip: string): boolean {
  if (process.env.NODE_ENV === "development") {
    return true;
  }

  const now = Date.now();
  const record = rateLimiter.get(ip);

  if (!record) {
    rateLimiter.set(ip, { count: 1, resetTime: now + RATE_LIMIT.WINDOW_MS });
    return true;
  }

  if (now > record.resetTime) {
    rateLimiter.set(ip, { count: 1, resetTime: now + RATE_LIMIT.WINDOW_MS });
    return true;
  }

  if (record.count >= RATE_LIMIT.MAX_REQUESTS) {
    return false;
  }

  record.count += 1;
  rateLimiter.set(ip, record);
  return true;
}

export async function authenticateApi(req: NextRequest) {
  try {
    if (process.env.NODE_ENV === "production") {
      const ip =
        req.headers.get("x-forwarded-for") ||
        req.headers.get("x-real-ip") ||
        "unknown";

      if (!checkRateLimit(ip)) {
        return new NextResponse(
          JSON.stringify({ error: "Too many requests" }),
          {
            status: 429,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
    }

    const token = await getToken({ req });

    if (!token?.address) {
      return new NextResponse(
        JSON.stringify({ error: "Authentication required" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return token;
  } catch (error) {
    console.error("Authentication error:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID ?? "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET ?? "",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    AppleProvider({
      clientId: process.env.APPLE_ID ?? "",
      clientSecret: process.env.APPLE_SECRET ?? "",
    }),
  ],
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        // Fetch the user's accounts to ensure we have the latest data
        const userWithAccounts = await prisma.user.findUnique({
          where: { id: user.id },
          include: { accounts: true },
        });
        if (userWithAccounts?.address) {
          session.user.address = userWithAccounts.address;
        }
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      try {
        if (!user.email) {
          console.error("Sign in failed: No email provided");
          return false;
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          include: { accounts: true },
        });

        if (existingUser) {
          // Update existing user
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              name: user.name || existingUser.name,
              image: user.image || existingUser.image,
              updatedAt: new Date(),
            },
          });

          // Ensure account connection exists
          if (account && !existingUser.accounts.some(acc => acc.provider === account.provider)) {
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                refresh_token: account.refresh_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
                session_state: account.session_state,
              },
            });
          }
        }

        return true;
      } catch (error) {
        console.error("Sign in callback error:", error);
        return false;
      }
    },
  },
  events: {
    async signIn({ user, account }) {
      try {
        console.log("Sign in event:", { userId: user.id, provider: account?.provider });
      } catch (error) {
        console.error("Sign in event error:", error);
      }
    },
    async createUser({ user }) {
      try {
        console.log("Create user event:", { userId: user.id });
      } catch (error) {
        console.error("Create user event error:", error);
      }
    },
  },
  debug: process.env.NODE_ENV === "development",
};
