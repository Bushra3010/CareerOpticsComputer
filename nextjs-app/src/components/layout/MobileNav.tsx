"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, ClipboardCheck, FileCheck, Home, IndianRupee, UserRoundPlus, UsersRound, Video, Wallet } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import type { View } from "@/lib/roles";
import { cn } from "@/lib/utils";

const NAV: Record<View, { label: string; url: string; icon: React.ComponentType<any> }[]> = {
  admin: [
    { label: "Home", url: "/", icon: Home },
    { label: "Reception", url: "/reception/enquiry", icon: UserRoundPlus },
    { label: "Students", url: "/student/view", icon: UsersRound },
    { label: "Fees", url: "/fee/collection", icon: IndianRupee },
    { label: "Attendance", url: "/attendance/mark", icon: ClipboardCheck },
  ],
  franchise: [
    { label: "Home", url: "/", icon: Home },
    { label: "Students", url: "/student/view", icon: UsersRound },
    { label: "Fees", url: "/fee/collection", icon: IndianRupee },
    { label: "Attendance", url: "/attendance/mark", icon: ClipboardCheck },
    { label: "Wallet", url: "/branch/wallet", icon: Wallet },
  ],
  student: [
    { label: "Home", url: "/me", icon: Home },
    { label: "Classes", url: "/me/classes", icon: Video },
    { label: "Attendance", url: "/me/attendance", icon: CalendarCheck },
    { label: "Fees", url: "/me/fees", icon: IndianRupee },
    { label: "Results", url: "/me/results", icon: FileCheck },
  ],
};

export function MobileNav() {
  const pathname = usePathname();
  const { view } = useAuth();
  const items = NAV[view];
  const home = items[0].url;

  return (
    <nav aria-label="Primary mobile navigation" className="fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-background/95 px-2 pb-[max(.4rem,env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-8px_30px_hsl(var(--foreground)/.08)] backdrop-blur-xl md:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-5">
        {items.map(item => {
          const active = item.url === home ? pathname === home : pathname === item.url || pathname.startsWith(`${item.url}/`);
          return (
            <Link key={item.url} href={item.url} className={cn("flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-medium text-muted-foreground transition active:scale-95", active && "bg-primary/15 text-foreground")}>
              <item.icon className={cn("h-[18px] w-[18px]", active && "text-brand-ink")} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
