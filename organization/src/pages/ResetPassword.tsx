import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowLeft, CheckCircle2, KeyRound, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Where the emailed reset link lands. Supabase reads the link's token on its
 * own and signs the person in for recovery; this page then sets the new
 * password. Without a recovery session (an old or already-used link) it says
 * so rather than failing silently.
 */
export default function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let settled = false;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) { settled = true; setReady(true); }
    });
    // The token in the link is read as the page loads; give it a moment.
    const timer = window.setTimeout(async () => {
      if (settled) return;
      const { data } = await supabase.auth.getSession();
      setReady(!!data.session);
    }, 1500);
    return () => { subscription.unsubscribe(); window.clearTimeout(timer); };
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) return setError("Use at least 6 characters.");
    if (password !== confirm) return setError("The two passwords do not match.");
    setBusy(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (err) return setError(err.message);
    setDone(true);
    window.setTimeout(() => navigate("/"), 1500);
  };

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[linear-gradient(165deg,#04246b_0%,#020b24_100%)] p-4">
      <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 h-[300px] w-[300px] rounded-full bg-[radial-gradient(circle,rgba(31,214,201,0.30),transparent_70%)]" />
      <form onSubmit={save} className="relative w-full max-w-[400px] rounded-[18px] bg-background p-7 text-foreground shadow-xl">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-accent text-primary"><KeyRound className="h-5 w-5" /></div>
        <h1 className="mb-1 mt-4 text-center text-[22px] font-extrabold">Set a new password</h1>
        {ready === null && <p className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Checking your reset link…</p>}
        {ready === false && (
          <div className="mt-4 flex gap-2 rounded-[14px] border border-destructive/25 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />This reset link has expired or was already used. Ask for a new one from the sign-in page.
          </div>
        )}
        {ready && done && (
          <div className="mt-4 flex gap-2 rounded-[14px] border border-success/25 bg-success/10 p-3 text-sm text-success">
            <CheckCircle2 className="h-4 w-4 shrink-0" />Password changed. Taking you in…
          </div>
        )}
        {ready && !done && (
          <>
            <p className="mb-5 text-center text-[13.5px] text-muted-foreground">Choose the password you will sign in with from now on.</p>
            {error && <div className="mb-4 flex gap-2 rounded-[14px] border border-destructive/25 bg-destructive/10 p-3 text-sm text-destructive"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
            <div className="space-y-3.5">
              <div className="space-y-2"><Label htmlFor="new-password" className="text-[13.5px] font-semibold">New password</Label><Input id="new-password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
              <div className="space-y-2"><Label htmlFor="confirm-password" className="text-[13.5px] font-semibold">Confirm password</Label><Input id="confirm-password" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required /></div>
            </div>
            <Button type="submit" size="lg" disabled={busy} className="mt-5 w-full">{busy ? <Loader2 className="animate-spin" /> : "Save new password"}</Button>
          </>
        )}
        <Link to="/login" className="mt-4 flex items-center justify-center gap-1.5 text-xs font-semibold text-primary hover:underline"><ArrowLeft className="h-3.5 w-3.5" />Back to sign in</Link>
      </form>
    </main>
  );
}
