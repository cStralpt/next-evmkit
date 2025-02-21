import { useSession } from "next-auth/react";

export function useSiweAuth() {
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const isAuthenticated = !!session?.address;

  return {
    isAuthenticated,
    loading,
    user: {
      walletAddress: session?.address,
    },
  };
}
