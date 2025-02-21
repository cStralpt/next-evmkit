import { createNonce } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const nonce = createNonce();
    console.log("API: Generated nonce:", nonce);

    return new NextResponse(nonce, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  } catch (error) {
    console.error("API: Nonce generation error:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to generate nonce" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
