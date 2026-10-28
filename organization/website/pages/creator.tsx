import css_1199c3b2 from "../styles/1199c3b2.css?raw";
import js_268f76ca from "../behaviour/268f76ca.js?raw";
import js_a1c26f0b from "../behaviour/a1c26f0b.js?raw";

/** creator.html */
export default function Creator() {
  return (
    <html lang="en">
      <head></head>
      <body className="bg-slate-50 text-slate-800">
        ```html
        <script src="/cms-config.js"></script>
        <script src="/cms.js" defer></script>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>
          Digital Creator Course | Career Optics Computer Centre
        </title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script dangerouslySetInnerHTML={{ __html: js_268f76ca }} />
        <style dangerouslySetInnerHTML={{ __html: css_1199c3b2 }} />
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4">
            <div className="h-16 flex items-center justify-between">
              <a href="#" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-pink-500 text-white flex items-center justify-center font-black">
                  P
                </div>
                <div>
                  <div className="font-extrabold text-lg leading-none">
                    Career Optics Computer Centre
                  </div>
                  <div className="text-[10px] text-slate-500 font-semibold">
                    Skill • Career • Success
                  </div>
                </div>
              </a>
              <nav className="hidden md:flex items-center gap-7 text-sm font-semibold">
                <a href="#overview" className="hover:text-violet-600">
                  Overview
                </a>
                {" "}
                <a href="#journey" className="hover:text-violet-600">
                  Journey
                </a>
                {" "}
                <a href="#syllabus" className="hover:text-violet-600">
                  Syllabus
                </a>
                {" "}
                <a href="#projects" className="hover:text-violet-600">
                  Projects
                </a>
                {" "}
                <a href="#career" className="hover:text-violet-600">
                  Career
                </a>
                {" "}
                <a href="#fees" className="hover:text-violet-600">
                  Fees
                </a>
                {" "}
                <a href="#admission" className="px-5 py-2.5 rounded-full bg-violet-600 text-white hover:bg-violet-700">
                  {" "}Apply Now{" "}
                </a>
              </nav>
              <button id="menuBtn" className="md:hidden text-2xl">
                {" "}☰{" "}
              </button>
            </div>
            <div id="mobileMenu" className="hidden md:hidden pb-5">
              <div className="flex flex-col gap-3 text-sm font-semibold">
                <a href="#overview">
                  Overview
                </a>
                <a href="#journey">
                  Course Journey
                </a>
                <a href="#syllabus">
                  Syllabus
                </a>
                <a href="#projects">
                  Projects
                </a>
                <a href="#career">
                  Career
                </a>
                <a href="#fees">
                  Fees
                </a>
                <a href="#admission">
                  Admission
                </a>
              </div>
            </div>
          </div>
        </header>
        <div className="sticky-tabs sticky top-16 z-40 bg-white border-b border-slate-200 overflow-x-auto">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-6 min-w-max h-12 text-sm font-semibold">
              <a href="#overview" className="tab-link">
                Overview
              </a>
              <a href="#journey" className="tab-link">
                Course Journey
              </a>
              <a href="#syllabus" className="tab-link">
                Syllabus
              </a>
              <a href="#projects" className="tab-link">
                Projects
              </a>
              <a href="#career" className="tab-link">
                Career
              </a>
              <a href="#fees" className="tab-link">
                Fees
              </a>
              <a href="#admission" className="tab-link">
                Admission
              </a>
              <a href="#faq" className="tab-link">
                FAQ
              </a>
            </div>
          </div>
        </div>
        <section className="relative overflow-hidden bg-gradient-to-br from-violet-700 via-fuchsia-600 to-pink-500 text-white min-h-[650px] flex items-center">
          <div className="absolute inset-0 hero-grid opacity-30"></div>
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-pink-300/10 rounded-full blur-3xl"></div>
          <div className="relative max-w-7xl mx-auto px-4 py-20 w-full">
            <div className="grid lg:grid-cols-2 gap-14 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 px-4 py-2 rounded-full text-sm mb-7">
                  🎬 Creative Career Program
                </div>
                <h1 className="text-4xl md:text-6xl font-black leading-tight">
                  Digital Creator{" "}
                  <span className="block text-yellow-300">
                    {" "}Professional Course{" "}
                  </span>
                </h1>
                <p className="mt-6 text-lg md:text-xl text-white/90 max-w-2xl leading-relaxed">
                  Learn content creation, video editing, graphic designing, social media, personal branding, AI tools and creator business skills to build your professional digital career.
                </p>
                <div className="flex flex-wrap gap-3 mt-7">
                  <span className="px-4 py-2 rounded-full bg-white/15 border border-white/20 text-sm">
                    🎥 Video Creation
                  </span>
                  <span className="px-4 py-2 rounded-full bg-white/15 border border-white/20 text-sm">
                    🎨 Graphic Design
                  </span>
                  <span className="px-4 py-2 rounded-full bg-white/15 border border-white/20 text-sm">
                    📱 Social Media
                  </span>
                  <span className="px-4 py-2 rounded-full bg-white/15 border border-white/20 text-sm">
                    🤖 AI Creator Tools
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 mt-9">
                  <a href="#admission" className="px-7 py-3.5 rounded-xl bg-white text-violet-700 font-bold shadow-xl hover:scale-105 transition">
                    {" "}🚀 Apply Now{" "}
                  </a>
                  <a href="#syllabus" className="px-7 py-3.5 rounded-xl border border-white/40 bg-white/10 font-bold hover:bg-white/20 transition">
                    {" "}View Syllabus{" "}
                  </a>
                </div>
              </div>
              <div className="relative">
                <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-3xl p-7 shadow-2xl">
                  <div className="flex items-center justify-between mb-7">
                    <div>
                      <p className="text-white/70 text-sm">
                        Professional Program
                      </p>
                      <h3 className="text-2xl font-bold">
                        Digital Creator
                      </h3>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-white text-violet-600 flex items-center justify-center text-3xl">
                      🎬
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 rounded-2xl p-4">
                      <div className="text-white/60 text-xs">
                        Duration
                      </div>
                      <div className="font-bold mt-1">
                        6 Months
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-2xl p-4">
                      <div className="text-white/60 text-xs">
                        Modules
                      </div>
                      <div className="font-bold mt-1">
                        24 Modules
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-2xl p-4">
                      <div className="text-white/60 text-xs">
                        Projects
                      </div>
                      <div className="font-bold mt-1">
                        15+ Projects
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-2xl p-4">
                      <div className="text-white/60 text-xs">
                        Certificate
                      </div>
                      <div className="font-bold mt-1">
                        Yes
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-white/15">
                    <div className="text-sm text-white/70">
                      Course Fee
                    </div>
                    <div className="flex items-end gap-3 mt-1">
                      <span className="text-4xl font-black">
                        ₹18,000
                      </span>
                      <del className="text-white/50">
                        ₹30,000
                      </del>
                    </div>
                    <div className="mt-4 bg-yellow-300 text-slate-900 text-center font-bold rounded-xl py-2">
                      Special Admission Offer
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="overview" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="max-w-3xl mb-12">
              <span className="text-violet-600 font-bold text-sm uppercase tracking-wider">
                {" "}Course Overview{" "}
              </span>
              <h2 className="text-3xl md:text-4xl font-black mt-2">
                Become a Professional Digital Creator
              </h2>
              <p className="text-slate-600 mt-4 leading-relaxed">
                This practical program helps students learn how to plan, create, edit, publish and monetize professional digital content across multiple platforms.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-3xl border bg-slate-50 hover:shadow-soft transition">
                <div className="text-3xl">
                  🎥
                </div>
                <h3 className="font-bold text-lg mt-4">
                  Content Creation
                </h3>
                <p className="text-sm text-slate-600 mt-2">
                  Learn professional photo, video, reels and short-form content creation.
                </p>
              </div>
              <div className="p-6 rounded-3xl border bg-slate-50 hover:shadow-soft transition">
                <div className="text-3xl">
                  ✂️
                </div>
                <h3 className="font-bold text-lg mt-4">
                  Video Editing
                </h3>
                <p className="text-sm text-slate-600 mt-2">
                  Edit engaging videos, reels, shorts, ads and YouTube content.
                </p>
              </div>
              <div className="p-6 rounded-3xl border bg-slate-50 hover:shadow-soft transition">
                <div className="text-3xl">
                  📱
                </div>
                <h3 className="font-bold text-lg mt-4">
                  Social Media
                </h3>
                <p className="text-sm text-slate-600 mt-2">
                  Build audiences and grow professional creator profiles.
                </p>
              </div>
              <div className="p-6 rounded-3xl border bg-slate-50 hover:shadow-soft transition">
                <div className="text-3xl">
                  🤖
                </div>
                <h3 className="font-bold text-lg mt-4">
                  AI Creator Tools
                </h3>
                <p className="text-sm text-slate-600 mt-2">
                  Use modern AI tools for ideas, scripts, images, videos and productivity.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="journey" className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-violet-600 font-bold text-sm uppercase">
                {" "}Learning Journey{" "}
              </span>
              <h2 className="text-3xl md:text-4xl font-black mt-2">
                6 Month Digital Creator Journey
              </h2>
            </div>
            <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white rounded-2xl p-5 border shadow-sm">
                <span className="text-violet-600 font-black">
                  01
                </span>
                <h3 className="font-bold mt-3">
                  Foundation
                </h3>
                <p className="text-xs text-slate-500 mt-2">
                  Digital creator basics & branding
                </p>
              </div>
              <div className="bg-white rounded-2xl p-5 border shadow-sm">
                <span className="text-violet-600 font-black">
                  02
                </span>
                <h3 className="font-bold mt-3">
                  Design
                </h3>
                <p className="text-xs text-slate-500 mt-2">
                  Canva, thumbnails & social graphics
                </p>
              </div>
              <div className="bg-white rounded-2xl p-5 border shadow-sm">
                <span className="text-violet-600 font-black">
                  03
                </span>
                <h3 className="font-bold mt-3">
                  Video
                </h3>
                <p className="text-xs text-slate-500 mt-2">
                  Reels, Shorts & video editing
                </p>
              </div>
              <div className="bg-white rounded-2xl p-5 border shadow-sm">
                <span className="text-violet-600 font-black">
                  04
                </span>
                <h3 className="font-bold mt-3">
                  Social
                </h3>
                <p className="text-xs text-slate-500 mt-2">
                  Instagram, YouTube & Facebook
                </p>
              </div>
              <div className="bg-white rounded-2xl p-5 border shadow-sm">
                <span className="text-violet-600 font-black">
                  05
                </span>
                <h3 className="font-bold mt-3">
                  AI Tools
                </h3>
                <p className="text-xs text-slate-500 mt-2">
                  AI-powered creator workflow
                </p>
              </div>
              <div className="bg-white rounded-2xl p-5 border shadow-sm">
                <span className="text-violet-600 font-black">
                  06
                </span>
                <h3 className="font-bold mt-3">
                  Monetization
                </h3>
                <p className="text-xs text-slate-500 mt-2">
                  Freelancing & creator business
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="syllabus" className="py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-12">
              <span className="text-violet-600 font-bold text-sm uppercase">
                {" "}Detailed Syllabus{" "}
              </span>
              <h2 className="text-3xl md:text-4xl font-black mt-2">
                24 Module Professional Syllabus
              </h2>
              <p className="text-slate-500 mt-3">
                Click any module to view detailed topics.
              </p>
            </div>
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-bold">
                  {" "}PART A{" "}
                </span>
                <h3 className="font-black text-xl">
                  Digital Creator Foundation
                </h3>
              </div>
              <div className="space-y-3">
                <div className="accordion-item border rounded-2xl overflow-hidden">
                  <button className="accordion-btn w-full px-5 py-4 flex justify-between items-center text-left">
                    <div>
                      <span className="text-xs font-bold text-violet-600">
                        MODULE 01
                      </span>
                      <h4 className="font-bold mt-1">
                        Digital Creator Fundamentals
                      </h4>
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5">
                    <ul className="grid md:grid-cols-2 gap-2 text-sm text-slate-600">
                      <li>
                        • Digital creator ecosystem
                      </li>
                      <li>
                        • Creator economy
                      </li>
                      <li>
                        • Types of digital creators
                      </li>
                      <li>
                        • Content formats
                      </li>
                      <li>
                        • Creator mindset
                      </li>
                      <li>
                        • Professional workflow
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item border rounded-2xl overflow-hidden">
                  <button className="accordion-btn w-full px-5 py-4 flex justify-between items-center text-left">
                    <div>
                      <span className="text-xs font-bold text-violet-600">
                        MODULE 02
                      </span>
                      <h4 className="font-bold mt-1">
                        Personal Branding
                      </h4>
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5">
                    <ul className="grid md:grid-cols-2 gap-2 text-sm text-slate-600">
                      <li>
                        • Personal brand identity
                      </li>
                      <li>
                        • Niche selection
                      </li>
                      <li>
                        • Creator positioning
                      </li>
                      <li>
                        • Bio & profile optimization
                      </li>
                      <li>
                        • Brand voice
                      </li>
                      <li>
                        • Content identity
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item border rounded-2xl overflow-hidden">
                  <button className="accordion-btn w-full px-5 py-4 flex justify-between items-center text-left">
                    <div>
                      <span className="text-xs font-bold text-violet-600">
                        MODULE 03
                      </span>
                      <h4 className="font-bold mt-1">
                        Audience Research & Niche
                      </h4>
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5">
                    <ul className="grid md:grid-cols-2 gap-2 text-sm text-slate-600">
                      <li>
                        • Target audience
                      </li>
                      <li>
                        • Customer persona
                      </li>
                      <li>
                        • Competitor research
                      </li>
                      <li>
                        • Trending topics
                      </li>
                      <li>
                        • Content opportunities
                      </li>
                      <li>
                        • Niche validation
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item border rounded-2xl overflow-hidden">
                  <button className="accordion-btn w-full px-5 py-4 flex justify-between items-center text-left">
                    <div>
                      <span className="text-xs font-bold text-violet-600">
                        MODULE 04
                      </span>
                      <h4 className="font-bold mt-1">
                        Content Strategy & Planning
                      </h4>
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5">
                    <ul className="grid md:grid-cols-2 gap-2 text-sm text-slate-600">
                      <li>
                        • Content pillars
                      </li>
                      <li>
                        • Content calendar
                      </li>
                      <li>
                        • Content ideas
                      </li>
                      <li>
                        • Hook creation
                      </li>
                      <li>
                        • Storytelling
                      </li>
                      <li>
                        • Publishing strategy
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item border rounded-2xl overflow-hidden">
                  <button className="accordion-btn w-full px-5 py-4 flex justify-between items-center text-left">
                    <div>
                      <span className="text-xs font-bold text-violet-600">
                        MODULE 05
                      </span>
                      <h4 className="font-bold mt-1">
                        Photography & Visual Basics
                      </h4>
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5">
                    <ul className="grid md:grid-cols-2 gap-2 text-sm text-slate-600">
                      <li>
                        • Camera & smartphone basics
                      </li>
                      <li>
                        • Lighting fundamentals
                      </li>
                      <li>
                        • Composition
                      </li>
                      <li>
                        • Framing
                      </li>
                      <li>
                        • Background setup
                      </li>
                      <li>
                        • Product photography
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item border rounded-2xl overflow-hidden">
                  <button className="accordion-btn w-full px-5 py-4 flex justify-between items-center text-left">
                    <div>
                      <span className="text-xs font-bold text-violet-600">
                        MODULE 06
                      </span>
                      <h4 className="font-bold mt-1">
                        Creator Workspace & Workflow
                      </h4>
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5">
                    <ul className="grid md:grid-cols-2 gap-2 text-sm text-slate-600">
                      <li>
                        • File management
                      </li>
                      <li>
                        • Content folders
                      </li>
                      <li>
                        • Project workflow
                      </li>
                      <li>
                        • Cloud storage
                      </li>
                      <li>
                        • Backup system
                      </li>
                      <li>
                        • Productivity workflow
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-bold">
                  {" "}PART B{" "}
                </span>
                <h3 className="font-black text-xl">
                  Design & Content Creation
                </h3>
              </div>
              <div className="space-y-3">
                <div className="accordion-item border rounded-2xl overflow-hidden">
                  <button className="accordion-btn w-full px-5 py-4 flex justify-between items-center text-left">
                    <div>
                      <span className="text-xs font-bold text-violet-600">
                        MODULE 07
                      </span>
                      <h4 className="font-bold mt-1">
                        Canva Graphic Designing
                      </h4>
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5">
                    <ul className="grid md:grid-cols-2 gap-2 text-sm text-slate-600">
                      <li>
                        • Canva interface
                      </li>
                      <li>
                        • Social media posts
                      </li>
                      <li>
                        • Posters & banners
                      </li>
                      <li>
                        • Instagram designs
                      </li>
                      <li>
                        • YouTube thumbnails
                      </li>
                      <li>
                        • Brand templates
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item border rounded-2xl overflow-hidden">
                  <button className="accordion-btn w-full px-5 py-4 flex justify-between items-center text-left">
                    <div>
                      <span className="text-xs font-bold text-violet-600">
                        MODULE 08
                      </span>
                      <h4 className="font-bold mt-1">
                        Thumbnail & Social Graphics
                      </h4>
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5">
                    <ul className="grid md:grid-cols-2 gap-2 text-sm text-slate-600">
                      <li>
                        • Thumbnail psychology
                      </li>
                      <li>
                        • Typography
                      </li>
                      <li>
                        • Color selection
                      </li>
                      <li>
                        • Visual hierarchy
                      </li>
                      <li>
                        • Click-worthy designs
                      </li>
                      <li>
                        • A/B creative concepts
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item border rounded-2xl overflow-hidden">
                  <button className="accordion-btn w-full px-5 py-4 flex justify-between items-center text-left">
                    <div>
                      <span className="text-xs font-bold text-violet-600">
                        MODULE 09
                      </span>
                      <h4 className="font-bold mt-1">
                        Video Shooting & Reels
                      </h4>
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5">
                    <ul className="grid md:grid-cols-2 gap-2 text-sm text-slate-600">
                      <li>
                        • Smartphone video
                      </li>
                      <li>
                        • Reel shooting
                      </li>
                      <li>
                        • Camera angles
                      </li>
                      <li>
                        • B-roll
                      </li>
                      <li>
                        • Voice recording
                      </li>
                      <li>
                        • Short-form storytelling
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item border rounded-2xl overflow-hidden">
                  <button className="accordion-btn w-full px-5 py-4 flex justify-between items-center text-left">
                    <div>
                      <span className="text-xs font-bold text-violet-600">
                        MODULE 10
                      </span>
                      <h4 className="font-bold mt-1">
                        Video Editing
                      </h4>
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5">
                    <ul className="grid md:grid-cols-2 gap-2 text-sm text-slate-600">
                      <li>
                        • Timeline editing
                      </li>
                      <li>
                        • Cuts & transitions
                      </li>
                      <li>
                        • Text & captions
                      </li>
                      <li>
                        • Music & sound
                      </li>
                      <li>
                        • Effects
                      </li>
                      <li>
                        • Export settings
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item border rounded-2xl overflow-hidden">
                  <button className="accordion-btn w-full px-5 py-4 flex justify-between items-center text-left">
                    <div>
                      <span className="text-xs font-bold text-violet-600">
                        MODULE 11
                      </span>
                      <h4 className="font-bold mt-1">
                        Reels, Shorts & Viral Content
                      </h4>
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5">
                    <ul className="grid md:grid-cols-2 gap-2 text-sm text-slate-600">
                      <li>
                        • Viral content structure
                      </li>
                      <li>
                        • Strong hooks
                      </li>
                      <li>
                        • Retention techniques
                      </li>
                      <li>
                        • Trending formats
                      </li>
                      <li>
                        • Short-form editing
                      </li>
                      <li>
                        • Publishing strategy
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item border rounded-2xl overflow-hidden">
                  <button className="accordion-btn w-full px-5 py-4 flex justify-between items-center text-left">
                    <div>
                      <span className="text-xs font-bold text-violet-600">
                        MODULE 12
                      </span>
                      <h4 className="font-bold mt-1">
                        Content Writing & Copywriting
                      </h4>
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5">
                    <ul className="grid md:grid-cols-2 gap-2 text-sm text-slate-600">
                      <li>
                        • Caption writing
                      </li>
                      <li>
                        • Video scripts
                      </li>
                      <li>
                        • Storytelling copy
                      </li>
                      <li>
                        • CTA writing
                      </li>
                      <li>
                        • Headlines
                      </li>
                      <li>
                        • Social media copy
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                  {" "}PART C{" "}
                </span>
                <h3 className="font-black text-xl">
                  Social Media & Creator Growth
                </h3>
              </div>
              <div className="space-y-3">
                <div className="accordion-item border rounded-2xl overflow-hidden">
                  <button className="accordion-btn w-full px-5 py-4 flex justify-between items-center text-left">
                    <div>
                      <span className="text-xs font-bold text-violet-600">
                        MODULE 13
                      </span>
                      <h4 className="font-bold mt-1">
                        Instagram Creator Marketing
                      </h4>
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5">
                    <ul className="grid md:grid-cols-2 gap-2 text-sm text-slate-600">
                      <li>
                        • Professional profile
                      </li>
                      <li>
                        • Reels strategy
                      </li>
                      <li>
                        • Stories
                      </li>
                      <li>
                        • Highlights
                      </li>
                      <li>
                        • Engagement
                      </li>
                      <li>
                        • Growth strategy
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item border rounded-2xl overflow-hidden">
                  <button className="accordion-btn w-full px-5 py-4 flex justify-between items-center text-left">
                    <div>
                      <span className="text-xs font-bold text-violet-600">
                        MODULE 14
                      </span>
                      <h4 className="font-bold mt-1">
                        YouTube Creator Marketing
                      </h4>
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5">
                    <ul className="grid md:grid-cols-2 gap-2 text-sm text-slate-600">
                      <li>
                        • YouTube channel setup
                      </li>
                      <li>
                        • Video planning
                      </li>
                      <li>
                        • Titles & descriptions
                      </li>
                      <li>
                        • Thumbnails
                      </li>
                      <li>
                        • YouTube Shorts
                      </li>
                      <li>
                        • Channel analytics
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item border rounded-2xl overflow-hidden">
                  <button className="accordion-btn w-full px-5 py-4 flex justify-between items-center text-left">
                    <div>
                      <span className="text-xs font-bold text-violet-600">
                        MODULE 15
                      </span>
                      <h4 className="font-bold mt-1">
                        Facebook & Community Building
                      </h4>
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5">
                    <ul className="grid md:grid-cols-2 gap-2 text-sm text-slate-600">
                      <li>
                        • Facebook page
                      </li>
                      <li>
                        • Content publishing
                      </li>
                      <li>
                        • Groups
                      </li>
                      <li>
                        • Community engagement
                      </li>
                      <li>
                        • Creator tools
                      </li>
                      <li>
                        • Audience growth
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item border rounded-2xl overflow-hidden">
                  <button className="accordion-btn w-full px-5 py-4 flex justify-between items-center text-left">
                    <div>
                      <span className="text-xs font-bold text-violet-600">
                        MODULE 16
                      </span>
                      <h4 className="font-bold mt-1">
                        LinkedIn Personal Branding
                      </h4>
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5">
                    <ul className="grid md:grid-cols-2 gap-2 text-sm text-slate-600">
                      <li>
                        • LinkedIn profile
                      </li>
                      <li>
                        • Creator mode
                      </li>
                      <li>
                        • Professional content
                      </li>
                      <li>
                        • Networking
                      </li>
                      <li>
                        • Personal branding
                      </li>
                      <li>
                        • Lead generation
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item border rounded-2xl overflow-hidden">
                  <button className="accordion-btn w-full px-5 py-4 flex justify-between items-center text-left">
                    <div>
                      <span className="text-xs font-bold text-violet-600">
                        MODULE 17
                      </span>
                      <h4 className="font-bold mt-1">
                        Social Media Analytics
                      </h4>
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5">
                    <ul className="grid md:grid-cols-2 gap-2 text-sm text-slate-600">
                      <li>
                        • Reach
                      </li>
                      <li>
                        • Engagement
                      </li>
                      <li>
                        • Watch time
                      </li>
                      <li>
                        • Followers
                      </li>
                      <li>
                        • Audience insights
                      </li>
                      <li>
                        • Performance reports
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item border rounded-2xl overflow-hidden">
                  <button className="accordion-btn w-full px-5 py-4 flex justify-between items-center text-left">
                    <div>
                      <span className="text-xs font-bold text-violet-600">
                        MODULE 18
                      </span>
                      <h4 className="font-bold mt-1">
                        Creator Growth Strategy
                      </h4>
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5">
                    <ul className="grid md:grid-cols-2 gap-2 text-sm text-slate-600">
                      <li>
                        • Organic growth
                      </li>
                      <li>
                        • Engagement strategy
                      </li>
                      <li>
                        • Collaboration
                      </li>
                      <li>
                        • Influencer networking
                      </li>
                      <li>
                        • Audience retention
                      </li>
                      <li>
                        • Growth planning
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                  {" "}PART D{" "}
                </span>
                <h3 className="font-black text-xl">
                  AI, Monetization & Professional Creator
                </h3>
              </div>
              <div className="space-y-3">
                <div className="accordion-item border rounded-2xl overflow-hidden">
                  <button className="accordion-btn w-full px-5 py-4 flex justify-between items-center text-left">
                    <div>
                      <span className="text-xs font-bold text-violet-600">
                        MODULE 19
                      </span>
                      <h4 className="font-bold mt-1">
                        AI Tools for Digital Creators
                      </h4>
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5">
                    <ul className="grid md:grid-cols-2 gap-2 text-sm text-slate-600">
                      <li>
                        • AI content ideas
                      </li>
                      <li>
                        • AI script writing
                      </li>
                      <li>
                        • AI image generation
                      </li>
                      <li>
                        • AI video concepts
                      </li>
                      <li>
                        • Prompt engineering basics
                      </li>
                      <li>
                        • AI productivity
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item border rounded-2xl overflow-hidden">
                  <button className="accordion-btn w-full px-5 py-4 flex justify-between items-center text-left">
                    <div>
                      <span className="text-xs font-bold text-violet-600">
                        MODULE 20
                      </span>
                      <h4 className="font-bold mt-1">
                        Creator Monetization
                      </h4>
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5">
                    <ul className="grid md:grid-cols-2 gap-2 text-sm text-slate-600">
                      <li>
                        • YouTube monetization concepts
                      </li>
                      <li>
                        • Brand collaborations
                      </li>
                      <li>
                        • Sponsored content
                      </li>
                      <li>
                        • Affiliate marketing
                      </li>
                      <li>
                        • Digital products
                      </li>
                      <li>
                        • Creator income models
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item border rounded-2xl overflow-hidden">
                  <button className="accordion-btn w-full px-5 py-4 flex justify-between items-center text-left">
                    <div>
                      <span className="text-xs font-bold text-violet-600">
                        MODULE 21
                      </span>
                      <h4 className="font-bold mt-1">
                        Freelancing for Creators
                      </h4>
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5">
                    <ul className="grid md:grid-cols-2 gap-2 text-sm text-slate-600">
                      <li>
                        • Freelance profile
                      </li>
                      <li>
                        • Portfolio creation
                      </li>
                      <li>
                        • Client communication
                      </li>
                      <li>
                        • Proposal writing
                      </li>
                      <li>
                        • Pricing strategy
                      </li>
                      <li>
                        • Client management
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item border rounded-2xl overflow-hidden">
                  <button className="accordion-btn w-full px-5 py-4 flex justify-between items-center text-left">
                    <div>
                      <span className="text-xs font-bold text-violet-600">
                        MODULE 22
                      </span>
                      <h4 className="font-bold mt-1">
                        Brand Collaboration & Sponsorship
                      </h4>
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5">
                    <ul className="grid md:grid-cols-2 gap-2 text-sm text-slate-600">
                      <li>
                        • Brand pitch
                      </li>
                      <li>
                        • Media kit
                      </li>
                      <li>
                        • Sponsorship proposal
                      </li>
                      <li>
                        • Influencer collaboration
                      </li>
                      <li>
                        • Campaign execution
                      </li>
                      <li>
                        • Professional communication
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item border rounded-2xl overflow-hidden">
                  <button className="accordion-btn w-full px-5 py-4 flex justify-between items-center text-left">
                    <div>
                      <span className="text-xs font-bold text-violet-600">
                        MODULE 23
                      </span>
                      <h4 className="font-bold mt-1">
                        Portfolio & Creator Business
                      </h4>
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5">
                    <ul className="grid md:grid-cols-2 gap-2 text-sm text-slate-600">
                      <li>
                        • Creator portfolio
                      </li>
                      <li>
                        • Professional media kit
                      </li>
                      <li>
                        • Service packages
                      </li>
                      <li>
                        • Personal website
                      </li>
                      <li>
                        • Client acquisition
                      </li>
                      <li>
                        • Business workflow
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item border rounded-2xl overflow-hidden">
                  <button className="accordion-btn w-full px-5 py-4 flex justify-between items-center text-left">
                    <div>
                      <span className="text-xs font-bold text-violet-600">
                        MODULE 24
                      </span>
                      <h4 className="font-bold mt-1">
                        Final Digital Creator Project
                      </h4>
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5">
                    <ul className="grid md:grid-cols-2 gap-2 text-sm text-slate-600">
                      <li>
                        • Complete creator profile
                      </li>
                      <li>
                        • Content calendar
                      </li>
                      <li>
                        • 10+ social media creatives
                      </li>
                      <li>
                        • 5+ professional reels
                      </li>
                      <li>
                        • YouTube content project
                      </li>
                      <li>
                        • Final portfolio presentation
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <span className="text-violet-600 font-bold text-sm uppercase">
                {" "}Tools Covered{" "}
              </span>
              <h2 className="text-3xl md:text-4xl font-black mt-2">
                Professional Creator Tools
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="bg-white border rounded-2xl p-5 text-center font-bold">
                Canva
              </div>
              <div className="bg-white border rounded-2xl p-5 text-center font-bold">
                CapCut
              </div>
              <div className="bg-white border rounded-2xl p-5 text-center font-bold">
                YouTube
              </div>
              <div className="bg-white border rounded-2xl p-5 text-center font-bold">
                Instagram
              </div>
              <div className="bg-white border rounded-2xl p-5 text-center font-bold">
                Facebook
              </div>
              <div className="bg-white border rounded-2xl p-5 text-center font-bold">
                LinkedIn
              </div>
              <div className="bg-white border rounded-2xl p-5 text-center font-bold">
                ChatGPT
              </div>
              <div className="bg-white border rounded-2xl p-5 text-center font-bold">
                AI Tools
              </div>
              <div className="bg-white border rounded-2xl p-5 text-center font-bold">
                Google Drive
              </div>
              <div className="bg-white border rounded-2xl p-5 text-center font-bold">
                Google Sheets
              </div>
              <div className="bg-white border rounded-2xl p-5 text-center font-bold">
                Meta Business
              </div>
              <div className="bg-white border rounded-2xl p-5 text-center font-bold">
                Creator Studio
              </div>
            </div>
          </div>
        </section>
        <section id="projects" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="max-w-3xl mb-12">
              <span className="text-violet-600 font-bold text-sm uppercase">
                {" "}Practical Training{" "}
              </span>
              <h2 className="text-3xl md:text-4xl font-black mt-2">
                15+ Real World Creator Projects
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="p-6 border rounded-3xl">
                <div className="text-3xl">
                  📱
                </div>
                <h3 className="font-bold mt-4">
                  Instagram Brand Page
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Complete creator profile & content strategy.
                </p>
              </div>
              <div className="p-6 border rounded-3xl">
                <div className="text-3xl">
                  🎬
                </div>
                <h3 className="font-bold mt-4">
                  Reels Campaign
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Create a professional short-video campaign.
                </p>
              </div>
              <div className="p-6 border rounded-3xl">
                <div className="text-3xl">
                  ▶️
                </div>
                <h3 className="font-bold mt-4">
                  YouTube Channel
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Channel setup, branding and content plan.
                </p>
              </div>
              <div className="p-6 border rounded-3xl">
                <div className="text-3xl">
                  🎨
                </div>
                <h3 className="font-bold mt-4">
                  Creator Branding Kit
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Logo, colors, templates and visual identity.
                </p>
              </div>
              <div className="p-6 border rounded-3xl">
                <div className="text-3xl">
                  🖼️
                </div>
                <h3 className="font-bold mt-4">
                  Thumbnail Portfolio
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Professional YouTube thumbnail collection.
                </p>
              </div>
              <div className="p-6 border rounded-3xl">
                <div className="text-3xl">
                  🤖
                </div>
                <h3 className="font-bold mt-4">
                  AI Content Project
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Create an AI-assisted content workflow.
                </p>
              </div>
              <div className="p-6 border rounded-3xl">
                <div className="text-3xl">
                  💼
                </div>
                <h3 className="font-bold mt-4">
                  Creator Portfolio
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Build a professional digital portfolio.
                </p>
              </div>
              <div className="p-6 border rounded-3xl">
                <div className="text-3xl">
                  🚀
                </div>
                <h3 className="font-bold mt-4">
                  Final Creator Project
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Complete creator business and monetization project.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="career" className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <span className="text-violet-600 font-bold text-sm uppercase">
                {" "}Career Opportunities{" "}
              </span>
              <h2 className="text-3xl md:text-4xl font-black mt-2">
                Where Can You Work?
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white border rounded-2xl p-5 font-bold">
                🎥 Digital Creator
              </div>
              <div className="bg-white border rounded-2xl p-5 font-bold">
                📱 Social Media Creator
              </div>
              <div className="bg-white border rounded-2xl p-5 font-bold">
                🎬 Video Editor
              </div>
              <div className="bg-white border rounded-2xl p-5 font-bold">
                🎨 Content Designer
              </div>
              <div className="bg-white border rounded-2xl p-5 font-bold">
                ▶️ YouTube Creator
              </div>
              <div className="bg-white border rounded-2xl p-5 font-bold">
                📸 Content Creator
              </div>
              <div className="bg-white border rounded-2xl p-5 font-bold">
                💼 Creator Freelancer
              </div>
              <div className="bg-white border rounded-2xl p-5 font-bold">
                📢 Social Media Executive
              </div>
              <div className="bg-white border rounded-2xl p-5 font-bold">
                🧠 Content Strategist
              </div>
              <div className="bg-white border rounded-2xl p-5 font-bold">
                🤝 Influencer Manager
              </div>
              <div className="bg-white border rounded-2xl p-5 font-bold">
                📣 Brand Content Executive
              </div>
              <div className="bg-white border rounded-2xl p-5 font-bold">
                🚀 Personal Brand Consultant
              </div>
            </div>
          </div>
        </section>
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center p-7 rounded-3xl bg-violet-50">
                <div className="text-4xl">
                  🎯
                </div>
                <h3 className="font-bold mt-4">
                  Practical Training
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Hands-on creator projects.
                </p>
              </div>
              <div className="text-center p-7 rounded-3xl bg-pink-50">
                <div className="text-4xl">
                  💻
                </div>
                <h3 className="font-bold mt-4">
                  Portfolio
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Build a professional portfolio.
                </p>
              </div>
              <div className="text-center p-7 rounded-3xl bg-blue-50">
                <div className="text-4xl">
                  💰
                </div>
                <h3 className="font-bold mt-4">
                  Freelancing
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Learn creator service business.
                </p>
              </div>
              <div className="text-center p-7 rounded-3xl bg-emerald-50">
                <div className="text-4xl">
                  🏆
                </div>
                <h3 className="font-bold mt-4">
                  Certificate
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Course completion certificate.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="fees" className="py-20 bg-slate-900 text-white">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-12">
              <span className="text-violet-300 font-bold text-sm uppercase">
                {" "}Course Fees{" "}
              </span>
              <h2 className="text-3xl md:text-4xl font-black mt-2">
                Choose Your Learning Plan
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-7">
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                <h3 className="text-xl font-bold">
                  Regular Program
                </h3>
                <div className="mt-5">
                  <span className="text-4xl font-black">
                    ₹18,000
                  </span>
                  {" "}
                  <del className="text-white/40 ml-2">
                    ₹30,000
                  </del>
                </div>
                <div className="mt-6 space-y-3 text-sm text-white/75">
                  <p>
                    ✓ 6 Months Training
                  </p>
                  <p>
                    ✓ 24 Detailed Modules
                  </p>
                  <p>
                    ✓ 15+ Practical Projects
                  </p>
                  <p>
                    ✓ Creator Tools Training
                  </p>
                  <p>
                    ✓ Portfolio Development
                  </p>
                  <p>
                    ✓ Course Certificate
                  </p>
                </div>
                <a href="#admission" className="block text-center mt-7 bg-white text-slate-900 rounded-xl py-3 font-bold">
                  {" "}Apply Now{" "}
                </a>
              </div>
              <div className="bg-gradient-to-br from-violet-600 to-pink-600 rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute top-5 right-5 bg-yellow-300 text-slate-900 px-3 py-1 rounded-full text-xs font-black">
                  BEST VALUE
                </div>
                <h3 className="text-xl font-bold">
                  Career Creator Plan
                </h3>
                <div className="mt-5">
                  <span className="text-4xl font-black">
                    ₹25,000
                  </span>
                </div>
                <div className="mt-6 space-y-3 text-sm text-white/90">
                  <p>
                    ✓ Everything in Regular Plan
                  </p>
                  <p>
                    ✓ Advanced Creator Projects
                  </p>
                  <p>
                    ✓ Freelancing Guidance
                  </p>
                  <p>
                    ✓ Portfolio Review
                  </p>
                  <p>
                    ✓ Personal Branding Project
                  </p>
                  <p>
                    ✓ Career Guidance
                  </p>
                </div>
                <a href="#admission" className="block text-center mt-7 bg-white text-violet-700 rounded-xl py-3 font-bold">
                  {" "}Join Career Plan{" "}
                </a>
              </div>
            </div>
          </div>
        </section>
        <section id="admission" className="py-20 bg-slate-50">
          <div className="max-w-5xl mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-10 items-start">
              <div>
                <span className="text-violet-600 font-bold text-sm uppercase">
                  {" "}Admission{" "}
                </span>
                <h2 className="text-3xl md:text-4xl font-black mt-2">
                  Start Your Digital Creator Journey
                </h2>
                <p className="text-slate-600 mt-4 leading-relaxed">
                  Fill the admission form and our counsellor will contact you for course details, batch timing and admission process.
                </p>
                <div className="mt-8 space-y-4">
                  <div className="flex gap-4">
                    <div className="w-11 h-11 rounded-xl bg-violet-100 flex items-center justify-center">
                      📞
                    </div>
                    <div>
                      <div className="font-bold">
                        Call / WhatsApp
                      </div>
                      <div className="text-sm text-slate-500">
                        +91 99999 99999
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-11 h-11 rounded-xl bg-pink-100 flex items-center justify-center">
                      ✉️
                    </div>
                    <div>
                      <div className="font-bold">
                        Email
                      </div>
                      <div className="text-sm text-slate-500">
                        info@pnsacademy.com
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">
                      📍
                    </div>
                    <div>
                      <div className="font-bold">
                        Location
                      </div>
                      <div className="text-sm text-slate-500">
                        Bihar, India
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-3xl p-7 md:p-8 shadow-soft border">
                <h3 className="text-xl font-black mb-6">
                  Admission Enquiry Form
                </h3>
                <form id="admissionForm" className="space-y-4">
                  <input id="name" type="text" required placeholder="Full Name" className="w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-violet-500" />
                  {" "}
                  <input id="mobile" type="tel" required placeholder="Mobile Number" className="w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-violet-500" />
                  {" "}
                  <input id="email" type="email" placeholder="Email Address" className="w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-violet-500" />
                  <select id="qualification" className="w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-violet-500">
                    <option value="">
                      Select Qualification
                    </option>
                    <option>
                      10th
                    </option>
                    <option>
                      12th
                    </option>
                    <option>
                      Graduate
                    </option>
                    <option>
                      Post Graduate
                    </option>
                    <option>
                      Working Professional
                    </option>
                    <option>
                      Business Owner
                    </option>
                  </select>
                  <select id="mode" className="w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-violet-500">
                    <option value="">
                      Preferred Mode
                    </option>
                    <option>
                      Offline
                    </option>
                    <option>
                      Online
                    </option>
                    <option>
                      Hybrid
                    </option>
                  </select>
                  <button type="submit" className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold hover:opacity-90">
                    {" "}🚀 Submit & Apply on WhatsApp{" "}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
        <section className="py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4">
            <div className="bg-gradient-to-br from-violet-700 to-pink-600 rounded-3xl p-8 md:p-12 text-white text-center">
              <div className="text-5xl">
                🏆
              </div>
              <h2 className="text-3xl md:text-4xl font-black mt-5">
                Digital Creator Course Certificate
              </h2>
              <p className="text-white/80 max-w-2xl mx-auto mt-4">
                Successfully complete the training and practical projects to receive a course completion certificate from Career Optics Computer Centre.
              </p>
              <div className="grid sm:grid-cols-3 gap-4 mt-8 max-w-3xl mx-auto">
                <div className="bg-white/10 rounded-2xl p-4">
                  <div className="font-bold">
                    Course Certificate
                  </div>
                  <div className="text-xs text-white/70 mt-1">
                    Professional Program
                  </div>
                </div>
                <div className="bg-white/10 rounded-2xl p-4">
                  <div className="font-bold">
                    Project Portfolio
                  </div>
                  <div className="text-xs text-white/70 mt-1">
                    Practical Work
                  </div>
                </div>
                <div className="bg-white/10 rounded-2xl p-4">
                  <div className="font-bold">
                    Career Skills
                  </div>
                  <div className="text-xs text-white/70 mt-1">
                    Creator Ready
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="faq" className="py-20 bg-slate-50">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-10">
              <span className="text-violet-600 font-bold text-sm uppercase">
                {" "}FAQ{" "}
              </span>
              <h2 className="text-3xl md:text-4xl font-black mt-2">
                Frequently Asked Questions
              </h2>
            </div>
            <div className="space-y-3">
              <div className="faq border rounded-2xl bg-white overflow-hidden">
                <button className="faq-btn w-full p-5 text-left flex justify-between font-bold">
                  Who can join the Digital Creator course?
                  <span>
                    +
                  </span>
                </button>
                <div className="faq-content hidden px-5 pb-5 text-sm text-slate-600">
                  Students, beginners, working professionals, business owners and anyone interested in digital content creation can join.
                </div>
              </div>
              <div className="faq border rounded-2xl bg-white overflow-hidden">
                <button className="faq-btn w-full p-5 text-left flex justify-between font-bold">
                  Do I need professional camera equipment?
                  <span>
                    +
                  </span>
                </button>
                <div className="faq-content hidden px-5 pb-5 text-sm text-slate-600">
                  No. The course includes smartphone-based content creation, so beginners can start with a smartphone.
                </div>
              </div>
              <div className="faq border rounded-2xl bg-white overflow-hidden">
                <button className="faq-btn w-full p-5 text-left flex justify-between font-bold">
                  Will I learn video editing?
                  <span>
                    +
                  </span>
                </button>
                <div className="faq-content hidden px-5 pb-5 text-sm text-slate-600">
                  Yes. Reels, Shorts, YouTube videos, captions, transitions, audio and professional editing workflow are covered.
                </div>
              </div>
              <div className="faq border rounded-2xl bg-white overflow-hidden">
                <button className="faq-btn w-full p-5 text-left flex justify-between font-bold">
                  Can I earn through freelancing?
                  <span>
                    +
                  </span>
                </button>
                <div className="faq-content hidden px-5 pb-5 text-sm text-slate-600">
                  The course covers portfolio creation, client communication, pricing, proposals and creator services for freelancing.
                </div>
              </div>
              <div className="faq border rounded-2xl bg-white overflow-hidden">
                <button className="faq-btn w-full p-5 text-left flex justify-between font-bold">
                  Is certificate provided?
                  <span>
                    +
                  </span>
                </button>
                <div className="faq-content hidden px-5 pb-5 text-sm text-slate-600">
                  Yes, eligible students receive a course completion certificate after completing the required training and projects.
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="py-20 bg-gradient-to-r from-violet-700 via-fuchsia-600 to-pink-500 text-white">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-5xl font-black">
              Create. Grow. Earn.
            </h2>
            <p className="mt-5 text-white/85 text-lg">
              Build your skills and start your professional Digital Creator journey.
            </p>
            <div className="flex justify-center flex-wrap gap-4 mt-8">
              <a href="#admission" className="px-8 py-4 rounded-xl bg-white text-violet-700 font-black">
                {" "}🚀 Apply Now{" "}
              </a>
              <a href="https://wa.me/919999999999" target="_blank" className="px-8 py-4 rounded-xl bg-green-500 text-white font-black">
                {" "}💬 WhatsApp Us{" "}
              </a>
            </div>
          </div>
        </section>
        <footer className="bg-slate-950 text-white py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="text-2xl font-black">
                  Career Optics Computer Centre
                </div>
                <p className="text-sm text-white/50 mt-3">
                  Professional computer, digital and career skill training.
                </p>
              </div>
              <div>
                <h3 className="font-bold">
                  Course
                </h3>
                <div className="text-sm text-white/50 space-y-2 mt-4">
                  <div>
                    Digital Creator
                  </div>
                  <div>
                    Graphic Designing
                  </div>
                  <div>
                    Digital Marketing
                  </div>
                  <div>
                    Web Development
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-bold">
                  Quick Links
                </h3>
                <div className="text-sm text-white/50 space-y-2 mt-4">
                  <div>
                    <a href="#syllabus">
                      Syllabus
                    </a>
                  </div>
                  <div>
                    <a href="#projects">
                      Projects
                    </a>
                  </div>
                  <div>
                    <a href="#career">
                      Career
                    </a>
                  </div>
                  <div>
                    <a href="#admission">
                      Admission
                    </a>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-bold">
                  Contact
                </h3>
                <div className="text-sm text-white/50 space-y-2 mt-4">
                  <div>
                    📞 +91 99999 99999
                  </div>
                  <div>
                    ✉️ info@pnsacademy.com
                  </div>
                  <div>
                    📍 Bihar, India
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-white/10 mt-10 pt-6 text-center text-xs text-white/40">
              © 2026 Career Optics Computer Centre. All Rights Reserved.
            </div>
          </div>
        </footer>
        <a href="https://wa.me/919999999999" target="_blank" className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-green-500 text-white flex items-center justify-center text-2xl shadow-xl hover:scale-110 transition">
          💬
        </a>
        <script dangerouslySetInnerHTML={{ __html: js_a1c26f0b }} />
        ```
      </body>
    </html>
  );
}
