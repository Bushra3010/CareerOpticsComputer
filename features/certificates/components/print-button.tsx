"use client";

import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * The browser's own print dialogue is the PDF renderer — see the print block
 * in globals.css for why there is no headless Chromium behind this.
 */
export function PrintButton({
  label = "Print or save as PDF",
}: {
  label?: string;
}) {
  return (
    <Button type="button" variant="secondary" onClick={() => window.print()}>
      <Printer aria-hidden="true" />
      {label}
    </Button>
  );
}
