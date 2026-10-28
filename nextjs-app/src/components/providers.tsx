"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ToasterProvider } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="theme">
        <TooltipProvider>
          {children}
          <ToasterProvider />
          <Sonner />
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
