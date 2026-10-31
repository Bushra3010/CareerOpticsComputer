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

/** graphics.html */
export default function Graphics() {
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
        <section id="courses" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-blue-600 font-black text-xs uppercase tracking-[.2em]">
                {" "}
              </span>
              <h2 className="mt-3 text-3xl sm:text-4xl font-black text-slate-900">
                <span className="gradient-text">
                  {" "}Graphic Design & Architecture Courses{" "}
                </span>
              </h2>
            </div>
            <div id="courseGrid" className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <div className="course-card course-item bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-soft" data-category="basic">
                <div className="relative h-48 overflow-hidden">
                  <img src="data:image/jpeg;base64,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" className="course-img w-full h-full object-cover" alt="Google Suite" />
                  {" "}
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black">
                    {" "}Graphic{" "}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-black text-lg">
                    Photoshop 7
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-5">
                    Google Docs, Sheets, Drive, Forms, Gmail and online collaboration.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold">
                      {" "}3 Months{" "}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold">
                      {" "}Beginner{" "}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-5 pt-4 border-t">
                    <div>
                      <span className="text-[10px] text-slate-400">
                        {" "}Course Fee{" "}
                      </span>
                      <div className="font-black text-blue-600">
                        ₹1,499
                      </div>
                    </div>
                    <a href="photoshop7.html" className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition">
                      Details
                      <span>
                        →
                      </span>
                    </a>
                  </div>
                </div>
              </div>
              <div className="course-card course-item bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-soft" data-category="basic">
                <div className="relative h-48 overflow-hidden">
                  <img src={"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRceEO9BIY4mAFnafsf6nc2x-yeDezeqTRRAKu9HNf8ug&s=10"} className="course-img w-full h-full object-cover" alt="MS Office" />
                  {" "}
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-indigo-600 text-white text-[10px] font-black">
                    {" "}Graphic{" "}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-black text-lg">
                    Photoshop CC
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-5">
                    MS Word, Excel, PowerPoint, document and office productivity.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold">
                      {" "}3 Months{" "}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold">
                      {" "}Practical{" "}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-5 pt-4 border-t">
                    <div>
                      <span className="text-[10px] text-slate-400">
                        {" "}Course Fee{" "}
                      </span>
                      <div className="font-black text-blue-600">
                        ₹1,499
                      </div>
                    </div>
                    <a href="ms-office.html" className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition">
                      Details
                      <span>
                        →
                      </span>
                    </a>
                  </div>
                </div>
              </div>
              <div className="course-card course-item bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-soft" data-category="accounting">
                <div className="relative h-48 overflow-hidden">
                  <img src={"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQh2pc-V9hXw4QKIIQV2Jj7dRyXo0cLiz1QZkpY1I3pdw&s=10"} className="course-img w-full h-full object-cover" alt="Tally Prime" />
                  {" "}
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black">
                    {" "}Graphic{" "}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-black text-lg">
                    Photoshop Lighroom
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-5">
                    Accounting, GST, inventory, taxation, payroll and reports.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold">
                      {" "}3 Months{" "}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold">
                      {" "}Job Ready{" "}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-5 pt-4 border-t">
                    <div>
                      <span className="text-[10px] text-slate-400">
                        {" "}Course Fee{" "}
                      </span>
                      <div className="font-black text-blue-600">
                        ₹1,499
                      </div>
                    </div>
                    <a href="ps_lightroom.html" className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition">
                      Details
                      <span>
                        →
                      </span>
                    </a>
                  </div>
                </div>
              </div>
              <div className="course-card course-item bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-soft" data-category="accounting">
                <div className="relative h-48 overflow-hidden">
                  <img src={"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTAsdX4qwCXhY31BPsmOcnXIhaZnEvNVMEjmik7mn_hTOq1dNlPez2yEGE&s=10"} className="course-img w-full h-full object-cover" alt="Tally Prime" />
                  {" "}
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black">
                    {" "}Graphic{" "}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-black text-lg">
                    Canva
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-5">
                    Accounting, GST, inventory, taxation, payroll and reports.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold">
                      {" "}3 Months{" "}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold">
                      {" "}Job Ready{" "}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-5 pt-4 border-t">
                    <div>
                      <span className="text-[10px] text-slate-400">
                        {" "}Course Fee{" "}
                      </span>
                      <div className="font-black text-blue-600">
                        ₹1,499
                      </div>
                    </div>
                    <a href="canva.html" className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition">
                      Details
                      <span>
                        →
                      </span>
                    </a>
                  </div>
                </div>
              </div>
              <div className="course-card course-item bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-soft" data-category="basic">
                <div className="relative h-48 overflow-hidden">
                  <img src="https://www.computecindia.in/vadmin/uploads/course/1000020260725072803.png" className="course-img w-full h-full object-cover" alt="Computer Course" />
                  {" "}
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-blue-600 text-white text-[10px] font-black">
                    {" "}Graphic{" "}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-black text-lg text-slate-900">
                    <center>
                      Coral Draw{" "}
                    </center>
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-5">
                    Data Entry, MS Office, Excel, Internet, Email, Documentation, MIS Reporting, Online Work और Office Management
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold text-slate-600">
                      {" "}3 Months{" "}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold text-slate-600">
                      {" "}Beginner{" "}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-5 pt-4 border-t">
                    <div>
                      <span className="text-[10px] text-slate-400">
                        {" "}Course Fee{" "}
                      </span>
                      <div className="font-black text-blue-600">
                        ₹2,499
                      </div>
                    </div>
                    <a href="coral-draw.html" className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition">
                      Details
                      <span>
                        →
                      </span>
                    </a>
                  </div>
                </div>
              </div>
              <div className="course-card course-item bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-soft" data-category="basic">
                <div className="relative h-48 overflow-hidden">
                  <img src="https://www.computecindia.in/vadmin/uploads/course/1000020260725075040.png" className="course-img w-full h-full object-cover" alt="Computer Course" />
                  {" "}
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-blue-600 text-white text-[10px] font-black">
                    {" "}Graphic{" "}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-black text-lg text-slate-900">
                    <center>
                      Adobe Illustrator{" "}
                    </center>
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-5">
                    Data Entry, MS Office, Excel, Internet, Email, Documentation, MIS Reporting, Online Work और Office Management
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold text-slate-600">
                      {" "}3 Months{" "}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold text-slate-600">
                      {" "}Beginner{" "}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-5 pt-4 border-t">
                    <div>
                      <span className="text-[10px] text-slate-400">
                        {" "}Course Fee{" "}
                      </span>
                      <div className="font-black text-blue-600">
                        ₹2,499
                      </div>
                    </div>
                    <a href="illustrator.html" className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition">
                      Details
                      <span>
                        →
                      </span>
                    </a>
                  </div>
                </div>
              </div>
              <div className="course-card course-item bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-soft" data-category="basic">
                <div className="relative h-48 overflow-hidden">
                  <img src="https://www.computecindia.in/vadmin/uploads/course/1000020260725072803.png" className="course-img w-full h-full object-cover" alt="Computer Course" />
                  {" "}
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-blue-600 text-white text-[10px] font-black">
                    {" "}Graphic{" "}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-black text-lg text-slate-900">
                    <center>
                      Adobe Indesign{" "}
                    </center>
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-5">
                    Data Entry, MS Office, Excel, Internet, Email, Documentation, MIS Reporting, Online Work और Office Management
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold text-slate-600">
                      {" "}3 Months{" "}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold text-slate-600">
                      {" "}Beginner{" "}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-5 pt-4 border-t">
                    <div>
                      <span className="text-[10px] text-slate-400">
                        {" "}Course Fee{" "}
                      </span>
                      <div className="font-black text-blue-600">
                        ₹2,499
                      </div>
                    </div>
                    <a href="indesign.html" className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition">
                      Details
                      <span>
                        →
                      </span>
                    </a>
                  </div>
                </div>
              </div>
              <div className="course-card course-item bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-soft" data-category="basic">
                <div className="relative h-48 overflow-hidden">
                  <img src="https://cdn.mos.cms.futurecdn.net/j5uY5iBBQ5UtVtRwm5oWjN.png" className="course-img w-full h-full object-cover" alt="Computer Course" />
                  {" "}
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-blue-600 text-white text-[10px] font-black">
                    {" "}Graphic{" "}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-black text-lg text-slate-900">
                    <center>
                      Adobe Xpress{" "}
                    </center>
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-5">
                    Data Entry, MS Office, Excel, Internet, Email, Documentation, MIS Reporting, Online Work और Office Management
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold text-slate-600">
                      {" "}3 Months{" "}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold text-slate-600">
                      {" "}Beginner{" "}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-5 pt-4 border-t">
                    <div>
                      <span className="text-[10px] text-slate-400">
                        {" "}Course Fee{" "}
                      </span>
                      <div className="font-black text-blue-600">
                        ₹2,499
                      </div>
                    </div>
                    <a href="xpress.html" className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition">
                      Details
                      <span>
                        →
                      </span>
                    </a>
                  </div>
                </div>
              </div>
              <div className="course-card course-item bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-soft" data-category="design">
                <div className="relative h-48 overflow-hidden">
                  <img src="image/cad.jpg" className="course-img w-full h-full object-cover" alt="Photoshop" />
                  {" "}
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-pink-600 text-white text-[10px] font-black">
                    {" "}DESIGN{" "}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-black text-lg">
                    AutoCad 2D & 3D
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-5">
                    Photo editing, poster design, social media graphics and retouching.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold">
                      {" "}6 Months{" "}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold">
                      {" "}Advanced{" "}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-5 pt-4 border-t">
                    <div>
                      <span className="text-[10px] text-slate-400">
                        {" "}Course Fee{" "}
                      </span>
                      <div className="font-black text-blue-600">
                        ₹5,499
                      </div>
                    </div>
                    <a href="autocad.html" className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition">
                      Details
                      <span>
                        →
                      </span>
                    </a>
                  </div>
                </div>
              </div>
              <div className="course-card course-item bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-soft" data-category="design">
                <div className="relative h-48 overflow-hidden">
                  <img src="image/toon.jpg" className="course-img w-full h-full object-cover" alt="Photoshop" />
                  {" "}
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-pink-600 text-white text-[10px] font-black">
                    {" "}DESIGN{" "}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-black text-lg">
                    2D & 3D Animation
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-5">
                    Photo editing, poster design, social media graphics and retouching.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold">
                      {" "}6 Months{" "}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold">
                      {" "}Advanced{" "}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-5 pt-4 border-t">
                    <div>
                      <span className="text-[10px] text-slate-400">
                        {" "}Course Fee{" "}
                      </span>
                      <div className="font-black text-blue-600">
                        ₹5,499
                      </div>
                    </div>
                    <a href="animation.html" className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition">
                      Details
                      <span>
                        →
                      </span>
                    </a>
                  </div>
                </div>
              </div>
              <div className="course-card course-item bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-soft" data-category="design">
                <div className="relative h-48 overflow-hidden">
                  <img src="image/sketch.jpg" className="course-img w-full h-full object-cover" alt="Photoshop" />
                  {" "}
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-pink-600 text-white text-[10px] font-black">
                    {" "}DESIGN{" "}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-black text-lg">
                    Drawing & Designing
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-5">
                    Photo editing, poster design, social media graphics and retouching.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold">
                      {" "}6 Months{" "}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold">
                      {" "}Advanced{" "}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-5 pt-4 border-t">
                    <div>
                      <span className="text-[10px] text-slate-400">
                        {" "}Course Fee{" "}
                      </span>
                      <div className="font-black text-blue-600">
                        ₹5,499
                      </div>
                    </div>
                    <a href="drawing.html" className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition">
                      Details
                      <span>
                        →
                      </span>
                    </a>
                  </div>
                </div>
              </div>
              <div className="course-card course-item bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-soft" data-category="design">
                <div className="relative h-48 overflow-hidden">
                  <img src="image/album.jpg" className="course-img w-full h-full object-cover" alt="Photoshop" />
                  {" "}
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-pink-600 text-white text-[10px] font-black">
                    {" "}DESIGN{" "}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-black text-lg">
                    Album Desigining
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-5">
                    Photo editing, poster design, social media graphics and retouching.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold">
                      {" "}3 Months{" "}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold">
                      {" "}Advanced{" "}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-5 pt-4 border-t">
                    <div>
                      <span className="text-[10px] text-slate-400">
                        {" "}Course Fee{" "}
                      </span>
                      <div className="font-black text-blue-600">
                        ₹5,499
                      </div>
                    </div>
                    <a href="album-designing.html" className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition">
                      Details
                      <span>
                        →
                      </span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
                Hire for Any{" "}
                <span className="gradient-text">
                  {" "}Job Role{" "}
                </span>
              </h2>
              <p className="mt-4 text-sm sm:text-base text-slate-500 leading-7">
                Select a profile to view details and submit your hiring requirement.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 mt-12">
              <div className="role-card bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 flex flex-col">
                <div className="flex items-center justify-between">
                  <div className="role-icon w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" data-lucide="database" aria-hidden="true" className="lucide lucide-database w-6 h-6">
                      <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                      <path d="M3 5V19A9 3 0 0 0 21 19V5"></path>
                      <path d="M3 12A9 3 0 0 0 21 12"></path>
                    </svg>
                  </div>
                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-green-50 text-green-600">
                    {" "}Hiring{" "}
                  </span>
                </div>
                <h3 className="font-black text-lg mt-5">
                  🎨 Graphic Designer
                </h3>
                <p className="text-xs text-slate-500 leading-6 mt-2 flex-1">
                  Hire candidates skilled in data entry, MS Excel, MS Office, typing and documentation.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-bold">
                    {" "}Excel{" "}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-bold">
                    {" "}Typing{" "}
                  </span>
                </div>
                <a href="data-entry-operator.html" className="apply-btn mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-3 text-xs font-black">
                  Apply / Hire Now
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" data-lucide="arrow-up-right" aria-hidden="true" className="lucide lucide-arrow-up-right w-4 h-4">
                    <path d="M7 7h10v10"></path>
                    <path d="M7 17 17 7"></path>
                  </svg>
                </a>
              </div>
              <div className="role-card bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 flex flex-col">
                <div className="role-icon w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" data-lucide="user-round-check" aria-hidden="true" className="lucide lucide-user-round-check w-6 h-6">
                    <path d="M2 21a8 8 0 0 1 13.292-6"></path>
                    <circle cx="10" cy="8" r="5"></circle>
                    <path d="m16 19 2 2 4-4"></path>
                  </svg>
                </div>
                <h3 className="font-black text-lg mt-5">
                  <center>
                    🏗️ Architectural Designer{" "}
                  </center>
                </h3>
                <p className="text-xs text-slate-500 leading-6 mt-2 flex-1">
                  Student counselling, admission enquiry handling, Sales professionals for lead generation, follow-up calling, follow-up and customer handling .
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                    {" "}Counselling{" "}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                    {" "}Follow-up{" "}
                  </span>
                </div>
                <a href="admission-counsellor.html" className="apply-btn mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-xs font-black">
                  Apply / Hire Now
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" data-lucide="arrow-up-right" aria-hidden="true" className="lucide lucide-arrow-up-right w-4 h-4">
                    <path d="M7 7h10v10"></path>
                    <path d="M7 17 17 7"></path>
                  </svg>
                </a>
              </div>
              <div className="role-card bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 flex flex-col">
                <div className="flex items-center justify-between">
                  <div className="role-icon w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" data-lucide="calculator" aria-hidden="true" className="lucide lucide-calculator w-6 h-6">
                      <rect width="16" height="20" x="4" y="2" rx="2"></rect>
                      <line x1="8" x2="16" y1="6" y2="6"></line>
                      <line x1="16" x2="16" y1="14" y2="18"></line>
                      <path d="M16 10h.01"></path>
                      <path d="M12 10h.01"></path>
                      <path d="M8 10h.01"></path>
                      <path d="M12 14h.01"></path>
                      <path d="M8 14h.01"></path>
                      <path d="M12 18h.01"></path>
                      <path d="M8 18h.01"></path>
                    </svg>
                  </div>
                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-green-50 text-green-600">
                    {" "}Hiring{" "}
                  </span>
                </div>
                <h3 className="font-black text-lg mt-5">
                  🛋️ Interior Designer
                </h3>
                <p className="text-xs text-slate-500 leading-6 mt-2 flex-1">
                  Trained accounting professionals with Tally, GST, billing and financial record skills.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="px-2.5 py-1 rounded-lg bg-orange-50 text-orange-700 text-[10px] font-bold">
                    {" "}Tally{" "}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-orange-50 text-orange-700 text-[10px] font-bold">
                    {" "}GST{" "}
                  </span>
                </div>
                <a href="accounting-expert.html" className="apply-btn mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white py-3 text-xs font-black">
                  Apply / Hire Now
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" data-lucide="arrow-up-right" aria-hidden="true" className="lucide lucide-arrow-up-right w-4 h-4">
                    <path d="M7 7h10v10"></path>
                    <path d="M7 17 17 7"></path>
                  </svg>
                </a>
              </div>
              <div className="role-card bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 flex flex-col">
                <div className="role-icon w-12 h-12 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" data-lucide="phone-call" aria-hidden="true" className="lucide lucide-phone-call w-6 h-6">
                    <path d="M13 2a9 9 0 0 1 9 9"></path>
                    <path d="M13 6a5 5 0 0 1 5 5"></path>
                    <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"></path>
                  </svg>
                </div>
                <h3 className="font-black text-lg mt-6">
                  <center>
                    🎨 Cartoon Designer{" "}
                  </center>
                </h3>
                <p className="text-xs text-slate-500 leading-6 mt-2 flex-1">
                  Customer support, calling, lead follow-up and communication professionals.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="px-2.5 py-1 rounded-lg bg-pink-50 text-pink-700 text-[10px] font-bold">
                    {" "}Calling{" "}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-pink-50 text-pink-700 text-[10px] font-bold">
                    {" "}CRM{" "}
                  </span>
                </div>
                <a href="telecaller.html" className="apply-btn mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white py-3 text-xs font-black">
                  Apply / Hire Now
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" data-lucide="arrow-up-right" aria-hidden="true" className="lucide lucide-arrow-up-right w-4 h-4">
                    <path d="M7 7h10v10"></path>
                    <path d="M7 17 17 7"></path>
                  </svg>
                </a>
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
