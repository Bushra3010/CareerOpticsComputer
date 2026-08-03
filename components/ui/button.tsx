"use client";

import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Button — style guide §10.1.
 *
 * Heights: 42px desktop / 46px mobile (§10.1). Implemented mobile-first so the
 * larger target is the default and desktop steps down at `lg`.
 *
 * ACCESSIBILITY NOTE (unresolved — see docs/02-open-conflicts.md, C1):
 * §10.1 specifies "Orange fill, white text" for the primary button, but white on
 * brand-orange-500 (#EF6605) measures 3.19:1, below the 4.5:1 that §14 requires
 * for normal-size text. The spec is implemented as written; the conflict is
 * logged for a brand decision rather than silently resolved here (§17).
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "rounded-[var(--radius-control)] text-label font-semibold",
    "transition-colors duration-[var(--duration-standard)] ease-[var(--ease-out-standard)]",
    "active:duration-[var(--duration-press)]",
    // Disabled stays readable (§10.1) — muted, not ghosted out to invisibility.
    "disabled:pointer-events-none disabled:opacity-60",
    "[&_svg]:pointer-events-none [&_svg]:size-[18px] [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        primary:
          "bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-600",
        secondary:
          "border border-border-strong bg-surface text-navy-900 hover:bg-surface-subtle active:bg-blue-100",
        tertiary:
          "bg-transparent text-blue-700 hover:bg-blue-100 active:bg-blue-100",
        destructive:
          "bg-danger text-white hover:bg-[#991d15] active:bg-[#991d15]",
        "destructive-outline":
          "border border-danger-border bg-surface text-danger hover:bg-danger-bg",
        navy: "bg-navy-900 text-white hover:bg-blue-700 active:bg-blue-700",
      },
      size: {
        // §10.1: 46px mobile, 42px desktop.
        default: "h-[46px] px-4 lg:h-[42px]",
        sm: "h-[38px] px-3 text-meta",
        // Icon buttons are 44px square — §9.4 minimum touch target.
        icon: "size-[44px] p-0 lg:size-[40px]",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** Shows a spinner and blocks interaction without collapsing the button width. */
  loading?: boolean;
  /** Announced to screen readers while `loading` is true. */
  loadingLabel?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      loadingLabel = "Working…",
      disabled,
      children,
      ...props
    },
    ref,
  ) {
    const Comp = asChild ? Slot.Root : "button";

    // §10.1: "Loading state preserves width and shows progress without changing
    // label context." The label stays mounted and is made invisible rather than
    // swapped out, so the button cannot resize mid-action.
    if (loading && !asChild) {
      return (
        <button
          ref={ref}
          className={cn(
            buttonVariants({ variant, size }),
            "relative",
            className,
          )}
          disabled
          aria-busy="true"
          {...props}
        >
          <span className="invisible contents">{children}</span>
          <span className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="animate-spin" aria-hidden="true" />
          </span>
          <span className="sr-only">{loadingLabel}</span>
        </button>
      );
    }

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={asChild ? undefined : disabled}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);

export { buttonVariants };
