import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import WhatsappWidget from "../components/WhatsappWidget";
import { BRAND } from "../components/brand";
import js_c1268ab4 from "../behaviour/c1268ab4.js?raw";
import js_gallery from "../behaviour/gallery.js?raw";
import css_gallery from "../styles/gallery.css?raw";

/**
 * gallery.html — photos of the institute, managed from the ERP
 * (Main Website → Gallery). The page ships an empty container; the photos
 * are fetched in the browser by behaviour/gallery.js, so a new photo shows
 * without a rebuild.
 */

const CSS = `
*{box-sizing:border-box}
body{margin:0;font-family:Poppins,system-ui,sans-serif;color:#0f172a;background:#f4f7fc}
.cc-hero{background:linear-gradient(120deg,#0b2350,#1d4ed8);color:#fff;padding:56px 16px;text-align:center}
.cc-hero h1{margin:0;font-size:clamp(28px,4vw,44px);font-weight:800}
.cc-hero p{margin:12px auto 0;max-width:720px;color:#d6e0fa;line-height:1.7}
.cc-crumb{margin-top:14px;font-size:14px;color:#fdba74}.cc-crumb a{color:#fff;text-decoration:none}
.cc-wrap{max-width:1240px;margin:0 auto;padding:56px 16px}
`;

const JS = `
document.addEventListener("DOMContentLoaded",function(){if(window.lucide)lucide.createIcons()});
`;

export default function Gallery() {
  return (
    <html lang="en">
      <head>
        <script src="/cms-config.js"></script>
        <script src="/cms.js" defer></script>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{`Our Gallery | ${BRAND.name}`}</title>
        <meta
          name="description"
          content={`Photos of ${BRAND.name}, ${BRAND.addressShort}: classrooms, the computer lab, events, students and certificates.`}
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
          <p>A look inside {BRAND.name} — our classrooms, computer lab, events and the students who learn with us.</p>
          <div className="cc-crumb">
            <a href="index.html">Home</a> / Gallery
          </div>
        </section>

        <div className="cc-wrap">
          <div id="coGallery" data-gallery="full" data-cms-ui="" aria-live="polite">
            <noscript>Please turn on JavaScript to see the photos.</noscript>
          </div>
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
