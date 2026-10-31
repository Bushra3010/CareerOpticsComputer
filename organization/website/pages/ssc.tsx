import DivBlock from "../components/DivBlock";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import StyleBlock from "../components/StyleBlock";
import StyleBlock2 from "../components/StyleBlock2";
import WhatsappWidget from "../components/WhatsappWidget";
import css_32f7cc4c from "../styles/32f7cc4c.css?raw";
import js_0023a4f0 from "../behaviour/0023a4f0.js?raw";
import js_73893071 from "../behaviour/73893071.js?raw";
import js_c1268ab4 from "../behaviour/c1268ab4.js?raw";
import js_ea05b2d5 from "../behaviour/ea05b2d5.js?raw";

/** ssc.html */
export default function Ssc() {
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
        <section className="relative overflow-hidden bg-slate-950 text-white">
          <div className="absolute inset-0 hero-grid"></div>
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-xs font-black uppercase">
                  <span className="w-2 h-2 rounded-full bg-green-400"></span>
                  SSC Preparation Course
                </div>
                <h2 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-black leading-tight">
                  Complete{" "}
                  <span className="text-blue-400">
                    {" "}SSC{" "}
                  </span>
                  <br />
                  Exam Preparation
                </h2>
                <p className="mt-6 max-w-xl text-slate-300 leading-8 text-base sm:text-lg">
                  SSC CGL, CHSL, MTS, GD, CPO और अन्य SSC examinations के लिए Quantitative Aptitude, Reasoning, English, General Awareness और Current Affairs की structured तैयारी।
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
                  <div className="glass rounded-2xl p-4">
                    <p className="text-2xl font-black">
                      100+
                    </p>
                    <p className="text-xs text-slate-400">
                      Practice Sets
                    </p>
                  </div>
                  <div className="glass rounded-2xl p-4">
                    <p className="text-2xl font-black">
                      50+
                    </p>
                    <p className="text-xs text-slate-400">
                      Mock Tests
                    </p>
                  </div>
                  <div className="glass rounded-2xl p-4">
                    <p className="text-2xl font-black">
                      PYQ
                    </p>
                    <p className="text-xs text-slate-400">
                      Question Practice
                    </p>
                  </div>
                  <div className="glass rounded-2xl p-4">
                    <p className="text-2xl font-black">
                      GK
                    </p>
                    <p className="text-xs text-slate-400">
                      Daily Updates
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mt-8">
                  <a href="#fees" className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 px-7 py-4 rounded-xl font-black">
                    <i data-lucide="indian-rupee" className="w-5 h-5">
                      {" "}
                    </i>
                    View Course Fee
                  </a>
                  <a href="#syllabus" className="flex items-center justify-center gap-2 glass px-7 py-4 rounded-xl font-black">
                    <i data-lucide="book-open" className="w-5 h-5">
                      {" "}
                    </i>
                    Complete Syllabus
                  </a>
                </div>
              </div>
              <div className="lg:pl-10">
                <div className="bg-white text-slate-900 rounded-[30px] overflow-hidden shadow-2xl">
                  <div className="bg-gradient-to-br from-blue-600 to-violet-700 text-white p-7">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1.5 rounded-full bg-white/15 text-[10px] font-black">
                        {" "}ADMISSION OPEN{" "}
                      </span>
                      <i data-lucide="award" className="w-8 h-8">
                        {" "}
                      </i>
                    </div>
                    <h3 className="text-2xl font-black mt-5">
                      SSC Complete Batch
                    </h3>
                    <p className="text-blue-100 text-sm mt-2">
                      CGL + CHSL + MTS + GD + CPO
                    </p>
                  </div>
                  <div className="p-7">
                    <p className="text-xs uppercase text-slate-400 font-black">
                      Special Course Fee
                    </p>
                    <div className="flex items-end gap-3 mt-1">
                      <span className="text-5xl font-black">
                        {" "}₹2,499{" "}
                      </span>
                      <span className="text-sm line-through text-slate-400 mb-2">
                        {" "}₹4,999{" "}
                      </span>
                    </div>
                    <span className="inline-flex mt-3 bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-black">
                      50% SPECIAL OFFER
                    </span>
                    <div className="mt-7 space-y-3 text-sm">
                      <div className="flex gap-3">
                        <i data-lucide="check-circle-2" className="w-5 h-5 text-green-500">
                          {" "}
                        </i>
                        Quantitative Aptitude
                      </div>
                      <div className="flex gap-3">
                        <i data-lucide="check-circle-2" className="w-5 h-5 text-green-500">
                          {" "}
                        </i>
                        Reasoning
                      </div>
                      <div className="flex gap-3">
                        <i data-lucide="check-circle-2" className="w-5 h-5 text-green-500">
                          {" "}
                        </i>
                        English
                      </div>
                      <div className="flex gap-3">
                        <i data-lucide="check-circle-2" className="w-5 h-5 text-green-500">
                          {" "}
                        </i>
                        General Awareness
                      </div>
                      <div className="flex gap-3">
                        <i data-lucide="check-circle-2" className="w-5 h-5 text-green-500">
                          {" "}
                        </i>
                        Current Affairs
                      </div>
                      <div className="flex gap-3">
                        <i data-lucide="check-circle-2" className="w-5 h-5 text-green-500">
                          {" "}
                        </i>
                        Mock Test Series
                      </div>
                    </div>
                    <a href="#admission" className="mt-7 w-full flex justify-center py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black">
                      Join SSC Batch
                    </a>
                    <p className="text-center text-[10px] text-slate-400 mt-4">
                      Government examination/application fees अलग हैं।
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="overview" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-blue-600 text-xs font-black uppercase tracking-widest">
                  {" "}Course Overview{" "}
                </span>
                <h2 className="text-3xl sm:text-4xl font-black mt-3">
                  SSC Exam की{" "}
                  <span className="gradient-text">
                    {" "}Complete Preparation{" "}
                  </span>
                </h2>
                <p className="mt-5 text-slate-600 leading-8">
                  Career Optics Computer Academy का SSC Preparation Course उन students के लिए बनाया गया है जो SSC के विभिन्न examinations में बेहतर तैयारी करना चाहते हैं।
                </p>
                <div className="mt-8 space-y-5">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <i data-lucide="calculator" className="w-5 h-5">
                        {" "}
                      </i>
                    </div>
                    <div>
                      <h3 className="font-black">
                        Quantitative Aptitude
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        Arithmetic और advanced mathematics concepts की exam-oriented practice।
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                      <i data-lucide="brain" className="w-5 h-5">
                        {" "}
                      </i>
                    </div>
                    <div>
                      <h3 className="font-black">
                        Reasoning
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        Logical और analytical reasoning की practice।
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                      <i data-lucide="languages" className="w-5 h-5">
                        {" "}
                      </i>
                    </div>
                    <div>
                      <h3 className="font-black">
                        English + General Awareness
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        English language, GK, Current Affairs और General Studies।
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-slate-950 text-white rounded-[30px] p-8 sm:p-10">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center">
                  <i data-lucide="target" className="w-7 h-7">
                    {" "}
                  </i>
                </div>
                <h3 className="text-2xl font-black mt-6">
                  Our Preparation Focus
                </h3>
                <div className="mt-7 space-y-4">
                  <div className="flex gap-3">
                    <span className="text-blue-400">
                      ✓
                    </span>
                    Concept Building
                  </div>
                  <div className="flex gap-3">
                    <span className="text-blue-400">
                      ✓
                    </span>
                    Speed & Accuracy
                  </div>
                  <div className="flex gap-3">
                    <span className="text-blue-400">
                      ✓
                    </span>
                    Previous Year Questions
                  </div>
                  <div className="flex gap-3">
                    <span className="text-blue-400">
                      ✓
                    </span>
                    Topic-wise Practice
                  </div>
                  <div className="flex gap-3">
                    <span className="text-blue-400">
                      ✓
                    </span>
                    Full Length Mock Tests
                  </div>
                  <div className="flex gap-3">
                    <span className="text-blue-400">
                      ✓
                    </span>
                    Current Affairs
                  </div>
                  <div className="flex gap-3">
                    <span className="text-blue-400">
                      ✓
                    </span>
                    Regular Revision
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="courses" className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-blue-600 text-xs font-black uppercase tracking-widest">
                {" "}SSC Exams{" "}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black mt-3">
                Prepare For{" "}
                <span className="gradient-text">
                  {" "}Multiple SSC Exams{" "}
                </span>
              </h2>
              <p className="text-slate-500 mt-4">
                एक ही preparation system के माध्यम से अलग-अलग SSC examinations की तैयारी।
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
              <div className="hover-card bg-white border rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <i data-lucide="briefcase" className="w-6 h-6">
                      {" "}
                    </i>
                  </div>
                  <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
                    {" "}SSC{" "}
                  </span>
                </div>
                <h3 className="text-xl font-black mt-5">
                  SSC CGL
                </h3>
                <p className="text-sm text-slate-500 mt-2 leading-6">
                  Graduate level competitive examination preparation।
                </p>
                <a href="#syllabus" className="inline-flex items-center gap-2 text-blue-600 text-sm font-black mt-5">
                  View Preparation
                  <i data-lucide="arrow-right" className="w-4 h-4">
                    {" "}
                  </i>
                </a>
              </div>
              <div className="hover-card bg-white border rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                  <i data-lucide="file-text" className="w-6 h-6">
                    {" "}
                  </i>
                </div>
                <h3 className="text-xl font-black mt-5">
                  SSC CHSL
                </h3>
                <p className="text-sm text-slate-500 mt-2 leading-6">
                  10+2 level SSC examination preparation।
                </p>
                <a href="#syllabus" className="inline-flex items-center gap-2 text-blue-600 text-sm font-black mt-5">
                  View Preparation
                  <i data-lucide="arrow-right" className="w-4 h-4">
                    {" "}
                  </i>
                </a>
              </div>
              <div className="hover-card bg-white border rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <i data-lucide="layers" className="w-6 h-6">
                    {" "}
                  </i>
                </div>
                <h3 className="text-xl font-black mt-5">
                  SSC MTS
                </h3>
                <p className="text-sm text-slate-500 mt-2 leading-6">
                  Matriculation level examination preparation।
                </p>
                <a href="#syllabus" className="inline-flex items-center gap-2 text-blue-600 text-sm font-black mt-5">
                  View Preparation
                  <i data-lucide="arrow-right" className="w-4 h-4">
                    {" "}
                  </i>
                </a>
              </div>
              <div className="hover-card bg-white border rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                  <i data-lucide="shield" className="w-6 h-6">
                    {" "}
                  </i>
                </div>
                <h3 className="text-xl font-black mt-5">
                  SSC GD
                </h3>
                <p className="text-sm text-slate-500 mt-2 leading-6">
                  General Duty Constable examination preparation।
                </p>
                <a href="#syllabus" className="inline-flex items-center gap-2 text-blue-600 text-sm font-black mt-5">
                  View Preparation
                  <i data-lucide="arrow-right" className="w-4 h-4">
                    {" "}
                  </i>
                </a>
              </div>
              <div className="hover-card bg-white border rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                  <i data-lucide="badge" className="w-6 h-6">
                    {" "}
                  </i>
                </div>
                <h3 className="text-xl font-black mt-5">
                  SSC CPO
                </h3>
                <p className="text-sm text-slate-500 mt-2 leading-6">
                  Sub-Inspector examination preparation।
                </p>
                <a href="#syllabus" className="inline-flex items-center gap-2 text-blue-600 text-sm font-black mt-5">
                  View Preparation
                  <i data-lucide="arrow-right" className="w-4 h-4">
                    {" "}
                  </i>
                </a>
              </div>
              <div className="hover-card bg-white border rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                  <i data-lucide="keyboard" className="w-6 h-6">
                    {" "}
                  </i>
                </div>
                <h3 className="text-xl font-black mt-5">
                  SSC Stenographer
                </h3>
                <p className="text-sm text-slate-500 mt-2 leading-6">
                  Stenographer examination preparation।
                </p>
                <a href="#syllabus" className="inline-flex items-center gap-2 text-blue-600 text-sm font-black mt-5">
                  View Preparation
                  <i data-lucide="arrow-right" className="w-4 h-4">
                    {" "}
                  </i>
                </a>
              </div>
            </div>
          </div>
        </section>
        <section id="syllabus" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-blue-600 text-xs font-black uppercase tracking-widest">
                {" "}Complete Syllabus{" "}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black mt-3">
                SSC{" "}
                <span className="gradient-text">
                  {" "}Subject-Wise Syllabus{" "}
                </span>
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
              <div className="hover-card border rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <i data-lucide="calculator" className="w-6 h-6">
                    {" "}
                  </i>
                </div>
                <h3 className="text-lg font-black mt-5">
                  Quantitative Aptitude
                </h3>
                <ul className="mt-4 text-sm text-slate-500 space-y-2">
                  <li>
                    • Number System
                  </li>
                  <li>
                    • Percentage
                  </li>
                  <li>
                    • Ratio & Proportion
                  </li>
                  <li>
                    • Average
                  </li>
                  <li>
                    • Profit & Loss
                  </li>
                  <li>
                    • Simple & Compound Interest
                  </li>
                  <li>
                    • Time & Work
                  </li>
                  <li>
                    • Time, Speed & Distance
                  </li>
                  <li>
                    • Algebra
                  </li>
                  <li>
                    • Geometry
                  </li>
                  <li>
                    • Mensuration
                  </li>
                  <li>
                    • Data Interpretation
                  </li>
                </ul>
              </div>
              <div className="hover-card border rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                  <i data-lucide="brain" className="w-6 h-6">
                    {" "}
                  </i>
                </div>
                <h3 className="text-lg font-black mt-5">
                  General Intelligence & Reasoning
                </h3>
                <ul className="mt-4 text-sm text-slate-500 space-y-2">
                  <li>
                    • Analogy
                  </li>
                  <li>
                    • Classification
                  </li>
                  <li>
                    • Number Series
                  </li>
                  <li>
                    • Alphabet Series
                  </li>
                  <li>
                    • Coding-Decoding
                  </li>
                  <li>
                    • Blood Relation
                  </li>
                  <li>
                    • Direction Test
                  </li>
                  <li>
                    • Ranking
                  </li>
                  <li>
                    • Venn Diagram
                  </li>
                  <li>
                    • Syllogism
                  </li>
                  <li>
                    • Statement & Conclusion
                  </li>
                  <li>
                    • Non-Verbal Reasoning
                  </li>
                </ul>
              </div>
              <div className="hover-card border rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                  <i data-lucide="languages" className="w-6 h-6">
                    {" "}
                  </i>
                </div>
                <h3 className="text-lg font-black mt-5">
                  English Language
                </h3>
                <ul className="mt-4 text-sm text-slate-500 space-y-2">
                  <li>
                    • Grammar
                  </li>
                  <li>
                    • Vocabulary
                  </li>
                  <li>
                    • Synonyms & Antonyms
                  </li>
                  <li>
                    • One Word Substitution
                  </li>
                  <li>
                    • Idioms & Phrases
                  </li>
                  <li>
                    • Error Detection
                  </li>
                  <li>
                    • Sentence Improvement
                  </li>
                  <li>
                    • Fill in the Blanks
                  </li>
                  <li>
                    • Cloze Test
                  </li>
                  <li>
                    • Active & Passive Voice
                  </li>
                  <li>
                    • Direct & Indirect Speech
                  </li>
                  <li>
                    • Reading Comprehension
                  </li>
                </ul>
              </div>
              <div className="hover-card border rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <i data-lucide="globe-2" className="w-6 h-6">
                    {" "}
                  </i>
                </div>
                <h3 className="text-lg font-black mt-5">
                  General Awareness
                </h3>
                <ul className="mt-4 text-sm text-slate-500 space-y-2">
                  <li>
                    • Indian History
                  </li>
                  <li>
                    • Geography
                  </li>
                  <li>
                    • Indian Polity
                  </li>
                  <li>
                    • Indian Economy
                  </li>
                  <li>
                    • General Science
                  </li>
                  <li>
                    • Physics
                  </li>
                  <li>
                    • Chemistry
                  </li>
                  <li>
                    • Biology
                  </li>
                  <li>
                    • Environment
                  </li>
                  <li>
                    • Art & Culture
                  </li>
                </ul>
              </div>
              <div className="hover-card border rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                  <i data-lucide="newspaper" className="w-6 h-6">
                    {" "}
                  </i>
                </div>
                <h3 className="text-lg font-black mt-5">
                  Current Affairs
                </h3>
                <ul className="mt-4 text-sm text-slate-500 space-y-2">
                  <li>
                    • National News
                  </li>
                  <li>
                    • International News
                  </li>
                  <li>
                    • Sports
                  </li>
                  <li>
                    • Awards
                  </li>
                  <li>
                    • Appointments
                  </li>
                  <li>
                    • Government Schemes
                  </li>
                  <li>
                    • Defence Updates
                  </li>
                  <li>
                    • Important Days
                  </li>
                  <li>
                    • Books & Authors
                  </li>
                  <li>
                    • Current Static GK
                  </li>
                </ul>
              </div>
              <div className="hover-card border rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                  <i data-lucide="monitor" className="w-6 h-6">
                    {" "}
                  </i>
                </div>
                <h3 className="text-lg font-black mt-5">
                  Computer Awareness
                </h3>
                <ul className="mt-4 text-sm text-slate-500 space-y-2">
                  <li>
                    • Computer Fundamentals
                  </li>
                  <li>
                    • Hardware & Software
                  </li>
                  <li>
                    • Operating System
                  </li>
                  <li>
                    • MS Office
                  </li>
                  <li>
                    • Internet
                  </li>
                  <li>
                    • Networking
                  </li>
                  <li>
                    • Cyber Security Basics
                  </li>
                  <li>
                    • Computer Shortcuts
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="text-blue-600 text-xs font-black uppercase tracking-widest">
                {" "}Preparation Strategy{" "}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black mt-3">
                Learn → Practice →{" "}
                <span className="gradient-text">
                  {" "}Crack{" "}
                </span>
              </h2>
            </div>
            <div className="grid md:grid-cols-5 gap-4 mt-12">
              <div className="bg-white p-5 rounded-2xl border">
                <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black">
                  01
                </div>
                <h3 className="font-black mt-4">
                  Concepts
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-6">
                  Basic concepts को strong करें।
                </p>
              </div>
              <div className="bg-white p-5 rounded-2xl border">
                <div className="w-10 h-10 rounded-lg bg-violet-600 text-white flex items-center justify-center font-black">
                  02
                </div>
                <h3 className="font-black mt-4">
                  Practice
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-6">
                  Topic-wise questions solve करें।
                </p>
              </div>
              <div className="bg-white p-5 rounded-2xl border">
                <div className="w-10 h-10 rounded-lg bg-orange-600 text-white flex items-center justify-center font-black">
                  03
                </div>
                <h3 className="font-black mt-4">
                  PYQ
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-6">
                  Previous year questions करें।
                </p>
              </div>
              <div className="bg-white p-5 rounded-2xl border">
                <div className="w-10 h-10 rounded-lg bg-green-600 text-white flex items-center justify-center font-black">
                  04
                </div>
                <h3 className="font-black mt-4">
                  Mock Tests
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-6">
                  Full length exam tests दें।
                </p>
              </div>
              <div className="bg-white p-5 rounded-2xl border">
                <div className="w-10 h-10 rounded-lg bg-red-600 text-white flex items-center justify-center font-black">
                  05
                </div>
                <h3 className="font-black mt-4">
                  Revision
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-6">
                  Weak topics को revise करें।
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="text-blue-600 text-xs font-black uppercase tracking-widest">
                {" "}Course Benefits{" "}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black mt-3">
                Why Join{" "}
                <span className="gradient-text">
                  {" "}Career Optics Computer Academy?{" "}
                </span>
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
              <div className="hover-card p-6 bg-slate-50 rounded-2xl border">
                <i data-lucide="video" className="w-7 h-7 text-blue-600">
                  {" "}
                </i>
                <h3 className="font-black mt-5">
                  Video Classes
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Topic-wise structured learning।
                </p>
              </div>
              <div className="hover-card p-6 bg-slate-50 rounded-2xl border">
                <i data-lucide="file-question" className="w-7 h-7 text-violet-600">
                  {" "}
                </i>
                <h3 className="font-black mt-5">
                  Practice Sets
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Regular exam-oriented questions।
                </p>
              </div>
              <div className="hover-card p-6 bg-slate-50 rounded-2xl border">
                <i data-lucide="clipboard-check" className="w-7 h-7 text-green-600">
                  {" "}
                </i>
                <h3 className="font-black mt-5">
                  Mock Tests
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Full-length mock test practice।
                </p>
              </div>
              <div className="hover-card p-6 bg-slate-50 rounded-2xl border">
                <i data-lucide="history" className="w-7 h-7 text-orange-600">
                  {" "}
                </i>
                <h3 className="font-black mt-5">
                  PYQ
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Previous year question practice।
                </p>
              </div>
              <div className="hover-card p-6 bg-slate-50 rounded-2xl border">
                <i data-lucide="newspaper" className="w-7 h-7 text-red-600">
                  {" "}
                </i>
                <h3 className="font-black mt-5">
                  Current Affairs
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Regular current affairs updates।
                </p>
              </div>
              <div className="hover-card p-6 bg-slate-50 rounded-2xl border">
                <i data-lucide="timer" className="w-7 h-7 text-cyan-600">
                  {" "}
                </i>
                <h3 className="font-black mt-5">
                  Speed Training
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Time management और accuracy practice।
                </p>
              </div>
              <div className="hover-card p-6 bg-slate-50 rounded-2xl border">
                <i data-lucide="calendar-days" className="w-7 h-7 text-indigo-600">
                  {" "}
                </i>
                <h3 className="font-black mt-5">
                  Study Planner
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Daily और weekly preparation plan।
                </p>
              </div>
              <div className="hover-card p-6 bg-slate-50 rounded-2xl border">
                <i data-lucide="message-circle-question" className="w-7 h-7 text-yellow-600">
                  {" "}
                </i>
                <h3 className="font-black mt-5">
                  Doubt Support
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Preparation doubts के लिए support।
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="fees" className="py-20 bg-slate-950 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="text-blue-400 text-xs font-black uppercase tracking-widest">
                {" "}Course Pricing{" "}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black mt-3">
                Choose Your{" "}
                <span className="text-blue-400">
                  {" "}SSC Batch{" "}
                </span>
              </h2>
            </div>
            <div className="grid lg:grid-cols-3 gap-6 mt-12">
              <div className="bg-white text-slate-900 rounded-3xl p-7">
                <span className="text-xs font-black text-blue-600 uppercase">
                  {" "}Basic{" "}
                </span>
                <h3 className="text-2xl font-black mt-3">
                  SSC Foundation
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Basic SSC Preparation
                </p>
                <div className="mt-7">
                  <span className="text-4xl font-black">
                    {" "}₹1,499{" "}
                  </span>
                  {" "}
                  <span className="text-sm line-through text-slate-400">
                    {" "}₹2,999{" "}
                  </span>
                </div>
                <ul className="mt-7 space-y-3 text-sm">
                  <li>
                    ✓ Maths
                  </li>
                  <li>
                    ✓ Reasoning
                  </li>
                  <li>
                    ✓ English
                  </li>
                  <li>
                    ✓ General Awareness
                  </li>
                  <li>
                    ✓ Practice Sets
                  </li>
                </ul>
                <a href="#admission" className="mt-8 block text-center bg-slate-900 text-white py-3.5 rounded-xl font-black">
                  {" "}Join Basic{" "}
                </a>
              </div>
              <div className="relative bg-blue-600 rounded-3xl p-7 scale-[1.02] ring-4 ring-blue-400/20">
                <span className="absolute right-5 top-5 bg-yellow-400 text-yellow-950 px-3 py-1 rounded-full text-[10px] font-black">
                  {" "}MOST POPULAR{" "}
                </span>
                {" "}
                <span className="text-xs font-black text-blue-100 uppercase">
                  {" "}Premium{" "}
                </span>
                <h3 className="text-2xl font-black mt-3">
                  SSC Complete Batch
                </h3>
                <p className="text-sm text-blue-100 mt-2">
                  Complete SSC Preparation
                </p>
                <div className="mt-7">
                  <span className="text-5xl font-black">
                    {" "}₹2,499{" "}
                  </span>
                  {" "}
                  <span className="text-sm line-through text-blue-200">
                    {" "}₹4,999{" "}
                  </span>
                </div>
                <ul className="mt-7 space-y-3 text-sm">
                  <li>
                    ✓ Maths
                  </li>
                  <li>
                    ✓ Reasoning
                  </li>
                  <li>
                    ✓ English
                  </li>
                  <li>
                    ✓ General Awareness
                  </li>
                  <li>
                    ✓ Current Affairs
                  </li>
                  <li>
                    ✓ PYQ Practice
                  </li>
                  <li>
                    ✓ 50+ Mock Tests
                  </li>
                  <li>
                    ✓ Study Planner
                  </li>
                </ul>
                <a href="#admission" className="mt-8 block text-center bg-white text-blue-700 py-3.5 rounded-xl font-black">
                  {" "}Join Premium{" "}
                </a>
              </div>
              <div className="bg-white text-slate-900 rounded-3xl p-7">
                <span className="text-xs font-black text-violet-600 uppercase">
                  {" "}Ultimate{" "}
                </span>
                <h3 className="text-2xl font-black mt-3">
                  SSC Pro Batch
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Advanced SSC Preparation
                </p>
                <div className="mt-7">
                  <span className="text-4xl font-black">
                    {" "}₹3,499{" "}
                  </span>
                  {" "}
                  <span className="text-sm line-through text-slate-400">
                    {" "}₹6,999{" "}
                  </span>
                </div>
                <ul className="mt-7 space-y-3 text-sm">
                  <li>
                    ✓ Everything in Premium
                  </li>
                  <li>
                    ✓ Extra Mock Tests
                  </li>
                  <li>
                    ✓ Advanced Practice
                  </li>
                  <li>
                    ✓ Revision Classes
                  </li>
                  <li>
                    ✓ Current Affairs
                  </li>
                  <li>
                    ✓ PYQ Analysis
                  </li>
                  <li>
                    ✓ Speed Training
                  </li>
                  <li>
                    ✓ Doubt Assistance
                  </li>
                </ul>
                <a href="#admission" className="mt-8 block text-center bg-violet-600 hover:bg-violet-700 text-white py-3.5 rounded-xl font-black">
                  {" "}Join Pro{" "}
                </a>
              </div>
            </div>
            <p className="text-center text-xs text-slate-500 mt-8">
              *ये Career Optics Computer Academy के sample course prices हैं। Actual fee और course inclusions academy अपनी policy के अनुसार update कर सकती है।
            </p>
          </div>
        </section>
        <section id="admission" className="py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="bg-gradient-to-r from-blue-600 to-violet-700 rounded-[30px] p-8 sm:p-12 text-white">
              <div className="grid lg:grid-cols-2 gap-10 items-center">
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-blue-100">
                    {" "}Admission Open{" "}
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-black mt-3">
                    SSC की तैयारी आज से शुरू करें।
                  </h2>
                  <p className="text-blue-100 leading-7 mt-4">
                    CGL, CHSL, MTS, GD, CPO और अन्य SSC examinations की systematic preparation शुरू करें।
                  </p>
                  <div className="flex flex-wrap gap-3 mt-7">
                    <span className="px-4 py-2 rounded-full bg-white/10 text-xs font-bold">
                      {" "}SSC CGL{" "}
                    </span>
                    <span className="px-4 py-2 rounded-full bg-white/10 text-xs font-bold">
                      {" "}SSC CHSL{" "}
                    </span>
                    <span className="px-4 py-2 rounded-full bg-white/10 text-xs font-bold">
                      {" "}SSC MTS{" "}
                    </span>
                    <span className="px-4 py-2 rounded-full bg-white/10 text-xs font-bold">
                      {" "}SSC GD{" "}
                    </span>
                  </div>
                </div>
                <form data-inline-onsubmit="submitForm(event)" className="bg-white text-slate-900 rounded-3xl p-6">
                  <h3 className="font-black text-xl">
                    SSC Admission Enquiry
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    अपना details भरें।
                  </p>
                  <div className="space-y-3 mt-5">
                    <input type="text" required placeholder="Student Name" className="w-full px-4 py-3 rounded-xl border outline-none focus:border-blue-500" />
                    {" "}
                    <input type="tel" required placeholder="Mobile Number" className="w-full px-4 py-3 rounded-xl border outline-none focus:border-blue-500" />
                    <select required className="w-full px-4 py-3 rounded-xl border outline-none">
                      <option value="">
                        {" "}Select SSC Exam{" "}
                      </option>
                      <option>
                        {" "}SSC CGL{" "}
                      </option>
                      <option>
                        {" "}SSC CHSL{" "}
                      </option>
                      <option>
                        {" "}SSC MTS{" "}
                      </option>
                      <option>
                        {" "}SSC GD{" "}
                      </option>
                      <option>
                        {" "}SSC CPO{" "}
                      </option>
                      <option>
                        {" "}SSC Stenographer{" "}
                      </option>
                    </select>
                    <select required className="w-full px-4 py-3 rounded-xl border outline-none">
                      <option value="">
                        {" "}Select Batch{" "}
                      </option>
                      <option>
                        {" "}Foundation - ₹1,499{" "}
                      </option>
                      <option>
                        {" "}Complete - ₹2,499{" "}
                      </option>
                      <option>
                        {" "}Pro - ₹3,499{" "}
                      </option>
                    </select>
                  </div>
                  <button type="submit" className="w-full mt-5 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black">
                    {" "}Submit Enquiry{" "}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
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
