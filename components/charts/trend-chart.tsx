import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Trend chart — style guide §12.3.
 *
 * Hand-rolled SVG rather than a charting library. Two reasons: PRD §20.3 says
 * install only justified dependencies, and every library default we would have
 * to override (series colours, 3D, donuts, legends) is something §12.3 forbids
 * anyway. Server-rendered, so it costs no client JavaScript.
 *
 * §12.3 also requires "an accessible data table or summary for important
 * analytics", so every chart renders one in a visually-hidden <table>. The
 * chart is decorative to a screen reader; the table is the real content.
 *
 * Series colours follow the prescribed order: navy, blue, orange, green.
 */

export interface TrendPoint {
  /** X-axis label, e.g. "1 May". */
  label: string;
  /** Line value. */
  line: number;
  /** Optional bar value drawn behind the line. */
  bar?: number;
}

export interface TrendChartProps {
  points: TrendPoint[];
  /** Accessible name, e.g. "Centre growth over May 2026". */
  caption: string;
  lineLabel: string;
  barLabel?: string;
  /** Formats axis ticks and the data table, e.g. paise → ₹2.4L. */
  formatValue?: (value: number) => string;
  /** Show only every Nth x label so they never overlap at narrow widths. */
  labelEvery?: number;
  className?: string;
}

const VIEW_W = 720;
const VIEW_H = 240;
const PAD = { top: 12, right: 8, bottom: 28, left: 44 };
const PAD_RIGHT_WITH_BARS = 34;

export function TrendChart({
  points,
  caption,
  lineLabel,
  barLabel,
  formatValue = (v) => v.toLocaleString("en-IN"),
  labelEvery = 5,
  className,
}: TrendChartProps) {
  if (points.length === 0) return null;

  const hasBars = points.some((p) => p.bar !== undefined);

  // Bars need room on the right for their own axis labels.
  const padRight = hasBars ? PAD_RIGHT_WITH_BARS : PAD.right;
  const plotW = VIEW_W - PAD.left - padRight;
  const plotH = VIEW_H - PAD.top - PAD.bottom;

  /*
   * Round up to 1, 2, 2.5 or 5 times a power of ten. Rounding to the next
   * power-of-ten multiple instead would chart a maximum of 128 against a
   * ceiling of 200 and waste half the plot.
   */
  const niceCeiling = (max: number) => {
    if (max <= 0) return 1;
    const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
    const normalised = max / magnitude;
    const step = [1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 7.5, 10].find(
      (c) => normalised <= c,
    )!;
    return step * magnitude;
  };

  const ceiling = niceCeiling(Math.max(...points.map((p) => p.line), 1));

  /*
   * Bars get their own scale. "Total centres" is cumulative and in the hundreds;
   * "new centres" is a daily count in single digits. Sharing one axis flattens
   * the bars to invisible slivers, which is what the first build did. §12.3
   * requires axes to be labelled, so the right-hand axis below names this one.
   */
  const barCeiling = hasBars
    ? niceCeiling(Math.max(...points.map((p) => p.bar ?? 0), 1))
    : 1;

  const x = (i: number) =>
    PAD.left +
    (points.length === 1 ? plotW / 2 : (i / (points.length - 1)) * plotW);
  const y = (v: number) => PAD.top + plotH - (v / ceiling) * plotH;
  const yBar = (v: number) => PAD.top + plotH - (v / barCeiling) * plotH;

  const linePath = points
    .map(
      (p, i) =>
        `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.line).toFixed(1)}`,
    )
    .join(" ");

  const areaPath = `${linePath} L${x(points.length - 1).toFixed(1)},${PAD.top + plotH} L${x(0).toFixed(1)},${PAD.top + plotH} Z`;

  const gridFractions = [0, 0.25, 0.5, 0.75, 1];
  const gridValues = gridFractions.map((f) => ceiling * f);
  const barWidth = Math.max(3, (plotW / points.length) * 0.5);

  return (
    <figure className={cn("m-0", className)}>
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="h-auto w-full"
        role="img"
        aria-label={caption}
        preserveAspectRatio="none"
      >
        {/* Horizontal gridlines and y-axis ticks */}
        {gridValues.map((v) => (
          <g key={v}>
            <line
              x1={PAD.left}
              x2={VIEW_W - padRight}
              y1={y(v)}
              y2={y(v)}
              stroke="var(--color-border)"
              strokeWidth={1}
            />
            <text
              x={PAD.left - 8}
              y={y(v) + 4}
              textAnchor="end"
              fontSize={11}
              fill="var(--color-text-muted)"
            >
              {formatValue(v)}
            </text>
          </g>
        ))}

        {/* Right-hand axis for the bar series. §12.3 requires axes to be
            labelled; an unlabelled second scale would be misleading. */}
        {hasBars &&
          gridFractions.map((f) => (
            <text
              key={`bar-${f}`}
              x={VIEW_W - padRight + 8}
              y={PAD.top + plotH - f * plotH + 4}
              textAnchor="start"
              fontSize={11}
              fill="var(--color-info)"
            >
              {Math.round(barCeiling * f).toLocaleString("en-IN")}
            </text>
          ))}

        {/* Bars sit behind the line — the secondary series (§12.3 order). */}
        {hasBars &&
          points.map((p, i) =>
            p.bar === undefined ? null : (
              <rect
                key={p.label}
                x={x(i) - barWidth / 2}
                y={yBar(p.bar)}
                width={barWidth}
                height={Math.max(0, PAD.top + plotH - yBar(p.bar))}
                fill="var(--color-blue-100)"
                stroke="var(--color-info-border)"
                strokeWidth={1}
                rx={2}
              />
            ),
          )}

        {/* Area wash under the line, then the line itself in navy. */}
        <path d={areaPath} fill="var(--color-navy-900)" opacity={0.06} />
        <path
          d={linePath}
          fill="none"
          stroke="var(--color-navy-900)"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />

        {points.map((p, i) => (
          <circle
            key={p.label}
            cx={x(i)}
            cy={y(p.line)}
            r={2.5}
            fill="var(--color-navy-900)"
          />
        ))}

        {/* X-axis labels, thinned so they never collide. */}
        {points.map((p, i) =>
          // Show every Nth, plus the final point — but skip the final one when
          // it sits too close to the previous label to avoid overlap.
          i % labelEvery === 0 ||
          (i === points.length - 1 &&
            (points.length - 1) % labelEvery >= labelEvery / 2) ? (
            <text
              key={p.label}
              x={x(i)}
              y={VIEW_H - 8}
              textAnchor="middle"
              fontSize={11}
              fill="var(--color-text-muted)"
            >
              {p.label}
            </text>
          ) : null,
        )}
      </svg>

      {/* §12.3: the accessible equivalent. Visually hidden, not display:none,
          so screen readers reach it. */}
      <figcaption className="sr-only">
        <table>
          <caption>{caption}</caption>
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">{lineLabel}</th>
              {hasBars && barLabel ? <th scope="col">{barLabel}</th> : null}
            </tr>
          </thead>
          <tbody>
            {points.map((p) => (
              <tr key={p.label}>
                <th scope="row">{p.label}</th>
                <td>{formatValue(p.line)}</td>
                {hasBars && barLabel ? (
                  <td>{formatValue(p.bar ?? 0)}</td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </figcaption>
    </figure>
  );
}

/** Legend swatch row. Labels are mandatory — §12.3 wants axes and units named. */
export function ChartLegend({
  items,
  className,
}: {
  items: { label: string; kind: "line" | "bar" }[];
  className?: string;
}) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-4", className)}>
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5">
          {item.kind === "line" ? (
            <span
              className="bg-navy-900 h-0.5 w-4 rounded-full"
              aria-hidden="true"
            />
          ) : (
            <span
              className="border-info-border size-3 rounded-sm border bg-blue-100"
              aria-hidden="true"
            />
          )}
          <span className="text-meta text-text-secondary">{item.label}</span>
        </li>
      ))}
    </ul>
  );
}
