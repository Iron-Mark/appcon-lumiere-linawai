"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpen,
  Home,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

type NavItem = {
  href: string;
  label: string;
  icon: typeof Home;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/read", label: "Read", icon: BookOpen },
  { href: "/read#meaning-check", label: "Checks", icon: ShieldCheck },
  { href: "/settings", label: "Settings", icon: SlidersHorizontal },
];

function navIsActive(pathname: string, hash: string, href: string) {
  const [pathOnly, fragment] = href.split("#");
  if (pathname !== pathOnly && !pathname.startsWith(`${pathOnly}/`)) {
    return false;
  }
  if (fragment) {
    return hash === `#${fragment}`;
  }
  if (pathOnly === "/read") {
    return hash !== "#meaning-check";
  }
  return true;
}

export function AppSidebar() {
  const pathname = usePathname();
  const [hash, setHash] = useState("");

  useEffect(() => {
    const sync = () => setHash(window.location.hash);
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [pathname]);

  return (
    <Sidebar
      collapsible="offcanvas"
      className="border-sidebar-border bg-sidebar font-ui text-sidebar-foreground"
    >
      <SidebarHeader className="gap-3 px-3 py-4">
        <Link
          href="/home"
          className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-md px-2 outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          <span
            aria-hidden
            className="flex size-8 shrink-0 items-center justify-center rounded-md bg-ink text-sm font-semibold text-paper-raised"
          >
            L
          </span>
          <span className="text-base font-semibold tracking-tight text-ink">
            Linaw
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = navIsActive(pathname, hash, item.href);
                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      size="lg"
                      tooltip={item.label}
                      className="min-h-11 cursor-pointer rounded-lg px-3 text-[0.9375rem] data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
                    >
                      <Link href={item.href}>
                        <Icon aria-hidden strokeWidth={1.75} />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border px-3 py-3">
        <p className="px-2 text-xs leading-relaxed text-ink-subtle">
          Source stays on this device unless you choose to save it.
        </p>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
