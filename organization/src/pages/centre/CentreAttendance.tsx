import { useCallback, useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { DceBadge, DceButton, DceField, DceInput, DcePanel, DceSelect, DceTable, type DceColumn } from "@/components/dce/Dce";
import { supabase } from "@/lib/supabase/client";
import { getBatches, getBatchesByOrg, getBranches, getCourses } from "@/lib/supabase/data";
import { listStudents, saveAttendance, studentName, type StudentRow } from "@/lib/supabase/examAttendance";

interface BatchRow {
  id: string;
  name: string;
  branchId: string;
  courseId: string;
  students: number;
}

interface Mark {
  studentId: string;
  batchId: string | null;
  date: string;
  status: string;
}

/** Local calendar date, not UTC: a register taken at 9 am IST is that day's. */
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export default function CentreAttendance() {
  const { user, branchId, organizationId } = useAuth();
  const { toast } = useToast();
  const isAdmin = !branchId;
  const [batches, setBatches] = useState<BatchRow[]>([]);
  const [courses, setCourses] = useState<Map<string, string>>(new Map());
  const [branches, setBranches] = useState<Map<string, string>>(new Map());
  const [marks, setMarks] = useState<Mark[]>([]);
  const [studentBatch, setStudentBatch] = useState<Map<string, string>>(new Map());
  const [courseFilter, setCourseFilter] = useState("");
  const [loading, setLoading] = useState(true);

  // The two steps of "Mark": pick the date, then take the register.
  const [marking, setMarking] = useState<BatchRow | null>(null);
  const [date, setDate] = useState(today());
  const [roll, setRoll] = useState<StudentRow[] | null>(null);
  const [register, setRegister] = useState<Record<string, "PRESENT" | "ABSENT">>({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let records = supabase.from("attendance_records").select("studentId,batchId,date,status");
      if (branchId) records = records.eq("branchId", branchId);
      const [b, c, br, a, s] = await Promise.all([
        branchId ? getBatches(branchId) : getBatchesByOrg(organizationId),
        getCourses(organizationId, branchId),
        isAdmin ? getBranches(organizationId) : Promise.resolve({ success: true, data: [] as Record<string, unknown>[] }),
        records,
        listStudents(branchId),
      ]);
      if (a.error) throw new Error(a.error.message);
      setBatches(
        (b.data || []).map((r: Record<string, unknown>) => ({
          id: String(r.id),
          name: String(r.name ?? ""),
          branchId: String(r.branchId ?? ""),
          courseId: String(r.courseId ?? ""),
          students: Number(r.currentStudents) || 0,
        })),
      );
      setCourses(new Map((c.data || []).map((r: Record<string, unknown>) => [String(r.id), String(r.name ?? "")])));
      setBranches(new Map((br.data || []).map((r: Record<string, unknown>) => [String(r.id), String(r.name ?? "")])));
      setMarks(((a.data || []) as Record<string, unknown>[]).map((r) => ({
        studentId: String(r.studentId ?? ""),
        batchId: r.batchId ? String(r.batchId) : null,
        date: String(r.date ?? "").slice(0, 10),
        status: String(r.status ?? ""),
      })));
      setStudentBatch(new Map(s.filter((x) => x.batchId).map((x) => [x.id, String(x.batchId)])));
    } catch (e) {
      toast({ title: "Could not load attendance", description: e instanceof Error ? e.message : "", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [branchId, organizationId, isAdmin, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  /**
   * Days marked per batch. Older registers (taken from the all-students
   * attendance page) were saved without a batch, so those fall back to the
   * batch the student is in now.
   */
  const daysByBatch = useMemo(() => {
    const out = new Map<string, Set<string>>();
    for (const m of marks) {
      const batch = m.batchId || studentBatch.get(m.studentId);
      if (!batch) continue;
      if (!out.has(batch)) out.set(batch, new Set());
      out.get(batch)!.add(m.date);
    }
    return out;
  }, [marks, studentBatch]);

  const shown = useMemo(() => batches.filter((b) => !courseFilter || b.courseId === courseFilter), [batches, courseFilter]);

  const openMark = (b: BatchRow) => {
    setMarking(b);
    setDate(today());
    setRoll(null);
  };

  const takeRegister = async () => {
    if (!marking || !date) return;
    try {
      const students = await listStudents(marking.branchId || branchId, marking.id);
      const already = new Map(marks.filter((m) => m.date === date).map((m) => [m.studentId, m.status]));
      // A day marked before opens as it was saved; a new day starts everyone present.
      setRegister(Object.fromEntries(students.map((s) => [s.id, already.get(s.id) === "ABSENT" ? "ABSENT" : "PRESENT"])));
      setRoll(students);
    } catch (e) {
      toast({ title: "Could not load the batch's students", description: e instanceof Error ? e.message : "", variant: "destructive" });
    }
  };

  const save = async () => {
    if (!marking || !roll) return;
    if (!roll.length) return toast({ title: "Nothing to save", description: "This batch has no students." });
    setSaving(true);
    try {
      const result = await saveAttendance(
        marking.branchId || branchId,
        date,
        roll.map((s) => ({ studentId: s.id, status: register[s.id] || "PRESENT", batchId: marking.id })),
        user?.id,
      );
      toast({ title: "Attendance saved", description: `${result.inserted + result.updated} student(s) marked for ${date}.` });
      setMarking(null);
      await load();
    } catch (e) {
      toast({ title: "Could not save attendance", description: e instanceof Error ? e.message : "", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const day = today();
  const columns: DceColumn<BatchRow>[] = [
    { key: "n", label: "#", render: (_r, i) => i + 1, className: "w-10" },
    { key: "batch", label: "Batch", render: (r) => <span className="font-semibold">{r.name}</span> },
    ...(isAdmin ? [{ key: "branch", label: "Centre", render: (r: BatchRow) => branches.get(r.branchId) || "—" }] : []),
    { key: "course", label: "Course", render: (r) => courses.get(r.courseId) || "—" },
    { key: "students", label: "Students", render: (r) => r.students },
    { key: "days", label: "Attendances", render: (r) => daysByBatch.get(r.id)?.size ?? 0 },
    {
      key: "today",
      label: "Today's Attendance",
      render: (r) => (daysByBatch.get(r.id)?.has(day) ? <DceBadge status="ACTIVE" label="Marked" /> : <DceBadge status="NOT MARKED" label="Not Marked" />),
    },
    {
      key: "action",
      label: "Action",
      render: (r) => (
        <DceButton size="sm" tone="blue" onClick={() => openMark(r)}>
          Mark
        </DceButton>
      ),
    },
  ];

  const present = roll ? roll.filter((s) => register[s.id] !== "ABSENT").length : 0;

  return (
    <AppLayout>
      <DcePanel title="Manage Attendance">
        <div className="mb-4 max-w-xs">
          <DceSelect aria-label="Filter by course" value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
            <option value="">All Courses</option>
            {[...courses].map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </DceSelect>
        </div>
        <DceTable columns={columns} rows={shown} rowKey={(r) => r.id} loading={loading} empty="No batches yet." />
      </DcePanel>

      {marking && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:items-center" role="dialog" aria-modal="true">
          <div className="w-full max-w-2xl">
            <DcePanel
              title={roll ? `Mark Attendance - ${marking.name} (${date})` : "Select Attendance Date"}
              actions={
                <DceButton tone="light" size="sm" onClick={() => setMarking(null)}>
                  Close
                </DceButton>
              }
            >
              {!roll ? (
                <div className="space-y-4">
                  <DceField label="Attendance Date" required>
                    <DceInput type="date" value={date} max={day} onChange={(e) => setDate(e.target.value)} />
                  </DceField>
                  <DceButton tone="blue" onClick={takeRegister} disabled={!date}>
                    Continue
                  </DceButton>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[13px] text-slate-600">
                    <span>
                      Present {present} / {roll.length}
                    </span>
                    <div className="flex gap-2">
                      <DceButton size="sm" tone="green" onClick={() => setRegister(Object.fromEntries(roll.map((s) => [s.id, "PRESENT"])))}>
                        All Present
                      </DceButton>
                      <DceButton size="sm" tone="light" onClick={() => setRoll(null)}>
                        Change Date
                      </DceButton>
                    </div>
                  </div>
                  <div className="max-h-[50vh] overflow-y-auto">
                    <table className="w-full border-collapse text-[13px]">
                      <tbody>
                        {roll.map((s, i) => (
                          <tr key={s.id} className="border-b border-slate-100">
                            <td className="w-8 px-2 py-2 text-slate-500">{i + 1}</td>
                            <td className="px-2 py-2">
                              <div className="font-semibold text-slate-700">{studentName(s)}</div>
                              <div className="text-[11.5px] text-slate-500">{s.enrollmentNo || ""}</div>
                            </td>
                            <td className="px-2 py-2 text-right">
                              <div className="inline-flex gap-1">
                                {(["PRESENT", "ABSENT"] as const).map((st) => (
                                  <DceButton
                                    key={st}
                                    size="sm"
                                    tone={register[s.id] === st ? (st === "PRESENT" ? "green" : "red") : "light"}
                                    aria-pressed={register[s.id] === st}
                                    onClick={() => setRegister((r) => ({ ...r, [s.id]: st }))}
                                  >
                                    {st === "PRESENT" ? "Present" : "Absent"}
                                  </DceButton>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {!roll.length && (
                          <tr>
                            <td className="px-2 py-6 text-center text-slate-500">This batch has no students.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <DceButton tone="blue" onClick={save} disabled={saving || !roll.length}>
                    {saving ? "Saving…" : "Save"}
                  </DceButton>
                </div>
              )}
            </DcePanel>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
