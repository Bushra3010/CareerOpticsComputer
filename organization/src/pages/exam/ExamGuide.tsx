import { Link } from "react-router-dom";
import { ArrowRight, Building2, GraduationCap, Landmark, ShieldCheck } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

type Who = "office" | "centre" | "student";

const WHO: Record<Who, { label: string; hindi: string; className: string }> = {
  office: { label: "Head office", hindi: "Head office", className: "bg-primary/10 text-primary" },
  centre: { label: "Centre", hindi: "Centre", className: "bg-gold/20 text-gold-foreground" },
  student: { label: "Student", hindi: "Student", className: "bg-success/10 text-success" },
};

interface Step {
  title: string;
  hindi: string;
  detail: string;
  who: Who[];
  url: string;
  /** Franchise logins open a different page for the same step, or none. */
  franchiseUrl?: string | null;
}

const EXAM_STEPS: Step[] = [
  {
    title: "Course subjects",
    hindi: "Har course ke papers (year / semester wise) aur unke theory-practical marks set karein.",
    detail: "Each course's papers per year or semester, with theory and practical minimum and maximum marks. Everything below reads from this.",
    who: ["office"],
    url: "/course/subjects",
  },
  {
    title: "Exam centres",
    hindi: "Jahan exam hoga, wo exam hall / centre add karein.",
    detail: "The places where examinations are held. An exam schedule names one of these.",
    who: ["office"],
    url: "/exam/centres",
    franchiseUrl: null,
  },
  {
    title: "Exam schedule",
    hindi: "Centre + course + year + session chunein, har paper ki date aur time bharein.",
    detail: "For a centre's students of a course and session: the date and time of every paper, at an exam centre.",
    who: ["office", "centre"],
    url: "/exam/schedule",
  },
  {
    title: "Admit cards",
    hindi: "Schedule se student ko roll number dekar admit card issue aur print karein.",
    detail: "Issue a roll number to each student from the schedule and print the admit card. Students see it in their portal and on the website.",
    who: ["office", "centre"],
    url: "/exam/admit-cards",
  },
  {
    title: "Results & marksheets",
    hindi: "Theory / practical marks bharein — total, %, grade aur PASS/FAIL apne aap.",
    detail: "Enter each paper's marks; total, percentage, grade and PASS / FAIL are worked out. Print the marksheet in the institute's format.",
    who: ["office", "centre"],
    url: "/exam/results",
  },
  {
    title: "Certificates",
    hindi: "Final year/semester PASS hone par certificate issue karein — student Passout list mein aa jaata hai.",
    detail: "Issue the completion certificate on the passed final result. The student becomes a passout and the certificate verifies on the website.",
    who: ["office", "centre"],
    url: "/certificate/issue",
  },
];

const ONLINE_STEPS: Step[] = [
  {
    title: "Create online exam",
    hindi: "MCQ questions, duration, marks, negative marks, pass % aur window set karein.",
    detail: "A multiple-choice paper with its timing, marks and the window it may be sat in.",
    who: ["office"],
    url: "/online-exam/create",
  },
  {
    title: "Assign exam",
    hindi: "Exam ko centre ke sab students ya chune hue students ko dein.",
    detail: "Give the exam to a whole centre, one course's students, or named students. A centre can add its own students to an exam it was given.",
    who: ["office", "centre"],
    url: "/online-exam/assign",
  },
  {
    title: "Student sits the exam",
    hindi: "Student apne portal se exam deta hai — timer, auto-save, time khatam par auto-submit.",
    detail: "From the student portal, with a clock; answers are saved as they go and the paper is marked on submission.",
    who: ["student"],
    url: "/me/exams",
    franchiseUrl: null,
  },
  {
    title: "Student exams (results)",
    hindi: "Har student ka score, %, PASS/FAIL dekhein; re-attempt allow karein.",
    detail: "Every sitting with answered, right, wrong, score and result. Close a timed-out sitting, or allow a re-attempt.",
    who: ["office", "centre"],
    url: "/online-exam/marks",
  },
];

const SETUP_STEPS: Step[] = [
  {
    title: "Certificate & marksheet design",
    hindi: "Document Designer mein design banayein aur centres ko assign karein — wahi design chhapega.",
    detail: "Draw the certificate, marksheet, ID and admit card layouts once, and assign them to centres. A centre prints the design it was given, else the default.",
    who: ["office"],
    url: "/documents/designer",
    franchiseUrl: null,
  },
  {
    title: "Centre charges",
    hindi: "Admission, admit card, marksheet, certificate ka charge set karein — centre ke wallet se ek baar katega.",
    detail: "What each centre pays from its wallet per admission, admit card, marksheet and certificate. Charged once; a short wallet stops the action.",
    who: ["office"],
    url: "/branch/charges",
  },
  {
    title: "Login as centre",
    hindi: "Sidebar ke neeche se kisi bhi centre ka panel bina password kholein.",
    detail: "Opens any centre's own panel to check its work, from the foot of the sidebar.",
    who: ["office"],
    url: "/",
    franchiseUrl: null,
  },
  {
    title: "Public verification",
    hindi: "Website par student result, certificate, admit card aur enrollment verify kar sakta hai.",
    detail: "Anyone can verify a result (enrollment + date of birth), certificate, admit card or enrollment on the website.",
    who: ["student"],
    url: "/verification.html",
  },
];

/**
 * The exam → marksheet → certificate flow laid out in order, with who does
 * each step and a link to the page. The first thing a new office or centre
 * should read.
 */
export default function ExamGuide() {
  const { view } = useAuth();
  const franchise = view === "franchise";

  const section = (title: string, steps: Step[], icon: React.ReactNode) => (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2">{icon} {title}</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {steps.map((step, i) => {
          const url = franchise && step.franchiseUrl !== undefined ? step.franchiseUrl : step.url;
          const external = url?.endsWith(".html");
          return (
            <div key={step.title} className="flex gap-3 rounded-xl border p-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-muted text-sm font-bold">{i + 1}</span>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{step.title}</span>
                  {step.who.map((w) => <Badge key={w} variant="outline" className={`text-[10px] ${WHO[w].className}`}>{WHO[w].label}</Badge>)}
                </div>
                <p className="text-sm">{step.hindi}</p>
                <p className="text-xs text-muted-foreground">{step.detail}</p>
              </div>
              {url && (
                external ? (
                  <a href={url} target="_blank" rel="noreferrer" className="shrink-0 self-center text-sm font-semibold text-primary hover:underline">Open <ArrowRight className="inline h-4 w-4" /></a>
                ) : (
                  <Link to={url} className="shrink-0 self-center text-sm font-semibold text-primary hover:underline">Open <ArrowRight className="inline h-4 w-4" /></Link>
                )
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );

  return (
    <AppLayout>
      <PageHeader
        title="How Exams Work"
        description="Exam se certificate tak ka poora flow, step by step — kaun karta hai aur kahan"
        breadcrumbs={[{ label: "Exam & Marks" }, { label: "How Exams Work" }]}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {section("Exam → Marksheet → Certificate", EXAM_STEPS, <GraduationCap className="h-5 w-5" />)}
        <div className="space-y-4">
          {section("Online exam", ONLINE_STEPS, <ShieldCheck className="h-5 w-5" />)}
          {section(franchise ? "Set by the head office" : "One-time setup", SETUP_STEPS, franchise ? <Building2 className="h-5 w-5" /> : <Landmark className="h-5 w-5" />)}
        </div>
      </div>
    </AppLayout>
  );
}
