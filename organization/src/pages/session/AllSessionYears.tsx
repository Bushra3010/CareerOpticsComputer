import { useCallback, useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Calendar, CheckCircle, Info, Clock, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { canManageSessions } from "@/lib/roles";
import {
  createSessionYear,
  deleteSessionYear,
  getSessionYears,
  setCurrentSessionYear,
  updateSessionYear,
  type SessionYear,
  type SessionYearStatus,
} from "@/lib/supabase/data";

/**
 * Session Management, against the database.
 *
 * Both session routes used to render a hardcoded array held in `useState`, so
 * an add, an edit or a delete rearranged the screen, toasted "success", and was
 * gone the moment the page re-rendered -- which is what "we keep returning to
 * the same row" was. `session_years` did not exist at all; `session-years.sql`
 * creates it.
 *
 * `/session/add` renders this same screen with the dialog already open, rather
 * than a second copy of the form that could drift out of step with this one.
 */

/** Displayed from the dates, not stored beside them, so the two cannot disagree. */
const yearSpan = (session: SessionYear) =>
  `${session.startDate.slice(0, 4)} - ${session.endDate.slice(0, 4)}`;

/** `dd MMM yyyy` without parsing the string into a timezone. */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const prettyDay = (day: string) => {
  const [year, month, date] = day.split("-");
  if (!year || !month || !date) return day || "—";
  return `${date} ${MONTHS[Number(month) - 1] ?? month} ${year}`;
};

type Draft = {
  name: string;
  startDate: string;
  endDate: string;
  status: SessionYearStatus;
  description: string;
};

const blank: Draft = {
  name: "",
  startDate: "",
  endDate: "",
  status: "UPCOMING",
  description: "",
};

const STATUS_LABELS: Record<SessionYearStatus, string> = {
  ACTIVE: "Active",
  UPCOMING: "Upcoming",
  CLOSED: "Closed",
};

export function SessionYearsScreen({ openOnLoad = false }: { openOnLoad?: boolean }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const organizationId = user?.organizationId ?? null;
  const canManage = canManageSessions(user?.role);

  const [sessions, setSessions] = useState<SessionYear[]>([]);
  const [loading, setLoading] = useState(true);
  /** False until `session-years.sql` has been run. */
  const [stored, setStored] = useState(true);
  const [viewing, setViewing] = useState<SessionYear | null>(null);
  /** The session being edited, or null when the dialog is creating a new one. */
  const [editing, setEditing] = useState<SessionYear | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(blank);
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<SessionYear | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getSessionYears(organizationId);
      setSessions(result.data);
      setStored(result.stored);
    } catch (error) {
      toast({
        title: "Could not load the sessions",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
    // `toast` is only used on the failure path; listing it would reload the
    // table every time its identity changed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = useCallback(() => {
    setEditing(null);
    setDraft(blank);
    setFormOpen(true);
  }, []);

  // `/session/add` is the same screen with the form already open.
  useEffect(() => {
    if (openOnLoad) openCreate();
  }, [openOnLoad, openCreate]);

  const openEdit = (session: SessionYear) => {
    setEditing(session);
    setDraft({
      name: session.name,
      startDate: session.startDate,
      endDate: session.endDate,
      status: session.status,
      description: session.description,
    });
    setFormOpen(true);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await updateSessionYear(editing.id, draft);
        toast({ title: "Session updated", description: `${draft.name} was saved.` });
      } else {
        await createSessionYear(organizationId, draft);
        toast({ title: "Session created", description: `${draft.name} is now on the list.` });
      }
      setFormOpen(false);
      // Read the list back rather than patching it in place: the database is
      // what the next visitor sees, and this is the screen that was lying
      // about having saved.
      await load();
    } catch (error) {
      toast({
        title: editing ? "Could not save the session" : "Could not create the session",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    const session = pendingDelete;
    setPendingDelete(null);
    if (!session) return;
    try {
      await deleteSessionYear(session.id);
      toast({ title: "Session deleted", description: `${session.name} was removed.` });
      await load();
    } catch (error) {
      toast({
        title: "Could not delete the session",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  };

  const makeCurrent = async (session: SessionYear) => {
    try {
      await setCurrentSessionYear(organizationId, session.id);
      toast({
        title: "Current session changed",
        description: `New admissions now default to ${session.name}.`,
      });
      await load();
    } catch (error) {
      toast({
        title: "Could not change the current session",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  };

  const statusBadge = (session: SessionYear) => {
    if (session.isCurrent) {
      return (
        <Badge className="border-green-200 bg-green-100 text-green-800">
          <CheckCircle className="mr-1 h-3 w-3" /> Current
        </Badge>
      );
    }
    switch (session.status) {
      case "CLOSED":
        return (
          <Badge variant="secondary" className="border-red-100 bg-red-50 text-red-700">
            <Clock className="mr-1 h-3 w-3" /> Closed
          </Badge>
        );
      case "UPCOMING":
        return (
          <Badge variant="outline" className="border-blue-200 text-blue-600">
            <Calendar className="mr-1 h-3 w-3" /> Upcoming
          </Badge>
        );
      default:
        return <Badge variant="outline">Active</Badge>;
    }
  };

  const columns = [
    { key: "name", header: "Session Name", sortable: true },
    { key: "startDate", header: "Range", cell: (item: SessionYear) => yearSpan(item) },
    { key: "startDate", header: "Start Date", cell: (item: SessionYear) => prettyDay(item.startDate) },
    { key: "endDate", header: "End Date", cell: (item: SessionYear) => prettyDay(item.endDate) },
    { key: "status", header: "Status", cell: (item: SessionYear) => statusBadge(item) },
  ];

  const actionsFor = (item: SessionYear) => [
    { label: "View Details", onClick: () => setViewing(item) },
    ...(canManage
      ? [
          { label: "Edit Session", onClick: () => openEdit(item) },
          ...(item.isCurrent
            ? []
            : [{ label: "Make Current", onClick: () => makeCurrent(item) }]),
          { label: "Delete", onClick: () => setPendingDelete(item), destructive: true },
        ]
      : []),
  ];

  const current = sessions.find((session) => session.isCurrent);

  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        <PageHeader
          title="Session Management"
          description="Manage the academic session years admissions are filed against"
          breadcrumbs={[{ label: "Session Year", href: "/session/all" }, { label: "All Sessions" }]}
          actions={
            canManage ? (
              <Button onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Session
              </Button>
            ) : undefined
          }
        />

        {!stored && (
          <div className="mt-6 flex gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span>
              Session years are not set up on this database yet. Run{" "}
              <code className="font-mono">supabase/schema/session-years.sql</code> in the Supabase SQL
              editor, then reload this page. Until then the admission form asks for the academic year
              as free text.
            </span>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sessions.length}</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500 md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Current Session</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{current?.name || "None"}</div>
              {current && (
                <p className="text-xs text-muted-foreground">
                  {prettyDay(current.startDate)} to {prettyDay(current.endDate)}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading sessions…</p>
          ) : (
            <DataTable
              columns={columns}
              data={sessions}
              searchPlaceholder="Search sessions by name or year..."
              actions={actionsFor}
            />
          )}
        </div>
      </div>

      {/* View */}
      <Dialog open={!!viewing} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Session Details</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-2xl font-bold">{viewing.name}</span>
                {statusBadge(viewing)}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs uppercase text-muted-foreground">Period</Label>
                  <p className="text-sm font-medium">
                    {prettyDay(viewing.startDate)} to {prettyDay(viewing.endDate)}
                  </p>
                </div>
                <div>
                  <Label className="text-xs uppercase text-muted-foreground">Year Span</Label>
                  <p className="text-sm font-medium">{yearSpan(viewing)}</p>
                </div>
              </div>
              <div className="flex gap-3 rounded-lg bg-muted/50 p-3">
                <Info className="h-5 w-5 shrink-0 text-primary" />
                <p className="text-sm italic text-muted-foreground">
                  {viewing.description || "No description was given for this session."}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewing(null)}>
              Close
            </Button>
            {canManage && viewing && (
              <Button
                onClick={() => {
                  const session = viewing;
                  setViewing(null);
                  openEdit(session);
                }}
              >
                Edit Session
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create / edit */}
      <Dialog open={formOpen} onOpenChange={(open) => !open && setFormOpen(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Update Session" : "New Session Year"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="session-name">Session Name *</Label>
              <Input
                id="session-name"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="e.g. Session 2026-2027"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="session-start">Start Date *</Label>
                <DatePicker value={draft.startDate} onChange={(v) => setDraft({ ...draft, startDate: v })} id="session-start" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="session-end">End Date *</Label>
                <DatePicker value={draft.endDate} onChange={(v) => setDraft({ ...draft, endDate: v })} id="session-end" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="session-status">Status</Label>
              <Select
                value={draft.status}
                onValueChange={(value) => setDraft({ ...draft, status: value as SessionYearStatus })}
              >
                <SelectTrigger id="session-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(STATUS_LABELS) as SessionYearStatus[]).map((status) => (
                    <SelectItem key={status} value={status}>
                      {STATUS_LABELS[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="session-description">Description</Label>
              <textarea
                id="session-description"
                className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              The dates decide which session an admission can be filed against, so they are what the
              admission form checks the admission date against.
            </p>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : editing ? "Update Session" : "Create Session"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {pendingDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              The session stops being offered on the admission form. Students already admitted into
              it keep the academic year recorded on their own record.
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

const AllSessionYears = () => <SessionYearsScreen />;

export default AllSessionYears;
