import DivBlock from "../components/DivBlock";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import StyleBlock from "../components/StyleBlock";
import StyleBlock2 from "../components/StyleBlock2";
import WhatsappWidget from "../components/WhatsappWidget";
import css_1b9fecb5 from "../styles/1b9fecb5.css?raw";
import css_32f7cc4c from "../styles/32f7cc4c.css?raw";
import js_0023a4f0 from "../behaviour/0023a4f0.js?raw";
import js_73893071 from "../behaviour/73893071.js?raw";
import js_c1268ab4 from "../behaviour/c1268ab4.js?raw";
import js_ea05b2d5 from "../behaviour/ea05b2d5.js?raw";
import js_ebb9c31b from "../behaviour/ebb9c31b.js?raw";

/** ai_tutor.html */
export default function AiTutor() {
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
        <style dangerouslySetInnerHTML={{ __html: css_1b9fecb5 }} />
        <section className="hero-grid relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-semibold mb-6">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></span>
                  AI Education Program
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight text-slate-900">
                  AI for{" "}
                  <span className="gradient-text">
                    Students & Teachers
                  </span>
                </h1>
                <p className="mt-6 text-lg text-slate-600 leading-8 max-w-2xl">
                  Learn how to use Artificial Intelligence for studying, teaching, lesson planning, assignments, research, presentations, assessments and everyday educational productivity.
                </p>
                <div className="flex flex-wrap gap-3 mt-8">
                  <a href="#admission" className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
                    Enrol Now
                    <span className="ml-2">
                      →
                    </span>
                  </a>
                  <a href="#syllabus" className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-white text-slate-800 font-bold border border-slate-200 hover:border-indigo-300 transition">
                    View Syllabus
                  </a>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10">
                  <div className="glass rounded-2xl p-4">
                    <div className="text-2xl font-black text-indigo-600">
                      12
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Modules
                    </div>
                  </div>
                  <div className="glass rounded-2xl p-4">
                    <div className="text-2xl font-black text-indigo-600">
                      60+
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Topics
                    </div>
                  </div>
                  <div className="glass rounded-2xl p-4">
                    <div className="text-2xl font-black text-indigo-600">
                      100%
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Practical
                    </div>
                  </div>
                  <div className="glass rounded-2xl p-4">
                    <div className="text-2xl font-black text-indigo-600">
                      ✓
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Certificate
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="glass rounded-3xl p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="text-sm text-slate-500">
                        Certificate Program
                      </div>
                      <div className="text-2xl font-black text-slate-900">
                        AI for Education
                      </div>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center text-2xl">
                      🎓
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50">
                      <span className="text-xl">
                        🤖
                      </span>
                      <div>
                        <div className="font-bold text-slate-900">
                          AI Fundamentals
                        </div>
                        <div className="text-xs text-slate-500">
                          Understand AI for education
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50">
                      <span className="text-xl">
                        💬
                      </span>
                      <div>
                        <div className="font-bold text-slate-900">
                          ChatGPT & Prompt Engineering
                        </div>
                        <div className="text-xs text-slate-500">
                          Create better educational prompts
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-purple-50">
                      <span className="text-xl">
                        📚
                      </span>
                      <div>
                        <div className="font-bold text-slate-900">
                          Study & Teaching
                        </div>
                        <div className="text-xs text-slate-500">
                          Learn faster and teach smarter
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50">
                      <span className="text-xl">
                        📊
                      </span>
                      <div>
                        <div className="font-bold text-slate-900">
                          Assessments & Reports
                        </div>
                        <div className="text-xs text-slate-500">
                          Quizzes, worksheets and reports
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-10">
              <span className="text-sm font-bold text-indigo-600 uppercase tracking-wider">
                {" "}Course Overview{" "}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-2">
                Learn AI for{" "}
                <span className="gradient-text">
                  Modern Education
                </span>
              </h2>
              <p className="mt-4 text-slate-600 leading-7">
                This program is designed for students, teachers, educators and academic professionals who want to use AI tools effectively for learning, teaching and productivity.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="modern-card p-6">
                <div className="text-3xl mb-4">
                  🎓
                </div>
                <h3 className="font-black text-lg text-slate-900">
                  For Students
                </h3>
                <p className="text-sm text-slate-500 mt-2 leading-6">
                  Study smarter, create notes, research topics and prepare assignments with AI.
                </p>
              </div>
              <div className="modern-card p-6">
                <div className="text-3xl mb-4">
                  👨‍🏫
                </div>
                <h3 className="font-black text-lg text-slate-900">
                  For Teachers
                </h3>
                <p className="text-sm text-slate-500 mt-2 leading-6">
                  Create lesson plans, worksheets, quizzes and classroom resources faster.
                </p>
              </div>
              <div className="modern-card p-6">
                <div className="text-3xl mb-4">
                  ⚡
                </div>
                <h3 className="font-black text-lg text-slate-900">
                  Productivity
                </h3>
                <p className="text-sm text-slate-500 mt-2 leading-6">
                  Automate repetitive educational tasks and save valuable time.
                </p>
              </div>
              <div className="modern-card p-6">
                <div className="text-3xl mb-4">
                  🏆
                </div>
                <h3 className="font-black text-lg text-slate-900">
                  Certification
                </h3>
                <p className="text-sm text-slate-500 mt-2 leading-6">
                  Complete practical projects and receive a course completion certificate.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="syllabus" className="py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="mb-8">
                  <span className="text-sm font-bold text-indigo-600 uppercase tracking-wider">
                    {" "}Course Curriculum{" "}
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-2">
                    Complete Course Syllabus
                  </h2>
                  <p className="text-slate-500 mt-3">
                    12 practical modules designed for students and teachers.
                  </p>
                </div>
                <div className="course-module active">
                  <button className="module-header" data-inline-onclick="openModule(this)">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black">
                        01
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900">
                          AI Fundamentals for Education
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                          Understanding AI in learning and teaching
                        </p>
                      </div>
                    </div>
                    <span className="module-arrow text-slate-400 text-xl">
                      {" "}▼{" "}
                    </span>
                    {" "}
                  </button>
                  <div className="module-content">
                    <div className="lesson-box">
                      Introduction to Artificial Intelligence
                    </div>
                    <div className="lesson-box">
                      Generative AI Explained
                    </div>
                    <div className="lesson-box">
                      AI in Education
                    </div>
                    <div className="lesson-box">
                      Benefits and Limitations of AI
                    </div>
                    <div className="lesson-box">
                      Responsible & Ethical AI Use
                    </div>
                    <div className="lesson-box">
                      AI Safety and Academic Integrity
                    </div>
                  </div>
                </div>
                <div className="course-module">
                  <button className="module-header" data-inline-onclick="openModule(this)">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black">
                        02
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900">
                          ChatGPT for Students & Teachers
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                          Practical ChatGPT usage for education
                        </p>
                      </div>
                    </div>
                    <span className="module-arrow text-slate-400 text-xl">
                      {" "}▼{" "}
                    </span>
                    {" "}
                  </button>
                  <div className="module-content">
                    <div className="lesson-box">
                      ChatGPT Interface & Features
                    </div>
                    <div className="lesson-box">
                      Creating Effective Prompts
                    </div>
                    <div className="lesson-box">
                      Study Assistant with ChatGPT
                    </div>
                    <div className="lesson-box">
                      Teacher Assistant with ChatGPT
                    </div>
                    <div className="lesson-box">
                      Question Answering & Explanation
                    </div>
                    <div className="lesson-box">
                      Conversation-Based Learning
                    </div>
                  </div>
                </div>
                <div className="course-module">
                  <button className="module-header" data-inline-onclick="openModule(this)">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black">
                        03
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900">
                          Prompt Engineering for Education
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                          Learn to write powerful educational prompts
                        </p>
                      </div>
                    </div>
                    <span className="module-arrow text-slate-400 text-xl">
                      ▼
                    </span>
                    {" "}
                  </button>
                  <div className="module-content">
                    <div className="lesson-box">
                      Prompt Engineering Basics
                    </div>
                    <div className="lesson-box">
                      Role-Based Prompts
                    </div>
                    <div className="lesson-box">
                      Context & Instruction
                    </div>
                    <div className="lesson-box">
                      Step-by-Step Prompts
                    </div>
                    <div className="lesson-box">
                      Study Prompts
                    </div>
                    <div className="lesson-box">
                      Teacher Prompts
                    </div>
                    <div className="lesson-box">
                      Prompt Templates
                    </div>
                  </div>
                </div>
                <div className="course-module">
                  <button className="module-header" data-inline-onclick="openModule(this)">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                        04
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900">
                          AI for Lesson Planning & Study
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                          AI-assisted learning and teaching plans
                        </p>
                      </div>
                    </div>
                    <span className="module-arrow text-slate-400 text-xl">
                      ▼
                    </span>
                    {" "}
                  </button>
                  <div className="module-content">
                    <div className="lesson-box">
                      AI Study Planner
                    </div>
                    <div className="lesson-box">
                      Daily & Weekly Learning Plans
                    </div>
                    <div className="lesson-box">
                      Lesson Plan Generation
                    </div>
                    <div className="lesson-box">
                      Learning Objectives
                    </div>
                    <div className="lesson-box">
                      Topic Breakdown
                    </div>
                    <div className="lesson-box">
                      Personalized Learning
                    </div>
                  </div>
                </div>
                <div className="course-module">
                  <button className="module-header" data-inline-onclick="openModule(this)">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-black">
                        05
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900">
                          Notes, Summaries & Question Generation
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                          Convert study material into useful resources
                        </p>
                      </div>
                    </div>
                    <span className="module-arrow text-slate-400 text-xl">
                      ▼
                    </span>
                    {" "}
                  </button>
                  <div className="module-content">
                    <div className="lesson-box">
                      Smart Notes Creation
                    </div>
                    <div className="lesson-box">
                      Chapter Summaries
                    </div>
                    <div className="lesson-box">
                      Important Points Extraction
                    </div>
                    <div className="lesson-box">
                      Flashcards
                    </div>
                    <div className="lesson-box">
                      MCQ Generation
                    </div>
                    <div className="lesson-box">
                      Short & Long Questions
                    </div>
                  </div>
                </div>
                <div className="course-module">
                  <button className="module-header" data-inline-onclick="openModule(this)">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center font-black">
                        06
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900">
                          AI for Assignments, Projects & Research
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                          Research and project assistance
                        </p>
                      </div>
                    </div>
                    <span className="module-arrow text-slate-400 text-xl">
                      ▼
                    </span>
                    {" "}
                  </button>
                  <div className="module-content">
                    <div className="lesson-box">
                      Assignment Planning
                    </div>
                    <div className="lesson-box">
                      Project Ideas
                    </div>
                    <div className="lesson-box">
                      Research Questions
                    </div>
                    <div className="lesson-box">
                      Research Structure
                    </div>
                    <div className="lesson-box">
                      Information Analysis
                    </div>
                    <div className="lesson-box">
                      Citation & Fact Checking
                    </div>
                    <div className="lesson-box">
                      Academic Integrity
                    </div>
                  </div>
                </div>
                <div className="course-module">
                  <button className="module-header" data-inline-onclick="openModule(this)">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-black">
                        07
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900">
                          AI for Presentations & Educational Content
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                          Create engaging academic content
                        </p>
                      </div>
                    </div>
                    <span className="module-arrow text-slate-400 text-xl">
                      ▼
                    </span>
                    {" "}
                  </button>
                  <div className="module-content">
                    <div className="lesson-box">
                      Presentation Ideas
                    </div>
                    <div className="lesson-box">
                      Presentation Structure
                    </div>
                    <div className="lesson-box">
                      Slide Content
                    </div>
                    <div className="lesson-box">
                      Educational Scripts
                    </div>
                    <div className="lesson-box">
                      Visual Content Planning
                    </div>
                    <div className="lesson-box">
                      Video Learning Content
                    </div>
                  </div>
                </div>
                <div className="course-module">
                  <button className="module-header" data-inline-onclick="openModule(this)">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-black">
                        08
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900">
                          AI for Teachers — Lesson & Classroom Planning
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                          Build better classroom resources
                        </p>
                      </div>
                    </div>
                    <span className="module-arrow text-slate-400 text-xl">
                      ▼
                    </span>
                    {" "}
                  </button>
                  <div className="module-content">
                    <div className="lesson-box">
                      Classroom Lesson Planning
                    </div>
                    <div className="lesson-box">
                      Teaching Activities
                    </div>
                    <div className="lesson-box">
                      Discussion Questions
                    </div>
                    <div className="lesson-box">
                      Examples & Analogies
                    </div>
                    <div className="lesson-box">
                      Differentiated Learning
                    </div>
                    <div className="lesson-box">
                      Remedial Learning Plans
                    </div>
                  </div>
                </div>
                <div className="course-module">
                  <button className="module-header" data-inline-onclick="openModule(this)">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-black">
                        09
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900">
                          AI for Worksheets, Quizzes & Assessments
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                          Create assessments efficiently
                        </p>
                      </div>
                    </div>
                    <span className="module-arrow text-slate-400 text-xl">
                      ▼
                    </span>
                    {" "}
                  </button>
                  <div className="module-content">
                    <div className="lesson-box">
                      Worksheet Generation
                    </div>
                    <div className="lesson-box">
                      MCQ & Quiz Creation
                    </div>
                    <div className="lesson-box">
                      Question Banks
                    </div>
                    <div className="lesson-box">
                      Difficulty Levels
                    </div>
                    <div className="lesson-box">
                      Answer Keys
                    </div>
                    <div className="lesson-box">
                      Assessment Rubrics
                    </div>
                  </div>
                </div>
                <div className="course-module">
                  <button className="module-header" data-inline-onclick="openModule(this)">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-black">
                        10
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900">
                          AI for Excel, Data & Student Reports
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                          Work with educational data
                        </p>
                      </div>
                    </div>
                    <span className="module-arrow text-slate-400 text-xl">
                      ▼
                    </span>
                    {" "}
                  </button>
                  <div className="module-content">
                    <div className="lesson-box">
                      Excel with AI
                    </div>
                    <div className="lesson-box">
                      Data Cleaning Basics
                    </div>
                    <div className="lesson-box">
                      Student Performance Analysis
                    </div>
                    <div className="lesson-box">
                      Attendance Data
                    </div>
                    <div className="lesson-box">
                      Progress Reports
                    </div>
                    <div className="lesson-box">
                      AI-Assisted Data Insights
                    </div>
                  </div>
                </div>
                <div className="course-module">
                  <button className="module-header" data-inline-onclick="openModule(this)">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-black">
                        11
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900">
                          AI Productivity & Automation for Education
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                          Save time with AI workflows
                        </p>
                      </div>
                    </div>
                    <span className="module-arrow text-slate-400 text-xl">
                      ▼
                    </span>
                    {" "}
                  </button>
                  <div className="module-content">
                    <div className="lesson-box">
                      AI Productivity Workflows
                    </div>
                    <div className="lesson-box">
                      Email & Communication
                    </div>
                    <div className="lesson-box">
                      Document Assistance
                    </div>
                    <div className="lesson-box">
                      Content Repurposing
                    </div>
                    <div className="lesson-box">
                      Task Automation Concepts
                    </div>
                    <div className="lesson-box">
                      AI-Based Daily Workflow
                    </div>
                  </div>
                </div>
                <div className="course-module">
                  <button className="module-header" data-inline-onclick="openModule(this)">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black">
                        12
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900">
                          Final Education AI Project & Certification
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                          Practical project and final assessment
                        </p>
                      </div>
                    </div>
                    <span className="module-arrow text-slate-400 text-xl">
                      ▼
                    </span>
                    {" "}
                  </button>
                  <div className="module-content">
                    <div className="lesson-box">
                      Choose Education AI Project
                    </div>
                    <div className="lesson-box">
                      Project Planning
                    </div>
                    <div className="lesson-box">
                      AI Workflow Implementation
                    </div>
                    <div className="lesson-box">
                      Project Presentation
                    </div>
                    <div className="lesson-box">
                      Final Assessment
                    </div>
                    <div className="lesson-box">
                      Certificate Completion
                    </div>
                  </div>
                </div>
                <button data-inline-onclick="openAllModules()" className="mt-5 px-5 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition">
                  {" "}Open All Modules{" "}
                </button>
              </div>
              <div>
                <div className="sticky-card modern-card p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-xl">
                      📘
                    </div>
                    <div>
                      <h3 className="font-black text-xl text-slate-900">
                        Course Includes
                      </h3>
                      <p className="text-sm text-slate-500">
                        Everything you need
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-slate-700">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">
                        ✓
                      </span>
                      AI Fundamentals
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-700">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">
                        ✓
                      </span>
                      ChatGPT for Education
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-700">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">
                        ✓
                      </span>
                      Prompt Engineering
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-700">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">
                        ✓
                      </span>
                      AI Study Planning
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-700">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">
                        ✓
                      </span>
                      Notes & Summaries
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-700">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">
                        ✓
                      </span>
                      Assignments & Projects
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-700">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">
                        ✓
                      </span>
                      AI Research
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-700">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">
                        ✓
                      </span>
                      Presentations
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-700">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">
                        ✓
                      </span>
                      Lesson Planning
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-700">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">
                        ✓
                      </span>
                      Worksheets & Quizzes
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-700">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">
                        ✓
                      </span>
                      Student Reports
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-700">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">
                        ✓
                      </span>
                      Productivity & Automation
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-700">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">
                        ✓
                      </span>
                      Practical AI Project
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-700">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">
                        ✓
                      </span>
                      Course Certificate
                    </div>
                  </div>
                  <div className="mt-7 p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                    <div className="text-sm text-indigo-700 font-semibold">
                      Career Optics Computer Centre
                    </div>
                    <div className="font-black text-slate-900 mt-1">
                      Learn AI. Teach Smarter.
                    </div>
                  </div>
                  <a href="#admission" className="block text-center mt-5 px-5 py-3.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition">
                    {" "}Enquire Now →{" "}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <span className="text-sm font-bold text-indigo-600 uppercase tracking-wider">
                {" "}AI Tools{" "}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-2">
                AI Tools for Education
              </h2>
              <p className="text-slate-500 mt-3">
                Learn practical workflows using modern AI tools.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="modern-card tool-card p-6">
                <div className="text-3xl mb-4">
                  🤖
                </div>
                <h3 className="font-black text-lg">
                  ChatGPT
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Study assistance, lesson planning and educational content.
                </p>
              </div>
              <div className="modern-card tool-card p-6">
                <div className="text-3xl mb-4">
                  ✨
                </div>
                <h3 className="font-black text-lg">
                  Gemini
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Research, brainstorming and productivity workflows.
                </p>
              </div>
              <div className="modern-card tool-card p-6">
                <div className="text-3xl mb-4">
                  🧠
                </div>
                <h3 className="font-black text-lg">
                  Claude
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Documents, analysis and structured educational tasks.
                </p>
              </div>
              <div className="modern-card tool-card p-6">
                <div className="text-3xl mb-4">
                  📊
                </div>
                <h3 className="font-black text-lg">
                  AI Productivity
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Documents, spreadsheets, presentations and automation.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-sm font-bold text-indigo-600 uppercase tracking-wider">
                  {" "}Learning Outcomes{" "}
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-2">
                  What You Will Learn
                </h2>
                <p className="mt-4 text-slate-600 leading-7">
                  By completing this course, learners will be able to confidently use AI tools for education and productivity.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-3">
                  <span className="w-7 h-7 shrink-0 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">
                    ✓
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    {" "}Use AI effectively for study{" "}
                  </span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-3">
                  <span className="w-7 h-7 shrink-0 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">
                    ✓
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    {" "}Create powerful educational prompts{" "}
                  </span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-3">
                  <span className="w-7 h-7 shrink-0 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">
                    ✓
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    {" "}Generate notes and summaries{" "}
                  </span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-3">
                  <span className="w-7 h-7 shrink-0 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">
                    ✓
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    {" "}Create assignments and projects{" "}
                  </span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-3">
                  <span className="w-7 h-7 shrink-0 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">
                    ✓
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    {" "}Perform AI-assisted research{" "}
                  </span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-3">
                  <span className="w-7 h-7 shrink-0 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">
                    ✓
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    {" "}Build presentations faster{" "}
                  </span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-3">
                  <span className="w-7 h-7 shrink-0 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">
                    ✓
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    {" "}Create lesson plans{" "}
                  </span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-3">
                  <span className="w-7 h-7 shrink-0 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">
                    ✓
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    {" "}Generate worksheets & quizzes{" "}
                  </span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-3">
                  <span className="w-7 h-7 shrink-0 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">
                    ✓
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    {" "}Analyze student data{" "}
                  </span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-3">
                  <span className="w-7 h-7 shrink-0 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">
                    ✓
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    {" "}Create progress reports{" "}
                  </span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-3">
                  <span className="w-7 h-7 shrink-0 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">
                    ✓
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    {" "}Improve teaching productivity{" "}
                  </span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-3">
                  <span className="w-7 h-7 shrink-0 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">
                    ✓
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    {" "}Build an Education AI project{" "}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="fees" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <span className="text-sm font-bold text-indigo-600 uppercase tracking-wider">
                {" "}Fee Structure{" "}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-2">
                Choose Your Learning Plan
              </h2>
              <p className="text-slate-500 mt-3">
                Sample pricing — customize according to your institute.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="modern-card p-7">
                <div className="text-sm font-bold text-indigo-600">
                  AI Student Starter
                </div>
                <h3 className="text-4xl font-black text-slate-900 mt-3">
                  ₹2,999
                </h3>
                <div className="text-sm text-slate-400 line-through mt-1">
                  ₹4,999
                </div>
                <div className="h-px bg-slate-200 my-6"></div>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li>
                    ✓ AI Fundamentals
                  </li>
                  <li>
                    ✓ ChatGPT Basics
                  </li>
                  <li>
                    ✓ Study Prompts
                  </li>
                  <li>
                    ✓ Notes & Summaries
                  </li>
                  <li>
                    ✓ Certificate
                  </li>
                </ul>
                <a href="#admission" className="block text-center mt-7 px-5 py-3 rounded-xl border border-indigo-200 text-indigo-700 font-bold hover:bg-indigo-50 transition">
                  {" "}Choose Plan{" "}
                </a>
              </div>
              <div className="relative modern-card p-7 border-2 border-indigo-500 shadow-xl shadow-indigo-100">
                <div className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-bold">
                  MOST POPULAR
                </div>
                <div className="text-sm font-bold text-indigo-600">
                  Students & Teachers Mastery
                </div>
                <h3 className="text-4xl font-black text-slate-900 mt-3">
                  ₹5,999
                </h3>
                <div className="text-sm text-slate-400 line-through mt-1">
                  ₹9,999
                </div>
                <div className="h-px bg-slate-200 my-6"></div>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li>
                    ✓ Complete 12 Modules
                  </li>
                  <li>
                    ✓ ChatGPT + AI Tools
                  </li>
                  <li>
                    ✓ Prompt Engineering
                  </li>
                  <li>
                    ✓ Lesson Planning
                  </li>
                  <li>
                    ✓ Research & Projects
                  </li>
                  <li>
                    ✓ Worksheets & Quizzes
                  </li>
                  <li>
                    ✓ Practical Project
                  </li>
                  <li>
                    ✓ Certificate
                  </li>
                </ul>
                <a href="#admission" className="block text-center mt-7 px-5 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition">
                  {" "}Enrol Now →{" "}
                </a>
              </div>
              <div className="modern-card p-7">
                <div className="text-sm font-bold text-indigo-600">
                  AI Education Career Pack
                </div>
                <h3 className="text-4xl font-black text-slate-900 mt-3">
                  ₹9,999
                </h3>
                <div className="text-sm text-slate-400 line-through mt-1">
                  ₹14,999
                </div>
                <div className="h-px bg-slate-200 my-6"></div>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li>
                    ✓ Complete Education AI Program
                  </li>
                  <li>
                    ✓ Advanced AI Workflows
                  </li>
                  <li>
                    ✓ Productivity & Automation
                  </li>
                  <li>
                    ✓ Projects
                  </li>
                  <li>
                    ✓ Career Guidance
                  </li>
                  <li>
                    ✓ Certificate
                  </li>
                </ul>
                <a href="#admission" className="block text-center mt-7 px-5 py-3 rounded-xl border border-indigo-200 text-indigo-700 font-bold hover:bg-indigo-50 transition">
                  {" "}Choose Plan{" "}
                </a>
              </div>
            </div>
          </div>
        </section>
        <section id="admission" className="py-16 bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div className="text-white">
                <span className="text-sm font-bold text-indigo-300 uppercase tracking-wider">
                  {" "}Admission Enquiry{" "}
                </span>
                <h2 className="text-3xl sm:text-4xl font-black mt-3">
                  Start Your AI Education Journey
                </h2>
                <p className="mt-5 text-slate-300 leading-7 max-w-xl">
                  Fill out the enquiry form and our team will contact you regarding the course, batch timings, fees and learning mode.
                </p>
                <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      📞
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">
                        Call Us
                      </div>
                      <div className="font-bold">
                        +91 99999 99999
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      ✉️
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">
                        Email
                      </div>
                      <div className="font-bold">
                        info@example.com
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      📍
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">
                        Location
                      </div>
                      <div className="font-bold">
                        Bihar, India
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl">
                <h3 className="text-2xl font-black text-slate-900">
                  Enquiry Form
                </h3>
                <p className="text-sm text-slate-500 mt-1 mb-6">
                  Get course details and batch information.
                </p>
                <form action="" method="POST" className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        {" "}Full Name{" "}
                      </label>
                      {" "}
                      <input type="text" name="name" className="form-input" placeholder="Enter your name" required />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        {" "}Mobile Number{" "}
                      </label>
                      {" "}
                      <input type="tel" name="mobile" className="form-input" placeholder="Enter mobile number" required />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        {" "}Email Address{" "}
                      </label>
                      {" "}
                      <input type="email" name="email" className="form-input" placeholder="Enter email" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        {" "}Select Course{" "}
                      </label>
                      <select name="course" className="form-input">
                        <option>
                          AI for Students & Teachers
                        </option>
                        <option>
                          Certificate in ChatGPT Mastery
                        </option>
                        <option>
                          Certificate in Gemini AI Mastery
                        </option>
                        <option>
                          AI Tools Mastery
                        </option>
                      </select>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        {" "}Preferred Batch{" "}
                      </label>
                      <select name="batch" className="form-input">
                        <option>
                          Morning
                        </option>
                        <option>
                          Afternoon
                        </option>
                        <option>
                          Evening
                        </option>
                        <option>
                          Weekend
                        </option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        {" "}Learning Mode{" "}
                      </label>
                      <select name="mode" className="form-input">
                        <option>
                          Online
                        </option>
                        <option>
                          Offline
                        </option>
                        <option>
                          Hybrid
                        </option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      {" "}Message{" "}
                    </label>
                    {" "}
                    <textarea name="message" rows={4} className="form-input" placeholder="Write your message..." />
                  </div>
                  <label className="flex items-start gap-3 text-sm text-slate-500">
                    <input type="checkbox" name="consent" className="mt-1" required />
                    <span>
                      {" "}I agree to be contacted regarding this course and admission enquiry.{" "}
                    </span>
                  </label>
                  {" "}
                  <button type="submit" className="w-full py-3.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
                    {" "}Submit Enquiry →{" "}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <span className="text-sm font-bold text-indigo-600 uppercase tracking-wider">
                {" "}FAQ{" "}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-2">
                Frequently Asked Questions
              </h2>
            </div>
            <div className="space-y-4">
              <div className="faq-item active">
                <button className="faq-question" data-inline-onclick="toggleFaq(this)">
                  {" "}
                  <span>
                    {" "}Who can join this course?{" "}
                  </span>
                  {" "}
                  <span className="faq-arrow">
                    {" "}▼{" "}
                  </span>
                  {" "}
                </button>
                <div className="faq-answer">
                  This course is suitable for school students, college students, teachers, tutors, educators and academic professionals who want to learn practical AI skills.
                </div>
              </div>
              <div className="faq-item">
                <button className="faq-question" data-inline-onclick="toggleFaq(this)">
                  {" "}
                  <span>
                    {" "}Is coding required?{" "}
                  </span>
                  {" "}
                  <span className="faq-arrow">
                    ▼
                  </span>
                  {" "}
                </button>
                <div className="faq-answer">
                  No. The program focuses on practical AI tools and educational workflows. No programming background is required.
                </div>
              </div>
              <div className="faq-item">
                <button className="faq-question" data-inline-onclick="toggleFaq(this)">
                  {" "}
                  <span>
                    {" "}Is this useful for school and college students?{" "}
                  </span>
                  {" "}
                  <span className="faq-arrow">
                    ▼
                  </span>
                  {" "}
                </button>
                <div className="faq-answer">
                  Yes. Students can learn AI-assisted study planning, notes, summaries, research, assignments, presentations and exam preparation workflows.
                </div>
              </div>
              <div className="faq-item">
                <button className="faq-question" data-inline-onclick="toggleFaq(this)">
                  {" "}
                  <span>
                    {" "}Is this course useful for teachers?{" "}
                  </span>
                  {" "}
                  <span className="faq-arrow">
                    ▼
                  </span>
                  {" "}
                </button>
                <div className="faq-answer">
                  Yes. Teachers can use AI for lesson plans, classroom activities, worksheets, quizzes, question banks, assessments and student reports.
                </div>
              </div>
              <div className="faq-item">
                <button className="faq-question" data-inline-onclick="toggleFaq(this)">
                  {" "}
                  <span>
                    {" "}Will I receive a certificate?{" "}
                  </span>
                  {" "}
                  <span className="faq-arrow">
                    ▼
                  </span>
                  {" "}
                </button>
                <div className="faq-answer">
                  Yes. Learners who successfully complete the required course activities and final project can receive a course completion certificate.
                </div>
              </div>
              <div className="faq-item">
                <button className="faq-question" data-inline-onclick="toggleFaq(this)">
                  {" "}
                  <span>
                    {" "}Is there a practical project?{" "}
                  </span>
                  {" "}
                  <span className="faq-arrow">
                    ▼
                  </span>
                  {" "}
                </button>
                <div className="faq-answer">
                  Yes. The final module includes an Education AI project where learners create and present a practical AI-based educational workflow.
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="py-16 bg-gradient-to-br from-indigo-600 via-violet-600 to-blue-600">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <div className="text-4xl mb-5">
              🎓 🤖
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black">
              Learn AI. Study Smarter. Teach Better.
            </h2>
            <p className="mt-5 text-indigo-100 text-lg max-w-2xl mx-auto">
              Build practical AI skills for the future of education with Career Optics Computer Centre.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <a href="#admission" className="px-7 py-3.5 rounded-xl bg-white text-indigo-700 font-black hover:bg-slate-100 transition">
                {" "}Start Learning →{" "}
              </a>
              <a href="#syllabus" className="px-7 py-3.5 rounded-xl bg-white/10 border border-white/30 text-white font-bold hover:bg-white/20 transition">
                {" "}Explore Syllabus{" "}
              </a>
            </div>
          </div>
        </section>
        <script dangerouslySetInnerHTML={{ __html: js_ebb9c31b }} />
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
