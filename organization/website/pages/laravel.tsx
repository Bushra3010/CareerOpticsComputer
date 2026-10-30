import css_1d30d032 from "../styles/1d30d032.css?raw";
import js_75830f0c from "../behaviour/75830f0c.js?raw";
import js_dfceff2f from "../behaviour/dfceff2f.js?raw";

/** laravel.html */
export default function Laravel() {
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
          Laravel Web Development Course | Career Optics Computer Centre
        </title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script dangerouslySetInnerHTML={{ __html: js_75830f0c }} />
        <style dangerouslySetInnerHTML={{ __html: css_1d30d032 }} />
        <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
          <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-16 flex items-center justify-between">
              <a href="#" className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-lg">
                  P
                </div>
                <div>
                  <div className="font-black text-lg text-slate-900">
                    Career Optics Computer Centre
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-slate-500">
                    Professional Training Institute
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
                <a href="#admission" className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition">
                  {" "}Apply Now{" "}
                </a>
              </nav>
              <button data-inline-onclick="toggleMenu()" className="lg:hidden w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>
            </div>
            <div id="mobileMenu" className="mobile-menu lg:hidden pb-5">
              <div className="border-t border-slate-100 pt-4 space-y-2">
                <a href="#overview" data-inline-onclick="toggleMenu()" className="block px-4 py-3 rounded-xl hover:bg-slate-50">
                  {" "}Overview{" "}
                </a>
                {" "}
                <a href="#syllabus" data-inline-onclick="toggleMenu()" className="block px-4 py-3 rounded-xl hover:bg-slate-50">
                  {" "}Syllabus{" "}
                </a>
                {" "}
                <a href="#projects" data-inline-onclick="toggleMenu()" className="block px-4 py-3 rounded-xl hover:bg-slate-50">
                  {" "}Projects{" "}
                </a>
                {" "}
                <a href="#career" data-inline-onclick="toggleMenu()" className="block px-4 py-3 rounded-xl hover:bg-slate-50">
                  {" "}Career{" "}
                </a>
                {" "}
                <a href="#admission" data-inline-onclick="toggleMenu()" className="block px-4 py-3 rounded-xl bg-indigo-600 text-white text-center font-bold">
                  {" "}Apply Now{" "}
                </a>
              </div>
            </div>
          </div>
        </header>
        <div className="bg-white border-b border-slate-100 sticky top-16 z-40">
          <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-6 overflow-x-auto whitespace-nowrap text-sm font-semibold py-3">
              <a href="#overview" className="text-indigo-600">
                {" "}Overview{" "}
              </a>
              <a href="#syllabus" className="hover:text-indigo-600">
                {" "}Syllabus{" "}
              </a>
              <a href="#projects" className="hover:text-indigo-600">
                {" "}Projects{" "}
              </a>
              <a href="#career" className="hover:text-indigo-600">
                {" "}Career{" "}
              </a>
              <a href="#admission" className="hover:text-indigo-600">
                {" "}Admission{" "}
              </a>
              <a href="#faq" className="hover:text-indigo-600">
                {" "}FAQ{" "}
              </a>
            </div>
          </div>
        </div>
        <section className="hero-bg text-white">
          <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="min-h-[600px] py-20 lg:py-24 grid lg:grid-cols-[1.25fr_.75fr] gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-4 py-2 text-sm mb-6">
                  <span className="w-2 h-2 bg-green-300 rounded-full"></span>
                  Professional Web Development Program
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6">
                  Laravel Web Development{" "}
                  <span className="block text-white/80">
                    {" "}Beginner to Professional{" "}
                  </span>
                </h1>
                <p className="text-lg lg:text-xl text-white/85 max-w-3xl leading-relaxed mb-8">
                  Learn PHP, Laravel Framework, MySQL, REST APIs, Authentication, CRUD, Admin Panels and build professional real-world web applications.
                </p>
                <div className="flex flex-wrap gap-2 mb-8">
                  <span className="px-4 py-2 rounded-full bg-white/15 border border-white/20 text-sm">
                    {" "}PHP{" "}
                  </span>
                  <span className="px-4 py-2 rounded-full bg-white/15 border border-white/20 text-sm">
                    {" "}Laravel{" "}
                  </span>
                  <span className="px-4 py-2 rounded-full bg-white/15 border border-white/20 text-sm">
                    {" "}MySQL{" "}
                  </span>
                  <span className="px-4 py-2 rounded-full bg-white/15 border border-white/20 text-sm">
                    {" "}REST API{" "}
                  </span>
                  <span className="px-4 py-2 rounded-full bg-white/15 border border-white/20 text-sm">
                    {" "}Git & GitHub{" "}
                  </span>
                  <span className="px-4 py-2 rounded-full bg-white/15 border border-white/20 text-sm">
                    {" "}Bootstrap / Tailwind{" "}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4">
                  <a href="#admission" className="px-7 py-3.5 bg-white text-indigo-700 rounded-xl font-bold hover:bg-slate-100 transition shadow-lg">
                    {" "}Apply Now{" "}
                  </a>
                  <a href="#syllabus" className="px-7 py-3.5 bg-white/10 border border-white/30 rounded-xl font-bold hover:bg-white/20 transition">
                    {" "}View Syllabus{" "}
                  </a>
                </div>
              </div>
              <div className="bg-white text-slate-900 rounded-3xl p-7 lg:p-8 shadow-2xl">
                <div className="text-sm font-semibold text-slate-500 mb-2">
                  Course Fee
                </div>
                <div className="flex items-end gap-3 mb-5">
                  <div className="text-4xl font-black">
                    ₹18,000
                  </div>
                  <div className="text-slate-400 line-through mb-1">
                    ₹30,000
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-slate-50 rounded-2xl p-4">
                    <div className="text-xs text-slate-500">
                      Duration
                    </div>
                    <div className="font-bold mt-1">
                      6 Months
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-4">
                    <div className="text-xs text-slate-500">
                      Projects
                    </div>
                    <div className="font-bold mt-1">
                      8+ Live
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-4">
                    <div className="text-xs text-slate-500">
                      Mode
                    </div>
                    <div className="font-bold mt-1">
                      Online / Offline
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-4">
                    <div className="text-xs text-slate-500">
                      Certificate
                    </div>
                    <div className="font-bold mt-1">
                      Yes
                    </div>
                  </div>
                </div>
                <a href="#admission" className="block text-center w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition">
                  {" "}Start Your Laravel Journey{" "}
                </a>
                <p className="text-center text-xs text-slate-500 mt-4">
                  Limited seats available for upcoming batch
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="overview" className="py-20">
          <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-12">
              <span className="text-indigo-600 font-bold text-sm uppercase tracking-wider">
                {" "}Course Overview{" "}
              </span>
              <h2 className="text-3xl lg:text-4xl font-black mt-3 mb-5">
                Become a Professional Laravel Developer
              </h2>
              <p className="text-slate-600 leading-8">
                This practical Laravel Web Development course is designed to take students from PHP fundamentals to professional Laravel application development. You will learn MVC, database management, authentication, APIs, admin panels, deployment and real-world project development.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-3xl p-7 shadow-soft border border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
                  <span className="font-black text-xl">
                    01
                  </span>
                </div>
                <h3 className="font-black text-xl mb-3">
                  Laravel Development
                </h3>
                <p className="text-slate-600 leading-7 text-sm">
                  Learn Laravel MVC architecture, routing, controllers, Blade templates, middleware and application structure.
                </p>
              </div>
              <div className="bg-white rounded-3xl p-7 shadow-soft border border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-5">
                  <span className="font-black text-xl">
                    02
                  </span>
                </div>
                <h3 className="font-black text-xl mb-3">
                  Database & API
                </h3>
                <p className="text-slate-600 leading-7 text-sm">
                  Work with MySQL, migrations, Eloquent ORM, CRUD, relationships and REST API development.
                </p>
              </div>
              <div className="bg-white rounded-3xl p-7 shadow-soft border border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center mb-5">
                  <span className="font-black text-xl">
                    03
                  </span>
                </div>
                <h3 className="font-black text-xl mb-3">
                  Live Projects
                </h3>
                <p className="text-slate-600 leading-7 text-sm">
                  Build professional business websites, dashboards, authentication systems and complete Laravel projects.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="py-20 bg-white">
          <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12">
              <div>
                <span className="text-indigo-600 font-bold text-sm uppercase tracking-wider">
                  {" "}What You Will Learn{" "}
                </span>
                <h2 className="text-3xl lg:text-4xl font-black mt-3 mb-8">
                  Skills You Will Build
                </h2>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-7 h-7 rounded-full bg-green-100 text-green-600 flex-shrink-0 flex items-center justify-center font-bold">
                      ✓
                    </div>
                    <p>
                      Build dynamic websites using PHP and Laravel.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-7 h-7 rounded-full bg-green-100 text-green-600 flex-shrink-0 flex items-center justify-center font-bold">
                      ✓
                    </div>
                    <p>
                      Develop database-driven applications with MySQL.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-7 h-7 rounded-full bg-green-100 text-green-600 flex-shrink-0 flex items-center justify-center font-bold">
                      ✓
                    </div>
                    <p>
                      Create secure login and authentication systems.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-7 h-7 rounded-full bg-green-100 text-green-600 flex-shrink-0 flex items-center justify-center font-bold">
                      ✓
                    </div>
                    <p>
                      Build REST APIs and connect frontend applications.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-7 h-7 rounded-full bg-green-100 text-green-600 flex-shrink-0 flex items-center justify-center font-bold">
                      ✓
                    </div>
                    <p>
                      Deploy Laravel applications on hosting servers.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 rounded-3xl p-8">
                <h3 className="font-black text-2xl mb-6">
                  Tools & Technologies
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="bg-white rounded-2xl p-5 text-center shadow-sm">
                    HTML5
                  </div>
                  <div className="bg-white rounded-2xl p-5 text-center shadow-sm">
                    CSS3
                  </div>
                  <div className="bg-white rounded-2xl p-5 text-center shadow-sm">
                    JavaScript
                  </div>
                  <div className="bg-white rounded-2xl p-5 text-center shadow-sm">
                    PHP
                  </div>
                  <div className="bg-white rounded-2xl p-5 text-center shadow-sm">
                    Laravel
                  </div>
                  <div className="bg-white rounded-2xl p-5 text-center shadow-sm">
                    MySQL
                  </div>
                  <div className="bg-white rounded-2xl p-5 text-center shadow-sm">
                    Git
                  </div>
                  <div className="bg-white rounded-2xl p-5 text-center shadow-sm">
                    GitHub
                  </div>
                  <div className="bg-white rounded-2xl p-5 text-center shadow-sm">
                    REST API
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="syllabus" className="py-20">
          <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <span className="text-indigo-600 font-bold text-sm uppercase tracking-wider">
                {" "}Complete Curriculum{" "}
              </span>
              <h2 className="text-3xl lg:text-4xl font-black mt-3">
                Laravel Web Development Syllabus
              </h2>
              <p className="text-slate-600 mt-4">
                Click any module to view detailed syllabus.
              </p>
            </div>
            <div className="mb-8">
              <div className="mb-4">
                <h3 className="text-xl font-black">
                  PART A — WEB & PHP FOUNDATION
                </h3>
                <p className="text-sm text-slate-500">
                  Build a strong foundation before starting Laravel.
                </p>
              </div>
              <div className="space-y-3">
                <div className="accordion-item bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full p-5 flex items-center justify-between text-left">
                    <span className="font-bold">
                      {" "}01. Web Development Fundamentals{" "}
                    </span>
                    <span className="arrow">
                      ⌄
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5 text-sm text-slate-600">
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        Introduction to Web Development
                      </li>
                      <li>
                        Client Side vs Server Side
                      </li>
                      <li>
                        Web Browser and Web Server
                      </li>
                      <li>
                        Domain and Hosting Basics
                      </li>
                      <li>
                        HTTP and HTTPS
                      </li>
                      <li>
                        Frontend and Backend Concepts
                      </li>
                      <li>
                        Introduction to Dynamic Websites
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full p-5 flex items-center justify-between text-left">
                    <span className="font-bold">
                      {" "}02. HTML5 Fundamentals{" "}
                    </span>
                    <span className="arrow">
                      ⌄
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5 text-sm text-slate-600">
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        HTML Document Structure
                      </li>
                      <li>
                        Headings, Paragraphs and Links
                      </li>
                      <li>
                        Images, Audio and Video
                      </li>
                      <li>
                        Tables and Lists
                      </li>
                      <li>
                        Forms and Input Controls
                      </li>
                      <li>
                        Semantic HTML
                      </li>
                      <li>
                        HTML5 Best Practices
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full p-5 flex items-center justify-between text-left">
                    <span className="font-bold">
                      {" "}03. CSS3 & Responsive Design{" "}
                    </span>
                    <span className="arrow">
                      ⌄
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5 text-sm text-slate-600">
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        CSS Selectors
                      </li>
                      <li>
                        Colors and Typography
                      </li>
                      <li>
                        Box Model
                      </li>
                      <li>
                        Flexbox
                      </li>
                      <li>
                        CSS Grid
                      </li>
                      <li>
                        Responsive Design
                      </li>
                      <li>
                        Media Queries
                      </li>
                      <li>
                        Bootstrap / Tailwind CSS Basics
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full p-5 flex items-center justify-between text-left">
                    <span className="font-bold">
                      {" "}04. JavaScript Fundamentals{" "}
                    </span>
                    <span className="arrow">
                      ⌄
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5 text-sm text-slate-600">
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        Variables and Data Types
                      </li>
                      <li>
                        Operators
                      </li>
                      <li>
                        Functions
                      </li>
                      <li>
                        Arrays and Objects
                      </li>
                      <li>
                        Conditions and Loops
                      </li>
                      <li>
                        DOM Manipulation
                      </li>
                      <li>
                        Events
                      </li>
                      <li>
                        Form Validation
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full p-5 flex items-center justify-between text-left">
                    <span className="font-bold">
                      {" "}05. PHP Programming Fundamentals{" "}
                    </span>
                    <span className="arrow">
                      ⌄
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5 text-sm text-slate-600">
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        PHP Installation and Setup
                      </li>
                      <li>
                        PHP Syntax
                      </li>
                      <li>
                        Variables and Constants
                      </li>
                      <li>
                        Operators
                      </li>
                      <li>
                        Conditional Statements
                      </li>
                      <li>
                        Loops
                      </li>
                      <li>
                        Functions
                      </li>
                      <li>
                        Arrays
                      </li>
                      <li>
                        String Handling
                      </li>
                      <li>
                        GET and POST
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full p-5 flex items-center justify-between text-left">
                    <span className="font-bold">
                      {" "}06. Advanced PHP & OOP{" "}
                    </span>
                    <span className="arrow">
                      ⌄
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5 text-sm text-slate-600">
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        Object Oriented Programming
                      </li>
                      <li>
                        Classes and Objects
                      </li>
                      <li>
                        Constructors
                      </li>
                      <li>
                        Inheritance
                      </li>
                      <li>
                        Encapsulation
                      </li>
                      <li>
                        Interfaces and Traits
                      </li>
                      <li>
                        Exception Handling
                      </li>
                      <li>
                        Sessions and Cookies
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="mb-8">
              <div className="mb-4">
                <h3 className="text-xl font-black">
                  PART B — LARAVEL FOUNDATION
                </h3>
                <p className="text-sm text-slate-500">
                  Learn the Laravel framework and MVC architecture.
                </p>
              </div>
              <div className="space-y-3">
                <div className="accordion-item bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full p-5 flex items-center justify-between text-left">
                    <span className="font-bold">
                      {" "}07. Introduction to Laravel{" "}
                    </span>
                    <span className="arrow">
                      ⌄
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5 text-sm text-slate-600">
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        What is Laravel?
                      </li>
                      <li>
                        Laravel Features
                      </li>
                      <li>
                        Laravel Installation
                      </li>
                      <li>
                        Composer
                      </li>
                      <li>
                        Laravel Project Structure
                      </li>
                      <li>
                        .env Configuration
                      </li>
                      <li>
                        Artisan Command
                      </li>
                      <li>
                        Local Development Environment
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full p-5 flex items-center justify-between text-left">
                    <span className="font-bold">
                      {" "}08. MVC Architecture{" "}
                    </span>
                    <span className="arrow">
                      ⌄
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5 text-sm text-slate-600">
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        MVC Architecture
                      </li>
                      <li>
                        Models
                      </li>
                      <li>
                        Views
                      </li>
                      <li>
                        Controllers
                      </li>
                      <li>
                        Request Flow
                      </li>
                      <li>
                        Application Structure
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full p-5 flex items-center justify-between text-left">
                    <span className="font-bold">
                      {" "}09. Routing & Controllers{" "}
                    </span>
                    <span className="arrow">
                      ⌄
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5 text-sm text-slate-600">
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        Basic Routes
                      </li>
                      <li>
                        Route Parameters
                      </li>
                      <li>
                        Named Routes
                      </li>
                      <li>
                        Route Groups
                      </li>
                      <li>
                        Resource Controllers
                      </li>
                      <li>
                        Request Handling
                      </li>
                      <li>
                        Redirects
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full p-5 flex items-center justify-between text-left">
                    <span className="font-bold">
                      {" "}10. Blade Template Engine{" "}
                    </span>
                    <span className="arrow">
                      ⌄
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5 text-sm text-slate-600">
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        Blade Templates
                      </li>
                      <li>
                        Template Inheritance
                      </li>
                      <li>
                        Layouts
                      </li>
                      <li>
                        Sections
                      </li>
                      <li>
                        Components
                      </li>
                      <li>
                        Blade Directives
                      </li>
                      <li>
                        Loops and Conditions
                      </li>
                      <li>
                        Form Integration
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full p-5 flex items-center justify-between text-left">
                    <span className="font-bold">
                      {" "}11. Forms & Validation{" "}
                    </span>
                    <span className="arrow">
                      ⌄
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5 text-sm text-slate-600">
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        Laravel Forms
                      </li>
                      <li>
                        Request Validation
                      </li>
                      <li>
                        Custom Validation Rules
                      </li>
                      <li>
                        Error Messages
                      </li>
                      <li>
                        CSRF Protection
                      </li>
                      <li>
                        File Upload
                      </li>
                      <li>
                        Image Upload
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full p-5 flex items-center justify-between text-left">
                    <span className="font-bold">
                      {" "}12. Database & MySQL{" "}
                    </span>
                    <span className="arrow">
                      ⌄
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5 text-sm text-slate-600">
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        MySQL Database
                      </li>
                      <li>
                        Database Configuration
                      </li>
                      <li>
                        Tables and Fields
                      </li>
                      <li>
                        Primary Keys
                      </li>
                      <li>
                        Indexes
                      </li>
                      <li>
                        Database Relationships
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="mb-8">
              <div className="mb-4">
                <h3 className="text-xl font-black">
                  PART C — ADVANCED LARAVEL DEVELOPMENT
                </h3>
                <p className="text-sm text-slate-500">
                  Develop complete database-driven applications.
                </p>
              </div>
              <div className="space-y-3">
                <div className="accordion-item bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full p-5 flex items-center justify-between text-left">
                    <span className="font-bold">
                      {" "}13. Migrations & Seeders{" "}
                    </span>
                    <span className="arrow">
                      ⌄
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5 text-sm text-slate-600">
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        Database Migrations
                      </li>
                      <li>
                        Create and Modify Tables
                      </li>
                      <li>
                        Migration Rollback
                      </li>
                      <li>
                        Database Seeders
                      </li>
                      <li>
                        Factory
                      </li>
                      <li>
                        Dummy Data Generation
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full p-5 flex items-center justify-between text-left">
                    <span className="font-bold">
                      {" "}14. Eloquent ORM{" "}
                    </span>
                    <span className="arrow">
                      ⌄
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5 text-sm text-slate-600">
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        Eloquent Models
                      </li>
                      <li>
                        Insert Data
                      </li>
                      <li>
                        Update Data
                      </li>
                      <li>
                        Delete Data
                      </li>
                      <li>
                        Query Builder
                      </li>
                      <li>
                        Filtering and Sorting
                      </li>
                      <li>
                        Pagination
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full p-5 flex items-center justify-between text-left">
                    <span className="font-bold">
                      {" "}15. CRUD Application{" "}
                    </span>
                    <span className="arrow">
                      ⌄
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5 text-sm text-slate-600">
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        Create Records
                      </li>
                      <li>
                        Read Records
                      </li>
                      <li>
                        Update Records
                      </li>
                      <li>
                        Delete Records
                      </li>
                      <li>
                        Search System
                      </li>
                      <li>
                        Pagination
                      </li>
                      <li>
                        Image Upload
                      </li>
                      <li>
                        Complete CRUD Project
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full p-5 flex items-center justify-between text-left">
                    <span className="font-bold">
                      {" "}16. Authentication & Authorization{" "}
                    </span>
                    <span className="arrow">
                      ⌄
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5 text-sm text-slate-600">
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        User Registration
                      </li>
                      <li>
                        Login and Logout
                      </li>
                      <li>
                        Password Security
                      </li>
                      <li>
                        Authentication
                      </li>
                      <li>
                        Authorization
                      </li>
                      <li>
                        Roles and Permissions
                      </li>
                      <li>
                        Protected Routes
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full p-5 flex items-center justify-between text-left">
                    <span className="font-bold">
                      {" "}17. Middleware & Security{" "}
                    </span>
                    <span className="arrow">
                      ⌄
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5 text-sm text-slate-600">
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        Middleware
                      </li>
                      <li>
                        Custom Middleware
                      </li>
                      <li>
                        Route Protection
                      </li>
                      <li>
                        CSRF
                      </li>
                      <li>
                        SQL Injection Prevention
                      </li>
                      <li>
                        XSS Protection
                      </li>
                      <li>
                        Secure Password Handling
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full p-5 flex items-center justify-between text-left">
                    <span className="font-bold">
                      {" "}18. Laravel REST API{" "}
                    </span>
                    <span className="arrow">
                      ⌄
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5 text-sm text-slate-600">
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        What is REST API?
                      </li>
                      <li>
                        API Routes
                      </li>
                      <li>
                        JSON Response
                      </li>
                      <li>
                        API Controllers
                      </li>
                      <li>
                        API Resources
                      </li>
                      <li>
                        CRUD API
                      </li>
                      <li>
                        API Authentication
                      </li>
                      <li>
                        Postman Testing
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="mb-4">
                <h3 className="text-xl font-black">
                  PART D — PROFESSIONAL PROJECTS & DEPLOYMENT
                </h3>
                <p className="text-sm text-slate-500">
                  Turn your Laravel skills into professional projects.
                </p>
              </div>
              <div className="space-y-3">
                <div className="accordion-item bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full p-5 flex items-center justify-between text-left">
                    <span className="font-bold">
                      {" "}19. Admin Panel Development{" "}
                    </span>
                    <span className="arrow">
                      ⌄
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5 text-sm text-slate-600">
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        Admin Dashboard
                      </li>
                      <li>
                        Sidebar Navigation
                      </li>
                      <li>
                        User Management
                      </li>
                      <li>
                        Role Management
                      </li>
                      <li>
                        Category Management
                      </li>
                      <li>
                        Data Tables
                      </li>
                      <li>
                        Search and Filters
                      </li>
                      <li>
                        Dashboard Statistics
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full p-5 flex items-center justify-between text-left">
                    <span className="font-bold">
                      {" "}20. Advanced Laravel Features{" "}
                    </span>
                    <span className="arrow">
                      ⌄
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5 text-sm text-slate-600">
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        Events and Listeners
                      </li>
                      <li>
                        Queues and Jobs
                      </li>
                      <li>
                        Mail Integration
                      </li>
                      <li>
                        Notifications
                      </li>
                      <li>
                        File Storage
                      </li>
                      <li>
                        Task Scheduling
                      </li>
                      <li>
                        Logging
                      </li>
                      <li>
                        Caching Basics
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full p-5 flex items-center justify-between text-left">
                    <span className="font-bold">
                      {" "}21. Git, GitHub & Version Control{" "}
                    </span>
                    <span className="arrow">
                      ⌄
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5 text-sm text-slate-600">
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        Git Installation
                      </li>
                      <li>
                        Repository Creation
                      </li>
                      <li>
                        Commit
                      </li>
                      <li>
                        Branch
                      </li>
                      <li>
                        Merge
                      </li>
                      <li>
                        Push and Pull
                      </li>
                      <li>
                        GitHub Repository
                      </li>
                      <li>
                        Project Collaboration
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full p-5 flex items-center justify-between text-left">
                    <span className="font-bold">
                      {" "}22. Professional Business Website Project{" "}
                    </span>
                    <span className="arrow">
                      ⌄
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5 text-sm text-slate-600">
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        Business Website Planning
                      </li>
                      <li>
                        Database Design
                      </li>
                      <li>
                        Admin Panel
                      </li>
                      <li>
                        Contact Management
                      </li>
                      <li>
                        Content Management
                      </li>
                      <li>
                        Authentication
                      </li>
                      <li>
                        Responsive UI
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full p-5 flex items-center justify-between text-left">
                    <span className="font-bold">
                      {" "}23. Laravel Management System Project{" "}
                    </span>
                    <span className="arrow">
                      ⌄
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5 text-sm text-slate-600">
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        Student Management System
                      </li>
                      <li>
                        Enquiry Management
                      </li>
                      <li>
                        Lead Management
                      </li>
                      <li>
                        User Management
                      </li>
                      <li>
                        Reports
                      </li>
                      <li>
                        Admin Dashboard
                      </li>
                      <li>
                        Database Integration
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full p-5 flex items-center justify-between text-left">
                    <span className="font-bold">
                      {" "}24. Deployment & Final Laravel Project{" "}
                    </span>
                    <span className="arrow">
                      ⌄
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5 text-sm text-slate-600">
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        Production Environment
                      </li>
                      <li>
                        Hosting Setup
                      </li>
                      <li>
                        Domain Configuration
                      </li>
                      <li>
                        Database Deployment
                      </li>
                      <li>
                        Environment Variables
                      </li>
                      <li>
                        Laravel Storage Link
                      </li>
                      <li>
                        Application Optimization
                      </li>
                      <li>
                        Final Live Project
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="projects" className="py-20 bg-white">
          <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-12">
              <span className="text-indigo-600 font-bold text-sm uppercase tracking-wider">
                {" "}Practical Training{" "}
              </span>
              <h2 className="text-3xl lg:text-4xl font-black mt-3">
                8+ Live Laravel Projects
              </h2>
              <p className="text-slate-600 mt-4">
                Build portfolio-ready applications during the course.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-slate-50 rounded-3xl p-6">
                <span className="text-indigo-600 font-bold">
                  01
                </span>
                <h3 className="font-black text-lg mt-3">
                  Business Website
                </h3>
                <p className="text-sm text-slate-600 mt-2">
                  Dynamic company website with admin panel.
                </p>
              </div>
              <div className="bg-slate-50 rounded-3xl p-6">
                <span className="text-indigo-600 font-bold">
                  02
                </span>
                <h3 className="font-black text-lg mt-3">
                  Student Management
                </h3>
                <p className="text-sm text-slate-600 mt-2">
                  Student records, courses and reports.
                </p>
              </div>
              <div className="bg-slate-50 rounded-3xl p-6">
                <span className="text-indigo-600 font-bold">
                  03
                </span>
                <h3 className="font-black text-lg mt-3">
                  Admin Dashboard
                </h3>
                <p className="text-sm text-slate-600 mt-2">
                  Complete dashboard with users and reports.
                </p>
              </div>
              <div className="bg-slate-50 rounded-3xl p-6">
                <span className="text-indigo-600 font-bold">
                  04
                </span>
                <h3 className="font-black text-lg mt-3">
                  Authentication System
                </h3>
                <p className="text-sm text-slate-600 mt-2">
                  Registration, login, roles and permissions.
                </p>
              </div>
              <div className="bg-slate-50 rounded-3xl p-6">
                <span className="text-indigo-600 font-bold">
                  05
                </span>
                <h3 className="font-black text-lg mt-3">
                  Enquiry Management
                </h3>
                <p className="text-sm text-slate-600 mt-2">
                  Lead and enquiry management application.
                </p>
              </div>
              <div className="bg-slate-50 rounded-3xl p-6">
                <span className="text-indigo-600 font-bold">
                  06
                </span>
                <h3 className="font-black text-lg mt-3">
                  REST API Project
                </h3>
                <p className="text-sm text-slate-600 mt-2">
                  Complete Laravel API with authentication.
                </p>
              </div>
              <div className="bg-slate-50 rounded-3xl p-6">
                <span className="text-indigo-600 font-bold">
                  07
                </span>
                <h3 className="font-black text-lg mt-3">
                  E-Commerce Backend
                </h3>
                <p className="text-sm text-slate-600 mt-2">
                  Products, categories, orders and users.
                </p>
              </div>
              <div className="bg-slate-50 rounded-3xl p-6">
                <span className="text-indigo-600 font-bold">
                  08
                </span>
                <h3 className="font-black text-lg mt-3">
                  Final Laravel Project
                </h3>
                <p className="text-sm text-slate-600 mt-2">
                  Complete professional web application.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="career" className="py-20">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <span className="text-indigo-600 font-bold text-sm uppercase tracking-wider">
                {" "}Career Opportunities{" "}
              </span>
              <h2 className="text-3xl lg:text-4xl font-black mt-3">
                Career After Laravel Course
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-100 shadow-soft rounded-2xl p-5 font-semibold">
                Laravel Developer
              </div>
              <div className="bg-white border border-slate-100 shadow-soft rounded-2xl p-5 font-semibold">
                PHP Developer
              </div>
              <div className="bg-white border border-slate-100 shadow-soft rounded-2xl p-5 font-semibold">
                Backend Developer
              </div>
              <div className="bg-white border border-slate-100 shadow-soft rounded-2xl p-5 font-semibold">
                Full Stack Developer
              </div>
              <div className="bg-white border border-slate-100 shadow-soft rounded-2xl p-5 font-semibold">
                Web Application Developer
              </div>
              <div className="bg-white border border-slate-100 shadow-soft rounded-2xl p-5 font-semibold">
                API Developer
              </div>
              <div className="bg-white border border-slate-100 shadow-soft rounded-2xl p-5 font-semibold">
                Laravel Freelancer
              </div>
              <div className="bg-white border border-slate-100 shadow-soft rounded-2xl p-5 font-semibold">
                PHP Freelancer
              </div>
              <div className="bg-white border border-slate-100 shadow-soft rounded-2xl p-5 font-semibold">
                Junior Laravel Developer
              </div>
              <div className="bg-white border border-slate-100 shadow-soft rounded-2xl p-5 font-semibold">
                Backend Engineer
              </div>
              <div className="bg-white border border-slate-100 shadow-soft rounded-2xl p-5 font-semibold">
                Web Developer
              </div>
              <div className="bg-white border border-slate-100 shadow-soft rounded-2xl p-5 font-semibold">
                Laravel Full Stack Developer
              </div>
            </div>
          </div>
        </section>
        <section className="py-20 bg-white">
          <div className="max-w-[900px] mx-auto px-4 sm:px-6">
            <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-8 lg:p-12 text-center shadow-2xl">
              <div className="text-white/70 font-semibold">
                Professional Laravel Development Course
              </div>
              <div className="text-5xl font-black mt-3">
                ₹18,000
              </div>
              <div className="text-white/60 line-through mt-2">
                ₹30,000
              </div>
              <p className="max-w-xl mx-auto mt-5 text-white/80">
                Complete 6-month practical training with live projects, certificate and career-oriented development skills.
              </p>
              <a href="#admission" className="inline-block mt-7 px-8 py-4 bg-white text-indigo-700 rounded-xl font-black hover:bg-slate-100 transition">
                {" "}Apply for Admission{" "}
              </a>
            </div>
          </div>
        </section>
        <section className="py-20">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-3xl p-8 shadow-soft border border-slate-100">
                <h3 className="text-2xl font-black mb-6">
                  Eligibility
                </h3>
                <ul className="space-y-4 text-slate-600">
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
                    ✓ Graduates
                  </li>
                  <li>
                    ✓ Beginners
                  </li>
                  <li>
                    ✓ Freelancers
                  </li>
                  <li>
                    ✓ Aspiring Web Developers
                  </li>
                </ul>
              </div>
              <div className="bg-white rounded-3xl p-8 shadow-soft border border-slate-100">
                <h3 className="text-2xl font-black mb-6">
                  Requirements
                </h3>
                <ul className="space-y-4 text-slate-600">
                  <li>
                    ✓ Basic Computer Knowledge
                  </li>
                  <li>
                    ✓ Basic Internet Knowledge
                  </li>
                  <li>
                    ✓ Basic English Reading
                  </li>
                  <li>
                    ✓ Laptop / Desktop Recommended
                  </li>
                  <li>
                    ✓ Regular Coding Practice
                  </li>
                  <li>
                    ✓ Internet Connection
                  </li>
                  <li>
                    ✓ No Previous Laravel Experience Required
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        <section id="admission" className="py-20 bg-white">
          <div className="max-w-[1000px] mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <span className="text-indigo-600 font-bold text-sm uppercase tracking-wider">
                {" "}Admission{" "}
              </span>
              <h2 className="text-3xl lg:text-4xl font-black mt-3">
                Start Your Laravel Career
              </h2>
              <p className="text-slate-600 mt-3">
                Fill the form and our counsellor will contact you.
              </p>
            </div>
            <form data-inline-onsubmit="submitAdmission(event)" className="bg-slate-50 rounded-3xl p-6 sm:p-8 lg:p-10">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-bold">
                    {" "}Student Name{" "}
                  </label>
                  {" "}
                  <input id="studentName" required type="text" placeholder="Enter your name" className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="text-sm font-bold">
                    {" "}Mobile Number{" "}
                  </label>
                  {" "}
                  <input id="mobile" required type="tel" placeholder="Enter mobile number" className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="text-sm font-bold">
                    {" "}Email{" "}
                  </label>
                  {" "}
                  <input id="email" type="email" placeholder="Enter email" className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="text-sm font-bold">
                    {" "}Qualification{" "}
                  </label>
                  <select id="qualification" className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 outline-none">
                    <option>
                      10th
                    </option>
                    <option>
                      12th
                    </option>
                    <option>
                      ITI / Diploma
                    </option>
                    <option>
                      Graduation
                    </option>
                    <option>
                      Other
                    </option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold">
                    {" "}Interested Course{" "}
                  </label>
                  <select id="course" className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 outline-none">
                    <option>
                      Laravel Web Development
                    </option>
                    <option>
                      PHP Web Development
                    </option>
                    <option>
                      Full Stack Development
                    </option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold">
                    {" "}Preferred Mode{" "}
                  </label>
                  <select id="mode" className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 outline-none">
                    <option>
                      Offline
                    </option>
                    <option>
                      Online
                    </option>
                    <option>
                      Both / Flexible
                    </option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-bold">
                    {" "}Message{" "}
                  </label>
                  {" "}
                  <textarea id="message" rows={4} placeholder="Write your message..." className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <button type="submit" className="mt-6 w-full py-4 bg-indigo-600 text-white rounded-xl font-black hover:bg-indigo-700 transition">
                {" "}Apply via WhatsApp{" "}
              </button>
            </form>
          </div>
        </section>
        <section id="faq" className="py-20">
          <div className="max-w-[900px] mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <span className="text-indigo-600 font-bold text-sm uppercase tracking-wider">
                {" "}FAQ{" "}
              </span>
              <h2 className="text-3xl lg:text-4xl font-black mt-3">
                Frequently Asked Questions
              </h2>
            </div>
            <div className="space-y-3">
              <div className="faq-item bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <button data-inline-onclick="toggleFaq(this)" className="w-full p-5 flex justify-between items-center text-left font-bold">
                  Is Laravel suitable for beginners?
                  <span>
                    ⌄
                  </span>
                </button>
                <div className="hidden px-5 pb-5 text-slate-600 text-sm leading-7">
                  Yes. The course starts with HTML, CSS, JavaScript and PHP fundamentals before moving into Laravel.
                </div>
              </div>
              <div className="faq-item bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <button data-inline-onclick="toggleFaq(this)" className="w-full p-5 flex justify-between items-center text-left font-bold">
                  Is PHP included in the course?
                  <span>
                    ⌄
                  </span>
                </button>
                <div className="hidden px-5 pb-5 text-slate-600 text-sm leading-7">
                  Yes. PHP fundamentals and Object-Oriented Programming are covered before Laravel development.
                </div>
              </div>
              <div className="faq-item bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <button data-inline-onclick="toggleFaq(this)" className="w-full p-5 flex justify-between items-center text-left font-bold">
                  Will I learn MySQL?
                  <span>
                    ⌄
                  </span>
                </button>
                <div className="hidden px-5 pb-5 text-slate-600 text-sm leading-7">
                  Yes. MySQL, database design, migrations, Eloquent ORM, relationships and CRUD operations are included.
                </div>
              </div>
              <div className="faq-item bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <button data-inline-onclick="toggleFaq(this)" className="w-full p-5 flex justify-between items-center text-left font-bold">
                  Will I learn REST API development?
                  <span>
                    ⌄
                  </span>
                </button>
                <div className="hidden px-5 pb-5 text-slate-600 text-sm leading-7">
                  Yes. You will learn Laravel API routes, controllers, JSON responses, authentication and API testing.
                </div>
              </div>
              <div className="faq-item bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <button data-inline-onclick="toggleFaq(this)" className="w-full p-5 flex justify-between items-center text-left font-bold">
                  Are live projects included?
                  <span>
                    ⌄
                  </span>
                </button>
                <div className="hidden px-5 pb-5 text-slate-600 text-sm leading-7">
                  Yes. Students work on multiple practical Laravel projects including management systems and admin panels.
                </div>
              </div>
              <div className="faq-item bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <button data-inline-onclick="toggleFaq(this)" className="w-full p-5 flex justify-between items-center text-left font-bold">
                  Will I receive a certificate?
                  <span>
                    ⌄
                  </span>
                </button>
                <div className="hidden px-5 pb-5 text-slate-600 text-sm leading-7">
                  Yes. A course completion certificate is provided after successful completion of the program.
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="hero-bg text-white py-20">
          <div className="max-w-[1000px] mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black">
              Become a Laravel Developer
            </h2>
            <p className="text-white/80 mt-5 max-w-2xl mx-auto leading-7">
              Learn PHP + Laravel + MySQL + APIs + Admin Panels and build professional web applications.
            </p>
            <a href="#admission" className="inline-block mt-8 px-8 py-4 bg-white text-indigo-700 rounded-xl font-black hover:bg-slate-100 transition">
              {" "}Apply Now{" "}
            </a>
          </div>
        </section>
        <footer className="bg-slate-950 text-white">
          <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid md:grid-cols-3 gap-10">
              <div>
                <div className="font-black text-2xl">
                  Career Optics Computer Centre
                </div>
                <p className="text-slate-400 text-sm leading-7 mt-4 max-w-md">
                  Professional computer, web development and career-oriented training institute.
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-4">
                  Laravel Course
                </h3>
                <div className="space-y-2 text-sm text-slate-400">
                  <div>
                    PHP Development
                  </div>
                  <div>
                    Laravel Framework
                  </div>
                  <div>
                    MySQL Database
                  </div>
                  <div>
                    REST API
                  </div>
                  <div>
                    Live Projects
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-bold mb-4">
                  Contact
                </h3>
                <div className="space-y-2 text-sm text-slate-400">
                  <div>
                    +91 82525 32179
                  </div>
                  <div>
                    careeropticsconsultancy@gmail.com
                  </div>
                  <div>
                    Bihar, India
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-white/10 mt-10 pt-6 text-center text-sm text-slate-500">
              © 2026 Career Optics Computer Centre. All Rights Reserved.
            </div>
          </div>
        </footer>
        <a href="https://wa.me/918252532179" target="_blank" className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-green-500 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.52 3.48A11.91 11.91 0 0012.04 0C5.47 0 .12 5.35.12 11.92c0 2.1.55 4.15 1.6 5.96L0 24l6.28-1.65a11.9 11.9 0 005.75 1.47h.01c6.57 0 11.92-5.35 11.92-11.92 0-3.18-1.24-6.17-3.44-8.42zM12.04 21.8h-.01a9.9 9.9 0 01-5.05-1.38l-.36-.21-3.73.98.99-3.64-.23-.37a9.9 9.9 0 01-1.52-5.26C2.13 6.44 6.57 2 12.04 2a9.85 9.85 0 017 2.91 9.85 9.85 0 012.91 7.01c0 5.47-4.45 9.88-9.91 9.88zm5.43-7.4c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.64-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.21 5.09 4.5.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z"></path>
          </svg>
        </a>
        <script dangerouslySetInnerHTML={{ __html: js_dfceff2f }} />
        ```
      </body>
    </html>
  );
}
