"use client"

import { useEffect, useState } from 'react'
import { useAccount, useWalletClient } from 'wagmi'
import { BiconomySmartAccountV2 } from '@biconomy/account'
import { createSmartAccount } from '@/config/biconomy'
import { useSession } from 'next-auth/react'
import { useEmbeddedWallet } from './useEmbeddedWallet'

export function useSmartAccount() {
  const { address } = useAccount()
  const { data: walletClient } = useWalletClient()
  const { data: session } = useSession()
  const { walletClient: embeddedWalletClient } = useEmbeddedWallet()
  const [smartAccount, setSmartAccount] = useState<BiconomySmartAccountV2 | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true)
        setError(null)

        // Check if we have either a connected wallet or embedded wallet
        const activeWalletClient = walletClient || embeddedWalletClient
        if (!activeWalletClient || !session?.user) {
          setSmartAccount(null)
          return
        }

        const smartAccount = await createSmartAccount(activeWalletClient)
        setSmartAccount(smartAccount)
      } catch (err) {
        console.error('Error initializing smart account:', err)
        setError(err instanceof Error ? err : new Error('Failed to initialize smart account'))
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [address, session, walletClient, embeddedWalletClient])

  return {
    smartAccount,
    loading,
    error,
  }
} 