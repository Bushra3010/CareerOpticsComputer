import css_cee26377 from "../styles/cee26377.css?raw";
import js_7a335205 from "../behaviour/7a335205.js?raw";
import js_90a066f6 from "../behaviour/90a066f6.js?raw";

/** java.html */
export default function Java() {
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
          Java Web & Software Development | Career Optics Computer Centre
        </title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script dangerouslySetInnerHTML={{ __html: js_90a066f6 }} />
        <style dangerouslySetInnerHTML={{ __html: css_cee26377 }} />
        <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
          <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-20 flex items-center justify-between">
              <a href="#" className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white font-black text-lg shadow-lg">
                  P
                </div>
                <div>
                  <div className="font-black text-xl text-slate-900 leading-none">
                    Career Optics Computer Centre
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500 mt-1">
                    Learn • Build • Grow
                  </div>
                </div>
              </a>
              <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold">
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
                <a href="#admission" className="px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-blue-600 transition">
                  {" "}Apply Now{" "}
                </a>
              </nav>
              <button id="menuBtn" className="lg:hidden w-11 h-11 rounded-xl border border-slate-200 flex items-center justify-center text-xl">
                ☰
              </button>
            </div>
            <div id="mobileMenu" className="hidden lg:hidden pb-5">
              <div className="grid gap-2">
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
        <div className="bg-white border-b border-slate-200 sticky top-20 z-40">
          <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-2 overflow-x-auto py-3">
              <a href="#overview" className="course-tab active whitespace-nowrap px-4 py-2 rounded-lg text-sm font-semibold">
                {" "}Overview{" "}
              </a>
              <a href="#syllabus" className="course-tab whitespace-nowrap px-4 py-2 rounded-lg text-sm font-semibold">
                {" "}Syllabus{" "}
              </a>
              <a href="#projects" className="course-tab whitespace-nowrap px-4 py-2 rounded-lg text-sm font-semibold">
                {" "}Projects{" "}
              </a>
              <a href="#career" className="course-tab whitespace-nowrap px-4 py-2 rounded-lg text-sm font-semibold">
                {" "}Career{" "}
              </a>
              <a href="#admission" className="course-tab whitespace-nowrap px-4 py-2 rounded-lg text-sm font-semibold">
                {" "}Admission{" "}
              </a>
              <a href="#faq" className="course-tab whitespace-nowrap px-4 py-2 rounded-lg text-sm font-semibold">
                {" "}FAQ{" "}
              </a>
            </div>
          </div>
        </div>
        <section className="hero-bg min-h-[600px] flex items-center">
          <div className="max-w-[1500px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="grid lg:grid-cols-[1.25fr_.75fr] gap-12 items-center">
              <div className="text-white">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-semibold mb-7">
                  <span className="w-2 h-2 rounded-full bg-green-400"></span>
                  Java Programming + Web Development
                </div>
                <h1 className="hero-title text-5xl lg:text-7xl font-black tracking-tight mb-6">
                  Java Web & Software{" "}
                  <span className="block text-violet-300">
                    {" "}Development{" "}
                  </span>
                </h1>
                <p className="text-lg lg:text-xl text-slate-200 max-w-3xl leading-relaxed mb-8">
                  Master Java from beginner to professional level with Core Java, OOP, JDBC, SQL, Spring Boot, REST API, database integration and real-world software projects.
                </p>
                <div className="flex flex-wrap gap-3 mb-10">
                  <span className="glass px-4 py-2 rounded-full text-sm">
                    {" "}Java{" "}
                  </span>
                  <span className="glass px-4 py-2 rounded-full text-sm">
                    {" "}OOP{" "}
                  </span>
                  <span className="glass px-4 py-2 rounded-full text-sm">
                    {" "}JDBC{" "}
                  </span>
                  <span className="glass px-4 py-2 rounded-full text-sm">
                    {" "}MySQL{" "}
                  </span>
                  <span className="glass px-4 py-2 rounded-full text-sm">
                    {" "}Spring Boot{" "}
                  </span>
                  <span className="glass px-4 py-2 rounded-full text-sm">
                    {" "}REST API{" "}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="glass rounded-2xl p-5">
                    <div className="text-2xl font-black">
                      ₹20,000
                    </div>
                    <div className="text-xs text-slate-300 mt-1">
                      Course Fee
                    </div>
                  </div>
                  <div className="glass rounded-2xl p-5">
                    <div className="text-2xl font-black">
                      6 Months
                    </div>
                    <div className="text-xs text-slate-300 mt-1">
                      Duration
                    </div>
                  </div>
                  <div className="glass rounded-2xl p-5">
                    <div className="text-2xl font-black">
                      Online / Offline
                    </div>
                    <div className="text-xs text-slate-300 mt-1">
                      Mode
                    </div>
                  </div>
                  <div className="glass rounded-2xl p-5">
                    <div className="text-2xl font-black">
                      8+
                    </div>
                    <div className="text-xs text-slate-300 mt-1">
                      Live Projects
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="bg-white rounded-3xl p-7 shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-xs uppercase tracking-wider font-bold text-blue-600">
                        Professional Program
                      </p>
                      <h2 className="text-2xl font-black text-slate-900 mt-1">
                        Java Development
                      </h2>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 text-white flex items-center justify-center font-black text-xl">
                      JAVA
                    </div>
                  </div>
                  <div className="space-y-4 mb-7">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <span className="text-slate-500">
                        {" "}Original Fee{" "}
                      </span>
                      <span className="font-bold line-through text-slate-400">
                        {" "}₹35,000{" "}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <span className="text-slate-500">
                        {" "}Offer Fee{" "}
                      </span>
                      <span className="text-2xl font-black text-blue-600">
                        {" "}₹20,000{" "}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <span className="text-slate-500">
                        {" "}Duration{" "}
                      </span>
                      <span className="font-bold">
                        {" "}6 Months{" "}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">
                        {" "}Projects{" "}
                      </span>
                      <span className="font-bold">
                        {" "}8+ Live Projects{" "}
                      </span>
                    </div>
                  </div>
                  <a href="#admission" className="block text-center bg-slate-900 hover:bg-blue-600 text-white font-bold py-4 rounded-xl transition">
                    {" "}Apply for Java Course →{" "}
                  </a>
                  <p className="text-center text-xs text-slate-400 mt-4">
                    Limited seats available
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="overview" className="py-20">
          <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-[1.2fr_.8fr] gap-12">
              <div>
                <p className="text-sm font-bold text-blue-600 uppercase tracking-wider">
                  Course Overview
                </p>
                <h2 className="text-4xl font-black mt-3 mb-6">
                  Become a Professional Java Developer
                </h2>
                <p className="text-slate-600 leading-8 text-lg">
                  This program is designed to take students from basic programming concepts to professional Java application development. You will learn Core Java, Object-Oriented Programming, database connectivity, MySQL, Spring Boot, REST APIs and professional development practices.
                </p>
                <p className="text-slate-600 leading-8 text-lg mt-5">
                  The course focuses heavily on practical training, coding exercises, assignments and real-world projects so that students can build a professional portfolio.
                </p>
                <div className="mt-10">
                  <h3 className="text-2xl font-black mb-5">
                    What You Will Learn
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-5 bg-white border rounded-2xl shadow-sm">
                      ✓ Java Programming Fundamentals
                    </div>
                    <div className="p-5 bg-white border rounded-2xl shadow-sm">
                      ✓ Object-Oriented Programming
                    </div>
                    <div className="p-5 bg-white border rounded-2xl shadow-sm">
                      ✓ Collections & Exception Handling
                    </div>
                    <div className="p-5 bg-white border rounded-2xl shadow-sm">
                      ✓ MySQL Database
                    </div>
                    <div className="p-5 bg-white border rounded-2xl shadow-sm">
                      ✓ JDBC Database Connectivity
                    </div>
                    <div className="p-5 bg-white border rounded-2xl shadow-sm">
                      ✓ Spring Boot Development
                    </div>
                    <div className="p-5 bg-white border rounded-2xl shadow-sm">
                      ✓ REST API Development
                    </div>
                    <div className="p-5 bg-white border rounded-2xl shadow-sm">
                      ✓ Professional Java Projects
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-5">
                <div className="bg-white rounded-3xl p-7 shadow-soft border">
                  <div className="text-3xl mb-4">
                    ☕
                  </div>
                  <h3 className="font-black text-xl mb-2">
                    Core Java
                  </h3>
                  <p className="text-slate-500 leading-7">
                    Learn Java syntax, variables, loops, methods, OOP, collections, exceptions, file handling and advanced programming.
                  </p>
                </div>
                <div className="bg-white rounded-3xl p-7 shadow-soft border">
                  <div className="text-3xl mb-4">
                    🗄️
                  </div>
                  <h3 className="font-black text-xl mb-2">
                    Database & JDBC
                  </h3>
                  <p className="text-slate-500 leading-7">
                    Work with MySQL databases and connect Java applications using JDBC.
                  </p>
                </div>
                <div className="bg-white rounded-3xl p-7 shadow-soft border">
                  <div className="text-3xl mb-4">
                    🚀
                  </div>
                  <h3 className="font-black text-xl mb-2">
                    Spring Boot
                  </h3>
                  <p className="text-slate-500 leading-7">
                    Build modern backend applications and REST APIs using Spring Boot.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="py-16 bg-white">
          <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <p className="text-blue-600 font-bold text-sm uppercase">
                Technology Stack
              </p>
              <h2 className="text-3xl font-black mt-2">
                Tools & Technologies Covered
              </h2>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <span className="px-5 py-3 rounded-xl bg-slate-50 border font-semibold">
                {" "}Java{" "}
              </span>
              <span className="px-5 py-3 rounded-xl bg-slate-50 border font-semibold">
                {" "}JDK{" "}
              </span>
              <span className="px-5 py-3 rounded-xl bg-slate-50 border font-semibold">
                {" "}IntelliJ IDEA{" "}
              </span>
              <span className="px-5 py-3 rounded-xl bg-slate-50 border font-semibold">
                {" "}Eclipse{" "}
              </span>
              <span className="px-5 py-3 rounded-xl bg-slate-50 border font-semibold">
                {" "}VS Code{" "}
              </span>
              <span className="px-5 py-3 rounded-xl bg-slate-50 border font-semibold">
                {" "}MySQL{" "}
              </span>
              <span className="px-5 py-3 rounded-xl bg-slate-50 border font-semibold">
                {" "}JDBC{" "}
              </span>
              <span className="px-5 py-3 rounded-xl bg-slate-50 border font-semibold">
                {" "}Spring Boot{" "}
              </span>
              <span className="px-5 py-3 rounded-xl bg-slate-50 border font-semibold">
                {" "}Spring MVC{" "}
              </span>
              <span className="px-5 py-3 rounded-xl bg-slate-50 border font-semibold">
                {" "}REST API{" "}
              </span>
              <span className="px-5 py-3 rounded-xl bg-slate-50 border font-semibold">
                {" "}Git & GitHub{" "}
              </span>
            </div>
          </div>
        </section>
        <section id="syllabus" className="py-20 bg-slate-50">
          <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <p className="text-blue-600 font-bold text-sm uppercase">
                Complete Curriculum
              </p>
              <h2 className="text-4xl font-black mt-3">
                Java Development Syllabus
              </h2>
              <p className="text-slate-500 mt-4">
                24 detailed modules • Beginner to Professional
              </p>
            </div>
            <div className="mb-10">
              <div className="mb-5">
                <span className="inline-block px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-bold">
                  {" "}PART A — PROGRAMMING FOUNDATION{" "}
                </span>
              </div>
              <div className="space-y-3">
                <details className="bg-white rounded-2xl border shadow-sm">
                  {" "}
                  <summary className="p-5 flex justify-between items-center">
                    <div>
                      <span className="font-bold">
                        01.
                      </span>
                      {" "}Web & Software Development Fundamentals
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </summary>
                  <div className="px-5 pb-5 text-slate-600 leading-8">
                    • Software development introduction
                    <br />
                    • Client & server concepts
                    <br />
                    • Programming languages overview
                    <br />
                    • Compiler & interpreter
                    <br />
                    • IDE setup
                    <br />
                    • Development workflow
                    <br />
                    • Debugging fundamentals
                    <br />
                    • Software project lifecycle
                  </div>
                </details>
                {" "}
                <details className="bg-white rounded-2xl border shadow-sm">
                  {" "}
                  <summary className="p-5 flex justify-between items-center">
                    <div>
                      <span className="font-bold">
                        02.
                      </span>
                      {" "}Java Introduction & Environment Setup
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </summary>
                  <div className="px-5 pb-5 text-slate-600 leading-8">
                    • Java history & features
                    <br />
                    • Java editions
                    <br />
                    • JDK, JRE & JVM
                    <br />
                    • Java installation
                    <br />
                    • Environment variables
                    <br />
                    • IDE installation
                    <br />
                    • First Java program
                    <br />
                    • Compile & run Java applications
                  </div>
                </details>
                {" "}
                <details className="bg-white rounded-2xl border shadow-sm">
                  {" "}
                  <summary className="p-5 flex justify-between items-center">
                    <div>
                      <span className="font-bold">
                        03.
                      </span>
                      {" "}Java Syntax & Programming Basics
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </summary>
                  <div className="px-5 pb-5 text-slate-600 leading-8">
                    • Java syntax
                    <br />
                    • Variables
                    <br />
                    • Constants
                    <br />
                    • Data types
                    <br />
                    • Type casting
                    <br />
                    • Operators
                    <br />
                    • Input/output
                    <br />
                    • Comments
                    <br />
                    • Coding standards
                  </div>
                </details>
                {" "}
                <details className="bg-white rounded-2xl border shadow-sm">
                  {" "}
                  <summary className="p-5 flex justify-between items-center">
                    <div>
                      <span className="font-bold">
                        04.
                      </span>
                      {" "}Control Statements & Loops
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </summary>
                  <div className="px-5 pb-5 text-slate-600 leading-8">
                    • if / else
                    <br />
                    • Nested conditions
                    <br />
                    • switch statement
                    <br />
                    • for loop
                    <br />
                    • while loop
                    <br />
                    • do while loop
                    <br />
                    • break & continue
                    <br />
                    • Pattern programs
                    <br />
                    • Logical programming exercises
                  </div>
                </details>
                {" "}
                <details className="bg-white rounded-2xl border shadow-sm">
                  {" "}
                  <summary className="p-5 flex justify-between items-center">
                    <div>
                      <span className="font-bold">
                        05.
                      </span>
                      {" "}Methods, Arrays & Strings
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </summary>
                  <div className="px-5 pb-5 text-slate-600 leading-8">
                    • Methods
                    <br />
                    • Parameters & return values
                    <br />
                    • Method overloading
                    <br />
                    • One-dimensional arrays
                    <br />
                    • Multi-dimensional arrays
                    <br />
                    • String class
                    <br />
                    • StringBuffer & StringBuilder
                    <br />
                    • String manipulation programs
                  </div>
                </details>
                {" "}
                <details className="bg-white rounded-2xl border shadow-sm">
                  {" "}
                  <summary className="p-5 flex justify-between items-center">
                    <div>
                      <span className="font-bold">
                        06.
                      </span>
                      {" "}Object-Oriented Programming
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </summary>
                  <div className="px-5 pb-5 text-slate-600 leading-8">
                    • Classes & objects
                    <br />
                    • Constructors
                    <br />
                    • Encapsulation
                    <br />
                    • Inheritance
                    <br />
                    • Polymorphism
                    <br />
                    • Abstraction
                    <br />
                    • Interfaces
                    <br />
                    • Static & final keywords
                    <br />
                    • Packages & access modifiers
                  </div>
                </details>
              </div>
            </div>
            <div className="mb-10">
              <div className="mb-5">
                <span className="inline-block px-4 py-2 rounded-full bg-violet-100 text-violet-700 text-sm font-bold">
                  {" "}PART B — ADVANCED JAVA{" "}
                </span>
              </div>
              <div className="space-y-3">
                <details className="bg-white rounded-2xl border shadow-sm">
                  {" "}
                  <summary className="p-5 flex justify-between items-center">
                    <div>
                      <span className="font-bold">
                        07.
                      </span>
                      {" "}Exception Handling
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </summary>
                  <div className="px-5 pb-5 text-slate-600 leading-8">
                    • Errors & exceptions
                    <br />
                    • try / catch
                    <br />
                    • finally
                    <br />
                    • throw & throws
                    <br />
                    • Custom exceptions
                    <br />
                    • Exception hierarchy
                    <br />
                    • Error handling best practices
                  </div>
                </details>
                {" "}
                <details className="bg-white rounded-2xl border shadow-sm">
                  {" "}
                  <summary className="p-5 flex justify-between items-center">
                    <div>
                      <span className="font-bold">
                        08.
                      </span>
                      {" "}Collections Framework
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </summary>
                  <div className="px-5 pb-5 text-slate-600 leading-8">
                    • Collection framework
                    <br />
                    • ArrayList
                    <br />
                    • LinkedList
                    <br />
                    • HashSet
                    <br />
                    • TreeSet
                    <br />
                    • HashMap
                    <br />
                    • TreeMap
                    <br />
                    • Iterator
                    <br />
                    • Comparable & Comparator
                  </div>
                </details>
                {" "}
                <details className="bg-white rounded-2xl border shadow-sm">
                  {" "}
                  <summary className="p-5 flex justify-between items-center">
                    <div>
                      <span className="font-bold">
                        09.
                      </span>
                      {" "}Generics & Lambda Expressions
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </summary>
                  <div className="px-5 pb-5 text-slate-600 leading-8">
                    • Generics
                    <br />
                    • Generic classes
                    <br />
                    • Generic methods
                    <br />
                    • Lambda expressions
                    <br />
                    • Functional interfaces
                    <br />
                    • Stream basics
                    <br />
                    • Filtering & mapping
                  </div>
                </details>
                {" "}
                <details className="bg-white rounded-2xl border shadow-sm">
                  {" "}
                  <summary className="p-5 flex justify-between items-center">
                    <div>
                      <span className="font-bold">
                        10.
                      </span>
                      {" "}File Handling & Java I/O
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </summary>
                  <div className="px-5 pb-5 text-slate-600 leading-8">
                    • File class
                    <br />
                    • FileReader & FileWriter
                    <br />
                    • BufferedReader
                    <br />
                    • BufferedWriter
                    <br />
                    • InputStream
                    <br />
                    • OutputStream
                    <br />
                    • Serialization basics
                    <br />
                    • File-based projects
                  </div>
                </details>
                {" "}
                <details className="bg-white rounded-2xl border shadow-sm">
                  {" "}
                  <summary className="p-5 flex justify-between items-center">
                    <div>
                      <span className="font-bold">
                        11.
                      </span>
                      {" "}Multithreading
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </summary>
                  <div className="px-5 pb-5 text-slate-600 leading-8">
                    • Threads
                    <br />
                    • Thread lifecycle
                    <br />
                    • Creating threads
                    <br />
                    • Runnable interface
                    <br />
                    • Thread synchronization
                    <br />
                    • Sleep & join
                    <br />
                    • Concurrent programming basics
                  </div>
                </details>
                {" "}
                <details className="bg-white rounded-2xl border shadow-sm">
                  {" "}
                  <summary className="p-5 flex justify-between items-center">
                    <div>
                      <span className="font-bold">
                        12.
                      </span>
                      {" "}Java GUI & Application Concepts
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </summary>
                  <div className="px-5 pb-5 text-slate-600 leading-8">
                    • GUI programming concepts
                    <br />
                    • Event handling
                    <br />
                    • Forms & controls
                    <br />
                    • Desktop application architecture
                    <br />
                    • Java application structure
                    <br />
                    • Practical application development
                  </div>
                </details>
              </div>
            </div>
            <div className="mb-10">
              <div className="mb-5">
                <span className="inline-block px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-bold">
                  {" "}PART C — DATABASE & WEB DEVELOPMENT{" "}
                </span>
              </div>
              <div className="space-y-3">
                <details className="bg-white rounded-2xl border shadow-sm">
                  {" "}
                  <summary className="p-5 flex justify-between items-center">
                    <div>
                      <span className="font-bold">
                        13.
                      </span>
                      {" "}SQL & MySQL Database
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </summary>
                  <div className="px-5 pb-5 text-slate-600 leading-8">
                    • Database concepts
                    <br />
                    • MySQL installation
                    <br />
                    • Database creation
                    <br />
                    • Tables
                    <br />
                    • Primary key
                    <br />
                    • Foreign key
                    <br />
                    • SELECT queries
                    <br />
                    • INSERT / UPDATE / DELETE
                    <br />
                    • WHERE, ORDER BY, GROUP BY
                    <br />
                    • JOIN queries
                    <br />
                    • Subqueries
                  </div>
                </details>
                {" "}
                <details className="bg-white rounded-2xl border shadow-sm">
                  {" "}
                  <summary className="p-5 flex justify-between items-center">
                    <div>
                      <span className="font-bold">
                        14.
                      </span>
                      {" "}JDBC Database Connectivity
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </summary>
                  <div className="px-5 pb-5 text-slate-600 leading-8">
                    • JDBC architecture
                    <br />
                    • JDBC driver
                    <br />
                    • Database connection
                    <br />
                    • Connection object
                    <br />
                    • Statement
                    <br />
                    • PreparedStatement
                    <br />
                    • ResultSet
                    <br />
                    • CRUD operations
                    <br />
                    • Transaction management
                  </div>
                </details>
                {" "}
                <details className="bg-white rounded-2xl border shadow-sm">
                  {" "}
                  <summary className="p-5 flex justify-between items-center">
                    <div>
                      <span className="font-bold">
                        15.
                      </span>
                      {" "}Servlet & Web Application Basics
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </summary>
                  <div className="px-5 pb-5 text-slate-600 leading-8">
                    • Web application architecture
                    <br />
                    • HTTP request & response
                    <br />
                    • Servlet introduction
                    <br />
                    • Servlet lifecycle
                    <br />
                    • GET & POST
                    <br />
                    • Sessions & cookies
                    <br />
                    • Form processing
                    <br />
                    • Java web application structure
                  </div>
                </details>
                {" "}
                <details className="bg-white rounded-2xl border shadow-sm">
                  {" "}
                  <summary className="p-5 flex justify-between items-center">
                    <div>
                      <span className="font-bold">
                        16.
                      </span>
                      {" "}JSP & MVC Concepts
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </summary>
                  <div className="px-5 pb-5 text-slate-600 leading-8">
                    • JSP introduction
                    <br />
                    • JSP pages
                    <br />
                    • Expression Language
                    <br />
                    • JSP forms
                    <br />
                    • MVC architecture
                    <br />
                    • Model, View & Controller
                    <br />
                    • Java web project structure
                  </div>
                </details>
                {" "}
                <details className="bg-white rounded-2xl border shadow-sm">
                  {" "}
                  <summary className="p-5 flex justify-between items-center">
                    <div>
                      <span className="font-bold">
                        17.
                      </span>
                      {" "}Spring Framework Introduction
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </summary>
                  <div className="px-5 pb-5 text-slate-600 leading-8">
                    • Spring Framework overview
                    <br />
                    • IoC & Dependency Injection
                    <br />
                    • Beans
                    <br />
                    • Configuration
                    <br />
                    • Components
                    <br />
                    • Services & repositories
                    <br />
                    • Spring application architecture
                  </div>
                </details>
                {" "}
                <details className="bg-white rounded-2xl border shadow-sm">
                  {" "}
                  <summary className="p-5 flex justify-between items-center">
                    <div>
                      <span className="font-bold">
                        18.
                      </span>
                      {" "}Spring Boot & REST API
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </summary>
                  <div className="px-5 pb-5 text-slate-600 leading-8">
                    • Spring Boot introduction
                    <br />
                    • Project creation
                    <br />
                    • Spring Boot structure
                    <br />
                    • Controllers
                    <br />
                    • Services
                    <br />
                    • Repository layer
                    <br />
                    • REST API
                    <br />
                    • GET / POST / PUT / DELETE
                    <br />
                    • JSON response
                    <br />
                    • API testing
                  </div>
                </details>
              </div>
            </div>
            <div>
              <div className="mb-5">
                <span className="inline-block px-4 py-2 rounded-full bg-orange-100 text-orange-700 text-sm font-bold">
                  {" "}PART D — PROFESSIONAL DEVELOPMENT & PROJECTS{" "}
                </span>
              </div>
              <div className="space-y-3">
                <details className="bg-white rounded-2xl border shadow-sm">
                  {" "}
                  <summary className="p-5 flex justify-between items-center">
                    <div>
                      <span className="font-bold">
                        19.
                      </span>
                      {" "}Spring Data JPA & Hibernate
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </summary>
                  <div className="px-5 pb-5 text-slate-600 leading-8">
                    • ORM concepts
                    <br />
                    • Hibernate introduction
                    <br />
                    • JPA architecture
                    <br />
                    • Entity classes
                    <br />
                    • Repository interface
                    <br />
                    • CRUD operations
                    <br />
                    • Entity relationships
                    <br />
                    • One-to-One
                    <br />
                    • One-to-Many
                    <br />
                    • Many-to-Many
                  </div>
                </details>
                {" "}
                <details className="bg-white rounded-2xl border shadow-sm">
                  {" "}
                  <summary className="p-5 flex justify-between items-center">
                    <div>
                      <span className="font-bold">
                        20.
                      </span>
                      {" "}Authentication & Application Security
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </summary>
                  <div className="px-5 pb-5 text-slate-600 leading-8">
                    • Login system
                    <br />
                    • Registration
                    <br />
                    • Password security
                    <br />
                    • User roles
                    <br />
                    • Authorization
                    <br />
                    • Session management
                    <br />
                    • Spring Security introduction
                    <br />
                    • Secure API concepts
                  </div>
                </details>
                {" "}
                <details className="bg-white rounded-2xl border shadow-sm">
                  {" "}
                  <summary className="p-5 flex justify-between items-center">
                    <div>
                      <span className="font-bold">
                        21.
                      </span>
                      {" "}Git, GitHub & Professional Workflow
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </summary>
                  <div className="px-5 pb-5 text-slate-600 leading-8">
                    • Git installation
                    <br />
                    • Repository creation
                    <br />
                    • Commit
                    <br />
                    • Branches
                    <br />
                    • Merge
                    <br />
                    • Push & Pull
                    <br />
                    • GitHub projects
                    <br />
                    • Portfolio management
                    <br />
                    • Team collaboration
                  </div>
                </details>
                {" "}
                <details className="bg-white rounded-2xl border shadow-sm">
                  {" "}
                  <summary className="p-5 flex justify-between items-center">
                    <div>
                      <span className="font-bold">
                        22.
                      </span>
                      {" "}Business Management System
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </summary>
                  <div className="px-5 pb-5 text-slate-600 leading-8">
                    • Admin login
                    <br />
                    • Dashboard
                    <br />
                    • User management
                    <br />
                    • Customer management
                    <br />
                    • Product management
                    <br />
                    • Search & filters
                    <br />
                    • Reports
                    <br />
                    • Database integration
                    <br />
                    • CRUD operations
                  </div>
                </details>
                {" "}
                <details className="bg-white rounded-2xl border shadow-sm">
                  {" "}
                  <summary className="p-5 flex justify-between items-center">
                    <div>
                      <span className="font-bold">
                        23.
                      </span>
                      {" "}Student / Institute Management System
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </summary>
                  <div className="px-5 pb-5 text-slate-600 leading-8">
                    • Student registration
                    <br />
                    • Course management
                    <br />
                    • Batch management
                    <br />
                    • Attendance
                    <br />
                    • Fee management
                    <br />
                    • Faculty management
                    <br />
                    • Student dashboard
                    <br />
                    • Admin panel
                    <br />
                    • Reports
                    <br />
                    • MySQL database
                  </div>
                </details>
                {" "}
                <details className="bg-white rounded-2xl border shadow-sm">
                  {" "}
                  <summary className="p-5 flex justify-between items-center">
                    <div>
                      <span className="font-bold">
                        24.
                      </span>
                      {" "}Final Java Project & Deployment
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </summary>
                  <div className="px-5 pb-5 text-slate-600 leading-8">
                    • Project planning
                    <br />
                    • Requirement analysis
                    <br />
                    • Database design
                    <br />
                    • UI development
                    <br />
                    • Java backend development
                    <br />
                    • Spring Boot API
                    <br />
                    • Authentication
                    <br />
                    • Testing & debugging
                    <br />
                    • GitHub deployment workflow
                    <br />
                    • Project documentation
                    <br />
                    • Final presentation
                  </div>
                </details>
              </div>
            </div>
          </div>
        </section>
        <section id="projects" className="py-20 bg-white">
          <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-blue-600 font-bold text-sm uppercase">
                Practical Training
              </p>
              <h2 className="text-4xl font-black mt-3">
                Live Projects
              </h2>
              <p className="text-slate-500 mt-4">
                Build real applications for your portfolio
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="rounded-3xl border p-7 hover:shadow-soft transition">
                <div className="text-3xl mb-5">
                  🏢
                </div>
                <h3 className="font-black text-xl mb-3">
                  Business Management
                </h3>
                <p className="text-slate-500 leading-7">
                  Complete Java based business management application with admin dashboard.
                </p>
              </div>
              <div className="rounded-3xl border p-7 hover:shadow-soft transition">
                <div className="text-3xl mb-5">
                  🎓
                </div>
                <h3 className="font-black text-xl mb-3">
                  Student Management
                </h3>
                <p className="text-slate-500 leading-7">
                  Student registration, fees, attendance, courses and reporting system.
                </p>
              </div>
              <div className="rounded-3xl border p-7 hover:shadow-soft transition">
                <div className="text-3xl mb-5">
                  🔐
                </div>
                <h3 className="font-black text-xl mb-3">
                  Authentication System
                </h3>
                <p className="text-slate-500 leading-7">
                  Registration, login, role management and secure user access system.
                </p>
              </div>
              <div className="rounded-3xl border p-7 hover:shadow-soft transition">
                <div className="text-3xl mb-5">
                  🛒
                </div>
                <h3 className="font-black text-xl mb-3">
                  E-Commerce Backend
                </h3>
                <p className="text-slate-500 leading-7">
                  Products, users, orders and REST API based e-commerce backend.
                </p>
              </div>
              <div className="rounded-3xl border p-7 hover:shadow-soft transition">
                <div className="text-3xl mb-5">
                  📊
                </div>
                <h3 className="font-black text-xl mb-3">
                  Admin Dashboard
                </h3>
                <p className="text-slate-500 leading-7">
                  Professional dashboard with database integration and reports.
                </p>
              </div>
              <div className="rounded-3xl border p-7 hover:shadow-soft transition">
                <div className="text-3xl mb-5">
                  📨
                </div>
                <h3 className="font-black text-xl mb-3">
                  Enquiry Management
                </h3>
                <p className="text-slate-500 leading-7">
                  Lead and enquiry management system for business and institutes.
                </p>
              </div>
              <div className="rounded-3xl border p-7 hover:shadow-soft transition">
                <div className="text-3xl mb-5">
                  🌐
                </div>
                <h3 className="font-black text-xl mb-3">
                  REST API Project
                </h3>
                <p className="text-slate-500 leading-7">
                  Build professional REST APIs using Spring Boot.
                </p>
              </div>
              <div className="rounded-3xl border p-7 hover:shadow-soft transition">
                <div className="text-3xl mb-5">
                  🚀
                </div>
                <h3 className="font-black text-xl mb-3">
                  Final Java Project
                </h3>
                <p className="text-slate-500 leading-7">
                  Complete end-to-end Java application developed as final portfolio project.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="career" className="py-20 bg-slate-50">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <p className="text-blue-600 font-bold text-sm uppercase">
                Career Opportunities
              </p>
              <h2 className="text-4xl font-black mt-3">
                Career After Java Course
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border font-bold">
                Java Developer
              </div>
              <div className="bg-white p-5 rounded-2xl border font-bold">
                Core Java Developer
              </div>
              <div className="bg-white p-5 rounded-2xl border font-bold">
                Spring Boot Developer
              </div>
              <div className="bg-white p-5 rounded-2xl border font-bold">
                Backend Developer
              </div>
              <div className="bg-white p-5 rounded-2xl border font-bold">
                Java Web Developer
              </div>
              <div className="bg-white p-5 rounded-2xl border font-bold">
                Software Developer
              </div>
              <div className="bg-white p-5 rounded-2xl border font-bold">
                REST API Developer
              </div>
              <div className="bg-white p-5 rounded-2xl border font-bold">
                Full Stack Developer
              </div>
              <div className="bg-white p-5 rounded-2xl border font-bold">
                Application Developer
              </div>
              <div className="bg-white p-5 rounded-2xl border font-bold">
                Java Freelancer
              </div>
              <div className="bg-white p-5 rounded-2xl border font-bold">
                Junior Java Developer
              </div>
              <div className="bg-white p-5 rounded-2xl border font-bold">
                Backend Engineer
              </div>
            </div>
          </div>
        </section>
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <div className="rounded-[2rem] bg-gradient-to-br from-slate-900 via-blue-950 to-violet-900 text-white p-8 md:p-12">
              <div className="text-center">
                <p className="text-blue-300 font-bold uppercase text-sm">
                  Special Course Fee
                </p>
                <h2 className="text-4xl md:text-5xl font-black mt-3">
                  Java Development Program
                </h2>
                <div className="mt-8">
                  <span className="text-slate-400 line-through text-xl">
                    {" "}₹35,000{" "}
                  </span>
                  <div className="text-5xl font-black mt-2">
                    ₹20,000
                  </div>
                  <p className="text-slate-300 mt-3">
                    Complete 6 Month Professional Training
                  </p>
                </div>
                <div className="grid sm:grid-cols-3 gap-4 mt-10">
                  <div className="glass rounded-2xl p-5">
                    <div className="font-black text-xl">
                      6 Months
                    </div>
                    <div className="text-xs text-slate-300">
                      Duration
                    </div>
                  </div>
                  <div className="glass rounded-2xl p-5">
                    <div className="font-black text-xl">
                      8+
                    </div>
                    <div className="text-xs text-slate-300">
                      Projects
                    </div>
                  </div>
                  <div className="glass rounded-2xl p-5">
                    <div className="font-black text-xl">
                      Certificate
                    </div>
                    <div className="text-xs text-slate-300">
                      On Completion
                    </div>
                  </div>
                </div>
                <a href="#admission" className="inline-block mt-10 bg-white text-slate-900 font-black px-8 py-4 rounded-xl hover:bg-blue-50 transition">
                  {" "}Enroll Now →{" "}
                </a>
              </div>
            </div>
          </div>
        </section>
        <section className="py-20 bg-slate-50">
          <div className="max-w-[1200px] mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-3xl p-8 border shadow-sm">
                <h3 className="text-2xl font-black mb-6">
                  Eligibility
                </h3>
                <ul className="space-y-4 text-slate-600">
                  <li>
                    ✓ 10th / 12th pass students
                  </li>
                  <li>
                    ✓ ITI / Diploma students
                  </li>
                  <li>
                    ✓ College students
                  </li>
                  <li>
                    ✓ Graduates
                  </li>
                  <li>
                    ✓ Beginners in programming
                  </li>
                  <li>
                    ✓ Freelancers
                  </li>
                  <li>
                    ✓ Aspiring software developers
                  </li>
                </ul>
              </div>
              <div className="bg-white rounded-3xl p-8 border shadow-sm">
                <h3 className="text-2xl font-black mb-6">
                  Course Requirements
                </h3>
                <ul className="space-y-4 text-slate-600">
                  <li>
                    ✓ Basic computer knowledge
                  </li>
                  <li>
                    ✓ Basic English reading ability
                  </li>
                  <li>
                    ✓ Internet knowledge
                  </li>
                  <li>
                    ✓ Laptop/Desktop recommended
                  </li>
                  <li>
                    ✓ Regular coding practice
                  </li>
                  <li>
                    ✓ Internet connection
                  </li>
                  <li>
                    ✓ No prior Java experience required
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        <section id="admission" className="py-20 bg-white">
          <div className="max-w-[1000px] mx-auto px-4">
            <div className="text-center mb-10">
              <p className="text-blue-600 font-bold text-sm uppercase">
                Admission
              </p>
              <h2 className="text-4xl font-black mt-3">
                Start Your Java Development Journey
              </h2>
              <p className="text-slate-500 mt-4">
                Fill the form and our admission team will contact you.
              </p>
            </div>
            <form id="admissionForm" className="bg-slate-50 border rounded-3xl p-7 md:p-10">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold mb-2">
                    {" "}Student Name{" "}
                  </label>
                  {" "}
                  <input id="studentName" required type="text" placeholder="Enter your name" className="w-full px-4 py-3.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">
                    {" "}Mobile Number{" "}
                  </label>
                  {" "}
                  <input id="mobile" required type="tel" placeholder="Enter mobile number" className="w-full px-4 py-3.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">
                    {" "}Email{" "}
                  </label>
                  {" "}
                  <input id="email" type="email" placeholder="Enter email" className="w-full px-4 py-3.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">
                    {" "}Qualification{" "}
                  </label>
                  <select id="qualification" className="w-full px-4 py-3.5 rounded-xl border bg-white">
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
                    <option>
                      Other
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">
                    {" "}Interested Course{" "}
                  </label>
                  <select id="course" className="w-full px-4 py-3.5 rounded-xl border bg-white">
                    <option>
                      Java Web & Software Development
                    </option>
                    <option>
                      Core Java
                    </option>
                    <option>
                      Spring Boot Development
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">
                    {" "}Preferred Mode{" "}
                  </label>
                  <select id="mode" className="w-full px-4 py-3.5 rounded-xl border bg-white">
                    <option>
                      Offline
                    </option>
                    <option>
                      Online
                    </option>
                    <option>
                      Both / Need Guidance
                    </option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold mb-2">
                    {" "}Message{" "}
                  </label>
                  {" "}
                  <textarea id="message" rows={4} placeholder="Write your message..." className="w-full px-4 py-3.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <button type="submit" className="w-full mt-6 py-4 rounded-xl bg-slate-900 hover:bg-green-600 text-white font-black text-lg transition">
                {" "}Apply via WhatsApp{" "}
              </button>
            </form>
          </div>
        </section>
        <section className="py-20 bg-slate-50">
          <div className="max-w-[1100px] mx-auto px-4">
            <div className="bg-white rounded-3xl border p-8 md:p-12 text-center shadow-sm">
              <div className="text-5xl mb-5">
                🏆
              </div>
              <h2 className="text-3xl font-black">
                Course Completion Certificate
              </h2>
              <p className="text-slate-500 max-w-2xl mx-auto mt-4 leading-7">
                Students successfully completing the Java Development program will receive a course completion certificate from Career Optics Computer Centre.
              </p>
              <div className="grid md:grid-cols-3 gap-5 mt-10">
                <div className="p-5 rounded-2xl bg-slate-50">
                  <div className="font-black">
                    Java Skills
                  </div>
                  <div className="text-sm text-slate-500 mt-1">
                    Programming Certification
                  </div>
                </div>
                <div className="p-5 rounded-2xl bg-slate-50">
                  <div className="font-black">
                    Project Training
                  </div>
                  <div className="text-sm text-slate-500 mt-1">
                    Practical Experience
                  </div>
                </div>
                <div className="p-5 rounded-2xl bg-slate-50">
                  <div className="font-black">
                    Career Ready
                  </div>
                  <div className="text-sm text-slate-500 mt-1">
                    Portfolio Development
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="faq" className="py-20 bg-white">
          <div className="max-w-[1000px] mx-auto px-4">
            <div className="text-center mb-10">
              <p className="text-blue-600 font-bold text-sm uppercase">
                FAQ
              </p>
              <h2 className="text-4xl font-black mt-3">
                Frequently Asked Questions
              </h2>
            </div>
            <div className="space-y-3">
              <details className="border rounded-2xl bg-slate-50">
                {" "}
                <summary className="p-5 flex justify-between items-center font-bold">
                  Is Java suitable for beginners?
                  <span className="plus text-2xl">
                    +
                  </span>
                </summary>
                <div className="px-5 pb-5 text-slate-600 leading-7">
                  Yes. The course starts from programming fundamentals and gradually moves toward advanced Java and Spring Boot.
                </div>
              </details>
              {" "}
              <details className="border rounded-2xl bg-slate-50">
                {" "}
                <summary className="p-5 flex justify-between items-center font-bold">
                  Does the course include Core Java?
                  <span className="plus text-2xl">
                    +
                  </span>
                </summary>
                <div className="px-5 pb-5 text-slate-600 leading-7">
                  Yes. Core Java, OOP, collections, exception handling, file handling and advanced programming are included.
                </div>
              </details>
              {" "}
              <details className="border rounded-2xl bg-slate-50">
                {" "}
                <summary className="p-5 flex justify-between items-center font-bold">
                  Will I learn MySQL and JDBC?
                  <span className="plus text-2xl">
                    +
                  </span>
                </summary>
                <div className="px-5 pb-5 text-slate-600 leading-7">
                  Yes. Database concepts, MySQL, SQL queries and JDBC database connectivity are covered.
                </div>
              </details>
              {" "}
              <details className="border rounded-2xl bg-slate-50">
                {" "}
                <summary className="p-5 flex justify-between items-center font-bold">
                  Is Spring Boot included?
                  <span className="plus text-2xl">
                    +
                  </span>
                </summary>
                <div className="px-5 pb-5 text-slate-600 leading-7">
                  Yes. Spring Boot, REST API, JPA/Hibernate, authentication and backend development are included.
                </div>
              </details>
              {" "}
              <details className="border rounded-2xl bg-slate-50">
                {" "}
                <summary className="p-5 flex justify-between items-center font-bold">
                  Will I work on live projects?
                  <span className="plus text-2xl">
                    +
                  </span>
                </summary>
                <div className="px-5 pb-5 text-slate-600 leading-7">
                  Yes. The course includes multiple practical projects including management systems, APIs, dashboards and a final Java project.
                </div>
              </details>
              {" "}
              <details className="border rounded-2xl bg-slate-50">
                {" "}
                <summary className="p-5 flex justify-between items-center font-bold">
                  Will I receive a certificate?
                  <span className="plus text-2xl">
                    +
                  </span>
                </summary>
                <div className="px-5 pb-5 text-slate-600 leading-7">
                  Yes. Students completing the program receive a course completion certificate from Career Optics Computer Centre.
                </div>
              </details>
            </div>
          </div>
        </section>
        <section className="py-20">
          <div className="max-w-[1200px] mx-auto px-4">
            <div className="rounded-[2rem] hero-bg text-white text-center px-6 py-16">
              <p className="text-blue-200 font-bold uppercase text-sm">
                Career Optics Computer Centre
              </p>
              <h2 className="text-4xl md:text-5xl font-black mt-3">
                Ready to Become a Java Developer?
              </h2>
              <p className="text-slate-200 max-w-2xl mx-auto mt-5 leading-7">
                Learn Java from fundamentals to professional application development with practical projects.
              </p>
              <a href="#admission" className="inline-block mt-8 px-8 py-4 rounded-xl bg-white text-slate-900 font-black hover:bg-blue-50 transition">
                {" "}Start Admission →{" "}
              </a>
            </div>
          </div>
        </section>
        <footer className="bg-slate-950 text-slate-300" data-cms-scope="footer">
          <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
            <div className="grid md:grid-cols-4 gap-10">
              <div>
                <div className="text-white font-black text-2xl">
                  Career Optics Computer Centre
                </div>
                <p className="text-sm leading-7 mt-4 text-slate-400">
                  Professional computer, software and career training institute.
                </p>
              </div>
              <div>
                <h3 className="text-white font-bold mb-4">
                  Course
                </h3>
                <div className="space-y-3 text-sm">
                  <a href="#overview" className="block hover:text-white">
                    {" "}Overview{" "}
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
                <h3 className="text-white font-bold mb-4">
                  Admission
                </h3>
                <div className="space-y-3 text-sm">
                  <a href="#admission" className="block hover:text-white">
                    {" "}Apply Now{" "}
                  </a>
                  {" "}
                  <a href="#faq" className="block hover:text-white">
                    {" "}FAQ{" "}
                  </a>
                  {" "}
                  <a href="#admission" className="block hover:text-white">
                    {" "}Contact Admission{" "}
                  </a>
                </div>
              </div>
              <div>
                <h3 className="text-white font-bold mb-4">
                  Contact
                </h3>
                <div className="space-y-3 text-sm text-slate-400">
                  <p>
                    📞 +91 82525 32179
                  </p>
                  <p>
                    ✉️ careeropticsconsultancy@gmail.com
                  </p>
                  <p>
                    📍 Bihar, India
                  </p>
                </div>
              </div>
            </div>
            <div className="border-t border-slate-800 mt-12 pt-6 text-center text-sm text-slate-500">
              © 2026 Career Optics Computer Centre. All Rights Reserved.
            </div>
          </div>
        </footer>
        <a href="https://wa.me/918252532179" target="_blank" className="fixed right-5 bottom-5 z-50 w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center text-2xl shadow-xl transition">
          💬
        </a>
        <script dangerouslySetInnerHTML={{ __html: js_7a335205 }} />
        ```
      </body>
    </html>
  );
}
