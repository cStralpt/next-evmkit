"use client";

import { useSiweAuth } from "@/hooks/useSiweAuth";
import { signOut, useSession } from "next-auth/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useDisconnect } from "wagmi";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export function Header() {
  const { isAuthenticated } = useSiweAuth();
  const { data: session } = useSession();
  const { disconnectAsync } = useDisconnect();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      
      // If user is authenticated with SIWE, disconnect the wallet first
      if (isAuthenticated) {
        await disconnectAsync();
      }

      // Sign out from NextAuth session
      await signOut({ 
        redirect: true,
        callbackUrl: "/auth/signin"
      });

    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
            {session && (
              <button
                onClick={handleSignOut}
                disabled={isLoading}
                className="px-4 py-2 bg-retro-orange text-white rounded-lg hover:bg-retro-orange/90 transition-colors duration-200 shadow-[2px_2px_0px_0px_rgba(67,53,167,0.3)] disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing Out...
                  </>
                ) : (
                  "Sign Out"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 