import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Circle,
  Clock,
  Info,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Status badge — style guide §10.5.
 * Height 24–28px, pill radius, label plus optional icon.
 *
 * Every variant pairs a colour with an icon *and* text because §3.4 and §14 both
 * forbid conveying status by colour alone. The icon is not decoration; removing
 * it breaks the accessibility contract.
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border px-2.5 py-0.5 text-meta font-medium whitespace-nowrap [&_svg]:size-3.5 [&_svg]:shrink-0",
  {
    variants: {
      tone: {
        neutral: "border-border-strong bg-surface-subtle text-text-secondary",
        success: "border-success-border bg-success-bg text-success",
        warning: "border-warning-border bg-warning-bg text-warning",
        danger: "border-danger-border bg-danger-bg text-danger",
        info: "border-info-border bg-info-bg text-info",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export type BadgeTone = NonNullable<VariantProps<typeof badgeVariants>["tone"]>;

const toneIcons: Record<
  BadgeTone,
  React.ComponentType<{ className?: string }>
> = {
  neutral: Circle,
  success: CheckCircle2,
  warning: Clock,
  danger: XCircle,
  info: Info,
};

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Overrides the tone's default icon. Pass `null` only for non-status chips. */
  icon?: React.ReactNode | null;
}

export function Badge({
  className,
  tone = "neutral",
  icon,
  children,
  ...props
}: BadgeProps) {
  const ToneIcon = toneIcons[tone ?? "neutral"];
  return (
    <span className={cn(badgeVariants({ tone }), className)} {...props}>
      {icon === null ? null : icon ? icon : <ToneIcon aria-hidden="true" />}
      {children}
    </span>
  );
}

/**
 * Canonical status → tone mapping (§10.5: "Use consistent mapping across
 * modules"). Modules must map their domain statuses through this table rather
 * than choosing colours ad hoc.
 *
 * Note §10.5's caveat: pending uses *warning gold*, never orange, so it can
 * never be confused with the orange primary action.
 */
export const STATUS_TONES = {
  // Lifecycle
  draft: "neutral",
  submitted: "info",
  under_review: "info",
  changes_requested: "warning",
  pending: "warning",
  pending_approval: "warning",
  approved: "success",
  active: "success",
  rejected: "danger",
  cancelled: "neutral",
  suspended: "danger",
  expired: "neutral",
  closed: "neutral",
  completed: "success",
  withdrawn: "neutral",
  on_hold: "warning",
  // Attendance (§11.3)
  present: "success",
  absent: "danger",
  late: "warning",
  excused: "info",
  leave: "info",
  unmarked: "neutral",
  // Money
  paid: "success",
  partially_paid: "warning",
  unpaid: "neutral",
  overdue: "danger",
  refunded: "info",
  reversed: "neutral",
  income: "success",
  expense: "neutral",
  // Exams and credentials
  retired: "neutral",
  scheduled: "info",
  passed: "success",
  failed: "danger",
  published: "success",
  archived: "neutral",
  withheld: "warning",
  issued: "success",
  revoked: "danger",
  superseded: "neutral",
  verified: "success",
  // Orders (§11.7)
  pending_payment: "warning",
  confirmed: "info",
  processing: "info",
  packed: "info",
  dispatched: "info",
  delivered: "success",
  returned: "neutral",
  // Referrals and commission
  attributed: "success",
  payable: "info",
  // Support tickets
  open: "warning",
  assigned: "info",
  waiting_on_support: "warning",
  waiting_on_requester: "info",
  resolved: "success",
  reopened: "warning",
} as const satisfies Record<string, BadgeTone>;

export type KnownStatus = keyof typeof STATUS_TONES;

/** Human label for a snake_case status. */
export function statusLabel(status: string): string {
  const words = status.replace(/_/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function StatusBadge({
  status,
  label,
  className,
}: {
  status: KnownStatus | (string & {});
  label?: string;
  className?: string;
}) {
  const tone = (STATUS_TONES as Record<string, BadgeTone>)[status] ?? "neutral";
  return (
    <Badge tone={tone} className={className}>
      {label ?? statusLabel(status)}
    </Badge>
  );
}

export { badgeVariants, AlertTriangle, Ban };
