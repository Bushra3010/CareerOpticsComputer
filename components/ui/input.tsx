import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Input / Textarea / Select — style guide §10.2.
 * Heights: 48px mobile, 42px desktop. Border `border-default`; error uses the
 * semantic red. The label is never a placeholder — see `<Field>`.
 */
const controlBase = [
  "w-full rounded-[var(--radius-control)] border bg-surface",
  "px-3 text-body text-text placeholder:text-text-muted",
  "transition-colors duration-[var(--duration-standard)]",
  "disabled:cursor-not-allowed disabled:bg-surface-subtle disabled:text-text-muted",
  "aria-[invalid=true]:border-danger",
];

const controlHeight = "h-12 lg:h-[42px]";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(controlBase, controlHeight, "border-border", className)}
      {...props}
    />
  );
});

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(controlBase, "border-border min-h-24 py-2.5", className)}
      {...props}
    />
  );
});

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className, children, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn(
        controlBase,
        controlHeight,
        "border-border appearance-none pr-9",
        // Chevron drawn as a background image so the control stays a native
        // <select> — native pickers are better on mobile than a custom listbox.
        "bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%235E687B%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22m6 9 6 6 6-6%22/></svg>')]",
        "bg-[position:right_0.75rem_center] bg-no-repeat",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
});
