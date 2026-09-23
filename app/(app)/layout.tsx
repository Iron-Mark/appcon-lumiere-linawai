import type { Metadata } from "next";
import { AppShell } from "@/components/shell";

/** Product routes are not marketing pages. */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Product shell — sidebar for in-app routes. Marketing `/` stays outside this group.
 */
export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AppShell>{children}</AppShell>;
}
