"use client";

import * as React from "react";
import { Tabs as RadixTabs } from "radix-ui";
import { cn } from "@/lib/utils";

/**
 * Tabs — style guide §10.7.
 * "Use tabs only for closely related views of one object." Maximum 5–6 visible
 * on desktop; mobile may scroll horizontally but must show the active position.
 * Never a substitute for primary navigation.
 */
export const Tabs = RadixTabs.Root;

export function TabsList({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadixTabs.List>) {
  return (
    <RadixTabs.List
      className={cn(
        "border-border flex gap-1 overflow-x-auto border-b",
        // Hide the scrollbar on mobile but keep the overflow scrollable.
        "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
      {...props}
    />
  );
}

export function TabsTrigger({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadixTabs.Trigger>) {
  return (
    <RadixTabs.Trigger
      className={cn(
        "text-label relative shrink-0 px-3 py-3 font-semibold whitespace-nowrap",
        "text-text-secondary hover:text-text",
        "min-h-[var(--size-touch-target)]",
        "transition-colors duration-[var(--duration-standard)]",
        // Active position is marked by an underline *and* a colour change, so
        // it is not communicated by colour alone (§14).
        "data-[state=active]:text-navy-900",
        "after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full",
        "data-[state=active]:after:bg-orange-500",
        "disabled:text-text-muted disabled:pointer-events-none",
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadixTabs.Content>) {
  return <RadixTabs.Content className={cn("pt-4", className)} {...props} />;
}
