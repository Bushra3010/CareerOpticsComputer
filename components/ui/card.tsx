import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress, type ProgressTone } from "./progress";

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
  action,
  highlight,
  progress,
  progressTone = "blue",
  className,
}: {
  label: string;
  value: React.ReactNode;
  context?: React.ReactNode;
  icon?: React.ReactNode;
  /** Inline action, e.g. a Recharge button on the wallet tile. */
  action?: React.ReactNode;
  /** Tints the whole tile. Use for at most one card per dashboard. */
  highlight?: boolean;
  /** 0-100. Renders a labelled progress bar under the value. */
  progress?: number;
  progressTone?: ProgressTone;
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
          <p className="text-meta text-text-secondary min-h-[2.6em] font-medium">
            {label}
          </p>
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
      {progress !== undefined ? (
        <Progress
          value={progress}
          tone={progressTone}
          label={`${label} progress`}
          className="mt-2.5"
        />
      ) : null}
      {context ? (
        <p className="text-meta text-text-secondary mt-2">{context}</p>
      ) : null}
    </>
  );

  const surface = cn(
    "p-4 lg:p-5",
    highlight && "border-info-border bg-blue-100",
    className,
  );

  // An action inside the tile rules out wrapping the whole tile in a link —
  // nesting an interactive control inside an anchor is invalid and breaks
  // keyboard navigation.
  if (action) {
    return (
      <Card className={surface}>
        {body}
        <div className="mt-3">{action}</div>
      </Card>
    );
  }

  if (href) {
    return (
      <Card
        className={cn(surface, "hover:border-border-strong transition-colors")}
      >
        <Link href={href} className="block">
          {body}
        </Link>
      </Card>
    );
  }

  return <Card className={surface}>{body}</Card>;
}
