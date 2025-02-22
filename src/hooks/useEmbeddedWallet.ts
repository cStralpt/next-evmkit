"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { createWalletClient, custom, type WalletClient, type Account } from 'viem'
import { polygonZkEvmCardona } from 'viem/chains'
import { useSession } from 'next-auth/react'
import { privateKeyToAccount } from 'viem/accounts'

export function useEmbeddedWallet() {
  const { data: session, update } = useSession()
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null)
  const [account, setAccount] = useState<Account | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const hasAttemptedSave = useRef(false)

  const saveWalletAddress = useCallback(async (address: string) => {
    if (hasAttemptedSave.current) return
    
    try {
      hasAttemptedSave.current = true
      const response = await fetch('/api/user/wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      })

      if (!response.ok) {
        throw new Error('Failed to save wallet address')
      }

      await update()
    } catch (error) {
      console.error('Failed to save wallet address:', error)
      hasAttemptedSave.current = false
      throw error
    }
  }, [update])

  useEffect(() => {
    let mounted = true

    const initWallet = async () => {
      if (!session?.user?.email || hasAttemptedSave.current) return

      try {
        setLoading(true)
        setError(null)

        // Create deterministic account based on user's email
        const accountSeed = await crypto.subtle.digest(
          'SHA-256',
          new TextEncoder().encode(session.user.email)
        )
        
        // Convert to hex string for private key
        const privateKey = Array.from(new Uint8Array(accountSeed))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('')

        // Create account from private key
        const newAccount = privateKeyToAccount(`0x${privateKey}`)

        // Create wallet client with the account
        const client = createWalletClient({
          account: newAccount,
          chain: polygonZkEvmCardona,
          transport: custom({
            async request({ method, params }) {
              // Handle basic wallet methods
              if (method === 'eth_accounts') {
                return [newAccount.address]
              }
              if (method === 'eth_chainId') {
                return polygonZkEvmCardona.id
              }
              // Add more method handlers as needed
              throw new Error(`Method ${method} not supported`)
            }
          })
        })

        if (!mounted) return

        setWalletClient(client)
        setAccount(newAccount)

        // Only try to save the address if it's not already saved
        if (!session.user.address) {
          await saveWalletAddress(newAccount.address)
        }
      } catch (err) {
        if (!mounted) return
        console.error('Error initializing embedded wallet:', err)
        setError(err instanceof Error ? err : new Error('Failed to initialize embedded wallet'))
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initWallet()

    return () => {
      mounted = false
    }
  }, [session?.user?.email, saveWalletAddress])

  return {
    walletClient,
    account,
    loading,
    error
  }
} 