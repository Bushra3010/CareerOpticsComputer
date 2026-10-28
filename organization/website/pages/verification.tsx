import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import StyleBlock from "../components/StyleBlock";
import css_32f7cc4c from "../styles/32f7cc4c.css?raw";
import js_0023a4f0 from "../behaviour/0023a4f0.js?raw";
import js_73893071 from "../behaviour/73893071.js?raw";
import js_verification from "../behaviour/verification.js?raw";

const VERIFY_CSS = `
.v-tabs{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:24px}
.v-tab{padding:10px 18px;border-radius:999px;border:1px solid #e2e8f0;background:#fff;font-weight:700;font-size:14px;color:#334155;cursor:pointer}
.v-tab.active{background:#4f46e5;border-color:#4f46e5;color:#fff}
.v-form{display:grid;gap:14px;grid-template-columns:1fr;max-width:560px;margin:0 auto}
@media(min-width:640px){.v-form.two{grid-template-columns:1fr 1fr}}
.v-form label{display:block;font-size:13px;font-weight:700;color:#334155;margin-bottom:6px}
.v-form input{width:100%;border:1px solid #cbd5e1;border-radius:12px;padding:12px 14px;font-size:15px;background:#fff}
.v-btn{display:inline-block;background:#4f46e5;color:#fff;font-weight:700;border-radius:12px;padding:12px 20px;border:0;cursor:pointer;margin-top:12px}
.v-out{max-width:760px;margin:24px auto 0}
.v-table{width:100%;border-collapse:collapse;margin:12px 0;font-size:14px;background:#fff}
.v-table th,.v-table td{border:1px solid #e2e8f0;padding:8px 10px;text-align:left;vertical-align:top}
.v-table th{background:#f8fafc;color:#475569;font-weight:600;width:38%}
.v-marks th{width:auto}
.v-h3{font-weight:800;font-size:16px;margin:18px 0 4px;color:#0f172a}
.v-summary{font-size:14px;margin:6px 0 16px}
.v-pass{color:#047857;font-weight:800}
.v-fail{color:#b91c1c;font-weight:800}
.v-alert{border-radius:12px;padding:12px 14px;font-size:14px;margin:8px 0;font-weight:600}
.v-good{background:#ecfdf5;color:#047857;border:1px solid #a7f3d0}
.v-bad{background:#fef2f2;color:#b91c1c;border:1px solid #fecaca}
.v-note{font-size:13px;color:#64748b}
.v-card{border:2px solid #0f172a;border-radius:12px;padding:16px;background:#fff}
`;

/** verification.html — result, certificate, admit card and enrolment lookup. */
export default function PageVerification() {
  return (
    <html lang="en">
      <head>
        <script src="/cms-config.js"></script>
        <script src="/cms.js" defer></script>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Student Verification | Result, Certificate &amp; Admit Card</title>
        <meta name="description" content="Verify a student's result, certificate, admit card or enrollment by enrollment number." />
        <link rel="stylesheet" href="style.css" />
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href={"https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap"} rel="stylesheet" />
        <script src="https://unpkg.com/lucide@latest"></script>
        <script dangerouslySetInnerHTML={{ __html: js_0023a4f0 }} />
        <style dangerouslySetInnerHTML={{ __html: css_32f7cc4c }} />
        <style id="verify-style" dangerouslySetInnerHTML={{ __html: VERIFY_CSS }} />
      </head>
      <body>
        <SiteHeader />
        <script dangerouslySetInnerHTML={{ __html: js_73893071 }} />
        <StyleBlock />
        <section id="verify" className="py-16 bg-slate-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 text-xs font-black uppercase tracking-wider">
                Student Zone
              </span>
              <h1 className="mt-5 text-3xl sm:text-4xl font-black text-slate-900">Student Verification</h1>
              <p className="mt-3 text-slate-500">Check a result, verify a certificate, or download an admit card with the enrollment or application number.</p>
            </div>

            <div className="v-tabs" role="tablist">
              <button type="button" className="v-tab" data-tab="result">Result</button>
              <button type="button" className="v-tab" data-tab="certificate">Certificate</button>
              <button type="button" className="v-tab" data-tab="admit">Admit Card</button>
              <button type="button" className="v-tab" data-tab="enrollment">Enrollment</button>
            </div>

            <div data-panel="result">
              <form className="v-form two" data-kind="result">
                <div>
                  <label htmlFor="r-enrollment">Enrollment / Application No.</label>
                  <input id="r-enrollment" name="enrollment" placeholder="e.g. APP-2026-0008" autoComplete="off" />
                </div>
                <div>
                  <label htmlFor="r-dob">Date of birth</label>
                  <input id="r-dob" name="dob" type="date" />
                </div>
                <div><button type="submit" className="v-btn">Check result</button></div>
              </form>
              <div className="v-out" data-out="result"></div>
            </div>

            <div data-panel="certificate" hidden>
              <form className="v-form" data-kind="certificate">
                <div>
                  <label htmlFor="c-enrollment">Enrollment / Application No.</label>
                  <input id="c-enrollment" name="enrollment" placeholder="e.g. APP-2026-0008" autoComplete="off" />
                </div>
                <div><button type="submit" className="v-btn">Verify certificate</button></div>
              </form>
              <div className="v-out" data-out="certificate"></div>
            </div>

            <div data-panel="admit" hidden>
              <form className="v-form" data-kind="admit">
                <div>
                  <label htmlFor="a-enrollment">Enrollment / Application No.</label>
                  <input id="a-enrollment" name="enrollment" placeholder="e.g. APP-2026-0008" autoComplete="off" />
                </div>
                <div><button type="submit" className="v-btn">Get admit card</button></div>
              </form>
              <div className="v-out" data-out="admit"></div>
            </div>

            <div data-panel="enrollment" hidden>
              <form className="v-form" data-kind="enrollment">
                <div>
                  <label htmlFor="e-enrollment">Enrollment / Application No.</label>
                  <input id="e-enrollment" name="enrollment" placeholder="e.g. APP-2026-0008" autoComplete="off" />
                </div>
                <div><button type="submit" className="v-btn">Verify enrollment</button></div>
              </form>
              <div className="v-out" data-out="enrollment"></div>
            </div>
          </div>
        </section>
        <SiteFooter />
        <script dangerouslySetInnerHTML={{ __html: js_verification }} />
      </body>
    </html>
  );
}
