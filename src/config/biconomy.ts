"use client"

import { createPublicClient, http, type WalletClient } from 'viem'
import { polygonZkEvmCardona } from 'viem/chains'
import { createSmartAccountClient } from "@biconomy/account"
import { DEFAULT_ENTRYPOINT_ADDRESS } from "@biconomy/account"
import { Bundler } from '@biconomy/bundler'
import { BiconomyPaymaster } from '@biconomy/paymaster'

const bundler = new Bundler({
  bundlerUrl: process.env.NEXT_PUBLIC_BICONOMY_BUNDLER_URL!,
  chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID || 80001),
  entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
})

const paymaster = new BiconomyPaymaster({
  paymasterUrl: process.env.NEXT_PUBLIC_BICONOMY_PAYMASTER_URL!
})

const publicClient = createPublicClient({
  chain: polygonZkEvmCardona,
  transport: http()
})

export const createSmartAccount = async (walletClient: WalletClient) => {
  try {
    const [address] = await walletClient.getAddresses()
    if (!address) throw new Error("No address found")

    // Create the smart account client
    const smartAccount = await createSmartAccountClient({
      signer: walletClient,
      bundler,
      paymaster,
      entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
      chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID || 80001)
    })

    return smartAccount
  } catch (error) {
    console.error("Error creating smart account:", error)
    throw error
  }
} 