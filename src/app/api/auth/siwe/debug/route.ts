import { NextResponse } from "next/server";
import { SiweMessage } from "siwe";
import { verifyNonce } from "@/lib/auth";
import { getAllNonces } from "@/lib/nonce-store";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("SIWE Debug - Received credentials:", {
      message: body.message,
      signature: `${body.signature?.slice(0, 10)}...`,
      nonce: body.nonce,
      chainId: body.chainId,
    });

    console.log("SIWE Debug - Available nonces:", getAllNonces());

    const isValidNonce = verifyNonce(body.nonce);
    console.log("SIWE Debug - Nonce validation:", {
      nonce: body.nonce,
      isValid: isValidNonce,
    });

    const siweMessage = new SiweMessage(body.message);
    console.log("SIWE Debug - Parsed message:", {
      address: siweMessage.address,
      chainId: siweMessage.chainId,
      domain: siweMessage.domain,
      nonce: siweMessage.nonce,
      issuedAt: siweMessage.issuedAt,
      expirationTime: siweMessage.expirationTime,
    });

    return NextResponse.json({
      success: true,
      nonceValid: isValidNonce,
      message: siweMessage,
    });
  } catch (error) {
    console.error("SIWE Debug - Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
}
