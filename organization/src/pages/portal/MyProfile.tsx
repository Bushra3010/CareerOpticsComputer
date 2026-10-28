import { useEffect, useState } from "react";
import { Camera, KeyRound, RotateCcw, Save, Trash2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { pickImage } from "@/lib/export";
import { getStudentProfile } from "@/lib/supabase/data";
import { useAuth } from "@/contexts/AuthContext";
import type { StudentProfile } from "@/data/student-portal";

const READ_ONLY: { label: string; key: keyof StudentProfile }[] = [
  { label: "Enrolment number", key: "enrollmentNo" },
  { label: "Roll number", key: "rollNo" },
  { label: "Course", key: "course" },
  { label: "Batch", key: "batch" },
  { label: "Branch", key: "branch" },
  { label: "Date of birth", key: "dob" },
  { label: "Blood group", key: "bloodGroup" },
];

export default function MyProfile() {
  const { toast } = useToast();
  const { user } = useAuth();
  const userId = user?.id;
  const branchId = user?.branchId;
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [form, setForm] = useState<StudentProfile | null>(null);
  /** Every course this student is enrolled on, not just the primary one. */
  const [courses, setCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });

  useEffect(() => {
    let cancelled = false;
    // The signed-in student arrives a render after the page mounts, so a fetch
    // that does not wait for it queries `userId = undefined`, fails, and — with
    // no dependency on the id — never runs again once the session resolves.
    if (!userId || !branchId) return;
    setLoading(true);
    setError(null);
    getStudentProfile(userId, branchId)
      .then((result) => {
        if (cancelled) return;
        setProfile(result.data);
        setForm(result.data);
        setCourses(result.data.courses);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || "Failed to load profile");
        toast({ title: "Could not load profile", description: err.message || "Please try again.", variant: "destructive" });
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [toast, userId, branchId]);

  const set = <K extends keyof StudentProfile>(key: K, value: StudentProfile[K]) => {
    if (!form) return;
    setForm({ ...form, [key]: value });
  };

  const dirty = form && profile ? JSON.stringify(form) !== JSON.stringify(profile) : false;

  const save = () => {
    if (!form) return;
    if (!form.phone.trim() || !form.email.trim()) return toast({ title: "Phone and email are required", variant: "destructive" });
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return toast({ title: "Check the email address", variant: "destructive" });
    setProfile(form);
    toast({ title: "Profile updated", description: "The branch office sees these details on your record." });
  };

  const photo = async () => {
    const picked = await pickImage();
    if (picked === "too-large") return toast({ title: "Image is over 5 MB", description: "Pick a smaller photo.", variant: "destructive" });
    if (!picked) return;
    set("photo", picked.dataUrl);
    toast({ title: "Photo ready", description: "Save the profile to keep it." });
  };

  const changePassword = () => {
    if (!passwords.current) return toast({ title: "Enter your current password", variant: "destructive" });
    if (passwords.next.length < 8) return toast({ title: "Use at least 8 characters", variant: "destructive" });
    if (passwords.next !== passwords.confirm) return toast({ title: "The two new passwords do not match", variant: "destructive" });
    setPasswords({ current: "", next: "", confirm: "" });
    toast({ title: "Password changed", description: "Use the new password the next time you sign in." });
  };

  if (error) {
    return (
      <AppLayout>
        <PageHeader title="My profile" description="Your contact details, as the branch office holds them." breadcrumbs={[{ label: "My profile" }]} />
        <Card><CardContent className="py-12 text-center text-sm text-destructive">{error}</CardContent></Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="My profile"
        description="Your contact details, as the branch office holds them."
        breadcrumbs={[{ label: "My profile" }]}
        actions={<>
          <Button variant="outline" onClick={() => setForm(profile!)} disabled={!dirty || !form}><RotateCcw />Discard</Button>
          <Button onClick={save} disabled={!dirty || !form}><Save />Save changes</Button>
        </>}
      />

      {loading ? (
        <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">Loading profile…</CardContent></Card>
      ) : form ? (
        <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
          <div className="space-y-5">
            <Card>
              <CardContent className="p-6 text-center">
                <Avatar className="mx-auto h-24 w-24">
                  {form.photo && <AvatarImage src={form.photo} alt="" />}
                  <AvatarFallback className="bg-foreground text-2xl text-background">{form.name.split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <h2 className="mt-4 text-lg font-semibold">{form.name}</h2>
                <p className="text-sm text-muted-foreground">{form.course || "Course not assigned"}</p>
                {/* Only worth the room when there is a second course to show. */}
                {courses.length > 1 && (
                  <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                    {courses.map((course) => (
                      <Badge key={course} variant="secondary" className="font-normal">
                        {course}
                      </Badge>
                    ))}
                  </div>
                )}
                {/* A student with no batch yet would otherwise read " · Kothrud". */}
                <p className="mt-1 text-xs text-muted-foreground">{[form.batch, form.branch].filter(Boolean).join(" · ")}</p>
                <div className="mt-4 flex justify-center gap-2">
                  <Button size="sm" variant="outline" onClick={photo}><Camera className="mr-1.5 h-3.5 w-3.5" />{form.photo ? "Replace photo" : "Upload photo"}</Button>
                  {form.photo && <Button size="sm" variant="ghost" onClick={() => set("photo", null)}><Trash2 className="mr-1.5 h-3.5 w-3.5" />Remove</Button>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Institute record</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {READ_ONLY.map((field) => (
                  <div key={field.key} className="flex items-start justify-between gap-3 border-b pb-3 last:border-0 last:pb-0">
                    {/* `course` is the primary one; a student on several wants
                        to see all of them on their own record. */}
                    <span className="text-xs text-muted-foreground">
                      {field.key === "course" && courses.length > 1 ? "Courses" : field.label}
                    </span>
                    <span className="text-right text-sm font-medium">
                      {field.key === "course" && courses.length > 1
                        ? courses.join(", ")
                        : String(form[field.key] ?? "").trim() || "—"}
                    </span>
                  </div>
                ))}
                <p className="pt-1 text-xs text-muted-foreground">Something wrong here? Raise it from ID &amp; admit card → Request a document.</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-5">
            <Card>
              <CardHeader><CardTitle>Contact details</CardTitle></CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="phone">Mobile</Label><Input id="phone" value={form.phone} onChange={(event) => set("phone", event.target.value)} /></div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input id="whatsapp" value={form.whatsapp} onChange={(event) => set("whatsapp", event.target.value)} />
                  <p className="text-xs text-muted-foreground">The branch messages you here. Leave it the same as your mobile if you use WhatsApp on that number.</p>
                </div>
                <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={form.email} onChange={(event) => set("email", event.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="guardian">Guardian</Label><Input id="guardian" value={form.guardian} onChange={(event) => set("guardian", event.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="guardianPhone">Guardian mobile</Label><Input id="guardianPhone" value={form.guardianPhone} onChange={(event) => set("guardianPhone", event.target.value)} /></div>
                <div className="space-y-2 sm:col-span-2"><Label htmlFor="address">Address</Label><Textarea id="address" rows={3} value={form.address} onChange={(event) => set("address", event.target.value)} /></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><KeyRound className="h-4 w-4" />Password</CardTitle></CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2"><Label htmlFor="current">Current</Label><Input id="current" type="password" autoComplete="current-password" value={passwords.current} onChange={(event) => setPasswords((state) => ({ ...state, current: event.target.value }))} /></div>
                <div className="space-y-2"><Label htmlFor="next">New</Label><Input id="next" type="password" autoComplete="new-password" value={passwords.next} onChange={(event) => setPasswords((state) => ({ ...state, next: event.target.value }))} /></div>
                <div className="space-y-2"><Label htmlFor="confirm">Confirm</Label><Input id="confirm" type="password" autoComplete="new-password" value={passwords.confirm} onChange={(event) => setPasswords((state) => ({ ...state, confirm: event.target.value }))} /></div>
                <div className="sm:col-span-3"><Button variant="outline" onClick={changePassword}>Change password</Button></div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </AppLayout>
  );
}
