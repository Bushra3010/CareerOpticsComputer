import { useCallback, useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  DceBadge,
  DceButton,
  DceField,
  DceInput,
  DceLinkButton,
  DcePanel,
  DceSelect,
  DceTable,
  shortDate,
  type DceColumn,
} from "@/components/dce/Dce";
import { createBatch, getBatches, getBatchesByOrg, getBranches, getCourses, updateBatch } from "@/lib/supabase/data";

interface BatchRow {
  id: string;
  name: string;
  branchId: string;
  courseId: string;
  isActive: boolean;
  createdAt: string;
  currentStudents: number;
}

interface Named {
  id: string;
  name: string;
}

const blankForm = { id: "", name: "", courseId: "", branchId: "", isActive: "yes" };

/**
 * `batches.code` is unique and required, but the classic form never asks for
 * one, so it is made from the name plus a short random tail.
 */
const batchCode = (name: string) =>
  `${name.replace(/[^a-z0-9]/gi, "").slice(0, 6).toUpperCase() || "BATCH"}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

export default function CentreBatches() {
  const { branchId, organizationId } = useAuth();
  const { toast } = useToast();
  const isAdmin = !branchId;
  const [batches, setBatches] = useState<BatchRow[]>([]);
  const [courses, setCourses] = useState<Named[]>([]);
  const [branches, setBranches] = useState<Named[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseFilter, setCourseFilter] = useState("");
  const [form, setForm] = useState(blankForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [b, c, br] = await Promise.all([
        branchId ? getBatches(branchId) : getBatchesByOrg(organizationId),
        getCourses(organizationId, branchId),
        isAdmin ? getBranches(organizationId) : Promise.resolve({ success: true, data: [] as Named[] }),
      ]);
      setBatches(
        (b.data || []).map((r: Record<string, unknown>) => ({
          id: String(r.id),
          name: String(r.name ?? ""),
          branchId: String(r.branchId ?? ""),
          courseId: String(r.courseId ?? ""),
          isActive: r.isActive !== false,
          createdAt: String(r.createdAt ?? r.startDate ?? ""),
          currentStudents: Number(r.currentStudents) || 0,
        })),
      );
      setCourses((c.data || []).map((r: Record<string, unknown>) => ({ id: String(r.id), name: String(r.name ?? "") })));
      setBranches((br.data || []).map((r: Record<string, unknown>) => ({ id: String(r.id), name: String(r.name ?? "") })));
    } catch (e) {
      toast({ title: "Could not load batches", description: e instanceof Error ? e.message : "", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [branchId, organizationId, isAdmin, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const courseName = useMemo(() => new Map(courses.map((c) => [c.id, c.name])), [courses]);
  const branchName = useMemo(() => new Map(branches.map((b) => [b.id, b.name])), [branches]);
  const shown = useMemo(() => batches.filter((b) => !courseFilter || b.courseId === courseFilter), [batches, courseFilter]);

  const save = async () => {
    if (!form.name.trim()) return toast({ title: "Enter the batch name", variant: "destructive" });
    if (!form.courseId) return toast({ title: "Select the batch course", variant: "destructive" });
    const target = branchId || form.branchId;
    if (!form.id && !target) return toast({ title: "Select the centre", variant: "destructive" });
    // Two batches of one course at one centre with the same name cannot be told
    // apart anywhere a batch is picked.
    const centre = form.id ? batches.find((b) => b.id === form.id)?.branchId : target;
    const clash = batches.some(
      (b) => b.id !== form.id && b.branchId === centre && b.courseId === form.courseId && b.name.trim().toLowerCase() === form.name.trim().toLowerCase(),
    );
    if (clash) return toast({ title: "That batch already exists", description: "Give it a different name for this course.", variant: "destructive" });
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { name: form.name.trim(), courseId: form.courseId, isActive: form.isActive === "yes" };
      if (form.id) await updateBatch(form.id, payload);
      else await createBatch(target, { ...payload, code: batchCode(form.name), startDate: new Date().toISOString() });
      toast({ title: form.id ? "Batch updated" : "Batch added", description: form.name.trim() });
      setForm(blankForm);
      await load();
    } catch (e) {
      toast({ title: "Could not save the batch", description: e instanceof Error ? e.message : "", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const columns: DceColumn<BatchRow>[] = [
    { key: "n", label: "#", render: (_r, i) => i + 1, className: "w-10" },
    { key: "name", label: "NAME", render: (r) => <span className="font-semibold">{r.name}</span> },
    ...(isAdmin ? [{ key: "branch", label: "Centre", render: (r: BatchRow) => branchName.get(r.branchId) || "—" }] : []),
    { key: "course", label: "Course", render: (r) => courseName.get(r.courseId) || "—" },
    { key: "students", label: "Students", render: (r) => r.currentStudents },
    { key: "created", label: "Created At", render: (r) => shortDate(r.createdAt) },
    { key: "status", label: "Status", render: (r) => <DceBadge status={r.isActive ? "ACTIVE" : "INACTIVE"} /> },
    {
      key: "action",
      label: "Action",
      render: (r) => (
        <div className="flex flex-wrap gap-1.5">
          <DceButton
            size="sm"
            tone="blue"
            onClick={() => setForm({ id: r.id, name: r.name, courseId: r.courseId, branchId: r.branchId, isActive: r.isActive ? "yes" : "no" })}
          >
            Edit
          </DceButton>
          <DceLinkButton size="sm" tone="teal" to={`/centre/batch-students?id=${encodeURIComponent(r.id)}`}>
            All Students
          </DceLinkButton>
        </div>
      ),
    },
  ];

  return (
    <AppLayout>
      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <DcePanel
          title="Manage Batch"
          actions={
            <DceButton tone="red" onClick={() => setForm(blankForm)}>
              Add New
            </DceButton>
          }
        >
          <div className="mb-4 max-w-xs">
            <DceSelect aria-label="Filter by course" value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
              <option value="">All Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </DceSelect>
          </div>
          <DceTable columns={columns} rows={shown} rowKey={(r) => r.id} loading={loading} empty="No batches yet." />
        </DcePanel>

        <DcePanel title={form.id ? "Edit Batch" : "Add New"}>
          <div className="space-y-4">
            {isAdmin && !form.id && (
              <DceField label="Centre" required>
                <DceSelect value={form.branchId} onChange={(e) => setForm({ ...form, branchId: e.target.value })}>
                  <option value="">Select Centre</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </DceSelect>
              </DceField>
            )}
            <DceField label="Batch Name" required>
              <DceInput value={form.name} placeholder="Batch Name" onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </DceField>
            <DceField label="Batch Course" required>
              <DceSelect value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })}>
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </DceSelect>
            </DceField>
            <DceField label="Status">
              <DceSelect value={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.value })}>
                <option value="yes">Active</option>
                <option value="no">InActive</option>
              </DceSelect>
            </DceField>
            <div className="flex gap-2">
              <DceButton tone="blue" onClick={save} disabled={saving}>
                {saving ? "Saving…" : form.id ? "Update Now" : "Add Now"}
              </DceButton>
              {form.id && (
                <DceButton tone="light" onClick={() => setForm(blankForm)}>
                  Cancel
                </DceButton>
              )}
            </div>
          </div>
        </DcePanel>
      </div>
    </AppLayout>
  );
}
