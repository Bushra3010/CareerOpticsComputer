import DivBlock from "../components/DivBlock";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import StyleBlock from "../components/StyleBlock";
import StyleBlock2 from "../components/StyleBlock2";
import WhatsappWidget from "../components/WhatsappWidget";
import css_32f7cc4c from "../styles/32f7cc4c.css?raw";
import css_d96d3f31 from "../styles/d96d3f31.css?raw";
import js_0023a4f0 from "../behaviour/0023a4f0.js?raw";
import js_73893071 from "../behaviour/73893071.js?raw";
import js_c1268ab4 from "../behaviour/c1268ab4.js?raw";
import js_ea05b2d5 from "../behaviour/ea05b2d5.js?raw";
import js_ec50356d from "../behaviour/ec50356d.js?raw";

/** autocad.html */
export default function Autocad() {
  return (
    <html lang="en">
      <head>
        <script src="/cms-config.js"></script>
        <script src="/cms.js" defer></script>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>
          Career Optics Computer Academy | Education • Software • Skill Development
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
      <body>
        <SiteHeader />
        <script dangerouslySetInnerHTML={{ __html: js_73893071 }} />
        <StyleBlock />
        <style dangerouslySetInnerHTML={{ __html: css_d96d3f31 }} />
        <section className="hero">
          <div className="container-main py-12 lg:py-16">
            <div className="hero-grid">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 text-purple-700 text-xs font-bold mb-6">
                  🚀 PROFESSIONAL CAD TRAINING
                </div>
                <h1 className="hero-title mb-6">
                  AutoCAD 2D & 3D Course{" "}
                  <span className="gradient-text block mt-2">
                    {" "}Beginner to Advanced{" "}
                  </span>
                </h1>
                <p className="hero-description mb-7">
                  Master professional AutoCAD 2D drafting and 3D modeling from basic drawing commands to advanced architectural, mechanical and product design projects.
                </p>
                <div className="flex flex-wrap gap-3 mb-7">
                  <span className="bg-white border px-4 py-2 rounded-lg text-sm font-semibold">
                    {" "}📐 AutoCAD 2D{" "}
                  </span>
                  <span className="bg-white border px-4 py-2 rounded-lg text-sm font-semibold">
                    {" "}🧊 AutoCAD 3D{" "}
                  </span>
                  <span className="bg-white border px-4 py-2 rounded-lg text-sm font-semibold">
                    {" "}🏗 Architecture{" "}
                  </span>
                  <span className="bg-white border px-4 py-2 rounded-lg text-sm font-semibold">
                    {" "}⚙ Mechanical{" "}
                  </span>
                  <span className="bg-white border px-4 py-2 rounded-lg text-sm font-semibold">
                    {" "}🎨 3D Visualization{" "}
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
                        Complete CAD Program
                      </div>
                      <h2 className="text-2xl font-extrabold">
                        AutoCAD 2D + 3D
                      </h2>
                    </div>
                    <div className="w-14 h-14 rounded-xl gradient-bg text-white flex items-center justify-center text-2xl">
                      CAD
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
                        200+
                      </div>
                      <div className="text-xs text-slate-500">
                        Topics
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="font-bold text-purple-600">
                        2D
                      </div>
                      <div className="text-xs text-slate-500">
                        Drafting
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="font-bold text-purple-600">
                        3D
                      </div>
                      <div className="text-xs text-slate-500">
                        Modeling
                      </div>
                    </div>
                  </div>
                  <div className="border-t pt-5">
                    <div className="text-xs text-slate-500">
                      Complete Course Fee
                    </div>
                    <div className="flex items-end justify-between">
                      <div className="fee-price">
                        ₹5,499
                      </div>
                      <div className="text-xs text-slate-500 mb-1">
                        Full Program
                      </div>
                    </div>
                  </div>
                  <a href="#admission" className="btn-gradient w-full mt-6">
                    {" "}Apply for AutoCAD Course{" "}
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
              <a href="#course-types" className="tab-link">
                {" "}2D + 3D{" "}
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
              <a href="#cost" className="tab-link">
                {" "}Fee ₹8,499{" "}
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
                  AutoCAD 2D & 3D Course Overview
                </h2>
                <p className="section-subtitle mb-5">
                  Career Optics Computer Academy's AutoCAD 2D & 3D Course is designed to provide complete practical CAD training for students and professionals interested in architecture, civil, mechanical, interior and product design.
                </p>
                <p className="section-subtitle mb-6">
                  The program starts with AutoCAD 2D drafting, drawing commands, layers, dimensions, annotations and layouts, then progresses into 3D coordinates, UCS, solid modeling, Boolean operations, surfaces, materials, lighting, rendering and professional projects.
                </p>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="type-card">
                    <div className="type-icon mb-4">
                      📐
                    </div>
                    <h3 className="font-bold mb-2">
                      2D Drafting
                    </h3>
                    <p className="text-sm text-slate-500">
                      Professional technical drawing, dimensions, layers and layouts.
                    </p>
                  </div>
                  <div className="type-card">
                    <div className="type-icon mb-4">
                      🧊
                    </div>
                    <h3 className="font-bold mb-2">
                      3D Modeling
                    </h3>
                    <p className="text-sm text-slate-500">
                      Solid, surface and advanced 3D modeling techniques.
                    </p>
                  </div>
                  <div className="type-card">
                    <div className="type-icon mb-4">
                      🏗
                    </div>
                    <h3 className="font-bold mb-2">
                      Projects
                    </h3>
                    <p className="text-sm text-slate-500">
                      Architecture, mechanical and product design projects.
                    </p>
                  </div>
                </div>
              </section>
              <section id="course-types" className="mb-12">
                <h2 className="section-title mb-2">
                  AutoCAD 2D + AutoCAD 3D
                </h2>
                <p className="section-subtitle mb-6">
                  One complete program covering both technical drafting and professional three-dimensional modeling.
                </p>
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="gradient-border p-6">
                    <div className="flex items-center gap-4 mb-5">
                      <div className="type-icon">
                        📐
                      </div>
                      <div>
                        <h3 className="text-xl font-extrabold">
                          AutoCAD 2D
                        </h3>
                        <p className="text-xs text-slate-500">
                          Technical Drafting
                        </p>
                      </div>
                    </div>
                    <ul className="feature-list">
                      <li>
                        Drawing & Modify Commands
                      </li>
                      <li>
                        Layers & Properties
                      </li>
                      <li>
                        Dimensioning & Annotation
                      </li>
                      <li>
                        Blocks & Attributes
                      </li>
                      <li>
                        Layouts & Viewports
                      </li>
                      <li>
                        Professional 2D Projects
                      </li>
                    </ul>
                  </div>
                  <div className="gradient-border p-6">
                    <div className="flex items-center gap-4 mb-5">
                      <div className="type-icon">
                        🧊
                      </div>
                      <div>
                        <h3 className="text-xl font-extrabold">
                          AutoCAD 3D
                        </h3>
                        <p className="text-xs text-slate-500">
                          3D Modeling & Visualization
                        </p>
                      </div>
                    </div>
                    <ul className="feature-list">
                      <li>
                        3D Coordinates & UCS
                      </li>
                      <li>
                        Solid Modeling
                      </li>
                      <li>
                        Boolean Operations
                      </li>
                      <li>
                        Surface & Mesh Modeling
                      </li>
                      <li>
                        Materials & Lighting
                      </li>
                      <li>
                        3D Projects & Rendering
                      </li>
                    </ul>
                  </div>
                </div>
              </section>
              <section id="curriculum" className="mb-12">
                <h2 className="section-title mb-2">
                  Complete AutoCAD 2D & 3D Syllabus
                </h2>
                <p className="section-subtitle mb-6">
                  Click any module to open the detailed syllabus.
                </p>
                <div className="mb-5">
                  <div className="gradient-soft rounded-xl px-5 py-4 mb-3">
                    <h3 className="font-extrabold gradient-text">
                      PART A — AUTOCAD 2D
                    </h3>
                  </div>
                  <div className="accordion">
                    <button className="accordion-head" data-inline-onclick="toggleAccordion(this)">
                      {" "}
                      <span>
                        {" "}01. AutoCAD Introduction & Interface{" "}
                      </span>
                      {" "}
                      <span className="arrow">
                        {" "}+{" "}
                      </span>
                      {" "}
                    </button>
                    <div className="accordion-content">
                      <div className="lesson">
                        <span>
                          {" "}Introduction to CAD & AutoCAD{" "}
                        </span>
                        {" "}
                        <span className="lesson-time">
                          {" "}Basic{" "}
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          {" "}AutoCAD Workspace & Interface{" "}
                        </span>
                        {" "}
                        <span className="lesson-time">
                          {" "}Basic{" "}
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          {" "}Ribbon, Panels & Toolbars{" "}
                        </span>
                        {" "}
                        <span className="lesson-time">
                          {" "}Practice{" "}
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          {" "}Command Line & Status Bar{" "}
                        </span>
                        {" "}
                        <span className="lesson-time">
                          {" "}Practice{" "}
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          {" "}Units & Drawing Limits{" "}
                        </span>
                        {" "}
                        <span className="lesson-time">
                          {" "}Practice{" "}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="accordion">
                    <button className="accordion-head" data-inline-onclick="toggleAccordion(this)">
                      {" "}
                      <span>
                        {" "}02. Basic Drawing Commands{" "}
                      </span>
                      {" "}
                      <span className="arrow">
                        {" "}+{" "}
                      </span>
                      {" "}
                    </button>
                    <div className="accordion-content">
                      <div className="lesson">
                        <span>
                          Line Command
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Basic
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Polyline Command
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Basic
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Circle Command
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Basic
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Arc Command
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Practice
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Rectangle Command
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Practice
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Polygon & Ellipse
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Practice
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Spline & Construction Line
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Advanced
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="accordion">
                    <button className="accordion-head" data-inline-onclick="toggleAccordion(this)">
                      {" "}
                      <span>
                        {" "}03. Modify Commands{" "}
                      </span>
                      {" "}
                      <span className="arrow">
                        {" "}+{" "}
                      </span>
                      {" "}
                    </button>
                    <div className="accordion-content">
                      <div className="lesson">
                        <span>
                          Move
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Basic
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Copy
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Basic
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Rotate
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Practice
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Mirror
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Practice
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Offset
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Practice
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Trim & Extend
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Practice
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Fillet & Chamfer
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Advanced
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Array Commands
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Advanced
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="accordion">
                    <button className="accordion-head" data-inline-onclick="toggleAccordion(this)">
                      {" "}
                      <span>
                        {" "}04. Layers, Properties & Object Control{" "}
                      </span>
                      {" "}
                      <span className="arrow">
                        {" "}+{" "}
                      </span>
                      {" "}
                    </button>
                    <div className="accordion-content">
                      <div className="lesson">
                        <span>
                          Layer Creation
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Basic
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Layer Color & Linetype
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Practice
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Layer Freeze & Lock
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Practice
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Properties Panel
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Practice
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Object Selection Methods
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Advanced
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="accordion">
                    <button className="accordion-head" data-inline-onclick="toggleAccordion(this)">
                      {" "}
                      <span>
                        {" "}05. Object Snap, Coordinates & Precision{" "}
                      </span>
                      {" "}
                      <span className="arrow">
                        {" "}+{" "}
                      </span>
                      {" "}
                    </button>
                    <div className="accordion-content">
                      <div className="lesson">
                        <span>
                          Object Snap Settings
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Basic
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Endpoint, Midpoint & Center
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Practice
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Ortho Mode
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Practice
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Polar Tracking
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Practice
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Absolute & Relative Coordinates
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Advanced
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="accordion">
                    <button className="accordion-head" data-inline-onclick="toggleAccordion(this)">
                      {" "}
                      <span>
                        {" "}06. Dimensions & Annotation{" "}
                      </span>
                      {" "}
                      <span className="arrow">
                        {" "}+{" "}
                      </span>
                      {" "}
                    </button>
                    <div className="accordion-content">
                      <div className="lesson">
                        <span>
                          Linear Dimension
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Basic
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Aligned Dimension
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Practice
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Angular Dimension
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Practice
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Radius & Diameter
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Practice
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Dimension Style Manager
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Advanced
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Text & MText
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Practice
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="accordion">
                    <button className="accordion-head" data-inline-onclick="toggleAccordion(this)">
                      {" "}
                      <span>
                        {" "}07. Blocks, Hatches & Attributes{" "}
                      </span>
                      {" "}
                      <span className="arrow">
                        {" "}+{" "}
                      </span>
                      {" "}
                    </button>
                    <div className="accordion-content">
                      <div className="lesson">
                        <span>
                          Block Creation
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Practice
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Insert Block
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Practice
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Dynamic Blocks
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Advanced
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Hatch Patterns
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Practice
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Attributes
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Advanced
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="accordion">
                    <button className="accordion-head" data-inline-onclick="toggleAccordion(this)">
                      {" "}
                      <span>
                        {" "}08. Layout, Viewport & Printing{" "}
                      </span>
                      {" "}
                      <span className="arrow">
                        {" "}+{" "}
                      </span>
                      {" "}
                    </button>
                    <div className="accordion-content">
                      <div className="lesson">
                        <span>
                          Model Space & Paper Space
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Basic
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Layout Creation
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Practice
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Viewport Creation
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Practice
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Scale Management
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Advanced
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Plot & Print Settings
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Practice
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          PDF Export
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Project
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="accordion">
                    <button className="accordion-head" data-inline-onclick="toggleAccordion(this)">
                      {" "}
                      <span>
                        {" "}09. Architecture 2D Drafting{" "}
                      </span>
                      {" "}
                      <span className="arrow">
                        {" "}+{" "}
                      </span>
                      {" "}
                    </button>
                    <div className="accordion-content">
                      <div className="lesson">
                        <span>
                          Floor Plan Drawing
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Project
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Doors & Windows
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Project
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Staircase Plan
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Project
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Room Layout
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Project
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Electrical Layout
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Project
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="accordion">
                    <button className="accordion-head" data-inline-onclick="toggleAccordion(this)">
                      {" "}
                      <span>
                        {" "}10. Mechanical 2D Drafting{" "}
                      </span>
                      {" "}
                      <span className="arrow">
                        {" "}+{" "}
                      </span>
                      {" "}
                    </button>
                    <div className="accordion-content">
                      <div className="lesson">
                        <span>
                          Mechanical Part Drawing
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Project
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Sectional Drawing
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Project
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Orthographic Projection
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Project
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Isometric Drawing
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Advanced
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="accordion">
                    <button className="accordion-head" data-inline-onclick="toggleAccordion(this)">
                      {" "}
                      <span>
                        {" "}11. Professional 2D Projects{" "}
                      </span>
                      {" "}
                      <span className="arrow">
                        {" "}+{" "}
                      </span>
                      {" "}
                    </button>
                    <div className="accordion-content">
                      <div className="lesson">
                        <span>
                          Residential Floor Plan
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Project 01
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Office Floor Plan
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Project 02
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Mechanical Component
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Project 03
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Furniture Layout
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Project 04
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="accordion">
                    <button className="accordion-head" data-inline-onclick="toggleAccordion(this)">
                      {" "}
                      <span>
                        {" "}12. AutoCAD 2D Professional Workflow{" "}
                      </span>
                      {" "}
                      <span className="arrow">
                        {" "}+{" "}
                      </span>
                      {" "}
                    </button>
                    <div className="accordion-content">
                      <div className="lesson">
                        <span>
                          Drawing Standards
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Advanced
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Template Creation
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Advanced
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Professional Layer Standards
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Advanced
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Drawing Checking
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Practice
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-8 mb-5">
                  <div className="gradient-soft rounded-xl px-5 py-4 mb-3">
                    <h3 className="font-extrabold gradient-text">
                      PART B — AUTOCAD 3D
                    </h3>
                  </div>
                  <div className="accordion">
                    <button className="accordion-head" data-inline-onclick="toggleAccordion(this)">
                      {" "}
                      <span>
                        {" "}13. Introduction to AutoCAD 3D{" "}
                      </span>
                      {" "}
                      <span className="arrow">
                        {" "}+{" "}
                      </span>
                      {" "}
                    </button>
                    <div className="accordion-content">
                      <div className="lesson">
                        <span>
                          Introduction to 3D CAD
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Basic
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          2D vs 3D Concepts
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Theory
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          3D Workspace
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Practice
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Visual Styles
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Practice
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          ViewCube & Navigation
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Practice
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="accordion">
                    <button className="accordion-head" data-inline-onclick="toggleAccordion(this)">
                      {" "}
                      <span>
                        {" "}14. UCS & 3D Coordinate System{" "}
                      </span>
                      {" "}
                      <span className="arrow">
                        {" "}+{" "}
                      </span>
                      {" "}
                    </button>
                    <div className="accordion-content">
                      <div className="lesson">
                        <span>
                          World Coordinate System
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Basic
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          User Coordinate System
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Practice
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          X, Y & Z Coordinates
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Practice
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          UCS Object & Face
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Advanced
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Dynamic UCS
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Advanced
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="accordion">
                    <button className="accordion-head" data-inline-onclick="toggleAccordion(this)">
                      {" "}
                      <span>
                        {" "}15. Basic 3D Solid Modeling{" "}
                      </span>
                      {" "}
                      <span className="arrow">
                        {" "}+{" "}
                      </span>
                      {" "}
                    </button>
                    <div className="accordion-content">
                      <div className="lesson">
                        <span>
                          Box / Cuboid
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Practice
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Cylinder
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Practice
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Cone
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Practice
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Sphere
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Practice
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Torus
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Practice
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Wedge & Pyramid
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Advanced
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="accordion">
                    <button className="accordion-head" data-inline-onclick="toggleAccordion(this)">
                      {" "}
                      <span>
                        {" "}16. Extrude, Presspull, Revolve & Sweep{" "}
                      </span>
                      {" "}
                      <span className="arrow">
                        {" "}+{" "}
                      </span>
                      {" "}
                    </button>
                    <div className="accordion-content">
                      <div className="lesson">
                        <span>
                          Extrude
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Basic
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Presspull
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Practice
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Revolve
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Intermediate
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Sweep
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Advanced
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Loft
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Advanced
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="accordion">
                    <button className="accordion-head" data-inline-onclick="toggleAccordion(this)">
                      {" "}
                      <span>
                        {" "}17. Boolean Operations & Solid Editing{" "}
                      </span>
                      {" "}
                      <span className="arrow">
                        {" "}+{" "}
                      </span>
                      {" "}
                    </button>
                    <div className="accordion-content">
                      <div className="lesson">
                        <span>
                          Union
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Practice
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Subtract
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Practice
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Intersect
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Practice
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Slice
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Advanced
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Solid Face Editing
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Advanced
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="accordion">
                    <button className="accordion-head" data-inline-onclick="toggleAccordion(this)">
                      {" "}
                      <span>
                        {" "}18. Advanced 3D Modify Commands{" "}
                      </span>
                      {" "}
                      <span className="arrow">
                        {" "}+{" "}
                      </span>
                      {" "}
                    </button>
                    <div className="accordion-content">
                      <div className="lesson">
                        <span>
                          3D Move
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Practice
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          3D Rotate
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Practice
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          3D Mirror
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Advanced
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          3D Array
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Advanced
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          3D Align
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Advanced
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Fillet & Chamfer Edges
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Advanced
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="accordion">
                    <button className="accordion-head" data-inline-onclick="toggleAccordion(this)">
                      {" "}
                      <span>
                        {" "}19. Surface & Mesh Modeling{" "}
                      </span>
                      {" "}
                      <span className="arrow">
                        {" "}+{" "}
                      </span>
                      {" "}
                    </button>
                    <div className="accordion-content">
                      <div className="lesson">
                        <span>
                          Planar Surface
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Practice
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Surface Extrude
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Practice
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Surface Revolve
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Practice
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Surface Sweep
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Advanced
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Surface Loft
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Advanced
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Mesh Modeling
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Advanced
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="accordion">
                    <button className="accordion-head" data-inline-onclick="toggleAccordion(this)">
                      {" "}
                      <span>
                        {" "}20. 3D Architectural Modeling{" "}
                      </span>
                      {" "}
                      <span className="arrow">
                        {" "}+{" "}
                      </span>
                      {" "}
                    </button>
                    <div className="accordion-content">
                      <div className="lesson">
                        <span>
                          3D Walls
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Project
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Floor Slabs
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Project
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Doors & Windows
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Project
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Staircase Modeling
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Project
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Roof Modeling
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Project
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Furniture & Interior Objects
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Project
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="accordion">
                    <button className="accordion-head" data-inline-onclick="toggleAccordion(this)">
                      {" "}
                      <span>
                        {" "}21. Mechanical & Product 3D Modeling{" "}
                      </span>
                      {" "}
                      <span className="arrow">
                        {" "}+{" "}
                      </span>
                      {" "}
                    </button>
                    <div className="accordion-content">
                      <div className="lesson">
                        <span>
                          Mechanical Components
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Project
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Shaft & Hole Modeling
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Project
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Bolts & Nuts
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Project
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Product Shape Development
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Advanced
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Assembly Concepts
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Advanced
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="accordion">
                    <button className="accordion-head" data-inline-onclick="toggleAccordion(this)">
                      {" "}
                      <span>
                        {" "}22. Materials, Lighting & Camera{" "}
                      </span>
                      {" "}
                      <span className="arrow">
                        {" "}+{" "}
                      </span>
                      {" "}
                    </button>
                    <div className="accordion-content">
                      <div className="lesson">
                        <span>
                          Material Browser
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Basic
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Applying Materials
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Practice
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Material Mapping
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Advanced
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Lighting
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Practice
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Camera Setup
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Practice
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="accordion">
                    <button className="accordion-head" data-inline-onclick="toggleAccordion(this)">
                      {" "}
                      <span>
                        {" "}23. Rendering & Presentation{" "}
                      </span>
                      {" "}
                      <span className="arrow">
                        {" "}+{" "}
                      </span>
                      {" "}
                    </button>
                    <div className="accordion-content">
                      <div className="lesson">
                        <span>
                          Visual Styles
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Practice
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Realistic View
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Practice
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Environment & Background
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Advanced
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Rendering Settings
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Advanced
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Image Output
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Project
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="accordion">
                    <button className="accordion-head" data-inline-onclick="toggleAccordion(this)">
                      {" "}
                      <span>
                        {" "}24. Final 3D Projects, Portfolio & Career{" "}
                      </span>
                      {" "}
                      <span className="arrow">
                        {" "}+{" "}
                      </span>
                      {" "}
                    </button>
                    <div className="accordion-content">
                      <div className="lesson">
                        <span>
                          Complete 3D House
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Project 01
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Interior 3D Model
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Project 02
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Commercial Building
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Project 03
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Mechanical Component
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Project 04
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Product 3D Model
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Project 05
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Portfolio Preparation
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Career
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Interview Preparation
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Career
                        </span>
                      </div>
                      <div className="lesson">
                        <span>
                          Freelancing Basics
                        </span>
                        {" "}
                        <span className="lesson-time">
                          Career
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              <section className="mb-12">
                <h2 className="section-title mb-5">
                  What You Will Learn
                </h2>
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="bg-white border rounded-xl p-6">
                    <h3 className="font-extrabold mb-5">
                      AutoCAD 2D Skills
                    </h3>
                    <ul className="feature-list">
                      <li>
                        Professional 2D Drafting
                      </li>
                      <li>
                        Drawing & Modify Commands
                      </li>
                      <li>
                        Layers & Object Properties
                      </li>
                      <li>
                        Dimensions & Annotation
                      </li>
                      <li>
                        Blocks & Hatching
                      </li>
                      <li>
                        Layouts & PDF Printing
                      </li>
                    </ul>
                  </div>
                  <div className="bg-white border rounded-xl p-6">
                    <h3 className="font-extrabold mb-5">
                      AutoCAD 3D Skills
                    </h3>
                    <ul className="feature-list">
                      <li>
                        3D Coordinate System
                      </li>
                      <li>
                        UCS & 3D Navigation
                      </li>
                      <li>
                        Solid Modeling
                      </li>
                      <li>
                        Boolean Operations
                      </li>
                      <li>
                        Surface & Mesh Modeling
                      </li>
                      <li>
                        Materials, Lighting & Rendering
                      </li>
                    </ul>
                  </div>
                </div>
              </section>
              <section id="projects" className="mb-12">
                <h2 className="section-title mb-3">
                  Practical Projects
                </h2>
                <p className="section-subtitle mb-6">
                  The course includes practical projects designed to help learners create a professional CAD portfolio.
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white border rounded-xl p-5">
                    <div className="text-3xl mb-3">
                      🏠
                    </div>
                    <h3 className="font-bold mb-2">
                      Residential Floor Plan
                    </h3>
                    <p className="text-sm text-slate-500">
                      Complete 2D residential drawing.
                    </p>
                  </div>
                  <div className="bg-white border rounded-xl p-5">
                    <div className="text-3xl mb-3">
                      🏢
                    </div>
                    <h3 className="font-bold mb-2">
                      Office Layout
                    </h3>
                    <p className="text-sm text-slate-500">
                      Professional office planning project.
                    </p>
                  </div>
                  <div className="bg-white border rounded-xl p-5">
                    <div className="text-3xl mb-3">
                      🏡
                    </div>
                    <h3 className="font-bold mb-2">
                      3D House
                    </h3>
                    <p className="text-sm text-slate-500">
                      Complete exterior 3D house model.
                    </p>
                  </div>
                  <div className="bg-white border rounded-xl p-5">
                    <div className="text-3xl mb-3">
                      🛋
                    </div>
                    <h3 className="font-bold mb-2">
                      Interior 3D Model
                    </h3>
                    <p className="text-sm text-slate-500">
                      Room and interior visualization.
                    </p>
                  </div>
                  <div className="bg-white border rounded-xl p-5">
                    <div className="text-3xl mb-3">
                      ⚙
                    </div>
                    <h3 className="font-bold mb-2">
                      Mechanical Part
                    </h3>
                    <p className="text-sm text-slate-500">
                      Mechanical component modeling.
                    </p>
                  </div>
                  <div className="bg-white border rounded-xl p-5">
                    <div className="text-3xl mb-3">
                      📦
                    </div>
                    <h3 className="font-bold mb-2">
                      Product Model
                    </h3>
                    <p className="text-sm text-slate-500">
                      Professional product 3D model.
                    </p>
                  </div>
                </div>
              </section>
              <section id="cost" className="mb-12">
                <h2 className="section-title mb-5">
                  AutoCAD 2D + 3D Course Fee
                </h2>
                <div className="fee-card p-7">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                      <div className="text-sm text-slate-500 mb-2">
                        Complete AutoCAD Program
                      </div>
                      <div className="fee-price mb-3">
                        ₹5,499
                      </div>
                      <p className="text-sm text-slate-600 leading-7">
                        One complete program covering AutoCAD 2D drafting and AutoCAD 3D modeling with practical projects.
                      </p>
                    </div>
                    <div>
                      <ul className="feature-list">
                        <li>
                          AutoCAD 2D Complete Syllabus
                        </li>
                        <li>
                          AutoCAD 3D Complete Syllabus
                        </li>
                        <li>
                          Architecture Projects
                        </li>
                        <li>
                          Mechanical Projects
                        </li>
                        <li>
                          3D Visualization & Rendering
                        </li>
                        <li>
                          Portfolio Preparation
                        </li>
                        <li>
                          Course Completion Certificate
                        </li>
                      </ul>
                      <a href="#admission" className="btn-gradient w-full mt-3">
                        {" "}Enroll for ₹8,499{" "}
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
                      Basic computer knowledge is recommended.
                    </li>
                    <li>
                      Students from 10th, 12th, ITI, Diploma and Graduation can join.
                    </li>
                    <li>
                      Architecture, Civil, Mechanical and Interior Design learners can benefit.
                    </li>
                    <li>
                      Prior AutoCAD knowledge is helpful but not mandatory.
                    </li>
                    <li>
                      A computer suitable for AutoCAD practice is recommended.
                    </li>
                  </ul>
                </div>
              </section>
              <section id="career" className="mb-12">
                <h2 className="section-title mb-3">
                  Career Opportunities
                </h2>
                <p className="section-subtitle mb-5">
                  AutoCAD 2D and 3D skills can be useful for careers across drafting, architecture, construction, engineering, interiors and product design.
                </p>
                <div>
                  <span className="job-pill">
                    {" "}AutoCAD Designer{" "}
                  </span>
                  {" "}
                  <span className="job-pill">
                    {" "}CAD Designer{" "}
                  </span>
                  {" "}
                  <span className="job-pill">
                    {" "}CAD Technician{" "}
                  </span>
                  {" "}
                  <span className="job-pill">
                    {" "}2D Draftsman{" "}
                  </span>
                  {" "}
                  <span className="job-pill">
                    {" "}3D CAD Modeler{" "}
                  </span>
                  {" "}
                  <span className="job-pill">
                    {" "}Architectural Designer{" "}
                  </span>
                  {" "}
                  <span className="job-pill">
                    {" "}Interior 3D Designer{" "}
                  </span>
                  {" "}
                  <span className="job-pill">
                    {" "}Mechanical CAD Designer{" "}
                  </span>
                  {" "}
                  <span className="job-pill">
                    {" "}3D Draftsman{" "}
                  </span>
                  {" "}
                  <span className="job-pill">
                    {" "}Product Modeler{" "}
                  </span>
                  {" "}
                  <span className="job-pill">
                    {" "}CAD Freelancer{" "}
                  </span>
                </div>
              </section>
              <section id="admission" className="mb-12">
                <div className="gradient-soft border rounded-2xl p-6 md:p-8">
                  <h2 className="section-title mb-2">
                    Apply for AutoCAD 2D + 3D Course
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
                        <input type="email" className="form-input mt-2" placeholder="Enter email" />
                      </div>
                      <div>
                        <label className="text-sm font-semibold">
                          {" "}Qualification{" "}
                        </label>
                        <select className="form-input mt-2">
                          <option>
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
                            B.Tech / BE
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
                        <label className="text-sm font-semibold">
                          {" "}Interested In{" "}
                        </label>
                        <select className="form-input mt-2">
                          <option>
                            {" "}AutoCAD 2D + 3D{" "}
                          </option>
                          <option>
                            {" "}AutoCAD 2D{" "}
                          </option>
                          <option>
                            {" "}AutoCAD 3D{" "}
                          </option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-semibold">
                          {" "}Preferred Mode{" "}
                        </label>
                        <select className="form-input mt-2">
                          <option>
                            {" "}Select Mode{" "}
                          </option>
                          <option>
                            {" "}Classroom{" "}
                          </option>
                          <option>
                            {" "}Online{" "}
                          </option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="text-sm font-semibold">
                        {" "}Message{" "}
                      </label>
                      {" "}
                      <textarea className="form-input mt-2" rows={4} placeholder="Enter your requirement" />
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
                    {" "}Is AutoCAD 2D and 3D included together?{" "}
                    <span>
                      +
                    </span>
                    {" "}
                  </button>
                  <div className="faq-answer">
                    Yes. This course is designed as a combined AutoCAD 2D + 3D program covering drafting, modeling and practical projects.
                  </div>
                </div>
                <div className="faq-item">
                  <button className="faq-btn" data-inline-onclick="toggleFAQ(this)">
                    {" "}What is the complete course fee?{" "}
                    <span>
                      +
                    </span>
                    {" "}
                  </button>
                  <div className="faq-answer">
                    The displayed complete course fee is{" "}
                    <strong>
                      4,499
                    </strong>
                    .
                  </div>
                </div>
                <div className="faq-item">
                  <button className="faq-btn" data-inline-onclick="toggleFAQ(this)">
                    {" "}Can beginners join the course?{" "}
                    <span>
                      +
                    </span>
                    {" "}
                  </button>
                  <div className="faq-answer">
                    Yes. The curriculum starts with AutoCAD fundamentals and gradually moves toward advanced 2D and 3D modeling.
                  </div>
                </div>
                <div className="faq-item">
                  <button className="faq-btn" data-inline-onclick="toggleFAQ(this)">
                    {" "}Is 3D architectural modeling covered?{" "}
                    <span>
                      +
                    </span>
                    {" "}
                  </button>
                  <div className="faq-answer">
                    Yes. The 3D section includes walls, slabs, doors, windows, staircase, roof, interiors and complete house modeling projects.
                  </div>
                </div>
                <div className="faq-item">
                  <button className="faq-btn" data-inline-onclick="toggleFAQ(this)">
                    {" "}Is mechanical modeling included?{" "}
                    <span>
                      +
                    </span>
                    {" "}
                  </button>
                  <div className="faq-answer">
                    Yes. Mechanical 2D drafting and basic mechanical/product 3D modeling projects are included.
                  </div>
                </div>
                <div className="faq-item">
                  <button className="faq-btn" data-inline-onclick="toggleFAQ(this)">
                    {" "}Is rendering included in AutoCAD 3D?{" "}
                    <span>
                      +
                    </span>
                    {" "}
                  </button>
                  <div className="faq-answer">
                    Yes. The 3D curriculum includes visual styles, materials, lighting, camera and rendering concepts.
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
              <div className="sidebar-card p-6 sticky top-20">
                <div className="text-xs text-slate-500 mb-1">
                  Complete CAD Program
                </div>
                <h3 className="text-xl font-extrabold mb-5">
                  AutoCAD 2D + 3D
                </h3>
                <div className="fee-price mb-2">
                  ₹5,499
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
                      AutoCAD 2D
                    </li>
                    <li>
                      AutoCAD 3D
                    </li>
                    <li>
                      24 Detailed Modules
                    </li>
                    <li>
                      200+ Topics
                    </li>
                    <li>
                      Architecture Projects
                    </li>
                    <li>
                      Mechanical Projects
                    </li>
                    <li>
                      3D Modeling
                    </li>
                    <li>
                      Rendering
                    </li>
                    <li>
                      Portfolio Preparation
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
        <script dangerouslySetInnerHTML={{ __html: js_ec50356d }} />
        <SiteFooter />
        <WhatsappWidget />
        <script dangerouslySetInnerHTML={{ __html: js_c1268ab4 }} />
        <StyleBlock2 />
        <DivBlock />
        <script dangerouslySetInnerHTML={{ __html: js_ea05b2d5 }} />
        <script src="https://unpkg.com/typed.js@2.0.16/dist/typed.umd.js"></script>
        <script src="js/script.js"></script>
        <script src="https://cdn.tailwindcss.com"></script>
      </body>
    </html>
  );
}
