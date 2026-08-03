"use client";

import * as React from "react";
import { Drawer } from "vaul";
import { cn } from "@/lib/utils";

/**
 * Bottom sheet — style guide §9.3 and §10.6.
 * "Mobile uses bottom sheet for filters/short actions"; "Filters: bottom sheet
 * with Apply and Reset actions"; "Sticky footer contains primary and secondary
 * actions."
 *
 * Radius is 20px on the top corners only (§5.2). Content scrolls inside the
 * sheet so the sticky footer never leaves the viewport.
 */
export const BottomSheet = Drawer.Root;
export const BottomSheetTrigger = Drawer.Trigger;
export const BottomSheetClose = Drawer.Close;

export function BottomSheetContent({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof Drawer.Content>) {
  return (
    <Drawer.Portal>
      <Drawer.Overlay className="bg-overlay fixed inset-0 z-50" />
      <Drawer.Content
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 flex max-h-[90dvh] flex-col",
          "border-border bg-surface rounded-t-[var(--radius-sheet)] border-t",
          "shadow-float outline-none",
          className,
        )}
        {...props}
      >
        {/* Grab handle — a visual affordance only; the sheet is also closable
            by Escape and by the explicit footer actions. */}
        <div
          className="bg-border-strong mx-auto mt-3 h-1 w-10 shrink-0 rounded-full"
          aria-hidden="true"
        />
        {children}
      </Drawer.Content>
    </Drawer.Portal>
  );
}

export function BottomSheetHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("shrink-0 p-4 pb-3", className)} {...props} />;
}

export function BottomSheetTitle({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Drawer.Title>) {
  return (
    <Drawer.Title
      className={cn("text-section text-navy-900", className)}
      {...props}
    />
  );
}

export function BottomSheetDescription({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Drawer.Description>) {
  return (
    <Drawer.Description
      className={cn("text-meta text-text-secondary mt-1", className)}
      {...props}
    />
  );
}

/** Scrollable region between the header and the sticky footer. */
export function BottomSheetBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("min-h-0 flex-1 overflow-y-auto px-4 pb-4", className)}
      {...props}
    />
  );
}

/** Sticky footer (§10.6), padded past the home indicator (§9.4). */
export function BottomSheetFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "border-border bg-surface pb-safe shrink-0 border-t p-4",
        "flex gap-3 [&>*]:flex-1",
        className,
      )}
      {...props}
    />
  );
}
