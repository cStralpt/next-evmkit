import { createWalletClient, createPublicClient, http } from "viem";
import { QueryClient } from "@tanstack/react-query";
import { polygonZkEvmCardona } from "viem/chains";

export const getWalletClient = async () => {
  const walletClient = createWalletClient({
    // account: wallet.address as Hex,
    chain: polygonZkEvmCardona,
    transport: http(),
  });

  return walletClient;
};

export const getPublicClient = async () => {
  return createPublicClient({
    chain: polygonZkEvmCardona,
    transport: http(),
  });
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
  },
});
