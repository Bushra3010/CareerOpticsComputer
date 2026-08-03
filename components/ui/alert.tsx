import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Inline alert and banner — style guide §10.8.
 *
 * "Errors must state what happened and how to recover; avoid 'Something went
 * wrong' without a next step." The `recovery` prop is therefore required on the
 * danger tone rather than optional, so an unhelpful error cannot be written by
 * accident.
 */
const alertVariants = cva(
  "flex gap-3 rounded-[var(--radius-card)] border p-4 text-body [&_svg]:size-5 [&_svg]:shrink-0 [&_svg]:mt-0.5",
  {
    variants: {
      tone: {
        info: "border-info-border bg-info-bg text-text",
        success: "border-success-border bg-success-bg text-text",
        warning: "border-warning-border bg-warning-bg text-text",
        danger: "border-danger-border bg-danger-bg text-text",
      },
      /** `banner` spans the page for system-wide or time-sensitive messages. */
      display: {
        inline: "",
        banner: "rounded-none border-x-0 border-t-0",
      },
    },
    defaultVariants: { tone: "info", display: "inline" },
  },
);

type Tone = NonNullable<VariantProps<typeof alertVariants>["tone"]>;

const icons: Record<Tone, React.ComponentType<{ className?: string }>> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
};

const iconColour: Record<Tone, string> = {
  info: "text-info",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
};

export type AlertProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof alertVariants> & {
    title: string;
    /** What the user should do next. Required for the danger tone (§10.8). */
    recovery?: React.ReactNode;
    /** Trailing action, e.g. a Retry button. */
    action?: React.ReactNode;
  };

export function Alert({
  className,
  tone = "info",
  display,
  title,
  recovery,
  action,
  children,
  ...props
}: AlertProps) {
  const resolved = tone ?? "info";
  const Icon = icons[resolved];

  return (
    <div
      className={cn(alertVariants({ tone, display }), className)}
      // Errors and warnings interrupt; info and success do not.
      role={resolved === "danger" ? "alert" : "status"}
      {...props}
    >
      <Icon className={iconColour[resolved]} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-text font-semibold">{title}</p>
        {children ? (
          <div className="text-text-secondary mt-1">{children}</div>
        ) : null}
        {recovery ? (
          <p className="text-text-secondary mt-1">{recovery}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/**
 * Error summary for forms — §14: "Error summaries identify fields and link/focus
 * them." Render above the form and move focus here on failed submission.
 */
export function ErrorSummary({
  errors,
  className,
}: {
  errors: { field: string; label: string; message: string }[];
  className?: string;
}) {
  if (errors.length === 0) return null;

  return (
    <div
      role="alert"
      tabIndex={-1}
      className={cn(
        "border-danger-border bg-danger-bg rounded-[var(--radius-card)] border p-4",
        className,
      )}
    >
      <p className="text-text flex items-center gap-2 font-semibold">
        <XCircle className="text-danger size-5" aria-hidden="true" />
        {errors.length === 1
          ? "There is 1 problem with this form"
          : `There are ${errors.length} problems with this form`}
      </p>
      <ul className="mt-2 space-y-1">
        {errors.map((e) => (
          <li key={e.field}>
            <a
              href={`#${e.field}`}
              className="text-body text-danger underline underline-offset-2"
            >
              {e.label}: {e.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
