import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2, FileText, Loader2, Search, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { INDIAN_STATES, districtsFor } from "@/data/indianStates";
import {
  ADMISSION_DOCUMENTS,
  getApplicationStatus,
  getPublicCentres,
  getPublicCourses,
  readDocument,
  submitOnlineAdmission,
  type AdmissionDocumentKey,
  type ApplicationStatus,
  type OnlineApplicant,
  type PublicCentre,
} from "@/lib/supabase/onlineAdmission";

const STEPS = ["Centre & course", "Your details", "Family & address", "Documents", "Review"] as const;

const BLANK: OnlineApplicant = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "",
  phone: "",
  whatsappNumber: "",
  email: "",
  fatherName: "",
  motherName: "",
  streetAddress: "",
  city: "",
  district: "",
  state: "Bihar",
  pincode: "",
};

const STATUS_TEXT: Record<string, string> = {
  SUBMITTED: "Submitted — your centre is checking your documents.",
  PENDING_PAYMENT: "Waiting for your fee payment.",
  DRAFT: "Started, not yet submitted.",
  APPROVED: "Approved — your admission is confirmed.",
  REJECTED: "Not approved.",
  NOT_FOUND: "No application with that number and mobile.",
};

/**
 * The online admission form, open to anyone: a student applies at the centre
 * they choose, with their documents and fee screenshot. The application waits
 * for that centre's admin, who approves it in Online Admission List -- only
 * then is the admission confirmed. Links from the website may fill the
 * centre, course, name and mobile (?centre=&course=&name=&phone=).
 */
export default function OnlineAdmission() {
  const [params] = useSearchParams();
  const [step, setStep] = useState(0);
  const [centres, setCentres] = useState<PublicCentre[]>([]);
  const [courses, setCourses] = useState<Array<{ id: string; name: string }>>([]);
  const [centreId, setCentreId] = useState(params.get("centre") || "");
  const [courseId, setCourseId] = useState("");
  const [form, setForm] = useState<OnlineApplicant>(() => {
    const [first, ...rest] = (params.get("name") || "").trim().split(/\s+/);
    return { ...BLANK, firstName: first || "", lastName: rest.join(" "), phone: params.get("phone") || "" };
  });
  const [docs, setDocs] = useState<Partial<Record<AdmissionDocumentKey, { name: string; dataUrl: string }>>>({});
  const [reading, setReading] = useState("");
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ applicationNo: string; centre: string } | null>(null);

  const [lookup, setLookup] = useState({ applicationNo: "", phone: "" });
  const [status, setStatus] = useState<ApplicationStatus | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    getPublicCentres()
      .then(setCentres)
      .catch((e) => setLoadError(e instanceof Error ? e.message : "Could not load the centres."));
  }, []);

  useEffect(() => {
    setCourses([]);
    if (!centreId) return;
    getPublicCourses(centreId)
      .then((list) => {
        setCourses(list);
        const wanted = (params.get("course") || "").toLowerCase();
        const match = list.find((c) => c.id === params.get("course") || (wanted && c.name.toLowerCase().includes(wanted)));
        setCourseId((current) => (list.some((c) => c.id === current) ? current : match?.id || (list.length === 1 ? list[0].id : "")));
      })
      .catch(() => setCourses([]));
  }, [centreId, params]);

  const set = <K extends keyof OnlineApplicant>(key: K, value: OnlineApplicant[K]) => setForm((f) => ({ ...f, [key]: value }));
  const centre = centres.find((c) => c.id === centreId);
  const course = courses.find((c) => c.id === courseId);
  const districts = useMemo(() => districtsFor(form.state), [form.state]);

  /** What stops the step from moving on, in plain words; empty when it may. */
  const problem = (at: number): string => {
    if (at === 0) {
      if (!centreId) return "Choose your centre.";
      if (courses.length && !courseId) return "Choose your course.";
    }
    if (at === 1) {
      if (!form.firstName.trim() || !form.lastName.trim()) return "Enter your first and last name.";
      if (!form.dateOfBirth) return "Enter your date of birth.";
      // The picker's max does not stop a typed date; compare as yyyy-mm-dd.
      if (form.dateOfBirth >= new Date().toLocaleDateString("en-CA")) return "Your date of birth must be in the past.";
      if (!form.gender) return "Choose your gender.";
      if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\D/g, "").slice(-10))) return "Enter a valid 10-digit mobile number.";
      if (form.whatsappNumber.trim() && !/^[6-9]\d{9}$/.test(form.whatsappNumber.replace(/\D/g, "").slice(-10))) return "Enter a valid 10-digit WhatsApp number, or leave it empty.";
      if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return "Enter a valid email address, or leave it empty.";
    }
    if (at === 2) {
      if (!form.fatherName.trim() || !form.motherName.trim()) return "Enter your father's and mother's names.";
      if (!form.streetAddress.trim() || !form.city.trim() || !form.state) return "Enter your address, city and state.";
      if (!/^\d{6}$/.test(form.pincode.trim())) return "Pincode must be 6 digits.";
    }
    if (at === 3) {
      const missing = ADMISSION_DOCUMENTS.filter((d) => d.required && !docs[d.key]);
      if (missing.length) return `Upload: ${missing.map((d) => d.label).join(", ")}.`;
    }
    return "";
  };

  const next = () => {
    const p = problem(step);
    if (p) return setError(p);
    setError("");
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pick = async (key: AdmissionDocumentKey, file: File | undefined) => {
    if (!file) return;
    setReading(key);
    setError("");
    try {
      const read = await readDocument(file);
      setDocs((d) => ({ ...d, [key]: read }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read that file.");
    } finally {
      setReading("");
    }
  };

  const submit = async () => {
    for (let at = 0; at < 4; at++) {
      const p = problem(at);
      if (p) {
        setStep(at);
        return setError(p);
      }
    }
    setBusy(true);
    setError("");
    try {
      const result = await submitOnlineAdmission(centreId, courseId || null, form, docs);
      setDone(result);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not submit the application.");
    } finally {
      setBusy(false);
    }
  };

  const check = async () => {
    if (!lookup.applicationNo.trim() || !lookup.phone.trim()) return;
    setChecking(true);
    try {
      setStatus(await getApplicationStatus(lookup.applicationNo, lookup.phone));
    } catch (e) {
      setStatus({ status: "NOT_FOUND", note: e instanceof Error ? e.message : null });
    } finally {
      setChecking(false);
    }
  };

  const field = (label: string, key: keyof OnlineApplicant, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div className="space-y-1.5">
      <Label htmlFor={`oa-${key}`}>{label}</Label>
      <Input id={`oa-${key}`} value={form[key]} onChange={(e) => set(key, e.target.value)} {...props} />
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30 pb-16">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <img src={`${import.meta.env.BASE_URL}career-optics-logo.webp`} alt="Career Optics Computer Academy" className="h-11 w-11 rounded-xl object-contain" />
          <div>
            <p className="font-bold leading-tight">Online Admission</p>
            <p className="text-xs text-muted-foreground">Apply with your documents. Your centre confirms the admission.</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-4 px-4 pt-5">
        {done ? (
          <Card>
            <CardContent className="space-y-3 py-8 text-center">
              <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
              <p className="text-xl font-bold">Application submitted</p>
              <p className="text-sm text-muted-foreground">Your application number</p>
              <p className="font-mono text-2xl font-bold tracking-wide">{done.applicationNo}</p>
              <p className="mx-auto max-w-md text-sm text-muted-foreground">
                {done.centre} will check your documents and confirm your admission. Keep this number: with your mobile it shows where your application stands, below.
              </p>
              <Button variant="outline" onClick={() => { setLookup({ applicationNo: done.applicationNo, phone: form.phone }); setDone(null); setStep(0); setDocs({}); setForm(BLANK); }}>
                Done
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="space-y-3">
              <ol className="flex flex-wrap gap-1.5 text-xs" aria-label="Steps">
                {STEPS.map((s, i) => (
                  <li key={s} className={`rounded-full px-2.5 py-1 ${i === step ? "bg-primary text-primary-foreground" : i < step ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {i + 1}. {s}
                  </li>
                ))}
              </ol>
              <CardTitle>{STEPS[step]}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadError && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{loadError}</p>}

              {step === 0 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Centre</Label>
                    <Select value={centreId} onValueChange={setCentreId}>
                      <SelectTrigger aria-label="Centre"><SelectValue placeholder={centres.length ? "Choose your centre" : "Loading centres…"} /></SelectTrigger>
                      <SelectContent searchable searchPlaceholder="Search centre or city…">
                        {centres.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}{[c.city, c.district].filter(Boolean).length ? ` — ${[c.city, c.district].filter(Boolean).join(", ")}` : ""}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Course</Label>
                    <Select value={courseId} onValueChange={setCourseId} disabled={!centreId}>
                      <SelectTrigger aria-label="Course"><SelectValue placeholder={centreId ? (courses.length ? "Choose your course" : "No course listed") : "Choose the centre first"} /></SelectTrigger>
                      <SelectContent>
                        {courses.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {field("First name", "firstName", { autoComplete: "given-name" })}
                  {field("Last name", "lastName", { autoComplete: "family-name" })}
                  {field("Date of birth", "dateOfBirth", { type: "date", max: new Date().toLocaleDateString("en-CA") })}
                  <div className="space-y-1.5">
                    <Label>Gender</Label>
                    <Select value={form.gender} onValueChange={(v) => set("gender", v)}>
                      <SelectTrigger aria-label="Gender"><SelectValue placeholder="Choose" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {field("Mobile number", "phone", { inputMode: "tel", autoComplete: "tel", placeholder: "10-digit mobile" })}
                  {field("WhatsApp number (if different)", "whatsappNumber", { inputMode: "tel" })}
                  {field("Email (optional)", "email", { type: "email", autoComplete: "email" })}
                </div>
              )}

              {step === 2 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {field("Father's name", "fatherName")}
                  {field("Mother's name", "motherName")}
                  <div className="sm:col-span-2">{field("Address (house, street, village)", "streetAddress", { autoComplete: "street-address" })}</div>
                  {field("City / town", "city")}
                  <div className="space-y-1.5">
                    <Label>State</Label>
                    <Select value={form.state} onValueChange={(v) => { set("state", v); set("district", ""); }}>
                      <SelectTrigger aria-label="State"><SelectValue placeholder="Choose" /></SelectTrigger>
                      <SelectContent>{INDIAN_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>District</Label>
                    {districts.length ? (
                      <Select value={form.district} onValueChange={(v) => set("district", v)}>
                        <SelectTrigger aria-label="District"><SelectValue placeholder="Choose" /></SelectTrigger>
                        <SelectContent>{districts.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                      </Select>
                    ) : (
                      <Input aria-label="District" value={form.district} onChange={(e) => set("district", e.target.value)} />
                    )}
                  </div>
                  {field("Pincode", "pincode", { inputMode: "numeric", maxLength: 6 })}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">A clear photo from your phone is fine. Photos are made smaller before upload; a PDF can be up to 2 MB.</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {ADMISSION_DOCUMENTS.map((d) => {
                      const file = docs[d.key];
                      return (
                        <div key={d.key} className="flex items-center gap-3 rounded-xl border bg-card p-3">
                          <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-lg bg-muted">
                            {file?.dataUrl.startsWith("data:image") ? (
                              <img src={file.dataUrl} alt="" className="h-full w-full object-cover" />
                            ) : file ? (
                              <FileText className="h-6 w-6 text-muted-foreground" />
                            ) : (
                              <Upload className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">{d.label}{d.required && <span className="text-destructive"> *</span>}</p>
                            <p className="truncate text-xs text-muted-foreground">{file ? file.name : d.required ? "Required" : "Optional"}</p>
                          </div>
                          {file && (
                            <Button type="button" size="icon" variant="ghost" aria-label={`Remove ${d.label}`} onClick={() => setDocs((all) => { const next = { ...all }; delete next[d.key]; return next; })}>
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                          <label className="inline-flex cursor-pointer items-center rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted">
                            {reading === d.key ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : file ? "Change" : "Upload"}
                            <input type="file" accept={d.accept} className="sr-only" aria-label={`Upload ${d.label}`} onChange={(e) => { void pick(d.key, e.target.files?.[0]); e.target.value = ""; }} />
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {step === 4 && (
                <dl className="grid gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
                  {[
                    ["Centre", centre?.name],
                    ["Course", course?.name || "—"],
                    ["Name", `${form.firstName} ${form.lastName}`],
                    ["Date of birth", form.dateOfBirth],
                    ["Mobile", form.phone],
                    ["Father / Mother", `${form.fatherName} / ${form.motherName}`],
                    ["Address", [form.streetAddress, form.city, form.district, form.state, form.pincode].filter(Boolean).join(", ")],
                    ["Documents", ADMISSION_DOCUMENTS.filter((d) => docs[d.key]).map((d) => d.label).join(", ")],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-xs text-muted-foreground">{k}</dt>
                      <dd className="font-medium">{v || "—"}</dd>
                    </div>
                  ))}
                </dl>
              )}

              {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

              <div className="flex justify-between gap-2 pt-2">
                <Button variant="outline" onClick={() => { setError(""); setStep((s) => Math.max(0, s - 1)); }} disabled={step === 0 || busy}>Back</Button>
                {step < STEPS.length - 1 ? (
                  <Button onClick={next}>Continue</Button>
                ) : (
                  <Button onClick={() => void submit()} disabled={busy}>{busy ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting…</> : "Submit application"}</Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle className="text-base">Check your application</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <Input aria-label="Application number" placeholder="Application number (APP-…)" value={lookup.applicationNo} onChange={(e) => setLookup((l) => ({ ...l, applicationNo: e.target.value }))} />
              <Input aria-label="Mobile number used" placeholder="Mobile number used" inputMode="tel" value={lookup.phone} onChange={(e) => setLookup((l) => ({ ...l, phone: e.target.value }))} />
              <Button variant="outline" onClick={() => void check()} disabled={checking}>{checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Search className="mr-2 h-4 w-4" />Check</>}</Button>
            </div>
            {status && (
              <div className="rounded-lg bg-muted/50 p-3 text-sm">
                {status.applicationNo && <p className="font-semibold">{status.name} · {status.applicationNo} · {status.centre}</p>}
                <p>{STATUS_TEXT[status.status] || status.status}</p>
                {status.status === "REJECTED" && status.note && <p className="mt-1 text-destructive">Reason: {status.note}</p>}
                {status.requested && <p className="mt-1">Your centre has asked for: {status.requested}</p>}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
