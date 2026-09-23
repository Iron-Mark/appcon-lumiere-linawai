import { AppShell } from "@/components/shell";

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
