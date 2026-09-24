"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, FileText, SlidersHorizontal } from "lucide-react";

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
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

type NavItem = {
  href: string;
  label: string;
  icon: typeof BookOpen;
};

const MAIN_NAV: NavItem[] = [
  { href: "/read", label: "Read", icon: BookOpen },
  { href: "/content", label: "My Content", icon: FileText },
];

const SETTINGS_ITEM: NavItem = {
  href: "/settings",
  label: "Settings",
  icon: SlidersHorizontal,
};

function normalizePath(path: string) {
  if (!path) return "/";
  if (path.length > 1 && path.endsWith("/")) {
    return path.slice(0, -1);
  }
  return path;
}

/** Exact path match — /read stays active for any hash (including #meaning-check). */
function navIsActive(pathname: string, href: string) {
  return normalizePath(pathname) === normalizePath(href);
}

function navButtonClass(active: boolean) {
  return active
    ? "min-h-11 cursor-pointer rounded-xl bg-action-soft px-3 text-[0.9375rem] font-medium text-action hover:bg-action-soft focus-visible:ring-2 focus-visible:ring-focus motion-reduce:transition-none group-data-[collapsible=icon]:size-11 group-data-[collapsible=icon]:min-h-11 group-data-[collapsible=icon]:px-0"
    : "min-h-11 cursor-pointer rounded-xl bg-transparent px-3 text-[0.9375rem] font-normal text-ink-muted hover:bg-paper-inset hover:text-ink focus-visible:ring-2 focus-visible:ring-focus motion-reduce:transition-none group-data-[collapsible=icon]:size-11 group-data-[collapsible=icon]:min-h-11 group-data-[collapsible=icon]:px-0";
}

export function AppSidebar() {
  const pathname = usePathname();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const settingsActive = navIsActive(pathname, SETTINGS_ITEM.href);
  const SettingsIcon = SETTINGS_ITEM.icon;

  /** Close the off-canvas sheet after nav; leave desktop expanded/collapsed alone. */
  function closeMobileSheet() {
    if (isMobile) setOpenMobile(false);
  }

  return (
    <Sidebar
      collapsible="icon"
      className="bg-sidebar font-ui text-sidebar-foreground"
    >
      <SidebarHeader className="p-2 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-1">
        <div className="flex min-h-11 items-center gap-1">
          <Link
            href="/content"
            title="Linaw"
            onClick={closeMobileSheet}
            className="flex min-h-11 min-w-0 flex-1 cursor-pointer items-center gap-2.5 overflow-hidden rounded-lg px-2 outline-none transition-colors duration-200 ease-out hover:bg-paper-inset/80 focus-visible:ring-2 focus-visible:ring-sidebar-ring motion-reduce:transition-none group-data-[collapsible=icon]:size-11 group-data-[collapsible=icon]:flex-none group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
          >
            <img
              src="/linaw-logo-transparent.png"
              alt="Linaw AI logo"
              className="size-8 shrink-0 object-contain"
            />
            <span className="whitespace-nowrap text-base font-semibold tracking-tight text-ink group-data-[collapsible=icon]:hidden">
              Linaw
            </span>
          </Link>
          {!collapsed || isMobile ? (
            <SidebarTrigger
              aria-label={isMobile ? "Close menu" : "Toggle sidebar"}
              className="inline-flex size-11 min-h-11 min-w-11 shrink-0 cursor-pointer rounded-lg text-ink-muted transition-colors duration-200 ease-out hover:bg-paper-inset hover:text-ink focus-visible:ring-2 focus-visible:ring-sidebar-ring motion-reduce:transition-none"
            />
          ) : null}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="p-2 group-data-[collapsible=icon]:px-1">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5 group-data-[collapsible=icon]:items-center">
              {MAIN_NAV.map((item) => {
                const Icon = item.icon;
                const active = navIsActive(pathname, item.href);
                return (
                  <SidebarMenuItem
                    key={item.label}
                    className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center"
                  >
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      size="lg"
                      tooltip={item.label}
                      className={navButtonClass(active)}
                    >
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        onClick={closeMobileSheet}
                      >
                        <Icon aria-hidden strokeWidth={1.75} />
                        <span className="whitespace-nowrap">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="mt-auto gap-2 border-t border-sidebar-border p-2 pt-4 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-1">
        <SidebarMenu className="gap-1.5 group-data-[collapsible=icon]:items-center">
          <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
            <SidebarMenuButton
              asChild
              isActive={settingsActive}
              size="lg"
              tooltip={SETTINGS_ITEM.label}
              className={navButtonClass(settingsActive)}
            >
              <Link
                href={SETTINGS_ITEM.href}
                aria-current={settingsActive ? "page" : undefined}
                onClick={closeMobileSheet}
              >
                <SettingsIcon aria-hidden strokeWidth={1.75} />
                <span className="whitespace-nowrap">{SETTINGS_ITEM.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
