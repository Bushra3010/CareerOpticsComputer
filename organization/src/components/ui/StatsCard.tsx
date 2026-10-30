import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "primary" | "success" | "warning" | "info";
  className?: string;
}

// The DriveWay stat card: white with a soft shadow, or, for the one figure a
// screen leads with, the blue gradient with white text.
const variantStyles = {
  default: "bg-card",
  primary: "border-transparent bg-[linear-gradient(150deg,hsl(var(--brand-ink)),hsl(var(--primary)))] text-white shadow-[0_10px_24px_rgba(11,92,255,0.25)]",
  success: "bg-card",
  warning: "bg-card",
  info: "bg-card",
};

const iconVariantStyles = {
  default: "bg-accent text-accent-foreground",
  primary: "bg-white/15 text-white",
  success: "bg-success/10 text-success",
  warning: "bg-gold/15 text-[hsl(37_91%_38%)]",
  info: "bg-info/10 text-info",
};

const valueVariantStyles = {
  default: "",
  primary: "text-white",
  success: "text-success",
  warning: "text-[hsl(37_91%_42%)]",
  info: "",
};

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
  className,
}: StatsCardProps) {
  const blue = variant === "primary";
  return (
    <Card className={cn("stats-card press transition-all", variantStyles[variant], className)}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className={cn("text-[12.5px] font-medium", blue ? "text-white/75" : "text-muted-foreground")}>{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className={cn("text-2xl font-extrabold tracking-[-0.02em]", valueVariantStyles[variant])}>{value}</h3>
              {trend && (
                <span
                  className={cn(
                    "text-xs font-semibold",
                    blue ? "text-gold" : trend.isPositive ? "text-success" : "text-destructive"
                  )}
                >
                  {trend.isPositive ? "+" : ""}{trend.value}%
                </span>
              )}
            </div>
            {subtitle && (
              <p className={cn("text-[11.5px] font-medium", blue ? "text-gold" : "text-muted-foreground")}>{subtitle}</p>
            )}
          </div>
          <div className={cn("hidden shrink-0 rounded-xl p-2.5 min-[400px]:block", iconVariantStyles[variant])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
