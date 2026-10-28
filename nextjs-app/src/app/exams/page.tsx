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
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

interface Exam {
  id: string;
  name: string;
  course: { id: string; name: string } | null;
  exam_date: string;
  total_marks: number;
  status: string;
  results?: any[];
}

const columns: Column<Exam>[] = [
  { key: "name", header: "Exam Name", sortable: true },
  { key: "course", header: "Course", cell: (e) => e.course?.name || "—" },
  { key: "exam_date", header: "Date", sortable: true, cell: (e) => e.exam_date ? new Date(e.exam_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—" },
  { key: "total_marks", header: "Total Marks", cell: (e) => `${e.total_marks}` },
  { key: "status", header: "Status", cell: (e) => <StatusBadge status={e.status === "PUBLISHED" ? "active" : e.status === "COMPLETED" ? "active" : e.status === "SCHEDULED" ? "pending" : "inactive"} /> },
  { key: "results", header: "Results", cell: (e) => `${e.results?.length || 0} students` },
];

export default function ExamsPage() {
  const { toast } = useToast();
  const supabase = createClient();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Exam | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from("exams").select("*, course:courses(id, name), results:exam_results(student:profiles(first_name, last_name, enrollment_no), marks)").order("exam_date", { ascending: false });
      if (data) setExams(data as Exam[]);
    } catch {
      toast({ title: "Could not load exams", variant: "destructive" });
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
        const result = await supabase.from("exams").update({
          name: editing.name,
          exam_date: editing.exam_date,
          total_marks: editing.total_marks,
          course_id: editing.course?.id,
        }).eq("id", editing.id);
        error = result.error;
      } else {
        const result = await (supabase.from("exams") as any).insert({
          name: editing.name,
          exam_date: editing.exam_date,
          total_marks: editing.total_marks,
          course_id: editing.course?.id,
          status: "DRAFT",
        });
        error = result.error;
      }
      if (error) throw error;
      toast({ title: editing.id ? "Exam updated" : "Exam created" });
      setEditing(null);
      void load();
    } catch {
      toast({ title: "Save failed", variant: "destructive" });
    }
  };

  const publishResults = async (examId: string) => {
    try {
      const { error } = await supabase.from("exams").update({ status: "PUBLISHED" }).eq("id", examId);
      if (error) throw error;
      toast({ title: "Results published" });
      void load();
    } catch {
      toast({ title: "Publish failed", variant: "destructive" });
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Exams"
        description="Manage examinations and results"
        breadcrumbs={[
          { label: "Exams", href: "/exams" },
          { label: "All Exams" },
        ]}
        actions={
          <Button className="gap-2" onClick={() => setEditing({ id: "", name: "", course: null, exam_date: "", total_marks: 100, status: "DRAFT", results: [] })}>
            <Plus className="h-4 w-4" />Create Exam
          </Button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        </div>
      ) : (
        <DataTable data={exams} columns={columns} selectable searchPlaceholder="Search exams..." actions={(exam) => [
          { label: "Edit", onClick: () => setEditing({ ...exam }) },
          ...(exam.results?.length ? [{ label: "Publish Results", onClick: () => void publishResults(exam.id) }] : []),
        ]} />
      )}

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit Exam" : "Create Exam"}</DialogTitle>
            <DialogDescription>Configure examination details.</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="exam-name">Exam Name</Label>
                <Input id="exam-name" value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exam-date">Date</Label>
                <Input id="exam-date" type="date" value={editing.exam_date} onChange={e => setEditing({ ...editing, exam_date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exam-marks">Total Marks</Label>
                <Input id="exam-marks" type="number" value={editing.total_marks} onChange={e => setEditing({ ...editing, total_marks: Number(e.target.value) })} />
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
