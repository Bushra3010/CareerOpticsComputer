import { useCallback, useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, Download, Save, Search } from "lucide-react";
import {
  listAttendance,
  listBatches,
  listStudents,
  saveAttendance,
  safeDateLabel,
  type LookupRow,
  type StudentRow,
} from "@/lib/supabase/examAttendance";
import { downloadCsv } from "@/lib/export";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

type Status = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

const STATUSES: Status[] = ["PRESENT", "ABSENT", "LATE", "EXCUSED"];

const statusStyle: Record<Status, string> = {
  PRESENT: "bg-emerald-500 text-white",
  ABSENT: "bg-red-500 text-white",
  LATE: "bg-amber-400 text-black",
  EXCUSED: "bg-violet-500 text-white",
};

const asStatus = (value: string | null | undefined): Status =>
  STATUSES.includes(value as Status) ? (value as Status) : "PRESENT";

export default function Attendance() {
  const { user } = useAuth();
  const { toast } = useToast();
  const branchId = user?.branchId || null;
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [batchRows, setBatchRows] = useState<LookupRow[]>([]);
  const [marks, setMarks] = useState<Record<string, Status>>({});
  const [query, setQuery] = useState("");
  const [batch, setBatch] = useState("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!date) return;
    setLoading(true);
    try {
      // The register needs the roll AND whatever has already been marked for the
      // day, so an existing register re-opens with its saved statuses.
      const [studentRows, batchList, existing] = await Promise.all([
        listStudents(branchId),
        listBatches(branchId),
        listAttendance(branchId, date),
      ]);
      setStudents(studentRows);
      setBatchRows(batchList);
      const saved = new Map(existing.map((row) => [row.studentId, asStatus(row.status)]));
      setMarks(Object.fromEntries(studentRows.map((s) => [s.id, saved.get(s.id) ?? "PRESENT"])));
    } catch (e) {
      toast({
        title: "Attendance unavailable",
        description: e instanceof Error ? e.message : "Try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [branchId, date, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const batchName = useMemo(() => {
    const map = new Map(batchRows.map((b) => [b.id, b.name]));
    return (id?: string | null) => (id ? map.get(id) || id : "Unassigned");
  }, [batchRows]);

  /** Only batches that actually have students on the roll are worth offering. */
  const batchOptions = useMemo(() => {
    const used = new Set(students.map((s) => s.batchId).filter(Boolean) as string[]);
    return batchRows.filter((b) => used.has(b.id));
  }, [batchRows, students]);

  const visible = students.filter(
    (s) =>
      (batch === "all" || s.batchId === batch) &&
      `${s.firstName || ""} ${s.lastName || ""} ${s.enrollmentNo || ""}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );

  const counts = visible.reduce<Record<string, number>>((acc, s) => {
    const status = marks[s.id] || "PRESENT";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const save = async () => {
    if (!visible.length) {
      toast({ title: "Nothing to save", description: "No students match this selection." });
      return;
    }
    if (!branchId) {
      toast({
        title: "No branch selected",
        description: "Your account is not attached to a branch, so the register cannot be filed.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      const result = await saveAttendance(
        branchId,
        date,
        visible.map((s) => ({
          studentId: s.id,
          status: marks[s.id] || "PRESENT",
          batchId: s.batchId,
        })),
        user?.id,
      );
      toast({
        title: "Attendance saved",
        description: `${result.inserted + result.updated} student record(s) filed for ${safeDateLabel(date)}.`,
      });
    } catch (e) {
      toast({
        title: "Could not save attendance",
        description: e instanceof Error ? e.message : "Try again",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const exportCsv = () => {
    if (!visible.length) {
      toast({ title: "Nothing to export", description: "No students match this selection." });
      return;
    }
    downloadCsv(
      `attendance-${date}.csv`,
      visible.map((s) => ({
        date,
        enrollmentNo: s.enrollmentNo || "",
        student: `${s.firstName || ""} ${s.lastName || ""}`.trim(),
        batch: batchName(s.batchId),
        status: marks[s.id] || "PRESENT",
      })),
      ["date", "enrollmentNo", "student", "batch", "status"],
    );
    toast({ title: "Register exported", description: `${visible.length} row(s) downloaded.` });
  };

  return (
    <AppLayout>
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-muted-foreground">
            Attendance
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-[-.04em]">
            Daily class register
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review everyone at once, then save a complete register.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCsv} disabled={!visible.length}>
            <Download />
            Export
          </Button>
          <Button onClick={save} disabled={saving || loading || !visible.length}>
            <Save />
            {saving ? "Saving…" : "Save register"}
          </Button>
        </div>
      </div>
      <div className="mb-4 grid gap-3 sm:grid-cols-4">
        {[
          { l: "Students", v: visible.length, c: "" },
          { l: "Present", v: counts.PRESENT || 0, c: "text-emerald-500" },
          { l: "Late", v: counts.LATE || 0, c: "text-amber-500" },
          { l: "Absent", v: counts.ABSENT || 0, c: "text-red-500" },
        ].map((x) => (
          <Card key={x.l}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{x.l}</p>
              <p className={`mt-1 text-2xl font-semibold ${x.c}`}>{x.v}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="grid gap-3 border-b p-4 md:grid-cols-[180px_220px_1fr_auto]">
            <DatePicker value={date} onChange={(v) => setDate(v)} />
            <Select value={batch} onValueChange={setBatch}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All batches</SelectItem>
                {batchOptions.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search students…"
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              disabled={!visible.length}
              onClick={() =>
                setMarks((m) => ({
                  ...m,
                  ...Object.fromEntries(visible.map((s) => [s.id, "PRESENT" as Status])),
                }))
              }
            >
              <Check />
              Mark all present
            </Button>
          </div>
          <div className="divide-y">
            {visible.map((s) => (
              <div
                key={s.id}
                className="grid items-center gap-3 p-4 md:grid-cols-[1fr_1fr_400px]"
              >
                <div>
                  <p className="font-semibold">
                    {s.firstName} {s.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {s.enrollmentNo || "Application pending"}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Batch: {batchName(s.batchId)}
                </p>
                <div className="grid grid-cols-4 gap-1 rounded-xl bg-muted p-1">
                  {STATUSES.map((st) => (
                    <button
                      key={st}
                      onClick={() => setMarks((m) => ({ ...m, [s.id]: st }))}
                      className={`rounded-lg px-2 py-2 text-[10px] font-bold transition-all ${marks[s.id] === st ? statusStyle[st] + " shadow-sm" : "text-muted-foreground hover:bg-card"}`}
                    >
                      {st[0] + st.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {!visible.length && (
            <div className="p-12 text-center text-sm text-muted-foreground">
              {loading ? "Loading the register…" : "No students match this selection."}
            </div>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
