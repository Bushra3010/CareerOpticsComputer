import { BRAND, REGISTRATIONS } from "../components/brand";
import { HEAD_OFFICE_HOSTS, MAIN_SITE_ORIGIN } from "../../src/lib/branchSite";
import js_site from "../behaviour/site.js?raw";
import css_gallery from "../styles/gallery.css?raw";
import css_site from "../styles/site.css?raw";

/**
 * site.html — every franchise centre's website, from one page.
 *
 * Served at /c/<slug> (vercel.json) and on a centre's own domain
 * (middleware.ts). The page ships the layout with placeholders; the centre's
 * name, courses, photos and contact details are fetched in the browser by
 * behaviour/site.js from public_branch_site() (supabase/schema/
 * branch-sites.sql), so a centre's edit in the ERP shows without a rebuild.
 *
 * Head-office links are absolute: on a centre's own domain every page
 * address shows this page, so /verification.html there would not be the
 * head office's.
 */

const ISO = REGISTRATIONS.find((r) => r.file === "iso-9001-2015");
const MCA = REGISTRATIONS.find((r) => r.file === "mca-incorporation");

/* Inline icons (Lucide's shapes), so the page loads no icon library. */
const path = (d: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ICONS = {
  phone: path('<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>'),
  whatsapp: path('<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>'),
  pin: path('<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>'),
  mail: path('<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>'),
  clock: path('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>'),
  badge: path('<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/>'),
  check: path('<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>'),
  qr: path('<rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/>'),
  landmark: path('<line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/>'),
  cap: path('<path d="M21.42 10.92a1 1 0 0 0-.02-1.84L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.83l8.57 3.91a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>'),
  monitor: path('<rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>'),
};

const Icon = ({ name }: { name: keyof typeof ICONS }) => <span style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: ICONS[name] }} />;

const verifyUrl = `${MAIN_SITE_ORIGIN}/verification.html#certificate`;

/** What site.js needs that the TypeScript side owns: the head office's address and hosts, and the icons. */
const CONFIG = { mainOrigin: MAIN_SITE_ORIGIN, hosts: HEAD_OFFICE_HOSTS, brand: BRAND.name, icons: ICONS };

export default function Site() {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{BRAND.name} — Authorised Study Centre</title>
        <meta name="description" content={`An authorised study centre of ${BRAND.name}: computer courses, admissions and certificates verified by QR.`} />
        <meta name="robots" content="index,follow" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`${BRAND.name} — Authorised Study Centre`} />
        <meta property="og:description" content={`Computer courses at an authorised study centre of ${BRAND.name}.`} />
        <meta property="og:image" content={`${MAIN_SITE_ORIGIN}/logo.png`} />
        <meta name="theme-color" content="#0b2350" />
        <link rel="icon" href="/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <script src="/cms-config.js"></script>
        <script dangerouslySetInnerHTML={{ __html: `window.SITE_CONFIG=${JSON.stringify(CONFIG).replace(/</g, "\\u003c")};` }} />
        <style dangerouslySetInnerHTML={{ __html: css_site + css_gallery }} />
      </head>
      <body className="s-loading">
        <div id="sPage">
          <header className="s-head">
            <div className="s-wrap">
              <a className="s-brand" href="#home" aria-label="Home">
                <img id="sLogo" className="s-logo" src="/logo.png" alt="" width={48} height={48} />
                <span className="s-brand-text">
                  <span className="s-name" id="sName"><span className="s-skel">Loading centre name</span></span>
                  <span className="s-badge"><Icon name="badge" /> Authorised Study Centre of {BRAND.name}</span>
                </span>
              </a>
              <nav className="s-nav" aria-label="Sections">
                <a href="#about">About</a>
                <a href="#courses">Courses</a>
                <a href="#gallery" data-gallery-link="">Gallery</a>
                <a href="#admission">Admission</a>
                <a href="#contact">Contact</a>
              </nav>
              <div className="s-head-actions" data-live="">
                <a className="s-btn s-btn-sm s-btn-navy" id="sCallTop" href="#contact" aria-label="Call the centre"><Icon name="phone" /><span className="s-label">Call</span></a>
                <a className="s-btn s-btn-sm s-btn-wa" id="sWaTop" href="#contact" target="_blank" rel="noopener" aria-label="WhatsApp the centre"><Icon name="whatsapp" /><span className="s-label">WhatsApp</span></a>
              </div>
            </div>
          </header>

          <main>
            <section className="s-hero" id="home">
              <div className="s-hero-bg" id="sHeroBg"></div>
              <div className="s-wrap">
                <span className="s-kicker"><Icon name="badge" /> Authorised Study Centre · {BRAND.short}</span>
                <h1 id="sHeroTitle"><span className="s-skel">Loading the centre's website</span></h1>
                <p id="sHeroSub"><span className="s-skel">Computer courses, admissions open</span></p>
                <div className="s-cta" data-live="">
                  <a className="s-btn s-btn-primary" id="sApply" href="#admission"><Icon name="cap" /> Apply for Admission</a>
                  <a className="s-btn s-btn-ghost" id="sCallHero" href="#contact"><Icon name="phone" /> Call now</a>
                </div>
                <div className="s-trust">
                  <span><Icon name="badge" /> ISO 9001:2015 certified head office</span>
                  <span><Icon name="landmark" /> Registered with the Ministry of Corporate Affairs</span>
                  <span><Icon name="qr" /> QR-verifiable certificates</span>
                </div>
              </div>
            </section>

            <section className="s-sec s-sec-white" id="about">
              <div className="s-wrap">
                <div className="s-title">
                  <small>About us</small>
                  <h2 id="sAboutTitle">About the centre</h2>
                </div>
                <div className="s-about" data-live="">
                  <div>
                    <div className="s-about-text" id="sAbout"></div>
                    <ul className="s-highlights" id="sHighlights" hidden></ul>
                  </div>
                  <div className="s-facts" id="sFacts"></div>
                </div>
              </div>
            </section>

            <section className="s-sec" id="courses">
              <div className="s-wrap">
                <div className="s-title">
                  <small>Courses</small>
                  <h2>Courses we teach</h2>
                  <p>Every course follows the {BRAND.name} syllabus, with exams and certificates from the head office.</p>
                </div>
                <div className="s-courses" id="sCourses" data-live=""></div>
              </div>
            </section>

            <section className="s-sec s-sec-white" id="why">
              <div className="s-wrap">
                <div className="s-title">
                  <small>Why choose us</small>
                  <h2>Learn with a recognised academy</h2>
                </div>
                <div className="s-why">
                  <div className="s-why-card">
                    <i><Icon name="badge" /></i>
                    <h3>ISO 9001:2015 certified</h3>
                    <p>{BRAND.name} runs to a certified quality system{ISO ? ` (certificate ${ISO.value})` : ""}.</p>
                  </div>
                  <div className="s-why-card">
                    <i><Icon name="landmark" /></i>
                    <h3>Registered head office</h3>
                    <p>{BRAND.company} is registered with the Ministry of Corporate Affairs{MCA ? ` (CIN ${MCA.value})` : ""}. <a href={`${MAIN_SITE_ORIGIN}/certification.html`} target="_blank" rel="noopener">See the certificates</a></p>
                  </div>
                  <div className="s-why-card">
                    <i><Icon name="qr" /></i>
                    <h3>QR-verifiable certificates</h3>
                    <p>Every certificate carries a QR code anyone can check online. <a href={verifyUrl} target="_blank" rel="noopener">Verify a certificate</a></p>
                  </div>
                  <div className="s-why-card">
                    <i><Icon name="monitor" /></i>
                    <h3>Practical, job-ready skills</h3>
                    <p>Hands-on classes in the computer lab, regular tests and guidance on what to do next.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="s-sec" id="gallery" hidden>
              <div className="s-wrap">
                <div className="s-title">
                  <small>Gallery</small>
                  <h2>Life at the centre</h2>
                </div>
                <p className="s-note" id="sGalleryNote" hidden></p>
                <div id="sGallery"></div>
              </div>
            </section>

            <section className="s-sec s-sec-white" id="admission">
              <div className="s-wrap s-split">
                <div className="s-panel" id="sEnquiry">
                  <h3>Admission enquiry</h3>
                  <p>Leave your details and the centre will call you back.</p>
                  <form id="sForm" noValidate data-no-apply="">
                    <label className="s-field">
                      <span>Your name</span>
                      <input name="name" autoComplete="name" maxLength={120} required />
                      <div className="s-err" data-err="name"></div>
                    </label>
                    <label className="s-field">
                      <span>Mobile number</span>
                      <input name="phone" type="tel" inputMode="numeric" autoComplete="tel" maxLength={14} placeholder="10-digit mobile" required />
                      <div className="s-err" data-err="phone"></div>
                    </label>
                    <label className="s-field">
                      <span>Course</span>
                      <select name="course" id="sCourseSelect">
                        <option value="">Not sure yet</option>
                      </select>
                    </label>
                    <label className="s-field">
                      <span>Message (optional)</span>
                      <textarea name="message" maxLength={800} rows={3}></textarea>
                    </label>
                    <div className="s-alert" id="sFormAlert" role="alert" hidden></div>
                    <div className="s-form-actions">
                      <button className="s-btn s-btn-primary" type="submit" id="sSubmit">Send enquiry</button>
                    </div>
                  </form>
                  <div className="s-result" id="sDone" hidden aria-live="polite"></div>
                </div>

                <div className="s-panel" id="contact">
                  <h3>Visit or call us</h3>
                  <p>We are happy to help you choose a course.</p>
                  <ul className="s-contact-list" id="sContact" data-live=""></ul>
                  <div className="s-social" id="sSocial" hidden></div>
                  <div className="s-map" id="sMap" hidden></div>
                </div>
              </div>
            </section>
          </main>

          <footer className="s-foot">
            <div className="s-wrap s-foot-grid">
              <div>
                <h4 id="sFootName">Authorised Study Centre</h4>
                <p id="sFootAddr"></p>
                <p>An authorised study centre of {BRAND.name}.</p>
              </div>
              <div>
                <h4>Head office</h4>
                <p>{BRAND.company}</p>
                <p>{BRAND.address}</p>
                <p>
                  <a href={`tel:+91${BRAND.phone}`}>{BRAND.phone}</a> · <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>
                </p>
              </div>
              <div>
                <h4>Quick links</h4>
                <ul>
                  <li><a href={verifyUrl} target="_blank" rel="noopener">Verify certificate</a></li>
                  <li><a href={`${MAIN_SITE_ORIGIN}/`} target="_blank" rel="noopener">{BRAND.name}</a></li>
                  <li><a id="sStudentLogin" href={`${MAIN_SITE_ORIGIN}${BRAND.studentLogin}`}>Student Login</a></li>
                  <li><a id="sCentreLogin" href={`${MAIN_SITE_ORIGIN}${BRAND.centreLogin}`}>Centre Login</a></li>
                </ul>
              </div>
            </div>
            <div className="s-foot-bottom">
              © <span id="sYear">2026</span> <span id="sCopyName">{BRAND.name}</span>. Courses, exams and certificates by {BRAND.company}.
            </div>
          </footer>

          <div className="s-float" data-live="">
            <a className="s-btn s-btn-navy s-call" id="sCallFloat" href="#contact" aria-label="Call the centre"><Icon name="phone" /><span>Call</span></a>
            <a className="s-btn s-btn-wa" id="sWaFloat" href="#contact" target="_blank" rel="noopener" aria-label="WhatsApp the centre"><Icon name="whatsapp" /><span>WhatsApp</span></a>
          </div>
        </div>

        <div className="s-missing" id="sMissing" hidden>
          <div>
            <img src="/logo.png" alt={BRAND.name} width={84} height={84} />
            <h1>This centre's website is not available</h1>
            <p>The link may be mistyped, or the centre's site is switched off for now. You can still find a study centre near you on the {BRAND.name} website.</p>
            <div className="s-cta">
              <a className="s-btn s-btn-primary" href={`${MAIN_SITE_ORIGIN}/`}>Go to {BRAND.name}</a>
              <a className="s-btn s-btn-ghost" href={`tel:+91${BRAND.phone}`}>Call {BRAND.phone}</a>
            </div>
          </div>
        </div>

        <script dangerouslySetInnerHTML={{ __html: js_site }} />
      </body>
    </html>
  );
}
