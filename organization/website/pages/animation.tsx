import DivBlock from "../components/DivBlock";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import StyleBlock from "../components/StyleBlock";
import StyleBlock2 from "../components/StyleBlock2";
import WhatsappWidget from "../components/WhatsappWidget";
import css_32f7cc4c from "../styles/32f7cc4c.css?raw";
import css_402d0426 from "../styles/402d0426.css?raw";
import js_0023a4f0 from "../behaviour/0023a4f0.js?raw";
import js_73893071 from "../behaviour/73893071.js?raw";
import js_bf2e94e9 from "../behaviour/bf2e94e9.js?raw";
import js_c1268ab4 from "../behaviour/c1268ab4.js?raw";
import js_ea05b2d5 from "../behaviour/ea05b2d5.js?raw";

/** animation.html */
export default function Animation() {
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
        <style dangerouslySetInnerHTML={{ __html: css_402d0426 }} />
        <section className="hero">
          <div className="container-main py-12 lg:py-16">
            <div className="hero-grid">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 text-purple-700 text-xs font-bold mb-6">
                  🎬 PROFESSIONAL ANIMATION TRAINING
                </div>
                <h1 className="hero-title mb-6">
                  Diploma in 2D/3D Animation{" "}
                  <span className="gradient-text block mt-2">
                    {" "}Beginner to Professional{" "}
                  </span>
                </h1>
                <p className="hero-description mb-7">
                  Learn professional 2D and 3D animation from fundamentals to advanced character animation, modeling, rigging, motion graphics, lighting, rendering and portfolio projects.
                </p>
                <div className="flex flex-wrap gap-3 mb-7">
                  <span className="bg-white border px-4 py-2 rounded-lg text-sm font-semibold">
                    {" "}✏️ 2D Animation{" "}
                  </span>
                  <span className="bg-white border px-4 py-2 rounded-lg text-sm font-semibold">
                    {" "}🧊 3D Animation{" "}
                  </span>
                  <span className="bg-white border px-4 py-2 rounded-lg text-sm font-semibold">
                    {" "}🧑 Character Design{" "}
                  </span>
                  <span className="bg-white border px-4 py-2 rounded-lg text-sm font-semibold">
                    {" "}🎞 Motion Graphics{" "}
                  </span>
                  <span className="bg-white border px-4 py-2 rounded-lg text-sm font-semibold">
                    {" "}🎥 Rendering{" "}
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
                        Professional Diploma
                      </div>
                      <h2 className="text-2xl font-extrabold">
                        2D + 3D Animation
                      </h2>
                    </div>
                    <div className="w-14 h-14 rounded-xl gradient-bg text-white flex items-center justify-center text-2xl">
                      🎬
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
                        Animation
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="font-bold text-purple-600">
                        3D
                      </div>
                      <div className="text-xs text-slate-500">
                        Animation
                      </div>
                    </div>
                  </div>
                  <div className="border-t pt-5">
                    <div className="text-xs text-slate-500">
                      Complete Diploma Fee
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
                    {" "}Apply for Animation Course{" "}
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
              <a href="#cost" className="tab-link">
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
                  Diploma in 2D/3D Animation Overview
                </h2>
                <p className="section-subtitle mb-5">
                  Career Optics Computer Centre's Diploma in 2D/3D Animation is designed for students who want to build professional animation, character design, motion graphics and 3D modeling skills.
                </p>
                <p className="section-subtitle mb-6">
                  The program starts with drawing, animation principles and storyboarding, then moves into digital 2D animation, 3D modeling, texturing, rigging, character animation, lighting, rendering and professional portfolio development.
                </p>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="type-card">
                    <div className="type-icon mb-4">
                      ✏️
                    </div>
                    <h3 className="font-bold mb-2">
                      2D Animation
                    </h3>
                    <p className="text-sm text-slate-500">
                      Drawing, storyboard, character design and digital 2D animation.
                    </p>
                  </div>
                  <div className="type-card">
                    <div className="type-icon mb-4">
                      🧊
                    </div>
                    <h3 className="font-bold mb-2">
                      3D Animation
                    </h3>
                    <p className="text-sm text-slate-500">
                      Modeling, texturing, rigging, lighting and character animation.
                    </p>
                  </div>
                  <div className="type-card">
                    <div className="type-icon mb-4">
                      🎬
                    </div>
                    <h3 className="font-bold mb-2">
                      Production
                    </h3>
                    <p className="text-sm text-slate-500">
                      Create animation projects and develop a professional portfolio.
                    </p>
                  </div>
                </div>
              </section>
              <section id="course-types" className="mb-12">
                <h2 className="section-title mb-2">
                  2D + 3D Animation Program
                </h2>
                <p className="section-subtitle mb-6">
                  Complete animation training from concept development to final rendered animation.
                </p>
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="gradient-soft p-6 rounded-xl border">
                    <div className="flex items-center gap-4 mb-5">
                      <div className="type-icon">
                        ✏️
                      </div>
                      <div>
                        <h3 className="text-xl font-extrabold">
                          2D Animation
                        </h3>
                        <p className="text-xs text-slate-500">
                          Digital 2D Production
                        </p>
                      </div>
                    </div>
                    <ul className="feature-list">
                      <li>
                        Drawing & Sketching
                      </li>
                      <li>
                        Animation Principles
                      </li>
                      <li>
                        Character Design
                      </li>
                      <li>
                        Storyboarding
                      </li>
                      <li>
                        2D Digital Animation
                      </li>
                      <li>
                        Motion Graphics
                      </li>
                      <li>
                        Short Animation Projects
                      </li>
                    </ul>
                  </div>
                  <div className="gradient-soft p-6 rounded-xl border">
                    <div className="flex items-center gap-4 mb-5">
                      <div className="type-icon">
                        🧊
                      </div>
                      <div>
                        <h3 className="text-xl font-extrabold">
                          3D Animation
                        </h3>
                        <p className="text-xs text-slate-500">
                          3D Production
                        </p>
                      </div>
                    </div>
                    <ul className="feature-list">
                      <li>
                        3D Modeling
                      </li>
                      <li>
                        Character Modeling
                      </li>
                      <li>
                        Texturing & Materials
                      </li>
                      <li>
                        Rigging & Skinning
                      </li>
                      <li>
                        Character Animation
                      </li>
                      <li>
                        Lighting & Camera
                      </li>
                      <li>
                        Rendering & Final Output
                      </li>
                    </ul>
                  </div>
                </div>
              </section>
              <section id="tools" className="mb-12">
                <h2 className="section-title mb-2">
                  Animation Tools Covered
                </h2>
                <p className="section-subtitle mb-6">
                  Training can be structured around commonly used animation, design and 3D production workflows.
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="tool-card">
                    <div className="text-3xl mb-3">
                      🎨
                    </div>
                    <h3 className="font-bold mb-1">
                      Adobe Photoshop
                    </h3>
                    <p className="text-xs text-slate-500">
                      Digital painting, concept art and texture creation.
                    </p>
                  </div>
                  <div className="tool-card">
                    <div className="text-3xl mb-3">
                      ✏️
                    </div>
                    <h3 className="font-bold mb-1">
                      Adobe Illustrator
                    </h3>
                    <p className="text-xs text-slate-500">
                      Vector illustration and character assets.
                    </p>
                  </div>
                  <div className="tool-card">
                    <div className="text-3xl mb-3">
                      🎞️
                    </div>
                    <h3 className="font-bold mb-1">
                      Adobe After Effects
                    </h3>
                    <p className="text-xs text-slate-500">
                      Motion graphics, compositing and visual effects.
                    </p>
                  </div>
                  <div className="tool-card">
                    <div className="text-3xl mb-3">
                      🎬
                    </div>
                    <h3 className="font-bold mb-1">
                      Adobe Premiere Pro
                    </h3>
                    <p className="text-xs text-slate-500">
                      Video editing and animation project production.
                    </p>
                  </div>
                  <div className="tool-card">
                    <div className="text-3xl mb-3">
                      🧊
                    </div>
                    <h3 className="font-bold mb-1">
                      Blender
                    </h3>
                    <p className="text-xs text-slate-500">
                      3D modeling, rigging, animation and rendering.
                    </p>
                  </div>
                  <div className="tool-card">
                    <div className="text-3xl mb-3">
                      🎥
                    </div>
                    <h3 className="font-bold mb-1">
                      3D Production Workflow
                    </h3>
                    <p className="text-xs text-slate-500">
                      Camera, lighting, materials and final output.
                    </p>
                  </div>
                </div>
              </section>
              <section id="curriculum" className="mb-12">
                <h2 className="section-title mb-2">
                  Complete 2D/3D Animation Syllabus
                </h2>
                <p className="section-subtitle mb-6">
                  Click any module to open the detailed syllabus.
                </p>
                <div className="gradient-soft rounded-xl px-5 py-4 mb-3">
                  <h3 className="font-extrabold gradient-text">
                    PART A — 2D ANIMATION
                  </h3>
                </div>
                <div className="accordion">
                  <button className="accordion-head" data-inline-onclick="toggleAccordion(this)">
                    {" "}
                    <span>
                      {" "}01. Introduction to Animation & Design{" "}
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
                        History of Animation
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Theory
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Types of Animation
                      </span>
                      {" "}
                      <span className="lesson-time">
                        2D / 3D
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Animation Production Pipeline
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Workflow
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Frame, Timeline & Keyframe Concepts
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practical
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Introduction to Creative Workflow
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
                      {" "}02. Drawing & Sketching Fundamentals{" "}
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
                        Line & Shape Practice
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Perspective Drawing
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Light & Shadow
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Human Figure Basics
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
                  </div>
                </div>
                <div className="accordion">
                  <button className="accordion-head" data-inline-onclick="toggleAccordion(this)">
                    {" "}
                    <span>
                      {" "}03. Animation Principles{" "}
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
                        Squash & Stretch
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practical
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Anticipation
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practical
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Staging
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practical
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Timing & Spacing
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practical
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Follow Through & Overlapping Action
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practical
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Ease In & Ease Out
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
                      {" "}04. Character Design{" "}
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
                        Character Concept Development
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Face & Facial Features
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
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
                        Character Expressions
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Character Turnaround
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
                      {" "}05. Storyboarding & Visual Storytelling{" "}
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
                        Story Development
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Theory
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Scene Planning
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Shot Types
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Theory
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Camera Angles
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Storyboard Creation
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
                      {" "}06. Digital 2D Animation{" "}
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
                        Digital Drawing Workflow
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Layers & Timeline
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Keyframe Animation
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Frame-by-Frame Animation
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Basic Lip Sync
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
                      {" "}07. Motion Graphics{" "}
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
                        Motion Design Basics
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Theory
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Text Animation
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Shape Animation
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Logo Animation
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Project
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Social Media Motion Graphics
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
                      {" "}08. 2D Compositing & Editing{" "}
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
                        Layer Compositing
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Green Screen Basics
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Transitions
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Sound Synchronization
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        2D Short Animation
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
                    PART B — 3D ANIMATION
                  </h3>
                </div>
                <div className="accordion">
                  <button className="accordion-head" data-inline-onclick="toggleAccordion(this)">
                    {" "}
                    <span>
                      {" "}09. Introduction to 3D & Blender Workflow{" "}
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
                        3D Interface
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Basics
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Viewport Navigation
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Objects & Transformations
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Coordinate System
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Theory
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        3D Production Pipeline
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Workflow
                      </span>
                    </div>
                  </div>
                </div>
                <div className="accordion">
                  <button className="accordion-head" data-inline-onclick="toggleAccordion(this)">
                    {" "}
                    <span>
                      {" "}10. 3D Modeling Fundamentals{" "}
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
                        Primitive Modeling
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Vertex, Edge & Face
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Theory
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Extrude & Inset
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Loop Cuts
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Subdivision Modeling
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
                      {" "}11. Hard Surface Modeling{" "}
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
                        Hard Surface Concepts
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Theory
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Bevel & Boolean
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Mechanical Objects
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Product Modeling
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Project
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Optimization for Animation
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
                      {" "}12. 3D Character Modeling{" "}
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
                        Character Base Mesh
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Head Modeling
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Face Modeling
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
                        Complete Character Model
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
                      {" "}13. UV Mapping & Texturing{" "}
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
                        UV Fundamentals
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Theory
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        UV Unwrapping
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Texture Painting
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Material Creation
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Character Texturing
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
                      {" "}14. 3D Materials & Shading{" "}
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
                        Material Editor
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Metal & Glass Materials
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Fabric & Plastic
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Skin Material Basics
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
                      {" "}15. Rigging & Skinning{" "}
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
                        Armature Basics
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Theory
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Bone Creation
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        IK & FK Concepts
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Weight Painting
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Character Rig
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
                      {" "}16. 3D Character Animation{" "}
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
                        Keyframe Animation
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Walk Cycle
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Project
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Run Cycle
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Project
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Jump Animation
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Project
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Facial Animation
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
                      {" "}17. Camera & Cinematic Animation{" "}
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
                        Camera Setup
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Camera Movement
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Shot Composition
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Theory
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Camera Animation
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
                      {" "}18. Lighting & Rendering{" "}
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
                        Lighting Fundamentals
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Theory
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Three Point Lighting
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Environment Lighting
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Render Settings
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Final Render
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
                      {" "}19. VFX & Compositing{" "}
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
                        Visual Effects Basics
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Theory
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Particle Effects
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Smoke & Fire Basics
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Compositing
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
                      {" "}20. Video Editing & Sound{" "}
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
                        Video Editing Fundamentals
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Cut & Transition
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Background Music
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Voice & Sound Effects
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Final Video Production
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
                      {" "}21. Animation Production Pipeline{" "}
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
                        Pre-Production
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Workflow
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Production
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Workflow
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Post Production
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Workflow
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Asset Management
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Final Delivery
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
                      {" "}22. Portfolio & Showreel Development{" "}
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
                        Portfolio Planning
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Planning
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Project Selection
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Practice
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Showreel Creation
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Project
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Presentation Skills
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
                      {" "}23. Freelancing & Career Skills{" "}
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
                        Project Pricing
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Career
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Online Portfolio
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
                      {" "}24. Final Animation Project{" "}
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
                        Project Concept
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Planning
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Character & Asset Creation
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Production
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Animation
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Production
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Lighting & Rendering
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Production
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Editing & Sound
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Post Production
                      </span>
                    </div>
                    <div className="lesson">
                      <span>
                        Final Showreel
                      </span>
                      {" "}
                      <span className="lesson-time">
                        Final Project
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
                      2D Animation Skills
                    </h3>
                    <ul className="feature-list">
                      <li>
                        Drawing & Sketching
                      </li>
                      <li>
                        Character Design
                      </li>
                      <li>
                        Storyboarding
                      </li>
                      <li>
                        Animation Principles
                      </li>
                      <li>
                        Digital 2D Animation
                      </li>
                      <li>
                        Motion Graphics
                      </li>
                      <li>
                        Compositing
                      </li>
                    </ul>
                  </div>
                  <div className="bg-white border rounded-xl p-6">
                    <h3 className="font-extrabold mb-5">
                      3D Animation Skills
                    </h3>
                    <ul className="feature-list">
                      <li>
                        3D Modeling
                      </li>
                      <li>
                        Character Modeling
                      </li>
                      <li>
                        Texturing
                      </li>
                      <li>
                        Rigging
                      </li>
                      <li>
                        Character Animation
                      </li>
                      <li>
                        Lighting
                      </li>
                      <li>
                        Rendering
                      </li>
                    </ul>
                  </div>
                </div>
              </section>
              <section id="projects" className="mb-12">
                <h2 className="section-title mb-3">
                  Practical Animation Projects
                </h2>
                <p className="section-subtitle mb-6">
                  Build a professional portfolio through practical animation projects.
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white border rounded-xl p-5">
                    <div className="text-3xl mb-3">
                      🧑‍🎨
                    </div>
                    <h3 className="font-bold mb-2">
                      2D Character Design
                    </h3>
                    <p className="text-sm text-slate-500">
                      Create a complete original animated character.
                    </p>
                  </div>
                  <div className="bg-white border rounded-xl p-5">
                    <div className="text-3xl mb-3">
                      🎞️
                    </div>
                    <h3 className="font-bold mb-2">
                      2D Short Animation
                    </h3>
                    <p className="text-sm text-slate-500">
                      Create a short frame-based animation.
                    </p>
                  </div>
                  <div className="bg-white border rounded-xl p-5">
                    <div className="text-3xl mb-3">
                      🏃
                    </div>
                    <h3 className="font-bold mb-2">
                      3D Walk Cycle
                    </h3>
                    <p className="text-sm text-slate-500">
                      Create a professional 3D character walk cycle.
                    </p>
                  </div>
                  <div className="bg-white border rounded-xl p-5">
                    <div className="text-3xl mb-3">
                      🧊
                    </div>
                    <h3 className="font-bold mb-2">
                      3D Character Model
                    </h3>
                    <p className="text-sm text-slate-500">
                      Model and texture an original 3D character.
                    </p>
                  </div>
                  <div className="bg-white border rounded-xl p-5">
                    <div className="text-3xl mb-3">
                      🎥
                    </div>
                    <h3 className="font-bold mb-2">
                      Motion Graphics Video
                    </h3>
                    <p className="text-sm text-slate-500">
                      Create a professional animated promotional video.
                    </p>
                  </div>
                  <div className="bg-white border rounded-xl p-5">
                    <div className="text-3xl mb-3">
                      🎬
                    </div>
                    <h3 className="font-bold mb-2">
                      Final Animation Film
                    </h3>
                    <p className="text-sm text-slate-500">
                      Create a complete portfolio-ready animation project.
                    </p>
                  </div>
                </div>
              </section>
              <section id="cost" className="mb-12">
                <h2 className="section-title mb-5">
                  Diploma in 2D/3D Animation Fee
                </h2>
                <div className="fee-card p-7">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                      <div className="text-sm text-slate-500 mb-2">
                        Complete Animation Diploma
                      </div>
                      <div className="fee-price mb-3">
                        ₹12,500
                      </div>
                      <p className="text-sm text-slate-600 leading-7">
                        Complete 2D and 3D animation training with practical projects, portfolio development and career-oriented skills.
                      </p>
                    </div>
                    <div>
                      <ul className="feature-list">
                        <li>
                          2D Animation Training
                        </li>
                        <li>
                          3D Animation Training
                        </li>
                        <li>
                          Character Design
                        </li>
                        <li>
                          3D Modeling
                        </li>
                        <li>
                          Rigging & Animation
                        </li>
                        <li>
                          Motion Graphics
                        </li>
                        <li>
                          VFX & Compositing
                        </li>
                        <li>
                          Portfolio & Showreel
                        </li>
                        <li>
                          Practical Projects
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
                      Students from 10th, 12th, ITI, Diploma and Graduation can join.
                    </li>
                    <li>
                      Basic computer knowledge is recommended.
                    </li>
                    <li>
                      Creative interest in drawing, animation or visual design is helpful.
                    </li>
                    <li>
                      No previous professional animation experience is required.
                    </li>
                    <li>
                      A computer suitable for animation software practice is recommended.
                    </li>
                  </ul>
                </div>
              </section>
              <section id="career" className="mb-12">
                <h2 className="section-title mb-3">
                  Career Opportunities
                </h2>
                <p className="section-subtitle mb-5">
                  Animation skills can be used in media, advertising, gaming, education, entertainment, social media, VFX and freelance creative work.
                </p>
                <div>
                  <span className="job-pill">
                    {" "}2D Animator{" "}
                  </span>
                  {" "}
                  <span className="job-pill">
                    {" "}3D Animator{" "}
                  </span>
                  {" "}
                  <span className="job-pill">
                    {" "}Character Animator{" "}
                  </span>
                  {" "}
                  <span className="job-pill">
                    {" "}3D Modeler{" "}
                  </span>
                  {" "}
                  <span className="job-pill">
                    {" "}Character Designer{" "}
                  </span>
                  {" "}
                  <span className="job-pill">
                    {" "}Motion Graphics Designer{" "}
                  </span>
                  {" "}
                  <span className="job-pill">
                    {" "}VFX Artist{" "}
                  </span>
                  {" "}
                  <span className="job-pill">
                    {" "}3D Artist{" "}
                  </span>
                  {" "}
                  <span className="job-pill">
                    {" "}Storyboard Artist{" "}
                  </span>
                  {" "}
                  <span className="job-pill">
                    {" "}Video Editor{" "}
                  </span>
                  {" "}
                  <span className="job-pill">
                    {" "}Animation Freelancer{" "}
                  </span>
                  {" "}
                  <span className="job-pill">
                    {" "}Game Artist{" "}
                  </span>
                  {" "}
                  <span className="job-pill">
                    {" "}3D Visualization Artist{" "}
                  </span>
                </div>
              </section>
              <section id="admission" className="mb-12">
                <div className="gradient-soft border rounded-2xl p-6 md:p-8">
                  <h2 className="section-title mb-2">
                    Apply for Diploma in 2D/3D Animation
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
                            {" "}Diploma in 2D/3D Animation{" "}
                          </option>
                          <option>
                            {" "}2D Animation{" "}
                          </option>
                          <option>
                            {" "}3D Animation{" "}
                          </option>
                          <option>
                            {" "}3D Modeling{" "}
                          </option>
                          <option>
                            {" "}Motion Graphics{" "}
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
                    {" "}Is 2D and 3D Animation included together?{" "}
                    <span>
                      {" "}+{" "}
                    </span>
                    {" "}
                  </button>
                  <div className="faq-answer">
                    Yes. The diploma program combines 2D animation fundamentals with 3D modeling, rigging, animation, lighting and rendering.
                  </div>
                </div>
                <div className="faq-item">
                  <button className="faq-btn" data-inline-onclick="toggleFAQ(this)">
                    {" "}What is the complete course fee?{" "}
                    <span>
                      {" "}+{" "}
                    </span>
                    {" "}
                  </button>
                  <div className="faq-answer">
                    The displayed complete diploma course fee is ₹12,500.
                  </div>
                </div>
                <div className="faq-item">
                  <button className="faq-btn" data-inline-onclick="toggleFAQ(this)">
                    {" "}Can beginners join the course?{" "}
                    <span>
                      {" "}+{" "}
                    </span>
                    {" "}
                  </button>
                  <div className="faq-answer">
                    Yes. The course starts from drawing, animation fundamentals and basic software workflows before progressing to advanced topics.
                  </div>
                </div>
                <div className="faq-item">
                  <button className="faq-btn" data-inline-onclick="toggleFAQ(this)">
                    {" "}Is character animation included?{" "}
                    <span>
                      {" "}+{" "}
                    </span>
                    {" "}
                  </button>
                  <div className="faq-answer">
                    Yes. Character design, 3D character modeling, rigging, walk cycle, run cycle and facial animation are covered.
                  </div>
                </div>
                <div className="faq-item">
                  <button className="faq-btn" data-inline-onclick="toggleFAQ(this)">
                    {" "}Is 3D modeling included?{" "}
                    <span>
                      {" "}+{" "}
                    </span>
                    {" "}
                  </button>
                  <div className="faq-answer">
                    Yes. The program includes 3D modeling fundamentals, hard-surface modeling, character modeling, UV mapping and texturing.
                  </div>
                </div>
                <div className="faq-item">
                  <button className="faq-btn" data-inline-onclick="toggleFAQ(this)">
                    {" "}Is motion graphics included?{" "}
                    <span>
                      {" "}+{" "}
                    </span>
                    {" "}
                  </button>
                  <div className="faq-answer">
                    Yes. Motion graphics, text animation, logo animation and promotional animation projects are included.
                  </div>
                </div>
                <div className="faq-item">
                  <button className="faq-btn" data-inline-onclick="toggleFAQ(this)">
                    {" "}Will I receive a certificate?{" "}
                    <span>
                      {" "}+{" "}
                    </span>
                    {" "}
                  </button>
                  <div className="faq-answer">
                    A course completion certificate can be provided according to Career Optics Computer Centre's certification policy.
                  </div>
                </div>
                <div className="faq-item">
                  <button className="faq-btn" data-inline-onclick="toggleFAQ(this)">
                    {" "}Will I create a portfolio?{" "}
                    <span>
                      {" "}+{" "}
                    </span>
                    {" "}
                  </button>
                  <div className="faq-answer">
                    Yes. Practical projects, showreel development and portfolio preparation are included in the program.
                  </div>
                </div>
              </section>
            </div>
            <aside>
              <div className="sidebar-card p-6 sticky top-20">
                <div className="text-xs text-slate-500 mb-1">
                  Professional Diploma
                </div>
                <h3 className="text-xl font-extrabold mb-5">
                  2D + 3D Animation
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
                      2D Animation
                    </li>
                    <li>
                      3D Animation
                    </li>
                    <li>
                      24 Detailed Modules
                    </li>
                    <li>
                      200+ Topics
                    </li>
                    <li>
                      Character Design
                    </li>
                    <li>
                      3D Modeling
                    </li>
                    <li>
                      Rigging
                    </li>
                    <li>
                      Character Animation
                    </li>
                    <li>
                      Motion Graphics
                    </li>
                    <li>
                      VFX & Compositing
                    </li>
                    <li>
                      Portfolio & Showreel
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
        <script dangerouslySetInnerHTML={{ __html: js_bf2e94e9 }} />
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
