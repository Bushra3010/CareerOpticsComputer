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

/** banking.html */
export default function Banking() {
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
          <div className="absolute inset-0 hero-grid"></div>
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl"></div>
          <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-violet-600/20 blur-3xl"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-xs font-black">
                  <span className="w-2 h-2 rounded-full bg-green-400"></span>
                  BANKING EXAM COMPLETE PREPARATION
                </div>
                <h2 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-black leading-tight">
                  Crack{" "}
                  <span className="text-blue-400">
                    {" "}Banking Exams{" "}
                  </span>
                  <br />
                  Build Your Banking Career
                </h2>
                <p className="mt-6 text-slate-300 max-w-xl leading-8">
                  SBI, IBPS, RRB और अन्य banking competitive exams की तैयारी के लिए Quantitative Aptitude, Reasoning, English, General Awareness, Computer और Current Affairs की complete exam-oriented preparation।
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
                      Questions
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
                  <a href="#fees" className="flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 font-black">
                    <i data-lucide="indian-rupee" className="w-5 h-5"></i>
                    View Course Fee
                  </a>
                  <a href="#syllabus" className="flex items-center justify-center gap-2 px-7 py-4 rounded-xl glass font-black">
                    <i data-lucide="book-open" className="w-5 h-5"></i>
                    View Syllabus
                  </a>
                </div>
              </div>
              <div className="lg:pl-10">
                <div className="bg-white text-slate-900 rounded-[30px] overflow-hidden shadow-2xl">
                  <div className="bg-gradient-to-br from-blue-600 to-violet-700 text-white p-7">
                    <div className="flex justify-between items-center">
                      <span className="px-3 py-1.5 rounded-full bg-white/15 text-[10px] font-black">
                        {" "}ADMISSION OPEN{" "}
                      </span>
                      <i data-lucide="badge-check" className="w-8 h-8"></i>
                    </div>
                    <h3 className="text-2xl font-black mt-5">
                      Banking Complete Batch
                    </h3>
                    <p className="text-blue-100 text-sm mt-2">
                      SBI + IBPS + RRB Preparation
                    </p>
                  </div>
                  <div className="p-7">
                    <p className="text-xs uppercase font-black text-slate-400">
                      Special Course Fee
                    </p>
                    <div className="flex items-end gap-3">
                      <span className="text-5xl font-black">
                        {" "}₹2,999{" "}
                      </span>
                      <span className="text-sm line-through text-slate-400 mb-2">
                        {" "}₹5,999{" "}
                      </span>
                    </div>
                    <span className="inline-flex mt-3 px-3 py-1 rounded-full bg-green-50 text-green-600 text-xs font-black">
                      50% SPECIAL OFFER
                    </span>
                    <div className="mt-7 space-y-3 text-sm">
                      <div className="flex gap-3">
                        <i data-lucide="check-circle-2" className="w-5 h-5 text-green-500"></i>
                        Quantitative Aptitude
                      </div>
                      <div className="flex gap-3">
                        <i data-lucide="check-circle-2" className="w-5 h-5 text-green-500"></i>
                        Reasoning Ability
                      </div>
                      <div className="flex gap-3">
                        <i data-lucide="check-circle-2" className="w-5 h-5 text-green-500"></i>
                        English Language
                      </div>
                      <div className="flex gap-3">
                        <i data-lucide="check-circle-2" className="w-5 h-5 text-green-500"></i>
                        General Awareness
                      </div>
                      <div className="flex gap-3">
                        <i data-lucide="check-circle-2" className="w-5 h-5 text-green-500"></i>
                        Computer + Current Affairs
                      </div>
                    </div>
                    <a href="#admission" className="mt-7 w-full flex justify-center py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black">
                      Join Banking Batch
                    </a>
                    <p className="text-center text-[10px] text-slate-400 mt-4">
                      Sample/demo fee — update with actual Career Optics Computer Centre fee.
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
                <span className="text-blue-600 text-xs uppercase tracking-widest font-black">
                  {" "}Course Overview{" "}
                </span>
                <h2 className="text-3xl sm:text-4xl font-black mt-3">
                  Complete{" "}
                  <span className="gradient-text">
                    {" "}Banking Exam Preparation{" "}
                  </span>
                </h2>
                <p className="mt-5 text-slate-600 leading-8">
                  यह course banking sector में career बनाने वाले students के लिए designed है। इसमें aptitude, reasoning, English, banking awareness, computer awareness और current affairs पर exam-oriented preparation कराई जाती है।
                </p>
                <div className="mt-8 grid sm:grid-cols-2 gap-4">
                  <div className="border rounded-2xl p-5">
                    <i data-lucide="calculator" className="w-6 h-6 text-blue-600"></i>
                    <h3 className="font-black mt-4">
                      Quantitative Aptitude
                    </h3>
                    <p className="text-xs text-slate-500 mt-2">
                      Speed और accuracy based preparation।
                    </p>
                  </div>
                  <div className="border rounded-2xl p-5">
                    <i data-lucide="brain" className="w-6 h-6 text-violet-600"></i>
                    <h3 className="font-black mt-4">
                      Reasoning Ability
                    </h3>
                    <p className="text-xs text-slate-500 mt-2">
                      Logical और analytical questions।
                    </p>
                  </div>
                  <div className="border rounded-2xl p-5">
                    <i data-lucide="languages" className="w-6 h-6 text-green-600"></i>
                    <h3 className="font-black mt-4">
                      English Language
                    </h3>
                    <p className="text-xs text-slate-500 mt-2">
                      Grammar, vocabulary और comprehension।
                    </p>
                  </div>
                  <div className="border rounded-2xl p-5">
                    <i data-lucide="landmark" className="w-6 h-6 text-orange-600"></i>
                    <h3 className="font-black mt-4">
                      Banking Awareness
                    </h3>
                    <p className="text-xs text-slate-500 mt-2">
                      Banking concepts एवं financial awareness।
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-slate-950 text-white rounded-[30px] p-8 sm:p-10">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center">
                  <i data-lucide="briefcase-business" className="w-7 h-7"></i>
                </div>
                <h3 className="text-2xl font-black mt-6">
                  Why Choose Banking Career?
                </h3>
                <div className="mt-7 space-y-4 text-sm">
                  <div className="flex gap-3">
                    <span className="text-blue-400">
                      ✓
                    </span>
                    Banking sector career opportunities
                  </div>
                  <div className="flex gap-3">
                    <span className="text-blue-400">
                      ✓
                    </span>
                    Multiple recruitment examinations
                  </div>
                  <div className="flex gap-3">
                    <span className="text-blue-400">
                      ✓
                    </span>
                    Structured exam preparation
                  </div>
                  <div className="flex gap-3">
                    <span className="text-blue-400">
                      ✓
                    </span>
                    Regular mock tests
                  </div>
                  <div className="flex gap-3">
                    <span className="text-blue-400">
                      ✓
                    </span>
                    PYQ-based practice
                  </div>
                  <div className="flex gap-3">
                    <span className="text-blue-400">
                      ✓
                    </span>
                    Current affairs preparation
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="exams" className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="text-blue-600 text-xs uppercase tracking-widest font-black">
                {" "}Target Exams{" "}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black mt-3">
                Prepare for Major{" "}
                <span className="gradient-text">
                  {" "}Banking Exams{" "}
                </span>
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
              <div className="card-hover bg-white border rounded-3xl p-6">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <i data-lucide="building-2" className="w-7 h-7"></i>
                </div>
                <h3 className="font-black text-xl mt-5">
                  SBI Exams
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  SBI PO, SBI Clerk एवं संबंधित recruitment preparation.
                </p>
              </div>
              <div className="card-hover bg-white border rounded-3xl p-6">
                <div className="w-14 h-14 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center">
                  <i data-lucide="landmark" className="w-7 h-7"></i>
                </div>
                <h3 className="font-black text-xl mt-5">
                  IBPS Exams
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  IBPS PO, Clerk और अन्य banking recruitment exams.
                </p>
              </div>
              <div className="card-hover bg-white border rounded-3xl p-6">
                <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
                  <i data-lucide="building" className="w-7 h-7"></i>
                </div>
                <h3 className="font-black text-xl mt-5">
                  Regional Rural Banks
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  RRB Officer और Office Assistant preparation.
                </p>
              </div>
              <div className="card-hover bg-white border rounded-3xl p-6">
                <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <i data-lucide="shield-check" className="w-7 h-7"></i>
                </div>
                <h3 className="font-black text-xl mt-5">
                  Other Banking Exams
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Other banking एवं financial recruitment examinations.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="syllabus" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="text-blue-600 text-xs uppercase tracking-widest font-black">
                {" "}Complete Syllabus{" "}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black mt-3">
                Banking{" "}
                <span className="gradient-text">
                  {" "}Subject-Wise Syllabus{" "}
                </span>
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              <div className="card-hover border rounded-3xl p-7">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <i data-lucide="calculator" className="w-7 h-7"></i>
                </div>
                <h3 className="text-xl font-black mt-5">
                  Quantitative Aptitude
                </h3>
                <ul className="mt-5 space-y-2 text-sm text-slate-500">
                  <li>
                    • Number System
                  </li>
                  <li>
                    • Simplification
                  </li>
                  <li>
                    • Approximation
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
                    • Time & Distance
                  </li>
                  <li>
                    • Partnership
                  </li>
                  <li>
                    • Mixture & Alligation
                  </li>
                  <li>
                    • Probability
                  </li>
                  <li>
                    • Permutation & Combination
                  </li>
                  <li>
                    • Data Interpretation
                  </li>
                  <li>
                    • Quadratic Equations
                  </li>
                </ul>
              </div>
              <div className="card-hover border rounded-3xl p-7">
                <div className="w-14 h-14 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center">
                  <i data-lucide="brain" className="w-7 h-7"></i>
                </div>
                <h3 className="text-xl font-black mt-5">
                  Reasoning Ability
                </h3>
                <ul className="mt-5 space-y-2 text-sm text-slate-500">
                  <li>
                    • Inequality
                  </li>
                  <li>
                    • Syllogism
                  </li>
                  <li>
                    • Coding-Decoding
                  </li>
                  <li>
                    • Blood Relations
                  </li>
                  <li>
                    • Direction Test
                  </li>
                  <li>
                    • Alphanumeric Series
                  </li>
                  <li>
                    • Number Series
                  </li>
                  <li>
                    • Seating Arrangement
                  </li>
                  <li>
                    • Puzzles
                  </li>
                  <li>
                    • Input-Output
                  </li>
                  <li>
                    • Data Sufficiency
                  </li>
                  <li>
                    • Logical Reasoning
                  </li>
                  <li>
                    • Statement & Assumption
                  </li>
                  <li>
                    • Statement & Conclusion
                  </li>
                  <li>
                    • Order & Ranking
                  </li>
                </ul>
              </div>
              <div className="card-hover border rounded-3xl p-7">
                <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
                  <i data-lucide="languages" className="w-7 h-7"></i>
                </div>
                <h3 className="text-xl font-black mt-5">
                  English Language
                </h3>
                <ul className="mt-5 space-y-2 text-sm text-slate-500">
                  <li>
                    • Reading Comprehension
                  </li>
                  <li>
                    • Cloze Test
                  </li>
                  <li>
                    • Error Detection
                  </li>
                  <li>
                    • Fill in the Blanks
                  </li>
                  <li>
                    • Sentence Improvement
                  </li>
                  <li>
                    • Para Jumbles
                  </li>
                  <li>
                    • Vocabulary
                  </li>
                  <li>
                    • Synonyms & Antonyms
                  </li>
                  <li>
                    • Idioms & Phrases
                  </li>
                  <li>
                    • Grammar
                  </li>
                  <li>
                    • Active & Passive Voice
                  </li>
                  <li>
                    • Direct & Indirect Speech
                  </li>
                </ul>
              </div>
              <div className="card-hover border rounded-3xl p-7">
                <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <i data-lucide="globe-2" className="w-7 h-7"></i>
                </div>
                <h3 className="text-xl font-black mt-5">
                  General Awareness
                </h3>
                <ul className="mt-5 space-y-2 text-sm text-slate-500">
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
                    • Awards & Honours
                  </li>
                  <li>
                    • Sports
                  </li>
                  <li>
                    • Books & Authors
                  </li>
                  <li>
                    • Important Days
                  </li>
                  <li>
                    • Government Schemes
                  </li>
                </ul>
              </div>
              <div className="card-hover border rounded-3xl p-7">
                <div className="w-14 h-14 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                  <i data-lucide="landmark" className="w-7 h-7"></i>
                </div>
                <h3 className="text-xl font-black mt-5">
                  Banking Awareness
                </h3>
                <ul className="mt-5 space-y-2 text-sm text-slate-500">
                  <li>
                    • Banking Terms
                  </li>
                  <li>
                    • RBI
                  </li>
                  <li>
                    • Monetary Policy
                  </li>
                  <li>
                    • Repo Rate
                  </li>
                  <li>
                    • Reverse Repo Rate
                  </li>
                  <li>
                    • CRR & SLR
                  </li>
                  <li>
                    • Banking Institutions
                  </li>
                  <li>
                    • Financial Markets
                  </li>
                  <li>
                    • Digital Banking
                  </li>
                  <li>
                    • Financial Inclusion
                  </li>
                  <li>
                    • Important Banking Schemes
                  </li>
                </ul>
              </div>
              <div className="card-hover border rounded-3xl p-7">
                <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <i data-lucide="monitor" className="w-7 h-7"></i>
                </div>
                <h3 className="text-xl font-black mt-5">
                  Computer Awareness
                </h3>
                <ul className="mt-5 space-y-2 text-sm text-slate-500">
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
                    • Internet
                  </li>
                  <li>
                    • Networking
                  </li>
                  <li>
                    • MS Office Basics
                  </li>
                  <li>
                    • Cyber Security
                  </li>
                  <li>
                    • Digital Payment
                  </li>
                  <li>
                    • Computer Terminology
                  </li>
                  <li>
                    • Database Basics
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="text-blue-600 text-xs uppercase tracking-widest font-black">
                {" "}Course Features{" "}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black mt-3">
                Everything You Need for{" "}
                <span className="gradient-text">
                  {" "}Banking Preparation{" "}
                </span>
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
              <div className="card-hover bg-white border rounded-2xl p-6">
                <i data-lucide="video" className="w-7 h-7 text-blue-600"></i>
                <h3 className="font-black mt-5">
                  Concept Classes
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Basic से advanced तक structured classes।
                </p>
              </div>
              <div className="card-hover bg-white border rounded-2xl p-6">
                <i data-lucide="zap" className="w-7 h-7 text-yellow-600"></i>
                <h3 className="font-black mt-5">
                  Short Tricks
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Fast calculation और shortcut methods।
                </p>
              </div>
              <div className="card-hover bg-white border rounded-2xl p-6">
                <i data-lucide="history" className="w-7 h-7 text-violet-600"></i>
                <h3 className="font-black mt-5">
                  Previous Year Questions
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Exam-oriented PYQ practice।
                </p>
              </div>
              <div className="card-hover bg-white border rounded-2xl p-6">
                <i data-lucide="clipboard-check" className="w-7 h-7 text-green-600"></i>
                <h3 className="font-black mt-5">
                  Mock Tests
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Regular full-length mock tests।
                </p>
              </div>
              <div className="card-hover bg-white border rounded-2xl p-6">
                <i data-lucide="newspaper" className="w-7 h-7 text-cyan-600"></i>
                <h3 className="font-black mt-5">
                  Daily Current Affairs
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Banking और exam relevant updates।
                </p>
              </div>
              <div className="card-hover bg-white border rounded-2xl p-6">
                <i data-lucide="chart-no-axes-combined" className="w-7 h-7 text-purple-600"></i>
                <h3 className="font-black mt-5">
                  Performance Analysis
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Mock test performance tracking।
                </p>
              </div>
              <div className="card-hover bg-white border rounded-2xl p-6">
                <i data-lucide="message-circle" className="w-7 h-7 text-red-600"></i>
                <h3 className="font-black mt-5">
                  Doubt Support
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Regular doubt-solving support।
                </p>
              </div>
              <div className="card-hover bg-white border rounded-2xl p-6">
                <i data-lucide="calendar-check" className="w-7 h-7 text-blue-600"></i>
                <h3 className="font-black mt-5">
                  Study Plan
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Daily और weekly preparation strategy।
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="fees" className="py-20 bg-slate-950 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="text-blue-400 text-xs uppercase tracking-widest font-black">
                {" "}Course Fee{" "}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black mt-3">
                Choose Your{" "}
                <span className="text-blue-400">
                  {" "}Banking Batch{" "}
                </span>
              </h2>
            </div>
            <div className="grid lg:grid-cols-3 gap-6 mt-12">
              <div className="bg-white text-slate-900 rounded-3xl p-7">
                <span className="text-xs font-black uppercase text-blue-600">
                  {" "}Foundation{" "}
                </span>
                <h3 className="text-2xl font-black mt-3">
                  Banking Basic
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  For beginners
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
                    ✓ Quantitative Aptitude
                  </li>
                  <li>
                    ✓ Reasoning
                  </li>
                  <li>
                    ✓ English
                  </li>
                  <li>
                    ✓ Basic GK
                  </li>
                  <li>
                    ✓ Practice Sets
                  </li>
                </ul>
                <a href="#admission" className="block text-center mt-8 py-3.5 rounded-xl bg-slate-900 text-white font-black">
                  {" "}Join Basic{" "}
                </a>
              </div>
              <div className="relative bg-blue-600 rounded-3xl p-7 ring-4 ring-blue-400/20">
                <span className="absolute top-5 right-5 px-3 py-1 rounded-full bg-yellow-400 text-yellow-950 text-[10px] font-black">
                  {" "}MOST POPULAR{" "}
                </span>
                {" "}
                <span className="text-xs font-black uppercase text-blue-100">
                  {" "}Complete{" "}
                </span>
                <h3 className="text-2xl font-black mt-3">
                  Banking Complete
                </h3>
                <p className="text-sm text-blue-100 mt-2">
                  SBI + IBPS + RRB
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
                    ✓ Quantitative Aptitude
                  </li>
                  <li>
                    ✓ Reasoning Ability
                  </li>
                  <li>
                    ✓ English Language
                  </li>
                  <li>
                    ✓ General Awareness
                  </li>
                  <li>
                    ✓ Banking Awareness
                  </li>
                  <li>
                    ✓ Computer Awareness
                  </li>
                  <li>
                    ✓ Current Affairs
                  </li>
                  <li>
                    ✓ PYQ + Mock Tests
                  </li>
                </ul>
                <a href="#admission" className="block text-center mt-8 py-3.5 rounded-xl bg-white text-blue-700 font-black">
                  {" "}Join Complete{" "}
                </a>
              </div>
              <div className="bg-white text-slate-900 rounded-3xl p-7">
                <span className="text-xs font-black uppercase text-violet-600">
                  {" "}Advanced{" "}
                </span>
                <h3 className="text-2xl font-black mt-3">
                  Banking Pro
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Advanced preparation
                </p>
                <div className="mt-7">
                  <span className="text-4xl font-black">
                    {" "}₹4,499{" "}
                  </span>
                  {" "}
                  <span className="text-sm line-through text-slate-400">
                    {" "}₹8,999{" "}
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
                    ✓ Intensive PYQ Analysis
                  </li>
                  <li>
                    ✓ Advanced DI Practice
                  </li>
                  <li>
                    ✓ Banking Awareness
                  </li>
                  <li>
                    ✓ Current Affairs
                  </li>
                  <li>
                    ✓ Speed Improvement
                  </li>
                  <li>
                    ✓ Exam Strategy
                  </li>
                </ul>
                <a href="#admission" className="block text-center mt-8 py-3.5 rounded-xl bg-violet-600 text-white font-black">
                  {" "}Join Pro{" "}
                </a>
              </div>
            </div>
            <p className="text-center text-xs text-slate-500 mt-8">
              *Fees shown are sample/demo prices. Update them according to your actual Career Optics Computer Centre fee structure.
            </p>
          </div>
        </section>
        <section id="admission" className="py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="bg-gradient-to-r from-blue-600 to-violet-700 rounded-[30px] p-8 sm:p-12 text-white">
              <div className="grid lg:grid-cols-2 gap-10 items-center">
                <div>
                  <span className="text-xs uppercase tracking-widest font-black text-blue-100">
                    {" "}BANKING ADMISSION{" "}
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-black mt-3">
                    Start Your Banking Preparation Today
                  </h2>
                  <p className="mt-5 text-blue-100 leading-7">
                    Career Optics Computer Centre के Banking Preparation Program के साथ अपने competitive exam preparation को structured बनाएं।
                  </p>
                  <div className="mt-7 space-y-3 text-sm">
                    <div>
                      ✓ SBI + IBPS + RRB preparation
                    </div>
                    <div>
                      ✓ Subject-wise classes
                    </div>
                    <div>
                      ✓ PYQ + Practice Sets
                    </div>
                    <div>
                      ✓ Mock Tests
                    </div>
                    <div>
                      ✓ Current Affairs
                    </div>
                  </div>
                </div>
                <form data-inline-onsubmit="submitForm(event)" className="bg-white text-slate-900 rounded-3xl p-6">
                  <h3 className="text-xl font-black">
                    Banking Admission Enquiry
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Fill your details below.
                  </p>
                  <div className="space-y-3 mt-5">
                    <input type="text" required placeholder="Student Name" className="w-full px-4 py-3 rounded-xl border outline-none focus:border-blue-500" />
                    {" "}
                    <input type="tel" required placeholder="Mobile Number" className="w-full px-4 py-3 rounded-xl border outline-none focus:border-blue-500" />
                    <select required className="w-full px-4 py-3 rounded-xl border">
                      <option value="">
                        {" "}Select Target Exam{" "}
                      </option>
                      <option>
                        SBI PO
                      </option>
                      <option>
                        SBI Clerk
                      </option>
                      <option>
                        IBPS PO
                      </option>
                      <option>
                        IBPS Clerk
                      </option>
                      <option>
                        RRB Officer
                      </option>
                      <option>
                        RRB Office Assistant
                      </option>
                      <option>
                        Other Banking Exam
                      </option>
                    </select>
                    <select required className="w-full px-4 py-3 rounded-xl border">
                      <option value="">
                        {" "}Select Batch{" "}
                      </option>
                      <option>
                        {" "}Banking Basic - ₹1,499{" "}
                      </option>
                      <option>
                        {" "}Banking Complete - ₹2,999{" "}
                      </option>
                      <option>
                        {" "}Banking Pro - ₹4,499{" "}
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
