import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import WhatsappWidget from "../components/WhatsappWidget";
import { BRAND, REGISTRATIONS } from "../components/brand";
import js_c1268ab4 from "../behaviour/c1268ab4.js?raw";
import js_places from "../behaviour/place-pickers.js?raw";
import { INDIAN_STATES, DISTRICTS_BY_STATE } from "../../src/data/indianStates";
import { BIHAR_BLOCKS } from "../../src/data/biharBlocks";

/**
 * franchise.html — what a centre gets from the academy, what it needs, and
 * the application.
 *
 * The form needs no script of its own: public/apply.js (loaded by cms.js)
 * takes over any form with a mobile number and, on this page, files it as a
 * franchise application in the head office's Branch Lead Management. It
 * recognises the boxes by their labels, so keep the labels plain.
 *
 * Only what the academy actually provides is promised here: the centre
 * panel, QR-verified certificates and each centre's own website are all
 * part of the ERP. Fees and terms are left to the written agreement.
 */

/** The lists the place pickers narrow from, handed to the browser script. */
const PLACES_JSON = JSON.stringify({ districts: DISTRICTS_BY_STATE, blocks: { Bihar: BIHAR_BLOCKS } }).replace(/</g, "\\u003c");

const GET = [
  { icon: "badge-check", title: "A recognised name", text: "Teach under an MCA-registered, ISO 9001:2015 certified and MSME-registered academy — your students' certificates carry that name." },
  { icon: "qr-code", title: "QR-verified certificates", text: "Marksheets and certificates issued by the head office, each with a QR code anyone can check on our website." },
  { icon: "layout-dashboard", title: "Your own centre panel", text: "Admissions, fees and receipts, attendance, exams, results, ID cards and admit cards — all online, from one login." },
  { icon: "globe", title: "Your own website", text: "A ready website for your centre with your courses, photos and an admission form. Bring your own domain if you have one." },
  { icon: "book-open", title: "Courses and syllabus", text: "A ready course list with syllabus, duration and exam pattern, so you can start admissions from day one." },
  { icon: "headset", title: "Head-office support", text: "Help with setup, the panel, exams and certificates, by phone, WhatsApp and the support desk in your panel." },
];

const COURSES = [
  { icon: "monitor", title: "Certified Computer Courses", text: "DCA, ADCA, Basic Computer, MS Office" },
  { icon: "receipt-indian-rupee", title: "Accounting & Taxation", text: "Tally Prime, GST, Busy" },
  { icon: "keyboard", title: "Typing & Stenography", text: "Hindi & English typing" },
  { icon: "palette", title: "Graphic Design", text: "Photoshop, CorelDRAW, Canva" },
  { icon: "code", title: "Programming", text: "C, Python, Java" },
  { icon: "layout-template", title: "Web Development", text: "HTML, CSS, JavaScript, React" },
  { icon: "sparkles", title: "AI Foundation", text: "AI tools and prompting" },
  { icon: "megaphone", title: "Digital Marketing", text: "SEO and social media" },
  { icon: "message-circle", title: "Spoken English", text: "Personality development" },
];

const NEEDS = [
  { icon: "monitor", title: "6 computers / laptops", text: "At least six in working order." },
  { icon: "ruler", title: "250 sq. ft. area", text: "Minimum space for the lab and a class." },
  { icon: "wifi", title: "Internet", text: "A working broadband or Wi-Fi connection." },
  { icon: "printer", title: "Printer & scanner", text: "For receipts, forms and documents." },
  { icon: "presentation", title: "White & notice board", text: "For the classroom and notices." },
  { icon: "glass-water", title: "Drinking water", text: "Clean drinking water for students." },
  { icon: "cross", title: "First-aid kit", text: "A basic first-aid box." },
  { icon: "bath", title: "Washroom", text: "A clean, usable washroom." },
];

const DOCS = [
  ["Recent photo of the centre head", "Passport-size or a clear profile photo."],
  ["Signature of the centre head", "A clear scan on white paper."],
  ["Aadhaar card", "Front and back of the centre head's Aadhaar."],
  ["Educational qualification", "DCA, ADCA, CCC, ITI, PGDCA, graduation or equivalent."],
  ["Registration certificate", "MSME / Udyam, society, trust, shop licence, Pvt. Ltd. or LLP — whichever you have."],
  ["Photos of the institute", "At least four: the front, the lab, the classroom and the reception."],
];

const STEPS = [
  ["Apply online", "Fill in the form below. It reaches the head office at once."],
  ["Call from our team", "We call you to talk about your city, your space and the courses you want to run."],
  ["Documents & visit", "You share the documents; we check the centre, in person or on a video call."],
  ["Agreement & launch", "Sign the agreement, get your centre code, panel login and website, and start admissions."],
];

const WHO = [
  { icon: "school", title: "Running computer centres", text: "Add a recognised name and certificates to the centre you already run." },
  { icon: "graduation-cap", title: "Teachers & trainers", text: "Start a centre of your own around the subjects you teach." },
  { icon: "briefcase", title: "Entrepreneurs", text: "Start an education business with a ready course list and panel." },
  { icon: "building-2", title: "Coaching & schools", text: "Add computer courses for your own students." },
];

const FAQ = [
  ["Who can apply?", "Anyone who can meet the centre requirements above — an existing computer centre, a teacher, a coaching institute, a school or an entrepreneur."],
  ["What does a franchise cost?", "It depends on your city and the courses you want to run. Our team shares the full fee and terms on the call; everything is written in the franchise agreement before you pay anything."],
  ["Who issues the certificates?", `${BRAND.name} issues every marksheet and certificate from the head office. Each one has a QR code that opens its record on our website.`],
  ["How will I manage students and fees?", "From your own centre panel: admissions, fee receipts, attendance, exams, results, ID cards and admit cards are all online."],
  ["Will my centre get its own website?", "Yes. Every centre gets a website with its courses, photos, contact details and an admission form, and can connect its own domain."],
  ["Is any income guaranteed?", "No. Admissions and earnings depend on your location, effort, fees and local demand. We do not promise any fixed income or return."],
];

const BUDGETS = ["Below ₹1 lakh", "₹1 – 2 lakh", "₹2 – 5 lakh", "Above ₹5 lakh", "I want to discuss"];

const CSS = `
:root{--fr-navy:#0b2350;--fr-navy2:#132f6b;--fr-orange:#f97316;--fr-ink:#1e293b;--fr-muted:#64748b;--fr-line:#e2e8f0;--fr-soft:#f5f8ff}
body{margin:0;background:#fff;color:var(--fr-ink);font-family:Poppins,system-ui,sans-serif}
.fr-wrap{max-width:1180px;margin:0 auto;padding:0 16px}
.fr-sec{padding:72px 0}
.fr-sec.alt{background:var(--fr-soft)}
.fr-kicker{display:inline-block;color:var(--fr-orange);font-weight:700;font-size:13px;letter-spacing:.14em;text-transform:uppercase;margin-bottom:8px}
.fr-h2{font-size:clamp(26px,3.2vw,36px);font-weight:800;color:var(--fr-navy);margin:0 0 12px;line-height:1.2}
.fr-lead{color:var(--fr-muted);font-size:16px;line-height:1.7;margin:0;max-width:680px}
.fr-head{text-align:center;margin-bottom:40px}.fr-head .fr-lead{margin:0 auto}
.fr-btn{display:inline-flex;align-items:center;gap:8px;padding:13px 24px;border-radius:10px;font-weight:700;font-size:15px;text-decoration:none;border:0;cursor:pointer;transition:.2s}
.fr-btn svg{width:18px;height:18px}
.fr-btn.pri{background:var(--fr-orange);color:#fff;box-shadow:0 10px 24px rgba(249,115,22,.3)}.fr-btn.pri:hover{background:#ea580c}
.fr-btn.ghost{background:rgba(255,255,255,.08);color:#fff;border:1px solid rgba(255,255,255,.25)}.fr-btn.ghost:hover{background:rgba(255,255,255,.16)}

.fr-hero{background:linear-gradient(135deg,#0b2350 0%,#132f6b 60%,#1e3a8a 100%);color:#fff;position:relative;overflow:hidden}
.fr-hero::after{content:"";position:absolute;right:-140px;top:-140px;width:420px;height:420px;border-radius:50%;background:rgba(249,115,22,.16)}
.fr-hero .fr-wrap{display:grid;grid-template-columns:1.15fr .85fr;gap:48px;align-items:center;padding-top:72px;padding-bottom:72px;position:relative;z-index:1}
.fr-pill{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);padding:7px 14px;border-radius:999px;font-size:13px;font-weight:600}
.fr-pill i{width:8px;height:8px;border-radius:50%;background:#22c55e;box-shadow:0 0 0 4px rgba(34,197,94,.25)}
.fr-hero h1{font-size:clamp(30px,4.4vw,50px);line-height:1.12;font-weight:800;margin:18px 0 16px}
.fr-hero h1 span{color:#fdba74}
.fr-hero p.fr-sub{color:#d6e0fa;font-size:17px;line-height:1.7;margin:0 0 28px;max-width:560px}
.fr-cta{display:flex;flex-wrap:wrap;gap:12px}
.fr-trust{display:flex;flex-wrap:wrap;gap:10px 22px;margin-top:30px;color:#c7d2ec;font-size:13.5px}
.fr-trust span{display:inline-flex;align-items:center;gap:7px}.fr-trust svg{width:17px;height:17px;color:#fdba74}
.fr-card{background:#fff;color:var(--fr-ink);border-radius:18px;padding:26px;box-shadow:0 30px 60px rgba(0,0,0,.25)}
.fr-card h3{margin:0 0 4px;color:var(--fr-navy);font-size:18px;font-weight:800}
.fr-card>p{margin:0 0 18px;color:var(--fr-muted);font-size:14px}
.fr-card ul{list-style:none;margin:0;padding:0;display:grid;gap:12px}
.fr-card li{display:flex;gap:12px;align-items:flex-start;font-size:14.5px;line-height:1.5}
.fr-card li b{display:block;color:var(--fr-navy)}
.fr-card li small{color:var(--fr-muted);font-size:13px}
.fr-ic{flex-shrink:0;width:40px;height:40px;border-radius:10px;display:grid;place-items:center;background:#fff4ec;color:#ea580c}
.fr-ic svg{width:20px;height:20px}

.fr-grid{display:grid;gap:20px}
.fr-g3{grid-template-columns:repeat(3,1fr)}.fr-g4{grid-template-columns:repeat(4,1fr)}
.fr-box{background:#fff;border:1px solid var(--fr-line);border-radius:16px;padding:24px;transition:.2s}
.fr-box:hover{border-color:#fdba74;box-shadow:0 14px 34px rgba(11,35,80,.08);transform:translateY(-2px)}
.fr-box h3{margin:14px 0 6px;font-size:17px;font-weight:700;color:var(--fr-navy)}
.fr-box p{margin:0;color:var(--fr-muted);font-size:14.5px;line-height:1.65}
.fr-course{display:flex;gap:14px;align-items:center;background:#fff;border:1px solid var(--fr-line);border-radius:14px;padding:16px}
.fr-course b{display:block;color:var(--fr-navy);font-size:15px}.fr-course small{color:var(--fr-muted);font-size:13px}

.fr-reg{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:28px}
.fr-reg div{background:#fff;border:1px solid var(--fr-line);border-left:4px solid var(--fr-orange);border-radius:12px;padding:16px}
.fr-reg b{display:block;color:var(--fr-navy);font-size:14.5px}
.fr-reg span{display:block;color:var(--fr-muted);font-size:12.5px;margin:2px 0 8px}
.fr-reg code{font:600 13px ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--fr-ink);overflow-wrap:anywhere}

.fr-dark{background:var(--fr-navy);color:#fff}
.fr-dark .fr-h2{color:#fff}.fr-dark .fr-lead{color:#c7d2ec}
.fr-need{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:20px}
.fr-need .fr-ic{background:rgba(249,115,22,.16);color:#fdba74}
.fr-need h3{margin:12px 0 4px;font-size:16px;font-weight:700}.fr-need p{margin:0;color:#c7d2ec;font-size:14px}

.fr-docs{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;counter-reset:doc}
.fr-doc{display:flex;gap:14px;background:#fff;border:1px solid var(--fr-line);border-radius:14px;padding:18px}
.fr-doc::before{counter-increment:doc;content:counter(doc,decimal-leading-zero);flex-shrink:0;width:40px;height:40px;border-radius:10px;background:var(--fr-navy);color:#fff;display:grid;place-items:center;font-weight:800;font-size:14px}
.fr-doc b{display:block;color:var(--fr-navy);font-size:15px}.fr-doc span{color:var(--fr-muted);font-size:13.5px}
.fr-note{margin-top:18px;color:var(--fr-muted);font-size:13.5px;text-align:center}

.fr-steps{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;counter-reset:step}
.fr-step{position:relative;background:#fff;border:1px solid var(--fr-line);border-radius:16px;padding:26px 22px 22px}
.fr-step::before{counter-increment:step;content:counter(step);position:absolute;top:-18px;left:22px;width:36px;height:36px;border-radius:50%;background:var(--fr-orange);color:#fff;display:grid;place-items:center;font-weight:800;box-shadow:0 6px 14px rgba(249,115,22,.35)}
.fr-step h3{margin:8px 0 6px;color:var(--fr-navy);font-size:16.5px;font-weight:700}.fr-step p{margin:0;color:var(--fr-muted);font-size:14px;line-height:1.6}

.fr-faq{max-width:860px;margin:0 auto;display:grid;gap:12px}
.fr-faq details{background:#fff;border:1px solid var(--fr-line);border-radius:12px;padding:0 20px}
.fr-faq summary{cursor:pointer;list-style:none;padding:18px 0;font-weight:700;color:var(--fr-navy);display:flex;justify-content:space-between;gap:12px}
.fr-faq summary::-webkit-details-marker{display:none}
.fr-faq summary::after{content:"+";color:var(--fr-orange);font-size:22px;line-height:1}
.fr-faq details[open] summary::after{content:"–"}
.fr-faq details p{margin:0 0 18px;color:var(--fr-muted);line-height:1.7;font-size:15px}

.fr-apply{display:grid;grid-template-columns:.8fr 1.2fr;gap:36px;align-items:start}
.fr-side h2{color:#fff}
.fr-side ul{list-style:none;margin:24px 0 0;padding:0;display:grid;gap:14px}
.fr-side li{display:flex;gap:12px;align-items:flex-start;color:#d6e0fa;font-size:14.5px;line-height:1.55}
.fr-side li svg{width:20px;height:20px;color:#fdba74;flex-shrink:0;margin-top:2px}
.fr-call{margin-top:26px;padding:18px;border-radius:14px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14)}
.fr-call small{display:block;color:#c7d2ec;font-size:13px}.fr-call a{color:#fff;font-weight:800;font-size:20px;text-decoration:none}
.fr-form{background:#fff;color:var(--fr-ink);border-radius:18px;padding:28px;box-shadow:0 30px 60px rgba(0,0,0,.25)}
.fr-form h3{margin:0 0 4px;color:var(--fr-navy);font-size:20px;font-weight:800}
.fr-form>p{margin:0 0 20px;color:var(--fr-muted);font-size:14px}
.fr-fields{display:grid;grid-template-columns:1fr 1fr;gap:14px 16px}
.fr-f{display:flex;flex-direction:column;gap:6px;min-width:0}
.fr-f.full{grid-column:1/-1}
.fr-f label{font-size:13.5px;font-weight:600;color:var(--fr-navy)}
.fr-f label em{color:#dc2626;font-style:normal}
.fr-f input,.fr-f select,.fr-f textarea{width:100%;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:10px;padding:11px 13px;font:inherit;font-size:14.5px;color:var(--fr-ink);background:#fff;outline:none;transition:.15s}
.fr-f input:focus,.fr-f select:focus,.fr-f textarea:focus{border-color:var(--fr-orange);box-shadow:0 0 0 3px rgba(249,115,22,.15)}
.fr-f select:disabled{background:#f1f5f9;color:#94a3b8}
.fr-agree{grid-column:1/-1;display:flex;gap:10px;align-items:flex-start;font-size:13.5px;color:var(--fr-muted);line-height:1.55}
.fr-agree input{margin-top:3px;width:16px;height:16px;accent-color:var(--fr-orange)}
.fr-form .fr-btn{width:100%;justify-content:center;margin-top:18px;font-size:16px;padding:15px}

@media (max-width:980px){.fr-hero .fr-wrap,.fr-apply{grid-template-columns:1fr}.fr-g3,.fr-reg{grid-template-columns:repeat(2,1fr)}.fr-g4,.fr-steps{grid-template-columns:repeat(2,1fr)}.fr-steps{row-gap:34px}}
@media (max-width:640px){.fr-sec{padding:52px 0}.fr-g3,.fr-g4,.fr-reg,.fr-docs,.fr-fields,.fr-steps{grid-template-columns:1fr}.fr-hero .fr-wrap{padding-top:48px;padding-bottom:52px}.fr-form,.fr-card{padding:20px}.fr-cta .fr-btn{flex:1;justify-content:center}}
`;

const Ic = ({ name }: { name: string }) => (
  <span className="fr-ic">
    <i data-lucide={name}></i>
  </span>
);

export default function Franchise() {
  return (
    <html lang="en">
      <head>
        <script src="/cms-config.js"></script>
        <script src="/cms.js" defer></script>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{`Franchise | Open a ${BRAND.name} Centre`}</title>
        <meta
          name="description"
          content={`Open an authorised study centre of ${BRAND.name}: recognised certificates with QR verification, your own centre panel and website, and head-office support. Apply online.`}
        />
        <link rel="icon" href="/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href={"https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap"} rel="stylesheet" />
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://unpkg.com/lucide@latest"></script>
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
      </head>
      <body>
        <SiteHeader />

        <section className="fr-hero">
          <div className="fr-wrap">
            <div>
              <span className="fr-pill">
                <i></i> Franchise applications open
              </span>
              <h1>
                Open your own <span>{BRAND.short}</span> computer centre
              </h1>
              <p className="fr-sub">
                Run recognised computer courses in your town with certificates from {BRAND.name}, your own online
                centre panel and website, and support from our head office in Ara, Bhojpur.
              </p>
              <div className="fr-cta">
                <a className="fr-btn pri" href="#franchise">
                  Apply for franchise <i data-lucide="arrow-right"></i>
                </a>
                <a className="fr-btn ghost" href="/downloads/career-optics-franchise-proposal.pdf" download>
                  <i data-lucide="download"></i> Download proposal (PDF)
                </a>
                <a className="fr-btn ghost" href={`tel:+${BRAND.phoneIntl}`}>
                  <i data-lucide="phone"></i> Call {BRAND.phone}
                </a>
              </div>
              <div className="fr-trust">
                <span><i data-lucide="landmark"></i> MCA registered company</span>
                <span><i data-lucide="badge-check"></i> ISO 9001:2015 certified</span>
                <span><i data-lucide="factory"></i> MSME Udyam registered</span>
              </div>
            </div>

            <div className="fr-card">
              <h3>Every centre gets</h3>
              <p>From the day your centre is approved.</p>
              <ul>
                <li><Ic name="key-round" /><span><b>Centre code & panel login</b><small>Admissions, fees, exams and results online</small></span></li>
                <li><Ic name="award" /><span><b>Certificates from the head office</b><small>With a QR code anyone can verify</small></span></li>
                <li><Ic name="globe" /><span><b>A website for your centre</b><small>Your courses, photos and admission form</small></span></li>
                <li><Ic name="id-card" /><span><b>ID cards & admit cards</b><small>Printed from your panel, with photo</small></span></li>
              </ul>
            </div>
          </div>
        </section>

        <section className="fr-sec">
          <div className="fr-wrap">
            <div className="fr-head">
              <span className="fr-kicker">Why partner with us</span>
              <h2 className="fr-h2">Everything a centre needs, in one place</h2>
              <p className="fr-lead">You teach and grow your admissions. We give you the name, the courses, the certificates and the software to run it.</p>
            </div>
            <div className="fr-grid fr-g3">
              {GET.map((g) => (
                <div className="fr-box" key={g.title}>
                  <Ic name={g.icon} />
                  <h3>{g.title}</h3>
                  <p>{g.text}</p>
                </div>
              ))}
            </div>

            <div className="fr-reg">
              {REGISTRATIONS.map((r) => (
                <div key={r.file}>
                  <b>{r.title}</b>
                  <span>{r.authority}</span>
                  <code>{r.label}: {r.value}</code>
                </div>
              ))}
            </div>
            <p className="fr-note">
              See the certificates on our <a href="certification.html" style={{ color: "#ea580c", fontWeight: 600 }}>Certification</a> page.
            </p>
          </div>
        </section>

        <section className="fr-sec alt">
          <div className="fr-wrap">
            <div className="fr-head">
              <span className="fr-kicker">Courses</span>
              <h2 className="fr-h2">Courses your centre can run</h2>
              <p className="fr-lead">Start with the courses your town asks for and add more as you grow.</p>
            </div>
            <div className="fr-grid fr-g3">
              {COURSES.map((c) => (
                <div className="fr-course" key={c.title}>
                  <Ic name={c.icon} />
                  <span><b>{c.title}</b><small>{c.text}</small></span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="fr-sec fr-dark" id="requirements">
          <div className="fr-wrap">
            <div className="fr-head">
              <span className="fr-kicker">Requirements</span>
              <h2 className="fr-h2">What your centre needs</h2>
              <p className="fr-lead">The minimum we check before a centre is approved.</p>
            </div>
            <div className="fr-grid fr-g4">
              {NEEDS.map((n) => (
                <div className="fr-need" key={n.title}>
                  <Ic name={n.icon} />
                  <h3>{n.title}</h3>
                  <p>{n.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="fr-sec" id="documents">
          <div className="fr-wrap">
            <div className="fr-head">
              <span className="fr-kicker">Documents</span>
              <h2 className="fr-h2">Keep these documents ready</h2>
              <p className="fr-lead">You do not need them to apply — our team asks for them after the first call.</p>
            </div>
            <div className="fr-docs">
              {DOCS.map(([title, text]) => (
                <div className="fr-doc" key={title}>
                  <span><b>{title}</b><span>{text}</span></span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="fr-sec alt">
          <div className="fr-wrap">
            <div className="fr-head">
              <span className="fr-kicker">How it works</span>
              <h2 className="fr-h2">Four steps to your own centre</h2>
            </div>
            <div className="fr-steps">
              {STEPS.map(([title, text]) => (
                <div className="fr-step" key={title}>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              ))}
            </div>

            <div className="fr-head" style={{ marginTop: 64 }}>
              <span className="fr-kicker">Who can apply</span>
              <h2 className="fr-h2">Made for people who teach</h2>
            </div>
            <div className="fr-grid fr-g4">
              {WHO.map((w) => (
                <div className="fr-box" key={w.title}>
                  <Ic name={w.icon} />
                  <h3>{w.title}</h3>
                  <p>{w.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="fr-sec fr-dark" id="franchise">
          <div className="fr-wrap fr-apply">
            <div className="fr-side">
              <span className="fr-kicker">Apply now</span>
              <h2 className="fr-h2">Apply for a franchise</h2>
              <p className="fr-lead">Takes two minutes. Your application reaches our head office straight away, and our team calls you back.</p>
              <ul>
                <li><i data-lucide="circle-check"></i>No documents or payment needed to apply</li>
                <li><i data-lucide="circle-check"></i>Fees and terms explained on the call, in writing before you sign</li>
                <li><i data-lucide="circle-check"></i>Your details are used only to contact you about the franchise</li>
              </ul>
              <div className="fr-call">
                <small>Prefer to talk first?</small>
                <a href={`tel:+${BRAND.phoneIntl}`}>+91 {BRAND.phone}</a>
              </div>
            </div>

            <form className="fr-form" id="franchiseForm" noValidate={false}>
              <h3>Franchise application</h3>
              <p>Fields marked <em style={{ color: "#dc2626", fontStyle: "normal" }}>*</em> are required.</p>
              <div className="fr-fields">
                <div className="fr-f">
                  <label htmlFor="frName">Full name <em>*</em></label>
                  <input id="frName" name="name" type="text" autoComplete="name" required maxLength={120} />
                </div>
                <div className="fr-f">
                  <label htmlFor="frPhone">Mobile number <em>*</em></label>
                  <input id="frPhone" name="phone" type="tel" inputMode="numeric" autoComplete="tel" required pattern="[6-9][0-9]{9}" maxLength={10} placeholder="10-digit mobile" title="Enter a 10-digit mobile number" />
                </div>
                <div className="fr-f">
                  <label htmlFor="frEmail">Email</label>
                  <input id="frEmail" name="email" type="email" autoComplete="email" maxLength={120} />
                </div>
                <div className="fr-f">
                  <label htmlFor="frInstitute">Institute name (if you run one)</label>
                  <input id="frInstitute" name="institute" type="text" maxLength={160} />
                </div>
                <div className="fr-f">
                  <label htmlFor="frState">State <em>*</em></label>
                  <select id="frState" name="state" data-place="state" required defaultValue="">
                    <option value="" disabled>Select state</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="fr-f">
                  <label htmlFor="frDistrict">District <em>*</em></label>
                  <select id="frDistrict" name="district" data-place="district" required defaultValue="" disabled>
                    <option value="" disabled>Select state first</option>
                  </select>
                </div>
                <div className="fr-f">
                  <label htmlFor="frBlock">Block</label>
                  <select id="frBlock" name="block" data-place="block" defaultValue="" disabled>
                    <option value="" disabled>Select district first</option>
                  </select>
                  <input type="text" name="block" data-place="block-other" placeholder="Type the block" aria-label="Block" hidden disabled />
                </div>
                <div className="fr-f">
                  <label htmlFor="frCity">City / town <em>*</em></label>
                  <input id="frCity" name="city" type="text" required maxLength={80} />
                </div>
                <div className="fr-f">
                  <label htmlFor="frPin">PIN code</label>
                  <input id="frPin" name="pincode" type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} title="Enter a 6-digit PIN code" />
                </div>
                <div className="fr-f">
                  <label htmlFor="frPcs">Number of computers</label>
                  <input id="frPcs" name="computers" type="number" min={0} max={500} inputMode="numeric" />
                </div>
                <div className="fr-f">
                  <label htmlFor="frStaff">Teachers / staff</label>
                  <input id="frStaff" name="staff" type="number" min={0} max={200} inputMode="numeric" />
                </div>
                <div className="fr-f">
                  <label htmlFor="frBudget">Investment budget</label>
                  <select id="frBudget" name="investment" defaultValue="">
                    <option value="">Select</option>
                    {BUDGETS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div className="fr-f full">
                  <label htmlFor="frAddress">Centre address</label>
                  <input id="frAddress" name="address" type="text" maxLength={300} placeholder="Where the centre is or will be" />
                </div>
                <div className="fr-f full">
                  <label htmlFor="frMsg">Message</label>
                  <textarea id="frMsg" name="message" rows={3} maxLength={800} placeholder="Anything you want us to know"></textarea>
                </div>
                <label className="fr-agree">
                  <input type="checkbox" name="agree" required />
                  <span>I agree to be contacted by {BRAND.name} by call, SMS or WhatsApp about this application.</span>
                </label>
              </div>
              <button type="submit" className="fr-btn pri">
                Submit application <i data-lucide="send"></i>
              </button>
            </form>
          </div>
        </section>

        <section className="fr-sec">
          <div className="fr-wrap">
            <div className="fr-head">
              <span className="fr-kicker">FAQ</span>
              <h2 className="fr-h2">Questions centres ask us</h2>
            </div>
            <div className="fr-faq">
              {FAQ.map(([q, a], i) => (
                <details key={q} open={i === 0}>
                  <summary>{q}</summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <SiteFooter />
        <WhatsappWidget />
        <script id="place-data" type="application/json" dangerouslySetInnerHTML={{ __html: PLACES_JSON }} />
        <script dangerouslySetInnerHTML={{ __html: js_places }} />
        <script dangerouslySetInnerHTML={{ __html: js_c1268ab4 }} />
        <script dangerouslySetInnerHTML={{ __html: `document.addEventListener("DOMContentLoaded",function(){if(window.lucide)lucide.createIcons()});` }} />
      </body>
    </html>
  );
}
