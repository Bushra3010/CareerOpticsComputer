import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { deleteExamCentre, saveExamCentre, type ExamCentre } from "@/lib/supabase/examWorkflow";
import { useExamData } from "./useExamData";

const blank = { name: "", code: "", address: "" };

/** Where examinations are held; an exam schedule names one of these. */
export default function ExamCentres() {
  const { toast } = useToast();
  const { user, isAdmin, examCentres, loading, reload } = useExamData();
  const [draft, setDraft] = useState<Omit<ExamCentre, "id"> & { id?: string }>(blank);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await saveExamCentre(draft, user?.organizationId);
      toast({ title: draft.id ? "Exam centre updated" : "Exam centre added", description: draft.name });
      setDraft(blank);
      reload();
    } catch (e) {
      toast({ title: "Could not save exam centre", description: e instanceof Error ? e.message : "", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (centre: ExamCentre) => {
    if (!window.confirm(`Remove ${centre.name}?`)) return;
    try {
      await deleteExamCentre(centre.id);
      reload();
    } catch (e) {
      toast({ title: "Could not remove", description: e instanceof Error ? e.message : "", variant: "destructive" });
    }
  };

  const columns: Column<ExamCentre>[] = [
    { key: "name", header: "Name", sortable: true, cell: (c) => <span className="font-medium">{c.name}</span> },
    { key: "code", header: "Code", cell: (c) => <span className="font-mono text-xs">{c.code || "—"}</span> },
    { key: "address", header: "Address", cell: (c) => c.address || "—" },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Exam Centres"
        description="Places where examinations are held"
        breadcrumbs={[{ label: "Exam & Marks" }, { label: "Exam Centres" }]}
      />
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        {isAdmin && (
          <Card>
            <CardHeader><CardTitle>{draft.id ? "Edit exam centre" : "Add exam centre"}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Centre name *</Label>
                <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Centre code</Label>
                <Input value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase() })} />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Textarea rows={3} value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })} />
              </div>
              <div className="flex gap-2">
                <Button onClick={save} disabled={saving}>{saving ? "Saving…" : draft.id ? "Update" : "Add centre"}</Button>
                {draft.id && <Button variant="outline" onClick={() => setDraft(blank)}>Cancel</Button>}
              </div>
            </CardContent>
          </Card>
        )}
        <Card className={isAdmin ? "" : "lg:col-span-2"}>
          <CardHeader><CardTitle>Exam centres</CardTitle></CardHeader>
          <CardContent>
            <DataTable
              data={examCentres}
              columns={columns}
              searchPlaceholder="Search name, code, address…"
              actions={isAdmin ? (c) => [
                { label: "Edit", onClick: () => setDraft(c) },
                { label: "Remove", onClick: () => void remove(c), destructive: true },
              ] : undefined}
              emptyMessage={loading ? "Loading…" : "No exam centres yet."}
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
