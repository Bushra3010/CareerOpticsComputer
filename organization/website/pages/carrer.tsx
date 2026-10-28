import DivBlock from "../components/DivBlock";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import StyleBlock from "../components/StyleBlock";
import StyleBlock2 from "../components/StyleBlock2";
import WhatsappWidget from "../components/WhatsappWidget";
import css_32f7cc4c from "../styles/32f7cc4c.css?raw";
import css_52f33ea9 from "../styles/52f33ea9.css?raw";
import js_0023a4f0 from "../behaviour/0023a4f0.js?raw";
import js_73893071 from "../behaviour/73893071.js?raw";
import js_c1268ab4 from "../behaviour/c1268ab4.js?raw";
import js_d42bd168 from "../behaviour/d42bd168.js?raw";
import js_ea05b2d5 from "../behaviour/ea05b2d5.js?raw";

/** carrer.html */
export default function Carrer() {
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
      <body className="bg-slate-50 text-slate-900">
        <SiteHeader />
        <script dangerouslySetInnerHTML={{ __html: js_73893071 }} />
        <StyleBlock />
        <style dangerouslySetInnerHTML={{ __html: css_52f33ea9 }} />
        <section id="jobs" className="py-16 sm:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
                Hire for Any{" "}
                <span className="gradient-text">
                  {" "}Job Role{" "}
                </span>
              </h2>
              <p className="mt-4 text-sm sm:text-base text-slate-500 leading-7">
                Select a profile to view details and submit your hiring requirement.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 mt-12">
              <div className="role-card bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 flex flex-col">
                <div className="flex items-center justify-between">
                  <div className="role-icon w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <i data-lucide="database" className="w-6 h-6">
                      {" "}
                    </i>
                  </div>
                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-green-50 text-green-600">
                    {" "}Hiring{" "}
                  </span>
                </div>
                <h3 className="font-black text-lg mt-5">
                  Data Entry Operator
                </h3>
                <p className="text-xs text-slate-500 leading-6 mt-2 flex-1">
                  Hire candidates skilled in data entry, MS Excel, MS Office, typing and documentation.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-bold">
                    {" "}Excel{" "}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-bold">
                    {" "}Typing{" "}
                  </span>
                </div>
                <a href="data-entry-operator.html" className="apply-btn mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-3 text-xs font-black">
                  Apply / Hire Now
                  <i data-lucide="arrow-up-right" className="w-4 h-4">
                    {" "}
                  </i>
                </a>
              </div>
              <div className="role-card bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 flex flex-col">
                <div className="role-icon w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <i data-lucide="user-round-check" className="w-6 h-6">
                    {" "}
                  </i>
                </div>
                <h3 className="font-black text-lg mt-5">
                  Admission Counsellor
                </h3>
                <p className="text-xs text-slate-500 leading-6 mt-2 flex-1">
                  Student counselling, admission enquiry handling, follow-up and communication.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                    {" "}Counselling{" "}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                    {" "}Follow-up{" "}
                  </span>
                </div>
                <a href="admission-counsellor.html" className="apply-btn mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-xs font-black">
                  Apply / Hire Now
                  <i data-lucide="arrow-up-right" className="w-4 h-4">
                    {" "}
                  </i>
                </a>
              </div>
              <div className="role-card bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 flex flex-col">
                <div className="flex items-center justify-between">
                  <div className="role-icon w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
                    <i data-lucide="palette" className="w-6 h-6">
                      {" "}
                    </i>
                  </div>
                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-green-50 text-green-600">
                    {" "}Hiring{" "}
                  </span>
                </div>
                <h3 className="font-black text-lg mt-5">
                  Graphic Designer
                </h3>
                <p className="text-xs text-slate-500 leading-6 mt-2 flex-1">
                  Creative designers for social media, banners, posters, branding and marketing.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 text-[10px] font-bold">
                    {" "}Canva{" "}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 text-[10px] font-bold">
                    {" "}Photoshop{" "}
                  </span>
                </div>
                <a href="graphic-designer.html" className="apply-btn mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white py-3 text-xs font-black">
                  Apply / Hire Now
                  <i data-lucide="arrow-up-right" className="w-4 h-4">
                    {" "}
                  </i>
                </a>
              </div>
              <div className="role-card bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 flex flex-col">
                <div className="flex items-center justify-between">
                  <div className="role-icon w-12 h-12 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center">
                    <i data-lucide="globe-2" className="w-6 h-6">
                      {" "}
                    </i>
                  </div>
                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-green-50 text-green-600">
                    {" "}Hiring{" "}
                  </span>
                </div>
                <h3 className="font-black text-lg mt-5">
                  Website Designer
                </h3>
                <p className="text-xs text-slate-500 leading-6 mt-2 flex-1">
                  Hire web designers skilled in responsive website design, UI and front-end development.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="px-2.5 py-1 rounded-lg bg-green-50 text-green-700 text-[10px] font-bold">
                    {" "}HTML{" "}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-green-50 text-green-700 text-[10px] font-bold">
                    {" "}CSS{" "}
                  </span>
                </div>
                <a href="website-designer.html" className="apply-btn mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 text-white py-3 text-xs font-black">
                  Apply / Hire Now
                  <i data-lucide="arrow-up-right" className="w-4 h-4">
                    {" "}
                  </i>
                </a>
              </div>
              <div className="role-card bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 flex flex-col">
                <div className="flex items-center justify-between">
                  <div className="role-icon w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                    <i data-lucide="calculator" className="w-6 h-6">
                      {" "}
                    </i>
                  </div>
                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-green-50 text-green-600">
                    {" "}Hiring{" "}
                  </span>
                </div>
                <h3 className="font-black text-lg mt-5">
                  Accounting Expert
                </h3>
                <p className="text-xs text-slate-500 leading-6 mt-2 flex-1">
                  Trained accounting professionals with Tally, GST, billing and financial record skills.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="px-2.5 py-1 rounded-lg bg-orange-50 text-orange-700 text-[10px] font-bold">
                    {" "}Tally{" "}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-orange-50 text-orange-700 text-[10px] font-bold">
                    {" "}GST{" "}
                  </span>
                </div>
                <a href="accounting-expert.html" className="apply-btn mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white py-3 text-xs font-black">
                  Apply / Hire Now
                  <i data-lucide="arrow-up-right" className="w-4 h-4">
                    {" "}
                  </i>
                </a>
              </div>
              <div className="role-card bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 flex flex-col">
                <div className="role-icon w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-600 flex items-center justify-center">
                  <i data-lucide="megaphone" className="w-6 h-6">
                    {" "}
                  </i>
                </div>
                <h3 className="font-black text-lg mt-5">
                  Digital Marketing
                </h3>
                <p className="text-xs text-slate-500 leading-6 mt-2 flex-1">
                  Hire digital marketing professionals for SEO, social media, content and lead generation.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="px-2.5 py-1 rounded-lg bg-cyan-50 text-cyan-700 text-[10px] font-bold">
                    {" "}SEO{" "}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-cyan-50 text-cyan-700 text-[10px] font-bold">
                    {" "}Marketing{" "}
                  </span>
                </div>
                <a href="digital-marketing.html" className="apply-btn mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white py-3 text-xs font-black">
                  Apply / Hire Now
                  <i data-lucide="arrow-up-right" className="w-4 h-4">
                    {" "}
                  </i>
                </a>
              </div>
              <div className="role-card bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 flex flex-col">
                <div className="role-icon w-12 h-12 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center">
                  <i data-lucide="phone-call" className="w-6 h-6">
                    {" "}
                  </i>
                </div>
                <h3 className="font-black text-lg mt-5">
                  Telecaller
                </h3>
                <p className="text-xs text-slate-500 leading-6 mt-2 flex-1">
                  Customer support, calling, lead follow-up and communication professionals.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="px-2.5 py-1 rounded-lg bg-pink-50 text-pink-700 text-[10px] font-bold">
                    {" "}Calling{" "}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-pink-50 text-pink-700 text-[10px] font-bold">
                    {" "}CRM{" "}
                  </span>
                </div>
                <a href="telecaller.html" className="apply-btn mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white py-3 text-xs font-black">
                  Apply / Hire Now
                  <i data-lucide="arrow-up-right" className="w-4 h-4">
                    {" "}
                  </i>
                </a>
              </div>
              <div className="role-card bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 flex flex-col">
                <div className="role-icon w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <i data-lucide="briefcase" className="w-6 h-6">
                    {" "}
                  </i>
                </div>
                <h3 className="font-black text-lg mt-5">
                  Office Assistant
                </h3>
                <p className="text-xs text-slate-500 leading-6 mt-2 flex-1">
                  Office support, documentation, computer work, records and administrative tasks.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-[10px] font-bold">
                    {" "}Office{" "}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-[10px] font-bold">
                    {" "}MS Office{" "}
                  </span>
                </div>
                <a href="office-assistant.html" className="apply-btn mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white py-3 text-xs font-black">
                  Apply / Hire Now
                  <i data-lucide="arrow-up-right" className="w-4 h-4">
                    {" "}
                  </i>
                </a>
              </div>
              <div className="role-card bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 flex flex-col">
                <div className="role-icon w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center">
                  <i data-lucide="monitor-code" className="w-6 h-6">
                    {" "}
                  </i>
                </div>
                <h3 className="font-black text-lg mt-5">
                  Frontend Developer
                </h3>
                <p className="text-xs text-slate-500 leading-6 mt-2 flex-1">
                  Frontend developers for modern, responsive and user-friendly website interfaces.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 text-[10px] font-bold">
                    {" "}HTML{" "}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 text-[10px] font-bold">
                    {" "}JavaScript{" "}
                  </span>
                </div>
                <a href="frontend-developer.html" className="apply-btn mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white py-3 text-xs font-black">
                  Apply / Hire Now
                  <i data-lucide="arrow-up-right" className="w-4 h-4">
                    {" "}
                  </i>
                </a>
              </div>
              <div className="role-card bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 flex flex-col">
                <div className="role-icon w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
                  <i data-lucide="server" className="w-6 h-6">
                    {" "}
                  </i>
                </div>
                <h3 className="font-black text-lg mt-5">
                  Backend Developer
                </h3>
                <p className="text-xs text-slate-500 leading-6 mt-2 flex-1">
                  Backend professionals for APIs, databases, server-side logic and web applications.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="px-2.5 py-1 rounded-lg bg-red-50 text-red-700 text-[10px] font-bold">
                    {" "}PHP{" "}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-red-50 text-red-700 text-[10px] font-bold">
                    {" "}MySQL{" "}
                  </span>
                </div>
                <a href="backend-developer.html" className="apply-btn mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white py-3 text-xs font-black">
                  Apply / Hire Now
                  <i data-lucide="arrow-up-right" className="w-4 h-4">
                    {" "}
                  </i>
                </a>
              </div>
              <div className="role-card bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 flex flex-col">
                <div className="role-icon w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <i data-lucide="layers-3" className="w-6 h-6">
                    {" "}
                  </i>
                </div>
                <h3 className="font-black text-lg mt-5">
                  Full Stack Developer
                </h3>
                <p className="text-xs text-slate-500 leading-6 mt-2 flex-1">
                  Full stack developers for frontend, backend, database and complete web applications.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-[10px] font-bold">
                    {" "}Frontend{" "}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-[10px] font-bold">
                    {" "}Backend{" "}
                  </span>
                </div>
                <a href="full-stack-developer.html" className="apply-btn mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-3 text-xs font-black">
                  Apply / Hire Now
                  <i data-lucide="arrow-up-right" className="w-4 h-4">
                    {" "}
                  </i>
                </a>
              </div>
              <div className="role-card bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 flex flex-col">
                <div className="role-icon w-12 h-12 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center">
                  <i data-lucide="trending-up" className="w-6 h-6">
                    {" "}
                  </i>
                </div>
                <h3 className="font-black text-lg mt-5">
                  Sales Executive
                </h3>
                <p className="text-xs text-slate-500 leading-6 mt-2 flex-1">
                  Sales professionals for lead generation, calling, follow-up and customer handling.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="px-2.5 py-1 rounded-lg bg-violet-50 text-violet-700 text-[10px] font-bold">
                    {" "}Sales{" "}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-violet-50 text-violet-700 text-[10px] font-bold">
                    {" "}Leads{" "}
                  </span>
                </div>
                <a href="sales-executive.html" className="apply-btn mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white py-3 text-xs font-black">
                  Apply / Hire Now
                  <i data-lucide="arrow-up-right" className="w-4 h-4">
                    {" "}
                  </i>
                </a>
              </div>
            </div>
          </div>
        </section>
        <script dangerouslySetInnerHTML={{ __html: js_d42bd168 }} />
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
