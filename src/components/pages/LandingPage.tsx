"use client";

import { useEffect, useState } from "react";
import { useSmartAccount } from "@/hooks/useSmartAccount";
import { useAccount } from "wagmi";
import { useSession } from "next-auth/react";
import { Loader2, Wallet, UserCircle2, ArrowRight } from "lucide-react";
import { TestTransaction } from "../TestTransaction";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useSiweAuth } from "@/hooks/useSiweAuth";
import { SiweButton } from "@/components/auth/SiweButton";

export default function LandingPage() {
  const { smartAccount, loading: smartAccountLoading } = useSmartAccount();
  const { address, isConnected } = useAccount();
  const { data: session } = useSession();
  const { isAuthenticated, loading: siweLoading, user } = useSiweAuth();
  const [smartAccountAddress, setSmartAccountAddress] = useState<string | null>(null);

  useEffect(() => {
    async function getAddress() {
      if (smartAccount) {
        try {
          const addr = await smartAccount.getAccountAddress();
          console.log("EOA Address (wallet):", address);
          console.log("Smart Account Address:", addr);
          console.log("User table address:", session?.user?.address);
          setSmartAccountAddress(addr);
        } catch (error) {
          console.error("Error getting smart account address:", error);
        }
      } else {
        setSmartAccountAddress(null);
      }
    }
    getAddress();
  }, [smartAccount, address, session?.user?.address]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">Next EVMKit</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Your all-in-one starter kit for building web3 applications with social logins, 
            smart accounts, and gasless transactions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Status Card */}
          <div className="bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm">
            <h2 className="text-2xl font-semibold mb-4">Connection Status</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Wallet className="h-5 w-5 text-blue-400" />
                <span>Wallet: {address ? 
                  `${address.slice(0, 6)}...${address.slice(-4)}` : 
                  "Not Connected"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <UserCircle2 className="h-5 w-5 text-green-400" />
                <span>Session: {session ? 
                  `${session.user?.email || "Authenticated"}` : 
                  isAuthenticated ? 
                  "Authenticated with SIWE" :
                  "Not Signed In"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <ArrowRight className="h-5 w-5 text-purple-400" />
                <span>Smart Account: {smartAccountLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading...
                  </span>
                ) : smartAccount ? (
                  <span>
                    Ready - {smartAccountAddress ? 
                      `${smartAccountAddress.slice(0, 6)}...${smartAccountAddress.slice(-4)}` : 
                      "Loading address..."}
                  </span>
                ) : (
                  "Not Created"
                )}</span>
              </div>
            </div>

            {/* Authentication Actions */}
            <div className="mt-6 space-y-4">
              {!isConnected ? (
                <div className="flex justify-center">
                  <ConnectButton />
                </div>
              ) : !isAuthenticated && !session ? (
                <div className="flex justify-center">
                  <SiweButton />
                </div>
              ) : null}
            </div>
          </div>

          {/* Features Card */}
          <div className="bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm">
            <h2 className="text-2xl font-semibold mb-4">Features</h2>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 bg-blue-400 rounded-full" />
                Social Login Integration
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 bg-green-400 rounded-full" />
                Web3 Wallet Support with SIWE
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 bg-purple-400 rounded-full" />
                Smart Account Creation
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 bg-pink-400 rounded-full" />
                Gasless Transactions
              </li>
            </ul>
          </div>
        </div>

        {/* Test Transaction Section */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm">
            <TestTransaction />
          </div>
        </div>

        {/* Documentation Links */}
        <div className="mt-16 text-center">
          <h3 className="text-xl font-semibold mb-4">Learn More</h3>
          <div className="flex justify-center gap-4">
            <a 
              href="https://docs.biconomy.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Biconomy Docs
            </a>
            <a 
              href="https://wagmi.sh"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Wagmi Docs
            </a>
            <a 
              href="https://www.rainbowkit.com/docs/introduction"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              RainbowKit Docs
            </a>
            <a 
              href="https://docs.login.xyz/integrations/nextauth.js"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              SIWE Docs
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 