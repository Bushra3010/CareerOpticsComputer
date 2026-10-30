import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { DceButton, DceInput, DceLinkButton, DcePanel, DceTable, type DceColumn } from "@/components/dce/Dce";
import { supabase } from "@/lib/supabase/client";
import { updateStudent } from "@/lib/supabase/data";
import { studentName, type StudentRow } from "@/lib/supabase/examAttendance";

interface BatchInfo {
  id: string;
  name: string;
  branchId: string;
  courseId: string;
  courseName: string;
}

const STUDENT_COLUMNS = "id,firstName,lastName,enrollmentNo,email,phone,branchId,courseId,batchId";

/**
 * One batch's roll, with the course's students who are in no batch yet
 * offered below it. Moving a student between batches is left to "Assign
 * Students to Batch", which checks seats and timings; here a student only
 * joins from no batch or leaves to no batch.
 */
export default function CentreBatchStudents() {
  const [params] = useSearchParams();
  const batchId = params.get("id") || "";
  const { branchId } = useAuth();
  const { toast } = useToast();
  const [batch, setBatch] = useState<BatchInfo | null>(null);
  const [members, setMembers] = useState<StudentRow[]>([]);
  const [unassigned, setUnassigned] = useState<StudentRow[]>([]);
  const [picked, setPicked] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!batchId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data: b, error } = await supabase.from("batches").select("id,name,branchId,courseId").eq("id", batchId).maybeSingle();
      if (error) throw new Error(error.message);
      if (!b) {
        setBatch(null);
        return;
      }
      const row = b as Record<string, unknown>;
      const { data: course } = await supabase.from("courses").select("name").eq("id", String(row.courseId ?? "")).maybeSingle();
      const info: BatchInfo = {
        id: String(row.id),
        name: String(row.name ?? ""),
        branchId: String(row.branchId ?? ""),
        courseId: String(row.courseId ?? ""),
        courseName: String((course as { name?: string } | null)?.name ?? ""),
      };
      setBatch(info);
      const [inBatch, free] = await Promise.all([
        supabase.from("students").select(STUDENT_COLUMNS).eq("batchId", batchId).is("deletedAt", null).order("firstName"),
        supabase
          .from("students")
          .select(STUDENT_COLUMNS)
          .eq("branchId", info.branchId)
          .eq("courseId", info.courseId)
          .is("batchId", null)
          .is("deletedAt", null)
          .order("firstName"),
      ]);
      if (inBatch.error) throw new Error(inBatch.error.message);
      if (free.error) throw new Error(free.error.message);
      setMembers((inBatch.data || []) as StudentRow[]);
      setUnassigned((free.data || []) as StudentRow[]);
      setPicked([]);
    } catch (e) {
      toast({ title: "Could not load the batch", description: e instanceof Error ? e.message : "", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [batchId, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const candidates = useMemo(() => {
    const q = search.trim().toLowerCase();
    return unassigned.filter((s) => !q || `${studentName(s)} ${s.enrollmentNo ?? ""} ${s.phone ?? ""}`.toLowerCase().includes(q));
  }, [unassigned, search]);

  const addPicked = async () => {
    if (!picked.length || !batch) return;
    setBusy(true);
    const failures: string[] = [];
    for (const id of picked) {
      try {
        await updateStudent(id, branchId, { batchId: batch.id });
      } catch (e) {
        failures.push(e instanceof Error ? e.message : "failed");
      }
    }
    // Reported as a count: a partial failure leaves some students in and some out.
    toast({
      title: failures.length ? `Added ${picked.length - failures.length} of ${picked.length}` : "Students added",
      description: failures[0],
      variant: failures.length ? "destructive" : "default",
    });
    setBusy(false);
    await load();
  };

  const remove = async (s: StudentRow) => {
    if (!window.confirm(`Remove ${studentName(s)} from this batch?`)) return;
    try {
      await updateStudent(s.id, branchId, { batchId: null });
      toast({ title: "Removed from batch", description: studentName(s) });
      await load();
    } catch (e) {
      toast({ title: "Could not remove", description: e instanceof Error ? e.message : "", variant: "destructive" });
    }
  };

  const memberColumns: DceColumn<StudentRow>[] = [
    { key: "n", label: "#", render: (_r, i) => i + 1, className: "w-10" },
    { key: "name", label: "Name", render: (s) => <span className="font-semibold">{studentName(s)}</span> },
    { key: "enr", label: "Enrollment No", render: (s) => s.enrollmentNo || "—" },
    { key: "phone", label: "Mobile", render: (s) => s.phone || "—" },
    {
      key: "action",
      label: "Action",
      render: (s) => (
        <DceButton size="sm" tone="red" onClick={() => remove(s)}>
          Remove
        </DceButton>
      ),
    },
  ];

  const allPicked = candidates.length > 0 && candidates.every((s) => picked.includes(s.id));
  const candidateColumns: DceColumn<StudentRow>[] = [
    {
      key: "pick",
      label: "",
      className: "w-10",
      render: (s) => (
        <input
          type="checkbox"
          aria-label={`Select ${studentName(s)}`}
          checked={picked.includes(s.id)}
          onChange={(e) => setPicked((p) => (e.target.checked ? [...p, s.id] : p.filter((id) => id !== s.id)))}
        />
      ),
    },
    { key: "name", label: "Name", render: (s) => studentName(s) },
    { key: "enr", label: "Enrollment No", render: (s) => s.enrollmentNo || "—" },
    { key: "phone", label: "Mobile", render: (s) => s.phone || "—" },
  ];

  const back = (
    <DceLinkButton tone="light" size="sm" to="/centre/batches">
      Back to Batches
    </DceLinkButton>
  );

  if (!batchId || (!loading && !batch)) {
    return (
      <AppLayout>
        <DcePanel title="Batch Students" actions={back}>
          <p className="text-[13px] text-slate-600">That batch could not be found. Open it from Manage Batch.</p>
        </DcePanel>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-5">
        <DcePanel title={`All Students - ${batch?.name ?? ""}${batch?.courseName ? ` (${batch.courseName})` : ""}`} actions={back}>
          <DceTable columns={memberColumns} rows={members} rowKey={(s) => s.id} loading={loading} empty="No students in this batch yet." />
        </DcePanel>

        <DcePanel
          title="Add Students (same course, not in any batch)"
          actions={
            <DceButton tone="red" onClick={addPicked} disabled={!picked.length || busy}>
              {busy ? "Adding…" : `Add Now${picked.length ? ` (${picked.length})` : ""}`}
            </DceButton>
          }
        >
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <DceInput className="max-w-xs" placeholder="Search name, enrollment or mobile" value={search} onChange={(e) => setSearch(e.target.value)} />
            <DceButton
              tone="light"
              size="sm"
              disabled={!candidates.length}
              onClick={() =>
                setPicked((p) => (allPicked ? p.filter((id) => !candidates.some((s) => s.id === id)) : [...new Set([...p, ...candidates.map((s) => s.id)])]))
              }
            >
              {allPicked ? "Clear All" : "Select All"}
            </DceButton>
          </div>
          <DceTable columns={candidateColumns} rows={candidates} rowKey={(s) => s.id} loading={loading} empty="Every student of this course is already in a batch." />
        </DcePanel>
      </div>
    </AppLayout>
  );
}
