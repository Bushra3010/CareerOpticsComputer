import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import WhatsappWidget from "../components/WhatsappWidget";
import { BRAND } from "../components/brand";
import js_c1268ab4 from "../behaviour/c1268ab4.js?raw";
import js_courses from "../behaviour/courses.js?raw";

/**
 * course.html?c=<code> — one course from the ERP, for every course that has
 * no hand-written page of its own.
 *
 * The page ships the layout with placeholders; behaviour/courses.js fills
 * it from public_course() (supabase/schema/website-courses.sql): the name,
 * photo, duration, fee, eligibility and the syllabus as Academics keeps it.
 *
 * The enquiry form needs no script of its own: public/apply.js (loaded by
 * cms.js) sends it to the chosen centre's Admission Leads, with the course
 * filled in.
 */
export default function Course() {
  return (
    <html lang="en">
      <head>
        <script src="/cms-config.js"></script>
        <script src="/cms.js" defer></script>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{`Course | ${BRAND.name}`}</title>
        <meta name="description" content={`Computer courses at ${BRAND.name}, Ara (Bihar): duration, fee, syllabus and online admission.`} />
        <link rel="icon" href="/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href={"https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap"} rel="stylesheet" />
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://unpkg.com/lucide@latest"></script>
        <style dangerouslySetInnerHTML={{ __html: "body{font-family:Poppins,system-ui,sans-serif;background:#f8fafc;margin:0}.shadow-soft{box-shadow:0 14px 34px rgba(11,35,80,.08)}details summary{list-style:none}details summary::-webkit-details-marker{display:none}" }} />
      </head>
      <body>
        <SiteHeader />

        <section className="bg-gradient-to-br from-[#0b2350] via-[#132f6b] to-[#1e3a8a] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-sm text-blue-100">
            <a href="index.html" className="hover:text-white">Home</a>
            <span className="mx-2">/</span>
            <a href="computer-course.html" className="hover:text-white">Courses</a>
            <span className="mx-2">/</span>
            <span id="cdCrumb" className="text-white font-semibold"></span>
          </div>
        </section>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div id="courseState" className="py-20 text-center">
            <p className="text-slate-500">Loading the course…</p>
          </div>

          <div id="courseDetail" hidden>
            <div className="grid lg:grid-cols-[1.1fr_.9fr] gap-8 items-start">
              <div>
                <span id="cdCategory" className="inline-block px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold"></span>
                <h1 id="cdName" className="mt-3 text-3xl sm:text-4xl font-black text-[#0b2350] leading-tight"></h1>
                <p id="cdDescription" className="mt-4 text-slate-600 leading-7"></p>
                <div id="cdFacts" className="mt-6 grid grid-cols-2 gap-3"></div>
                <div id="cdEligibility" className="mt-6 rounded-xl border-l-4 border-orange-500 bg-white p-4" hidden>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Who can join</div>
                  <p id="cdEligibilityText" className="mt-1 text-slate-700"></p>
                </div>
              </div>
              <div id="cdMedia" className="aspect-[16/10] rounded-2xl overflow-hidden shadow-soft bg-slate-200"></div>
            </div>

            <div className="mt-12 grid lg:grid-cols-[1.1fr_.9fr] gap-8 items-start">
              <section id="cdSyllabus" hidden>
                <h2 className="text-2xl font-black text-[#0b2350]">Syllabus</h2>
                <p className="mt-1 text-sm text-slate-500">What you learn, module by module.</p>
                <div id="cdModules" className="mt-5 grid gap-3"></div>
              </section>

              <section className="rounded-2xl bg-white p-6 shadow-soft border border-slate-100 lg:sticky lg:top-28">
                <h2 className="text-xl font-black text-[#0b2350]">Apply for this course</h2>
                <p className="mt-1 text-sm text-slate-500">Leave your details and the centre will call you back.</p>
                <form className="mt-5 grid gap-4">
                  <div className="grid gap-1.5">
                    <label htmlFor="cdFormName" className="text-sm font-semibold text-slate-700">Student name *</label>
                    <input id="cdFormName" name="name" type="text" required maxLength={120} autoComplete="name" className="rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500" />
                  </div>
                  <div className="grid gap-1.5">
                    <label htmlFor="cdFormPhone" className="text-sm font-semibold text-slate-700">Mobile number *</label>
                    <input id="cdFormPhone" name="phone" type="tel" required inputMode="numeric" pattern="[6-9][0-9]{9}" maxLength={10} placeholder="10-digit mobile" title="Enter a 10-digit mobile number" className="rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500" />
                  </div>
                  <div className="grid gap-1.5">
                    <label htmlFor="cdFormCourse" className="text-sm font-semibold text-slate-700">Course</label>
                    <input id="cdFormCourse" name="course" type="text" readOnly className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-600" />
                  </div>
                  <div className="grid gap-1.5">
                    <label htmlFor="cdFormCity" className="text-sm font-semibold text-slate-700">City / village</label>
                    <input id="cdFormCity" name="city" type="text" maxLength={80} className="rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500" />
                  </div>
                  <button type="submit" className="mt-1 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 transition">Send enquiry</button>
                  <p className="text-xs text-slate-400 text-center">
                    Or call <a href={`tel:+${BRAND.phoneIntl}`} className="font-semibold text-blue-600">{BRAND.phone}</a>
                  </p>
                </form>
              </section>
            </div>
          </div>
        </main>

        <SiteFooter />
        <WhatsappWidget />
        <script dangerouslySetInnerHTML={{ __html: js_c1268ab4 }} />
        <script dangerouslySetInnerHTML={{ __html: js_courses }} />
        <script dangerouslySetInnerHTML={{ __html: `document.addEventListener("DOMContentLoaded",function(){if(window.lucide)lucide.createIcons()});` }} />
      </body>
    </html>
  );
}
