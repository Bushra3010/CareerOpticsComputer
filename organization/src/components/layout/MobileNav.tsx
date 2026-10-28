import { Link, useLocation } from "react-router-dom";
import { CalendarCheck, ClipboardCheck, Home, IndianRupee, LayoutGrid, UserRoundPlus, UsersRound, Video } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { canAccessWithRole } from "@/lib/navigation";
import type { View } from "@/lib/roles";
import { cn } from "@/lib/utils";

/** Four thumb-reachable destinations per view; "Menu" opens every module. */
const NAV: Record<View, { label: string; url: string; icon: React.ComponentType<{ className?: string }> }[]> = {
  admin: [
    { label: "Home", url: "/", icon: Home },
    { label: "Reception", url: "/reception/enquiry", icon: UserRoundPlus },
    { label: "Students", url: "/student/view", icon: UsersRound },
    { label: "Fees", url: "/fee/collection", icon: IndianRupee },
  ],
  franchise: [
    { label: "Home", url: "/", icon: Home },
    { label: "Students", url: "/student/view", icon: UsersRound },
    { label: "Fees", url: "/fee/collection", icon: IndianRupee },
    { label: "Attendance", url: "/attendance/mark", icon: ClipboardCheck },
  ],
  student: [
    { label: "Home", url: "/me", icon: Home },
    { label: "Classes", url: "/me/classes", icon: Video },
    { label: "Attendance", url: "/me/attendance", icon: CalendarCheck },
    { label: "Fees", url: "/me/fees", icon: IndianRupee },
  ],
};

const TAB = "flex flex-1 flex-col items-center justify-center gap-0.5 rounded-full px-1 pb-[5px] pt-1.5 text-[10.5px] transition-colors active:scale-95";

/**
 * The DriveWay bottom bar: a white pill floating over the page, with no strip
 * of its own behind it, and the current tab as a blue-tinted pill.
 */
export function MobileNav() {
  const location = useLocation();
  const { view, allowedPaths } = useAuth();
  const { openMobile, setOpenMobile } = useSidebar();
  // Only the destinations this role may open; Home always stays.
  const items = NAV[view].filter((item, i) => i === 0 || canAccessWithRole(view, item.url, allowedPaths));
  const home = items[0].url;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-3.5 pb-[calc(10px+env(safe-area-inset-bottom))] md:hidden">
      <nav
        aria-label="Primary mobile navigation"
        className="pointer-events-auto mx-auto flex max-w-[430px] items-stretch rounded-full bg-white/95 p-1 shadow-[0_8px_24px_rgba(15,23,41,0.14)] backdrop-blur-md dark:bg-card/95"
      >
        {items.map((item) => {
          const active = item.url === home ? location.pathname === home : location.pathname === item.url || location.pathname.startsWith(`${item.url}/`);
          return (
            <Link
              key={item.url}
              to={item.url}
              aria-current={active ? "page" : undefined}
              className={cn(TAB, active ? "bg-accent font-semibold text-primary" : "font-medium text-foreground")}
            >
              <item.icon className="h-[21px] w-[21px]" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setOpenMobile(true)}
          aria-expanded={openMobile}
          className={cn(TAB, openMobile ? "bg-accent font-semibold text-primary" : "font-medium text-foreground")}
        >
          <LayoutGrid className="h-[21px] w-[21px]" />
          <span>Menu</span>
        </button>
      </nav>
    </div>
  );
}
