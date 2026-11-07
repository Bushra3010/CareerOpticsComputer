import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import WhatsappWidget from "../components/WhatsappWidget";
import { BRAND, REGISTRATIONS } from "../components/brand";
import js_c1268ab4 from "../behaviour/c1268ab4.js?raw";
import js_gallery from "../behaviour/gallery.js?raw";
import css_gallery from "../styles/gallery.css?raw";

/**
 * gallery.html — what the academy issues and how it is paid, then photos.
 *
 * The first sections are written here: sample copies of every document a
 * student or centre receives (rendered from the ERP's own designs with
 * sample data), the company's registrations, a franchise card and the
 * official bank account with its Scan & Pay poster. The photo wall at the
 * end is managed from the ERP (Main Website → Gallery) and fetched in the
 * browser by behaviour/gallery.js, which also runs the lightbox for every
 * tile on the page.
 */

/** The official account every fee is paid into. One edit here changes the page and the copy buttons. */
const ACCOUNT = {
  holder: "CAREER OPTICS EDUCATION SERVICE PVT LTD",
  number: "50200121129272",
  ifsc: "HDFC0001942",
  bank: "HDFC Bank",
  branch: "Arrah",
  type: "Current Account",
};

const DOCUMENTS = [
  { file: "sample-certificate", title: "Course Completion Certificate", text: "Issued on completing a course, with a QR code anyone can scan to verify it.", tag: "Student" },
  { file: "sample-marksheet", title: "Statement of Marks", text: "Subject-wise theory and practical marks, grade and result for every exam.", tag: "Student" },
  { file: "sample-typing-certificate", title: "Computer Typing Certificate", text: "Typing speed in English and Hindi with accuracy, issued on completing a typing course.", tag: "Student" },
  { file: "sample-admit-card", title: "Examination Admit Card", text: "Roll number, exam centre and the paper-wise schedule, on the academy's letterhead.", tag: "Student" },
  { file: "sample-student-id-card", title: "Student Identity Card", text: "Front and back of the card every enrolled student carries, with a verification QR.", tag: "Student" },
  { file: "sample-verification-letter", title: "Education Verification Letter", text: "For an employer or office that asks us to confirm a student's course and enrolment.", tag: "Student" },
  { file: "sample-franchise-licence", title: "Franchise Partner Licence", text: "Names a centre an authorised study centre of the academy, with its centre code.", tag: "Franchise" },
  { file: "sample-staff-id-card", title: "Centre Director ID Card", text: "The identity card issued to the director and faculty of every authorised centre.", tag: "Franchise" },
];

const FRANCHISE_POINTS = [
  "Zero royalty — the centre keeps its course fees",
  "Franchise partner licence and centre code",
  "Your own website at careeropticscomputer.in",
  "ERP for admissions, fees, exams and certificates",
  "Certificates and marksheets verifiable online",
  "Complete syllabus and study material for 8 courses",
  "ID cards for students, director and staff",
  "Training and support from the head office",
];

const CSS = `
*{box-sizing:border-box}
body{margin:0;font-family:Poppins,system-ui,sans-serif;color:#0f172a;background:#f4f7fc}
.cc-hero{background:linear-gradient(120deg,#0b2350,#1d4ed8);color:#fff;padding:56px 16px;text-align:center}
.cc-hero h1{margin:0;font-size:clamp(28px,4vw,44px);font-weight:800}
.cc-hero p{margin:12px auto 0;max-width:720px;color:#d6e0fa;line-height:1.7}
.cc-crumb{margin-top:14px;font-size:14px;color:#fdba74}.cc-crumb a{color:#fff;text-decoration:none}
.cc-jump{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-top:22px}
.cc-jump a{color:#fff;text-decoration:none;font:600 13.5px Poppins,system-ui,sans-serif;border:1.5px solid rgba(255,255,255,.35);border-radius:999px;padding:8px 16px;transition:.18s}
.cc-jump a:hover{background:#f97316;border-color:#f97316}
.cc-wrap{max-width:1240px;margin:0 auto;padding:56px 16px}
`;

const JS = `
document.addEventListener("DOMContentLoaded",function(){
  if(window.lucide)lucide.createIcons();
  document.querySelectorAll(".cg-copy").forEach(function(b){
    b.addEventListener("click",function(){
      var v=b.getAttribute("data-copy")||"";
      var done=function(){b.textContent="Copied";b.classList.add("ok");setTimeout(function(){b.textContent="Copy";b.classList.remove("ok")},1600)};
      if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(v).then(done,function(){});
      else{var t=document.createElement("textarea");t.value=v;document.body.appendChild(t);t.select();try{document.execCommand("copy");done()}catch(e){}document.body.removeChild(t)}
    });
  });
});
`;

const Check = () => (
  <i aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  </i>
);

function DocTile({ file, title, text, tag, category }: { file: string; title: string; text: string; tag?: string; category: string }) {
  return (
    <button type="button" className="cg-doc" data-full={`/image/gallery/${file}.webp`} data-title={title} data-category={category} aria-label={`View ${title}`}>
      <span className="cg-doc-pic">
        <img src={`/image/gallery/${file}-thumb.webp`} alt={title} loading="lazy" decoding="async" />
      </span>
      <span className="cg-doc-cap">
        <b>{title}</b>
        <small>{text}</small>
        {tag ? <span className="cg-doc-tag">{tag}</span> : null}
      </span>
    </button>
  );
}

export default function Gallery() {
  return (
    <html lang="en">
      <head>
        <script src="/cms-config.js"></script>
        <script src="/cms.js" defer></script>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{`Gallery — Certificates, Documents & Payment Details | ${BRAND.name}`}</title>
        <meta
          name="description"
          content={`Sample certificate, marksheet, ID card and admit card of ${BRAND.name}, our registrations, franchise details, the official bank account for fee payment, and photos of the institute.`}
        />
        <link rel="icon" href="/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href={"https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap"} rel="stylesheet" />
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://unpkg.com/lucide@latest"></script>
        <style dangerouslySetInnerHTML={{ __html: CSS + css_gallery }} />
      </head>
      <body>
        <SiteHeader />

        <section className="cc-hero">
          <h1>Our Gallery</h1>
          <p>
            The certificates, marksheets and ID cards we issue, our government registrations, the official account for fee payment, and a look inside {BRAND.name}.
          </p>
          <div className="cc-crumb">
            <a href="index.html">Home</a> / Gallery
          </div>
          <nav className="cc-jump" aria-label="Sections on this page">
            <a href="#documents">Our Documents</a>
            <a href="#registrations">Registrations</a>
            <a href="#franchise">Franchise</a>
            <a href="#payment">Payment Details</a>
            <a href="#photos">Photos</a>
          </nav>
        </section>

        <div className="cc-wrap">
          {/* ---- Sample documents ---- */}
          <section className="cg-sec" id="documents" data-gallery-static="">
            <div className="cg-sec-head">
              <span className="cg-kicker">What we issue</span>
              <h2>
                Our <span>Certificates &amp; Documents</span>
              </h2>
              <p>
                Sample copies of every document a student or an authorised centre receives from {BRAND.short}. Each one carries a QR code and a number that can be checked on our{" "}
                <a href="verification.html" style={{ color: "#1d4ed8", fontWeight: 600 }}>
                  verification page
                </a>
                . Click a document to view it full size.
              </p>
            </div>
            <div className="cg-docs">
              {DOCUMENTS.map((d) => (
                <DocTile key={d.file} file={d.file} title={d.title} text={d.text} tag={d.tag} category="Sample document" />
              ))}
            </div>
          </section>

          {/* ---- Registrations ---- */}
          <section className="cg-sec" id="registrations" data-gallery-static="">
            <div className="cg-sec-head">
              <span className="cg-kicker">Recognised &amp; registered</span>
              <h2>
                Our <span>Registrations</span>
              </h2>
              <p>
                {BRAND.name} is run by {BRAND.company}. These are the certificates behind that — see the{" "}
                <a href="certification.html" style={{ color: "#1d4ed8", fontWeight: 600 }}>
                  certifications page
                </a>{" "}
                for the full details of each.
              </p>
            </div>
            <div className="cg-docs">
              {REGISTRATIONS.map((r) => (
                <button
                  key={r.file}
                  type="button"
                  className="cg-doc"
                  data-full={`/image/certificates/${r.file}.webp`}
                  data-title={r.title}
                  data-category={r.authority}
                  aria-label={`View ${r.title}`}
                >
                  <span className="cg-doc-pic">
                    <img src={`/image/certificates/${r.file}-thumb.webp`} alt={r.title} loading="lazy" decoding="async" />
                  </span>
                  <span className="cg-doc-cap">
                    <b>{r.title}</b>
                    <small>{r.authority}</small>
                    <span className="cg-doc-tag">
                      {r.label}: {r.value}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* ---- Franchise ---- */}
          <section className="cg-sec" id="franchise" data-gallery-static="">
            <div className="cg-sec-head">
              <span className="cg-kicker">Partner with us</span>
              <h2>
                Why join a <span>{BRAND.short} franchise</span>?
              </h2>
            </div>
            <div className="cg-fr">
              <div className="cg-fr-card">
                <h3>
                  Open an authorised <span>{BRAND.short}</span> study centre in your town
                </h3>
                <p>
                  Every centre gets a licence, a centre code, its own page on our website and the same ERP the head office uses — so admissions, fees, exams, certificates and ID cards work from day one.
                </p>
                <ul className="cg-fr-list">
                  {FRANCHISE_POINTS.map((p) => (
                    <li key={p}>
                      <Check />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
                <div className="cg-fr-cta">
                  <a className="cg-btn cg-btn-o" href="franchise.html#franchise">
                    Apply for franchise
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </a>
                  <a className="cg-btn cg-btn-w" href={`https://wa.me/${BRAND.phoneIntl}?text=${encodeURIComponent("Hello, I want to know about the Career Optics franchise.")}`} target="_blank" rel="noopener">
                    WhatsApp {BRAND.phone}
                  </a>
                </div>
              </div>
              <div className="cg-fr-side">
                <DocTile file="sample-franchise-licence" title="Franchise Partner Licence" text="Every authorised centre is issued this licence." category="Franchise" />
                <DocTile file="sample-staff-id-card" title="Director ID Card" text="For the centre director and staff." category="Franchise" />
                <DocTile file="sample-certificate" title="Student Certificate" text="Issued through the centre, verified online." category="Franchise" />
              </div>
            </div>
          </section>

          {/* ---- Payment details ---- */}
          <section className="cg-sec" id="payment" data-gallery-static="">
            <div className="cg-sec-head">
              <span className="cg-kicker">Scan &amp; pay</span>
              <h2>
                Official <span>Payment Details</span>
              </h2>
              <p>Course fees, franchise fees and examination fees are accepted only in the company's account below. Scan the QR code or use the account details with any bank or UPI app.</p>
            </div>
            <div className="cg-pay">
              <button type="button" className="cg-pay-poster" data-full="/image/gallery/scan-and-pay.webp" data-title="Scan & Pay — official account" data-category={ACCOUNT.holder} aria-label="View the Scan & Pay poster full size">
                <img src="/image/gallery/scan-and-pay.webp" alt={`Scan & Pay QR code of ${ACCOUNT.holder}`} loading="lazy" decoding="async" />
              </button>
              <div>
                <h3>
                  Account <span>Details</span>
                </h3>
                <p>The QR code pays {ACCOUNT.holder} directly. If you prefer a bank transfer (IMPS / NEFT / RTGS), use these details — the Copy buttons copy each value as it is.</p>
                <table className="cg-acct">
                  <tbody>
                    <tr>
                      <th scope="row">
                        <i aria-hidden="true">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="8" r="4" />
                            <path d="M4 21a8 8 0 0 1 16 0" />
                          </svg>
                        </i>
                        Account Holder
                      </th>
                      <td>
                        {ACCOUNT.holder}
                        <button type="button" className="cg-copy" data-copy={ACCOUNT.holder}>
                          Copy
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">
                        <i aria-hidden="true">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="5" width="20" height="14" rx="2" />
                            <path d="M2 10h20" />
                          </svg>
                        </i>
                        Account Number
                      </th>
                      <td className="cg-mono">
                        {ACCOUNT.number}
                        <button type="button" className="cg-copy" data-copy={ACCOUNT.number}>
                          Copy
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">
                        <i aria-hidden="true">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 7h16M4 12h10M4 17h16" />
                          </svg>
                        </i>
                        IFSC Code
                      </th>
                      <td className="cg-mono">
                        {ACCOUNT.ifsc}
                        <button type="button" className="cg-copy" data-copy={ACCOUNT.ifsc}>
                          Copy
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">
                        <i aria-hidden="true">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 21h18M3 10h18M5 10V21M19 10v11M9 10v11M15 10v11M12 3 3 10h18Z" />
                          </svg>
                        </i>
                        Bank &amp; Branch
                      </th>
                      <td>
                        {ACCOUNT.bank}, {ACCOUNT.branch}
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">
                        <i aria-hidden="true">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="6" width="18" height="13" rx="2" />
                            <path d="M3 10h18M16 15h2" />
                          </svg>
                        </i>
                        Account Type
                      </th>
                      <td>{ACCOUNT.type}</td>
                    </tr>
                  </tbody>
                </table>
                <div className="cg-note">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
                  </svg>
                  <span>
                    <b>Please pay only into this account.</b> {BRAND.short} does not accept fees in any personal account. After paying, send the screenshot with your name and course on WhatsApp {BRAND.phone} to receive your receipt.
                  </span>
                </div>
                <div className="cg-pay-cta">
                  <a className="cg-btn cg-btn-g" href={`https://wa.me/${BRAND.phoneIntl}?text=${encodeURIComponent("Hello, I have made a fee payment. Here is the screenshot.")}`} target="_blank" rel="noopener">
                    Send payment screenshot
                  </a>
                  <a className="cg-btn cg-btn-b" href="/image/gallery/scan-and-pay.jpg" download="career-optics-scan-and-pay.jpg">
                    Download QR poster
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* ---- Photos from the ERP ---- */}
          <section className="cg-sec" id="photos" style={{ marginBottom: 0 }}>
            <div className="cg-sec-head">
              <span className="cg-kicker">Life at {BRAND.short}</span>
              <h2>
                Our <span>Photos</span>
              </h2>
              <p>Classrooms, the computer lab, events and the students who learn with us.</p>
            </div>
            <div id="coGallery" data-gallery="full" data-cms-ui="" aria-live="polite">
              <noscript>Please turn on JavaScript to see the photos.</noscript>
            </div>
          </section>
        </div>

        <SiteFooter />
        <WhatsappWidget />
        <script dangerouslySetInnerHTML={{ __html: js_c1268ab4 }} />
        <script dangerouslySetInnerHTML={{ __html: js_gallery }} />
        <script dangerouslySetInnerHTML={{ __html: JS }} />
      </body>
    </html>
  );
}
