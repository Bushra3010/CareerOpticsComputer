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
import { Plus, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

interface Course {
  id: string;
  name: string;
  code: string;
  category: string;
  level: string;
  duration_value: number;
  duration_unit: string;
  fee: number;
  batches: { id: string; name: string }[];
  is_active: boolean;
}

const columns: Column<Course>[] = [
  { key: "name", header: "Course Name", sortable: true },
  { key: "code", header: "Code", cell: (c) => <span className="font-mono text-xs">{c.code}</span> },
  { key: "category", header: "Category", sortable: true },
  { key: "level", header: "Level", sortable: true },
  { key: "duration_value", header: "Duration", cell: (c) => `${c.duration_value} ${c.duration_unit}` },
  { key: "fee", header: "Fee", cell: (c) => `₹${c.fee.toLocaleString()}` },
  { key: "is_active", header: "Status", cell: (c) => <StatusBadge status={c.is_active ? "active" : "inactive"} /> },
];

export default function CoursesPage() {
  const { toast } = useToast();
  const supabase = createClient();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from("courses").select("*, batches(id,name)").order("created_at", { ascending: false });
      if (data) setCourses(data as Course[]);
    } catch {
      toast({ title: "Could not load courses", variant: "destructive" });
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
        const result = await supabase.from("courses").update(editing).eq("id", editing.id);
        error = result.error;
      } else {
        const result = await (supabase.from("courses") as any).insert(editing);
        error = result.error;
      }
      if (error) throw error;
      toast({ title: editing.id ? "Course updated" : "Course created" });
      setEditing(null);
      void load();
    } catch {
      toast({ title: "Save failed", variant: "destructive" });
    }
  };

  const openCreate = () => {
    setEditing({
      id: "", name: "", code: "", category: "", level: "", duration_value: 1,
      duration_unit: "months", fee: 0, batches: [], is_active: true,
    });
    setCreating(true);
  };

  return (
    <AppLayout>
      <PageHeader
        title="Courses"
        description="Create and manage all courses"
        breadcrumbs={[
          { label: "Courses", href: "/courses" },
          { label: "All Courses" },
        ]}
        actions={
          <>
            <Button variant="outline" className="gap-2"><Upload className="h-4 w-4" />Import template</Button>
            <Button className="gap-2" onClick={openCreate}><Plus className="h-4 w-4" />Add Course</Button>
          </>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        </div>
      ) : (
        <DataTable data={courses} columns={columns} selectable searchPlaceholder="Search courses..." actions={(course) => [
          { label: "Edit", onClick: () => { setEditing({ ...course }); setCreating(false); } },
        ]} />
      )}

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit Course" : "Create Course"}</DialogTitle>
            <DialogDescription>Manage course details and metadata.</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="course-name">Course Name</Label>
                <Input id="course-name" value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-code">Code</Label>
                <Input id="course-code" value={editing.code} onChange={e => setEditing({ ...editing, code: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-category">Category</Label>
                <Input id="course-category" value={editing.category} onChange={e => setEditing({ ...editing, category: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-level">Level</Label>
                <Input id="course-level" value={editing.level} onChange={e => setEditing({ ...editing, level: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-fee">Fee (₹)</Label>
                <Input id="course-fee" type="number" value={editing.fee} onChange={e => setEditing({ ...editing, fee: Number(e.target.value) })} />
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
