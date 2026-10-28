/** Shared by every page that carries it; written once here. */
export default function SiteFooter() {
  return (
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
                <a href="tel:+919876543210" className="hover:text-white">
                  {" "}+91 98765 43210{" "}
                </a>
              </div>
              <div className="flex gap-3">
                <i data-lucide="mail" className="w-5 h-5 text-blue-400 shrink-0">
                  {" "}
                </i>
                <a href="mailto:info@pnsacademy.in" className="hover:text-white">
                  {" "}info@pnsacademy.in{" "}
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
  );
}
