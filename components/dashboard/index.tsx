import * as React from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/input";
import { ChartLegend } from "@/components/charts/trend-chart";
import { cn } from "@/lib/utils";

/**
 * Shared dashboard building blocks.
 *
 * The Super Admin and Centre dashboards are the same composition at different
 * scopes (style guide §11.1 gives one order for both), so these live here
 * rather than being copied into each page.
 */

/** Panel with a title and a "View all" drill-down (PRD §7.1). */
export function SectionCard({
  title,
  href,
  action,
  children,
  className,
  bodyClassName,
}: {
  title: string;
  /** Drill-down target. PRD §7.1: no decorative numbers without a source list. */
  href?: string;
  /** Replaces the "View all" link, e.g. a period selector. */
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <Card className={cn("flex flex-col p-4 lg:p-5", className)}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-card-title text-navy-900">{title}</h2>
        {action ??
          (href ? (
            <Link
              href={href}
              /* §9.4 and §14 require a 44px minimum touch target. The negative
                 margin keeps the extra height from pushing the header down. */
              className="text-meta -my-3 inline-flex min-h-11 shrink-0 items-center font-semibold text-blue-700 underline-offset-4 hover:underline lg:my-0 lg:min-h-0"
            >
              View all
              <span className="sr-only"> {title.toLowerCase()}</span>
            </Link>
          ) : null)}
      </div>
      <div className={cn("min-w-0 flex-1", bodyClassName)}>{children}</div>
    </Card>
  );
}

/** Panel wrapping a chart, with the period selector §11.1 dashboards expect. */
export function ChartCard({
  title,
  legend,
  children,
  className,
}: {
  title: string;
  legend?: { label: string; kind: "line" | "bar" }[];
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("p-4 lg:p-5", className)}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-card-title text-navy-900">{title}</h2>
        <Select
          aria-label={`${title} period`}
          defaultValue="month"
          className="text-meta h-9 w-auto lg:h-9"
        >
          <option value="month">This month</option>
          <option value="quarter">This quarter</option>
          <option value="year">This year</option>
        </Select>
      </div>
      {legend ? <ChartLegend items={legend} className="mb-2" /> : null}
      {children}
    </Card>
  );
}

/**
 * Recent-activity strip.
 *
 * Tones map to meaning, not decoration: green for a completed positive event,
 * red for something needing attention, blue for neutral information. §3.4
 * forbids "every card in a different bright colour", so the palette here is
 * carrying information.
 */
export type ActivityTone = "blue" | "green" | "orange" | "danger";

export interface ActivityItem {
  title: string;
  detail: string;
  when: string;
  icon: LucideIcon;
  tone: ActivityTone;
}

const ACTIVITY_TONE: Record<ActivityTone, string> = {
  blue: "bg-blue-100 text-blue-700",
  green: "bg-success-bg text-success",
  orange: "bg-warning-bg text-orange-600",
  danger: "bg-danger-bg text-danger",
};

export function ActivityStrip({ items }: { items: ActivityItem[] }) {
  return (
    <ul className="tablet:grid-cols-2 wide:grid-cols-5 grid gap-3 lg:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <li key={item.title} className="flex gap-3">
            <span
              className={cn(
                "grid size-9 shrink-0 place-items-center rounded-[var(--radius-chip)] [&_svg]:size-[18px]",
                ACTIVITY_TONE[item.tone],
              )}
              aria-hidden="true"
            >
              <Icon />
            </span>
            <div className="min-w-0">
              <p className="text-label text-text font-semibold">{item.title}</p>
              <p className="text-meta text-text-secondary">{item.detail}</p>
              <p className="text-meta text-text-secondary mt-0.5">
                {item.when}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Initials avatar.
 *
 * Deliberately not a photograph placeholder: student photos are personal data
 * living in the private `student-private` bucket behind short-lived signed URLs
 * (PRD §10.7), so a list view shows initials until a real signed URL exists.
 */
export function InitialsAvatar({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <span
      className={cn(
        "text-meta text-navy-900 grid size-8 shrink-0 place-items-center rounded-full bg-blue-100 font-semibold",
        className,
      )}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}
