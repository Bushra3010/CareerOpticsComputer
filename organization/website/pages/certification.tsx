import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import WhatsappWidget from "../components/WhatsappWidget";
import { BRAND, REGISTRATIONS } from "../components/brand";
import js_c1268ab4 from "../behaviour/c1268ab4.js?raw";

/** certification.html — every registration, with its certificate in full. */

const CSS = `
*{box-sizing:border-box}
body{margin:0;font-family:Poppins,system-ui,sans-serif;color:#0f172a;background:#f4f7fc}
.cc-hero{background:linear-gradient(120deg,#0b2350,#1d4ed8);color:#fff;padding:56px 16px;text-align:center}
.cc-hero h1{margin:0;font-size:clamp(28px,4vw,44px);font-weight:800}
.cc-hero p{margin:12px auto 0;max-width:720px;color:#d6e0fa;line-height:1.7}
.cc-crumb{margin-top:14px;font-size:14px;color:#fdba74}.cc-crumb a{color:#fff;text-decoration:none}
.cc-wrap{max-width:1140px;margin:0 auto;padding:56px 16px}
.cc-item{display:grid;grid-template-columns:.9fr 1.1fr;gap:36px;align-items:center;background:#fff;border:1px solid #e7ecf5;border-radius:18px;padding:28px;margin-bottom:28px;box-shadow:0 14px 32px rgba(11,35,80,.07)}
.cc-item:nth-child(even) .cc-img{order:2}
.cc-img{background:#f4f7fc;border-radius:12px;padding:18px;display:flex;justify-content:center;cursor:zoom-in;border:0}
.cc-img img{max-height:560px;width:auto;box-shadow:0 10px 26px rgba(0,0,0,.14)}
.cc-k{color:#f97316;font-weight:700;letter-spacing:.14em;text-transform:uppercase;font-size:12.5px}
.cc-item h2{margin:6px 0 4px;color:#0b2350;font-size:26px;font-weight:800}
.cc-auth{color:#5b6b88;margin:0 0 18px}
.cc-num{display:inline-flex;flex-direction:column;background:#fff4ec;border-left:4px solid #f97316;border-radius:8px;padding:10px 16px}
.cc-num small{color:#9a3412;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:.08em}
.cc-num b{color:#0b2350;font-size:18px;word-break:break-all}
.cc-extra{color:#5b6b88;margin:16px 0 20px;line-height:1.7}
.cc-actions{display:flex;flex-wrap:wrap;gap:10px}
.cc-actions a,.cc-actions button{display:inline-flex;align-items:center;gap:8px;border:0;border-radius:8px;padding:11px 18px;font:600 14px Poppins,system-ui,sans-serif;text-decoration:none;cursor:pointer}
.cc-actions .p{background:#0b2350;color:#fff}.cc-actions .s{background:#fff;color:#0b2350;border:1.5px solid #cbd5e1}
.cc-actions svg,.cc-actions i{width:17px;height:17px}
.cc-note{background:#fff;border:1px dashed #cbd5e1;border-radius:14px;padding:20px 24px;color:#5b6b88;line-height:1.7}
.cc-note b{color:#0b2350}
.co-lb{position:fixed;inset:0;background:rgba(5,14,35,.88);z-index:200;display:none;align-items:center;justify-content:center;padding:20px}
.co-lb.on{display:flex}
.co-lb img{max-width:min(92vw,900px);max-height:88vh;border-radius:6px;background:#fff}
.co-lb button{position:absolute;top:16px;right:18px;width:46px;height:46px;border-radius:50%;border:0;background:#fff;color:#0b2350;font-size:26px;cursor:pointer}
@media (max-width:860px){.cc-item{grid-template-columns:1fr;padding:18px}.cc-item:nth-child(even) .cc-img{order:0}.cc-img img{max-height:420px}}
`;

const JS = `
document.addEventListener("DOMContentLoaded",function(){
  var lb=document.getElementById("coLightbox"),img=lb.querySelector("img");
  document.querySelectorAll("[data-cert]").forEach(function(b){b.addEventListener("click",function(){img.src=b.getAttribute("data-cert");lb.classList.add("on")})});
  lb.addEventListener("click",function(e){if(e.target===lb||e.target.tagName==="BUTTON")lb.classList.remove("on")});
  document.addEventListener("keydown",function(e){if(e.key==="Escape")lb.classList.remove("on")});
  if(window.lucide)lucide.createIcons();
});
`;

export default function Certification() {
  return (
    <html lang="en">
      <head>
        <script src="/cms-config.js"></script>
        <script src="/cms.js" defer></script>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{`Authorizations & Certifications | ${BRAND.name}`}</title>
        <meta
          name="description"
          content={`${BRAND.company}: MCA Certificate of Incorporation, ISO 9001:2015, MSME Udyam registration and TAN allotment.`}
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

        <section className="cc-hero">
          <h1>Our Authorizations &amp; Certifications</h1>
          <p>
            {BRAND.name} is run by {BRAND.company} — registered with the Government of India and certified for
            quality management.
          </p>
          <div className="cc-crumb">
            <a href="index.html">Home</a> / Certification
          </div>
        </section>

        <div className="cc-wrap">
          {REGISTRATIONS.map((r) => (
            <div className="cc-item" key={r.file} id={r.file}>
              <button type="button" className="cc-img" data-cert={`/image/certificates/${r.file}.jpg`} aria-label={`View ${r.title}`}>
                <img src={`/image/certificates/${r.file}.jpg`} alt={r.title} loading="lazy" />
              </button>
              <div>
                <span className="cc-k">{r.authority}</span>
                <h2>{r.title}</h2>
                <p className="cc-auth">{BRAND.company}</p>
                <div className="cc-num">
                  <small>{r.label}</small>
                  <b>{r.value}</b>
                </div>
                {r.extra && <p className="cc-extra">{r.extra}</p>}
                <div className="cc-actions">
                  <button type="button" className="p" data-cert={`/image/certificates/${r.file}.jpg`}>
                    <i data-lucide="zoom-in"></i>View certificate
                  </button>
                  <a className="s" href={`/image/certificates/${r.file}.jpg`} download>
                    <i data-lucide="download"></i>Download
                  </a>
                </div>
              </div>
            </div>
          ))}
          <div className="cc-note">
            <b>Verify independently:</b> company details can be checked on the Ministry of Corporate Affairs portal
            (mca.gov.in) using CIN <b>U85500BR2026PTC085770</b>, and the Udyam registration on udyamregistration.gov.in
            using <b>UDYAM-BR-08-0043839</b>.
          </div>
        </div>

        <div className="co-lb" id="coLightbox" role="dialog" aria-modal="true">
          <button type="button" aria-label="Close">×</button>
          <img src="" alt="Certificate" />
        </div>

        <SiteFooter />
        <WhatsappWidget />
        <script dangerouslySetInnerHTML={{ __html: js_c1268ab4 }} />
        <script dangerouslySetInnerHTML={{ __html: JS }} />
      </body>
    </html>
  );
}
