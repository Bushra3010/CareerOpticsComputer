import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

/**
 * The classic centre-panel look, shared by every page of the centre panel:
 * a white panel under a slate header bar with one coloured action at its
 * right, plain bordered tables, a four-column form grid and flat buttons.
 */

export const DCE = {
  teal: "#38c3be",
  slate: "#3d4451",
  blue: "#2d8fd5",
  red: "#f26b6b",
  green: "#3ecf8e",
  orange: "#f5a623",
};

type Tone = "blue" | "red" | "green" | "teal" | "slate" | "orange" | "light";
const TONES: Record<Tone, string> = {
  blue: "bg-[#2d8fd5] text-white hover:bg-[#2479b8]",
  red: "bg-[#f26b6b] text-white hover:bg-[#e45454]",
  green: "bg-[#3ecf8e] text-white hover:bg-[#2fb878]",
  teal: "bg-[#38c3be] text-white hover:bg-[#2fa9a5]",
  slate: "bg-[#3d4451] text-white hover:bg-[#2f3540]",
  orange: "bg-[#f5a623] text-white hover:bg-[#dd9214]",
  light: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50",
};

const BTN = "inline-flex items-center justify-center gap-1.5 rounded px-3.5 py-2 text-[13px] font-medium transition disabled:cursor-not-allowed disabled:opacity-60";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: Tone; size?: "sm" | "md" };
export const DceButton = forwardRef<HTMLButtonElement, ButtonProps>(function DceButton(
  { tone = "blue", size = "md", className, type = "button", ...rest },
  ref,
) {
  return <button ref={ref} type={type} className={cn(BTN, TONES[tone], size === "sm" && "px-2.5 py-1 text-[12px]", className)} {...rest} />;
});

export function DceLinkButton({ to, tone = "blue", size = "md", className, children }: { to: string; tone?: Tone; size?: "sm" | "md"; className?: string; children: React.ReactNode }) {
  const external = /^(https?:|tel:|mailto:)/.test(to);
  const cls = cn(BTN, TONES[tone], size === "sm" && "px-2.5 py-1 text-[12px]", className);
  return external ? <a href={to} target={to.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className={cls}>{children}</a> : <Link to={to} className={cls}>{children}</Link>;
}

/** A white panel under a slate bar: "MANAGE STUDENTS - ALL" with its action on the right. */
export function DcePanel({ title, actions, children, className, bodyClassName }: { title: React.ReactNode; actions?: React.ReactNode; children: React.ReactNode; className?: string; bodyClassName?: string }) {
  return (
    <section className={cn("overflow-hidden rounded-sm bg-white shadow-sm", className)}>
      <header className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5 text-white" style={{ background: DCE.slate }}>
        <h2 className="text-[14.5px] font-bold">{title}</h2>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </header>
      <div className={cn("p-4 sm:p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

export interface DceColumn<T> {
  key: string;
  label: string;
  render: (row: T, index: number) => React.ReactNode;
  className?: string;
}

/** A plain bordered table that scrolls sideways on a phone. */
export function DceTable<T>({ columns, rows, rowKey, empty = "No records found.", loading }: { columns: DceColumn<T>[]; rows: T[]; rowKey: (row: T) => string; empty?: string; loading?: boolean }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-[13px]">
        <thead>
          <tr className="border-b-2 border-slate-200 text-left">
            {columns.map((c) => (
              <th key={c.key} className={cn("whitespace-nowrap px-3 py-2.5 font-bold text-slate-700", c.className)}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr><td colSpan={columns.length} className="px-3 py-8 text-center text-slate-500">Loading…</td></tr>
          )}
          {!loading && rows.length === 0 && (
            <tr><td colSpan={columns.length} className="px-3 py-8 text-center text-slate-500">{empty}</td></tr>
          )}
          {!loading && rows.map((row, i) => (
            <tr key={rowKey(row)} className="border-b border-slate-100 align-top hover:bg-slate-50/70">
              {columns.map((c) => (
                <td key={c.key} className={cn("px-3 py-3 text-slate-700", c.className)}>{c.render(row, i)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const STATUS_TONE: Record<string, string> = {
  ACTIVE: "bg-[#3ecf8e]", APPROVED: "bg-[#3ecf8e]", COMPLETED: "bg-[#3ecf8e]", RESOLVED: "bg-[#3ecf8e]", PAID: "bg-[#3ecf8e]", DISPATCHED: "bg-[#3ecf8e]", PRESENT: "bg-[#3ecf8e]",
  PENDING: "bg-[#f5a623]", SUBMITTED: "bg-[#f5a623]", OPEN: "bg-[#f5a623]", IN_PROGRESS: "bg-[#2d8fd5]", PARTIAL: "bg-[#f5a623]", "NOT MARKED": "bg-[#f5a623]",
  INACTIVE: "bg-slate-400", CLOSED: "bg-slate-400", REJECTED: "bg-[#f26b6b]", DEACTIVATED: "bg-[#f26b6b]", DUE: "bg-[#f26b6b]", ABSENT: "bg-[#f26b6b]",
};
export function DceBadge({ status, label }: { status: string; label?: string }) {
  const key = status.toUpperCase();
  return <span className={cn("inline-block whitespace-nowrap rounded px-2 py-0.5 text-[11px] font-bold uppercase text-white", STATUS_TONE[key] || "bg-slate-500")}>{label || status.replaceAll("_", " ")}</span>;
}

/** The four-column form grid; a field may span more columns. */
export function DceGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2 lg:grid-cols-4", className)}>{children}</div>;
}

export function DceField({ label, required, span = 1, hint, children }: { label: string; required?: boolean; span?: 1 | 2 | 3 | 4; hint?: string; children: React.ReactNode }) {
  const spans = { 1: "", 2: "sm:col-span-2", 3: "sm:col-span-2 lg:col-span-3", 4: "sm:col-span-2 lg:col-span-4" };
  return (
    <label className={cn("block", spans[span])}>
      <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">{label}{required && <span className="text-[#f26b6b]"> *</span>}</span>
      {children}
      {hint && <span className="mt-1 block text-[11.5px] text-slate-500">{hint}</span>}
    </label>
  );
}

const CONTROL = "w-full rounded border border-slate-300 bg-white px-3 py-2 text-[13px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#38c3be] focus:ring-2 focus:ring-[#38c3be]/20 disabled:bg-slate-100";

export const DceInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function DceInput({ className, ...rest }, ref) {
  return <input ref={ref} className={cn(CONTROL, className)} {...rest} />;
});

export const DceSelect = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(function DceSelect({ className, ...rest }, ref) {
  return <select ref={ref} className={cn(CONTROL, "pr-8", className)} {...rest} />;
});

export const DceTextarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(function DceTextarea({ className, ...rest }, ref) {
  return <textarea ref={ref} className={cn(CONTROL, "min-h-[80px]", className)} {...rest} />;
});

/** A thin rule between groups of fields, as the classic forms have. */
export function DceDivider() {
  return <hr className="my-5 border-slate-200" />;
}

export const inr = (n: number | string | null | undefined) => `₹${Math.round(Number(n || 0)).toLocaleString("en-IN")}`;
export const shortDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—");
