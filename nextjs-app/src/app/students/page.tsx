"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Download, Upload } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

interface Student {
  id: string;
  name: string;
  rollNo: string;
  email: string;
  phone: string;
  course: string;
  batch: string;
  status: "active" | "inactive" | "pending";
  admissionDate: string;
}

const columns: Column<Student>[] = [
  {
    key: "name",
    header: "Student",
    sortable: true,
    cell: (student) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-primary/10 text-primary text-sm">
            {student.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{student.name}</p>
          <p className="text-xs text-muted-foreground">{student.rollNo}</p>
        </div>
      </div>
    ),
  },
  {
    key: "email",
    header: "Contact",
    cell: (student) => (
      <div>
        <p className="text-sm">{student.email}</p>
        <p className="text-xs text-muted-foreground">{student.phone}</p>
      </div>
    ),
  },
  { key: "course", header: "Course", sortable: true },
  { key: "batch", header: "Batch", sortable: true },
  {
    key: "admissionDate",
    header: "Admission Date",
    sortable: true,
    cell: (student) => (
      <span className="text-sm">
        {new Date(student.admissionDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    cell: (student) => <StatusBadge status={student.status} />,
  },
];

export default function StudentsPage() {
  const { toast } = useToast();
  const supabase = createClient();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase.from("students").select("*, course:courses(name), batch:batches(name)").order("created_at", { ascending: false });
        if (data) {
          setStudents(
            data.map((s: any) => ({
              id: s.id,
              name: [s.first_name, s.middle_name, s.last_name].filter(Boolean).join(" "),
              rollNo: s.enrollment_no || s.application_no || "Pending",
              email: s.email || "—",
              phone: s.phone,
              course: s.course?.name || "Not assigned",
              batch: s.batch?.name || "Not assigned",
              status: !s.is_active ? "inactive" : s.admission_status === "APPROVED" ? "active" : "pending",
              admissionDate: s.admission_date,
            }))
          );
        }
      } catch {
        toast({
          title: "Could not load students",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [supabase, toast]);

  const exportCsv = () => {
    const rows = [
      "Name,Enrollment,Email,Phone,Course,Batch,Status",
      ...students.map(
        (s) =>
          [s.name, s.rollNo, s.email, s.phone, s.course, s.batch, s.status]
            .map((v) => `"${String(v).replaceAll('"', '""')}"`)
            .join(",")
      ),
    ];
    const url = URL.createObjectURL(
      new Blob([rows.join("\n")], { type: "text/csv" })
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "careeroptics-students.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const [editing, setEditing] = useState<Student | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Student | null>(null);

  const handleActions = (student: Student) => [
    { label: "Edit", onClick: () => setEditing({ ...student }) },
    {
      label: "Delete",
      onClick: () => setPendingDelete(student),
      destructive: true,
    },
  ];

  const saveEdit = async () => {
    if (!editing) return;
    const { error } = await supabase
      .from("students")
      .update({
        first_name: editing.name.split(" ")[0],
        email: editing.email,
        phone: editing.phone,
      })
      .eq("id", editing.id);
    if (!error) {
      setStudents((list) =>
        list.map((s) => (s.id === editing.id ? editing : s))
      );
      toast({ title: "Student updated" });
      setEditing(null);
    } else {
      toast({ title: "Update failed", variant: "destructive" });
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const { error } = await supabase.from("students").delete().eq("id", pendingDelete.id);
    if (!error) {
      setStudents((list) => list.filter((s) => s.id !== pendingDelete.id));
      toast({ title: "Student removed" });
      setPendingDelete(null);
    } else {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="View Students"
        description="Manage and view all enrolled students"
        breadcrumbs={[
          { label: "Student Management", href: "/student/view" },
          { label: "View Students" },
        ]}
        actions={
          <>
            <Button variant="outline" className="gap-2" asChild>
              <a href="/import-templates/students.csv" download>
                <Upload className="h-4 w-4" />
                Import template
              </a>
            </Button>
            <Button variant="outline" className="gap-2" onClick={exportCsv}>
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button asChild className="gap-2">
              <Link href="/student/add">
                <Plus className="h-4 w-4" />
                Add Student
              </Link>
            </Button>
          </>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        </div>
      ) : (
        <DataTable
          data={students}
          columns={columns}
          selectable
          searchPlaceholder="Search students..."
          actions={handleActions}
        />
      )}

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {editing?.name}</DialogTitle>
            <DialogDescription>{editing?.rollNo}</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="student-name">Name</Label>
                <Input
                  id="student-name"
                  value={editing.name}
                  onChange={(e) =>
                    setEditing({ ...editing, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-email">Email</Label>
                <Input
                  id="student-email"
                  value={editing.email}
                  onChange={(e) =>
                    setEditing({ ...editing, email: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-phone">Phone</Label>
                <Input
                  id="student-phone"
                  value={editing.phone}
                  onChange={(e) =>
                    setEditing({ ...editing, phone: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-course">Course</Label>
                <Input
                  id="student-course"
                  value={editing.course}
                  onChange={(e) =>
                    setEditing({ ...editing, course: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-batch">Batch</Label>
                <Input
                  id="student-batch"
                  value={editing.batch}
                  onChange={(e) =>
                    setEditing({ ...editing, batch: e.target.value })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={saveEdit}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {pendingDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This hides the student. The record returns on reload.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
