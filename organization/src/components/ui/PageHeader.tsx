import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";
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
  // The classic panel: the page strip above already carries the breadcrumb, so
  // this is the slate title bar with the page's actions on its right.
  return (
    <div className="mb-4">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="hidden" aria-label="Breadcrumb">
          <Link to={VIEWS[view].home}>
            <Home className="h-4 w-4" />
          </Link>
          {breadcrumbs.map((item, index) => (
            <div key={index}>
              <ChevronRight className="h-4 w-4" />
              {item.href ? <Link to={item.href}>{item.label}</Link> : <span>{item.label}</span>}
            </div>
          ))}
        </nav>
      )}
      <div className="flex flex-col gap-3 rounded-sm bg-[#3d4451] px-5 py-3.5 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-[15px] font-bold">{title}</h1>
          {description && <p className="mt-0.5 text-[12.5px] text-white/70">{description}</p>}
        </div>
        {actions && <div className="classic-actions flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end [&>button]:flex-1 sm:[&>button]:flex-none">{actions}</div>}
      </div>
    </div>
  );
}
