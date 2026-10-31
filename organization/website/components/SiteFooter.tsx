import { BRAND, REGISTRATIONS } from "./brand";

const CSS = `
.co-foot{background:#0b2350;color:#c7d2ec;font:400 14px/1.7 Poppins,system-ui,sans-serif}
.co-foot .co-wrap{max-width:1240px;margin:0 auto;padding:0 16px}
.co-foot-grid{display:grid;grid-template-columns:1.5fr 1fr 1fr 1.3fr;gap:36px;padding:56px 0 40px}
.co-foot h3{color:#fff;font-size:17px;font-weight:700;margin:0 0 16px;position:relative;padding-bottom:10px}
.co-foot h3::after{content:"";position:absolute;left:0;bottom:0;width:42px;height:3px;border-radius:2px;background:#f97316}
.co-foot a{color:#c7d2ec;text-decoration:none}.co-foot a:hover{color:#fb923c}
.co-foot ul{list-style:none;margin:0;padding:0}.co-foot li{margin:0 0 8px}
.co-foot-brand{display:flex;align-items:center;gap:12px;margin-bottom:14px}
.co-foot-brand img{width:62px;height:62px;border-radius:12px;background:#fff;padding:3px;object-fit:contain}
.co-foot-brand b{color:#fff;font-size:17px;line-height:1.2;display:block}
.co-foot-brand small{color:#fb923c;font-size:11px;letter-spacing:.12em;text-transform:uppercase}
.co-foot-reg{font-size:13px;color:#a8b6d8}
.co-foot-reg strong{color:#fff;font-weight:600}
.co-foot-contact li{display:flex;gap:10px;align-items:flex-start}
.co-foot-contact i,.co-foot-contact svg{width:17px;height:17px;flex-shrink:0;margin-top:4px;color:#fb923c}
.co-foot-bottom{border-top:1px solid rgba(255,255,255,.1);padding:18px 0;display:flex;flex-wrap:wrap;justify-content:space-between;gap:10px;font-size:13px;color:#93a3c8}
@media (max-width:980px){.co-foot-grid{grid-template-columns:1fr 1fr}}
@media (max-width:600px){.co-foot-grid{grid-template-columns:1fr;padding-top:40px}}
`;

/** Shared by every page that carries it; written once here. */
export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="co-foot" data-cms-scope="footer">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="co-wrap">
        <div className="co-foot-grid">
          <div>
            <div className="co-foot-brand">
              <img src="/logo.png" alt={BRAND.name} />
              <span>
                <b>{BRAND.name}</b>
                <small>{BRAND.motto}</small>
              </span>
            </div>
            <p className="co-foot-reg">
              {BRAND.name} is run by <strong>{BRAND.company}</strong>, incorporated under the Companies Act, 2013
              with the Ministry of Corporate Affairs, Govt. of India.
            </p>
            <p className="co-foot-reg">
              {REGISTRATIONS.map((r, i) => (
                <span key={r.file}>
                  {i > 0 && " · "}
                  {r.label}: <strong>{r.value}</strong>
                </span>
              ))}
            </p>
          </div>
          <div>
            <h3>Quick Links</h3>
            <ul>
              <li><a href="index.html">Home</a></li>
              <li><a href="about.html">About Us</a></li>
              <li><a href="computer-course.html">Courses</a></li>
              <li><a href="certification.html">Certification</a></li>
              <li><a href="gallery.html">Gallery</a></li>
              <li><a href="franchise.html">Franchise</a></li>
              <li><a href="index.html#contact">Contact Us</a></li>
            </ul>
          </div>
          <div>
            <h3>Student Zone</h3>
            <ul>
              <li><a href={BRAND.studentLogin}>Student Login</a></li>
              <li><a href="/computercentre/apply">Online Admission</a></li>
              <li><a href="/verification.html#certificate">Certificate Verification</a></li>
              <li><a href="/verification.html#result">Result</a></li>
              <li><a href="/verification.html#admit">Admit Card</a></li>
              <li><a href={BRAND.centreLogin}>Centre Login</a></li>
            </ul>
          </div>
          <div>
            <h3>Contact Us</h3>
            <ul className="co-foot-contact">
              <li><i data-lucide="map-pin"></i><span>{BRAND.address}</span></li>
              <li><i data-lucide="phone"></i><a href={`tel:+${BRAND.phoneIntl}`}>+91 {BRAND.phone}</a></li>
              <li><i data-lucide="mail"></i><a href={`mailto:${BRAND.email}`}>{BRAND.email}</a></li>
              <li><i data-lucide="message-circle"></i><a href={`https://wa.me/${BRAND.phoneIntl}`}>Chat on WhatsApp</a></li>
            </ul>
          </div>
        </div>
        <div className="co-foot-bottom">
          <span>© {year} {BRAND.company}. All rights reserved.</span>
          <span>{BRAND.name} · ISO 9001:2015 Certified</span>
        </div>
      </div>
    </footer>
  );
}
