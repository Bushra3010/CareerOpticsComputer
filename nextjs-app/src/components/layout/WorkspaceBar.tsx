"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, Cloud, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { menuForView } from "@/lib/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const formRoutes = /\/(create|add|setup|template|allocation|assign|collection|mark|general|gateway|qr|admission-form|question-paper-builder|access-control|website-settings|voucher)/;

export function WorkspaceBar() {
  const pathname = usePathname();
  const { toast } = useToast();
  const { view } = useAuth();
  const group = useMemo(() => menuForView(view).find(item => item.items.some(child => pathname === child.url)), [pathname, view]);
  const isWorkflow = formRoutes.test(pathname);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isWorkflow) return;
    const updateProgress = () => {
      const fields = Array.from(document.querySelectorAll<HTMLElement>("main input:not([type=hidden]):not([type=button]):not([type=submit]), main textarea, main button[role=combobox]"))
        .filter(field => field.getAttribute("aria-hidden") !== "true");
      if (!fields.length) return setProgress(0);
      const complete = fields.filter(field => {
        if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) return Boolean(field.value.trim());
        return Boolean(field.textContent?.trim() && !/select|choose/i.test(field.textContent));
      }).length;
      setProgress(Math.round(complete / fields.length * 100));
    };
    const timer = window.setTimeout(updateProgress, 250);
    document.addEventListener("input", updateProgress);
    document.addEventListener("change", updateProgress);
    return () => { window.clearTimeout(timer); document.removeEventListener("input", updateProgress); document.removeEventListener("change", updateProgress); };
  }, [pathname, isWorkflow]);

  const saveDraft = () => {
    const values = Array.from(document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("main input, main textarea")).reduce<Record<string, string>>((all, field, index) => {
      if (field.type !== "password" && field.type !== "file") all[field.name || field.id || `field-${index}`] = field.value;
      return all;
    }, {});
    localStorage.setItem(`erp-draft:${pathname}`, JSON.stringify({ savedAt: new Date().toISOString(), values }));
    toast({ title: "Draft saved", description: `${progress}% complete · stored safely on this device.` });
  };

  if (!group) return null;
  return (
    <div className="sticky top-[60px] z-30 border-b border-border/70 bg-background/90 px-2 backdrop-blur-xl sm:top-[68px] sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1600px] items-center gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto py-2 [scrollbar-width:none]">
          <span className="mr-2 hidden shrink-0 text-[10px] font-bold uppercase tracking-[.16em] text-muted-foreground lg:block">{group.title}</span>
          {group.items.map(item => {
            const Icon = item.icon;
            if (!Icon) return null;
            return (
            <Link key={item.url} href={item.url} className={cn("shrink-0 rounded-xl px-3 py-2 text-xs font-medium transition-all hover:bg-muted", pathname === item.url ? "bg-foreground text-background shadow-sm" : "text-muted-foreground")}>
              <Icon className="mr-1.5 inline h-3.5 w-3.5" />{item.title}
            </Link>
            );
          })}
        </div>
        {isWorkflow && (
          <div className="shrink-0 border-l pl-2 sm:pl-3">
            <Button variant="ghost" size="sm" onClick={saveDraft} className="px-2 sm:px-3">
              {progress === 100 ? <Check /> : <Save />}
              <span className="hidden sm:inline">Save draft</span>
              <span className="text-[10px] sm:hidden">{progress}%</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
