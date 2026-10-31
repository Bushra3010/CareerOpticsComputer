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

/** steno.html */
export default function Steno() {
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
          <div className="absolute inset-0 hero-pattern"></div>
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-xs font-black">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  SSC Stenographer Grade C & D
                </span>
                <h2 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-black leading-tight">
                  Master{" "}
                  <span className="text-blue-400">
                    {" "}SSC Stenography{" "}
                  </span>
                  <br />
                  Build Your Government Career
                </h2>
                <p className="mt-6 text-slate-300 max-w-xl text-base sm:text-lg leading-8">
                  SSC Stenographer Grade C और Grade D की तैयारी के लिए Reasoning, General Awareness, English और Stenography Skill Test की complete preparation।
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
                      Analysis
                    </p>
                  </div>
                  <div className="glass rounded-2xl p-4">
                    <p className="text-2xl font-black">
                      Daily
                    </p>
                    <p className="text-xs text-slate-400">
                      Practice
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mt-8">
                  <a href="#fees" className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 px-7 py-4 rounded-xl font-black">
                    <i data-lucide="indian-rupee" className="w-5 h-5"></i>
                    View Course Fee
                  </a>
                  <a href="#syllabus" className="flex items-center justify-center gap-2 glass px-7 py-4 rounded-xl font-black">
                    <i data-lucide="book-open" className="w-5 h-5"></i>
                    View Syllabus
                  </a>
                </div>
              </div>
              <div className="lg:pl-10">
                <div className="bg-white text-slate-900 rounded-[30px] overflow-hidden shadow-2xl">
                  <div className="bg-gradient-to-br from-blue-600 to-violet-700 p-7 text-white">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1.5 rounded-full bg-white/15 text-[10px] font-black">
                        {" "}ADMISSION OPEN{" "}
                      </span>
                      <i data-lucide="badge-check" className="w-8 h-8"></i>
                    </div>
                    <h3 className="text-2xl font-black mt-5">
                      SSC Stenographer Complete Batch
                    </h3>
                    <p className="text-blue-100 text-sm mt-2">
                      Grade C + Grade D Preparation
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
                        <i data-lucide="check-circle-2" className="w-5 h-5 text-green-500"></i>
                        General Intelligence & Reasoning
                      </div>
                      <div className="flex gap-3">
                        <i data-lucide="check-circle-2" className="w-5 h-5 text-green-500"></i>
                        General Awareness
                      </div>
                      <div className="flex gap-3">
                        <i data-lucide="check-circle-2" className="w-5 h-5 text-green-500"></i>
                        English Language
                      </div>
                      <div className="flex gap-3">
                        <i data-lucide="check-circle-2" className="w-5 h-5 text-green-500"></i>
                        Stenography Practice
                      </div>
                      <div className="flex gap-3">
                        <i data-lucide="check-circle-2" className="w-5 h-5 text-green-500"></i>
                        PYQ + Mock Tests
                      </div>
                      <div className="flex gap-3">
                        <i data-lucide="check-circle-2" className="w-5 h-5 text-green-500"></i>
                        Skill Test Guidance
                      </div>
                    </div>
                    <a href="#admission" className="mt-7 w-full flex justify-center py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black">
                      Join Stenographer Batch
                    </a>
                    <p className="text-center text-[10px] text-slate-400 mt-4">
                      Demo pricing — update according to Career Optics Computer Academy fee structure.
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
                  SSC Stenographer की{" "}
                  <span className="gradient-text">
                    {" "}Complete Preparation{" "}
                  </span>
                </h2>
                <p className="mt-5 text-slate-600 leading-8">
                  SSC Stenographer examination में Grade C और Grade D posts के लिए candidates को computer-based examination के साथ stenography skill test की तैयारी करनी होती है। यह course written preparation, English और stenography practice को cover करता है।
                </p>
                <div className="mt-8 space-y-5">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <i data-lucide="brain" className="w-5 h-5"></i>
                    </div>
                    <div>
                      <h3 className="font-black">
                        Written Exam Preparation
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        Reasoning, General Awareness और English की topic-wise तैयारी।
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                      <i data-lucide="keyboard" className="w-5 h-5"></i>
                    </div>
                    <div>
                      <h3 className="font-black">
                        Stenography Practice
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        Dictation, shorthand और transcription practice के लिए structured routine।
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                      <i data-lucide="target" className="w-5 h-5"></i>
                    </div>
                    <div>
                      <h3 className="font-black">
                        Exam Strategy
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        PYQ, mock tests और revision strategy के साथ focused preparation।
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-slate-950 text-white rounded-[30px] p-8 sm:p-10">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center">
                  <i data-lucide="mic-2" className="w-7 h-7"></i>
                </div>
                <h3 className="text-2xl font-black mt-6">
                  Career-Focused Preparation
                </h3>
                <div className="mt-7 space-y-4 text-sm">
                  <div>
                    ✓ Grade C & Grade D Preparation
                  </div>
                  <div>
                    ✓ Reasoning Practice
                  </div>
                  <div>
                    ✓ General Awareness
                  </div>
                  <div>
                    ✓ English Grammar
                  </div>
                  <div>
                    ✓ Vocabulary Building
                  </div>
                  <div>
                    ✓ Shorthand Practice
                  </div>
                  <div>
                    ✓ Dictation Practice
                  </div>
                  <div>
                    ✓ Transcription Practice
                  </div>
                  <div>
                    ✓ Mock Tests
                  </div>
                  <div>
                    ✓ Previous Year Questions
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="pattern" className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="text-blue-600 text-xs font-black uppercase tracking-widest">
                {" "}Exam Pattern{" "}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black mt-3">
                SSC Stenographer{" "}
                <span className="gradient-text">
                  {" "}CBT Pattern{" "}
                </span>
              </h2>
              <p className="max-w-2xl mx-auto text-slate-500 mt-4 text-sm leading-7">
                नीचे commonly used SSC Stenographer CBT structure दिया गया है। Latest SSC notification को final reference मानें।
              </p>
            </div>
            <div className="max-w-4xl mx-auto mt-12 bg-white rounded-3xl border overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-950 text-white">
                    <tr>
                      <th className="text-left px-6 py-5">
                        Subject
                      </th>
                      <th className="px-6 py-5">
                        Questions
                      </th>
                      <th className="px-6 py-5">
                        Marks
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="px-6 py-5 font-bold">
                        General Intelligence & Reasoning
                      </td>
                      <td className="text-center">
                        50
                      </td>
                      <td className="text-center">
                        50
                      </td>
                    </tr>
                    <tr className="border-t">
                      <td className="px-6 py-5 font-bold">
                        General Awareness
                      </td>
                      <td className="text-center">
                        50
                      </td>
                      <td className="text-center">
                        50
                      </td>
                    </tr>
                    <tr className="border-t">
                      <td className="px-6 py-5 font-bold">
                        English Language & Comprehension
                      </td>
                      <td className="text-center">
                        100
                      </td>
                      <td className="text-center">
                        100
                      </td>
                    </tr>
                    <tr className="border-t bg-blue-50">
                      <td className="px-6 py-5 font-black">
                        Total
                      </td>
                      <td className="text-center font-black">
                        200
                      </td>
                      <td className="text-center font-black">
                        200
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="grid sm:grid-cols-3 border-t">
                <div className="p-6 border-b sm:border-b-0 sm:border-r">
                  <p className="text-xs text-slate-400 font-black uppercase">
                    Duration
                  </p>
                  <p className="text-xl font-black mt-2">
                    2 Hours
                  </p>
                </div>
                <div className="p-6 border-b sm:border-b-0 sm:border-r">
                  <p className="text-xs text-slate-400 font-black uppercase">
                    Mode
                  </p>
                  <p className="text-xl font-black mt-2">
                    Computer Based
                  </p>
                </div>
                <div className="p-6">
                  <p className="text-xs text-slate-400 font-black uppercase">
                    Negative Marking
                  </p>
                  <p className="text-xl font-black mt-2">
                    As per Notification
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="syllabus" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="text-blue-600 text-xs font-black uppercase tracking-widest">
                {" "}Complete Syllabus{" "}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black mt-3">
                SSC Stenographer{" "}
                <span className="gradient-text">
                  {" "}Subject-Wise Syllabus{" "}
                </span>
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              <div className="hover-card border rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <i data-lucide="brain" className="w-6 h-6"></i>
                </div>
                <h3 className="text-lg font-black mt-5">
                  General Intelligence & Reasoning
                </h3>
                <ul className="mt-4 space-y-2 text-sm text-slate-500">
                  <li>
                    • Analogy
                  </li>
                  <li>
                    • Classification
                  </li>
                  <li>
                    • Coding-Decoding
                  </li>
                  <li>
                    • Number Series
                  </li>
                  <li>
                    • Alphabet Series
                  </li>
                  <li>
                    • Blood Relations
                  </li>
                  <li>
                    • Direction Test
                  </li>
                  <li>
                    • Ranking & Order
                  </li>
                  <li>
                    • Syllogism
                  </li>
                  <li>
                    • Venn Diagram
                  </li>
                  <li>
                    • Statement & Conclusion
                  </li>
                  <li>
                    • Arithmetic Reasoning
                  </li>
                  <li>
                    • Non-Verbal Reasoning
                  </li>
                  <li>
                    • Mirror Image
                  </li>
                  <li>
                    • Water Image
                  </li>
                  <li>
                    • Figure Classification
                  </li>
                </ul>
              </div>
              <div className="hover-card border rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <i data-lucide="globe-2" className="w-6 h-6"></i>
                </div>
                <h3 className="text-lg font-black mt-5">
                  General Awareness
                </h3>
                <ul className="mt-4 space-y-2 text-sm text-slate-500">
                  <li>
                    • Indian History
                  </li>
                  <li>
                    • Ancient India
                  </li>
                  <li>
                    • Medieval India
                  </li>
                  <li>
                    • Modern India
                  </li>
                  <li>
                    • Indian Geography
                  </li>
                  <li>
                    • Indian Polity
                  </li>
                  <li>
                    • Constitution
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
                  <li>
                    • Sports
                  </li>
                  <li>
                    • Awards
                  </li>
                  <li>
                    • Important Days
                  </li>
                  <li>
                    • Current Affairs
                  </li>
                </ul>
              </div>
              <div className="hover-card border rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                  <i data-lucide="languages" className="w-6 h-6"></i>
                </div>
                <h3 className="text-lg font-black mt-5">
                  English Language & Comprehension
                </h3>
                <ul className="mt-4 space-y-2 text-sm text-slate-500">
                  <li>
                    • Vocabulary
                  </li>
                  <li>
                    • Grammar
                  </li>
                  <li>
                    • Synonyms
                  </li>
                  <li>
                    • Antonyms
                  </li>
                  <li>
                    • One Word Substitution
                  </li>
                  <li>
                    • Idioms & Phrases
                  </li>
                  <li>
                    • Fill in the Blanks
                  </li>
                  <li>
                    • Error Detection
                  </li>
                  <li>
                    • Sentence Improvement
                  </li>
                  <li>
                    • Active Voice
                  </li>
                  <li>
                    • Passive Voice
                  </li>
                  <li>
                    • Direct Speech
                  </li>
                  <li>
                    • Indirect Speech
                  </li>
                  <li>
                    • Cloze Test
                  </li>
                  <li>
                    • Reading Comprehension
                  </li>
                  <li>
                    • Para Jumbles
                  </li>
                  <li>
                    • Sentence Arrangement
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-8 bg-slate-950 text-white rounded-3xl p-7 sm:p-9">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                <div>
                  <span className="text-blue-400 text-xs font-black uppercase">
                    {" "}Skill Test Preparation{" "}
                  </span>
                  <h3 className="text-2xl font-black mt-2">
                    Stenography Skill Test
                  </h3>
                </div>
                <div className="px-5 py-3 rounded-xl bg-white/10 text-sm font-bold">
                  Shorthand + Transcription
                </div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                <div className="glass rounded-xl p-5">
                  <i data-lucide="mic" className="w-6 h-6 text-blue-400"></i>
                  <p className="font-bold mt-4">
                    Dictation Practice
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    Regular dictation practice।
                  </p>
                </div>
                <div className="glass rounded-xl p-5">
                  <i data-lucide="pen-line" className="w-6 h-6 text-violet-400"></i>
                  <p className="font-bold mt-4">
                    Shorthand
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    Speed और accuracy building।
                  </p>
                </div>
                <div className="glass rounded-xl p-5">
                  <i data-lucide="keyboard" className="w-6 h-6 text-green-400"></i>
                  <p className="font-bold mt-4">
                    Transcription
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    Computer transcription practice।
                  </p>
                </div>
                <div className="glass rounded-xl p-5">
                  <i data-lucide="timer" className="w-6 h-6 text-orange-400"></i>
                  <p className="font-bold mt-4">
                    Speed Training
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    Time-bound practice sessions।
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="skill" className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-10">
              <div>
                <span className="text-blue-600 text-xs font-black uppercase tracking-widest">
                  {" "}Skill Development{" "}
                </span>
                <h2 className="text-3xl sm:text-4xl font-black mt-3">
                  Stenography Skill{" "}
                  <span className="gradient-text">
                    {" "}Practice Plan{" "}
                  </span>
                </h2>
                <p className="text-slate-600 leading-8 mt-5">
                  Written examination के बाद skill test के लिए shorthand और transcription की regular practice बहुत महत्वपूर्ण होती है। Course में daily practice routine बनाया जा सकता है।
                </p>
                <div className="space-y-4 mt-8">
                  <div className="bg-white border rounded-2xl p-5 flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                      01
                    </div>
                    <div>
                      <h3 className="font-black">
                        Basic Shorthand
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        Symbols, outlines और basic dictation।
                      </p>
                    </div>
                  </div>
                  <div className="bg-white border rounded-2xl p-5 flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-black">
                      02
                    </div>
                    <div>
                      <h3 className="font-black">
                        Speed Building
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        Gradually speed और accuracy improve करना।
                      </p>
                    </div>
                  </div>
                  <div className="bg-white border rounded-2xl p-5 flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center font-black">
                      03
                    </div>
                    <div>
                      <h3 className="font-black">
                        Transcription
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        Computer-based transcription practice।
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white border rounded-[30px] p-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center">
                    <i data-lucide="graduation-cap" className="w-7 h-7"></i>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-black uppercase">
                      Career Path
                    </p>
                    <h3 className="text-xl font-black">
                      SSC Stenographer
                    </h3>
                  </div>
                </div>
                <div className="mt-8 space-y-3">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <span className="font-bold text-sm">
                      {" "}Written Exam{" "}
                    </span>
                    <span className="text-blue-600 font-black">
                      {" "}CBT{" "}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <span className="font-bold text-sm">
                      {" "}Skill Test{" "}
                    </span>
                    <span className="text-violet-600 font-black">
                      {" "}Stenography{" "}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <span className="font-bold text-sm">
                      {" "}Final Stage{" "}
                    </span>
                    <span className="text-green-600 font-black">
                      {" "}Selection{" "}
                    </span>
                  </div>
                </div>
                <div className="mt-7 p-5 rounded-2xl bg-blue-50">
                  <p className="text-xs text-blue-700 leading-6">
                    Skill test requirements, dictation speed, transcription time और other conditions latest SSC notification के अनुसार verify करें।
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="text-blue-600 text-xs font-black uppercase tracking-widest">
                {" "}Course Features{" "}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black mt-3">
                Everything You Need To{" "}
                <span className="gradient-text">
                  {" "}Prepare Better{" "}
                </span>
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
              <div className="hover-card border rounded-2xl p-6">
                <i data-lucide="video" className="w-7 h-7 text-blue-600"></i>
                <h3 className="font-black mt-5">
                  Video Classes
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Topic-wise learning।
                </p>
              </div>
              <div className="hover-card border rounded-2xl p-6">
                <i data-lucide="file-question" className="w-7 h-7 text-violet-600"></i>
                <h3 className="font-black mt-5">
                  Practice Sets
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Regular question practice।
                </p>
              </div>
              <div className="hover-card border rounded-2xl p-6">
                <i data-lucide="clipboard-check" className="w-7 h-7 text-green-600"></i>
                <h3 className="font-black mt-5">
                  Mock Tests
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Exam-level mock practice।
                </p>
              </div>
              <div className="hover-card border rounded-2xl p-6">
                <i data-lucide="history" className="w-7 h-7 text-orange-600"></i>
                <h3 className="font-black mt-5">
                  PYQ Analysis
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Previous year questions।
                </p>
              </div>
              <div className="hover-card border rounded-2xl p-6">
                <i data-lucide="mic-2" className="w-7 h-7 text-red-600"></i>
                <h3 className="font-black mt-5">
                  Dictation
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Regular dictation practice।
                </p>
              </div>
              <div className="hover-card border rounded-2xl p-6">
                <i data-lucide="keyboard" className="w-7 h-7 text-cyan-600"></i>
                <h3 className="font-black mt-5">
                  Transcription
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Computer transcription practice।
                </p>
              </div>
              <div className="hover-card border rounded-2xl p-6">
                <i data-lucide="timer" className="w-7 h-7 text-purple-600"></i>
                <h3 className="font-black mt-5">
                  Speed Training
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Speed और accuracy training।
                </p>
              </div>
              <div className="hover-card border rounded-2xl p-6">
                <i data-lucide="message-circle" className="w-7 h-7 text-yellow-600"></i>
                <h3 className="font-black mt-5">
                  Doubt Support
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Preparation guidance।
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="fees" className="py-20 bg-slate-950 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="text-blue-400 text-xs font-black uppercase tracking-widest">
                {" "}Course Fee{" "}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black mt-3">
                Choose Your{" "}
                <span className="text-blue-400">
                  {" "}Stenographer Batch{" "}
                </span>
              </h2>
            </div>
            <div className="grid lg:grid-cols-3 gap-6 mt-12">
              <div className="price-card bg-white text-slate-900 rounded-3xl p-7">
                <span className="text-xs font-black uppercase text-blue-600">
                  {" "}Foundation{" "}
                </span>
                <h3 className="text-2xl font-black mt-3">
                  Steno Basic
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Written Exam Preparation
                </p>
                <div className="mt-7">
                  <span className="text-4xl font-black">
                    {" "}₹1,299{" "}
                  </span>
                  {" "}
                  <span className="text-sm line-through text-slate-400">
                    {" "}₹2,499{" "}
                  </span>
                </div>
                <ul className="mt-7 space-y-3 text-sm">
                  <li>
                    ✓ Reasoning
                  </li>
                  <li>
                    ✓ General Awareness
                  </li>
                  <li>
                    ✓ English
                  </li>
                  <li>
                    ✓ Practice Sets
                  </li>
                  <li>
                    ✓ Basic PYQ
                  </li>
                </ul>
                <a href="#admission" className="block text-center mt-8 py-3.5 rounded-xl bg-slate-900 text-white font-black">
                  {" "}Join Basic{" "}
                </a>
              </div>
              <div className="price-card relative bg-blue-600 rounded-3xl p-7 ring-4 ring-blue-400/20">
                <span className="absolute top-5 right-5 px-3 py-1 rounded-full bg-yellow-400 text-yellow-950 text-[10px] font-black">
                  {" "}MOST POPULAR{" "}
                </span>
                {" "}
                <span className="text-xs font-black uppercase text-blue-100">
                  {" "}Complete{" "}
                </span>
                <h3 className="text-2xl font-black mt-3">
                  Steno Complete
                </h3>
                <p className="text-sm text-blue-100 mt-2">
                  Written + Skill Test
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
                    ✓ Reasoning
                  </li>
                  <li>
                    ✓ General Awareness
                  </li>
                  <li>
                    ✓ English
                  </li>
                  <li>
                    ✓ PYQ Practice
                  </li>
                  <li>
                    ✓ Mock Tests
                  </li>
                  <li>
                    ✓ Shorthand Practice
                  </li>
                  <li>
                    ✓ Dictation Practice
                  </li>
                  <li>
                    ✓ Transcription Practice
                  </li>
                </ul>
                <a href="#admission" className="block text-center mt-8 py-3.5 rounded-xl bg-white text-blue-700 font-black">
                  {" "}Join Complete Batch{" "}
                </a>
              </div>
              <div className="price-card bg-white text-slate-900 rounded-3xl p-7">
                <span className="text-xs font-black uppercase text-violet-600">
                  {" "}Ultimate{" "}
                </span>
                <h3 className="text-2xl font-black mt-3">
                  Steno Pro
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Advanced Preparation
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
                    ✓ Everything in Complete
                  </li>
                  <li>
                    ✓ Advanced Mock Tests
                  </li>
                  <li>
                    ✓ Detailed PYQ Analysis
                  </li>
                  <li>
                    ✓ Daily Dictation
                  </li>
                  <li>
                    ✓ Speed Building
                  </li>
                  <li>
                    ✓ Transcription Practice
                  </li>
                  <li>
                    ✓ Revision Classes
                  </li>
                  <li>
                    ✓ Performance Guidance
                  </li>
                </ul>
                <a href="#admission" className="block text-center mt-8 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-black">
                  {" "}Join Pro Batch{" "}
                </a>
              </div>
            </div>
            <p className="text-center text-xs text-slate-500 mt-8">
              *Fees shown are sample/demo pricing. Update with actual Career Optics Computer Academy fees.
            </p>
          </div>
        </section>
        <section id="admission" className="py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="bg-gradient-to-r from-blue-600 to-violet-700 rounded-[30px] p-8 sm:p-12 text-white">
              <div className="grid lg:grid-cols-2 gap-10 items-center">
                <div>
                  <span className="text-xs uppercase tracking-widest font-black text-blue-100">
                    {" "}Admission Open{" "}
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-black mt-3">
                    SSC Stenographer की तैयारी आज से शुरू करें।
                  </h2>
                  <p className="mt-4 text-blue-100 leading-7">
                    Written exam और stenography skill test दोनों की preparation एक ही course में।
                  </p>
                  <div className="flex flex-wrap gap-3 mt-7">
                    <span className="px-4 py-2 rounded-full bg-white/10 text-xs font-bold">
                      {" "}Reasoning{" "}
                    </span>
                    <span className="px-4 py-2 rounded-full bg-white/10 text-xs font-bold">
                      {" "}GK{" "}
                    </span>
                    <span className="px-4 py-2 rounded-full bg-white/10 text-xs font-bold">
                      {" "}English{" "}
                    </span>
                    <span className="px-4 py-2 rounded-full bg-white/10 text-xs font-bold">
                      {" "}Shorthand{" "}
                    </span>
                    <span className="px-4 py-2 rounded-full bg-white/10 text-xs font-bold">
                      {" "}Transcription{" "}
                    </span>
                  </div>
                </div>
                <form data-inline-onsubmit="submitForm(event)" className="bg-white text-slate-900 rounded-3xl p-6">
                  <h3 className="text-xl font-black">
                    SSC Stenographer Admission
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
                        {" "}Select Batch{" "}
                      </option>
                      <option>
                        {" "}Steno Basic - ₹1,299{" "}
                      </option>
                      <option>
                        {" "}Steno Complete - ₹2,499{" "}
                      </option>
                      <option>
                        {" "}Steno Pro - ₹3,499{" "}
                      </option>
                    </select>
                    <select required className="w-full px-4 py-3 rounded-xl border outline-none">
                      <option value="">
                        {" "}Select Mode{" "}
                      </option>
                      <option>
                        {" "}Online{" "}
                      </option>
                      <option>
                        {" "}Offline{" "}
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
