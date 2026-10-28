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

/** cpo.html */
export default function Cpo() {
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
        <section className="relative overflow-hidden bg-slate-950 text-white">
          <div className="absolute inset-0 hero-pattern"></div>
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-xs font-black">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  SSC CPO SI 2026 Preparation
                </span>
                <h2 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-black leading-tight">
                  Become a{" "}
                  <span className="text-blue-400">
                    {" "}Sub-Inspector{" "}
                  </span>
                  <br />
                  with Smart Preparation
                </h2>
                <p className="mt-6 text-slate-300 max-w-xl text-base sm:text-lg leading-8">
                  SSC CPO की तैयारी के लिए Paper-I, Paper-II, Previous Year Questions, Mock Tests और Physical Efficiency तैयारी को एक structured course में सीखें।
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
                      Current Affairs
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
                      SSC CPO Complete Batch
                    </h3>
                    <p className="text-blue-100 text-sm mt-2">
                      Paper-I + Paper-II + Physical
                    </p>
                  </div>
                  <div className="p-7">
                    <p className="text-xs uppercase text-slate-400 font-black">
                      Special Course Fee
                    </p>
                    <div className="flex items-end gap-3 mt-1">
                      <span className="text-5xl font-black">
                        {" "}₹2,999{" "}
                      </span>
                      <span className="text-sm line-through text-slate-400 mb-2">
                        {" "}₹5,999{" "}
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
                        General Knowledge & Awareness
                      </div>
                      <div className="flex gap-3">
                        <i data-lucide="check-circle-2" className="w-5 h-5 text-green-500"></i>
                        Quantitative Aptitude
                      </div>
                      <div className="flex gap-3">
                        <i data-lucide="check-circle-2" className="w-5 h-5 text-green-500"></i>
                        English Comprehension
                      </div>
                      <div className="flex gap-3">
                        <i data-lucide="check-circle-2" className="w-5 h-5 text-green-500"></i>
                        Paper-II English
                      </div>
                      <div className="flex gap-3">
                        <i data-lucide="check-circle-2" className="w-5 h-5 text-green-500"></i>
                        Physical Preparation
                      </div>
                    </div>
                    <a href="#admission" className="mt-7 w-full flex justify-center py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black">
                      Join CPO Batch
                    </a>
                    <p className="text-center text-[10px] text-slate-400 mt-4">
                      Fee shown is sample pricing for this course page.
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
                  {" "}SSC CPO Overview{" "}
                </span>
                <h2 className="text-3xl sm:text-4xl font-black mt-3">
                  SSC CPO SI की{" "}
                  <span className="gradient-text">
                    {" "}Complete Preparation{" "}
                  </span>
                </h2>
                <p className="mt-5 text-slate-600 leading-8">
                  SSC CPO examination Delhi Police और CAPFs में Sub-Inspector पदों के लिए आयोजित किया जाता है। इस course का focus written examination, English preparation, PYQ practice, mock tests और physical readiness पर है।
                </p>
                <div className="mt-8 space-y-5">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <i data-lucide="brain" className="w-5 h-5"></i>
                    </div>
                    <div>
                      <h3 className="font-black">
                        Paper-I Preparation
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        Reasoning, GK, Maths और English की structured तैयारी।
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                      <i data-lucide="languages" className="w-5 h-5"></i>
                    </div>
                    <div>
                      <h3 className="font-black">
                        Paper-II English Preparation
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        English language और comprehension पर focused preparation।
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                      <i data-lucide="person-standing" className="w-5 h-5"></i>
                    </div>
                    <div>
                      <h3 className="font-black">
                        Physical Preparation
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        PET/PST के लिए general fitness और readiness guidance।
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-slate-950 text-white rounded-[30px] p-8 sm:p-10">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center">
                  <i data-lucide="shield-check" className="w-7 h-7"></i>
                </div>
                <h3 className="text-2xl font-black mt-6">
                  SSC CPO Selection Strategy
                </h3>
                <div className="mt-7 space-y-4 text-sm">
                  <div>
                    ✓ Concept Building
                  </div>
                  <div>
                    ✓ Topic-wise Practice
                  </div>
                  <div>
                    ✓ Previous Year Questions
                  </div>
                  <div>
                    ✓ Daily Current Affairs
                  </div>
                  <div>
                    ✓ Full Length Mock Tests
                  </div>
                  <div>
                    ✓ English Improvement
                  </div>
                  <div>
                    ✓ Physical Fitness Guidance
                  </div>
                  <div>
                    ✓ Final Revision Strategy
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
                SSC CPO{" "}
                <span className="gradient-text">
                  {" "}Paper-I & Paper-II{" "}
                </span>
              </h2>
              <p className="max-w-2xl mx-auto text-slate-500 mt-4 text-sm leading-7">
                Exam pattern recruitment notification के अनुसार verify करें। नीचे commonly used structure reference के लिए दिया गया है।
              </p>
            </div>
            <div className="grid lg:grid-cols-2 gap-6 mt-12">
              <div className="bg-white border rounded-3xl overflow-hidden">
                <div className="bg-slate-950 text-white px-6 py-5">
                  <h3 className="font-black text-xl">
                    Paper-I
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Computer Based Examination
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="text-left px-5 py-4">
                          Subject
                        </th>
                        <th className="px-5 py-4">
                          Questions
                        </th>
                        <th className="px-5 py-4">
                          Marks
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="px-5 py-4 font-bold">
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
                        <td className="px-5 py-4 font-bold">
                          General Knowledge & Awareness
                        </td>
                        <td className="text-center">
                          50
                        </td>
                        <td className="text-center">
                          50
                        </td>
                      </tr>
                      <tr className="border-t">
                        <td className="px-5 py-4 font-bold">
                          Quantitative Aptitude
                        </td>
                        <td className="text-center">
                          50
                        </td>
                        <td className="text-center">
                          50
                        </td>
                      </tr>
                      <tr className="border-t">
                        <td className="px-5 py-4 font-bold">
                          English Comprehension
                        </td>
                        <td className="text-center">
                          50
                        </td>
                        <td className="text-center">
                          50
                        </td>
                      </tr>
                      <tr className="border-t bg-blue-50">
                        <td className="px-5 py-4 font-black">
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
              </div>
              <div className="bg-white border rounded-3xl overflow-hidden">
                <div className="bg-blue-600 text-white px-6 py-5">
                  <h3 className="font-black text-xl">
                    Paper-II
                  </h3>
                  <p className="text-xs text-blue-100 mt-1">
                    English Language & Comprehension
                  </p>
                </div>
                <div className="p-7">
                  <div className="flex items-center justify-between py-4 border-b">
                    <span className="text-sm font-bold">
                      {" "}Questions{" "}
                    </span>
                    <span className="font-black">
                      {" "}200{" "}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-4 border-b">
                    <span className="text-sm font-bold">
                      {" "}Maximum Marks{" "}
                    </span>
                    <span className="font-black">
                      {" "}200{" "}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-4 border-b">
                    <span className="text-sm font-bold">
                      {" "}Focus Area{" "}
                    </span>
                    <span className="font-black">
                      {" "}English{" "}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-4">
                    <span className="text-sm font-bold">
                      {" "}Preparation{" "}
                    </span>
                    <span className="font-black text-blue-600">
                      {" "}PYQ + Mock{" "}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-8">
              <div className="bg-white border rounded-2xl p-5">
                <span className="text-blue-600 font-black">
                  {" "}01{" "}
                </span>
                <h3 className="font-black mt-3">
                  Paper-I
                </h3>
                <p className="text-xs text-slate-500 mt-2">
                  Written examination।
                </p>
              </div>
              <div className="bg-white border rounded-2xl p-5">
                <span className="text-blue-600 font-black">
                  {" "}02{" "}
                </span>
                <h3 className="font-black mt-3">
                  PET/PST
                </h3>
                <p className="text-xs text-slate-500 mt-2">
                  Physical stage।
                </p>
              </div>
              <div className="bg-white border rounded-2xl p-5">
                <span className="text-blue-600 font-black">
                  {" "}03{" "}
                </span>
                <h3 className="font-black mt-3">
                  Paper-II
                </h3>
                <p className="text-xs text-slate-500 mt-2">
                  English examination।
                </p>
              </div>
              <div className="bg-white border rounded-2xl p-5">
                <span className="text-blue-600 font-black">
                  {" "}04{" "}
                </span>
                <h3 className="font-black mt-3">
                  Medical
                </h3>
                <p className="text-xs text-slate-500 mt-2">
                  Medical requirements।
                </p>
              </div>
              <div className="bg-white border rounded-2xl p-5">
                <span className="text-blue-600 font-black">
                  {" "}05{" "}
                </span>
                <h3 className="font-black mt-3">
                  Documents
                </h3>
                <p className="text-xs text-slate-500 mt-2">
                  Document verification।
                </p>
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
                SSC CPO{" "}
                <span className="gradient-text">
                  {" "}Subject-Wise Syllabus{" "}
                </span>
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
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
                    • Series
                  </li>
                  <li>
                    • Blood Relations
                  </li>
                  <li>
                    • Direction Test
                  </li>
                  <li>
                    • Ranking
                  </li>
                  <li>
                    • Syllogism
                  </li>
                  <li>
                    • Statement & Conclusion
                  </li>
                  <li>
                    • Venn Diagram
                  </li>
                  <li>
                    • Figure Classification
                  </li>
                  <li>
                    • Mirror Image
                  </li>
                  <li>
                    • Water Image
                  </li>
                  <li>
                    • Embedded Figures
                  </li>
                  <li>
                    • Non-Verbal Reasoning
                  </li>
                  <li>
                    • Logical Reasoning
                  </li>
                </ul>
              </div>
              <div className="hover-card border rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <i data-lucide="globe-2" className="w-6 h-6"></i>
                </div>
                <h3 className="text-lg font-black mt-5">
                  General Knowledge & Awareness
                </h3>
                <ul className="mt-4 space-y-2 text-sm text-slate-500">
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
                    • Government Schemes
                  </li>
                  <li>
                    • Current Affairs
                  </li>
                </ul>
              </div>
              <div className="hover-card border rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                  <i data-lucide="calculator" className="w-6 h-6"></i>
                </div>
                <h3 className="text-lg font-black mt-5">
                  Quantitative Aptitude
                </h3>
                <ul className="mt-4 space-y-2 text-sm text-slate-500">
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
                    • Discount
                  </li>
                  <li>
                    • Simple Interest
                  </li>
                  <li>
                    • Compound Interest
                  </li>
                  <li>
                    • Time & Work
                  </li>
                  <li>
                    • Time & Distance
                  </li>
                  <li>
                    • Partnership
                  </li>
                  <li>
                    • Mixture & Alligation
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
                    • Trigonometry
                  </li>
                  <li>
                    • Data Interpretation
                  </li>
                </ul>
              </div>
              <div className="hover-card border rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                  <i data-lucide="languages" className="w-6 h-6"></i>
                </div>
                <h3 className="text-lg font-black mt-5">
                  English Language
                </h3>
                <ul className="mt-4 space-y-2 text-sm text-slate-500">
                  <li>
                    • Vocabulary
                  </li>
                  <li>
                    • Grammar
                  </li>
                  <li>
                    • Sentence Structure
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
                    • Active & Passive Voice
                  </li>
                  <li>
                    • Direct & Indirect Speech
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
                    • English Usage
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-8 bg-slate-950 text-white rounded-3xl p-7 sm:p-9">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                <div>
                  <span className="text-blue-400 text-xs font-black uppercase">
                    {" "}Paper-II{" "}
                  </span>
                  <h3 className="text-2xl font-black mt-2">
                    English Language & Comprehension
                  </h3>
                </div>
                <div className="px-5 py-3 rounded-xl bg-white/10 text-sm font-bold">
                  200 Questions • 200 Marks
                </div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                <div className="glass rounded-xl p-4">
                  <p className="font-bold">
                    Reading Comprehension
                  </p>
                </div>
                <div className="glass rounded-xl p-4">
                  <p className="font-bold">
                    Vocabulary
                  </p>
                </div>
                <div className="glass rounded-xl p-4">
                  <p className="font-bold">
                    Grammar
                  </p>
                </div>
                <div className="glass rounded-xl p-4">
                  <p className="font-bold">
                    Sentence Usage
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="physical" className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <span className="text-red-600 text-xs font-black uppercase tracking-widest">
                  {" "}Physical Preparation{" "}
                </span>
                <h2 className="text-3xl sm:text-4xl font-black mt-3">
                  CPO Written के साथ{" "}
                  <span className="gradient-text">
                    {" "}Physical तैयारी{" "}
                  </span>
                </h2>
                <p className="text-slate-600 leading-8 mt-5">
                  SSC CPO recruitment में physical stages महत्वपूर्ण हो सकते हैं। इसलिए candidates को written preparation के साथ fitness और physical readiness पर भी ध्यान देना चाहिए।
                </p>
                <div className="grid sm:grid-cols-2 gap-4 mt-8">
                  <div className="bg-white border rounded-2xl p-5">
                    <i data-lucide="footprints" className="w-6 h-6 text-red-600"></i>
                    <h3 className="font-black mt-4">
                      Running Practice
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 leading-6">
                      Running और endurance के लिए structured practice।
                    </p>
                  </div>
                  <div className="bg-white border rounded-2xl p-5">
                    <i data-lucide="dumbbell" className="w-6 h-6 text-orange-600"></i>
                    <h3 className="font-black mt-4">
                      Strength Training
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 leading-6">
                      Basic strength और fitness development।
                    </p>
                  </div>
                  <div className="bg-white border rounded-2xl p-5">
                    <i data-lucide="heart-pulse" className="w-6 h-6 text-green-600"></i>
                    <h3 className="font-black mt-4">
                      Stamina
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 leading-6">
                      Endurance और stamina improvement।
                    </p>
                  </div>
                  <div className="bg-white border rounded-2xl p-5">
                    <i data-lucide="calendar-days" className="w-6 h-6 text-blue-600"></i>
                    <h3 className="font-black mt-4">
                      Daily Routine
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 leading-6">
                      Study + fitness routine planning।
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-slate-950 text-white rounded-[30px] p-8 sm:p-10">
                <div className="w-14 h-14 rounded-2xl bg-red-600 flex items-center justify-center">
                  <i data-lucide="person-standing" className="w-7 h-7"></i>
                </div>
                <h3 className="text-2xl font-black mt-6">
                  Physical Readiness Checklist
                </h3>
                <div className="space-y-4 mt-7 text-sm text-slate-300">
                  <div>
                    ✓ Regular running practice
                  </div>
                  <div>
                    ✓ Warm-up & stretching
                  </div>
                  <div>
                    ✓ Endurance improvement
                  </div>
                  <div>
                    ✓ Strength training
                  </div>
                  <div>
                    ✓ Proper recovery
                  </div>
                  <div>
                    ✓ Consistent fitness routine
                  </div>
                </div>
                <div className="mt-8 p-4 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-xs text-slate-400 leading-6">
                    Physical standards और events candidate की category, gender और latest SSC notification के अनुसार अलग हो सकते हैं। Official notification को final reference मानें।
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
                Complete CPO{" "}
                <span className="gradient-text">
                  {" "}Preparation System{" "}
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
                  Topic-wise structured classes।
                </p>
              </div>
              <div className="hover-card border rounded-2xl p-6">
                <i data-lucide="file-question" className="w-7 h-7 text-violet-600"></i>
                <h3 className="font-black mt-5">
                  Practice Sets
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Regular exam-oriented practice।
                </p>
              </div>
              <div className="hover-card border rounded-2xl p-6">
                <i data-lucide="clipboard-check" className="w-7 h-7 text-green-600"></i>
                <h3 className="font-black mt-5">
                  Mock Tests
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Full-length test practice।
                </p>
              </div>
              <div className="hover-card border rounded-2xl p-6">
                <i data-lucide="history" className="w-7 h-7 text-orange-600"></i>
                <h3 className="font-black mt-5">
                  PYQ Analysis
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Previous year question analysis।
                </p>
              </div>
              <div className="hover-card border rounded-2xl p-6">
                <i data-lucide="newspaper" className="w-7 h-7 text-red-600"></i>
                <h3 className="font-black mt-5">
                  Current Affairs
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Daily important updates।
                </p>
              </div>
              <div className="hover-card border rounded-2xl p-6">
                <i data-lucide="timer" className="w-7 h-7 text-cyan-600"></i>
                <h3 className="font-black mt-5">
                  Speed Training
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Speed और accuracy improvement।
                </p>
              </div>
              <div className="hover-card border rounded-2xl p-6">
                <i data-lucide="person-standing" className="w-7 h-7 text-red-600"></i>
                <h3 className="font-black mt-5">
                  Physical Guidance
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Physical readiness support।
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
                  {" "}CPO Batch{" "}
                </span>
              </h2>
            </div>
            <div className="grid lg:grid-cols-3 gap-6 mt-12">
              <div className="price-card bg-white text-slate-900 rounded-3xl p-7">
                <span className="text-xs font-black uppercase text-blue-600">
                  {" "}Foundation{" "}
                </span>
                <h3 className="text-2xl font-black mt-3">
                  CPO Basic
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Paper-I preparation
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
                    ✓ Reasoning
                  </li>
                  <li>
                    ✓ GK & Awareness
                  </li>
                  <li>
                    ✓ Quantitative Aptitude
                  </li>
                  <li>
                    ✓ English
                  </li>
                  <li>
                    ✓ Practice Sets
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
                  CPO Complete
                </h3>
                <p className="text-sm text-blue-100 mt-2">
                  Paper-I + Paper-II + Physical
                </p>
                <div className="mt-7">
                  <span className="text-5xl font-black">
                    {" "}₹2,999{" "}
                  </span>
                  {" "}
                  <span className="text-sm line-through text-blue-200">
                    {" "}₹5,999{" "}
                  </span>
                </div>
                <ul className="mt-7 space-y-3 text-sm">
                  <li>
                    ✓ Paper-I Complete
                  </li>
                  <li>
                    ✓ Paper-II English
                  </li>
                  <li>
                    ✓ Current Affairs
                  </li>
                  <li>
                    ✓ PYQ Practice
                  </li>
                  <li>
                    ✓ Mock Tests
                  </li>
                  <li>
                    ✓ Physical Guidance
                  </li>
                  <li>
                    ✓ Revision Classes
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
                  CPO Pro
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Advanced preparation
                </p>
                <div className="mt-7">
                  <span className="text-4xl font-black">
                    {" "}₹3,999{" "}
                  </span>
                  {" "}
                  <span className="text-sm line-through text-slate-400">
                    {" "}₹7,499{" "}
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
                    ✓ Extra Practice Sets
                  </li>
                  <li>
                    ✓ Speed Training
                  </li>
                  <li>
                    ✓ English Improvement
                  </li>
                  <li>
                    ✓ Physical Guidance
                  </li>
                  <li>
                    ✓ Performance Analysis
                  </li>
                </ul>
                <a href="#admission" className="block text-center mt-8 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-black">
                  {" "}Join Pro Batch{" "}
                </a>
              </div>
            </div>
            <p className="text-center text-xs text-slate-500 mt-8">
              *Fees shown on this demo page are sample pricing. Update them with Career Optics Computer Centre's actual course fees.
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
                    SSC CPO की तैयारी आज से शुरू करें।
                  </h2>
                  <p className="mt-4 text-blue-100 leading-7">
                    Paper-I, Physical और Paper-II के लिए structured preparation के साथ अपना preparation journey शुरू करें।
                  </p>
                  <div className="flex flex-wrap gap-3 mt-7">
                    <span className="px-4 py-2 rounded-full bg-white/10 text-xs font-bold">
                      {" "}Reasoning{" "}
                    </span>
                    <span className="px-4 py-2 rounded-full bg-white/10 text-xs font-bold">
                      {" "}GK{" "}
                    </span>
                    <span className="px-4 py-2 rounded-full bg-white/10 text-xs font-bold">
                      {" "}Maths{" "}
                    </span>
                    <span className="px-4 py-2 rounded-full bg-white/10 text-xs font-bold">
                      {" "}English{" "}
                    </span>
                    <span className="px-4 py-2 rounded-full bg-white/10 text-xs font-bold">
                      {" "}Physical{" "}
                    </span>
                  </div>
                </div>
                <form data-inline-onsubmit="submitForm(event)" className="bg-white text-slate-900 rounded-3xl p-6">
                  <h3 className="text-xl font-black">
                    SSC CPO Admission Enquiry
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
                        {" "}CPO Basic - ₹1,499{" "}
                      </option>
                      <option>
                        {" "}CPO Complete - ₹2,999{" "}
                      </option>
                      <option>
                        {" "}CPO Pro - ₹3,999{" "}
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
