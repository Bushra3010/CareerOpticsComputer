import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown, Download, Search, Users, CreditCard } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { photoOf, type StudentRecord } from "@/lib/studentRecord";
import { studentCardsPdf, type StudentCard } from "@/lib/brand/brandDocuments";
import { getBatches, getBranches, getCourses, getStudents } from "@/lib/supabase/data";
import { matchesSearch } from "@/lib/search";
import { useAuth } from "@/contexts/AuthContext";

interface IdCardStudent {
  id: string;
  branchId: string;
  courseId: string;
  name: string;
  class: string;
  section: string;
  rollNo: string;
  photo: boolean;
  code?: string;
  photoUrl?: string;
  dob: string;
  bloodGroup: string;
  parentContact: string;
  address: string;
  fatherName?: string;
  session?: string;
  /** The date of birth as stored, for the card's DD-MM-YYYY. */
  dobIso?: string;
}

const ALL_COURSES = "all";

export default function GenerateIDCards() {
  // `view`, not the role: the office working as a centre sees that centre only.
  const { user, view } = useAuth();
  const ownBranch = view === "admin" ? null : user?.branchId || null;
  const { toast } = useToast();
  const [rawStudents, setStudents] = useState<IdCardStudent[]>([]);
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState<Array<{ id: string; name: string }>>([]);
  const [courses, setCourses] = useState<Array<{ id: string; name: string }>>([]);
  // One branch or many: the office can print several centres' cards in one run.
  const [pickedBranches, setPickedBranches] = useState<string[]>([]);
  const branchIds = ownBranch ? [ownBranch] : pickedBranches;
  const branchKey = branchIds.join(",");
  const [branchQuery, setBranchQuery] = useState("");
  const [courseId, setCourseId] = useState(ALL_COURSES);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      ownBranch ? Promise.resolve({ data: [] }) : getBranches(user?.organizationId ?? null).catch(() => ({ data: [] })),
      getCourses(user?.organizationId ?? null).catch(() => ({ data: [] })),
    ]).then(([branchesRes, coursesRes]) => {
      if (cancelled) return;
      setBranches((branchesRes.data || []) as Array<{ id: string; name: string }>);
      setCourses((coursesRes.data || []) as Array<{ id: string; name: string }>);
    });
    return () => { cancelled = true; };
  }, [ownBranch, user?.organizationId]);

  // The chosen branches' students, once the branches are known.
  useEffect(() => {
    let cancelled = false;
    setSelectedStudents([]);
    setCourseId(ALL_COURSES);
    const ids = branchKey ? branchKey.split(",") : [];
    if (!ids.length) {
      setStudents([]);
      return;
    }
    setLoading(true);
    Promise.all([
      Promise.all(ids.map((id) => getStudents(id, 1, 2000))),
      Promise.all(ids.map((id) => getBatches(id).catch(() => ({ data: [] as Array<{ id: string; name: string }> })))),
    ])
      .then(([results, batchResults]) => {
        if (cancelled) return;
        // The card shows the course and batch by name, not by their ids.
        const batchName = new Map(batchResults.flatMap((r) => (r.data || []) as Array<{ id: string; name: string }>).map((b) => [b.id, b.name]));
        // `getStudents` resolves to `{ success, data, meta }` - mapping over the
        // envelope threw, so this list was always empty.
        const rows = results.flatMap((r) => (r.data ?? []) as StudentRecord[]);
        const mapped: IdCardStudent[] = rows.map((row) => {
          const s = row as StudentRecord & Record<string, string>;
          return {
          id: s.id,
          branchId: String(s.branchId || ""),
          courseId: String(s.courseId || ""),
          name: [s.firstName, s.middleName, s.lastName].filter(Boolean).join(" "),
          class: "",
          section: (s.batchId && batchName.get(String(s.batchId))) || "—",
          rollNo: s.enrollmentNo || s.applicationNo || "—",
          code: s.enrollmentNo || s.applicationNo || "",
          // The admission's passport photograph, where there is one.
          photo: Boolean(photoOf(s as StudentRecord)),
          photoUrl: photoOf(s as StudentRecord) || undefined,
          dob: s.dateOfBirth ? new Date(s.dateOfBirth).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—",
          bloodGroup: s.bloodGroup ?? "—",
          parentContact: s.phone ?? "—",
          address: [s.streetAddress, s.city, s.state, s.pincode].filter(Boolean).join(", ") || "—",
          fatherName: s.fatherName || "",
          session: s.academicYear || "",
          dobIso: s.dateOfBirth || "",
          };
        });
        setStudents(mapped);
      })
      .catch((error) => {
        if (!cancelled) {
          toast({
            title: "Failed to load students",
            description: error instanceof Error ? error.message : "Could not fetch student list.",
            variant: "destructive",
          });
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [toast, branchKey]);

  // The card shows the course by name; the names may arrive after the students.
  const students = useMemo(() => {
    const courseName = new Map(courses.map((c) => [c.id, c.name]));
    return rawStudents.map((s) => ({ ...s, class: courseName.get(s.courseId) || "—" }));
  }, [rawStudents, courses]);

  const branchName = (id: string) => branches.find((b) => b.id === id)?.name || "";
  const many = branchIds.length > 1;
  const shownBranches = branches.filter((b) => matchesSearch(b.name, branchQuery));
  const toggleBranch = (id: string, on: boolean) =>
    setPickedBranches((prev) => (on ? [...prev, id] : prev.filter((b) => b !== id)));
  const branchLabel = !pickedBranches.length
    ? "Select branches"
    : pickedBranches.length === 1
      ? branchName(pickedBranches[0])
      : pickedBranches.length === branches.length
        ? `All branches (${branches.length})`
        : `${pickedBranches.length} branches`;
  // Only the courses this branch's students are on, each with its head count.
  const branchCourses = courses
    .map((c) => ({ ...c, count: students.filter((s) => s.courseId === c.id).length }))
    .filter((c) => c.count > 0);
  const runName = [many ? `${branchIds.length} branches` : branchName(branchIds[0] || ""), courseId !== ALL_COURSES ? courses.find((c) => c.id === courseId)?.name : ""].filter(Boolean).join(" - ") || "students";

  const filteredStudents = students.filter(
    (s) =>
      (courseId === ALL_COURSES || s.courseId === courseId) &&
      matchesSearch(`${s.name} ${s.rollNo}`, searchTerm),
  );

  /** Rows hidden by the filters are not printed, even if they were ticked. */
  const chosen = filteredStudents.filter((s) => selectedStudents.includes(s.id));
  const missingPhotos = chosen.filter((s) => !s.photo).length;

  const toggleStudent = (id: string) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    const visibleIds = filteredStudents.map((s) => s.id);
    setSelectedStudents((prev) =>
      visibleIds.every((id) => prev.includes(id))
        ? prev.filter((id) => !visibleIds.includes(id))
        : Array.from(new Set([...prev, ...visibleIds])),
    );
  };


  /**
   * The academy's student identity card for every ticked student, as one PDF:
   * each card's front beside its back, three to an A4 sheet.
   */
  const downloadPdf = async () => {
    if (!chosen.length) {
      toast({ title: "No students selected", description: "Tick at least one student.", variant: "destructive" });
      return;
    }
    const validTill = `${new Date().getFullYear() + 1}-03-31`;
    const cards: StudentCard[] = chosen.map((s) => ({
      name: s.name,
      studentId: s.code || s.rollNo,
      course: s.class === "—" ? "" : s.class,
      session: s.session || "",
      fatherName: s.fatherName || "",
      dob: s.dobIso || "",
      mobile: s.parentContact === "—" ? "" : s.parentContact,
      address: s.address === "—" ? "" : s.address,
      validTill,
      photo: s.photoUrl || null,
    }));
    try {
      const { pages } = await studentCardsPdf(cards, `id-cards-${runName}.pdf`);
      toast({
        title: "ID cards ready",
        description: `${chosen.length} card${chosen.length === 1 ? "" : "s"} across ${pages} page${pages === 1 ? "" : "s"} - check your Downloads.`,
      });
    } catch (error) {
      toast({ title: "Could not make the cards", description: error instanceof Error ? error.message : undefined, variant: "destructive" });
    }
  };

  const allVisibleSelected =
    filteredStudents.length > 0 && filteredStudents.every((s) => selectedStudents.includes(s.id));

  return (
    <AppLayout>
      <PageHeader
        title="Generate ID Cards"
        description="Select students and generate ID cards in bulk"
        breadcrumbs={[
          { label: "Certificate & Marksheet", href: "/certificate/issue" },
          { label: "Generate ID Cards" },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filters */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Filters & Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!ownBranch && (
              <div className="space-y-2">
                <Label>Branch</Label>
                <Popover onOpenChange={(open) => !open && setBranchQuery("")}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" aria-label="Branch" className="h-11 w-full justify-between rounded-[14px] border-[1.5px] font-normal">
                      <span className={`truncate ${pickedBranches.length ? "" : "text-muted-foreground"}`}>{branchLabel}</span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] min-w-[16rem] p-1.5">
                    <div className="relative mb-1">
                      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="search"
                        value={branchQuery}
                        onChange={(e) => setBranchQuery(e.target.value)}
                        placeholder="Search branch…"
                        aria-label="Search branch…"
                        className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <label className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm font-medium hover:bg-muted/60">
                      <Checkbox
                        checked={branches.length > 0 && pickedBranches.length === branches.length}
                        onCheckedChange={(v) => setPickedBranches(v === true ? branches.map((b) => b.id) : [])}
                        aria-label="All branches"
                      />
                      All branches
                    </label>
                    <div className="max-h-64 overflow-y-auto border-t pt-1">
                      {shownBranches.map((b) => (
                        <label key={b.id} className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-muted/60">
                          <Checkbox checked={pickedBranches.includes(b.id)} onCheckedChange={(v) => toggleBranch(b.id, v === true)} aria-label={b.name} />
                          <span className="truncate">{b.name}</span>
                        </label>
                      ))}
                      {!shownBranches.length && <p className="px-2 py-3 text-center text-sm text-muted-foreground">No match for “{branchQuery.trim()}”</p>}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            )}

            <div className="space-y-2">
              <Label>Course</Label>
              <Select value={courseId} onValueChange={(v) => { setCourseId(v); setSelectedStudents([]); }} disabled={!branchIds.length}>
                <SelectTrigger aria-label="Course">
                  <SelectValue placeholder="All courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_COURSES}>All courses ({students.length})</SelectItem>
                  {branchCourses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name} ({c.count})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4 border-t space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>Selected: {chosen.length} students</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span>Cards to generate: {chosen.length}</span>
              </div>
              {missingPhotos > 0 && (
                <p className="text-xs text-destructive">
                  {missingPhotos} selected student{missingPhotos === 1 ? "" : "s"} have no photo - those cards print a blank frame.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2 pt-4">
              <Button className="w-full" disabled={chosen.length === 0} onClick={downloadPdf}>
                <Download className="h-4 w-4 mr-2" />
                Download ID Cards ({chosen.length})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Student Selection */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="text-lg">Select Students{branchIds.length > 0 && !loading ? <Badge variant="secondary" className="ml-2">{filteredStudents.length}</Badge> : null}</CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search name or enrollment..."
                  aria-label="Search students"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="text-center py-8 text-muted-foreground">Loading students...</div>
            )}
            {!loading && (
            <div className="border rounded-lg overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-3 text-left">
                      <Checkbox checked={allVisibleSelected} onCheckedChange={toggleAll} aria-label="Select all students shown" />
                    </th>
                    <th className="p-3 text-left text-sm font-medium">Enrollment No</th>
                    <th className="p-3 text-left text-sm font-medium">Name</th>
                    {many && <th className="p-3 text-left text-sm font-medium">Branch</th>}
                    <th className="p-3 text-left text-sm font-medium">Course / Batch</th>
                    <th className="p-3 text-left text-sm font-medium">Photo</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-muted/30">
                      <td className="p-3">
                        <Checkbox
                          checked={selectedStudents.includes(student.id)}
                          onCheckedChange={() => toggleStudent(student.id)}
                          aria-label={student.name}
                        />
                      </td>
                      <td className="p-3 text-sm font-mono">{student.rollNo}</td>
                      <td className="p-3 text-sm font-medium">{student.name}</td>
                      {many && <td className="p-3 text-sm">{branchName(student.branchId) || "—"}</td>}
                      <td className="p-3 text-sm">{student.class}{student.section !== "—" ? ` · ${student.section}` : ""}</td>
                      <td className="p-3">
                        <Badge variant={student.photo ? "default" : "destructive"}>
                          {student.photo ? "Available" : "Missing"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}

            {!loading && filteredStudents.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {!branchIds.length ? "Select a branch to list its students." : students.length ? "No students found matching your search" : many ? "These branches have no students yet." : "This branch has no students yet."}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </AppLayout>
  );
}