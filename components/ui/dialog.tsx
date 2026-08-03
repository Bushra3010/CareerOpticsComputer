"use client";

import * as React from "react";
import { Dialog as RadixDialog } from "radix-ui";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

/**
 * Dialog — style guide §10.6.
 * Desktop max width 560px for confirmations, up to 800px for structured detail.
 * Radix handles focus trapping and focus return, which §14 requires.
 *
 * On mobile this renders as a centred dialog; use `<BottomSheet>` for filters
 * and short actions, and a full-screen route for long forms (§10.6).
 */
export const Dialog = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;
export const DialogClose = RadixDialog.Close;

export function DialogContent({
  className,
  children,
  size = "default",
  ...props
}: React.ComponentPropsWithoutRef<typeof RadixDialog.Content> & {
  size?: "default" | "wide";
}) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay
        className={cn(
          "bg-overlay fixed inset-0 z-50",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
        )}
      />
      <RadixDialog.Content
        className={cn(
          "fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2",
          size === "wide" ? "max-w-[800px]" : "max-w-[560px]",
          "max-h-[calc(100dvh-2rem)] overflow-y-auto",
          "border-border bg-surface shadow-float rounded-[var(--radius-dialog)] border",
          "duration-[var(--duration-sheet)]",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          className,
        )}
        {...props}
      >
        {children}
        <RadixDialog.Close
          className="text-text-secondary hover:bg-surface-subtle absolute top-3 right-3 grid size-11 place-items-center rounded-[var(--radius-chip)] lg:size-9"
          aria-label="Close dialog"
        >
          <X className="size-5" aria-hidden="true" />
        </RadixDialog.Close>
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
}

export function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 p-4 pr-14 lg:p-6 lg:pr-14",
        className,
      )}
      {...props}
    />
  );
}

export function DialogTitle({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadixDialog.Title>) {
  return (
    <RadixDialog.Title
      className={cn("text-section text-navy-900", className)}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadixDialog.Description>) {
  return (
    <RadixDialog.Description
      className={cn("text-body text-text-secondary", className)}
      {...props}
    />
  );
}

export function DialogBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-4 pb-4 lg:px-6 lg:pb-6", className)} {...props} />
  );
}

export function DialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        // Mobile stacks with the primary action on top of the thumb reach;
        // desktop right-aligns with the primary action last.
        "border-border flex flex-col-reverse gap-3 border-t p-4 lg:flex-row lg:justify-end lg:px-6",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Confirmation dialog for destructive and irreversible actions.
 * §10.6: "Destructive dialogs clearly name the target and consequence."
 * PRD §4.1 additionally requires a typed reason for privileged actions — pass
 * `requireReason` for refunds, revocations, wallet adjustments and role changes.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  target,
  consequence,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = true,
  requireReason = false,
  loading = false,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** The specific record being acted on, e.g. "Receipt RCP-DL01-2627-000902". */
  target: string;
  /** What will happen, in plain English, including what cannot be undone. */
  consequence: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  requireReason?: boolean;
  loading?: boolean;
  onConfirm: (reason?: string) => void;
}) {
  const [reason, setReason] = React.useState("");
  const reasonId = React.useId();
  const canConfirm = !requireReason || reason.trim().length >= 10;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            <span className="text-text font-semibold">{target}</span>
            <br />
            {consequence}
          </DialogDescription>
        </DialogHeader>

        {requireReason ? (
          <DialogBody>
            <label
              htmlFor={reasonId}
              className="text-label text-text font-semibold"
            >
              Reason<span className="text-danger ml-0.5">*</span>
            </label>
            <textarea
              id={reasonId}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="border-border bg-surface text-body mt-1.5 min-h-20 w-full rounded-[var(--radius-control)] border px-3 py-2.5"
              placeholder="Recorded in the audit log against your account."
            />
            <p className="text-meta text-text-secondary mt-1.5">
              At least 10 characters. This is stored permanently and is visible
              to head office.
            </p>
          </DialogBody>
        ) : null}

        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? "destructive" : "primary"}
            loading={loading}
            disabled={!canConfirm}
            onClick={() => onConfirm(requireReason ? reason : undefined)}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
