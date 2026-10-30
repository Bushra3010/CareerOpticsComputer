import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ACTION_LABELS, actionOf, labelAllowed, type Action } from "@/lib/permissions";

/** Controls that perform something: buttons, menu entries, submit inputs. */
const CONTROL = 'button, [role="menuitem"], input[type="submit"], a[data-perm]';

const labelOf = (el: Element) =>
  el.getAttribute("aria-label") || el.textContent || (el as HTMLInputElement).value || "";

/**
 * Applies the role's action permissions to whatever page it wraps.
 *
 * A role may open a page (View) but not, say, add or delete on it. Every
 * page's actions are buttons, so rather than threading a check into each of
 * them this reads what a control does from its words -- "Add subject",
 * "Delete", "Download CSV" -- or from an explicit data-perm="create|edit|…"
 * where the words would mislead. Refused controls are dimmed, and a click on
 * one is stopped before the page sees it and explained instead. Menus open in
 * a portal outside the page, so the click check listens on the document.
 *
 * With no restrictions on the page (the default for every role) it does
 * nothing at all.
 */
export function PermissionGuard({ children }: { children: React.ReactNode }) {
  const { permissions } = useAuth();
  const { pathname } = useLocation();
  const { toast } = useToast();
  const root = useRef<HTMLDivElement>(null);
  const restricted = Array.isArray(permissions?.[pathname]);

  const allowedEl = (el: Element) => {
    const explicit = el.getAttribute("data-perm");
    if (explicit) return labelAllowed(permissions, pathname, explicit === "save" ? "save" : ACTION_LABELS[explicit as Action] || explicit);
    return labelAllowed(permissions, pathname, labelOf(el));
  };

  // Stop the click before React's handlers run.
  useEffect(() => {
    if (!restricted) return;
    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const control = target?.closest?.(CONTROL);
      if (!control || control.closest("[data-perm-ignore]")) return;
      const inPage = root.current?.contains(control);
      const inPortal = control.closest("[data-radix-popper-content-wrapper], [role='dialog'], [role='menu']");
      if (!inPage && !inPortal) return;
      if (allowedEl(control)) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      const action = actionOf(control.getAttribute("data-perm") || labelOf(control));
      toast({
        title: "Permission nahi hai",
        description: `Your role cannot ${action === "save" ? "add or edit" : ACTION_LABELS[action as Action]?.toLowerCase() || "do this"} on this page. Ask the administrator to allow it under Access Control.`,
        variant: "destructive",
      });
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restricted, permissions, pathname, toast]);

  // Dim what is refused, and keep doing so as the page renders more.
  useEffect(() => {
    if (!restricted) return;
    const mark = () => {
      const scopes: Element[] = [root.current, ...document.querySelectorAll("[data-radix-popper-content-wrapper], [role='dialog']")].filter(Boolean) as Element[];
      for (const scope of scopes) {
        scope.querySelectorAll(CONTROL).forEach((el) => {
          if (el.closest("[data-perm-ignore]")) return;
          const denied = !allowedEl(el);
          if (denied && el.getAttribute("data-perm-denied") !== "true") {
            el.setAttribute("data-perm-denied", "true");
            el.setAttribute("aria-disabled", "true");
            el.setAttribute("title", "Your role does not have permission for this");
          } else if (!denied && el.getAttribute("data-perm-denied") === "true") {
            el.removeAttribute("data-perm-denied");
            el.removeAttribute("aria-disabled");
            el.removeAttribute("title");
          }
        });
      }
    };
    mark();
    const observer = new MutationObserver(() => mark());
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => {
      observer.disconnect();
      document.querySelectorAll("[data-perm-denied]").forEach((el) => {
        el.removeAttribute("data-perm-denied");
        el.removeAttribute("aria-disabled");
        el.removeAttribute("title");
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restricted, permissions, pathname]);

  return <div ref={root}>{children}</div>;
}
