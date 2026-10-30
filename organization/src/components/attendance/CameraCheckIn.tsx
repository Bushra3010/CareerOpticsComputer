import { useCallback, useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { Camera, CheckCircle2, Loader2, QrCode, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { codeFromQr, studentCheckIn, type CheckInResult } from "@/lib/supabase/selfAttendance";

type Mode = "QR" | "SELFIE";
type Coords = { latitude: number; longitude: number } | null;

/** The widest a selfie is kept: enough to recognise a face, small enough to store. */
const SELFIE_WIDTH = 480;

/**
 * A student marks today's attendance with the phone's camera: by scanning the
 * QR on the centre's screen (back camera), or by a selfie (front camera).
 * Where the camera cannot be opened -- permission refused, or an old phone --
 * a photo can be picked or taken through the file input instead.
 */
export function CameraCheckIn({
  mode,
  open,
  onClose,
  onDone,
}: {
  mode: Mode;
  open: boolean;
  onClose: () => void;
  onDone: (result: CheckInResult) => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const frame = useRef(0);
  const sending = useRef(false);
  const [cameraError, setCameraError] = useState("");
  const [hint, setHint] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [selfie, setSelfie] = useState("");
  const [result, setResult] = useState<CheckInResult | null>(null);
  const coords = useRef<Coords>(null);

  const stop = useCallback(() => {
    cancelAnimationFrame(frame.current);
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
  }, []);

  const send = useCallback(
    async (input: { code?: string; photo?: string }) => {
      if (sending.current) return;
      sending.current = true;
      setBusy(true);
      setError("");
      try {
        const done = await studentCheckIn(mode, { ...input, ...(coords.current || {}) });
        stop();
        setResult(done);
        onDone(done);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not mark attendance.");
        sending.current = false;
      } finally {
        setBusy(false);
      }
    },
    [mode, onDone, stop],
  );

  /** Reads frames until a QR turns up; anything that is not an attendance QR is ignored. */
  const scan = useCallback(() => {
    const v = video.current;
    const c = canvas.current;
    if (!v || !c || sending.current) return;
    if (v.readyState >= 2 && v.videoWidth) {
      const scale = Math.min(1, 640 / v.videoWidth);
      c.width = Math.round(v.videoWidth * scale);
      c.height = Math.round(v.videoHeight * scale);
      const ctx = c.getContext("2d", { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(v, 0, 0, c.width, c.height);
        const found = jsQR(ctx.getImageData(0, 0, c.width, c.height).data, c.width, c.height);
        if (found?.data) {
          const code = codeFromQr(found.data);
          if (code) {
            void send({ code });
            return;
          }
          setHint("That is not an attendance QR. Point the camera at the QR on your centre's screen.");
        }
      }
    }
    frame.current = requestAnimationFrame(scan);
  }, [send]);

  // Open the camera with the dialog; close it with the dialog.
  useEffect(() => {
    if (!open) return;
    setCameraError("");
    setHint("");
    setError("");
    setSelfie("");
    setResult(null);
    sending.current = false;
    coords.current = null;
    navigator.geolocation?.getCurrentPosition(
      (p) => { coords.current = { latitude: p.coords.latitude, longitude: p.coords.longitude }; },
      () => { /* where it was taken is a help, not a requirement */ },
      { timeout: 8000, maximumAge: 60000 },
    );
    let cancelled = false;
    (async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError("This browser cannot open the camera here.");
        return;
      }
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: mode === "QR" ? "environment" : "user" },
          audio: false,
        });
        if (cancelled) return s.getTracks().forEach((t) => t.stop());
        stream.current = s;
        if (video.current) {
          video.current.srcObject = s;
          await video.current.play().catch(() => {});
        }
        if (mode === "QR") frame.current = requestAnimationFrame(scan);
      } catch (e) {
        const name = (e as { name?: string })?.name;
        setCameraError(
          name === "NotAllowedError"
            ? "Camera permission was refused. Allow the camera for this site in your browser settings, or use the button below."
            : "The camera could not be opened. Use the button below instead.",
        );
      }
    })();
    return () => {
      cancelled = true;
      stop();
    };
  }, [open, mode, scan, stop]);

  /** The current frame as a small JPEG. */
  const snap = () => {
    const v = video.current;
    const c = canvas.current;
    if (!v || !c || !v.videoWidth) return;
    const scale = Math.min(1, SELFIE_WIDTH / v.videoWidth);
    c.width = Math.round(v.videoWidth * scale);
    c.height = Math.round(v.videoHeight * scale);
    c.getContext("2d")?.drawImage(v, 0, 0, c.width, c.height);
    setSelfie(c.toDataURL("image/jpeg", 0.8));
  };

  /** Without a live camera: a photo from the file picker, read for its QR or kept as the selfie. */
  const fromFile = (file: File | undefined) => {
    if (!file) return;
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const c = canvas.current;
      URL.revokeObjectURL(url);
      if (!c) return;
      const scale = Math.min(1, (mode === "QR" ? 1000 : SELFIE_WIDTH) / img.width);
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      const ctx = c.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, c.width, c.height);
      if (mode === "SELFIE") return setSelfie(c.toDataURL("image/jpeg", 0.8));
      const found = jsQR(ctx.getImageData(0, 0, c.width, c.height).data, c.width, c.height);
      const code = found?.data ? codeFromQr(found.data) : null;
      if (code) void send({ code });
      else setError("No attendance QR found in that photo. Take it again, straight on and close up.");
    };
    img.src = url;
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === "QR" ? <QrCode className="h-5 w-5" /> : <Camera className="h-5 w-5" />}
            {mode === "QR" ? "Scan the centre's QR" : "Selfie attendance"}
          </DialogTitle>
          <DialogDescription>
            {mode === "QR"
              ? "Point your camera at the attendance QR on your centre's screen."
              : "Face the camera in good light, then take the photo."}
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="space-y-3 py-4 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
            <p className="text-lg font-semibold">
              {result.alreadyMarked ? `Already marked: ${result.status.toLowerCase()}` : "Attendance marked: present"}
            </p>
            <p className="text-sm text-muted-foreground">
              {new Date(`${result.date}T00:00:00`).toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long" })}
            </p>
            <Button className="w-full" onClick={onClose}>Done</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {!cameraError && (
              <div className="relative overflow-hidden rounded-xl bg-black">
                {selfie && <img src={selfie} alt="Your selfie" className="w-full" />}
                {/* Kept mounted under the photo, so Retake finds the camera still running. */}
                <video
                  ref={video}
                  playsInline
                  muted
                  className={`w-full ${mode === "SELFIE" ? "-scale-x-100" : ""} ${selfie ? "hidden" : ""}`}
                  aria-label="Camera"
                />
                {mode === "QR" && !selfie && (
                  <div className="pointer-events-none absolute inset-[18%] rounded-2xl border-4 border-white/80" aria-hidden />
                )}
              </div>
            )}
            <canvas ref={canvas} className="hidden" />
            {cameraError && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{cameraError}</p>}
            {hint && !error && <p className="text-sm text-muted-foreground">{hint}</p>}
            {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

            {mode === "SELFIE" && !cameraError && (
              selfie ? (
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setSelfie("")} disabled={busy}>
                    <RefreshCw className="mr-2 h-4 w-4" />Retake
                  </Button>
                  <Button className="flex-1" onClick={() => void send({ photo: selfie })} disabled={busy}>
                    {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Use photo
                  </Button>
                </div>
              ) : (
                <Button className="w-full" onClick={snap}><Camera className="mr-2 h-4 w-4" />Take photo</Button>
              )
            )}
            {mode === "SELFIE" && cameraError && selfie && (
              <>
                <img src={selfie} alt="Your selfie" className="w-full rounded-xl" />
                <Button className="w-full" onClick={() => void send({ photo: selfie })} disabled={busy}>
                  {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Use photo
                </Button>
              </>
            )}
            {busy && mode === "QR" && <p className="flex items-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" />Marking your attendance…</p>}

            {cameraError && (
              <label className="flex w-full cursor-pointer items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">
                <Camera className="mr-2 h-4 w-4" />
                {mode === "QR" ? "Take a photo of the QR" : "Take or choose a selfie"}
                <input
                  type="file"
                  accept="image/*"
                  capture={mode === "QR" ? "environment" : "user"}
                  className="sr-only"
                  aria-label={mode === "QR" ? "Photo of the QR" : "Selfie photo"}
                  onChange={(e) => fromFile(e.target.files?.[0])}
                />
              </label>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
