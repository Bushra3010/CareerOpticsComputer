import DivBlock from "../components/DivBlock";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import StyleBlock from "../components/StyleBlock";
import StyleBlock2 from "../components/StyleBlock2";
import WhatsappWidget from "../components/WhatsappWidget";
import css_32f7cc4c from "../styles/32f7cc4c.css?raw";
import css_467e3f5a from "../styles/467e3f5a.css?raw";
import css_84178eed from "../styles/84178eed.css?raw";
import css_bef39a78 from "../styles/bef39a78.css?raw";
import js_0023a4f0 from "../behaviour/0023a4f0.js?raw";
import js_311d1cd6 from "../behaviour/311d1cd6.js?raw";
import js_73893071 from "../behaviour/73893071.js?raw";
import js_8026bb16 from "../behaviour/8026bb16.js?raw";
import js_8f7dc309 from "../behaviour/8f7dc309.js?raw";
import js_places from "../behaviour/place-pickers.js?raw";
import { INDIAN_STATES, DISTRICTS_BY_STATE } from "../../src/data/indianStates";
import { BIHAR_BLOCKS } from "../../src/data/biharBlocks";

/** The lists the place pickers narrow from, handed to the browser script. */
const PLACES_JSON = JSON.stringify({ districts: DISTRICTS_BY_STATE, blocks: { Bihar: BIHAR_BLOCKS } }).replace(/</g, "\\u003c");
import js_ab901942 from "../behaviour/ab901942.js?raw";
import js_c1268ab4 from "../behaviour/c1268ab4.js?raw";
import js_c865a084 from "../behaviour/c865a084.js?raw";
import js_ea05b2d5 from "../behaviour/ea05b2d5.js?raw";

/** franchise.html */
export default function Franchise() {
  return (
    <html lang="en">
      <head>
        <script src="/cms-config.js"></script>
        <script src="/cms.js" defer></script>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>
          Why Join Franchise | Franchise Registration
        </title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href={"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"} rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: css_bef39a78 }} />
      </head>
      <body className="page-bg text-slate-800">
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-20 flex items-center justify-between">
              <a href="#" className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-white flex items-center justify-center font-black shadow-lg">
                  F
                </div>
                <div>
                  <div className="font-black text-xl text-slate-900">
                    FRANCHISE
                  </div>
                  <div className="text-[10px] font-semibold tracking-[.2em] text-slate-500">
                    EDUCATION NETWORK
                  </div>
                </div>
              </a>
              <nav className="hidden md:flex items-center gap-7 text-sm font-semibold">
                <a href="#why-us" className="hover:text-blue-600">
                  {" "}Why Join{" "}
                </a>
                {" "}
                <a href="#benefits" className="hover:text-blue-600">
                  {" "}Benefits{" "}
                </a>
                {" "}
                <a href="#requirements" className="hover:text-blue-600">
                  {" "}Requirements{" "}
                </a>
                {" "}
                <a href="#documents" className="hover:text-blue-600">
                  {" "}Documents{" "}
                </a>
                {" "}
                <a href="#registration" className="hover:text-blue-600">
                  {" "}Apply Now{" "}
                </a>
              </nav>
              <a href="#registration" className="hidden sm:inline-flex bg-slate-900 text-white px-5 py-3 rounded-xl font-bold hover:bg-blue-600 transition">
                {" "}Apply For Franchise →{" "}
              </a>
            </div>
          </div>
        </header>
        <section className="hero-bg grid-bg text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
            <div className="grid lg:grid-cols-2 gap-14 items-center">
              <div>
                <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-sm font-semibold mb-6">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                  Franchise Opportunity Open
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight">
                  Build Your Own{" "}
                  <span className="text-blue-400">
                    {" "}Education Business{" "}
                  </span>
                  {" "}With Us
                </h1>
                <p className="mt-6 text-lg text-slate-300 leading-8 max-w-xl">
                  Start your own computer education and skill development centre with a professional franchise model, digital learning, training support and business guidance.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <a href="#registration" className="bg-white text-slate-900 px-7 py-4 rounded-xl font-black text-center hover:bg-blue-50 transition">
                    {" "}Start Franchise Application →{" "}
                  </a>
                  <a href="#benefits" className="glass px-7 py-4 rounded-xl font-bold text-center hover:bg-white/10">
                    {" "}Explore Benefits{" "}
                  </a>
                </div>
                <div className="mt-9 flex flex-wrap gap-5 text-sm text-slate-300">
                  <span>
                    ✓ Structured Model
                  </span>
                  <span>
                    ✓ Training Support
                  </span>
                  <span>
                    ✓ Digital Learning
                  </span>
                  <span>
                    ✓ Growth Opportunity
                  </span>
                </div>
              </div>
              <div>
                <div className="glass rounded-3xl p-6 sm:p-8 shadow-2xl">
                  <p className="text-slate-400 text-sm">
                    Franchise Partnership
                  </p>
                  <h2 className="text-2xl font-black mt-1">
                    What You Get
                  </h2>
                  <div className="mt-7 space-y-4">
                    <div className="p-4 rounded-2xl bg-white/5 flex gap-4">
                      <div className="text-2xl">
                        🎓
                      </div>
                      <div>
                        <h3 className="font-bold">
                          Professional Education Brand
                        </h3>
                        <p className="text-sm text-slate-400 mt-1">
                          Build a professional local education centre.
                        </p>
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 flex gap-4">
                      <div className="text-2xl">
                        💻
                      </div>
                      <div>
                        <h3 className="font-bold">
                          Digital Learning Ecosystem
                        </h3>
                        <p className="text-sm text-slate-400 mt-1">
                          Technology-focused education environment.
                        </p>
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 flex gap-4">
                      <div className="text-2xl">
                        🤝
                      </div>
                      <div>
                        <h3 className="font-bold">
                          Partner Support
                        </h3>
                        <p className="text-sm text-slate-400 mt-1">
                          Guidance for centre operations and growth.
                        </p>
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 flex gap-4">
                      <div className="text-2xl">
                        📈
                      </div>
                      <div>
                        <h3 className="font-bold">
                          Business Growth
                        </h3>
                        <p className="text-sm text-slate-400 mt-1">
                          Create multiple education opportunities.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="why-us" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <span className="text-blue-600 font-bold text-sm uppercase tracking-widest">
                {" "}Why Join Us{" "}
              </span>
              <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-black">
                More Than a Franchise,{" "}
                <span className="gradient-text">
                  {" "}A Growth Partnership{" "}
                </span>
              </h2>
              <p className="mt-5 text-slate-600 text-lg leading-8">
                Get the ecosystem required to start, manage and grow a modern computer education and skill development centre.
              </p>
            </div>
            <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="card-hover bg-slate-50 border border-slate-200 rounded-3xl p-7">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-2xl">
                  🏫
                </div>
                <h3 className="mt-6 text-xl font-black">
                  Professional Centre Identity
                </h3>
                <p className="mt-3 text-slate-600 leading-7">
                  Create a professional learning centre with a structured franchise identity and operating model.
                </p>
              </div>
              <div className="card-hover bg-slate-50 border border-slate-200 rounded-3xl p-7">
                <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center text-2xl">
                  📚
                </div>
                <h3 className="mt-6 text-xl font-black">
                  Career-Oriented Courses
                </h3>
                <p className="mt-3 text-slate-600 leading-7">
                  Offer computer, digital skills, AI and career-oriented training programs.
                </p>
              </div>
              <div className="card-hover bg-slate-50 border border-slate-200 rounded-3xl p-7">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-2xl">
                  🤝
                </div>
                <h3 className="mt-6 text-xl font-black">
                  Business Support
                </h3>
                <p className="mt-3 text-slate-600 leading-7">
                  Get guidance related to centre operations, student management and growth.
                </p>
              </div>
              <div className="card-hover bg-slate-50 border border-slate-200 rounded-3xl p-7">
                <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center text-2xl">
                  📢
                </div>
                <h3 className="mt-6 text-xl font-black">
                  Marketing Assistance
                </h3>
                <p className="mt-3 text-slate-600 leading-7">
                  Use promotional resources and digital strategies to increase your local student reach.
                </p>
              </div>
              <div className="card-hover bg-slate-50 border border-slate-200 rounded-3xl p-7">
                <div className="w-14 h-14 rounded-2xl bg-pink-100 flex items-center justify-center text-2xl">
                  💻
                </div>
                <h3 className="mt-6 text-xl font-black">
                  Technology Enabled
                </h3>
                <p className="mt-3 text-slate-600 leading-7">
                  Build a modern centre around computers, internet and digital education.
                </p>
              </div>
              <div className="card-hover bg-slate-50 border border-slate-200 rounded-3xl p-7">
                <div className="w-14 h-14 rounded-2xl bg-cyan-100 flex items-center justify-center text-2xl">
                  🚀
                </div>
                <h3 className="mt-6 text-xl font-black">
                  Long-Term Growth
                </h3>
                <p className="mt-3 text-slate-600 leading-7">
                  Develop new opportunities through education, certification and skill development.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="benefits" className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-14 items-center">
              <div>
                <span className="text-blue-600 font-bold text-sm uppercase tracking-widest">
                  {" "}Franchise Benefits{" "}
                </span>
                <h2 className="mt-3 text-3xl sm:text-4xl font-black">
                  Everything You Need To{" "}
                  <span className="gradient-text">
                    {" "}Start & Grow{" "}
                  </span>
                </h2>
                <p className="mt-5 text-slate-600 leading-8">
                  Our model is designed to make centre setup, training and daily operations easier for franchise partners.
                </p>
                <div className="mt-8 space-y-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
                      01
                    </div>
                    <div>
                      <h3 className="font-black">
                        Structured Setup
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">
                        Clear infrastructure and centre setup requirements.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shrink-0">
                      02
                    </div>
                    <div>
                      <h3 className="font-black">
                        Training & Guidance
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">
                        Operational and academic guidance for your team.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                      03
                    </div>
                    <div>
                      <h3 className="font-black">
                        Digital Ecosystem
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">
                        Technology-driven learning environment.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold shrink-0">
                      04
                    </div>
                    <div>
                      <h3 className="font-black">
                        Continuous Growth
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">
                        Build and expand your education centre over time.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm">
                  <div className="text-4xl">
                    🎓
                  </div>
                  <h3 className="mt-6 text-2xl font-black">
                    Career Courses
                  </h3>
                  <p className="mt-2 text-slate-500">
                    Industry-oriented learning opportunities.
                  </p>
                </div>
                <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm">
                  <div className="text-4xl">
                    💻
                  </div>
                  <h3 className="mt-6 text-2xl font-black">
                    Digital Centre
                  </h3>
                  <p className="mt-2 text-slate-500">
                    Modern technology-enabled education.
                  </p>
                </div>
                <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm">
                  <div className="text-4xl">
                    🤝
                  </div>
                  <h3 className="mt-6 text-2xl font-black">
                    Partner Support
                  </h3>
                  <p className="mt-2 text-slate-500">
                    Guidance for franchise partners.
                  </p>
                </div>
                <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm">
                  <div className="text-4xl">
                    🚀
                  </div>
                  <h3 className="mt-6 text-2xl font-black">
                    Growth
                  </h3>
                  <p className="mt-2 text-slate-500">
                    Build your education business.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="requirements" className="py-20 bg-slate-950 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <span className="text-blue-400 font-bold text-sm uppercase tracking-widest">
                {" "}Basic Requirements{" "}
              </span>
              <h2 className="mt-3 text-3xl sm:text-4xl font-black">
                Centre Infrastructure Requirements
              </h2>
              <p className="mt-5 text-slate-400 leading-8">
                Before applying, make sure your centre meets the following basic requirements.
              </p>
            </div>
            <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="glass rounded-2xl p-6">
                <div className="text-3xl">
                  🖥️
                </div>
                <h3 className="mt-5 font-black">
                  6 Computers/Laptops
                </h3>
                <p className="mt-2 text-sm text-slate-400">
                  Minimum 6 working computers or laptops.
                </p>
              </div>
              <div className="glass rounded-2xl p-6">
                <div className="text-3xl">
                  📐
                </div>
                <h3 className="mt-5 font-black">
                  250 Sq.Ft.
                </h3>
                <p className="mt-2 text-sm text-slate-400">
                  Minimum operating area.
                </p>
              </div>
              <div className="glass rounded-2xl p-6">
                <div className="text-3xl">
                  🌐
                </div>
                <h3 className="mt-5 font-black">
                  Internet
                </h3>
                <p className="mt-2 text-sm text-slate-400">
                  Working internet connection.
                </p>
              </div>
              <div className="glass rounded-2xl p-6">
                <div className="text-3xl">
                  🖨️
                </div>
                <h3 className="mt-5 font-black">
                  Printer & Scanner
                </h3>
                <p className="mt-2 text-sm text-slate-400">
                  Printing and scanning facility.
                </p>
              </div>
              <div className="glass rounded-2xl p-6">
                <div className="text-3xl">
                  📝
                </div>
                <h3 className="mt-5 font-black">
                  White & Notice Board
                </h3>
                <p className="mt-2 text-sm text-slate-400">
                  Classroom boards required.
                </p>
              </div>
              <div className="glass rounded-2xl p-6">
                <div className="text-3xl">
                  💧
                </div>
                <h3 className="mt-5 font-black">
                  Drinking Water
                </h3>
                <p className="mt-2 text-sm text-slate-400">
                  Drinking water facility.
                </p>
              </div>
              <div className="glass rounded-2xl p-6">
                <div className="text-3xl">
                  🩹
                </div>
                <h3 className="mt-5 font-black">
                  First Aid Kit
                </h3>
                <p className="mt-2 text-sm text-slate-400">
                  Basic first-aid facility.
                </p>
              </div>
              <div className="glass rounded-2xl p-6">
                <div className="text-3xl">
                  🚻
                </div>
                <h3 className="mt-5 font-black">
                  Washroom
                </h3>
                <p className="mt-2 text-sm text-slate-400">
                  Washroom facility.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="documents" className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="text-blue-600 font-bold text-sm uppercase tracking-widest">
                {" "}Registration Documents{" "}
              </span>
              <h2 className="mt-3 text-3xl sm:text-4xl font-black">
                Keep These Documents Ready
              </h2>
              <p className="mt-4 text-slate-600">
                The following documents will be required during registration.
              </p>
            </div>
            <div className="mt-12 grid md:grid-cols-2 gap-5">
              <div className="border border-slate-200 rounded-2xl p-6 flex gap-5">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-xl shrink-0">
                  📷
                </div>
                <div>
                  <h3 className="font-black">
                    Center Head Photo
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Recent photo of the centre head.
                  </p>
                </div>
              </div>
              <div className="border border-slate-200 rounded-2xl p-6 flex gap-5">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-xl shrink-0">
                  ✍️
                </div>
                <div>
                  <h3 className="font-black">
                    Center Head Signature
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Signature of the centre head.
                  </p>
                </div>
              </div>
              <div className="border border-slate-200 rounded-2xl p-6 flex gap-5">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-xl shrink-0">
                  🪪
                </div>
                <div>
                  <h3 className="font-black">
                    Aadhaar Card
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Front and back side.
                  </p>
                </div>
              </div>
              <div className="border border-slate-200 rounded-2xl p-6 flex gap-5">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-xl shrink-0">
                  🎓
                </div>
                <div>
                  <h3 className="font-black">
                    Educational Qualification
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    DCA, ITI, Graduation, CCC, PGDCA etc.
                  </p>
                </div>
              </div>
              <div className="border border-slate-200 rounded-2xl p-6 flex gap-5">
                <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center text-xl shrink-0">
                  📄
                </div>
                <div>
                  <h3 className="font-black">
                    Registration Certificate
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    MSME, Society, Trust, Local Authority, Pvt. Ltd., LLP etc.
                  </p>
                </div>
              </div>
              <div className="border border-slate-200 rounded-2xl p-6 flex gap-5">
                <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center text-xl shrink-0">
                  🏢
                </div>
                <div>
                  <h3 className="font-black">
                    Institute Photos
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Minimum 4 institute photographs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="registration" className="py-20 bg-slate-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-blue-600 font-bold text-sm uppercase tracking-widest">
                {" "}Franchise Registration{" "}
              </span>
              <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-black">
                Apply For Your{" "}
                <span className="gradient-text">
                  {" "}Franchise{" "}
                </span>
              </h2>
              <p className="mt-5 text-slate-600 leading-7">
                Complete the application form carefully and upload all required documents.
              </p>
            </div>
            <div className="mt-12 bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-950 px-5 sm:px-8 py-7 text-white">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black">
                      Franchise Application Form
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                      Complete all four steps to submit your application.
                    </p>
                  </div>
                  <div className="hidden sm:flex w-12 h-12 rounded-xl bg-white/10 items-center justify-center">
                    📝
                  </div>
                </div>
                <div className="mt-8">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div id="progressBar" className="progress-line h-full bg-blue-500 rounded-full" data-inline-style="width:25%"></div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 mt-3 text-xs sm:text-sm">
                    <div className="text-blue-400 font-bold">
                      1. Personal
                    </div>
                    <div className="text-center text-slate-400">
                      2. Centre
                    </div>
                    <div className="text-center text-slate-400">
                      3. Documents
                    </div>
                    <div className="text-right text-slate-400">
                      4. Declaration
                    </div>
                  </div>
                </div>
              </div>
              <form id="franchiseForm" action="franchise-register.html" method="POST" encType="multipart/form-data" className="p-5 sm:p-8 lg:p-10">
                <div className="step active" id="step1">
                  <div className="mb-8">
                    <span className="text-blue-600 text-sm font-bold">
                      {" "}STEP 01{" "}
                    </span>
                    <h3 className="text-2xl font-black mt-1">
                      Center Head Information
                    </h3>
                    <p className="text-slate-500 mt-2">
                      Enter the basic information of the centre head.
                    </p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="form-label">
                        {" "}Full Name{" "}
                        <span className="text-red-500">
                          *
                        </span>
                        {" "}
                      </label>
                      {" "}
                      <input type="text" name="full_name" className="form-input" placeholder="Enter full name" required />
                    </div>
                    <div>
                      <label className="form-label">
                        {" "}Email Address{" "}
                        <span className="text-red-500">
                          *
                        </span>
                        {" "}
                      </label>
                      {" "}
                      <input type="email" name="email" className="form-input" placeholder="example@email.com" required />
                    </div>
                    <div>
                      <label className="form-label">
                        {" "}Phone Number{" "}
                        <span className="text-red-500">
                          *
                        </span>
                        {" "}
                      </label>
                      {" "}
                      <input type="tel" name="phone" className="form-input" placeholder="Enter mobile number" pattern={"[0-9]{10}"} required />
                    </div>
                    <div>
                      <label className="form-label">
                        {" "}Name of Institute{" "}
                      </label>
                      {" "}
                      <input type="text" name="institute_name" className="form-input" placeholder="Enter institute name" />
                    </div>
                  </div>
                  <div className="mt-8 p-5 rounded-2xl bg-blue-50 border border-blue-100">
                    <div className="flex gap-3">
                      <div>
                        💡
                      </div>
                      <div>
                        <h4 className="font-bold text-blue-900">
                          Application Tip
                        </h4>
                        <p className="text-sm text-blue-800 mt-1">
                          Please enter the same details that will appear on your official franchise documents.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 flex justify-end">
                    <button type="button" data-inline-onclick="nextStep(2)" className="px-7 py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-blue-600 transition">
                      {" "}Continue →{" "}
                    </button>
                  </div>
                </div>
                <div className="step" id="step2">
                  <div className="mb-8">
                    <span className="text-blue-600 text-sm font-bold">
                      {" "}STEP 02{" "}
                    </span>
                    <h3 className="text-2xl font-black mt-1">
                      Centre / Institute Details
                    </h3>
                    <p className="text-slate-500 mt-2">
                      Provide complete information about your proposed centre.
                    </p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="form-label">
                        {" "}Address of Your Centre{" "}
                        <span className="text-red-500">
                          *
                        </span>
                        {" "}
                      </label>
                      {" "}
                      <textarea name="address" rows={3} className="form-input resize-none" placeholder="Enter complete centre address" required />
                    </div>
                    <div>
                      <label className="form-label">
                        {" "}State{" "}
                        <span className="text-red-500">
                          *
                        </span>
                        {" "}
                      </label>
                      {" "}
                      <select name="state" className="form-input" data-place="state" required defaultValue="">
                        <option value="" disabled>Select state</option>
                        {INDIAN_STATES.map((state) => <option key={state} value={state}>{state}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="form-label">
                        {" "}District{" "}
                        <span className="text-red-500">
                          *
                        </span>
                        {" "}
                      </label>
                      {" "}
                      <select name="district" className="form-input" data-place="district" required defaultValue="" disabled>
                        <option value="" disabled>Select state first</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">
                        {" "}Block{" "}
                      </label>
                      {" "}
                      <select name="block" className="form-input" data-place="block" defaultValue="" disabled>
                        <option value="" disabled>Select district first</option>
                      </select>
                      <input type="text" name="block" className="form-input mt-2" data-place="block-other" placeholder="Type the block" hidden disabled />
                    </div>
                    <div>
                      <label className="form-label">
                        {" "}City{" "}
                        <span className="text-red-500">
                          *
                        </span>
                        {" "}
                      </label>
                      {" "}
                      <input type="text" name="city" className="form-input" placeholder="Enter city" required />
                    </div>
                    <div>
                      <label className="form-label">
                        {" "}Pincode{" "}
                        <span className="text-red-500">
                          *
                        </span>
                        {" "}
                      </label>
                      {" "}
                      <input type="text" name="pincode" className="form-input" placeholder="6 digit pincode" pattern={"[0-9]{6}"} required />
                    </div>
                    <div>
                      <label className="form-label">
                        {" "}Total No. of PCs/Laptops{" "}
                      </label>
                      {" "}
                      <input type="number" name="total_pcs" min="6" className="form-input" placeholder="Minimum 6" />
                      <p className="text-xs text-slate-500 mt-2">
                        Minimum requirement: 6 working computers/laptops
                      </p>
                    </div>
                    <div>
                      <label className="form-label">
                        {" "}Total Staffs{" "}
                        <span className="text-red-500">
                          *
                        </span>
                        {" "}
                      </label>
                      {" "}
                      <input type="number" name="staffs" min="1" className="form-input" placeholder="Enter number of staff" required />
                    </div>
                  </div>
                  <div className="mt-8 p-5 rounded-2xl bg-amber-50 border border-amber-200">
                    <div className="flex gap-3">
                      <div>
                        ⚠️
                      </div>
                      <div>
                        <h4 className="font-bold text-amber-900">
                          Infrastructure Requirement
                        </h4>
                        <p className="text-sm text-amber-800 mt-1">
                          Your centre should have at least 6 working computers/laptops and minimum 250 sq.ft. operating area.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 flex justify-between gap-4">
                    <button type="button" data-inline-onclick="nextStep(1)" className="px-6 py-3.5 border border-slate-300 rounded-xl font-bold hover:bg-slate-50">
                      {" "}← Back{" "}
                    </button>
                    <button type="button" data-inline-onclick="nextStep(3)" className="px-7 py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-blue-600">
                      {" "}Continue →{" "}
                    </button>
                  </div>
                </div>
                <div className="step" id="step3">
                  <div className="mb-8">
                    <span className="text-blue-600 text-sm font-bold">
                      {" "}STEP 03{" "}
                    </span>
                    <h3 className="text-2xl font-black mt-1">
                      Documents
                    </h3>
                    <p className="text-slate-500 mt-2">
                      Optional now: our team collects these documents from you during verification.
                    </p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="upload-box rounded-2xl p-5">
                      <label className="form-label">
                        {" "}Center Head Photo{" "}
                        <span className="text-red-500">
                          *
                        </span>
                        {" "}
                      </label>
                      {" "}
                      <input type="file" name="center_head_photo" accept="image/*" data-inline-onchange="showFile(this,'photoName')" className="w-full text-sm" />
                      <div id="photoName" className="file-name">
                        Recent photo required
                      </div>
                    </div>
                    <div className="upload-box rounded-2xl p-5">
                      <label className="form-label">
                        {" "}Center Head Signature{" "}
                        <span className="text-red-500">
                          *
                        </span>
                        {" "}
                      </label>
                      {" "}
                      <input type="file" name="center_head_signature" accept="image/*" data-inline-onchange="showFile(this,'signatureName')" className="w-full text-sm" />
                      <div id="signatureName" className="file-name">
                        Signature image required
                      </div>
                    </div>
                    <div className="upload-box rounded-2xl p-5">
                      <label className="form-label">
                        {" "}Aadhaar Card Front{" "}
                        <span className="text-red-500">
                          *
                        </span>
                        {" "}
                      </label>
                      {" "}
                      <input type="file" name="aadhaar_front" accept="image/*,.pdf" data-inline-onchange="showFile(this,'aadhaarFrontName')" className="w-full text-sm" />
                      <div id="aadhaarFrontName" className="file-name">
                        Front side
                      </div>
                    </div>
                    <div className="upload-box rounded-2xl p-5">
                      <label className="form-label">
                        {" "}Aadhaar Card Back{" "}
                        <span className="text-red-500">
                          *
                        </span>
                        {" "}
                      </label>
                      {" "}
                      <input type="file" name="aadhaar_back" accept="image/*,.pdf" data-inline-onchange="showFile(this,'aadhaarBackName')" className="w-full text-sm" />
                      <div id="aadhaarBackName" className="file-name">
                        Back side
                      </div>
                    </div>
                    <div className="upload-box rounded-2xl p-5">
                      <label className="form-label">
                        {" "}Marks Sheet / Certificate{" "}
                        <span className="text-red-500">
                          *
                        </span>
                        {" "}
                      </label>
                      {" "}
                      <input type="file" name="marksheet" accept="image/*,.pdf" data-inline-onchange="showFile(this,'marksheetName')" className="w-full text-sm" />
                      <div id="marksheetName" className="file-name">
                        DCA / ITI / Graduation / CCC / PGDCA etc.
                      </div>
                    </div>
                    <div className="upload-box rounded-2xl p-5">
                      <label className="form-label">
                        {" "}Registration Certificate{" "}
                        <span className="text-red-500">
                          *
                        </span>
                        {" "}
                      </label>
                      {" "}
                      <input type="file" name="registration_certificate" accept="image/*,.pdf" data-inline-onchange="showFile(this,'registrationName')" className="w-full text-sm" />
                      <div id="registrationName" className="file-name">
                        MSME / Society / Trust / LLP etc.
                      </div>
                    </div>
                    <div className="upload-box rounded-2xl p-5 md:col-span-2">
                      <label className="form-label">
                        {" "}Institute Photos{" "}
                        <span className="text-red-500">
                          *
                        </span>
                        {" "}
                      </label>
                      {" "}
                      <input type="file" name="institute_photos[]" accept="image/*" multiple data-inline-onchange="checkPhotos(this)" className="w-full text-sm" />
                      <div id="photosName" className="file-name">
                        Please select at least 4 institute photos.
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 p-5 rounded-2xl bg-slate-50 border border-slate-200">
                    <h4 className="font-black">
                      📁 Documents Checklist
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-3 mt-4 text-sm text-slate-600">
                      <div>
                        ✓ Center Head Photo
                      </div>
                      <div>
                        ✓ Center Head Signature
                      </div>
                      <div>
                        ✓ Aadhaar Front
                      </div>
                      <div>
                        ✓ Aadhaar Back
                      </div>
                      <div>
                        ✓ Marks Sheet / Certificate
                      </div>
                      <div>
                        ✓ Registration Certificate
                      </div>
                      <div>
                        ✓ Minimum 4 Institute Photos
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 flex justify-between gap-4">
                    <button type="button" data-inline-onclick="nextStep(2)" className="px-6 py-3.5 border border-slate-300 rounded-xl font-bold hover:bg-slate-50">
                      {" "}← Back{" "}
                    </button>
                    <button type="button" data-inline-onclick="validateDocuments()" className="px-7 py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-blue-600">
                      {" "}Continue →{" "}
                    </button>
                  </div>
                </div>
                <div className="step" id="step4">
                  <div className="mb-8">
                    <span className="text-blue-600 text-sm font-bold">
                      {" "}STEP 04{" "}
                    </span>
                    <h3 className="text-2xl font-black mt-1">
                      Declaration & Submission
                    </h3>
                    <p className="text-slate-500 mt-2">
                      Review your information before submitting the application.
                    </p>
                  </div>
                  <div className="space-y-5">
                    <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl">
                      <h4 className="font-black text-blue-900">
                        Before You Submit
                      </h4>
                      <ul className="mt-4 space-y-3 text-sm text-blue-900">
                        <li>
                          ✓ All information provided is correct.
                        </li>
                        <li>
                          ✓ Centre meets the basic infrastructure requirements.
                        </li>
                        <li>
                          ✓ Uploaded documents are clear and readable.
                        </li>
                        <li>
                          ✓ Institute photos are genuine and recent.
                        </li>
                        <li>
                          ✓ You agree to the franchise terms and conditions.
                        </li>
                      </ul>
                    </div>
                    <div className="border border-slate-200 rounded-2xl p-6">
                      <label className="flex gap-4 cursor-pointer">
                        <input type="checkbox" name="declaration" required className="mt-1 w-5 h-5 accent-blue-600" />
                        <span className="text-sm text-slate-700 leading-6">
                          {" "}I hereby declare that all information and documents submitted by me are true and correct to the best of my knowledge. I agree to follow the franchise rules, terms and conditions.{" "}
                        </span>
                      </label>
                    </div>
                    <div className="border border-slate-200 rounded-2xl p-6">
                      <label className="flex gap-4 cursor-pointer">
                        <input type="checkbox" name="terms" required className="mt-1 w-5 h-5 accent-blue-600" />
                        <span className="text-sm text-slate-700 leading-6">
                          {" "}I agree to the{" "}
                          <a href="#" className="text-blue-600 font-bold">
                            {" "}Terms & Conditions{" "}
                          </a>
                          {" "}and{" "}
                          <a href="#" className="text-blue-600 font-bold">
                            {" "}Privacy Policy{" "}
                          </a>
                          .{" "}
                        </span>
                      </label>
                    </div>
                  </div>
                  <div className="mt-8 flex flex-col sm:flex-row justify-between gap-4">
                    <button type="button" data-inline-onclick="nextStep(3)" className="px-6 py-3.5 border border-slate-300 rounded-xl font-bold hover:bg-slate-50">
                      {" "}← Back{" "}
                    </button>
                    <button type="submit" className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-black shadow-lg hover:from-blue-700 hover:to-purple-700 transition">
                      {" "}SUBMIT FRANCHISE APPLICATION →{" "}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </section>
        <section className="py-20 bg-slate-950">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="rounded-[2rem] bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 sm:p-12 lg:p-16 text-center text-white">
              <div className="text-4xl">
                🚀
              </div>
              <h2 className="mt-5 text-3xl sm:text-4xl font-black">
                Ready To Build Your Education Centre?
              </h2>
              <p className="mt-4 text-blue-100 max-w-2xl mx-auto">
                Complete the franchise application and take the first step towards building your own skill development centre.
              </p>
              <a href="#registration" className="inline-flex mt-8 px-8 py-4 bg-white text-slate-900 rounded-xl font-black hover:bg-slate-100 transition">
                Apply For Franchise →
              </a>
            </div>
          </div>
        </section>
        <footer className="bg-slate-950 border-t border-white/10 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div>
                <div className="font-black text-xl">
                  FRANCHISE EDUCATION NETWORK
                </div>
                <p className="text-slate-500 text-sm mt-2">
                  Building opportunities through education and skills.
                </p>
              </div>
              <div className="text-sm text-slate-500">
                © 2026 All Rights Reserved.
              </div>
            </div>
          </div>
        </footer>
        <script dangerouslySetInnerHTML={{ __html: js_8f7dc309 }} />
        <script id="place-data" type="application/json" dangerouslySetInnerHTML={{ __html: PLACES_JSON }} />
        <script dangerouslySetInnerHTML={{ __html: js_places }} />
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>
          Franchise Registration
        </title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script dangerouslySetInnerHTML={{ __html: js_c865a084 }} />
        <style dangerouslySetInnerHTML={{ __html: css_84178eed }} />
        <header className="sticky top-0 z-50 border-b border-slate-200/80 glass">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-[72px] flex items-center justify-between">
              <a href="#" className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-lg shadow-lg">
                  N
                </div>
                <div>
                  <div className="font-black text-xl tracking-tight text-slate-900">
                    NCEB
                  </div>
                  <div className="text-[10px] uppercase tracking-[.18em] text-slate-500 font-bold">
                    Education Network
                  </div>
                </div>
              </a>
              <div className="hidden sm:flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-slate-400">
                    Franchise Support
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    +91 73515 56786
                  </p>
                </div>
                <a href="#registration" className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-indigo-600 transition">
                  {" "}Apply Now{" "}
                </a>
              </div>
            </div>
          </div>
        </header>
        <section className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-[1.15fr_.85fr] gap-10 lg:gap-16 items-center py-12 md:py-20">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs sm:text-sm font-bold">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600"></span>
                  </span>
                  Franchise Registration Open
                </div>
                <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-slate-950">
                  Build Your Own{" "}
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600">
                    {" "}Education Center{" "}
                  </span>
                </h1>
                <p className="mt-6 max-w-2xl text-base sm:text-lg leading-8 text-slate-600">
                  Become a franchise partner and start your own professional computer education and skill development center.
                </p>
                <div className="mt-8 grid grid-cols-3 max-w-xl divide-x divide-slate-200">
                  <div className="pr-5">
                    <div className="text-2xl sm:text-3xl font-black text-slate-900">
                      01
                    </div>
                    <div className="mt-1 text-xs sm:text-sm text-slate-500">
                      Application
                    </div>
                  </div>
                  <div className="px-5">
                    <div className="text-2xl sm:text-3xl font-black text-slate-900">
                      04
                    </div>
                    <div className="mt-1 text-xs sm:text-sm text-slate-500">
                      Simple Steps
                    </div>
                  </div>
                  <div className="pl-5">
                    <div className="text-2xl sm:text-3xl font-black text-slate-900">
                      100%
                    </div>
                    <div className="mt-1 text-xs sm:text-sm text-slate-500">
                      Online Process
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-violet-300/30 blur-2xl"></div>
                <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-indigo-300/30 blur-2xl"></div>
                <div className="relative bg-slate-950 rounded-[28px] p-6 sm:p-8 shadow-2xl text-white animate-float">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[.18em] text-slate-400 font-bold">
                        Why Join Us
                      </p>
                      <h2 className="mt-2 text-2xl font-black">
                        Franchise Benefits
                      </h2>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl">
                      🚀
                    </div>
                  </div>
                  <div className="mt-7 space-y-4">
                    <div className="flex gap-4 p-4 rounded-2xl bg-white/[.06]">
                      <div className="w-10 h-10 rounded-xl bg-emerald-400/15 flex items-center justify-center">
                        ✓
                      </div>
                      <div>
                        <p className="font-bold">
                          Training & Support
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Professional guidance for your center
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4 p-4 rounded-2xl bg-white/[.06]">
                      <div className="w-10 h-10 rounded-xl bg-blue-400/15 flex items-center justify-center">
                        💻
                      </div>
                      <div>
                        <p className="font-bold">
                          Digital Ecosystem
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Modern learning & technology support
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4 p-4 rounded-2xl bg-white/[.06]">
                      <div className="w-10 h-10 rounded-xl bg-purple-400/15 flex items-center justify-center">
                        🎓
                      </div>
                      <div>
                        <p className="font-bold">
                          Course Portfolio
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Career-focused training programs
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        ```html
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-10">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-xs font-black uppercase tracking-wider">
                Franchise Eligibility
              </span>
              <h2 className="mt-4 text-3xl md:text-4xl font-black text-slate-950">
                Minimum Requirements{" "}
                <span className="text-indigo-600">
                  {" "}for Franchise{" "}
                </span>
              </h2>
              <p className="mt-3 text-slate-500 leading-7">
                Please make sure your institute meets the following minimum infrastructure requirements before submitting your application.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="group p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 hover:-translate-y-1 transition duration-300">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl">
                    💻
                  </div>
                  <span className="text-xs font-black text-slate-300">
                    {" "}01{" "}
                  </span>
                </div>
                <h3 className="mt-5 font-black text-lg">
                  Computers / Laptops
                </h3>
                <p className="mt-2 text-sm text-slate-500 leading-6">
                  Minimum{" "}
                  <strong className="text-slate-800">
                    {" "}6 working computers/laptops{" "}
                  </strong>
                  {" "}required.
                </p>
              </div>
              <div className="group p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-violet-50 hover:border-violet-200 hover:-translate-y-1 transition duration-300">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center text-xl">
                    📐
                  </div>
                  <span className="text-xs font-black text-slate-300">
                    {" "}02{" "}
                  </span>
                </div>
                <h3 className="mt-5 font-black text-lg">
                  Operating Area
                </h3>
                <p className="mt-2 text-sm text-slate-500 leading-6">
                  Minimum{" "}
                  <strong className="text-slate-800">
                    {" "}250 sq/ft{" "}
                  </strong>
                  {" "}operating area required.
                </p>
              </div>
              <div className="group p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-blue-50 hover:border-blue-200 hover:-translate-y-1 transition duration-300">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl">
                    🌐
                  </div>
                  <span className="text-xs font-black text-slate-300">
                    {" "}03{" "}
                  </span>
                </div>
                <h3 className="mt-5 font-black text-lg">
                  Internet Connection
                </h3>
                <p className="mt-2 text-sm text-slate-500 leading-6">
                  A reliable{" "}
                  <strong className="text-slate-800">
                    {" "}working internet connection{" "}
                  </strong>
                  {" "}is required.
                </p>
              </div>
              <div className="group p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-cyan-50 hover:border-cyan-200 hover:-translate-y-1 transition duration-300">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center text-xl">
                    🖨️
                  </div>
                  <span className="text-xs font-black text-slate-300">
                    {" "}04{" "}
                  </span>
                </div>
                <h3 className="mt-5 font-black text-lg">
                  Printer & Scanner
                </h3>
                <p className="mt-2 text-sm text-slate-500 leading-6">
                  A functional{" "}
                  <strong className="text-slate-800">
                    {" "}printer and scanner{" "}
                  </strong>
                  {" "}should be available.
                </p>
              </div>
              <div className="group p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 hover:-translate-y-1 transition duration-300">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl">
                    📋
                  </div>
                  <span className="text-xs font-black text-slate-300">
                    {" "}05{" "}
                  </span>
                </div>
                <h3 className="mt-5 font-black text-lg">
                  Boards
                </h3>
                <p className="mt-2 text-sm text-slate-500 leading-6">
                  Both{" "}
                  <strong className="text-slate-800">
                    {" "}white board and notice board{" "}
                  </strong>
                  {" "}are required.
                </p>
              </div>
              <div className="group p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-sky-50 hover:border-sky-200 hover:-translate-y-1 transition duration-300">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center text-xl">
                    💧
                  </div>
                  <span className="text-xs font-black text-slate-300">
                    {" "}06{" "}
                  </span>
                </div>
                <h3 className="mt-5 font-black text-lg">
                  Drinking Water
                </h3>
                <p className="mt-2 text-sm text-slate-500 leading-6">
                  Proper{" "}
                  <strong className="text-slate-800">
                    {" "}drinking water facility{" "}
                  </strong>
                  {" "}should be available.
                </p>
              </div>
              <div className="group p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-rose-50 hover:border-rose-200 hover:-translate-y-1 transition duration-300">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center text-xl">
                    🩹
                  </div>
                  <span className="text-xs font-black text-slate-300">
                    {" "}07{" "}
                  </span>
                </div>
                <h3 className="mt-5 font-black text-lg">
                  First Aid Kit
                </h3>
                <p className="mt-2 text-sm text-slate-500 leading-6">
                  A basic{" "}
                  <strong className="text-slate-800">
                    {" "}first aid kit{" "}
                  </strong>
                  {" "}must be available.
                </p>
              </div>
              <div className="group p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-amber-50 hover:border-amber-200 hover:-translate-y-1 transition duration-300">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-xl">
                    🚻
                  </div>
                  <span className="text-xs font-black text-slate-300">
                    {" "}08{" "}
                  </span>
                </div>
                <h3 className="mt-5 font-black text-lg">
                  Washroom
                </h3>
                <p className="mt-2 text-sm text-slate-500 leading-6">
                  A clean and accessible{" "}
                  <strong className="text-slate-800">
                    {" "}washroom facility{" "}
                  </strong>
                  {" "}is required.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="py-16 bg-slate-950 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-[.8fr_1.2fr] gap-12 items-start">
              <div className="lg:sticky lg:top-28">
                <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 border border-white/10 text-indigo-300 text-xs font-black uppercase tracking-wider">
                  Registration Documents
                </span>
                <h2 className="mt-5 text-3xl md:text-4xl font-black leading-tight">
                  Files Required{" "}
                  <span className="block text-indigo-400">
                    {" "}While Registration{" "}
                  </span>
                </h2>
                <p className="mt-5 text-slate-400 leading-7 max-w-md">
                  Keep all required documents ready before starting your franchise registration. Upload clear and readable copies.
                </p>
                <div className="mt-8 p-5 rounded-2xl bg-white/[.06] border border-white/10">
                  <div className="flex gap-4">
                    <div className="w-11 h-11 shrink-0 rounded-xl bg-indigo-500/15 flex items-center justify-center text-xl">
                      🔒
                    </div>
                    <div>
                      <p className="font-black">
                        Document Safety
                      </p>
                      <p className="mt-1 text-xs text-slate-400 leading-5">
                        Upload only clear and valid documents for verification.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="group p-5 sm:p-6 rounded-2xl bg-white/[.05] border border-white/10 hover:bg-white/[.08] hover:border-indigo-400/30 transition">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-indigo-500/15 text-indigo-300 flex items-center justify-center font-black">
                      01
                    </div>
                    <div>
                      <h3 className="font-black text-lg">
                        Recent Photo of Center Head
                      </h3>
                      <p className="mt-1 text-sm text-slate-400 leading-6">
                        Recent passport-size / profile photograph of the center head.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="group p-5 sm:p-6 rounded-2xl bg-white/[.05] border border-white/10 hover:bg-white/[.08] hover:border-violet-400/30 transition">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-violet-500/15 text-violet-300 flex items-center justify-center font-black">
                      02
                    </div>
                    <div>
                      <h3 className="font-black text-lg">
                        Signature of Center Head
                      </h3>
                      <p className="mt-1 text-sm text-slate-400 leading-6">
                        Clear scanned signature of the center head.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="group p-5 sm:p-6 rounded-2xl bg-white/[.05] border border-white/10 hover:bg-white/[.08] hover:border-orange-400/30 transition">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-orange-500/15 text-orange-300 flex items-center justify-center font-black">
                      03
                    </div>
                    <div>
                      <h3 className="font-black text-lg">
                        Aadhaar Card
                      </h3>
                      <p className="mt-1 text-sm text-slate-400 leading-6">
                        Aadhaar card{" "}
                        <strong className="text-white">
                          {" "}front & back{" "}
                        </strong>
                        {" "}of the center head.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="group p-5 sm:p-6 rounded-2xl bg-white/[.05] border border-white/10 hover:bg-white/[.08] hover:border-emerald-400/30 transition">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-emerald-500/15 text-emerald-300 flex items-center justify-center font-black">
                      04
                    </div>
                    <div>
                      <h3 className="font-black text-lg">
                        Educational Qualification
                      </h3>
                      <p className="mt-1 text-sm text-slate-400 leading-6">
                        DCA, ITI, Graduation Marksheet / Certificate, CCC, PGDCA or equivalent qualification documents.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="group p-5 sm:p-6 rounded-2xl bg-white/[.05] border border-white/10 hover:bg-white/[.08] hover:border-blue-400/30 transition">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-blue-500/15 text-blue-300 flex items-center justify-center font-black">
                      05
                    </div>
                    <div>
                      <h3 className="font-black text-lg">
                        Registration Certificate
                      </h3>
                      <p className="mt-1 text-sm text-slate-400 leading-6">
                        MSME Certificate, Society Certificate, Trust Deed, Local Authority, Private Limited Company, LLP or other applicable registration certificate.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="group p-5 sm:p-6 rounded-2xl bg-white/[.05] border border-white/10 hover:bg-white/[.08] hover:border-pink-400/30 transition">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-pink-500/15 text-pink-300 flex items-center justify-center font-black">
                      06
                    </div>
                    <div>
                      <h3 className="font-black text-lg">
                        Institute Photos
                      </h3>
                      <p className="mt-1 text-sm text-slate-400 leading-6">
                        Upload{" "}
                        <strong className="text-white">
                          {" "}at least 4 institute photos{" "}
                        </strong>
                        {" "}showing the center infrastructure.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 p-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-indigo-100 font-bold">
                        Everything Ready?
                      </p>
                      <h3 className="mt-1 text-xl font-black">
                        Start Your Franchise Application
                      </h3>
                    </div>
                    <a href="#registration" className="shrink-0 px-5 py-3 rounded-xl bg-white text-indigo-700 font-black text-sm text-center hover:bg-slate-100 transition">
                      {" "}Register Now →{" "}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        ```
        <section id="registration" className="pb-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-[28px] border border-slate-200 shadow-premium overflow-hidden">
              <div className="p-5 sm:p-8 border-b border-slate-100">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                  <div>
                    <p className="text-xs uppercase tracking-[.18em] text-indigo-600 font-black">
                      Application Form
                    </p>
                    <h2 className="mt-2 text-2xl sm:text-3xl font-black text-slate-950">
                      Franchise Registration
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Complete your details to submit your application.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-slate-400">
                        Application Progress
                      </p>
                      <p id="progressText" className="font-black text-indigo-600">
                        25%
                      </p>
                    </div>
                    <div className="w-20 sm:w-28 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div id="progressBar" className="h-full w-1/4 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 transition-all duration-300"></div>
                    </div>
                  </div>
                </div>
                <div className="mt-8 flex gap-2 overflow-x-auto hide-scroll">
                  <button data-inline-onclick="showStep(1)" id="stepBtn1" className="step-active min-w-[150px] rounded-2xl p-3 text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-black">
                        01
                      </div>
                      <div>
                        <p className="text-xs font-bold opacity-70">
                          STEP ONE
                        </p>
                        <p className="font-black text-sm">
                          Personal
                        </p>
                      </div>
                    </div>
                  </button>
                  <button data-inline-onclick="showStep(2)" id="stepBtn2" className="min-w-[150px] rounded-2xl p-3 text-left bg-slate-100 text-slate-500">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center font-black">
                        02
                      </div>
                      <div>
                        <p className="text-xs font-bold opacity-70">
                          STEP TWO
                        </p>
                        <p className="font-black text-sm">
                          Center
                        </p>
                      </div>
                    </div>
                  </button>
                  <button data-inline-onclick="showStep(3)" id="stepBtn3" className="min-w-[150px] rounded-2xl p-3 text-left bg-slate-100 text-slate-500">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center font-black">
                        03
                      </div>
                      <div>
                        <p className="text-xs font-bold opacity-70">
                          STEP THREE
                        </p>
                        <p className="font-black text-sm">
                          Documents
                        </p>
                      </div>
                    </div>
                  </button>
                  <button data-inline-onclick="showStep(4)" id="stepBtn4" className="min-w-[150px] rounded-2xl p-3 text-left bg-slate-100 text-slate-500">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center font-black">
                        04
                      </div>
                      <div>
                        <p className="text-xs font-bold opacity-70">
                          STEP FOUR
                        </p>
                        <p className="font-black text-sm">
                          Declaration
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
              <form>
                <div id="step1Content" className="step-content p-5 sm:p-8">
                  <div className="mb-7">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">
                        👤
                      </div>
                      <div>
                        <h3 className="font-black text-xl">
                          Personal Information
                        </h3>
                        <p className="text-sm text-slate-500">
                          Tell us about the franchise owner / center head.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold mb-2">
                        {" "}Full Name{" "}
                        <span className="text-red-500">
                          *
                        </span>
                        {" "}
                      </label>
                      {" "}
                      <input type="text" placeholder="Enter your full name" className="form-input" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">
                        {" "}Email Address{" "}
                        <span className="text-red-500">
                          *
                        </span>
                        {" "}
                      </label>
                      {" "}
                      <input type="email" placeholder="name@example.com" className="form-input" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">
                        {" "}Mobile Number{" "}
                        <span className="text-red-500">
                          *
                        </span>
                        {" "}
                      </label>
                      <div className="flex">
                        <span className="px-4 flex items-center rounded-l-[13px] border border-r-0 border-slate-200 bg-slate-50 text-sm font-bold">
                          +91
                        </span>
                        <input type="tel" maxLength={10} placeholder="Enter mobile number" className="form-input rounded-l-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">
                        {" "}Alternate Contact Number{" "}
                      </label>
                      {" "}
                      <input type="tel" placeholder="Optional" className="form-input" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">
                        {" "}Date of Birth{" "}
                      </label>
                      {" "}
                      <input type="date" className="form-input" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">
                        {" "}Gender{" "}
                      </label>
                      <select className="form-select">
                        <option>
                          Select Gender
                        </option>
                        <option>
                          Male
                        </option>
                        <option>
                          Female
                        </option>
                        <option>
                          Other
                        </option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-8 flex justify-end">
                    <button type="button" data-inline-onclick="showStep(2)" className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-black shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition">
                      {" "}Continue{" "}
                      <span className="ml-2">
                        →
                      </span>
                      {" "}
                    </button>
                  </div>
                </div>
                <div id="step2Content" className="step-content hidden p-5 sm:p-8">
                  <div className="mb-7">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center text-xl">
                        🏫
                      </div>
                      <div>
                        <h3 className="font-black text-xl">
                          Center / Institute Details
                        </h3>
                        <p className="text-sm text-slate-500">
                          Provide the location and infrastructure details.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold mb-2">
                        {" "}Institute / Center Name{" "}
                        <span className="text-red-500">
                          *
                        </span>
                        {" "}
                      </label>
                      {" "}
                      <input type="text" placeholder="Enter institute name" className="form-input" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">
                        {" "}Complete Address{" "}
                        <span className="text-red-500">
                          *
                        </span>
                        {" "}
                      </label>
                      {" "}
                      <textarea rows={4} placeholder="House no., street, landmark, area..." className="form-textarea" />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-bold mb-2">
                          {" "}State{" "}
                          <span className="text-red-500">
                            *
                          </span>
                          {" "}
                        </label>
                        <select className="form-select">
                          <option>
                            Select State
                          </option>
                          <option>
                            Bihar
                          </option>
                          <option>
                            Jharkhand
                          </option>
                          <option>
                            Uttar Pradesh
                          </option>
                          <option>
                            West Bengal
                          </option>
                          <option>
                            Delhi
                          </option>
                          <option>
                            Maharashtra
                          </option>
                          <option>
                            Rajasthan
                          </option>
                          <option>
                            Madhya Pradesh
                          </option>
                          <option>
                            Gujarat
                          </option>
                          <option>
                            Punjab
                          </option>
                          <option>
                            Haryana
                          </option>
                          <option>
                            Odisha
                          </option>
                          <option>
                            Karnataka
                          </option>
                          <option>
                            Tamil Nadu
                          </option>
                          <option>
                            Other
                          </option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-2">
                          {" "}District{" "}
                          <span className="text-red-500">
                            *
                          </span>
                          {" "}
                        </label>
                        {" "}
                        <input type="text" placeholder="Enter district" className="form-input" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-2">
                          {" "}City / Town{" "}
                          <span className="text-red-500">
                            *
                          </span>
                          {" "}
                        </label>
                        {" "}
                        <input type="text" placeholder="Enter city" className="form-input" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-2">
                          {" "}Pincode{" "}
                          <span className="text-red-500">
                            *
                          </span>
                          {" "}
                        </label>
                        {" "}
                        <input type="text" maxLength={6} placeholder="Enter pincode" className="form-input" />
                      </div>
                    </div>
                    <div className="pt-4">
                      <h4 className="font-black text-lg mb-4">
                        Infrastructure
                      </h4>
                      <div className="grid sm:grid-cols-3 gap-4">
                        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                          <div className="text-2xl">
                            💻
                          </div>
                          <p className="font-bold mt-3">
                            Computers
                          </p>
                          <input type="number" placeholder="No. of PCs" className="form-input mt-3" />
                        </div>
                        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                          <div className="text-2xl">
                            👨‍🏫
                          </div>
                          <p className="font-bold mt-3">
                            Staff
                          </p>
                          <input type="number" placeholder="No. of Staff" className="form-input mt-3" />
                        </div>
                        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                          <div className="text-2xl">
                            📐
                          </div>
                          <p className="font-bold mt-3">
                            Area
                          </p>
                          <input type="text" placeholder="Sq. ft." className="form-input mt-3" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 flex justify-between gap-3">
                    <button type="button" data-inline-onclick="showStep(1)" className="px-6 py-3.5 rounded-xl border border-slate-200 font-bold hover:bg-slate-50">
                      {" "}← Back{" "}
                    </button>
                    <button type="button" data-inline-onclick="showStep(3)" className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-black">
                      {" "}Continue →{" "}
                    </button>
                  </div>
                </div>
                <div id="step3Content" className="step-content hidden p-5 sm:p-8">
                  <div className="mb-7">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
                        📄
                      </div>
                      <div>
                        <h3 className="font-black text-xl">
                          Document Upload
                        </h3>
                        <p className="text-sm text-slate-500">
                          Upload clear and readable documents.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <label className="upload-card rounded-2xl p-5 cursor-pointer block">
                      {" "}
                      <input type="file" className="hidden" />
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-xl">
                          📷
                        </div>
                        <div className="flex-1">
                          <p className="font-black">
                            Center Head Photo
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            JPG, JPEG or PNG
                          </p>
                          <p className="text-xs text-indigo-600 font-bold mt-3">
                            Click to upload
                          </p>
                        </div>
                      </div>
                    </label>
                    <label className="upload-card rounded-2xl p-5 cursor-pointer block">
                      {" "}
                      <input type="file" className="hidden" />
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center text-xl">
                          ✍️
                        </div>
                        <div className="flex-1">
                          <p className="font-black">
                            Signature
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            JPG, JPEG or PNG
                          </p>
                          <p className="text-xs text-indigo-600 font-bold mt-3">
                            Click to upload
                          </p>
                        </div>
                      </div>
                    </label>
                    <label className="upload-card rounded-2xl p-5 cursor-pointer block">
                      {" "}
                      <input type="file" className="hidden" />
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-xl">
                          🪪
                        </div>
                        <div className="flex-1">
                          <p className="font-black">
                            Aadhaar Card
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            Front & Back
                          </p>
                          <p className="text-xs text-indigo-600 font-bold mt-3">
                            Click to upload
                          </p>
                        </div>
                      </div>
                    </label>
                    <label className="upload-card rounded-2xl p-5 cursor-pointer block">
                      {" "}
                      <input type="file" className="hidden" />
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-xl">
                          🎓
                        </div>
                        <div className="flex-1">
                          <p className="font-black">
                            Qualification / Marksheet
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            PDF, JPG or PNG
                          </p>
                          <p className="text-xs text-indigo-600 font-bold mt-3">
                            Click to upload
                          </p>
                        </div>
                      </div>
                    </label>
                    <label className="upload-card rounded-2xl p-5 cursor-pointer block">
                      {" "}
                      <input type="file" className="hidden" />
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center text-xl">
                          📜
                        </div>
                        <div className="flex-1">
                          <p className="font-black">
                            Registration Certificate
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            If applicable
                          </p>
                          <p className="text-xs text-indigo-600 font-bold mt-3">
                            Click to upload
                          </p>
                        </div>
                      </div>
                    </label>
                    <label className="upload-card rounded-2xl p-5 cursor-pointer block">
                      {" "}
                      <input type="file" multiple className="hidden" />
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center text-xl">
                          🏢
                        </div>
                        <div className="flex-1">
                          <p className="font-black">
                            Institute Photos
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            Upload 4 or more photos
                          </p>
                          <p className="text-xs text-indigo-600 font-bold mt-3">
                            Click to upload
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>
                  <div className="mt-6 p-4 rounded-2xl bg-amber-50 border border-amber-100 flex gap-3">
                    <div className="text-lg">
                      💡
                    </div>
                    <p className="text-xs sm:text-sm text-amber-800 leading-6">
                      Please upload clear documents. Blurred, cropped or unreadable documents may delay application verification.
                    </p>
                  </div>
                  <div className="mt-8 flex justify-between gap-3">
                    <button type="button" data-inline-onclick="showStep(2)" className="px-6 py-3.5 rounded-xl border border-slate-200 font-bold hover:bg-slate-50">
                      {" "}← Back{" "}
                    </button>
                    <button type="button" data-inline-onclick="showStep(4)" className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-black">
                      {" "}Continue →{" "}
                    </button>
                  </div>
                </div>
                <div id="step4Content" className="step-content hidden p-5 sm:p-8">
                  <div className="max-w-2xl mx-auto text-center">
                    <div className="w-20 h-20 mx-auto rounded-[24px] bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center text-4xl">
                      🎉
                    </div>
                    <h3 className="mt-6 text-2xl sm:text-3xl font-black text-slate-950">
                      Almost Done!
                    </h3>
                    <p className="mt-3 text-slate-500 leading-7">
                      Review your information and confirm the declaration before submitting your franchise application.
                    </p>
                  </div>
                  <div className="mt-8 grid sm:grid-cols-3 gap-4">
                    <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5">
                      <div className="text-xl">
                        👤
                      </div>
                      <p className="mt-3 text-xs text-slate-400">
                        PERSONAL
                      </p>
                      <p className="font-black mt-1">
                        Applicant Details
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5">
                      <div className="text-xl">
                        🏫
                      </div>
                      <p className="mt-3 text-xs text-slate-400">
                        CENTER
                      </p>
                      <p className="font-black mt-1">
                        Institute Details
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5">
                      <div className="text-xl">
                        📄
                      </div>
                      <p className="mt-3 text-xs text-slate-400">
                        DOCUMENTS
                      </p>
                      <p className="font-black mt-1">
                        Uploaded Documents
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 p-5 sm:p-6 rounded-2xl border border-indigo-100 bg-indigo-50/60">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" className="mt-1 w-5 h-5 rounded border-slate-300" />
                      <span className="text-sm text-slate-600 leading-6">
                        {" "}I hereby declare that all information provided by me in this application is true and correct to the best of my knowledge. I agree to the organization's franchise terms, verification process and policies.{" "}
                      </span>
                    </label>
                  </div>
                  <div className="mt-8 flex flex-col-reverse sm:flex-row justify-between gap-3">
                    <button type="button" data-inline-onclick="showStep(3)" className="px-6 py-3.5 rounded-xl border border-slate-200 font-bold hover:bg-slate-50">
                      {" "}← Back{" "}
                    </button>
                    <button type="submit" className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white font-black shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5 transition">
                      {" "}Submit Franchise Application{" "}
                      <span className="ml-2">
                        ✓
                      </span>
                      {" "}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </section>
        <section className="pb-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                  🔒
                </div>
                <div>
                  <p className="font-black text-sm">
                    Secure Application
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Your information is protected
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center">
                  ⚡
                </div>
                <div>
                  <p className="font-black text-sm">
                    Easy Process
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Simple online registration
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center">
                  📞
                </div>
                <div>
                  <p className="font-black text-sm">
                    Dedicated Support
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Assistance during onboarding
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <footer className="bg-slate-950 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-black">
                    N
                  </div>
                  <div className="font-black text-xl">
                    NCEB
                  </div>
                </div>
                <p className="text-sm text-slate-400 mt-3">
                  Education & Skill Development Network
                </p>
              </div>
              <div className="text-sm text-slate-400">
                Franchise Support:{" "}
                <span className="text-white font-bold">
                  {" "}+91 73515 56786{" "}
                </span>
              </div>
            </div>
            <div className="border-t border-slate-800 py-6 text-xs text-slate-500">
              © 2026 NCEB. All rights reserved.
            </div>
          </div>
        </footer>
        <script dangerouslySetInnerHTML={{ __html: js_ab901942 }} />
        ```
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
        <SiteHeader />
        <script dangerouslySetInnerHTML={{ __html: js_73893071 }} />
        <StyleBlock />
        <script src="https://cdn.tailwindcss.com"></script>
        <script dangerouslySetInnerHTML={{ __html: js_311d1cd6 }} />
        <style dangerouslySetInnerHTML={{ __html: css_467e3f5a }} />
        <section className="relative overflow-hidden bg-slate-950 text-white">
          <div className="absolute inset-0 hero-grid opacity-40"></div>
          <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-indigo-600/30 blur-3xl"></div>
          <div className="absolute top-20 right-0 h-96 w-96 rounded-full bg-purple-600/20 blur-3xl"></div>
          <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_.85fr]">
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                  Franchise Opportunity
                </div>
                <h1 className="max-w-4xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                  Build Your Own{" "}
                  <span className="gradient-text">
                    AI & Digital Skills
                  </span>
                  {" "}Training Centre
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                  Become an Career Optics Computer Centre Franchise Partner and bring future-ready AI, technology, digital marketing and career-focused courses to students in your city.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a href="#franchise-form" className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500 hover:-translate-y-0.5">
                    Apply for Franchise
                    <span className="ml-2">
                      →
                    </span>
                  </a>
                  <a href="#models" className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 font-bold text-white transition hover:bg-white/10">
                    Explore Models
                  </a>
                </div>
                <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-2xl font-black">
                      AI
                    </div>
                    <div className="mt-1 text-xs text-slate-400">
                      Future Skills
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-2xl font-black">
                      15+
                    </div>
                    <div className="mt-1 text-xs text-slate-400">
                      Course Areas
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-2xl font-black">
                      360°
                    </div>
                    <div className="mt-1 text-xs text-slate-400">
                      Partner Support
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-2xl font-black">
                      PAN
                    </div>
                    <div className="mt-1 text-xs text-slate-400">
                      India Opportunity
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="rounded-3xl border border-white/10 bg-white/10 p-2 shadow-2xl backdrop-blur-xl">
                  <div className="rounded-2xl bg-white p-7 text-slate-900">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-indigo-600">
                          Franchise Partner
                        </p>
                        <h2 className="mt-1 text-2xl font-black">
                          Career Optics Computer Centre
                        </h2>
                      </div>
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-2xl">
                        🎓
                      </div>
                    </div>
                    <div className="my-6 h-px bg-slate-100"></div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                          🚀
                        </div>
                        <div>
                          <p className="font-bold">
                            Launch Support
                          </p>
                          <p className="text-sm text-slate-500">
                            Centre setup guidance
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
                          📚
                        </div>
                        <div>
                          <p className="font-bold">
                            Course Portfolio
                          </p>
                          <p className="text-sm text-slate-500">
                            AI + Digital + Career courses
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50">
                          📣
                        </div>
                        <div>
                          <p className="font-bold">
                            Marketing Support
                          </p>
                          <p className="text-sm text-slate-500">
                            Digital & local promotion
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                          💻
                        </div>
                        <div>
                          <p className="font-bold">
                            Technology
                          </p>
                          <p className="text-sm text-slate-500">
                            LMS / CRM / digital tools
                          </p>
                        </div>
                      </div>
                    </div>
                    <a href="#franchise-form" className="mt-7 block rounded-xl bg-slate-950 px-5 py-3.5 text-center font-bold text-white transition hover:bg-indigo-600">
                      {" "}Become a Partner →{" "}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className="text-sm font-bold uppercase tracking-widest text-indigo-600">
                {" "}Why Career Optics Computer Centre{" "}
              </span>
              <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
                More Than a Franchise.{" "}
                <span className="gradient-text">
                  A Complete Education Business Ecosystem.
                </span>
              </h2>
              <p className="mt-4 text-slate-600">
                Get the framework, courses, technology and support required to build a modern skill development centre.
              </p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-soft transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-premium">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-2xl transition group-hover:scale-110">
                  🎯
                </div>
                <h3 className="mt-5 text-xl font-black text-slate-900">
                  Future-Ready Courses
                </h3>
                <p className="mt-3 leading-7 text-slate-600">
                  Offer AI, automation, web development, digital marketing and other high-demand skill programs.
                </p>
              </div>
              <div className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-soft transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-premium">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-2xl transition group-hover:scale-110">
                  🏷️
                </div>
                <h3 className="mt-5 text-xl font-black text-slate-900">
                  Brand Support
                </h3>
                <p className="mt-3 leading-7 text-slate-600">
                  Use structured branding, course positioning and promotional material for your centre.
                </p>
              </div>
              <div className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-soft transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-premium">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-2xl transition group-hover:scale-110">
                  📚
                </div>
                <h3 className="mt-5 text-xl font-black text-slate-900">
                  Curriculum Support
                </h3>
                <p className="mt-3 leading-7 text-slate-600">
                  Access structured course modules, learning roadmaps and practical project-based training.
                </p>
              </div>
              <div className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-soft transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-premium">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-2xl transition group-hover:scale-110">
                  👨‍🏫
                </div>
                <h3 className="mt-5 text-xl font-black text-slate-900">
                  Faculty Training
                </h3>
                <p className="mt-3 leading-7 text-slate-600">
                  Get guidance for trainer onboarding, course delivery and academic processes.
                </p>
              </div>
              <div className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-soft transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-premium">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-2xl transition group-hover:scale-110">
                  📣
                </div>
                <h3 className="mt-5 text-xl font-black text-slate-900">
                  Marketing Guidance
                </h3>
                <p className="mt-3 leading-7 text-slate-600">
                  Build local visibility through social media, campaigns, admission funnels and promotional activities.
                </p>
              </div>
              <div className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-soft transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-premium">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-2xl transition group-hover:scale-110">
                  💻
                </div>
                <h3 className="mt-5 text-xl font-black text-slate-900">
                  Digital Ecosystem
                </h3>
                <p className="mt-3 leading-7 text-slate-600">
                  Use technology-driven systems for admissions, student management and course operations.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="bg-slate-50 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <span className="text-sm font-bold uppercase tracking-widest text-indigo-600">
                  {" "}Business Opportunity{" "}
                </span>
                <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
                  Build a Modern{" "}
                  <span className="gradient-text">
                    Skill Training Business
                  </span>
                </h2>
                <p className="mt-5 leading-8 text-slate-600">
                  Career Optics Computer Centre can help you position your local centre around practical, career-oriented digital skills. Choose the programs that match your local student demand.
                </p>
                <div className="mt-8 space-y-4">
                  <div className="flex gap-4 rounded-2xl bg-white p-5 shadow-sm">
                    <span className="text-2xl">
                      ✓
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-900">
                        Multiple Course Categories
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        Generate admissions across AI, IT, digital marketing, accounting and creative programs.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 rounded-2xl bg-white p-5 shadow-sm">
                    <span className="text-2xl">
                      ✓
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-900">
                        Local + Digital Admissions
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        Combine local counselling with digital lead-generation and online enquiry campaigns.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 rounded-2xl bg-white p-5 shadow-sm">
                    <span className="text-2xl">
                      ✓
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-900">
                        Scalable Centre Model
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        Start with selected programs and expand your course portfolio as demand grows.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-2xl">
                <p className="text-sm font-bold uppercase tracking-widest text-indigo-400">
                  Revenue Channels
                </p>
                <h3 className="mt-3 text-3xl font-black">
                  Multiple Ways to Grow
                </h3>
                <div className="mt-8 space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold">
                        Course Admissions
                      </span>
                      <span>
                        🎓
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">
                      Short-term and long-term skill programs.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold">
                        Workshops
                      </span>
                      <span>
                        🧑‍💻
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">
                      AI awareness, career and technology workshops.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold">
                        Corporate Training
                      </span>
                      <span>
                        🏢
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">
                      Digital skills and AI productivity programs.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold">
                        Bootcamps
                      </span>
                      <span>
                        ⚡
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">
                      Intensive project-based learning programs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="text-sm font-bold uppercase tracking-widest text-indigo-600">
                {" "}Course Portfolio{" "}
              </span>
              <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
                Courses You Can Offer
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-slate-600">
                Build a diversified course portfolio based on your city's student and employment demand.
              </p>
            </div>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:bg-white hover:shadow-soft">
                <div className="text-3xl">
                  🤖
                </div>
                <h3 className="mt-4 font-black text-slate-900">
                  AI Foundation Courses
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  AI basics, ChatGPT, Gemini and productivity
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:bg-white hover:shadow-soft">
                <div className="text-3xl">
                  🛠️
                </div>
                <h3 className="mt-4 font-black text-slate-900">
                  AI Tools & Automation
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  AI tools, workflows and automation
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:bg-white hover:shadow-soft">
                <div className="text-3xl">
                  💼
                </div>
                <h3 className="mt-4 font-black text-slate-900">
                  AI Career Programs
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  AI Full Stack, AI Web & AI Digital Marketing
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:bg-white hover:shadow-soft">
                <div className="text-3xl">
                  💬
                </div>
                <h3 className="mt-4 font-black text-slate-900">
                  ChatGPT Mastery
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Prompt engineering and professional AI use
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:bg-white hover:shadow-soft">
                <div className="text-3xl">
                  🌐
                </div>
                <h3 className="mt-4 font-black text-slate-900">
                  Web Development
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  HTML, CSS, JavaScript, PHP and MySQL
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:bg-white hover:shadow-soft">
                <div className="text-3xl">
                  ⚛️
                </div>
                <h3 className="mt-4 font-black text-slate-900">
                  AI Full Stack Developer
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  React, Node.js, PHP, MySQL & MongoDB
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:bg-white hover:shadow-soft">
                <div className="text-3xl">
                  📈
                </div>
                <h3 className="mt-4 font-black text-slate-900">
                  Digital Marketing
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  SEO, social media, ads and AI marketing
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:bg-white hover:shadow-soft">
                <div className="text-3xl">
                  🧾
                </div>
                <h3 className="mt-4 font-black text-slate-900">
                  Accounting & Taxation
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  TallyPrime, GST, ITR and accounting
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:bg-white hover:shadow-soft">
                <div className="text-3xl">
                  🎨
                </div>
                <h3 className="mt-4 font-black text-slate-900">
                  Graphic Designing
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Photoshop, Illustrator and AI design
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:bg-white hover:shadow-soft">
                <div className="text-3xl">
                  🏠
                </div>
                <h3 className="mt-4 font-black text-slate-900">
                  Interior Designing
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Interior design tools and practical projects
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:bg-white hover:shadow-soft">
                <div className="text-3xl">
                  🏗️
                </div>
                <h3 className="mt-4 font-black text-slate-900">
                  Architecture Designing
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  CAD, architecture and visualization
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:bg-white hover:shadow-soft">
                <div className="text-3xl">
                  ⚙️
                </div>
                <h3 className="mt-4 font-black text-slate-900">
                  AI Agents & Automation
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Agents, APIs, workflows and automation
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="models" className="bg-slate-50 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className="text-sm font-bold uppercase tracking-widest text-indigo-600">
                {" "}Partnership Models{" "}
              </span>
              <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
                Choose Your Franchise Model
              </h2>
              <p className="mt-4 text-slate-600">
                Select the centre format according to your infrastructure, investment capacity and local market.
              </p>
            </div>
            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-soft">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-xl">
                    🌱
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                    {" "}STARTER{" "}
                  </span>
                </div>
                <h3 className="mt-6 text-2xl font-black">
                  Basic Training Centre
                </h3>
                <p className="mt-3 text-slate-600">
                  Suitable for small towns, existing computer centres and first-time education entrepreneurs.
                </p>
                <div className="my-6 h-px bg-slate-100"></div>
                <ul className="space-y-3 text-sm">
                  <li>
                    ✓ Selected course portfolio
                  </li>
                  <li>
                    ✓ Branding guidance
                  </li>
                  <li>
                    ✓ Course material support
                  </li>
                  <li>
                    ✓ Admission guidance
                  </li>
                  <li>
                    ✓ Digital marketing guidance
                  </li>
                </ul>
                <div className="mt-7 rounded-xl bg-indigo-50 p-4">
                  <p className="text-xs font-bold uppercase text-indigo-600">
                    Investment
                  </p>
                  <p className="mt-1 text-2xl font-black text-slate-900">
                    Customize
                  </p>
                  <p className="text-xs text-slate-500">
                    Based on location & setup
                  </p>
                </div>
              </div>
              <div className="relative rounded-3xl border-2 border-indigo-500 bg-white p-7 shadow-premium">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-black text-white">
                  MOST POPULAR
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-xl text-white">
                    🚀
                  </div>
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">
                    {" "}STANDARD{" "}
                  </span>
                </div>
                <h3 className="mt-6 text-2xl font-black">
                  Standard Skill Centre
                </h3>
                <p className="mt-3 text-slate-600">
                  Designed for entrepreneurs who want a broader AI, technology and career-course portfolio.
                </p>
                <div className="my-6 h-px bg-slate-100"></div>
                <ul className="space-y-3 text-sm">
                  <li>
                    ✓ Expanded course portfolio
                  </li>
                  <li>
                    ✓ Centre branding support
                  </li>
                  <li>
                    ✓ Faculty training guidance
                  </li>
                  <li>
                    ✓ LMS / digital systems
                  </li>
                  <li>
                    ✓ Marketing & admission support
                  </li>
                  <li>
                    ✓ Project-based course ecosystem
                  </li>
                </ul>
                <div className="mt-7 rounded-xl bg-indigo-600 p-4 text-white">
                  <p className="text-xs font-bold uppercase text-indigo-200">
                    Investment
                  </p>
                  <p className="mt-1 text-2xl font-black">
                    Customize
                  </p>
                  <p className="text-xs text-indigo-200">
                    Based on centre size & facilities
                  </p>
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-950 p-7 text-white shadow-soft">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-xl">
                    💎
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-slate-300">
                    {" "}PREMIUM{" "}
                  </span>
                </div>
                <h3 className="mt-6 text-2xl font-black">
                  Premium AI Skill Centre
                </h3>
                <p className="mt-3 text-slate-300">
                  A premium format for larger markets with advanced AI, full-stack and automation programs.
                </p>
                <div className="my-6 h-px bg-white/10"></div>
                <ul className="space-y-3 text-sm text-slate-300">
                  <li>
                    ✓ Complete AI course portfolio
                  </li>
                  <li>
                    ✓ Advanced technology programs
                  </li>
                  <li>
                    ✓ Full-stack development courses
                  </li>
                  <li>
                    ✓ AI agents & automation
                  </li>
                  <li>
                    ✓ Advanced digital systems
                  </li>
                  <li>
                    ✓ Growth & marketing support
                  </li>
                </ul>
                <div className="mt-7 rounded-xl bg-white/10 p-4">
                  <p className="text-xs font-bold uppercase text-indigo-300">
                    Investment
                  </p>
                  <p className="mt-1 text-2xl font-black">
                    Customize
                  </p>
                  <p className="text-xs text-slate-400">
                    According to location & infrastructure
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2">
              <div>
                <span className="text-sm font-bold uppercase tracking-widest text-indigo-600">
                  {" "}Centre Requirements{" "}
                </span>
                <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
                  Setup Your{" "}
                  <span className="gradient-text">
                    Training Centre
                  </span>
                </h2>
                <p className="mt-5 leading-8 text-slate-600">
                  Infrastructure can be planned according to the selected franchise model and local market.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-5">
                  <div className="text-2xl">
                    📍
                  </div>
                  <h3 className="mt-3 font-black">
                    Prime Location
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Accessible location near students and working professionals.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-5">
                  <div className="text-2xl">
                    🪑
                  </div>
                  <h3 className="mt-3 font-black">
                    Classroom
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Comfortable classroom and counselling area.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-5">
                  <div className="text-2xl">
                    💻
                  </div>
                  <h3 className="mt-3 font-black">
                    Computer Lab
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Computers with stable internet connectivity.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-5">
                  <div className="text-2xl">
                    📶
                  </div>
                  <h3 className="mt-3 font-black">
                    Internet
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Reliable broadband connection and backup.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-5">
                  <div className="text-2xl">
                    🖥️
                  </div>
                  <h3 className="mt-3 font-black">
                    Display Setup
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Projector, smart display or large screen.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-5">
                  <div className="text-2xl">
                    🧑‍💼
                  </div>
                  <h3 className="mt-3 font-black">
                    Counselling Desk
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Dedicated admission and student counselling space.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="bg-slate-950 py-20 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className="text-sm font-bold uppercase tracking-widest text-indigo-400">
                {" "}Investment{" "}
              </span>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                Flexible Franchise Investment
              </h2>
              <p className="mt-4 leading-7 text-slate-400">
                Final commercial terms can be customized according to centre model, city, infrastructure and selected services.
              </p>
            </div>
            <div className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-3xl border border-white/10">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left">
                  <thead className="bg-white/10">
                    <tr>
                      <th className="px-6 py-5 font-bold">
                        Particular
                      </th>
                      <th className="px-6 py-5 font-bold">
                        Basic
                      </th>
                      <th className="px-6 py-5 font-bold">
                        Standard
                      </th>
                      <th className="px-6 py-5 font-bold">
                        Premium
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 text-sm">
                    <tr>
                      <td className="px-6 py-5 text-slate-300">
                        Franchise / Setup
                      </td>
                      <td className="px-6 py-5">
                        Customize
                      </td>
                      <td className="px-6 py-5">
                        Customize
                      </td>
                      <td className="px-6 py-5">
                        Customize
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-5 text-slate-300">
                        Branding
                      </td>
                      <td className="px-6 py-5">
                        ✓
                      </td>
                      <td className="px-6 py-5">
                        ✓
                      </td>
                      <td className="px-6 py-5">
                        ✓
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-5 text-slate-300">
                        Course Portfolio
                      </td>
                      <td className="px-6 py-5">
                        Selected
                      </td>
                      <td className="px-6 py-5">
                        Expanded
                      </td>
                      <td className="px-6 py-5">
                        Complete
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-5 text-slate-300">
                        Marketing Support
                      </td>
                      <td className="px-6 py-5">
                        ✓
                      </td>
                      <td className="px-6 py-5">
                        ✓
                      </td>
                      <td className="px-6 py-5">
                        Advanced
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-5 text-slate-300">
                        Technology Support
                      </td>
                      <td className="px-6 py-5">
                        Basic
                      </td>
                      <td className="px-6 py-5">
                        Advanced
                      </td>
                      <td className="px-6 py-5">
                        Premium
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <p className="mx-auto mt-6 max-w-3xl text-center text-xs leading-6 text-slate-500">
              * Investment, fees, royalty, infrastructure requirements and revenue-sharing terms should be finalized in the official franchise agreement. No income or ROI is guaranteed.
            </p>
          </div>
        </section>
        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="text-sm font-bold uppercase tracking-widest text-indigo-600">
                {" "}Simple Process{" "}
              </span>
              <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
                How to Become a Franchise Partner
              </h2>
            </div>
            <div className="mt-14 grid gap-6 md:grid-cols-4">
              <div className="relative rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-soft">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-lg font-black text-white">
                  01
                </div>
                <h3 className="mt-5 text-lg font-black">
                  Submit Enquiry
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Fill out the franchise enquiry form with your basic details.
                </p>
              </div>
              <div className="relative rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-soft">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-lg font-black text-white">
                  02
                </div>
                <h3 className="mt-5 text-lg font-black">
                  Discussion
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Our team discusses your city, experience and business goals.
                </p>
              </div>
              <div className="relative rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-soft">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-lg font-black text-white">
                  03
                </div>
                <h3 className="mt-5 text-lg font-black">
                  Location Review
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Centre location and infrastructure requirements are evaluated.
                </p>
              </div>
              <div className="relative rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-soft">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-lg font-black text-white">
                  04
                </div>
                <h3 className="mt-5 text-lg font-black">
                  Launch
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Complete onboarding, branding, training and centre launch.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="bg-slate-50 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <span className="text-sm font-bold uppercase tracking-widest text-indigo-600">
                  {" "}Eligibility{" "}
                </span>
                <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
                  Who Can Become a Partner?
                </h2>
                <p className="mt-5 leading-8 text-slate-600">
                  The partnership can be suitable for educators, entrepreneurs and existing training-centre operators interested in expanding into future-ready skills.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                  <div className="text-3xl">
                    👨‍🏫
                  </div>
                  <h3 className="mt-4 font-black">
                    Teachers & Educators
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Education professionals looking to build their own centre.
                  </p>
                </div>
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                  <div className="text-3xl">
                    💼
                  </div>
                  <h3 className="mt-4 font-black">
                    Entrepreneurs
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Individuals interested in the education and skill sector.
                  </p>
                </div>
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                  <div className="text-3xl">
                    💻
                  </div>
                  <h3 className="mt-4 font-black">
                    Computer Institutes
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Existing centres wanting to add AI and modern programs.
                  </p>
                </div>
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                  <div className="text-3xl">
                    🏢
                  </div>
                  <h3 className="mt-4 font-black">
                    Business Owners
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Owners looking for a structured education business model.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="bg-white py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="text-sm font-bold uppercase tracking-widest text-indigo-600">
                {" "}FAQ{" "}
              </span>
              <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
                Frequently Asked Questions
              </h2>
            </div>
            <div className="mt-10 space-y-4">
              <div className="faq-item rounded-2xl border border-slate-200 bg-white">
                <button className="faq-btn flex w-full items-center justify-between gap-5 p-6 text-left">
                  <span className="font-bold text-slate-900">
                    {" "}Who can apply for an Career Optics Computer Centre franchise?{" "}
                  </span>
                  <span className="faq-icon text-2xl text-indigo-600">
                    {" "}+{" "}
                  </span>
                </button>
                <div className="faq-content">
                  <p className="px-6 pb-6 leading-7 text-slate-600">
                    Educators, entrepreneurs, existing computer institutes, coaching centres and business owners can enquire about the franchise opportunity, subject to the applicable partnership requirements.
                  </p>
                </div>
              </div>
              <div className="faq-item rounded-2xl border border-slate-200 bg-white">
                <button className="faq-btn flex w-full items-center justify-between gap-5 p-6 text-left">
                  <span className="font-bold text-slate-900">
                    {" "}What courses can my centre offer?{" "}
                  </span>
                  <span className="faq-icon text-2xl text-indigo-600">
                    {" "}+{" "}
                  </span>
                </button>
                <div className="faq-content">
                  <p className="px-6 pb-6 leading-7 text-slate-600">
                    Depending on the selected model, the centre can offer AI Foundation, AI Tools & Automation, ChatGPT, Digital Marketing, Web Development, AI Full Stack, Accounting, Graphic Design and other career programs.
                  </p>
                </div>
              </div>
              <div className="faq-item rounded-2xl border border-slate-200 bg-white">
                <button className="faq-btn flex w-full items-center justify-between gap-5 p-6 text-left">
                  <span className="font-bold text-slate-900">
                    {" "}Is infrastructure support available?{" "}
                  </span>
                  <span className="faq-icon text-2xl text-indigo-600">
                    {" "}+{" "}
                  </span>
                </button>
                <div className="faq-content">
                  <p className="px-6 pb-6 leading-7 text-slate-600">
                    Centre planning can include guidance related to classroom setup, computer lab, branding, counselling space, technology and operational requirements.
                  </p>
                </div>
              </div>
              <div className="faq-item rounded-2xl border border-slate-200 bg-white">
                <button className="faq-btn flex w-full items-center justify-between gap-5 p-6 text-left">
                  <span className="font-bold text-slate-900">
                    {" "}Is ROI guaranteed?{" "}
                  </span>
                  <span className="faq-icon text-2xl text-indigo-600">
                    {" "}+{" "}
                  </span>
                </button>
                <div className="faq-content">
                  <p className="px-6 pb-6 leading-7 text-slate-600">
                    No. Business results depend on location, admissions, pricing, marketing, operating costs and local demand. Any financial projections should be treated as estimates, not guarantees.
                  </p>
                </div>
              </div>
              <div className="faq-item rounded-2xl border border-slate-200 bg-white">
                <button className="faq-btn flex w-full items-center justify-between gap-5 p-6 text-left">
                  <span className="font-bold text-slate-900">
                    {" "}How do I start the franchise process?{" "}
                  </span>
                  <span className="faq-icon text-2xl text-indigo-600">
                    {" "}+{" "}
                  </span>
                </button>
                <div className="faq-content">
                  <p className="px-6 pb-6 leading-7 text-slate-600">
                    Submit the enquiry form below. The franchise team can then discuss your city, centre requirements, course interests and suitable partnership model.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="franchise-form" className="relative overflow-hidden bg-slate-950 py-20 text-white">
          <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl"></div>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
              <div>
                <span className="text-sm font-bold uppercase tracking-widest text-indigo-400">
                  {" "}Franchise Enquiry{" "}
                </span>
                <h2 className="mt-3 text-4xl font-black leading-tight">
                  Ready to Start Your{" "}
                  <span className="gradient-text">
                    Education Business?
                  </span>
                </h2>
                <p className="mt-5 leading-8 text-slate-400">
                  Submit your details and our team can discuss the suitable franchise model for your city.
                </p>
                <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
                    <span className="text-2xl">
                      📍
                    </span>
                    <div>
                      <p className="font-bold">
                        Your City
                      </p>
                      <p className="text-sm text-slate-400">
                        Tell us where you want to start.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
                    <span className="text-2xl">
                      💰
                    </span>
                    <div>
                      <p className="font-bold">
                        Investment Capacity
                      </p>
                      <p className="text-sm text-slate-400">
                        Helps us suggest a suitable model.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
                    <span className="text-2xl">
                      🚀
                    </span>
                    <div>
                      <p className="font-bold">
                        Growth Plan
                      </p>
                      <p className="text-sm text-slate-400">
                        Discuss your education business goals.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-3xl bg-white p-6 text-slate-900 shadow-2xl sm:p-8">
                <div className="mb-7">
                  <h3 className="text-2xl font-black">
                    Franchise Application
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Fill in your details and submit your enquiry.
                  </p>
                </div>
                <form action="#" method="POST" className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-bold">
                        {" "}Full Name *{" "}
                      </label>
                      {" "}
                      <input type="text" name="name" required placeholder="Enter your name" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-bold">
                        {" "}Mobile Number *{" "}
                      </label>
                      {" "}
                      <input type="tel" name="mobile" required placeholder="+91 XXXXX XXXXX" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100" />
                    </div>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-bold">
                        {" "}Email Address{" "}
                      </label>
                      {" "}
                      <input type="email" name="email" placeholder="your@email.com" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-bold">
                        {" "}City *{" "}
                      </label>
                      {" "}
                      <input type="text" name="city" required placeholder="Your city" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100" />
                    </div>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-bold">
                        {" "}State{" "}
                      </label>
                      {" "}
                      <input type="text" name="state" placeholder="Your state" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-bold">
                        {" "}Investment Capacity{" "}
                      </label>
                      <select name="investment" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100">
                        <option value="">
                          Select Budget
                        </option>
                        <option>
                          Below ₹2 Lakh
                        </option>
                        <option>
                          ₹2 – ₹5 Lakh
                        </option>
                        <option>
                          ₹5 – ₹10 Lakh
                        </option>
                        <option>
                          ₹10 Lakh+
                        </option>
                        <option>
                          Discuss with Team
                        </option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold">
                      {" "}Preferred Franchise Model{" "}
                    </label>
                    <select name="model" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100">
                      <option value="">
                        Select Model
                      </option>
                      <option>
                        Basic Training Centre
                      </option>
                      <option>
                        Standard Skill Centre
                      </option>
                      <option>
                        Premium AI Skill Centre
                      </option>
                      <option>
                        Not Sure - Need Consultation
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold">
                      {" "}Message / Query{" "}
                    </label>
                    {" "}
                    <textarea name="message" rows={4} placeholder="Tell us about your existing institute or franchise plan..." className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100" />
                  </div>
                  <button type="submit" className="w-full rounded-xl bg-indigo-600 px-6 py-4 font-black text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 hover:-translate-y-0.5">
                    {" "}Submit Franchise Enquiry →{" "}
                  </button>
                  <p className="text-center text-xs leading-5 text-slate-400">
                    By submitting this form, you agree to be contacted regarding the franchise opportunity.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </section>
        <section className="bg-white py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 p-8 text-center text-white shadow-premium sm:p-12">
              <div className="mx-auto max-w-3xl">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-3xl backdrop-blur">
                  🚀
                </div>
                <h2 className="mt-6 text-3xl font-black sm:text-4xl">
                  Start Your Own AI & Digital Skills Centre
                </h2>
                <p className="mt-4 leading-7 text-indigo-100">
                  Partner with Career Optics Computer Centre and bring practical, future-ready technology education to your local market.
                </p>
                <a href="#franchise-form" className="mt-8 inline-flex items-center justify-center rounded-xl bg-white px-7 py-4 font-black text-indigo-700 shadow-xl transition hover:-translate-y-1">
                  Apply for Franchise
                  <span className="ml-2">
                    →
                  </span>
                </a>
              </div>
            </div>
          </div>
        </section>
        <script dangerouslySetInnerHTML={{ __html: js_8026bb16 }} />
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
