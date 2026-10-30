import DivBlock from "../components/DivBlock";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import StyleBlock from "../components/StyleBlock";
import StyleBlock2 from "../components/StyleBlock2";
import WhatsappWidget from "../components/WhatsappWidget";
import css_25121f31 from "../styles/25121f31.css?raw";
import css_32f7cc4c from "../styles/32f7cc4c.css?raw";
import js_0023a4f0 from "../behaviour/0023a4f0.js?raw";
import js_73893071 from "../behaviour/73893071.js?raw";
import js_83ae7792 from "../behaviour/83ae7792.js?raw";
import js_c1268ab4 from "../behaviour/c1268ab4.js?raw";
import js_ea05b2d5 from "../behaviour/ea05b2d5.js?raw";

/** drawing.html */
export default function Drawing() {
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
      <body>
        <SiteHeader />
        <script dangerouslySetInnerHTML={{ __html: js_73893071 }} />
        <StyleBlock />
        <style dangerouslySetInnerHTML={{ __html: css_25121f31 }} />
        <section className="hero">
          <div className="container-main py-12 lg:py-16">
            <div className="hero-grid">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 text-purple-700 text-xs font-bold mb-6">
                  🎨 PROFESSIONAL ART TRAINING
                </div>
                <h1 className="hero-title mb-6">
                  Diploma in Drawing & Painting{" "}
                  <span className="gradient-text block mt-2">
                    {" "}Beginner to Professional{" "}
                  </span>
                </h1>
                <p className="hero-description mb-7">
                  Develop professional drawing and painting skills from basic sketching to portrait, landscape, still life, composition, color theory and advanced artwork creation through practical studio-based learning.
                </p>
                <div className="flex flex-wrap gap-3 mb-7">
                  <span className="bg-white border px-4 py-2 rounded-lg text-sm font-semibold">
                    {" "}✏️ Drawing{" "}
                  </span>
                  <span className="bg-white border px-4 py-2 rounded-lg text-sm font-semibold">
                    {" "}🎨 Painting{" "}
                  </span>
                  <span className="bg-white border px-4 py-2 rounded-lg text-sm font-semibold">
                    {" "}👤 Portrait{" "}
                  </span>
                  <span className="bg-white border px-4 py-2 rounded-lg text-sm font-semibold">
                    {" "}🌄 Landscape{" "}
                  </span>
                  <span className="bg-white border px-4 py-2 rounded-lg text-sm font-semibold">
                    {" "}🖌️ Art Portfolio{" "}
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
                        Professional Art Diploma
                      </div>
                      <h2 className="text-2xl font-extrabold">
                        Drawing + Painting
                      </h2>
                    </div>
                    <div className="w-14 h-14 rounded-xl gradient-bg text-white flex items-center justify-center text-2xl">
                      🎨
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
                        ART
                      </div>
                      <div className="text-xs text-slate-500">
                        Drawing
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="font-bold text-purple-600">
                        PAINT
                      </div>
                      <div className="text-xs text-slate-500">
                        Painting
                      </div>
                    </div>
                  </div>
                  <div className="border-t pt-5">
                    <div className="text-xs text-slate-500">
                      Complete Diploma Fee
                    </div>
                    <div className="flex items-end justify-between">
                      <div className="fee-price">
                        ₹8,500
                      </div>
                      <div className="text-xs text-slate-500 mb-1">
                        Full Program
                      </div>
                    </div>
                  </div>
                  <a href="#admission" className="btn-gradient w-full mt-6">
                    {" "}Apply for Drawing & Painting Course{" "}
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
                {" "}Drawing + Painting{" "}
              </a>
              {" "}
              <a href="#materials" className="tab-link">
                {" "}Materials{" "}
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
                {" "}Fee ₹8,500{" "}
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
                  Diploma in Drawing & Painting Overview
                </h2>
                <p className="section-subtitle mb-5">
                  Career Optics Computer Centre's Diploma in Drawing & Painting is designed for students, beginners, hobby artists and aspiring professional artists who want to develop strong traditional art skills.
                </p>
                <p className="section-subtitle mb-6">
                  The course starts with basic lines, shapes, observation and proportion, then progresses to perspective, shading, still life, portrait drawing, human anatomy, color theory, watercolor, acrylic, oil painting, composition and professional portfolio development.
                </p>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="type-card">
                    <div className="type-icon mb-4">
                      ✏️
                    </div>
                    <h3 className="font-bold mb-2">
                      Drawing
                    </h3>
                    <p className="text-sm text-slate-500">
                      Learn sketching, proportions, perspective, shading and observational drawing.
                    </p>
                  </div>
                  <div className="type-card">
                    <div className="type-icon mb-4">
                      🎨
                    </div>
                    <h3 className="font-bold mb-2">
                      Painting
                    </h3>
                    <p className="text-sm text-slate-500">
                      Explore watercolor, acrylic, oil painting, color mixing and composition.
                    </p>
                  </div>
                  <div className="type-card">
                    <div className="type-icon mb-4">
                      🖼️
                    </div>
                    <h3 className="font-bold mb-2">
                      Portfolio
                    </h3>
                    <p className="text-sm text-slate-500">
                      Create original artworks and develop a professional art portfolio.
                    </p>
                  </div>
                </div>
              </section>
              <section id="course-types" className="mb-12">
                <h2 className="section-title mb-2">
                  Drawing + Painting Program
                </h2>
                <p className="section-subtitle mb-6">
                  Complete art training covering fundamentals, traditional techniques and professional artwork development.
                </p>
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="gradient-soft p-6 rounded-xl border">
                    <div className="flex items-center gap-4 mb-5">
                      <div className="type-icon">
                        ✏️
                      </div>
                      <div>
                        <h3 className="text-xl font-extrabold">
                          Drawing
                        </h3>
                        <p className="text-xs text-slate-500">
                          Foundation & Advanced Drawing
                        </p>
                      </div>
                    </div>
                    <ul className="feature-list">
                      <li>
                        Basic Lines & Shapes
                      </li>
                      <li>
                        Observation Drawing
                      </li>
                      <li>
                        Proportion & Measurement
                      </li>
                      <li>
                        Perspective
                      </li>
                      <li>
                        Light & Shadow
                      </li>
                      <li>
                        Portrait Drawing
                      </li>
                      <li>
                        Human Anatomy
                      </li>
                    </ul>
                  </div>
                  <div className="gradient-soft p-6 rounded-xl border">
                    <div className="flex items-center gap-4 mb-5">
                      <div className="type-icon">
                        🎨
                      </div>
                      <div>
                        <h3 className="text-xl font-extrabold">
                          Painting
                        </h3>
                        <p className="text-xs text-slate-500">
                          Traditional Painting Techniques
                        </p>
                      </div>
                    </div>
                    <ul className="feature-list">
                      <li>
                        Color Theory
                      </li>
                      <li>
                        Watercolor
                      </li>
                      <li>
                        Acrylic Painting
                      </li>
                      <li>
                        Oil Painting
                      </li>
                      <li>
                        Landscape Painting
                      </li>
                      <li>
                        Portrait Painting
                      </li>
                      <li>
                        Still Life Painting
                      </li>
                    </ul>
                  </div>
                </div>
              </section>
              <section id="materials" className="mb-12">
                <h2 className="section-title mb-2">
                  Drawing & Painting Materials
                </h2>
                <p className="section-subtitle mb-6">
                  Students practice with commonly used traditional art materials and professional studio tools.
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="material-card">
                    <div className="text-3xl mb-3">
                      ✏️
                    </div>
                    <h3 className="font-bold mb-1">
                      Graphite Pencils
                    </h3>
                    <p className="text-xs text-slate-500">
                      HB, 2B, 4B, 6B, 8B and tonal drawing practice.
                    </p>
                  </div>
                  <div className="material-card">
                    <div className="text-3xl mb-3">
                      🖊️
                    </div>
                    <h3 className="font-bold mb-1">
                      Charcoal
                    </h3>
                    <p className="text-xs text-slate-500">
                      Charcoal sketching and tonal artwork.
                    </p>
                  </div>
                  <div className="material-card">
                    <div className="text-3xl mb-3">
                      🎨
                    </div>
                    <h3 className="font-bold mb-1">
                      Watercolor
                    </h3>
                    <p className="text-xs text-slate-500">
                      Watercolor washes, blending and landscape practice.
                    </p>
                  </div>
                  <div className="material-card">
                    <div className="text-3xl mb-3">
                      🖌️
                    </div>
                    <h3 className="font-bold mb-1">
                      Acrylic Colors
                    </h3>
                    <p className="text-xs text-slate-500">
                      Acrylic color mixing and painting techniques.
                    </p>
                  </div>
                  <div className="material-card">
                    <div className="text-3xl mb-3">
                      🖼️
                    </div>
                    <h3 className="font-bold mb-1">
                      Canvas
                    </h3>
                    <p className="text-xs text-slate-500">
                      Canvas preparation and professional artwork practice.
                    </p>
                  </div>
                  <div className="material-card">
                    <div className="text-3xl mb-3">
                      🎭
                    </div>
                    <h3 className="font-bold mb-1">
                      Painting Brushes
                    </h3>
                    <p className="text-xs text-slate-500">
                      Round, flat, filbert and detail brush techniques.
                    </p>
                  </div>
                </div>
              </section>
              <section id="curriculum" className="mb-12">
                <h2 className="section-title mb-2">
                  Complete Drawing & Painting Syllabus
                </h2>
                <p className="section-subtitle mb-6">
                  Click any module to open the detailed syllabus.
                </p>
                <div className="gradient-soft rounded-xl px-5 py-4 mb-3">
                  <h3 className="font-extrabold gradient-text">
                    PART A — DRAWING FOUNDATION
                  </h3>
                </div>
                <div className="accordion">
                  <button className="accordion-head" data-inline-onclick="toggleAccordion(this)">
                    {" "}
                    <span>
                      {" "}01. Introduction to Drawing & Art{" "}
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
                        Introduction to Visual Art
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Theory
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Types of Drawing
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Theory
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Observation Skills
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Artist's Workspace Setup
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practical
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Basic Art Practice Routine
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
                      {" "}02. Lines, Shapes & Forms{" "}
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
                        Line Types & Control
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Basic Geometric Shapes
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Organic Shapes
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        2D to 3D Form Development
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Shape Composition Exercises
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
                      {" "}03. Proportion & Measurement{" "}
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
                        Proportion Fundamentals
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Theory
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Comparative Measurement
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Object Proportion
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Human Proportion Basics
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Proportion Drawing Exercise
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
                      {" "}04. Light, Shadow & Shading{" "}
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
                        Light Source
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Theory
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Highlight & Midtone
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Core Shadow
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Cast Shadow
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Gradient & Tonal Shading
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Realistic Shading Exercise
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
                      {" "}05. Perspective Drawing{" "}
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
                        Horizon Line
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Theory
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Vanishing Point
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        One Point Perspective
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Two Point Perspective
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Three Point Perspective
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Advanced
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Interior Perspective Project
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
                      {" "}06. Still Life Drawing{" "}
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
                        Object Arrangement
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Observation & Proportion
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Texture Drawing
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Glass & Metal Objects
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Complete Still Life Artwork
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Project
                      </span>
                    </div>
                  </div>
                </div>
                <div className="gradient-soft rounded-xl px-5 py-4 mt-8 mb-3">
                  <h3 className="font-extrabold gradient-text">
                    PART B — PORTRAIT & FIGURE DRAWING
                  </h3>
                </div>
                <div className="accordion">
                  <button className="accordion-head" data-inline-onclick="toggleAccordion(this)">
                    {" "}
                    <span>
                      {" "}07. Portrait Drawing{" "}
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
                        Head Structure
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Theory
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Face Proportions
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Eyes & Eyebrows
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Nose & Lips
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Ears & Hair
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Complete Portrait
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
                      {" "}08. Human Anatomy Drawing{" "}
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
                        Basic Human Skeleton
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Theory
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Body Proportion
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Gesture Drawing
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Hands & Feet
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Figure Drawing
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
                      {" "}09. Pencil Sketching{" "}
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
                        Pencil Grades
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Theory
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Hatching
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Cross Hatching
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Blending
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Realistic Pencil Portrait
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Project
                      </span>
                    </div>
                  </div>
                </div>
                <div className="gradient-soft rounded-xl px-5 py-4 mt-8 mb-3">
                  <h3 className="font-extrabold gradient-text">
                    PART C — COLOR & PAINTING
                  </h3>
                </div>
                <div className="accordion">
                  <button className="accordion-head" data-inline-onclick="toggleAccordion(this)">
                    {" "}
                    <span>
                      {" "}10. Color Theory{" "}
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
                        Primary Colors
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Theory
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Secondary Colors
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Theory
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Warm & Cool Colors
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Complementary Colors
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Color Harmony
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
                      {" "}11. Watercolor Painting{" "}
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
                        Watercolor Materials
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Basics
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Wet on Wet
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Wet on Dry
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Color Washes
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Watercolor Landscape
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
                      {" "}12. Acrylic Painting{" "}
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
                        Acrylic Materials
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Basics
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Layering Techniques
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Blending
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Texture Techniques
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Acrylic Canvas Painting
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
                      {" "}13. Oil Painting{" "}
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
                        Oil Painting Materials
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Basics
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Underpainting
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Color Mixing
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Brush Techniques
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Oil Painting Project
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Project
                      </span>
                    </div>
                  </div>
                </div>
                <div className="gradient-soft rounded-xl px-5 py-4 mt-8 mb-3">
                  <h3 className="font-extrabold gradient-text">
                    PART D — ADVANCED ART
                  </h3>
                </div>
                <div className="accordion">
                  <button className="accordion-head" data-inline-onclick="toggleAccordion(this)">
                    {" "}
                    <span>
                      {" "}14. Landscape Drawing & Painting{" "}
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
                        Landscape Composition
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Theory
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Sky & Clouds
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Trees & Foliage
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Water & Reflection
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Complete Landscape
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
                      {" "}15. Portrait Painting{" "}
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
                        Skin Tone Mixing
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Face Lighting
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Hair Painting
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Facial Features
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Complete Portrait Painting
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
                      {" "}16. Composition & Creative Art{" "}
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
                        Composition Principles
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Theory
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Balance & Rhythm
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Theory
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Focal Point
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Creative Concept Development
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Original Artwork
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
                      {" "}17. Texture & Realistic Art{" "}
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
                        Texture Observation
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Wood Texture
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Metal Texture
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Glass Texture
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Realistic Object Artwork
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
                      {" "}18. Creative & Concept Art{" "}
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
                        Concept Development
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Planning
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Visual References
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Creative Composition
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Mixed Media Artwork
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
                      {" "}19. Art Reproduction & Presentation{" "}
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
                        Artwork Finishing
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Artwork Mounting
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Framing Basics
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Theory
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Artwork Photography
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                  </div>
                </div>
                <div className="gradient-soft rounded-xl px-5 py-4 mt-8 mb-3">
                  <h3 className="font-extrabold gradient-text">
                    PART E — PROFESSIONAL ART PORTFOLIO
                  </h3>
                </div>
                <div className="accordion">
                  <button className="accordion-head" data-inline-onclick="toggleAccordion(this)">
                    {" "}
                    <span>
                      {" "}20. Professional Artwork Development{" "}
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
                        Artwork Planning
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Planning
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Reference Selection
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Artwork Execution
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Production
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Finishing Techniques
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
                      {" "}21. Digital Art Basics{" "}
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
                        Digital Drawing Introduction
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Basics
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Digital Brushes
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Layers & Masks
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Digital Color Correction
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Digital Artwork
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
                      {" "}22. Art Portfolio Development{" "}
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
                      <span className="lesson-time">
                        Planning
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Artwork Selection
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Portfolio Layout
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Artwork Description
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Career
                      </span>
                    </div>
                  </div>
                </div>
                <div className="accordion">
                  <button className="accordion-head" data-inline-onclick="toggleAccordion(this)">
                    {" "}
                    <span>
                      {" "}23. Freelancing & Art Career{" "}
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
                        Freelancing Basics
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Career
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Client Communication
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Career
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Artwork Pricing
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Career
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Commission Artwork
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Career
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Online Art Portfolio
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Career
                      </span>
                    </div>
                  </div>
                </div>
                <div className="accordion">
                  <button className="accordion-head" data-inline-onclick="toggleAccordion(this)">
                    {" "}
                    <span>
                      {" "}24. Final Art Portfolio Project{" "}
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
                        Final Concept Selection
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Planning
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Sketch Development
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Production
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Color & Painting
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Production
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Final Artwork
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Project
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Portfolio Presentation
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Final
                      </span>
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
                      Drawing Skills
                    </h3>
                    <ul className="feature-list">
                      <li>
                        Sketching
                      </li>
                      <li>
                        Observation Drawing
                      </li>
                      <li>
                        Proportion
                      </li>
                      <li>
                        Perspective
                      </li>
                      <li>
                        Shading
                      </li>
                      <li>
                        Portrait Drawing
                      </li>
                      <li>
                        Human Anatomy
                      </li>
                    </ul>
                  </div>
                  <div className="bg-white border rounded-xl p-6">
                    <h3 className="font-extrabold mb-5">
                      Painting Skills
                    </h3>
                    <ul className="feature-list">
                      <li>
                        Color Theory
                      </li>
                      <li>
                        Watercolor
                      </li>
                      <li>
                        Acrylic Painting
                      </li>
                      <li>
                        Oil Painting
                      </li>
                      <li>
                        Landscape Painting
                      </li>
                      <li>
                        Portrait Painting
                      </li>
                      <li>
                        Composition
                      </li>
                    </ul>
                  </div>
                </div>
              </section>
              <section id="projects" className="mb-12">
                <h2 className="section-title mb-3">
                  Practical Drawing & Painting Projects
                </h2>
                <p className="section-subtitle mb-6">
                  Create original artworks and develop a professional art portfolio.
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white border rounded-xl p-5">
                    <div className="text-3xl mb-3">
                      ✏️
                    </div>
                    <h3 className="font-bold mb-2">
                      Pencil Portrait
                    </h3>
                    <p className="text-sm text-slate-500">
                      Create a realistic portrait using graphite pencils.
                    </p>
                  </div>
                  <div className="bg-white border rounded-xl p-5">
                    <div className="text-3xl mb-3">
                      🖼️
                    </div>
                    <h3 className="font-bold mb-2">
                      Still Life Artwork
                    </h3>
                    <p className="text-sm text-slate-500">
                      Draw objects with realistic proportion and shading.
                    </p>
                  </div>
                  <div className="bg-white border rounded-xl p-5">
                    <div className="text-3xl mb-3">
                      🌄
                    </div>
                    <h3 className="font-bold mb-2">
                      Landscape Painting
                    </h3>
                    <p className="text-sm text-slate-500">
                      Create a complete watercolor or acrylic landscape.
                    </p>
                  </div>
                  <div className="bg-white border rounded-xl p-5">
                    <div className="text-3xl mb-3">
                      👤
                    </div>
                    <h3 className="font-bold mb-2">
                      Portrait Painting
                    </h3>
                    <p className="text-sm text-slate-500">
                      Create a professional painted portrait.
                    </p>
                  </div>
                  <div className="bg-white border rounded-xl p-5">
                    <div className="text-3xl mb-3">
                      🎨
                    </div>
                    <h3 className="font-bold mb-2">
                      Creative Artwork
                    </h3>
                    <p className="text-sm text-slate-500">
                      Develop an original concept-based artwork.
                    </p>
                  </div>
                  <div className="bg-white border rounded-xl p-5">
                    <div className="text-3xl mb-3">
                      🖌️
                    </div>
                    <h3 className="font-bold mb-2">
                      Final Art Portfolio
                    </h3>
                    <p className="text-sm text-slate-500">
                      Build a professional portfolio of selected artworks.
                    </p>
                  </div>
                </div>
              </section>
              <section id="cost" className="mb-12">
                <h2 className="section-title mb-5">
                  Diploma in Drawing & Painting Fee
                </h2>
                <div className="fee-card p-7">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                      <div className="text-sm text-slate-500 mb-2">
                        Complete Art Diploma
                      </div>
                      <div className="fee-price mb-3">
                        ₹8,500
                      </div>
                      <p className="text-sm text-slate-600 leading-7">
                        Complete drawing and painting training with practical artwork projects, portfolio development and professional art skills.
                      </p>
                    </div>
                    <div>
                      <ul className="feature-list">
                        <li>
                          Drawing Fundamentals
                        </li>
                        <li>
                          Portrait Drawing
                        </li>
                        <li>
                          Perspective Drawing
                        </li>
                        <li>
                          Still Life
                        </li>
                        <li>
                          Color Theory
                        </li>
                        <li>
                          Watercolor
                        </li>
                        <li>
                          Acrylic Painting
                        </li>
                        <li>
                          Oil Painting
                        </li>
                        <li>
                          Landscape Painting
                        </li>
                        <li>
                          Portfolio Development
                        </li>
                        <li>
                          Practical Projects
                        </li>
                        <li>
                          Course Completion Certificate
                        </li>
                      </ul>
                      <a href="#admission" className="btn-gradient w-full mt-3">
                        {" "}Enroll for ₹8,500{" "}
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
                      Students from 10th, 12th, ITI, Diploma and Graduation can join.
                    </li>
                    <li>
                      Basic drawing knowledge is not mandatory.
                    </li>
                    <li>
                      Beginners, hobby artists and aspiring professional artists can join.
                    </li>
                    <li>
                      Creative interest and regular practice are recommended.
                    </li>
                    <li>
                      Students should arrange basic drawing and painting materials for practice.
                    </li>
                  </ul>
                </div>
              </section>
              <section id="career" className="mb-12">
                <h2 className="section-title mb-3">
                  Career Opportunities
                </h2>
                <p className="section-subtitle mb-5">
                  Drawing and painting skills can lead to opportunities in illustration, art education, commissions, creative studios, exhibitions and freelance artwork.
                </p>
                <div>
                  <span className="job-pill">
                    {" "}Drawing Artist{" "}
                  </span>
                  {" "}
                  <span className="job-pill">
                    {" "}Painting Artist{" "}
                  </span>
                  {" "}
                  <span className="job-pill">
                    {" "}Portrait Artist{" "}
                  </span>
                  {" "}
                  <span className="job-pill">
                    {" "}Illustrator{" "}
                  </span>
                  {" "}
                  <span className="job-pill">
                    {" "}Art Teacher{" "}
                  </span>
                  {" "}
                  <span className="job-pill">
                    {" "}Sketch Artist{" "}
                  </span>
                  {" "}
                  <span className="job-pill">
                    {" "}Concept Artist{" "}
                  </span>
                  {" "}
                  <span className="job-pill">
                    {" "}Visual Artist{" "}
                  </span>
                  {" "}
                  <span className="job-pill">
                    {" "}Freelance Artist{" "}
                  </span>
                  {" "}
                  <span className="job-pill">
                    {" "}Commission Artist{" "}
                  </span>
                  {" "}
                  <span className="job-pill">
                    {" "}Art Workshop Trainer{" "}
                  </span>
                  {" "}
                  <span className="job-pill">
                    {" "}Gallery Artist{" "}
                  </span>
                </div>
              </section>
              <section id="admission" className="mb-12">
                <div className="gradient-soft border rounded-2xl p-6 md:p-8">
                  <h2 className="section-title mb-2">
                    Apply for Diploma in Drawing & Painting
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
                          {" "}Interested In{" "}
                        </label>
                        <select id="interested" className="form-input mt-2">
                          <option>
                            {" "}Diploma in Drawing & Painting{" "}
                          </option>
                          <option>
                            {" "}Drawing Course{" "}
                          </option>
                          <option>
                            {" "}Painting Course{" "}
                          </option>
                          <option>
                            {" "}Portrait Drawing{" "}
                          </option>
                          <option>
                            {" "}Watercolor Painting{" "}
                          </option>
                          <option>
                            {" "}Acrylic Painting{" "}
                          </option>
                          <option>
                            {" "}Oil Painting{" "}
                          </option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-semibold">
                          {" "}Preferred Mode{" "}
                        </label>
                        <select id="mode" className="form-input mt-2">
                          <option>
                            {" "}Select Mode{" "}
                          </option>
                          <option>
                            {" "}Classroom{" "}
                          </option>
                          <option>
                            {" "}Online{" "}
                          </option>
                          <option>
                            {" "}Hybrid{" "}
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
                    {" "}Can beginners join the Drawing & Painting Diploma?{" "}
                    <span>
                      +
                    </span>
                    {" "}
                  </button>
                  <div className="faq-answer">
                    Yes. The course starts with basic lines, shapes, observation and sketching before progressing to advanced drawing and painting techniques.
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
                    The displayed complete diploma course fee is ₹8,500.
                  </div>
                </div>
                <div className="faq-item">
                  <button className="faq-btn" data-inline-onclick="toggleFAQ(this)">
                    {" "}Is portrait drawing included?{" "}
                    <span>
                      +
                    </span>
                    {" "}
                  </button>
                  <div className="faq-answer">
                    Yes. Portrait structure, facial proportions, eyes, nose, lips, hair, shading and complete portrait projects are included.
                  </div>
                </div>
                <div className="faq-item">
                  <button className="faq-btn" data-inline-onclick="toggleFAQ(this)">
                    {" "}Are watercolor and acrylic painting covered?{" "}
                    <span>
                      +
                    </span>
                    {" "}
                  </button>
                  <div className="faq-answer">
                    Yes. The syllabus includes watercolor and acrylic techniques, color mixing, blending, layering and practical artwork projects.
                  </div>
                </div>
                <div className="faq-item">
                  <button className="faq-btn" data-inline-onclick="toggleFAQ(this)">
                    {" "}Is oil painting included?{" "}
                    <span>
                      +
                    </span>
                    {" "}
                  </button>
                  <div className="faq-answer">
                    Yes. Oil painting fundamentals, materials, underpainting, color mixing and brush techniques are included.
                  </div>
                </div>
                <div className="faq-item">
                  <button className="faq-btn" data-inline-onclick="toggleFAQ(this)">
                    {" "}Will I create an art portfolio?{" "}
                    <span>
                      +
                    </span>
                    {" "}
                  </button>
                  <div className="faq-answer">
                    Yes. Students work on multiple drawing and painting projects and prepare selected artworks for a professional portfolio.
                  </div>
                </div>
                <div className="faq-item">
                  <button className="faq-btn" data-inline-onclick="toggleFAQ(this)">
                    {" "}Can I pursue freelancing after the course?{" "}
                    <span>
                      +
                    </span>
                    {" "}
                  </button>
                  <div className="faq-answer">
                    The course includes basic freelancing, client communication, artwork pricing, commissions and portfolio development concepts.
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
                    A course completion certificate can be provided according to Career Optics Computer Centre's certification policy.
                  </div>
                </div>
              </section>
            </div>
            <aside>
              <div className="sidebar-card p-6 sticky top-20">
                <div className="text-xs text-slate-500 mb-1">
                  Professional Art Diploma
                </div>
                <h3 className="text-xl font-extrabold mb-5">
                  Drawing + Painting
                </h3>
                <div className="fee-price mb-2">
                  ₹8,500
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
                      Drawing Fundamentals
                    </li>
                    <li>
                      Pencil Sketching
                    </li>
                    <li>
                      Portrait Drawing
                    </li>
                    <li>
                      Human Anatomy
                    </li>
                    <li>
                      Perspective
                    </li>
                    <li>
                      Still Life
                    </li>
                    <li>
                      Color Theory
                    </li>
                    <li>
                      Watercolor
                    </li>
                    <li>
                      Acrylic Painting
                    </li>
                    <li>
                      Oil Painting
                    </li>
                    <li>
                      Landscape Painting
                    </li>
                    <li>
                      Art Portfolio
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
                    Contact Career Optics Computer Centre admission team for course details.
                  </p>
                  <a href="https://wa.me/918252532179" target="_blank" className="w-full flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-lg font-bold text-sm">
                    💬 WhatsApp Enquiry
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </main>
        <script dangerouslySetInnerHTML={{ __html: js_83ae7792 }} />
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
