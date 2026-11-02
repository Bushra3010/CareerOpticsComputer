import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import WhatsappWidget from "../components/WhatsappWidget";
import { BRAND } from "../components/brand";
import js_c1268ab4 from "../behaviour/c1268ab4.js?raw";

/**
 * about.html — who the academy is, what it stands for, and every government
 * registration it holds.
 *
 * Every registration figure below is copied from the certificate it names
 * (the scans are on certification.html). Nothing is claimed here that a
 * certificate does not show.
 */

const APPROVALS = [
  {
    icon: "landmark",
    title: "Certificate of Incorporation",
    authority: "Ministry of Corporate Affairs, Government of India",
    rows: [
      ["Company", "Career Optics Education Service Private Limited"],
      ["CIN", "U85500BR2026PTC085770"],
      ["Incorporated on", "19 June 2026"],
      ["Under", "Companies Act, 2013 — company limited by shares"],
      ["Issued by", "Registrar of Companies, Central Registration Centre"],
    ],
  },
  {
    icon: "badge-check",
    title: "ISO 9001:2015 Certified",
    authority: "Quality Management System",
    rows: [
      ["Certificate No.", "INQ/AN-23100/1/0726"],
      ["Registered on", "29 July 2026"],
      ["Valid until", "28 July 2029"],
      ["Scope", "Admission guidance and counselling in diploma, bachelor and master degree courses, and computer training & placement centre"],
      ["Certified by", "UKAFC — United Kingdom Accreditation Forum Certification (Ocean Standard Certification)"],
    ],
  },
  {
    icon: "factory",
    title: "MSME Udyam Registration",
    authority: "Ministry of Micro, Small & Medium Enterprises, Government of India",
    rows: [
      ["Udyam No.", "UDYAM-BR-08-0043839"],
      ["Enterprise type", "Micro — Services"],
      ["Activity", "Educational support services (NIC 85500)"],
      ["Units", "Career Optics Education Service Pvt Ltd · Career Optics Computer Academy"],
      ["Registered on", "27 July 2026 · District Industries Centre, Bhojpur"],
    ],
  },
  {
    icon: "receipt-indian-rupee",
    title: "Income Tax Registrations",
    authority: "Income Tax Department, Government of India",
    rows: [
      ["PAN", "AANCC9435F"],
      ["TAN", "PTNC05722D"],
      ["TAN allotted on", "19 June 2026"],
    ],
  },
];

const VALUES = [
  { icon: "target", title: "Practical first", text: "Every course is taught on the computer, with projects and practice — not only theory." },
  { icon: "shield-check", title: "Honest and transparent", text: "Clear fees, written receipts, and certificates anyone can verify online." },
  { icon: "users", title: "Every learner counts", text: "Small batches and personal attention, whether you are a school student or a working adult." },
  { icon: "trending-up", title: "Career outcomes", text: "Guidance on higher studies, jobs and self-employment, and support until you are placed." },
];

const OFFER = [
  { icon: "monitor", title: "Computer courses", text: "DCA, ADCA, Basic Computer, Tally Prime with GST, Hindi & English typing, graphic design, programming, web development and AI tools." },
  { icon: "graduation-cap", title: "Admission guidance", text: "Counselling and admission support for diploma, bachelor and master degree courses." },
  { icon: "briefcase", title: "Placement support", text: "Preparation for interviews and help connecting trained students with employers." },
  { icon: "handshake", title: "Franchise programme", text: "Centres across Bihar can run our courses with a complete online panel for admissions, fees, exams and certificates." },
];

const WHY = [
  "Company registered with the Ministry of Corporate Affairs, Government of India",
  "ISO 9001:2015 certified quality management system",
  "MSME (Udyam) registered enterprise",
  "Certificates and marksheets carry a QR code for online verification",
  "Online admission, student login, online exams, results and admit cards",
  "Modern computer lab and trained faculty",
  "Affordable fees with written receipts for every payment",
  "Admission guidance for higher studies and placement support",
];

const CSS = `
*{box-sizing:border-box}
body{margin:0;font-family:Poppins,system-ui,sans-serif;color:#0f172a;background:#fff}
.ab-wrap{max-width:1180px;margin:0 auto;padding:0 16px}
.ab-sec{padding:64px 0}
.ab-alt{background:#f4f7fc}
.ab-k{display:inline-block;color:#f97316;font-weight:700;letter-spacing:.16em;text-transform:uppercase;font-size:12.5px}
.ab-h2{margin:8px 0 0;font-size:clamp(24px,3.2vw,34px);font-weight:800;color:#0b2350;line-height:1.25}
.ab-h2 span{color:#f97316}
.ab-lead{color:#5b6b88;line-height:1.85;margin:14px 0 0;font-size:15.5px}
.ab-center{text-align:center}.ab-center .ab-lead{max-width:780px;margin-left:auto;margin-right:auto}
.ab-hero{background:linear-gradient(120deg,#0b2350,#1d4ed8);color:#fff;padding:56px 16px;text-align:center}
.ab-hero h1{margin:0;font-size:clamp(28px,4vw,44px);font-weight:800}
.ab-hero p{margin:12px auto 0;max-width:760px;color:#d6e0fa;line-height:1.7}
.ab-crumb{margin-top:14px;font-size:14px;color:#fdba74}.ab-crumb a{color:#fff;text-decoration:none}
.ab-intro{display:grid;grid-template-columns:.8fr 1.2fr;gap:44px;align-items:center}
.ab-logo{background:#f4f7fc;border-radius:20px;padding:28px;display:flex;justify-content:center;position:relative}
.ab-logo img{width:100%;max-width:360px}
.ab-tag{position:absolute;left:-8px;bottom:22px;background:#f97316;color:#fff;padding:12px 16px;border-radius:12px;font-weight:700;box-shadow:0 12px 24px rgba(249,115,22,.35);line-height:1.3}
.ab-tag b{display:block;font-size:20px}
.ab-facts{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-top:22px}
.ab-facts div{background:#f4f7fc;border-left:4px solid #f97316;border-radius:8px;padding:10px 14px}
.ab-facts small{display:block;color:#5b6b88;font-size:11.5px;font-weight:700;text-transform:uppercase;letter-spacing:.06em}
.ab-facts b{color:#0b2350;font-size:14.5px}
.ab-founder{display:grid;grid-template-columns:.75fr 1.25fr;gap:44px;align-items:center}
.ab-photo{position:relative}
.ab-photo img{width:100%;border-radius:18px;box-shadow:0 24px 50px rgba(11,35,80,.22);display:block;aspect-ratio:4/5;object-fit:cover;object-position:center top}
.ab-photo .ab-name{position:absolute;left:16px;right:16px;bottom:16px;background:rgba(11,35,80,.92);color:#fff;border-radius:12px;padding:12px 16px}
.ab-photo .ab-name b{display:block;font-size:16px}
.ab-photo .ab-name span{font-size:12.5px;color:#fdba74}
.ab-quote{position:relative;margin:18px 0 0;padding:18px 22px 18px 26px;background:#fff4ec;border-left:5px solid #f97316;border-radius:10px;color:#0b2350;font-size:18px;font-weight:700;line-height:1.6}
.ab-msg p{color:#475569;line-height:1.9;margin:14px 0 0;font-size:15.5px}
.ab-sign{margin-top:20px;color:#0b2350;font-weight:800}
.ab-sign small{display:block;color:#5b6b88;font-weight:600;margin-top:2px}
.ab-mv{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:36px}
.ab-card{background:#fff;border:1px solid #e7ecf5;border-radius:16px;padding:28px;box-shadow:0 12px 28px rgba(11,35,80,.06)}
.ab-card .ab-ic{width:52px;height:52px;border-radius:14px;display:grid;place-items:center;background:#0b2350;color:#fff}
.ab-card .ab-ic.o{background:#f97316}
.ab-card .ab-ic svg,.ab-card .ab-ic i{width:26px;height:26px}
.ab-card h3{margin:16px 0 8px;color:#0b2350;font-size:21px;font-weight:800}
.ab-card p{margin:0;color:#5b6b88;line-height:1.8}
.ab-card ul{margin:12px 0 0;padding-left:18px;color:#5b6b88;line-height:1.8}
.ab-grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin-top:36px}
.ab-mini{background:#fff;border:1px solid #e7ecf5;border-radius:14px;padding:22px}
.ab-mini svg,.ab-mini i{width:34px;height:34px;color:#f97316}
.ab-mini h4{margin:12px 0 6px;color:#0b2350;font-size:16.5px}
.ab-mini p{margin:0;color:#5b6b88;font-size:14px;line-height:1.7}
.ab-appr{display:grid;grid-template-columns:repeat(2,1fr);gap:22px;margin-top:36px}
.ab-ap{background:#fff;border:1px solid #e7ecf5;border-radius:16px;overflow:hidden;box-shadow:0 12px 28px rgba(11,35,80,.06)}
.ab-ap header{display:flex;gap:14px;align-items:center;padding:18px 22px;background:#0b2350;color:#fff}
.ab-ap header svg,.ab-ap header i{width:30px;height:30px;color:#fbbf24;flex-shrink:0}
.ab-ap header h3{margin:0;font-size:17px}
.ab-ap header p{margin:2px 0 0;font-size:12.5px;color:#c7d2ec}
.ab-ap dl{margin:0;padding:16px 22px 20px}
.ab-ap dl div{display:grid;grid-template-columns:140px 1fr;gap:12px;padding:8px 0;border-bottom:1px dashed #e7ecf5}
.ab-ap dl div:last-child{border-bottom:0}
.ab-ap dt{color:#5b6b88;font-size:13px;font-weight:600}
.ab-ap dd{margin:0;color:#0b2350;font-weight:600;font-size:14px;word-break:break-word}
.ab-why{display:grid;grid-template-columns:repeat(2,1fr);gap:12px 26px;margin-top:30px}
.ab-why div{display:flex;gap:12px;align-items:flex-start;background:#fff;border:1px solid #e7ecf5;border-radius:10px;padding:14px 16px;font-weight:600;color:#0b2350}
.ab-why svg,.ab-why i{width:22px;height:22px;color:#16a34a;flex-shrink:0}
.ab-contact{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:30px}
.ab-contact div{background:#f4f7fc;border-radius:12px;padding:20px}
.ab-contact h4{margin:0 0 6px;color:#0b2350}
.ab-contact p,.ab-contact a{margin:0;color:#5b6b88;text-decoration:none;line-height:1.6;word-break:break-word}
.ab-btn{display:inline-flex;align-items:center;gap:8px;background:#f97316;color:#fff;font-weight:700;padding:13px 24px;border-radius:8px;text-decoration:none}
.ab-btn.ab-ghost{background:#0b2350}
.ab-btn svg,.ab-btn i{width:18px;height:18px}
.ab-cta{background:linear-gradient(120deg,#0b2350,#1d4ed8);color:#fff;text-align:center;padding:56px 16px}
.ab-cta h2{margin:0;font-size:clamp(24px,3.2vw,34px)}
.ab-cta p{color:#d6e0fa;margin:10px 0 24px}
@media (max-width:980px){.ab-grid4{grid-template-columns:repeat(2,1fr)}.ab-appr{grid-template-columns:1fr}}
@media (max-width:820px){.ab-intro,.ab-mv,.ab-why,.ab-contact,.ab-founder{grid-template-columns:1fr}.ab-photo{max-width:420px;margin:0 auto}.ab-tag{left:10px}}
@media (max-width:560px){.ab-grid4,.ab-facts{grid-template-columns:1fr}.ab-sec{padding:48px 0}.ab-ap dl div{grid-template-columns:1fr;gap:2px}}
`;

export default function About() {
  return (
    <html lang="en">
      <head>
        <script src="/cms-config.js"></script>
        <script src="/cms.js" defer></script>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{`About Us | ${BRAND.name}`}</title>
        <meta
          name="description"
          content={`${BRAND.name}, run by ${BRAND.company} — MCA registered (CIN U85500BR2026PTC085770), ISO 9001:2015 certified and MSME Udyam registered computer academy in Ara, Bhojpur, Bihar.`}
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

        <section className="ab-hero">
          <h1>About {BRAND.name}</h1>
          <p>
            A government-registered, ISO 9001:2015 certified computer academy in Ara, Bhojpur — teaching practical
            computer skills and guiding students towards higher studies and careers.
          </p>
          <div className="ab-crumb">
            <a href="index.html">Home</a> / About Us
          </div>
        </section>

        <section className="ab-sec">
          <div className="ab-wrap ab-intro">
            <div className="ab-logo">
              <img src="/logo.png" alt={BRAND.name} />
              <div className="ab-tag">
                <b>ISO 9001:2015</b>
                Certified Academy
              </div>
            </div>
            <div>
              <span className="ab-k">Who we are</span>
              <h2 className="ab-h2">
                {BRAND.short} <span>Computer Academy</span>
              </h2>
              <p className="ab-lead">
                <b>{BRAND.name}</b> is run by <b>{BRAND.company}</b>, a company incorporated on 19 June 2026 under the
                Companies Act, 2013 with the Ministry of Corporate Affairs, Government of India. The academy began
                its educational services on 1 July 2026 from Hariom Gupta Building, Bandhan Tola, Nawada, Ara
                (Bhojpur), Bihar.
              </p>
              <p className="ab-lead">
                We teach computer skills the way they are used at work — DCA, ADCA, Tally Prime with GST, typing,
                graphic design, programming, web development and AI tools — and we guide students on admission to
                diploma, bachelor and master degree courses. Our quality management system is certified to
                ISO 9001:2015, and every certificate we issue can be verified online.
              </p>
              <p className="ab-lead" lang="hi">
                हमारा उद्देश्य है कि आरा और आसपास के हर विद्यार्थी को सस्ती, व्यावहारिक और भरोसेमंद कंप्यूटर शिक्षा मिले — ताकि वह आत्मविश्वास के साथ नौकरी, आगे की पढ़ाई या अपना काम शुरू कर सके।
              </p>
              <div className="ab-facts">
                <div><small>Company</small><b>{BRAND.company}</b></div>
                <div><small>CIN</small><b>U85500BR2026PTC085770</b></div>
                <div><small>ISO 9001:2015</small><b>INQ/AN-23100/1/0726</b></div>
                <div><small>MSME Udyam</small><b>UDYAM-BR-08-0043839</b></div>
              </div>
            </div>
          </div>
        </section>

        <section className="ab-sec ab-alt" id="founder-message">
          <div className="ab-wrap ab-founder">
            <div className="ab-photo">
              <img src="/image/founder.jpg" alt={`Founder & Director, ${BRAND.name}`} loading="lazy" />
              <div className="ab-name">
                <b>Founder &amp; Director</b>
                <span>{BRAND.name}</span>
              </div>
            </div>
            <div className="ab-msg">
              <span className="ab-k">Message from the founder</span>
              <h2 className="ab-h2">
                A word from our <span>Founder &amp; Director</span>
              </h2>
              <blockquote className="ab-quote">
                “A certificate opens a door. Skill, confidence and the right guidance are what carry you through it.”
              </blockquote>
              <p>
                Dear students and parents, I started {BRAND.name} with one simple belief — that a young person in
                Ara or any small town of Bihar deserves the same quality of computer education as a student in a big
                city. Talent is everywhere; what is often missing is the right teaching, a good computer to practise
                on, and someone to show the way.
              </p>
              <p>
                That is why every course here is taught hands-on, every fee is receipted, and every certificate we
                issue can be verified online. We registered the academy with the Ministry of Corporate Affairs, got it
                certified to ISO 9001:2015 and registered it under MSME — not for the paperwork, but so that you can
                trust what you are paying for.
              </p>
              <p lang="hi">
                मेरा सपना है कि हमारे यहाँ से निकलने वाला हर विद्यार्थी आत्मविश्वास के साथ नौकरी पाए, आगे की पढ़ाई करे या अपना
                काम शुरू करे। आप मेहनत कीजिए — सही मार्गदर्शन और साथ देने की ज़िम्मेदारी हमारी है।
              </p>
              <p>
                Come and visit us, sit in a demo class, and see for yourself. I look forward to welcoming you to the
                {" "}{BRAND.short} family.
              </p>
              <div className="ab-sign">
                Founder &amp; Director
                <small>{BRAND.name} · {BRAND.company}</small>
              </div>
            </div>
          </div>
        </section>

        <section className="ab-sec" id="mission-vision">
          <div className="ab-wrap">
            <div className="ab-center">
              <span className="ab-k">What drives us</span>
              <h2 className="ab-h2">Our Mission <span>&amp; Vision</span></h2>
            </div>
            <div className="ab-mv">
              <div className="ab-card">
                <div className="ab-ic"><i data-lucide="target"></i></div>
                <h3>Our Mission</h3>
                <p>
                  To give every learner in Bhojpur and across Bihar practical, affordable and job-ready computer
                  education — and the right guidance to turn those skills into a career.
                </p>
                <ul>
                  <li>Teach hands-on, on the computer, with real projects</li>
                  <li>Keep fees fair and every payment receipted</li>
                  <li>Issue certificates that anyone can verify online</li>
                  <li>Guide students on higher studies, jobs and self-employment</li>
                </ul>
              </div>
              <div className="ab-card">
                <div className="ab-ic o"><i data-lucide="eye"></i></div>
                <h3>Our Vision</h3>
                <p>
                  To become Bihar's most trusted name in computer education — an academy where no student is left
                  behind in the digital world, and a network of centres that brings the same quality to every town.
                </p>
                <ul>
                  <li>Digital literacy for every household we reach</li>
                  <li>Skills that match what employers need today</li>
                  <li>Quality held to ISO 9001:2015 at every centre</li>
                  <li>Learn • Grow • Succeed — Skill Today, Success Tomorrow</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="ab-sec ab-alt">
          <div className="ab-wrap">
            <div className="ab-center">
              <span className="ab-k">Our values</span>
              <h2 className="ab-h2">What we <span>stand for</span></h2>
            </div>
            <div className="ab-grid4">
              {VALUES.map((v) => (
                <div className="ab-mini" key={v.title}>
                  <i data-lucide={v.icon}></i>
                  <h4>{v.title}</h4>
                  <p>{v.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="ab-sec ab-alt" id="approvals">
          <div className="ab-wrap">
            <div className="ab-center">
              <span className="ab-k">Government registered</span>
              <h2 className="ab-h2">Registrations <span>&amp; Approvals</span></h2>
              <p className="ab-lead">
                {BRAND.company} holds the following registrations with the Government of India and is certified for
                quality management. The original certificates are on our{" "}
                <a href="certification.html" style={{ color: "#f97316", fontWeight: 700 }}>Certification</a> page.
              </p>
            </div>
            <div className="ab-appr">
              {APPROVALS.map((a) => (
                <article className="ab-ap" key={a.title}>
                  <header>
                    <i data-lucide={a.icon}></i>
                    <div>
                      <h3>{a.title}</h3>
                      <p>{a.authority}</p>
                    </div>
                  </header>
                  <dl>
                    {a.rows.map(([k, v]) => (
                      <div key={k}>
                        <dt>{k}</dt>
                        <dd>{v}</dd>
                      </div>
                    ))}
                  </dl>
                </article>
              ))}
            </div>
            <div className="ab-center" style={{ marginTop: 28 }}>
              <a className="ab-btn ab-ghost" href="certification.html">
                <i data-lucide="file-badge"></i>View all certificates
              </a>
            </div>
            <p className="ab-lead ab-center" style={{ fontSize: 13.5 }}>
              Verify independently: company details on the Ministry of Corporate Affairs portal (mca.gov.in) using CIN
              U85500BR2026PTC085770, and the Udyam registration on udyamregistration.gov.in using UDYAM-BR-08-0043839.
            </p>
          </div>
        </section>

        <section className="ab-sec">
          <div className="ab-wrap">
            <div className="ab-center">
              <span className="ab-k">What we do</span>
              <h2 className="ab-h2">What we <span>offer</span></h2>
            </div>
            <div className="ab-grid4">
              {OFFER.map((o) => (
                <div className="ab-mini" key={o.title}>
                  <i data-lucide={o.icon}></i>
                  <h4>{o.title}</h4>
                  <p>{o.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="ab-sec ab-alt">
          <div className="ab-wrap">
            <div className="ab-center">
              <span className="ab-k">Why choose us</span>
              <h2 className="ab-h2">Why students <span>choose us</span></h2>
            </div>
            <div className="ab-why">
              {WHY.map((w) => (
                <div key={w}>
                  <i data-lucide="circle-check"></i>
                  {w}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="ab-sec" id="contact">
          <div className="ab-wrap">
            <div className="ab-center">
              <span className="ab-k">Visit us</span>
              <h2 className="ab-h2">Registered <span>office</span></h2>
            </div>
            <div className="ab-contact">
              <div>
                <h4>Address</h4>
                <p>{BRAND.address}</p>
              </div>
              <div>
                <h4>Phone</h4>
                <a href={`tel:+${BRAND.phoneIntl}`}>+91 {BRAND.phone}</a>
                <br />
                <a href={`tel:+91${BRAND.altPhone}`}>+91 {BRAND.altPhone}</a>
              </div>
              <div>
                <h4>Email</h4>
                <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>
              </div>
            </div>
          </div>
        </section>

        <section className="ab-cta">
          <h2>Start learning with {BRAND.short}</h2>
          <p>Admission open — visit the academy or apply online today.</p>
          <a className="ab-btn" href="/computercentre/apply">
            Apply Online <i data-lucide="arrow-right"></i>
          </a>
        </section>

        <SiteFooter />
        <WhatsappWidget />
        <script dangerouslySetInnerHTML={{ __html: js_c1268ab4 }} />
        <script dangerouslySetInnerHTML={{ __html: `document.addEventListener("DOMContentLoaded",function(){if(window.lucide)lucide.createIcons()});` }} />
      </body>
    </html>
  );
}
