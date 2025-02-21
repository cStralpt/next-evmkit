"use client";

import { useAccount, useSignMessage } from "wagmi";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { createSiweMessage } from "@/lib/siwe";
import { toast } from "sonner";

export function SiweButton() {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [loading, setLoading] = useState(false);

  async function getNonce() {
    try {
      const response = await fetch("/api/auth/nonce");
      if (!response.ok) throw new Error("Failed to get nonce");
      return await response.text();
    } catch (error) {
      console.error("Failed to get nonce:", error);
      throw error;
    }
  }

  async function signInWithEthereum() {
    try {
      setLoading(true);

      if (!address) {
        throw new Error("No address found");
      }

      const nonce = await getNonce();
      const { message, preparedMessage } = createSiweMessage(
        address,
        "Sign in with Ethereum to access the application.",
        nonce,
      );

      const signature = await signMessageAsync({
        message: preparedMessage,
      });

      const response = await signIn("siwe", {
        message: JSON.stringify(message),
        signature,
        nonce,
        chainId: "1",
        redirect: false,
      });

      if (response?.error) {
        toast.error("Failed to sign in. Please try again.");
        console.error("Error signing in:", response.error);
      } else {
        toast.success("Successfully signed in!");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={signInWithEthereum}
      disabled={loading || !address}
      className="w-full px-4 py-3 bg-retro-purple text-white font-semibold rounded-lg disabled:opacity-50 hover:bg-retro-purple/90 transition-colors duration-200 shadow-[4px_4px_0px_0px_rgba(128,196,233,0.3)] relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-retro-blue/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
      <span className="relative">
        {loading ? "Signing in..." : "Sign-In with Ethereum"}
      </span>
    </button>
  );
} 