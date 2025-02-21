import { getToken } from "next-auth/jwt";
import { type NextRequest, NextResponse } from "next/server";
import { generateNonce } from "siwe";
import {
  setNonce,
  verifyNonce as verifyStoredNonce,
  getAllNonces,
} from "./nonce-store";

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
