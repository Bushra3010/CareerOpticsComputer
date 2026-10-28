import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Check, Cloud, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { menuFor } from "@/lib/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const formRoutes = /\/(create|add|setup|template|allocation|assign|collection|mark|general|gateway|qr|admission-form|question-paper-builder|access-control|website-settings|voucher)/;

export function WorkspaceBar() {
  const location = useLocation();
  const { toast } = useToast();
  const { view, allowedPaths } = useAuth();
  const group = useMemo(() => menuFor(view, allowedPaths).find(item => item.items.some(child => location.pathname === child.url)), [location.pathname, view, allowedPaths]);
  const isWorkflow = formRoutes.test(location.pathname);
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
  }, [location.pathname, isWorkflow]);

  const saveDraft = () => {
    const values = Array.from(document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("main input, main textarea")).reduce<Record<string,string>>((all, field, index) => {
      if (field.type !== "password" && field.type !== "file") all[field.name || field.id || `field-${index}`] = field.value;
      return all;
    }, {});
    localStorage.setItem(`erp-draft:${location.pathname}`, JSON.stringify({ savedAt: new Date().toISOString(), values }));
    toast({ title: "Draft saved", description: `${progress}% complete · stored safely on this device.` });
  };

  // On a phone, bring the open tab into the scrolling row once per page.
  const activeTab = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    activeTab.current?.scrollIntoView?.({ block: "nearest", inline: "center" });
  }, [location.pathname]);

  if (!group) return null;
  return <div className="sticky top-[64px] z-30 bg-background/85 px-4 pb-1 backdrop-blur-xl sm:top-[72px] sm:px-6 lg:px-8">
    <div className="mx-auto flex max-w-[1600px] items-center gap-3">
      {/* DriveWay pill tabs: a white track, the open page as a blue pill. On
          a desktop every tab is in sight -- the row wraps rather than scrolls
          sideways. The module's name is not repeated here: the page's own
          breadcrumb already carries it, and here it only pushed tabs off. On a
          phone the row scrolls, with the open tab brought into view. */}
      <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto rounded-full bg-card p-1 shadow-card [scrollbar-width:none] md:flex-wrap md:overflow-visible md:rounded-[22px]">
        {group.items.map(item => {
          const open = location.pathname === item.url;
          return <Link key={item.url} to={item.url} ref={open ? activeTab : undefined} className={cn("shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-[13px] transition-colors", open ? "bg-primary font-semibold text-primary-foreground" : "font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground")}><item.icon className="mr-1.5 inline h-3.5 w-3.5"/>{item.title}</Link>;
        })}
      </div>
      {isWorkflow && <div className="shrink-0"><Button variant="ghost" size="sm" onClick={saveDraft} className="px-2 sm:px-3">{progress===100?<Check/>:<Save/>}<span className="hidden sm:inline">Save draft</span><span className="text-[10px] sm:hidden">{progress}%</span></Button></div>}
    </div>
  </div>;
}
