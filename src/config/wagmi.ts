import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from "wagmi/chains";

if (!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID) {
  throw new Error("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not defined");
}

export const config = getDefaultConfig({
  appName: process.env.NEXT_PUBLIC_APP_NAME || "Kifuku",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  chains: [
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true" ? [sepolia] : []),
  ],
  ssr: true,
  appDescription: "Trade and create meme coins on Kifuku",
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

// Ensure the config is properly initialized
if (!config) {
  throw new Error("Failed to initialize Wagmi config");
}
