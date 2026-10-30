import { useEffect, useState } from "react";

import { AppLayout } from "@/components/layout/AppLayout";
import { DceButton, DceLinkButton, DcePanel, DceSelect } from "@/components/dce/Dce";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  branchDocumentHtml,
  branchTokens,
  loadAssignedBranchDocuments,
  printBranchDocument,
  printStandardCentreCertificate,
  type BranchDetails,
} from "@/lib/branchTemplateDocument";
import { loadInstituteLogo } from "@/lib/instituteLogo";
import { loadInstituteName } from "@/lib/instituteName";
import { asFile } from "@/lib/studentDocuments";
import { COMPANY_NAME, HELPLINE, useBranchOptions } from "@/lib/supabase/centrePanel";
import { getBranchDetails, getCourses } from "@/lib/supabase/data";

const esc = (value: unknown) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

interface Ctx {
  branch: BranchDetails;
  institute: string;
  logo: string | null;
  courses: string[];
}

const addressOf = (branch: BranchDetails) => {
  const a = branch.address ?? {};
  return [a.streetAddress, a.city, a.district, a.state, a.pincode].filter(Boolean).join(", ");
};

const longDate = (value: unknown) => {
  const d = value ? new Date(String(value)) : null;
  return d && !Number.isNaN(d.getTime()) ? d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "";
};

/** A full standalone page: printed from a window of its own so its @page size is the only one in force. */
function pageDocument(title: string, page: string, body: string, css: string) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>
    @page{${page}}
    *{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    html,body{margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;color:#111}
    ${css}
  </style></head><body>${body}</body></html>`;
}

function printInWindow(html: string): boolean {
  const win = window.open("", "_blank", "width=900,height=1000");
  if (!win) return false;
  win.document.open();
  win.document.write(html);
  win.document.close();
  const fire = () => {
    win.focus();
    win.print();
  };
  // Logos are data URLs, but give them a moment to decode before the dialog snapshots the page.
  if (win.document.readyState === "complete") setTimeout(fire, 300);
  else win.addEventListener("load", () => setTimeout(fire, 300), { once: true });
  return true;
}

function download(name: string, html: string) {
  const url = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const logoTag = (logo: string | null, size: number) =>
  logo ? `<img src="${logo}" alt="" style="width:${size}px;height:${size}px;object-fit:contain" />` : "";

/* ---------------------------------------------------------- Admission form */

function admissionFormHtml({ branch, institute, logo }: Ctx) {
  const blank = (label: string, wide = false) =>
    `<div class="f${wide ? " w" : ""}"><span>${esc(label)}</span><i></i></div>`;
  const section = (title: string, fields: string) => `<h3>${esc(title)}</h3><div class="g">${fields}</div>`;
  const body = `
  <div class="sheet">
    <header>
      ${logoTag(logo, 78)}
      <div class="t">
        <h1>${esc(institute)}</h1>
        <p>${esc(COMPANY_NAME)}</p>
        <p><b>${esc(branch.name)}</b>${branch.code ? ` (Centre Code: ${esc(branch.code)})` : ""}</p>
        <p>${esc(addressOf(branch))}${branch.phone ? ` · Ph: ${esc(branch.phone)}` : ""}</p>
      </div>
      <div class="photo">Paste recent<br/>passport size<br/>photograph</div>
    </header>
    <h2>ADMISSION FORM</h2>
    <div class="g top">${blank("Form No.")}${blank("Admission Date")}${blank("Enrollment No.")}${blank("Session")}</div>
    ${section("Course Details", blank("Course Name", true) + blank("Batch / Timing") + blank("Course Duration"))}
    ${section(
      "Student Details",
      blank("Student's Full Name", true) +
        blank("Father's Name", true) +
        blank("Mother's Name", true) +
        blank("Date of Birth") +
        blank("Gender") +
        blank("Category") +
        blank("Religion") +
        blank("Blood Group") +
        blank("Aadhar Number") +
        blank("Mobile No.") +
        blank("Alternate Mobile") +
        blank("Email", true),
    )}
    ${section("Address", blank("Address", true) + blank("City / Village") + blank("District") + blank("State") + blank("PIN Code"))}
    ${section("Education", blank("Highest Qualification") + blank("Board / University") + blank("Passing Year") + blank("Percentage"))}
    ${section("Fees", blank("Course Fee") + blank("Registration Fee") + blank("Amount Paid") + blank("Receipt No."))}
    <h3>Declaration</h3>
    <p class="d">I hereby declare that the information given above is true to the best of my knowledge. I will abide by the rules and regulations of the institute.</p>
    <div class="sig">
      <div><i></i>Signature of Student</div>
      <div><i></i>Signature of Parent / Guardian</div>
      <div><i></i>Centre Director (with seal)</div>
    </div>
    <footer>Helpline: ${HELPLINE}</footer>
  </div>`;
  return pageDocument(
    `Admission Form — ${branch.name ?? ""}`,
    "size:A4 portrait;margin:10mm",
    body,
    `.sheet{border:2px solid #173653;padding:14px 18px;min-height:275mm;position:relative}
     header{display:flex;align-items:center;gap:14px;border-bottom:2px solid #173653;padding-bottom:10px}
     header .t{flex:1;text-align:center}
     h1{margin:0;font-size:22px;color:#173653;text-transform:uppercase}
     header p{margin:2px 0;font-size:11.5px}
     .photo{width:100px;height:120px;border:1.5px dashed #555;display:flex;align-items:center;justify-content:center;text-align:center;font-size:10px;color:#666}
     h2{text-align:center;margin:10px 0 6px;font-size:16px;letter-spacing:.15em;background:#173653;color:#fff;padding:4px}
     h3{margin:12px 0 4px;font-size:12.5px;color:#173653;border-bottom:1px solid #cbd5e1;padding-bottom:2px}
     .g{display:grid;grid-template-columns:1fr 1fr;gap:6px 18px}
     .g.top{grid-template-columns:repeat(4,1fr)}
     .f{display:flex;align-items:flex-end;gap:6px;font-size:11.5px;min-height:22px}
     .f.w{grid-column:1/-1}
     .f span{white-space:nowrap}
     .f i{flex:1;border-bottom:1px dotted #333;height:14px}
     .d{font-size:11px;margin:4px 0}
     .sig{display:flex;justify-content:space-between;gap:20px;margin-top:46px;font-size:11px;text-align:center}
     .sig div{flex:1}.sig i{display:block;border-top:1px solid #333;margin-bottom:4px}
     footer{position:absolute;bottom:8px;left:0;right:0;text-align:center;font-size:10px;color:#555}`,
  );
}

/* ------------------------------------------------------- Director ID card */

function idCardHtml({ branch, institute, logo }: Ctx) {
  const director = branch.director ?? {};
  const name = String(director.name || branch.contactPerson || branch.name || "");
  const photo = asFile("photo", "Director Photo", director.photo)?.url ?? "";
  const valid = longDate(branch.license?.expiryDate ?? branch.license?.validDate) || "—";
  const body = `
  <div class="card">
    <div class="top">${logoTag(logo, 30)}<div><b>${esc(institute)}</b><small>Authorised Franchise</small></div></div>
    <div class="mid">
      <div class="ph">${photo ? `<img src="${esc(photo)}" alt="" />` : "PHOTO"}</div>
      <div class="info">
        <p class="nm">${esc(name)}</p>
        <p class="role">Franchise Director</p>
        <p><span>Centre</span>${esc(branch.name)}</p>
        <p><span>Code</span>${esc(branch.code || "—")}</p>
        <p><span>Phone</span>${esc(branch.phone || "—")}</p>
        <p><span>Valid upto</span>${esc(valid)}</p>
      </div>
    </div>
    <div class="bot">Helpline: ${HELPLINE}</div>
  </div>`;
  return pageDocument(
    `Director ID Card — ${branch.name ?? ""}`,
    "size:85.6mm 54mm;margin:0",
    body,
    `.card{width:85.6mm;height:54mm;overflow:hidden;display:flex;flex-direction:column;border:1px solid #173653;border-radius:3mm}
     .top{display:flex;align-items:center;gap:2mm;background:#173653;color:#fff;padding:1.5mm 2.5mm}
     .top b{display:block;font-size:8.5pt;text-transform:uppercase;line-height:1.1}
     .top small{font-size:6pt;color:#c7ff2f}
     .mid{flex:1;display:flex;gap:2.5mm;padding:2mm 2.5mm}
     .ph{width:20mm;height:24mm;border:1px solid #173653;display:flex;align-items:center;justify-content:center;font-size:6pt;color:#777;overflow:hidden}
     .ph img{width:100%;height:100%;object-fit:cover}
     .info{flex:1;font-size:6.5pt;line-height:1.35}
     .info p{margin:0}
     .info .nm{font-size:9pt;font-weight:bold;color:#173653}
     .info .role{font-size:6.5pt;color:#b91c1c;font-weight:bold;margin-bottom:1mm}
     .info span{display:inline-block;width:14mm;color:#555}
     .bot{background:#38c3be;color:#fff;text-align:center;font-size:6.5pt;font-weight:bold;padding:1mm}`,
  );
}

/* --------------------------------------------------------- Promotional banner */

function bannerHtml({ branch, institute, logo, courses }: Ctx) {
  const list = courses.length ? courses : ["Basic Computer Course", "Tally & Accounting", "Programming"];
  const body = `
  <div class="banner">
    <div class="head">${logoTag(logo, 110)}<div><h1>${esc(institute)}</h1><p>${esc(COMPANY_NAME)}</p></div></div>
    <div class="open">ADMISSION OPEN</div>
    <h2>${esc(branch.name)}</h2>
    ${branch.code ? `<p class="code">Authorised Centre Code: ${esc(branch.code)}</p>` : ""}
    <h3>Our Courses</h3>
    <ul>${list.slice(0, 16).map((c) => `<li>${esc(c)}</li>`).join("")}</ul>
    <div class="feat"><span>Govt. Recognised Certificate</span><span>Practical Lab</span><span>Expert Faculty</span></div>
    <div class="contact">
      <p class="ph">Call: ${esc(branch.phone || HELPLINE)}</p>
      <p>${esc(addressOf(branch))}</p>
    </div>
  </div>`;
  return pageDocument(
    `Admission Banner — ${branch.name ?? ""}`,
    "size:A4 portrait;margin:0",
    body,
    `.banner{width:210mm;height:297mm;padding:14mm;background:linear-gradient(160deg,#173653 0%,#1f4f7a 55%,#38c3be 100%);color:#fff;text-align:center;display:flex;flex-direction:column}
     .head{display:flex;align-items:center;justify-content:center;gap:16px}
     .head img{background:#fff;border-radius:16px;padding:6px}
     h1{margin:0;font-size:30pt;text-transform:uppercase;line-height:1.05;color:#c7ff2f}
     .head p{margin:4px 0 0;font-size:11pt;opacity:.9}
     .open{margin:12mm auto 6mm;background:#f26b6b;font-size:40pt;font-weight:900;padding:4mm 12mm;border-radius:6mm;transform:rotate(-2deg);box-shadow:0 4px 0 rgba(0,0,0,.25)}
     h2{margin:2mm 0;font-size:26pt}
     .code{margin:0;font-size:12pt;opacity:.9}
     h3{margin:9mm 0 3mm;font-size:18pt;color:#c7ff2f;text-transform:uppercase;letter-spacing:.1em}
     ul{list-style:none;margin:0 auto;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:3mm 8mm;width:85%;text-align:left;font-size:14pt}
     li::before{content:"✔ ";color:#c7ff2f}
     .feat{display:flex;justify-content:center;gap:5mm;margin-top:auto;font-size:11pt}
     .feat span{border:1.5px solid #fff;border-radius:20px;padding:2mm 4mm}
     .contact{margin-top:8mm;background:#fff;color:#173653;border-radius:5mm;padding:5mm}
     .contact p{margin:1mm 0;font-size:12pt}
     .contact .ph{font-size:24pt;font-weight:900;color:#b91c1c}`,
  );
}

/* ------------------------------------------------------------------ Page */

/** Printables a centre hands out or keeps: forms, its authorisation, the director's card and a banner. */
export default function CentreDownloads() {
  const { branchId, organizationId } = useAuth();
  const { toast } = useToast();
  const isAdmin = !branchId;
  const branches = useBranchOptions(organizationId, isAdmin);
  const [picked, setPicked] = useState("");
  const target = branchId || picked || null;

  const [ctx, setCtx] = useState<Ctx | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!target || !organizationId) {
      setCtx(null);
      return;
    }
    let live = true;
    setLoading(true);
    Promise.all([
      getBranchDetails(organizationId, target).then((r) => r.data as BranchDetails),
      loadInstituteName(target),
      loadInstituteLogo(target),
      getCourses(organizationId, target).then((r) => (r.data || []).map((c) => String(c.name || "")).filter(Boolean)).catch(() => [] as string[]),
    ])
      .then(([branch, institute, logo, courses]) => live && setCtx({ branch, institute, logo, courses }))
      .catch((error) => {
        if (!live) return;
        setCtx(null);
        toast({ title: "Could not load the centre", description: (error as Error).message, variant: "destructive" });
      })
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [target, organizationId, toast]);

  const open = (html: string) => {
    if (!printInWindow(html)) toast({ title: "Allow pop-ups to print", description: "The browser blocked the print window.", variant: "destructive" });
  };

  const printAuthorization = async () => {
    if (!ctx || !target) return;
    try {
      // The centre's assigned design when the office gave it one, else the standard layout.
      const assigned = await loadAssignedBranchDocuments(organizationId, target);
      const designed = assigned.find((d) => d.kind === "centre-certificate");
      if (designed) {
        const html = await branchDocumentHtml(designed.kind, designed.design, branchTokens(ctx.branch, ctx.institute));
        printBranchDocument(designed.kind, `Authorization Letter — ${ctx.branch.name ?? ""}`, html, designed.design);
      } else {
        printStandardCentreCertificate(ctx.branch, ctx.institute);
      }
    } catch (error) {
      toast({ title: "Could not print the authorization letter", description: (error as Error).message, variant: "destructive" });
    }
  };

  const slug = String(ctx?.branch.code || ctx?.branch.name || "centre").replace(/[^a-z0-9]+/gi, "-");

  const cards: Array<{ title: string; text: string; actions: React.ReactNode }> = ctx
    ? [
        {
          title: "Admission Form",
          text: "A blank admission form with the centre's details, photo box and signature lines.",
          actions: <DceButton onClick={() => open(admissionFormHtml(ctx))}>Print</DceButton>,
        },
        {
          title: "Authorization Letter",
          text: "The centre's authorisation certificate from the head office.",
          actions: (
            <>
              <DceButton onClick={() => void printAuthorization()}>Print</DceButton>
              <DceLinkButton to="/certificate/centre" tone="light">Open</DceLinkButton>
            </>
          ),
        },
        {
          title: "Franchise Director ID Card",
          text: "A CR80-size identity card for the centre director.",
          actions: <DceButton onClick={() => open(idCardHtml(ctx))}>Print</DceButton>,
        },
        {
          title: "Promotional Banner",
          text: "An A4 \"Admission Open\" banner with the centre's courses and phone number.",
          actions: (
            <>
              <DceButton onClick={() => open(bannerHtml(ctx))}>Print</DceButton>
              <DceButton tone="green" onClick={() => download(`admission-banner-${slug}.html`, bannerHtml(ctx))}>Download</DceButton>
            </>
          ),
        },
      ]
    : [];

  return (
    <AppLayout>
      <DcePanel title="Downloads">
        {isAdmin && (
          <div className="mb-4 max-w-xs">
            <DceSelect value={picked} onChange={(e) => setPicked(e.target.value)} aria-label="Branch">
              <option value="">Choose a branch</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </DceSelect>
          </div>
        )}
        {!target ? (
          <p className="text-[13px] text-slate-500">Choose a branch to print its documents.</p>
        ) : loading || !ctx ? (
          <p className="text-[13px] text-slate-500">{loading ? "Loading…" : "Centre details are not available."}</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => (
              <div key={card.title} className="flex flex-col rounded border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-[14px] font-bold text-slate-800">{card.title}</h3>
                <p className="mb-4 mt-1 flex-1 text-[12.5px] text-slate-600">{card.text}</p>
                <div className="flex flex-wrap gap-2">{card.actions}</div>
              </div>
            ))}
          </div>
        )}
      </DcePanel>
    </AppLayout>
  );
}
