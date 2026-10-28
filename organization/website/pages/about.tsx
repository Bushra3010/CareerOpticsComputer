import DivBlock from "../components/DivBlock";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import StyleBlock from "../components/StyleBlock";
import StyleBlock2 from "../components/StyleBlock2";
import WhatsappWidget from "../components/WhatsappWidget";
import css_32f7cc4c from "../styles/32f7cc4c.css?raw";
import js_0023a4f0 from "../behaviour/0023a4f0.js?raw";
import js_54b08411 from "../behaviour/54b08411.js?raw";
import js_73893071 from "../behaviour/73893071.js?raw";
import js_c1268ab4 from "../behaviour/c1268ab4.js?raw";
import js_ea05b2d5 from "../behaviour/ea05b2d5.js?raw";

/** about.html */
export default function About() {
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
        <section id="why-join-us" className="relative overflow-hidden bg-slate-50 py-20">
          <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-blue-100/60 blur-3xl"></div>
          <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-indigo-100/60 blur-3xl"></div>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-14 max-w-3xl text-center">
              <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-blue-600">
                <i data-lucide="sparkles" className="h-4 w-4"></i>
                Why Choose Career Optics Computer Centre
              </span>
              <h2 className="text-3xl font-black leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
                Why{" "}
                <span className="text-blue-600">
                  Join Us?
                </span>
              </h2>
              <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-base">
                Career Optics Computer Centre is committed to providing practical, career-focused education that helps students develop digital skills, build confidence and prepare for real-world opportunities.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-blue-200 hover:shadow-xl">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition duration-300 group-hover:bg-blue-600 group-hover:text-white">
                  <i data-lucide="graduation-cap" className="h-6 w-6"></i>
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Industry-Focused Learning
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Learn practical and job-oriented skills designed according to current industry requirements.
                </p>
              </div>
              <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-blue-200 hover:shadow-xl">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition duration-300 group-hover:bg-indigo-600 group-hover:text-white">
                  <i data-lucide="laptop-2" className="h-6 w-6"></i>
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Practical Training
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Work on practical projects, assignments and real-world activities to strengthen your skills.
                </p>
              </div>
              <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-blue-200 hover:shadow-xl">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 transition duration-300 group-hover:bg-purple-600 group-hover:text-white">
                  <i data-lucide="briefcase-business" className="h-6 w-6"></i>
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Career Development
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Develop professional skills, communication and confidence needed to move towards better career opportunities.
                </p>
              </div>
              <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-blue-200 hover:shadow-xl">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition duration-300 group-hover:bg-emerald-600 group-hover:text-white">
                  <i data-lucide="users" className="h-6 w-6"></i>
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Expert Guidance
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Get continuous guidance and support from trainers throughout your learning journey.
                </p>
              </div>
            </div>
            <section id="roadmap" className="py-24">
              <div className="max-w-6xl mx-auto px-4">
                <div className="text-center reveal">
                  <div className="text-cyan-400 font-black uppercase tracking-[3px] text-sm">
                    Learning Roadmap
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black mt-4">
                    From Beginner To{" "}
                    <span className="text-gradient">
                      {" "}AI Professional{" "}
                    </span>
                  </h2>
                </div>
                <div className="relative mt-16">
                  <div className="hidden md:block absolute top-12 left-0 right-0 h-px bg-gradient-to-r from-purple-500 via-cyan-400 to-pink-500"></div>
                  <div className="grid md:grid-cols-4 gap-6">
                    <div className="relative reveal">
                      <div className="w-24 h-24 mx-auto rounded-full glass border-purple-500/30 flex items-center justify-center text-3xl font-black text-purple-300">
                        01
                      </div>
                      <div className="text-center mt-6">
                        <h3 className="font-black text-xl">
                          Computer Foundation
                        </h3>
                        <p className="text-gray-500 mt-3">
                          Computer basics, internet, office tools और digital literacy।
                        </p>
                      </div>
                    </div>
                    <div className="relative reveal">
                      <div className="w-24 h-24 mx-auto rounded-full glass flex items-center justify-center text-3xl font-black text-cyan-300">
                        02
                      </div>
                      <div className="text-center mt-6">
                        <h3 className="font-black text-xl">
                          Digital Skills
                        </h3>
                        <p className="text-gray-500 mt-3">
                          Design, web, marketing, productivity और online tools।
                        </p>
                      </div>
                    </div>
                    <div className="relative reveal">
                      <div className="w-24 h-24 mx-auto rounded-full glass flex items-center justify-center text-3xl font-black text-pink-300">
                        03
                      </div>
                      <div className="text-center mt-6">
                        <h3 className="font-black text-xl">
                          AI Skills
                        </h3>
                        <p className="text-gray-500 mt-3">
                          Prompt engineering, GenAI, automation और AI workflows।
                        </p>
                      </div>
                    </div>
                    <div className="relative reveal">
                      <div className="w-24 h-24 mx-auto rounded-full glass flex items-center justify-center text-3xl font-black text-green-300">
                        04
                      </div>
                      <div className="text-center mt-6">
                        <h3 className="font-black text-xl">
                          Career Projects
                        </h3>
                        <p className="text-gray-500 mt-3">
                          Real projects, portfolio, freelancing और career preparation।
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            <section id="founder-message" className="relative overflow-hidden bg-white py-20">
              <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-blue-50 blur-3xl"></div>
              <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-indigo-50 blur-3xl"></div>
              <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto mb-12 max-w-2xl text-center">
                  <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-blue-600">
                    <i data-lucide="message-circle" className="h-4 w-4"></i>
                    Leadership Message
                  </span>
                  <h2 className="mt-4 text-3xl font-black text-slate-900 sm:text-4xl">
                    Our Founder & Director{" "}
                    <span className="text-blue-600">
                      Says
                    </span>
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                    A message from the leadership team of Career Optics Computer Centre for every learner who dreams of building a successful future.
                  </p>
                </div>
                <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-xl">
                  <div className="grid items-center lg:grid-cols-5">
                    <div className="relative flex min-h-[360px] items-center justify-center overflow-hidden bg-slate-900 p-8 lg:col-span-2 lg:min-h-[480px]">
                      <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-blue-600/20"></div>
                      <div className="absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-indigo-500/20"></div>
                      <div className="relative z-10">
                        <div className="mx-auto h-56 w-56 overflow-hidden rounded-full border-8 border-white/10 shadow-2xl sm:h-64 sm:w-64">
                          <img src={"https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=700&q=85"} alt={"Founder & Director"} className="h-full w-full object-cover" />
                        </div>
                        <div className="absolute -bottom-5 left-1/2 w-max -translate-x-1/2 rounded-2xl bg-white px-6 py-3 text-center shadow-xl">
                          <h3 className="text-base font-black text-slate-900">
                            Founder & Director
                          </h3>
                          <p className="mt-1 text-xs font-semibold text-blue-600">
                            Career Optics Computer Centre
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-8 sm:p-10 lg:col-span-3 lg:p-14">
                      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                        <i data-lucide="quote" className="h-6 w-6"></i>
                      </div>
                      <blockquote className="text-lg font-semibold leading-8 text-slate-800 sm:text-xl">
                        “Education is not just about getting a certificate; it is about gaining the right skills, confidence and mindset to create a better future.”
                      </blockquote>
                      <p className="mt-6 text-sm leading-7 text-slate-600 sm:text-base">
                        At Career Optics Computer Centre, our goal is to make quality digital education accessible to every learner. We believe that practical knowledge, continuous learning and the right guidance can transform careers and lives.
                      </p>
                      <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                        We are committed to helping our students become job-ready, digitally skilled and confident enough to explore opportunities in employment, freelancing, entrepreneurship and the growing digital economy.
                      </p>
                      <div className="mt-8 flex items-center gap-4">
                        <div className="h-px w-12 bg-blue-600"></div>
                        <div>
                          <h4 className="text-base font-black text-slate-900">
                            Founder & Director
                          </h4>
                          <p className="text-xs font-medium text-slate-500">
                            Career Optics Computer Centre
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            <script src="https://unpkg.com/lucide@latest"></script>
            <script dangerouslySetInnerHTML={{ __html: js_54b08411 }} />
            <section id="founder-director" className="relative overflow-hidden bg-slate-50 py-20 sm:py-24">
              <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-blue-100 blur-3xl opacity-70"></div>
              <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-indigo-100 blur-3xl opacity-70"></div>
              <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl">
                  <div className="grid items-center lg:grid-cols-5">
                    <div className="relative order-2 p-8 sm:p-10 lg:order-1 lg:col-span-3 lg:p-14 xl:p-16">
                      <div className="pointer-events-none absolute right-8 top-8 opacity-[0.06]">
                        <i data-lucide="quote" className="h-32 w-32 text-blue-600"></i>
                      </div>
                      <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-blue-600">
                        <i data-lucide="message-square-quote" className="h-4 w-4"></i>
                        Leadership Message
                      </div>
                      <h2 className="max-w-2xl text-3xl font-black leading-tight text-slate-900 sm:text-4xl">
                        Our Founder & Director{" "}
                        <span className="text-blue-600">
                          {" "}Says{" "}
                        </span>
                      </h2>
                      <div className="mt-5 flex items-center gap-3">
                        <div className="h-1 w-12 rounded-full bg-blue-600"></div>
                        <div className="h-1 w-5 rounded-full bg-blue-200"></div>
                      </div>
                      <div className="relative mt-8">
                        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                          <i data-lucide="quote" className="h-6 w-6"></i>
                        </div>
                        <blockquote className="max-w-3xl text-xl font-bold leading-9 text-slate-800 sm:text-2xl lg:text-[27px] lg:leading-[1.5]">
                          “Education is not just about getting a certificate; it is about gaining the right skills, confidence and mindset to create a better future.”
                        </blockquote>
                      </div>
                      <div className="mt-7 max-w-2xl space-y-4 text-sm leading-7 text-slate-600 sm:text-base">
                        <p>
                          At{" "}
                          <strong className="font-bold text-slate-900">
                            {" "}Career Optics Computer Centre{" "}
                          </strong>
                          , our vision is to provide practical and career-oriented education that prepares learners for the opportunities of the digital world.
                        </p>
                        <p>
                          We believe that every student has the potential to grow. With the right skills, guidance and continuous learning, anyone can build a confident and successful career.
                        </p>
                      </div>
                      <div className="mt-8 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                          <i data-lucide="graduation-cap" className="mb-2 h-5 w-5 text-blue-600"></i>
                          <h4 className="text-sm font-bold text-slate-900">
                            Quality Education
                          </h4>
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            Practical learning for everyone.
                          </p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                          <i data-lucide="rocket" className="mb-2 h-5 w-5 text-blue-600"></i>
                          <h4 className="text-sm font-bold text-slate-900">
                            Career Growth
                          </h4>
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            Skills for a better future.
                          </p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                          <i data-lucide="handshake" className="mb-2 h-5 w-5 text-blue-600"></i>
                          <h4 className="text-sm font-bold text-slate-900">
                            Student Support
                          </h4>
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            Guidance at every step.
                          </p>
                        </div>
                      </div>
                      <div className="mt-9 flex items-end justify-between gap-5 border-t border-slate-200 pt-7"></div>
                    </div>
                    <div className="relative order-1 min-h-[400px] overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 sm:min-h-[500px] lg:order-2 lg:col-span-2 lg:min-h-[620px]">
                      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10"></div>
                      <div className="absolute -bottom-28 -left-28 h-80 w-80 rounded-full border border-white/10"></div>
                      <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-3xl"></div>
                      <div className="relative z-10 flex h-full min-h-[400px] items-center justify-center p-8 sm:min-h-[500px] lg:min-h-[620px]">
                        <div className="relative">
                          <div className="absolute -inset-5 rounded-[2rem] border border-white/20"></div>
                          <div className="absolute -inset-10 rounded-[2.5rem] border border-white/10"></div>
                          <div className="relative h-[330px] w-[270px] overflow-hidden rounded-[2rem] border-8 border-white/20 bg-slate-900 shadow-2xl sm:h-[400px] sm:w-[320px] lg:h-[440px] lg:w-[350px]">
                            <img src={"https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=90"} alt="Founder and Director Career Optics Computer Centre" className="h-full w-full object-cover transition duration-700 hover:scale-105" />
                          </div>
                          <div className="absolute -right-5 top-10 flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-white bg-white text-blue-600 shadow-2xl">
                            <i data-lucide="quote" className="h-7 w-7"></i>
                          </div>
                          <div className="absolute -bottom-7 left-1/2 w-[85%] -translate-x-1/2 rounded-2xl border border-white/20 bg-white p-4 text-center shadow-2xl">
                            <h3 className="text-base font-black text-slate-900">
                              Your Name
                            </h3>
                            <p className="mt-1 text-xs font-bold text-blue-600">
                              Founder & Director
                            </p>
                            <p className="mt-1 text-[11px] text-slate-400">
                              Career Optics Computer Centre
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            <section id="career" className="py-24">
              <div className="max-w-7xl mx-auto px-4">
                <div className="glass rounded-[35px] p-8 md:p-14 relative overflow-hidden">
                  <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-purple-600/20 blur-[90px]"></div>
                  <div className="grid lg:grid-cols-2 gap-12 relative z-10">
                    <div>
                      <div className="text-green-400 font-black uppercase tracking-[3px] text-sm">
                        Career Ready
                      </div>
                      <h2 className="text-4xl md:text-5xl font-black mt-4">
                        Turn Your Skills Into{" "}
                        <span className="text-gradient">
                          {" "}Opportunities{" "}
                        </span>
                      </h2>
                      <p className="text-gray-500 leading-8 mt-6">
                        AI और computer skills का उपयोग job, freelancing, business और personal productivity में करें।
                      </p>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="glass rounded-2xl p-6">
                        <i data-lucide="briefcase" className="text-cyan-400"></i>
                        <h3 className="font-black mt-4">
                          Jobs
                        </h3>
                        <p className="text-gray-500 text-sm mt-2">
                          Career-focused skills.
                        </p>
                      </div>
                      <div className="glass rounded-2xl p-6">
                        <i data-lucide="laptop" className="text-purple-400"></i>
                        <h3 className="font-black mt-4">
                          Freelancing
                        </h3>
                        <p className="text-gray-500 text-sm mt-2">
                          Work from anywhere.
                        </p>
                      </div>
                      <div className="glass rounded-2xl p-6">
                        <i data-lucide="store" className="text-pink-400"></i>
                        <h3 className="font-black mt-4">
                          Business
                        </h3>
                        <p className="text-gray-500 text-sm mt-2">
                          Build digital businesses.
                        </p>
                      </div>
                      <div className="glass rounded-2xl p-6">
                        <i data-lucide="rocket" className="text-green-400"></i>
                        <h3 className="font-black mt-4">
                          Startups
                        </h3>
                        <p className="text-gray-500 text-sm mt-2">
                          Build technology products.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </section>
        <section id="benefits" className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-blue-600 font-bold text-sm uppercase tracking-widest">
                {" "}Student Benefits{" "}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black mt-3">
                Benefits That Help You Grow
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
              <div className="bg-white border rounded-3xl p-7 text-center">
                <div className="mx-auto w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                  <i data-lucide="trending-up" className="w-7 h-7"></i>
                </div>
                <h3 className="font-black text-lg mt-5">
                  Growth
                </h3>
                <p className="text-sm text-slate-500 leading-6 mt-2">
                  Opportunities to take on new responsibilities.
                </p>
              </div>
              <div className="bg-white border rounded-3xl p-7 text-center">
                <div className="mx-auto w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                  <i data-lucide="book-open" className="w-7 h-7"></i>
                </div>
                <h3 className="font-black text-lg mt-5">
                  Learning
                </h3>
                <p className="text-sm text-slate-500 leading-6 mt-2">
                  Continuous skill development and learning.
                </p>
              </div>
              <div className="bg-white border rounded-3xl p-7 text-center">
                <div className="mx-auto w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                  <i data-lucide="users-round" className="w-7 h-7"></i>
                </div>
                <h3 className="font-black text-lg mt-5">
                  Teamwork
                </h3>
                <p className="text-sm text-slate-500 leading-6 mt-2">
                  Collaborative and supportive work environment.
                </p>
              </div>
              <div className="bg-white border rounded-3xl p-7 text-center">
                <div className="mx-auto w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center">
                  <i data-lucide="award" className="w-7 h-7"></i>
                </div>
                <h3 className="font-black text-lg mt-5">
                  Recognition
                </h3>
                <p className="text-sm text-slate-500 leading-6 mt-2">
                  Recognition for strong work and contribution.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="process" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center">
              <span className="text-blue-600 font-bold text-sm uppercase tracking-widest">
                {" "}Hiring Process{" "}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black mt-3">
                How We Hire
              </h2>
            </div>
            <div className="grid md:grid-cols-4 gap-7 mt-14">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl font-black">
                  01
                </div>
                <h3 className="font-black mt-5">
                  Apply
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Submit your application for a suitable position.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl font-black">
                  02
                </div>
                <h3 className="font-black mt-5">
                  Screening
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Our team reviews your profile and experience.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl font-black">
                  03
                </div>
                <h3 className="font-black mt-5">
                  Interview
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Discuss your skills, experience and role.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-green-600 text-white flex items-center justify-center text-xl font-black">
                  04
                </div>
                <h3 className="font-black mt-5">
                  Selection
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Selected candidates receive the next steps.
                </p>
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
