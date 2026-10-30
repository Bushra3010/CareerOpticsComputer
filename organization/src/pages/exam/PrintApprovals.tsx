import { useCallback, useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { termLabel, termPlan } from "@/lib/examWorkflow";
import {
  getAdmitCards,
  getMarksheets,
  getPrintApprovals,
  reviewPrintApproval,
  type AdmitCardRecord,
  type MarksheetRecord,
  type PrintApproval,
} from "@/lib/supabase/examWorkflow";
import { printMarksheet } from "./printMarksheet";
import { studentName, useExamData } from "./useExamData";

const shown = (iso: string) =>
  iso ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const STATUS_LABEL = { PENDING: "Pending", APPROVED: "Approved", REJECTED: "Rejected" } as const;

/**
 * The head office's queue of centres' certificates and marksheets. Approving
 * a certificate issues it -- its number and the centre's wallet charge --
 * and the centre can then print it; approving a marksheet lets the centre
 * print it. Rejecting sends it back with a reason.
 */
export default function PrintApprovals() {
  const { toast } = useToast();
  const { user, isAdmin, students, courseOf, branchOf, studentOf } = useExamData();
  const [approvals, setApprovals] = useState<PrintApproval[] | null>([]);
  const [sheets, setSheets] = useState<MarksheetRecord[]>([]);
  const [cards, setCards] = useState<AdmitCardRecord[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [p, m, a] = await Promise.all([
        getPrintApprovals(null),
        getMarksheets({ branchId: null }),
        getAdmitCards({ branchId: null }).catch(() => [] as AdmitCardRecord[]),
      ]);
      setApprovals(p);
      setSheets(m);
      setCards(a);
    } catch (e) {
      toast({ title: "Could not load approvals", description: e instanceof Error ? e.message : "", variant: "destructive" });
    }
  }, [toast]);
  useEffect(() => {
    void load();
  }, [load]);

  const sheetOf = (a: PrintApproval) =>
    a.kind === "MARKSHEET"
      ? sheets.find((s) => s.id === a.marksheetId)
      : sheets.find((s) => s.studentId === a.studentId && s.isFinal && s.result === "PASS");

  /** Approves or rejects each in turn; a certificate a centre cannot pay for stays pending, with the reason. */
  const review = async (items: PrintApproval[], approve: boolean) => {
    if (!items.length) return;
    let note: string | null = null;
    if (!approve) {
      note = window.prompt(`Reason for rejecting ${items.length} request(s)? The centre sees it.`, "");
      if (note === null) return;
    }
    setBusy(true);
    let done = 0;
    let charged = 0;
    const failed: string[] = [];
    for (const item of items) {
      try {
        const result = await reviewPrintApproval(item.id, approve, note, user?.name);
        done += 1;
        if (result?.issue?.charged) charged += Number(result.issue.amount) || 0;
      } catch (e) {
        failed.push(`${studentName(studentOf.get(item.studentId)) || "Student"}: ${e instanceof Error ? e.message : "failed"}`);
      }
    }
    setBusy(false);
    setPicked([]);
    toast({
      title: `${done} ${approve ? "approved" : "rejected"}${failed.length ? `, ${failed.length} not` : ""}`,
      description: [charged ? `₹${charged.toLocaleString("en-IN")} charged to centre wallets for certificates.` : "", ...failed].filter(Boolean).join(" "),
      variant: failed.length ? "destructive" : undefined,
    });
    await load();
  };

  const preview = async (a: PrintApproval) => {
    const sheet = sheetOf(a);
    if (!sheet) return toast({ title: "No marksheet to show", description: "This student has no result on the Results page.", variant: "destructive" });
    try {
      await printMarksheet(sheet, {
        course: courseOf.get(sheet.courseId),
        rollNo: cards.find((c) => c.studentId === sheet.studentId && c.term === sheet.term)?.rollNo,
        organizationId: user?.organizationId ?? null,
        ownBranch: null,
      });
    } catch (e) {
      toast({ title: "Could not open the marksheet", description: e instanceof Error ? e.message : "", variant: "destructive" });
    }
  };

  type Row = PrintApproval & { name: string; enrollmentNo: string; centre: string; courseName: string; what: string; result: string; statusLabel: string };
  const list = (approvals || []).filter((a) => showAll || a.status === "PENDING");
  const rows: Row[] = list.map((a) => {
    const st = studentOf.get(a.studentId);
    const sheet = sheetOf(a);
    const course = courseOf.get(sheet?.courseId || st?.courseId || "");
    return {
      ...a,
      name: studentName(st) || "—",
      enrollmentNo: st?.enrollmentNo || st?.applicationNo || "—",
      centre: branchOf.get(a.branchId)?.name || "—",
      courseName: course?.name || "—",
      what: a.kind === "CERTIFICATE" ? "Certificate" : `Marksheet · ${sheet ? termLabel(termPlan(course).type, sheet.term) : ""}`,
      result: sheet ? `${sheet.totalObtained}/${sheet.totalMax} · ${sheet.percentage}% · ${sheet.grade} · ${sheet.result}` : "—",
      statusLabel: STATUS_LABEL[a.status],
    };
  });
  const pendingCount = (approvals || []).filter((a) => a.status === "PENDING").length;

  const columns: Column<Row>[] = [
    { key: "what", header: "Request", sortable: true, cell: (r) => <span className="font-medium">{r.what}</span> },
    { key: "name", header: "Student", sortable: true, cell: (r) => <span>{r.name} <span className="block font-mono text-xs text-muted-foreground">{r.enrollmentNo}</span></span> },
    { key: "centre", header: "Centre", sortable: true },
    { key: "courseName", header: "Course" },
    { key: "result", header: "Result", cell: (r) => <span className="text-xs">{r.result}</span> },
    { key: "requestedAt", header: "Sent", sortable: true, cell: (r) => <span className="text-xs">{shown(r.requestedAt)}{r.requestedBy ? <span className="block text-muted-foreground">{r.requestedBy}</span> : null}</span> },
    {
      key: "statusLabel",
      header: "Status",
      cell: (r) =>
        r.status === "PENDING" ? (
          <Badge variant="outline" className="border-amber-300 text-amber-700">Pending</Badge>
        ) : r.status === "APPROVED" ? (
          <Badge variant="secondary">Approved</Badge>
        ) : (
          <span><Badge variant="destructive">Rejected</Badge>{r.note && <span className="block text-xs text-destructive">{r.note}</span>}</span>
        ),
    },
  ];

  const chosen = (approvals || []).filter((a) => picked.includes(a.id) && a.status !== "APPROVED");

  return (
    <AppLayout>
      <PageHeader
        title="Print Approvals"
        description="Certificates and marksheets that centres want to print. Approving a certificate issues it and charges the centre's wallet."
        breadcrumbs={[{ label: "Certificate & Marksheet" }, { label: "Print Approvals" }]}
      />
      {!isAdmin ? (
        <Card><CardContent className="pt-6 text-sm text-muted-foreground">Only the head office approves prints.</CardContent></Card>
      ) : approvals === null ? (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            Print approvals are not set up in the database yet. Run <code>supabase/schema/print-approvals.sql</code> in Supabase; until then centres print without approval.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
            <CardTitle>{showAll ? "All requests" : "Waiting for approval"} <Badge variant="secondary" className="ml-2">{showAll ? rows.length : pendingCount}</Badge></CardTitle>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" disabled={busy || !chosen.length} onClick={() => void review(chosen, true)}>
                {busy ? "Working…" : `Approve selected (${chosen.length})`}
              </Button>
              <Button size="sm" variant="outline" disabled={busy || !chosen.length} onClick={() => void review(chosen, false)}>
                Reject selected
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setShowAll((v) => !v); setPicked([]); }}>
                {showAll ? "Show pending only" : "Show all"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              data={rows}
              columns={columns}
              selectable
              onSelectionChange={(ids) => setPicked(ids.map(String))}
              searchPlaceholder="Search student, centre, course…"
              filters={[
                { label: "Centre", key: "centre" },
                { label: "Request", key: "kind" },
                { label: "Status", key: "statusLabel" },
              ]}
              actions={(r) => [
                ...(r.status !== "APPROVED" ? [{ label: "Approve", onClick: () => void review([r], true) }] : []),
                ...(r.status === "PENDING" ? [{ label: "Reject", onClick: () => void review([r], false), destructive: true }] : []),
                { label: "View marksheet", onClick: () => void preview(r) },
              ]}
              emptyMessage={showAll ? "No requests yet." : students.length ? "Nothing is waiting for approval." : "Loading…"}
            />
          </CardContent>
        </Card>
      )}
    </AppLayout>
  );
}
