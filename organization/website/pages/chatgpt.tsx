import SiteHeader from "../components/SiteHeader";
import StyleBlock from "../components/StyleBlock";
import css_2e566bf7 from "../styles/2e566bf7.css?raw";
import css_32f7cc4c from "../styles/32f7cc4c.css?raw";
import css_33049102 from "../styles/33049102.css?raw";
import css_d2424ca6 from "../styles/d2424ca6.css?raw";
import js_0023a4f0 from "../behaviour/0023a4f0.js?raw";
import js_1547d5f8 from "../behaviour/1547d5f8.js?raw";
import js_6d157117 from "../behaviour/6d157117.js?raw";
import js_73893071 from "../behaviour/73893071.js?raw";
import js_c1268ab4 from "../behaviour/c1268ab4.js?raw";
import js_ea05b2d5 from "../behaviour/ea05b2d5.js?raw";

/** chatgpt.html */
export default function Chatgpt() {
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
      <body className="text-slate-800">
        <SiteHeader />
        <script dangerouslySetInnerHTML={{ __html: js_73893071 }} />
        <StyleBlock />
        <style dangerouslySetInnerHTML={{ __html: css_2e566bf7 }} />
        <header className="fixed top-0 left-0 right-0 z-50">
          <div className="navbar min-h-[70px] px-3 md:px-6 flex items-center justify-between">
            <a href="index.html" className="flex items-center shrink-0">
              <img src="/logo.png" alt="Career Optics Computer Centre" className="w-[78px] md:w-[88px] transition hover:scale-105" />
            </a>
            <nav className="hidden lg:flex items-center gap-1">
              <a href="index.html" className="nav-link">
                {" "}Home{" "}
              </a>
              {" "}
              <a href="about.html" className="nav-link">
                {" "}About Us{" "}
              </a>
              <div className="desktop-dropdown">
                <button type="button" className="nav-link desktop-dropdown-btn">
                  {" "}Academic Course{" "}
                  <i data-lucide="chevron-down" className="dropdown-chevron w-4 h-4"></i>
                  {" "}
                </button>
                <div className="desktop-dropdown-menu">
                  <a href="bihar_board.html">
                    {" "}
                    <span className="dropdown-icon">
                      {" "}
                      <i data-lucide="book"></i>
                      {" "}
                    </span>
                    {" "}
                    <span>
                      {" "}
                      <b className="dropdown-title">
                        BSEB IX - X
                      </b>
                      {" "}
                      <small className="dropdown-description">
                        {" "}School academic courses{" "}
                      </small>
                      {" "}
                    </span>
                    {" "}
                  </a>
                  {" "}
                  <a href="bihar_arts.html">
                    {" "}
                    <span className="dropdown-icon">
                      {" "}
                      <i data-lucide="school"></i>
                      {" "}
                    </span>
                    {" "}
                    <span>
                      {" "}
                      <b className="dropdown-title">
                        BSEB XII Arts
                      </b>
                      {" "}
                      <small className="dropdown-description">
                        {" "}Arts stream{" "}
                      </small>
                      {" "}
                    </span>
                    {" "}
                  </a>
                  {" "}
                  <a href="commerce.html">
                    {" "}
                    <span className="dropdown-icon">
                      {" "}
                      <i data-lucide="calculator"></i>
                      {" "}
                    </span>
                    {" "}
                    <span>
                      {" "}
                      <b className="dropdown-title">
                        BSEB Commerce
                      </b>
                      {" "}
                      <small className="dropdown-description">
                        {" "}Commerce stream{" "}
                      </small>
                      {" "}
                    </span>
                    {" "}
                  </a>
                  {" "}
                  <a href="pcs.html">
                    {" "}
                    <span className="dropdown-icon">
                      {" "}
                      <i data-lucide="book-open"></i>
                      {" "}
                    </span>
                    {" "}
                    <span>
                      {" "}
                      <b className="dropdown-title">
                        Competitive Exam
                      </b>
                      {" "}
                      <small className="dropdown-description">
                        {" "}Exam preparation{" "}
                      </small>
                      {" "}
                    </span>
                    {" "}
                  </a>
                  {" "}
                  <a href="spoken-english.html">
                    {" "}
                    <span className="dropdown-icon">
                      {" "}
                      <i data-lucide="mic"></i>
                      {" "}
                    </span>
                    {" "}
                    <span>
                      {" "}
                      <b className="dropdown-title">
                        Spoken English
                      </b>
                      {" "}
                      <small className="dropdown-description">
                        {" "}Personality development{" "}
                      </small>
                      {" "}
                    </span>
                    {" "}
                  </a>
                </div>
              </div>
              <div className="desktop-dropdown">
                <button type="button" className="nav-link desktop-dropdown-btn">
                  {" "}Our Course{" "}
                  <i data-lucide="chevron-down" className="dropdown-chevron w-4 h-4"></i>
                  {" "}
                </button>
                <div className="desktop-dropdown-menu">
                  <a href="computer-course.html">
                    {" "}
                    <span className="dropdown-icon">
                      {" "}
                      <i data-lucide="computer"></i>
                      {" "}
                    </span>
                    {" "}
                    <span>
                      {" "}
                      <b className="dropdown-title">
                        {" "}Certified Computer Courses{" "}
                      </b>
                      {" "}
                      <small className="dropdown-description">
                        {" "}Computer fundamentals & office{" "}
                      </small>
                      {" "}
                    </span>
                    {" "}
                  </a>
                  {" "}
                  <a href="accounting.html">
                    {" "}
                    <span className="dropdown-icon">
                      {" "}
                      <i data-lucide="calculator"></i>
                      {" "}
                    </span>
                    {" "}
                    <span>
                      {" "}
                      <b className="dropdown-title">
                        {" "}Accounting & Taxation{" "}
                      </b>
                      {" "}
                      <small className="dropdown-description">
                        {" "}Tally, GST & accounting{" "}
                      </small>
                      {" "}
                    </span>
                    {" "}
                  </a>
                  {" "}
                  <a href="graphics.html">
                    {" "}
                    <span className="dropdown-icon">
                      {" "}
                      <i data-lucide="pen-tool"></i>
                      {" "}
                    </span>
                    {" "}
                    <span>
                      {" "}
                      <b className="dropdown-title">
                        {" "}Graphic & Architecture{" "}
                      </b>
                      {" "}
                      <small className="dropdown-description">
                        {" "}Creative & design skills{" "}
                      </small>
                      {" "}
                    </span>
                    {" "}
                  </a>
                  {" "}
                  <a href="coding.html">
                    {" "}
                    <span className="dropdown-icon">
                      {" "}
                      <i data-lucide="code-2"></i>
                      {" "}
                    </span>
                    {" "}
                    <span>
                      {" "}
                      <b className="dropdown-title">
                        {" "}Programming{" "}
                      </b>
                      {" "}
                      <small className="dropdown-description">
                        {" "}Learn modern programming{" "}
                      </small>
                      {" "}
                    </span>
                    {" "}
                  </a>
                  {" "}
                  <a href="website-designer.html">
                    {" "}
                    <span className="dropdown-icon">
                      {" "}
                      <i data-lucide="laptop"></i>
                      {" "}
                    </span>
                    {" "}
                    <span>
                      {" "}
                      <b className="dropdown-title">
                        {" "}Web Development{" "}
                      </b>
                      {" "}
                      <small className="dropdown-description">
                        {" "}HTML, CSS, JS & responsive design{" "}
                      </small>
                      {" "}
                    </span>
                    {" "}
                  </a>
                  {" "}
                  <a href="#">
                    {" "}
                    <span className="dropdown-icon">
                      {" "}
                      <i data-lucide="megaphone"></i>
                      {" "}
                    </span>
                    {" "}
                    <span>
                      {" "}
                      <b className="dropdown-title">
                        {" "}Digital Marketing{" "}
                      </b>
                      {" "}
                      <small className="dropdown-description">
                        {" "}Social media marketing{" "}
                      </small>
                      {" "}
                    </span>
                    {" "}
                  </a>
                </div>
              </div>
              <div className="desktop-dropdown">
                <button type="button" className="nav-link desktop-dropdown-btn">
                  {" "}AI Program{" "}
                  <i data-lucide="chevron-down" className="dropdown-chevron w-4 h-4"></i>
                  {" "}
                </button>
                <div className="desktop-dropdown-menu">
                  <a href="ai_foundation.html">
                    {" "}
                    <span className="dropdown-icon">
                      {" "}
                      <i data-lucide="bot"></i>
                      {" "}
                    </span>
                    {" "}
                    <span>
                      {" "}
                      <b className="dropdown-title">
                        {" "}AI Foundation{" "}
                      </b>
                      {" "}
                      <small className="dropdown-description">
                        {" "}AI & Prompt Engineering{" "}
                      </small>
                      {" "}
                    </span>
                    {" "}
                  </a>
                  {" "}
                  <a href="ai_tools.html">
                    {" "}
                    <span className="dropdown-icon">
                      {" "}
                      <i data-lucide="zap"></i>
                      {" "}
                    </span>
                    {" "}
                    <span>
                      {" "}
                      <b className="dropdown-title">
                        {" "}AI Tools & Automation{" "}
                      </b>
                      {" "}
                      <small className="dropdown-description">
                        {" "}Automation & Productivity{" "}
                      </small>
                      {" "}
                    </span>
                    {" "}
                  </a>
                  {" "}
                  <a href="ai_career.html">
                    {" "}
                    <span className="dropdown-icon">
                      {" "}
                      <i data-lucide="briefcase-business"></i>
                      {" "}
                    </span>
                    {" "}
                    <span>
                      {" "}
                      <b className="dropdown-title">
                        {" "}AI Career Program{" "}
                      </b>
                      {" "}
                      <small className="dropdown-description">
                        {" "}Learn → Freelance → Earn{" "}
                      </small>
                      {" "}
                    </span>
                    {" "}
                  </a>
                </div>
              </div>
              <div className="desktop-dropdown">
                <button type="button" className="nav-link desktop-dropdown-btn">
                  {" "}Franchise Zone{" "}
                  <i data-lucide="chevron-down" className="dropdown-chevron w-4 h-4"></i>
                  {" "}
                </button>
                <div className="desktop-dropdown-menu">
                  <a href="#franchise">
                    {" "}
                    <span className="dropdown-icon">
                      {" "}
                      <i data-lucide="building-2"></i>
                      {" "}
                    </span>
                    {" "}
                    <span>
                      {" "}
                      <b className="dropdown-title">
                        {" "}Franchise Opportunity{" "}
                      </b>
                      {" "}
                      <small className="dropdown-description">
                        {" "}Start your training center{" "}
                      </small>
                      {" "}
                    </span>
                    {" "}
                  </a>
                  {" "}
                  <a href="#franchise">
                    {" "}
                    <span className="dropdown-icon">
                      {" "}
                      <i data-lucide="send"></i>
                      {" "}
                    </span>
                    {" "}
                    <span>
                      {" "}
                      <b className="dropdown-title">
                        {" "}Apply Franchise{" "}
                      </b>
                      {" "}
                      <small className="dropdown-description">
                        {" "}Submit franchise application{" "}
                      </small>
                      {" "}
                    </span>
                    {" "}
                  </a>
                </div>
              </div>
              <div className="desktop-dropdown">
                <button type="button" className="nav-link desktop-dropdown-btn">
                  {" "}Student Zone{" "}
                  <i data-lucide="chevron-down" className="dropdown-chevron w-4 h-4"></i>
                  {" "}
                </button>
                <div className="desktop-dropdown-menu">
                  <a href="#student">
                    {" "}
                    <span className="dropdown-icon">
                      {" "}
                      <i data-lucide="log-in"></i>
                      {" "}
                    </span>
                    {" "}
                    <span>
                      {" "}
                      <b className="dropdown-title">
                        {" "}Student Login{" "}
                      </b>
                      {" "}
                      <small className="dropdown-description">
                        {" "}Login to student portal{" "}
                      </small>
                      {" "}
                    </span>
                    {" "}
                  </a>
                  {" "}
                  <a href="#certificate">
                    {" "}
                    <span className="dropdown-icon">
                      {" "}
                      <i data-lucide="award"></i>
                      {" "}
                    </span>
                    {" "}
                    <span>
                      {" "}
                      <b className="dropdown-title">
                        {" "}Certificate{" "}
                      </b>
                      {" "}
                      <small className="dropdown-description">
                        {" "}Certificate verification{" "}
                      </small>
                      {" "}
                    </span>
                    {" "}
                  </a>
                </div>
              </div>
            </nav>
            <div className="hidden lg:flex items-center gap-2">
              <a href="#enquiry" className="px-4 py-2.5 rounded-xl text-sm font-bold text-blue-600 border border-blue-200 hover:bg-blue-50 transition">
                {" "}Enquiry{" "}
              </a>
              {" "}
              <a href="#enroll" className="px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-200 hover:-translate-y-0.5 transition">
                {" "}Enroll Now{" "}
              </a>
            </div>
            <button id="mobileMenuButton" className="lg:hidden w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <i data-lucide="menu" id="menuIcon" className="w-6 h-6"></i>
            </button>
          </div>
          <div id="mobileMenu" className="mobile-menu lg:hidden p-3">
            <a href="index.html" className="mobile-link">
              {" "}
              <span>
                Home
              </span>
              {" "}
            </a>
            {" "}
            <a href="about.html" className="mobile-link">
              {" "}
              <span>
                About Us
              </span>
              {" "}
            </a>
            <div className="mobile-dropdown">
              <button className="mobile-dropdown-btn">
                {" "}
                <span className="flex items-center gap-2">
                  <i data-lucide="book-open" className="w-4 h-4"></i>
                  Academic Course
                </span>
                {" "}
                <i data-lucide="chevron-down" className="arrow w-4 h-4"></i>
                {" "}
              </button>
              <div className="mobile-submenu">
                <div className="mobile-submenu-inner">
                  <a href="bihar_board.html">
                    {" "}
                    <i data-lucide="book"></i>
                    {" "}BSEB IX - X{" "}
                  </a>
                  {" "}
                  <a href="bihar_arts.html">
                    {" "}
                    <i data-lucide="school"></i>
                    {" "}BSEB XII Arts{" "}
                  </a>
                  {" "}
                  <a href="commerce.html">
                    {" "}
                    <i data-lucide="calculator"></i>
                    {" "}BSEB Commerce{" "}
                  </a>
                  {" "}
                  <a href="pcs.html">
                    {" "}
                    <i data-lucide="book-open"></i>
                    {" "}Competitive Exam{" "}
                  </a>
                  {" "}
                  <a href="spoken-english.html">
                    {" "}
                    <i data-lucide="mic"></i>
                    {" "}Spoken English{" "}
                  </a>
                </div>
              </div>
            </div>
            <div className="mobile-dropdown">
              <button className="mobile-dropdown-btn">
                {" "}
                <span className="flex items-center gap-2">
                  <i data-lucide="graduation-cap" className="w-4 h-4"></i>
                  Our Course
                </span>
                {" "}
                <i data-lucide="chevron-down" className="arrow w-4 h-4"></i>
                {" "}
              </button>
              <div className="mobile-submenu">
                <div className="mobile-submenu-inner">
                  <a href="computer-course.html">
                    {" "}
                    <i data-lucide="computer"></i>
                    {" "}Computer Courses{" "}
                  </a>
                  {" "}
                  <a href="accounting.html">
                    {" "}
                    <i data-lucide="calculator"></i>
                    {" "}Accounting & Taxation{" "}
                  </a>
                  {" "}
                  <a href="graphics.html">
                    {" "}
                    <i data-lucide="pen-tool"></i>
                    {" "}Graphic & Architecture{" "}
                  </a>
                  {" "}
                  <a href="coding.html">
                    {" "}
                    <i data-lucide="code-2"></i>
                    {" "}Programming{" "}
                  </a>
                  {" "}
                  <a href="website-designer.html">
                    {" "}
                    <i data-lucide="laptop"></i>
                    {" "}Web Development{" "}
                  </a>
                  {" "}
                  <a href="#">
                    {" "}
                    <i data-lucide="megaphone"></i>
                    {" "}Digital Marketing{" "}
                  </a>
                </div>
              </div>
            </div>
            <div className="mobile-dropdown">
              <button className="mobile-dropdown-btn">
                {" "}
                <span className="flex items-center gap-2">
                  <i data-lucide="bot" className="w-4 h-4"></i>
                  AI Program
                </span>
                {" "}
                <i data-lucide="chevron-down" className="arrow w-4 h-4"></i>
                {" "}
              </button>
              <div className="mobile-submenu">
                <div className="mobile-submenu-inner">
                  <a href="ai_foundation.html">
                    {" "}
                    <i data-lucide="bot"></i>
                    {" "}AI Foundation{" "}
                  </a>
                  {" "}
                  <a href="ai_tools.html">
                    {" "}
                    <i data-lucide="zap"></i>
                    {" "}AI Tools & Automation{" "}
                  </a>
                  {" "}
                  <a href="ai_career.html">
                    {" "}
                    <i data-lucide="briefcase"></i>
                    {" "}AI Career Program{" "}
                  </a>
                </div>
              </div>
            </div>
            <a href="#certificate" className="mobile-link">
              {" "}
              <span className="flex items-center gap-2">
                <i data-lucide="award" className="w-4 h-4"></i>
                Certificate
              </span>
              {" "}
            </a>
            <div className="grid grid-cols-2 gap-2 pt-3">
              <a href="#enquiry" className="min-h-[44px] rounded-xl border border-blue-200 flex items-center justify-center text-blue-600 font-bold text-sm">
                Enquiry
              </a>
              <a href="#enroll" className="min-h-[44px] rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                Enroll Now
              </a>
            </div>
          </div>
        </header>
        <main>
          <section className="hero-bg pt-32 pb-14 md:pt-40 md:pb-20">
            <div className="max-w-7xl mx-auto px-4">
              <div className="grid lg:grid-cols-12 gap-10 items-center">
                <div className="lg:col-span-7">
                  <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs md:text-sm font-bold text-blue-700 mb-5">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                    AI Foundation Course
                  </div>
                  <h1 className="hero-title text-4xl md:text-6xl font-black tracking-tight text-slate-900">
                    Certificate in{" "}
                    <span className="gradient-text">
                      {" "}ChatGPT Mastery{" "}
                    </span>
                  </h1>
                  <p className="mt-5 text-base md:text-lg leading-8 text-slate-600 max-w-2xl">
                    Learn ChatGPT from basics to professional productivity. Master prompting, content creation, study support, career assistance, business workflows and practical AI productivity skills.
                  </p>
                  <div className="flex flex-wrap gap-3 mt-7">
                    <span className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700">
                      {" "}🤖 ChatGPT{" "}
                    </span>
                    <span className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700">
                      {" "}✨ Prompt Engineering{" "}
                    </span>
                    <span className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700">
                      {" "}⚡ Productivity{" "}
                    </span>
                    <span className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700">
                      {" "}💼 Career{" "}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 mt-8">
                    <a href="#enroll" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-xl shadow-blue-200 hover:-translate-y-1 transition">
                      Enroll Now
                      <i data-lucide="arrow-right" className="w-4 h-4"></i>
                    </a>
                    <a href="#syllabus" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition">
                      View Full Syllabus
                      <i data-lucide="book-open" className="w-4 h-4"></i>
                    </a>
                  </div>
                </div>
                <div className="lg:col-span-5">
                  <div className="hero-card rounded-3xl p-6 md:p-7">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                          Course Details
                        </p>
                        <h2 className="text-xl font-black mt-1">
                          ChatGPT Mastery
                        </h2>
                      </div>
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg">
                        <i data-lucide="bot" className="w-7 h-7"></i>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 rounded-2xl bg-slate-50">
                        <p className="text-xs text-slate-500 font-semibold">
                          Duration
                        </p>
                        <p className="text-lg font-black mt-1">
                          15 Days
                        </p>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50">
                        <p className="text-xs text-slate-500 font-semibold">
                          Level
                        </p>
                        <p className="text-lg font-black mt-1">
                          Beginner
                        </p>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50">
                        <p className="text-xs text-slate-500 font-semibold">
                          Projects
                        </p>
                        <p className="text-lg font-black mt-1">
                          3+
                        </p>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50">
                        <p className="text-xs text-slate-500 font-semibold">
                          Mode
                        </p>
                        <p className="text-lg font-black mt-1">
                          Practical
                        </p>
                      </div>
                    </div>
                    <div className="mt-5 p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-xs text-slate-500 font-semibold">
                            Course Fee
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-3xl font-black text-slate-900">
                              {" "}₹3,499{" "}
                            </span>
                            <span className="text-sm text-slate-400 line-through">
                              {" "}₹6,499{" "}
                            </span>
                          </div>
                        </div>
                        <span className="px-3 py-1.5 rounded-full bg-blue-600 text-white text-xs font-bold">
                          {" "}SPECIAL OFFER{" "}
                        </span>
                      </div>
                    </div>
                    <div className="mt-5 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                        <i data-lucide="badge-check" className="w-5 h-5"></i>
                      </div>
                      <div>
                        <p className="text-sm font-bold">
                          Certificate Included
                        </p>
                        <p className="text-xs text-slate-500">
                          Certificate in ChatGPT Mastery
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="py-16 md:py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4">
              <div className="max-w-3xl">
                <span className="text-xs font-black uppercase tracking-[.2em] text-blue-600">
                  {" "}Course Overview{" "}
                </span>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 mt-3">
                  Master ChatGPT for{" "}
                  <span className="gradient-text">
                    {" "}Real-World Work{" "}
                  </span>
                </h2>
                <p className="mt-4 text-slate-600 leading-8">
                  यह practical course students और professionals को ChatGPT का effective और responsible use सिखाता है। आप basic conversations से लेकर advanced prompts, content creation, career preparation, business assistance और productivity workflows तक सीखेंगे।
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-5 mt-10">
                <div className="benefit-card rounded-2xl p-6">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <i data-lucide="message-square" className="w-6 h-6"></i>
                  </div>
                  <h3 className="font-black text-lg mt-5">
                    Better Prompts
                  </h3>
                  <p className="text-sm text-slate-500 leading-6 mt-2">
                    Clear, structured और professional prompts बनाना सीखें।
                  </p>
                </div>
                <div className="benefit-card rounded-2xl p-6">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <i data-lucide="zap" className="w-6 h-6"></i>
                  </div>
                  <h3 className="font-black text-lg mt-5">
                    Higher Productivity
                  </h3>
                  <p className="text-sm text-slate-500 leading-6 mt-2">
                    Daily study, office और business tasks को AI से simplify करें।
                  </p>
                </div>
                <div className="benefit-card rounded-2xl p-6">
                  <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                    <i data-lucide="briefcase" className="w-6 h-6"></i>
                  </div>
                  <h3 className="font-black text-lg mt-5">
                    Career Ready
                  </h3>
                  <p className="text-sm text-slate-500 leading-6 mt-2">
                    Resume, interview, emails और professional communication में AI का use करें।
                  </p>
                </div>
              </div>
            </div>
          </section>
          <section id="syllabus" className="py-14 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-6 md:p-7 border-b border-gray-200">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <span className="text-blue-600 text-sm font-bold uppercase tracking-wide">
                            {" "}Course Content{" "}
                          </span>
                          <h2 className="text-2xl md:text-3xl font-black mt-2 text-gray-900">
                            Certificate in ChatGPT Mastery
                          </h2>
                          <p className="text-sm text-gray-500 mt-2">
                            12 Modules • Practical AI Training • Career-Focused Learning
                          </p>
                        </div>
                        <button type="button" data-inline-onclick="openAllModules()" className="text-sm border border-blue-200 text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition">
                          {" "}Open All{" "}
                        </button>
                      </div>
                    </div>
                    <div className="course-module module border-b border-gray-200">
                      <button type="button" data-inline-onclick="openModule(this)" className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition">
                        <div className="flex items-center gap-4 min-w-0">
                          <span className="shrink-0 w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black">
                            01
                          </span>
                          <div className="min-w-0">
                            <h3 className="font-bold text-gray-900">
                              ChatGPT Fundamentals & AI Basics
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              Introduction to Generative AI and ChatGPT
                            </p>
                          </div>
                        </div>
                        <span className="lesson-arrow text-xl shrink-0 ml-4 transition-transform">
                          {" "}⌄{" "}
                        </span>
                      </button>
                      <div className="lesson-box px-5 pb-6">
                        <div className="ml-14 grid sm:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div>
                            ✓ What is Artificial Intelligence?
                          </div>
                          <div>
                            ✓ What is Generative AI?
                          </div>
                          <div>
                            ✓ Introduction to ChatGPT
                          </div>
                          <div>
                            ✓ How ChatGPT Works
                          </div>
                          <div>
                            ✓ Large Language Models
                          </div>
                          <div>
                            ✓ AI vs Traditional Search
                          </div>
                          <div>
                            ✓ ChatGPT Interface Overview
                          </div>
                          <div>
                            ✓ Creating & Managing Chats
                          </div>
                          <div>
                            ✓ ChatGPT Account Settings
                          </div>
                          <div>
                            ✓ Free vs Paid Features
                          </div>
                          <div>
                            ✓ AI Limitations & Hallucinations
                          </div>
                          <div>
                            ✓ Responsible AI Usage
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="course-module module border-b border-gray-200">
                      <button type="button" data-inline-onclick="openModule(this)" className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition">
                        <div className="flex items-center gap-4 min-w-0">
                          <span className="shrink-0 w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black">
                            02
                          </span>
                          <div className="min-w-0">
                            <h3 className="font-bold text-gray-900">
                              Prompt Engineering Fundamentals
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              Learn how to communicate effectively with AI
                            </p>
                          </div>
                        </div>
                        <span className="lesson-arrow text-xl shrink-0 ml-4">
                          {" "}⌄{" "}
                        </span>
                      </button>
                      <div className="lesson-box px-5 pb-6">
                        <div className="ml-14 grid sm:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div>
                            ✓ What is a Prompt?
                          </div>
                          <div>
                            ✓ Prompt Structure
                          </div>
                          <div>
                            ✓ Clear Instructions
                          </div>
                          <div>
                            ✓ Context in Prompts
                          </div>
                          <div>
                            ✓ Role-Based Prompting
                          </div>
                          <div>
                            ✓ Zero-Shot Prompting
                          </div>
                          <div>
                            ✓ Few-Shot Prompting
                          </div>
                          <div>
                            ✓ Step-by-Step Instructions
                          </div>
                          <div>
                            ✓ Output Formatting
                          </div>
                          <div>
                            ✓ Constraints & Conditions
                          </div>
                          <div>
                            ✓ Prompt Refinement
                          </div>
                          <div>
                            ✓ Common Prompting Mistakes
                          </div>
                          <div>
                            ✓ Basic Prompt Templates
                          </div>
                          <div>
                            ✓ Practical Prompt Exercises
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="course-module module border-b border-gray-200">
                      <button type="button" data-inline-onclick="openModule(this)" className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition">
                        <div className="flex items-center gap-4 min-w-0">
                          <span className="shrink-0 w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black">
                            03
                          </span>
                          <div className="min-w-0">
                            <h3 className="font-bold text-gray-900">
                              Advanced Prompt Engineering
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              Advanced techniques for better AI outputs
                            </p>
                          </div>
                        </div>
                        <span className="lesson-arrow text-xl shrink-0 ml-4">
                          {" "}⌄{" "}
                        </span>
                      </button>
                      <div className="lesson-box px-5 pb-6">
                        <div className="ml-14 grid sm:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div>
                            ✓ Persona Prompting
                          </div>
                          <div>
                            ✓ System-Style Instructions
                          </div>
                          <div>
                            ✓ Chain-of-Thought Concepts
                          </div>
                          <div>
                            ✓ Structured Reasoning
                          </div>
                          <div>
                            ✓ Task Decomposition
                          </div>
                          <div>
                            ✓ Multi-Step Prompts
                          </div>
                          <div>
                            ✓ Prompt Chaining
                          </div>
                          <div>
                            ✓ Iterative Prompting
                          </div>
                          <div>
                            ✓ Critique & Improve Prompts
                          </div>
                          <div>
                            ✓ Summarization Prompts
                          </div>
                          <div>
                            ✓ Comparison Prompts
                          </div>
                          <div>
                            ✓ Analysis Prompts
                          </div>
                          <div>
                            ✓ Decision-Making Prompts
                          </div>
                          <div>
                            ✓ Professional Prompt Templates
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="course-module module border-b border-gray-200">
                      <button type="button" data-inline-onclick="openModule(this)" className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition">
                        <div className="flex items-center gap-4 min-w-0">
                          <span className="shrink-0 w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black">
                            04
                          </span>
                          <div className="min-w-0">
                            <h3 className="font-bold text-gray-900">
                              ChatGPT for Writing & Content Creation
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              Professional writing, content and communication
                            </p>
                          </div>
                        </div>
                        <span className="lesson-arrow text-xl shrink-0 ml-4">
                          {" "}⌄{" "}
                        </span>
                      </button>
                      <div className="lesson-box px-5 pb-6">
                        <div className="ml-14 grid sm:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div>
                            ✓ Blog Writing
                          </div>
                          <div>
                            ✓ Article Writing
                          </div>
                          <div>
                            ✓ Social Media Posts
                          </div>
                          <div>
                            ✓ Instagram Captions
                          </div>
                          <div>
                            ✓ LinkedIn Content
                          </div>
                          <div>
                            ✓ YouTube Scripts
                          </div>
                          <div>
                            ✓ Video Ideas
                          </div>
                          <div>
                            ✓ Headlines & Hooks
                          </div>
                          <div>
                            ✓ Product Descriptions
                          </div>
                          <div>
                            ✓ Website Content
                          </div>
                          <div>
                            ✓ Email Writing
                          </div>
                          <div>
                            ✓ Professional Letters
                          </div>
                          <div>
                            ✓ Reports & Summaries
                          </div>
                          <div>
                            ✓ Content Rewriting
                          </div>
                          <div>
                            ✓ Grammar & Proofreading
                          </div>
                          <div>
                            ✓ Content Calendar Creation
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="course-module module border-b border-gray-200">
                      <button type="button" data-inline-onclick="openModule(this)" className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition">
                        <div className="flex items-center gap-4 min-w-0">
                          <span className="shrink-0 w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center font-black">
                            05
                          </span>
                          <div className="min-w-0">
                            <h3 className="font-bold text-gray-900">
                              ChatGPT for Office & Productivity
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              AI-powered workplace productivity
                            </p>
                          </div>
                        </div>
                        <span className="lesson-arrow text-xl shrink-0 ml-4">
                          {" "}⌄{" "}
                        </span>
                      </button>
                      <div className="lesson-box px-5 pb-6">
                        <div className="ml-14 grid sm:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div>
                            ✓ Daily Work Planning
                          </div>
                          <div>
                            ✓ Task Management
                          </div>
                          <div>
                            ✓ Meeting Agenda Creation
                          </div>
                          <div>
                            ✓ Meeting Notes
                          </div>
                          <div>
                            ✓ Professional Email Drafting
                          </div>
                          <div>
                            ✓ Office Letter Writing
                          </div>
                          <div>
                            ✓ Report Preparation
                          </div>
                          <div>
                            ✓ Data Explanation
                          </div>
                          <div>
                            ✓ Excel Formula Assistance
                          </div>
                          <div>
                            ✓ Spreadsheet Analysis
                          </div>
                          <div>
                            ✓ Presentation Ideas
                          </div>
                          <div>
                            ✓ Business Documentation
                          </div>
                          <div>
                            ✓ SOP Creation
                          </div>
                          <div>
                            ✓ Workflow Improvement
                          </div>
                          <div>
                            ✓ Time Management
                          </div>
                          <div>
                            ✓ Productivity Templates
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="course-module module border-b border-gray-200">
                      <button type="button" data-inline-onclick="openModule(this)" className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition">
                        <div className="flex items-center gap-4 min-w-0">
                          <span className="shrink-0 w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center font-black">
                            06
                          </span>
                          <div className="min-w-0">
                            <h3 className="font-bold text-gray-900">
                              ChatGPT for Students & Education
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              Study, research and learning with AI
                            </p>
                          </div>
                        </div>
                        <span className="lesson-arrow text-xl shrink-0 ml-4">
                          {" "}⌄{" "}
                        </span>
                      </button>
                      <div className="lesson-box px-5 pb-6">
                        <div className="ml-14 grid sm:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div>
                            ✓ Study Planning
                          </div>
                          <div>
                            ✓ Topic Explanation
                          </div>
                          <div>
                            ✓ Difficult Concepts Simplification
                          </div>
                          <div>
                            ✓ Notes Generation
                          </div>
                          <div>
                            ✓ Chapter Summaries
                          </div>
                          <div>
                            ✓ Question Generation
                          </div>
                          <div>
                            ✓ Quiz Creation
                          </div>
                          <div>
                            ✓ MCQ Generation
                          </div>
                          <div>
                            ✓ Revision Planning
                          </div>
                          <div>
                            ✓ Assignment Assistance
                          </div>
                          <div>
                            ✓ Research Topic Ideas
                          </div>
                          <div>
                            ✓ Research Questions
                          </div>
                          <div>
                            ✓ Presentation Preparation
                          </div>
                          <div>
                            ✓ Interview Preparation
                          </div>
                          <div>
                            ✓ Language Learning
                          </div>
                          <div>
                            ✓ Responsible Academic AI Use
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="course-module module border-b border-gray-200">
                      <button type="button" data-inline-onclick="openModule(this)" className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition">
                        <div className="flex items-center gap-4 min-w-0">
                          <span className="shrink-0 w-10 h-10 rounded-xl bg-yellow-100 text-yellow-700 flex items-center justify-center font-black">
                            07
                          </span>
                          <div className="min-w-0">
                            <h3 className="font-bold text-gray-900">
                              ChatGPT for Business & Marketing
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              AI-powered business and digital marketing
                            </p>
                          </div>
                        </div>
                        <span className="lesson-arrow text-xl shrink-0 ml-4">
                          {" "}⌄{" "}
                        </span>
                      </button>
                      <div className="lesson-box px-5 pb-6">
                        <div className="ml-14 grid sm:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div>
                            ✓ Business Idea Generation
                          </div>
                          <div>
                            ✓ Business Plan Drafting
                          </div>
                          <div>
                            ✓ Market Research Prompts
                          </div>
                          <div>
                            ✓ Customer Persona
                          </div>
                          <div>
                            ✓ Target Audience Research
                          </div>
                          <div>
                            ✓ Competitor Analysis
                          </div>
                          <div>
                            ✓ SWOT Analysis
                          </div>
                          <div>
                            ✓ Marketing Strategy
                          </div>
                          <div>
                            ✓ Digital Marketing Content
                          </div>
                          <div>
                            ✓ Social Media Strategy
                          </div>
                          <div>
                            ✓ Ad Copy Creation
                          </div>
                          <div>
                            ✓ Campaign Ideas
                          </div>
                          <div>
                            ✓ SEO Content Ideas
                          </div>
                          <div>
                            ✓ Keyword Brainstorming
                          </div>
                          <div>
                            ✓ Sales Copy
                          </div>
                          <div>
                            ✓ Customer Support Responses
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="course-module module border-b border-gray-200">
                      <button type="button" data-inline-onclick="openModule(this)" className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition">
                        <div className="flex items-center gap-4 min-w-0">
                          <span className="shrink-0 w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-black">
                            08
                          </span>
                          <div className="min-w-0">
                            <h3 className="font-bold text-gray-900">
                              ChatGPT for Career & Job Preparation
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              Resume, interview and career support
                            </p>
                          </div>
                        </div>
                        <span className="lesson-arrow text-xl shrink-0 ml-4">
                          {" "}⌄{" "}
                        </span>
                      </button>
                      <div className="lesson-box px-5 pb-6">
                        <div className="ml-14 grid sm:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div>
                            ✓ Career Goal Planning
                          </div>
                          <div>
                            ✓ Job Search Strategy
                          </div>
                          <div>
                            ✓ Resume Creation
                          </div>
                          <div>
                            ✓ Resume Improvement
                          </div>
                          <div>
                            ✓ ATS-Friendly Resume
                          </div>
                          <div>
                            ✓ Cover Letter Writing
                          </div>
                          <div>
                            ✓ LinkedIn Profile Content
                          </div>
                          <div>
                            ✓ LinkedIn About Section
                          </div>
                          <div>
                            ✓ Job Description Analysis
                          </div>
                          <div>
                            ✓ Skill Gap Analysis
                          </div>
                          <div>
                            ✓ Interview Questions
                          </div>
                          <div>
                            ✓ Interview Answers
                          </div>
                          <div>
                            ✓ HR Interview Preparation
                          </div>
                          <div>
                            ✓ Technical Interview Preparation
                          </div>
                          <div>
                            ✓ Communication Practice
                          </div>
                          <div>
                            ✓ Professional Introduction
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="course-module module border-b border-gray-200">
                      <button type="button" data-inline-onclick="openModule(this)" className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition">
                        <div className="flex items-center gap-4 min-w-0">
                          <span className="shrink-0 w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-black">
                            09
                          </span>
                          <div className="min-w-0">
                            <h3 className="font-bold text-gray-900">
                              ChatGPT for Coding & Technical Work
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              Learn coding assistance and technical workflows
                            </p>
                          </div>
                        </div>
                        <span className="lesson-arrow text-xl shrink-0 ml-4">
                          {" "}⌄{" "}
                        </span>
                      </button>
                      <div className="lesson-box px-5 pb-6">
                        <div className="ml-14 grid sm:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div>
                            ✓ Introduction to AI Coding
                          </div>
                          <div>
                            ✓ HTML Code Generation
                          </div>
                          <div>
                            ✓ CSS Assistance
                          </div>
                          <div>
                            ✓ JavaScript Assistance
                          </div>
                          <div>
                            ✓ PHP Code Assistance
                          </div>
                          <div>
                            ✓ SQL Query Assistance
                          </div>
                          <div>
                            ✓ Python Basics with ChatGPT
                          </div>
                          <div>
                            ✓ Code Explanation
                          </div>
                          <div>
                            ✓ Debugging Assistance
                          </div>
                          <div>
                            ✓ Error Analysis
                          </div>
                          <div>
                            ✓ Code Optimization
                          </div>
                          <div>
                            ✓ Code Documentation
                          </div>
                          <div>
                            ✓ Regular Expressions
                          </div>
                          <div>
                            ✓ Database Query Support
                          </div>
                          <div>
                            ✓ Website Content Generation
                          </div>
                          <div>
                            ✓ Practical Coding Project
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="course-module module border-b border-gray-200">
                      <button type="button" data-inline-onclick="openModule(this)" className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition">
                        <div className="flex items-center gap-4 min-w-0">
                          <span className="shrink-0 w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-black">
                            10
                          </span>
                          <div className="min-w-0">
                            <h3 className="font-bold text-gray-900">
                              ChatGPT Tools, Files & Data Analysis
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              Work with documents, files and structured data
                            </p>
                          </div>
                        </div>
                        <span className="lesson-arrow text-xl shrink-0 ml-4">
                          {" "}⌄{" "}
                        </span>
                      </button>
                      <div className="lesson-box px-5 pb-6">
                        <div className="ml-14 grid sm:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div>
                            ✓ Working with Documents
                          </div>
                          <div>
                            ✓ PDF Analysis
                          </div>
                          <div>
                            ✓ Text File Analysis
                          </div>
                          <div>
                            ✓ Spreadsheet Analysis
                          </div>
                          <div>
                            ✓ Data Cleaning Concepts
                          </div>
                          <div>
                            ✓ Data Summarization
                          </div>
                          <div>
                            ✓ Table Analysis
                          </div>
                          <div>
                            ✓ Report Generation
                          </div>
                          <div>
                            ✓ Data Interpretation
                          </div>
                          <div>
                            ✓ Trend Identification
                          </div>
                          <div>
                            ✓ Charts & Visualization Concepts
                          </div>
                          <div>
                            ✓ File-Based Prompting
                          </div>
                          <div>
                            ✓ Extracting Information
                          </div>
                          <div>
                            ✓ Document Comparison
                          </div>
                          <div>
                            ✓ Practical Data Analysis
                          </div>
                          <div>
                            ✓ AI-Assisted Reporting
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="course-module module border-b border-gray-200">
                      <button type="button" data-inline-onclick="openModule(this)" className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition">
                        <div className="flex items-center gap-4 min-w-0">
                          <span className="shrink-0 w-10 h-10 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center font-black">
                            11
                          </span>
                          <div className="min-w-0">
                            <h3 className="font-bold text-gray-900">
                              AI Workflow, Automation & Productivity
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              Build repeatable AI-powered workflows
                            </p>
                          </div>
                        </div>
                        <span className="lesson-arrow text-xl shrink-0 ml-4">
                          {" "}⌄{" "}
                        </span>
                      </button>
                      <div className="lesson-box px-5 pb-6">
                        <div className="ml-14 grid sm:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div>
                            ✓ AI Workflow Concepts
                          </div>
                          <div>
                            ✓ Repetitive Task Identification
                          </div>
                          <div>
                            ✓ Prompt Templates
                          </div>
                          <div>
                            ✓ Reusable AI Workflows
                          </div>
                          <div>
                            ✓ Content Workflow
                          </div>
                          <div>
                            ✓ Email Workflow
                          </div>
                          <div>
                            ✓ Research Workflow
                          </div>
                          <div>
                            ✓ Marketing Workflow
                          </div>
                          <div>
                            ✓ HR Workflow
                          </div>
                          <div>
                            ✓ Education Workflow
                          </div>
                          <div>
                            ✓ Business Workflow
                          </div>
                          <div>
                            ✓ AI Tool Integration Concepts
                          </div>
                          <div>
                            ✓ Automation Opportunities
                          </div>
                          <div>
                            ✓ Productivity System
                          </div>
                          <div>
                            ✓ AI-Assisted Daily Workflow
                          </div>
                          <div>
                            ✓ Workflow Documentation
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="course-module module">
                      <button type="button" data-inline-onclick="openModule(this)" className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition">
                        <div className="flex items-center gap-4 min-w-0">
                          <span className="shrink-0 w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black">
                            12
                          </span>
                          <div className="min-w-0">
                            <h3 className="font-bold text-gray-900">
                              Final Practical Project & Certification
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              Complete AI productivity project and assessment
                            </p>
                          </div>
                        </div>
                        <span className="lesson-arrow text-xl shrink-0 ml-4">
                          {" "}⌄{" "}
                        </span>
                      </button>
                      <div className="lesson-box px-5 pb-6">
                        <div className="ml-14 grid sm:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div>
                            ✓ Personal AI Assistant Setup
                          </div>
                          <div>
                            ✓ Professional Prompt Library
                          </div>
                          <div>
                            ✓ Content Creation Project
                          </div>
                          <div>
                            ✓ Business Prompt Project
                          </div>
                          <div>
                            ✓ Resume & Career Project
                          </div>
                          <div>
                            ✓ Research & Analysis Project
                          </div>
                          <div>
                            ✓ Document Analysis Task
                          </div>
                          <div>
                            ✓ Data Analysis Task
                          </div>
                          <div>
                            ✓ Marketing Content Campaign
                          </div>
                          <div>
                            ✓ Professional Email Workflow
                          </div>
                          <div>
                            ✓ AI Productivity Workflow
                          </div>
                          <div>
                            ✓ Prompt Optimization Task
                          </div>
                          <div>
                            ✓ Final Practical Assignment
                          </div>
                          <div>
                            ✓ Viva / Practical Test
                          </div>
                          <div>
                            ✓ Final Skill Assessment
                          </div>
                          <div>
                            ✓ Certificate Verification
                          </div>
                          <div>
                            ✓ Course Completion Certificate
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <aside className="hidden lg:block">
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 sticky top-24 shadow-sm">
                    <h3 className="font-black text-xl text-gray-900">
                      Course Includes
                    </h3>
                    <div className="space-y-5 mt-7">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-lg shrink-0">
                          🤖
                        </div>
                        <div>
                          <strong className="text-sm text-gray-900">
                            {" "}ChatGPT{" "}
                          </strong>
                          <p className="text-xs text-gray-500 mt-1">
                            Complete ChatGPT mastery
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-lg shrink-0">
                          ✍️
                        </div>
                        <div>
                          <strong className="text-sm text-gray-900">
                            {" "}Prompt Engineering{" "}
                          </strong>
                          <p className="text-xs text-gray-500 mt-1">
                            Basic to advanced prompting
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-lg shrink-0">
                          📝
                        </div>
                        <div>
                          <strong className="text-sm text-gray-900">
                            {" "}AI Content Creation{" "}
                          </strong>
                          <p className="text-xs text-gray-500 mt-1">
                            Content & professional writing
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-lg shrink-0">
                          ⚡
                        </div>
                        <div>
                          <strong className="text-sm text-gray-900">
                            {" "}AI Productivity{" "}
                          </strong>
                          <p className="text-xs text-gray-500 mt-1">
                            Office & daily workflows
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center text-lg shrink-0">
                          💼
                        </div>
                        <div>
                          <strong className="text-sm text-gray-900">
                            {" "}Business & Marketing{" "}
                          </strong>
                          <p className="text-xs text-gray-500 mt-1">
                            AI-powered business skills
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-lg shrink-0">
                          🎯
                        </div>
                        <div>
                          <strong className="text-sm text-gray-900">
                            {" "}Career Preparation{" "}
                          </strong>
                          <p className="text-xs text-gray-500 mt-1">
                            Resume & interview support
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-10 h-10 bg-cyan-50 rounded-lg flex items-center justify-center text-lg shrink-0">
                          📊
                        </div>
                        <div>
                          <strong className="text-sm text-gray-900">
                            {" "}Data & File Analysis{" "}
                          </strong>
                          <p className="text-xs text-gray-500 mt-1">
                            Documents & data workflows
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-lg shrink-0">
                          🏆
                        </div>
                        <div>
                          <strong className="text-sm text-gray-900">
                            {" "}Certificate{" "}
                          </strong>
                          <p className="text-xs text-gray-500 mt-1">
                            Certificate on successful completion
                          </p>
                        </div>
                      </div>
                    </div>
                    <a href="#admission" className="block text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl mt-8 transition duration-200 shadow-sm hover:shadow-md">
                      {" "}Enroll Now →{" "}
                    </a>
                  </div>
                </aside>
              </div>
            </div>
          </section>
          <style dangerouslySetInnerHTML={{ __html: css_d2424ca6 }} />
          <script dangerouslySetInnerHTML={{ __html: js_1547d5f8 }} />
          <section className="py-16 md:py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4">
              <div className="grid lg:grid-cols-2 gap-10 items-center">
                <div>
                  <span className="text-xs font-black uppercase tracking-[.2em] text-blue-600">
                    {" "}Bonus Skill{" "}
                  </span>
                  <h2 className="text-3xl md:text-4xl font-black mt-3">
                    Build Your Own{" "}
                    <span className="gradient-text">
                      {" "}AI Prompt Library{" "}
                    </span>
                  </h2>
                  <p className="mt-4 text-slate-600 leading-8">
                    Course के दौरान students practical और reusable prompts का अपना collection तैयार करेंगे जिसे वे future में study, career, business और productivity tasks में इस्तेमाल कर सकेंगे।
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3 mt-7">
                    <div className="p-4 rounded-xl bg-slate-50">
                      📧 Email Prompts
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50">
                      📱 Social Media Prompts
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50">
                      📚 Study Prompts
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50">
                      💼 Career Prompts
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50">
                      📊 Business Prompts
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50">
                      ⚡ Productivity Prompts
                    </div>
                  </div>
                </div>
                <div className="rounded-3xl bg-slate-950 p-6 md:p-8 text-white shadow-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center">
                      <i data-lucide="terminal" className="w-5 h-5"></i>
                    </div>
                    <div>
                      <p className="text-sm font-black">
                        Professional Prompt
                      </p>
                      <p className="text-xs text-slate-400">
                        Example Framework
                      </p>
                    </div>
                  </div>
                  <div className="font-mono text-sm leading-7 text-slate-300">
                    <p>
                      <span className="text-blue-400">
                        Role:
                      </span>
                      {" "}You are an expert...
                    </p>
                    <p>
                      <span className="text-blue-400">
                        Context:
                      </span>
                      {" "}My target audience is...
                    </p>
                    <p>
                      <span className="text-blue-400">
                        Task:
                      </span>
                      {" "}Create a...
                    </p>
                    <p>
                      <span className="text-blue-400">
                        Requirements:
                      </span>
                      {" "}Keep it clear...
                    </p>
                    <p>
                      <span className="text-blue-400">
                        Output:
                      </span>
                      {" "}Provide the result in...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="py-16 md:py-20 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4">
              <div className="text-center max-w-3xl mx-auto">
                <span className="text-xs font-black uppercase tracking-[.2em] text-blue-600">
                  {" "}Practical Projects{" "}
                </span>
                <h2 className="text-3xl md:text-4xl font-black mt-3">
                  Learn by{" "}
                  <span className="gradient-text">
                    {" "}Building{" "}
                  </span>
                </h2>
              </div>
              <div className="grid md:grid-cols-3 gap-5 mt-10">
                <div className="module-card p-6">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <i data-lucide="pen-line"></i>
                  </div>
                  <h3 className="text-lg font-black mt-5">
                    Project 01
                  </h3>
                  <h4 className="font-bold text-blue-600 mt-1">
                    AI Content Creator
                  </h4>
                  <p className="text-sm text-slate-500 leading-6 mt-3">
                    Topic research → Article → Social Posts → Video Script → Content Calendar
                  </p>
                </div>
                <div className="module-card p-6">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <i data-lucide="briefcase"></i>
                  </div>
                  <h3 className="text-lg font-black mt-5">
                    Project 02
                  </h3>
                  <h4 className="font-bold text-indigo-600 mt-1">
                    AI Career Assistant
                  </h4>
                  <p className="text-sm text-slate-500 leading-6 mt-3">
                    Resume + Cover Letter + Interview Preparation + Professional Email
                  </p>
                </div>
                <div className="module-card p-6">
                  <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                    <i data-lucide="building-2"></i>
                  </div>
                  <h3 className="text-lg font-black mt-5">
                    Project 03
                  </h3>
                  <h4 className="font-bold text-violet-600 mt-1">
                    AI Business Assistant
                  </h4>
                  <p className="text-sm text-slate-500 leading-6 mt-3">
                    Business Idea → Market Research → Marketing Plan → Customer Response System
                  </p>
                </div>
              </div>
            </div>
          </section>
          <section className="py-16 md:py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4">
              <div className="grid lg:grid-cols-2 gap-10">
                <div>
                  <span className="text-xs font-black uppercase tracking-[.2em] text-blue-600">
                    {" "}Course Outcome{" "}
                  </span>
                  <h2 className="text-3xl md:text-4xl font-black mt-3">
                    What You Will{" "}
                    <span className="gradient-text">
                      {" "}Learn{" "}
                    </span>
                  </h2>
                  <p className="mt-4 text-slate-600 leading-8">
                    Course पूरा करने के बाद student ChatGPT को confidently और practically use कर सकेगा।
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-slate-50 flex gap-3">
                    <span className="text-green-600">
                      ✓
                    </span>
                    ChatGPT confidently use करना
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 flex gap-3">
                    <span className="text-green-600">
                      ✓
                    </span>
                    Professional prompts लिखना
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 flex gap-3">
                    <span className="text-green-600">
                      ✓
                    </span>
                    Content creation
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 flex gap-3">
                    <span className="text-green-600">
                      ✓
                    </span>
                    Study & research
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 flex gap-3">
                    <span className="text-green-600">
                      ✓
                    </span>
                    Resume & interview
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 flex gap-3">
                    <span className="text-green-600">
                      ✓
                    </span>
                    Office productivity
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 flex gap-3">
                    <span className="text-green-600">
                      ✓
                    </span>
                    Business assistance
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 flex gap-3">
                    <span className="text-green-600">
                      ✓
                    </span>
                    AI workflow planning
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section id="certificate" className="py-16 md:py-20 bg-slate-50">
            <div className="max-w-5xl mx-auto px-4">
              <div className="rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-xl">
                <div className="p-7 md:p-10 text-center">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg">
                    <i data-lucide="award" className="w-8 h-8"></i>
                  </div>
                  <p className="text-xs font-black uppercase tracking-[.2em] text-blue-600 mt-6">
                    Certification
                  </p>
                  <h2 className="text-3xl md:text-4xl font-black mt-2">
                    Certificate in ChatGPT Mastery
                  </h2>
                  <p className="max-w-2xl mx-auto text-slate-500 leading-7 mt-4">
                    Successfully complete the course, practical activities and projects to receive your course completion certificate.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3 mt-7">
                    <span className="px-4 py-2 rounded-full bg-green-50 text-green-700 text-sm font-bold">
                      {" "}✓ Course Certificate{" "}
                    </span>
                    <span className="px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-bold">
                      {" "}✓ Practical Projects{" "}
                    </span>
                    <span className="px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm font-bold">
                      {" "}✓ Skill Based Learning{" "}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <script dangerouslySetInnerHTML={{ __html: js_6d157117 }} />
          <footer className="bg-slate-950 text-slate-300" data-cms-scope="footer">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="py-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white font-black text-xl">
                      P
                    </div>
                    <div>
                      <div className="font-black text-white text-lg">
                        Career Optics Computer Centre
                      </div>
                      <div className="text-xs text-slate-500">
                        Learn • Grow • Succeed
                      </div>
                    </div>
                  </div>
                  <p className="mt-5 text-slate-400 leading-7">
                    Computer education aur professional digital skills ke through students ko career-ready banana.
                  </p>
                  <div className="flex gap-3 mt-6">
                    <a href="#" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-blue-600 flex items-center justify-center transition">
                      <i data-lucide="facebook" className="w-5 h-5"></i>
                    </a>
                    <a href="#" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-pink-600 flex items-center justify-center transition">
                      <i data-lucide="instagram" className="w-5 h-5"></i>
                    </a>
                    <a href="#" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-red-600 flex items-center justify-center transition">
                      <i data-lucide="youtube" className="w-5 h-5"></i>
                    </a>
                    <a href="#" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-green-600 flex items-center justify-center transition">
                      <i data-lucide="message-circle" className="w-5 h-5"></i>
                    </a>
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">
                    Quick Links
                  </h3>
                  <ul className="mt-5 space-y-3">
                    <li>
                      <a href="index.html" className="hover:text-white transition">
                        {" "}Home{" "}
                      </a>
                    </li>
                    <li>
                      <a href="about.html" className="hover:text-white transition">
                        {" "}About Us{" "}
                      </a>
                    </li>
                    <li>
                      <a href="courses.html" className="hover:text-white transition">
                        {" "}Our Courses{" "}
                      </a>
                    </li>
                    <li>
                      <a href="franchise.html" className="hover:text-white transition">
                        {" "}Franchise{" "}
                      </a>
                    </li>
                    <li>
                      <a href="career.html" className="hover:text-white transition">
                        {" "}Career{" "}
                      </a>
                    </li>
                    <li>
                      <a href="contact.html" className="hover:text-white transition">
                        {" "}Contact{" "}
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">
                    Popular Courses
                  </h3>
                  <ul className="mt-5 space-y-3">
                    <li>
                      <a href="courses.html" className="hover:text-white transition">
                        {" "}ADCA{" "}
                      </a>
                    </li>
                    <li>
                      <a href="courses.html" className="hover:text-white transition">
                        {" "}Graphic Designing{" "}
                      </a>
                    </li>
                    <li>
                      <a href="courses.html" className="hover:text-white transition">
                        {" "}Tally Prime With GST{" "}
                      </a>
                    </li>
                    <li>
                      <a href="courses.html" className="hover:text-white transition">
                        {" "}Digital Marketing{" "}
                      </a>
                    </li>
                    <li>
                      <a href="courses.html" className="hover:text-white transition">
                        {" "}Website Design{" "}
                      </a>
                    </li>
                    <li>
                      <a href="courses.html" className="hover:text-white transition">
                        {" "}Python Programming{" "}
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">
                    Contact Information
                  </h3>
                  <div className="mt-5 space-y-5">
                    <div className="flex gap-3">
                      <i data-lucide="map-pin" className="w-5 h-5 text-blue-400 shrink-0">
                        {" "}
                      </i>
                      <span>
                        {" "}Career Optics Computer Centre,
                        <br />
                        Bihar, India{" "}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <i data-lucide="phone" className="w-5 h-5 text-blue-400 shrink-0">
                        {" "}
                      </i>
                      <a href="tel:+918252532179" className="hover:text-white">
                        {" "}+91 82525 32179{" "}
                      </a>
                    </div>
                    <div className="flex gap-3">
                      <i data-lucide="mail" className="w-5 h-5 text-blue-400 shrink-0">
                        {" "}
                      </i>
                      <a href="mailto:careeropticsconsultancy@gmail.com" className="hover:text-white">
                        {" "}careeropticsconsultancy@gmail.com{" "}
                      </a>
                    </div>
                    <div className="flex gap-3">
                      <i data-lucide="clock" className="w-5 h-5 text-blue-400 shrink-0">
                        {" "}
                      </i>
                      <span>
                        {" "}Mon – Sat
                        <br />
                        09:00 AM – 06:00 PM{" "}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="border-t border-white/10 py-6 flex flex-col md:flex-row justify-between items-center gap-3 text-sm">
                <p>
                  <span id="year"></span>
                  {" "}© 2026 Career Optics Computer Centre
                </p>
              </div>
            </div>
          </footer>
          <div id="whatsappWidget" className="fixed bottom-5 right-5 z-[99999] font-sans">
            <div id="whatsappPanel" className="hidden absolute bottom-[75px] right-0 w-[350px] max-w-[calc(100vw-30px)] overflow-hidden rounded-2xl bg-white shadow-[0_15px_50px_rgba(0,0,0,.25)] border border-gray-200 origin-bottom-right transition-all duration-300">
              <div className="bg-[#075E54] px-4 py-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img src="/logo.webp" alt="Support" className="h-11 w-11 rounded-full border-2 border-white object-cover bg-white" />
                      {" "}
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#075E54] bg-[#25D366]">
                        {" "}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold">
                        Support Team
                      </h3>
                      <p className="text-[10px] text-green-100">
                        ● Typically replies instantly
                      </p>
                    </div>
                  </div>
                  <button id="closeWhatsapp" className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10 text-xl">
                    ×
                  </button>
                </div>
              </div>
              <div className="bg-[#efeae2] px-3 py-4">
                <p className="mb-2 px-1 text-[11px] font-semibold text-gray-500">
                  Choose a department
                </p>
                <div className="space-y-2">
                  <button className="wa-department flex w-full items-center gap-3 rounded-xl bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" data-number="918252532179" data-message="Hello, I want information about admission and courses.">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                      A
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-gray-800">
                        Admission
                      </h4>
                      <p className="text-[10px] text-gray-500">
                        Course & admission enquiry
                      </p>
                    </div>
                    <span className="text-[#25D366]">
                      {" "}→{" "}
                    </span>
                  </button>
                  {" "}
                  {" "}
                  <button className="wa-department flex w-full items-center gap-3 rounded-xl bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" data-number="918252532179" data-message="Hello, I want information about fees and payment.">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
                      ₹
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-gray-800">
                        Fees & Accounts
                      </h4>
                      <p className="text-[10px] text-gray-500">
                        Fees & payment enquiry
                      </p>
                    </div>
                    <span className="text-[#25D366]">
                      {" "}→{" "}
                    </span>
                  </button>
                  {" "}
                  {" "}
                  <button className="wa-department flex w-full items-center gap-3 rounded-xl bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" data-number="918252532179" data-message="Hello, I need technical support.">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-600">
                      S
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-gray-800">
                        Career Counseling
                      </h4>
                      <p className="text-[10px] text-gray-500">
                        Job Placement & Internship
                      </p>
                    </div>
                    <span className="text-[#25D366]">
                      {" "}→{" "}
                    </span>
                  </button>
                  {" "}
                  {" "}
                  <button className="wa-department flex w-full items-center gap-3 rounded-xl bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" data-number="918252532179" data-message="Hello, I need technical support.">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-600">
                      S
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-gray-800">
                        Technical Support
                      </h4>
                      <p className="text-[10px] text-gray-500">
                        Technical help & support
                      </p>
                    </div>
                    <span className="text-[#25D366]">
                      {" "}→{" "}
                    </span>
                  </button>
                  {" "}
                  {" "}
                  <button className="wa-department flex w-full items-center gap-3 rounded-xl bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" data-number="918252532179" data-message="Hello, I am interested in franchise.">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-600">
                      F
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-gray-800">
                        Franchise
                      </h4>
                      <p className="text-[10px] text-gray-500">
                        Franchise enquiry
                      </p>
                    </div>
                    <span className="text-[#25D366]">
                      {" "}→{" "}
                    </span>
                  </button>
                </div>
              </div>
              <div className="border-t bg-white px-3 py-2 text-center">
                <p className="text-[9px] text-gray-400">
                  Powered by WhatsApp
                </p>
              </div>
            </div>
            <button id="whatsappButton" aria-label="WhatsApp Chat" className="group relative flex h-[62px] w-[62px] items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_30px_rgba(37,211,102,.45)] transition-all duration-300 hover:scale-110 hover:bg-[#20bd5a]">
              <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20">
                {" "}
              </span>
              <svg viewBox="0 0 32 32" className="relative z-10 h-9 w-9 fill-white" aria-hidden="true">
                <path d="M19.11 17.08c-.27-.14-1.59-.78-1.84-.87 -.25-.09-.43-.14-.61.14 -.18.27-.7.87-.86 1.04 -.16.18-.32.2-.59.07 -.27-.14-1.12-.41-2.13-1.31 -.79-.7-1.32-1.57-1.47-1.84 -.16-.27-.02-.42.12-.56 .12-.12.27-.32.41-.48 .14-.16.18-.27.27-.45 .09-.18.05-.34-.02-.48 -.07-.14-.61-1.47-.84-2.01 -.22-.53-.45-.46-.61-.47 -.16-.01-.34-.01-.52-.01 -.18 0-.48.07-.73.34 -.25.27-.95.93-.95 2.27 0 1.34.98 2.63 1.11 2.81 .14.18 1.92 2.93 4.65 4.11 .65.28 1.16.45 1.56.58 .66.21 1.26.18 1.73.11 .53-.08 1.59-.65 1.81-1.28 .22-.63.22-1.17.16-1.28 -.07-.11-.25-.18-.52-.32z"></path>
                {" "}
                <path d="M16 3.2C8.93 3.2 3.2 8.93 3.2 16 c0 2.26.59 4.38 1.63 6.22L3 29 l6.98-1.83A12.73 12.73 0 0 0 16 28.8 c7.07 0 12.8-5.73 12.8-12.8 S23.07 3.2 16 3.2zm0 23.35 c-2.01 0-3.88-.58-5.46-1.58 l-.39-.24-4.14 1.08 1.1-4.03 -.26-.41A10.55 10.55 0 1 1 16 26.55z"></path>
              </svg>
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 text-[9px] font-bold">
                1
              </span>
            </button>
          </div>
          <script dangerouslySetInnerHTML={{ __html: js_c1268ab4 }} />
          <style dangerouslySetInnerHTML={{ __html: css_33049102 }} />
          <div className="modern-call-wrapper">
            <div className="call-popup" id="callPopup">
              <div className="call-popup-header">
                <div className="call-icon-small">
                  <svg viewBox="0 0 24 24">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67 A2 2 0 0 1 4.11 2h3 a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91 a16 16 0 0 0 6 6l1.27-1.27 a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </div>
                <div>
                  <p className="call-popup-title">
                    Need Help?
                  </p>
                  <div className="call-popup-subtitle">
                    Our team is ready to help
                  </div>
                </div>
              </div>
              <div className="call-number">
                📞 7519884465
              </div>
              <a href="tel:+918252532179" className="call-now">
                <svg viewBox="0 0 24 24">
                  <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67 A2 2 0 0 1 4.11 2h3 a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91 a16 16 0 0 0 6 6l1.27-1.27 a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 A2 2 0 0 1 22 16.92z"></path>
                </svg>
                Call Now{" "}
              </a>
            </div>
            <button type="button" className="modern-call-btn" id="callButton" aria-label="Call us">
              <svg viewBox="0 0 24 24">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67 A2 2 0 0 1 4.11 2h3 a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91 a16 16 0 0 0 6 6l1.27-1.27 a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <span className="call-online-dot"></span>
              {" "}
            </button>
          </div>
          <script dangerouslySetInnerHTML={{ __html: js_ea05b2d5 }} />
          <script src="https://unpkg.com/typed.js@2.0.16/dist/typed.umd.js"></script>
          <script src="js/script.js"></script>
          <script src="https://cdn.tailwindcss.com"></script>
        </main>
      </body>
    </html>
  );
}
