import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import WhatsappWidget from "../components/WhatsappWidget";
import { BRAND, REGISTRATIONS } from "../components/brand";
import js_c1268ab4 from "../behaviour/c1268ab4.js?raw";

/**
 * index.html — the home page.
 *
 * Laid out like a franchise computer-education portal: a banner slider with
 * the registration badges under it, quick links, a demo-class enquiry beside
 * the facilities, the institute's story, its features, certificate lookup,
 * the authorisation certificates, featured courses and contact.
 *
 * The enquiry form needs no script of its own: public/apply.js (loaded by
 * cms.js on every page) takes over any form that asks for a mobile number and
 * files it as an admission lead in the ERP.
 */

const FEATURES = [
  "Registered with the Ministry of Corporate Affairs (Govt. of India)",
  "ISO 9001:2015 certified quality management",
  "MSME (Udyam) registered enterprise",
  "Online certificate verification",
  "Online result and admit card download",
  "Student login with courses, fees, attendance and results",
  "Online exams with instant marks",
  "Student ID cards and QR-based attendance",
  "Certificates and marksheets with QR verification",
  "Centre login panel for franchise partners",
  "Online admission from the website",
  "Admission guidance and counselling for diploma and degree courses",
  "Practical training in modern computer labs",
  "Placement support after course completion",
];

const FACILITIES = [
  { icon: "award", title: "Govt. Registered Certificate", text: "Certificates issued by an MCA-registered, ISO 9001:2015 certified institute, verifiable online." },
  { icon: "graduation-cap", title: "Quality Education", text: "Trained faculty, small batches and a syllabus built around what employers ask for." },
  { icon: "monitor", title: "Advance Computer Skills", text: "From computer basics to Tally, design, coding and AI tools — practical, hands-on learning." },
  { icon: "briefcase", title: "Career & Placement", text: "Admission counselling for higher studies and placement support once you finish." },
];

const COURSES = [
  { title: "Diploma in Computer Application (DCA)", href: "computer-course.html", points: ["Computer Fundamentals", "Windows & File Management", "MS Word, Excel, PowerPoint", "Internet & Email", "Practical & Viva"] },
  { title: "Advance Diploma in Computer Application (ADCA)", href: "computer-course.html", points: ["Everything in DCA", "Tally Prime with GST", "HTML & Web Basics", "Photoshop & CorelDRAW", "Project & Viva"] },
  { title: "Tally Prime with GST", href: "tally-prime.html", points: ["Accounting Basics", "Company & Ledger Creation", "Vouchers & Inventory", "GST, TDS & Payroll", "Practical & Viva"] },
  { title: "Typing (Hindi & English)", href: "typing.html", points: ["Keyboard Basics", "English Typing", "Hindi Typing", "Speed & Accuracy Practice", "Typing Test"] },
  { title: "Graphic Design", href: "graphics.html", points: ["Design Fundamentals", "Adobe Photoshop", "CorelDRAW", "Logo, Banner & Poster Design", "Portfolio Project"] },
  { title: "Python Programming", href: "python.html", points: ["Python Basics", "Control Flow & Functions", "Lists, Dicts & Files", "Mini Projects", "Practical & Viva"] },
  { title: "Web Development", href: "fullstack.html", points: ["HTML & CSS", "JavaScript", "Responsive Design", "React Basics", "Website Project"] },
  { title: "Digital Marketing", href: "digital-marketing.html", points: ["Social Media Marketing", "SEO Basics", "Google & Meta Ads", "Content Creation", "Live Project"] },
];

const SLIDES = [
  {
    kicker: "Admission Open 2026–27",
    title: "बिहार का भरोसेमंद कंप्यूटर संस्थान",
    sub: "जहाँ आपको मिलती है सरकारी पंजीकृत सर्टिफिकेट के साथ प्रैक्टिकल कंप्यूटर शिक्षा",
    list: ["Student Login Panel", "Online Result", "ID Card", "QR on Certificate", "Online Admission", "Govt. Registered Certificate"],
    cta: { href: "/computercentre/apply", label: "Apply for Admission" },
  },
  {
    kicker: "ISO 9001:2015 Certified",
    title: "Learn • Grow • Succeed",
    sub: "DCA, ADCA, Tally Prime with GST, Typing, Graphic Design, Programming and AI — taught hands-on by trained faculty.",
    list: ["MCA Registered Company", "MSME Udyam Registered", "Practical Labs", "Placement Support"],
    cta: { href: "computer-course.html", label: "Explore Courses" },
  },
  {
    kicker: "Franchise Opportunity",
    title: "कंप्यूटर सेंटर खोलने का सुनहरा मौका",
    sub: "Run your own centre under Career Optics with a complete online panel for admissions, fees, exams and certificates.",
    list: ["Centre Login Panel", "Online Exams", "Certificate & Marksheet", "Admission Leads"],
    cta: { href: "franchise.html", label: "Become a Partner" },
  },
];

const BADGES = [
  { top: "MCA", bottom: "Ministry of Corporate Affairs" },
  { top: "ISO", bottom: "9001:2015 Certified" },
  { top: "MSME", bottom: "Udyam Registered" },
  { top: "TAN", bottom: "Income Tax Dept." },
];

const CSS = `
:root{--co-navy:#0b2350;--co-navy2:#13336e;--co-blue:#1d4ed8;--co-orange:#f97316;--co-orange2:#fb923c;--co-ink:#0f172a;--co-muted:#5b6b88;--co-bg:#f4f7fc}
*{box-sizing:border-box}
body{margin:0;font-family:Poppins,system-ui,sans-serif;color:var(--co-ink);background:#fff}
img{max-width:100%}
.co-wrap{max-width:1240px;margin:0 auto;padding:0 16px}
.co-sec{padding:72px 0}
.co-kicker{display:inline-block;color:var(--co-orange);font-weight:700;letter-spacing:.16em;text-transform:uppercase;font-size:13px}
.co-h2{font-size:clamp(26px,3.4vw,38px);font-weight:800;color:var(--co-navy);margin:8px 0 0;line-height:1.2}
.co-h2 span{color:var(--co-orange)}
.co-center{text-align:center}
.co-lead{color:var(--co-muted);line-height:1.8;max-width:760px;margin:14px auto 0}
.co-btn{display:inline-flex;align-items:center;gap:8px;background:var(--co-orange);color:#fff;font-weight:700;padding:13px 26px;border-radius:8px;text-decoration:none;border:0;cursor:pointer;font-size:15px;font-family:inherit}
.co-btn:hover{background:#ea580c}
.co-btn.co-ghost{background:transparent;border:2px solid #fff}
.co-btn svg,.co-btn i{width:18px;height:18px}

/* ticker */
.co-ticker{background:var(--co-orange);color:#fff;font-weight:600;font-size:14px;overflow:hidden;white-space:nowrap}
.co-ticker .co-wrap{display:flex;align-items:center;gap:14px;height:40px}
.co-ticker b{background:var(--co-navy);padding:4px 12px;border-radius:4px;flex-shrink:0;font-size:12.5px;letter-spacing:.06em}
.co-ticker-track{overflow:hidden;flex:1}
.co-ticker-track span{display:inline-block;padding-left:100%;animation:co-tick 30s linear infinite}
@keyframes co-tick{to{transform:translateX(-100%)}}

/* hero slider */
.co-hero{position:relative;background:linear-gradient(120deg,#0b2350 0%,#163b86 55%,#1d4ed8 100%);color:#fff;overflow:hidden}
.co-hero::before{content:"";position:absolute;right:-160px;top:-160px;width:520px;height:520px;border-radius:50%;background:rgba(249,115,22,.18)}
.co-hero::after{content:"";position:absolute;left:-120px;bottom:-200px;width:420px;height:420px;border-radius:50%;background:rgba(255,255,255,.06)}
.co-slides{position:relative;min-height:520px;padding:0 48px}
.co-slide{position:absolute;inset:0;display:grid;grid-template-columns:1.25fr .75fr;align-items:center;gap:40px;padding:56px 0 64px;opacity:0;visibility:hidden;transition:opacity .6s}
.co-slide.on{opacity:1;visibility:visible;position:relative}
.co-slide-k{display:inline-block;background:var(--co-orange);color:#fff;font-weight:700;font-size:13px;padding:6px 14px;border-radius:999px;letter-spacing:.04em}
.co-slide h1{font-size:clamp(30px,4.4vw,54px);line-height:1.15;font-weight:800;margin:18px 0 12px}
.co-slide p{color:#d6e0fa;font-size:17px;line-height:1.7;max-width:620px;margin:0 0 22px}
.co-slide ul{list-style:none;margin:0 0 28px;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;max-width:600px}
.co-slide li{display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.16);border-radius:8px;padding:10px 14px;font-weight:600;font-size:15px}
.co-slide li::before{content:"";width:10px;height:10px;border-radius:50%;background:var(--co-orange2);flex-shrink:0}
.co-hero-art{position:relative;display:flex;justify-content:center}
.co-hero-art .co-ring{width:min(380px,80vw);aspect-ratio:1;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 30px 60px rgba(0,0,0,.3),0 0 0 14px rgba(255,255,255,.12),0 0 0 28px rgba(255,255,255,.06)}
.co-hero-art .co-ring{overflow:hidden}
.co-hero-art img{width:72%;height:72%;object-fit:contain}
.co-hero-art .co-no1{position:absolute;right:4%;bottom:6%;width:104px;height:104px;border-radius:50%;background:radial-gradient(circle at 30% 30%,#fde68a,#f59e0b 60%,#b45309);color:#3b1d00;display:flex;flex-direction:column;align-items:center;justify-content:center;font-weight:800;box-shadow:0 10px 24px rgba(0,0,0,.35);text-align:center;line-height:1.05}
.co-hero-art .co-no1 small{font-size:9.5px;letter-spacing:.08em}
.co-hero-art .co-no1 b{font-size:20px}
.co-dots{position:absolute;left:0;right:0;bottom:22px;display:flex;justify-content:center;gap:8px;z-index:2}
.co-dots button{width:12px;height:12px;border-radius:999px;border:0;background:rgba(255,255,255,.4);cursor:pointer;padding:0;transition:.25s}
.co-dots button.on{width:34px;background:var(--co-orange)}
.co-arrow{position:absolute;top:50%;transform:translateY(-50%);z-index:2;width:44px;height:44px;border-radius:50%;border:0;background:rgba(255,255,255,.14);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center}
.co-arrow:hover{background:var(--co-orange)}.co-arrow.l{left:12px}.co-arrow.r{right:12px}
.co-arrow svg,.co-arrow i{width:22px;height:22px}

/* registration strip */
.co-badges{background:#fff;border-bottom:1px solid #e7ecf5}
.co-badges .co-wrap{display:grid;grid-template-columns:repeat(4,1fr);gap:0}
.co-badge{display:flex;align-items:center;gap:12px;justify-content:center;padding:18px 10px;border-right:1px solid #eef2f8;text-decoration:none}
.co-badge:last-child{border-right:0}
.co-badge b{width:56px;height:56px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;color:#fff;background:linear-gradient(135deg,var(--co-navy),var(--co-blue));flex-shrink:0;letter-spacing:.02em}
.co-badge:nth-child(even) b{background:linear-gradient(135deg,#ea580c,var(--co-orange2))}
.co-badge span{color:var(--co-navy);font-weight:700;font-size:14px;line-height:1.3}

/* quick band */
.co-band{margin-top:44px}
.co-band-in{background:var(--co-navy);border-radius:16px;padding:34px 36px;display:grid;grid-template-columns:.9fr 2fr;gap:30px;align-items:center;color:#fff;box-shadow:0 20px 40px rgba(11,35,80,.18)}
.co-band h2{font-size:clamp(22px,2.6vw,30px);font-weight:800;margin:0;line-height:1.25}
.co-band-links{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.co-band-links a{display:flex;flex-direction:column;align-items:center;gap:10px;padding:18px 8px;border-radius:12px;color:#fff;text-decoration:none;font-weight:600;background:rgba(255,255,255,.05);transition:.2s}
.co-band-links a:hover{background:rgba(249,115,22,.18);transform:translateY(-3px)}
.co-band-links svg,.co-band-links i{width:44px;height:44px;color:#fbbf24}

/* stats */
.co-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-top:28px}
.co-stat{background:#fff;border:1px solid #e7ecf5;border-radius:14px;padding:26px 16px;text-align:center;box-shadow:0 10px 24px rgba(11,35,80,.06)}
.co-stat svg,.co-stat i{width:34px;height:34px;color:var(--co-navy)}
.co-stat b{display:block;font-size:30px;font-weight:800;color:var(--co-navy);margin-top:8px}
.co-stat span{color:var(--co-muted);font-size:14px}

/* enquiry + facilities */
.co-split{display:grid;grid-template-columns:1fr 1fr;margin-top:72px}
.co-split-l{background:#13336e;padding:56px 40px;display:flex;justify-content:center}
.co-split-r{background:var(--co-navy);padding:56px 40px;color:#fff}
.co-form{width:100%;max-width:470px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.25);border-radius:12px;padding:26px}
.co-form h3{color:#fb923c;text-align:center;font-size:24px;margin:0 0 18px;font-weight:800}
.co-form input,.co-form select,.co-form textarea{width:100%;border:0;border-radius:6px;padding:12px 14px;margin:0 0 12px;font:500 14px Poppins,system-ui,sans-serif;color:var(--co-ink);background:#fff}
.co-form textarea{min-height:80px;resize:vertical}
.co-form .co-btn{width:100%;justify-content:center;background:#fbbf24;color:#1f1300}
.co-form .co-btn:hover{background:#f59e0b}
.co-form small{display:block;text-align:center;color:#c7d2ec;margin-top:10px;font-size:12px}
.co-split-r h2{font-size:30px;margin:0 0 26px;font-weight:800}
.co-fac{display:flex;gap:18px;margin-bottom:24px}
.co-fac svg,.co-fac i{width:46px;height:46px;color:#fbbf24;flex-shrink:0}
.co-fac h4{margin:0 0 6px;font-size:18px;font-weight:700}
.co-fac p{margin:0;color:#c7d2ec;line-height:1.65;font-size:14.5px}

/* about */
.co-about{display:grid;grid-template-columns:.85fr 1.15fr;gap:48px;align-items:center}
.co-about-img{position:relative;background:var(--co-bg);border-radius:20px;padding:30px;display:flex;justify-content:center}
.co-about-img img{width:100%;max-width:400px}
.co-about-img .co-tag{position:absolute;left:-10px;bottom:24px;background:var(--co-orange);color:#fff;padding:14px 18px;border-radius:12px;font-weight:700;box-shadow:0 12px 24px rgba(249,115,22,.35)}
.co-about-img .co-tag b{display:block;font-size:22px}
.co-about p{color:var(--co-muted);line-height:1.85;margin:14px 0 0}
.co-about p strong{color:var(--co-navy)}
.co-regs{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:22px}
.co-regs div{background:var(--co-bg);border-left:4px solid var(--co-orange);border-radius:8px;padding:10px 14px}
.co-regs small{display:block;color:var(--co-muted);font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.06em}
.co-regs b{color:var(--co-navy);font-size:14.5px;word-break:break-all}

/* features */
.co-feat-bg{background:var(--co-bg)}
.co-feat{display:grid;grid-template-columns:repeat(2,1fr);gap:12px 28px;margin-top:36px}
.co-feat div{display:flex;gap:12px;align-items:flex-start;background:#fff;border-radius:10px;padding:14px 16px;border:1px solid #e7ecf5;font-weight:600;color:var(--co-navy)}
.co-feat svg,.co-feat i{width:22px;height:22px;color:#16a34a;flex-shrink:0;margin-top:1px}

/* verify */
.co-verify{background:linear-gradient(120deg,var(--co-orange),#ea580c);color:#fff;border-radius:16px;padding:34px;display:grid;grid-template-columns:1fr 1.2fr;gap:24px;align-items:center}
.co-verify h2{margin:0;font-size:28px;font-weight:800}
.co-verify p{margin:6px 0 0;color:#ffedd5}
.co-verify form{display:flex;gap:10px}
.co-verify input{flex:1;border:0;border-radius:8px;padding:14px 16px;font:500 15px Poppins,system-ui,sans-serif;min-width:0}
.co-verify button{border:0;border-radius:8px;background:var(--co-navy);color:#fff;font:700 15px Poppins,system-ui,sans-serif;padding:0 22px;cursor:pointer}

/* certificates */
.co-certs{display:grid;grid-template-columns:repeat(4,1fr);gap:22px;margin-top:40px}
.co-cert{background:#fff;border:1px solid #e7ecf5;border-radius:14px;overflow:hidden;box-shadow:0 12px 28px rgba(11,35,80,.08);cursor:zoom-in;transition:.2s;text-align:left;padding:0;font-family:inherit}
.co-cert:hover{transform:translateY(-5px);box-shadow:0 20px 40px rgba(11,35,80,.16)}
.co-cert-img{background:var(--co-bg);padding:14px;aspect-ratio:3/4;display:flex;align-items:center;justify-content:center}
.co-cert-img img{max-height:100%;object-fit:contain;box-shadow:0 6px 16px rgba(0,0,0,.12)}
.co-cert-body{padding:16px 18px;border-top:3px solid var(--co-orange)}
.co-cert-body h4{margin:0;color:var(--co-navy);font-size:16px;font-weight:700}
.co-cert-body p{margin:4px 0 8px;color:var(--co-muted);font-size:12.5px;line-height:1.5}
.co-cert-body span{display:inline-block;background:#fff4ec;color:#c2410c;font-weight:700;font-size:12px;padding:4px 10px;border-radius:6px;word-break:break-all}
.co-lb{position:fixed;inset:0;background:rgba(5,14,35,.88);z-index:200;display:none;align-items:center;justify-content:center;padding:20px}
.co-lb.on{display:flex}
.co-lb img{max-width:min(92vw,900px);max-height:88vh;border-radius:6px;box-shadow:0 20px 50px rgba(0,0,0,.5);background:#fff}
.co-lb button{position:absolute;top:16px;right:18px;width:46px;height:46px;border-radius:50%;border:0;background:#fff;color:var(--co-navy);font-size:26px;cursor:pointer;line-height:1}

/* courses */
.co-courses{display:grid;grid-template-columns:repeat(4,1fr);gap:22px;margin-top:40px}
.co-course{background:#fff;border:1px solid #e7ecf5;border-radius:14px;padding:22px;display:flex;flex-direction:column;box-shadow:0 10px 24px rgba(11,35,80,.05);transition:.2s}
.co-course:hover{border-color:#fdba74;box-shadow:0 18px 36px rgba(11,35,80,.12)}
.co-course h4{margin:0 0 12px;color:var(--co-navy);font-size:16.5px;line-height:1.35;min-height:44px}
.co-course ul{list-style:none;margin:0 0 18px;padding:0;flex:1}
.co-course li{font-size:13.5px;color:var(--co-muted);padding:5px 0 5px 22px;position:relative;border-bottom:1px dashed #eef2f8}
.co-course li::before{content:"✓";position:absolute;left:0;color:var(--co-orange);font-weight:800}
.co-course a{align-self:flex-start;color:#fff;background:var(--co-navy);text-decoration:none;font-weight:600;font-size:13.5px;padding:9px 18px;border-radius:7px}
.co-course a:hover{background:var(--co-orange)}

/* cta + contact */
.co-cta{background:linear-gradient(120deg,var(--co-navy),var(--co-blue));color:#fff;text-align:center;padding:64px 0}
.co-cta h2{font-size:clamp(26px,3.4vw,38px);margin:0;font-weight:800}
.co-cta p{color:#d6e0fa;margin:12px 0 26px;font-size:17px}
.co-cta .co-help{display:inline-flex;align-items:center;gap:14px;background:#fff;color:var(--co-navy);border-radius:999px;padding:10px 26px 10px 10px;font-weight:800;font-size:20px;text-decoration:none;margin-left:12px}
.co-cta .co-help i,.co-cta .co-help svg{width:44px;height:44px;padding:11px;border-radius:50%;background:var(--co-orange);color:#fff}
.co-contact{display:grid;grid-template-columns:1fr 1.3fr;gap:28px;margin-top:40px}
.co-cards{display:grid;gap:16px}
.co-card{display:flex;gap:16px;align-items:flex-start;background:var(--co-bg);border-radius:12px;padding:20px}
.co-card i,.co-card svg{width:46px;height:46px;padding:12px;border-radius:12px;background:var(--co-navy);color:#fff;flex-shrink:0}
.co-card h4{margin:0 0 4px;color:var(--co-navy)}
.co-card p,.co-card a{margin:0;color:var(--co-muted);text-decoration:none;line-height:1.6;word-break:break-word}
.co-map{border-radius:14px;overflow:hidden;min-height:340px;border:1px solid #e7ecf5}
.co-map iframe{width:100%;height:100%;min-height:340px;border:0}

@media (max-width:1100px){.co-certs,.co-courses{grid-template-columns:repeat(2,1fr)}}
@media (max-width:900px){
 .co-slide{grid-template-columns:1fr;padding:40px 0 70px;gap:26px;text-align:left}
 .co-hero-art{order:-1}.co-hero-art .co-ring{width:200px}.co-hero-art .co-no1{width:76px;height:76px;right:calc(50% - 130px)}.co-hero-art .co-no1 b{font-size:15px}
 .co-badges .co-wrap{grid-template-columns:repeat(2,1fr)}.co-badge:nth-child(2){border-right:0}.co-badge{border-bottom:1px solid #eef2f8}
 .co-band-in{grid-template-columns:1fr;padding:26px 20px}.co-band h2{text-align:center}
 .co-stats{grid-template-columns:repeat(2,1fr)}
 .co-split{grid-template-columns:1fr}.co-split-l,.co-split-r{padding:40px 16px}
 .co-about,.co-verify,.co-contact{grid-template-columns:1fr}
 .co-about-img .co-tag{left:10px}
 .co-feat{grid-template-columns:1fr}
 .co-cta .co-help{margin:14px 0 0}
}
@media (max-width:560px){
 .co-slides{padding:0}
 .co-slide ul{grid-template-columns:1fr}.co-slide li{font-size:14px;padding:8px 12px}
 .co-band-links{grid-template-columns:repeat(2,1fr)}
 .co-certs,.co-courses{grid-template-columns:1fr}
 .co-regs{grid-template-columns:1fr}
 .co-verify{padding:24px 18px}.co-verify form{flex-direction:column}.co-verify button{padding:13px}
 .co-arrow{display:none}
 .co-sec{padding:52px 0}
}
`;

const JS = `
document.addEventListener("DOMContentLoaded",function(){
  var slides=[].slice.call(document.querySelectorAll(".co-slide"));
  var dots=[].slice.call(document.querySelectorAll(".co-dots button"));
  var i=0,timer;
  function show(n){i=(n+slides.length)%slides.length;slides.forEach(function(s,k){s.classList.toggle("on",k===i)});dots.forEach(function(d,k){d.classList.toggle("on",k===i)})}
  function auto(){clearInterval(timer);timer=setInterval(function(){show(i+1)},6000)}
  dots.forEach(function(d,k){d.addEventListener("click",function(){show(k);auto()})});
  var l=document.querySelector(".co-arrow.l"),r=document.querySelector(".co-arrow.r");
  l&&l.addEventListener("click",function(){show(i-1);auto()});
  r&&r.addEventListener("click",function(){show(i+1);auto()});
  if(slides.length){show(0);auto()}

  var lb=document.getElementById("coLightbox"),lbImg=lb&&lb.querySelector("img");
  document.querySelectorAll("[data-cert]").forEach(function(b){b.addEventListener("click",function(){lbImg.src=b.getAttribute("data-cert");lbImg.alt=b.getAttribute("data-title")||"";lb.classList.add("on")})});
  lb&&lb.addEventListener("click",function(e){if(e.target===lb||e.target.tagName==="BUTTON")lb.classList.remove("on")});
  document.addEventListener("keydown",function(e){if(e.key==="Escape"&&lb)lb.classList.remove("on")});

  var vf=document.getElementById("coVerify");
  vf&&vf.addEventListener("submit",function(e){e.preventDefault();var v=vf.querySelector("input").value.trim();location.href="/verification.html"+(v?"?no="+encodeURIComponent(v):"")+"#certificate"});

  if(window.lucide)lucide.createIcons();
});
`;

export default function Index() {
  return (
    <html lang="en">
      <head>
        <script src="/cms-config.js"></script>
        <script src="/cms.js" defer></script>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{`${BRAND.name} | ISO 9001:2015 Certified Computer Institute, Ara (Bihar)`}</title>
        <meta
          name="description"
          content={`${BRAND.name}, run by ${BRAND.company} — MCA registered, ISO 9001:2015 certified and MSME registered computer institute in Ara, Bhojpur. DCA, ADCA, Tally, Typing, Graphic Design, Programming and AI courses.`}
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

        <div className="co-ticker">
          <div className="co-wrap">
            <b>NEWS</b>
            <div className="co-ticker-track">
              <span>
                Admission open for DCA, ADCA, Tally Prime with GST, Typing, Graphic Design, Programming and AI courses —
                call {BRAND.phone} or apply online. &nbsp;•&nbsp; {BRAND.name} is ISO 9001:2015 certified and MSME (Udyam)
                registered. &nbsp;•&nbsp; Franchise enquiries welcome.
              </span>
            </div>
          </div>
        </div>

        <section className="co-hero" id="home">
          <div className="co-wrap">
            <div className="co-slides">
              {SLIDES.map((s, k) => (
                <div className={`co-slide${k === 0 ? " on" : ""}`} key={s.title}>
                  <div>
                    <span className="co-slide-k">{s.kicker}</span>
                    <h1>{s.title}</h1>
                    <p>{s.sub}</p>
                    <ul>
                      {s.list.map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                    <a className="co-btn" href={s.cta.href}>
                      {s.cta.label}
                      <i data-lucide="arrow-right"></i>
                    </a>
                  </div>
                  <div className="co-hero-art">
                    <div className="co-ring">
                      <img src="/logo.png" alt={BRAND.name} />
                    </div>
                    <div className="co-no1">
                      <small>ISO</small>
                      <b>9001</b>
                      <small>2015</small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button className="co-arrow l" type="button" aria-label="Previous slide"><i data-lucide="chevron-left"></i></button>
          <button className="co-arrow r" type="button" aria-label="Next slide"><i data-lucide="chevron-right"></i></button>
          <div className="co-dots">
            {SLIDES.map((s, k) => (
              <button type="button" key={s.title} className={k === 0 ? "on" : ""} aria-label={`Slide ${k + 1}`}></button>
            ))}
          </div>
        </section>

        <div className="co-badges">
          <div className="co-wrap">
            {BADGES.map((b) => (
              <a className="co-badge" href="certification.html" key={b.top}>
                <b>{b.top}</b>
                <span>{b.bottom}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="co-wrap co-band">
          <div className="co-band-in">
            <h2>Best Institute for IT and Computer Skills</h2>
            <div className="co-band-links">
              <a href="computer-course.html"><i data-lucide="library"></i>Courses</a>
              <a href="franchise.html"><i data-lucide="handshake"></i>Franchise</a>
              <a href="certification.html"><i data-lucide="badge-check"></i>Certification</a>
              <a href="#contact"><i data-lucide="headphones"></i>Contact us</a>
            </div>
          </div>
          <div className="co-stats">
            <div className="co-stat"><i data-lucide="landmark"></i><b>4</b><span>Govt. Registrations</span></div>
            <div className="co-stat"><i data-lucide="shield-check"></i><b>ISO</b><span>9001:2015 Certified</span></div>
            <div className="co-stat"><i data-lucide="book-open"></i><b>20+</b><span>Career Courses</span></div>
            <div className="co-stat"><i data-lucide="calendar-check"></i><b>2026</b><span>Established</span></div>
          </div>
        </div>

        <section className="co-split">
          <div className="co-split-l">
            <form className="co-form" id="enquiry" action="#" method="post">
              <h3>Request a Free Demo Class</h3>
              <input name="name" placeholder="Your name" required />
              <input name="mobile" type="tel" placeholder="Mobile number" pattern="[0-9]{10}" maxLength={10} required />
              <select name="course" defaultValue="">
                <option value="" disabled>Select course</option>
                {COURSES.map((c) => (
                  <option key={c.title}>{c.title}</option>
                ))}
                <option>Other</option>
              </select>
              <input name="city" placeholder="City / District" />
              <textarea name="message" defaultValue="मैं कंप्यूटर कोर्स का फ्री डेमो क्लास लेना चाहता/चाहती हूँ।"></textarea>
              <button className="co-btn" type="submit">Submit Query</button>
              <small>We will call you back within one working day.</small>
            </form>
          </div>
          <div className="co-split-r">
            <h2>Our Facilities</h2>
            {FACILITIES.map((f) => (
              <div className="co-fac" key={f.title}>
                <i data-lucide={f.icon}></i>
                <div>
                  <h4>{f.title}</h4>
                  <p>{f.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="co-sec" id="about">
          <div className="co-wrap co-about">
            <div className="co-about-img">
              <img src="/logo.png" alt={BRAND.name} />
              <div className="co-tag">
                <b>ISO 9001:2015</b>
                Certified Institute
              </div>
            </div>
            <div>
              <span className="co-kicker">About us</span>
              <h2 className="co-h2">
                Welcome to <span>{BRAND.name}</span>
              </h2>
              <p>
                <strong>{BRAND.name}</strong> is run by <strong>{BRAND.company}</strong>, incorporated on 19 June 2026
                under the Companies Act, 2013 with the Ministry of Corporate Affairs, Government of India. We are
                ISO 9001:2015 certified for admission guidance and counselling in diploma, bachelor and master degree
                courses, and for computer training and placement.
              </p>
              <p>
                From our centre in Ara, Bhojpur we teach practical computer skills — DCA, ADCA, Tally Prime with GST,
                Hindi and English typing, graphic design, programming, web development and AI tools — with trained
                faculty, modern labs and certificates that can be verified online.
              </p>
              <div className="co-regs">
                {REGISTRATIONS.map((r) => (
                  <div key={r.file}>
                    <small>{r.label}</small>
                    <b>{r.value}</b>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="co-sec co-feat-bg">
          <div className="co-wrap">
            <div className="co-center">
              <span className="co-kicker">Why choose us</span>
              <h2 className="co-h2">
                Our Key Benefits <span>&amp; Features</span>
              </h2>
            </div>
            <div className="co-feat">
              {FEATURES.map((f) => (
                <div key={f}>
                  <i data-lucide="circle-check"></i>
                  {f}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="co-sec" style={{ paddingBottom: 0 }}>
          <div className="co-wrap">
            <div className="co-verify">
              <div>
                <h2>Check Certificate Status</h2>
                <p>Enter the certificate or enrolment number printed on your certificate.</p>
              </div>
              <form id="coVerify">
                <input placeholder="Certificate / Enrolment number" aria-label="Certificate number" />
                <button type="submit">Verify</button>
              </form>
            </div>
          </div>
        </section>

        <section className="co-sec" id="certification">
          <div className="co-wrap">
            <div className="co-center">
              <span className="co-kicker">Trusted &amp; registered</span>
              <h2 className="co-h2">
                Our Authorizations <span>&amp; Certifications</span>
              </h2>
              <p className="co-lead">
                {BRAND.company} is registered with the Government of India and certified for quality. Click any
                certificate to view it in full.
              </p>
            </div>
            <div className="co-certs">
              {REGISTRATIONS.map((r) => (
                <button
                  type="button"
                  className="co-cert"
                  key={r.file}
                  data-cert={`/image/certificates/${r.file}.jpg`}
                  data-title={r.title}
                >
                  <div className="co-cert-img">
                    <img src={`/image/certificates/${r.file}-thumb.jpg`} alt={r.title} loading="lazy" />
                  </div>
                  <div className="co-cert-body">
                    <h4>{r.title}</h4>
                    <p>{r.authority}</p>
                    <span>
                      {r.label}: {r.value}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            <div className="co-center" style={{ marginTop: 30 }}>
              <a className="co-btn" href="certification.html">
                View all certificates
                <i data-lucide="arrow-right"></i>
              </a>
            </div>
          </div>
        </section>

        <section className="co-sec co-feat-bg" id="courses">
          <div className="co-wrap">
            <div className="co-center">
              <span className="co-kicker">Our courses</span>
              <h2 className="co-h2">
                Featured <span>Courses</span>
              </h2>
            </div>
            <div className="co-courses">
              {COURSES.map((c) => (
                <div className="co-course" key={c.title}>
                  <h4>{c.title}</h4>
                  <ul>
                    {c.points.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                  <a href={c.href}>View More</a>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="co-cta">
          <div className="co-wrap">
            <h2>Join us and start growing your computer skills</h2>
            <p>Admission open — visit our centre or apply online today.</p>
            <a className="co-btn" href="/computercentre/apply">
              Apply Online
              <i data-lucide="arrow-right"></i>
            </a>
            <a className="co-help" href={`tel:+${BRAND.phoneIntl}`}>
              <i data-lucide="phone-call"></i>
              {BRAND.phone}
            </a>
          </div>
        </section>

        <section className="co-sec" id="contact">
          <div className="co-wrap">
            <div className="co-center">
              <span className="co-kicker">Contact us</span>
              <h2 className="co-h2">
                Need assistance? <span>Call our helpline</span>
              </h2>
            </div>
            <div className="co-contact">
              <div className="co-cards">
                <div className="co-card">
                  <i data-lucide="map-pin"></i>
                  <div>
                    <h4>Visit Us</h4>
                    <p>{BRAND.address}</p>
                  </div>
                </div>
                <div className="co-card">
                  <i data-lucide="phone"></i>
                  <div>
                    <h4>Call Us</h4>
                    <a href={`tel:+${BRAND.phoneIntl}`}>+91 {BRAND.phone}</a>
                    <br />
                    <a href={`tel:+91${BRAND.altPhone}`}>+91 {BRAND.altPhone}</a>
                  </div>
                </div>
                <div className="co-card">
                  <i data-lucide="mail"></i>
                  <div>
                    <h4>Email Us</h4>
                    <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>
                  </div>
                </div>
              </div>
              <div className="co-map">
                <iframe
                  title="Career Optics Computer Centre on the map"
                  loading="lazy"
                  src={"https://maps.google.com/maps?q=" + encodeURIComponent("Bandhan Tola, Nawada, Ara, Bhojpur, Bihar 802301") + "&output=embed"}
                ></iframe>
              </div>
            </div>
          </div>
        </section>

        <div className="co-lb" id="coLightbox" role="dialog" aria-modal="true">
          <button type="button" aria-label="Close">×</button>
          <img src="" alt="" />
        </div>

        <SiteFooter />
        <WhatsappWidget />
        <script dangerouslySetInnerHTML={{ __html: js_c1268ab4 }} />
        <script dangerouslySetInnerHTML={{ __html: JS }} />
      </body>
    </html>
  );
}
