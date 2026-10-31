import css_f67bdff4 from "../styles/f67bdff4.css?raw";
import js_09b574f6 from "../behaviour/09b574f6.js?raw";
import js_1dbe419b from "../behaviour/1dbe419b.js?raw";
import js_3e22f58a from "../behaviour/3e22f58a.js?raw";
import js_4821689a from "../behaviour/4821689a.js?raw";
import js_af0fd125 from "../behaviour/af0fd125.js?raw";
import js_b53e1a1c from "../behaviour/b53e1a1c.js?raw";

/** kyp.html */
export default function Kyp() {
  return (
    <html lang="en">
      <head>
        <script src="/cms-config.js"></script>
        <script src="/cms.js" defer></script>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>
          KYP Course Syllabus | Career Optics Computer Academy
        </title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href={"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"} rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />
        <script dangerouslySetInnerHTML={{ __html: js_4821689a }} />
        <style dangerouslySetInnerHTML={{ __html: css_f67bdff4 }} />
      </head>
      <body>
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="h-20 flex items-center justify-between">
              <a href="#" className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-white flex items-center justify-center shadow-lg">
                  <i className="fa-solid fa-graduation-cap text-lg"></i>
                </div>
                <div>
                  <div className="font-extrabold text-xl text-slate-900">
                    PNS{" "}
                    <span className="text-blue-600">
                      Academy
                    </span>
                  </div>
                  <div className="text-[10px] uppercase tracking-[2px] font-semibold text-slate-500">
                    Skill Development
                  </div>
                </div>
              </a>
              <nav className="hidden md:flex items-center gap-7 text-sm font-semibold">
                <a href="#home" className="text-slate-600 hover:text-blue-600">
                  {" "}Home{" "}
                </a>
                {" "}
                <a href="#courses" className="text-slate-600 hover:text-blue-600">
                  {" "}Courses{" "}
                </a>
                {" "}
                <a href="#syllabus" className="text-blue-600">
                  {" "}Syllabus{" "}
                </a>
                {" "}
                <a href="#projects" className="text-slate-600 hover:text-blue-600">
                  {" "}Projects{" "}
                </a>
                {" "}
                <a href="#admission" className="px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition">
                  {" "}Admission{" "}
                </a>
              </nav>
              <button id="menuBtn" className="md:hidden w-10 h-10 rounded-xl bg-slate-100 text-slate-700">
                {" "}
                <i className="fa-solid fa-bars"></i>
                {" "}
              </button>
            </div>
            <div id="mobileNav" className="mobile-menu pb-5">
              <div className="grid gap-2">
                <a href="#home" className="p-3 rounded-xl hover:bg-slate-100">
                  {" "}Home{" "}
                </a>
                <a href="#courses" className="p-3 rounded-xl hover:bg-slate-100">
                  {" "}Courses{" "}
                </a>
                <a href="#syllabus" className="p-3 rounded-xl hover:bg-slate-100">
                  {" "}Syllabus{" "}
                </a>
                <a href="#projects" className="p-3 rounded-xl hover:bg-slate-100">
                  {" "}Projects{" "}
                </a>
                <a href="#admission" className="p-3 rounded-xl bg-blue-600 text-white">
                  {" "}Admission{" "}
                </a>
              </div>
            </div>
          </div>
        </header>
        <section id="home" className="hero-bg text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
            <div className="grid lg:grid-cols-[1.35fr_.65fr] gap-12 items-center">
              <div>
                <span className="badge bg-white/10 border border-white/20">
                  {" "}
                  <i className="fa-solid fa-award text-yellow-300"></i>
                  {" "}KUSHAL YUVA PROGRAM{" "}
                </span>
                <h1 className="hero-title text-5xl md:text-6xl font-extrabold tracking-tight mt-6">
                  KYP Course{" "}
                  <span className="text-cyan-300">
                    {" "}Syllabus{" "}
                  </span>
                </h1>
                <p className="text-lg text-blue-100 max-w-3xl mt-6 leading-8">
                  Complete Kushal Yuva Program syllabus covering Communication Skills, IT Literacy Skills and Soft & Life Skills for workplace readiness.
                </p>
                <div className="flex flex-wrap gap-3 mt-7">
                  <span className="glass rounded-full px-4 py-2 text-sm">
                    {" "}
                    <i className="fa-regular fa-clock mr-2"></i>
                    {" "}240 Hours{" "}
                  </span>
                  <span className="glass rounded-full px-4 py-2 text-sm">
                    {" "}
                    <i className="fa-solid fa-book-open mr-2"></i>
                    {" "}3 Courses{" "}
                  </span>
                  <span className="glass rounded-full px-4 py-2 text-sm">
                    {" "}
                    <i className="fa-solid fa-laptop mr-2"></i>
                    {" "}Practical Training{" "}
                  </span>
                  <span className="glass rounded-full px-4 py-2 text-sm">
                    {" "}
                    <i className="fa-solid fa-certificate mr-2"></i>
                    {" "}Certification{" "}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 mt-8">
                  <a href="#syllabus" className="px-6 py-3.5 rounded-xl bg-white text-blue-700 font-bold hover:bg-blue-50 transition">
                    {" "}
                    <i className="fa-solid fa-list-check mr-2"></i>
                    {" "}View Full Syllabus{" "}
                  </a>
                  <a href="#admission" className="px-6 py-3.5 rounded-xl border border-white/30 bg-white/10 font-bold hover:bg-white/20 transition">
                    {" "}Apply Now{" "}
                  </a>
                </div>
              </div>
              <div className="glass rounded-3xl p-7 shadow-2xl">
                <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center text-2xl mb-5">
                  <i className="fa-solid fa-layer-group"></i>
                </div>
                <h3 className="text-xl font-bold">
                  KYP Course Structure
                </h3>
                <p className="text-blue-100 text-sm mt-2">
                  Three major skill areas
                </p>
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/10">
                    <span>
                      {" "}Communication Skills{" "}
                    </span>
                    <b>
                      80 Hrs
                    </b>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/10">
                    <span>
                      {" "}IT Literacy Skills{" "}
                    </span>
                    <b>
                      120 Hrs
                    </b>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/10">
                    <span>
                      {" "}Soft & Life Skills{" "}
                    </span>
                    <b>
                      40 Hrs
                    </b>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="courses" className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-blue-600 font-bold text-sm uppercase tracking-widest">
                {" "}KYP Structure{" "}
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold mt-3">
                Three Core Skill Areas
              </h2>
              <p className="text-slate-500 mt-4">
                The KYP curriculum combines language communication, digital literacy and workplace readiness skills.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 mt-10">
              <div className="feature-card">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
                  <i className="fa-solid fa-comments"></i>
                </div>
                <h3 className="font-bold text-xl mt-5">
                  English & Hindi Communication
                </h3>
                <div className="text-blue-600 font-bold text-sm mt-2">
                  80 Hours
                </div>
                <p className="text-slate-500 text-sm leading-6 mt-4">
                  Speaking, listening, understanding, reading, writing, grammar, vocabulary, pronunciation, workplace communication and interview skills.
                </p>
              </div>
              <div className="feature-card">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
                  <i className="fa-solid fa-computer"></i>
                </div>
                <h3 className="font-bold text-xl mt-5">
                  IT Literacy Skills
                </h3>
                <div className="text-emerald-600 font-bold text-sm mt-2">
                  120 Hours
                </div>
                <p className="text-slate-500 text-sm leading-6 mt-4">
                  Computer basics, Windows, Internet, Word, Excel, PowerPoint, Access, Outlook, Google Apps and OpenOffice.
                </p>
              </div>
              <div className="feature-card">
                <div className="w-14 h-14 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center text-xl">
                  <i className="fa-solid fa-people-arrows"></i>
                </div>
                <h3 className="font-bold text-xl mt-5">
                  Soft & Life Skills
                </h3>
                <div className="text-violet-600 font-bold text-sm mt-2">
                  40 Hours
                </div>
                <p className="text-slate-500 text-sm leading-6 mt-4">
                  Self-management, interpersonal skills, presentation, time management, decision-making, ethics, conflict management and customer service.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="syllabus" className="py-16 bg-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-blue-600 font-bold text-sm uppercase tracking-widest">
                {" "}Detailed Curriculum{" "}
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold mt-3">
                Complete KYP Syllabus
              </h2>
              <p className="text-slate-500 mt-4">
                Select a module from the left side. Detailed syllabus will open on the right.
              </p>
            </div>
            <div className="grid lg:grid-cols-[310px_1fr] gap-6 mt-10">
              <aside className="app-menu">
                <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-soft">
                  <div className="px-2 pb-4">
                    <div className="text-xs uppercase tracking-widest font-bold text-slate-400">
                      Course Modules
                    </div>
                    <div className="font-bold mt-1">
                      Select Module
                    </div>
                  </div>
                  <div className="module-list space-y-2">
                    <button className="module-btn active" data-module="module1">
                      {" "}
                      <span className="module-number">
                        01
                      </span>
                      {" "}
                      <span>
                        {" "}
                        <strong className="block text-sm">
                          {" "}Communication Skills{" "}
                        </strong>
                        {" "}
                        <small className="opacity-70">
                          {" "}80 Hours{" "}
                        </small>
                        {" "}
                      </span>
                      {" "}
                    </button>
                    {" "}
                    <button className="module-btn" data-module="module2">
                      {" "}
                      <span className="module-number">
                        02
                      </span>
                      {" "}
                      <span>
                        {" "}
                        <strong className="block text-sm">
                          {" "}Computer Basics{" "}
                        </strong>
                        {" "}
                        <small className="opacity-70">
                          {" "}IT Literacy{" "}
                        </small>
                        {" "}
                      </span>
                      {" "}
                    </button>
                    {" "}
                    <button className="module-btn" data-module="module3">
                      {" "}
                      <span className="module-number">
                        03
                      </span>
                      {" "}
                      <span>
                        {" "}
                        <strong className="block text-sm">
                          {" "}Windows 10{" "}
                        </strong>
                        {" "}
                        <small className="opacity-70">
                          {" "}Operating System{" "}
                        </small>
                        {" "}
                      </span>
                      {" "}
                    </button>
                    {" "}
                    <button className="module-btn" data-module="module4">
                      {" "}
                      <span className="module-number">
                        04
                      </span>
                      {" "}
                      <span>
                        {" "}
                        <strong className="block text-sm">
                          {" "}Daily Life Skills{" "}
                        </strong>
                        {" "}
                        <small className="opacity-70">
                          {" "}21st Century{" "}
                        </small>
                        {" "}
                      </span>
                      {" "}
                    </button>
                    {" "}
                    <button className="module-btn" data-module="module5">
                      {" "}
                      <span className="module-number">
                        05
                      </span>
                      {" "}
                      <span>
                        {" "}
                        <strong className="block text-sm">
                          {" "}Citizenship Skills{" "}
                        </strong>
                        {" "}
                        <small className="opacity-70">
                          {" "}Digital Citizen{" "}
                        </small>
                        {" "}
                      </span>
                      {" "}
                    </button>
                    {" "}
                    <button className="module-btn" data-module="module6">
                      {" "}
                      <span className="module-number">
                        06
                      </span>
                      {" "}
                      <span>
                        {" "}
                        <strong className="block text-sm">
                          {" "}Study Skills{" "}
                        </strong>
                        {" "}
                        <small className="opacity-70">
                          {" "}Digital Learning{" "}
                        </small>
                        {" "}
                      </span>
                      {" "}
                    </button>
                    {" "}
                    <button className="module-btn" data-module="module7">
                      {" "}
                      <span className="module-number">
                        07
                      </span>
                      {" "}
                      <span>
                        {" "}
                        <strong className="block text-sm">
                          {" "}MS Word / Docs{" "}
                        </strong>
                        {" "}
                        <small className="opacity-70">
                          {" "}Word Processing{" "}
                        </small>
                        {" "}
                      </span>
                      {" "}
                    </button>
                    {" "}
                    <button className="module-btn" data-module="module8">
                      {" "}
                      <span className="module-number">
                        08
                      </span>
                      {" "}
                      <span>
                        {" "}
                        <strong className="block text-sm">
                          {" "}MS Excel / Sheets{" "}
                        </strong>
                        {" "}
                        <small className="opacity-70">
                          {" "}Spreadsheet{" "}
                        </small>
                        {" "}
                      </span>
                      {" "}
                    </button>
                    {" "}
                    <button className="module-btn" data-module="module9">
                      {" "}
                      <span className="module-number">
                        09
                      </span>
                      {" "}
                      <span>
                        {" "}
                        <strong className="block text-sm">
                          {" "}PowerPoint / Slides{" "}
                        </strong>
                        {" "}
                        <small className="opacity-70">
                          {" "}Presentation{" "}
                        </small>
                        {" "}
                      </span>
                      {" "}
                    </button>
                    {" "}
                    <button className="module-btn" data-module="module10">
                      {" "}
                      <span className="module-number">
                        10
                      </span>
                      {" "}
                      <span>
                        {" "}
                        <strong className="block text-sm">
                          {" "}Access / Database{" "}
                        </strong>
                        {" "}
                        <small className="opacity-70">
                          {" "}DBMS{" "}
                        </small>
                        {" "}
                      </span>
                      {" "}
                    </button>
                    {" "}
                    <button className="module-btn" data-module="module11">
                      {" "}
                      <span className="module-number">
                        11
                      </span>
                      {" "}
                      <span>
                        {" "}
                        <strong className="block text-sm">
                          {" "}Outlook / Gmail{" "}
                        </strong>
                        {" "}
                        <small className="opacity-70">
                          {" "}Email & PIM{" "}
                        </small>
                        {" "}
                      </span>
                      {" "}
                    </button>
                    {" "}
                    <button className="module-btn" data-module="module12">
                      {" "}
                      <span className="module-number">
                        12
                      </span>
                      {" "}
                      <span>
                        {" "}
                        <strong className="block text-sm">
                          {" "}Soft & Life Skills{" "}
                        </strong>
                        {" "}
                        <small className="opacity-70">
                          {" "}40 Hours{" "}
                        </small>
                        {" "}
                      </span>
                      {" "}
                    </button>
                  </div>
                </div>
              </aside>
              <div className="min-w-0">
                <div id="module1" className="module-content active">
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-soft">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <span className="badge bg-blue-50 text-blue-700">
                          {" "}MODULE 01{" "}
                        </span>
                        <h3 className="text-2xl md:text-3xl font-extrabold mt-3">
                          English & Hindi Communication Skills
                        </h3>
                        <p className="text-slate-500 mt-2">
                          80 Hours • Communication & Language Development
                        </p>
                      </div>
                      <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl">
                        <i className="fa-solid fa-comments"></i>
                      </div>
                    </div>
                    <div className="mt-8">
                      <h4 className="font-bold text-lg mb-4">
                        Core Communication Areas
                      </h4>
                      <div className="grid md:grid-cols-2 gap-3">
                        <div className="topic-item">
                          <span className="topic-icon">
                            {" "}
                            <i className="fa-solid fa-microphone"></i>
                            {" "}
                          </span>
                          {" "}
                          <span>
                            Speaking, Listening, Understanding, Reading and Writing in English and Hindi
                          </span>
                        </div>
                        <div className="topic-item">
                          <span className="topic-icon">
                            {" "}
                            <i className="fa-solid fa-language"></i>
                            {" "}
                          </span>
                          {" "}
                          <span>
                            Vocabulary and Sentence Construction
                          </span>
                        </div>
                        <div className="topic-item">
                          <span className="topic-icon">
                            {" "}
                            <i className="fa-solid fa-book"></i>
                            {" "}
                          </span>
                          {" "}
                          <span>
                            Grammar and Pronunciation
                          </span>
                        </div>
                        <div className="topic-item">
                          <span className="topic-icon">
                            {" "}
                            <i className="fa-solid fa-volume-high"></i>
                            {" "}
                          </span>
                          {" "}
                          <span>
                            Fluency, Emphasis, Pace and Clarity
                          </span>
                        </div>
                        <div className="topic-item">
                          <span className="topic-icon">
                            {" "}
                            <i className="fa-solid fa-wave-square"></i>
                            {" "}
                          </span>
                          {" "}
                          <span>
                            Intonation, Pitch and Voice Modulation
                          </span>
                        </div>
                        <div className="topic-item">
                          <span className="topic-icon">
                            {" "}
                            <i className="fa-solid fa-user-group"></i>
                            {" "}
                          </span>
                          {" "}
                          <span>
                            Non-Verbal Communication
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-8">
                      <h4 className="font-bold text-lg mb-4">
                        20 Communication Modules
                      </h4>
                      <div className="grid md:grid-cols-2 gap-3">
                        <script dangerouslySetInnerHTML={{ __html: js_3e22f58a }} />
                      </div>
                    </div>
                  </div>
                </div>
                <div id="module2" className="module-content">
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-soft">
                    <span className="badge bg-emerald-50 text-emerald-700">
                      {" "}MODULE 02{" "}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-extrabold mt-3">
                      Computer Basics
                    </h3>
                    <p className="text-slate-500 mt-2">
                      Foundation of Information Technology
                    </p>
                    <div className="grid md:grid-cols-2 gap-3 mt-8">
                      <div className="topic-item">
                        <span className="topic-icon">
                          01
                        </span>
                        {" "}
                        <span>
                          Overview of Computers
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          02
                        </span>
                        {" "}
                        <span>
                          Uses of Computer
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          03
                        </span>
                        {" "}
                        <span>
                          Using Mouse Comfortably
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          04
                        </span>
                        {" "}
                        <span>
                          Using Keyboard for Typing
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          05
                        </span>
                        {" "}
                        <span>
                          Understanding Input, Process and Output
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          06
                        </span>
                        {" "}
                        <span>
                          Computer Hardware and Software
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div id="module3" className="module-content">
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-soft">
                    <span className="badge bg-violet-50 text-violet-700">
                      {" "}MODULE 03{" "}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-extrabold mt-3">
                      Operating System — Windows 10
                    </h3>
                    <p className="text-slate-500 mt-2">
                      Operating system, desktop and file management
                    </p>
                    <div className="space-y-7 mt-8">
                      <div>
                        <h4 className="font-bold mb-3">
                          01. Overview of Operating System
                        </h4>
                        <div className="grid md:grid-cols-2 gap-3">
                          <div className="topic-item">
                            <span className="topic-icon">
                              ✓
                            </span>
                            {" "}
                            <span>
                              Understanding Operating System
                            </span>
                          </div>
                          <div className="topic-item">
                            <span className="topic-icon">
                              ✓
                            </span>
                            {" "}
                            <span>
                              Windows Environment
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold mb-3">
                          02. Basic Operations
                        </h4>
                        <div className="grid md:grid-cols-2 gap-3">
                          <div className="topic-item">
                            <span className="topic-icon">
                              ✓
                            </span>
                            {" "}
                            <span>
                              How to Start a Computer
                            </span>
                          </div>
                          <div className="topic-item">
                            <span className="topic-icon">
                              ✓
                            </span>
                            {" "}
                            <span>
                              Logoff and Hibernate Laptop
                            </span>
                          </div>
                          <div className="topic-item">
                            <span className="topic-icon">
                              ✓
                            </span>
                            {" "}
                            <span>
                              Connecting Headset to Computer
                            </span>
                          </div>
                          <div className="topic-item">
                            <span className="topic-icon">
                              ✓
                            </span>
                            {" "}
                            <span>
                              Interacting with Computers
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold mb-3">
                          03. Personalizing Desktop
                        </h4>
                        <div className="grid md:grid-cols-2 gap-3">
                          <div className="topic-item">
                            <span className="topic-icon">
                              ✓
                            </span>
                            {" "}
                            <span>
                              Changing Desktop Background
                            </span>
                          </div>
                          <div className="topic-item">
                            <span className="topic-icon">
                              ✓
                            </span>
                            {" "}
                            <span>
                              Applying Screen Saver
                            </span>
                          </div>
                          <div className="topic-item">
                            <span className="topic-icon">
                              ✓
                            </span>
                            {" "}
                            <span>
                              Applying Themes
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold mb-3">
                          04. File & Folder Management
                        </h4>
                        <div className="grid md:grid-cols-2 gap-3">
                          <div className="topic-item">
                            <span className="topic-icon">
                              ✓
                            </span>
                            {" "}
                            <span>
                              Create and Manage Folders
                            </span>
                          </div>
                          <div className="topic-item">
                            <span className="topic-icon">
                              ✓
                            </span>
                            {" "}
                            <span>
                              Copy, Move and Delete Files
                            </span>
                          </div>
                          <div className="topic-item">
                            <span className="topic-icon">
                              ✓
                            </span>
                            {" "}
                            <span>
                              Rename and Organize Files
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold mb-3">
                          05. Windows Applications
                        </h4>
                        <div className="grid md:grid-cols-2 gap-3">
                          <div className="topic-item">
                            <span className="topic-icon">
                              ✓
                            </span>
                            {" "}
                            <span>
                              MS Paint
                            </span>
                          </div>
                          <div className="topic-item">
                            <span className="topic-icon">
                              ✓
                            </span>
                            {" "}
                            <span>
                              Notepad
                            </span>
                          </div>
                          <div className="topic-item">
                            <span className="topic-icon">
                              ✓
                            </span>
                            {" "}
                            <span>
                              WordPad
                            </span>
                          </div>
                          <div className="topic-item">
                            <span className="topic-icon">
                              ✓
                            </span>
                            {" "}
                            <span>
                              Windows Media Player
                            </span>
                          </div>
                          <div className="topic-item">
                            <span className="topic-icon">
                              ✓
                            </span>
                            {" "}
                            <span>
                              Calculator
                            </span>
                          </div>
                          <div className="topic-item">
                            <span className="topic-icon">
                              ✓
                            </span>
                            {" "}
                            <span>
                              Sticky Notes
                            </span>
                          </div>
                          <div className="topic-item">
                            <span className="topic-icon">
                              ✓
                            </span>
                            {" "}
                            <span>
                              Tablet PC Input Panel
                            </span>
                          </div>
                          <div className="topic-item">
                            <span className="topic-icon">
                              ✓
                            </span>
                            {" "}
                            <span>
                              Windows Games
                            </span>
                          </div>
                          <div className="topic-item">
                            <span className="topic-icon">
                              ✓
                            </span>
                            {" "}
                            <span>
                              Math Input Panel
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div id="module4" className="module-content">
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-soft">
                    <span className="badge bg-cyan-50 text-cyan-700">
                      {" "}MODULE 04{" "}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-extrabold mt-3">
                      21st Century Daily Life Skills
                    </h3>
                    <p className="text-slate-500 mt-2">
                      Practical digital skills for everyday life
                    </p>
                    <div className="grid md:grid-cols-2 gap-3 mt-8">
                      <script dangerouslySetInnerHTML={{ __html: js_1dbe419b }} />
                    </div>
                  </div>
                </div>
                <div id="module5" className="module-content">
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-soft">
                    <span className="badge bg-orange-50 text-orange-700">
                      {" "}MODULE 05{" "}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-extrabold mt-3">
                      21st Century Citizenship Skills
                    </h3>
                    <p className="text-slate-500 mt-2">
                      Digital access to government and citizen services
                    </p>
                    <div className="grid md:grid-cols-2 gap-3 mt-8">
                      <script dangerouslySetInnerHTML={{ __html: js_af0fd125 }} />
                    </div>
                  </div>
                </div>
                <div id="module6" className="module-content">
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-soft">
                    <span className="badge bg-pink-50 text-pink-700">
                      {" "}MODULE 06{" "}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-extrabold mt-3">
                      21st Century Study Skills
                    </h3>
                    <p className="text-slate-500 mt-2">
                      Digital research, learning and collaboration skills
                    </p>
                    <div className="grid md:grid-cols-2 gap-3 mt-8">
                      <script dangerouslySetInnerHTML={{ __html: js_09b574f6 }} />
                    </div>
                  </div>
                </div>
                <div id="module7" className="module-content">
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-soft">
                    <span className="badge bg-blue-50 text-blue-700">
                      {" "}MODULE 07{" "}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-extrabold mt-3">
                      Word Processing — MS Word / Google Docs
                    </h3>
                    <p className="text-slate-500 mt-2">
                      Document creation and professional word processing
                    </p>
                    <div className="grid md:grid-cols-2 gap-3 mt-8">
                      <div className="topic-item">
                        <span className="topic-icon">
                          01
                        </span>
                        <span>
                          Basic Operations
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          02
                        </span>
                        <span>
                          Creating and Editing Documents
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          03
                        </span>
                        <span>
                          Formatting Documents
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          04
                        </span>
                        <span>
                          Enhancing Documents
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          05
                        </span>
                        <span>
                          Page Setup
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          06
                        </span>
                        <span>
                          Shapes, SmartArt, Pictures and Tables
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          07
                        </span>
                        <span>
                          Headers and Footers
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          08
                        </span>
                        <span>
                          Linking and Embedding Documents
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          09
                        </span>
                        <span>
                          Previewing and Printing
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          10
                        </span>
                        <span>
                          Creating and Editing PDF Documents
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          11
                        </span>
                        <span>
                          Comparing Document Versions
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          12
                        </span>
                        <span>
                          Proofreading Documents
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          13
                        </span>
                        <span>
                          Track Changes
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          14
                        </span>
                        <span>
                          Digital Signature
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          15
                        </span>
                        <span>
                          Table of Contents
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          16
                        </span>
                        <span>
                          Mail Merge
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          17
                        </span>
                        <span>
                          Document Protection
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          18
                        </span>
                        <span>
                          Online Document Sharing
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          19
                        </span>
                        <span>
                          Creating a Web Page
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div id="module8" className="module-content">
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-soft">
                    <span className="badge bg-green-50 text-green-700">
                      {" "}MODULE 08{" "}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-extrabold mt-3">
                      Spreadsheet — MS Excel / Google Sheets
                    </h3>
                    <p className="text-slate-500 mt-2">
                      Data entry, calculation, analysis and reporting
                    </p>
                    <div className="grid md:grid-cols-2 gap-3 mt-8">
                      <div className="topic-item">
                        <span className="topic-icon">
                          01
                        </span>
                        <span>
                          Creating and Editing Workbook
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          02
                        </span>
                        <span>
                          Organizing Worksheets
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          03
                        </span>
                        <span>
                          Formatting Worksheets
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          04
                        </span>
                        <span>
                          Data Analysis and Management
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          05
                        </span>
                        <span>
                          Formulas and Functions
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          06
                        </span>
                        <span>
                          Resolving Spreadsheet Errors
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          07
                        </span>
                        <span>
                          Printing Worksheets
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          08
                        </span>
                        <span>
                          Managing Multiple Worksheets
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          09
                        </span>
                        <span>
                          Creating and Designing Charts
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          10
                        </span>
                        <span>
                          Pivot Tables
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          11
                        </span>
                        <span>
                          Pivot Charts
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          12
                        </span>
                        <span>
                          Importing and Exporting Data
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          13
                        </span>
                        <span>
                          Advanced Functions
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          14
                        </span>
                        <span>
                          Conditional Formatting
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          15
                        </span>
                        <span>
                          Data Validation
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          16
                        </span>
                        <span>
                          Sort and Filter
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div id="module9" className="module-content">
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-soft">
                    <span className="badge bg-red-50 text-red-700">
                      {" "}MODULE 09{" "}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-extrabold mt-3">
                      Presentation Graphics — PowerPoint / Google Slides
                    </h3>
                    <p className="text-slate-500 mt-2">
                      Professional presentation creation and delivery
                    </p>
                    <div className="grid md:grid-cols-2 gap-3 mt-8">
                      <div className="topic-item">
                        <span className="topic-icon">
                          01
                        </span>
                        <span>
                          Creating Presentations
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          02
                        </span>
                        <span>
                          Editing Presentations
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          03
                        </span>
                        <span>
                          Designing Presentations
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          04
                        </span>
                        <span>
                          Enhancing Slides
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          05
                        </span>
                        <span>
                          Delivering Presentations
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          06
                        </span>
                        <span>
                          Creating Presentation Videos
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          07
                        </span>
                        <span>
                          Saving Presentations in Various Formats
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          08
                        </span>
                        <span>
                          Importing and Exporting Presentations
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          09
                        </span>
                        <span>
                          Using Templates
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          10
                        </span>
                        <span>
                          Working with Slide Master
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div id="module10" className="module-content">
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-soft">
                    <span className="badge bg-amber-50 text-amber-700">
                      {" "}MODULE 10{" "}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-extrabold mt-3">
                      Database Management System — MS Access
                    </h3>
                    <p className="text-slate-500 mt-2">
                      Database fundamentals and information management
                    </p>
                    <div className="grid md:grid-cols-2 gap-3 mt-8">
                      <div className="topic-item">
                        <span className="topic-icon">
                          01
                        </span>
                        {" "}
                        <span>
                          Basic Database Operations
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          02
                        </span>
                        {" "}
                        <span>
                          Understanding Database Objects
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          03
                        </span>
                        {" "}
                        <span>
                          Tables and Records
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          04
                        </span>
                        {" "}
                        <span>
                          Fields and Data Types
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          05
                        </span>
                        {" "}
                        <span>
                          Working with Database Objects
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          06
                        </span>
                        {" "}
                        <span>
                          Database Security
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div id="module11" className="module-content">
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-soft">
                    <span className="badge bg-indigo-50 text-indigo-700">
                      {" "}MODULE 11{" "}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-extrabold mt-3">
                      Personal Information Manager — Outlook / Gmail
                    </h3>
                    <p className="text-slate-500 mt-2">
                      Professional email and personal information management
                    </p>
                    <div className="grid md:grid-cols-2 gap-3 mt-8">
                      <div className="topic-item">
                        <span className="topic-icon">
                          01
                        </span>
                        {" "}
                        <span>
                          Setting Up New Email Account
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          02
                        </span>
                        {" "}
                        <span>
                          Sending Email Messages
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          03
                        </span>
                        {" "}
                        <span>
                          Receiving Email Messages
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          04
                        </span>
                        {" "}
                        <span>
                          Replying to Messages
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          05
                        </span>
                        {" "}
                        <span>
                          Forwarding Emails
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          06
                        </span>
                        {" "}
                        <span>
                          Creating Professional Signature
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          07
                        </span>
                        {" "}
                        <span>
                          Scheduling Meetings
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          08
                        </span>
                        {" "}
                        <span>
                          Creating Contacts
                        </span>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          09
                        </span>
                        {" "}
                        <span>
                          Creating Appointments
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div id="module12" className="module-content">
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-soft">
                    <span className="badge bg-violet-50 text-violet-700">
                      {" "}MODULE 12{" "}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-extrabold mt-3">
                      Soft Skills & Life Skills for Workplace Readiness
                    </h3>
                    <p className="text-slate-500 mt-2">
                      40 Hours • Personal, Professional and Social Development
                    </p>
                    <div className="space-y-4 mt-8">
                      <div className="topic-item">
                        <span className="topic-icon">
                          01
                        </span>
                        <div>
                          <strong>
                            Self-Awareness & Self-Management
                          </strong>
                          <p className="text-sm text-slate-500 mt-1">
                            Understanding self, sensitivity towards self, others, society and nature, assertiveness, strengths and weaknesses.
                          </p>
                        </div>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          02
                        </span>
                        <div>
                          <strong>
                            Interpersonal Skills
                          </strong>
                          <p className="text-sm text-slate-500 mt-1">
                            Understanding others, workplace relationships and team management.
                          </p>
                        </div>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          03
                        </span>
                        <div>
                          <strong>
                            Presentation Skills
                          </strong>
                          <p className="text-sm text-slate-500 mt-1">
                            Presenting self, ideas and work with confidence and quality.
                          </p>
                        </div>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          04
                        </span>
                        <div>
                          <strong>
                            Time Management
                          </strong>
                          <p className="text-sm text-slate-500 mt-1">
                            Schedules, planning and respecting the value of time.
                          </p>
                        </div>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          05
                        </span>
                        <div>
                          <strong>
                            Goal Setting & Decision Making
                          </strong>
                          <p className="text-sm text-slate-500 mt-1">
                            Personal goal setting, taking initiative and making appropriate decisions.
                          </p>
                        </div>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          06
                        </span>
                        <div>
                          <strong>
                            Being Flexible
                          </strong>
                          <p className="text-sm text-slate-500 mt-1">
                            Adapting to change and challenges with a positive attitude.
                          </p>
                        </div>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          07
                        </span>
                        <div>
                          <strong>
                            Workplace Ethics
                          </strong>
                          <p className="text-sm text-slate-500 mt-1">
                            Responsible and ethical workplace behaviour and respecting diversity.
                          </p>
                        </div>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          08
                        </span>
                        <div>
                          <strong>
                            Conflict Management
                          </strong>
                          <p className="text-sm text-slate-500 mt-1">
                            Analyzing and resolving conflicts, convincing, compromising and collaboration.
                          </p>
                        </div>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          09
                        </span>
                        <div>
                          <strong>
                            Positive Health & Stress Management
                          </strong>
                          <p className="text-sm text-slate-500 mt-1">
                            Balanced personal, professional and social life with stress management.
                          </p>
                        </div>
                      </div>
                      <div className="topic-item">
                        <span className="topic-icon">
                          10
                        </span>
                        <div>
                          <strong>
                            Customer Relationship Management
                          </strong>
                          <p className="text-sm text-slate-500 mt-1">
                            Service attitude, customer sensitivity and serving with empathy.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center">
              <span className="text-blue-600 font-bold text-sm uppercase tracking-widest">
                {" "}IT Literacy{" "}
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold mt-3">
                Tools Covered in KYP
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-10">
              <div className="feature-card text-center">
                <i className="fa-brands fa-windows text-3xl text-blue-600"></i>
                <p className="font-bold mt-3 text-sm">
                  Windows
                </p>
              </div>
              <div className="feature-card text-center">
                <i className="fa-solid fa-globe text-3xl text-cyan-600"></i>
                <p className="font-bold mt-3 text-sm">
                  Internet
                </p>
              </div>
              <div className="feature-card text-center">
                <i className="fa-solid fa-file-word text-3xl text-blue-700"></i>
                <p className="font-bold mt-3 text-sm">
                  MS Word
                </p>
              </div>
              <div className="feature-card text-center">
                <i className="fa-solid fa-file-excel text-3xl text-green-600"></i>
                <p className="font-bold mt-3 text-sm">
                  MS Excel
                </p>
              </div>
              <div className="feature-card text-center">
                <i className="fa-solid fa-file-powerpoint text-3xl text-orange-600"></i>
                <p className="font-bold mt-3 text-sm">
                  PowerPoint
                </p>
              </div>
              <div className="feature-card text-center">
                <i className="fa-solid fa-database text-3xl text-indigo-600"></i>
                <p className="font-bold mt-3 text-sm">
                  MS Access
                </p>
              </div>
              <div className="feature-card text-center">
                <i className="fa-solid fa-envelope text-3xl text-blue-500"></i>
                <p className="font-bold mt-3 text-sm">
                  Outlook
                </p>
              </div>
              <div className="feature-card text-center">
                <i className="fa-brands fa-google text-3xl text-red-500"></i>
                <p className="font-bold mt-3 text-sm">
                  Google Apps
                </p>
              </div>
              <div className="feature-card text-center">
                <i className="fa-solid fa-file-lines text-3xl text-slate-700"></i>
                <p className="font-bold mt-3 text-sm">
                  Writer
                </p>
              </div>
              <div className="feature-card text-center">
                <i className="fa-solid fa-table text-3xl text-green-700"></i>
                <p className="font-bold mt-3 text-sm">
                  Calc
                </p>
              </div>
              <div className="feature-card text-center">
                <i className="fa-solid fa-display text-3xl text-orange-500"></i>
                <p className="font-bold mt-3 text-sm">
                  Impress
                </p>
              </div>
              <div className="feature-card text-center">
                <i className="fa-solid fa-shield-halved text-3xl text-violet-600"></i>
                <p className="font-bold mt-3 text-sm">
                  Cyber Safety
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="projects" className="py-16 bg-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-blue-600 font-bold text-sm uppercase tracking-widest">
                {" "}Practical Training{" "}
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold mt-3">
                Real-World Projects
              </h2>
              <p className="text-slate-500 mt-4">
                Practice-based activities help students apply their communication, computer and workplace skills.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
              <div className="project-card">
                <i className="fa-solid fa-file-word text-3xl text-blue-600"></i>
                <h3 className="font-bold text-lg mt-5">
                  Professional Document
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Create a formatted professional document with tables, images, header, footer and page setup.
                </p>
              </div>
              <div className="project-card">
                <i className="fa-solid fa-chart-column text-3xl text-green-600"></i>
                <h3 className="font-bold text-lg mt-5">
                  Excel Data Report
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Create a spreadsheet with formulas, sorting, filtering, charts and data analysis.
                </p>
              </div>
              <div className="project-card">
                <i className="fa-solid fa-person-chalkboard text-3xl text-orange-600"></i>
                <h3 className="font-bold text-lg mt-5">
                  Business Presentation
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Prepare and deliver a professional PowerPoint presentation.
                </p>
              </div>
              <div className="project-card">
                <i className="fa-solid fa-envelope-open-text text-3xl text-indigo-600"></i>
                <h3 className="font-bold text-lg mt-5">
                  Professional Email
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Create professional emails, signature, attachments and meeting invitations.
                </p>
              </div>
              <div className="project-card">
                <i className="fa-solid fa-database text-3xl text-violet-600"></i>
                <h3 className="font-bold text-lg mt-5">
                  Student Database
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Create a basic database to manage student records and information.
                </p>
              </div>
              <div className="project-card">
                <i className="fa-solid fa-users text-3xl text-pink-600"></i>
                <h3 className="font-bold text-lg mt-5">
                  Workplace Readiness
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Practice interview, communication, teamwork and customer service situations.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-blue-600 font-bold text-sm uppercase tracking-widest">
                  {" "}Why Learn KYP Skills?{" "}
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold mt-3">
                  Build Digital & Workplace Confidence
                </h2>
                <p className="text-slate-500 leading-7 mt-5">
                  The curriculum is designed around communication, digital literacy and workplace readiness so learners can confidently use technology and communicate in personal and professional situations.
                </p>
                <div className="space-y-4 mt-7">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <i className="fa-solid fa-check"></i>
                    </div>
                    <div>
                      <h4 className="font-bold">
                        Communication Confidence
                      </h4>
                      <p className="text-sm text-slate-500 mt-1">
                        Improve English/Hindi communication and workplace interaction.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                      <i className="fa-solid fa-check"></i>
                    </div>
                    <div>
                      <h4 className="font-bold">
                        Digital Literacy
                      </h4>
                      <p className="text-sm text-slate-500 mt-1">
                        Learn practical computer and Internet usage.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                      <i className="fa-solid fa-check"></i>
                    </div>
                    <div>
                      <h4 className="font-bold">
                        Workplace Readiness
                      </h4>
                      <p className="text-sm text-slate-500 mt-1">
                        Develop teamwork, presentation, ethics and customer service skills.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="hero-bg rounded-3xl p-8 text-white">
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass rounded-2xl p-5">
                    <div className="text-3xl font-extrabold">
                      240+
                    </div>
                    <div className="text-blue-100 text-sm mt-1">
                      Total Hours
                    </div>
                  </div>
                  <div className="glass rounded-2xl p-5">
                    <div className="text-3xl font-extrabold">
                      3
                    </div>
                    <div className="text-blue-100 text-sm mt-1">
                      Core Courses
                    </div>
                  </div>
                  <div className="glass rounded-2xl p-5">
                    <div className="text-3xl font-extrabold">
                      20+
                    </div>
                    <div className="text-blue-100 text-sm mt-1">
                      Communication Modules
                    </div>
                  </div>
                  <div className="glass rounded-2xl p-5">
                    <div className="text-3xl font-extrabold">
                      100+
                    </div>
                    <div className="text-blue-100 text-sm mt-1">
                      Practical Skills
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="admission" className="py-16 bg-slate-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden">
              <div className="grid lg:grid-cols-2">
                <div className="hero-bg text-white p-8 md:p-10">
                  <span className="badge bg-white/10 border border-white/20">
                    {" "}ADMISSION OPEN{" "}
                  </span>
                  <h2 className="text-3xl font-extrabold mt-5">
                    Start Your KYP Skill Journey
                  </h2>
                  <p className="text-blue-100 mt-4 leading-7">
                    Get practical training in communication, computer literacy and workplace readiness.
                  </p>
                  <div className="space-y-4 mt-8">
                    <div className="flex gap-3">
                      <i className="fa-solid fa-circle-check mt-1"></i>
                      <span>
                        {" "}Communication Skills{" "}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <i className="fa-solid fa-circle-check mt-1"></i>
                      <span>
                        {" "}Computer & Digital Skills{" "}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <i className="fa-solid fa-circle-check mt-1"></i>
                      <span>
                        {" "}Workplace Readiness{" "}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <i className="fa-solid fa-circle-check mt-1"></i>
                      <span>
                        {" "}Practical Learning{" "}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-8 md:p-10">
                  <h3 className="text-2xl font-bold">
                    Enquiry Form
                  </h3>
                  <p className="text-sm text-slate-500 mt-2">
                    Fill the form and our admission team will contact you.
                  </p>
                  <form id="admissionForm" className="space-y-4 mt-6">
                    <input type="text" className="form-input" placeholder="Student Name" required />
                    {" "}
                    <input type="tel" className="form-input" placeholder="Mobile Number" required />
                    {" "}
                    <input type="email" className="form-input" placeholder="Email Address" />
                    <select className="form-input">
                      <option>
                        Select Course
                      </option>
                      <option>
                        KYP Communication Skills
                      </option>
                      <option>
                        KYP IT Literacy Skills
                      </option>
                      <option>
                        KYP Soft & Life Skills
                      </option>
                      <option>
                        Complete KYP Program
                      </option>
                    </select>
                    <select className="form-input">
                      <option>
                        Select Preferred Batch
                      </option>
                      <option>
                        Morning Batch
                      </option>
                      <option>
                        Afternoon Batch
                      </option>
                      <option>
                        Evening Batch
                      </option>
                    </select>
                    <textarea rows={4} className="form-input" placeholder="Your Message" />
                    {" "}
                    <button type="submit" className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition">
                      {" "}
                      <i className="fa-solid fa-paper-plane mr-2"></i>
                      {" "}Submit Enquiry{" "}
                    </button>
                    <div id="formMessage" className="hidden p-3 rounded-xl bg-green-50 text-green-700 text-sm font-semibold">
                      Thank you! Your enquiry has been submitted successfully.
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="hero-bg rounded-3xl text-white p-8 md:p-12">
              <div className="grid md:grid-cols-[1fr_auto] gap-8 items-center">
                <div>
                  <span className="badge bg-white/10 border border-white/20">
                    {" "}CERTIFICATION{" "}
                  </span>
                  <h2 className="text-3xl md:text-4xl font-extrabold mt-4">
                    Complete Your Training With Confidence
                  </h2>
                  <p className="text-blue-100 mt-4 max-w-2xl leading-7">
                    Complete the required learning, practical activities and assessment to build a strong foundation for digital and workplace skills.
                  </p>
                </div>
                <div className="w-28 h-28 rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center">
                  <i className="fa-solid fa-certificate text-6xl text-yellow-300"></i>
                </div>
              </div>
            </div>
          </div>
        </section>
        <footer className="bg-slate-950 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center">
                    <i className="fa-solid fa-graduation-cap"></i>
                  </div>
                  <div>
                    <div className="font-extrabold text-lg">
                      Career Optics Computer Academy
                    </div>
                    <div className="text-xs text-slate-400">
                      Skill Development
                    </div>
                  </div>
                </div>
                <p className="text-slate-400 text-sm leading-6 mt-5">
                  Professional computer, digital skill and career-oriented training programs.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-4">
                  Quick Links
                </h4>
                <div className="space-y-3 text-sm text-slate-400">
                  <a href="#home" className="block hover:text-white">
                    {" "}Home{" "}
                  </a>
                  {" "}
                  <a href="#courses" className="block hover:text-white">
                    {" "}Courses{" "}
                  </a>
                  {" "}
                  <a href="#syllabus" className="block hover:text-white">
                    {" "}Syllabus{" "}
                  </a>
                  {" "}
                  <a href="#projects" className="block hover:text-white">
                    {" "}Projects{" "}
                  </a>
                </div>
              </div>
              <div>
                <h4 className="font-bold mb-4">
                  KYP Skills
                </h4>
                <div className="space-y-3 text-sm text-slate-400">
                  <div>
                    Communication Skills
                  </div>
                  <div>
                    IT Literacy Skills
                  </div>
                  <div>
                    Daily Life Skills
                  </div>
                  <div>
                    Citizenship Skills
                  </div>
                  <div>
                    Study Skills
                  </div>
                  <div>
                    Soft & Life Skills
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-bold mb-4">
                  Contact
                </h4>
                <div className="space-y-3 text-sm text-slate-400">
                  <div className="flex gap-3">
                    <i className="fa-solid fa-phone text-blue-400 mt-1"></i>
                    <span>
                      +91 82525 32179
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <i className="fa-solid fa-envelope text-blue-400 mt-1"></i>
                    <span>
                      careeropticsconsultancy@gmail.com
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <i className="fa-solid fa-location-dot text-blue-400 mt-1"></i>
                    <span>
                      Bihar, India
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col md:flex-row justify-between gap-3 text-sm text-slate-500">
              <div>
                © 2026 Career Optics Computer Academy. All Rights Reserved.
              </div>
              <div>
                KYP Course Syllabus
              </div>
            </div>
          </div>
        </footer>
        <a href="https://wa.me/918252532179" target="_blank" className="whatsapp" aria-label="WhatsApp">
          {" "}
          <i className="fa-brands fa-whatsapp"></i>
          {" "}
        </a>
        <script dangerouslySetInnerHTML={{ __html: js_b53e1a1c }} />
      </body>
    </html>
  );
}
