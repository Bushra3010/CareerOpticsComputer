import { BRAND } from "./brand";

/**
 * The header every page carries: a contact strip with the two logins, then the
 * logo and the menu. Its styles are self-contained (co-* classes) so it looks
 * the same on every page, whatever that page's own CSS does.
 *
 * The phone menu (#coMenuBtn / #coMobileMenu) is opened by the small script at
 * the bottom of this component. The pages' older header scripts looked for
 * #menuBtn / #mobileMenu; they now step aside when those are absent.
 */

type Link = { href: string; label: string; note?: string };
type Menu = { label: string; href?: string; items?: Link[] };

const MENU: Menu[] = [
  { label: "Home", href: "index.html" },
  { label: "About Us", href: "about.html" },
  {
    label: "Courses",
    items: [
      { href: "computer-course.html", label: "Certified Computer Courses", note: "DCA, ADCA, MS Office" },
      { href: "accounting.html", label: "Accounting & Taxation", note: "Tally Prime, GST, Busy" },
      { href: "typing.html", label: "Typing & Stenography", note: "Hindi & English" },
      { href: "graphics.html", label: "Graphic Design", note: "Photoshop, CorelDRAW" },
      { href: "coding.html", label: "Programming", note: "C, Python, Java" },
      { href: "fullstack.html", label: "Web Development", note: "HTML, CSS, JS, React" },
      { href: "ai_foundation.html", label: "AI Foundation", note: "AI tools & prompting" },
      { href: "digital-marketing.html", label: "Digital Marketing", note: "SEO, social media" },
      { href: "spoken-english.html", label: "Spoken English", note: "Personality development" },
    ],
  },
  {
    label: "Student Zone",
    items: [
      { href: BRAND.studentLogin, label: "Student Login" },
      { href: "/computercentre/apply", label: "Online Admission" },
      { href: "/verification.html#certificate", label: "Certificate Verification" },
      { href: "/verification.html#result", label: "Result" },
      { href: "/verification.html#admit", label: "Admit Card" },
    ],
  },
  { label: "Certification", href: "certification.html" },
  {
    label: "Franchise",
    items: [
      { href: "franchise.html", label: "Franchise Opportunity" },
      { href: "franchise.html#franchise", label: "Apply for Franchise" },
      { href: BRAND.centreLogin, label: "Centre Login" },
    ],
  },
  { label: "Contact Us", href: "index.html#contact" },
];

const CSS = `
.co-top{background:#0b2350;color:#dbe4ff;font:500 13px/1.4 Poppins,system-ui,sans-serif}
.co-top .co-wrap{display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:42px}
.co-top-info{display:flex;flex-wrap:wrap;gap:6px 22px}
.co-top-info a,.co-top-info span{display:inline-flex;align-items:center;gap:7px;color:inherit;text-decoration:none}
.co-top-info svg,.co-top-info i{width:15px;height:15px;color:#fb923c}
.co-top-btns{display:flex;gap:8px;flex-shrink:0}
.co-top-btns a{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:6px;font-weight:600;font-size:12.5px;text-decoration:none;color:#fff;white-space:nowrap}
.co-top-btns .co-stu{background:#f97316}.co-top-btns .co-ctr{background:#2563eb}
.co-top-btns a:hover{filter:brightness(1.08)}
.co-wrap{max-width:1240px;margin:0 auto;padding:0 16px}
.co-head{position:sticky;top:0;z-index:60;background:#fff;box-shadow:0 2px 14px rgba(11,35,80,.09);font-family:Poppins,system-ui,sans-serif}
.co-head .co-wrap{display:flex;align-items:center;justify-content:space-between;gap:18px;min-height:84px}
.co-brand{display:flex;align-items:center;gap:12px;text-decoration:none}
.co-brand img{width:66px;height:66px;object-fit:contain}
.co-brand b{display:block;color:#0b2350;font-size:19px;font-weight:800;line-height:1.1;letter-spacing:-.01em}
.co-brand b span{color:#f97316}
.co-brand small{display:block;color:#64748b;font-size:10.5px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;margin-top:3px}
.co-nav{display:flex;align-items:center;gap:2px}
.co-nav>div{position:relative}
.co-nav>div>a,.co-nav>div>button{display:inline-flex;align-items:center;gap:4px;padding:10px 12px;border:0;background:none;cursor:pointer;color:#0b2350;font:600 13.5px Poppins,system-ui,sans-serif;text-transform:uppercase;letter-spacing:.02em;text-decoration:none;border-radius:6px}
.co-nav>div>a:hover,.co-nav>div>button:hover,.co-nav>div:focus-within>button{color:#f97316}
.co-nav>div>a.co-active{color:#f97316}
.co-nav .co-caret{width:14px;height:14px;transition:transform .2s}
.co-nav>div:hover .co-caret{transform:rotate(180deg)}
.co-drop{position:absolute;left:0;top:100%;min-width:270px;background:#fff;border-top:3px solid #f97316;border-radius:0 0 10px 10px;box-shadow:0 18px 40px rgba(11,35,80,.18);padding:8px;opacity:0;visibility:hidden;transform:translateY(8px);transition:.18s}
.co-nav>div:hover .co-drop,.co-nav>div:focus-within .co-drop{opacity:1;visibility:visible;transform:none}
.co-drop a{display:block;padding:9px 12px;border-radius:7px;color:#0b2350;text-decoration:none;font-size:14px;font-weight:600}
.co-drop a small{display:block;color:#64748b;font-weight:500;font-size:12px}
.co-drop a:hover{background:#fff4ec;color:#c2410c}
.co-burger{display:none;width:44px;height:44px;border-radius:10px;border:1px solid #e2e8f0;background:#fff;color:#0b2350;align-items:center;justify-content:center;cursor:pointer}
.co-burger svg,.co-burger i{width:22px;height:22px}
#coMobileMenu{display:none;border-top:1px solid #e2e8f0;background:#fff;max-height:calc(100vh - 84px);overflow:auto}
#coMobileMenu.show{display:block}
#coMobileMenu a,#coMobileMenu summary{display:block;padding:13px 18px;border-bottom:1px solid #f1f5f9;color:#0b2350;font:600 15px Poppins,system-ui,sans-serif;text-decoration:none;cursor:pointer;list-style:none}
#coMobileMenu summary::-webkit-details-marker{display:none}
#coMobileMenu summary::after{content:"+";float:right;color:#f97316;font-weight:700}
#coMobileMenu details[open] summary::after{content:"–"}
#coMobileMenu details a{padding-left:32px;font-weight:500;font-size:14px;background:#f8fafc}
#coMobileMenu .co-m-btns{display:flex;gap:10px;padding:14px 18px}
#coMobileMenu .co-m-btns a{flex:1;text-align:center;border:0;border-radius:8px;color:#fff;padding:11px}
@media (max-width:1100px){.co-nav{display:none}.co-burger{display:inline-flex}.co-head .co-wrap{min-height:72px}.co-brand img{width:54px;height:54px}}
@media (max-width:760px){.co-top-info .co-hide-sm{display:none}.co-top .co-wrap{flex-direction:column;align-items:stretch;padding-top:6px;padding-bottom:6px;gap:6px}.co-top-info{justify-content:center}.co-top-btns{justify-content:center}.co-brand b{font-size:16px}}
`;

export default function SiteHeader() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="co-top" data-cms-scope="topbar">
        <div className="co-wrap">
          <div className="co-top-info">
            <span className="co-hide-sm">
              <i data-lucide="map-pin"></i>
              {BRAND.addressShort}
            </span>
            <a href={`mailto:${BRAND.email}`}>
              <i data-lucide="mail"></i>
              {BRAND.email}
            </a>
            <a href={`tel:+${BRAND.phoneIntl}`}>
              <i data-lucide="phone"></i>
              {BRAND.phone}
            </a>
          </div>
          <div className="co-top-btns">
            <a className="co-stu" href={BRAND.studentLogin}>Student Login</a>
            <a className="co-ctr" href={BRAND.centreLogin}>Centre Login</a>
          </div>
        </div>
      </div>
      <header id="siteHeader" className="co-head" data-cms-scope="header">
        <div className="co-wrap">
          <a className="co-brand" href="index.html">
            <img src="/logo.png" alt={BRAND.name} />
            <span>
              <b>
                Career <span>Optics</span>
              </b>
              <small>Computer Academy · {BRAND.tagline}</small>
            </span>
          </a>
          <nav className="co-nav" aria-label="Main">
            {MENU.map((m) => (
              <div key={m.label}>
                {m.items ? (
                  <>
                    <button type="button">
                      {m.label}
                      <i data-lucide="chevron-down" className="co-caret"></i>
                    </button>
                    <div className="co-drop">
                      {m.items.map((l) => (
                        <a key={l.href + l.label} href={l.href}>
                          {l.label}
                          {l.note && <small>{l.note}</small>}
                        </a>
                      ))}
                    </div>
                  </>
                ) : (
                  <a href={m.href}>{m.label}</a>
                )}
              </div>
            ))}
          </nav>
          <button id="coMenuBtn" className="co-burger" type="button" aria-label="Open menu" aria-expanded="false">
            <i data-lucide="menu"></i>
          </button>
        </div>
        <div id="coMobileMenu">
          {MENU.map((m) =>
            m.items ? (
              <details key={m.label}>
                <summary>{m.label}</summary>
                {m.items.map((l) => (
                  <a key={l.href + l.label} href={l.href}>{l.label}</a>
                ))}
              </details>
            ) : (
              <a key={m.label} href={m.href}>{m.label}</a>
            ),
          )}
          <div className="co-m-btns">
            <a href={BRAND.studentLogin} style={{ background: "#f97316" }}>Student Login</a>
            <a href={BRAND.centreLogin} style={{ background: "#2563eb" }}>Centre Login</a>
          </div>
        </div>
      </header>
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){var p=location.pathname.split("/").pop()||"index.html";document.querySelectorAll(".co-nav>div>a").forEach(function(a){if(a.getAttribute("href")===p)a.classList.add("co-active")});var b=document.getElementById("coMenuBtn"),m=document.getElementById("coMobileMenu");b.addEventListener("click",function(){var open=m.classList.toggle("show");b.setAttribute("aria-expanded",open?"true":"false");b.setAttribute("aria-label",open?"Close menu":"Open menu")});m.querySelectorAll("a").forEach(function(a){a.addEventListener("click",function(){m.classList.remove("show")})});})();`,
        }}
      />
    </>
  );
}
