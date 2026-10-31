import { useLocation, Link } from "react-router-dom";
import { Building2, LayoutDashboard } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { groupEntry, menuFor } from "@/lib/navigation";
import { VIEWS } from "@/lib/roles";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { CentreSwitcher } from "./CentreSwitcher";

/** Groups whose screens are wired end to end; the rest carry a "Preview" chip. */
const PRODUCTION_READY = [
  "Reception",
  "Course Management",
  "Courses & Batches",
  "Student Management",
  "Fee Management",
  "Attendance Management",
  "Exam & Marks",
  "Online Exam",
  "Certificate & Marksheet",
  "User Management",
  "Learning",
  "Assessments",
  "Fees",
  "Documents",
  "Account",
];

// The DriveWay sidebar: rounded rows on navy, and the page you are on as a
// solid gold pill with blue text -- the one gold thing on the screen.
const LINK =
  "flex h-auto items-center gap-[11px] rounded-xl px-3 py-2.5 text-[13.5px] transition-colors group-data-[collapsible=icon]:justify-center";
const ACTIVE =
  "bg-sidebar-primary font-bold text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground";
const IDLE =
  "font-medium text-white/75 hover:bg-white/[.08] hover:text-white";

export function AppSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const { view, allowedPaths } = useAuth();
  const collapsed = state === "collapsed";
  // The signed-in authorisation decides the whole navigation surface: a menu a
  // view cannot open is never rendered, so there is no route to guess at.
  const groups = menuFor(view, allowedPaths);
  const home = VIEWS[view].home;
  const isActive = (url: string) => location.pathname === url;

  return (
    <Sidebar collapsible="icon" className="border-r-0 text-sidebar-foreground">
      <div className="flex items-center gap-2.5 px-5 pb-2 pt-5 group-data-[collapsible=icon]:px-2">
        <img src={`${import.meta.env.BASE_URL}career-optics-logo.webp`} alt="Career Optics Computer Academy" className="h-9 w-9 shrink-0 rounded-xl bg-white object-contain p-0.5" />
        {!collapsed && <div className="leading-[1.05]"><p className="text-[17px] font-extrabold tracking-[-0.01em] text-white">Career <span className="bg-[linear-gradient(90deg,#60a5fa_0%,#fb923c_100%)] bg-clip-text text-transparent">Optics</span></p><p className="mt-0.5 text-[8.5px] font-semibold uppercase tracking-[.14em] text-white/60">{VIEWS[view].short} panel</p></div>}
      </div>
      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 py-3 text-[10px] font-semibold uppercase tracking-[.18em] text-white/40">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    to={home}
                    className={cn(
                      // "You are here" is a rail plus a surface, not a fill:
                      // it reads at a glance without spending the accent colour.
                      LINK,
                      isActive(home)
                        ? ACTIVE
                        : IDLE,
                    )}
                  >
                    {view === "student" ? <LayoutDashboard className="h-[18px] w-[18px] shrink-0" /> : <Building2 className="h-[18px] w-[18px] shrink-0" />}
                    {!collapsed && <span>Dashboard</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-3 py-3 text-[10px] font-semibold uppercase tracking-[.18em] text-white/40">
            {view === "admin" ? "All modules" : view === "franchise" ? "Branch modules" : "My account"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {groups.map((item) => {
                const active = item.items.some((subItem) => isActive(subItem.url));
                const entry = groupEntry(item);
                const productionReady = PRODUCTION_READY.includes(item.title);
                return <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={entry.url} className={cn(LINK, active ? ACTIVE : IDLE)}>
                      <item.icon className="h-[18px] w-[18px] shrink-0" />
                      {!collapsed && <><span className="min-w-0 flex-1 truncate">{item.title.replace(" Management", "")}</span>{!productionReady&&<span className={cn("rounded-full px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wider", active ? "bg-sidebar-primary-foreground/15" : "bg-white/10 text-white/50")}>Preview</span>}</>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>;
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 group-data-[collapsible=icon]:p-2">
        <CentreSwitcher collapsed={collapsed} />
      </SidebarFooter>
    </Sidebar>
  );
}
