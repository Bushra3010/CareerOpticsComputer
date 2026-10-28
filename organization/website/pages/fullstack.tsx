import css_a9e2415d from "../styles/a9e2415d.css?raw";
import js_90a066f6 from "../behaviour/90a066f6.js?raw";
import js_ceee1808 from "../behaviour/ceee1808.js?raw";

/** fullstack.html */
export default function Fullstack() {
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
          Full Stack Development Internship | Career Optics Computer Centre
        </title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script dangerouslySetInnerHTML={{ __html: js_90a066f6 }} />
        <style dangerouslySetInnerHTML={{ __html: css_a9e2415d }} />
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-16 flex items-center justify-between">
              <a href="#" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black shadow-lg">
                  P
                </div>
                <div>
                  <div className="font-black text-lg leading-none">
                    Career Optics Computer Centre
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-slate-500">
                    Skill • Career • Success
                  </div>
                </div>
              </a>
              <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold">
                <a href="#overview" className="hover:text-indigo-600">
                  {" "}Overview{" "}
                </a>
                {" "}
                <a href="#internship" className="hover:text-indigo-600">
                  {" "}Internship{" "}
                </a>
                {" "}
                <a href="#syllabus" className="hover:text-indigo-600">
                  {" "}Syllabus{" "}
                </a>
                {" "}
                <a href="#projects" className="hover:text-indigo-600">
                  {" "}Projects{" "}
                </a>
                {" "}
                <a href="#career" className="hover:text-indigo-600">
                  {" "}Career{" "}
                </a>
                {" "}
                <a href="#admission" className="hover:text-indigo-600">
                  {" "}Admission{" "}
                </a>
                {" "}
                <a href="#faq" className="hover:text-indigo-600">
                  {" "}FAQ{" "}
                </a>
                {" "}
                <a href="#admission" className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg">
                  {" "}Apply Now{" "}
                </a>
              </nav>
              <button id="menuBtn" className="lg:hidden w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-xl">
                ☰
              </button>
            </div>
            <div id="mobileMenu" className="hidden lg:hidden pb-5">
              <div className="grid gap-2 text-sm font-semibold">
                <a href="#overview" className="px-4 py-3 rounded-xl hover:bg-slate-100">
                  {" "}Overview{" "}
                </a>
                <a href="#internship" className="px-4 py-3 rounded-xl hover:bg-slate-100">
                  {" "}Internship{" "}
                </a>
                <a href="#syllabus" className="px-4 py-3 rounded-xl hover:bg-slate-100">
                  {" "}Syllabus{" "}
                </a>
                <a href="#projects" className="px-4 py-3 rounded-xl hover:bg-slate-100">
                  {" "}Projects{" "}
                </a>
                <a href="#career" className="px-4 py-3 rounded-xl hover:bg-slate-100">
                  {" "}Career{" "}
                </a>
                <a href="#admission" className="px-4 py-3 rounded-xl hover:bg-slate-100">
                  {" "}Admission{" "}
                </a>
                <a href="#faq" className="px-4 py-3 rounded-xl hover:bg-slate-100">
                  {" "}FAQ{" "}
                </a>
              </div>
            </div>
          </div>
        </header>
        <div className="sticky top-16 z-40 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-3 sm:px-6">
            <div className="flex overflow-x-auto gap-2 py-2 text-xs sm:text-sm font-bold">
              <a href="#overview" className="tab px-4 py-2 rounded-lg whitespace-nowrap tab-active">
                {" "}Overview{" "}
              </a>
              <a href="#internship" className="tab px-4 py-2 rounded-lg whitespace-nowrap hover:bg-slate-100">
                {" "}Internship{" "}
              </a>
              <a href="#syllabus" className="tab px-4 py-2 rounded-lg whitespace-nowrap hover:bg-slate-100">
                {" "}Syllabus{" "}
              </a>
              <a href="#projects" className="tab px-4 py-2 rounded-lg whitespace-nowrap hover:bg-slate-100">
                {" "}Projects{" "}
              </a>
              <a href="#career" className="tab px-4 py-2 rounded-lg whitespace-nowrap hover:bg-slate-100">
                {" "}Career{" "}
              </a>
              <a href="#admission" className="tab px-4 py-2 rounded-lg whitespace-nowrap hover:bg-slate-100">
                {" "}Admission{" "}
              </a>
              <a href="#faq" className="tab px-4 py-2 rounded-lg whitespace-nowrap hover:bg-slate-100">
                {" "}FAQ{" "}
              </a>
            </div>
          </div>
        </div>
        <section className="hero-bg text-white">
          <div className="max-w-[1500px] mx-auto px-5 sm:px-8 lg:px-12">
            <div className="min-h-[650px] lg:min-h-[700px] grid lg:grid-cols-[1.25fr_.75fr] gap-10 lg:gap-16 items-center py-14 lg:py-20">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-xs sm:text-sm font-bold mb-6">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Industry-Oriented Internship Program
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight leading-[1.05]">
                  Full Stack{" "}
                  <span className="text-violet-300">
                    {" "}Development{" "}
                  </span>
                  {" "}Internship
                </h1>
                <p className="mt-6 max-w-3xl text-base sm:text-lg text-slate-200 leading-8">
                  Learn frontend, backend, database, APIs and deployment through practical internship training. Build real-world web applications using HTML, CSS, JavaScript, React, Node.js, Express.js, MongoDB and modern development tools.
                </p>
                <div className="flex flex-wrap gap-2 mt-7">
                  <span className="glass px-4 py-2 rounded-full text-xs font-bold">
                    {" "}HTML5{" "}
                  </span>
                  <span className="glass px-4 py-2 rounded-full text-xs font-bold">
                    {" "}CSS3{" "}
                  </span>
                  <span className="glass px-4 py-2 rounded-full text-xs font-bold">
                    {" "}JavaScript{" "}
                  </span>
                  <span className="glass px-4 py-2 rounded-full text-xs font-bold">
                    {" "}React.js{" "}
                  </span>
                  <span className="glass px-4 py-2 rounded-full text-xs font-bold">
                    {" "}Node.js{" "}
                  </span>
                  <span className="glass px-4 py-2 rounded-full text-xs font-bold">
                    {" "}Express.js{" "}
                  </span>
                  <span className="glass px-4 py-2 rounded-full text-xs font-bold">
                    {" "}MongoDB{" "}
                  </span>
                  <span className="glass px-4 py-2 rounded-full text-xs font-bold">
                    {" "}Git & GitHub{" "}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 mt-9">
                  <a href="#admission" className="inline-flex justify-center items-center px-7 py-4 rounded-2xl bg-white text-indigo-700 font-black hover:bg-slate-100 transition shadow-xl">
                    Apply for Internship →
                  </a>
                  <a href="#syllabus" className="inline-flex justify-center items-center px-7 py-4 rounded-2xl glass font-black hover:bg-white/20 transition">
                    View Internship Syllabus
                  </a>
                </div>
              </div>
              <div className="glass rounded-[2rem] p-6 sm:p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-7">
                  <div>
                    <p className="text-xs text-slate-300">
                      Internship Fee
                    </p>
                    <div className="flex items-end gap-3">
                      <span className="text-4xl font-black">
                        {" "}₹15,000{" "}
                      </span>
                      <del className="text-slate-400">
                        {" "}₹25,000{" "}
                      </del>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-300 text-xs font-black">
                    {" "}LIMITED OFFER{" "}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/10 p-4">
                    <div className="text-2xl font-black">
                      6
                    </div>
                    <div className="text-xs text-slate-300 mt-1">
                      Months
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <div className="text-2xl font-black">
                      15+
                    </div>
                    <div className="text-xs text-slate-300 mt-1">
                      Projects
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <div className="text-2xl font-black">
                      Live
                    </div>
                    <div className="text-xs text-slate-300 mt-1">
                      Practical Training
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <div className="text-2xl font-black">
                      Yes
                    </div>
                    <div className="text-xs text-slate-300 mt-1">
                      Certificate
                    </div>
                  </div>
                </div>
                <div className="mt-6 p-4 rounded-2xl bg-black/20">
                  <div className="text-xs text-slate-300">
                    Internship Focus
                  </div>
                  <div className="font-black mt-1">
                    Learn → Build → Deploy → Portfolio
                  </div>
                </div>
                <div className="mt-5 p-4 rounded-2xl bg-emerald-400/10 border border-emerald-300/20">
                  <div className="text-sm font-black text-emerald-300">
                    ✓ Practical Internship Certificate
                  </div>
                  <div className="text-xs text-slate-300 mt-1">
                    Subject to successful completion of internship requirements.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="overview" className="py-20">
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <div className="max-w-3xl">
              <span className="text-indigo-600 font-black text-sm uppercase tracking-widest">
                {" "}Internship Overview{" "}
              </span>
              <h2 className="text-3xl sm:text-5xl font-black mt-3">
                Learn Full Stack Development by Building
              </h2>
              <p className="mt-5 text-slate-600 leading-8">
                This internship is designed for students and beginners who want practical experience in complete web application development — from frontend UI to backend APIs, database and production deployment.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white rounded-3xl p-7 shadow-soft border">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-black">
                  01
                </div>
                <h3 className="font-black text-xl mt-6">
                  Frontend Development
                </h3>
                <p className="text-slate-600 text-sm leading-7 mt-3">
                  HTML5, CSS3, responsive design, JavaScript, Bootstrap, Tailwind CSS and React.
                </p>
              </div>
              <div className="bg-white rounded-3xl p-7 shadow-soft border">
                <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl font-black">
                  02
                </div>
                <h3 className="font-black text-xl mt-6">
                  Backend Development
                </h3>
                <p className="text-slate-600 text-sm leading-7 mt-3">
                  Node.js, Express.js, server-side programming, REST APIs, authentication and backend architecture.
                </p>
              </div>
              <div className="bg-white rounded-3xl p-7 shadow-soft border">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-black">
                  03
                </div>
                <h3 className="font-black text-xl mt-6">
                  Database & Deployment
                </h3>
                <p className="text-slate-600 text-sm leading-7 mt-3">
                  MongoDB, CRUD, database integration, GitHub, hosting, deployment and project presentation.
                </p>
              </div>
            </div>
            <div className="mt-16">
              <h3 className="text-2xl font-black">
                Internship Learning Outcomes
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-7">
                <div className="bg-white border rounded-2xl p-5 font-bold">
                  ✓ Responsive Websites
                </div>
                <div className="bg-white border rounded-2xl p-5 font-bold">
                  ✓ JavaScript Applications
                </div>
                <div className="bg-white border rounded-2xl p-5 font-bold">
                  ✓ React Applications
                </div>
                <div className="bg-white border rounded-2xl p-5 font-bold">
                  ✓ Node.js Backend
                </div>
                <div className="bg-white border rounded-2xl p-5 font-bold">
                  ✓ REST APIs
                </div>
                <div className="bg-white border rounded-2xl p-5 font-bold">
                  ✓ MongoDB Database
                </div>
                <div className="bg-white border rounded-2xl p-5 font-bold">
                  ✓ Authentication
                </div>
                <div className="bg-white border rounded-2xl p-5 font-bold">
                  ✓ Git & Deployment
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="internship" className="py-20 bg-slate-100">
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-indigo-600 font-black text-sm uppercase tracking-widest">
                {" "}Internship Journey{" "}
              </span>
              <h2 className="text-3xl sm:text-5xl font-black mt-3">
                6 Month Practical Internship Roadmap
              </h2>
              <p className="text-slate-600 mt-5 leading-7">
                A structured journey from beginner fundamentals to professional full stack project development.
              </p>
            </div>
            <div className="max-w-4xl mx-auto mt-14 relative">
              <div className="timeline-line"></div>
              <div className="relative flex gap-6 pb-10">
                <div className="w-10 h-10 shrink-0 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black z-10">
                  1
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-soft flex-1">
                  <div className="text-xs font-black text-indigo-600">
                    MONTH 1
                  </div>
                  <h3 className="text-xl font-black mt-2">
                    Web Development Foundation
                  </h3>
                  <p className="text-sm text-slate-600 mt-3 leading-7">
                    HTML5, CSS3, responsive design, Flexbox, Grid, Bootstrap, Tailwind CSS and basic Git.
                  </p>
                </div>
              </div>
              <div className="relative flex gap-6 pb-10">
                <div className="w-10 h-10 shrink-0 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black z-10">
                  2
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-soft flex-1">
                  <div className="text-xs font-black text-indigo-600">
                    MONTH 2
                  </div>
                  <h3 className="text-xl font-black mt-2">
                    JavaScript & Frontend
                  </h3>
                  <p className="text-sm text-slate-600 mt-3 leading-7">
                    JavaScript fundamentals, DOM, events, ES6+, Fetch API, JSON, browser storage and projects.
                  </p>
                </div>
              </div>
              <div className="relative flex gap-6 pb-10">
                <div className="w-10 h-10 shrink-0 rounded-full bg-purple-600 text-white flex items-center justify-center font-black z-10">
                  3
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-soft flex-1">
                  <div className="text-xs font-black text-purple-600">
                    MONTH 3
                  </div>
                  <h3 className="text-xl font-black mt-2">
                    React.js Development
                  </h3>
                  <p className="text-sm text-slate-600 mt-3 leading-7">
                    Components, props, state, hooks, forms, API integration, routing and React projects.
                  </p>
                </div>
              </div>
              <div className="relative flex gap-6 pb-10">
                <div className="w-10 h-10 shrink-0 rounded-full bg-purple-600 text-white flex items-center justify-center font-black z-10">
                  4
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-soft flex-1">
                  <div className="text-xs font-black text-purple-600">
                    MONTH 4
                  </div>
                  <h3 className="text-xl font-black mt-2">
                    Node.js & Express.js
                  </h3>
                  <p className="text-sm text-slate-600 mt-3 leading-7">
                    Node.js fundamentals, npm, Express.js, middleware, REST APIs, authentication and security.
                  </p>
                </div>
              </div>
              <div className="relative flex gap-6 pb-10">
                <div className="w-10 h-10 shrink-0 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black z-10">
                  5
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-soft flex-1">
                  <div className="text-xs font-black text-emerald-600">
                    MONTH 5
                  </div>
                  <h3 className="text-xl font-black mt-2">
                    MongoDB & Full Stack Integration
                  </h3>
                  <p className="text-sm text-slate-600 mt-3 leading-7">
                    MongoDB, Mongoose, CRUD, relationships, React + Node integration and complete API projects.
                  </p>
                </div>
              </div>
              <div className="relative flex gap-6">
                <div className="w-10 h-10 shrink-0 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black z-10">
                  6
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-soft flex-1">
                  <div className="text-xs font-black text-emerald-600">
                    MONTH 6
                  </div>
                  <h3 className="text-xl font-black mt-2">
                    Final Project & Deployment
                  </h3>
                  <p className="text-sm text-slate-600 mt-3 leading-7">
                    Complete full stack project, testing, GitHub, deployment, documentation, portfolio and presentation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="py-16 bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <div className="text-center">
              <span className="text-indigo-300 font-black text-sm uppercase tracking-widest">
                {" "}Technology Stack{" "}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black mt-3">
                Technologies You Will Practice
              </h2>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-10">
              <span className="px-5 py-3 rounded-xl bg-white/10 border border-white/10 font-bold">
                {" "}HTML5{" "}
              </span>
              <span className="px-5 py-3 rounded-xl bg-white/10 border border-white/10 font-bold">
                {" "}CSS3{" "}
              </span>
              <span className="px-5 py-3 rounded-xl bg-white/10 border border-white/10 font-bold">
                {" "}JavaScript{" "}
              </span>
              <span className="px-5 py-3 rounded-xl bg-white/10 border border-white/10 font-bold">
                {" "}Bootstrap{" "}
              </span>
              <span className="px-5 py-3 rounded-xl bg-white/10 border border-white/10 font-bold">
                {" "}Tailwind CSS{" "}
              </span>
              <span className="px-5 py-3 rounded-xl bg-white/10 border border-white/10 font-bold">
                {" "}React.js{" "}
              </span>
              <span className="px-5 py-3 rounded-xl bg-white/10 border border-white/10 font-bold">
                {" "}Node.js{" "}
              </span>
              <span className="px-5 py-3 rounded-xl bg-white/10 border border-white/10 font-bold">
                {" "}Express.js{" "}
              </span>
              <span className="px-5 py-3 rounded-xl bg-white/10 border border-white/10 font-bold">
                {" "}MongoDB{" "}
              </span>
              <span className="px-5 py-3 rounded-xl bg-white/10 border border-white/10 font-bold">
                {" "}Mongoose{" "}
              </span>
              <span className="px-5 py-3 rounded-xl bg-white/10 border border-white/10 font-bold">
                {" "}REST API{" "}
              </span>
              <span className="px-5 py-3 rounded-xl bg-white/10 border border-white/10 font-bold">
                {" "}Postman{" "}
              </span>
              <span className="px-5 py-3 rounded-xl bg-white/10 border border-white/10 font-bold">
                {" "}Git{" "}
              </span>
              <span className="px-5 py-3 rounded-xl bg-white/10 border border-white/10 font-bold">
                {" "}GitHub{" "}
              </span>
              <span className="px-5 py-3 rounded-xl bg-white/10 border border-white/10 font-bold">
                {" "}VS Code{" "}
              </span>
            </div>
          </div>
        </section>
        <section id="syllabus" className="py-20">
          <div className="max-w-6xl mx-auto px-5 sm:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-indigo-600 font-black text-sm uppercase tracking-widest">
                {" "}Internship Syllabus{" "}
              </span>
              <h2 className="text-3xl sm:text-5xl font-black mt-3">
                Complete Full Stack Development Syllabus
              </h2>
              <p className="text-slate-600 mt-5">
                Click each module to view detailed topics.
              </p>
            </div>
            <div className="mt-12 space-y-5">
              <div className="rounded-3xl overflow-hidden border">
                <div className="px-6 py-4 bg-slate-900 text-white font-black">
                  PART A — WEB & FRONTEND FOUNDATION
                </div>
                <div className="accordion-item bg-white border-b">
                  <button className="accordion-btn w-full px-6 py-5 flex justify-between text-left">
                    <span className="font-black">
                      {" "}01. Web Development Fundamentals{" "}
                    </span>
                    <span className="plus-icon text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content">
                    <div className="px-6 pb-6 text-sm text-slate-600 leading-8">
                      Internet & Web • Client Server Architecture • Web Browsers • Domains • Hosting • HTTP/HTTPS • Frontend vs Backend • Developer Tools.
                    </div>
                  </div>
                </div>
                <div className="accordion-item bg-white border-b">
                  <button className="accordion-btn w-full px-6 py-5 flex justify-between text-left">
                    <span className="font-black">
                      {" "}02. HTML5 Fundamentals{" "}
                    </span>
                    <span className="plus-icon text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content">
                    <div className="px-6 pb-6 text-sm text-slate-600 leading-8">
                      HTML Structure • Headings • Paragraphs • Links • Images • Tables • Lists • Forms • Inputs • Semantic Elements • Audio • Video • SEO Basics.
                    </div>
                  </div>
                </div>
                <div className="accordion-item bg-white border-b">
                  <button className="accordion-btn w-full px-6 py-5 flex justify-between text-left">
                    <span className="font-black">
                      {" "}03. CSS3 & Responsive Design{" "}
                    </span>
                    <span className="plus-icon text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content">
                    <div className="px-6 pb-6 text-sm text-slate-600 leading-8">
                      Selectors • Colors • Typography • Box Model • Positioning • Flexbox • Grid • Transitions • Animations • Media Queries • Mobile First Design.
                    </div>
                  </div>
                </div>
                <div className="accordion-item bg-white border-b">
                  <button className="accordion-btn w-full px-6 py-5 flex justify-between text-left">
                    <span className="font-black">
                      {" "}04. Bootstrap & Tailwind CSS{" "}
                    </span>
                    <span className="plus-icon text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content">
                    <div className="px-6 pb-6 text-sm text-slate-600 leading-8">
                      Bootstrap Grid • Components • Navbar • Cards • Forms • Tailwind Utilities • Responsive Classes • Flex • Grid • Shadows • Responsive UI Design.
                    </div>
                  </div>
                </div>
                <div className="accordion-item bg-white border-b">
                  <button className="accordion-btn w-full px-6 py-5 flex justify-between text-left">
                    <span className="font-black">
                      {" "}05. UI/UX & Web Interface Design{" "}
                    </span>
                    <span className="plus-icon text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content">
                    <div className="px-6 pb-6 text-sm text-slate-600 leading-8">
                      Layout Principles • Typography • Color Basics • Spacing • Components • Forms • Navigation • Mobile UI • Figma Introduction.
                    </div>
                  </div>
                </div>
                <div className="accordion-item bg-white">
                  <button className="accordion-btn w-full px-6 py-5 flex justify-between text-left">
                    <span className="font-black">
                      {" "}06. Git & GitHub Fundamentals{" "}
                    </span>
                    <span className="plus-icon text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content">
                    <div className="px-6 pb-6 text-sm text-slate-600 leading-8">
                      Git Installation • Repository • Commit • Branch • Merge • Push • Pull • GitHub • README • Project Version Control.
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-3xl overflow-hidden border">
                <div className="px-6 py-4 bg-indigo-600 text-white font-black">
                  PART B — JAVASCRIPT & REACT DEVELOPMENT
                </div>
                <div className="accordion-item bg-white border-b">
                  <button className="accordion-btn w-full px-6 py-5 flex justify-between text-left">
                    <span className="font-black">
                      {" "}07. JavaScript Fundamentals{" "}
                    </span>
                    <span className="plus-icon text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content">
                    <div className="px-6 pb-6 text-sm text-slate-600 leading-8">
                      Variables • Data Types • Operators • Conditions • Loops • Functions • Arrays • Objects • Strings • Scope • Basic Problem Solving.
                    </div>
                  </div>
                </div>
                <div className="accordion-item bg-white border-b">
                  <button className="accordion-btn w-full px-6 py-5 flex justify-between text-left">
                    <span className="font-black">
                      {" "}08. DOM & Events{" "}
                    </span>
                    <span className="plus-icon text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content">
                    <div className="px-6 pb-6 text-sm text-slate-600 leading-8">
                      DOM Selection • DOM Manipulation • Events • Forms • Validation • Dynamic Elements • Event Listeners • Browser Interaction.
                    </div>
                  </div>
                </div>
                <div className="accordion-item bg-white border-b">
                  <button className="accordion-btn w-full px-6 py-5 flex justify-between text-left">
                    <span className="font-black">
                      {" "}09. Modern JavaScript ES6+{" "}
                    </span>
                    <span className="plus-icon text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content">
                    <div className="px-6 pb-6 text-sm text-slate-600 leading-8">
                      Let & Const • Arrow Functions • Template Literals • Destructuring • Spread • Rest • Modules • Map • Filter • Reduce.
                    </div>
                  </div>
                </div>
                <div className="accordion-item bg-white border-b">
                  <button className="accordion-btn w-full px-6 py-5 flex justify-between text-left">
                    <span className="font-black">
                      {" "}10. Async JavaScript & Fetch API{" "}
                    </span>
                    <span className="plus-icon text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content">
                    <div className="px-6 pb-6 text-sm text-slate-600 leading-8">
                      Callbacks • Promises • Async/Await • Fetch API • JSON • API Requests • Error Handling • Loading States.
                    </div>
                  </div>
                </div>
                <div className="accordion-item bg-white border-b">
                  <button className="accordion-btn w-full px-6 py-5 flex justify-between text-left">
                    <span className="font-black">
                      {" "}11. React.js Fundamentals{" "}
                    </span>
                    <span className="plus-icon text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content">
                    <div className="px-6 pb-6 text-sm text-slate-600 leading-8">
                      React Introduction • Vite • Components • JSX • Props • State • Events • Conditional Rendering • Lists • Reusable Components.
                    </div>
                  </div>
                </div>
                <div className="accordion-item bg-white">
                  <button className="accordion-btn w-full px-6 py-5 flex justify-between text-left">
                    <span className="font-black">
                      {" "}12. React Hooks & Applications{" "}
                    </span>
                    <span className="plus-icon text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content">
                    <div className="px-6 pb-6 text-sm text-slate-600 leading-8">
                      useState • useEffect • useContext • Forms • React Router • API Integration • Custom Hooks • State Management Basics.
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-3xl overflow-hidden border">
                <div className="px-6 py-4 bg-purple-600 text-white font-black">
                  PART C — NODE.JS, EXPRESS & DATABASE
                </div>
                <div className="accordion-item bg-white border-b">
                  <button className="accordion-btn w-full px-6 py-5 flex justify-between text-left">
                    <span className="font-black">
                      {" "}13. Node.js Fundamentals{" "}
                    </span>
                    <span className="plus-icon text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content">
                    <div className="px-6 pb-6 text-sm text-slate-600 leading-8">
                      Node.js Architecture • V8 Engine • npm • package.json • Modules • File System • Events • HTTP • Environment Variables.
                    </div>
                  </div>
                </div>
                <div className="accordion-item bg-white border-b">
                  <button className="accordion-btn w-full px-6 py-5 flex justify-between text-left">
                    <span className="font-black">
                      {" "}14. Express.js Development{" "}
                    </span>
                    <span className="plus-icon text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content">
                    <div className="px-6 pb-6 text-sm text-slate-600 leading-8">
                      Express Setup • Routes • Controllers • Middleware • Request • Response • Error Handling • Static Files.
                    </div>
                  </div>
                </div>
                <div className="accordion-item bg-white border-b">
                  <button className="accordion-btn w-full px-6 py-5 flex justify-between text-left">
                    <span className="font-black">
                      {" "}15. REST API Development{" "}
                    </span>
                    <span className="plus-icon text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content">
                    <div className="px-6 pb-6 text-sm text-slate-600 leading-8">
                      REST Architecture • GET • POST • PUT • PATCH • DELETE • HTTP Status Codes • JSON • API Testing with Postman.
                    </div>
                  </div>
                </div>
                <div className="accordion-item bg-white border-b">
                  <button className="accordion-btn w-full px-6 py-5 flex justify-between text-left">
                    <span className="font-black">
                      {" "}16. MongoDB Database{" "}
                    </span>
                    <span className="plus-icon text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content">
                    <div className="px-6 pb-6 text-sm text-slate-600 leading-8">
                      MongoDB Concepts • Collections • Documents • CRUD • Queries • MongoDB Atlas • Indexes • Database Design.
                    </div>
                  </div>
                </div>
                <div className="accordion-item bg-white border-b">
                  <button className="accordion-btn w-full px-6 py-5 flex justify-between text-left">
                    <span className="font-black">
                      {" "}17. Mongoose & Database Integration{" "}
                    </span>
                    <span className="plus-icon text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content">
                    <div className="px-6 pb-6 text-sm text-slate-600 leading-8">
                      Schemas • Models • Validation • CRUD • Relationships • Population • Queries • Database Integration with Express.
                    </div>
                  </div>
                </div>
                <div className="accordion-item bg-white">
                  <button className="accordion-btn w-full px-6 py-5 flex justify-between text-left">
                    <span className="font-black">
                      {" "}18. Authentication & Authorization{" "}
                    </span>
                    <span className="plus-icon text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content">
                    <div className="px-6 pb-6 text-sm text-slate-600 leading-8">
                      Registration • Login • Password Hashing • JWT • Cookies • Protected Routes • Roles • Admin Authentication • Secure API.
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-3xl overflow-hidden border">
                <div className="px-6 py-4 bg-emerald-600 text-white font-black">
                  PART D — FULL STACK PROJECT & PROFESSIONAL DEVELOPMENT
                </div>
                <div className="accordion-item bg-white border-b">
                  <button className="accordion-btn w-full px-6 py-5 flex justify-between text-left">
                    <span className="font-black">
                      {" "}19. React + Node.js Integration{" "}
                    </span>
                    <span className="plus-icon text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content">
                    <div className="px-6 pb-6 text-sm text-slate-600 leading-8">
                      Frontend API Integration • Axios/Fetch • Authentication Flow • CRUD Interface • Protected Routes • Backend Integration.
                    </div>
                  </div>
                </div>
                <div className="accordion-item bg-white border-b">
                  <button className="accordion-btn w-full px-6 py-5 flex justify-between text-left">
                    <span className="font-black">
                      {" "}20. Full Stack Application Architecture{" "}
                    </span>
                    <span className="plus-icon text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content">
                    <div className="px-6 pb-6 text-sm text-slate-600 leading-8">
                      Frontend Architecture • Backend Architecture • Database Design • API Structure • Controllers • Services • Components • Project Organization.
                    </div>
                  </div>
                </div>
                <div className="accordion-item bg-white border-b">
                  <button className="accordion-btn w-full px-6 py-5 flex justify-between text-left">
                    <span className="font-black">
                      {" "}21. Testing & Debugging{" "}
                    </span>
                    <span className="plus-icon text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content">
                    <div className="px-6 pb-6 text-sm text-slate-600 leading-8">
                      Browser DevTools • Console • Network Tab • API Testing • Debugging • Error Handling • Performance Optimization.
                    </div>
                  </div>
                </div>
                <div className="accordion-item bg-white border-b">
                  <button className="accordion-btn w-full px-6 py-5 flex justify-between text-left">
                    <span className="font-black">
                      {" "}22. Deployment & Hosting{" "}
                    </span>
                    <span className="plus-icon text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content">
                    <div className="px-6 pb-6 text-sm text-slate-600 leading-8">
                      Production Build • Environment Variables • GitHub • Vercel • Render • Cloud Deployment • Domain • Hosting • Deployment Troubleshooting.
                    </div>
                  </div>
                </div>
                <div className="accordion-item bg-white border-b">
                  <button className="accordion-btn w-full px-6 py-5 flex justify-between text-left">
                    <span className="font-black">
                      {" "}23. Portfolio & Internship Documentation{" "}
                    </span>
                    <span className="plus-icon text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content">
                    <div className="px-6 pb-6 text-sm text-slate-600 leading-8">
                      GitHub Portfolio • Project README • Resume Project Section • Project Screenshots • Documentation • Demo Presentation • Interview Preparation.
                    </div>
                  </div>
                </div>
                <div className="accordion-item bg-white">
                  <button className="accordion-btn w-full px-6 py-5 flex justify-between text-left">
                    <span className="font-black">
                      {" "}24. Final Full Stack Development Project{" "}
                    </span>
                    <span className="plus-icon text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content">
                    <div className="px-6 pb-6 text-sm text-slate-600 leading-8">
                      Requirement Analysis • UI Design • React Frontend • Node.js Backend • Express REST API • MongoDB • Authentication • Admin Panel • Testing • GitHub • Live Deployment • Final Presentation.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="projects" className="py-20 bg-slate-100">
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <div className="text-center">
              <span className="text-indigo-600 font-black text-sm uppercase tracking-widest">
                {" "}Practical Work{" "}
              </span>
              <h2 className="text-3xl sm:text-5xl font-black mt-3">
                Internship Projects
              </h2>
              <p className="text-slate-600 mt-4">
                Build projects that can be added to your portfolio.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
              <div className="bg-white rounded-3xl p-6 shadow-soft">
                <div className="text-3xl">
                  🛒
                </div>
                <h3 className="font-black mt-5">
                  E-Commerce Website
                </h3>
                <p className="text-sm text-slate-600 mt-2">
                  Products, cart, users, orders and admin management.
                </p>
              </div>
              <div className="bg-white rounded-3xl p-6 shadow-soft">
                <div className="text-3xl">
                  🎓
                </div>
                <h3 className="font-black mt-5">
                  Student Management
                </h3>
                <p className="text-sm text-slate-600 mt-2">
                  Student records, courses, admission and dashboard.
                </p>
              </div>
              <div className="bg-white rounded-3xl p-6 shadow-soft">
                <div className="text-3xl">
                  📊
                </div>
                <h3 className="font-black mt-5">
                  Admin Dashboard
                </h3>
                <p className="text-sm text-slate-600 mt-2">
                  Users, reports, authentication and management modules.
                </p>
              </div>
              <div className="bg-white rounded-3xl p-6 shadow-soft">
                <div className="text-3xl">
                  💼
                </div>
                <h3 className="font-black mt-5">
                  Job Portal
                </h3>
                <p className="text-sm text-slate-600 mt-2">
                  Jobs, candidates, applications and recruiter dashboard.
                </p>
              </div>
              <div className="bg-white rounded-3xl p-6 shadow-soft">
                <div className="text-3xl">
                  📞
                </div>
                <h3 className="font-black mt-5">
                  CRM / Lead Management
                </h3>
                <p className="text-sm text-slate-600 mt-2">
                  Leads, enquiries, follow-ups and customer management.
                </p>
              </div>
              <div className="bg-white rounded-3xl p-6 shadow-soft">
                <div className="text-3xl">
                  📰
                </div>
                <h3 className="font-black mt-5">
                  News Portal
                </h3>
                <p className="text-sm text-slate-600 mt-2">
                  Categories, articles, users and content management.
                </p>
              </div>
              <div className="bg-white rounded-3xl p-6 shadow-soft">
                <div className="text-3xl">
                  📚
                </div>
                <h3 className="font-black mt-5">
                  Learning Platform
                </h3>
                <p className="text-sm text-slate-600 mt-2">
                  Courses, students, lessons and dashboard.
                </p>
              </div>
              <div className="bg-white rounded-3xl p-6 shadow-soft">
                <div className="text-3xl">
                  🚀
                </div>
                <h3 className="font-black mt-5">
                  Final Full Stack App
                </h3>
                <p className="text-sm text-slate-600 mt-2">
                  Complete frontend, backend, database and deployment.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="career" className="py-20">
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-indigo-600 font-black text-sm uppercase tracking-widest">
                  {" "}Career Benefits{" "}
                </span>
                <h2 className="text-3xl sm:text-5xl font-black mt-3">
                  Build Skills for Real Development Jobs
                </h2>
                <p className="text-slate-600 mt-5 leading-8">
                  The internship focuses on practical development, portfolio projects, GitHub work and deployment so students can demonstrate actual development skills.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="border rounded-2xl p-5 font-bold">
                  Frontend Developer
                </div>
                <div className="border rounded-2xl p-5 font-bold">
                  React Developer
                </div>
                <div className="border rounded-2xl p-5 font-bold">
                  Node.js Developer
                </div>
                <div className="border rounded-2xl p-5 font-bold">
                  Backend Developer
                </div>
                <div className="border rounded-2xl p-5 font-bold">
                  Full Stack Developer
                </div>
                <div className="border rounded-2xl p-5 font-bold">
                  JavaScript Developer
                </div>
                <div className="border rounded-2xl p-5 font-bold">
                  Web Application Developer
                </div>
                <div className="border rounded-2xl p-5 font-bold">
                  Freelance Web Developer
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="py-20 bg-slate-100">
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <div className="text-center">
              <span className="text-indigo-600 font-black text-sm uppercase tracking-widest">
                {" "}Internship Benefits{" "}
              </span>
              <h2 className="text-3xl sm:text-5xl font-black mt-3">
                What You Get
              </h2>
            </div>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-5 mt-12">
              <div className="bg-white rounded-3xl p-6 border shadow-soft">
                <div className="text-3xl">
                  💻
                </div>
                <h3 className="font-black mt-5">
                  Practical Training
                </h3>
                <p className="text-sm text-slate-600 mt-2">
                  Hands-on coding and application development.
                </p>
              </div>
              <div className="bg-white rounded-3xl p-6 border shadow-soft">
                <div className="text-3xl">
                  🚀
                </div>
                <h3 className="font-black mt-5">
                  Live Projects
                </h3>
                <p className="text-sm text-slate-600 mt-2">
                  Build portfolio-ready development projects.
                </p>
              </div>
              <div className="bg-white rounded-3xl p-6 border shadow-soft">
                <div className="text-3xl">
                  🐙
                </div>
                <h3 className="font-black mt-5">
                  GitHub Portfolio
                </h3>
                <p className="text-sm text-slate-600 mt-2">
                  Learn version control and project publishing.
                </p>
              </div>
              <div className="bg-white rounded-3xl p-6 border shadow-soft">
                <div className="text-3xl">
                  📜
                </div>
                <h3 className="font-black mt-5">
                  Certificate
                </h3>
                <p className="text-sm text-slate-600 mt-2">
                  Certificate on successful internship completion.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="py-20 bg-slate-900 text-white">
          <div className="max-w-5xl mx-auto px-5 text-center">
            <span className="text-indigo-300 font-black text-sm uppercase tracking-widest">
              {" "}Internship Investment{" "}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black mt-3">
              Full Stack Development Internship
            </h2>
            <div className="max-w-md mx-auto mt-10 rounded-[2rem] bg-white text-slate-900 p-8 shadow-2xl">
              <div className="text-sm text-slate-500">
                Internship Fee
              </div>
              <div className="text-5xl font-black mt-2">
                ₹15,000
              </div>
              <del className="text-slate-400">
                {" "}₹25,000{" "}
              </del>
              <div className="mt-6 grid gap-3 text-left text-sm">
                <div className="p-3 bg-slate-50 rounded-xl">
                  ✓ 6 Months Internship
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  ✓ Complete Full Stack Training
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  ✓ Live Practical Projects
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  ✓ GitHub Portfolio Guidance
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  ✓ Deployment Practice
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  ✓ Internship Certificate
                </div>
              </div>
              <a href="#admission" className="block mt-7 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-xl transition">
                {" "}Apply for Internship{" "}
              </a>
            </div>
          </div>
        </section>
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white border rounded-3xl p-8 shadow-soft">
                <h3 className="text-2xl font-black">
                  Who Can Join?
                </h3>
                <ul className="mt-6 space-y-4 text-sm text-slate-600">
                  <li>
                    ✓ 10th / 12th Pass Students
                  </li>
                  <li>
                    ✓ ITI / Diploma Students
                  </li>
                  <li>
                    ✓ College Students
                  </li>
                  <li>
                    ✓ BCA / BSc IT / B.Tech Students
                  </li>
                  <li>
                    ✓ Freshers
                  </li>
                  <li>
                    ✓ Beginners Interested in Coding
                  </li>
                  <li>
                    ✓ Students Looking for Practical Experience
                  </li>
                </ul>
              </div>
              <div className="bg-white border rounded-3xl p-8 shadow-soft">
                <h3 className="text-2xl font-black">
                  Requirements
                </h3>
                <ul className="mt-6 space-y-4 text-sm text-slate-600">
                  <li>
                    ✓ Basic Computer Knowledge
                  </li>
                  <li>
                    ✓ Laptop / Desktop Recommended
                  </li>
                  <li>
                    ✓ Internet Connection
                  </li>
                  <li>
                    ✓ Basic English Reading
                  </li>
                  <li>
                    ✓ Regular Coding Practice
                  </li>
                  <li>
                    ✓ Willingness to Build Projects
                  </li>
                  <li>
                    ✓ No Prior Full Stack Experience Required
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        <section id="admission" className="py-20 bg-slate-100">
          <div className="max-w-6xl mx-auto px-5 sm:px-8">
            <div className="grid lg:grid-cols-2 gap-10">
              <div>
                <span className="text-indigo-600 font-black text-sm uppercase tracking-widest">
                  {" "}Internship Admission{" "}
                </span>
                <h2 className="text-3xl sm:text-5xl font-black mt-3">
                  Start Your Full Stack Internship
                </h2>
                <p className="text-slate-600 leading-8 mt-5">
                  Fill out the enquiry form. Our counsellor can share batch timing, internship structure, fee and admission details.
                </p>
                <div className="mt-8 space-y-4">
                  <div className="bg-white rounded-2xl p-5 border">
                    📞{" "}
                    <strong>
                      Phone:
                    </strong>
                    {" "}+91 99999 99999
                  </div>
                  <div className="bg-white rounded-2xl p-5 border">
                    ✉️{" "}
                    <strong>
                      Email:
                    </strong>
                    {" "}info@pnsacademy.com
                  </div>
                  <div className="bg-white rounded-2xl p-5 border">
                    📍{" "}
                    <strong>
                      Location:
                    </strong>
                    {" "}Bihar, India
                  </div>
                </div>
              </div>
              <form id="admissionForm" className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-soft border">
                <h3 className="text-2xl font-black">
                  Internship Enquiry Form
                </h3>
                <div className="grid gap-5 mt-7">
                  <div>
                    <label className="text-sm font-bold">
                      {" "}Student Name{" "}
                    </label>
                    {" "}
                    <input id="studentName" required type="text" placeholder="Enter your name" className="w-full mt-2 px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="text-sm font-bold">
                      {" "}Mobile Number{" "}
                    </label>
                    {" "}
                    <input id="mobile" required type="tel" placeholder="Enter mobile number" className="w-full mt-2 px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="text-sm font-bold">
                      {" "}Email{" "}
                    </label>
                    {" "}
                    <input id="email" type="email" placeholder="Enter email" className="w-full mt-2 px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="text-sm font-bold">
                      {" "}Qualification{" "}
                    </label>
                    <select id="qualification" className="w-full mt-2 px-4 py-3 rounded-xl border border-slate-200 outline-none">
                      <option value="">
                        {" "}Select Qualification{" "}
                      </option>
                      <option>
                        10th
                      </option>
                      <option>
                        12th
                      </option>
                      <option>
                        ITI
                      </option>
                      <option>
                        Diploma
                      </option>
                      <option>
                        Graduation
                      </option>
                      <option>
                        Post Graduation
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-bold">
                      {" "}Preferred Mode{" "}
                    </label>
                    <select id="mode" className="w-full mt-2 px-4 py-3 rounded-xl border border-slate-200 outline-none">
                      <option>
                        Online
                      </option>
                      <option>
                        Offline
                      </option>
                      <option>
                        Both
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-bold">
                      {" "}Message{" "}
                    </label>
                    {" "}
                    <textarea id="message" rows={4} placeholder="Write your message..." className="w-full mt-2 px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" />
                  </div>
                  <button type="submit" className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black transition">
                    {" "}Apply via WhatsApp{" "}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
        <section className="py-20">
          <div className="max-w-5xl mx-auto px-5">
            <div className="rounded-[2rem] bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-8 sm:p-12 text-center">
              <div className="text-5xl">
                🏆
              </div>
              <h2 className="text-3xl sm:text-4xl font-black mt-5">
                Full Stack Internship Certificate
              </h2>
              <p className="max-w-2xl mx-auto mt-4 text-indigo-100 leading-7">
                Students who successfully complete the required internship training, practical work and project requirements can receive a Career Optics Computer Centre internship completion certificate.
              </p>
            </div>
          </div>
        </section>
        <section id="faq" className="py-20 bg-slate-100">
          <div className="max-w-4xl mx-auto px-5">
            <div className="text-center">
              <span className="text-indigo-600 font-black text-sm uppercase tracking-widest">
                {" "}FAQ{" "}
              </span>
              <h2 className="text-3xl sm:text-5xl font-black mt-3">
                Frequently Asked Questions
              </h2>
            </div>
            <div className="mt-10 space-y-4">
              <div className="faq-item bg-white border rounded-2xl overflow-hidden">
                <button className="faq-btn w-full px-6 py-5 text-left flex justify-between font-black">
                  Is this internship suitable for beginners?
                  <span className="faq-icon text-xl">
                    +
                  </span>
                </button>
                <div className="faq-content hidden px-6 pb-6 text-sm text-slate-600 leading-7">
                  Yes. The internship starts from web development fundamentals and gradually moves to JavaScript, React, Node.js, database and full stack projects.
                </div>
              </div>
              <div className="faq-item bg-white border rounded-2xl overflow-hidden">
                <button className="faq-btn w-full px-6 py-5 text-left flex justify-between font-black">
                  What technologies will I learn?
                  <span className="faq-icon text-xl">
                    +
                  </span>
                </button>
                <div className="faq-content hidden px-6 pb-6 text-sm text-slate-600 leading-7">
                  HTML, CSS, JavaScript, Bootstrap, Tailwind CSS, React.js, Node.js, Express.js, MongoDB, Git, GitHub, REST API and deployment.
                </div>
              </div>
              <div className="faq-item bg-white border rounded-2xl overflow-hidden">
                <button className="faq-btn w-full px-6 py-5 text-left flex justify-between font-black">
                  Will I build real projects?
                  <span className="faq-icon text-xl">
                    +
                  </span>
                </button>
                <div className="faq-content hidden px-6 pb-6 text-sm text-slate-600 leading-7">
                  Yes. The internship is project-focused and includes multiple practical applications plus a final full stack project.
                </div>
              </div>
              <div className="faq-item bg-white border rounded-2xl overflow-hidden">
                <button className="faq-btn w-full px-6 py-5 text-left flex justify-between font-black">
                  Will I learn GitHub?
                  <span className="faq-icon text-xl">
                    +
                  </span>
                </button>
                <div className="faq-content hidden px-6 pb-6 text-sm text-slate-600 leading-7">
                  Yes. Git and GitHub are included for version control, project publishing and portfolio development.
                </div>
              </div>
              <div className="faq-item bg-white border rounded-2xl overflow-hidden">
                <button className="faq-btn w-full px-6 py-5 text-left flex justify-between font-black">
                  Will I receive an internship certificate?
                  <span className="faq-icon text-xl">
                    +
                  </span>
                </button>
                <div className="faq-content hidden px-6 pb-6 text-sm text-slate-600 leading-7">
                  Yes, subject to successful completion of the internship requirements and applicable institute policy.
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
          <div className="max-w-5xl mx-auto px-5 text-center">
            <h2 className="text-3xl sm:text-5xl font-black">
              Ready to Start Your Full Stack Journey?
            </h2>
            <p className="mt-5 text-indigo-100 leading-7">
              Learn → Practice → Build → Deploy → Create Portfolio
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              <a href="#admission" className="px-8 py-4 rounded-xl bg-white text-indigo-700 font-black hover:bg-slate-100">
                {" "}Apply for Internship{" "}
              </a>
              <a href="#syllabus" className="px-8 py-4 rounded-xl border border-white/30 font-black hover:bg-white/10">
                {" "}View Syllabus{" "}
              </a>
            </div>
          </div>
        </section>
        <footer className="bg-slate-950 text-slate-400">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
            <div className="grid md:grid-cols-3 gap-10">
              <div>
                <div className="flex items-center gap-3 text-white">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black">
                    P
                  </div>
                  <div className="font-black text-xl">
                    Career Optics Computer Centre
                  </div>
                </div>
                <p className="mt-5 text-sm leading-7">
                  Professional computer education and practical career-focused skill development programs.
                </p>
              </div>
              <div>
                <h3 className="text-white font-black">
                  Full Stack Internship
                </h3>
                <div className="mt-5 space-y-3 text-sm">
                  <a href="#overview" className="block hover:text-white">
                    {" "}Overview{" "}
                  </a>
                  {" "}
                  <a href="#internship" className="block hover:text-white">
                    {" "}Internship Roadmap{" "}
                  </a>
                  {" "}
                  <a href="#syllabus" className="block hover:text-white">
                    {" "}Syllabus{" "}
                  </a>
                  {" "}
                  <a href="#projects" className="block hover:text-white">
                    {" "}Projects{" "}
                  </a>
                  {" "}
                  <a href="#career" className="block hover:text-white">
                    {" "}Career{" "}
                  </a>
                </div>
              </div>
              <div>
                <h3 className="text-white font-black">
                  Contact
                </h3>
                <div className="mt-5 space-y-3 text-sm">
                  <p>
                    📞 +91 99999 99999
                  </p>
                  <p>
                    ✉️ info@pnsacademy.com
                  </p>
                  <p>
                    📍 Bihar, India
                  </p>
                </div>
              </div>
            </div>
            <div className="border-t border-white/10 mt-10 pt-6 text-center text-xs">
              © 2026 Career Optics Computer Centre. All Rights Reserved.
            </div>
          </div>
        </footer>
        <a href="https://wa.me/919999999999" target="_blank" className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-green-500 text-white flex items-center justify-center text-2xl shadow-2xl hover:scale-110 transition">
          ☎
        </a>
        <script dangerouslySetInnerHTML={{ __html: js_ceee1808 }} />
        ```
      </body>
    </html>
  );
}
