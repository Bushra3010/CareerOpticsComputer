import { useCallback, useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Plus, BookOpen, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getCourses, updateCourse, deleteCourse, getBatchesByOrg } from "@/lib/supabase/data";
import { courseCategoryLabel, courseCategoryOptions } from "@/lib/courseCategories";
import { downloadCsv } from "@/lib/export";
import { useToast } from "@/hooks/use-toast";

interface Course {
  id: string;
  name: string;
  code: string;
  durationMonths: number;
  duration: string;
  fee: number;
  category: string;
  description: string;
  batches: number;
  students: number;
  status: "active" | "inactive";
}

const columns: Column<Course>[] = [
  {
    key: "name",
    header: "Course Name",
    sortable: true,
    cell: (course) => (
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <BookOpen className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="font-medium">{course.name}</p>
          <p className="text-xs text-muted-foreground">{course.code}</p>
        </div>
      </div>
    ),
  },
  { key: "duration", header: "Duration", sortable: true },
  {
    key: "fee",
    header: "Fee",
    sortable: true,
    cell: (course) => <span className="font-medium">₹{course.fee.toLocaleString()}</span>,
  },
  {
    key: "batches",
    header: "Batches",
    sortable: true,
    cell: (course) => <span>{course.batches}</span>,
  },
  {
    key: "students",
    header: "Students",
    sortable: true,
    cell: (course) => <span>{course.students} enrolled</span>,
  },
  {
    key: "status",
    header: "Status",
    cell: (course) => <StatusBadge status={course.status} />,
  },
];

type Editable = Pick<Course, "id" | "name" | "code" | "durationMonths" | "fee" | "category" | "description">;

export default function ViewCourses() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [viewing, setViewing] = useState<Course | null>(null);
  const [editing, setEditing] = useState<Editable | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Course | null>(null);
  const [saving, setSaving] = useState(false);

  const orgId = user?.organizationId || null;
  // A branch sees the courses it has been given to run, not the whole
  // organisation catalogue. Null for an administrator, who sees everything.
  const branchId = user?.branchId || null;

  // Batches carry the enrolment counts, so the two lists are loaded together
  // rather than showing hardcoded zeroes.
  const load = useCallback(async () => {
    if (!orgId) return;
    try {
      const [courseBody, batchBody] = await Promise.all([
        getCourses(orgId, branchId),
        getBatchesByOrg(orgId).catch(() => ({ data: [] as Record<string, unknown>[] })),
      ]);
      const batches = (batchBody.data || []) as Array<Record<string, unknown>>;
      setCourses(
        (courseBody.data || []).map((c: Record<string, unknown>) => {
          const own = batches.filter((b) => b.courseId === c.id);
          const months = Number(c.durationMonths) || 0;
          return {
            id: String(c.id),
            name: String(c.name ?? ""),
            code: String(c.code ?? ""),
            durationMonths: months,
            duration: months ? `${months} month${months === 1 ? "" : "s"}` : "—",
            fee: Number(c.baseFee) || 0,
            category: String(c.category ?? ""),
            description: String(c.description ?? ""),
            batches: own.length,
            students: own.reduce((sum, b) => sum + (Number(b.currentStudents) || 0), 0),
            status: c.isActive ? "active" : "inactive",
          };
        })
      );
    } catch (error) {
      toast({
        title: "Could not load courses",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  }, [orgId, branchId, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const saveEdit = async () => {
    if (!editing) return;
    if (!editing.name.trim() || !editing.code.trim()) {
      toast({ title: "Name and code are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await updateCourse(editing.id, {
        name: editing.name.trim(),
        code: editing.code.trim(),
        durationMonths: editing.durationMonths,
        baseFee: editing.fee,
        category: editing.category || null,
        description: editing.description || null,
      });
      toast({ title: "Course updated" });
      setEditing(null);
      await load();
    } catch (error) {
      toast({
        title: "Could not update course",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteCourse(pendingDelete.id);
      toast({ title: "Course deleted", description: pendingDelete.name });
      setPendingDelete(null);
      await load();
    } catch (error) {
      toast({
        title: "Could not delete course",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const exportCourses = () => {
    if (courses.length === 0) {
      toast({ title: "Nothing to export", description: "No courses loaded yet." });
      return;
    }
    downloadCsv(
      "courses.csv",
      courses.map((c) => ({
        Name: c.name,
        Code: c.code,
        DurationMonths: c.durationMonths,
        Category: c.category,
        Fee: c.fee,
        Batches: c.batches,
        Students: c.students,
        Status: c.status,
      }))
    );
    toast({ title: "Courses exported", description: `${courses.length} rows written to CSV.` });
  };

  const handleActions = (course: Course) => [
    { label: "View Details", onClick: () => setViewing(course) },
    {
      label: "Edit Course",
      onClick: () =>
        setEditing({
          id: course.id,
          name: course.name,
          code: course.code,
          durationMonths: course.durationMonths,
          fee: course.fee,
          category: course.category,
          description: course.description,
        }),
    },
    { label: "Manage Batches", onClick: () => navigate("/course/batch/create") },
    { label: "Delete", onClick: () => setPendingDelete(course), destructive: true },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="View Courses"
        description="Manage all courses and their details"
        breadcrumbs={[
          { label: "Course Management", href: "/course/view" },
          { label: "View Courses" },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={exportCourses}>
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button onClick={() => navigate("/course/create")} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Course
            </Button>
          </div>
        }
      />

      <DataTable
        data={courses}
        columns={columns}
        searchPlaceholder="Search courses..."
        actions={handleActions}
      />

      <Dialog open={!!viewing} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewing?.name}</DialogTitle>
            <DialogDescription>{viewing?.code}</DialogDescription>
          </DialogHeader>
          {viewing && (
            <div className="grid gap-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-muted-foreground">Duration</p>
                  <p className="font-medium">{viewing.duration}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Fee</p>
                  <p className="font-medium">₹{viewing.fee.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Category</p>
                  <p className="font-medium">{viewing.category || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-medium capitalize">{viewing.status}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Batches</p>
                  <p className="font-medium">{viewing.batches}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Students</p>
                  <p className="font-medium">{viewing.students}</p>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground">Description</p>
                <p className="font-medium">{viewing.description || "—"}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewing(null)}>
              Close
            </Button>
            <Button onClick={() => navigate("/course/batch/create")}>Manage batches</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit course</DialogTitle>
            <DialogDescription>Update the course details and save.</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-course-name">Course name</Label>
                  <Input
                    id="edit-course-name"
                    value={editing.name}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-course-code">Course code</Label>
                  <Input
                    id="edit-course-code"
                    value={editing.code}
                    onChange={(e) => setEditing({ ...editing, code: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-course-duration">Duration (months)</Label>
                  <Input
                    id="edit-course-duration"
                    type="number"
                    min={1}
                    value={editing.durationMonths || ""}
                    onChange={(e) =>
                      setEditing({ ...editing, durationMonths: Number(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-course-fee">Fee (₹)</Label>
                  <Input
                    id="edit-course-fee"
                    type="number"
                    min={0}
                    value={editing.fee || ""}
                    onChange={(e) => setEditing({ ...editing, fee: Number(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="edit-course-category">Category</Label>
                  <Input
                    id="edit-course-category"
                    list="course-category-options"
                    value={editing.category}
                    onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                  />
                  <datalist id="course-category-options">
                    {courseCategoryOptions(courses.map((c) => c.category)).map((value) => (
                      <option key={value} value={value}>
                        {courseCategoryLabel(value)}
                      </option>
                    ))}
                  </datalist>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-course-description">Description</Label>
                <Textarea
                  id="edit-course-description"
                  rows={3}
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={saveEdit} disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this course?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete?.name} will be removed from the course list. Batches already created
              against it are left untouched.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
