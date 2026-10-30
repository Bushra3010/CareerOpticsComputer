import DivBlock from "../components/DivBlock";
import SiteHeader from "../components/SiteHeader";
import StyleBlock from "../components/StyleBlock";
import StyleBlock2 from "../components/StyleBlock2";
import WhatsappWidget from "../components/WhatsappWidget";
import css_32f7cc4c from "../styles/32f7cc4c.css?raw";
import css_5756ba3d from "../styles/5756ba3d.css?raw";
import js_0023a4f0 from "../behaviour/0023a4f0.js?raw";
import js_1cff4192 from "../behaviour/1cff4192.js?raw";
import js_73893071 from "../behaviour/73893071.js?raw";
import js_c1268ab4 from "../behaviour/c1268ab4.js?raw";
import js_ea05b2d5 from "../behaviour/ea05b2d5.js?raw";

/** back-office.html */
export default function BackOffice() {
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
      <body className="text-gray-800">
        <SiteHeader />
        <script dangerouslySetInnerHTML={{ __html: js_73893071 }} />
        <StyleBlock />
        <div className="">
          <style dangerouslySetInnerHTML={{ __html: css_5756ba3d }} />
          <section className="bg-white border-b">
            <div className="max-w-7xl mx-auto px-4 py-10">
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="text-sm text-gray-500 mb-4">
                    Home / Courses / Office & Computer
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                      {" "}JOB ORIENTED{" "}
                    </span>
                    <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                      {" "}PRACTICAL TRAINING{" "}
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black leading-tight">
                    Back Office &{" "}
                    <span className="text-blue-600">
                      {" "}Computer Operator{" "}
                    </span>
                  </h2>
                  <p className="mt-5 text-gray-600 text-base md:text-lg leading-8 max-w-3xl">
                    Learn professional office computer skills including MS Word, Excel, PowerPoint, Internet, Email, Data Entry, Documentation, Digital Services, Office Automation and real-world back office work.
                  </p>
                  <div className="flex flex-wrap items-center gap-5 mt-6 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-500 text-lg">
                        {" "}★★★★★{" "}
                      </span>
                      <strong>
                        4.9
                      </strong>
                      <span className="text-gray-500">
                        {" "}Student Rating{" "}
                      </span>
                    </div>
                    <div className="text-gray-400">
                      |
                    </div>
                    <div>
                      🎓 Job-Oriented Course
                    </div>
                    <div>
                      💻 Practical Projects
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                    <div className="border rounded-xl p-4">
                      <div className="text-xl">
                        🎥
                      </div>
                      <strong className="block mt-2 text-sm">
                        {" "}Practical Classes{" "}
                      </strong>
                      {" "}
                      <span className="text-xs text-gray-500">
                        {" "}Hands-on training{" "}
                      </span>
                    </div>
                    <div className="border rounded-xl p-4">
                      <div className="text-xl">
                        📚
                      </div>
                      <strong className="block mt-2 text-sm">
                        {" "}12 Modules{" "}
                      </strong>
                      {" "}
                      <span className="text-xs text-gray-500">
                        {" "}Detailed syllabus{" "}
                      </span>
                    </div>
                    <div className="border rounded-xl p-4">
                      <div className="text-xl">
                        📝
                      </div>
                      <strong className="block mt-2 text-sm">
                        {" "}Assignments{" "}
                      </strong>
                      {" "}
                      <span className="text-xs text-gray-500">
                        {" "}Practice tasks{" "}
                      </span>
                    </div>
                    <div className="border rounded-xl p-4">
                      <div className="text-xl">
                        🏆
                      </div>
                      <strong className="block mt-2 text-sm">
                        {" "}Certificate{" "}
                      </strong>
                      {" "}
                      <span className="text-xs text-gray-500">
                        {" "}Career Optics Computer Centre{" "}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="bg-white border rounded-2xl shadow-lg overflow-hidden sticky top-24">
                    <div className="h-3 bg-blue-600"></div>
                    <div className="p-6">
                      <p className="text-xs uppercase tracking-wider font-bold text-blue-600">
                        Course Fee
                      </p>
                      <div className="flex items-end gap-2 mt-2">
                        <span className="text-4xl font-black">
                          {" "}₹3,500{" "}
                        </span>
                        <span className="line-through text-gray-400">
                          {" "}₹6,000{" "}
                        </span>
                      </div>
                      <p className="text-xs text-green-600 font-semibold mt-2">
                        Special admission offer available
                      </p>
                      <div className="border-t my-5"></div>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span>
                            Duration
                          </span>
                          <strong>
                            6 Months
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span>
                            Level
                          </span>
                          <strong>
                            Beginner → Advanced
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span>
                            Mode
                          </span>
                          <strong>
                            Classroom + Practical
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span>
                            Certificate
                          </span>
                          <strong>
                            Career Optics Computer Centre
                          </strong>
                        </div>
                      </div>
                      <a href="#admission" className="block text-center mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl">
                        {" "}Enroll Now →{" "}
                      </a>
                      {" "}
                      <a href="#content" className="block text-center mt-3 border py-3 rounded-xl font-semibold hover:bg-gray-50">
                        {" "}View Course Content{" "}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section id="overview" className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4">
              <div className="max-w-4xl">
                <span className="text-blue-600 text-sm font-bold uppercase">
                  {" "}Course Overview{" "}
                </span>
                <h2 className="text-3xl font-black mt-2">
                  Back Office & Computer Operator Course
                </h2>
                <p className="mt-4 text-gray-600 leading-8">
                  This program is designed for students, job seekers, freshers and beginners who want to develop professional computer and office administration skills. The training focuses on practical tasks commonly performed in offices, schools, institutes, companies, shops and service organizations.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-5 mt-8">
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                  <div className="text-3xl">
                    💻
                  </div>
                  <h3 className="font-bold text-lg mt-4">
                    Computer Skills
                  </h3>
                  <p className="text-sm text-gray-600 mt-2 leading-6">
                    Windows, file management, typing, software handling and troubleshooting.
                  </p>
                </div>
                <div className="bg-green-50 border border-green-100 rounded-2xl p-6">
                  <div className="text-3xl">
                    📊
                  </div>
                  <h3 className="font-bold text-lg mt-4">
                    Office Productivity
                  </h3>
                  <p className="text-sm text-gray-600 mt-2 leading-6">
                    MS Word, Excel, PowerPoint, PDF and professional documentation.
                  </p>
                </div>
                <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6">
                  <div className="text-3xl">
                    📁
                  </div>
                  <h3 className="font-bold text-lg mt-4">
                    Back Office Work
                  </h3>
                  <p className="text-sm text-gray-600 mt-2 leading-6">
                    Data entry, records, reports, emails and office coordination.
                  </p>
                </div>
              </div>
            </div>
          </section>
          <section id="content" className="py-12 bg-[#f7f8fa]">
            <div className="max-w-7xl mx-auto px-4">
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="bg-white border rounded-2xl overflow-hidden">
                    <div className="p-6 border-b">
                      <span className="text-blue-600 text-sm font-bold uppercase">
                        {" "}Course Content{" "}
                      </span>
                      <h2 className="text-2xl md:text-3xl font-black mt-2">
                        Back Office & Computer Operator Syllabus
                      </h2>
                      <p className="text-sm text-gray-500 mt-2">
                        12 Modules • Practical Learning • Job Preparation
                      </p>
                    </div>
                    <div className="module border-b">
                      <button data-inline-onclick="openModule(this)" className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50">
                        <div className="flex items-center gap-4">
                          <span className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-black">
                            01
                          </span>
                          <div>
                            <h3 className="font-bold">
                              Computer Fundamentals
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              Computer basics & operating concepts
                            </p>
                          </div>
                        </div>
                        <span className="lesson-arrow">
                          {" "}⌄{" "}
                        </span>
                      </button>
                      <div className="lesson-box px-5 pb-5">
                        <div className="ml-14 grid sm:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div>
                            ✓ What is Computer?
                          </div>
                          <div>
                            ✓ Types of Computers
                          </div>
                          <div>
                            ✓ Hardware & Software
                          </div>
                          <div>
                            ✓ Input & Output Devices
                          </div>
                          <div>
                            ✓ CPU, RAM & ROM
                          </div>
                          <div>
                            ✓ Storage Devices
                          </div>
                          <div>
                            ✓ Computer Generations
                          </div>
                          <div>
                            ✓ Basic Troubleshooting
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="module border-b">
                      <button data-inline-onclick="openModule(this)" className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50">
                        <div className="flex items-center gap-4">
                          <span className="w-10 h-10 rounded-lg bg-green-100 text-green-700 flex items-center justify-center font-black">
                            02
                          </span>
                          <div>
                            <h3 className="font-bold">
                              Windows & File Management
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              Windows operating system
                            </p>
                          </div>
                        </div>
                        <span className="lesson-arrow">
                          ⌄
                        </span>
                      </button>
                      <div className="lesson-box px-5 pb-5">
                        <div className="ml-14 grid sm:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div>
                            ✓ Windows Desktop
                          </div>
                          <div>
                            ✓ Start Menu & Taskbar
                          </div>
                          <div>
                            ✓ File Explorer
                          </div>
                          <div>
                            ✓ Creating Files & Folders
                          </div>
                          <div>
                            ✓ Copy / Cut / Paste
                          </div>
                          <div>
                            ✓ Rename & Delete
                          </div>
                          <div>
                            ✓ Search Files
                          </div>
                          <div>
                            ✓ Software Installation
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="module border-b">
                      <button data-inline-onclick="openModule(this)" className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50">
                        <div className="flex items-center gap-4">
                          <span className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-black">
                            03
                          </span>
                          <div>
                            <h3 className="font-bold">
                              Typing & Keyboard Skills
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              Speed & accuracy development
                            </p>
                          </div>
                        </div>
                        <span className="lesson-arrow">
                          ⌄
                        </span>
                      </button>
                      <div className="lesson-box px-5 pb-5">
                        <div className="ml-14 grid sm:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div>
                            ✓ Keyboard Introduction
                          </div>
                          <div>
                            ✓ Function Keys
                          </div>
                          <div>
                            ✓ Shortcut Keys
                          </div>
                          <div>
                            ✓ English Typing
                          </div>
                          <div>
                            ✓ Hindi Typing Basics
                          </div>
                          <div>
                            ✓ Numeric Keypad
                          </div>
                          <div>
                            ✓ Speed Practice
                          </div>
                          <div>
                            ✓ Accuracy Practice
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="module border-b">
                      <button data-inline-onclick="openModule(this)" className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50">
                        <div className="flex items-center gap-4">
                          <span className="w-10 h-10 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-black">
                            04
                          </span>
                          <div>
                            <h3 className="font-bold">
                              MS Word Professional
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              Professional document preparation
                            </p>
                          </div>
                        </div>
                        <span className="lesson-arrow">
                          ⌄
                        </span>
                      </button>
                      <div className="lesson-box px-5 pb-5">
                        <div className="ml-14 grid sm:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div>
                            ✓ Document Creation
                          </div>
                          <div>
                            ✓ Text Formatting
                          </div>
                          <div>
                            ✓ Fonts & Paragraphs
                          </div>
                          <div>
                            ✓ Page Setup & Margins
                          </div>
                          <div>
                            ✓ Tables
                          </div>
                          <div>
                            ✓ Header & Footer
                          </div>
                          <div>
                            ✓ Page Number
                          </div>
                          <div>
                            ✓ Styles & Themes
                          </div>
                          <div>
                            ✓ Mail Merge
                          </div>
                          <div>
                            ✓ Resume Making
                          </div>
                          <div>
                            ✓ Official Letter
                          </div>
                          <div>
                            ✓ PDF Export
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="module border-b">
                      <button data-inline-onclick="openModule(this)" className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50">
                        <div className="flex items-center gap-4">
                          <span className="w-10 h-10 rounded-lg bg-green-100 text-green-700 flex items-center justify-center font-black">
                            05
                          </span>
                          <div>
                            <h3 className="font-bold">
                              MS Excel & Data Management
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              Data entry & spreadsheet management
                            </p>
                          </div>
                        </div>
                        <span className="lesson-arrow">
                          ⌄
                        </span>
                      </button>
                      <div className="lesson-box px-5 pb-5">
                        <div className="ml-14 grid sm:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div>
                            ✓ Workbook & Worksheet
                          </div>
                          <div>
                            ✓ Rows & Columns
                          </div>
                          <div>
                            ✓ Data Entry
                          </div>
                          <div>
                            ✓ Cell Formatting
                          </div>
                          <div>
                            ✓ SUM & AVERAGE
                          </div>
                          <div>
                            ✓ COUNT & COUNTA
                          </div>
                          <div>
                            ✓ IF Formula
                          </div>
                          <div>
                            ✓ Sort & Filter
                          </div>
                          <div>
                            ✓ Data Validation
                          </div>
                          <div>
                            ✓ Tables
                          </div>
                          <div>
                            ✓ Charts
                          </div>
                          <div>
                            ✓ Print Settings
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="module border-b">
                      <button data-inline-onclick="openModule(this)" className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50">
                        <div className="flex items-center gap-4">
                          <span className="w-10 h-10 rounded-lg bg-pink-100 text-pink-700 flex items-center justify-center font-black">
                            06
                          </span>
                          <div>
                            <h3 className="font-bold">
                              MS PowerPoint
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              Professional presentations
                            </p>
                          </div>
                        </div>
                        <span className="lesson-arrow">
                          ⌄
                        </span>
                      </button>
                      <div className="lesson-box px-5 pb-5">
                        <div className="ml-14 grid sm:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div>
                            ✓ Presentation Creation
                          </div>
                          <div>
                            ✓ Slide Layout
                          </div>
                          <div>
                            ✓ Themes
                          </div>
                          <div>
                            ✓ Images & Shapes
                          </div>
                          <div>
                            ✓ Tables & Charts
                          </div>
                          <div>
                            ✓ SmartArt
                          </div>
                          <div>
                            ✓ Transitions
                          </div>
                          <div>
                            ✓ Animations
                          </div>
                          <div>
                            ✓ Presentation Delivery
                          </div>
                          <div>
                            ✓ Office Presentation Project
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="module border-b">
                      <button data-inline-onclick="openModule(this)" className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50">
                        <div className="flex items-center gap-4">
                          <span className="w-10 h-10 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center font-black">
                            07
                          </span>
                          <div>
                            <h3 className="font-bold">
                              Internet, Email & Communication
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              Professional digital communication
                            </p>
                          </div>
                        </div>
                        <span className="lesson-arrow">
                          ⌄
                        </span>
                      </button>
                      <div className="lesson-box px-5 pb-5">
                        <div className="ml-14 grid sm:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div>
                            ✓ Internet Basics
                          </div>
                          <div>
                            ✓ Browser Usage
                          </div>
                          <div>
                            ✓ Search Techniques
                          </div>
                          <div>
                            ✓ Download & Upload
                          </div>
                          <div>
                            ✓ Email Creation
                          </div>
                          <div>
                            ✓ Sending Email
                          </div>
                          <div>
                            ✓ Attachments
                          </div>
                          <div>
                            ✓ CC & BCC
                          </div>
                          <div>
                            ✓ Professional Email
                          </div>
                          <div>
                            ✓ Video Meeting Basics
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="module border-b">
                      <button data-inline-onclick="openModule(this)" className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50">
                        <div className="flex items-center gap-4">
                          <span className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-black">
                            08
                          </span>
                          <div>
                            <h3 className="font-bold">
                              Data Entry & Back Office Operations
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              Real office data handling
                            </p>
                          </div>
                        </div>
                        <span className="lesson-arrow">
                          ⌄
                        </span>
                      </button>
                      <div className="lesson-box px-5 pb-5">
                        <div className="ml-14 grid sm:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div>
                            ✓ Data Entry Process
                          </div>
                          <div>
                            ✓ Data Verification
                          </div>
                          <div>
                            ✓ Data Cleaning
                          </div>
                          <div>
                            ✓ Customer Records
                          </div>
                          <div>
                            ✓ Attendance Records
                          </div>
                          <div>
                            ✓ Employee Records
                          </div>
                          <div>
                            ✓ File Naming System
                          </div>
                          <div>
                            ✓ Document Organization
                          </div>
                          <div>
                            ✓ Daily MIS Entry
                          </div>
                          <div>
                            ✓ Office Data Management
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="module border-b">
                      <button data-inline-onclick="openModule(this)" className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50">
                        <div className="flex items-center gap-4">
                          <span className="w-10 h-10 rounded-lg bg-yellow-100 text-yellow-700 flex items-center justify-center font-black">
                            09
                          </span>
                          <div>
                            <h3 className="font-bold">
                              Office Documentation
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              Daily office documents
                            </p>
                          </div>
                        </div>
                        <span className="lesson-arrow">
                          ⌄
                        </span>
                      </button>
                      <div className="lesson-box px-5 pb-5">
                        <div className="ml-14 grid sm:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div>
                            ✓ Official Letters
                          </div>
                          <div>
                            ✓ Notices
                          </div>
                          <div>
                            ✓ Reports
                          </div>
                          <div>
                            ✓ Memos
                          </div>
                          <div>
                            ✓ Applications
                          </div>
                          <div>
                            ✓ Meeting Documents
                          </div>
                          <div>
                            ✓ Invoice Format
                          </div>
                          <div>
                            ✓ Quotation Format
                          </div>
                          <div>
                            ✓ Attendance Sheet
                          </div>
                          <div>
                            ✓ Office Register
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="module border-b">
                      <button data-inline-onclick="openModule(this)" className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50">
                        <div className="flex items-center gap-4">
                          <span className="w-10 h-10 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-black">
                            10
                          </span>
                          <div>
                            <h3 className="font-bold">
                              Digital Office & Online Services
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              Modern digital office skills
                            </p>
                          </div>
                        </div>
                        <span className="lesson-arrow">
                          ⌄
                        </span>
                      </button>
                      <div className="lesson-box px-5 pb-5">
                        <div className="ml-14 grid sm:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div>
                            ✓ Online Form Filling
                          </div>
                          <div>
                            ✓ PDF Management
                          </div>
                          <div>
                            ✓ Scan Documents
                          </div>
                          <div>
                            ✓ Print & Photocopy Workflow
                          </div>
                          <div>
                            ✓ Cloud Storage
                          </div>
                          <div>
                            ✓ Google Drive Basics
                          </div>
                          <div>
                            ✓ Digital Document Sharing
                          </div>
                          <div>
                            ✓ Online Applications
                          </div>
                          <div>
                            ✓ Basic Digital Services
                          </div>
                          <div>
                            ✓ Online Safety
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="module border-b">
                      <button data-inline-onclick="openModule(this)" className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50">
                        <div className="flex items-center gap-4">
                          <span className="w-10 h-10 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-black">
                            11
                          </span>
                          <div>
                            <h3 className="font-bold">
                              Office Administration & Communication
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              Professional workplace skills
                            </p>
                          </div>
                        </div>
                        <span className="lesson-arrow">
                          ⌄
                        </span>
                      </button>
                      <div className="lesson-box px-5 pb-5">
                        <div className="ml-14 grid sm:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div>
                            ✓ Office Workflow
                          </div>
                          <div>
                            ✓ Task Management
                          </div>
                          <div>
                            ✓ Record Management
                          </div>
                          <div>
                            ✓ Document Filing
                          </div>
                          <div>
                            ✓ Customer Communication
                          </div>
                          <div>
                            ✓ Telephone Etiquette
                          </div>
                          <div>
                            ✓ Professional Email
                          </div>
                          <div>
                            ✓ Workplace Communication
                          </div>
                          <div>
                            ✓ Time Management
                          </div>
                          <div>
                            ✓ Basic Interview Preparation
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="module">
                      <button data-inline-onclick="openModule(this)" className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50">
                        <div className="flex items-center gap-4">
                          <span className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-black">
                            12
                          </span>
                          <div>
                            <h3 className="font-bold">
                              Final Practical Project & Assessment
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              Job-ready practical evaluation
                            </p>
                          </div>
                        </div>
                        <span className="lesson-arrow">
                          ⌄
                        </span>
                      </button>
                      <div className="lesson-box px-5 pb-5">
                        <div className="ml-14 grid sm:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div>
                            ✓ MS Word Project
                          </div>
                          <div>
                            ✓ Excel Data Entry Project
                          </div>
                          <div>
                            ✓ PowerPoint Presentation
                          </div>
                          <div>
                            ✓ Professional Email Task
                          </div>
                          <div>
                            ✓ Data Management Task
                          </div>
                          <div>
                            ✓ Office Documentation
                          </div>
                          <div>
                            ✓ Back Office Simulation
                          </div>
                          <div>
                            ✓ Practical Examination
                          </div>
                          <div>
                            ✓ Viva / Interview
                          </div>
                          <div>
                            ✓ Final Certification
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <aside className="desktop-sidebar">
                  <div className="bg-white border rounded-2xl p-6 sticky top-24">
                    <h3 className="font-black text-xl">
                      Course Includes
                    </h3>
                    <div className="space-y-4 mt-6 text-sm">
                      <div className="flex gap-3">
                        <span>
                          💻
                        </span>
                        <div>
                          <strong>
                            Computer Practical
                          </strong>
                          <p className="text-gray-500 text-xs mt-1">
                            Hands-on lab practice
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <span>
                          📊
                        </span>
                        <div>
                          <strong>
                            MS Office
                          </strong>
                          <p className="text-gray-500 text-xs mt-1">
                            Word, Excel & PowerPoint
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <span>
                          ⌨️
                        </span>
                        <div>
                          <strong>
                            Typing Practice
                          </strong>
                          <p className="text-gray-500 text-xs mt-1">
                            Speed & accuracy
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <span>
                          📁
                        </span>
                        <div>
                          <strong>
                            Back Office Tasks
                          </strong>
                          <p className="text-gray-500 text-xs mt-1">
                            Real office activities
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <span>
                          📝
                        </span>
                        <div>
                          <strong>
                            Assignments
                          </strong>
                          <p className="text-gray-500 text-xs mt-1">
                            Practical assignments
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <span>
                          🏆
                        </span>
                        <div>
                          <strong>
                            Certificate
                          </strong>
                          <p className="text-gray-500 text-xs mt-1">
                            Career Optics Computer Centre certificate
                          </p>
                        </div>
                      </div>
                    </div>
                    <a href="#admission" className="block text-center bg-blue-600 text-white font-bold py-3 rounded-xl mt-7">
                      {" "}Enroll Now{" "}
                    </a>
                  </div>
                </aside>
              </div>
            </div>
          </section>
          <section id="jobs" className="py-14 bg-white">
            <div className="max-w-7xl mx-auto px-4">
              <div className="text-center">
                <span className="text-blue-600 font-bold text-sm uppercase">
                  {" "}Career Opportunities{" "}
                </span>
                <h2 className="text-3xl md:text-4xl font-black mt-2">
                  Jobs You Can Prepare For
                </h2>
                <p className="text-gray-500 mt-3">
                  Build practical skills for entry-level office roles.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
                <div className="course-card border rounded-2xl p-6">
                  <div className="text-3xl">
                    💻
                  </div>
                  <h3 className="font-bold mt-4">
                    Computer Operator
                  </h3>
                  <p className="text-sm text-gray-500 mt-2">
                    Computer operation and office documentation.
                  </p>
                </div>
                <div className="course-card border rounded-2xl p-6">
                  <div className="text-3xl">
                    ⌨️
                  </div>
                  <h3 className="font-bold mt-4">
                    Data Entry Operator
                  </h3>
                  <p className="text-sm text-gray-500 mt-2">
                    Data entry, verification and record management.
                  </p>
                </div>
                <div className="course-card border rounded-2xl p-6">
                  <div className="text-3xl">
                    📁
                  </div>
                  <h3 className="font-bold mt-4">
                    Back Office Executive
                  </h3>
                  <p className="text-sm text-gray-500 mt-2">
                    Office records, reports and documentation.
                  </p>
                </div>
                <div className="course-card border rounded-2xl p-6">
                  <div className="text-3xl">
                    🧑‍💼
                  </div>
                  <h3 className="font-bold mt-4">
                    Office Assistant
                  </h3>
                  <p className="text-sm text-gray-500 mt-2">
                    Daily office coordination and computer work.
                  </p>
                </div>
              </div>
            </div>
          </section>
          <section id="faq" className="py-14 bg-white">
            <div className="max-w-4xl mx-auto px-4">
              <div className="text-center mb-8">
                <span className="text-blue-600 font-bold text-sm uppercase">
                  {" "}FAQ{" "}
                </span>
                <h2 className="text-3xl font-black mt-2">
                  Frequently Asked Questions
                </h2>
              </div>
              <div className="space-y-3">
                <div className="border rounded-xl overflow-hidden">
                  <button data-inline-onclick="faq(this)" className="w-full flex justify-between p-5 text-left font-bold">
                    Who can join this course?
                    <span>
                      +
                    </span>
                  </button>
                  <div className="hidden px-5 pb-5 text-sm text-gray-600 leading-6">
                    Students, freshers, job seekers, beginners, data-entry aspirants and anyone who wants to develop professional computer and office skills.
                  </div>
                </div>
                <div className="border rounded-xl overflow-hidden">
                  <button data-inline-onclick="faq(this)" className="w-full flex justify-between p-5 text-left font-bold">
                    Is practical training included?
                    <span>
                      +
                    </span>
                  </button>
                  <div className="hidden px-5 pb-5 text-sm text-gray-600 leading-6">
                    Yes. The program focuses heavily on practical computer, MS Office, data-entry and office-work tasks.
                  </div>
                </div>
                <div className="border rounded-xl overflow-hidden">
                  <button data-inline-onclick="faq(this)" className="w-full flex justify-between p-5 text-left font-bold">
                    Will I learn MS Word and Excel?
                    <span>
                      +
                    </span>
                  </button>
                  <div className="hidden px-5 pb-5 text-sm text-gray-600 leading-6">
                    Yes. MS Word and MS Excel are major parts of the course, along with PowerPoint and digital office skills.
                  </div>
                </div>
                <div className="border rounded-xl overflow-hidden">
                  <button data-inline-onclick="faq(this)" className="w-full flex justify-between p-5 text-left font-bold">
                    Will I get a certificate?
                    <span>
                      +
                    </span>
                  </button>
                  <div className="hidden px-5 pb-5 text-sm text-gray-600 leading-6">
                    Students who successfully complete the required training and assessment can receive a Career Optics Computer Centre course completion certificate.
                  </div>
                </div>
              </div>
            </div>
          </section>
          <script dangerouslySetInnerHTML={{ __html: js_1cff4192 }} />
          <footer className="bg-slate-950 text-slate-300" data-cms-scope="footer">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="py-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white font-black text-xl">
                      P
                    </div>
                    <div>
                      <div className="font-black text-white text-lg">
                        Career Optics Computer Centre
                      </div>
                      <div className="text-xs text-slate-500">
                        Learn • Grow • Succeed
                      </div>
                    </div>
                  </div>
                  <p className="mt-5 text-slate-400 leading-7">
                    Computer education aur professional digital skills ke through students ko career-ready banana.
                  </p>
                  <div className="flex gap-3 mt-6">
                    <a href="#" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-blue-600 flex items-center justify-center transition">
                      <i data-lucide="facebook" className="w-5 h-5"></i>
                    </a>
                    <a href="#" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-pink-600 flex items-center justify-center transition">
                      <i data-lucide="instagram" className="w-5 h-5"></i>
                    </a>
                    <a href="#" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-red-600 flex items-center justify-center transition">
                      <i data-lucide="youtube" className="w-5 h-5"></i>
                    </a>
                    <a href="#" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-green-600 flex items-center justify-center transition">
                      <i data-lucide="message-circle" className="w-5 h-5"></i>
                    </a>
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">
                    Quick Links
                  </h3>
                  <ul className="mt-5 space-y-3">
                    <li>
                      <a href="index.html" className="hover:text-white transition">
                        {" "}Home{" "}
                      </a>
                    </li>
                    <li>
                      <a href="about.html" className="hover:text-white transition">
                        {" "}About Us{" "}
                      </a>
                    </li>
                    <li>
                      <a href="courses.html" className="hover:text-white transition">
                        {" "}Our Courses{" "}
                      </a>
                    </li>
                    <li>
                      <a href="franchise.html" className="hover:text-white transition">
                        {" "}Franchise{" "}
                      </a>
                    </li>
                    <li>
                      <a href="career.html" className="hover:text-white transition">
                        {" "}Career{" "}
                      </a>
                    </li>
                    <li>
                      <a href="contact.html" className="hover:text-white transition">
                        {" "}Contact{" "}
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">
                    Popular Courses
                  </h3>
                  <ul className="mt-5 space-y-3">
                    <li>
                      <a href="courses.html" className="hover:text-white transition">
                        {" "}ADCA{" "}
                      </a>
                    </li>
                    <li>
                      <a href="courses.html" className="hover:text-white transition">
                        {" "}Graphic Designing{" "}
                      </a>
                    </li>
                    <li>
                      <a href="courses.html" className="hover:text-white transition">
                        {" "}Tally Prime With GST{" "}
                      </a>
                    </li>
                    <li>
                      <a href="courses.html" className="hover:text-white transition">
                        {" "}Digital Marketing{" "}
                      </a>
                    </li>
                    <li>
                      <a href="courses.html" className="hover:text-white transition">
                        {" "}Website Design{" "}
                      </a>
                    </li>
                    <li>
                      <a href="courses.html" className="hover:text-white transition">
                        {" "}Python Programming{" "}
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">
                    Contact Information
                  </h3>
                  <div className="mt-5 space-y-5">
                    <div className="flex gap-3">
                      <i data-lucide="map-pin" className="w-5 h-5 text-blue-400 shrink-0">
                        {" "}
                      </i>
                      <span>
                        {" "}Career Optics Computer Centre,
                        <br />
                        Bihar, India{" "}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <i data-lucide="phone" className="w-5 h-5 text-blue-400 shrink-0">
                        {" "}
                      </i>
                      <a href="tel:+918252532179" className="hover:text-white">
                        {" "}+91 82525 32179{" "}
                      </a>
                    </div>
                    <div className="flex gap-3">
                      <i data-lucide="mail" className="w-5 h-5 text-blue-400 shrink-0">
                        {" "}
                      </i>
                      <a href="mailto:careeropticsconsultancy@gmail.com" className="hover:text-white">
                        {" "}careeropticsconsultancy@gmail.com{" "}
                      </a>
                    </div>
                    <div className="flex gap-3">
                      <i data-lucide="clock" className="w-5 h-5 text-blue-400 shrink-0">
                        {" "}
                      </i>
                      <span>
                        {" "}Mon – Sat
                        <br />
                        09:00 AM – 06:00 PM{" "}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="border-t border-white/10 py-6 flex flex-col md:flex-row justify-between items-center gap-3 text-sm">
                <p>
                  <span id="year"></span>
                  {" "}© 2026 Career Optics Computer Centre
                </p>
              </div>
            </div>
          </footer>
        </div>
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
