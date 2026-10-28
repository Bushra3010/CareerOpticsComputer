import css_19a81f31 from "../styles/19a81f31.css?raw";
import js_3d284604 from "../behaviour/3d284604.js?raw";
import js_51a1e090 from "../behaviour/51a1e090.js?raw";

/** python.html */
export default function Python() {
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
          Python Programming Course | Career Optics Computer Centre
        </title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script dangerouslySetInnerHTML={{ __html: js_3d284604 }} />
        <style dangerouslySetInnerHTML={{ __html: css_19a81f31 }} />
        <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
          <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-16 flex items-center justify-between">
              <a href="#" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-black">
                  P
                </div>
                <div>
                  <div className="font-black text-xl text-slate-900">
                    PNS{" "}
                    <span className="text-blue-600">
                      Academy
                    </span>
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                    Learn • Build • Grow
                  </div>
                </div>
              </a>
              <div className="hidden md:flex items-center gap-7 text-sm font-semibold">
                <a href="#overview" className="hover:text-blue-600 transition">
                  {" "}Overview{" "}
                </a>
                {" "}
                <a href="#syllabus" className="hover:text-blue-600 transition">
                  {" "}Syllabus{" "}
                </a>
                {" "}
                <a href="#projects" className="hover:text-blue-600 transition">
                  {" "}Projects{" "}
                </a>
                {" "}
                <a href="#career" className="hover:text-blue-600 transition">
                  {" "}Career{" "}
                </a>
                {" "}
                <a href="#admission" className="hover:text-blue-600 transition">
                  {" "}Admission{" "}
                </a>
                {" "}
                <a href="#faq" className="hover:text-blue-600 transition">
                  {" "}FAQ{" "}
                </a>
                {" "}
                <a href="#admission" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-200 hover:scale-105 transition">
                  {" "}Apply Now{" "}
                </a>
              </div>
              <button data-inline-onclick="toggleMobileMenu()" className="md:hidden w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center">
                ☰
              </button>
            </div>
            <div id="mobileMenu" className="mobile-menu md:hidden border-t border-slate-100 py-4">
              <div className="flex flex-col gap-2">
                <a href="#overview" data-inline-onclick="closeMobileMenu()" className="px-4 py-3 rounded-xl hover:bg-slate-50">
                  {" "}Overview{" "}
                </a>
                <a href="#syllabus" data-inline-onclick="closeMobileMenu()" className="px-4 py-3 rounded-xl hover:bg-slate-50">
                  {" "}Syllabus{" "}
                </a>
                <a href="#projects" data-inline-onclick="closeMobileMenu()" className="px-4 py-3 rounded-xl hover:bg-slate-50">
                  {" "}Projects{" "}
                </a>
                <a href="#career" data-inline-onclick="closeMobileMenu()" className="px-4 py-3 rounded-xl hover:bg-slate-50">
                  {" "}Career{" "}
                </a>
                <a href="#admission" data-inline-onclick="closeMobileMenu()" className="px-4 py-3 rounded-xl hover:bg-slate-50">
                  {" "}Admission{" "}
                </a>
                <a href="#faq" data-inline-onclick="closeMobileMenu()" className="px-4 py-3 rounded-xl hover:bg-slate-50">
                  {" "}FAQ{" "}
                </a>
                <a href="#admission" data-inline-onclick="closeMobileMenu()" className="mt-2 text-center px-5 py-3 rounded-xl bg-blue-600 text-white font-bold">
                  {" "}Apply Now{" "}
                </a>
              </div>
            </div>
          </div>
        </nav>
        <div className="sticky top-16 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
          <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-6 overflow-x-auto whitespace-nowrap py-3 text-sm font-semibold">
              <a href="#overview" className="text-blue-600">
                {" "}Overview{" "}
              </a>
              <a href="#syllabus" className="hover:text-blue-600">
                {" "}Syllabus{" "}
              </a>
              <a href="#projects" className="hover:text-blue-600">
                {" "}Projects{" "}
              </a>
              <a href="#career" className="hover:text-blue-600">
                {" "}Career{" "}
              </a>
              <a href="#admission" className="hover:text-blue-600">
                {" "}Admission{" "}
              </a>
              <a href="#faq" className="hover:text-blue-600">
                {" "}FAQ{" "}
              </a>
            </div>
          </div>
        </div>
        <section className="hero-bg text-white">
          <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 min-h-[600px] flex items-center">
            <div className="grid lg:grid-cols-[1.25fr_.75fr] gap-12 items-center w-full py-16">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-bold mb-6">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  Professional Programming Course
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-tight">
                  Python Programming{" "}
                  <span className="block text-blue-300">
                    {" "}& Development{" "}
                  </span>
                </h1>
                <p className="mt-6 text-lg sm:text-xl text-slate-200 max-w-3xl leading-relaxed">
                  Learn Python from beginner to professional level and build real-world applications, automation tools, APIs, database applications and AI-ready projects.
                </p>
                <div className="flex flex-wrap gap-3 mt-7">
                  <span className="glass px-4 py-2 rounded-full text-sm">
                    {" "}Python{" "}
                  </span>
                  <span className="glass px-4 py-2 rounded-full text-sm">
                    {" "}OOP{" "}
                  </span>
                  <span className="glass px-4 py-2 rounded-full text-sm">
                    {" "}Django{" "}
                  </span>
                  <span className="glass px-4 py-2 rounded-full text-sm">
                    {" "}Flask{" "}
                  </span>
                  <span className="glass px-4 py-2 rounded-full text-sm">
                    {" "}MySQL{" "}
                  </span>
                  <span className="glass px-4 py-2 rounded-full text-sm">
                    {" "}REST API{" "}
                  </span>
                  <span className="glass px-4 py-2 rounded-full text-sm">
                    {" "}Automation{" "}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 mt-9">
                  <a href="#admission" className="px-7 py-3.5 rounded-xl bg-white text-slate-900 font-black shadow-xl hover:-translate-y-1 transition">
                    {" "}Apply Now →{" "}
                  </a>
                  <a href="#syllabus" className="px-7 py-3.5 rounded-xl glass font-bold hover:bg-white/20 transition">
                    {" "}View Full Syllabus{" "}
                  </a>
                </div>
              </div>
              <div className="glass rounded-3xl p-7 sm:p-8 shadow-2xl">
                <div className="text-sm text-slate-300 font-semibold">
                  Complete Course Fee
                </div>
                <div className="flex items-end gap-3 mt-2">
                  <div className="text-5xl font-black">
                    ₹20,000
                  </div>
                  <div className="line-through text-slate-400 mb-2">
                    ₹35,000
                  </div>
                </div>
                <div className="mt-3 inline-block px-3 py-1 rounded-full bg-green-400/20 text-green-300 text-sm font-bold">
                  Special Admission Offer
                </div>
                <div className="grid grid-cols-2 gap-3 mt-7">
                  <div className="bg-white/10 rounded-2xl p-4">
                    <div className="text-xs text-slate-300">
                      Duration
                    </div>
                    <div className="font-bold mt-1">
                      6 Months
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-4">
                    <div className="text-xs text-slate-300">
                      Mode
                    </div>
                    <div className="font-bold mt-1">
                      Online / Offline
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-4">
                    <div className="text-xs text-slate-300">
                      Projects
                    </div>
                    <div className="font-bold mt-1">
                      8+ Live
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-4">
                    <div className="text-xs text-slate-300">
                      Certificate
                    </div>
                    <div className="font-bold mt-1">
                      Included
                    </div>
                  </div>
                </div>
                <a href="#admission" className="block text-center mt-7 bg-white text-blue-700 py-3.5 rounded-xl font-black hover:scale-[1.02] transition">
                  {" "}Reserve Your Seat{" "}
                </a>
              </div>
            </div>
          </div>
        </section>
        <section id="overview" className="py-20 bg-white">
          <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <span className="text-blue-600 font-bold text-sm uppercase tracking-widest">
                {" "}Course Overview{" "}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black mt-3">
                Become a Professional{" "}
                <span className="gradient-text">
                  {" "}Python Developer{" "}
                </span>
              </h2>
              <p className="mt-5 text-slate-600 leading-8">
                This complete Python course is designed for students, beginners, job seekers, freelancers and aspiring software developers. You will learn Python programming, OOP, databases, web development, APIs, automation and professional project development.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              <div className="p-7 rounded-3xl bg-blue-50 border border-blue-100">
                <div className="text-3xl mb-4">
                  🐍
                </div>
                <h3 className="font-black text-xl">
                  Python Development
                </h3>
                <p className="text-slate-600 mt-3 leading-7">
                  Learn Python syntax, functions, OOP, modules, packages and advanced programming.
                </p>
              </div>
              <div className="p-7 rounded-3xl bg-purple-50 border border-purple-100">
                <div className="text-3xl mb-4">
                  🌐
                </div>
                <h3 className="font-black text-xl">
                  Web Development
                </h3>
                <p className="text-slate-600 mt-3 leading-7">
                  Build professional web applications using Django, Flask, HTML, CSS and JavaScript.
                </p>
              </div>
              <div className="p-7 rounded-3xl bg-pink-50 border border-pink-100">
                <div className="text-3xl mb-4">
                  ⚙️
                </div>
                <h3 className="font-black text-xl">
                  Automation & API
                </h3>
                <p className="text-slate-600 mt-3 leading-7">
                  Create automation scripts, REST APIs, database applications and real-world tools.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="py-20 bg-slate-50">
          <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-blue-600 font-bold text-sm uppercase tracking-widest">
                {" "}What You Will Learn{" "}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black mt-3">
                Skills You Will Master
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
              <div className="bg-white rounded-2xl p-6 shadow-soft border border-slate-100">
                <div className="text-2xl">
                  ✓
                </div>
                <h3 className="font-black mt-4">
                  Python Programming
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Variables, functions, loops, collections, modules and advanced concepts.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-soft border border-slate-100">
                <div className="text-2xl">
                  ✓
                </div>
                <h3 className="font-black mt-4">
                  OOP & Advanced Python
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Classes, objects, inheritance, decorators, exceptions and file handling.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-soft border border-slate-100">
                <div className="text-2xl">
                  ✓
                </div>
                <h3 className="font-black mt-4">
                  Web & API Development
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Django, Flask, REST API, authentication and database integration.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-soft border border-slate-100">
                <div className="text-2xl">
                  ✓
                </div>
                <h3 className="font-black mt-4">
                  Automation
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Build useful automation scripts and productivity tools using Python.
                </p>
              </div>
            </div>
            <div className="mt-14">
              <h3 className="text-xl font-black text-center">
                Tools & Technologies Covered
              </h3>
              <div className="flex flex-wrap justify-center gap-3 mt-6">
                <span className="px-4 py-2 bg-white rounded-full border border-slate-200 font-semibold">
                  {" "}Python{" "}
                </span>
                <span className="px-4 py-2 bg-white rounded-full border border-slate-200 font-semibold">
                  {" "}Django{" "}
                </span>
                <span className="px-4 py-2 bg-white rounded-full border border-slate-200 font-semibold">
                  {" "}Flask{" "}
                </span>
                <span className="px-4 py-2 bg-white rounded-full border border-slate-200 font-semibold">
                  {" "}MySQL{" "}
                </span>
                <span className="px-4 py-2 bg-white rounded-full border border-slate-200 font-semibold">
                  {" "}SQLite{" "}
                </span>
                <span className="px-4 py-2 bg-white rounded-full border border-slate-200 font-semibold">
                  {" "}REST API{" "}
                </span>
                <span className="px-4 py-2 bg-white rounded-full border border-slate-200 font-semibold">
                  {" "}Git & GitHub{" "}
                </span>
                <span className="px-4 py-2 bg-white rounded-full border border-slate-200 font-semibold">
                  {" "}VS Code{" "}
                </span>
                <span className="px-4 py-2 bg-white rounded-full border border-slate-200 font-semibold">
                  {" "}Postman{" "}
                </span>
              </div>
            </div>
          </div>
        </section>
        <section id="syllabus" className="py-20 bg-white">
          <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
            <div className="text-center">
              <span className="text-blue-600 font-bold text-sm uppercase tracking-widest">
                {" "}Complete Curriculum{" "}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black mt-3">
                Python Course Syllabus
              </h2>
              <p className="text-slate-500 mt-4">
                Click any module to view detailed topics.
              </p>
            </div>
            <div className="mt-12">
              <div className="mb-5">
                <span className="text-xs font-black uppercase tracking-widest text-blue-600">
                  {" "}PART A{" "}
                </span>
                <h3 className="text-2xl font-black mt-1">
                  Python & Programming Foundation
                </h3>
              </div>
              <div className="accordion-item border border-slate-200 rounded-2xl mb-4 overflow-hidden">
                <button data-inline-onclick="toggleAccordion(this)" className="w-full flex items-center justify-between gap-5 p-5 text-left bg-white hover:bg-slate-50">
                  <span className="font-bold">
                    {" "}01. Computer & Programming Fundamentals{" "}
                  </span>
                  <span className="rotate-icon text-xl">
                    ⌄
                  </span>
                </button>
                <div className="accordion-content px-5 pb-5">
                  <ul className="grid sm:grid-cols-2 gap-2 text-sm text-slate-600">
                    <li>
                      • Computer Programming Concepts
                    </li>
                    <li>
                      • Software & Hardware Basics
                    </li>
                    <li>
                      • Programming Languages
                    </li>
                    <li>
                      • Compiler & Interpreter
                    </li>
                    <li>
                      • Algorithm Basics
                    </li>
                    <li>
                      • Flowcharts
                    </li>
                    <li>
                      • Problem Solving
                    </li>
                    <li>
                      • Logic Building
                    </li>
                  </ul>
                </div>
              </div>
              <div className="accordion-item border border-slate-200 rounded-2xl mb-4 overflow-hidden">
                <button data-inline-onclick="toggleAccordion(this)" className="w-full flex items-center justify-between gap-5 p-5 text-left bg-white hover:bg-slate-50">
                  <span className="font-bold">
                    {" "}02. Python Installation & Environment{" "}
                  </span>
                  <span className="rotate-icon text-xl">
                    ⌄
                  </span>
                </button>
                <div className="accordion-content px-5 pb-5">
                  <ul className="grid sm:grid-cols-2 gap-2 text-sm text-slate-600">
                    <li>
                      • Python Installation
                    </li>
                    <li>
                      • Python Versions
                    </li>
                    <li>
                      • Python Interpreter
                    </li>
                    <li>
                      • IDLE
                    </li>
                    <li>
                      • VS Code Setup
                    </li>
                    <li>
                      • PyCharm Introduction
                    </li>
                    <li>
                      • Virtual Environment
                    </li>
                    <li>
                      • pip Package Manager
                    </li>
                  </ul>
                </div>
              </div>
              <div className="accordion-item border border-slate-200 rounded-2xl mb-4 overflow-hidden">
                <button data-inline-onclick="toggleAccordion(this)" className="w-full flex items-center justify-between gap-5 p-5 text-left bg-white hover:bg-slate-50">
                  <span className="font-bold">
                    {" "}03. Python Syntax & Variables{" "}
                  </span>
                  <span className="rotate-icon text-xl">
                    ⌄
                  </span>
                </button>
                <div className="accordion-content px-5 pb-5">
                  <ul className="grid sm:grid-cols-2 gap-2 text-sm text-slate-600">
                    <li>
                      • Python Syntax
                    </li>
                    <li>
                      • Comments
                    </li>
                    <li>
                      • Variables
                    </li>
                    <li>
                      • Data Types
                    </li>
                    <li>
                      • Type Conversion
                    </li>
                    <li>
                      • Operators
                    </li>
                    <li>
                      • Input & Output
                    </li>
                    <li>
                      • String Formatting
                    </li>
                  </ul>
                </div>
              </div>
              <div className="accordion-item border border-slate-200 rounded-2xl mb-4 overflow-hidden">
                <button data-inline-onclick="toggleAccordion(this)" className="w-full flex items-center justify-between gap-5 p-5 text-left bg-white hover:bg-slate-50">
                  <span className="font-bold">
                    {" "}04. Conditional Statements & Loops{" "}
                  </span>
                  <span className="rotate-icon text-xl">
                    ⌄
                  </span>
                </button>
                <div className="accordion-content px-5 pb-5">
                  <ul className="grid sm:grid-cols-2 gap-2 text-sm text-slate-600">
                    <li>
                      • if Statement
                    </li>
                    <li>
                      • if-else
                    </li>
                    <li>
                      • elif
                    </li>
                    <li>
                      • Nested Conditions
                    </li>
                    <li>
                      • for Loop
                    </li>
                    <li>
                      • while Loop
                    </li>
                    <li>
                      • break & continue
                    </li>
                    <li>
                      • range()
                    </li>
                  </ul>
                </div>
              </div>
              <div className="accordion-item border border-slate-200 rounded-2xl mb-4 overflow-hidden">
                <button data-inline-onclick="toggleAccordion(this)" className="w-full flex items-center justify-between gap-5 p-5 text-left bg-white hover:bg-slate-50">
                  <span className="font-bold">
                    {" "}05. Python Collections{" "}
                  </span>
                  <span className="rotate-icon text-xl">
                    ⌄
                  </span>
                </button>
                <div className="accordion-content px-5 pb-5">
                  <ul className="grid sm:grid-cols-2 gap-2 text-sm text-slate-600">
                    <li>
                      • List
                    </li>
                    <li>
                      • Tuple
                    </li>
                    <li>
                      • Set
                    </li>
                    <li>
                      • Dictionary
                    </li>
                    <li>
                      • Indexing
                    </li>
                    <li>
                      • Slicing
                    </li>
                    <li>
                      • List Comprehension
                    </li>
                    <li>
                      • Collection Methods
                    </li>
                  </ul>
                </div>
              </div>
              <div className="accordion-item border border-slate-200 rounded-2xl mb-4 overflow-hidden">
                <button data-inline-onclick="toggleAccordion(this)" className="w-full flex items-center justify-between gap-5 p-5 text-left bg-white hover:bg-slate-50">
                  <span className="font-bold">
                    {" "}06. Functions & Modules{" "}
                  </span>
                  <span className="rotate-icon text-xl">
                    ⌄
                  </span>
                </button>
                <div className="accordion-content px-5 pb-5">
                  <ul className="grid sm:grid-cols-2 gap-2 text-sm text-slate-600">
                    <li>
                      • Function Creation
                    </li>
                    <li>
                      • Parameters & Arguments
                    </li>
                    <li>
                      • Return Values
                    </li>
                    <li>
                      • Default Arguments
                    </li>
                    <li>
                      • Lambda Functions
                    </li>
                    <li>
                      • Modules
                    </li>
                    <li>
                      • Packages
                    </li>
                    <li>
                      • Import System
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="mt-14">
              <div className="mb-5">
                <span className="text-xs font-black uppercase tracking-widest text-purple-600">
                  {" "}PART B{" "}
                </span>
                <h3 className="text-2xl font-black mt-1">
                  Advanced Python Programming
                </h3>
              </div>
              <div className="accordion-item border border-slate-200 rounded-2xl mb-4 overflow-hidden">
                <button data-inline-onclick="toggleAccordion(this)" className="w-full flex items-center justify-between gap-5 p-5 text-left bg-white hover:bg-slate-50">
                  <span className="font-bold">
                    {" "}07. Object Oriented Programming{" "}
                  </span>
                  <span className="rotate-icon text-xl">
                    ⌄
                  </span>
                </button>
                <div className="accordion-content px-5 pb-5">
                  <ul className="grid sm:grid-cols-2 gap-2 text-sm text-slate-600">
                    <li>
                      • Classes & Objects
                    </li>
                    <li>
                      • Constructors
                    </li>
                    <li>
                      • Instance Variables
                    </li>
                    <li>
                      • Methods
                    </li>
                    <li>
                      • Inheritance
                    </li>
                    <li>
                      • Polymorphism
                    </li>
                    <li>
                      • Encapsulation
                    </li>
                    <li>
                      • Abstraction
                    </li>
                  </ul>
                </div>
              </div>
              <div className="accordion-item border border-slate-200 rounded-2xl mb-4 overflow-hidden">
                <button data-inline-onclick="toggleAccordion(this)" className="w-full flex items-center justify-between gap-5 p-5 text-left bg-white hover:bg-slate-50">
                  <span className="font-bold">
                    {" "}08. File Handling & Exception Handling{" "}
                  </span>
                  <span className="rotate-icon text-xl">
                    ⌄
                  </span>
                </button>
                <div className="accordion-content px-5 pb-5">
                  <ul className="grid sm:grid-cols-2 gap-2 text-sm text-slate-600">
                    <li>
                      • Read Files
                    </li>
                    <li>
                      • Write Files
                    </li>
                    <li>
                      • CSV Files
                    </li>
                    <li>
                      • JSON Files
                    </li>
                    <li>
                      • try-except
                    </li>
                    <li>
                      • finally
                    </li>
                    <li>
                      • Custom Exceptions
                    </li>
                    <li>
                      • Error Debugging
                    </li>
                  </ul>
                </div>
              </div>
              <div className="accordion-item border border-slate-200 rounded-2xl mb-4 overflow-hidden">
                <button data-inline-onclick="toggleAccordion(this)" className="w-full flex items-center justify-between gap-5 p-5 text-left bg-white hover:bg-slate-50">
                  <span className="font-bold">
                    {" "}09. Advanced Python Concepts{" "}
                  </span>
                  <span className="rotate-icon text-xl">
                    ⌄
                  </span>
                </button>
                <div className="accordion-content px-5 pb-5">
                  <ul className="grid sm:grid-cols-2 gap-2 text-sm text-slate-600">
                    <li>
                      • Iterators
                    </li>
                    <li>
                      • Generators
                    </li>
                    <li>
                      • Decorators
                    </li>
                    <li>
                      • Regular Expressions
                    </li>
                    <li>
                      • Date & Time
                    </li>
                    <li>
                      • Virtual Environment
                    </li>
                    <li>
                      • Package Management
                    </li>
                    <li>
                      • Debugging Techniques
                    </li>
                  </ul>
                </div>
              </div>
              <div className="accordion-item border border-slate-200 rounded-2xl mb-4 overflow-hidden">
                <button data-inline-onclick="toggleAccordion(this)" className="w-full flex items-center justify-between gap-5 p-5 text-left bg-white hover:bg-slate-50">
                  <span className="font-bold">
                    {" "}10. Python Libraries{" "}
                  </span>
                  <span className="rotate-icon text-xl">
                    ⌄
                  </span>
                </button>
                <div className="accordion-content px-5 pb-5">
                  <ul className="grid sm:grid-cols-2 gap-2 text-sm text-slate-600">
                    <li>
                      • NumPy Introduction
                    </li>
                    <li>
                      • Pandas Introduction
                    </li>
                    <li>
                      • Matplotlib
                    </li>
                    <li>
                      • Requests
                    </li>
                    <li>
                      • BeautifulSoup
                    </li>
                    <li>
                      • OpenPyXL
                    </li>
                    <li>
                      • OS Module
                    </li>
                    <li>
                      • Automation Libraries
                    </li>
                  </ul>
                </div>
              </div>
              <div className="accordion-item border border-slate-200 rounded-2xl mb-4 overflow-hidden">
                <button data-inline-onclick="toggleAccordion(this)" className="w-full flex items-center justify-between gap-5 p-5 text-left bg-white hover:bg-slate-50">
                  <span className="font-bold">
                    {" "}11. Python Database Programming{" "}
                  </span>
                  <span className="rotate-icon text-xl">
                    ⌄
                  </span>
                </button>
                <div className="accordion-content px-5 pb-5">
                  <ul className="grid sm:grid-cols-2 gap-2 text-sm text-slate-600">
                    <li>
                      • Database Concepts
                    </li>
                    <li>
                      • MySQL
                    </li>
                    <li>
                      • SQLite
                    </li>
                    <li>
                      • Database Connection
                    </li>
                    <li>
                      • SQL Queries
                    </li>
                    <li>
                      • CRUD Operations
                    </li>
                    <li>
                      • Joins
                    </li>
                    <li>
                      • Python Database Application
                    </li>
                  </ul>
                </div>
              </div>
              <div className="accordion-item border border-slate-200 rounded-2xl mb-4 overflow-hidden">
                <button data-inline-onclick="toggleAccordion(this)" className="w-full flex items-center justify-between gap-5 p-5 text-left bg-white hover:bg-slate-50">
                  <span className="font-bold">
                    {" "}12. Git & GitHub{" "}
                  </span>
                  <span className="rotate-icon text-xl">
                    ⌄
                  </span>
                </button>
                <div className="accordion-content px-5 pb-5">
                  <ul className="grid sm:grid-cols-2 gap-2 text-sm text-slate-600">
                    <li>
                      • Git Installation
                    </li>
                    <li>
                      • Repository
                    </li>
                    <li>
                      • Commit
                    </li>
                    <li>
                      • Branch
                    </li>
                    <li>
                      • Merge
                    </li>
                    <li>
                      • GitHub
                    </li>
                    <li>
                      • Push & Pull
                    </li>
                    <li>
                      • Project Version Control
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="mt-14">
              <div className="mb-5">
                <span className="text-xs font-black uppercase tracking-widest text-pink-600">
                  {" "}PART C{" "}
                </span>
                <h3 className="text-2xl font-black mt-1">
                  Python Web Development
                </h3>
              </div>
              <div className="accordion-item border border-slate-200 rounded-2xl mb-4 overflow-hidden">
                <button data-inline-onclick="toggleAccordion(this)" className="w-full flex items-center justify-between gap-5 p-5 text-left bg-white hover:bg-slate-50">
                  <span className="font-bold">
                    {" "}13. HTML, CSS & JavaScript for Python Developers{" "}
                  </span>
                  <span className="rotate-icon text-xl">
                    ⌄
                  </span>
                </button>
                <div className="accordion-content px-5 pb-5">
                  <ul className="grid sm:grid-cols-2 gap-2 text-sm text-slate-600">
                    <li>
                      • HTML5
                    </li>
                    <li>
                      • CSS3
                    </li>
                    <li>
                      • Responsive Design
                    </li>
                    <li>
                      • JavaScript Basics
                    </li>
                    <li>
                      • Forms
                    </li>
                    <li>
                      • Bootstrap / Tailwind Basics
                    </li>
                    <li>
                      • Browser Developer Tools
                    </li>
                    <li>
                      • Frontend & Backend Connection
                    </li>
                  </ul>
                </div>
              </div>
              <div className="accordion-item border border-slate-200 rounded-2xl mb-4 overflow-hidden">
                <button data-inline-onclick="toggleAccordion(this)" className="w-full flex items-center justify-between gap-5 p-5 text-left bg-white hover:bg-slate-50">
                  <span className="font-bold">
                    {" "}14. Django Framework{" "}
                  </span>
                  <span className="rotate-icon text-xl">
                    ⌄
                  </span>
                </button>
                <div className="accordion-content px-5 pb-5">
                  <ul className="grid sm:grid-cols-2 gap-2 text-sm text-slate-600">
                    <li>
                      • Django Introduction
                    </li>
                    <li>
                      • Project Setup
                    </li>
                    <li>
                      • Apps
                    </li>
                    <li>
                      • URLs
                    </li>
                    <li>
                      • Views
                    </li>
                    <li>
                      • Templates
                    </li>
                    <li>
                      • Static Files
                    </li>
                    <li>
                      • Django Architecture
                    </li>
                  </ul>
                </div>
              </div>
              <div className="accordion-item border border-slate-200 rounded-2xl mb-4 overflow-hidden">
                <button data-inline-onclick="toggleAccordion(this)" className="w-full flex items-center justify-between gap-5 p-5 text-left bg-white hover:bg-slate-50">
                  <span className="font-bold">
                    {" "}15. Django Models & Database{" "}
                  </span>
                  <span className="rotate-icon text-xl">
                    ⌄
                  </span>
                </button>
                <div className="accordion-content px-5 pb-5">
                  <ul className="grid sm:grid-cols-2 gap-2 text-sm text-slate-600">
                    <li>
                      • Django Models
                    </li>
                    <li>
                      • Migrations
                    </li>
                    <li>
                      • ORM
                    </li>
                    <li>
                      • QuerySets
                    </li>
                    <li>
                      • Relationships
                    </li>
                    <li>
                      • Admin Panel
                    </li>
                    <li>
                      • CRUD
                    </li>
                    <li>
                      • Database Integration
                    </li>
                  </ul>
                </div>
              </div>
              <div className="accordion-item border border-slate-200 rounded-2xl mb-4 overflow-hidden">
                <button data-inline-onclick="toggleAccordion(this)" className="w-full flex items-center justify-between gap-5 p-5 text-left bg-white hover:bg-slate-50">
                  <span className="font-bold">
                    {" "}16. Django Forms & Authentication{" "}
                  </span>
                  <span className="rotate-icon text-xl">
                    ⌄
                  </span>
                </button>
                <div className="accordion-content px-5 pb-5">
                  <ul className="grid sm:grid-cols-2 gap-2 text-sm text-slate-600">
                    <li>
                      • Django Forms
                    </li>
                    <li>
                      • Form Validation
                    </li>
                    <li>
                      • User Registration
                    </li>
                    <li>
                      • Login / Logout
                    </li>
                    <li>
                      • Password Management
                    </li>
                    <li>
                      • Sessions
                    </li>
                    <li>
                      • Permissions
                    </li>
                    <li>
                      • User Dashboard
                    </li>
                  </ul>
                </div>
              </div>
              <div className="accordion-item border border-slate-200 rounded-2xl mb-4 overflow-hidden">
                <button data-inline-onclick="toggleAccordion(this)" className="w-full flex items-center justify-between gap-5 p-5 text-left bg-white hover:bg-slate-50">
                  <span className="font-bold">
                    {" "}17. Flask Framework{" "}
                  </span>
                  <span className="rotate-icon text-xl">
                    ⌄
                  </span>
                </button>
                <div className="accordion-content px-5 pb-5">
                  <ul className="grid sm:grid-cols-2 gap-2 text-sm text-slate-600">
                    <li>
                      • Flask Introduction
                    </li>
                    <li>
                      • Flask Installation
                    </li>
                    <li>
                      • Routes
                    </li>
                    <li>
                      • Views
                    </li>
                    <li>
                      • Templates
                    </li>
                    <li>
                      • Forms
                    </li>
                    <li>
                      • Database Integration
                    </li>
                    <li>
                      • Flask Application
                    </li>
                  </ul>
                </div>
              </div>
              <div className="accordion-item border border-slate-200 rounded-2xl mb-4 overflow-hidden">
                <button data-inline-onclick="toggleAccordion(this)" className="w-full flex items-center justify-between gap-5 p-5 text-left bg-white hover:bg-slate-50">
                  <span className="font-bold">
                    {" "}18. REST API Development{" "}
                  </span>
                  <span className="rotate-icon text-xl">
                    ⌄
                  </span>
                </button>
                <div className="accordion-content px-5 pb-5">
                  <ul className="grid sm:grid-cols-2 gap-2 text-sm text-slate-600">
                    <li>
                      • API Concepts
                    </li>
                    <li>
                      • REST Architecture
                    </li>
                    <li>
                      • HTTP Methods
                    </li>
                    <li>
                      • JSON
                    </li>
                    <li>
                      • GET / POST
                    </li>
                    <li>
                      • PUT / DELETE
                    </li>
                    <li>
                      • API Authentication
                    </li>
                    <li>
                      • Postman Testing
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="mt-14">
              <div className="mb-5">
                <span className="text-xs font-black uppercase tracking-widest text-green-600">
                  {" "}PART D{" "}
                </span>
                <h3 className="text-2xl font-black mt-1">
                  Professional Projects & Career
                </h3>
              </div>
              <div className="accordion-item border border-slate-200 rounded-2xl mb-4 overflow-hidden">
                <button data-inline-onclick="toggleAccordion(this)" className="w-full flex items-center justify-between gap-5 p-5 text-left bg-white hover:bg-slate-50">
                  <span className="font-bold">
                    {" "}19. Python Automation{" "}
                  </span>
                  <span className="rotate-icon text-xl">
                    ⌄
                  </span>
                </button>
                <div className="accordion-content px-5 pb-5">
                  <ul className="grid sm:grid-cols-2 gap-2 text-sm text-slate-600">
                    <li>
                      • File Automation
                    </li>
                    <li>
                      • Excel Automation
                    </li>
                    <li>
                      • PDF Automation
                    </li>
                    <li>
                      • Email Automation
                    </li>
                    <li>
                      • Folder Management
                    </li>
                    <li>
                      • Web Requests
                    </li>
                    <li>
                      • Data Processing
                    </li>
                    <li>
                      • Productivity Scripts
                    </li>
                  </ul>
                </div>
              </div>
              <div className="accordion-item border border-slate-200 rounded-2xl mb-4 overflow-hidden">
                <button data-inline-onclick="toggleAccordion(this)" className="w-full flex items-center justify-between gap-5 p-5 text-left bg-white hover:bg-slate-50">
                  <span className="font-bold">
                    {" "}20. Admin Dashboard Development{" "}
                  </span>
                  <span className="rotate-icon text-xl">
                    ⌄
                  </span>
                </button>
                <div className="accordion-content px-5 pb-5">
                  <ul className="grid sm:grid-cols-2 gap-2 text-sm text-slate-600">
                    <li>
                      • Admin Login
                    </li>
                    <li>
                      • Dashboard
                    </li>
                    <li>
                      • User Management
                    </li>
                    <li>
                      • CRUD System
                    </li>
                    <li>
                      • Reports
                    </li>
                    <li>
                      • Search & Filters
                    </li>
                    <li>
                      • Role Management
                    </li>
                    <li>
                      • Responsive Dashboard
                    </li>
                  </ul>
                </div>
              </div>
              <div className="accordion-item border border-slate-200 rounded-2xl mb-4 overflow-hidden">
                <button data-inline-onclick="toggleAccordion(this)" className="w-full flex items-center justify-between gap-5 p-5 text-left bg-white hover:bg-slate-50">
                  <span className="font-bold">
                    {" "}21. Business Management System{" "}
                  </span>
                  <span className="rotate-icon text-xl">
                    ⌄
                  </span>
                </button>
                <div className="accordion-content px-5 pb-5">
                  <ul className="grid sm:grid-cols-2 gap-2 text-sm text-slate-600">
                    <li>
                      • Customer Management
                    </li>
                    <li>
                      • Product Management
                    </li>
                    <li>
                      • Sales Management
                    </li>
                    <li>
                      • Invoice System
                    </li>
                    <li>
                      • Payment Tracking
                    </li>
                    <li>
                      • Reports
                    </li>
                    <li>
                      • Search
                    </li>
                    <li>
                      • Dashboard
                    </li>
                  </ul>
                </div>
              </div>
              <div className="accordion-item border border-slate-200 rounded-2xl mb-4 overflow-hidden">
                <button data-inline-onclick="toggleAccordion(this)" className="w-full flex items-center justify-between gap-5 p-5 text-left bg-white hover:bg-slate-50">
                  <span className="font-bold">
                    {" "}22. Student / Institute Management System{" "}
                  </span>
                  <span className="rotate-icon text-xl">
                    ⌄
                  </span>
                </button>
                <div className="accordion-content px-5 pb-5">
                  <ul className="grid sm:grid-cols-2 gap-2 text-sm text-slate-600">
                    <li>
                      • Student Registration
                    </li>
                    <li>
                      • Course Management
                    </li>
                    <li>
                      • Batch Management
                    </li>
                    <li>
                      • Attendance
                    </li>
                    <li>
                      • Fees Management
                    </li>
                    <li>
                      • Certificate Records
                    </li>
                    <li>
                      • Student Search
                    </li>
                    <li>
                      • Admin Dashboard
                    </li>
                  </ul>
                </div>
              </div>
              <div className="accordion-item border border-slate-200 rounded-2xl mb-4 overflow-hidden">
                <button data-inline-onclick="toggleAccordion(this)" className="w-full flex items-center justify-between gap-5 p-5 text-left bg-white hover:bg-slate-50">
                  <span className="font-bold">
                    {" "}23. E-Commerce / Web Application{" "}
                  </span>
                  <span className="rotate-icon text-xl">
                    ⌄
                  </span>
                </button>
                <div className="accordion-content px-5 pb-5">
                  <ul className="grid sm:grid-cols-2 gap-2 text-sm text-slate-600">
                    <li>
                      • Product Catalog
                    </li>
                    <li>
                      • User Registration
                    </li>
                    <li>
                      • Shopping Cart
                    </li>
                    <li>
                      • Orders
                    </li>
                    <li>
                      • Admin Panel
                    </li>
                    <li>
                      • Database
                    </li>
                    <li>
                      • API Integration
                    </li>
                    <li>
                      • Deployment
                    </li>
                  </ul>
                </div>
              </div>
              <div className="accordion-item border border-slate-200 rounded-2xl mb-4 overflow-hidden">
                <button data-inline-onclick="toggleAccordion(this)" className="w-full flex items-center justify-between gap-5 p-5 text-left bg-white hover:bg-slate-50">
                  <span className="font-bold">
                    {" "}24. Final Python Project & Deployment{" "}
                  </span>
                  <span className="rotate-icon text-xl">
                    ⌄
                  </span>
                </button>
                <div className="accordion-content px-5 pb-5">
                  <ul className="grid sm:grid-cols-2 gap-2 text-sm text-slate-600">
                    <li>
                      • Project Planning
                    </li>
                    <li>
                      • Database Design
                    </li>
                    <li>
                      • Backend Development
                    </li>
                    <li>
                      • Frontend Integration
                    </li>
                    <li>
                      • Authentication
                    </li>
                    <li>
                      • API Integration
                    </li>
                    <li>
                      • GitHub Project
                    </li>
                    <li>
                      • Deployment
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="projects" className="py-20 bg-slate-50">
          <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="text-blue-600 font-bold text-sm uppercase tracking-widest">
                {" "}Practical Training{" "}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black mt-3">
                Live Projects
              </h2>
              <p className="text-slate-500 mt-4">
                Build projects that strengthen your portfolio.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft">
                <div className="text-3xl">
                  🏢
                </div>
                <h3 className="font-black mt-5">
                  Business Management
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Customer, product, sales and reporting system.
                </p>
              </div>
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft">
                <div className="text-3xl">
                  🎓
                </div>
                <h3 className="font-black mt-5">
                  Student Management
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Student, batch, fees and attendance system.
                </p>
              </div>
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft">
                <div className="text-3xl">
                  🛒
                </div>
                <h3 className="font-black mt-5">
                  E-Commerce Application
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Products, users, cart and order management.
                </p>
              </div>
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft">
                <div className="text-3xl">
                  🔗
                </div>
                <h3 className="font-black mt-5">
                  REST API Project
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Professional API with authentication and database.
                </p>
              </div>
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft">
                <div className="text-3xl">
                  📊
                </div>
                <h3 className="font-black mt-5">
                  Admin Dashboard
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Responsive dashboard with CRUD and reports.
                </p>
              </div>
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft">
                <div className="text-3xl">
                  📁
                </div>
                <h3 className="font-black mt-5">
                  Automation Tool
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Python-based file and data automation tool.
                </p>
              </div>
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft">
                <div className="text-3xl">
                  📝
                </div>
                <h3 className="font-black mt-5">
                  Blog / News Portal
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Dynamic content management application.
                </p>
              </div>
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft">
                <div className="text-3xl">
                  🚀
                </div>
                <h3 className="font-black mt-5">
                  Final Python Project
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Complete professional Python application.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="career" className="py-20 bg-white">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
            <div className="text-center">
              <span className="text-blue-600 font-bold text-sm uppercase tracking-widest">
                {" "}Career Opportunities{" "}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black mt-3">
                Career After Python Course
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 font-bold">
                🐍 Python Developer
              </div>
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 font-bold">
                🌐 Django Developer
              </div>
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 font-bold">
                ⚙️ Backend Developer
              </div>
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 font-bold">
                🔗 API Developer
              </div>
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 font-bold">
                💻 Full Stack Developer
              </div>
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 font-bold">
                🤖 Automation Developer
              </div>
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 font-bold">
                📊 Python Data Developer
              </div>
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 font-bold">
                🚀 Software Developer
              </div>
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 font-bold">
                💼 Python Freelancer
              </div>
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 font-bold">
                🧑‍💻 Junior Python Developer
              </div>
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 font-bold">
                🔧 Flask Developer
              </div>
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 font-bold">
                🏢 Web Application Developer
              </div>
            </div>
          </div>
        </section>
        <section className="py-20 bg-slate-950 text-white">
          <div className="max-w-[1000px] mx-auto px-4 sm:px-6">
            <div className="text-center">
              <span className="text-blue-400 font-bold text-sm uppercase tracking-widest">
                {" "}Course Investment{" "}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black mt-3">
                Python Development Course
              </h2>
            </div>
            <div className="mt-10 bg-white text-slate-900 rounded-3xl p-7 sm:p-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                <div>
                  <div className="text-sm text-slate-500">
                    Complete Course Fee
                  </div>
                  <div className="text-5xl font-black mt-2">
                    ₹20,000
                  </div>
                  <div className="mt-2 text-slate-400 line-through">
                    Regular Fee ₹35,000
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    ✓ 6 Months Training
                  </div>
                  <div>
                    ✓ Online / Offline Classes
                  </div>
                  <div>
                    ✓ 8+ Practical Projects
                  </div>
                  <div>
                    ✓ Project Portfolio
                  </div>
                  <div>
                    ✓ Course Certificate
                  </div>
                  <div>
                    ✓ Career Guidance
                  </div>
                </div>
                <a href="#admission" className="px-7 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black text-center">
                  {" "}Join Python Course{" "}
                </a>
              </div>
            </div>
          </div>
        </section>
        <section className="py-20 bg-white">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
            <div className="grid md:grid-cols-2 gap-10">
              <div>
                <span className="text-blue-600 font-bold text-sm uppercase tracking-widest">
                  {" "}Eligibility{" "}
                </span>
                <h2 className="text-3xl font-black mt-3">
                  Who Can Join?
                </h2>
                <ul className="mt-7 space-y-4 text-slate-600">
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
                    ✓ Job Seekers
                  </li>
                  <li>
                    ✓ Freelancers
                  </li>
                  <li>
                    ✓ Aspiring Software Developers
                  </li>
                </ul>
              </div>
              <div>
                <span className="text-purple-600 font-bold text-sm uppercase tracking-widest">
                  {" "}Requirements{" "}
                </span>
                <h2 className="text-3xl font-black mt-3">
                  What You Need
                </h2>
                <ul className="mt-7 space-y-4 text-slate-600">
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
                    ✓ No Previous Python Experience Required
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        <section id="admission" className="py-20 bg-slate-50">
          <div className="max-w-[1000px] mx-auto px-4 sm:px-6">
            <div className="text-center">
              <span className="text-blue-600 font-bold text-sm uppercase tracking-widest">
                {" "}Admission{" "}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black mt-3">
                Start Your Python Career
              </h2>
              <p className="text-slate-500 mt-4">
                Fill the form and our admission team will contact you.
              </p>
            </div>
            <form id="admissionForm" className="mt-10 bg-white rounded-3xl p-6 sm:p-10 shadow-soft border border-slate-100">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-bold">
                    {" "}Student Name{" "}
                  </label>
                  {" "}
                  <input type="text" id="studentName" required placeholder="Enter your name" className="w-full mt-2 px-4 py-3.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-bold">
                    {" "}Mobile Number{" "}
                  </label>
                  {" "}
                  <input type="tel" id="mobile" required placeholder="Enter mobile number" className="w-full mt-2 px-4 py-3.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-bold">
                    {" "}Email{" "}
                  </label>
                  {" "}
                  <input type="email" id="email" placeholder="Enter email" className="w-full mt-2 px-4 py-3.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-bold">
                    {" "}Qualification{" "}
                  </label>
                  <select id="qualification" className="w-full mt-2 px-4 py-3.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500">
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
                      ITI
                    </option>
                    <option>
                      Diploma
                    </option>
                    <option>
                      Graduate
                    </option>
                    <option>
                      Post Graduate
                    </option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold">
                    {" "}Interested Course{" "}
                  </label>
                  <select id="course" className="w-full mt-2 px-4 py-3.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500">
                    <option>
                      Python Programming & Development
                    </option>
                    <option>
                      Python + Django
                    </option>
                    <option>
                      Python Web Development
                    </option>
                    <option>
                      Python Automation
                    </option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold">
                    {" "}Preferred Mode{" "}
                  </label>
                  <select id="mode" className="w-full mt-2 px-4 py-3.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500">
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
              </div>
              <div className="mt-5">
                <label className="text-sm font-bold">
                  {" "}Message{" "}
                </label>
                {" "}
                <textarea id="message" rows={4} placeholder="Any query..." className="w-full mt-2 px-4 py-3.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <button type="submit" className="w-full mt-6 py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black shadow-lg hover:-translate-y-1 transition">
                {" "}Apply via WhatsApp →{" "}
              </button>
            </form>
          </div>
        </section>
        <section className="py-20">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
            <div className="rounded-[2rem] hero-bg text-white p-8 sm:p-12 text-center">
              <div className="text-5xl">
                🏆
              </div>
              <h2 className="text-3xl sm:text-4xl font-black mt-5">
                Get Your Course Certificate
              </h2>
              <p className="text-slate-200 max-w-2xl mx-auto mt-4 leading-7">
                Complete the required training and practical projects to receive your Python Programming course certificate from Career Optics Computer Centre.
              </p>
              <a href="#admission" className="inline-block mt-7 bg-white text-blue-700 px-7 py-3.5 rounded-xl font-black">
                {" "}Enroll Now{" "}
              </a>
            </div>
          </div>
        </section>
        <section id="faq" className="py-20 bg-slate-50">
          <div className="max-w-[900px] mx-auto px-4 sm:px-6">
            <div className="text-center">
              <span className="text-blue-600 font-bold text-sm uppercase tracking-widest">
                {" "}FAQ{" "}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black mt-3">
                Frequently Asked Questions
              </h2>
            </div>
            <div className="mt-10">
              <div className="faq-item bg-white rounded-2xl border border-slate-200 mb-4 overflow-hidden">
                <button data-inline-onclick="toggleFaq(this)" className="w-full flex items-center justify-between p-5 text-left">
                  <span className="font-bold">
                    {" "}Is Python suitable for beginners?{" "}
                  </span>
                  <span className="rotate-icon text-xl">
                    {" "}⌄{" "}
                  </span>
                </button>
                <div className="accordion-content px-5 pb-5 text-slate-600 text-sm leading-7">
                  Yes. The course starts from programming fundamentals and gradually moves toward advanced Python, web development, APIs and projects.
                </div>
              </div>
              <div className="faq-item bg-white rounded-2xl border border-slate-200 mb-4 overflow-hidden">
                <button data-inline-onclick="toggleFaq(this)" className="w-full flex items-center justify-between p-5 text-left">
                  <span className="font-bold">
                    {" "}Is Django included?{" "}
                  </span>
                  <span className="rotate-icon text-xl">
                    {" "}⌄{" "}
                  </span>
                </button>
                <div className="accordion-content px-5 pb-5 text-slate-600 text-sm leading-7">
                  Yes. Django fundamentals, models, templates, forms, authentication, CRUD and project development are included.
                </div>
              </div>
              <div className="faq-item bg-white rounded-2xl border border-slate-200 mb-4 overflow-hidden">
                <button data-inline-onclick="toggleFaq(this)" className="w-full flex items-center justify-between p-5 text-left">
                  <span className="font-bold">
                    {" "}Will I learn database connectivity?{" "}
                  </span>
                  <span className="rotate-icon text-xl">
                    {" "}⌄{" "}
                  </span>
                </button>
                <div className="accordion-content px-5 pb-5 text-slate-600 text-sm leading-7">
                  Yes. MySQL, SQLite, SQL queries, CRUD operations and Python database connectivity are covered.
                </div>
              </div>
              <div className="faq-item bg-white rounded-2xl border border-slate-200 mb-4 overflow-hidden">
                <button data-inline-onclick="toggleFaq(this)" className="w-full flex items-center justify-between p-5 text-left">
                  <span className="font-bold">
                    {" "}Will I build live projects?{" "}
                  </span>
                  <span className="rotate-icon text-xl">
                    {" "}⌄{" "}
                  </span>
                </button>
                <div className="accordion-content px-5 pb-5 text-slate-600 text-sm leading-7">
                  Yes. Students work on multiple practical projects including management systems, dashboards, APIs, automation tools and web applications.
                </div>
              </div>
              <div className="faq-item bg-white rounded-2xl border border-slate-200 mb-4 overflow-hidden">
                <button data-inline-onclick="toggleFaq(this)" className="w-full flex items-center justify-between p-5 text-left">
                  <span className="font-bold">
                    {" "}Do I get a certificate?{" "}
                  </span>
                  <span className="rotate-icon text-xl">
                    {" "}⌄{" "}
                  </span>
                </button>
                <div className="accordion-content px-5 pb-5 text-slate-600 text-sm leading-7">
                  Yes. Eligible students receive a course completion certificate from Career Optics Computer Centre.
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="py-20 bg-white">
          <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-[2rem] p-8 sm:p-12 text-white text-center">
              <h2 className="text-3xl sm:text-5xl font-black">
                Start Your Python Journey Today
              </h2>
              <p className="mt-5 text-blue-100 max-w-2xl mx-auto">
                Learn Python, build real projects and prepare yourself for modern software development careers.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                <a href="#admission" className="px-7 py-3.5 rounded-xl bg-white text-blue-700 font-black">
                  {" "}Apply Now{" "}
                </a>
                <a href="#syllabus" className="px-7 py-3.5 rounded-xl bg-white/10 border border-white/30 font-bold">
                  {" "}View Syllabus{" "}
                </a>
              </div>
            </div>
          </div>
        </section>
        <footer className="bg-slate-950 text-slate-400">
          <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid md:grid-cols-3 gap-10">
              <div>
                <div className="text-white text-2xl font-black">
                  Career Optics Computer Centre
                </div>
                <p className="mt-4 text-sm leading-7">
                  Professional computer education, programming and career development.
                </p>
              </div>
              <div>
                <h3 className="text-white font-bold">
                  Python Course
                </h3>
                <div className="mt-4 space-y-2 text-sm">
                  <div>
                    Python Programming
                  </div>
                  <div>
                    Django Development
                  </div>
                  <div>
                    Flask Development
                  </div>
                  <div>
                    REST API
                  </div>
                  <div>
                    Automation
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-white font-bold">
                  Contact
                </h3>
                <div className="mt-4 space-y-2 text-sm">
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
            <div className="border-t border-slate-800 mt-10 pt-6 text-sm text-center">
              © 2026 Career Optics Computer Centre. All Rights Reserved.
            </div>
          </div>
        </footer>
        <a href="https://wa.me/919999999999" target="_blank" className="fixed right-5 bottom-5 z-50 w-14 h-14 rounded-full bg-green-500 text-white flex items-center justify-center text-2xl shadow-2xl hover:scale-110 transition" aria-label="WhatsApp">
          ☎
        </a>
        <script dangerouslySetInnerHTML={{ __html: js_51a1e090 }} />
        ```
      </body>
    </html>
  );
}
