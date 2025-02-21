import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Next.js SIWE Kit",
  description: "Sign-In with Ethereum Authentication Kit for Next.js",
};

import LandingPage from "@/components/pages/LandingPage";

export default function Home() {
  return <LandingPage />;
}
