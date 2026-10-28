import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column, type TableFilter } from "@/components/ui/DataTable";
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BookOpen, Users, Link2, CheckCircle, Pencil } from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  getCourses,
  getBatches,
  getBatchesByOrg,
  getBranches,
  getBranchCourseIds,
  getInstructorUsage,
  renameInstructor,
  setBranchCourseOffered,
  updateBatch,
} from "@/lib/supabase/data";
import { useDropdownOptions } from "@/lib/dropdownOptions";
import { mergeNames } from "@/lib/instructors";
import { ManageListDialog, type ManageListResult } from "@/components/ui/ManageListDialog";

interface CourseAssignment {
  id: string;
  course: string;
  courseCode: string;
  /** The branch the course was handed to, so the list can be read one branch
   *  at a time — which is how an administrator assigning across several works. */
  branch: string;
  batch: string;
  subjects: string[];
  instructors: string[];
  status: "assigned" | "pending";
}

interface Course {
  id: string;
  name: string;
  code: string;
  /** A course the organisation has switched off. It stays in the catalogue so
   *  it can be switched back on, but it is not handed to anyone. */
  isActive?: boolean;
}

interface Batch {
  id: string;
  name: string;
  /** Whoever already teaches it, so re-assigning does not start from blank. */
  instructor?: string;
  /** `batches` stores the course as a foreign key, not a name. */
  courseId?: string | null;
  branchId?: string | null;
  /** `batches.subjects`, once add-batch-subjects.sql has run. */
  subjects?: string[];
}

const splitNames = (value?: string | null) =>
  (value ?? "").split(",").map((name) => name.trim()).filter(Boolean);

interface BranchOption {
  id: string;
  name: string;
  code?: string;
}

const columns: Column<CourseAssignment>[] = [
  {
    key: "course",
    header: "Course",
    cell: (assignment) => (
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <BookOpen className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="font-medium">{assignment.course}</p>
          <p className="text-xs text-muted-foreground">{assignment.courseCode}</p>
        </div>
      </div>
    ),
  },
  {
    key: "batch",
    header: "Batch",
    cell: (assignment) => (
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <Badge variant="outline">{assignment.batch}</Badge>
      </div>
    ),
  },
  {
    key: "subjects",
    header: "Subjects",
    cell: (assignment) => (
      <div className="flex flex-wrap gap-1 max-w-[200px]">
        {assignment.subjects.slice(0, 2).map((subject) => (
          <Badge key={subject} variant="secondary" className="text-xs">{subject}</Badge>
        ))}
        {assignment.subjects.length > 2 && (
          <Badge variant="secondary" className="text-xs">+{assignment.subjects.length - 2}</Badge>
        )}
      </div>
    ),
  },
  {
    key: "instructors",
    header: "Instructors",
    cell: (assignment) => (
      <div className="text-sm">
        {assignment.instructors.join(", ")}
      </div>
    ),
  },
  {
    key: "status",
    header: "Status",
    cell: (assignment) => (
      <Badge variant={assignment.status === "assigned" ? "default" : "secondary"}>
        {assignment.status === "assigned" ? (
          <><CheckCircle className="h-3 w-3 mr-1" /> Assigned</>
        ) : (
          "Pending"
        )}
      </Badge>
    ),
  },
];

export default function AssignCourseToBatch() {
  const { user, view } = useAuth();
  const orgId = user?.organizationId || null;
  const branchId = user?.branchId || null;
  // A branch assigns courses to itself and nowhere else, so it is not offered a
  // choice of branch. An administrator picks from the real list.
  const canChooseBranch = view === "admin";
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<CourseAssignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  /** An inactive course cannot be given to a branch, so it is not offered. */
  const assignable = courses.filter((course) => course.isActive !== false);
  const [branchOptions, setBranchOptions] = useState<BranchOption[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [offeredCourseIds, setOfferedCourseIds] = useState<Set<string>>(new Set());
  /* Both lists live in the organisation's option registry now, the same one
     Gender and Blood group use, so a subject created here survives a reload
     and can be renamed or removed. They used to be React state seeded from a
     hard-coded array, and were gone the moment the page was left. */
  const { options: optionList, save: saveOptions } = useDropdownOptions(orgId);
  const subjectsList = optionList("subject");
  const [manageSubjects, setManageSubjects] = useState(false);
  const [manageTeachers, setManageTeachers] = useState(false);
  /** Teacher name -> the batches they are on, so a taught name cannot be removed. */
  const [teacherUsage, setTeacherUsage] = useState<Array<{ name: string; batches: string[] }>>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState(canChooseBranch ? "" : branchId || "");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [newSubject, setNewSubject] = useState("");
  // The picker is the organisation's own list and every name already on a
  // batch, as one list: a teacher typed onto a batch is a teacher.
  const teacherList = useMemo(
    () => mergeNames(optionList("teacher"), teacherUsage.map((entry) => entry.name)),
    [optionList, teacherUsage],
  );
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [newTeacher, setNewTeacher] = useState("");
  const [details, setDetails] = useState<CourseAssignment | null>(null);
  const [editing, setEditing] = useState<CourseAssignment | null>(null);
  const [pendingRemove, setPendingRemove] = useState<CourseAssignment | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadReferenceData() {
      try {
        // The whole organisation catalogue, on purpose: this screen is where a
        // course is handed to a branch, so it cannot be narrowed to what the
        // branch already has.
        const [coursesRes, branchesRes, batchesRes, teacherRes] = await Promise.all([
          getCourses(orgId),
          getBranches(orgId),
          // getBatches(null) is every batch in the database, other
          // organisations included; an administrator wants its own.
          branchId ? getBatches(branchId) : getBatchesByOrg(orgId),
          getInstructorUsage(branchId),
        ]);
        if (!cancelled) {
          setCourses(coursesRes.data as Course[]);
          setBranchOptions(
            (branchesRes.data as Record<string, unknown>[])
              .filter((row) => row.isActive !== false)
              .map((row) => ({
                id: String(row.id),
                name: String(row.name ?? ""),
                code: row.code ? String(row.code) : undefined,
              })),
          );
          const batchList = batchesRes.data as Batch[];
          const courseList = coursesRes.data as Course[];
          const branchList = branchesRes.data as Record<string, unknown>[];
          setBatches(batchList);
          setTeacherUsage(teacherRes.data);
          // An assignment is a batch with subjects on it: what is saved is
          // what the list shows, so it survives a reload and reaches the
          // students of that batch.
          setAssignments(
            batchList
              .filter((batch) => batch.subjects?.length)
              .map((batch) => {
                const course = courseList.find((c) => c.id === batch.courseId);
                return {
                  id: batch.id,
                  course: course?.name ?? "Course not set",
                  courseCode: course?.code ?? "",
                  branch: String(branchList.find((b) => b.id === batch.branchId)?.name ?? ""),
                  batch: batch.name,
                  subjects: batch.subjects ?? [],
                  instructors: splitNames(batch.instructor),
                  status: "assigned" as const,
                };
              }),
          );
        }
      } catch (err) {
        if (!cancelled) {
          toast({
            title: "Failed to load courses and batches",
            description: err instanceof Error ? err.message : undefined,
            variant: "destructive",
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    loadReferenceData();
    return () => { cancelled = true; };
  }, [orgId, branchId, toast]);

  // Which courses the chosen branch already runs, so the form can say so
  // instead of letting the same course be handed over twice.
  useEffect(() => {
    let cancelled = false;
    if (!selectedBranch) {
      setOfferedCourseIds(new Set());
      return;
    }
    getBranchCourseIds(selectedBranch)
      .then((ids) => { if (!cancelled) setOfferedCourseIds(ids); })
      .catch(() => { if (!cancelled) setOfferedCourseIds(new Set()); });
    return () => { cancelled = true; };
  }, [selectedBranch]);

  // Batches belong to a branch, so picking a branch decides which are on offer.
  // An administrator who has picked none sees them all.
  // And a batch teaches one course: once a course is picked, only its batches
  // (and any not yet tied to a course) are offered.
  const branchBatches = (selectedBranch
    ? batches.filter((batch) => !batch.branchId || batch.branchId === selectedBranch)
    : batches
  ).filter((batch) => !selectedCourse || !batch.courseId || batch.courseId === selectedCourse);

  /** Keyed by the batch's id: one batch carries one set of subjects. */
  const addAssignment = useCallback((assignment: CourseAssignment) => {
    const newItem: CourseAssignment = assignment;
    setAssignments((prev) => [newItem, ...prev.filter((i) => i.id !== newItem.id)]);
    return newItem;
  }, []);

  const updateAssignment = useCallback((id: string, patch: Partial<CourseAssignment>) => {
    setAssignments((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }, []);

  const removeAssignment = useCallback((id: string) => {
    setAssignments((prev) => prev.filter((i) => i.id !== id));
  }, []);

  /**
   * Branch is offered only where there is more than one to choose between: a
   * branch-scoped account assigns within its own, and a control with a single
   * choice on it is a control that does nothing.
   */
  const assignmentFilters: TableFilter<CourseAssignment>[] = [
    ...(canChooseBranch ? [{ label: "Branch", key: "branch" as const }] : []),
    { label: "Course", key: "course" as const },
    {
      label: "Status",
      key: "status" as const,
      options: ["Active", "Inactive"],
      // "assigned" is the course actively running on that batch; "pending" is
      // one set up but not yet switched on. The catalogue calls these Active
      // and Inactive everywhere else, so this list says the same words.
      value: (item: CourseAssignment) => (item.status === "assigned" ? "Active" : "Inactive"),
    },
  ];

  const handleActions = (assignment: CourseAssignment) => [
    { label: "View Details", onClick: () => setDetails(assignment) },
    { label: "Edit Assignment", onClick: () => setEditing(assignment) },
    {
      label: assignment.status === "assigned" ? "Mark Pending" : "Mark Assigned",
      onClick: () => {
        updateAssignment(assignment.id, { status: assignment.status === "assigned" ? "pending" : "assigned" });
        toast({ title: "Assignment updated", description: `${assignment.course} · ${assignment.batch}` });
      },
    },
    { label: "Remove Assignment", onClick: () => setPendingRemove(assignment), destructive: true },
  ];

  const toggleSubject = (subject: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  };

  const addSubject = () => {
    const name = newSubject.trim();
    if (!name) {
      toast({ title: "Type a subject name first", variant: "destructive" });
      return;
    }
    if (subjectsList.some((s) => s.toLowerCase() === name.toLowerCase())) {
      toast({ title: "That subject already exists", description: name, variant: "destructive" });
      return;
    }
    void saveOptions("subject", [...subjectsList, name]);
    setSelectedSubjects((prev) => [...prev, name]);
    setNewSubject("");
    toast({ title: "Subject created", description: `${name} was added and selected.` });
  };

  const toggleTeacher = (name: string) => {
    setSelectedTeachers((prev) =>
      prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name]
    );
  };

  /** There is no staff table to pick from, so the roll is built by typing. */
  const addTeacher = () => {
    const name = newTeacher.trim();
    if (!name) {
      toast({ title: "Type a teacher's name first", variant: "destructive" });
      return;
    }
    if (teacherList.some((t) => t.toLowerCase() === name.toLowerCase())) {
      toast({ title: "That teacher is already listed", description: name, variant: "destructive" });
      return;
    }
    void saveOptions("teacher", [...optionList("teacher"), name]);
    setSelectedTeachers((prev) => [...prev, name]);
    setNewTeacher("");
  };

  /** A selection has to follow a rename, and lose anything removed. */
  const followEdits = (selected: string[], { renames, removed }: ManageListResult) => {
    const renamed = new Map(renames.map((r) => [r.from.toLowerCase(), r.to]));
    const gone = new Set(removed.map((name) => name.toLowerCase()));
    return [
      ...new Set(
        selected
          .filter((name) => !gone.has(name.toLowerCase()))
          .map((name) => renamed.get(name.toLowerCase()) ?? name),
      ),
    ];
  };

  const saveSubjects = async (result: ManageListResult) => {
    const { stored } = await saveOptions("subject", result.values);
    setSelectedSubjects((prev) => followEdits(prev, result));
    toast({
      title: "Subjects updated",
      description: stored
        ? "Everyone in the organisation sees this list."
        : "Saved in this browser only until the options table is set up.",
    });
  };

  /**
   * Renaming a teacher renames them on the batches they are already on.
   *
   * Otherwise the old spelling is read straight back off those batches and the
   * teacher shows twice, once under each name — which looks exactly like the
   * rename did not work.
   */
  const saveTeachers = async (result: ManageListResult) => {
    const scope = canChooseBranch ? selectedBranch || null : branchId;
    let batches = 0;
    for (const { from, to } of result.renames) {
      const { data } = await renameInstructor(scope, from, to);
      batches += data.batches;
    }
    await saveOptions("teacher", result.values);
    setSelectedTeachers((prev) => followEdits(prev, result));
    const { data: usage } = await getInstructorUsage(branchId);
    setTeacherUsage(usage);
    toast({
      title: "Teachers updated",
      description: batches
        ? `Renamed on ${batches} ${batches === 1 ? "batch" : "batches"} as well.`
        : "The list is saved.",
    });
  };

  /** A teacher still on a batch can be renamed here, but not removed. */
  const teacherLocks = useMemo(
    () =>
      Object.fromEntries(
        teacherUsage
          .filter((entry) => entry.batches.length)
          .map((entry) => [
            entry.name,
            `Teaches ${entry.batches.slice(0, 2).join(", ")}${entry.batches.length > 2 ? ` and ${entry.batches.length - 2} more` : ""}`,
          ]),
      ),
    [teacherUsage],
  );

  const resetForm = () => {
    // A branch login has only one branch to file against, so clearing it would
    // leave the form unusable until the page was reloaded.
    setSelectedBranch(canChooseBranch ? "" : branchId || "");
    setSelectedCourse("");
    setSelectedBatch("");
    setSelectedSubjects([]);
    setNewSubject("");
    setSelectedTeachers([]);
    setNewTeacher("");
  };

  const assign = async () => {
    const course = courses.find((c) => c.id === selectedCourse);
    const batch = batches.find((b) => b.id === selectedBatch);
    if (!selectedBranch) {
      toast({ title: "Choose a branch", variant: "destructive" });
      return;
    }
    if (!course || !batch) {
      toast({ title: "Choose both a course and a batch", variant: "destructive" });
      return;
    }
    if (!selectedSubjects.length) {
      toast({ title: "Select at least one subject", variant: "destructive" });
      return;
    }
    if (!selectedTeachers.length) {
      toast({ title: "Select at least one teacher", variant: "destructive" });
      return;
    }
    if (batch.courseId && batch.courseId !== course.id) {
      toast({
        title: "This batch teaches another course",
        description: `${batch.name} belongs to ${courses.find((c) => c.id === batch.courseId)?.name ?? "another course"}. Pick one of ${course.name}'s batches.`,
        variant: "destructive",
      });
      return;
    }
    if (assignments.some((a) => a.id === batch.id)) {
      toast({
        title: "Already assigned",
        description: `${batch.name} already has its subjects. Use Edit Assignment to change them.`,
        variant: "destructive",
      });
      return;
    }

    // An assignment is saved in two places: the branch keeps the course in
    // `branch_courses`, which every branch-side course list reads, and the
    // batch keeps its teacher and subjects (`batches.instructor`, `.subjects`),
    // which is what the batch's students see on their portal.
    const teachers = [...selectedTeachers];
    try {
      const offered = await setBranchCourseOffered(selectedBranch, course.id);
      // The catalogue may have changed under this screen since it loaded.
      if (!offered.success) {
        toast({
          title: "Could not give this course to the branch",
          description: offered.error,
          variant: "destructive",
        });
        return;
      }
      setOfferedCourseIds((prev) => new Set(prev).add(course.id));
    } catch (err) {
      toast({
        title: "Could not give this course to the branch",
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      });
      return;
    }

    const subjects = [...selectedSubjects];
    try {
      const saved = await updateBatch(batch.id, {
        instructor: teachers.join(", "),
        subjects,
        // A batch not yet tied to a course is tied to this one.
        ...(batch.courseId ? {} : { courseId: course.id }),
      });
      if (!(saved.data.subjects as string[] | undefined)?.length) {
        toast({
          title: "Subjects were not saved",
          description: "The database has no place for them yet. Run supabase/schema/add-batch-subjects.sql in the Supabase SQL editor, then assign again.",
          variant: "destructive",
        });
        return;
      }
      setBatches((prev) =>
        prev.map((b) => (b.id === batch.id ? { ...b, instructor: teachers.join(", "), subjects, courseId: b.courseId || course.id } : b)),
      );
    } catch (err) {
      toast({
        title: "Could not save the teacher on this batch",
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      });
      return;
    }

    const branchName = branchOptions.find((b) => b.id === selectedBranch)?.name || "the branch";
    addAssignment({
      id: batch.id,
      course: course.name,
      courseCode: course.code,
      branch: branchName,
      batch: batch.name,
      subjects,
      instructors: teachers,
      status: "assigned",
    });
    toast({
      title: "Course assigned",
      description: `${course.name} → ${batch.name}, taught by ${teachers.join(", ")}. ${branchName} now sees this course.`,
    });
    resetForm();
  };

  const saveEdit = async () => {
    if (!editing) return;
    if (!editing.subjects.length) {
      toast({ title: "An assignment needs at least one subject", variant: "destructive" });
      return;
    }
    try {
      await updateBatch(editing.id, { subjects: editing.subjects, instructor: editing.instructors.join(", ") });
    } catch (err) {
      toast({ title: "Could not save", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
      return;
    }
    updateAssignment(editing.id, editing);
    setBatches((prev) =>
      prev.map((b) => (b.id === editing.id ? { ...b, subjects: editing.subjects, instructor: editing.instructors.join(", ") } : b)),
    );
    toast({ title: "Assignment saved", description: `${editing.course} · ${editing.batch}` });
    setEditing(null);
  };

  const confirmRemove = async () => {
    if (!pendingRemove) return;
    try {
      // The teacher stays on the batch; only its subjects are taken off.
      await updateBatch(pendingRemove.id, { subjects: [] });
    } catch (err) {
      toast({ title: "Could not remove", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
      return;
    }
    removeAssignment(pendingRemove.id);
    setBatches((prev) => prev.map((b) => (b.id === pendingRemove.id ? { ...b, subjects: [] } : b)));
    toast({ title: "Assignment removed", description: `${pendingRemove.course} · ${pendingRemove.batch}` });
    setPendingRemove(null);
  };

  return (
    <AppLayout>
      <PageHeader
        title="Assign Course to Batch"
        description="Link courses with batches and assign subjects"
        breadcrumbs={[
          { label: "Course Management", href: "/course/view" },
          { label: "Assign Course to Batch" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        {/* Which courses a branch runs is the organisation's decision -- the
            policy on branch_courses only accepts writes from an admin -- so a
            branch is shown what it has rather than a form the database would
            refuse. */}
        {!canChooseBranch ? (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Courses assigned to your branch
              </CardTitle>
              <CardDescription>
                The organisation office decides which courses your branch runs. Ask them to add one
                if something is missing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : offeredCourseIds.size === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No course has been assigned to your branch yet. Ask the organisation office
                  to assign one before admitting students.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {courses
                    .filter((course) => offeredCourseIds.has(course.id) && course.isActive !== false)
                    .map((course) => (
                      <Badge key={course.id} variant="secondary">
                        {course.name} ({course.code})
                      </Badge>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              New Assignment
            </CardTitle>
            <CardDescription>Assign a course to a batch with selected subjects</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Select Branch *</Label>
                <Select
                  value={selectedBranch}
                  onValueChange={(value) => {
                    setSelectedBranch(value);
                    // The batch belongs to a branch; keeping one from the
                    // previous branch selected would file the assignment
                    // against a batch the new branch does not own.
                    setSelectedBatch("");
                  }}
                  disabled={!canChooseBranch || loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loading ? "Loading branches…" : "Choose a branch"} />
                  </SelectTrigger>
                  <SelectContent searchable searchPlaceholder="Search centre…">
                    {branchOptions.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}{branch.code ? ` (${branch.code})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!loading && branchOptions.length === 0 && (
                  <p className="text-xs text-destructive">
                    No active branches found. Create one under Branch first.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Select Course *</Label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {assignable.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name} ({course.code})
                        {offeredCourseIds.has(course.id) ? " · already assigned" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Select Batch *</Label>
                <Select value={selectedBatch} onValueChange={setSelectedBatch} disabled={!selectedBranch}>
                  <SelectTrigger>
                    <SelectValue placeholder={selectedBranch ? "Choose a batch" : "Choose a branch first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {branchBatches.map((batch) => (
                      <SelectItem key={batch.id} value={batch.id}>
                        {batch.name}{batch.courseId ? ` - ${courses.find((c) => c.id === batch.courseId)?.name ?? ""}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedBranch && !loading && branchBatches.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    This branch has no batches yet. Create one under Create Batch.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {/* The label and its Manage button share a row; the create box
                  wraps under them on a phone instead of squeezing the label
                  onto two lines and cutting the input off mid-word. */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <Label>Select Subjects</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1 px-2 text-xs"
                    onClick={() => setManageSubjects(true)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                </div>
                <div className="flex w-full gap-2 sm:w-auto sm:max-w-xs">
                  <Input
                    placeholder="New subject name"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSubject();
                      }
                    }}
                    className="h-8"
                  />
                  <Button size="sm" variant="outline" onClick={addSubject} className="h-8 shrink-0">
                    Create Subject
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 border rounded-lg">
                {subjectsList.map((subject) => (
                  <div key={subject} className="flex items-center space-x-2">
                    <Checkbox
                      id={subject}
                      checked={selectedSubjects.includes(subject)}
                      onCheckedChange={() => toggleSubject(subject)}
                    />
                    <label htmlFor={subject} className="text-sm cursor-pointer line-clamp-1">
                      {subject}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {selectedSubjects.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">Selected:</span>
                {selectedSubjects.map((subject) => (
                  <Badge key={subject} variant="secondary">{subject}</Badge>
                ))}
              </div>
            )}

            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <Label>Select Teachers</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1 px-2 text-xs"
                    onClick={() => setManageTeachers(true)}
                    disabled={!teacherList.length}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                </div>
                <div className="flex w-full gap-2 sm:w-auto sm:max-w-xs">
                  <Input
                    placeholder="New teacher name"
                    value={newTeacher}
                    onChange={(e) => setNewTeacher(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTeacher();
                      }
                    }}
                    className="h-8"
                  />
                  <Button size="sm" variant="outline" onClick={addTeacher} className="h-8 shrink-0">
                    Add Teacher
                  </Button>
                </div>
              </div>
              {teacherList.length === 0 ? (
                <p className="text-sm text-muted-foreground border rounded-lg p-4">
                  No teachers recorded yet. Type a name above to add the first one.
                </p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 border rounded-lg">
                  {teacherList.map((teacher) => (
                    <div key={teacher} className="flex items-center space-x-2">
                      <Checkbox
                        id={`teacher-${teacher}`}
                        checked={selectedTeachers.includes(teacher)}
                        onCheckedChange={() => toggleTeacher(teacher)}
                      />
                      <label htmlFor={`teacher-${teacher}`} className="text-sm cursor-pointer line-clamp-1">
                        {teacher}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              <Button disabled={loading || !selectedBranch || !selectedCourse || !selectedBatch} onClick={assign}>
                <Link2 className="h-4 w-4 mr-2" />
                Assign Course
              </Button>
            </div>
          </CardContent>
        </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm">Total Assignments</span>
              <span className="font-bold">{assignments.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm">Active Assignments</span>
              <span className="font-bold text-success">{assignments.filter(a => a.status === "assigned").length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm">Pending Assignments</span>
              <span className="font-bold text-warning">{assignments.filter(a => a.status === "pending").length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm">Courses at this branch</span>
              <span className="font-bold">{offeredCourseIds.size}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm">Total Batches</span>
              <span className="font-bold">{branchBatches.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={assignments}
            columns={columns}
            filters={assignmentFilters}
            searchPlaceholder="Search assignments..."
            actions={handleActions}
          />
        </CardContent>
      </Card>

      <ManageListDialog
        open={manageSubjects}
        onOpenChange={setManageSubjects}
        title="Subjects"
        items={subjectsList}
        minItems={1}
        note="Rename or remove a subject. The list is the organisation's, so every branch sees the change."
        onSave={saveSubjects}
      />

      <ManageListDialog
        open={manageTeachers}
        onOpenChange={setManageTeachers}
        title="Teachers"
        items={teacherList}
        locked={teacherLocks}
        note="Renaming a teacher renames them on the batches they already teach, too."
        onSave={saveTeachers}
      />

      <Dialog open={!!details} onOpenChange={(open) => !open && setDetails(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{details?.course}</DialogTitle>
            <DialogDescription>{details?.courseCode} · {details?.batch}</DialogDescription>
          </DialogHeader>
          {details && (
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="font-medium capitalize">{details.status}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Subjects ({details.subjects.length})</p>
                <div className="flex flex-wrap gap-1">
                  {details.subjects.map((subject) => (
                    <Badge key={subject} variant="secondary">{subject}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Instructors</p>
                <div className="flex flex-wrap gap-1">
                  {details.instructors.map((instructor) => (
                    <Badge key={instructor} variant="outline">{instructor}</Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetails(null)}>Close</Button>
            <Button
              onClick={() => {
                setEditing(details);
                setDetails(null);
              }}
            >
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit assignment</DialogTitle>
            <DialogDescription>{editing?.course} · {editing?.batch}</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-instructors">Instructors (comma separated)</Label>
                <Input
                  id="edit-instructors"
                  value={editing.instructors.join(", ")}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      instructors: e.target.value.split(",").map((i) => i.trim()).filter(Boolean),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Subjects</Label>
                <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto p-3 border rounded-lg">
                  {Array.from(new Set([...subjectsList, ...editing.subjects])).map((subject) => (
                    <div key={subject} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-${subject}`}
                        checked={editing.subjects.includes(subject)}
                        onCheckedChange={() =>
                          setEditing({
                            ...editing,
                            subjects: editing.subjects.includes(subject)
                              ? editing.subjects.filter((s) => s !== subject)
                              : [...editing.subjects, subject],
                          })
                        }
                      />
                      <label htmlFor={`edit-${subject}`} className="text-sm cursor-pointer line-clamp-1">
                        {subject}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={saveEdit}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!pendingRemove} onOpenChange={(open) => !open && setPendingRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this assignment?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingRemove?.course} will no longer be linked to {pendingRemove?.batch}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemove}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
