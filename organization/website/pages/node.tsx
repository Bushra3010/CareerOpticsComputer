import css_d628648e from "../styles/d628648e.css?raw";
import js_1c9099d9 from "../behaviour/1c9099d9.js?raw";
import js_5a66417a from "../behaviour/5a66417a.js?raw";

/** node.html */
export default function Node() {
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
          Node.js & Next.js Development Course | Career Optics Computer Centre
        </title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script dangerouslySetInnerHTML={{ __html: js_5a66417a }} />
        <style dangerouslySetInnerHTML={{ __html: css_d628648e }} />
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
                <a href="#overview" className="hover:text-indigo-600 transition">
                  {" "}Overview{" "}
                </a>
                {" "}
                <a href="#syllabus" className="hover:text-indigo-600 transition">
                  {" "}Syllabus{" "}
                </a>
                {" "}
                <a href="#projects" className="hover:text-indigo-600 transition">
                  {" "}Projects{" "}
                </a>
                {" "}
                <a href="#career" className="hover:text-indigo-600 transition">
                  {" "}Career{" "}
                </a>
                {" "}
                <a href="#admission" className="hover:text-indigo-600 transition">
                  {" "}Admission{" "}
                </a>
                {" "}
                <a href="#faq" className="hover:text-indigo-600 transition">
                  {" "}FAQ{" "}
                </a>
                {" "}
                <a href="#admission" className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-lg">
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
            <div className="min-h-[600px] lg:min-h-[650px] grid lg:grid-cols-[1.25fr_.75fr] gap-10 lg:gap-16 items-center py-14 lg:py-20">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-xs sm:text-sm font-bold mb-6">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Professional Web Development Program
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight leading-[1.05]">
                  Node.js &{" "}
                  <span className="text-violet-300">
                    {" "}Next.js{" "}
                  </span>
                  {" "}Development
                </h1>
                <p className="mt-6 max-w-3xl text-base sm:text-lg text-slate-200 leading-8">
                  Become a professional modern web developer by learning Node.js, Express.js, MongoDB, REST API, Authentication, Next.js, Server-Side Rendering, API Routes, Database Integration and real-world full-stack application development.
                </p>
                <div className="flex flex-wrap gap-2 mt-7">
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
                    {" "}REST API{" "}
                  </span>
                  <span className="glass px-4 py-2 rounded-full text-xs font-bold">
                    {" "}Next.js{" "}
                  </span>
                  <span className="glass px-4 py-2 rounded-full text-xs font-bold">
                    {" "}Git & GitHub{" "}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 mt-9">
                  <a href="#admission" className="inline-flex justify-center items-center px-7 py-4 rounded-2xl bg-white text-indigo-700 font-black hover:bg-slate-100 transition shadow-xl">
                    Apply for Admission →
                  </a>
                  <a href="#syllabus" className="inline-flex justify-center items-center px-7 py-4 rounded-2xl glass font-black hover:bg-white/20 transition">
                    View Complete Syllabus
                  </a>
                </div>
              </div>
              <div className="glass rounded-[2rem] p-6 sm:p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-7">
                  <div>
                    <p className="text-xs text-slate-300">
                      Course Fee
                    </p>
                    <div className="flex items-end gap-3">
                      <span className="text-4xl font-black">
                        {" "}₹20,000{" "}
                      </span>
                      <del className="text-slate-400">
                        {" "}₹35,000{" "}
                      </del>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-300 text-xs font-black">
                    {" "}SPECIAL OFFER{" "}
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
                      12+
                    </div>
                    <div className="text-xs text-slate-300 mt-1">
                      Live Projects
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <div className="text-2xl font-black">
                      Online
                    </div>
                    <div className="text-xs text-slate-300 mt-1">
                      Learning
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
                    Career Focus
                  </div>
                  <div className="font-black mt-1">
                    Full Stack • Backend • Next.js
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
                {" "}Course Overview{" "}
              </span>
              <h2 className="text-3xl sm:text-5xl font-black mt-3">
                Build Modern Web Applications
              </h2>
              <p className="mt-5 text-slate-600 leading-8">
                This professional program takes you from JavaScript fundamentals to backend development and modern Next.js application development.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white rounded-3xl p-7 shadow-soft border border-slate-100">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl font-black">
                  JS
                </div>
                <h3 className="font-black text-xl mt-6">
                  Node.js Development
                </h3>
                <p className="text-slate-600 text-sm leading-7 mt-3">
                  JavaScript runtime, modules, npm, asynchronous programming, filesystem, events and backend development.
                </p>
              </div>
              <div className="bg-white rounded-3xl p-7 shadow-soft border border-slate-100">
                <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl font-black">
                  API
                </div>
                <h3 className="font-black text-xl mt-6">
                  Express & REST API
                </h3>
                <p className="text-slate-600 text-sm leading-7 mt-3">
                  Build scalable APIs with Express.js, middleware, validation, authentication, CRUD and database integration.
                </p>
              </div>
              <div className="bg-white rounded-3xl p-7 shadow-soft border border-slate-100">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-black">
                  N
                </div>
                <h3 className="font-black text-xl mt-6">
                  Next.js Development
                </h3>
                <p className="text-slate-600 text-sm leading-7 mt-3">
                  Learn modern Next.js architecture, routing, server components, rendering, API routes and production deployment.
                </p>
              </div>
            </div>
            <div className="mt-16">
              <h3 className="text-2xl font-black">
                What You Will Learn
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-7">
                <div className="bg-white border rounded-2xl p-5 font-bold">
                  ✓ JavaScript & ES6+
                </div>
                <div className="bg-white border rounded-2xl p-5 font-bold">
                  ✓ Node.js Fundamentals
                </div>
                <div className="bg-white border rounded-2xl p-5 font-bold">
                  ✓ Express.js
                </div>
                <div className="bg-white border rounded-2xl p-5 font-bold">
                  ✓ REST API
                </div>
                <div className="bg-white border rounded-2xl p-5 font-bold">
                  ✓ MongoDB
                </div>
                <div className="bg-white border rounded-2xl p-5 font-bold">
                  ✓ Authentication
                </div>
                <div className="bg-white border rounded-2xl p-5 font-bold">
                  ✓ Next.js
                </div>
                <div className="bg-white border rounded-2xl p-5 font-bold">
                  ✓ Deployment
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
                Tools & Technologies Covered
              </h2>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-10">
              <span className="px-5 py-3 rounded-xl bg-white/10 border border-white/10 font-bold">
                {" "}JavaScript{" "}
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
                {" "}Next.js{" "}
              </span>
              <span className="px-5 py-3 rounded-xl bg-white/10 border border-white/10 font-bold">
                {" "}React{" "}
              </span>
              <span className="px-5 py-3 rounded-xl bg-white/10 border border-white/10 font-bold">
                {" "}REST API{" "}
              </span>
              <span className="px-5 py-3 rounded-xl bg-white/10 border border-white/10 font-bold">
                {" "}Postman{" "}
              </span>
              <span className="px-5 py-3 rounded-xl bg-white/10 border border-white/10 font-bold">
                {" "}VS Code{" "}
              </span>
              <span className="px-5 py-3 rounded-xl bg-white/10 border border-white/10 font-bold">
                {" "}Git{" "}
              </span>
              <span className="px-5 py-3 rounded-xl bg-white/10 border border-white/10 font-bold">
                {" "}GitHub{" "}
              </span>
              <span className="px-5 py-3 rounded-xl bg-white/10 border border-white/10 font-bold">
                {" "}Vercel{" "}
              </span>
              <span className="px-5 py-3 rounded-xl bg-white/10 border border-white/10 font-bold">
                {" "}Render{" "}
              </span>
            </div>
          </div>
        </section>
        <section id="syllabus" className="py-20">
          <div className="max-w-6xl mx-auto px-5 sm:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-indigo-600 font-black text-sm uppercase tracking-widest">
                {" "}Complete Syllabus{" "}
              </span>
              <h2 className="text-3xl sm:text-5xl font-black mt-3">
                Node.js & Next.js Course Syllabus
              </h2>
              <p className="text-slate-600 mt-5 leading-7">
                Click any module to view detailed topics.
              </p>
            </div>
            <div className="mt-12 space-y-4">
              <div className="rounded-3xl overflow-hidden border border-slate-200">
                <div className="px-6 py-4 bg-slate-900 text-white font-black">
                  PART A — JAVASCRIPT & NODE.JS FOUNDATION
                </div>
                <div className="accordion-item bg-white border-b">
                  <button className="accordion-btn w-full px-6 py-5 flex items-center justify-between text-left">
                    <span className="font-black">
                      {" "}01. JavaScript Fundamentals{" "}
                    </span>
                    <span className="plus-icon text-2xl">
                      {" "}+{" "}
                    </span>
                  </button>
                  <div className="accordion-content">
                    <div className="px-6 pb-6 text-sm text-slate-600 leading-8">
                      Variables & Data Types • Operators • Conditions • Loops • Functions • Scope • Arrays • Objects • Strings • ES6 Introduction • Arrow Functions • Template Literals • Destructuring.
                    </div>
                  </div>
                </div>
                <div className="accordion-item bg-white border-b">
                  <button className="accordion-btn w-full px-6 py-5 flex justify-between text-left">
                    <span className="font-black">
                      {" "}02. Modern JavaScript & ES6+{" "}
                    </span>
                    <span className="plus-icon text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content">
                    <div className="px-6 pb-6 text-sm text-slate-600 leading-8">
                      Let & Const • Spread & Rest Operators • Map • Filter • Reduce • Modules • Promises • Async/Await • Error Handling • Callback Functions.
                    </div>
                  </div>
                </div>
                <div className="accordion-item bg-white border-b">
                  <button className="accordion-btn w-full px-6 py-5 flex justify-between text-left">
                    <span className="font-black">
                      {" "}03. Node.js Introduction{" "}
                    </span>
                    <span className="plus-icon text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content">
                    <div className="px-6 pb-6 text-sm text-slate-600 leading-8">
                      Node.js Architecture • Runtime Environment • V8 Engine • Node Installation • REPL • Node CLI • npm • package.json • Dependencies • Development Workflow.
                    </div>
                  </div>
                </div>
                <div className="accordion-item bg-white border-b">
                  <button className="accordion-btn w-full px-6 py-5 flex justify-between text-left">
                    <span className="font-black">
                      {" "}04. Node.js Core Modules{" "}
                    </span>
                    <span className="plus-icon text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content">
                    <div className="px-6 pb-6 text-sm text-slate-600 leading-8">
                      File System • Path • OS • Events • HTTP • URL • Crypto • Streams • Buffers • Environment Variables.
                    </div>
                  </div>
                </div>
                <div className="accordion-item bg-white border-b">
                  <button className="accordion-btn w-full px-6 py-5 flex justify-between text-left">
                    <span className="font-black">
                      {" "}05. Asynchronous Programming{" "}
                    </span>
                    <span className="plus-icon text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content">
                    <div className="px-6 pb-6 text-sm text-slate-600 leading-8">
                      Callbacks • Promises • Async/Await • Event Loop • Non-Blocking I/O • Error Handling • Parallel Operations.
                    </div>
                  </div>
                </div>
                <div className="accordion-item bg-white">
                  <button className="accordion-btn w-full px-6 py-5 flex justify-between text-left">
                    <span className="font-black">
                      {" "}06. Node Package Management{" "}
                    </span>
                    <span className="plus-icon text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content">
                    <div className="px-6 pb-6 text-sm text-slate-600 leading-8">
                      npm Commands • Package Installation • Scripts • Semantic Versioning • Global Packages • nodemon • Environment Setup.
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-3xl overflow-hidden border border-slate-200 mt-8">
                <div className="px-6 py-4 bg-indigo-600 text-white font-black">
                  PART B — EXPRESS.JS & BACKEND DEVELOPMENT
                </div>
                <div className="accordion-item bg-white border-b">
                  <button className="accordion-btn w-full px-6 py-5 flex justify-between text-left">
                    <span className="font-black">
                      {" "}07. Express.js Fundamentals{" "}
                    </span>
                    <span className="plus-icon text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content">
                    <div className="px-6 pb-6 text-sm text-slate-600 leading-8">
                      Express Installation • Server Creation • Routes • Request • Response • Middleware • Static Files • Error Handling.
                    </div>
                  </div>
                </div>
                <div className="accordion-item bg-white border-b">
                  <button className="accordion-btn w-full px-6 py-5 flex justify-between text-left">
                    <span className="font-black">
                      {" "}08. REST API Development{" "}
                    </span>
                    <span className="plus-icon text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content">
                    <div className="px-6 pb-6 text-sm text-slate-600 leading-8">
                      REST Architecture • HTTP Methods • GET • POST • PUT • PATCH • DELETE • Status Codes • JSON Response • API Testing.
                    </div>
                  </div>
                </div>
                <div className="accordion-item bg-white border-b">
                  <button className="accordion-btn w-full px-6 py-5 flex justify-between text-left">
                    <span className="font-black">
                      {" "}09. MongoDB Database{" "}
                    </span>
                    <span className="plus-icon text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content">
                    <div className="px-6 pb-6 text-sm text-slate-600 leading-8">
                      MongoDB Concepts • Collections • Documents • CRUD • MongoDB Atlas • Queries • Indexes • Database Design.
                    </div>
                  </div>
                </div>
                <div className="accordion-item bg-white border-b">
                  <button className="accordion-btn w-full px-6 py-5 flex justify-between text-left">
                    <span className="font-black">
                      {" "}10. Mongoose{" "}
                    </span>
                    <span className="plus-icon text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content">
                    <div className="px-6 pb-6 text-sm text-slate-600 leading-8">
                      Schema • Models • Validation • CRUD • Query Methods • Population • Relationships • Middleware.
                    </div>
                  </div>
                </div>
                <div className="accordion-item bg-white border-b">
                  <button className="accordion-btn w-full px-6 py-5 flex justify-between text-left">
                    <span className="font-black">
                      {" "}11. Authentication & Authorization{" "}
                    </span>
                    <span className="plus-icon text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content">
                    <div className="px-6 pb-6 text-sm text-slate-600 leading-8">
                      Registration • Login • Password Hashing • JWT • Cookies • Sessions • Protected Routes • Role Based Access • Admin Authentication.
                    </div>
                  </div>
                </div>
                <div className="accordion-item bg-white">
                  <button className="accordion-btn w-full px-6 py-5 flex justify-between text-left">
                    <span className="font-black">
                      {" "}12. API Security{" "}
                    </span>
                    <span className="plus-icon text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content">
                    <div className="px-6 pb-6 text-sm text-slate-600 leading-8">
                      CORS • Helmet • Input Validation • Rate Limiting • Secure Passwords • Environment Variables • API Security Practices.
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-3xl overflow-hidden border border-slate-200 mt-8">
                <div className="px-6 py-4 bg-purple-600 text-white font-black">
                  PART C — NEXT.JS DEVELOPMENT
                </div>
                <div className="accordion-item bg-white border-b">
                  <button className="accordion-btn w-full px-6 py-5 flex justify-between text-left">
                    <span className="font-black">
                      {" "}13. Next.js Introduction{" "}
                    </span>
                    <span className="plus-icon text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content">
                    <div className="px-6 pb-6 text-sm text-slate-600 leading-8">
                      Next.js Overview • React & Next.js • Project Setup • App Router • Folder Structure • Development Server.
                    </div>
                  </div>
                </div>
                <div className="accordion-item bg-white border-b">
                  <button className="accordion-btn w-full px-6 py-5 flex justify-between text-left">
                    <span className="font-black">
                      {" "}14. Next.js Routing{" "}
                    </span>
                    <span className="plus-icon text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content">
                    <div className="px-6 pb-6 text-sm text-slate-600 leading-8">
                      App Router • Dynamic Routes • Nested Routes • Route Groups • Navigation • Link Component • Loading UI • Error Pages.
                    </div>
                  </div>
                </div>
                <div className="accordion-item bg-white border-b">
                  <button className="accordion-btn w-full px-6 py-5 flex justify-between text-left">
                    <span className="font-black">
                      {" "}15. Server & Client Components{" "}
                    </span>
                    <span className="plus-icon text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content">
                    <div className="px-6 pb-6 text-sm text-slate-600 leading-8">
                      Server Components • Client Components • Rendering Concepts • Component Architecture • Data Fetching.
                    </div>
                  </div>
                </div>
                <div className="accordion-item bg-white border-b">
                  <button className="accordion-btn w-full px-6 py-5 flex justify-between text-left">
                    <span className="font-black">
                      {" "}16. Next.js Data Fetching{" "}
                    </span>
                    <span className="plus-icon text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content">
                    <div className="px-6 pb-6 text-sm text-slate-600 leading-8">
                      Fetch API • Server Data Fetching • Caching Concepts • Revalidation • API Integration • Loading States.
                    </div>
                  </div>
                </div>
                <div className="accordion-item bg-white border-b">
                  <button className="accordion-btn w-full px-6 py-5 flex justify-between text-left">
                    <span className="font-black">
                      {" "}17. Next.js API Routes{" "}
                    </span>
                    <span className="plus-icon text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content">
                    <div className="px-6 pb-6 text-sm text-slate-600 leading-8">
                      Route Handlers • GET • POST • PUT • DELETE • API Responses • Database Integration • Backend Services.
                    </div>
                  </div>
                </div>
                <div className="accordion-item bg-white">
                  <button className="accordion-btn w-full px-6 py-5 flex justify-between text-left">
                    <span className="font-black">
                      {" "}18. Next.js Forms & Authentication{" "}
                    </span>
                    <span className="plus-icon text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content">
                    <div className="px-6 pb-6 text-sm text-slate-600 leading-8">
                      Forms • Validation • Authentication Flow • Protected Pages • Cookies • Sessions • User Dashboard.
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-3xl overflow-hidden border border-slate-200 mt-8">
                <div className="px-6 py-4 bg-emerald-600 text-white font-black">
                  PART D — ADVANCED DEVELOPMENT & LIVE PROJECTS
                </div>
                <div className="accordion-item bg-white border-b">
                  <button className="accordion-btn w-full px-6 py-5 flex justify-between text-left">
                    <span className="font-black">
                      {" "}19. Full Stack Integration{" "}
                    </span>
                    <span className="plus-icon text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content">
                    <div className="px-6 pb-6 text-sm text-slate-600 leading-8">
                      Next.js Frontend • Node.js Backend • Express API • MongoDB • Authentication • CRUD • API Integration.
                    </div>
                  </div>
                </div>
                <div className="accordion-item bg-white border-b">
                  <button className="accordion-btn w-full px-6 py-5 flex justify-between text-left">
                    <span className="font-black">
                      {" "}20. Git & GitHub{" "}
                    </span>
                    <span className="plus-icon text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content">
                    <div className="px-6 pb-6 text-sm text-slate-600 leading-8">
                      Git Installation • Repository • Commit • Branch • Merge • Pull • Push • GitHub Repository • Collaboration • Version Control.
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
                      Debugging • Console • Network Tab • API Testing with Postman • Error Handling • Performance Optimization.
                    </div>
                  </div>
                </div>
                <div className="accordion-item bg-white border-b">
                  <button className="accordion-btn w-full px-6 py-5 flex justify-between text-left">
                    <span className="font-black">
                      {" "}22. Deployment{" "}
                    </span>
                    <span className="plus-icon text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content">
                    <div className="px-6 pb-6 text-sm text-slate-600 leading-8">
                      Production Build • Environment Variables • Vercel • Render • Cloud Deployment • Domain Setup • Deployment Troubleshooting.
                    </div>
                  </div>
                </div>
                <div className="accordion-item bg-white border-b">
                  <button className="accordion-btn w-full px-6 py-5 flex justify-between text-left">
                    <span className="font-black">
                      {" "}23. Professional Full Stack Project{" "}
                    </span>
                    <span className="plus-icon text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content">
                    <div className="px-6 pb-6 text-sm text-slate-600 leading-8">
                      Requirement Analysis • UI Structure • Database Design • Backend API • Authentication • Admin Panel • Frontend Integration • Testing.
                    </div>
                  </div>
                </div>
                <div className="accordion-item bg-white">
                  <button className="accordion-btn w-full px-6 py-5 flex justify-between text-left">
                    <span className="font-black">
                      {" "}24. Final Node.js & Next.js Project{" "}
                    </span>
                    <span className="plus-icon text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content">
                    <div className="px-6 pb-6 text-sm text-slate-600 leading-8">
                      Complete production-style application with Next.js frontend, Node.js/Express backend, MongoDB database, authentication, admin panel, REST API and live deployment.
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
                {" "}Practical Training{" "}
              </span>
              <h2 className="text-3xl sm:text-5xl font-black mt-3">
                Live Projects
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
              <div className="bg-white rounded-3xl p-6 shadow-soft">
                <div className="text-3xl">
                  🛒
                </div>
                <h3 className="font-black mt-5">
                  E-Commerce API
                </h3>
                <p className="text-sm text-slate-600 mt-2">
                  Product, user, cart and order management backend.
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
                  Student, course, admission and dashboard system.
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
                  Authentication, users, reports and management modules.
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
                  Next.js based dynamic news and content platform.
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
                  Job listings, applications, users and admin panel.
                </p>
              </div>
              <div className="bg-white rounded-3xl p-6 shadow-soft">
                <div className="text-3xl">
                  📞
                </div>
                <h3 className="font-black mt-5">
                  CRM System
                </h3>
                <p className="text-sm text-slate-600 mt-2">
                  Leads, enquiries, follow-ups and customer management.
                </p>
              </div>
              <div className="bg-white rounded-3xl p-6 shadow-soft">
                <div className="text-3xl">
                  📝
                </div>
                <h3 className="font-black mt-5">
                  Blog Platform
                </h3>
                <p className="text-sm text-slate-600 mt-2">
                  Posts, categories, users, comments and API integration.
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
                  Complete production-ready Node.js + Next.js project.
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
                  {" "}Career Opportunities{" "}
                </span>
                <h2 className="text-3xl sm:text-5xl font-black mt-3">
                  Start Your Web Development Career
                </h2>
                <p className="text-slate-600 mt-5 leading-8">
                  After completing the program, students can work on backend, full-stack and modern Next.js projects.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="border rounded-2xl p-5 font-bold">
                  Node.js Developer
                </div>
                <div className="border rounded-2xl p-5 font-bold">
                  Backend Developer
                </div>
                <div className="border rounded-2xl p-5 font-bold">
                  Next.js Developer
                </div>
                <div className="border rounded-2xl p-5 font-bold">
                  Full Stack Developer
                </div>
                <div className="border rounded-2xl p-5 font-bold">
                  JavaScript Developer
                </div>
                <div className="border rounded-2xl p-5 font-bold">
                  API Developer
                </div>
                <div className="border rounded-2xl p-5 font-bold">
                  Web Application Developer
                </div>
                <div className="border rounded-2xl p-5 font-bold">
                  Freelance Developer
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="py-20 bg-slate-900 text-white">
          <div className="max-w-5xl mx-auto px-5 text-center">
            <span className="text-indigo-300 font-black text-sm uppercase tracking-widest">
              {" "}Course Investment{" "}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black mt-3">
              Professional Node.js & Next.js Program
            </h2>
            <div className="max-w-md mx-auto mt-10 rounded-[2rem] bg-white text-slate-900 p-8 shadow-2xl">
              <div className="text-sm text-slate-500">
                Complete Course Fee
              </div>
              <div className="text-5xl font-black mt-2">
                ₹20,000
              </div>
              <del className="text-slate-400">
                {" "}₹35,000{" "}
              </del>
              <div className="mt-6 grid gap-3 text-left text-sm">
                <div className="p-3 bg-slate-50 rounded-xl">
                  ✓ 6 Months Training
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  ✓ Complete Node.js + Next.js Syllabus
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  ✓ Live Projects
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  ✓ Project Guidance
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  ✓ Course Certificate
                </div>
              </div>
              <a href="#admission" className="block mt-7 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-xl transition">
                {" "}Apply Now{" "}
              </a>
            </div>
          </div>
        </section>
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white border rounded-3xl p-8 shadow-soft">
                <h3 className="text-2xl font-black">
                  Eligibility
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
                    ✓ Working Professionals
                  </li>
                  <li>
                    ✓ Beginners Interested in Web Development
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
                    ✓ Basic English Reading Ability
                  </li>
                  <li>
                    ✓ Regular Coding Practice
                  </li>
                  <li>
                    ✓ No Prior Node.js Experience Required
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
                  {" "}Admission{" "}
                </span>
                <h2 className="text-3xl sm:text-5xl font-black mt-3">
                  Start Learning Node.js & Next.js
                </h2>
                <p className="text-slate-600 leading-8 mt-5">
                  Fill the admission form and our counsellor will contact you for course details, batch timing and fees.
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
              <form id="admissionForm" className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-soft border border-slate-100">
                <h3 className="text-2xl font-black">
                  Admission Enquiry
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
                Course Completion Certificate
              </h2>
              <p className="max-w-2xl mx-auto mt-4 text-indigo-100 leading-7">
                Successfully complete the training and projects to receive a professional course completion certificate from Career Optics Computer Centre.
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
                  Is this course suitable for beginners?
                  <span className="faq-icon text-xl">
                    +
                  </span>
                </button>
                <div className="faq-content hidden px-6 pb-6 text-sm text-slate-600 leading-7">
                  Yes. The program starts with JavaScript and gradually moves toward Node.js, Express.js, MongoDB and Next.js.
                </div>
              </div>
              <div className="faq-item bg-white border rounded-2xl overflow-hidden">
                <button className="faq-btn w-full px-6 py-5 text-left flex justify-between font-black">
                  Will I learn both Node.js and Next.js?
                  <span className="faq-icon text-xl">
                    +
                  </span>
                </button>
                <div className="faq-content hidden px-6 pb-6 text-sm text-slate-600 leading-7">
                  Yes. The course covers Node.js backend development along with modern Next.js application development.
                </div>
              </div>
              <div className="faq-item bg-white border rounded-2xl overflow-hidden">
                <button className="faq-btn w-full px-6 py-5 text-left flex justify-between font-black">
                  Will there be live projects?
                  <span className="faq-icon text-xl">
                    +
                  </span>
                </button>
                <div className="faq-content hidden px-6 pb-6 text-sm text-slate-600 leading-7">
                  Yes. Students work on multiple practical projects including APIs, dashboards, management systems and full-stack applications.
                </div>
              </div>
              <div className="faq-item bg-white border rounded-2xl overflow-hidden">
                <button className="faq-btn w-full px-6 py-5 text-left flex justify-between font-black">
                  Is MongoDB included?
                  <span className="faq-icon text-xl">
                    +
                  </span>
                </button>
                <div className="faq-content hidden px-6 pb-6 text-sm text-slate-600 leading-7">
                  Yes. MongoDB and Mongoose are included for database design and application development.
                </div>
              </div>
              <div className="faq-item bg-white border rounded-2xl overflow-hidden">
                <button className="faq-btn w-full px-6 py-5 text-left flex justify-between font-black">
                  Will I receive a certificate?
                  <span className="faq-icon text-xl">
                    +
                  </span>
                </button>
                <div className="faq-content hidden px-6 pb-6 text-sm text-slate-600 leading-7">
                  Yes. Eligible students receive a Career Optics Computer Centre course completion certificate.
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
          <div className="max-w-5xl mx-auto px-5 text-center">
            <h2 className="text-3xl sm:text-5xl font-black">
              Ready to Become a Full Stack Developer?
            </h2>
            <p className="mt-5 text-indigo-100 leading-7">
              Learn Node.js + Express.js + MongoDB + Next.js and build professional real-world applications.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              <a href="#admission" className="px-8 py-4 rounded-xl bg-white text-indigo-700 font-black hover:bg-slate-100 transition">
                {" "}Apply Now{" "}
              </a>
              <a href="#syllabus" className="px-8 py-4 rounded-xl border border-white/30 font-black hover:bg-white/10 transition">
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
                  Professional computer education and career focused skill development programs.
                </p>
              </div>
              <div>
                <h3 className="text-white font-black">
                  Node.js & Next.js
                </h3>
                <div className="mt-5 space-y-3 text-sm">
                  <a href="#overview" className="block hover:text-white">
                    {" "}Course Overview{" "}
                  </a>
                  {" "}
                  <a href="#syllabus" className="block hover:text-white">
                    {" "}Complete Syllabus{" "}
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
        <script dangerouslySetInnerHTML={{ __html: js_1c9099d9 }} />
      </body>
    </html>
  );
}
