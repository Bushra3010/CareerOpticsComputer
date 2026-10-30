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

/** bpsc_details.html */
export default function BpscDetails() {
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
        <section className="relative overflow-hidden bg-slate-950 py-16 sm:py-20">
          <div className="absolute -left-40 top-10 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl"></div>
          <div className="absolute -right-40 bottom-0 h-[450px] w-[450px] rounded-full bg-indigo-600/20 blur-3xl"></div>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_.9fr]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-blue-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
                  BPSC Complete Course
                </div>
                <h1 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                  BPSC की तैयारी{" "}
                  <span className="block text-blue-400">
                    {" "}अब सही Strategy{" "}
                  </span>
                  {" "}
                  <span className="block">
                    {" "}के साथ करें{" "}
                  </span>
                </h1>
                <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                  Prelims से लेकर Mains और Interview तक complete BPSC preparation program. Concept Classes, Current Affairs, Mock Tests, PYQs और Answer Writing के साथ।
                </p>
                <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xl font-black text-white">
                      12+
                    </p>
                    <p className="mt-1 text-[10px] text-slate-500">
                      Months
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xl font-black text-white">
                      900+
                    </p>
                    <p className="mt-1 text-[10px] text-slate-500">
                      Mains Marks
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xl font-black text-white">
                      120
                    </p>
                    <p className="mt-1 text-[10px] text-slate-500">
                      Interview
                    </p>
                  </div>
                </div>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a href="#fees" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-black text-white hover:bg-blue-700">
                    View Course Fee
                    <i data-lucide="arrow-down" className="h-4 w-4"></i>
                  </a>
                  <a href="#syllabus" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-black text-white hover:bg-white/10">
                    View Syllabus
                    <i data-lucide="book-open" className="h-4 w-4"></i>
                  </a>
                </div>
              </div>
              <div id="fees" className="relative rounded-[2rem] border border-white/10 bg-white/5 p-2 backdrop-blur-xl">
                <div className="absolute -top-4 right-6 z-10">
                  <span className="rounded-full bg-orange-500 px-5 py-2 text-[10px] font-black uppercase tracking-wider text-white shadow-xl">
                    {" "}Limited Time Offer{" "}
                  </span>
                </div>
                <div className="rounded-[1.6rem] bg-white p-6 sm:p-8">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
                        Complete Program
                      </p>
                      <h2 className="mt-2 text-2xl font-black text-slate-900">
                        BPSC Foundation Course
                      </h2>
                      <p className="mt-1 text-xs text-slate-500">
                        Prelims + Mains + Interview
                      </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                      <i data-lucide="trophy" className="h-6 w-6"></i>
                    </div>
                  </div>
                  <div className="mt-7 rounded-2xl bg-slate-950 p-5">
                    <div className="flex items-end gap-3">
                      <span className="text-sm font-bold text-slate-500 line-through">
                        {" "}₹29,999{" "}
                      </span>
                      <span className="text-4xl font-black text-white">
                        {" "}₹19,999{" "}
                      </span>
                    </div>
                    <p className="mt-2 text-[11px] text-emerald-400">
                      Save ₹10,000 on admission
                    </p>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-[10px] uppercase tracking-wider text-slate-400">
                        Duration
                      </p>
                      <p className="mt-1 text-sm font-black">
                        12 Months
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-[10px] uppercase tracking-wider text-slate-400">
                        Mode
                      </p>
                      <p className="mt-1 text-sm font-black">
                        Offline + Online
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <i data-lucide="check" className="h-3.5 w-3.5"></i>
                      </span>
                      <span className="text-xs font-semibold">
                        {" "}Prelims Complete GS{" "}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <i data-lucide="check" className="h-3.5 w-3.5"></i>
                      </span>
                      <span className="text-xs font-semibold">
                        {" "}Mains GS + Hindi{" "}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <i data-lucide="check" className="h-3.5 w-3.5"></i>
                      </span>
                      <span className="text-xs font-semibold">
                        {" "}Mock Test + PYQ{" "}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <i data-lucide="check" className="h-3.5 w-3.5"></i>
                      </span>
                      <span className="text-xs font-semibold">
                        {" "}Current Affairs{" "}
                      </span>
                    </div>
                  </div>
                  <a href="#enroll" className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-4 text-sm font-black text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700">
                    Enroll for ₹19,999
                    <i data-lucide="arrow-right" className="h-4 w-4"></i>
                  </a>
                  <p className="mt-3 text-center text-[10px] text-slate-400">
                    *Fee and offer may vary according to batch.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="overview" className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
                  {" "}Course Overview{" "}
                </span>
                <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
                  Complete BPSC Preparation{" "}
                  <span className="text-blue-600">
                    {" "}एक ही Course में{" "}
                  </span>
                </h2>
                <p className="mt-5 text-sm leading-7 text-slate-500">
                  यह program BPSC aspirants के लिए structured preparation approach के साथ बनाया गया है। इसमें Prelims, Mains और Interview के लिए अलग-अलग preparation strategy दी जाती है।
                </p>
                <div className="mt-7 space-y-4">
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <i data-lucide="target" className="h-5 w-5"></i>
                    </div>
                    <div>
                      <h3 className="text-sm font-black">
                        Exam-Oriented Preparation
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Syllabus और previous year pattern के अनुसार preparation।
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                      <i data-lucide="brain" className="h-5 w-5"></i>
                    </div>
                    <div>
                      <h3 className="text-sm font-black">
                        Concept + Practice
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Concepts के साथ regular practice और tests।
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                      <i data-lucide="bar-chart-3" className="h-5 w-5"></i>
                    </div>
                    <div>
                      <h3 className="text-sm font-black">
                        Performance Tracking
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Mock tests के माध्यम से performance analysis और improvement।
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:p-7">
                <h3 className="text-xl font-black text-slate-900">
                  BPSC Preparation Stages
                </h3>
                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                      <span className="font-black">
                        01
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-black">
                        Preliminary Examination
                      </p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        General Studies • Objective
                      </p>
                    </div>
                    <span className="text-sm font-black text-blue-600">
                      {" "}150{" "}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white">
                      <span className="font-black">
                        02
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-black">
                        Main Examination
                      </p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        GS • Hindi • Optional
                      </p>
                    </div>
                    <span className="text-sm font-black text-purple-600">
                      {" "}900{" "}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white">
                      <span className="font-black">
                        03
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-black">
                        Interview
                      </p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        Personality Test
                      </p>
                    </div>
                    <span className="text-sm font-black text-orange-600">
                      {" "}120{" "}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="bg-slate-50 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
                {" "}Course Fee{" "}
              </span>
              <h2 className="mt-3 text-3xl font-black text-slate-900">
                Choose Your BPSC Program
              </h2>
              <p className="mt-3 text-sm text-slate-500">
                अपने preparation level के अनुसार course चुनें।
              </p>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <i data-lucide="file-question" className="h-6 w-6"></i>
                </div>
                <h3 className="mt-5 text-lg font-black">
                  BPSC Prelims
                </h3>
                <p className="mt-2 text-xs text-slate-500">
                  Prelims GS Preparation
                </p>
                <div className="mt-6">
                  <span className="text-xs text-slate-400 line-through">
                    {" "}₹11,999{" "}
                  </span>
                  <p className="text-3xl font-black text-slate-900">
                    ₹7,999
                  </p>
                </div>
                <ul className="mt-6 space-y-3 text-xs">
                  <li className="flex gap-2">
                    <i data-lucide="check" className="h-4 w-4 text-emerald-500"></i>
                    Complete GS
                  </li>
                  <li className="flex gap-2">
                    <i data-lucide="check" className="h-4 w-4 text-emerald-500"></i>
                    Current Affairs
                  </li>
                  <li className="flex gap-2">
                    <i data-lucide="check" className="h-4 w-4 text-emerald-500"></i>
                    Mock Tests
                  </li>
                  <li className="flex gap-2">
                    <i data-lucide="check" className="h-4 w-4 text-emerald-500"></i>
                    PYQ Practice
                  </li>
                </ul>
                <a href="#enroll" className="mt-7 flex w-full justify-center rounded-xl border border-blue-600 px-4 py-3 text-xs font-black text-blue-600 hover:bg-blue-50">
                  Enquire Now
                </a>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <i data-lucide="file-text" className="h-6 w-6"></i>
                </div>
                <h3 className="mt-5 text-lg font-black">
                  BPSC Mains
                </h3>
                <p className="mt-2 text-xs text-slate-500">
                  Mains Written Preparation
                </p>
                <div className="mt-6">
                  <span className="text-xs text-slate-400 line-through">
                    {" "}₹17,999{" "}
                  </span>
                  <p className="text-3xl font-black text-slate-900">
                    ₹12,999
                  </p>
                </div>
                <ul className="mt-6 space-y-3 text-xs">
                  <li className="flex gap-2">
                    <i data-lucide="check" className="h-4 w-4 text-emerald-500"></i>
                    GS Paper Preparation
                  </li>
                  <li className="flex gap-2">
                    <i data-lucide="check" className="h-4 w-4 text-emerald-500"></i>
                    Hindi
                  </li>
                  <li className="flex gap-2">
                    <i data-lucide="check" className="h-4 w-4 text-emerald-500"></i>
                    Answer Writing
                  </li>
                  <li className="flex gap-2">
                    <i data-lucide="check" className="h-4 w-4 text-emerald-500"></i>
                    Test Series
                  </li>
                </ul>
                <a href="#enroll" className="mt-7 flex w-full justify-center rounded-xl border border-purple-600 px-4 py-3 text-xs font-black text-purple-600 hover:bg-purple-50">
                  Enquire Now
                </a>
              </div>
              <div className="relative rounded-3xl border-2 border-blue-600 bg-white p-6 shadow-premium">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1.5 text-[9px] font-black uppercase tracking-wider text-white">
                  Most Popular
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <i data-lucide="crown" className="h-6 w-6"></i>
                </div>
                <h3 className="mt-5 text-lg font-black">
                  Complete BPSC
                </h3>
                <p className="mt-2 text-xs text-slate-500">
                  Prelims + Mains
                </p>
                <div className="mt-6">
                  <span className="text-xs text-slate-400 line-through">
                    {" "}₹29,999{" "}
                  </span>
                  <p className="text-3xl font-black text-blue-600">
                    ₹19,999
                  </p>
                </div>
                <ul className="mt-6 space-y-3 text-xs">
                  <li className="flex gap-2">
                    <i data-lucide="check" className="h-4 w-4 text-emerald-500"></i>
                    Prelims + Mains
                  </li>
                  <li className="flex gap-2">
                    <i data-lucide="check" className="h-4 w-4 text-emerald-500"></i>
                    Current Affairs
                  </li>
                  <li className="flex gap-2">
                    <i data-lucide="check" className="h-4 w-4 text-emerald-500"></i>
                    Mock Tests
                  </li>
                  <li className="flex gap-2">
                    <i data-lucide="check" className="h-4 w-4 text-emerald-500"></i>
                    Answer Writing
                  </li>
                </ul>
                <a href="#enroll" className="mt-7 flex w-full justify-center rounded-xl bg-blue-600 px-4 py-3 text-xs font-black text-white hover:bg-blue-700">
                  Enroll Now
                </a>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-950 p-6 shadow-sm text-white">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-orange-400">
                  <i data-lucide="award" className="h-6 w-6"></i>
                </div>
                <h3 className="mt-5 text-lg font-black">
                  Career Program
                </h3>
                <p className="mt-2 text-xs text-slate-400">
                  Complete + Interview
                </p>
                <div className="mt-6">
                  <span className="text-xs text-slate-500 line-through">
                    {" "}₹34,999{" "}
                  </span>
                  <p className="text-3xl font-black text-white">
                    ₹24,999
                  </p>
                </div>
                <ul className="mt-6 space-y-3 text-xs text-slate-300">
                  <li className="flex gap-2">
                    <i data-lucide="check" className="h-4 w-4 text-emerald-400"></i>
                    Prelims + Mains
                  </li>
                  <li className="flex gap-2">
                    <i data-lucide="check" className="h-4 w-4 text-emerald-400"></i>
                    Interview Guidance
                  </li>
                  <li className="flex gap-2">
                    <i data-lucide="check" className="h-4 w-4 text-emerald-400"></i>
                    Mock Interview
                  </li>
                  <li className="flex gap-2">
                    <i data-lucide="check" className="h-4 w-4 text-emerald-400"></i>
                    Complete Support
                  </li>
                </ul>
                <a href="#enroll" className="mt-7 flex w-full justify-center rounded-xl bg-white px-4 py-3 text-xs font-black text-slate-900 hover:bg-slate-100">
                  Enquire Now
                </a>
              </div>
            </div>
          </div>
        </section>
        <section id="syllabus" className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
                {" "}Complete Syllabus{" "}
              </span>
              <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
                BPSC Course Syllabus
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-500">
                Prelims और Mains preparation के प्रमुख topics।
              </p>
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                  <i data-lucide="landmark" className="h-5 w-5"></i>
                </div>
                <h3 className="mt-5 text-base font-black">
                  History
                </h3>
                <ul className="mt-3 space-y-2 text-xs leading-5 text-slate-500">
                  <li>
                    • Ancient India
                  </li>
                  <li>
                    • Medieval India
                  </li>
                  <li>
                    • Modern India
                  </li>
                  <li>
                    • Freedom Movement
                  </li>
                  <li>
                    • Bihar History
                  </li>
                </ul>
              </div>
              <div className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <i data-lucide="globe-2" className="h-5 w-5"></i>
                </div>
                <h3 className="mt-5 text-base font-black">
                  Geography
                </h3>
                <ul className="mt-3 space-y-2 text-xs leading-5 text-slate-500">
                  <li>
                    • Physical Geography
                  </li>
                  <li>
                    • Indian Geography
                  </li>
                  <li>
                    • Bihar Geography
                  </li>
                  <li>
                    • Rivers & Resources
                  </li>
                  <li>
                    • Agriculture
                  </li>
                </ul>
              </div>
              <div className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <i data-lucide="scale" className="h-5 w-5"></i>
                </div>
                <h3 className="mt-5 text-base font-black">
                  Indian Polity
                </h3>
                <ul className="mt-3 space-y-2 text-xs leading-5 text-slate-500">
                  <li>
                    • Constitution
                  </li>
                  <li>
                    • Fundamental Rights
                  </li>
                  <li>
                    • Parliament
                  </li>
                  <li>
                    • Judiciary
                  </li>
                  <li>
                    • Panchayati Raj
                  </li>
                </ul>
              </div>
              <div className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <i data-lucide="indian-rupee" className="h-5 w-5"></i>
                </div>
                <h3 className="mt-5 text-base font-black">
                  Indian Economy
                </h3>
                <ul className="mt-3 space-y-2 text-xs leading-5 text-slate-500">
                  <li>
                    • Indian Economy
                  </li>
                  <li>
                    • Banking System
                  </li>
                  <li>
                    • Budget
                  </li>
                  <li>
                    • Poverty & Employment
                  </li>
                  <li>
                    • Bihar Economy
                  </li>
                </ul>
              </div>
              <div className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                  <i data-lucide="flask-conical" className="h-5 w-5"></i>
                </div>
                <h3 className="mt-5 text-base font-black">
                  General Science
                </h3>
                <ul className="mt-3 space-y-2 text-xs leading-5 text-slate-500">
                  <li>
                    • Physics
                  </li>
                  <li>
                    • Chemistry
                  </li>
                  <li>
                    • Biology
                  </li>
                  <li>
                    • Environment
                  </li>
                  <li>
                    • Everyday Science
                  </li>
                </ul>
              </div>
              <div className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <i data-lucide="newspaper" className="h-5 w-5"></i>
                </div>
                <h3 className="mt-5 text-base font-black">
                  Current Affairs
                </h3>
                <ul className="mt-3 space-y-2 text-xs leading-5 text-slate-500">
                  <li>
                    • National Affairs
                  </li>
                  <li>
                    • International Affairs
                  </li>
                  <li>
                    • Bihar Current Affairs
                  </li>
                  <li>
                    • Government Schemes
                  </li>
                  <li>
                    • Awards & Sports
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="bg-slate-950 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">
                {" "}Why Choose Us{" "}
              </span>
              <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
                Course में क्या-क्या मिलेगा?
              </h2>
            </div>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <i data-lucide="presentation" className="h-7 w-7 text-blue-400"></i>
                <h3 className="mt-5 font-black text-white">
                  Expert Classes
                </h3>
                <p className="mt-2 text-xs leading-6 text-slate-500">
                  Structured topic-wise classes।
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <i data-lucide="clipboard-check" className="h-7 w-7 text-purple-400"></i>
                <h3 className="mt-5 font-black text-white">
                  Mock Tests
                </h3>
                <p className="mt-2 text-xs leading-6 text-slate-500">
                  Regular exam-level test practice।
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <i data-lucide="notebook-pen" className="h-7 w-7 text-orange-400"></i>
                <h3 className="mt-5 font-black text-white">
                  Answer Writing
                </h3>
                <p className="mt-2 text-xs leading-6 text-slate-500">
                  Mains answer writing practice।
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <i data-lucide="message-circle-question" className="h-7 w-7 text-emerald-400"></i>
                <h3 className="mt-5 font-black text-white">
                  Doubt Support
                </h3>
                <p className="mt-2 text-xs leading-6 text-slate-500">
                  Regular doubt solving support।
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <i data-lucide="newspaper" className="h-7 w-7 text-red-400"></i>
                <h3 className="mt-5 font-black text-white">
                  Current Affairs
                </h3>
                <p className="mt-2 text-xs leading-6 text-slate-500">
                  Bihar और national current affairs।
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <i data-lucide="history" className="h-7 w-7 text-cyan-400"></i>
                <h3 className="mt-5 font-black text-white">
                  PYQ Analysis
                </h3>
                <p className="mt-2 text-xs leading-6 text-slate-500">
                  Previous year questions analysis।
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <i data-lucide="library" className="h-7 w-7 text-yellow-400"></i>
                <h3 className="mt-5 font-black text-white">
                  Study Material
                </h3>
                <p className="mt-2 text-xs leading-6 text-slate-500">
                  Exam-oriented study material।
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <i data-lucide="user-check" className="h-7 w-7 text-pink-400"></i>
                <h3 className="mt-5 font-black text-white">
                  Interview Guidance
                </h3>
                <p className="mt-2 text-xs leading-6 text-slate-500">
                  Interview और personality preparation।
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="enroll" className="bg-blue-600 py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-xl">
              <i data-lucide="graduation-cap" className="h-8 w-8"></i>
            </div>
            <h2 className="mt-6 text-3xl font-black text-white sm:text-5xl">
              BPSC की तैयारी आज से शुरू करें
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-blue-100">
              Complete BPSC Program में admission लेकर structured preparation के साथ अपने लक्ष्य की ओर पहला कदम बढ़ाएं।
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <a href="tel:+918252532179" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-4 text-sm font-black text-blue-700">
                <i data-lucide="phone" className="h-4 w-4"></i>
                Call for Admission
              </a>
              <a href="https://wa.me/918252532179" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-800 px-7 py-4 text-sm font-black text-white">
                <i data-lucide="message-circle" className="h-4 w-4"></i>
                WhatsApp Enquiry
              </a>
            </div>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <span className="rounded-full bg-white/10 px-4 py-2 text-[10px] font-bold text-white">
                {" "}₹19,999 Complete Course{" "}
              </span>
              <span className="rounded-full bg-white/10 px-4 py-2 text-[10px] font-bold text-white">
                {" "}12 Months{" "}
              </span>
              <span className="rounded-full bg-white/10 px-4 py-2 text-[10px] font-bold text-white">
                {" "}Prelims + Mains{" "}
              </span>
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
