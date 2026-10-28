import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable, type Column, type TableFilter } from "@/components/ui/DataTable";
import { Building2, Download, Globe, MessageCircle, Phone } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { downloadCsv } from "@/lib/export";
import { formatPhone, telHref, whatsappHref } from "@/lib/phone";
import { asDay, licenceState, type LicenceState } from "@/lib/websiteLicence";
import { getBranchWebsites, type BranchWebsiteRow } from "@/lib/supabase/data";

/* The badge carries the state, not the date: a column of dates is something
   the reader has to do arithmetic on, which is the work this page removes. */
const LICENCE_STYLE: Record<LicenceState, string> = {
  Active: "border-success/25 bg-success/12 text-success",
  "Expiring soon": "border-warning/25 bg-warning/12 text-warning",
  Expired: "border-destructive/25 bg-destructive/12 text-destructive",
  "No date": "border-border bg-muted text-muted-foreground",
};

export default function WebsiteView() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rows, setRows] = useState<BranchWebsiteRow[]>([]);
  const [loading, setLoading] = useState(true);

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
        title="Website View"
        description="View branch website and registration details"
        breadcrumbs={[{ label: "Branch Management", href: "/branch/view" }, { label: "Website View" }]}
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
    </AppLayout>
  );
}
