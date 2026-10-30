import css_4c6fa94d from "../styles/4c6fa94d.css?raw";
import js_3d284604 from "../behaviour/3d284604.js?raw";
import js_f19a7644 from "../behaviour/f19a7644.js?raw";

/** android.html */
export default function Android() {
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
          Android App Development Course | Career Optics Computer Centre
        </title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script dangerouslySetInnerHTML={{ __html: js_3d284604 }} />
        <style dangerouslySetInnerHTML={{ __html: css_4c6fa94d }} />
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-[1500px] mx-auto px-4 lg:px-8">
            <div className="h-16 flex items-center justify-between">
              <a href="#" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black">
                  P
                </div>
                <div>
                  <h1 className="font-black text-lg leading-none">
                    Career Optics Computer Centre
                  </h1>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Learn • Build • Grow
                  </p>
                </div>
              </a>
              <div className="hidden lg:flex items-center gap-7 text-sm font-semibold">
                <a href="#overview" className="hover:text-indigo-600">
                  Overview
                </a>
                {" "}
                <a href="#syllabus" className="hover:text-indigo-600">
                  Syllabus
                </a>
                {" "}
                <a href="#projects" className="hover:text-indigo-600">
                  Projects
                </a>
                {" "}
                <a href="#career" className="hover:text-indigo-600">
                  Career
                </a>
                {" "}
                <a href="#admission" className="hover:text-indigo-600">
                  Admission
                </a>
                {" "}
                <a href="#faq" className="hover:text-indigo-600">
                  FAQ
                </a>
                {" "}
                <a href="#admission" className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700">
                  {" "}Apply Now{" "}
                </a>
              </div>
              <button id="menuBtn" className="lg:hidden w-10 h-10 rounded-xl bg-slate-100">
                {" "}☰{" "}
              </button>
            </div>
            <div id="mobileMenu" className="hidden lg:hidden pb-4">
              <div className="grid gap-2 text-sm font-semibold">
                <a href="#overview" className="p-3 rounded-lg hover:bg-slate-100">
                  Overview
                </a>
                <a href="#syllabus" className="p-3 rounded-lg hover:bg-slate-100">
                  Syllabus
                </a>
                <a href="#projects" className="p-3 rounded-lg hover:bg-slate-100">
                  Projects
                </a>
                <a href="#career" className="p-3 rounded-lg hover:bg-slate-100">
                  Career
                </a>
                <a href="#admission" className="p-3 rounded-lg hover:bg-slate-100">
                  Admission
                </a>
                <a href="#faq" className="p-3 rounded-lg hover:bg-slate-100">
                  FAQ
                </a>
              </div>
            </div>
          </div>
        </nav>
        <div className="bg-white border-b border-slate-200 sticky top-16 z-40">
          <div className="max-w-[1500px] mx-auto px-4 lg:px-8 overflow-x-auto">
            <div className="flex gap-2 py-3 min-w-max text-xs sm:text-sm font-bold">
              <button className="tab active px-5 py-2.5 rounded-xl" data-inline-onclick="goTo('overview',this)">
                {" "}Overview{" "}
              </button>
              <button className="tab px-5 py-2.5 rounded-xl" data-inline-onclick="goTo('syllabus',this)">
                {" "}Syllabus{" "}
              </button>
              <button className="tab px-5 py-2.5 rounded-xl" data-inline-onclick="goTo('projects',this)">
                {" "}Projects{" "}
              </button>
              <button className="tab px-5 py-2.5 rounded-xl" data-inline-onclick="goTo('career',this)">
                {" "}Career{" "}
              </button>
              <button className="tab px-5 py-2.5 rounded-xl" data-inline-onclick="goTo('admission',this)">
                {" "}Admission{" "}
              </button>
              <button className="tab px-5 py-2.5 rounded-xl" data-inline-onclick="goTo('faq',this)">
                {" "}FAQ{" "}
              </button>
            </div>
          </div>
        </div>
        <section className="bg-gradient-to-br from-indigo-700 via-purple-700 to-fuchsia-700 text-white">
          <div className="max-w-[1500px] mx-auto px-5 lg:px-10 min-h-[600px] flex items-center py-16">
            <div className="grid lg:grid-cols-[1.25fr_.75fr] gap-12 items-center w-full">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-xs font-bold mb-6">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  Professional Android App Development Program
                </div>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
                  Android App{" "}
                  <span className="text-fuchsia-200">
                    Development
                  </span>
                </h2>
                <p className="mt-6 text-indigo-100 text-base sm:text-lg leading-8 max-w-3xl">
                  Learn Android app development from beginner to professional level with Java, Kotlin, Android Studio, XML, Firebase, SQLite, REST APIs and real-world application projects.
                </p>
                <div className="flex flex-wrap gap-3 mt-7">
                  <span className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm">
                    {" "}Android Studio{" "}
                  </span>
                  <span className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm">
                    {" "}Kotlin{" "}
                  </span>
                  <span className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm">
                    {" "}Java{" "}
                  </span>
                  <span className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm">
                    {" "}Firebase{" "}
                  </span>
                  <span className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm">
                    {" "}REST API{" "}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 mt-9">
                  <a href="#admission" className="px-7 py-3.5 rounded-xl bg-white text-indigo-700 font-black hover:bg-indigo-50 transition">
                    {" "}Apply Now →{" "}
                  </a>
                  <a href="#syllabus" className="px-7 py-3.5 rounded-xl bg-white/10 border border-white/20 font-bold hover:bg-white/20">
                    {" "}View Syllabus{" "}
                  </a>
                </div>
              </div>
              <div className="bg-white text-slate-800 rounded-3xl p-7 shadow-2xl">
                <div className="text-sm font-bold text-slate-500">
                  COURSE FEE
                </div>
                <div className="flex items-end gap-3 mt-2">
                  <div className="text-5xl font-black text-indigo-700">
                    ₹20,000
                  </div>
                  <div className="line-through text-slate-400 mb-2">
                    ₹35,000
                  </div>
                </div>
                <div className="inline-block mt-3 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                  Limited Time Offer
                </div>
                <div className="grid grid-cols-2 gap-3 mt-7">
                  <div className="p-4 rounded-2xl bg-slate-50">
                    <div className="text-xs text-slate-500">
                      Duration
                    </div>
                    <div className="font-black mt-1">
                      6 Months
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50">
                    <div className="text-xs text-slate-500">
                      Mode
                    </div>
                    <div className="font-black mt-1">
                      Online / Offline
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50">
                    <div className="text-xs text-slate-500">
                      Projects
                    </div>
                    <div className="font-black mt-1">
                      8+ Live
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50">
                    <div className="text-xs text-slate-500">
                      Certificate
                    </div>
                    <div className="font-black mt-1">
                      Yes
                    </div>
                  </div>
                </div>
                <a href="#admission" className="block text-center mt-6 py-3.5 rounded-xl bg-indigo-600 text-white font-black hover:bg-indigo-700">
                  {" "}Start Your Android Journey{" "}
                </a>
              </div>
            </div>
          </div>
        </section>
        <section id="overview" className="py-20">
          <div className="max-w-[1500px] mx-auto px-5 lg:px-10">
            <div className="max-w-3xl">
              <span className="text-indigo-600 text-sm font-black uppercase tracking-wider">
                {" "}Course Overview{" "}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black mt-2">
                Become a Professional Android Developer
              </h2>
              <p className="text-slate-600 leading-8 mt-5">
                This practical Android App Development course is designed to take students from programming fundamentals to professional Android application development. You will learn Android Studio, Java, Kotlin, XML layouts, Activities, Fragments, databases, Firebase, APIs, authentication, notifications and deployment.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 mt-10">
              <div className="bg-white rounded-3xl p-7 border border-slate-100 shadow-soft">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-xl">
                  📱
                </div>
                <h3 className="font-black text-xl mt-5">
                  Android Development
                </h3>
                <p className="text-sm text-slate-600 leading-7 mt-3">
                  Android Studio, Activities, Fragments, layouts, navigation, lifecycle and modern app architecture.
                </p>
              </div>
              <div className="bg-white rounded-3xl p-7 border border-slate-100 shadow-soft">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center text-xl">
                  ☁️
                </div>
                <h3 className="font-black text-xl mt-5">
                  Firebase & APIs
                </h3>
                <p className="text-sm text-slate-600 leading-7 mt-3">
                  Firebase Authentication, Firestore, Storage, notifications and REST API integration.
                </p>
              </div>
              <div className="bg-white rounded-3xl p-7 border border-slate-100 shadow-soft">
                <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-700 flex items-center justify-center text-xl">
                  🚀
                </div>
                <h3 className="font-black text-xl mt-5">
                  Live Projects
                </h3>
                <p className="text-sm text-slate-600 leading-7 mt-3">
                  Build real-world Android applications and learn testing, debugging, APK generation and deployment.
                </p>
              </div>
            </div>
            <div className="grid lg:grid-cols-2 gap-10 mt-16">
              <div>
                <h3 className="text-2xl font-black">
                  What You Will Learn
                </h3>
                <div className="grid sm:grid-cols-2 gap-3 mt-6">
                  <div className="p-4 rounded-xl bg-white border">
                    ✓ Java & Kotlin Fundamentals
                  </div>
                  <div className="p-4 rounded-xl bg-white border">
                    ✓ Android Studio
                  </div>
                  <div className="p-4 rounded-xl bg-white border">
                    ✓ XML UI Design
                  </div>
                  <div className="p-4 rounded-xl bg-white border">
                    ✓ Activities & Fragments
                  </div>
                  <div className="p-4 rounded-xl bg-white border">
                    ✓ SQLite Database
                  </div>
                  <div className="p-4 rounded-xl bg-white border">
                    ✓ Firebase
                  </div>
                  <div className="p-4 rounded-xl bg-white border">
                    ✓ REST API
                  </div>
                  <div className="p-4 rounded-xl bg-white border">
                    ✓ App Deployment
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black">
                  Tools & Technologies
                </h3>
                <div className="flex flex-wrap gap-3 mt-6">
                  <span className="px-4 py-2 bg-white border rounded-xl text-sm font-bold">
                    {" "}Android Studio{" "}
                  </span>
                  <span className="px-4 py-2 bg-white border rounded-xl text-sm font-bold">
                    {" "}Java{" "}
                  </span>
                  <span className="px-4 py-2 bg-white border rounded-xl text-sm font-bold">
                    {" "}Kotlin{" "}
                  </span>
                  <span className="px-4 py-2 bg-white border rounded-xl text-sm font-bold">
                    {" "}XML{" "}
                  </span>
                  <span className="px-4 py-2 bg-white border rounded-xl text-sm font-bold">
                    {" "}SQLite{" "}
                  </span>
                  <span className="px-4 py-2 bg-white border rounded-xl text-sm font-bold">
                    {" "}Firebase{" "}
                  </span>
                  <span className="px-4 py-2 bg-white border rounded-xl text-sm font-bold">
                    {" "}Firestore{" "}
                  </span>
                  <span className="px-4 py-2 bg-white border rounded-xl text-sm font-bold">
                    {" "}REST API{" "}
                  </span>
                  <span className="px-4 py-2 bg-white border rounded-xl text-sm font-bold">
                    {" "}Git & GitHub{" "}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="syllabus" className="py-20 bg-white">
          <div className="max-w-[1100px] mx-auto px-5">
            <div className="text-center mb-12">
              <span className="text-indigo-600 text-sm font-black uppercase">
                {" "}Detailed Curriculum{" "}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black mt-2">
                Android App Development Syllabus
              </h2>
              <p className="text-slate-500 mt-3">
                24 detailed modules • Beginner to Professional
              </p>
            </div>
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black">
                  A
                </div>
                <div>
                  <h3 className="font-black text-xl">
                    PART A — PROGRAMMING FOUNDATION
                  </h3>
                  <p className="text-xs text-slate-500">
                    Build strong programming fundamentals
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="accordion-item border rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full flex items-center justify-between p-5 text-left">
                    <div>
                      <span className="text-xs font-black text-indigo-600">
                        {" "}MODULE 01{" "}
                      </span>
                      <h4 className="font-bold mt-1">
                        Mobile App Development Fundamentals
                      </h4>
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5">
                    <ul className="list-disc pl-5 text-sm text-slate-600 leading-7">
                      <li>
                        Mobile application development overview
                      </li>
                      <li>
                        Android ecosystem
                      </li>
                      <li>
                        Native vs hybrid applications
                      </li>
                      <li>
                        Android developer career roadmap
                      </li>
                      <li>
                        Application development workflow
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item border rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full flex items-center justify-between p-5 text-left">
                    <div>
                      <span className="text-xs font-black text-indigo-600">
                        MODULE 02
                      </span>
                      <h4 className="font-bold mt-1">
                        Java Programming Fundamentals
                      </h4>
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5">
                    <ul className="list-disc pl-5 text-sm text-slate-600 leading-7">
                      <li>
                        Variables and data types
                      </li>
                      <li>
                        Operators and expressions
                      </li>
                      <li>
                        Input and output
                      </li>
                      <li>
                        Conditional statements
                      </li>
                      <li>
                        Loops
                      </li>
                      <li>
                        Methods
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item border rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full flex items-center justify-between p-5 text-left">
                    <div>
                      <span className="text-xs font-black text-indigo-600">
                        MODULE 03
                      </span>
                      <h4 className="font-bold mt-1">
                        OOP Concepts
                      </h4>
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5">
                    <ul className="list-disc pl-5 text-sm text-slate-600 leading-7">
                      <li>
                        Classes and objects
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
                    </ul>
                  </div>
                </div>
                <div className="accordion-item border rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full flex items-center justify-between p-5 text-left">
                    <div>
                      <span className="text-xs font-black text-indigo-600">
                        MODULE 04
                      </span>
                      <h4 className="font-bold mt-1">
                        Arrays, Strings & Collections
                      </h4>
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5">
                    <ul className="list-disc pl-5 text-sm text-slate-600 leading-7">
                      <li>
                        Arrays
                      </li>
                      <li>
                        String handling
                      </li>
                      <li>
                        ArrayList
                      </li>
                      <li>
                        HashMap
                      </li>
                      <li>
                        Set and List
                      </li>
                      <li>
                        Iteration techniques
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item border rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full flex items-center justify-between p-5 text-left">
                    <div>
                      <span className="text-xs font-black text-indigo-600">
                        MODULE 05
                      </span>
                      <h4 className="font-bold mt-1">
                        Kotlin Programming
                      </h4>
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5">
                    <ul className="list-disc pl-5 text-sm text-slate-600 leading-7">
                      <li>
                        Kotlin syntax
                      </li>
                      <li>
                        Variables and functions
                      </li>
                      <li>
                        Null safety
                      </li>
                      <li>
                        Classes and objects
                      </li>
                      <li>
                        Collections
                      </li>
                      <li>
                        Lambda expressions
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item border rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full flex items-center justify-between p-5 text-left">
                    <div>
                      <span className="text-xs font-black text-indigo-600">
                        MODULE 06
                      </span>
                      <h4 className="font-bold mt-1">
                        Android Studio & Project Setup
                      </h4>
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5">
                    <ul className="list-disc pl-5 text-sm text-slate-600 leading-7">
                      <li>
                        Android Studio installation
                      </li>
                      <li>
                        SDK configuration
                      </li>
                      <li>
                        Emulator setup
                      </li>
                      <li>
                        Project structure
                      </li>
                      <li>
                        Gradle basics
                      </li>
                      <li>
                        Running first Android application
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black">
                  B
                </div>
                <div>
                  <h3 className="font-black text-xl">
                    PART B — ANDROID UI & CORE DEVELOPMENT
                  </h3>
                  <p className="text-xs text-slate-500">
                    Build Android applications from scratch
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="accordion-item border rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full flex items-center justify-between p-5 text-left">
                    <div>
                      <span className="text-xs font-black text-purple-600">
                        MODULE 07
                      </span>
                      <h4 className="font-bold mt-1">
                        Android Components
                      </h4>
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5">
                    <ul className="list-disc pl-5 text-sm text-slate-600 leading-7">
                      <li>
                        Activities
                      </li>
                      <li>
                        Services
                      </li>
                      <li>
                        Broadcast Receivers
                      </li>
                      <li>
                        Content Providers
                      </li>
                      <li>
                        Android application lifecycle
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item border rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full flex items-center justify-between p-5 text-left">
                    <div>
                      <span className="text-xs font-black text-purple-600">
                        MODULE 08
                      </span>
                      <h4 className="font-bold mt-1">
                        XML Layout & UI Design
                      </h4>
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5">
                    <ul className="list-disc pl-5 text-sm text-slate-600 leading-7">
                      <li>
                        LinearLayout
                      </li>
                      <li>
                        ConstraintLayout
                      </li>
                      <li>
                        Relative layouts
                      </li>
                      <li>
                        TextView
                      </li>
                      <li>
                        EditText
                      </li>
                      <li>
                        Button
                      </li>
                      <li>
                        ImageView
                      </li>
                      <li>
                        CardView
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item border rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full flex items-center justify-between p-5 text-left">
                    <div>
                      <span className="text-xs font-black text-purple-600">
                        MODULE 09
                      </span>
                      <h4 className="font-bold mt-1">
                        Activities & Navigation
                      </h4>
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5">
                    <ul className="list-disc pl-5 text-sm text-slate-600 leading-7">
                      <li>
                        Intent
                      </li>
                      <li>
                        Explicit and implicit intents
                      </li>
                      <li>
                        Activity lifecycle
                      </li>
                      <li>
                        Passing data between screens
                      </li>
                      <li>
                        Navigation concepts
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item border rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full flex items-center justify-between p-5 text-left">
                    <div>
                      <span className="text-xs font-black text-purple-600">
                        MODULE 10
                      </span>
                      <h4 className="font-bold mt-1">
                        RecyclerView & Lists
                      </h4>
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5">
                    <ul className="list-disc pl-5 text-sm text-slate-600 leading-7">
                      <li>
                        RecyclerView
                      </li>
                      <li>
                        Adapter
                      </li>
                      <li>
                        ViewHolder
                      </li>
                      <li>
                        Custom list design
                      </li>
                      <li>
                        Dynamic data
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item border rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full flex items-center justify-between p-5 text-left">
                    <div>
                      <span className="text-xs font-black text-purple-600">
                        MODULE 11
                      </span>
                      <h4 className="font-bold mt-1">
                        Fragments & Navigation
                      </h4>
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5">
                    <ul className="list-disc pl-5 text-sm text-slate-600 leading-7">
                      <li>
                        Fragment lifecycle
                      </li>
                      <li>
                        Fragment transactions
                      </li>
                      <li>
                        Navigation component
                      </li>
                      <li>
                        Bottom navigation
                      </li>
                      <li>
                        Drawer navigation
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item border rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full flex items-center justify-between p-5 text-left">
                    <div>
                      <span className="text-xs font-black text-purple-600">
                        MODULE 12
                      </span>
                      <h4 className="font-bold mt-1">
                        Forms & User Input
                      </h4>
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5">
                    <ul className="list-disc pl-5 text-sm text-slate-600 leading-7">
                      <li>
                        Login forms
                      </li>
                      <li>
                        Registration forms
                      </li>
                      <li>
                        Input validation
                      </li>
                      <li>
                        Date and time picker
                      </li>
                      <li>
                        Dialogs and alerts
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-pink-600 text-white flex items-center justify-center font-black">
                  C
                </div>
                <div>
                  <h3 className="font-black text-xl">
                    PART C — DATABASE, FIREBASE & API
                  </h3>
                  <p className="text-xs text-slate-500">
                    Connect applications with real data
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="accordion-item border rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full flex items-center justify-between p-5 text-left">
                    <div>
                      <span className="text-xs font-black text-pink-600">
                        MODULE 13
                      </span>
                      <h4 className="font-bold mt-1">
                        SQLite Database
                      </h4>
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5">
                    <ul className="list-disc pl-5 text-sm text-slate-600 leading-7">
                      <li>
                        SQLite introduction
                      </li>
                      <li>
                        Database creation
                      </li>
                      <li>
                        Tables and queries
                      </li>
                      <li>
                        Insert, update and delete
                      </li>
                      <li>
                        Database CRUD project
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item border rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full flex items-center justify-between p-5 text-left">
                    <div>
                      <span className="text-xs font-black text-pink-600">
                        MODULE 14
                      </span>
                      <h4 className="font-bold mt-1">
                        Firebase Introduction
                      </h4>
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5">
                    <ul className="list-disc pl-5 text-sm text-slate-600 leading-7">
                      <li>
                        Firebase project setup
                      </li>
                      <li>
                        Firebase console
                      </li>
                      <li>
                        Android Firebase integration
                      </li>
                      <li>
                        Cloud services overview
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item border rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full flex items-center justify-between p-5 text-left">
                    <div>
                      <span className="text-xs font-black text-pink-600">
                        MODULE 15
                      </span>
                      <h4 className="font-bold mt-1">
                        Firebase Authentication
                      </h4>
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5">
                    <ul className="list-disc pl-5 text-sm text-slate-600 leading-7">
                      <li>
                        Email authentication
                      </li>
                      <li>
                        Registration
                      </li>
                      <li>
                        Login and logout
                      </li>
                      <li>
                        Password recovery
                      </li>
                      <li>
                        User session management
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item border rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full flex items-center justify-between p-5 text-left">
                    <div>
                      <span className="text-xs font-black text-pink-600">
                        MODULE 16
                      </span>
                      <h4 className="font-bold mt-1">
                        Cloud Firestore
                      </h4>
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5">
                    <ul className="list-disc pl-5 text-sm text-slate-600 leading-7">
                      <li>
                        Firestore database
                      </li>
                      <li>
                        Collections and documents
                      </li>
                      <li>
                        CRUD operations
                      </li>
                      <li>
                        Realtime data
                      </li>
                      <li>
                        Cloud data management
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item border rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full flex items-center justify-between p-5 text-left">
                    <div>
                      <span className="text-xs font-black text-pink-600">
                        MODULE 17
                      </span>
                      <h4 className="font-bold mt-1">
                        REST API Integration
                      </h4>
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5">
                    <ul className="list-disc pl-5 text-sm text-slate-600 leading-7">
                      <li>
                        API fundamentals
                      </li>
                      <li>
                        HTTP methods
                      </li>
                      <li>
                        JSON
                      </li>
                      <li>
                        GET and POST requests
                      </li>
                      <li>
                        API data parsing
                      </li>
                      <li>
                        Remote server integration
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item border rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full flex items-center justify-between p-5 text-left">
                    <div>
                      <span className="text-xs font-black text-pink-600">
                        MODULE 18
                      </span>
                      <h4 className="font-bold mt-1">
                        Notifications & Cloud Messaging
                      </h4>
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5">
                    <ul className="list-disc pl-5 text-sm text-slate-600 leading-7">
                      <li>
                        Firebase Cloud Messaging
                      </li>
                      <li>
                        Push notifications
                      </li>
                      <li>
                        Notification channels
                      </li>
                      <li>
                        Notification actions
                      </li>
                      <li>
                        Real-world notification project
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black">
                  D
                </div>
                <div>
                  <h3 className="font-black text-xl">
                    PART D — PROFESSIONAL DEVELOPMENT & PROJECTS
                  </h3>
                  <p className="text-xs text-slate-500">
                    Build production-ready applications
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="accordion-item border rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full flex items-center justify-between p-5 text-left">
                    <div>
                      <span className="text-xs font-black text-slate-600">
                        MODULE 19
                      </span>
                      <h4 className="font-bold mt-1">
                        MVVM & App Architecture
                      </h4>
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5">
                    <ul className="list-disc pl-5 text-sm text-slate-600 leading-7">
                      <li>
                        Application architecture
                      </li>
                      <li>
                        MVVM concepts
                      </li>
                      <li>
                        ViewModel
                      </li>
                      <li>
                        Repository pattern
                      </li>
                      <li>
                        Clean project structure
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item border rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full flex items-center justify-between p-5 text-left">
                    <div>
                      <span className="text-xs font-black text-slate-600">
                        MODULE 20
                      </span>
                      <h4 className="font-bold mt-1">
                        App Security & Authentication
                      </h4>
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5">
                    <ul className="list-disc pl-5 text-sm text-slate-600 leading-7">
                      <li>
                        Secure authentication
                      </li>
                      <li>
                        API security basics
                      </li>
                      <li>
                        Local data security
                      </li>
                      <li>
                        User permissions
                      </li>
                      <li>
                        Secure application practices
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item border rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full flex items-center justify-between p-5 text-left">
                    <div>
                      <span className="text-xs font-black text-slate-600">
                        MODULE 21
                      </span>
                      <h4 className="font-bold mt-1">
                        Git, GitHub & Team Workflow
                      </h4>
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5">
                    <ul className="list-disc pl-5 text-sm text-slate-600 leading-7">
                      <li>
                        Git installation
                      </li>
                      <li>
                        Repository creation
                      </li>
                      <li>
                        Commit and push
                      </li>
                      <li>
                        Branching
                      </li>
                      <li>
                        GitHub portfolio
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item border rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full flex items-center justify-between p-5 text-left">
                    <div>
                      <span className="text-xs font-black text-slate-600">
                        MODULE 22
                      </span>
                      <h4 className="font-bold mt-1">
                        Business Management Android App
                      </h4>
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5">
                    <ul className="list-disc pl-5 text-sm text-slate-600 leading-7">
                      <li>
                        Dashboard
                      </li>
                      <li>
                        Customer management
                      </li>
                      <li>
                        Product management
                      </li>
                      <li>
                        Sales records
                      </li>
                      <li>
                        Firebase database
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item border rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full flex items-center justify-between p-5 text-left">
                    <div>
                      <span className="text-xs font-black text-slate-600">
                        MODULE 23
                      </span>
                      <h4 className="font-bold mt-1">
                        E-Commerce / Service App
                      </h4>
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5">
                    <ul className="list-disc pl-5 text-sm text-slate-600 leading-7">
                      <li>
                        Product listing
                      </li>
                      <li>
                        Search
                      </li>
                      <li>
                        Cart
                      </li>
                      <li>
                        User login
                      </li>
                      <li>
                        Order management
                      </li>
                      <li>
                        API integration
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="accordion-item border rounded-2xl overflow-hidden">
                  <button data-inline-onclick="toggleAccordion(this)" className="w-full flex items-center justify-between p-5 text-left">
                    <div>
                      <span className="text-xs font-black text-slate-600">
                        MODULE 24
                      </span>
                      <h4 className="font-bold mt-1">
                        Final Android Project & APK Deployment
                      </h4>
                    </div>
                    <span className="plus text-2xl">
                      +
                    </span>
                  </button>
                  <div className="accordion-content px-5 pb-5">
                    <ul className="list-disc pl-5 text-sm text-slate-600 leading-7">
                      <li>
                        Complete application planning
                      </li>
                      <li>
                        UI development
                      </li>
                      <li>
                        Database/API integration
                      </li>
                      <li>
                        Testing and debugging
                      </li>
                      <li>
                        Generate signed APK
                      </li>
                      <li>
                        App deployment concepts
                      </li>
                      <li>
                        Final project presentation
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="projects" className="py-20">
          <div className="max-w-[1500px] mx-auto px-5 lg:px-10">
            <div className="text-center">
              <span className="text-indigo-600 text-sm font-black uppercase">
                {" "}Practical Training{" "}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black mt-2">
                Live Android Projects
              </h2>
              <p className="text-slate-500 mt-3">
                Build portfolio-ready applications during the course
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
              <div className="bg-white rounded-3xl p-6 border shadow-soft">
                <div className="text-3xl">
                  🏢
                </div>
                <h3 className="font-black mt-5">
                  Business Management App
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Customers, products, sales and dashboard.
                </p>
              </div>
              <div className="bg-white rounded-3xl p-6 border shadow-soft">
                <div className="text-3xl">
                  🎓
                </div>
                <h3 className="font-black mt-5">
                  Student Management App
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Students, courses, attendance and records.
                </p>
              </div>
              <div className="bg-white rounded-3xl p-6 border shadow-soft">
                <div className="text-3xl">
                  🛒
                </div>
                <h3 className="font-black mt-5">
                  E-Commerce App
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Products, cart, login and order workflow.
                </p>
              </div>
              <div className="bg-white rounded-3xl p-6 border shadow-soft">
                <div className="text-3xl">
                  💬
                </div>
                <h3 className="font-black mt-5">
                  Chat / Communication App
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Firebase based user communication system.
                </p>
              </div>
              <div className="bg-white rounded-3xl p-6 border shadow-soft">
                <div className="text-3xl">
                  📢
                </div>
                <h3 className="font-black mt-5">
                  News App
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  API based news and category application.
                </p>
              </div>
              <div className="bg-white rounded-3xl p-6 border shadow-soft">
                <div className="text-3xl">
                  📋
                </div>
                <h3 className="font-black mt-5">
                  Enquiry Management
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Lead and enquiry management application.
                </p>
              </div>
              <div className="bg-white rounded-3xl p-6 border shadow-soft">
                <div className="text-3xl">
                  🔐
                </div>
                <h3 className="font-black mt-5">
                  Authentication App
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Login, registration and Firebase authentication.
                </p>
              </div>
              <div className="bg-white rounded-3xl p-6 border shadow-soft">
                <div className="text-3xl">
                  🚀
                </div>
                <h3 className="font-black mt-5">
                  Final Android Project
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Complete professional Android application.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="career" className="py-20 bg-white">
          <div className="max-w-[1200px] mx-auto px-5">
            <div className="text-center">
              <span className="text-indigo-600 text-sm font-black uppercase">
                {" "}Career Opportunities{" "}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black mt-2">
                Where Can You Work?
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
              <div className="p-5 rounded-2xl bg-slate-50 border font-bold">
                📱 Android Developer
              </div>
              <div className="p-5 rounded-2xl bg-slate-50 border font-bold">
                💻 Mobile App Developer
              </div>
              <div className="p-5 rounded-2xl bg-slate-50 border font-bold">
                ⚙️ Android Application Developer
              </div>
              <div className="p-5 rounded-2xl bg-slate-50 border font-bold">
                ☁️ Firebase Developer
              </div>
              <div className="p-5 rounded-2xl bg-slate-50 border font-bold">
                🔗 Mobile API Developer
              </div>
              <div className="p-5 rounded-2xl bg-slate-50 border font-bold">
                🚀 Software Developer
              </div>
              <div className="p-5 rounded-2xl bg-slate-50 border font-bold">
                🧑‍💻 Android Freelancer
              </div>
              <div className="p-5 rounded-2xl bg-slate-50 border font-bold">
                🏢 Junior Android Developer
              </div>
              <div className="p-5 rounded-2xl bg-slate-50 border font-bold">
                📲 Mobile Application Engineer
              </div>
            </div>
          </div>
        </section>
        <section className="py-20">
          <div className="max-w-[1000px] mx-auto px-5">
            <div className="bg-gradient-to-br from-indigo-700 to-purple-700 rounded-[2rem] p-8 sm:p-12 text-white">
              <div className="grid md:grid-cols-2 gap-10 items-center">
                <div>
                  <span className="text-indigo-200 text-sm font-bold">
                    {" "}ANDROID DEVELOPMENT PROGRAM{" "}
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-black mt-3">
                    Professional Android Course
                  </h2>
                  <p className="text-indigo-100 leading-7 mt-4">
                    Complete practical training with projects, certificate and career guidance.
                  </p>
                </div>
                <div className="bg-white text-slate-800 rounded-3xl p-7">
                  <div className="text-xs font-bold text-slate-500">
                    COURSE FEE
                  </div>
                  <div className="text-4xl font-black text-indigo-700 mt-2">
                    ₹20,000
                  </div>
                  <div className="line-through text-slate-400">
                    ₹35,000
                  </div>
                  <div className="mt-5 space-y-3 text-sm">
                    <div>
                      ✓ 6 Months Training
                    </div>
                    <div>
                      ✓ 24 Detailed Modules
                    </div>
                    <div>
                      ✓ 8+ Live Projects
                    </div>
                    <div>
                      ✓ Practical Assignments
                    </div>
                    <div>
                      ✓ Course Certificate
                    </div>
                    <div>
                      ✓ Career Guidance
                    </div>
                  </div>
                  <a href="#admission" className="block text-center bg-indigo-600 text-white rounded-xl py-3 mt-6 font-black">
                    {" "}Apply for Admission{" "}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="py-20 bg-white">
          <div className="max-w-[1100px] mx-auto px-5">
            <div className="grid md:grid-cols-2 gap-10">
              <div>
                <h2 className="text-2xl font-black">
                  Eligibility
                </h2>
                <div className="mt-5 space-y-3">
                  <div className="p-4 bg-slate-50 rounded-xl">
                    ✓ 10th / 12th Pass Students
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    ✓ ITI / Diploma Students
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    ✓ College Students
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    ✓ Graduates
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    ✓ Beginners & Freelancers
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-black">
                  Requirements
                </h2>
                <div className="mt-5 space-y-3">
                  <div className="p-4 bg-slate-50 rounded-xl">
                    ✓ Basic Computer Knowledge
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    ✓ Laptop / Desktop Recommended
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    ✓ Basic English Reading
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    ✓ Internet Connection
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    ✓ No Previous Android Experience Required
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="admission" className="py-20 bg-slate-950 text-white">
          <div className="max-w-[1000px] mx-auto px-5">
            <div className="text-center mb-10">
              <span className="text-indigo-400 text-sm font-black uppercase">
                {" "}Admission Open{" "}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black mt-2">
                Start Your Android Development Career
              </h2>
              <p className="text-slate-400 mt-3">
                Fill the form and our admission team will contact you.
              </p>
            </div>
            <form id="admissionForm" className="bg-white text-slate-800 rounded-3xl p-6 sm:p-8">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-bold">
                    {" "}Student Name{" "}
                  </label>
                  {" "}
                  <input id="studentName" required type="text" placeholder="Enter your name" className="w-full mt-2 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="text-sm font-bold">
                    {" "}Mobile Number{" "}
                  </label>
                  {" "}
                  <input id="mobile" required type="tel" placeholder="Enter mobile number" className="w-full mt-2 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="text-sm font-bold">
                    {" "}Email{" "}
                  </label>
                  {" "}
                  <input id="email" type="email" placeholder="Enter email" className="w-full mt-2 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="text-sm font-bold">
                    {" "}Qualification{" "}
                  </label>
                  <select id="qualification" className="w-full mt-2 px-4 py-3 rounded-xl border">
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
                      Other
                    </option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold">
                    {" "}Interested Course{" "}
                  </label>
                  <select id="course" className="w-full mt-2 px-4 py-3 rounded-xl border">
                    <option>
                      Android App Development
                    </option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold">
                    {" "}Preferred Mode{" "}
                  </label>
                  <select id="mode" className="w-full mt-2 px-4 py-3 rounded-xl border">
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
                </div>
              </div>
              <div className="mt-5">
                <label className="text-sm font-bold">
                  {" "}Message{" "}
                </label>
                {" "}
                <textarea id="message" rows={4} placeholder="Your message..." className="w-full mt-2 px-4 py-3 rounded-xl border" />
              </div>
              <button type="submit" className="w-full mt-6 py-4 rounded-xl bg-green-600 text-white font-black hover:bg-green-700 transition">
                {" "}💬 Apply on WhatsApp{" "}
              </button>
            </form>
          </div>
        </section>
        <section className="py-20">
          <div className="max-w-[900px] mx-auto px-5 text-center">
            <div className="bg-white rounded-3xl border shadow-soft p-8 sm:p-12">
              <div className="text-5xl">
                🏆
              </div>
              <h2 className="text-3xl font-black mt-5">
                Course Completion Certificate
              </h2>
              <p className="text-slate-600 leading-7 mt-4">
                Students successfully completing the Android App Development program will receive a course completion certificate from Career Optics Computer Centre.
              </p>
              <div className="grid sm:grid-cols-3 gap-4 mt-8">
                <div className="p-4 rounded-xl bg-slate-50">
                  <div className="font-black">
                    Training
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Complete Course
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50">
                  <div className="font-black">
                    Projects
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Practical Portfolio
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50">
                  <div className="font-black">
                    Certificate
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Course Completion
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="faq" className="py-20 bg-white">
          <div className="max-w-[900px] mx-auto px-5">
            <div className="text-center mb-10">
              <span className="text-indigo-600 text-sm font-black uppercase">
                {" "}FAQ{" "}
              </span>
              <h2 className="text-3xl font-black mt-2">
                Frequently Asked Questions
              </h2>
            </div>
            <div className="space-y-3">
              <div className="faq-item border rounded-2xl overflow-hidden">
                <button data-inline-onclick="toggleFAQ(this)" className="w-full p-5 text-left flex justify-between items-center font-bold">
                  <span>
                    Is this course suitable for beginners?
                  </span>
                  <span className="faq-icon">
                    +
                  </span>
                </button>
                <div className="faq-answer hidden px-5 pb-5 text-sm text-slate-600 leading-7">
                  Yes. The course starts from programming fundamentals and gradually moves toward professional Android application development.
                </div>
              </div>
              <div className="faq-item border rounded-2xl overflow-hidden">
                <button data-inline-onclick="toggleFAQ(this)" className="w-full p-5 text-left flex justify-between items-center font-bold">
                  <span>
                    Will I learn both Java and Kotlin?
                  </span>
                  <span className="faq-icon">
                    +
                  </span>
                </button>
                <div className="faq-answer hidden px-5 pb-5 text-sm text-slate-600 leading-7">
                  Yes. The curriculum covers Java fundamentals and Kotlin programming concepts required for Android development.
                </div>
              </div>
              <div className="faq-item border rounded-2xl overflow-hidden">
                <button data-inline-onclick="toggleFAQ(this)" className="w-full p-5 text-left flex justify-between items-center font-bold">
                  <span>
                    Will I learn Firebase?
                  </span>
                  <span className="faq-icon">
                    +
                  </span>
                </button>
                <div className="faq-answer hidden px-5 pb-5 text-sm text-slate-600 leading-7">
                  Yes. Firebase Authentication, Firestore, Cloud Messaging and other practical Firebase concepts are included.
                </div>
              </div>
              <div className="faq-item border rounded-2xl overflow-hidden">
                <button data-inline-onclick="toggleFAQ(this)" className="w-full p-5 text-left flex justify-between items-center font-bold">
                  <span>
                    Are live projects included?
                  </span>
                  <span className="faq-icon">
                    +
                  </span>
                </button>
                <div className="faq-answer hidden px-5 pb-5 text-sm text-slate-600 leading-7">
                  Yes. Students work on multiple real-world Android projects including management, e-commerce, API and Firebase applications.
                </div>
              </div>
              <div className="faq-item border rounded-2xl overflow-hidden">
                <button data-inline-onclick="toggleFAQ(this)" className="w-full p-5 text-left flex justify-between items-center font-bold">
                  <span>
                    Will I receive a certificate?
                  </span>
                  <span className="faq-icon">
                    +
                  </span>
                </button>
                <div className="faq-answer hidden px-5 pb-5 text-sm text-slate-600 leading-7">
                  Yes. A course completion certificate is provided after successful completion of the program.
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="py-16 bg-gradient-to-r from-indigo-700 to-purple-700 text-white">
          <div className="max-w-[1100px] mx-auto px-5 text-center">
            <h2 className="text-3xl sm:text-4xl font-black">
              Ready to Build Android Apps?
            </h2>
            <p className="text-indigo-100 mt-4">
              Join Career Optics Computer Centre and start your professional Android development journey.
            </p>
            <a href="#admission" className="inline-block mt-7 px-8 py-4 rounded-xl bg-white text-indigo-700 font-black hover:bg-indigo-50">
              {" "}Apply Now →{" "}
            </a>
          </div>
        </section>
        <footer className="bg-slate-950 text-slate-400">
          <div className="max-w-[1500px] mx-auto px-5 lg:px-10 py-12">
            <div className="grid md:grid-cols-3 gap-10">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black">
                    P
                  </div>
                  <div>
                    <h3 className="text-white font-black">
                      Career Optics Computer Centre
                    </h3>
                    <p className="text-xs">
                      Learn • Build • Grow
                    </p>
                  </div>
                </div>
                <p className="text-sm leading-7 mt-5">
                  Professional computer, software and career-oriented training programs for students and professionals.
                </p>
              </div>
              <div>
                <h3 className="text-white font-black">
                  Contact
                </h3>
                <div className="text-sm space-y-3 mt-5">
                  <div>
                    📞 +91 82525 32179
                  </div>
                  <div>
                    ✉️ careeropticsconsultancy@gmail.com
                  </div>
                  <div>
                    📍 Bihar, India
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-white font-black">
                  Android Course
                </h3>
                <div className="text-sm space-y-3 mt-5">
                  <div>
                    ✓ 6 Months
                  </div>
                  <div>
                    ✓ 24 Modules
                  </div>
                  <div>
                    ✓ 8+ Projects
                  </div>
                  <div>
                    ✓ Certificate
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-slate-800 mt-10 pt-6 text-center text-xs">
              © 2026 Career Optics Computer Centre. All Rights Reserved.
            </div>
          </div>
        </footer>
        <a href="https://wa.me/918252532179" target="_blank" className="fixed right-5 bottom-5 z-50 w-14 h-14 rounded-full bg-green-500 text-white flex items-center justify-center text-2xl shadow-2xl hover:scale-110 transition">
          💬
        </a>
        <script dangerouslySetInnerHTML={{ __html: js_f19a7644 }} />
        ```
      </body>
    </html>
  );
}
