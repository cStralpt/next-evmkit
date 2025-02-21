import { useAccount } from "wagmi";
import { useSiweAuth } from "@/hooks/useSiweAuth";
import { ConnectButton } from "@rainbow-me/rainbowkit";

interface AuthActionProps {
  children: React.ReactNode;
  onAuth?: () => void;
}

export function AuthAction({ children, onAuth }: AuthActionProps) {
  const { isConnected } = useAccount();
  const { isAuthenticated, loading } = useSiweAuth();

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-text-secondary">Please connect your wallet first</p>
        <ConnectButton />
      </div>
    );
  }

  if (!isAuthenticated && !loading) {
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-text-secondary">Please sign in with your wallet</p>
        <ConnectButton />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-text-secondary">Authenticating...</p>
      </div>
    );
  }

  if (onAuth) {
    onAuth();
  }

  return <>{children}</>;
}
