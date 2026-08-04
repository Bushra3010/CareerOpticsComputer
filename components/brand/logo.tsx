import Image from "next/image";
import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/brand";

/**
 * Logo — style guide §2.2.
 *
 * The supplied source asset is a raster JPEG on a white field. Two consequences
 * are handled here rather than hidden:
 *
 * 1. On navy chrome the guide's "white monochrome version" does not exist yet,
 *    so the mark sits on a solid white protective surface — the treatment §2.3
 *    explicitly sanctions — paired with the wordmark set in white type. It is
 *    not recoloured, stretched or cropped.
 * 2. The full circular seal is unreadable below ~36px (§2.2), so the collapsed
 *    sidebar, favicon and app icon need an approved compact variant. Until one
 *    is supplied, `compact` renders the seal at the largest size that still
 *    fits, never a cropped "CO" (§2.3 forbids that as a production icon).
 *
 * See docs/02-open-conflicts.md, C2.
 */

const SIZES = {
  /** Mobile header mark — §2.2: 36–40px high. */
  sm: 40,
  /** Full desktop header logo — §2.2: 48px high. */
  md: 48,
  /** Login / cover — §2.2: 80–120px high. */
  lg: 96,
} as const;

export function LogoMark({
  size = "md",
  className,
  priority,
}: {
  size?: keyof typeof SIZES;
  className?: string;
  priority?: boolean;
}) {
  const px = SIZES[size];
  return (
    <Image
      src="/brand/logo.jpg"
      alt={BRAND.name}
      width={px}
      height={px}
      priority={priority}
      className={cn("shrink-0 object-contain", className)}
      style={{ height: px, width: px }}
    />
  );
}

/**
 * Horizontal lock-up for headers. `surface="navy"` places the mark on the white
 * protective surface and sets the wordmark in white.
 */
export function LogoLockup({
  size = "md",
  surface = "light",
  showTagline = false,
  subtitle,
  className,
  priority,
}: {
  size?: keyof typeof SIZES;
  surface?: "light" | "navy";
  showTagline?: boolean;
  /** Overrides the second line — used for the portal name, e.g. "Super Admin". */
  subtitle?: string;
  className?: string;
  priority?: boolean;
}) {
  const onNavy = surface === "navy";

  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "grid shrink-0 place-items-center overflow-hidden",
          onNavy && "rounded-[var(--radius-chip)] bg-white p-1",
        )}
      >
        <LogoMark size={size} priority={priority} />
      </span>
      <span className="flex min-w-0 flex-col leading-tight">
        <span
          className={cn(
            "truncate font-bold tracking-tight",
            size === "sm" ? "text-body" : "text-card-title",
            onNavy ? "text-white" : "text-navy-900",
          )}
        >
          Career Optics
        </span>
        <span
          className={cn(
            "text-meta truncate",
            onNavy ? "text-sidebar-muted" : "text-text-secondary",
          )}
        >
          {subtitle ?? (showTagline ? BRAND.tagline : "Computer Academy")}
        </span>
      </span>
    </span>
  );
}
