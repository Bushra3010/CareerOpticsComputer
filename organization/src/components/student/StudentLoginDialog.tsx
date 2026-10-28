import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Copy, KeyRound, Loader2, RefreshCw } from "lucide-react";
import { setStudentLogin, type StudentRosterRow } from "@/lib/supabase/data";
import { useToast } from "@/hooks/use-toast";

interface StudentLoginDialogProps {
  student: StudentRosterRow | null;
  onOpenChange: (open: boolean) => void;
  /** Called once a login exists, so the roster can show the student as enrolled. */
  onSaved: (studentId: string) => void;
}

/** Readable rather than maximally random: it is read aloud or written on a slip. */
function suggestPassword() {
  const words = ["Study", "Learn", "Focus", "Bright", "Skill", "Merit"];
  const word = words[Math.floor(Math.random() * words.length)];
  return `${word}@${Math.floor(1000 + Math.random() * 9000)}`;
}

export function StudentLoginDialog({ student, onOpenChange, onSaved }: StudentLoginDialogProps) {
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [issued, setIssued] = useState<{ username: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const isReset = Boolean(student?.hasLogin);

  useEffect(() => {
    if (!student) return;
    // The enrolment number is already printed on the student's ID card, so it
    // is the login ID they are least likely to lose.
    setUsername(student.hasLogin ? "" : student.admissionNo.replace(/\s+/g, "").toLowerCase());
    setPassword(suggestPassword());
    setError(null);
    setIssued(null);
    setCopied(false);
  }, [student]);

  const save = async () => {
    if (!student) return;
    const trimmedUser = username.trim();
    if (!isReset && !trimmedUser) {
      setError("A login ID is required for a student who has none yet.");
      return;
    }
    if (password.trim().length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await setStudentLogin({
        studentId: student.id,
        username: trimmedUser || undefined,
        password: password.trim(),
      });
      setIssued({ username: res.data.username, password: password.trim() });
      onSaved(student.id);
      toast({
        title: res.data.created ? "Student login created" : "Student password reset",
        description: `${student.name} can sign in as ${res.data.username}.`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not set the student login.");
    } finally {
      setSaving(false);
    }
  };

  const copyCredentials = () => {
    if (!issued) return;
    navigator.clipboard.writeText(
      `Login ID: ${issued.username}\nPassword: ${issued.password}\nSign in at: ${window.location.origin}${import.meta.env.BASE_URL}login`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={!!student} onOpenChange={(open) => !open && !saving && onOpenChange(false)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-brand-ink" />
            {isReset ? "Reset student password" : "Create student login"}
          </DialogTitle>
          <DialogDescription>
            {student?.name} · {student?.admissionNo}
            {isReset
              ? " already has a portal login. Setting a new password replaces the old one."
              : " has no portal login yet. This creates one they can sign in with."}
          </DialogDescription>
        </DialogHeader>

        {issued ? (
          <div className="space-y-3">
            <div className="rounded-lg border border-success/25 bg-success/10 p-4 text-sm">
              <p className="font-semibold text-success">
                {isReset ? "Password updated" : "Login created"}
              </p>
              <dl className="mt-3 space-y-1.5">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Login ID</dt>
                  <dd className="font-mono font-semibold">{issued.username}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Password</dt>
                  <dd className="font-mono font-semibold">{issued.password}</dd>
                </div>
              </dl>
            </div>
            <p className="text-xs text-muted-foreground">
              Copy this now — the password cannot be read back later, only replaced.
            </p>
            <Button variant="outline" className="w-full gap-2" onClick={copyCredentials}>
              {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy credentials"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student-login-id">
                Login ID {!isReset && <span className="text-destructive">*</span>}
              </Label>
              <Input
                id="student-login-id"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={isReset ? "Leave blank to keep the current ID" : "e.g. pns-2026-001"}
                disabled={saving}
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">
                The student signs in with this alone — no email address needed.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="student-login-password">
                Password <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="student-login-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={saving}
                  autoComplete="off"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  title="Suggest another password"
                  onClick={() => setPassword(suggestPassword())}
                  disabled={saving}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        )}

        <DialogFooter>
          {issued ? (
            <Button onClick={() => onOpenChange(false)}>Done</Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={save} disabled={saving} className="gap-2">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {isReset ? "Reset password" : "Create login"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
