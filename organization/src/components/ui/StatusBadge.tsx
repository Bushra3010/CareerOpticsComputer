import { cn } from "@/lib/utils";

type StatusType = "active" | "inactive" | "pending" | "paid" | "due" | "partial" | "completed" | "cancelled" | "upcoming" | "new" | "contacted" | "interested" | "converted" | "closed" | "reviewed" | "responded" | "scheduled" | "visited" | "applied" | "approved" | "rejected" | "under_review" | "overdue" | "due_today" | "due_soon" | "absent" | "in_progress";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusStyles: Record<StatusType, string> = {
  active: "bg-success/10 text-success border-success/20",
  inactive: "bg-muted text-muted-foreground border-muted",
  pending: "bg-warning/10 text-warning border-warning/20",
  paid: "bg-success/10 text-success border-success/20",
  due: "bg-destructive/10 text-destructive border-destructive/20",
  partial: "bg-info/10 text-info border-info/20",
  completed: "bg-success/10 text-success border-success/20",
  cancelled: "bg-muted text-muted-foreground border-muted",
  upcoming: "bg-primary/10 text-primary border-primary/20",
  new: "bg-primary/10 text-primary border-primary/20",
  contacted: "bg-info/10 text-info border-info/20",
  interested: "bg-warning/10 text-warning border-warning/20",
  converted: "bg-success/10 text-success border-success/20",
  closed: "bg-muted text-muted-foreground border-muted",
  reviewed: "bg-info/10 text-info border-info/20",
  responded: "bg-success/10 text-success border-success/20",
  scheduled: "bg-warning/10 text-warning border-warning/20",
  visited: "bg-info/10 text-info border-info/20",
  applied: "bg-success/10 text-success border-success/20",
  approved: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
  under_review: "bg-warning/10 text-warning border-warning/20",
  overdue: "bg-destructive/10 text-destructive border-destructive/20",
  due_today: "bg-warning/10 text-warning border-warning/20",
  due_soon: "bg-info/10 text-info border-info/20",
  absent: "bg-destructive/10 text-destructive border-destructive/20",
  in_progress: "bg-info/10 text-info border-info/20",
};

const statusLabels: Record<StatusType, string> = {
  active: "Active",
  inactive: "Inactive",
  pending: "Pending",
  paid: "Paid",
  due: "Due",
  partial: "Partial",
  completed: "Completed",
  cancelled: "Cancelled",
  upcoming: "Upcoming",
  new: "New",
  contacted: "Contacted",
  interested: "Interested",
  converted: "Converted",
  closed: "Closed",
  reviewed: "Reviewed",
  responded: "Responded",
  scheduled: "Scheduled",
  visited: "Visited",
  applied: "Applied",
  approved: "Approved",
  rejected: "Rejected",
  under_review: "Under Review",
  overdue: "Overdue",
  due_today: "Due Today",
  due_soon: "Due Soon",
  absent: "Absent",
  in_progress: "In Progress",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        statusStyles[status],
        className
      )}
    >
      {statusLabels[status]}
    </span>
  );
}
