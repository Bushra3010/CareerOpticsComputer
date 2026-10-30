import css_1d30d032 from "../styles/1d30d032.css?raw";
import js_0cae992c from "../behaviour/0cae992c.js?raw";
import js_75830f0c from "../behaviour/75830f0c.js?raw";

/** net.html */
export default function Net() {
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
          .NET Web Development Course | Career Optics Computer Centre
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
                  .NET Web Development{" "}
                  <span className="block text-white/80">
                    {" "}Beginner to Professional{" "}
                  </span>
                </h1>
                <p className="text-lg lg:text-xl text-white/85 max-w-3xl leading-relaxed mb-8">
                  Learn C#, .NET, ASP.NET Core, MVC, Web API, Entity Framework Core, SQL Server, Authentication and build professional real-world web applications.
                </p>
                <div className="flex flex-wrap gap-2 mb-8">
                  <span className="px-4 py-2 rounded-full bg-white/15 border border-white/20 text-sm">
                    {" "}C#{" "}
                  </span>
                  <span className="px-4 py-2 rounded-full bg-white/15 border border-white/20 text-sm">
                    {" "}.NET{" "}
                  </span>
                  <span className="px-4 py-2 rounded-full bg-white/15 border border-white/20 text-sm">
                    {" "}ASP.NET Core{" "}
                  </span>
                  <span className="px-4 py-2 rounded-full bg-white/15 border border-white/20 text-sm">
                    {" "}MVC{" "}
                  </span>
                  <span className="px-4 py-2 rounded-full bg-white/15 border border-white/20 text-sm">
                    {" "}Web API{" "}
                  </span>
                  <span className="px-4 py-2 rounded-full bg-white/15 border border-white/20 text-sm">
                    {" "}SQL Server{" "}
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
                    ₹20,000
                  </div>
                  <div className="text-slate-400 line-through mb-1">
                    ₹35,000
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
                  {" "}Start Your .NET Journey{" "}
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
                Become a Professional .NET Developer
              </h2>
              <p className="text-slate-600 leading-8">
                This practical .NET Web Development course is designed to take students from C# programming fundamentals to professional ASP.NET Core application development. Learn MVC architecture, databases, APIs, authentication, admin panels and deployment through practical projects.
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
                  .NET Development
                </h3>
                <p className="text-slate-600 leading-7 text-sm">
                  Learn C#, .NET, ASP.NET Core, MVC, Razor, controllers, routing and application architecture.
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
                  Work with SQL Server, Entity Framework Core, LINQ, CRUD applications and REST Web APIs.
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
                  Build professional management systems, dashboards, APIs and complete business applications.
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
                      Develop applications using C# and .NET.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-7 h-7 rounded-full bg-green-100 text-green-600 flex-shrink-0 flex items-center justify-center font-bold">
                      ✓
                    </div>
                    <p>
                      Build ASP.NET Core MVC web applications.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-7 h-7 rounded-full bg-green-100 text-green-600 flex-shrink-0 flex items-center justify-center font-bold">
                      ✓
                    </div>
                    <p>
                      Work with SQL Server and Entity Framework Core.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-7 h-7 rounded-full bg-green-100 text-green-600 flex-shrink-0 flex items-center justify-center font-bold">
                      ✓
                    </div>
                    <p>
                      Create RESTful Web APIs.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-7 h-7 rounded-full bg-green-100 text-green-600 flex-shrink-0 flex items-center justify-center font-bold">
                      ✓
                    </div>
                    <p>
                      Build authentication and role-based systems.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-7 h-7 rounded-full bg-green-100 text-green-600 flex-shrink-0 flex items-center justify-center font-bold">
                      ✓
                    </div>
                    <p>
                      Deploy professional .NET applications.
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
                    C#
                  </div>
                  <div className="bg-white rounded-2xl p-5 text-center shadow-sm">
                    .NET
                  </div>
                  <div className="bg-white rounded-2xl p-5 text-center shadow-sm">
                    ASP.NET Core
                  </div>
                  <div className="bg-white rounded-2xl p-5 text-center shadow-sm">
                    MVC
                  </div>
                  <div className="bg-white rounded-2xl p-5 text-center shadow-sm">
                    Web API
                  </div>
                  <div className="bg-white rounded-2xl p-5 text-center shadow-sm">
                    SQL Server
                  </div>
                  <div className="bg-white rounded-2xl p-5 text-center shadow-sm">
                    EF Core
                  </div>
                  <div className="bg-white rounded-2xl p-5 text-center shadow-sm">
                    LINQ
                  </div>
                  <div className="bg-white rounded-2xl p-5 text-center shadow-sm">
                    Git & GitHub
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
                .NET Web Development Syllabus
              </h2>
              <p className="text-slate-600 mt-4">
                Click any module to view detailed syllabus.
              </p>
            </div>
            <div className="mb-8">
              <div className="mb-4">
                <h3 className="text-xl font-black">
                  PART A — WEB & C# FOUNDATION
                </h3>
                <p className="text-sm text-slate-500">
                  Build strong programming and web development fundamentals.
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
                        Frontend vs Backend
                      </li>
                      <li>
                        Client and Server Architecture
                      </li>
                      <li>
                        HTTP and HTTPS
                      </li>
                      <li>
                        Web Servers
                      </li>
                      <li>
                        Domain and Hosting Basics
                      </li>
                      <li>
                        Dynamic Websites
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
                        Forms and Input Controls
                      </li>
                      <li>
                        Tables and Lists
                      </li>
                      <li>
                        Images and Multimedia
                      </li>
                      <li>
                        Semantic HTML
                      </li>
                      <li>
                        HTML5 Forms
                      </li>
                      <li>
                        Responsive Layout Basics
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
                        Bootstrap Basics
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
                        Functions
                      </li>
                      <li>
                        Arrays and Objects
                      </li>
                      <li>
                        Conditions and Loops
                      </li>
                      <li>
                        DOM
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
                      {" "}05. C# Programming Fundamentals{" "}
                    </span>
                    <span className="arrow">
                      ⌄
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5 text-sm text-slate-600">
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        Introduction to C#
                      </li>
                      <li>
                        Variables and Constants
                      </li>
                      <li>
                        Data Types
                      </li>
                      <li>
                        Operators
                      </li>
                      <li>
                        Conditions
                      </li>
                      <li>
                        Loops
                      </li>
                      <li>
                        Methods
                      </li>
                      <li>
                        Arrays
                      </li>
                      <li>
                        Strings
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full p-5 flex items-center justify-between text-left">
                    <span className="font-bold">
                      {" "}06. C# OOP & Advanced Programming{" "}
                    </span>
                    <span className="arrow">
                      ⌄
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5 text-sm text-slate-600">
                    <ul className="list-disc pl-5 space-y-2">
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
                        Polymorphism
                      </li>
                      <li>
                        Encapsulation
                      </li>
                      <li>
                        Abstraction
                      </li>
                      <li>
                        Interfaces
                      </li>
                      <li>
                        Exception Handling
                      </li>
                      <li>
                        Collections
                      </li>
                      <li>
                        Generics
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="mb-8">
              <div className="mb-4">
                <h3 className="text-xl font-black">
                  PART B — .NET & ASP.NET CORE
                </h3>
                <p className="text-sm text-slate-500">
                  Learn the modern .NET development ecosystem.
                </p>
              </div>
              <div className="space-y-3">
                <div className="accordion-item bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full p-5 flex items-center justify-between text-left">
                    <span className="font-bold">
                      {" "}07. Introduction to .NET{" "}
                    </span>
                    <span className="arrow">
                      ⌄
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5 text-sm text-slate-600">
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        What is .NET?
                      </li>
                      <li>
                        .NET Architecture
                      </li>
                      <li>
                        .NET SDK and Runtime
                      </li>
                      <li>
                        Installing Development Environment
                      </li>
                      <li>
                        Visual Studio / VS Code
                      </li>
                      <li>
                        Creating .NET Projects
                      </li>
                      <li>
                        CLI Commands
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full p-5 flex items-center justify-between text-left">
                    <span className="font-bold">
                      {" "}08. ASP.NET Core Fundamentals{" "}
                    </span>
                    <span className="arrow">
                      ⌄
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5 text-sm text-slate-600">
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        Introduction to ASP.NET Core
                      </li>
                      <li>
                        Project Structure
                      </li>
                      <li>
                        Application Startup
                      </li>
                      <li>
                        Dependency Injection
                      </li>
                      <li>
                        Configuration
                      </li>
                      <li>
                        Environment Settings
                      </li>
                      <li>
                        Middleware Pipeline
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full p-5 flex items-center justify-between text-left">
                    <span className="font-bold">
                      {" "}09. MVC Architecture{" "}
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
                        Request Pipeline
                      </li>
                      <li>
                        View Models
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
                      {" "}10. Routing & Controllers{" "}
                    </span>
                    <span className="arrow">
                      ⌄
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5 text-sm text-slate-600">
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        Conventional Routing
                      </li>
                      <li>
                        Attribute Routing
                      </li>
                      <li>
                        Route Parameters
                      </li>
                      <li>
                        Controllers
                      </li>
                      <li>
                        Action Methods
                      </li>
                      <li>
                        Action Results
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
                      {" "}11. Razor Views & UI{" "}
                    </span>
                    <span className="arrow">
                      ⌄
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5 text-sm text-slate-600">
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        Razor Syntax
                      </li>
                      <li>
                        Layouts
                      </li>
                      <li>
                        Partial Views
                      </li>
                      <li>
                        View Components
                      </li>
                      <li>
                        Tag Helpers
                      </li>
                      <li>
                        Form Handling
                      </li>
                      <li>
                        Validation Messages
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full p-5 flex items-center justify-between text-left">
                    <span className="font-bold">
                      {" "}12. Forms & Validation{" "}
                    </span>
                    <span className="arrow">
                      ⌄
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5 text-sm text-slate-600">
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        HTML Forms
                      </li>
                      <li>
                        Model Binding
                      </li>
                      <li>
                        Server Side Validation
                      </li>
                      <li>
                        Data Annotations
                      </li>
                      <li>
                        Custom Validation
                      </li>
                      <li>
                        File Upload
                      </li>
                      <li>
                        Error Handling
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="mb-8">
              <div className="mb-4">
                <h3 className="text-xl font-black">
                  PART C — DATABASE, EF CORE & WEB API
                </h3>
                <p className="text-sm text-slate-500">
                  Build database-driven applications and APIs.
                </p>
              </div>
              <div className="space-y-3">
                <div className="accordion-item bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full p-5 flex items-center justify-between text-left">
                    <span className="font-bold">
                      {" "}13. SQL Server Database{" "}
                    </span>
                    <span className="arrow">
                      ⌄
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5 text-sm text-slate-600">
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        SQL Server Introduction
                      </li>
                      <li>
                        Databases and Tables
                      </li>
                      <li>
                        Primary Keys
                      </li>
                      <li>
                        Foreign Keys
                      </li>
                      <li>
                        Relationships
                      </li>
                      <li>
                        SELECT / INSERT / UPDATE / DELETE
                      </li>
                      <li>
                        Joins
                      </li>
                      <li>
                        Stored Procedures Basics
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full p-5 flex items-center justify-between text-left">
                    <span className="font-bold">
                      {" "}14. Entity Framework Core{" "}
                    </span>
                    <span className="arrow">
                      ⌄
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5 text-sm text-slate-600">
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        Introduction to EF Core
                      </li>
                      <li>
                        DbContext
                      </li>
                      <li>
                        Models
                      </li>
                      <li>
                        Database Connection
                      </li>
                      <li>
                        Code First Approach
                      </li>
                      <li>
                        Migrations
                      </li>
                      <li>
                        Database Relationships
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full p-5 flex items-center justify-between text-left">
                    <span className="font-bold">
                      {" "}15. LINQ & CRUD Operations{" "}
                    </span>
                    <span className="arrow">
                      ⌄
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5 text-sm text-slate-600">
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        LINQ Introduction
                      </li>
                      <li>
                        Filtering
                      </li>
                      <li>
                        Sorting
                      </li>
                      <li>
                        Searching
                      </li>
                      <li>
                        Insert Records
                      </li>
                      <li>
                        Update Records
                      </li>
                      <li>
                        Delete Records
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
                      {" "}16. ASP.NET Core Web API{" "}
                    </span>
                    <span className="arrow">
                      ⌄
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5 text-sm text-slate-600">
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        REST API Concepts
                      </li>
                      <li>
                        API Controllers
                      </li>
                      <li>
                        HTTP Methods
                      </li>
                      <li>
                        GET / POST / PUT / DELETE
                      </li>
                      <li>
                        JSON Response
                      </li>
                      <li>
                        DTOs
                      </li>
                      <li>
                        API Validation
                      </li>
                      <li>
                        Postman Testing
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full p-5 flex items-center justify-between text-left">
                    <span className="font-bold">
                      {" "}17. Authentication & Authorization{" "}
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
                        ASP.NET Core Identity
                      </li>
                      <li>
                        Password Security
                      </li>
                      <li>
                        Role-Based Authorization
                      </li>
                      <li>
                        Claims
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
                      {" "}18. JWT Authentication & API Security{" "}
                    </span>
                    <span className="arrow">
                      ⌄
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5 text-sm text-slate-600">
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        JWT Authentication
                      </li>
                      <li>
                        Access Tokens
                      </li>
                      <li>
                        Refresh Token Concepts
                      </li>
                      <li>
                        API Authorization
                      </li>
                      <li>
                        Role-Based API Access
                      </li>
                      <li>
                        CORS
                      </li>
                      <li>
                        API Security Practices
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
                  Convert your .NET skills into professional applications.
                </p>
              </div>
              <div className="space-y-3">
                <div className="accordion-item bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full p-5 flex items-center justify-between text-left">
                    <span className="font-bold">
                      {" "}19. Professional Admin Panel{" "}
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
                        Reports
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
                      {" "}20. Advanced ASP.NET Core{" "}
                    </span>
                    <span className="arrow">
                      ⌄
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5 text-sm text-slate-600">
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        Dependency Injection
                      </li>
                      <li>
                        Middleware
                      </li>
                      <li>
                        Logging
                      </li>
                      <li>
                        Exception Handling
                      </li>
                      <li>
                        Configuration
                      </li>
                      <li>
                        File Storage
                      </li>
                      <li>
                        Email Integration
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
                        Commit and Push
                      </li>
                      <li>
                        Branching
                      </li>
                      <li>
                        Merge
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
                      {" "}22. Business Management System{" "}
                    </span>
                    <span className="arrow">
                      ⌄
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5 text-sm text-slate-600">
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        Business Website
                      </li>
                      <li>
                        Admin Panel
                      </li>
                      <li>
                        User Management
                      </li>
                      <li>
                        Contact Management
                      </li>
                      <li>
                        Database Integration
                      </li>
                      <li>
                        Authentication
                      </li>
                      <li>
                        Reports
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full p-5 flex items-center justify-between text-left">
                    <span className="font-bold">
                      {" "}23. Student / Institute Management System{" "}
                    </span>
                    <span className="arrow">
                      ⌄
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5 text-sm text-slate-600">
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        Student Registration
                      </li>
                      <li>
                        Course Management
                      </li>
                      <li>
                        Enquiry Management
                      </li>
                      <li>
                        Lead Management
                      </li>
                      <li>
                        Attendance
                      </li>
                      <li>
                        Fee Management
                      </li>
                      <li>
                        Reports
                      </li>
                      <li>
                        Admin Dashboard
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full p-5 flex items-center justify-between text-left">
                    <span className="font-bold">
                      {" "}24. Deployment & Final .NET Project{" "}
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
                        Application Publishing
                      </li>
                      <li>
                        Hosting Setup
                      </li>
                      <li>
                        SQL Server Deployment
                      </li>
                      <li>
                        Configuration
                      </li>
                      <li>
                        Domain Setup
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
                8+ Live .NET Projects
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
                  Dynamic ASP.NET Core website with admin panel.
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
                  Student records, courses, fees and reports.
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
                  Complete dashboard with users and analytics.
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
                  Login, registration, roles and permissions.
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
                  ASP.NET Core Web API with authentication.
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
                  Products, categories, users and orders.
                </p>
              </div>
              <div className="bg-slate-50 rounded-3xl p-6">
                <span className="text-indigo-600 font-bold">
                  08
                </span>
                <h3 className="font-black text-lg mt-3">
                  Final .NET Project
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
                Career After .NET Course
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-100 shadow-soft rounded-2xl p-5 font-semibold">
                .NET Developer
              </div>
              <div className="bg-white border border-slate-100 shadow-soft rounded-2xl p-5 font-semibold">
                C# Developer
              </div>
              <div className="bg-white border border-slate-100 shadow-soft rounded-2xl p-5 font-semibold">
                ASP.NET Developer
              </div>
              <div className="bg-white border border-slate-100 shadow-soft rounded-2xl p-5 font-semibold">
                ASP.NET Core Developer
              </div>
              <div className="bg-white border border-slate-100 shadow-soft rounded-2xl p-5 font-semibold">
                Backend Developer
              </div>
              <div className="bg-white border border-slate-100 shadow-soft rounded-2xl p-5 font-semibold">
                Full Stack Developer
              </div>
              <div className="bg-white border border-slate-100 shadow-soft rounded-2xl p-5 font-semibold">
                Web API Developer
              </div>
              <div className="bg-white border border-slate-100 shadow-soft rounded-2xl p-5 font-semibold">
                Software Developer
              </div>
              <div className="bg-white border border-slate-100 shadow-soft rounded-2xl p-5 font-semibold">
                Junior .NET Developer
              </div>
              <div className="bg-white border border-slate-100 shadow-soft rounded-2xl p-5 font-semibold">
                MVC Developer
              </div>
              <div className="bg-white border border-slate-100 shadow-soft rounded-2xl p-5 font-semibold">
                .NET Freelancer
              </div>
              <div className="bg-white border border-slate-100 shadow-soft rounded-2xl p-5 font-semibold">
                Backend Engineer
              </div>
            </div>
          </div>
        </section>
        <section className="py-20 bg-white">
          <div className="max-w-[900px] mx-auto px-4 sm:px-6">
            <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-8 lg:p-12 text-center shadow-2xl">
              <div className="text-white/70 font-semibold">
                Professional .NET Web Development Course
              </div>
              <div className="text-5xl font-black mt-3">
                ₹20,000
              </div>
              <div className="text-white/60 line-through mt-2">
                ₹35,000
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
                    ✓ Aspiring Software Developers
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
                    ✓ Regular Programming Practice
                  </li>
                  <li>
                    ✓ Internet Connection
                  </li>
                  <li>
                    ✓ No Previous .NET Experience Required
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
                Start Your .NET Career
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
                      .NET Web Development
                    </option>
                    <option>
                      ASP.NET Core Development
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
                  Is .NET suitable for beginners?
                  <span>
                    ⌄
                  </span>
                </button>
                <div className="hidden px-5 pb-5 text-slate-600 text-sm leading-7">
                  Yes. The course starts with web development and C# programming fundamentals before moving into ASP.NET Core.
                </div>
              </div>
              <div className="faq-item bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <button data-inline-onclick="toggleFaq(this)" className="w-full p-5 flex justify-between items-center text-left font-bold">
                  Is C# included?
                  <span>
                    ⌄
                  </span>
                </button>
                <div className="hidden px-5 pb-5 text-slate-600 text-sm leading-7">
                  Yes. C# fundamentals, OOP, collections, exception handling and advanced programming concepts are covered.
                </div>
              </div>
              <div className="faq-item bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <button data-inline-onclick="toggleFaq(this)" className="w-full p-5 flex justify-between items-center text-left font-bold">
                  Will I learn SQL Server?
                  <span>
                    ⌄
                  </span>
                </button>
                <div className="hidden px-5 pb-5 text-slate-600 text-sm leading-7">
                  Yes. SQL Server, database relationships, CRUD, queries and Entity Framework Core are included.
                </div>
              </div>
              <div className="faq-item bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <button data-inline-onclick="toggleFaq(this)" className="w-full p-5 flex justify-between items-center text-left font-bold">
                  Will I learn Web API?
                  <span>
                    ⌄
                  </span>
                </button>
                <div className="hidden px-5 pb-5 text-slate-600 text-sm leading-7">
                  Yes. ASP.NET Core Web API, REST architecture, HTTP methods, JSON, DTOs, authentication and Postman testing are included.
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
                  Yes. Students work on multiple practical applications including management systems, dashboards and APIs.
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
              Become a Professional .NET Developer
            </h2>
            <p className="text-white/80 mt-5 max-w-2xl mx-auto leading-7">
              Learn C# + .NET + ASP.NET Core + SQL Server + Web API and build professional web applications.
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
                  .NET Course
                </h3>
                <div className="space-y-2 text-sm text-slate-400">
                  <div>
                    C# Programming
                  </div>
                  <div>
                    .NET Development
                  </div>
                  <div>
                    ASP.NET Core
                  </div>
                  <div>
                    SQL Server
                  </div>
                  <div>
                    Web API
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
        <script dangerouslySetInnerHTML={{ __html: js_0cae992c }} />
        ```
      </body>
    </html>
  );
}
