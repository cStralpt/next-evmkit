"use client"

import { signIn } from "next-auth/react"
import { MessageCircle, Mail, Apple, Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export default function SignInForm() {
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleSignIn = async (provider: string) => {
    try {
      setIsLoading(provider)
      await signIn(provider, { callbackUrl: "/" })
    } catch (error) {
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
          disabled={isLoading === "discord"}
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
          disabled={isLoading === "google"}
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
          disabled={isLoading === "apple"}
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
      <div className="flex items-center justify-center">
        <button
          onClick={() => handleSignIn("credentials")}
          disabled={isLoading === "credentials"}
          className="text-sm text-muted-foreground underline hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Web3 Wallet
        </button>
      </div>
    </div>
  )
} 