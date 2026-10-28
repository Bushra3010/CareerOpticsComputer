import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Save, RotateCcw, Video, Settings, Users, Bell, Link2 } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { createBatchTiming, getBatchTimings, getBatches, getBranches, getCourses } from "@/lib/supabase/data";
import { useDropdownOptions } from "@/lib/dropdownOptions";

interface FormData {
  branch: string;
  title: string;
  subject: string;
  course: string;
  batch: string;
  instructor: string;
  description: string;
  date: string;
  time: string;
  duration: string;
  platform: string;
  meetingLink: string;
  meetingId: string;
  password: string;
  waitingRoom: boolean;
  muteOnEntry: boolean;
  screenShare: boolean;
  recording: boolean;
  chat: boolean;
  emailNotify: boolean;
  smsNotify: boolean;
  pushNotify: boolean;
  reminder: string;
  recurring: boolean;
  repeat: string;
}

const BLANK: FormData = {
  branch: "",
  title: "",
  subject: "",
  course: "",
  batch: "",
  instructor: "",
  description: "",
  date: "",
  time: "",
  duration: "60",
  platform: "",
  meetingLink: "",
  meetingId: "",
  password: "",
  waitingRoom: false,
  muteOnEntry: true,
  screenShare: false,
  recording: true,
  chat: true,
  emailNotify: true,
  smsNotify: false,
  pushNotify: true,
  reminder: "30",
  recurring: false,
  repeat: "weekly",
};

const REQUIRED: Array<[keyof FormData, string]> = [
  ["branch", "Branch"],
  ["course", "Course"],
  ["batch", "Batch"],
  ["subject", "Subject"],
  ["instructor", "Instructor"],
  ["title", "Class Title"],
  ["date", "Date"],
  ["time", "Start Time"],
  ["duration", "Duration"],
  ["platform", "Platform"],
];

const WEEKDAYS = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

/** "06:15" + 60 -> "07:15". */
const addMinutes = (time: string, minutes: number) => {
  const [h, m] = time.split(":").map(Number);
  const total = (h * 60 + m + minutes) % (24 * 60);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};

const splitNames = (value: unknown) =>
  String(value ?? "").split(",").map((name) => name.trim()).filter(Boolean);

interface BatchOption {
  id: string;
  name: string;
  courseId: string;
  branchId: string;
  instructor: string;
  subjects: string[];
  students: number;
}

const DURATIONS = [
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "1 hour" },
  { value: "90", label: "1.5 hours" },
  { value: "120", label: "2 hours" },
];

const generateMeetingLink = (platform: string) => {
  const id = Math.floor(Math.random() * 9_000_000_000 + 1_000_000_000);
  if (platform === "Google Meet") return `https://meet.google.com/${String(id).slice(0, 3)}-${String(id).slice(3, 7)}-${String(id).slice(7, 10)}`;
  if (platform === "Microsoft Teams") return `https://teams.microsoft.com/l/meetup-join/${id}`;
  if (platform === "Cisco Webex") return `https://webex.com/meet/${id}`;
  return `https://zoom.us/j/${id}`;
};

export default function LiveClassSetup() {
  const { user, view } = useAuth();
  const orgId = user?.organizationId || null;
  const ownBranchId = user?.branchId || null;
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState<FormData>({ ...BLANK, branch: ownBranchId ?? "" });
  const [branches, setBranches] = useState<Array<{ id: string; name: string }>>([]);
  const [courses, setCourses] = useState<Array<{ id: string; name: string }>>([]);
  const [batches, setBatches] = useState<BatchOption[]>([]);
  const [timings, setTimings] = useState<Array<Record<string, unknown>>>([]);
  const [loadingLookups, setLoadingLookups] = useState(true);
  const [saving, setSaving] = useState(false);
  // The organisation's own subject and teacher lists, as Assign Course keeps them.
  const { options } = useDropdownOptions(orgId);

  // Branches: an administrator picks one; a branch account is its own.
  useEffect(() => {
    let cancelled = false;
    getBranches(orgId)
      .then((result) => {
        if (cancelled) return;
        const list = (result.data as Array<Record<string, unknown>>)
          .filter((b) => b.isActive !== false && (!ownBranchId || String(b.id) === ownBranchId))
          .map((b) => ({ id: String(b.id), name: String(b.name ?? "") }));
        setBranches(list);
        if (list.length === 1) setForm((f) => (f.branch ? f : { ...f, branch: list[0].id }));
      })
      .catch(() => { if (!cancelled) setBranches([]); });
    return () => { cancelled = true; };
  }, [orgId, ownBranchId]);

  // Courses the branch runs, its batches, and their timetable -- reloaded per branch.
  useEffect(() => {
    let cancelled = false;
    if (!form.branch) {
      setCourses([]);
      setBatches([]);
      setTimings([]);
      setLoadingLookups(false);
      return;
    }
    setLoadingLookups(true);
    Promise.all([getCourses(orgId, form.branch), getBatches(form.branch), getBatchTimings(form.branch)])
      .then(([coursesRes, batchesRes, timingsRes]) => {
        if (cancelled) return;
        setCourses((coursesRes.data as Array<Record<string, unknown>>).map((c) => ({ id: String(c.id), name: String(c.name ?? "") })));
        setBatches(
          (batchesRes.data as Array<Record<string, unknown>>).map((b) => ({
            id: String(b.id),
            name: String(b.name ?? ""),
            courseId: String(b.courseId ?? ""),
            branchId: String(b.branchId ?? ""),
            instructor: String(b.instructor ?? ""),
            subjects: Array.isArray(b.subjects) ? (b.subjects as unknown[]).map(String) : [],
            students: Number(b.currentStudents) || 0,
          })),
        );
        setTimings(timingsRes.data as Array<Record<string, unknown>>);
      })
      .catch((error) =>
        toast({
          title: "Could not load courses and batches",
          description: error instanceof Error ? error.message : undefined,
          variant: "destructive",
        }),
      )
      .finally(() => { if (!cancelled) setLoadingLookups(false); });
    return () => { cancelled = true; };
  }, [orgId, form.branch, toast]);

  // Each choice narrows the next: the course's batches, the batch's subjects
  // and teachers.
  const courseBatches = batches.filter((b) => !form.course || b.courseId === form.course);
  const batch = batches.find((b) => b.id === form.batch);
  const batchTimings = timings.filter((t) => String(t.batchId) === form.batch);
  const subjects = useMemo(() => {
    const own = [...(batch?.subjects ?? []), ...batchTimings.map((t) => String(t.subject ?? "").trim())].filter(Boolean);
    // A batch with no subjects of its own yet offers the organisation's list.
    return [...new Set(own.length ? own : options("subject"))].sort();
  }, [batch, batchTimings, options]);
  const instructors = useMemo(() => {
    const forSubject = batchTimings
      .filter((t) => !form.subject || String(t.subject ?? "") === form.subject)
      .map((t) => String(t.instructor ?? "").trim());
    return [...new Set([...forSubject, ...splitNames(batch?.instructor), ...options("teacher")].filter(Boolean))];
  }, [batch, batchTimings, form.subject, options]);

  /** Picking a step clears the ones after it, so no stale choice survives. */
  const choose = (key: "branch" | "course" | "batch" | "subject", value: string) =>
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === "branch") Object.assign(next, { course: "", batch: "", subject: "", instructor: "" });
      if (key === "course") Object.assign(next, { batch: "", subject: "", instructor: "" });
      if (key === "batch") Object.assign(next, { subject: "", instructor: "" });
      if (key === "subject") {
        next.instructor = "";
        if (!f.title.trim() || f.title === `${f.subject} class`) next.title = `${value} class`;
      }
      return next;
    });

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const fillLink = () => {
    if (!form.platform) {
      toast({ title: "Pick a platform first", variant: "destructive" });
      return;
    }
    const link = generateMeetingLink(form.platform);
    setForm((current) => ({
      ...current,
      meetingLink: link,
      meetingId: link.split("/").pop() ?? current.meetingId,
    }));
    toast({ title: "Meeting link generated", description: link });
  };

  const schedule = async () => {
    const missing = REQUIRED.filter(([key]) => !String(form[key]).trim()).map(([, label]) => label);
    if (missing.length) {
      toast({ title: "Fill the required fields", description: missing.join(", "), variant: "destructive" });
      return;
    }
    const startsAt = new Date(`${form.date}T${form.time}`);
    if (startsAt.getTime() < Date.now()) {
      toast({
        title: "That start time is in the past",
        description: "Pick a date and time in the future.",
        variant: "destructive",
      });
      return;
    }

    const link = form.meetingLink.trim() || generateMeetingLink(form.platform);
    const day = WEEKDAYS[startsAt.getDay()];

    // A live class is a slot on the batch's timetable: that is what View Live
    // Classes lists and what the batch's students see on their portal. It used
    // to be written to this browser alone, where neither ever read it.
    setSaving(true);
    try {
      await createBatchTiming({
        batchId: form.batch,
        day,
        startTime: form.time,
        endTime: addMinutes(form.time, Number(form.duration) || 60),
        subject: form.subject,
        instructor: form.instructor,
        roomNo: "",
        title: form.title.trim(),
        platform: form.platform,
        meetingLink: link,
        meetingId: form.meetingId.trim() || null,
        description: form.description.trim() || null,
        status: "scheduled",
        recorded: form.recording,
      });
    } catch (error) {
      toast({
        title: "Could not schedule the class",
        description: error instanceof Error ? error.message : undefined,
        variant: "destructive",
      });
      return;
    } finally {
      setSaving(false);
    }

    toast({
      title: "Class scheduled",
      description: `${form.title.trim()} · every ${day.charAt(0)}${day.slice(1).toLowerCase()} at ${form.time} for ${batch?.name ?? "the batch"}.`,
    });
    navigate("/live-class/view");
  };

  const reset = () => {
    setForm({ ...BLANK, branch: ownBranchId ?? (branches.length === 1 ? branches[0].id : "") });
    toast({ title: "Form reset", description: "All fields are back to their defaults." });
  };

  const participantSettings: Array<[keyof FormData, string, string]> = [
    ["waitingRoom", "Waiting Room", "Admit participants manually"],
    ["muteOnEntry", "Mute on Entry", "Mute participants when they join"],
    ["screenShare", "Allow Screen Sharing", "Participants can share their screen"],
    ["recording", "Enable Recording", "Record the session automatically"],
    ["chat", "Enable Chat", "Allow participants to chat"],
  ];

  const notifications: Array<[keyof FormData, string]> = [
    ["emailNotify", "Send email invitation"],
    ["smsNotify", "Send SMS reminder"],
    ["pushNotify", "Push notification"],
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Live Class Setup"
        description="Schedule and configure a new live class session"
        breadcrumbs={[
          { label: "Live Class", href: "/live-class/view" },
          { label: "Setup" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Class Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* In the order the choices depend on each other: branch, then its
                  courses, the course's batches, the batch's subjects, who
                  teaches it, and only then what the class is called. */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="branch">1. Branch *</Label>
                  <Select value={form.branch} onValueChange={(value) => choose("branch", value)} disabled={!!ownBranchId}>
                    <SelectTrigger id="branch">
                      <SelectValue placeholder={branches.length ? "Select branch" : "Loading..."} />
                    </SelectTrigger>
                    <SelectContent searchable searchPlaceholder="Search centre…">
                      {branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course">2. Course *</Label>
                  <Select value={form.course} onValueChange={(value) => choose("course", value)} disabled={!form.branch}>
                    <SelectTrigger id="course">
                      <SelectValue placeholder={!form.branch ? "Pick a branch first" : loadingLookups ? "Loading..." : "Select course"} />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {form.branch && !loadingLookups && !courses.length && (
                    <p className="text-xs text-muted-foreground">This branch runs no course yet. Assign one in Course → Assign Course to Batch.</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="batch">3. Batch *</Label>
                  <Select value={form.batch} onValueChange={(value) => choose("batch", value)} disabled={!form.course}>
                    <SelectTrigger id="batch">
                      <SelectValue placeholder={!form.course ? "Pick a course first" : "Select batch"} />
                    </SelectTrigger>
                    <SelectContent>
                      {courseBatches.map((b) => (
                        <SelectItem key={b.id} value={b.id}>{b.name}{b.students ? ` · ${b.students} students` : ""}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.course && !courseBatches.length && (
                    <p className="text-xs text-muted-foreground">This course has no batch at this branch yet.</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">4. Subject *</Label>
                  <Select value={form.subject} onValueChange={(value) => choose("subject", value)} disabled={!form.batch}>
                    <SelectTrigger id="subject">
                      <SelectValue placeholder={!form.batch ? "Pick a batch first" : "Select subject"} />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => <SelectItem key={subject} value={subject}>{subject}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {form.batch && !subjects.length && (
                    <p className="text-xs text-muted-foreground">No subjects yet. Add them to this batch in Assign Course to Batch.</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="instructor">5. Instructor *</Label>
                  <Select value={form.instructor} onValueChange={(value) => set("instructor", value)} disabled={!form.subject}>
                    <SelectTrigger id="instructor">
                      <SelectValue placeholder={!form.subject ? "Pick a subject first" : "Select instructor"} />
                    </SelectTrigger>
                    <SelectContent>
                      {instructors.map((name) => <SelectItem key={name} value={name}>{name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">6. Class Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Light and reflection"
                    value={form.title}
                    onChange={(e) => set("title", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Class Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter class description and agenda..."
                  rows={3}
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Schedule & Platform
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <DatePicker value={form.date} onChange={(v) => set("date", v)} id="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Start Time *</Label>
                  <Input id="time" type="time" value={form.time} onChange={(e) => set("time", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration *</Label>
                  <Select value={form.duration} onValueChange={(value) => set("duration", value)}>
                    <SelectTrigger id="duration">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {DURATIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform *</Label>
                  <Select value={form.platform} onValueChange={(value) => set("platform", value)}>
                    <SelectTrigger id="platform">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Zoom">Zoom</SelectItem>
                      <SelectItem value="Google Meet">Google Meet</SelectItem>
                      <SelectItem value="Microsoft Teams">Microsoft Teams</SelectItem>
                      <SelectItem value="Cisco Webex">Cisco Webex</SelectItem>
                      <SelectItem value="Custom Link">Custom Link</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meetingLink">Meeting Link</Label>
                  <div className="flex gap-2">
                    <Input
                      id="meetingLink"
                      placeholder="Auto-generated or paste custom link"
                      value={form.meetingLink}
                      onChange={(e) => set("meetingLink", e.target.value)}
                    />
                    <Button type="button" variant="outline" size="icon" title="Generate link" onClick={fillLink}>
                      <Link2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="meetingId">Meeting ID</Label>
                  <Input id="meetingId" placeholder="Optional" value={form.meetingId} onChange={(e) => set("meetingId", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Meeting Password</Label>
                  <Input id="password" type="password" placeholder="Optional" value={form.password} onChange={(e) => set("password", e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Participant Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {participantSettings.map(([key, label, hint]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <Label htmlFor={key}>{label}</Label>
                    <p className="text-sm text-muted-foreground">{hint}</p>
                  </div>
                  <Switch
                    id={key}
                    checked={Boolean(form[key])}
                    onCheckedChange={(checked) => set(key, checked as FormData[typeof key])}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {notifications.map(([key, label]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={Boolean(form[key])}
                    onCheckedChange={(checked) => set(key, (checked === true) as FormData[typeof key])}
                  />
                  <Label htmlFor={key} className="font-normal">{label}</Label>
                </div>
              ))}
              <div className="space-y-2">
                <Label htmlFor="reminder">Reminder Before</Label>
                <Select value={form.reminder} onValueChange={(value) => set("reminder", value)}>
                  <SelectTrigger id="reminder">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="1440">1 day</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Repeats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {/* A class is a slot on the batch's weekly timetable, so it comes
                  round every week on the same day until it is cancelled. */}
              <p className="font-medium">
                {form.date
                  ? `Every ${(() => { const d = WEEKDAYS[new Date(`${form.date}T00:00`).getDay()]; return d.charAt(0) + d.slice(1).toLowerCase(); })()}${form.time ? ` at ${form.time}` : ""}`
                  : "Every week, on the day of the date you pick"}
              </p>
              <p className="text-muted-foreground">It joins the batch's timetable. Change or cancel it from View Live Classes.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full gap-2" onClick={schedule} disabled={saving}>
                <Save className="h-4 w-4" />
                {saving ? "Scheduling…" : "Schedule Class"}
              </Button>
              <Button variant="outline" className="w-full gap-2" onClick={reset}>
                <RotateCcw className="h-4 w-4" />
                Reset Form
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
