import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { VIEWS } from "@/lib/roles";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, breadcrumbs, actions }: PageHeaderProps) {
  // The crumb trail starts at whichever dashboard this authorisation owns.
  const { view } = useAuth();
  return (
    <div className="mb-5 space-y-1">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="mb-3 flex items-center gap-1 overflow-hidden text-xs text-muted-foreground sm:text-sm">
          <Link href={VIEWS[view].home} className="hover:text-foreground transition-colors">
            <Home className="h-4 w-4" />
          </Link>
          {breadcrumbs.map((item, index) => (
            <div key={index} className="flex min-w-0 items-center gap-1">
              <ChevronRight className="h-4 w-4" />
              {item.href ? (
                <Link href={item.href} className="hover:text-foreground transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="truncate font-medium text-foreground">{item.label}</span>
              )}
            </div>
          ))}
        </nav>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.035em] sm:text-[1.65rem]">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {actions && <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end [&>button]:flex-1 sm:[&>button]:flex-none">{actions}</div>}
      </div>
    </div>
  );
}
