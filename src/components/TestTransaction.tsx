"use client"

import { useState } from "react"
import { useSmartAccount } from "@/hooks/useSmartAccount"
import { parseEther } from "viem"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useAccount } from "wagmi"

export function TestTransaction() {
  const { smartAccount, loading: smartAccountLoading } = useSmartAccount()
  const { address } = useAccount()
  const [loading, setLoading] = useState(false)

  const sendTestTransaction = async () => {
    if (!smartAccount) return

    try {
      setLoading(true)
      toast.info("Preparing transaction...")

      // Get the smart account address
      const smartAccountAddress = await smartAccount.getAccountAddress()
      console.log("Smart Account Address:", smartAccountAddress)
      console.log("EOA Address:", address)

      // Example transaction to transfer 0 MATIC (just for testing)
      const tx = {
        to: "0x0000000000000000000000000000000000000000",
        data: "0x",
        value: parseEther("0"),
      }

      // Build user op
      const userOp = await smartAccount.buildUserOp([tx])
      console.log("UserOp built successfully:", userOp)
      
      toast.info("Sending transaction...")
      const userOpResponse = await smartAccount.sendUserOp(userOp)
      console.log("UserOp hash:", userOpResponse.userOpHash)
      
      toast.info("Waiting for transaction...")
      const receipt = await userOpResponse.wait()
      
      toast.success(`Transaction successful! Hash: ${receipt.receipt.transactionHash}`)
      console.log("Transaction receipt:", receipt)
    } catch (error) {
      console.error("Error sending transaction:", error)
      toast.error(error instanceof Error ? error.message : "Failed to send transaction")
    } finally {
      setLoading(false)
    }
  }

  if (smartAccountLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading smart account...</span>
      </div>
    )
  }

  if (!smartAccount) {
    return (
      <div className="text-center p-4">
        Please connect your wallet and sign in to test transactions
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h2 className="text-xl font-bold">Test Your Smart Account</h2>
      <p className="text-sm text-muted-foreground">
        Send a test transaction (0 MATIC) using your smart account
      </p>
      <button
        onClick={sendTestTransaction}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          "Send Test Transaction"
        )}
      </button>
    </div>
  )
} 