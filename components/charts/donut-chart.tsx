import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Donut chart — style guide §12.3.
 *
 * §12.3 forbids "decorative donuts for one number", so this deliberately
 * requires at least two segments: it is a part-to-whole of a real total
 * (collected vs pending, present vs absent), never a lone percentage dressed up
 * as a ring. The centre label summarises that total rather than replacing it.
 *
 * Segment colours follow the prescribed order — navy, blue, orange, green,
 * muted grey — and every segment is named in the legend with its own value, so
 * meaning never rests on colour alone (§3.4, §14).
 */

export type DonutTone = "navy" | "blue" | "orange" | "green" | "muted";

const TONE_FILL: Record<DonutTone, string> = {
  navy: "var(--color-navy-900)",
  blue: "var(--color-blue-700)",
  orange: "var(--color-orange-500)",
  green: "var(--color-green-600)",
  muted: "var(--color-border-strong)",
};

export interface DonutSegment {
  label: string;
  value: number;
  tone: DonutTone;
  /** Shown under the label in the legend, e.g. "₹2,84,000 (80.5%)". */
  detail?: string;
}

const SIZES = { sm: 116, md: 160 } as const;
const STROKES = { sm: 18, md: 22 } as const;

export function DonutChart({
  segments,
  centreValue,
  centreLabel,
  caption,
  size = "md",
  className,
}: {
  /** Two or more. One segment is a percentage, not a chart (§12.3). */
  segments: [DonutSegment, DonutSegment, ...DonutSegment[]];
  centreValue: React.ReactNode;
  centreLabel: string;
  /** Accessible name for the whole figure. */
  caption: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const SIZE = SIZES[size];
  const STROKE = STROKES[size];
  const RADIUS = (SIZE - STROKE) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;

  /*
   * Each arc starts where the previous one ended, so its offset is the sum of
   * every preceding fraction. Computed with a reduce rather than a mutable
   * accumulator: reassigning a variable during render is exactly what the React
   * Compiler refuses to memoise.
   *
   * The offset is negative because SVG strokes run clockwise from 3 o'clock;
   * the -90° rotation below moves the start to 12 o'clock.
   */
  const arcs = segments.reduce<
    {
      key: string;
      tone: DonutTone;
      dash: number;
      gap: number;
      offset: number;
    }[]
  >((acc, s) => {
    const fraction = s.value / total;
    const consumed = acc.reduce((sum, a) => sum + a.dash, 0);
    acc.push({
      key: s.label,
      tone: s.tone,
      dash: fraction * CIRCUMFERENCE,
      gap: CIRCUMFERENCE - fraction * CIRCUMFERENCE,
      offset: -consumed,
    });
    return acc;
  }, []);

  return (
    <figure
      className={cn("m-0 flex min-w-0 flex-wrap items-center gap-4", className)}
    >
      <div className="relative shrink-0">
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          role="img"
          aria-label={caption}
        >
          <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
            {arcs.map((a) => (
              <circle
                key={a.key}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke={TONE_FILL[a.tone]}
                strokeWidth={STROKE}
                strokeDasharray={`${a.dash} ${a.gap}`}
                strokeDashoffset={a.offset}
              />
            ))}
          </g>
        </svg>

        {/* Centre summary. aria-hidden because the legend and the data table
            below already carry the same information to a screen reader. */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          aria-hidden="true"
        >
          <span className="text-card-title text-navy-900 tabular font-bold">
            {centreValue}
          </span>
          <span className="text-meta text-text-secondary">{centreLabel}</span>
        </div>
      </div>

      <ul className="min-w-[7.5rem] flex-1 space-y-2.5">
        {segments.map((s) => (
          <li key={s.label} className="flex items-start gap-2.5">
            <span
              className="mt-1.5 size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: TONE_FILL[s.tone] }}
              aria-hidden="true"
            />
            <span className="min-w-0">
              <span className="text-body text-text block">{s.label}</span>
              {s.detail ? (
                <span className="text-meta text-text-secondary tabular block">
                  {s.detail}
                </span>
              ) : null}
            </span>
          </li>
        ))}
      </ul>

      <figcaption className="sr-only">
        <table>
          <caption>{caption}</caption>
          <thead>
            <tr>
              <th scope="col">Segment</th>
              <th scope="col">Value</th>
            </tr>
          </thead>
          <tbody>
            {segments.map((s) => (
              <tr key={s.label}>
                <th scope="row">{s.label}</th>
                <td>{s.detail ?? s.value.toLocaleString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </figcaption>
    </figure>
  );
}
