import { useCallback, useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Camera, Expand, MapPin, QrCode, RefreshCw } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DocumentViewer } from "@/components/student/StudentDocuments";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getBranches } from "@/lib/supabase/data";
import { listStudents, type StudentRow } from "@/lib/supabase/examAttendance";
import { getCheckIns, newAttendanceQr, qrPayload, type CheckIn } from "@/lib/supabase/selfAttendance";
import type { StudentFile } from "@/lib/studentDocuments";

/** A new code each minute; each code is accepted for 90 seconds, so a scan at the turn still counts. */
const REFRESH_MS = 60_000;

const istToday = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
const time = (iso: string) => new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

/**
 * The centre's attendance QR, for a screen or projector at the door. Students
 * scan it from My Attendance in the student portal, which marks them present
 * for today. The code changes every minute, so a photo of it sent home stops
 * working. Below it, today's self check-ins -- by QR or selfie -- with the
 * selfies to look over.
 */
export default function AttendanceQr() {
  const { user, view } = useAuth();
  const { toast } = useToast();
  const ownBranch = view === "admin" ? null : user?.branchId || null;
  const [branches, setBranches] = useState<Array<{ id: string; name: string }>>([]);
  const [picked, setPicked] = useState("");
  const branchId = ownBranch || picked;
  const [qr, setQr] = useState<{ image: string; validUntil: string } | null>(null);
  const [left, setLeft] = useState(0);
  const [error, setError] = useState("");
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [students, setStudents] = useState<Map<string, StudentRow>>(new Map());
  const [photo, setPhoto] = useState<StudentFile | null>(null);
  const screen = useRef<HTMLDivElement>(null);
  const nextAt = useRef(0);

  useEffect(() => {
    if (ownBranch) return;
    getBranches(user?.organizationId ?? null)
      .then((r) => setBranches((r.data || []) as Array<{ id: string; name: string }>))
      .catch(() => setBranches([]));
  }, [ownBranch, user?.organizationId]);

  const refresh = useCallback(async () => {
    if (!branchId) return;
    try {
      const { code, validUntil } = await newAttendanceQr(branchId, user?.name);
      const image = await QRCode.toDataURL(qrPayload(code), { width: 560, margin: 2, errorCorrectionLevel: "M" });
      setQr({ image, validUntil });
      setError("");
      nextAt.current = Date.now() + REFRESH_MS;
    } catch (e) {
      setQr(null);
      setError(e instanceof Error ? e.message : "Could not make the QR.");
    }
  }, [branchId, user?.name]);

  const loadCheckIns = useCallback(async () => {
    if (!branchId) return;
    try {
      setCheckIns(await getCheckIns(branchId, istToday()));
    } catch {
      /* the QR keeps working without the list */
    }
  }, [branchId]);

  // A fresh code every minute, a countdown to it, and the list kept current.
  useEffect(() => {
    if (!branchId) return;
    void refresh();
    void loadCheckIns();
    listStudents(branchId).then((rows) => setStudents(new Map(rows.map((s) => [s.id, s])))).catch(() => {});
    const tick = setInterval(() => {
      const ms = nextAt.current - Date.now();
      if (ms <= 0) void refresh();
      setLeft(Math.max(0, Math.ceil(ms / 1000)));
    }, 1000);
    const list = setInterval(() => void loadCheckIns(), 20_000);
    return () => {
      clearInterval(tick);
      clearInterval(list);
    };
  }, [branchId, refresh, loadCheckIns]);

  const fullScreen = () => {
    screen.current?.requestFullscreen?.().catch(() => toast({ title: "Full screen is not available in this browser." }));
  };

  const nameOf = (id: string) => {
    const s = students.get(id);
    return s ? [s.firstName, s.lastName].filter(Boolean).join(" ") || "Student" : "Student";
  };

  return (
    <AppLayout>
      <PageHeader
        title="QR Attendance"
        description="Show this QR at the centre. Students scan it from My Attendance in the student portal to mark themselves present."
        breadcrumbs={[{ label: "Attendance Management" }, { label: "QR Attendance" }]}
      />

      {!ownBranch && (
        <Card className="mb-4">
          <CardContent className="space-y-2 pt-6">
            <Label>Centre</Label>
            <Select value={picked} onValueChange={setPicked}>
              <SelectTrigger aria-label="Centre" className="max-w-sm"><SelectValue placeholder="Choose the centre" /></SelectTrigger>
              <SelectContent searchable searchPlaceholder="Search centre…">
                {branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {!branchId ? (
        <p className="text-sm text-muted-foreground">Choose the centre to show its attendance QR.</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
              <CardTitle className="flex items-center gap-2"><QrCode className="h-5 w-5" />Scan to mark attendance</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => void refresh()} aria-label="New code"><RefreshCw className="h-4 w-4" /></Button>
                <Button size="sm" onClick={fullScreen}><Expand className="mr-2 h-4 w-4" />Full screen</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div ref={screen} className="flex flex-col items-center justify-center gap-3 bg-white p-4 text-center text-slate-900">
                {qr ? (
                  <img src={qr.image} alt="Attendance QR" className="aspect-square w-full max-w-[min(80vh,440px)]" />
                ) : (
                  <div className="grid aspect-square w-full max-w-[440px] place-items-center rounded-xl bg-slate-100 text-sm text-slate-500">
                    {error || "Making the QR…"}
                  </div>
                )}
                <p className="text-base font-semibold">Student portal → My Attendance → Scan QR</p>
                {qr && <p className="text-sm text-slate-500">A new code in {left}s</p>}
              </div>
              {error && qr === null && <p className="mt-2 text-sm text-destructive">{error}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Today's self check-ins <Badge variant="secondary" className="ml-2">{checkIns.length}</Badge></CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {!checkIns.length && <p className="text-sm text-muted-foreground">No student has checked in yet today.</p>}
              {checkIns.map((c) => (
                <div key={c.id} className="flex items-center gap-3 rounded-lg border p-2">
                  {c.photo ? (
                    <button
                      type="button"
                      onClick={() => setPhoto({ key: c.id, label: `${nameOf(c.studentId)} · selfie`, name: "", url: c.photo, uploadedAt: c.createdAt, kind: "image" })}
                      className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted"
                      aria-label={`Selfie of ${nameOf(c.studentId)}`}
                    >
                      <img src={c.photo} alt="" className="h-full w-full object-cover" />
                    </button>
                  ) : (
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-muted"><QrCode className="h-5 w-5 text-muted-foreground" /></span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{nameOf(c.studentId)}</p>
                    <p className="text-xs text-muted-foreground">
                      {time(c.createdAt)} · {students.get(c.studentId)?.enrollmentNo || ""}
                    </p>
                  </div>
                  <Badge variant="outline" className="shrink-0">{c.method === "QR" ? <><QrCode className="mr-1 h-3 w-3" />QR</> : <><Camera className="mr-1 h-3 w-3" />Selfie</>}</Badge>
                  {c.latitude != null && c.longitude != null && (
                    <a
                      href={`https://www.google.com/maps?q=${c.latitude},${c.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 text-muted-foreground hover:text-foreground"
                      aria-label={`Where ${nameOf(c.studentId)} checked in`}
                    >
                      <MapPin className="h-4 w-4" />
                    </a>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
      <DocumentViewer file={photo} studentName="Selfie" onClose={() => setPhoto(null)} />
    </AppLayout>
  );
}
