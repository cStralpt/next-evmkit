import { Metadata } from "next";
import LandingPage from "@/components/pages/LandingPage";

export const metadata: Metadata = {
  title: "Next EVMKit",
  description: "Your all-in-one starter kit for building web3 applications",
};

export default function Home() {
  return <LandingPage />
}
