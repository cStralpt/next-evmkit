"use client";

import { useSiweAuth } from "@/hooks/useSiweAuth";
import { signOut } from "next-auth/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function Header() {
  const { isAuthenticated } = useSiweAuth();

  return (
    <header className="fixed top-0 left-0 right-0 bg-retro-bg/80 backdrop-blur-sm border-b-2 border-retro-purple/10 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center relative">
          <div className="text-retro-purple font-bold text-xl tracking-tight relative">
            <span className="relative">
              Next.js SIWE Kit
              <div className="absolute -inset-1 bg-retro-blue opacity-20 blur-sm rounded-lg" />
            </span>
          </div>
          <div className="flex items-center gap-4 relative z-10">
            <ConnectButton />
            {isAuthenticated && (
              <button
                onClick={() => signOut()}
                className="px-4 py-2 bg-retro-orange text-white rounded-lg hover:bg-retro-orange/90 transition-colors duration-200 shadow-[2px_2px_0px_0px_rgba(67,53,167,0.3)]"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 