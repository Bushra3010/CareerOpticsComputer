"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/index";
import { Plus, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

interface Batch {
  id: string;
  name: string;
  code: string;
  course: { id: string; name: string };
  start_date: string;
  end_date: string;
  max_students: number;
  is_active: boolean;
}

const columns: Column<Batch>[] = [
  { key: "name", header: "Batch Name", sortable: true },
  { key: "code", header: "Code", cell: (b) => <span className="font-mono text-xs">{b.code}</span> },
  { key: "course", header: "Course", cell: (b) => b.course?.name || "—" },
  { key: "start_date", header: "Start Date", cell: (b) => b.start_date ? new Date(b.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—" },
  { key: "end_date", header: "End Date", cell: (b) => b.end_date ? new Date(b.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—" },
  { key: "is_active", header: "Status", cell: (b) => <StatusBadge status={b.is_active ? "active" : "inactive"} /> },
];

export default function BatchesPage() {
  const { toast } = useToast();
  const supabase = createClient();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [courses, setCourses] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Batch | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [batchesData, coursesData] = await Promise.all([
        supabase.from("batches").select("*, course:courses(id,name)").order("created_at", { ascending: false }),
        supabase.from("courses").select("id,name"),
      ]);
      if (batchesData.data) setBatches(batchesData.data as Batch[]);
      if (coursesData.data) setCourses(coursesData.data as { id: string; name: string }[]);
    } catch {
      toast({ title: "Could not load data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [supabase]);

  const save = async () => {
    if (!editing) return;
    try {
      let error;
      if (editing.id) {
        const result = await supabase.from("batches").update(editing).eq("id", editing.id);
        error = result.error;
      } else {
        const result = await (supabase.from("batches") as any).insert(editing);
        error = result.error;
      }
      if (error) throw error;
      toast({ title: editing.id ? "Batch updated" : "Batch created" });
      setEditing(null);
      void load();
    } catch {
      toast({ title: "Save failed", variant: "destructive" });
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Batches"
        description="Manage course batches and schedules"
        breadcrumbs={[
          { label: "Batches", href: "/batches" },
          { label: "All Batches" },
        ]}
        actions={
          <>
            <Button variant="outline" className="gap-2"><Upload className="h-4 w-4" />Import</Button>
            <Button className="gap-2" onClick={() => setEditing({ id: "", name: "", code: "", course: courses[0] || { id: "", name: "" }, start_date: "", end_date: "", max_students: 0, is_active: true })}>
              <Plus className="h-4 w-4" />Add Batch
            </Button>
          </>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        </div>
      ) : (
        <DataTable data={batches} columns={columns} selectable searchPlaceholder="Search batches..." actions={(batch) => [
          { label: "Edit", onClick: () => setEditing({ ...batch }) },
        ]} />
      )}

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit Batch" : "Create Batch"}</DialogTitle>
            <DialogDescription>Set up a new batch for a course.</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="batch-name">Batch Name</Label>
                <Input id="batch-name" value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="batch-code">Code</Label>
                <Input id="batch-code" value={editing.code} onChange={e => setEditing({ ...editing, code: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="batch-course">Course</Label>
                <Select value={editing.course?.id} onValueChange={(v) => setEditing({ ...editing, course: { id: v, name: courses.find(c => c.id === v)?.name || "" } })}>
                  <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                  <SelectContent>{courses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="batch-start">Start Date</Label>
                <Input id="batch-start" type="date" value={editing.start_date} onChange={e => setEditing({ ...editing, start_date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="batch-end">End Date</Label>
                <Input id="batch-end" type="date" value={editing.end_date} onChange={e => setEditing({ ...editing, end_date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="batch-max">Max Students</Label>
                <Input id="batch-max" type="number" value={editing.max_students} onChange={e => setEditing({ ...editing, max_students: Number(e.target.value) })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
