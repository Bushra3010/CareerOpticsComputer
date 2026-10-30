import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, LogIn, Search, Undo2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { getBranchDirectory } from "@/lib/supabase/data";

const ROW = "flex items-center gap-2.5 rounded-xl bg-white/[.08] px-3 py-2.5 text-[13.5px] font-medium text-white transition-colors hover:bg-white/[.14] group-data-[collapsible=icon]:justify-center";

/**
 * The sidebar's foot for an organisation admin: "Login as center" opens any
 * centre's own panel, found by name or district; while working as one, the
 * same place leads back. Signing out lives in the header's account menu.
 */
export function CentreSwitcher({ collapsed }: { collapsed: boolean }) {
  const { realView, actingAs, actAsCentre, organizationId } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [centres, setCentres] = useState<Array<{ id: string; name: string; district: string }>>([]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    getBranchDirectory(organizationId ?? null)
      .then((r) => { if (!cancelled) setCentres(r.data); })
      .catch(() => { if (!cancelled) setCentres([]); });
    return () => { cancelled = true; };
  }, [open, organizationId]);

  if (realView !== "admin" || actingAs?.studentId) return null;

  if (actingAs) {
    return (
      <button type="button" className={ROW} onClick={() => { actAsCentre(null); navigate("/"); }}>
        <Undo2 className="h-[18px] w-[18px] shrink-0" />
        {!collapsed && <span className="truncate">Back to admin</span>}
      </button>
    );
  }

  const needle = query.trim().toLowerCase();
  const shown = centres.filter((c) => !needle || `${c.name} ${c.district}`.toLowerCase().includes(needle));

  return (
    <>
      <button type="button" className={ROW} onClick={() => { setQuery(""); setOpen(true); }}>
        <LogIn className="h-[18px] w-[18px] shrink-0" />
        {!collapsed && "Login as center"}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Login as center</DialogTitle>
            <DialogDescription>Open a centre's own panel. You stay signed in as yourself, and can come back at any time.</DialogDescription>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search center or district…" aria-label="Search center" className="pl-9" />
          </div>
          <div className="max-h-80 space-y-1 overflow-y-auto">
            {shown.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  actAsCentre({ branchId: c.id, name: c.name });
                  setOpen(false);
                  navigate("/");
                }}
                className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left hover:bg-accent"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground"><Building2 className="h-4 w-4" /></span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{c.name}</span>
                  {c.district && <span className="block text-xs text-muted-foreground">{c.district}</span>}
                </span>
              </button>
            ))}
            {!shown.length && <p className="p-3 text-sm text-muted-foreground">{centres.length ? `No center matches "${query}".` : "Loading centers…"}</p>}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
