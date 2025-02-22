import NextAuth from "next-auth";
import { type NextRequest } from "next/server";
import { authOptions } from "@/lib/auth";

// Create the auth handler
const handler = NextAuth(authOptions);

// Export the handler functions
export const GET = handler;
export const POST = handler;
