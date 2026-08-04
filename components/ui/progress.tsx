import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Progress bar.
 *
 * A native `role="progressbar"` with its value announced, because §14 requires
 * status to be reachable without sight and a bare coloured div tells a screen
 * reader nothing.
 *
 * Tone carries meaning rather than decoration (§3.4): green for something
 * completed, orange for an outstanding balance, blue for work in progress.
 */
export type ProgressTone = "blue" | "green" | "orange" | "navy";

const TONE_FILL: Record<ProgressTone, string> = {
  blue: "bg-blue-700",
  green: "bg-green-600",
  orange: "bg-orange-500",
  navy: "bg-navy-900",
};

export function Progress({
  value,
  tone = "blue",
  /** Names what is progressing, e.g. "MS Office course progress". */
  label,
  className,
}: {
  /** 0–100. Values outside the range are clamped rather than overflowing. */
  value: number;
  tone?: ProgressTone;
  label: string;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn(
        "bg-surface-subtle h-1.5 w-full overflow-hidden rounded-[var(--radius-pill)]",
        className,
      )}
    >
      <div
        className={cn("h-full rounded-[var(--radius-pill)]", TONE_FILL[tone])}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
