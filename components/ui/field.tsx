import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Field — the label + control + help + error wrapper required by style guide §10.2:
 * "Label always appears above the field. Placeholder never replaces the label."
 *
 * Wiring `aria-describedby` and `aria-invalid` is the whole point of this
 * component; controls should not be rendered bare in forms.
 */
export interface FieldProps {
  id: string;
  label: string;
  /** Renders the required marker and sets `aria-required` on the control. */
  required?: boolean;
  /** Guidance shown below the control when there is no error. */
  help?: React.ReactNode;
  /** Specific, actionable message (§8.2 of the PRD, §10.8 of the style guide). */
  error?: string;
  className?: string;
  children: React.ReactElement<React.HTMLAttributes<HTMLElement>>;
}

export function Field({
  id,
  label,
  required,
  help,
  error,
  className,
  children,
}: FieldProps) {
  const helpId = help ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, helpId].filter(Boolean).join(" ") || undefined;

  const control = React.cloneElement(children, {
    id,
    "aria-describedby": describedBy,
    "aria-invalid": error ? true : undefined,
    "aria-required": required || undefined,
  } as React.HTMLAttributes<HTMLElement>);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-label text-text font-semibold">
        {label}
        {required ? (
          <span className="text-danger ml-0.5" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>

      {control}

      {/* Error replaces help rather than stacking, so the control does not shift
          by two lines when validation fires (§10.2). */}
      {error ? (
        <p id={errorId} className="text-meta text-danger" role="alert">
          {error}
        </p>
      ) : help ? (
        <p id={helpId} className="text-meta text-text-secondary">
          {help}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Explains the required-field convention once per form (§10.2:
 * "Required indicators are consistent and explained once per form").
 */
export function RequiredLegend({ className }: { className?: string }) {
  return (
    <p className={cn("text-meta text-text-secondary", className)}>
      Fields marked <span className="text-danger">*</span> are required.
    </p>
  );
}
