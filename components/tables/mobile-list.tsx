import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Mobile list — the designed mobile equivalent of a table, required by style
 * guide §10.4 and §16 ("Tables have a deliberately designed mobile equivalent").
 *
 * Rules encoded here:
 * - identity/title, 2–4 essential fields, status, one main action
 * - full details open on tap
 * - "Do not horizontally scroll ordinary student, fee or order lists"
 *
 * The `fields` array is capped at four at the type level so a wide table cannot
 * be dumped into a card by accident.
 */

export interface MobileListField {
  label: string;
  value: React.ReactNode;
  /** Right-aligns and applies tabular numerals — for money, marks and counts. */
  numeric?: boolean;
}

type UpToFour<T> = [] | [T] | [T, T] | [T, T, T] | [T, T, T, T];

export interface MobileListItemProps {
  /** Primary identity line, e.g. student name or order number. */
  title: string;
  /** Secondary identity line, e.g. registration number or course. */
  subtitle?: string;
  /** Status badge. Rendered top-right where the thumb does not cover it. */
  status?: React.ReactNode;
  fields?: UpToFour<MobileListField>;
  /** Tapping the card opens details. Omit only for non-navigable rows. */
  href?: string;
  /** One main action (§10.4). More than one belongs on the details screen. */
  action?: React.ReactNode;
  leading?: React.ReactNode;
}

export function MobileListItem({
  title,
  subtitle,
  status,
  fields = [],
  href,
  action,
  leading,
}: MobileListItemProps) {
  const body = (
    <>
      <div className="flex items-start gap-3">
        {leading ? <div className="shrink-0">{leading}</div> : null}
        <div className="min-w-0 flex-1">
          <p className="text-card-title text-text truncate">{title}</p>
          {subtitle ? (
            <p className="text-meta text-text-secondary mt-0.5 truncate">
              {subtitle}
            </p>
          ) : null}
        </div>
        {status ? <div className="shrink-0">{status}</div> : null}
        {href ? (
          <ChevronRight
            className="text-text-muted mt-1 size-4 shrink-0"
            aria-hidden="true"
          />
        ) : null}
      </div>

      {fields.length > 0 ? (
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
          {fields.map((f) => (
            <div key={f.label} className="min-w-0">
              <dt className="text-meta text-text-secondary">{f.label}</dt>
              <dd
                className={cn(
                  "text-body text-text truncate",
                  f.numeric && "tabular",
                )}
              >
                {f.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </>
  );

  return (
    <li className="border-border border-b last:border-b-0">
      {href ? (
        <Link
          href={href}
          className="active:bg-surface-subtle block px-4 py-4 transition-colors"
        >
          {body}
        </Link>
      ) : (
        <div className="px-4 py-4">{body}</div>
      )}
      {action ? <div className="px-4 pb-4">{action}</div> : null}
    </li>
  );
}

export function MobileList({
  children,
  label,
  className,
}: {
  children: React.ReactNode;
  /** Accessible name for the list, e.g. "Students at Delhi Central". */
  label: string;
  className?: string;
}) {
  return (
    <ul
      aria-label={label}
      className={cn(
        "border-border bg-surface overflow-hidden rounded-[var(--radius-card)] border",
        className,
      )}
    >
      {children}
    </ul>
  );
}

/**
 * Renders the mobile composition below `lg` and the desktop table at `lg` and
 * above. Both are server-rendered and swapped with CSS rather than a JS media
 * query, so there is no hydration mismatch and no layout shift on first paint.
 *
 * Style guide §15: "Use responsive components only when the information remains
 * the same; use distinct mobile compositions when the task changes materially."
 * Operational lists always change materially, so they always come through here.
 */
export function ResponsiveCollection({
  table,
  list,
}: {
  table: React.ReactNode;
  list: React.ReactNode;
}) {
  return (
    <>
      <div className="lg:hidden">{list}</div>
      <div className="hidden lg:block">{table}</div>
    </>
  );
}
