import { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { viewForRole } from "@/lib/roles";
import { Button } from "@/components/ui/button";import { Input } from "@/components/ui/input";import { Label } from "@/components/ui/label";import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, LockKeyhole, Loader2, Mail } from "lucide-react";

type User = { id: string; name: string; email: string; role: string; organizationId?: string; branchId?: string };

/** The website's "Student Login" and "Franchise Login" links arrive with
 *  `?as=`. It only changes the wording: the workspace is still decided by the
 *  account that signs in. */
const PORTALS = {
  student: { title: "Student Login", intro: "Sign in with the login ID and password your institute gave you." },
  franchise: { title: "Franchise Login", intro: "Sign in with your franchise (branch) account to manage your centre." },
} as const;

export default function Login(){
  const location=useLocation();
  // Set by ProtectedRoute when it turns an unauthenticated visit away, so a
  // reload of a deep page returns there instead of dropping onto the dashboard.
  const from=(location.state as {from?:{pathname:string;search:string}}|null)?.from;
  const portal=PORTALS[new URLSearchParams(location.search).get("as") as keyof typeof PORTALS];
  const [user,setUser]=useState<User|null>(null);
  const [identifier,setIdentifier]=useState("");
  const [password,setPassword]=useState("");
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  // "Forgot password?": the same card asks for an email and sends a reset link.
  const [forgot,setForgot]=useState(false);
  const [resetEmail,setResetEmail]=useState("");
  const [resetSent,setResetSent]=useState(false);

  useEffect(()=>{
    const saved=localStorage.getItem("erp-user");
    if(saved) setUser(JSON.parse(saved));
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{
      if(session?.user){
        const meta=session.user.user_metadata||{};
        const u:User={id:session.user.id,name:meta.name||session.user.email||"",email:session.user.email||"",role:meta.role||"STAFF",organizationId:meta.organizationId||null,branchId:meta.branchId||null};
        setUser(u);
        localStorage.setItem("erp-user",JSON.stringify(u));
      }else{
        setUser(null);
        localStorage.removeItem("erp-user");
      }
    });
    return()=>{subscription.unsubscribe()};
  },[]);

  if(user){
    const view=viewForRole(user.role);
    const home=view==="student"?"/me":"/";
    // Students always land in their own portal; a remembered admin/franchise
    // path wins over the generic dashboard.
    const target=view==="student"?home:(from?`${from.pathname}${from.search||""}`:home);
    return <Navigate to={target} replace/>;
  }

  const submit=async(e:React.FormEvent)=>{e.preventDefault();setBusy(true);setError("");try{
    const email=identifier.includes("@")?identifier:`${identifier}@careeroptics.local`;
    const{error:err}=await supabase.auth.signInWithPassword({email,password});
    if(err) throw new Error(err.message);
  }catch(err){setError(err instanceof Error?err.message:"Unable to sign in")}finally{setBusy(false)}};

  /** Supabase emails a one-time link that opens /reset-password signed in for recovery. */
  const sendReset=async(e:React.FormEvent)=>{e.preventDefault();setBusy(true);setError("");try{
    const email=resetEmail.trim();
    if(!email.includes("@")) throw new Error("Enter the email address of the account. A username login has no inbox to send to, so ask your administrator to set a new password instead.");
    const{error:err}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:`${window.location.origin}${import.meta.env.BASE_URL}reset-password`});
    if(err) throw new Error(err.message);
    setResetSent(true);
  }catch(err){setError(err instanceof Error?err.message:"Could not send the reset link")}finally{setBusy(false)}};
// The DriveWay admin login: a navy gradient with soft glows, and the form on a
// card in the canvas colour, logo and wordmark centred above the heading.
return <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[linear-gradient(165deg,#04246b_0%,#020b24_100%)] p-4">
  <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 h-[300px] w-[300px] rounded-full bg-[radial-gradient(circle,rgba(31,214,201,0.30),transparent_70%)]"/>
  <div aria-hidden className="pointer-events-none absolute -left-16 bottom-28 h-[260px] w-[260px] rounded-full bg-[radial-gradient(circle,rgba(126,226,31,0.16),transparent_70%)]"/>
  <div className="relative w-full max-w-[400px] animate-slide-up">
    {forgot?<>
    <form onSubmit={sendReset} className="rounded-[18px] bg-background p-7 text-foreground shadow-xl">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-accent text-primary"><Mail className="h-5 w-5"/></div>
      <h1 className="mb-1 mt-4 text-center text-[22px] font-extrabold">Reset password</h1>
      {resetSent
        ?<div className="mt-4 flex gap-2 rounded-[14px] border border-success/25 bg-success/10 p-3 text-sm text-success"><CheckCircle2 className="h-4 w-4 shrink-0"/><span>If an account uses <b>{resetEmail}</b>, a reset link is on its way. Open it on this device to choose a new password.</span></div>
        :<>
          <p className="mb-5 text-center text-[13.5px] text-muted-foreground">Enter your account's email and we will send you a link to set a new password.</p>
          {error&&<div className="mb-4 flex gap-2 rounded-[14px] border border-destructive/25 bg-destructive/10 p-3 text-sm text-destructive"><AlertCircle className="h-4 w-4 shrink-0"/>{error}</div>}
          <div className="space-y-2"><Label htmlFor="reset-email" className="text-[13.5px] font-semibold">Email</Label><Input id="reset-email" type="email" autoComplete="email" value={resetEmail} onChange={e=>setResetEmail(e.target.value)} required autoFocus/></div>
          <Button type="submit" disabled={busy} size="lg" className="mt-5 w-full">{busy?<Loader2 className="animate-spin"/>:<>Send reset link<ArrowRight/></>}</Button>
        </>}
      <button type="button" onClick={()=>{setForgot(false);setError("")}} className="mt-4 flex w-full items-center justify-center gap-1.5 text-xs font-semibold text-primary hover:underline"><ArrowLeft className="h-3.5 w-3.5"/>Back to sign in</button>
    </form>
    </>:<>
    <form onSubmit={submit} className="rounded-[18px] bg-background p-7 text-foreground shadow-xl">
      <div className="flex items-center justify-center gap-2.5"><img src={`${import.meta.env.BASE_URL}career-optics-logo.webp`} alt="" className="h-10 w-10 rounded-xl bg-white object-contain p-0.5 shadow-card"/><div className="leading-[1.05]"><p className="text-[21px] font-extrabold tracking-[-.01em]">Career <span className="bg-[linear-gradient(90deg,#1d4ed8_0%,#f97316_100%)] bg-clip-text text-transparent">Optics</span></p><p className="mt-0.5 text-[8.5px] font-semibold uppercase tracking-[.14em] text-muted-foreground">Computer Centre · ERP</p></div></div>
      <h1 className="mb-1 mt-[22px] text-center text-[22px] font-extrabold">{portal?.title??"Welcome back"}</h1>
      <p className="mb-5 text-center text-[13.5px] text-muted-foreground">{portal?.intro??"Sign in with your authorised account — administrator, franchise or student. Your workspace is decided by that authorisation."}</p>
      {error&&<div className="mb-4 flex gap-2 rounded-[14px] border border-destructive/25 bg-destructive/10 p-3 text-sm text-destructive"><AlertCircle className="h-4 w-4 shrink-0"/>{error}</div>}
      <div className="space-y-3.5">
        <div className="space-y-2"><Label htmlFor="identifier" className="text-[13.5px] font-semibold">Email or username</Label><Input id="identifier" autoComplete="username" value={identifier} onChange={e=>setIdentifier(e.target.value)} required/></div>
        <div className="space-y-2"><div className="flex items-center justify-between"><Label htmlFor="password" className="text-[13.5px] font-semibold">Password</Label><button type="button" onClick={()=>{setForgot(true);setError("");setResetSent(false);setResetEmail(identifier.includes("@")?identifier:"")}} className="text-xs font-semibold text-primary hover:underline">Forgot password?</button></div><Input id="password" type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required/></div>
        <Button type="submit" disabled={busy} size="lg" className="!mt-5 w-full">{busy?<Loader2 className="animate-spin"/>:<><LockKeyhole/>Sign in<ArrowRight/></>}</Button>
      </div>
      <p className="mt-3.5 text-center text-[11.5px] text-muted-foreground/80">Access is logged and monitored for institutional security.</p>
    </form>
    </>}
    <a href="/" className="mt-4 flex items-center justify-center gap-1.5 text-xs font-medium text-white/60 hover:text-white"><ArrowLeft className="h-3.5 w-3.5"/>Back to website</a>
  </div>
</main>}
