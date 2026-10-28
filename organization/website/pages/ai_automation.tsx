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

/** ai_automation.html */
export default function AiAutomation() {
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
        <section id="courses" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-blue-600 font-black text-xs uppercase tracking-[.2em]">
                {" "}
              </span>
              <h2 className="mt-3 text-3xl sm:text-4xl font-black text-slate-900">
                <span className="gradient-text">
                  {" "}Ai Tools & Automation Courses{" "}
                </span>
              </h2>
            </div>
            <div id="courseGrid" className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <div className="course-card course-item bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-soft" data-category="basic">
                <div className="relative h-48 overflow-hidden">
                  <img src="image/gs.png" className="course-img w-full h-full object-cover" alt="Google Suite" />
                </div>
                <div className="p-5">
                  <h3 className="font-black text-lg">
                    AI Tools Mastery Pro
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-5">
                    Learn ChatGPT from Basics to Professional Productivity
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold">
                      {" "}3 Months{" "}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold">
                      {" "}Beginner{" "}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-5 pt-4 border-t">
                    <div>
                      <span className="text-[10px] text-slate-400">
                        {" "}Course Fee{" "}
                      </span>
                      <div className="font-black text-blue-600">
                        ₹3,499
                      </div>
                    </div>
                    <a href="ai_auto-mastery.html" className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition">
                      Details
                      <span>
                        →
                      </span>
                    </a>
                  </div>
                </div>
              </div>
              <div className="course-card course-item bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-soft" data-category="basic">
                <div className="relative h-48 overflow-hidden">
                  <img src="image/dca.jpg" className="course-img w-full h-full object-cover" alt="MS Office" />
                </div>
                <div className="p-5">
                  <h3 className="font-black text-lg">
                    AI Automation Specialist
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-5">
                    MS Word, Excel, PowerPoint, document and office productivity.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold">
                      {" "}3 Months{" "}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold">
                      {" "}Practical{" "}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-5 pt-4 border-t">
                    <div>
                      <span className="text-[10px] text-slate-400">
                        {" "}Course Fee{" "}
                      </span>
                      <div className="font-black text-blue-600">
                        ₹3,499
                      </div>
                    </div>
                    <a href="ai_special.html" className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition">
                      Details
                      <span>
                        →
                      </span>
                    </a>
                  </div>
                </div>
              </div>
              <div className="course-card course-item bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-soft" data-category="accounting">
                <div className="relative h-48 overflow-hidden">
                  <img src="image/tally.png" className="course-img w-full h-full object-cover" alt="Tally Prime" />
                </div>
                <div className="p-5">
                  <h3 className="font-black text-lg">
                    No-Code AI Automation
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-5">
                    Accounting, GST, inventory, taxation, payroll and reports.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold">
                      {" "}3 Months{" "}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold">
                      {" "}Job Ready{" "}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-5 pt-4 border-t">
                    <div>
                      <span className="text-[10px] text-slate-400">
                        {" "}Course Fee{" "}
                      </span>
                      <div className="font-black text-blue-600">
                        ₹3,499
                      </div>
                    </div>
                    <a href="no-code-ai.html" className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition">
                      Details
                      <span>
                        →
                      </span>
                    </a>
                  </div>
                </div>
              </div>
              <div className="course-card course-item bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-soft" data-category="design">
                <div className="relative h-48 overflow-hidden">
                  <img src="image/cyber.png" className="course-img w-full h-full object-cover" alt="Photoshop" />
                </div>
                <div className="p-5">
                  <h3 className="font-black text-lg">
                    AI Productivity & Workflow
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-5">
                    Photo editing, poster design, social media graphics and retouching.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold">
                      {" "}3 Months{" "}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold">
                      {" "}Advanced{" "}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-5 pt-4 border-t">
                    <div>
                      <span className="text-[10px] text-slate-400">
                        {" "}Course Fee{" "}
                      </span>
                      <div className="font-black text-blue-600">
                        ₹3,999
                      </div>
                    </div>
                    <a href="ai-productivity.html" className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition">
                      Details
                      <span>
                        →
                      </span>
                    </a>
                  </div>
                </div>
              </div>
              <div className="course-card course-item bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-soft" data-category="basic">
                <div className="relative h-48 overflow-hidden">
                  <img src="image/typing.png" className="course-img w-full h-full object-cover" alt="Computer Course" />
                </div>
                <div className="p-5">
                  <h3 className="font-black text-lg text-slate-900">
                    <center>
                      AI Marketing Automation{" "}
                    </center>
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-5">
                    Data Entry, MS Office, Excel, Internet, Email, Documentation, MIS Reporting, Online Work और Office Management
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold text-slate-600">
                      {" "}3 Months{" "}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold text-slate-600">
                      {" "}Beginner{" "}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-5 pt-4 border-t">
                    <div>
                      <span className="text-[10px] text-slate-400">
                        {" "}Course Fee{" "}
                      </span>
                      <div className="font-black text-blue-600">
                        ₹3,499
                      </div>
                    </div>
                    <a href="ai_marketing.html" className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition">
                      Details
                      <span>
                        →
                      </span>
                    </a>
                  </div>
                </div>
              </div>
              <div className="course-card course-item bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-soft" data-category="basic">
                <div className="relative h-48 overflow-hidden">
                  <img src="image/backoffice.jpg" width="300" height="20" className="course-img w-full h-full object-cover" alt="Computer Course" />
                </div>
                <div className="p-5">
                  <h3 className="font-black text-lg text-slate-900">
                    <center>
                      AI Business Automation{" "}
                    </center>
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-5">
                    Data Entry, MS Office, Excel, Internet, Email, Documentation, Online Work और Office Management
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold text-slate-600">
                      {" "}3 Months{" "}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold text-slate-600">
                      {" "}Beginner{" "}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-5 pt-4 border-t">
                    <div>
                      <span className="text-[10px] text-slate-400">
                        {" "}Course Fee{" "}
                      </span>
                      <div className="font-black text-blue-600">
                        ₹3,499
                      </div>
                    </div>
                    <a href="ai_business.html" className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition">
                      Details
                      <span>
                        →
                      </span>
                    </a>
                  </div>
                </div>
              </div>
              <div className="course-card course-item bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-soft" data-category="basic">
                <div className="relative h-48 overflow-hidden">
                  <img src="image/backoffice.jpg" width="300" height="20" className="course-img w-full h-full object-cover" alt="Computer Course" />
                </div>
                <div className="p-5">
                  <h3 className="font-black text-lg text-slate-900">
                    <center>
                      {" "}AI Content & Social Media Automation{" "}
                    </center>
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-5">
                    Data Entry, MS Office, Excel, Internet, Email, Documentation, Online Work और Office Management
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold text-slate-600">
                      {" "}3 Months{" "}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold text-slate-600">
                      {" "}Beginner{" "}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-5 pt-4 border-t">
                    <div>
                      <span className="text-[10px] text-slate-400">
                        {" "}Course Fee{" "}
                      </span>
                      <div className="font-black text-blue-600">
                        ₹3,499
                      </div>
                    </div>
                    <a href="ai_social.html" className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition">
                      Details
                      <span>
                        →
                      </span>
                    </a>
                  </div>
                </div>
              </div>
              <div className="course-card course-item bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-soft" data-category="basic">
                <div className="relative h-48 overflow-hidden">
                  <img src="image/backoffice.jpg" width="300" height="20" className="course-img w-full h-full object-cover" alt="Computer Course" />
                </div>
                <div className="p-5">
                  <h3 className="font-black text-lg text-slate-900">
                    <center>
                      {" "}AI Agents & Advanced Automation{" "}
                    </center>
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-5">
                    Data Entry, MS Office, Excel, Internet, Email, Documentation, Online Work और Office Management
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold text-slate-600">
                      {" "}3 Months{" "}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold text-slate-600">
                      {" "}Beginner{" "}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-5 pt-4 border-t">
                    <div>
                      <span className="text-[10px] text-slate-400">
                        {" "}Course Fee{" "}
                      </span>
                      <div className="font-black text-blue-600">
                        ₹3,499
                      </div>
                    </div>
                    <a href="ai_agents.html" className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition">
                      Details
                      <span>
                        →
                      </span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" data-lucide="database" aria-hidden="true" className="lucide lucide-database w-6 h-6">
                      <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                      <path d="M3 5V19A9 3 0 0 0 21 19V5"></path>
                      <path d="M3 12A9 3 0 0 0 21 12"></path>
                    </svg>
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
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" data-lucide="arrow-up-right" aria-hidden="true" className="lucide lucide-arrow-up-right w-4 h-4">
                    <path d="M7 7h10v10"></path>
                    <path d="M7 17 17 7"></path>
                  </svg>
                </a>
              </div>
              <div className="role-card bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 flex flex-col">
                <div className="role-icon w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" data-lucide="user-round-check" aria-hidden="true" className="lucide lucide-user-round-check w-6 h-6">
                    <path d="M2 21a8 8 0 0 1 13.292-6"></path>
                    <circle cx="10" cy="8" r="5"></circle>
                    <path d="m16 19 2 2 4-4"></path>
                  </svg>
                </div>
                <h3 className="font-black text-lg mt-5">
                  <center>
                    Admission Counsellor &
                    <br />
                    Sales Executive{" "}
                  </center>
                </h3>
                <p className="text-xs text-slate-500 leading-6 mt-2 flex-1">
                  Student counselling, admission enquiry handling, Sales professionals for lead generation, follow-up calling, follow-up and customer handling .
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
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" data-lucide="arrow-up-right" aria-hidden="true" className="lucide lucide-arrow-up-right w-4 h-4">
                    <path d="M7 7h10v10"></path>
                    <path d="M7 17 17 7"></path>
                  </svg>
                </a>
              </div>
              <div className="role-card bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 flex flex-col">
                <div className="flex items-center justify-between">
                  <div className="role-icon w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" data-lucide="calculator" aria-hidden="true" className="lucide lucide-calculator w-6 h-6">
                      <rect width="16" height="20" x="4" y="2" rx="2"></rect>
                      <line x1="8" x2="16" y1="6" y2="6"></line>
                      <line x1="16" x2="16" y1="14" y2="18"></line>
                      <path d="M16 10h.01"></path>
                      <path d="M12 10h.01"></path>
                      <path d="M8 10h.01"></path>
                      <path d="M12 14h.01"></path>
                      <path d="M8 14h.01"></path>
                      <path d="M12 18h.01"></path>
                      <path d="M8 18h.01"></path>
                    </svg>
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
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" data-lucide="arrow-up-right" aria-hidden="true" className="lucide lucide-arrow-up-right w-4 h-4">
                    <path d="M7 7h10v10"></path>
                    <path d="M7 17 17 7"></path>
                  </svg>
                </a>
              </div>
              <div className="role-card bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 flex flex-col">
                <div className="role-icon w-12 h-12 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" data-lucide="phone-call" aria-hidden="true" className="lucide lucide-phone-call w-6 h-6">
                    <path d="M13 2a9 9 0 0 1 9 9"></path>
                    <path d="M13 6a5 5 0 0 1 5 5"></path>
                    <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"></path>
                  </svg>
                </div>
                <h3 className="font-black text-lg mt-6">
                  <center>
                    Telecaller
                    <br />
                    Office Assistant{" "}
                  </center>
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
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" data-lucide="arrow-up-right" aria-hidden="true" className="lucide lucide-arrow-up-right w-4 h-4">
                    <path d="M7 7h10v10"></path>
                    <path d="M7 17 17 7"></path>
                  </svg>
                </a>
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
