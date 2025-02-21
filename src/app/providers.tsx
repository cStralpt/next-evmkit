"use client";

import { ThemeProvider } from "@/components/ThemeProvider";
import { WagmiProvider } from "wagmi";
import { config } from "@/config/wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { rainbowKitCustomTheme } from "@/config/rainbowKit";
import { SessionProvider } from "next-auth/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "@/lib/clients";
export function Providers({ children }: { children: React.ReactNode }) {
  if (!config) {
    console.error("Wagmi config is not initialized");
    return null;
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <RainbowKitProvider theme={rainbowKitCustomTheme}>
              {children}
            </RainbowKitProvider>
          </ThemeProvider>
        </SessionProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
