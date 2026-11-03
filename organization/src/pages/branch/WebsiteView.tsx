import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable, type Column, type TableFilter } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Building2, Download, ExternalLink, Globe, Loader2, MessageCircle, Phone } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { downloadCsv } from "@/lib/export";
import { formatPhone, telHref, whatsappHref } from "@/lib/phone";
import { asDay, licenceState, type LicenceState } from "@/lib/websiteLicence";
import { getBranchWebsites, type BranchWebsiteRow } from "@/lib/supabase/data";
import { DOMAIN_STATUS_LABEL, hostnameError, normaliseHost, siteLink, type DomainStatus } from "@/lib/branchSite";
import { manageDomain, updateSiteAdmin, type DomainAction } from "@/lib/supabase/branchSites";

/* The badge carries the state, not the date: a column of dates is something
   the reader has to do arithmetic on, which is the work this page removes. */
const LICENCE_STYLE: Record<LicenceState, string> = {
  Active: "border-success/25 bg-success/12 text-success",
  "Expiring soon": "border-warning/25 bg-warning/12 text-warning",
  Expired: "border-destructive/25 bg-destructive/12 text-destructive",
  "No date": "border-border bg-muted text-muted-foreground",
};

const DOMAIN_STYLE: Record<DomainStatus, string> = {
  NONE: "border-border bg-muted text-muted-foreground",
  PENDING: "border-warning/25 bg-warning/12 text-warning",
  LIVE: "border-success/25 bg-success/12 text-success",
  ERROR: "border-destructive/25 bg-destructive/12 text-destructive",
};

const ACTION_LABEL: Record<DomainAction, string> = { add: "Connect domain", check: "Check status", remove: "Remove" };

export default function WebsiteView() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rows, setRows] = useState<BranchWebsiteRow[]>([]);
  const [loading, setLoading] = useState(true);
  /** branchId → what is running for it, so its buttons show it and wait. */
  const [busy, setBusy] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<BranchWebsiteRow | null>(null);
  const [domainInput, setDomainInput] = useState("");

  const patchRow = (id: string, patch: Partial<BranchWebsiteRow>) =>
    setRows((list) => list.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const work = async (row: BranchWebsiteRow, what: string, task: () => Promise<void>) => {
    setBusy((b) => ({ ...b, [row.id]: what }));
    try {
      await task();
    } catch (error) {
      toast({ title: `${row.name}: could not finish`, description: error instanceof Error ? error.message : undefined, variant: "destructive" });
    } finally {
      setBusy((b) => {
        const next = { ...b };
        delete next[row.id];
        return next;
      });
    }
  };

  const runDomain = (row: BranchWebsiteRow, action: DomainAction) => {
    if (action === "remove" && !window.confirm(`Remove ${row.customDomain} from Vercel? ${row.name}'s site stops opening there.`)) return;
    return work(row, action, async () => {
      const result = await manageDomain(action, row.id);
      patchRow(row.id, {
        domainStatus: result.domainStatus,
        domainMessage: result.message,
        ...(action === "remove" ? { customDomain: "" } : {}),
      });
      const records = (result.records ?? []).map((r) => `${r.type} ${r.name} → ${r.value}`).join(" · ");
      toast({ title: `${row.customDomain}: ${DOMAIN_STATUS_LABEL[result.domainStatus]}`, description: [result.message, records].filter(Boolean).join(" ") });
    });
  };

  const toggleSite = (row: BranchWebsiteRow, siteEnabled: boolean) =>
    work(row, "toggle", async () => {
      await updateSiteAdmin(row.id, { siteEnabled });
      patchRow(row.id, { siteEnabled });
      toast({ title: siteEnabled ? `${row.name}'s website is on` : `${row.name}'s website is off` });
    });

  const domainProblem = domainInput.trim() ? hostnameError(domainInput) : null;

  const saveDomain = () => {
    if (!editing || domainProblem) return;
    const row = editing;
    const value = domainInput.trim() ? normaliseHost(domainInput) : null;
    setEditing(null);
    return work(row, "domain", async () => {
      const result = await updateSiteAdmin(row.id, { customDomain: value });
      const saved = (result.data ?? {}) as { customDomain?: string | null; domainStatus?: DomainStatus };
      patchRow(row.id, {
        customDomain: saved.customDomain ?? value ?? "",
        domainStatus: saved.domainStatus ?? (value ? "PENDING" : "NONE"),
        domainMessage: "",
      });
      toast({ title: value ? `Domain set to ${value}` : "Domain cleared", description: value ? "Now press Connect domain to add it on Vercel." : undefined });
    });
  };

  useEffect(() => {
    let cancelled = false;
    getBranchWebsites(user?.organizationId || null)
      .then((result) => {
        if (!cancelled) setRows(result.data);
      })
      .catch((error) => {
        if (cancelled) return;
        setRows([]);
        toast({
          title: "Could not load websites",
          description: error instanceof Error ? error.message : "Please try again",
          variant: "destructive",
        });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.organizationId, toast]);

  const columns: Column<BranchWebsiteRow>[] = [
    {
      key: "name",
      header: "Branch Name",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand/12 text-brand-ink">
            <Building2 className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold">{row.name}</p>
            <p className="text-xs text-muted-foreground">
              {[row.code, row.branchType].filter(Boolean).join(" · ") || "—"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "slug",
      header: "Centre Website",
      sortable: true,
      cell: (row) => {
        const link = row.slug ? siteLink(row.slug) : "";
        return (
          <div className="flex min-w-[220px] items-center gap-3">
            <Switch
              checked={row.siteEnabled}
              disabled={!!busy[row.id] || !row.slug}
              onCheckedChange={(v) => toggleSite(row, v)}
              aria-label={`${row.siteEnabled ? "Turn off" : "Turn on"} ${row.name}'s website`}
            />
            {link ? (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                title={`Open ${row.name}'s website`}
                className={`inline-flex items-center gap-1.5 text-sm font-medium hover:underline ${row.siteEnabled ? "text-brand-ink" : "text-muted-foreground line-through"}`}
              >
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">/c/{row.slug}</span>
              </a>
            ) : (
              <span className="text-xs text-muted-foreground">No link yet</span>
            )}
          </div>
        );
      },
    },
    {
      key: "customDomain",
      header: "Own Domain",
      sortable: true,
      cell: (row) => {
        const running = busy[row.id];
        return (
          <div className="min-w-[230px] space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              {row.customDomain ? (
                <span className="font-medium">{row.customDomain}</span>
              ) : (
                <span className="text-xs text-muted-foreground">None</span>
              )}
              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${DOMAIN_STYLE[row.domainStatus]}`}>
                {DOMAIN_STATUS_LABEL[row.domainStatus]}
              </span>
              {running ? <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" aria-label="Working" /> : null}
            </div>
            {row.domainMessage ? <p className="max-w-[260px] text-[11px] leading-snug text-muted-foreground">{row.domainMessage}</p> : null}
            <div className="flex flex-wrap gap-1">
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 text-xs"
                disabled={!!running}
                onClick={() => {
                  setDomainInput(row.customDomain);
                  setEditing(row);
                }}
              >
                {row.customDomain ? "Change" : "Set domain"}
              </Button>
              {row.customDomain
                ? (["add", "check", "remove"] as DomainAction[]).map((action) => (
                    <Button
                      key={action}
                      size="sm"
                      variant={action === "remove" ? "ghost" : "outline"}
                      className={`h-7 px-2 text-xs ${action === "remove" ? "text-destructive" : ""}`}
                      disabled={!!running}
                      onClick={() => runDomain(row, action)}
                    >
                      {ACTION_LABEL[action]}
                    </Button>
                  ))
                : null}
            </div>
          </div>
        );
      },
    },
    {
      key: "domain",
      header: "Website URL",
      sortable: true,
      // A branch with no site is where the work is, so it says so rather than
      // printing a dash that reads like a missing value.
      cell: (row) =>
        row.domain ? (
          <a
            href={`https://${row.domain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-medium text-brand-ink hover:underline"
          >
            <Globe className="h-4 w-4 shrink-0" />
            <span className="truncate">{row.domain}</span>
          </a>
        ) : (
          <span className="text-xs text-muted-foreground">No website set up</span>
        ),
    },
    { key: "registrationDate", header: "Registration", sortable: true, cell: (row) => asDay(row.registrationDate) },
    {
      key: "expiryDate",
      header: "Expiry",
      sortable: true,
      cell: (row) => {
        const state = licenceState(row.expiryDate);
        return (
          <span
            className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${LICENCE_STYLE[state]}`}
          >
            {row.expiryDate ? asDay(row.expiryDate) : "No date"}
          </span>
        );
      },
    },
    { key: "renewalDate", header: "Renewal", sortable: true, cell: (row) => asDay(row.renewalDate) },
    {
      key: "phone",
      header: "Mobile No",
      // An action is dropped rather than shown dead: a `tel:` with no number
      // looks like a working link right up until it is pressed.
      cell: (row) => {
        const call = telHref(row.phone);
        return call ? (
          <a
            href={call}
            title={`Call ${row.name}`}
            aria-label={`Call ${row.name}`}
            className="inline-flex items-center gap-2 whitespace-nowrap hover:text-brand-ink"
          >
            <Phone className="h-4 w-4 shrink-0 text-brand-ink" />
            {formatPhone(row.phone)}
          </a>
        ) : (
          <span className="text-xs text-muted-foreground">No number</span>
        );
      },
    },
    {
      key: "whatsapp",
      header: "WhatsApp No",
      cell: (row) => {
        const chat = whatsappHref(row.whatsapp);
        return chat ? (
          <a
            href={chat}
            target="_blank"
            rel="noopener noreferrer"
            title={`WhatsApp ${row.name}`}
            aria-label={`WhatsApp ${row.name}`}
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-success/12 px-2.5 py-1.5 font-medium text-success transition hover:bg-success/20"
          >
            <MessageCircle className="h-4 w-4 shrink-0" />
            {formatPhone(row.whatsapp)}
          </a>
        ) : (
          <span className="text-xs text-muted-foreground">No number</span>
        );
      },
    },
  ];

  const filters: TableFilter<BranchWebsiteRow>[] = [
    {
      label: "Licence",
      key: "expiryDate",
      options: ["Active", "Expiring soon", "Expired", "No date"],
      value: (row) => licenceState(row.expiryDate),
    },
    {
      label: "Website",
      key: "domain",
      options: ["Live", "Not set up"],
      value: (row) => (row.domain ? "Live" : "Not set up"),
    },
    {
      label: "Own domain",
      key: "domainStatus",
      options: Object.values(DOMAIN_STATUS_LABEL),
      value: (row) => DOMAIN_STATUS_LABEL[row.domainStatus],
    },
  ];

  const exportRows = () => {
    if (!rows.length) {
      toast({ title: "Nothing to export", description: "No branches on this organisation yet." });
      return;
    }
    downloadCsv(
      "branch-websites.csv",
      rows.map((row) => ({
        Branch: row.name,
        Code: row.code,
        "Centre Website": row.slug ? siteLink(row.slug) : "",
        "Site On": row.siteEnabled ? "Yes" : "No",
        "Own Domain": row.customDomain,
        "Domain Status": DOMAIN_STATUS_LABEL[row.domainStatus],
        Website: row.domain,
        Licence: licenceState(row.expiryDate),
        Registration: row.registrationDate,
        Expiry: row.expiryDate,
        Renewal: row.renewalDate,
        Mobile: row.phone,
        WhatsApp: row.whatsapp,
      })),
    );
    toast({ title: "Websites exported", description: `${rows.length} rows written to CSV.` });
  };

  return (
    <AppLayout>
      <PageHeader
        title="Franchise Websites"
        description="Every centre's website: its free link, its own domain and whether it is switched on"
        breadcrumbs={[{ label: "Branch Management", href: "/branch/view" }, { label: "Franchise Websites" }]}
        actions={
          <Button variant="outline" className="gap-2" onClick={exportRows} disabled={!rows.length}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        }
      />

      <Card>
        <CardContent className="p-4 sm:p-5">
          <DataTable
            data={rows}
            columns={columns}
            filters={filters}
            searchPlaceholder="Search branch or website…"
            emptyMessage={loading ? "Loading websites…" : "No branches on this organisation yet."}
          />
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.name}: own domain</DialogTitle>
            <DialogDescription>
              Save the domain here, then press Connect domain to add it on Vercel. Leave it empty to clear it; a domain
              already live should be removed with Remove, which also takes it off Vercel.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="adminDomain">Domain</Label>
            <Input id="adminDomain" value={domainInput} placeholder="mycentre.com" onChange={(e) => setDomainInput(e.target.value)} aria-invalid={!!domainProblem} />
            {domainProblem ? <p className="text-xs text-destructive">{domainProblem}</p> : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={saveDomain} disabled={!!domainProblem}>Save domain</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
