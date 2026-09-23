import type { Metadata } from "next";
import { LegalNotice } from "@/components/legal/LegalNotice";

export const metadata: Metadata = {
  title: "Terms and privacy · Linaw AI",
  description:
    "How Linaw uses a message you paste, what stays on this device, and what the AppCon code grant does not cover.",
};

export default async function LegalPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const initialTab = params.tab === "privacy" ? "privacy" : "terms";
  return <LegalNotice initialTab={initialTab} />;
}
