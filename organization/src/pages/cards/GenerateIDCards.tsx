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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronDown, Printer, Download, Eye, Search, Users, CreditCard, Image as ImageIcon, QrCode } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { printHtml } from "@/lib/export";
import {
  photoOf,
  printRecordsByBranch,
  type StudentRecord,
} from "@/lib/studentTemplateDocument";
import { idCardsPdf } from "@/lib/id-card-pdf";
import {
  ID_CARD_TEMPLATES_KEY,
  IdCardTemplate,
  fieldValue,
  idCardSheetHtml,
} from "@/data/id-card-templates";
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
}

const STORAGE_KEY = ID_CARD_TEMPLATES_KEY;

const ALL_COURSES = "all";

export default function GenerateIDCards() {
  // `view`, not the role: the office working as a centre sees that centre only.
  const { user, view } = useAuth();
  const ownBranch = view === "admin" ? null : user?.branchId || null;
  const { toast } = useToast();
  const [templates, setTemplates] = useState<IdCardTemplate[]>([]);
  /** The student rows as the database returns them, for the branch's template. */
  const [records, setRecords] = useState<StudentRecord[]>([]);
  const [rawStudents, setStudents] = useState<IdCardStudent[]>([]);
  const [loading, setLoading] = useState(false);
  const [templateId, setTemplateId] = useState("");
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
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setTemplates(JSON.parse(raw));
    } catch { /* use empty */ }
    return () => { cancelled = true; };
  }, []);

  const persistTemplates = (next: IdCardTemplate[]) => {
    setTemplates(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* quota */ }
  };

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
      setRecords([]);
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
        setRecords(rows);
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

  const template = templates.find((item) => item.id === templateId) ?? null;
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

  /** Every output button needs the same two things picked. */
  const ready = () => {
    if (!template) {
      toast({ title: "Choose a template", description: "Pick an ID card template first.", variant: "destructive" });
      return false;
    }
    if (!chosen.length) {
      toast({ title: "No students selected", description: "Tick at least one student.", variant: "destructive" });
      return false;
    }
    return true;
  };

  /**
   * The branch's own template first.
   *
   * The organisation designs an ID card in the Document Designer and gives it
   * to a branch; that is what its cards should look like. The field-list
   * template on this page is what prints when the library has none -- and each
   * card carries the student's own passport photograph either way.
   */
  const printCards = async () => {
    if (!chosen.length) {
      toast({ title: "No students selected", description: "Tick at least one student.", variant: "destructive" });
      return;
    }
    // The card prints the course and batch by name; the rows hold their ids.
    const picked: StudentRecord[] = records.flatMap((row) => {
      const shown = chosen.find((s) => s.id === row.id);
      return shown ? [{ ...row, courseName: shown.class === "—" ? "" : shown.class, batchName: shown.section === "—" ? "" : shown.section }] : [];
    });
    // Each card in its own branch's design, all in one print run.
    const printed = await printRecordsByBranch("student-id", picked, user?.organizationId ?? null).catch(() => false);
    if (printed) return;

    if (!ready() || !template) return;
    printHtml(
      `ID Cards - ${template.name} - ${runName}`,
      idCardSheetHtml(template, chosen),
    );
  };

  const downloadPdf = () => {
    if (!ready() || !template) return;
    const { pages } = idCardsPdf(template, chosen, `id-cards-${runName}.pdf`);
    toast({
      title: "PDF generated",
      description: `${chosen.length} card${chosen.length === 1 ? "" : "s"} across ${pages} page${pages === 1 ? "" : "s"} - check your Downloads.`,
    });
  };

  const openPreview = () => {
    if (!ready()) return;
    setPreviewOpen(true);
  };

  const allVisibleSelected =
    filteredStudents.length > 0 && filteredStudents.every((s) => selectedStudents.includes(s.id));

  return (
    <AppLayout>
      <PageHeader
        title="Generate ID Cards"
        description="Select students and generate ID cards in bulk"
        breadcrumbs={[
          { label: "Certificate & Marksheet", href: "/documents/designer" },
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

            <div className="space-y-2">
              <Label>Select Template</Label>
              <Select value={templateId} onValueChange={setTemplateId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} ({item.orientation})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!templates.length && (
                <p className="text-xs text-muted-foreground">
                  No templates yet - create one in ID Card Template.
                </p>
              )}
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
              <Button className="w-full" disabled={chosen.length === 0} onClick={printCards}>
                <CreditCard className="h-4 w-4 mr-2" />
                Generate ID Cards ({chosen.length})
              </Button>
              <Button variant="outline" className="w-full" disabled={!template || chosen.length === 0} onClick={openPreview}>
                <Eye className="h-4 w-4 mr-2" />
                Preview Cards
              </Button>
              <Button variant="outline" className="w-full" disabled={!template || chosen.length === 0} onClick={downloadPdf}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
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

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Card preview</DialogTitle>
            <DialogDescription>
              {template?.name} - {chosen.length} card{chosen.length === 1 ? "" : "s"} - {runName}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            <div className="flex flex-wrap gap-4">
              {template && chosen.map((student) => (
                <div
                  key={student.id}
                  className="overflow-hidden rounded-lg border bg-card shadow-sm"
                  style={{
                    width: template.orientation === "portrait" ? 200 : 300,
                    height: template.orientation === "portrait" ? 300 : 200,
                  }}
                >
                  <div className="px-3 py-2 text-white" style={{ background: template.accent }}>
                    <p className="text-xs font-bold leading-tight">{template.instituteName}</p>
                    <p className="text-[9px] opacity-85">{template.instituteAddress}</p>
                  </div>
                  <div className="flex gap-2 p-3">
                    {template.showPhoto && (
                      <div className="h-16 w-12 shrink-0 rounded border bg-muted flex items-center justify-center">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      {template.fields.includes("Student Name") && (
                        <p className="mb-1 truncate text-xs font-bold">{student.name}</p>
                      )}
                      <dl className="space-y-0.5">
                        {template.fields
                          .filter((label) => label !== "Student Name")
                          .map((label) => (
                            <div key={label} className="flex justify-between gap-2 text-[9px]">
                              <dt className="shrink-0 text-muted-foreground">{label}</dt>
                              <dd className="truncate font-medium">{fieldValue(label, student, template)}</dd>
                            </div>
                          ))}
                      </dl>
                    </div>
                  </div>
                  <div className="flex items-end justify-between px-3">
                    {template.showQr ? (
                      <div className="flex h-10 w-10 items-center justify-center rounded border">
                        <QrCode className="h-5 w-5 text-muted-foreground" />
                      </div>
                    ) : (
                      <span />
                    )}
                    {template.showSignature && (
                      <div className="text-center">
                        <div className="mb-1 w-16 border-t border-foreground" />
                        <span className="text-[9px]">Principal</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={printCards}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button onClick={downloadPdf}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}