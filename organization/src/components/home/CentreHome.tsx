import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Award,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  Hourglass,
  IndianRupee,
  Phone,
  UserPlus,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { canAccessWithRole } from "@/lib/navigation";
import { SUPPORT_PHONE, SUPPORT_WHATSAPP } from "@/lib/classicMenu";
import { getCentreDashboard, type CentreDashboard } from "@/lib/supabase/centreDashboard";
import { useToast } from "@/hooks/use-toast";

/**
 * The dashboard in the classic franchise-panel layout: a promotion banner with
 * "Recharge Now", the head office helpline with the centre's downloads, and
 * nine figure cards. The admin sees the same figures for the whole
 * organisation; a centre sees its own.
 */

const TEAL = "#38c3be";
const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

const SLIDES = [
  {
    kicker: "Wallet Recharge",
    title: "Recharge your centre wallet",
    text: "Certificates, marksheets and ID cards are issued from your wallet balance. Keep it topped up so nothing waits.",
    tone: "from-[#0b2350] via-[#163b86] to-[#1d4ed8]",
  },
  {
    kicker: "Admission Open 2026–27",
    title: "बिहार का भरोसेमंद कंप्यूटर संस्थान",
    text: "Share your online admission link and approve applications straight from the panel.",
    tone: "from-[#7c2d12] via-[#c2410c] to-[#f97316]",
  },
  {
    kicker: "ISO 9001:2015 Certified",
    title: "Govt. registered certificates with QR",
    text: "Every certificate and marksheet carries a QR code that anyone can verify on the website.",
    tone: "from-[#134e4a] via-[#0f766e] to-[#14b8a6]",
  },
];

function Banner() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setI((n) => (n + 1) % SLIDES.length), 6000);
    return () => window.clearInterval(t);
  }, []);
  const s = SLIDES[i];
  return (
    <div className={`relative overflow-hidden rounded-sm bg-gradient-to-r ${s.tone} px-6 py-8 text-white sm:px-10 sm:py-10`}>
      <div aria-hidden className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/10" />
      <div aria-hidden className="pointer-events-none absolute -bottom-20 right-40 h-44 w-44 rounded-full bg-white/[.06]" />
      <div className="relative flex items-center gap-6">
        <img src={`${import.meta.env.BASE_URL}career-optics-logo.webp`} alt="" className="hidden h-28 w-28 shrink-0 rounded-full bg-white object-contain p-1 shadow-xl sm:block" />
        <div className="min-w-0">
          <span className="inline-block rounded bg-[#fbbf24] px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#1f1300]">{s.kicker}</span>
          <p className="mt-3 text-[22px] font-extrabold leading-tight sm:text-[30px]">{s.title}</p>
          <p className="mt-2 max-w-2xl text-[13.5px] text-white/85 sm:text-[15px]">{s.text}</p>
          <p className="mt-3 text-[12.5px] font-semibold text-white/80">Customer Support · {SUPPORT_PHONE}</p>
        </div>
      </div>
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
        {SLIDES.map((x, k) => (
          <button key={x.kicker} type="button" aria-label={`Slide ${k + 1}`} onClick={() => setI(k)} className={`h-2 rounded-full transition-all ${k === i ? "w-6 bg-white" : "w-2 bg-white/50"}`} />
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, to }: { label: string; value: React.ReactNode; icon: LucideIcon; to?: string }) {
  const body = (
    <div className="flex h-full flex-col justify-between rounded-sm bg-white p-5 shadow-sm transition hover:shadow-md">
      <p className="text-[13px] font-bold uppercase tracking-wide text-slate-700">{label}</p>
      <div className="mt-4 flex items-end justify-between">
        <Icon className="h-11 w-11" style={{ color: TEAL }} strokeWidth={1.6} />
        <span className="text-[26px] font-bold tabular-nums text-slate-800">{value}</span>
      </div>
    </div>
  );
  return to ? <Link to={to} className="block h-full">{body}</Link> : body;
}

export function CentreHome() {
  const { toast } = useToast();
  const { view, branchId, allowedPaths } = useAuth();
  const centre = view === "franchise";
  const [d, setD] = useState<CentreDashboard | null>(null);

  useEffect(() => {
    let cancelled = false;
    getCentreDashboard(centre ? branchId ?? null : null)
      .then((r) => { if (!cancelled) setD(r); })
      .catch((e) => {
        if (!cancelled) toast({ title: "Dashboard figures unavailable", description: e instanceof Error ? e.message : undefined, variant: "destructive" });
      });
    return () => { cancelled = true; };
  }, [centre, branchId, toast]);

  // A card links only where this login may go.
  const link = (to: string) => (canAccessWithRole(view, to.split("?")[0], allowedPaths) ? to : undefined);
  // The centre panel's own page where the role has it, else the older module.
  const pick = (centre: string, fallback: string) => link(centre) || link(fallback);
  const v = (n?: number) => (d ? n : "—");

  const cards: Array<{ label: string; value: React.ReactNode; icon: LucideIcon; to?: string }> = [
    { label: "Total Students", value: v(d?.totalStudents), icon: GraduationCap, to: pick("/centre/students?type=all", "/student/view") },
    { label: "Registered Students", value: v(d?.registeredStudents), icon: UserPlus, to: pick("/centre/students?type=registered", "/student/view") },
    { label: "Requested Students", value: v(d?.requestedStudents), icon: Hourglass, to: pick("/centre/students?type=request", "/student/online-admissions") },
    { label: "Approved Students", value: v(d?.approvedStudents), icon: CheckCircle2, to: pick("/centre/students?type=approved", "/student/view") },
    { label: "Total Exams", value: v(d?.totalExams), icon: ClipboardList, to: pick("/centre/exams", "/exam/schedule") },
    { label: "Today's Payment", value: d ? inr(d.todaysPayment) : "—", icon: IndianRupee, to: link("/fee/collection") },
    { label: "Total Payment", value: d ? inr(d.totalPayment) : "—", icon: Wallet, to: link("/fee/collection") },
    { label: "Total Dues", value: d ? inr(d.totalDues) : "—", icon: IndianRupee, to: link("/fee/due-collection") },
    { label: "Order Certificate", value: v(d?.orderedCertificates), icon: Award, to: pick("/centre/orders", "/certificate/issue") },
  ];

  const authorization = link("/certificate/centre");
  const downloads = link("/centre/downloads");

  return (
    <div className="space-y-5">
      <div className="rounded-sm bg-white p-4 shadow-sm">
        <Banner />
        {centre && link("/branch/wallet") && (
          <div className="mt-4 text-center">
            <Link to={pick("/centre/wallet", "/branch/wallet")!} className="inline-block rounded px-5 py-2 text-[13.5px] font-semibold text-white shadow-sm hover:brightness-95" style={{ background: "#3ecf8e" }}>
              Recharge Now
            </Link>
          </div>
        )}
      </div>

      <div className="rounded-sm bg-white px-4 py-7 text-center shadow-sm">
        <p className="mx-auto max-w-3xl text-[16px] font-semibold text-slate-800 sm:text-[18px]">
          For any assistance related to student registration, examinations, or other queries, please contact our technical support team at
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <a href={`tel:+91${SUPPORT_PHONE}`} className="inline-flex items-center gap-2 rounded px-4 py-2 text-[14px] font-semibold text-white" style={{ background: "#2d8fd5" }}>
            <Phone className="h-4 w-4" /> {SUPPORT_PHONE}
          </a>
          <a href={SUPPORT_WHATSAPP} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded bg-[#25d366] px-4 py-2 text-[14px] font-semibold text-white">
            WhatsApp
          </a>
        </div>
        {centre && authorization && (
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link to={authorization} className="rounded bg-[#f26b6b] px-4 py-2 text-[13px] font-medium text-white hover:brightness-95">Download Authorization Letter</Link>
            {downloads && <Link to={downloads} className="rounded bg-[#2d8fd5] px-4 py-2 text-[13px] font-medium text-white hover:brightness-95">Franchise Director ID Card</Link>}
            {downloads && <Link to={downloads} className="rounded bg-[#f5a623] px-4 py-2 text-[13px] font-medium text-white hover:brightness-95">Download Promotional Banner</Link>}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => (
          <StatCard key={c.label} {...c} />
        ))}
      </div>
    </div>
  );
}
