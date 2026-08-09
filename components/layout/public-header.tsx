"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoLockup } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

/**
 * Public site header — style guide §7.1.
 * White header used consistently. Desktop: logo left, navigation centre/right,
 * Student Login secondary, Centre Login primary. Mobile: compact lock-up left,
 * one menu button right opening a full-height navigation sheet.
 *
 * "Keep header sticky after the user begins scrolling. Reduce height slightly in
 * sticky state."
 */

// Gallery is deliberately absent: `/gallery/photos` was listed here from
// Phase 1 and never built, so the public site's most visible menu carried a
// 404. The gallery is one of the §7.12 CMS pieces whose shape nobody has
// specified (C13) — a dead link is worse than a missing one, so it comes
// back when the pages behind it do.
const NAV = [
  { label: "Courses", href: "/courses" },
  { label: "Centres", href: "/centres" },
  { label: "Verify", href: "/verify" },
  { label: "Notices", href: "/notices" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export function PublicHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock the page behind the open sheet so the background does not scroll.
  React.useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header
      className={cn(
        "border-border bg-surface pt-safe sticky top-0 z-40 border-b",
        "transition-shadow duration-[var(--duration-standard)]",
        scrolled && "shadow-card",
      )}
    >
      <div
        className={cn(
          "container-public flex items-center justify-between gap-4",
          // Slightly reduced height once scrolled (§7.1).
          "transition-[height] duration-[var(--duration-standard)]",
          scrolled ? "h-16 lg:h-[68px]" : "h-[68px] lg:h-20",
        )}
      >
        <Link href="/" aria-label="Career Optics home" className="min-w-0">
          <LogoLockup size="sm" priority className="lg:hidden" />
          <LogoLockup size="md" priority className="hidden lg:flex" />
        </Link>

        <nav aria-label="Site" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "text-label rounded-[var(--radius-chip)] px-3 py-2 font-medium transition-colors",
                      active
                        ? "text-navy-900 underline decoration-orange-500 decoration-2 underline-offset-8"
                        : "text-text-secondary hover:text-navy-900",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          <Button asChild variant="secondary" size="sm">
            <Link href="/sign-in/student">Student login</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/sign-in/centre">Centre login</Link>
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-controls="public-nav-sheet"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="text-navy-900 grid size-11 shrink-0 place-items-center rounded-[var(--radius-control)] lg:hidden"
        >
          {menuOpen ? (
            <X className="size-6" aria-hidden="true" />
          ) : (
            <Menu className="size-6" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Full-height navigation sheet (§7.1). */}
      {menuOpen ? (
        <div
          id="public-nav-sheet"
          className="bg-surface fixed inset-x-0 top-[calc(4rem+env(safe-area-inset-top,0px))] bottom-0 z-40 overflow-y-auto lg:hidden"
        >
          <nav aria-label="Site" className="container-public py-4">
            <ul className="divide-border divide-y">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="text-card-title text-text active:text-navy-900 flex min-h-[56px] items-center"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 grid gap-3" onClick={() => setMenuOpen(false)}>
              <Button asChild>
                <Link href="/sign-in/centre">Centre login</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/sign-in/student">Student login</Link>
              </Button>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
