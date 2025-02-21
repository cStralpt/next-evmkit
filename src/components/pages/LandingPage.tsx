"use client";

import { useSiweAuth } from "@/hooks/useSiweAuth";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { SiweButton } from "@/components/auth/SiweButton";

export default function LandingPage() {
  const { isAuthenticated, loading, user } = useSiweAuth();
  const { isConnected } = useAccount();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-retro-bg relative">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 z-0" />
      <div className="max-w-2xl w-full px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-block">
            <h1 className="text-6xl font-bold mb-4 text-retro-purple tracking-tight relative">
              <span className="relative inline-block">
                Next.js SIWE Kit
                <div className="absolute -inset-1 bg-retro-blue opacity-20 blur-sm rounded-lg" />
              </span>
            </h1>
          </div>
          <p className="text-retro-purple/80 text-lg">
            A minimal implementation of Sign-In with Ethereum
          </p>
        </div>

        <div className="bg-white/40 backdrop-blur-sm border-2 border-retro-purple/10 rounded-lg p-8 shadow-[4px_4px_0px_0px_rgba(67,53,167,0.3)] relative">
          <div className="space-y-6">
            {!isConnected ? (
              <div className="space-y-4">
                <p className="text-center text-retro-purple/80">
                  Connect your wallet to get started
                </p>
                <div className="flex justify-center relative z-20">
                  <ConnectButton />
                </div>
              </div>
            ) : !isAuthenticated ? (
              <div className="space-y-4">
                <p className="text-center text-retro-purple/80">
                  Sign a message to prove ownership of your wallet
                </p>
                <div className="relative z-20">
                  <SiweButton />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-center text-retro-orange">
                  Welcome! 👋
                </h2>
                <div className="bg-white/60 border-2 border-retro-blue/20 rounded-lg p-4">
                  <p className="text-retro-purple/80 mb-2">Connected Address:</p>
                  <p className="font-mono break-all text-retro-purple">{user.walletAddress}</p>
                </div>
                <p className="text-center text-retro-orange flex items-center justify-center gap-2">
                  <span className="w-2 h-2 bg-retro-orange rounded-full animate-pulse" />
                  Successfully authenticated with Ethereum
                </p>
              </div>
            )}

            {loading && (
              <div className="text-center text-retro-purple/60">
                <p>Loading...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 