import css_b8ff3d6b from "../styles/b8ff3d6b.css?raw";
import js_668463c9 from "../behaviour/668463c9.js?raw";
import js_b3cd3919 from "../behaviour/b3cd3919.js?raw";

/** html.html */
export default function Html() {
  return (
    <html lang="en">
      <head></head>
      <body>
        ```html
        <script src="/cms-config.js"></script>
        <script src="/cms.js" defer></script>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>
          Website Designing Course | Career Optics Computer Academy
        </title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script dangerouslySetInnerHTML={{ __html: js_668463c9 }} />
        <style dangerouslySetInnerHTML={{ __html: css_b8ff3d6b }} />
        <div className="top-strip">
          <div className="container-main py-2 flex flex-col sm:flex-row justify-between gap-2">
            <div>
              Career Optics Computer Academy • Professional Computer & Web Design Training
            </div>
            <div className="flex flex-wrap gap-5">
              <span>
                📞 +91 XXXXX XXXXX
              </span>
              <span>
                ✉ careeropticsconsultancy@gmail.com
              </span>
            </div>
          </div>
        </div>
        <header className="main-nav">
          <div className="container-main">
            <div className="h-16 flex items-center justify-between">
              <a href="#" className="flex items-center gap-3">
                <div className="logo-icon">
                  PNS
                </div>
                <div className="logo-name gradient-text">
                  Career Optics Computer Academy
                </div>
              </a>
              <nav className="desktop-nav flex items-center gap-7 text-sm font-semibold">
                <a href="#" className="hover:text-purple-600">
                  {" "}Home{" "}
                </a>
                <a href="#overview" className="hover:text-purple-600">
                  {" "}Overview{" "}
                </a>
                <a href="#tools" className="hover:text-purple-600">
                  {" "}Tools{" "}
                </a>
                <a href="#curriculum" className="hover:text-purple-600">
                  {" "}Syllabus{" "}
                </a>
                <a href="#projects" className="hover:text-purple-600">
                  {" "}Projects{" "}
                </a>
                <a href="#career" className="hover:text-purple-600">
                  {" "}Career{" "}
                </a>
                <a href="#faq" className="hover:text-purple-600">
                  {" "}FAQ{" "}
                </a>
                <a href="#admission" className="btn-gradient px-5 py-2">
                  {" "}Apply Now{" "}
                </a>
              </nav>
              <button data-inline-onclick="toggleMobile()" className="text-2xl md:hidden">
                {" "}☰{" "}
              </button>
            </div>
            <div id="mobileMenu" className="hidden pb-5">
              <div className="flex flex-col gap-3 text-sm font-semibold">
                <a href="#">
                  Home
                </a>
                <a href="#overview">
                  {" "}Overview{" "}
                </a>
                <a href="#tools">
                  {" "}Tools{" "}
                </a>
                <a href="#curriculum">
                  {" "}Syllabus{" "}
                </a>
                <a href="#projects">
                  {" "}Projects{" "}
                </a>
                <a href="#career">
                  {" "}Career{" "}
                </a>
                <a href="#faq">
                  {" "}FAQ{" "}
                </a>
                <a href="#admission" className="btn-gradient">
                  {" "}Apply Now{" "}
                </a>
              </div>
            </div>
          </div>
        </header>
        <section className="hero">
          <div className="container-main py-16 lg:py-20">
            <div className="hero-grid">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 text-purple-700 text-xs font-bold mb-6">
                  🌐 PROFESSIONAL WEBSITE DESIGNING COURSE
                </div>
                <h1 className="hero-title mb-6">
                  Website Designing Course{" "}
                  <span className="gradient-text block mt-2">
                    {" "}Beginner to Professional{" "}
                  </span>
                </h1>
                <p className="hero-description mb-7">
                  Learn complete website designing from HTML and CSS fundamentals to responsive web design, JavaScript basics, Bootstrap, Tailwind CSS, UI design, WordPress, hosting, SEO basics and live website projects.
                </p>
                <div className="flex flex-wrap gap-3 mb-7">
                  <span className="bg-white border px-4 py-2 rounded-lg text-sm font-semibold">
                    {" "}HTML5{" "}
                  </span>
                  <span className="bg-white border px-4 py-2 rounded-lg text-sm font-semibold">
                    {" "}CSS3{" "}
                  </span>
                  <span className="bg-white border px-4 py-2 rounded-lg text-sm font-semibold">
                    {" "}JavaScript{" "}
                  </span>
                  <span className="bg-white border px-4 py-2 rounded-lg text-sm font-semibold">
                    {" "}Bootstrap{" "}
                  </span>
                  <span className="bg-white border px-4 py-2 rounded-lg text-sm font-semibold">
                    {" "}Tailwind CSS{" "}
                  </span>
                  <span className="bg-white border px-4 py-2 rounded-lg text-sm font-semibold">
                    {" "}WordPress{" "}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  <a href="#admission" className="btn-gradient">
                    {" "}Enroll Now →{" "}
                  </a>
                  <a href="#curriculum" className="px-6 py-3 bg-white border border-slate-300 rounded-lg font-semibold text-sm">
                    {" "}View Complete Syllabus{" "}
                  </a>
                </div>
              </div>
              <div className="course-card">
                <div className="course-card-top"></div>
                <div className="p-7">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">
                        Professional Web Design Program
                      </div>
                      <h2 className="text-2xl font-extrabold">
                        Website Designing
                      </h2>
                    </div>
                    <div className="w-14 h-14 rounded-xl gradient-bg text-white flex items-center justify-center text-2xl">
                      🌐
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="font-bold text-purple-600">
                        24+
                      </div>
                      <div className="text-xs text-slate-500">
                        Modules
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="font-bold text-purple-600">
                        250+
                      </div>
                      <div className="text-xs text-slate-500">
                        Topics
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="font-bold text-purple-600">
                        10+
                      </div>
                      <div className="text-xs text-slate-500">
                        Projects
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="font-bold text-purple-600">
                        LIVE
                      </div>
                      <div className="text-xs text-slate-500">
                        Website
                      </div>
                    </div>
                  </div>
                  <div className="border-t pt-5">
                    <div className="text-xs text-slate-500">
                      Complete Course Fee
                    </div>
                    <div className="flex items-end justify-between">
                      <div className="fee-price">
                        ₹12,500
                      </div>
                      <div className="text-xs text-slate-500 mb-1">
                        Full Program
                      </div>
                    </div>
                  </div>
                  <a href="#admission" className="btn-gradient w-full mt-6">
                    {" "}Apply for Website Designing{" "}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
        <div className="tabs">
          <div className="container-main">
            <div className="tabs-inner">
              <a href="#overview" className="tab-link">
                {" "}Overview{" "}
              </a>
              {" "}
              <a href="#tools" className="tab-link">
                {" "}Tools{" "}
              </a>
              {" "}
              <a href="#curriculum" className="tab-link">
                {" "}Curriculum{" "}
              </a>
              {" "}
              <a href="#projects" className="tab-link">
                {" "}Projects{" "}
              </a>
              {" "}
              <a href="#fee" className="tab-link">
                {" "}Fee ₹12,500{" "}
              </a>
              {" "}
              <a href="#career" className="tab-link">
                {" "}Career{" "}
              </a>
              {" "}
              <a href="#faq" className="tab-link">
                {" "}FAQ{" "}
              </a>
            </div>
          </div>
        </div>
        <main className="container-main py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <section id="overview" className="mb-12">
                <h2 className="section-title mb-4">
                  Website Designing Course Overview
                </h2>
                <p className="section-subtitle mb-5">
                  The Website Designing Course at Career Optics Computer Academy is designed for beginners and students who want to build modern, responsive and professional websites.
                </p>
                <p className="section-subtitle mb-6">
                  Students learn website structure, HTML5, CSS3, responsive design, JavaScript fundamentals, Bootstrap, Tailwind CSS, UI/UX concepts, WordPress, website deployment and practical live projects.
                </p>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="info-card">
                    <div className="icon-box mb-4">
                      🌐
                    </div>
                    <h3 className="font-bold mb-2">
                      Frontend Design
                    </h3>
                    <p className="text-sm text-slate-500">
                      Build modern website layouts using HTML, CSS and responsive design techniques.
                    </p>
                  </div>
                  <div className="info-card">
                    <div className="icon-box mb-4">
                      ⚡
                    </div>
                    <h3 className="font-bold mb-2">
                      Interactive Websites
                    </h3>
                    <p className="text-sm text-slate-500">
                      Learn JavaScript basics and create interactive website components.
                    </p>
                  </div>
                  <div className="info-card">
                    <div className="icon-box mb-4">
                      📱
                    </div>
                    <h3 className="font-bold mb-2">
                      Responsive Design
                    </h3>
                    <p className="text-sm text-slate-500">
                      Create websites that work properly on mobile, tablet and desktop.
                    </p>
                  </div>
                </div>
              </section>
              <section className="mb-12">
                <h2 className="section-title mb-5">
                  What You Will Learn
                </h2>
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="gradient-soft p-6 rounded-xl border">
                    <h3 className="text-xl font-extrabold mb-5">
                      Frontend Development
                    </h3>
                    <ul className="feature-list">
                      <li>
                        HTML5
                      </li>
                      <li>
                        CSS3
                      </li>
                      <li>
                        Responsive Web Design
                      </li>
                      <li>
                        Flexbox
                      </li>
                      <li>
                        CSS Grid
                      </li>
                      <li>
                        JavaScript Basics
                      </li>
                      <li>
                        DOM Basics
                      </li>
                      <li>
                        Form Design
                      </li>
                      <li>
                        Animations
                      </li>
                      <li>
                        Modern UI Layout
                      </li>
                    </ul>
                  </div>
                  <div className="gradient-soft p-6 rounded-xl border">
                    <h3 className="text-xl font-extrabold mb-5">
                      Professional Website Skills
                    </h3>
                    <ul className="feature-list">
                      <li>
                        Bootstrap
                      </li>
                      <li>
                        Tailwind CSS
                      </li>
                      <li>
                        UI/UX Basics
                      </li>
                      <li>
                        WordPress
                      </li>
                      <li>
                        Website Hosting
                      </li>
                      <li>
                        Domain Basics
                      </li>
                      <li>
                        SEO Basics
                      </li>
                      <li>
                        Website Speed
                      </li>
                      <li>
                        Client Requirement
                      </li>
                      <li>
                        Freelancing Basics
                      </li>
                    </ul>
                  </div>
                </div>
              </section>
              <section id="tools" className="mb-12">
                <h2 className="section-title mb-2">
                  Website Designing Tools & Technologies
                </h2>
                <p className="section-subtitle mb-6">
                  Practical training with commonly used web designing tools and technologies.
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="tool-card">
                    <div className="text-3xl mb-3">
                      🌐
                    </div>
                    <h3 className="font-bold mb-1">
                      HTML5
                    </h3>
                    <p className="text-xs text-slate-500">
                      Website structure, semantic tags, forms, tables, media and modern HTML elements.
                    </p>
                  </div>
                  <div className="tool-card">
                    <div className="text-3xl mb-3">
                      🎨
                    </div>
                    <h3 className="font-bold mb-1">
                      CSS3
                    </h3>
                    <p className="text-xs text-slate-500">
                      Layouts, colours, typography, animations, Flexbox, Grid and responsive styling.
                    </p>
                  </div>
                  <div className="tool-card">
                    <div className="text-3xl mb-3">
                      ⚡
                    </div>
                    <h3 className="font-bold mb-1">
                      JavaScript
                    </h3>
                    <p className="text-xs text-slate-500">
                      Variables, functions, events, DOM manipulation and interactive components.
                    </p>
                  </div>
                  <div className="tool-card">
                    <div className="text-3xl mb-3">
                      🧩
                    </div>
                    <h3 className="font-bold mb-1">
                      Bootstrap
                    </h3>
                    <p className="text-xs text-slate-500">
                      Responsive grids, components, cards, forms, navbar and utility classes.
                    </p>
                  </div>
                  <div className="tool-card">
                    <div className="text-3xl mb-3">
                      💨
                    </div>
                    <h3 className="font-bold mb-1">
                      Tailwind CSS
                    </h3>
                    <p className="text-xs text-slate-500">
                      Utility-first responsive UI design and modern website components.
                    </p>
                  </div>
                  <div className="tool-card">
                    <div className="text-3xl mb-3">
                      📝
                    </div>
                    <h3 className="font-bold mb-1">
                      WordPress
                    </h3>
                    <p className="text-xs text-slate-500">
                      CMS basics, themes, pages, menus, plugins and professional website setup.
                    </p>
                  </div>
                </div>
              </section>
              <section id="curriculum" className="mb-12">
                <h2 className="section-title mb-2">
                  Complete Website Designing Syllabus
                </h2>
                <p className="section-subtitle mb-6">
                  Click on any module to open the detailed syllabus.
                </p>
                <div className="gradient-soft rounded-xl px-5 py-4 mb-3">
                  <h3 className="font-extrabold gradient-text">
                    PART A — WEB DESIGN FOUNDATION
                  </h3>
                </div>
                <div className="accordion">
                  <button className="accordion-head" data-inline-onclick="toggleAccordion(this)">
                    {" "}
                    <span>
                      01. Introduction to Website Designing
                    </span>
                    {" "}
                    <span className="arrow">
                      +
                    </span>
                    {" "}
                  </button>
                  <div className="accordion-content">
                    <div className="lesson">
                      <span>
                        What is Website Designing?
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Theory
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Types of Websites
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Theory
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Static vs Dynamic Websites
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Theory
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Website Development Workflow
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Theory
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Web Designer Responsibilities
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Career
                      </span>
                    </div>
                  </div>
                </div>
                <div className="accordion">
                  <button className="accordion-head" data-inline-onclick="toggleAccordion(this)">
                    {" "}
                    <span>
                      02. HTML5 Fundamentals
                    </span>
                    {" "}
                    <span className="arrow">
                      +
                    </span>
                    {" "}
                  </button>
                  <div className="accordion-content">
                    <div className="lesson">
                      <span>
                        HTML Document Structure
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Basics
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        HTML Tags & Elements
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Basics
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Headings & Paragraphs
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Links & Images
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Lists & Tables
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        HTML Comments
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                  </div>
                </div>
                <div className="accordion">
                  <button className="accordion-head" data-inline-onclick="toggleAccordion(this)">
                    {" "}
                    <span>
                      03. HTML Forms & Semantic HTML
                    </span>
                    {" "}
                    <span className="arrow">
                      +
                    </span>
                    {" "}
                  </button>
                  <div className="accordion-content">
                    <div className="lesson">
                      <span>
                        Form Structure
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Input Types
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Labels & Select
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Textarea & Buttons
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Header, Nav, Main & Footer
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        HTML Form Project
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Project
                      </span>
                    </div>
                  </div>
                </div>
                <div className="accordion">
                  <button className="accordion-head" data-inline-onclick="toggleAccordion(this)">
                    {" "}
                    <span>
                      04. CSS3 Fundamentals
                    </span>
                    {" "}
                    <span className="arrow">
                      +
                    </span>
                    {" "}
                  </button>
                  <div className="accordion-content">
                    <div className="lesson">
                      <span>
                        CSS Syntax
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Basics
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Selectors
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Basics
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Colours & Background
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Fonts & Typography
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Margin & Padding
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Border & Box Model
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                  </div>
                </div>
                <div className="accordion">
                  <button className="accordion-head" data-inline-onclick="toggleAccordion(this)">
                    {" "}
                    <span>
                      05. CSS Layout System
                    </span>
                    {" "}
                    <span className="arrow">
                      +
                    </span>
                    {" "}
                  </button>
                  <div className="accordion-content">
                    <div className="lesson">
                      <span>
                        Display Property
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Position Property
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Float & Clear
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Flexbox
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Advanced
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        CSS Grid
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Advanced
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Professional Layout Project
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Project
                      </span>
                    </div>
                  </div>
                </div>
                <div className="accordion">
                  <button className="accordion-head" data-inline-onclick="toggleAccordion(this)">
                    {" "}
                    <span>
                      06. Responsive Web Design
                    </span>
                    {" "}
                    <span className="arrow">
                      +
                    </span>
                    {" "}
                  </button>
                  <div className="accordion-content">
                    <div className="lesson">
                      <span>
                        Responsive Design Concept
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Theory
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Media Queries
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Mobile First Design
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Tablet Layout
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Desktop Layout
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Responsive Website Project
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Project
                      </span>
                    </div>
                  </div>
                </div>
                <div className="gradient-soft rounded-xl px-5 py-4 mt-8 mb-3">
                  <h3 className="font-extrabold gradient-text">
                    PART B — MODERN FRONTEND DESIGN
                  </h3>
                </div>
                <div className="accordion">
                  <button className="accordion-head" data-inline-onclick="toggleAccordion(this)">
                    {" "}
                    <span>
                      07. Advanced CSS
                    </span>
                    {" "}
                    <span className="arrow">
                      +
                    </span>
                    {" "}
                  </button>
                  <div className="accordion-content">
                    <div className="lesson">
                      <span>
                        CSS Variables
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Advanced
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Transitions
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Transforms
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        CSS Animations
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Hover Effects
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Modern Card Design
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Project
                      </span>
                    </div>
                  </div>
                </div>
                <div className="accordion">
                  <button className="accordion-head" data-inline-onclick="toggleAccordion(this)">
                    {" "}
                    <span>
                      08. Bootstrap Framework
                    </span>
                    {" "}
                    <span className="arrow">
                      +
                    </span>
                    {" "}
                  </button>
                  <div className="accordion-content">
                    <div className="lesson">
                      <span>
                        Bootstrap Introduction
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Basics
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Bootstrap Container
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Grid System
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Navbar
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Cards & Buttons
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Bootstrap Website Project
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Project
                      </span>
                    </div>
                  </div>
                </div>
                <div className="accordion">
                  <button className="accordion-head" data-inline-onclick="toggleAccordion(this)">
                    {" "}
                    <span>
                      09. Tailwind CSS
                    </span>
                    {" "}
                    <span className="arrow">
                      +
                    </span>
                    {" "}
                  </button>
                  <div className="accordion-content">
                    <div className="lesson">
                      <span>
                        Tailwind Introduction
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Basics
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Utility Classes
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Responsive Classes
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Flex & Grid
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Cards & Components
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Premium Landing Page
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Project
                      </span>
                    </div>
                  </div>
                </div>
                <div className="accordion">
                  <button className="accordion-head" data-inline-onclick="toggleAccordion(this)">
                    {" "}
                    <span>
                      10. JavaScript Fundamentals
                    </span>
                    {" "}
                    <span className="arrow">
                      +
                    </span>
                    {" "}
                  </button>
                  <div className="accordion-content">
                    <div className="lesson">
                      <span>
                        JavaScript Introduction
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Basics
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Variables & Data Types
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Basics
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Operators
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Conditions
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Loops
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Functions
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                  </div>
                </div>
                <div className="accordion">
                  <button className="accordion-head" data-inline-onclick="toggleAccordion(this)">
                    {" "}
                    <span>
                      11. JavaScript DOM & Events
                    </span>
                    {" "}
                    <span className="arrow">
                      +
                    </span>
                    {" "}
                  </button>
                  <div className="accordion-content">
                    <div className="lesson">
                      <span>
                        DOM Introduction
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Theory
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Selecting HTML Elements
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Click Events
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Form Events
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Show & Hide Elements
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Interactive Website Project
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Project
                      </span>
                    </div>
                  </div>
                </div>
                <div className="accordion">
                  <button className="accordion-head" data-inline-onclick="toggleAccordion(this)">
                    {" "}
                    <span>
                      12. Website Navigation & Components
                    </span>
                    {" "}
                    <span className="arrow">
                      +
                    </span>
                    {" "}
                  </button>
                  <div className="accordion-content">
                    <div className="lesson">
                      <span>
                        Responsive Navbar
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Dropdown Menu
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Mobile Menu
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Hero Section
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        CTA Sections
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Complete Website Header
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Project
                      </span>
                    </div>
                  </div>
                </div>
                <div className="gradient-soft rounded-xl px-5 py-4 mt-8 mb-3">
                  <h3 className="font-extrabold gradient-text">
                    PART C — PROFESSIONAL WEBSITE DEVELOPMENT
                  </h3>
                </div>
                <div className="accordion">
                  <button className="accordion-head" data-inline-onclick="toggleAccordion(this)">
                    {" "}
                    <span>
                      13. UI/UX Design Basics
                    </span>
                    {" "}
                    <span className="arrow">
                      +
                    </span>
                    {" "}
                  </button>
                  <div className="accordion-content">
                    <div className="lesson">
                      <span>
                        UI & UX Introduction
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Theory
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Colour Psychology
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Theory
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Typography
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Spacing & Alignment
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Visual Hierarchy
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Landing Page UI Project
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Project
                      </span>
                    </div>
                  </div>
                </div>
                <div className="accordion">
                  <button className="accordion-head" data-inline-onclick="toggleAccordion(this)">
                    {" "}
                    <span>
                      14. WordPress Website Designing
                    </span>
                    {" "}
                    <span className="arrow">
                      +
                    </span>
                    {" "}
                  </button>
                  <div className="accordion-content">
                    <div className="lesson">
                      <span>
                        WordPress Introduction
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Basics
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        WordPress Installation
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Themes
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Pages & Posts
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Menus & Widgets
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Plugins
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                  </div>
                </div>
                <div className="accordion">
                  <button className="accordion-head" data-inline-onclick="toggleAccordion(this)">
                    {" "}
                    <span>
                      15. Elementor Website Design
                    </span>
                    {" "}
                    <span className="arrow">
                      +
                    </span>
                    {" "}
                  </button>
                  <div className="accordion-content">
                    <div className="lesson">
                      <span>
                        Elementor Interface
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Basics
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Sections & Containers
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Heading & Text Widgets
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Image & Button Widgets
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Responsive Elementor
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Business Website Project
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Project
                      </span>
                    </div>
                  </div>
                </div>
                <div className="accordion">
                  <button className="accordion-head" data-inline-onclick="toggleAccordion(this)">
                    {" "}
                    <span>
                      16. Website Forms & Contact Sections
                    </span>
                    {" "}
                    <span className="arrow">
                      +
                    </span>
                    {" "}
                  </button>
                  <div className="accordion-content">
                    <div className="lesson">
                      <span>
                        Contact Form Design
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Admission Form
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Enquiry Form
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        WhatsApp Integration
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Google Map Section
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Contact Page Project
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Project
                      </span>
                    </div>
                  </div>
                </div>
                <div className="accordion">
                  <button className="accordion-head" data-inline-onclick="toggleAccordion(this)">
                    {" "}
                    <span>
                      17. Website SEO Basics
                    </span>
                    {" "}
                    <span className="arrow">
                      +
                    </span>
                    {" "}
                  </button>
                  <div className="accordion-content">
                    <div className="lesson">
                      <span>
                        SEO Introduction
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Theory
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Title & Meta Description
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Heading Structure
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Image Optimization
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        URL Structure
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Basic SEO Project
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Project
                      </span>
                    </div>
                  </div>
                </div>
                <div className="accordion">
                  <button className="accordion-head" data-inline-onclick="toggleAccordion(this)">
                    {" "}
                    <span>
                      18. Website Speed & Optimization
                    </span>
                    {" "}
                    <span className="arrow">
                      +
                    </span>
                    {" "}
                  </button>
                  <div className="accordion-content">
                    <div className="lesson">
                      <span>
                        Website Performance
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Theory
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Image Compression
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        CSS Optimization
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        JavaScript Optimization
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Mobile Performance
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                  </div>
                </div>
                <div className="gradient-soft rounded-xl px-5 py-4 mt-8 mb-3">
                  <h3 className="font-extrabold gradient-text">
                    PART D — DEPLOYMENT, PROJECTS & CAREER
                  </h3>
                </div>
                <div className="accordion">
                  <button className="accordion-head" data-inline-onclick="toggleAccordion(this)">
                    {" "}
                    <span>
                      19. Domain & Hosting
                    </span>
                    {" "}
                    <span className="arrow">
                      +
                    </span>
                    {" "}
                  </button>
                  <div className="accordion-content">
                    <div className="lesson">
                      <span>
                        Domain Name Basics
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Theory
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Hosting Basics
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Theory
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        cPanel Introduction
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        File Manager
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        FTP Basics
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                  </div>
                </div>
                <div className="accordion">
                  <button className="accordion-head" data-inline-onclick="toggleAccordion(this)">
                    {" "}
                    <span>
                      20. Website Deployment
                    </span>
                    {" "}
                    <span className="arrow">
                      +
                    </span>
                    {" "}
                  </button>
                  <div className="accordion-content">
                    <div className="lesson">
                      <span>
                        Website File Structure
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Upload Website
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Connect Domain
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        SSL Certificate Basics
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Live Website Testing
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Project
                      </span>
                    </div>
                  </div>
                </div>
                <div className="accordion">
                  <button className="accordion-head" data-inline-onclick="toggleAccordion(this)">
                    {" "}
                    <span>
                      21. Business Website Project
                    </span>
                    {" "}
                    <span className="arrow">
                      +
                    </span>
                    {" "}
                  </button>
                  <div className="accordion-content">
                    <div className="lesson">
                      <span>
                        Business Requirement
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Planning
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Home Page
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Project
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        About Page
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Project
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Services Page
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Project
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Contact Page
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Project
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Complete Business Website
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Final
                      </span>
                    </div>
                  </div>
                </div>
                <div className="accordion">
                  <button className="accordion-head" data-inline-onclick="toggleAccordion(this)">
                    {" "}
                    <span>
                      22. Portfolio Website Project
                    </span>
                    {" "}
                    <span className="arrow">
                      +
                    </span>
                    {" "}
                  </button>
                  <div className="accordion-content">
                    <div className="lesson">
                      <span>
                        Portfolio Planning
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Planning
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Hero Section
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Project
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Skills Section
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Project
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Projects Section
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Project
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Contact Section
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Project
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Professional Portfolio
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Final
                      </span>
                    </div>
                  </div>
                </div>
                <div className="accordion">
                  <button className="accordion-head" data-inline-onclick="toggleAccordion(this)">
                    {" "}
                    <span>
                      23. Freelancing & Client Work
                    </span>
                    {" "}
                    <span className="arrow">
                      +
                    </span>
                    {" "}
                  </button>
                  <div className="accordion-content">
                    <div className="lesson">
                      <span>
                        Freelancing Introduction
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Career
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Client Requirement Collection
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Career
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Website Pricing Basics
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Career
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Project Communication
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Career
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Revision Management
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Career
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Project Delivery
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Career
                      </span>
                    </div>
                  </div>
                </div>
                <div className="accordion">
                  <button className="accordion-head" data-inline-onclick="toggleAccordion(this)">
                    {" "}
                    <span>
                      24. Final Website Designing Project
                    </span>
                    {" "}
                    <span className="arrow">
                      +
                    </span>
                    {" "}
                  </button>
                  <div className="accordion-content">
                    <div className="lesson">
                      <span>
                        Project Planning
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Planning
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        UI Design
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Design
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        HTML Development
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Development
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        CSS Responsive Design
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Development
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        JavaScript Interaction
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Development
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Final Testing & Deployment
                      </span>
                      {" "}
                      <span className="lesson-type">
                        Final Project
                      </span>
                    </div>
                  </div>
                </div>
              </section>
              <section id="projects" className="mb-12">
                <h2 className="section-title mb-3">
                  Practical Website Designing Projects
                </h2>
                <p className="section-subtitle mb-6">
                  Students create multiple real-world style websites during the course.
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="project-card">
                    <div className="text-3xl mb-3">
                      🏫
                    </div>
                    <h3 className="font-bold mb-2">
                      Education Website
                    </h3>
                    <p className="text-sm text-slate-500">
                      Create a responsive school or computer institute website.
                    </p>
                  </div>
                  <div className="project-card">
                    <div className="text-3xl mb-3">
                      🏢
                    </div>
                    <h3 className="font-bold mb-2">
                      Business Website
                    </h3>
                    <p className="text-sm text-slate-500">
                      Build a professional business website with services and enquiry sections.
                    </p>
                  </div>
                  <div className="project-card">
                    <div className="text-3xl mb-3">
                      👨‍💻
                    </div>
                    <h3 className="font-bold mb-2">
                      Portfolio Website
                    </h3>
                    <p className="text-sm text-slate-500">
                      Create a modern personal portfolio website for career and freelancing.
                    </p>
                  </div>
                  <div className="project-card">
                    <div className="text-3xl mb-3">
                      🛒
                    </div>
                    <h3 className="font-bold mb-2">
                      Product Landing Page
                    </h3>
                    <p className="text-sm text-slate-500">
                      Design a responsive product promotion and sales landing page.
                    </p>
                  </div>
                  <div className="project-card">
                    <div className="text-3xl mb-3">
                      📰
                    </div>
                    <h3 className="font-bold mb-2">
                      News Website
                    </h3>
                    <p className="text-sm text-slate-500">
                      Create a responsive news portal style website layout.
                    </p>
                  </div>
                  <div className="project-card">
                    <div className="text-3xl mb-3">
                      💼
                    </div>
                    <h3 className="font-bold mb-2">
                      Final Live Website
                    </h3>
                    <p className="text-sm text-slate-500">
                      Plan, design and deploy a complete professional website.
                    </p>
                  </div>
                </div>
              </section>
              <section id="fee" className="mb-12">
                <h2 className="section-title mb-5">
                  Website Designing Course Fee
                </h2>
                <div className="fee-card p-7">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                      <div className="text-sm text-slate-500 mb-2">
                        Complete Website Designing Program
                      </div>
                      <div className="fee-price mb-3">
                        ₹12,500
                      </div>
                      <p className="text-sm text-slate-600 leading-7">
                        Complete website designing training with HTML, CSS, JavaScript, Bootstrap, Tailwind CSS, WordPress, responsive design, projects and deployment.
                      </p>
                    </div>
                    <div>
                      <ul className="feature-list">
                        <li>
                          HTML5
                        </li>
                        <li>
                          CSS3
                        </li>
                        <li>
                          Responsive Web Design
                        </li>
                        <li>
                          JavaScript Basics
                        </li>
                        <li>
                          Bootstrap
                        </li>
                        <li>
                          Tailwind CSS
                        </li>
                        <li>
                          WordPress
                        </li>
                        <li>
                          Elementor
                        </li>
                        <li>
                          UI/UX Basics
                        </li>
                        <li>
                          SEO Basics
                        </li>
                        <li>
                          Domain & Hosting
                        </li>
                        <li>
                          Website Deployment
                        </li>
                        <li>
                          Live Projects
                        </li>
                        <li>
                          Portfolio Project
                        </li>
                        <li>
                          Course Completion Certificate
                        </li>
                      </ul>
                      <a href="#admission" className="btn-gradient w-full mt-3">
                        {" "}Enroll for ₹12,500{" "}
                      </a>
                    </div>
                  </div>
                </div>
              </section>
              <section className="mb-12">
                <h2 className="section-title mb-5">
                  Eligibility & Requirements
                </h2>
                <div className="bg-white border rounded-xl p-6">
                  <ul className="feature-list">
                    <li>
                      10th, 12th, ITI, Diploma and Graduate students can join.
                    </li>
                    <li>
                      No previous coding experience is required.
                    </li>
                    <li>
                      Beginners can start from HTML and CSS fundamentals.
                    </li>
                    <li>
                      Basic computer knowledge is recommended.
                    </li>
                    <li>
                      Students should have regular practice for better results.
                    </li>
                  </ul>
                </div>
              </section>
              <section id="career" className="mb-12">
                <h2 className="section-title mb-3">
                  Career Opportunities
                </h2>
                <p className="section-subtitle mb-5">
                  After completing website designing training, students can explore jobs, internships, freelance projects and website development opportunities.
                </p>
                <div>
                  <span className="job-pill">
                    Web Designer
                  </span>
                  {" "}
                  <span className="job-pill">
                    Frontend Designer
                  </span>
                  {" "}
                  <span className="job-pill">
                    HTML Developer
                  </span>
                  {" "}
                  <span className="job-pill">
                    CSS Developer
                  </span>
                  {" "}
                  <span className="job-pill">
                    WordPress Designer
                  </span>
                  {" "}
                  <span className="job-pill">
                    UI Designer
                  </span>
                  {" "}
                  <span className="job-pill">
                    Landing Page Designer
                  </span>
                  {" "}
                  <span className="job-pill">
                    Website Developer
                  </span>
                  {" "}
                  <span className="job-pill">
                    Freelance Web Designer
                  </span>
                  {" "}
                  <span className="job-pill">
                    WordPress Freelancer
                  </span>
                  {" "}
                  <span className="job-pill">
                    Junior Frontend Developer
                  </span>
                  {" "}
                  <span className="job-pill">
                    Website Maintenance Executive
                  </span>
                  {" "}
                  <span className="job-pill">
                    Digital Agency Executive
                  </span>
                </div>
              </section>
              <section id="admission" className="mb-12">
                <div className="gradient-soft border rounded-2xl p-6 md:p-8">
                  <h2 className="section-title mb-2">
                    Apply for Website Designing Course
                  </h2>
                  <p className="section-subtitle mb-6">
                    Submit your details and our admission team will contact you.
                  </p>
                  <form data-inline-onsubmit="submitAdmission(event)">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-semibold">
                          {" "}Student Name{" "}
                        </label>
                        {" "}
                        <input type="text" id="studentName" className="form-input mt-2" placeholder="Enter your name" required />
                      </div>
                      <div>
                        <label className="text-sm font-semibold">
                          {" "}Mobile Number{" "}
                        </label>
                        {" "}
                        <input type="tel" id="studentPhone" className="form-input mt-2" placeholder="Enter mobile number" required />
                      </div>
                      <div>
                        <label className="text-sm font-semibold">
                          {" "}Email{" "}
                        </label>
                        {" "}
                        <input type="email" id="studentEmail" className="form-input mt-2" placeholder="Enter email" />
                      </div>
                      <div>
                        <label className="text-sm font-semibold">
                          {" "}Qualification{" "}
                        </label>
                        <select id="qualification" className="form-input mt-2">
                          <option>
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
                          <option>
                            Other
                          </option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-semibold">
                          {" "}Interested Course{" "}
                        </label>
                        <select id="interested" className="form-input mt-2">
                          <option>
                            Website Designing Course
                          </option>
                          <option>
                            HTML & CSS
                          </option>
                          <option>
                            Frontend Development
                          </option>
                          <option>
                            WordPress
                          </option>
                          <option>
                            Tailwind CSS
                          </option>
                          <option>
                            Complete Web Design
                          </option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-semibold">
                          {" "}Preferred Mode{" "}
                        </label>
                        <select id="mode" className="form-input mt-2">
                          <option>
                            Select Mode
                          </option>
                          <option>
                            Classroom
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
                    <div className="mt-4">
                      <label className="text-sm font-semibold">
                        {" "}Message{" "}
                      </label>
                      {" "}
                      <textarea id="studentMessage" className="form-input mt-2" rows={4} placeholder="Enter your requirement" />
                    </div>
                    <button type="submit" className="btn-gradient mt-5">
                      {" "}Submit Admission Enquiry →{" "}
                    </button>
                  </form>
                </div>
              </section>
              <section id="faq">
                <h2 className="section-title mb-5">
                  Frequently Asked Questions
                </h2>
                <div className="faq-item">
                  <button className="faq-btn" data-inline-onclick="toggleFAQ(this)">
                    {" "}Is this course suitable for beginners?{" "}
                    <span>
                      +
                    </span>
                    {" "}
                  </button>
                  <div className="faq-answer">
                    Yes. The course starts from HTML and CSS fundamentals and gradually moves towards responsive and professional website design.
                  </div>
                </div>
                <div className="faq-item">
                  <button className="faq-btn" data-inline-onclick="toggleFAQ(this)">
                    {" "}What technologies are covered?{" "}
                    <span>
                      +
                    </span>
                    {" "}
                  </button>
                  <div className="faq-answer">
                    HTML5, CSS3, JavaScript basics, Bootstrap, Tailwind CSS, WordPress, Elementor, UI/UX basics and website deployment are covered.
                  </div>
                </div>
                <div className="faq-item">
                  <button className="faq-btn" data-inline-onclick="toggleFAQ(this)">
                    {" "}Will I learn responsive website design?{" "}
                    <span>
                      +
                    </span>
                    {" "}
                  </button>
                  <div className="faq-answer">
                    Yes. Responsive design using CSS media queries, Flexbox, Grid, Bootstrap and Tailwind CSS is included.
                  </div>
                </div>
                <div className="faq-item">
                  <button className="faq-btn" data-inline-onclick="toggleFAQ(this)">
                    {" "}Is WordPress included?{" "}
                    <span>
                      +
                    </span>
                    {" "}
                  </button>
                  <div className="faq-answer">
                    Yes. WordPress installation, themes, pages, menus, plugins and Elementor-based website design are included.
                  </div>
                </div>
                <div className="faq-item">
                  <button className="faq-btn" data-inline-onclick="toggleFAQ(this)">
                    {" "}Will I create live projects?{" "}
                    <span>
                      +
                    </span>
                    {" "}
                  </button>
                  <div className="faq-answer">
                    Yes. Students work on education, business, portfolio, landing page and final website projects.
                  </div>
                </div>
                <div className="faq-item">
                  <button className="faq-btn" data-inline-onclick="toggleFAQ(this)">
                    {" "}Can I work as a freelance web designer?{" "}
                    <span>
                      +
                    </span>
                    {" "}
                  </button>
                  <div className="faq-answer">
                    The course includes client requirements, website pricing basics, project communication, revisions and project delivery concepts.
                  </div>
                </div>
                <div className="faq-item">
                  <button className="faq-btn" data-inline-onclick="toggleFAQ(this)">
                    {" "}What is the course fee?{" "}
                    <span>
                      +
                    </span>
                    {" "}
                  </button>
                  <div className="faq-answer">
                    The displayed complete course fee is ₹12,500.
                  </div>
                </div>
                <div className="faq-item">
                  <button className="faq-btn" data-inline-onclick="toggleFAQ(this)">
                    {" "}Will I receive a certificate?{" "}
                    <span>
                      +
                    </span>
                    {" "}
                  </button>
                  <div className="faq-answer">
                    A course completion certificate can be provided according to Career Optics Computer Academy's certification policy.
                  </div>
                </div>
              </section>
            </div>
            <aside>
              <div className="sidebar-card p-6 lg:sticky lg:top-20">
                <div className="text-xs text-slate-500 mb-1">
                  Professional Web Design Program
                </div>
                <h3 className="text-xl font-extrabold mb-5">
                  Website Designing
                </h3>
                <div className="fee-price mb-2">
                  ₹12,500
                </div>
                <div className="text-xs text-slate-500 mb-5">
                  Complete Course Fee
                </div>
                <a href="#admission" className="btn-gradient w-full mb-6">
                  {" "}Apply Now{" "}
                </a>
                <div className="border-t pt-5">
                  <h4 className="font-extrabold mb-4">
                    Course Includes
                  </h4>
                  <ul className="feature-list">
                    <li>
                      HTML5
                    </li>
                    <li>
                      CSS3
                    </li>
                    <li>
                      Responsive Design
                    </li>
                    <li>
                      JavaScript
                    </li>
                    <li>
                      Bootstrap
                    </li>
                    <li>
                      Tailwind CSS
                    </li>
                    <li>
                      WordPress
                    </li>
                    <li>
                      Elementor
                    </li>
                    <li>
                      UI/UX
                    </li>
                    <li>
                      SEO Basics
                    </li>
                    <li>
                      Domain & Hosting
                    </li>
                    <li>
                      Deployment
                    </li>
                    <li>
                      Live Projects
                    </li>
                    <li>
                      Portfolio
                    </li>
                    <li>
                      Certificate
                    </li>
                  </ul>
                </div>
                <div className="border-t mt-5 pt-5">
                  <h4 className="font-bold mb-2">
                    Need Help?
                  </h4>
                  <p className="text-xs text-slate-500 leading-6 mb-4">
                    Contact Career Optics Computer Academy admission team for course details.
                  </p>
                  <a href="https://wa.me/918252532179" target="_blank" className="w-full flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-lg font-bold text-sm">
                    💬 WhatsApp Enquiry
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </main>
        <section className="cta">
          <div className="container-main py-14 text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              Build Your Web Designing Career
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm leading-7 mb-7">
              Learn HTML, CSS, JavaScript, Bootstrap, Tailwind CSS, WordPress and responsive website development through practical projects.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <a href="#admission" className="bg-white text-purple-700 px-7 py-3 rounded-lg font-bold">
                {" "}Enroll Now — ₹12,500{" "}
              </a>
              <a href="https://wa.me/918252532179" target="_blank" className="bg-green-500 text-white px-7 py-3 rounded-lg font-bold">
                {" "}WhatsApp Us{" "}
              </a>
            </div>
          </div>
        </section>
        <footer className="footer">
          <div className="container-main py-10">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="text-xl font-extrabold text-white mb-3">
                  Career Optics Computer Academy
                </div>
                <p className="text-sm leading-7 text-slate-400">
                  Professional computer education, web design and career-focused skill development.
                </p>
              </div>
              <div>
                <h4 className="text-white font-bold mb-4">
                  Website Designing
                </h4>
                <div className="space-y-2 text-sm">
                  <a href="#tools" className="block">
                    {" "}Tools{" "}
                  </a>
                  {" "}
                  <a href="#curriculum" className="block">
                    {" "}Syllabus{" "}
                  </a>
                  {" "}
                  <a href="#projects" className="block">
                    {" "}Projects{" "}
                  </a>
                </div>
              </div>
              <div>
                <h4 className="text-white font-bold mb-4">
                  Quick Links
                </h4>
                <div className="space-y-2 text-sm">
                  <a href="#overview" className="block">
                    {" "}Overview{" "}
                  </a>
                  {" "}
                  <a href="#career" className="block">
                    {" "}Career{" "}
                  </a>
                  {" "}
                  <a href="#admission" className="block">
                    {" "}Admission{" "}
                  </a>
                  {" "}
                  <a href="#faq" className="block">
                    {" "}FAQ{" "}
                  </a>
                </div>
              </div>
              <div>
                <h4 className="text-white font-bold mb-4">
                  Contact
                </h4>
                <div className="space-y-2 text-sm text-slate-400">
                  <div>
                    📞 +91 XXXXX XXXXX
                  </div>
                  <div>
                    ✉ careeropticsconsultancy@gmail.com
                  </div>
                  <div>
                    📍 Career Optics Computer Academy
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-slate-700 mt-8 pt-6 text-center text-xs text-slate-500">
              © 2026 Career Optics Computer Academy. All Rights Reserved.
            </div>
          </div>
        </footer>
        <a href="https://wa.me/918252532179" target="_blank" className="whatsapp" title="WhatsApp Enquiry">
          {" "}💬{" "}
        </a>
        <script dangerouslySetInnerHTML={{ __html: js_b3cd3919 }} />
        ```
      </body>
    </html>
  );
}
