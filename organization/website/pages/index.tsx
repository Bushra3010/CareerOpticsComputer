import DivBlock from "../components/DivBlock";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import StyleBlock from "../components/StyleBlock";
import StyleBlock2 from "../components/StyleBlock2";
import WhatsappWidget from "../components/WhatsappWidget";
import css_32f7cc4c from "../styles/32f7cc4c.css?raw";
import js_0023a4f0 from "../behaviour/0023a4f0.js?raw";
import js_73893071 from "../behaviour/73893071.js?raw";
import js_c1268ab4 from "../behaviour/c1268ab4.js?raw";
import js_ea05b2d5 from "../behaviour/ea05b2d5.js?raw";

/** index.html */
export default function Index() {
  return (
    <html lang="en">
      <head>
        <script src="/cms-config.js"></script>
        <script src="/cms.js" defer></script>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>
          Career Optics Computer Centre | Education • Software • Skill Development
        </title>
        <link rel="stylesheet" href="style.css" />
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href={"https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap"} rel="stylesheet" />
        <script src="https://unpkg.com/lucide@latest"></script>
        <script dangerouslySetInnerHTML={{ __html: js_0023a4f0 }} />
        <style dangerouslySetInnerHTML={{ __html: css_32f7cc4c }} />
      </head>
      <body>
        <SiteHeader />
        <script dangerouslySetInnerHTML={{ __html: js_73893071 }} />
        <StyleBlock />
        <section id="home" className="hero">
          <div className="hero-container">
            <div className="hero-grid grid grid-cols-[43%_57%] items-center min-h-[800px]">
              <div className="hero-left animate-fade-left">
                <h1 className="hero-title font-extrabold">
                  <span className="block text-[green]">
                    {" "}We Devlop Your Digital Skils{" "}
                  </span>
                  {" "}
                  <span className="block text-[#08089d]">
                    {" "}Discover Your Potential{" "}
                  </span>
                  {" "}
                  <span className="block text-[#008d0b]">
                    {" "}Develop Your Coding Skills{" "}
                  </span>
                  {" "}
                  <span className="block text-[red]">
                    {" "}Shape Your Career{" "}
                  </span>
                  {" "}
                  <span className="block text-[darkblue]">
                    {" "}Lead the Future 🚀{" "}
                  </span>
                  <div className="mt-7">
                    <a href="#courses" className="main-btn">
                      {" "}Explore Courses{" "}
                      <i data-lucide="arrow-right" className="w-4 h-4">
                        {" "}
                      </i>
                      {" "}
                    </a>
                  </div>
                </h1>
              </div>
              <div className="visual-wrapper">
                <div className="visual-area">
                  <div className="ring ring-1"></div>
                  <div className="ring ring-2"></div>
                  <div className="ring ring-3"></div>
                  <div className="dot dot-1"></div>
                  <div className="dot dot-2"></div>
                  <div className="dot dot-3"></div>
                  <div className="dot dot-4"></div>
                  <div className="dot dot-5"></div>
                  <div className="skill skill-1 label-float">
                    Website Designing & Development
                  </div>
                  <div className="skill skill-2 label-float">
                    Digital Marketing With A.I
                  </div>
                  <div className="skill skill-3 label-float">
                    Graphic Designing & 3D Animation
                  </div>
                  <div className="skill skill-4 label-float">
                    Job Internship Program
                  </div>
                  <div className="skill skill-5 label-float">
                    Certified Computer Course
                  </div>
                  <img src="/logo.png" alt="Career Optics Computer Centre" className="person" style={{ objectFit: "contain", width: "360px", height: "360px", left: "145px", top: "90px", bottom: "auto" }} />
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="bg-white border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4">
              <div className="p-7 text-center border-r border-slate-200">
                <i data-lucide="graduation-cap" className="mx-auto text-blue-600"></i>
                <div className="font-bold mt-3">
                  Expert Training
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Practical learning
                </div>
              </div>
              <div className="p-7 text-center md:border-r border-slate-200">
                <i data-lucide="laptop" className="mx-auto text-violet-600"></i>
                <div className="font-bold mt-3">
                  Practical Projects
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Learn by doing
                </div>
              </div>
              <div className="p-7 text-center border-r border-slate-200">
                <i data-lucide="sparkles" className="mx-auto text-cyan-600"></i>
                <div className="font-bold mt-3">
                  AI Tools
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Modern technology
                </div>
              </div>
              <div className="p-7 text-center">
                <i data-lucide="briefcase-business" className="mx-auto text-emerald-600"></i>
                <div className="font-bold mt-3">
                  Career Focus
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Job ready skills
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="roadmap" className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center reveal">
              <div className="text-violet-600 font-black uppercase tracking-[3px] text-sm">
                Learning Path
              </div>
              <h2 className="text-4xl md:text-5xl font-black mt-4">
                Your Journey From{" "}
                <span className="gradient-text">
                  {" "}Beginner To Professional{" "}
                </span>
              </h2>
            </div>
            <div className="grid md:grid-cols-4 gap-6 mt-14">
              <div className="bg-white rounded-3xl p-7 border border-slate-200 relative reveal">
                <div className="text-5xl font-black text-blue-100">
                  01
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mt-4">
                  <i data-lucide="monitor"></i>
                </div>
                <h3 className="text-xl font-black mt-5">
                  Foundation
                </h3>
                <p className="text-slate-500 leading-7 mt-3">
                  Computer basics, internet, MS Office और digital literacy.
                </p>
              </div>
              <div className="bg-white rounded-3xl p-7 border border-slate-200 relative reveal">
                <div className="text-5xl font-black text-violet-100">
                  02
                </div>
                <div className="w-12 h-12 rounded-xl bg-violet-600 text-white flex items-center justify-center mt-4">
                  <i data-lucide="code-2"></i>
                </div>
                <h3 className="text-xl font-black mt-5">
                  Digital Skills
                </h3>
                <p className="text-slate-500 leading-7 mt-3">
                  Web, design, marketing, coding और productivity.
                </p>
              </div>
              <div className="bg-white rounded-3xl p-7 border border-slate-200 relative reveal">
                <div className="text-5xl font-black text-cyan-100">
                  03
                </div>
                <div className="w-12 h-12 rounded-xl bg-cyan-600 text-white flex items-center justify-center mt-4">
                  <i data-lucide="brain"></i>
                </div>
                <h3 className="text-xl font-black mt-5">
                  AI Skills
                </h3>
                <p className="text-slate-500 leading-7 mt-3">
                  Prompt engineering, AI tools और automation.
                </p>
              </div>
              <div className="bg-white rounded-3xl p-7 border border-slate-200 relative reveal">
                <div className="text-5xl font-black text-emerald-100">
                  04
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center mt-4">
                  <i data-lucide="briefcase"></i>
                </div>
                <h3 className="text-xl font-black mt-5">
                  Career Ready
                </h3>
                <p className="text-slate-500 leading-7 mt-3">
                  Portfolio, projects, freelancing और career skills.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <span className="text-blue-600 font-bold uppercase tracking-wider text-sm">
                  {" "}Our Courses{" "}
                </span>
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 mt-3">
                  Computer Se Career Tak
                </h2>
                <p className="text-slate-500 mt-3 max-w-2xl">
                  Practical computer courses, professional skills aur career-focused training ke saath apna future banaiye.
                </p>
              </div>
              <a href="courses.html" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-50 text-blue-600 font-bold hover:bg-blue-600 hover:text-white transition">
                View All Courses
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"></path>
                  {" "}
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </a>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7 mt-12">
              <div className="course-card bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-lg hover:-translate-y-2 hover:shadow-2xl transition-all duration-300">
                <div className="relative h-52 overflow-hidden">
                  <img src={"https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80"} alt="ADCA Computer Course" className="w-full h-full object-cover hover:scale-110 transition duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
                  <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-blue-600 text-white text-xs font-bold shadow-lg">
                    {" "}Computer{" "}
                  </span>
                  {" "}
                  {" "}
                  <span className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-white/95 text-slate-800 text-xs font-bold shadow-lg">
                    {" "}⏱ 12 Months{" "}
                  </span>
                  <div className="absolute bottom-4 left-5 text-white">
                    <p className="text-xs text-blue-200 font-semibold">
                      ADVANCED COURSE
                    </p>
                    <h3 className="text-2xl font-black mt-1">
                      ADCA
                    </h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-slate-500 text-sm leading-6">
                    Advanced Diploma in Computer Applications with office, accounting, designing, internet and web skills.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold">
                      {" "}MS Office{" "}
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold">
                      {" "}Tally{" "}
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold">
                      {" "}Web{" "}
                    </span>
                  </div>
                  <div className="flex items-end justify-between mt-6">
                    <div>
                      <p className="text-xs text-slate-400">
                        Course Fee
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-2xl font-black text-slate-900">
                          {" "}₹4,500{" "}
                        </span>
                        <span className="text-sm text-slate-400 line-through">
                          {" "}₹7,500{" "}
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-red-50 text-red-600 text-xs font-bold">
                      {" "}40% OFF{" "}
                    </span>
                  </div>
                  <a href="course-details.html" className="mt-6 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition">
                    View Details
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"></path>
                      {" "}
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </a>
                </div>
              </div>
              <div className="course-card bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-lg hover:-translate-y-2 hover:shadow-2xl transition-all duration-300">
                <div className="relative h-52 overflow-hidden">
                  <img src={"https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=900&q=80"} alt="Tally Prime GST Course" className="w-full h-full object-cover hover:scale-110 transition duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent"></div>
                  <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-bold">
                    {" "}Accounting{" "}
                  </span>
                  {" "}
                  <span className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-white/95 text-slate-800 text-xs font-bold">
                    {" "}⏱ 3 Months{" "}
                  </span>
                  <div className="absolute bottom-4 left-5 text-white">
                    <p className="text-xs text-emerald-200 font-semibold">
                      PROFESSIONAL COURSE
                    </p>
                    <h3 className="text-xl font-black mt-1">
                      Tally Prime With GST
                    </h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-slate-500 text-sm leading-6">
                    Practical accounting, GST, inventory, billing, reports and complete business accounting.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold">
                      {" "}Tally Prime{" "}
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold">
                      {" "}GST{" "}
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold">
                      {" "}Billing{" "}
                    </span>
                  </div>
                  <div className="flex items-end justify-between mt-6">
                    <div>
                      <p className="text-xs text-slate-400">
                        Course Fee
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-2xl font-black text-slate-900">
                          {" "}₹2,999{" "}
                        </span>
                        <span className="text-sm text-slate-400 line-through">
                          {" "}₹4,999{" "}
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-red-50 text-red-600 text-xs font-bold">
                      {" "}40% OFF{" "}
                    </span>
                  </div>
                  <a href="course-details.html" className="mt-6 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition">
                    View Details
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"></path>
                      {" "}
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </a>
                </div>
              </div>
              <div className="course-card bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-lg hover:-translate-y-2 hover:shadow-2xl transition-all duration-300">
                <div className="relative h-52 overflow-hidden">
                  <img src={"https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=900&q=80"} alt="Graphic Designing Course" className="w-full h-full object-cover hover:scale-110 transition duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent"></div>
                  <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-pink-600 text-white text-xs font-bold">
                    {" "}Design{" "}
                  </span>
                  {" "}
                  <span className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-white/95 text-slate-800 text-xs font-bold">
                    {" "}⏱ 6 Months{" "}
                  </span>
                  <div className="absolute bottom-4 left-5 text-white">
                    <p className="text-xs text-pink-200 font-semibold">
                      CREATIVE COURSE
                    </p>
                    <h3 className="text-xl font-black mt-1">
                      Graphic Designing
                    </h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-slate-500 text-sm leading-6">
                    Photoshop, CorelDRAW, PageMaker, Canva, branding, print design and creative projects.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold">
                      {" "}Photoshop{" "}
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold">
                      {" "}CorelDRAW{" "}
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold">
                      {" "}Canva{" "}
                    </span>
                  </div>
                  <div className="flex items-end justify-between mt-6">
                    <div>
                      <p className="text-xs text-slate-400">
                        Course Fee
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-2xl font-black text-slate-900">
                          {" "}₹3,999{" "}
                        </span>
                        <span className="text-sm text-slate-400 line-through">
                          {" "}₹6,999{" "}
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-red-50 text-red-600 text-xs font-bold">
                      {" "}43% OFF{" "}
                    </span>
                  </div>
                  <a href="course-details.html" className="mt-6 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-pink-600 text-white font-bold hover:bg-pink-700 transition">
                    View Details
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"></path>
                      {" "}
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </a>
                </div>
              </div>
              <div className="course-card bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-lg hover:-translate-y-2 hover:shadow-2xl transition-all duration-300">
                <div className="relative h-52 overflow-hidden">
                  <img src={"https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80"} alt="Digital Marketing Course" className="w-full h-full object-cover hover:scale-110 transition duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent"></div>
                  <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-violet-600 text-white text-xs font-bold">
                    {" "}Marketing{" "}
                  </span>
                  {" "}
                  <span className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-white/95 text-slate-800 text-xs font-bold">
                    {" "}⏱ 6 Months{" "}
                  </span>
                  <div className="absolute bottom-4 left-5 text-white">
                    <p className="text-xs text-violet-200 font-semibold">
                      CAREER COURSE
                    </p>
                    <h3 className="text-xl font-black mt-1">
                      Digital Marketing
                    </h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-slate-500 text-sm leading-6">
                    SEO, social media, content marketing, ads, analytics and digital business growth.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold">
                      {" "}SEO{" "}
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold">
                      {" "}Social Media{" "}
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold">
                      {" "}Ads{" "}
                    </span>
                  </div>
                  <div className="flex items-end justify-between mt-6">
                    <div>
                      <p className="text-xs text-slate-400">
                        Course Fee
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-2xl font-black text-slate-900">
                          {" "}₹5,999{" "}
                        </span>
                        <span className="text-sm text-slate-400 line-through">
                          {" "}₹9,999{" "}
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-red-50 text-red-600 text-xs font-bold">
                      {" "}40% OFF{" "}
                    </span>
                  </div>
                  <a href="course-details.html" className="mt-6 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-violet-600 text-white font-bold hover:bg-violet-700 transition">
                    View Details
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"></path>
                      {" "}
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </a>
                </div>
              </div>
              <div className="course-card bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-lg hover:-translate-y-2 hover:shadow-2xl transition-all duration-300">
                <div className="relative h-52 overflow-hidden">
                  <img src={"https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=900&q=80"} alt="Website Design Course" className="w-full h-full object-cover hover:scale-110 transition duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent"></div>
                  <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-orange-500 text-white text-xs font-bold">
                    {" "}Web{" "}
                  </span>
                  {" "}
                  <span className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-white/95 text-slate-800 text-xs font-bold">
                    {" "}⏱ 6 Months{" "}
                  </span>
                  <div className="absolute bottom-4 left-5 text-white">
                    <p className="text-xs text-orange-200 font-semibold">
                      DEVELOPMENT COURSE
                    </p>
                    <h3 className="text-xl font-black mt-1">
                      Website Design
                    </h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-slate-500 text-sm leading-6">
                    HTML, CSS, JavaScript, responsive design, WordPress, Elementor and practical websites.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold">
                      {" "}HTML{" "}
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold">
                      {" "}CSS{" "}
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold">
                      {" "}JavaScript{" "}
                    </span>
                  </div>
                  <div className="flex items-end justify-between mt-6">
                    <div>
                      <p className="text-xs text-slate-400">
                        Course Fee
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-2xl font-black text-slate-900">
                          {" "}₹4,999{" "}
                        </span>
                        <span className="text-sm text-slate-400 line-through">
                          {" "}₹7,999{" "}
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-red-50 text-red-600 text-xs font-bold">
                      {" "}38% OFF{" "}
                    </span>
                  </div>
                  <a href="course-details.html" className="mt-6 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition">
                    View Details
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"></path>
                      {" "}
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </a>
                </div>
              </div>
              <div className="course-card bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-lg hover:-translate-y-2 hover:shadow-2xl transition-all duration-300">
                <div className="relative h-52 overflow-hidden">
                  <img src={"https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=900&q=80"} alt="Python Programming Course" className="w-full h-full object-cover hover:scale-110 transition duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"></div>
                  <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-yellow-500 text-white text-xs font-bold">
                    {" "}Programming{" "}
                  </span>
                  {" "}
                  <span className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-white/95 text-slate-800 text-xs font-bold">
                    {" "}⏱ 6 Months{" "}
                  </span>
                  <div className="absolute bottom-4 left-5 text-white">
                    <p className="text-xs text-yellow-200 font-semibold">
                      PROGRAMMING COURSE
                    </p>
                    <h3 className="text-xl font-black mt-1">
                      Python Programming
                    </h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-slate-500 text-sm leading-6">
                    Python programming, OOP, automation, databases and practical programming projects.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold">
                      {" "}Python{" "}
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold">
                      {" "}OOP{" "}
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold">
                      {" "}Projects{" "}
                    </span>
                  </div>
                  <div className="flex items-end justify-between mt-6">
                    <div>
                      <p className="text-xs text-slate-400">
                        Course Fee
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-2xl font-black text-slate-900">
                          {" "}₹4,999{" "}
                        </span>
                        <span className="text-sm text-slate-400 line-through">
                          {" "}₹7,999{" "}
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-red-50 text-red-600 text-xs font-bold">
                      {" "}38% OFF{" "}
                    </span>
                  </div>
                  <a href="course-details.html" className="mt-6 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition">
                    View Details
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"></path>
                      {" "}
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-14 items-center">
              <div>
                <span className="text-blue-600 font-bold uppercase tracking-wider text-sm">
                  {" "}Why PNS Digiskills Academy?{" "}
                </span>
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 mt-3">
                  Sirf Certificate Nahi,{" "}
                  <span className="gradient-text">
                    {" "}Skill Seekhiye{" "}
                  </span>
                </h2>
                <p className="text-slate-500 mt-5 leading-8">
                  PNS Digiskills ka focus practical computer education par hai. Hum students ko concepts ke saath hands-on practice aur project-based learning provide karte hain.
                </p>
                <div className="mt-9 space-y-5">
                  <div className="flex gap-4">
                    <div className="w-11 h-11 shrink-0 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <i data-lucide="laptop" className="w-5 h-5"></i>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">
                        Practical Computer Lab
                      </h3>
                      <p className="text-slate-500 mt-1">
                        Practice-oriented computer learning environment.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-11 h-11 shrink-0 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                      <i data-lucide="users" className="w-5 h-5"></i>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">
                        Guided Learning
                      </h3>
                      <p className="text-slate-500 mt-1">
                        Instructor guidance during your learning journey.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-11 h-11 shrink-0 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <i data-lucide="folder-kanban" className="w-5 h-5"></i>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">
                        Project-Based Practice
                      </h3>
                      <p className="text-slate-500 mt-1">
                        Work on practical assignments and real-world projects.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-11 h-11 shrink-0 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                      <i data-lucide="award" className="w-5 h-5"></i>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">
                        Course Certificate
                      </h3>
                      <p className="text-slate-500 mt-1">
                        Certificate on successful course completion.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-[2rem] bg-gradient-to-br from-blue-600 to-violet-700 p-8 md:p-12 text-white">
                <div className="text-blue-100 text-sm font-bold uppercase tracking-wider">
                  Start Today
                </div>
                <h3 className="text-3xl md:text-4xl font-black mt-3">
                  Aapko Kaunsa Course Karna Chahiye?
                </h3>
                <p className="text-blue-100 mt-5 leading-7">
                  Agar aap confused hain ki Computer, Accounting, Designing, Marketing ya Programming mein se kya seekhna chahiye, hum aapko suitable learning path choose karne mein guide karenge.
                </p>
                <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                      <i data-lucide="check" className="w-4 h-4"></i>
                    </div>
                    Course Selection Guidance
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                      <i data-lucide="check" className="w-4 h-4"></i>
                    </div>
                    Career-Oriented Advice
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                      <i data-lucide="check" className="w-4 h-4"></i>
                    </div>
                    Admission Assistance
                  </div>
                </div>
                <a href="contact.html" className="inline-flex items-center gap-2 mt-9 px-6 py-3.5 rounded-xl bg-white text-blue-700 font-bold hover:bg-blue-50 transition">
                  Talk To Counsellor
                  <i data-lucide="arrow-right" className="w-5 h-5"></i>
                </a>
              </div>
            </div>
          </div>
        </section>
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-14 items-center">
              <div>
                <span className="text-blue-600 font-bold uppercase tracking-wider text-sm">
                  {" "}Who Can Join?{" "}
                </span>
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 mt-3">
                  Courses For{" "}
                  <span className="gradient-text">
                    {" "}Everyone{" "}
                  </span>
                </h2>
                <p className="text-slate-500 mt-5 leading-8">
                  Aap student hain, job seeker hain, business karte hain ya apna freelancing career start karna chahte hain — apne goal ke according course choose kar sakte hain.
                </p>
                <div className="grid sm:grid-cols-2 gap-4 mt-9">
                  <div className="flex gap-4 p-5 rounded-2xl bg-blue-50">
                    <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <i data-lucide="graduation-cap" className="w-5 h-5"></i>
                    </div>
                    <div>
                      <h3 className="font-bold">
                        Students
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        Academic + career skills
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-5 rounded-2xl bg-violet-50">
                    <div className="w-11 h-11 rounded-xl bg-violet-600 text-white flex items-center justify-center shrink-0">
                      <i data-lucide="briefcase" className="w-5 h-5"></i>
                    </div>
                    <div>
                      <h3 className="font-bold">
                        Job Seekers
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        Job-ready digital skills
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-5 rounded-2xl bg-green-50">
                    <div className="w-11 h-11 rounded-xl bg-green-600 text-white flex items-center justify-center shrink-0">
                      <i data-lucide="store" className="w-5 h-5"></i>
                    </div>
                    <div>
                      <h3 className="font-bold">
                        Business Owners
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        Digital business skills
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-5 rounded-2xl bg-orange-50">
                    <div className="w-11 h-11 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0">
                      <i data-lucide="rocket" className="w-5 h-5"></i>
                    </div>
                    <div>
                      <h3 className="font-bold">
                        Freelancers
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        Online earning skills
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-slate-950 rounded-[2rem] p-8 md:p-10 text-white">
                <h3 className="text-2xl font-black">
                  Learning Mode
                </h3>
                <p className="text-slate-400 mt-3">
                  Choose the learning format that works for you.
                </p>
                <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-5">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
                      <i data-lucide="building-2" className="w-6 h-6"></i>
                    </div>
                    <div>
                      <h4 className="font-bold">
                        Classroom Training
                      </h4>
                      <p className="text-sm text-slate-400 mt-1">
                        Instructor-led practical classes
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-5">
                    <div className="w-12 h-12 rounded-xl bg-violet-600 flex items-center justify-center">
                      <i data-lucide="video" className="w-6 h-6"></i>
                    </div>
                    <div>
                      <h4 className="font-bold">
                        Online Learning
                      </h4>
                      <p className="text-sm text-slate-400 mt-1">
                        Flexible digital learning
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-5">
                    <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center">
                      <i data-lucide="folder-kanban" className="w-6 h-6"></i>
                    </div>
                    <div>
                      <h4 className="font-bold">
                        Project Practice
                      </h4>
                      <p className="text-sm text-slate-400 mt-1">
                        Hands-on assignments and projects
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="benefits" className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-blue-600 font-bold text-sm uppercase tracking-widest">
                {" "}Student Benefits{" "}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black mt-3">
                Benefits That Help You Grow
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
              <div className="bg-white border rounded-3xl p-7 text-center">
                <div className="mx-auto w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                  <i data-lucide="trending-up" className="w-7 h-7"></i>
                </div>
                <h3 className="font-black text-lg mt-5">
                  Growth
                </h3>
                <p className="text-sm text-slate-500 leading-6 mt-2">
                  Opportunities to take on new responsibilities.
                </p>
              </div>
              <div className="bg-white border rounded-3xl p-7 text-center">
                <div className="mx-auto w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                  <i data-lucide="book-open" className="w-7 h-7"></i>
                </div>
                <h3 className="font-black text-lg mt-5">
                  Learning
                </h3>
                <p className="text-sm text-slate-500 leading-6 mt-2">
                  Continuous skill development and learning.
                </p>
              </div>
              <div className="bg-white border rounded-3xl p-7 text-center">
                <div className="mx-auto w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                  <i data-lucide="users-round" className="w-7 h-7"></i>
                </div>
                <h3 className="font-black text-lg mt-5">
                  Teamwork
                </h3>
                <p className="text-sm text-slate-500 leading-6 mt-2">
                  Collaborative and supportive work environment.
                </p>
              </div>
              <div className="bg-white border rounded-3xl p-7 text-center">
                <div className="mx-auto w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center">
                  <i data-lucide="award" className="w-7 h-7"></i>
                </div>
                <h3 className="font-black text-lg mt-5">
                  Recognition
                </h3>
                <p className="text-sm text-slate-500 leading-6 mt-2">
                  Recognition for strong work and contribution.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="process" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center">
              <span className="text-blue-600 font-bold text-sm uppercase tracking-widest">
                {" "}Hiring Process{" "}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black mt-3">
                How We Hire
              </h2>
            </div>
            <div className="grid md:grid-cols-4 gap-7 mt-14">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl font-black">
                  01
                </div>
                <h3 className="font-black mt-5">
                  Apply
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Submit your application for a suitable position.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl font-black">
                  02
                </div>
                <h3 className="font-black mt-5">
                  Screening
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Our team reviews your profile and experience.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl font-black">
                  03
                </div>
                <h3 className="font-black mt-5">
                  Interview
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Discuss your skills, experience and role.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-green-600 text-white flex items-center justify-center text-xl font-black">
                  04
                </div>
                <h3 className="font-black mt-5">
                  Selection
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Selected candidates receive the next steps.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="py-20 bg-slate-950 text-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="rounded-3xl bg-white/5 border border-white/10 p-8 reveal">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center">
                  <i data-lucide="target" className="w-7 h-7"></i>
                </div>
                <h2 className="text-3xl font-black mt-7">
                  Our Mission
                </h2>
                <p className="text-slate-300 leading-8 mt-4">
                  PNS Digiskills Academy का उद्देश्य युवाओं को practical digital education, AI tools और career-oriented technology skills के माध्यम से सक्षम बनाना है। हम students को सिर्फ job seeker नहीं, बल्कि freelancer, professional और entrepreneur बनने के लिए तैयार करते हैं।
                </p>
              </div>
              <div className="rounded-3xl bg-white/5 border border-white/10 p-8 reveal">
                <div className="w-14 h-14 rounded-2xl bg-violet-600 flex items-center justify-center">
                  <i data-lucide="eye" className="w-7 h-7"></i>
                </div>
                <h2 className="text-3xl font-black mt-7">
                  Our Vision
                </h2>
                <p className="text-slate-300 leading-8 mt-4">
                  हमारा vision है कि हर युवा digital literacy और future-ready skills के साथ अपने career और business का निर्माण कर सके। हम technology को accessible और practical बनाकर रोजगार और self-employment के अवसर बढ़ाने पर focus करते हैं।
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="contact" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center reveal">
              <div className="text-blue-600 font-black uppercase tracking-[3px] text-sm">
                Contact Us
              </div>
              <h2 className="text-4xl md:text-5xl font-black mt-4">
                We Are Here To{" "}
                <span className="gradient-text">
                  {" "}Help{" "}
                </span>
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center hover:shadow-card">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 flex items-center justify-center">
                  <i data-lucide="map-pin" className="text-blue-600"></i>
                </div>
                <h3 className="font-black text-xl mt-5">
                  Visit Us
                </h3>
                <p className="text-slate-500 mt-3">
                  Bihar, India
                </p>
              </div>
              <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center hover:shadow-card">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-violet-50 flex items-center justify-center">
                  <i data-lucide="phone" className="text-violet-600"></i>
                </div>
                <h3 className="font-black text-xl mt-5">
                  Call Us
                </h3>
                <p className="text-slate-500 mt-3">
                  +91 98765 43210
                </p>
              </div>
              <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center hover:shadow-card">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-50 flex items-center justify-center">
                  <i data-lucide="mail" className="text-cyan-600"></i>
                </div>
                <h3 className="font-black text-xl mt-5">
                  Email Us
                </h3>
                <p className="text-slate-500 mt-3">
                  info@aicomputeracademy.in
                </p>
              </div>
            </div>
          </div>
        </section>
        <SiteFooter />
        <WhatsappWidget />
        <script dangerouslySetInnerHTML={{ __html: js_c1268ab4 }} />
        <StyleBlock2 />
        <DivBlock />
        <script dangerouslySetInnerHTML={{ __html: js_ea05b2d5 }} />
        <script src="https://unpkg.com/typed.js@2.0.16/dist/typed.umd.js"></script>
        <script src="js/script.js"></script>
        <script src="https://cdn.tailwindcss.com"></script>
      </body>
    </html>
  );
}
