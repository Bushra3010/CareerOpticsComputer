import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Categorical bar chart — style guide §12.3.
 *
 * For a small fixed set of labelled categories (a week of attendance, marks per
 * subject) rather than a time series, which is what `TrendChart` is for.
 *
 * Two things this handles that a generic chart does not:
 *
 * - **Absence of data is not zero.** A Saturday with no scheduled class is not
 *   0% attendance. Passing `value: null` renders an em dash and says "no class"
 *   to a screen reader, so the chart cannot imply a bad day that never happened.
 * - Every bar is labelled with its own value, so the reading never depends on
 *   estimating a height against an axis (§12.3 wants units and labels).
 */

export interface CategoryBar {
  /** Short axis label, e.g. "Mon". */
  label: string;
  /** Secondary line under the label, e.g. the date. */
  sublabel?: string;
  /** null means "nothing scheduled" — rendered as an em dash, never as zero. */
  value: number | null;
  tone?: "green" | "orange" | "danger" | "blue";
}

const TONE_FILL = {
  green: "bg-green-600",
  orange: "bg-orange-500",
  danger: "bg-danger",
  blue: "bg-blue-700",
} as const;

export function CategoryBars({
  bars,
  caption,
  max = 100,
  formatValue = (v) => `${v}%`,
  className,
}: {
  bars: CategoryBar[];
  /** Accessible name for the figure. */
  caption: string;
  max?: number;
  formatValue?: (value: number) => string;
  className?: string;
}) {
  return (
    <figure className={cn("m-0", className)}>
      <div
        className="flex h-44 items-end gap-1"
        role="img"
        aria-label={caption}
      >
        {bars.map((bar) => {
          const value = bar.value;
          const missing = value === null;
          const height = missing ? 0 : Math.max(2, (value / max) * 100);

          return (
            <div
              key={bar.label}
              className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5 overflow-hidden"
            >
              <span
                className={cn(
                  "text-[11px] leading-tight font-semibold",
                  missing ? "text-text-muted" : "text-text",
                )}
              >
                {missing || value === null ? "—" : formatValue(value)}
              </span>

              <div className="flex w-full flex-1 items-end justify-center">
                {missing ? (
                  <div className="bg-surface-subtle h-1 w-full max-w-8 rounded-full" />
                ) : (
                  <div
                    className={cn(
                      "w-full max-w-8 rounded-t-[var(--radius-chip)]",
                      TONE_FILL[bar.tone ?? "blue"],
                    )}
                    style={{ height: `${height}%` }}
                  />
                )}
              </div>

              <div className="text-center">
                <p className="text-text truncate text-[11px] leading-tight font-medium">
                  {bar.label}
                </p>
                {bar.sublabel ? (
                  <p className="text-text-muted truncate text-[10px] leading-tight">
                    {bar.sublabel}
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* §12.3: the accessible equivalent of the chart. */}
      <figcaption className="sr-only">
        <table>
          <caption>{caption}</caption>
          <thead>
            <tr>
              <th scope="col">Day</th>
              <th scope="col">Attendance</th>
            </tr>
          </thead>
          <tbody>
            {bars.map((bar) => (
              <tr key={bar.label}>
                <th scope="row">
                  {bar.label} {bar.sublabel ?? ""}
                </th>
                <td>
                  {bar.value === null ? "No class" : formatValue(bar.value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </figcaption>
    </figure>
  );
}
