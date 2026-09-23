import type { Metadata } from "next";
import { LandingPage } from "@/components/landing";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { url: "/" },
};

/**
 * Public one-page landing. Onboarding lives at /onboarding.
 */
export default function HomePage() {
  return <LandingPage />;
}
