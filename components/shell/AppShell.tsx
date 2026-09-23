"use client";

import { AppSidebar } from "./AppSidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider delayDuration={200}>
      <SidebarProvider defaultOpen>
        <AppSidebar />
        <SidebarInset className="bg-background text-foreground">
          <header className="font-ui sticky top-0 z-20 hidden h-14 items-center gap-2 border-b border-border bg-paper/90 px-3 backdrop-blur-md max-[375px]:flex">
            <SidebarTrigger className="min-h-11 min-w-11 cursor-pointer" />
            <span className="text-sm font-semibold tracking-tight text-ink">
              Linaw
            </span>
          </header>
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
