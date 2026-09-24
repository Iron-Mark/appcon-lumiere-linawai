"use client";

import Link from "next/link";
import { Menu } from "lucide-react";

import { AppSidebar } from "./AppSidebar";
import {
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";

/**
 * Compact top bar for viewports where the sidebar is a sheet (below md).
 * Hamburger opens the existing mobile sheet; Linaw wordmark matches the sidebar.
 */
function MobileNavBar() {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-paper-inset bg-paper px-3 font-ui text-ink md:hidden">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Open menu"
        onClick={toggleSidebar}
        className="size-11 min-h-11 min-w-11 shrink-0 cursor-pointer rounded-lg text-ink-muted transition-colors duration-200 ease-out hover:bg-paper-inset hover:text-ink focus-visible:ring-2 focus-visible:ring-focus motion-reduce:transition-none"
      >
        <Menu aria-hidden strokeWidth={1.75} className="size-5" />
      </Button>
      <Link
        href="/content"
        title="Linaw"
        className="flex min-h-11 min-w-0 cursor-pointer items-center gap-2.5 overflow-hidden rounded-lg px-1 outline-none transition-colors duration-200 ease-out hover:bg-paper-inset/80 focus-visible:ring-2 focus-visible:ring-focus motion-reduce:transition-none"
      >
        <img
          src="/linaw-logo-transparent.png"
          alt="Linaw AI logo"
          className="size-8 shrink-0 object-contain"
        />
        <span className="whitespace-nowrap text-base font-semibold tracking-tight text-ink">
          Linaw
        </span>
      </Link>
    </header>
  );
}

/**
 * App chrome: sidebar + main column. Mobile gets a compact navbar; desktop
 * keeps the on-screen sidebar with no second header.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider delayDuration={200}>
      <SidebarProvider defaultOpen>
        <AppSidebar />
        <SidebarInset className="bg-background text-foreground">
          <MobileNavBar />
          <div className="flex min-h-0 flex-1 flex-col bg-paper-raised pb-[env(safe-area-inset-bottom)] text-ink">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
