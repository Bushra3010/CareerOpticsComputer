"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, LockKeyhole, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(identifier, password);
      toast({ title: "Welcome back", description: "Redirecting to your workspace..." });
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#0d0b08] p-5 text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_-8%,hsl(38_84%_52%/.20),transparent_38rem),radial-gradient(circle_at_10%_100%,hsl(158_52%_40%/.12),transparent_32rem)]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[.35] [background-image:linear-gradient(hsl(38_40%_70%/.05)_1px,transparent_1px),linear-gradient(90deg,hsl(38_40%_70%/.05)_1px,transparent_1px)] [background-size:64px_64px]" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex items-center gap-3.5">
          <img src="/career-optics-logo.png" alt="" className="h-14 w-14 rounded-2xl bg-white object-contain" />
          <div>
            <p className="text-lg font-semibold tracking-[-.02em]">Career Optics Computer Academy ERP</p>
            <p className="text-[11px] font-semibold uppercase tracking-[.13em] text-white/40">Secure institutional workspace</p>
          </div>
        </div>
        <form onSubmit={submit} className="rounded-[1.4rem] border border-white/10 bg-white/[.05] p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          <div className="mb-7 grid h-12 w-12 place-items-center rounded-xl bg-[hsl(38_84%_56%)] text-[#231a08]">
            <LockKeyhole />
          </div>
          <h1 className="text-3xl font-semibold tracking-[-.04em]">Welcome back</h1>
          <p className="mt-2 text-sm text-white/55">Sign in with your authorised account — administrator, franchise or student. Your workspace is decided by that authorisation.</p>
          {error && (
            <div className="mt-5 flex gap-2 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0" />{error}
            </div>
          )}
          <div className="mt-7 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="identifier" className="text-white/80">Email or username</Label>
              <Input id="identifier" autoComplete="username" value={identifier} onChange={e => setIdentifier(e.target.value)} required className="border-white/15 bg-white/5 text-white" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/80">Password</Label>
              <Input id="password" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required className="border-white/15 bg-white/5 text-white" />
            </div>
            <Button disabled={busy} type="submit" className="w-full">
              {busy ? <Loader2 className="animate-spin" /> : <>Sign in<ArrowRight /></>}
            </Button>
          </div>
        </form>
        <p className="mt-5 text-center text-xs text-white/35">Access is logged and monitored for institutional security.</p>
      </div>
    </main>
  );
}
