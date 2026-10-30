import { useEffect, useMemo, useState } from "react";
import { CalendarPlus, Copy, PlayCircle, Video } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { getStudentPortalClasses, getStudentProfile } from "@/lib/supabase/data";
import { useAuth } from "@/contexts/AuthContext";
import {
  classState,
  type StudentProfile,
  type PortalClass,
} from "@/data/student-portal";

const stamp = (date: Date) => date.toISOString().replace(/[-:]|\.\d{3}/g, "");
const when = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

/** One calendar entry the student can drop into any calendar app. */
function downloadIcs(item: PortalClass) {
  const start = new Date(item.startsAt);
  const end = new Date(start.getTime() + item.minutes * 60_000);
  const ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//CareerOptics//Student Portal//EN", "BEGIN:VEVENT",
    `UID:${item.id}@careeroptics`, `DTSTAMP:${stamp(new Date())}`, `DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`,
    `SUMMARY:${item.subject} — ${item.topic}`,
    `DESCRIPTION:${item.faculty} · ${item.platform}\\nJoin: ${item.link}`,
    `URL:${item.link}`, "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${item.subject.toLowerCase().replace(/\W+/g, "-")}.ics`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function MyClasses() {
  const { toast } = useToast();
  const { user } = useAuth();
  const userId = user?.id;
  const branchId = user?.branchId;
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [classes, setClasses] = useState<PortalClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState("upcoming");

  useEffect(() => {
    let cancelled = false;
    // The signed-in student arrives a render after the page mounts, so a fetch
    // that does not wait for it queries `userId = undefined`, fails, and — with
    // no dependency on the id — never runs again once the session resolves.
    if (!userId || !branchId) return;
    setLoading(true);
    setError(null);
    Promise.all([
      getStudentProfile(userId, branchId),
      getStudentPortalClasses(userId, branchId),
    ])
      .then(([profileResult, classesResult]) => {
        if (cancelled) return;
        setProfile(profileResult.data);
        setClasses(classesResult.data);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || "Failed to load classes");
        toast({ title: "Could not load classes", description: err.message || "Please try again.", variant: "destructive" });
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [toast, userId, branchId]);

  const sorted = useMemo(() => [...classes].sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt)), [classes]);
  const rows = useMemo(() => {
    const filtered = tab === "completed"
      ? sorted.filter((item) => classState(item) === "completed").reverse()
      : sorted.filter((item) => classState(item) !== "completed");
    return filtered;
  }, [sorted, tab]);

  const join = (item: PortalClass) => {
    window.open(item.link, "_blank", "noopener");
    toast({ title: `Joining ${item.subject}`, description: `${item.platform} opened in a new tab.` });
  };
  const copy = async (item: PortalClass) => {
    try {
      await navigator.clipboard.writeText(item.link);
      toast({ title: "Link copied", description: item.link });
    } catch {
      toast({ title: "Could not copy", description: item.link, variant: "destructive" });
    }
  };

  if (error) {
    return (
      <AppLayout>
        <PageHeader title="Live classes" description={`Scheduled sessions — join, save to your calendar, or replay a recording.`} breadcrumbs={[{ label: "Live classes" }]} />
        <Card><CardContent className="py-12 text-center text-sm text-destructive">{error}</CardContent></Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="Live classes"
        description={profile ? `Scheduled sessions for ${profile.batch} — join, save to your calendar, or replay a recording.` : "Scheduled sessions — join, save to your calendar, or replay a recording."}
        breadcrumbs={[{ label: "Live classes" }]}
      />

      {loading ? (
        <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">Loading classes…</CardContent></Card>
      ) : (
        <>
          <Tabs value={tab} onValueChange={setTab} className="mb-4">
            <TabsList>
              <TabsTrigger value="upcoming">Live & upcoming ({sorted.filter((item) => classState(item) !== "completed").length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({sorted.filter((item) => classState(item) === "completed").length})</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid gap-3 lg:grid-cols-2">
            {rows.map((item) => {
              const state = classState(item);
              return (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-sm font-semibold">{item.subject}</h3>
                          {state === "live" && <Badge className="bg-destructive text-destructive-foreground">Live now</Badge>}
                          {state === "completed" && <Badge variant="outline">Completed</Badge>}
                        </div>
                        <p className="mt-0.5 text-sm text-muted-foreground">{item.topic}</p>
                        <p className="mt-1.5 text-xs text-muted-foreground">{when(item.startsAt)} · {item.minutes} min · {item.faculty} · {item.platform}</p>
                      </div>
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground"><Video className="h-4 w-4" /></span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {state === "completed"
                        ? item.recording
                          ? <Button size="sm" variant="outline" onClick={() => { window.open(item.recording, "_blank", "noopener"); toast({ title: "Opening recording", description: item.subject }); }}><PlayCircle className="mr-1.5 h-3.5 w-3.5" />Watch recording</Button>
                          : <span className="text-xs text-muted-foreground">No recording was published for this session.</span>
                        : <>
                            <Button size="sm" variant={state === "live" ? "default" : "outline"} onClick={() => join(item)}>Join class</Button>
                            <Button size="sm" variant="ghost" onClick={() => downloadIcs(item)}><CalendarPlus className="mr-1.5 h-3.5 w-3.5" />Add to calendar</Button>
                            <Button size="sm" variant="ghost" onClick={() => copy(item)}><Copy className="mr-1.5 h-3.5 w-3.5" />Copy link</Button>
                          </>}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {!rows.length && <Card className="lg:col-span-2"><CardContent className="py-12 text-center text-sm text-muted-foreground">Nothing here yet.</CardContent></Card>}
          </div>
        </>
      )}
    </AppLayout>
  );
}
