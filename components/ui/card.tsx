import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Card — style guide §10.3.
 * White surface, 1px border, restrained shadow. Padding 16px mobile / 24px desktop.
 * Do not nest more than one card inside another.
 */
export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "border-border bg-surface shadow-card rounded-[var(--radius-card)] border",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-3 p-4 lg:p-6",
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  as: As = "h2",
  ...props
}: React.HTMLAttributes<HTMLHeadingElement> & {
  as?: "h1" | "h2" | "h3" | "h4";
}) {
  return (
    <As className={cn("text-card-title text-text", className)} {...props} />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-meta text-text-secondary", className)} {...props} />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-4 pt-0 lg:p-6 lg:pt-0", className)} {...props} />
  );
}

export function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "border-border flex flex-wrap items-center gap-3 border-t p-4 lg:px-6",
        className,
      )}
      {...props}
    />
  );
}

/**
 * KPI card — §10.3: "label, value, small comparison/context and optional icon.
 * Avoid giant icons or decorative charts."
 *
 * `href` makes the whole tile a drill-down target, which PRD §7.1 requires:
 * "Drill-down from every metric; no decorative numbers without accessible
 * source lists."
 */
export function KpiCard({
  label,
  value,
  context,
  icon,
  href,
  className,
}: {
  label: string;
  value: React.ReactNode;
  context?: React.ReactNode;
  icon?: React.ReactNode;
  /** Drill-down target. Makes the whole tile one link. */
  href?: string;
  className?: string;
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-meta text-text-secondary font-medium">{label}</p>
        {icon ? (
          <span className="text-text-muted [&_svg]:size-5" aria-hidden="true">
            {icon}
          </span>
        ) : null}
      </div>
      <p className="text-kpi text-navy-900 mt-2" data-numeric>
        {value}
      </p>
      {context ? (
        <p className="text-meta text-text-secondary mt-1">{context}</p>
      ) : null}
    </>
  );

  if (!href) {
    return <Card className={cn("p-4 lg:p-6", className)}>{body}</Card>;
  }

  /* One link wrapping the whole tile rather than a link inside it: a nested
     interactive element would give screen readers two targets for one metric,
     and the label is the accessible name we want announced. */
  return (
    <Card
      className={cn(
        "hover:border-border-strong focus-within:border-border-strong transition-colors",
        className,
      )}
    >
      <Link
        href={href}
        className="block rounded-[inherit] p-4 focus-visible:outline-2 focus-visible:outline-offset-2 lg:p-6"
      >
        {body}
      </Link>
    </Card>
  );
}
