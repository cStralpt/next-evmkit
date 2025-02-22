import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    // Get the session without using headers() directly
    const session = await getServerSession(authOptions);

    // Handle unauthorized access
    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401 }
      );
    }

    const { address } = await req.json();

    if (!address) {
      return new NextResponse(
        JSON.stringify({ error: "Wallet address is required" }),
        { status: 400 }
      );
    }

    // Check if the address is already saved for this user
    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { address: true }
    });

    // If user exists and already has the same address, return early
    if (existingUser && existingUser.address === address) {
      return new NextResponse(
        JSON.stringify({
          address: existingUser.address,
          message: "Address already saved"
        })
      );
    }

    // Update the user's wallet address
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { address },
    });

    return new NextResponse(
      JSON.stringify({ address: updatedUser.address })
    );
  } catch (error) {
    console.error("Error saving wallet address:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
} 