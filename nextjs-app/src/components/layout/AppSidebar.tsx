"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, ChevronRight, LayoutDashboard } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { menuForView } from "@/lib/navigation";
import { VIEWS } from "@/lib/roles";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const PRODUCTION_READY = [
  "Reception",
  "Course Management",
  "Courses & Batches",
  "Student Management",
  "Fee Management",
  "Attendance Management",
  "Exam & Marks",
  "Certificate & Marksheet",
  "Learning",
  "Assessments",
  "Fees",
  "Documents",
  "Account",
];

const LINK =
  "relative flex items-center gap-3 px-4 py-2.5 transition-colors before:absolute before:left-0 before:top-1/2 before:h-5 before:w-[3px] before:-translate-y-1/2 before:rounded-r before:bg-sidebar-primary before:transition-opacity";
const ACTIVE =
  "bg-sidebar-accent font-semibold text-sidebar-accent-foreground before:opacity-100";
const IDLE =
  "text-sidebar-foreground/65 before:opacity-0 hover:bg-sidebar-accent hover:text-sidebar-foreground";

export function AppSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const { profile, view } = useAuth();
  const collapsed = state === "collapsed";
  const groups = menuForView(view);
  const home = VIEWS[view].home;
  const isActive = (url: string) => pathname === url;

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex h-[68px] items-center gap-3 border-b border-sidebar-border px-4">
        <img src="/career-optics-logo.png" alt="Career Optics Computer Academy" className="h-10 w-10 shrink-0 rounded-xl bg-white object-contain p-0.5" />
        {!collapsed && (
          <div className="leading-tight">
            <p className="font-semibold tracking-tight">Career Optics Computer Academy</p>
            <p className="text-[11px] text-sidebar-foreground/50">{VIEWS[view].short} workspace</p>
          </div>
        )}
      </div>
      <SidebarContent className="py-3">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[.18em] text-sidebar-foreground/40">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    href={home}
                    className={cn(
                      LINK,
                      isActive(home)
                        ? ACTIVE
                        : "text-sidebar-foreground/70 before:opacity-0 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                    )}
                  >
                    {view === "student" ? <LayoutDashboard className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
                    {!collapsed && <span>Dashboard</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[.18em] text-sidebar-foreground/40">
            {view === "admin" ? "All modules" : view === "franchise" ? "Branch modules" : "My account"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {groups.map((item) => {
                const active = item.items.some((subItem) => isActive(subItem.url));
                const entry = item.items.find((subItem) => /view|all|list|report|collection|transactions|enquiry/.test(subItem.url)) || item.items[0];
                const productionReady = PRODUCTION_READY.includes(item.title);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={entry.url} className={cn(LINK, active ? ACTIVE : IDLE)}>
                        <item.icon className="h-4 w-4" />
                        {!collapsed && (
                          <>
                            <span className="min-w-0 flex-1 truncate text-sm">{item.title.replace(" Management", "")}</span>
                            {!productionReady && (
                              <span className="rounded bg-sidebar-accent px-1.5 py-0.5 text-[8px] uppercase tracking-wider text-sidebar-foreground/40">Preview</span>
                            )}
                            <ChevronRight className="h-3.5 w-3.5 opacity-40" />
                          </>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
