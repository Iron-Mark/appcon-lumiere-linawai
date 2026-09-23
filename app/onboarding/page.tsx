import type { Metadata } from "next";
import { OnboardingFlow } from "@/components/onboarding";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Onboarding — preference defaults, then /read.
 * Spec: spec/spec-01-initial_scaffold/01-onboarding.md
 */
export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const params = await searchParams;
  return <OnboardingFlow editing={params.edit === "1"} />;
}
