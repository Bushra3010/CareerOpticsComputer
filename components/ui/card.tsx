import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
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
  accent,
  href,
  className,
}: {
  label: string;
  value: React.ReactNode;
  context?: React.ReactNode;
  icon?: React.ReactNode;
  /**
   * Tints the icon disc. Use sparingly — §3.4 forbids "dashboards with every
   * card in a different bright colour", so the accent identifies a *domain*
   * (money, people, centres), never just decoration.
   */
  accent?: "navy" | "blue" | "orange" | "green";
  /** Drill-down target. PRD §7.1 forbids decorative numbers with no source list. */
  href?: string;
  className?: string;
}) {
  const accentClass = {
    navy: "bg-blue-100 text-navy-900",
    blue: "bg-blue-100 text-blue-700",
    orange: "bg-warning-bg text-orange-600",
    green: "bg-success-bg text-success",
  };

  const body = (
    <>
      <div className="flex items-start gap-3">
        {icon ? (
          /* Tinted disc, not a solid 64px block: §10.3 says "avoid giant icons".
             40px keeps the coloured area small enough that orange stays under
             the ~10% of visual area §3.4 allows. */
          <span
            className={cn(
              "grid size-10 shrink-0 place-items-center rounded-[var(--radius-chip)] [&_svg]:size-5",
              accent
                ? accentClass[accent]
                : "bg-surface-subtle text-text-muted",
            )}
            aria-hidden="true"
          >
            {icon}
          </span>
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="text-meta text-text-secondary font-medium">{label}</p>
          <p className="text-kpi text-navy-900 mt-0.5" data-numeric>
            {value}
          </p>
        </div>
        {href ? (
          <ChevronRight
            className="text-text-muted mt-1 size-4 shrink-0"
            aria-hidden="true"
          />
        ) : null}
      </div>
      {context ? (
        <p className="text-meta text-text-secondary mt-2">{context}</p>
      ) : null}
    </>
  );

  if (href) {
    return (
      <Card
        className={cn(
          "hover:border-border-strong p-4 transition-colors lg:p-5",
          className,
        )}
      >
        <Link href={href} className="block">
          {body}
        </Link>
      </Card>
    );
  }

  return <Card className={cn("p-4 lg:p-5", className)}>{body}</Card>;
}
