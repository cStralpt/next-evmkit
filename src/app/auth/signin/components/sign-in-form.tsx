"use client"

import { signIn } from "next-auth/react"
import { MessageCircle, Mail, Apple, Loader2, Wallet } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { useSmartAccount } from "@/hooks/useSmartAccount"
import { useAccount } from "wagmi"
import { useEmbeddedWallet } from "@/hooks/useEmbeddedWallet"
import { SiweButton } from "@/components/auth/SiweButton"

export default function SignInForm() {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const { smartAccount, loading: smartAccountLoading } = useSmartAccount()
  const { address } = useAccount()
  const { account: embeddedAccount, loading: embeddedWalletLoading } = useEmbeddedWallet()

  const handleSignIn = async (provider: string) => {
    try {
      setIsLoading(provider)
      const result = await signIn(provider, {
        callbackUrl: "/",
        redirect: true,
      })
      
      if (result?.error) {
        toast.error(result.error)
        return
      }

      if (address && !smartAccountLoading && !smartAccount) {
        toast.success("Creating your smart account...")
      }
    } catch (error) {
      console.error("Sign in error:", error)
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-4">
        <button
          onClick={() => handleSignIn("discord")}
          disabled={isLoading === "discord" || smartAccountLoading}
          className="flex items-center justify-center gap-2 rounded-lg bg-[#5865F2] px-8 py-3 text-white hover:bg-[#4752C4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading === "discord" ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <MessageCircle className="h-5 w-5" />
          )}
          Sign in with Discord
        </button>
        <button
          onClick={() => handleSignIn("google")}
          disabled={isLoading === "google" || smartAccountLoading}
          className="flex items-center justify-center gap-2 rounded-lg bg-white px-8 py-3 text-gray-600 shadow-md hover:bg-gray-50 transition-colors border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading === "google" ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Mail className="h-5 w-5 text-[#4285F4]" />
          )}
          Sign in with Google
        </button>
        <button
          onClick={() => handleSignIn("apple")}
          disabled={isLoading === "apple" || smartAccountLoading}
          className="flex items-center justify-center gap-2 rounded-lg bg-black px-8 py-3 text-white hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading === "apple" ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Apple className="h-5 w-5" />
          )}
          Sign in with Apple
        </button>
      </div>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => handleSignIn("credentials")}
          disabled={isLoading === "credentials" || smartAccountLoading || embeddedWalletLoading}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading === "credentials" || embeddedWalletLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Wallet className="h-4 w-4" />
          )}
          Use Embedded Wallet
        </button>
        <SiweButton />
      </div>
    </div>
  )
} 