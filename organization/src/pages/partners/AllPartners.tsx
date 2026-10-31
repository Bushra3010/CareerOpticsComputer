import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Pencil, Trash2, Users, Search } from "lucide-react";
import {
  deletePartner,
  formatRupees,
  listPartnerTransactions,
  listPartners,
  partnerBalances,
  partnerToForm,
  updatePartner,
  type Partner,
  type PartnerInput,
} from "@/lib/supabase/partners";
import { PartnerForm } from "./PartnerForm";

const AllPartners = () => {
  const { toast } = useToast();
  const { organizationId } = useAuth();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [balances, setBalances] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Partner | null>(null);
  const [deleting, setDeleting] = useState<Partner | null>(null);

  const report = useCallback(
    (title: string, err: unknown) =>
      toast({ title, description: err instanceof Error ? err.message : "Something went wrong.", variant: "destructive" }),
    [toast],
  );

  const load = useCallback(async () => {
    if (!organizationId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [rows, txs] = await Promise.all([listPartners(organizationId), listPartnerTransactions(organizationId)]);
      setPartners(rows);
      setBalances(partnerBalances(txs));
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Could not load partners.");
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return partners;
    return partners.filter((p) =>
      [p.name, p.contactPerson, p.phone, p.email, p.city, p.state].some((v) => (v ?? "").toLowerCase().includes(q)),
    );
  }, [partners, search]);

  const totals = useMemo(() => {
    const active = partners.filter((p) => p.status === "ACTIVE").length;
    let owed = 0;
    for (const p of partners) owed += Math.round((balances.get(p.id) ?? 0) * 100);
    return { total: partners.length, active, inactive: partners.length - active, owed: owed / 100 };
  }, [partners, balances]);

  const toggleStatus = async (p: Partner, active: boolean) => {
    const status = active ? "ACTIVE" : "INACTIVE";
    try {
      await updatePartner(p.id, { status });
      setPartners((rows) => rows.map((r) => (r.id === p.id ? { ...r, status } : r)));
    } catch (err) {
      report("Status not changed", err);
    }
  };

  const saveEdit = async (value: PartnerInput) => {
    if (!editing) return;
    try {
      await updatePartner(editing.id, value);
      setPartners((rows) => rows.map((r) => (r.id === editing.id ? { ...r, ...value } : r)));
      toast({ title: "Partner updated", description: `${value.name} has been saved.` });
      setEditing(null);
    } catch (err) {
      report("Partner not saved", err);
      throw err;
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    const target = deleting;
    setDeleting(null);
    try {
      await deletePartner(target.id);
      setPartners((rows) => rows.filter((r) => r.id !== target.id));
      toast({ title: "Partner deleted", description: `${target.name} has been removed. Their transactions are kept.` });
    } catch (err) {
      report("Partner not deleted", err);
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="All Partners"
        description="Manage and view all registered partners"
        breadcrumbs={[
          { label: "Partners", href: "/partners/all" },
          { label: "All Partners" },
        ]}
        actions={
          <Button asChild>
            <Link to="/partners/add">
              <Plus className="mr-2 h-4 w-4" />
              Add Partner
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Total Partners", value: String(totals.total) },
          { label: "Active", value: String(totals.active) },
          { label: "Inactive", value: String(totals.inactive) },
          { label: "Balance Owed", value: formatRupees(totals.owed) },
        ].map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <CardTitle>Partners</CardTitle>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              aria-label="Search partners"
              placeholder="Search by name, phone, email or city"
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {!organizationId ? (
            <p className="text-sm text-muted-foreground">This account is not linked to an organisation.</p>
          ) : loading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Loading partners...</p>
          ) : loadError ? (
            <p className="py-8 text-center text-sm text-destructive">{loadError}</p>
          ) : partners.length === 0 ? (
            <EmptyState icon={Users} title="No partners yet" description="Partners you register will be listed here." />
          ) : visible.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No partners match "{search}".</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Partner</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead className="text-right">Comm.</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="font-medium">{p.name}</div>
                      {p.contactPerson && <div className="text-xs text-muted-foreground">{p.contactPerson}</div>}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {p.partnerType}
                      </Badge>
                    </TableCell>
                    <TableCell>{p.phone || "-"}</TableCell>
                    <TableCell>{p.email || "-"}</TableCell>
                    <TableCell>{p.city || "-"}</TableCell>
                    <TableCell className="text-right">{p.commissionPercent}%</TableCell>
                    <TableCell className="text-right">{formatRupees(balances.get(p.id) ?? 0)}</TableCell>
                    <TableCell>
                      <Switch
                        aria-label={`${p.name} active`}
                        checked={p.status === "ACTIVE"}
                        onCheckedChange={(v) => void toggleStatus(p, v)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" aria-label={`Edit ${p.name}`} onClick={() => setEditing(p)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Delete ${p.name}`}
                        className="text-destructive"
                        onClick={() => setDeleting(p)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Partner</DialogTitle>
          </DialogHeader>
          {editing && (
            <PartnerForm
              key={editing.id}
              initial={partnerToForm(editing)}
              submitLabel="Save Changes"
              onSubmit={saveEdit}
              onCancel={() => setEditing(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleting?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              The partner is removed from the list. Their transaction history is kept for your records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void confirmDelete()}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default AllPartners;
