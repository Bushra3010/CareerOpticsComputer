import css_4b6f5e3d from "../styles/4b6f5e3d.css?raw";
import js_468f34aa from "../behaviour/468f34aa.js?raw";
import js_d092d71d from "../behaviour/d092d71d.js?raw";

/** aitool.html */
export default function Aitool() {
  return (
    <html lang="en">
      <head>
        <script src="/cms-config.js"></script>
        <script src="/cms.js" defer></script>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>
          AI Design Tools & Creative AI Workflow | Career Optics Computer Academy
        </title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href={"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"} rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />
        <script dangerouslySetInnerHTML={{ __html: js_468f34aa }} />
        <style dangerouslySetInnerHTML={{ __html: css_4b6f5e3d }} />
      </head>
      <body>
        <div className="bg-slate-950 text-white text-xs">
          <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap justify-between gap-2">
            <div className="flex gap-4">
              <span>
                {" "}
                <i className="fa-solid fa-certificate text-blue-400 mr-1"></i>
                {" "}Professional Certificate Course{" "}
              </span>
              <span className="hidden sm:inline">
                {" "}
                <i className="fa-solid fa-laptop-code text-purple-400 mr-1"></i>
                {" "}Practical Training{" "}
              </span>
            </div>
            <div>
              <i className="fa-solid fa-phone text-green-400 mr-1"></i>
              {" "}Admission Support Available
            </div>
          </div>
        </div>
        <header className="bg-white border-b sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="h-16 flex items-center justify-between">
              <a href="#" className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center shadow-lg">
                  <i className="fa-solid fa-wand-magic-sparkles text-lg"></i>
                </div>
                <div>
                  <h1 className="font-black text-xl leading-none">
                    PNS{" "}
                    <span className="text-blue-600">
                      Academy
                    </span>
                  </h1>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                    Skill • Career • Future
                  </p>
                </div>
              </a>
              <div className="hidden md:flex items-center gap-7 text-sm font-semibold">
                <a href="#overview" className="hover:text-blue-600">
                  {" "}Overview{" "}
                </a>
                {" "}
                <a href="#syllabus" className="hover:text-blue-600">
                  {" "}Syllabus{" "}
                </a>
                {" "}
                <a href="#tools" className="hover:text-blue-600">
                  {" "}Tools{" "}
                </a>
                {" "}
                <a href="#projects" className="hover:text-blue-600">
                  {" "}Projects{" "}
                </a>
                {" "}
                <a href="#fees" className="hover:text-blue-600">
                  {" "}Fee{" "}
                </a>
                {" "}
                <a href="#admission" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition">
                  {" "}Apply Now{" "}
                </a>
              </div>
            </div>
          </div>
        </header>
        <section className="hero-bg text-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 py-20 lg:py-28">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm mb-6">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Future-Ready Creative AI Course
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight">
                  AI Design Tools &{" "}
                  <span className="text-cyan-300">
                    {" "}Creative AI Workflow{" "}
                  </span>
                </h2>
                <p className="mt-6 text-blue-100 text-lg leading-8 max-w-2xl">
                  Learn modern AI-powered graphic design, image generation, creative prompting, branding, social media design, AI video workflows and professional creative automation.
                </p>
                <div className="flex flex-wrap gap-3 mt-8">
                  <span className="glass px-4 py-2 rounded-xl text-sm">
                    {" "}
                    <i className="fa-regular fa-clock mr-2"></i>
                    {" "}3 Months{" "}
                  </span>
                  <span className="glass px-4 py-2 rounded-xl text-sm">
                    {" "}
                    <i className="fa-solid fa-layer-group mr-2"></i>
                    {" "}12 Modules{" "}
                  </span>
                  <span className="glass px-4 py-2 rounded-xl text-sm">
                    {" "}
                    <i className="fa-solid fa-briefcase mr-2"></i>
                    {" "}Job Oriented{" "}
                  </span>
                  <span className="glass px-4 py-2 rounded-xl text-sm">
                    {" "}
                    <i className="fa-solid fa-award mr-2"></i>
                    {" "}Certificate{" "}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 mt-9">
                  <a href="#admission" className="bg-white text-blue-700 font-bold px-7 py-3.5 rounded-xl hover:bg-blue-50 transition">
                    {" "}
                    <i className="fa-solid fa-paper-plane mr-2"></i>
                    {" "}Apply Now{" "}
                  </a>
                  <a href="#syllabus" className="glass font-bold px-7 py-3.5 rounded-xl">
                    {" "}
                    <i className="fa-solid fa-book-open mr-2"></i>
                    {" "}View Syllabus{" "}
                  </a>
                </div>
              </div>
              <div>
                <div className="glass rounded-3xl p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <p className="text-blue-200 text-xs uppercase tracking-widest">
                        Creative AI Workflow
                      </p>
                      <h3 className="font-bold text-xl">
                        From Idea to Final Creative
                      </h3>
                    </div>
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                      <i className="fa-solid fa-brain text-2xl text-cyan-300"></i>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white/10 rounded-xl p-4 flex gap-3 items-center">
                      <div className="w-9 h-9 rounded-lg bg-blue-500/30 flex items-center justify-center">
                        <i className="fa-solid fa-lightbulb"></i>
                      </div>
                      <div>
                        <p className="font-bold text-sm">
                          01. Creative Brief
                        </p>
                        <p className="text-xs text-blue-200">
                          Idea • Goal • Audience
                        </p>
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4 flex gap-3 items-center">
                      <div className="w-9 h-9 rounded-lg bg-purple-500/30 flex items-center justify-center">
                        <i className="fa-solid fa-wand-magic-sparkles"></i>
                      </div>
                      <div>
                        <p className="font-bold text-sm">
                          02. Prompt Engineering
                        </p>
                        <p className="text-xs text-blue-200">
                          Prompt • Style • Reference
                        </p>
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4 flex gap-3 items-center">
                      <div className="w-9 h-9 rounded-lg bg-pink-500/30 flex items-center justify-center">
                        <i className="fa-solid fa-image"></i>
                      </div>
                      <div>
                        <p className="font-bold text-sm">
                          03. Generate & Select
                        </p>
                        <p className="text-xs text-blue-200">
                          Image • Design • Video
                        </p>
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4 flex gap-3 items-center">
                      <div className="w-9 h-9 rounded-lg bg-cyan-500/30 flex items-center justify-center">
                        <i className="fa-solid fa-sliders"></i>
                      </div>
                      <div>
                        <p className="font-bold text-sm">
                          04. Edit & Refine
                        </p>
                        <p className="text-xs text-blue-200">
                          Retouch • Brand • Layout
                        </p>
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4 flex gap-3 items-center">
                      <div className="w-9 h-9 rounded-lg bg-green-500/30 flex items-center justify-center">
                        <i className="fa-solid fa-rocket"></i>
                      </div>
                      <div>
                        <p className="font-bold text-sm">
                          05. Publish & Repurpose
                        </p>
                        <p className="text-xs text-blue-200">
                          Social • Ads • Campaign
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="overview" className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-blue-600 font-bold text-sm uppercase tracking-widest">
                {" "}Course Overview{" "}
              </span>
              <h2 className="text-3xl md:text-4xl font-black mt-3">
                Become a{" "}
                <span className="gradient-text">
                  Creative AI Designer
                </span>
              </h2>
              <p className="text-slate-600 mt-4 leading-7">
                A practical program designed to teach the complete workflow from creative idea and prompt engineering to professional design, branding, social media and AI video production.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
              <div className="card p-6">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
                  <i className="fa-solid fa-wand-magic-sparkles"></i>
                </div>
                <h3 className="font-bold mt-5">
                  AI Creative Design
                </h3>
                <p className="text-sm text-slate-500 mt-2 leading-6">
                  Generate concepts, graphics, images and marketing creatives using modern AI tools.
                </p>
              </div>
              <div className="card p-6">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl">
                  <i className="fa-solid fa-terminal"></i>
                </div>
                <h3 className="font-bold mt-5">
                  Prompt Engineering
                </h3>
                <p className="text-sm text-slate-500 mt-2 leading-6">
                  Learn structured prompts for image, design, branding, product and video generation.
                </p>
              </div>
              <div className="card p-6">
                <div className="w-12 h-12 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center text-xl">
                  <i className="fa-solid fa-photo-film"></i>
                </div>
                <h3 className="font-bold mt-5">
                  AI Image & Video
                </h3>
                <p className="text-sm text-slate-500 mt-2 leading-6">
                  Create professional image concepts, video shots, advertisements and social creatives.
                </p>
              </div>
              <div className="card p-6">
                <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center text-xl">
                  <i className="fa-solid fa-gears"></i>
                </div>
                <h3 className="font-bold mt-5">
                  Creative Automation
                </h3>
                <p className="text-sm text-slate-500 mt-2 leading-6">
                  Build reusable workflows for fast, scalable creative production.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="syllabus" className="py-16 bg-slate-100">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <span className="text-blue-600 font-bold text-sm uppercase tracking-widest">
                {" "}Complete Syllabus{" "}
              </span>
              <h2 className="text-3xl md:text-4xl font-black mt-3">
                12 Module{" "}
                <span className="gradient-text">
                  Creative AI Curriculum
                </span>
              </h2>
              <p className="text-slate-500 mt-3">
                Click any module to view the detailed syllabus.
              </p>
            </div>
            <div className="grid lg:grid-cols-[310px_1fr] gap-6 items-start">
              <div className="app-menu">
                <div className="module-list lg:block space-y-3">
                  <button className="module-btn active bg-white border border-slate-200 rounded-2xl p-4 flex gap-3 items-center" data-module="module1">
                    <span className="module-number">
                      01
                    </span>
                    <span>
                      {" "}
                      <strong className="block text-sm">
                        {" "}AI Design Foundation{" "}
                      </strong>
                      {" "}
                      <small className="opacity-70">
                        {" "}Creative AI Basics{" "}
                      </small>
                      {" "}
                    </span>
                  </button>
                  {" "}
                  <button className="module-btn bg-white border border-slate-200 rounded-2xl p-4 flex gap-3 items-center" data-module="module2">
                    <span className="module-number">
                      02
                    </span>
                    <span>
                      {" "}
                      <strong className="block text-sm">
                        {" "}AI Prompt Engineering{" "}
                      </strong>
                      {" "}
                      <small className="opacity-70">
                        {" "}Professional Prompts{" "}
                      </small>
                      {" "}
                    </span>
                  </button>
                  {" "}
                  <button className="module-btn bg-white border border-slate-200 rounded-2xl p-4 flex gap-3 items-center" data-module="module3">
                    <span className="module-number">
                      03
                    </span>
                    <span>
                      {" "}
                      <strong className="block text-sm">
                        {" "}Canva AI{" "}
                      </strong>
                      {" "}
                      <small className="opacity-70">
                        {" "}AI Design Workflow{" "}
                      </small>
                      {" "}
                    </span>
                  </button>
                  {" "}
                  <button className="module-btn bg-white border border-slate-200 rounded-2xl p-4 flex gap-3 items-center" data-module="module4">
                    <span className="module-number">
                      04
                    </span>
                    <span>
                      {" "}
                      <strong className="block text-sm">
                        {" "}Adobe Firefly{" "}
                      </strong>
                      {" "}
                      <small className="opacity-70">
                        {" "}Generative Design{" "}
                      </small>
                      {" "}
                    </span>
                  </button>
                  {" "}
                  <button className="module-btn bg-white border border-slate-200 rounded-2xl p-4 flex gap-3 items-center" data-module="module5">
                    <span className="module-number">
                      05
                    </span>
                    <span>
                      {" "}
                      <strong className="block text-sm">
                        {" "}AI Image Creation{" "}
                      </strong>
                      {" "}
                      <small className="opacity-70">
                        {" "}Image Generation{" "}
                      </small>
                      {" "}
                    </span>
                  </button>
                  {" "}
                  <button className="module-btn bg-white border border-slate-200 rounded-2xl p-4 flex gap-3 items-center" data-module="module6">
                    <span className="module-number">
                      06
                    </span>
                    <span>
                      {" "}
                      <strong className="block text-sm">
                        {" "}AI Branding Design{" "}
                      </strong>
                      {" "}
                      <small className="opacity-70">
                        {" "}Brand Identity{" "}
                      </small>
                      {" "}
                    </span>
                  </button>
                  {" "}
                  <button className="module-btn bg-white border border-slate-200 rounded-2xl p-4 flex gap-3 items-center" data-module="module7">
                    <span className="module-number">
                      07
                    </span>
                    <span>
                      {" "}
                      <strong className="block text-sm">
                        {" "}Social Media AI{" "}
                      </strong>
                      {" "}
                      <small className="opacity-70">
                        {" "}Content Creation{" "}
                      </small>
                      {" "}
                    </span>
                  </button>
                  {" "}
                  <button className="module-btn bg-white border border-slate-200 rounded-2xl p-4 flex gap-3 items-center" data-module="module8">
                    <span className="module-number">
                      08
                    </span>
                    <span>
                      {" "}
                      <strong className="block text-sm">
                        {" "}AI Video Workflow{" "}
                      </strong>
                      {" "}
                      <small className="opacity-70">
                        {" "}AI Video Creation{" "}
                      </small>
                      {" "}
                    </span>
                  </button>
                  {" "}
                  <button className="module-btn bg-white border border-slate-200 rounded-2xl p-4 flex gap-3 items-center" data-module="module9">
                    <span className="module-number">
                      09
                    </span>
                    <span>
                      {" "}
                      <strong className="block text-sm">
                        {" "}Creative AI Automation{" "}
                      </strong>
                      {" "}
                      <small className="opacity-70">
                        {" "}Workflow Automation{" "}
                      </small>
                      {" "}
                    </span>
                  </button>
                  {" "}
                  <button className="module-btn bg-white border border-slate-200 rounded-2xl p-4 flex gap-3 items-center" data-module="module10">
                    <span className="module-number">
                      10
                    </span>
                    <span>
                      {" "}
                      <strong className="block text-sm">
                        {" "}AI + Photoshop{" "}
                      </strong>
                      {" "}
                      <small className="opacity-70">
                        {" "}Professional Editing{" "}
                      </small>
                      {" "}
                    </span>
                  </button>
                  {" "}
                  <button className="module-btn bg-white border border-slate-200 rounded-2xl p-4 flex gap-3 items-center" data-module="module11">
                    <span className="module-number">
                      11
                    </span>
                    <span>
                      {" "}
                      <strong className="block text-sm">
                        {" "}Professional Projects{" "}
                      </strong>
                      {" "}
                      <small className="opacity-70">
                        {" "}Real-World Projects{" "}
                      </small>
                      {" "}
                    </span>
                  </button>
                  {" "}
                  <button className="module-btn bg-white border border-slate-200 rounded-2xl p-4 flex gap-3 items-center" data-module="module12">
                    <span className="module-number">
                      12
                    </span>
                    <span>
                      {" "}
                      <strong className="block text-sm">
                        {" "}Freelancing & Career{" "}
                      </strong>
                      {" "}
                      <small className="opacity-70">
                        {" "}Professional Workflow{" "}
                      </small>
                      {" "}
                    </span>
                  </button>
                </div>
              </div>
              <div className="card p-6 md:p-8">
                <div id="module1" className="module-content active">
                  <div className="flex flex-wrap justify-between gap-4 mb-7">
                    <div>
                      <span className="text-blue-600 font-bold text-xs uppercase">
                        {" "}Module 01{" "}
                      </span>
                      <h3 className="text-2xl font-black mt-1">
                        AI Design Foundation
                      </h3>
                      <p className="text-slate-500 mt-2">
                        Understand the fundamentals of Creative AI and modern AI-assisted design workflows.
                      </p>
                    </div>
                    <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-bold text-sm">
                      Foundation
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      {" "}
                      <span>
                        Generative AI fundamentals
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      {" "}
                      <span>
                        AI Graphic Design concepts
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      {" "}
                      <span>
                        Traditional vs AI-assisted design
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      {" "}
                      <span>
                        Creative AI workflow
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      {" "}
                      <span>
                        Creative brief creation
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      {" "}
                      <span>
                        Target audience research
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      {" "}
                      <span>
                        Moodboard creation
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      {" "}
                      <span>
                        Visual references
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      {" "}
                      <span>
                        Idea → Prompt → Generate
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      {" "}
                      <span>
                        Generate → Edit → Refine → Export
                      </span>
                    </div>
                  </div>
                </div>
                <div id="module2" className="module-content">
                  <div className="mb-7">
                    <span className="text-purple-600 font-bold text-xs uppercase">
                      {" "}Module 02{" "}
                    </span>
                    <h3 className="text-2xl font-black mt-1">
                      AI Prompt Engineering for Designers
                    </h3>
                    <p className="text-slate-500 mt-2">
                      Learn how to write structured prompts for consistent professional creative outputs.
                    </p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Prompt fundamentals
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Subject & composition
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Style prompting
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Lighting & camera prompts
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Color direction
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Typography prompts
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Negative prompts
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Reference image prompts
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Character consistency
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Product photography prompts
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Social media prompts
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Prompt library creation
                      </span>
                    </div>
                  </div>
                </div>
                <div id="module3" className="module-content">
                  <div className="mb-7">
                    <span className="text-blue-600 font-bold text-xs uppercase">
                      {" "}Module 03{" "}
                    </span>
                    <h3 className="text-2xl font-black mt-1">
                      Canva AI Creative Workflow
                    </h3>
                    <p className="text-slate-500 mt-2">
                      Build editable designs and fast content workflows with Canva's AI-powered creative tools.
                    </p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Canva AI interface
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        AI-powered designs
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        AI-powered elements
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        AI image generation
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        AI templates
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Magic Background
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Style Match
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        AI photo editing
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Magic Write
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Brand Kit workflow
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Social media design
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Multi-format content
                      </span>
                    </div>
                  </div>
                </div>
                <div id="module4" className="module-content">
                  <div className="mb-7">
                    <span className="text-purple-600 font-bold text-xs uppercase">
                      {" "}Module 04{" "}
                    </span>
                    <h3 className="text-2xl font-black mt-1">
                      Adobe Firefly & Generative Design
                    </h3>
                    <p className="text-slate-500 mt-2">
                      Learn AI-assisted image generation and editing workflows.
                    </p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Adobe Firefly interface
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Text-to-image
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Generative Fill
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Generative Expand
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Creative variations
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Product creative
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Background generation
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Concept exploration
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Brand creative
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        AI-assisted image editing
                      </span>
                    </div>
                  </div>
                </div>
                <div id="module5" className="module-content">
                  <div className="mb-7">
                    <span className="text-pink-600 font-bold text-xs uppercase">
                      {" "}Module 05{" "}
                    </span>
                    <h3 className="text-2xl font-black mt-1">
                      AI Image Creation
                    </h3>
                    <p className="text-slate-500 mt-2">
                      Create different styles of professional visual content using prompt and reference based workflows.
                    </p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Photorealistic images
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Portrait generation
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Product photography
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Fashion creatives
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Food photography
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Architecture concepts
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Character design
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Cartoon & illustration
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Cinematic visuals
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        3D-style creative
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Reference-based generation
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Variation & refinement
                      </span>
                    </div>
                  </div>
                </div>
                <div id="module6" className="module-content">
                  <div className="mb-7">
                    <span className="text-indigo-600 font-bold text-xs uppercase">
                      {" "}Module 06{" "}
                    </span>
                    <h3 className="text-2xl font-black mt-1">
                      AI Branding & Graphic Design
                    </h3>
                    <p className="text-slate-500 mt-2">
                      Build complete visual identity systems using AI-assisted creative workflows.
                    </p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Logo concept generation
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Brand color palette
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Typography selection
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Brand moodboard
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Business card design
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Letterhead design
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Brochure design
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Poster & flyer design
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Social media branding
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Brand consistency
                      </span>
                    </div>
                  </div>
                </div>
                <div id="module7" className="module-content">
                  <div className="mb-7">
                    <span className="text-blue-600 font-bold text-xs uppercase">
                      {" "}Module 07{" "}
                    </span>
                    <h3 className="text-2xl font-black mt-1">
                      AI Social Media Creative Workflow
                    </h3>
                    <p className="text-slate-500 mt-2">
                      Create and repurpose social media creatives for multiple platforms.
                    </p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Instagram post design
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Instagram carousel
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Instagram stories
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Reels thumbnail
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        YouTube thumbnail
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Facebook creatives
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        LinkedIn creatives
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Festival creatives
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Advertising banners
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Multiple size adaptation
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Batch content production
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Content calendar
                      </span>
                    </div>
                  </div>
                </div>
                <div id="module8" className="module-content">
                  <div className="mb-7">
                    <span className="text-purple-600 font-bold text-xs uppercase">
                      {" "}Module 08{" "}
                    </span>
                    <h3 className="text-2xl font-black mt-1">
                      AI Video Creative Workflow
                    </h3>
                    <p className="text-slate-500 mt-2">
                      Learn the workflow from visual concept to AI-generated video and marketing content.
                    </p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Text-to-video concepts
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Image-to-video workflow
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Storyboard creation
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Product video
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Reels production
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Cinematic shots
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Camera movement prompts
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Video variations
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Background replacement
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        AI video enhancement
                      </span>
                    </div>
                  </div>
                </div>
                <div id="module9" className="module-content">
                  <div className="mb-7">
                    <span className="text-green-600 font-bold text-xs uppercase">
                      {" "}Module 09{" "}
                    </span>
                    <h3 className="text-2xl font-black mt-1">
                      Creative AI Automation
                    </h3>
                    <p className="text-slate-500 mt-2">
                      Build repeatable creative production pipelines.
                    </p>
                  </div>
                  <div className="p-5 bg-slate-950 rounded-2xl text-white mb-6">
                    <div className="flex flex-wrap gap-2 items-center text-xs md:text-sm font-bold">
                      <span>
                        Brief
                      </span>
                      <i className="fa-solid fa-arrow-right text-blue-400"></i>
                      <span>
                        Research
                      </span>
                      <i className="fa-solid fa-arrow-right text-blue-400"></i>
                      <span>
                        Concept
                      </span>
                      <i className="fa-solid fa-arrow-right text-blue-400"></i>
                      <span>
                        Prompt
                      </span>
                      <i className="fa-solid fa-arrow-right text-blue-400"></i>
                      <span>
                        Generate
                      </span>
                      <i className="fa-solid fa-arrow-right text-blue-400"></i>
                      <span>
                        Edit
                      </span>
                      <i className="fa-solid fa-arrow-right text-blue-400"></i>
                      <span>
                        Brand
                      </span>
                      <i className="fa-solid fa-arrow-right text-blue-400"></i>
                      <span>
                        Resize
                      </span>
                      <i className="fa-solid fa-arrow-right text-blue-400"></i>
                      <span>
                        Publish
                      </span>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Reusable prompt templates
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Batch creative production
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Creative variations
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Multi-platform adaptation
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Content repurposing
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        AI copywriting workflow
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Image + video workflow
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Creative workflow documentation
                      </span>
                    </div>
                  </div>
                </div>
                <div id="module10" className="module-content">
                  <div className="mb-7">
                    <span className="text-indigo-600 font-bold text-xs uppercase">
                      {" "}Module 10{" "}
                    </span>
                    <h3 className="text-2xl font-black mt-1">
                      AI + Photoshop Professional Workflow
                    </h3>
                    <p className="text-slate-500 mt-2">
                      Combine AI-generated assets with professional Photoshop editing.
                    </p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        AI image → Photoshop
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Generative Fill
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Generative Expand
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Object removal
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Background cleanup
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Image compositing
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Professional retouching
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Product photo enhancement
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Layers & masks
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Final typography
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Export optimization
                      </span>
                    </div>
                  </div>
                </div>
                <div id="module11" className="module-content">
                  <div className="mb-7">
                    <span className="text-pink-600 font-bold text-xs uppercase">
                      {" "}Module 11{" "}
                    </span>
                    <h3 className="text-2xl font-black mt-1">
                      Professional Creative Projects
                    </h3>
                    <p className="text-slate-500 mt-2">
                      Build portfolio-ready projects using the complete AI workflow.
                    </p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-5 bg-blue-50 border border-blue-100 rounded-2xl">
                      <i className="fa-solid fa-crown text-blue-600 text-xl"></i>
                      <h4 className="font-bold mt-3">
                        Complete Brand Identity
                      </h4>
                      <p className="text-sm text-slate-500 mt-2">
                        Logo concept, colors, typography, social kit and brand assets.
                      </p>
                    </div>
                    <div className="p-5 bg-purple-50 border border-purple-100 rounded-2xl">
                      <i className="fa-solid fa-box text-purple-600 text-xl"></i>
                      <h4 className="font-bold mt-3">
                        Product Advertising Campaign
                      </h4>
                      <p className="text-sm text-slate-500 mt-2">
                        Product visuals, ad creatives, social banners and campaign assets.
                      </p>
                    </div>
                    <div className="p-5 bg-pink-50 border border-pink-100 rounded-2xl">
                      <i className="fa-solid fa-share-nodes text-pink-600 text-xl"></i>
                      <h4 className="font-bold mt-3">
                        Social Media Campaign
                      </h4>
                      <p className="text-sm text-slate-500 mt-2">
                        Posts, carousel, reels concepts, stories and thumbnails.
                      </p>
                    </div>
                    <div className="p-5 bg-green-50 border border-green-100 rounded-2xl">
                      <i className="fa-solid fa-bullhorn text-green-600 text-xl"></i>
                      <h4 className="font-bold mt-3">
                        AI Marketing Campaign
                      </h4>
                      <p className="text-sm text-slate-500 mt-2">
                        Complete AI-assisted campaign from research to final creative.
                      </p>
                    </div>
                  </div>
                </div>
                <div id="module12" className="module-content">
                  <div className="mb-7">
                    <span className="text-green-600 font-bold text-xs uppercase">
                      {" "}Module 12{" "}
                    </span>
                    <h3 className="text-2xl font-black mt-1">
                      Freelancing, Portfolio & Career
                    </h3>
                    <p className="text-slate-500 mt-2">
                      Learn how to convert your AI design skills into professional work and freelance opportunities.
                    </p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Understanding client brief
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        AI-assisted proposal
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Creative concept presentation
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Client revision workflow
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Prompt documentation
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Brand guideline preparation
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Portfolio development
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Behance portfolio basics
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Freelance pricing
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Client communication
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        AI ethics & responsible use
                      </span>
                    </div>
                    <div className="topic">
                      <i className="fa-solid fa-check"></i>
                      <span>
                        Final portfolio project
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="tools" className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center">
              <span className="text-blue-600 font-bold text-sm uppercase tracking-widest">
                {" "}Tools Covered{" "}
              </span>
              <h2 className="text-3xl md:text-4xl font-black mt-3">
                Industry-Focused{" "}
                <span className="gradient-text">
                  AI Creative Toolkit
                </span>
              </h2>
              <p className="text-slate-500 mt-3">
                Learn how to combine AI tools instead of depending on a single tool.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-12">
              <div className="card tool-card p-5 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl">
                  <i className="fa-solid fa-palette"></i>
                </div>
                <h4 className="font-bold mt-4 text-sm">
                  Canva AI
                </h4>
              </div>
              <div className="card tool-card p-5 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 text-red-600 flex items-center justify-center text-2xl">
                  <i className="fa-solid fa-fire"></i>
                </div>
                <h4 className="font-bold mt-4 text-sm">
                  Adobe Firefly
                </h4>
              </div>
              <div className="card tool-card p-5 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl">
                  <i className="fa-solid fa-image"></i>
                </div>
                <h4 className="font-bold mt-4 text-sm">
                  AI Image Tools
                </h4>
              </div>
              <div className="card tool-card p-5 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center text-2xl">
                  <i className="fa-solid fa-video"></i>
                </div>
                <h4 className="font-bold mt-4 text-sm">
                  Runway
                </h4>
              </div>
              <div className="card tool-card p-5 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl">
                  <i className="fa-solid fa-pen-nib"></i>
                </div>
                <h4 className="font-bold mt-4 text-sm">
                  Photoshop
                </h4>
              </div>
              <div className="card tool-card p-5 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-green-50 text-green-600 flex items-center justify-center text-2xl">
                  <i className="fa-solid fa-robot"></i>
                </div>
                <h4 className="font-bold mt-4 text-sm">
                  AI Assistants
                </h4>
              </div>
            </div>
          </div>
        </section>
        <section className="py-16 bg-slate-950 text-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-blue-400 font-bold text-sm uppercase tracking-widest">
                {" "}Professional Workflow{" "}
              </span>
              <h2 className="text-3xl md:text-4xl font-black mt-3">
                Learn the Complete{" "}
                <span className="text-cyan-300">
                  AI Creative Pipeline
                </span>
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
              <div className="glass rounded-2xl p-6">
                <span className="text-blue-300 font-black text-3xl">
                  01
                </span>
                <h3 className="font-bold mt-4">
                  Research
                </h3>
                <p className="text-slate-400 text-sm mt-2">
                  Understand audience, competitors, market and creative direction.
                </p>
              </div>
              <div className="glass rounded-2xl p-6">
                <span className="text-purple-300 font-black text-3xl">
                  02
                </span>
                <h3 className="font-bold mt-4">
                  Generate
                </h3>
                <p className="text-slate-400 text-sm mt-2">
                  Create concepts, prompts, images, copy and video ideas.
                </p>
              </div>
              <div className="glass rounded-2xl p-6">
                <span className="text-pink-300 font-black text-3xl">
                  03
                </span>
                <h3 className="font-bold mt-4">
                  Refine
                </h3>
                <p className="text-slate-400 text-sm mt-2">
                  Edit, retouch, apply branding, resize and improve output.
                </p>
              </div>
              <div className="glass rounded-2xl p-6">
                <span className="text-green-300 font-black text-3xl">
                  04
                </span>
                <h3 className="font-bold mt-4">
                  Publish
                </h3>
                <p className="text-slate-400 text-sm mt-2">
                  Export, publish, repurpose and scale creative campaigns.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="projects" className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center">
              <span className="text-blue-600 font-bold text-sm uppercase tracking-widest">
                {" "}Practical Projects{" "}
              </span>
              <h2 className="text-3xl md:text-4xl font-black mt-3">
                Build a{" "}
                <span className="gradient-text">
                  Professional Portfolio
                </span>
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
              <div className="card project-card p-6">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <i className="fa-solid fa-crown"></i>
                </div>
                <h3 className="font-bold text-lg mt-5">
                  AI Brand Identity
                </h3>
                <p className="text-sm text-slate-500 mt-2 leading-6">
                  Create a complete identity including logo concepts, colors, typography and social media kit.
                </p>
              </div>
              <div className="card project-card p-6">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <i className="fa-solid fa-box-open"></i>
                </div>
                <h3 className="font-bold text-lg mt-5">
                  Product Campaign
                </h3>
                <p className="text-sm text-slate-500 mt-2 leading-6">
                  Generate product visuals, advertisements and promotional social media designs.
                </p>
              </div>
              <div className="card project-card p-6">
                <div className="w-12 h-12 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
                  <i className="fa-solid fa-hashtag"></i>
                </div>
                <h3 className="font-bold text-lg mt-5">
                  Social Media Campaign
                </h3>
                <p className="text-sm text-slate-500 mt-2 leading-6">
                  Create a multi-platform campaign with posts, carousel, stories, thumbnails and reels concepts.
                </p>
              </div>
              <div className="card project-card p-6">
                <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                  <i className="fa-solid fa-clapperboard"></i>
                </div>
                <h3 className="font-bold text-lg mt-5">
                  AI Video Advertisement
                </h3>
                <p className="text-sm text-slate-500 mt-2 leading-6">
                  Develop storyboard, visual shots and short-form marketing video concept.
                </p>
              </div>
              <div className="card project-card p-6">
                <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <i className="fa-solid fa-bullhorn"></i>
                </div>
                <h3 className="font-bold text-lg mt-5">
                  Marketing Creative Pack
                </h3>
                <p className="text-sm text-slate-500 mt-2 leading-6">
                  Build a complete advertising creative package for a business.
                </p>
              </div>
              <div className="card project-card p-6">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <i className="fa-solid fa-folder-open"></i>
                </div>
                <h3 className="font-bold text-lg mt-5">
                  Final Portfolio
                </h3>
                <p className="text-sm text-slate-500 mt-2 leading-6">
                  Organize selected AI design projects into a professional portfolio.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="py-16 bg-blue-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center">
              <span className="text-blue-600 font-bold text-sm uppercase tracking-widest">
                {" "}Career Opportunities{" "}
              </span>
              <h2 className="text-3xl md:text-4xl font-black mt-3">
                Where Can You{" "}
                <span className="gradient-text">
                  Work?
                </span>
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-12">
              <div className="bg-white rounded-2xl p-5 border">
                <i className="fa-solid fa-pen-ruler text-blue-600 text-xl"></i>
                <h3 className="font-bold mt-3 text-sm">
                  AI Graphic Designer
                </h3>
              </div>
              <div className="bg-white rounded-2xl p-5 border">
                <i className="fa-solid fa-photo-film text-purple-600 text-xl"></i>
                <h3 className="font-bold mt-3 text-sm">
                  Creative Designer
                </h3>
              </div>
              <div className="bg-white rounded-2xl p-5 border">
                <i className="fa-solid fa-hashtag text-pink-600 text-xl"></i>
                <h3 className="font-bold mt-3 text-sm">
                  Social Media Designer
                </h3>
              </div>
              <div className="bg-white rounded-2xl p-5 border">
                <i className="fa-solid fa-video text-red-600 text-xl"></i>
                <h3 className="font-bold mt-3 text-sm">
                  AI Video Creator
                </h3>
              </div>
              <div className="bg-white rounded-2xl p-5 border">
                <i className="fa-solid fa-bullhorn text-green-600 text-xl"></i>
                <h3 className="font-bold mt-3 text-sm">
                  Creative Marketing Executive
                </h3>
              </div>
              <div className="bg-white rounded-2xl p-5 border">
                <i className="fa-solid fa-user-tie text-indigo-600 text-xl"></i>
                <h3 className="font-bold mt-3 text-sm">
                  AI Creative Freelancer
                </h3>
              </div>
              <div className="bg-white rounded-2xl p-5 border">
                <i className="fa-solid fa-store text-orange-600 text-xl"></i>
                <h3 className="font-bold mt-3 text-sm">
                  Digital Creator
                </h3>
              </div>
              <div className="bg-white rounded-2xl p-5 border">
                <i className="fa-solid fa-laptop-house text-cyan-600 text-xl"></i>
                <h3 className="font-bold mt-3 text-sm">
                  Work From Home Creator
                </h3>
              </div>
            </div>
          </div>
        </section>
        <section id="fees" className="py-16">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center">
              <span className="text-blue-600 font-bold text-sm uppercase tracking-widest">
                {" "}Course Fee{" "}
              </span>
              <h2 className="text-3xl md:text-4xl font-black mt-3">
                Start Your{" "}
                <span className="gradient-text">
                  Creative AI Journey
                </span>
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-5 mt-12">
              <div className="card p-7">
                <p className="text-sm text-slate-500 font-semibold">
                  Regular Fee
                </p>
                <div className="text-3xl font-black mt-2">
                  ₹7,999
                </div>
                <div className="h-px bg-slate-200 my-5"></div>
                <ul className="space-y-3 text-sm">
                  <li>
                    <i className="fa-solid fa-check text-green-500 mr-2"></i>
                    {" "}12 Modules
                  </li>
                  <li>
                    <i className="fa-solid fa-check text-green-500 mr-2"></i>
                    {" "}Practical Training
                  </li>
                  <li>
                    <i className="fa-solid fa-check text-green-500 mr-2"></i>
                    {" "}Project Work
                  </li>
                  <li>
                    <i className="fa-solid fa-check text-green-500 mr-2"></i>
                    {" "}Certificate
                  </li>
                </ul>
              </div>
              <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-purple-700 text-white p-7 shadow-premium relative">
                <div className="absolute right-5 top-5 bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
                  POPULAR
                </div>
                <p className="text-blue-100 text-sm font-semibold">
                  Special Admission Fee
                </p>
                <div className="text-4xl font-black mt-2">
                  ₹4,999
                </div>
                <div className="h-px bg-white/20 my-5"></div>
                <ul className="space-y-3 text-sm">
                  <li>
                    <i className="fa-solid fa-check mr-2"></i>
                    {" "}Complete 12 Module Training
                  </li>
                  <li>
                    <i className="fa-solid fa-check mr-2"></i>
                    {" "}AI Design Projects
                  </li>
                  <li>
                    <i className="fa-solid fa-check mr-2"></i>
                    {" "}Portfolio Guidance
                  </li>
                  <li>
                    <i className="fa-solid fa-check mr-2"></i>
                    {" "}Certificate
                  </li>
                </ul>
                <a href="#admission" className="block text-center bg-white text-blue-700 font-bold py-3 rounded-xl mt-7">
                  {" "}Apply Now{" "}
                </a>
              </div>
              <div className="card p-7">
                <p className="text-sm text-slate-500 font-semibold">
                  EMI / Installment
                </p>
                <div className="text-3xl font-black mt-2">
                  Available
                </div>
                <div className="h-px bg-slate-200 my-5"></div>
                <ul className="space-y-3 text-sm">
                  <li>
                    <i className="fa-solid fa-check text-green-500 mr-2"></i>
                    {" "}Flexible Payment
                  </li>
                  <li>
                    <i className="fa-solid fa-check text-green-500 mr-2"></i>
                    {" "}Admission Support
                  </li>
                  <li>
                    <i className="fa-solid fa-check text-green-500 mr-2"></i>
                    {" "}Practical Classes
                  </li>
                  <li>
                    <i className="fa-solid fa-check text-green-500 mr-2"></i>
                    {" "}Career Guidance
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        <section className="py-16 bg-slate-950 text-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-cyan-300 font-bold text-sm uppercase tracking-widest">
                  {" "}Course Certificate{" "}
                </span>
                <h2 className="text-3xl md:text-4xl font-black mt-4">
                  Get a Professional{" "}
                  <span className="text-cyan-300">
                    {" "}Course Certificate{" "}
                  </span>
                </h2>
                <p className="text-slate-400 mt-5 leading-7">
                  Successfully complete the course, practical assignments and final project to receive a course completion certificate from Career Optics Computer Academy.
                </p>
                <div className="grid sm:grid-cols-2 gap-3 mt-7">
                  <div className="glass rounded-xl p-4">
                    <i className="fa-solid fa-certificate text-cyan-300"></i>
                    {" "}
                    <span className="ml-2 text-sm">
                      Course Certificate
                    </span>
                  </div>
                  <div className="glass rounded-xl p-4">
                    <i className="fa-solid fa-folder-open text-cyan-300"></i>
                    {" "}
                    <span className="ml-2 text-sm">
                      Portfolio Projects
                    </span>
                  </div>
                  <div className="glass rounded-xl p-4">
                    <i className="fa-solid fa-user-tie text-cyan-300"></i>
                    {" "}
                    <span className="ml-2 text-sm">
                      Career Guidance
                    </span>
                  </div>
                  <div className="glass rounded-xl p-4">
                    <i className="fa-solid fa-briefcase text-cyan-300"></i>
                    {" "}
                    <span className="ml-2 text-sm">
                      Job/Freelance Skills
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-white text-slate-900 rounded-3xl p-6 shadow-2xl">
                <div className="border-4 border-double border-blue-600 rounded-2xl p-8 text-center">
                  <div className="text-blue-600 text-4xl">
                    <i className="fa-solid fa-award"></i>
                  </div>
                  <p className="uppercase tracking-widest text-xs mt-4">
                    Career Optics Computer Academy
                  </p>
                  <h3 className="text-2xl font-black mt-3">
                    Certificate of Completion
                  </h3>
                  <p className="text-sm text-slate-500 mt-4">
                    This certificate is awarded for successfully completing
                  </p>
                  <p className="font-black text-blue-700 mt-3">
                    AI Design Tools & Creative AI Workflow
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-8 text-xs text-slate-500">
                    <div className="border-t pt-2">
                      Student Name
                    </div>
                    <div className="border-t pt-2">
                      Certificate ID
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="admission" className="py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid lg:grid-cols-5 gap-8">
              <div className="lg:col-span-2">
                <span className="text-blue-600 font-bold text-sm uppercase tracking-widest">
                  {" "}Admission{" "}
                </span>
                <h2 className="text-3xl md:text-4xl font-black mt-3">
                  Start Your{" "}
                  <span className="gradient-text">
                    {" "}AI Creative Career{" "}
                  </span>
                </h2>
                <p className="text-slate-500 mt-4 leading-7">
                  Fill the enquiry form and our admission team will contact you for course details, batch timing and fee information.
                </p>
                <div className="mt-8 space-y-4">
                  <div className="flex gap-4">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <i className="fa-solid fa-phone"></i>
                    </div>
                    <div>
                      <h4 className="font-bold">
                        Admission Support
                      </h4>
                      <p className="text-sm text-slate-500">
                        Course & batch guidance
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <i className="fa-solid fa-calendar-days"></i>
                    </div>
                    <div>
                      <h4 className="font-bold">
                        Flexible Batches
                      </h4>
                      <p className="text-sm text-slate-500">
                        Morning / Evening options
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-11 h-11 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                      <i className="fa-solid fa-laptop"></i>
                    </div>
                    <div>
                      <h4 className="font-bold">
                        Practical Learning
                      </h4>
                      <p className="text-sm text-slate-500">
                        Project-based training
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-3 card p-6 md:p-8">
                <form id="admissionForm">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="text-sm font-bold">
                        {" "}Student Name{" "}
                      </label>
                      {" "}
                      <input type="text" required placeholder="Enter your name" className="w-full mt-2 px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="text-sm font-bold">
                        {" "}Mobile Number{" "}
                      </label>
                      {" "}
                      <input type="tel" required placeholder="Enter mobile number" className="w-full mt-2 px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="text-sm font-bold">
                        {" "}Email{" "}
                      </label>
                      {" "}
                      <input type="email" placeholder="Enter email" className="w-full mt-2 px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="text-sm font-bold">
                        {" "}Qualification{" "}
                      </label>
                      <select className="w-full mt-2 px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500">
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
                      <label className="text-sm font-bold">
                        {" "}Preferred Batch{" "}
                      </label>
                      <select className="w-full mt-2 px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500">
                        <option>
                          Select Batch
                        </option>
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
                      <label className="text-sm font-bold">
                        {" "}Learning Mode{" "}
                      </label>
                      <select className="w-full mt-2 px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500">
                        <option>
                          Choose Mode
                        </option>
                        <option>
                          Offline
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
                  <div className="mt-5">
                    <label className="text-sm font-bold">
                      {" "}Message{" "}
                    </label>
                    {" "}
                    <textarea rows={4} placeholder="Write your enquiry..." className="w-full mt-2 px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <button type="submit" className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3.5 rounded-xl hover:opacity-95 transition">
                    {" "}
                    <i className="fa-solid fa-paper-plane mr-2"></i>
                    {" "}Submit Admission Enquiry{" "}
                  </button>
                  <p id="formMessage" className="hidden text-center text-green-600 font-semibold text-sm mt-4">
                    Thank you! Your enquiry has been submitted.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </section>
        <section className="py-16 bg-slate-100">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center">
              <span className="text-blue-600 font-bold text-sm uppercase tracking-widest">
                {" "}FAQ{" "}
              </span>
              <h2 className="text-3xl font-black mt-3">
                Frequently Asked Questions
              </h2>
            </div>
            <div className="space-y-3 mt-10">
              <div className="faq-item bg-white rounded-2xl border overflow-hidden">
                <button className="faq-question w-full p-5 flex justify-between items-center text-left font-bold">
                  <span>
                    Who can join this course?
                  </span>
                  <i className="fa-solid fa-chevron-down faq-icon"></i>
                </button>
                <div className="faq-answer px-5 pb-5 text-sm text-slate-500 leading-6">
                  Students, beginners, graphic designers, digital creators, social media professionals and freelancers can join this course.
                </div>
              </div>
              <div className="faq-item bg-white rounded-2xl border overflow-hidden">
                <button className="faq-question w-full p-5 flex justify-between items-center text-left font-bold">
                  <span>
                    Is this course practical?
                  </span>
                  <i className="fa-solid fa-chevron-down faq-icon"></i>
                </button>
                <div className="faq-answer px-5 pb-5 text-sm text-slate-500 leading-6">
                  Yes. The curriculum is designed around hands-on AI design, image, branding, social media, video and portfolio projects.
                </div>
              </div>
              <div className="faq-item bg-white rounded-2xl border overflow-hidden">
                <button className="faq-question w-full p-5 flex justify-between items-center text-left font-bold">
                  <span>
                    Will I learn prompt engineering?
                  </span>
                  <i className="fa-solid fa-chevron-down faq-icon"></i>
                </button>
                <div className="faq-answer px-5 pb-5 text-sm text-slate-500 leading-6">
                  Yes. A dedicated module covers structured prompts, style, composition, references, variations and creative prompt libraries.
                </div>
              </div>
              <div className="faq-item bg-white rounded-2xl border overflow-hidden">
                <button className="faq-question w-full p-5 flex justify-between items-center text-left font-bold">
                  <span>
                    Can I use these skills for freelancing?
                  </span>
                  <i className="fa-solid fa-chevron-down faq-icon"></i>
                </button>
                <div className="faq-answer px-5 pb-5 text-sm text-slate-500 leading-6">
                  Yes. The final modules focus on portfolio creation, client briefs, proposals, revisions, pricing and professional creative workflow.
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="hero-bg text-white py-16">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl glass flex items-center justify-center text-2xl">
              <i className="fa-solid fa-wand-magic-sparkles"></i>
            </div>
            <h2 className="text-3xl md:text-5xl font-black mt-6">
              Turn Your Ideas Into{" "}
              <span className="text-cyan-300">
                {" "}Professional AI Creatives{" "}
              </span>
            </h2>
            <p className="text-blue-100 max-w-2xl mx-auto mt-5 leading-7">
              Learn AI design tools, prompt engineering and complete creative workflows at Career Optics Computer Academy.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <a href="#admission" className="bg-white text-blue-700 font-bold px-7 py-3.5 rounded-xl">
                {" "}Apply for Admission{" "}
              </a>
              <a href="https://wa.me/918252532179" target="_blank" className="glass font-bold px-7 py-3.5 rounded-xl">
                {" "}
                <i className="fa-brands fa-whatsapp mr-2"></i>
                {" "}WhatsApp Us{" "}
              </a>
            </div>
          </div>
        </section>
        <footer className="bg-slate-950 text-slate-400">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                  </div>
                  <div>
                    <h3 className="text-white font-black">
                      Career Optics Computer Academy
                    </h3>
                    <p className="text-xs">
                      Skill • Career • Future
                    </p>
                  </div>
                </div>
                <p className="text-sm leading-6 mt-5">
                  Professional skill development and career-oriented practical training.
                </p>
              </div>
              <div>
                <h4 className="text-white font-bold mb-4">
                  Course
                </h4>
                <ul className="space-y-3 text-sm">
                  <li>
                    <a href="#overview" className="hover:text-white">
                      Overview
                    </a>
                  </li>
                  <li>
                    <a href="#syllabus" className="hover:text-white">
                      Syllabus
                    </a>
                  </li>
                  <li>
                    <a href="#tools" className="hover:text-white">
                      Tools
                    </a>
                  </li>
                  <li>
                    <a href="#projects" className="hover:text-white">
                      Projects
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-bold mb-4">
                  Career
                </h4>
                <ul className="space-y-3 text-sm">
                  <li>
                    AI Graphic Designer
                  </li>
                  <li>
                    Creative Designer
                  </li>
                  <li>
                    Digital Creator
                  </li>
                  <li>
                    AI Freelancer
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-bold mb-4">
                  Contact
                </h4>
                <ul className="space-y-3 text-sm">
                  <li>
                    <i className="fa-solid fa-phone mr-2"></i>
                    {" "}Admission Support
                  </li>
                  <li>
                    <i className="fa-brands fa-whatsapp mr-2"></i>
                    {" "}WhatsApp Support
                  </li>
                  <li>
                    <i className="fa-solid fa-location-dot mr-2"></i>
                    {" "}Career Optics Computer Academy
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-slate-800 mt-10 pt-6 text-center text-xs">
              © 2026 Career Optics Computer Academy. All Rights Reserved.
            </div>
          </div>
        </footer>
        <a href="https://wa.me/918252532179" target="_blank" className="whatsapp" aria-label="WhatsApp">
          {" "}
          <i className="fa-brands fa-whatsapp"></i>
          {" "}
        </a>
        <script dangerouslySetInnerHTML={{ __html: js_d092d71d }} />
      </body>
    </html>
  );
}
