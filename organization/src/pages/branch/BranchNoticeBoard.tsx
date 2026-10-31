import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker, DateTimePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Bell, Calendar, Pin, PinOff, Trash2, Edit, Eye, Users, Clock, Video } from "lucide-react";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getNotices, createNotice, updateNotice, deleteNotice, getBranches, getBatches, getCourses } from "@/lib/supabase/data";
import { dayValue, formatDay } from "@/lib/dates";
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

type NoticeType = "BRANCH" | "BATCH";
type NoticePriority = "LOW" | "MEDIUM" | "HIGH";

interface Notice {
  id: string;
  title: string;
  content: string;
  branchId: string;
  batch?: string;
  priority: NoticePriority;
  publishDate: string;
  expiryDate: string;
  isPinned: boolean;
  views: number;
  type: NoticeType;
  /** `datetime-local` value, e.g. "2026-09-10T15:30". Empty when no meeting. */
  meetingTime?: string;
  meetingLink?: string;
}

interface Branch {
  id: string;
  name: string;
}

/**
 * `getNotices` already treats a null branchId as "every branch sees this" - it
 * reads `branchId.eq.<mine>,branchId.is.null`. Only the form was missing the
 * option. Radix Select cannot hold "" as a value, so an org-wide notice is
 * carried as this sentinel and written back as null on save.
 */
const ALL_BRANCHES = "__all_branches__";

// The viewer's own calendar day: `toISOString()` gave yesterday in India
// until 5:30 in the morning.
const localDay = (at: Date) =>
  `${at.getFullYear()}-${String(at.getMonth() + 1).padStart(2, "0")}-${String(at.getDate()).padStart(2, "0")}`;
const today = () => localDay(new Date());
const inAMonth = () => localDay(new Date(Date.now() + 30 * 864e5));

const blankDraft = (branchId: string): Notice => ({
  id: "",
  title: "",
  content: "",
  branchId: branchId || ALL_BRANCHES,
  batch: "",
  priority: "MEDIUM",
  publishDate: today(),
  expiryDate: inAMonth(),
  isPinned: false,
  views: 0,
  type: "BRANCH",
  meetingTime: "",
  meetingLink: "",
});

/** ISO timestamp -> the `YYYY-MM-DDTHH:mm` a datetime-local input expects. */
const toLocalInput = (value?: string) => {
  if (!value) return "";
  const at = new Date(value);
  if (Number.isNaN(at.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${at.getFullYear()}-${pad(at.getMonth() + 1)}-${pad(at.getDate())}T${pad(at.getHours())}:${pad(at.getMinutes())}`;
};

const formatMeeting = (value?: string) => {
  if (!value) return "";
  const at = new Date(value);
  return Number.isNaN(at.getTime()) ? "" : at.toLocaleString();
};

const priorityVariant = (priority: string) =>
  priority === "HIGH" ? "destructive" : priority === "MEDIUM" ? "default" : "secondary";

/** Notices expiring within a week - drives the "Expiring Soon" tile. */
const expiringSoon = (notices: Notice[]) => {
  const limit = Date.now() + 7 * 864e5;
  return notices.filter((n) => {
    const at = new Date(n.expiryDate).getTime();
    return at >= Date.now() && at <= limit;
  }).length;
};

export default function BranchNoticeBoard() {
  const { toast } = useToast();
  const { user, view, branchId: ownBranch } = useAuth();
  // Only the head office may post to every centre (tighten-rls.sql); a centre's
  // notice always goes to its own branch.
  const centreLogin = view === "franchise" && !!ownBranch;
  const [items, setItems] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [draft, setDraft] = useState<Notice>(() => blankDraft(""));
  const [branches, setBranches] = useState<Branch[]>([]);
  const [batches, setBatches] = useState<{ id: string; name: string; courseId: string }[]>([]);
  // Batch names repeat across courses ("Morning"), so each is shown with its course.
  const [courseNames, setCourseNames] = useState<Map<string, string>>(new Map());
  const [metaLoading, setMetaLoading] = useState(true);
  // A notice is gone for every branch the moment it is deleted, so one stray
  // click on the bin is not enough.
  const [pendingDelete, setPendingDelete] = useState<Notice | null>(null);

  // Older sessions carried the organisation as `orgId`.
  const userOrgId =
    (user as { organizationId?: string; orgId?: string } | null)?.organizationId ||
    (user as { orgId?: string } | null)?.orgId ||
    null;

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const orgId = userOrgId;
        const [branchRes, batchRes] = await Promise.all([
          orgId ? getBranches(orgId) : Promise.resolve({ success: true, data: [] }),
          user?.branchId ? getBatches(user.branchId) : Promise.resolve({ success: true, data: [] }),
        ]);
        setBranches((branchRes.data || []) as Branch[]);
        getCourses(orgId, null)
          .then((r) => setCourseNames(new Map((r.data as Array<{ id: string; name: string }>).map((c) => [String(c.id), c.name]))))
          .catch(() => setCourseNames(new Map()));
        setBatches(
          (batchRes.data || []).map((b: Record<string, unknown>) => ({
            id: b.id as string,
            name: (b.name || b.title || `Batch ${b.id}`) as string,
            courseId: String(b.courseId ?? ""),
          }))
        );
      } catch (error) {
        toast({
          title: "Failed to load branches/batches",
          description: error instanceof Error ? error.message : undefined,
          variant: "destructive",
        });
      } finally {
        setMetaLoading(false);
      }
    };
    fetchMeta();
  }, [toast, user?.branchId, userOrgId]);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const result = await getNotices(user?.branchId || "");
        setItems(result.data);
      } catch (error) {
        toast({
          title: "Failed to load notices",
          description: error instanceof Error ? error.message : undefined,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchNotices();
  }, [toast]);

  const set = <K extends keyof Notice>(key: K, value: Notice[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const branchNotices = items.filter((n) => n.type === "BRANCH");
  const batchNotices = items.filter((n) => n.type === "BATCH");

  const openCreate = () => {
    setDraft(blankDraft(""));
    setIsDialogOpen(true);
  };

  const openEdit = (notice: Notice) => {
    setDraft({
      ...notice,
      // The date picker wants the day alone; the row carries "T00:00:00".
      publishDate: dayValue(notice.publishDate),
      expiryDate: dayValue(notice.expiryDate),
      branchId: notice.branchId || ALL_BRANCHES,
      meetingTime: toLocalInput(notice.meetingTime),
      meetingLink: notice.meetingLink || "",
    });
    setIsDialogOpen(true);
  };

  const publish = async () => {
    if (!draft.title.trim() || !draft.content.trim()) {
      toast({ title: "Missing details", description: "Title and content are both required.", variant: "destructive" });
      return;
    }
    const link = (draft.meetingLink || "").trim();
    if (link && !/^https?:\/\//i.test(link)) {
      toast({
        title: "Invalid meeting link",
        description: "The meeting link must start with http:// or https://",
        variant: "destructive",
      });
      return;
    }
    if (draft.type === "BATCH" && !draft.branchId) {
      toast({ title: "Select a branch", description: "A batch notice has to name the branch its batch belongs to.", variant: "destructive" });
      return;
    }
    const payload = {
      ...draft,
      // null is what makes the notice visible to every branch on read.
      branchId: centreLogin ? ownBranch : draft.branchId === ALL_BRANCHES ? null : draft.branchId,
      meetingLink: link || null,
      meetingTime: draft.meetingTime ? new Date(draft.meetingTime).toISOString() : null,
    };
    try {
      if (draft.id) {
        await updateNotice(draft.id, payload as unknown as Record<string, unknown>);
        setItems((list) => list.map((n) => (n.id === draft.id ? draft : n)));
        toast({ title: "Notice updated", description: draft.title });
      } else {
        const created = await createNotice(payload as unknown as Record<string, unknown>);
        setItems((list) => [created.data as unknown as Notice, ...list]);
        toast({ title: "Notice published", description: draft.title });
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Failed to save notice",
        description: error instanceof Error ? error.message : undefined,
        variant: "destructive",
      });
    }
  };

  const togglePin = async (notice: Notice) => {
    try {
      await updateNotice(notice.id, { isPinned: !notice.isPinned } as Record<string, unknown>);
      setItems((list) => list.map((n) => (n.id === notice.id ? { ...n, isPinned: !n.isPinned } : n)));
    } catch (error) {
      toast({
        title: "Failed to update notice",
        description: error instanceof Error ? error.message : undefined,
        variant: "destructive",
      });
    }
  };

  const deleteNoticeHandler = async (notice: Notice) => {
    setPendingDelete(null);
    try {
      await deleteNotice(notice.id);
      setItems((list) => list.filter((n) => n.id !== notice.id));
      toast({ title: "Notice deleted", description: notice.title });
    } catch (error) {
      toast({
        title: "Failed to delete notice",
        description: error instanceof Error ? error.message : undefined,
        variant: "destructive",
      });
    }
  };

  /** The badge used to print the raw branch uuid. */
  const branchLabel = (branchId: string) => {
    if (!branchId || branchId === ALL_BRANCHES) return "All branches";
    return branches.find((b) => b.id === branchId)?.name || "Unknown branch";
  };

  const NoticeCard = (notice: Notice) => (
    <Card key={notice.id} className={notice.isPinned ? "border-primary/50" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {notice.isPinned && <Pin className="h-4 w-4 text-primary" />}
            <CardTitle className="text-lg">{notice.title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={priorityVariant(notice.priority) as "destructive" | "default" | "secondary"}>
              {notice.priority}
            </Badge>
            {notice.type === "BATCH" && <Badge variant="outline">{notice.batch}</Badge>}
            <Badge variant={notice.type === "BATCH" ? "secondary" : "outline"}>{branchLabel(notice.branchId)}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{notice.content}</p>
        {(notice.meetingTime || notice.meetingLink) && (
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-md border bg-muted/40 px-3 py-2 text-sm">
            {notice.meetingTime && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatMeeting(notice.meetingTime)}
              </span>
            )}
            {notice.meetingLink && (
              <Button asChild variant="outline" size="sm" className="gap-1">
                <a href={notice.meetingLink} target="_blank" rel="noreferrer">
                  <Video className="h-4 w-4" />
                  Join meeting
                </a>
              </Button>
            )}
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Published: {formatDay(notice.publishDate)}
            </span>
            <span>Expires: {formatDay(notice.expiryDate)}</span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {notice.views} views
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              title={notice.isPinned ? "Unpin notice" : "Pin notice"}
              onClick={() => togglePin(notice)}
            >
              {notice.isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" title="Edit notice" onClick={() => openEdit(notice)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title="Delete notice"
              onClick={() => setPendingDelete(notice)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading || metaLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading notices...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="Notice Board"
        description="Manage and publish notices across branches"
        breadcrumbs={[
          { label: "Branch Management", href: "/branch/view" },
          { label: "Notice Board" },
        ]}
        actions={
          <Button className="gap-2" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Create Notice
          </Button>
        }
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{draft.id ? "Edit Notice" : "Create New Notice"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Notice Title *</Label>
              <Input id="title" placeholder="Enter notice title" value={draft.title} onChange={(e) => set("title", e.target.value)} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Notice Type</Label>
                <Select value={draft.type} onValueChange={(val) => {
                  const next = val as NoticeType;
                  set("type", next);
                  // A batch notice needs a real branch to list batches from;
                  // a branch notice may legitimately target all of them.
                  set("branchId", next === "BRANCH" ? ALL_BRANCHES : "");
                  set("batch", "");
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select notice type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BRANCH">Branch Notice</SelectItem>
                    <SelectItem value="BATCH">Batch Notice</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Target</Label>
                {draft.type === "BRANCH" ? (
                  <Select value={draft.branchId} onValueChange={(v) => set("branchId", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent searchable searchPlaceholder="Search centre…">
                      {!centreLogin && <SelectItem value={ALL_BRANCHES}>All branches</SelectItem>}
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="grid gap-2">
                    <Select
                      value={draft.branchId}
                      onValueChange={async (v) => {
                        set("branchId", v);
                        set("batch", "");
                        try {
                          const res = await getBatches(v);
                          setBatches(
                            (res.data || []).map((b: Record<string, unknown>) => ({
                              id: b.id as string,
                              name: (b.name || b.title || `Batch ${b.id}`) as string,
                              courseId: String(b.courseId ?? ""),
                            }))
                          );
                        } catch (error) {
                          toast({
                            title: "Failed to load batches for branch",
                            description: error instanceof Error ? error.message : undefined,
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent searchable searchPlaceholder="Search centre…">
                        {branches.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={draft.batch} onValueChange={(v) => set("batch", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select batch" />
                      </SelectTrigger>
                      <SelectContent>
                        {batches.map((batch) => (
                          <SelectItem key={batch.id} value={batch.name}>
                            {courseNames.get(batch.courseId) ? `${batch.name} · ${courseNames.get(batch.courseId)}` : batch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={draft.priority} onValueChange={(v) => set("priority", v as Notice["priority"])}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HIGH">High Priority</SelectItem>
                  <SelectItem value="MEDIUM">Medium Priority</SelectItem>
                  <SelectItem value="LOW">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Notice Content *</Label>
              <Textarea id="content" placeholder="Enter notice content..." rows={5} value={draft.content} onChange={(e) => set("content", e.target.value)} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Publish Date</Label>
                <DatePicker value={draft.publishDate} onChange={(v) => set("publishDate", v)} />
              </div>
              <div className="space-y-2">
                <Label>Expiry Date</Label>
                <DatePicker value={draft.expiryDate} onChange={(v) => set("expiryDate", v)} />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="meetingTime">Meeting Time</Label>
                <DateTimePicker
                  id="meetingTime"
                  value={draft.meetingTime || ""}
                  onChange={(v) => set("meetingTime", v)}
                />
                <p className="text-xs text-muted-foreground">Optional — leave blank if there is no meeting.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="meetingLink">Meeting Link</Label>
                <Input
                  id="meetingLink"
                  type="url"
                  placeholder="https://meet.google.com/..."
                  value={draft.meetingLink || ""}
                  onChange={(e) => set("meetingLink", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Shown as a Join button on the notice.</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={publish}>{draft.id ? "Save Changes" : "Publish Notice"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{items.length}</p>
                <p className="text-sm text-muted-foreground">Active Notices</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <Pin className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{items.filter((n) => n.isPinned).length}</p>
                <p className="text-sm text-muted-foreground">Pinned Notices</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{expiringSoon(items)}</p>
                <p className="text-sm text-muted-foreground">Expiring Soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Eye className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{items.reduce((sum, n) => sum + n.views, 0).toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Views</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="branch" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="branch" className="gap-2">
            <Bell className="h-4 w-4" />
            Branch Notices ({branchNotices.length})
          </TabsTrigger>
          <TabsTrigger value="batch" className="gap-2">
            <Users className="h-4 w-4" />
            Batch Notices ({batchNotices.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="branch" className="space-y-4">
          {branchNotices.map(NoticeCard)}
        </TabsContent>

        <TabsContent value="batch" className="space-y-4">
          {batchNotices.map(NoticeCard)}
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this notice?</AlertDialogTitle>
            <AlertDialogDescription>
              "{pendingDelete?.title}" will be removed for everyone who can see it. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => pendingDelete && void deleteNoticeHandler(pendingDelete)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
