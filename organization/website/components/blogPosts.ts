/**
 * The blog: every post, written here once. The listing (pages/blog.tsx) and
 * each post's own page (pages/blog-<slug>.tsx, rendered by BlogPost) read
 * from this list, so a new post is one entry here and a two-line page file.
 */

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "tip"; title: string; text: string }
  | { type: "table"; head: string[]; rows: string[][] }
  | { type: "cta"; text: string; href: string; label: string };

export interface Post {
  slug: string;
  title: string;
  /** One or two sentences: the card's text and the page's meta description. */
  excerpt: string;
  category: string;
  date: string; // yyyy-mm-dd
  minutes: number;
  image: string;
  imageAlt: string;
  body: Block[];
}

export const POSTS: Post[] = [
  {
    slug: "dca-vs-adca-vs-pgdca",
    title: "DCA, ADCA or PGDCA — Which Computer Course Is Right for You?",
    excerpt:
      "Three diplomas, three different goals. Here is what each one teaches, how long it takes and who it suits, so you can pick with confidence.",
    category: "Courses",
    date: "2026-11-14",
    minutes: 5,
    image: "/image/ms.webp",
    imageAlt: "MS Word, Excel, PowerPoint and Outlook — the office skills every diploma teaches",
    body: [
      { type: "p", text: "Almost every student who walks into a computer centre asks the same question: “Should I do DCA or ADCA?” And graduates often add a third option — PGDCA. All three are useful, but they are built for different goals. Choosing the right one saves you months and money." },
      { type: "h2", text: "DCA — Diploma in Computer Application (6 months)" },
      { type: "p", text: "DCA is the foundation course. It takes you from “I have never used a computer” to working confidently in an office." },
      { type: "ul", items: ["Computer Fundamentals — hardware, software, operating systems", "MS-Windows — files, folders, settings", "MS-Office — Word, Excel and PowerPoint", "Internet — e-mail, online forms, UPI and cyber safety", "Practical work at a computer in every class"] },
      { type: "p", text: "Best for: students after 10th or 12th, anyone preparing for jobs that ask for “basic computer knowledge”, and people who want to use a computer at home or in a small business." },
      { type: "h2", text: "ADCA — Advance Diploma in Computer Application (12 months)" },
      { type: "p", text: "ADCA includes everything a DCA student learns and then adds the skills that employers actually pay for." },
      { type: "ul", items: ["Desktop Publishing — Photoshop, PageMaker and CorelDraw", "Tally with ERP — accounting, GST, inventory and reports", "Practical assignments and a final project"] },
      { type: "p", text: "Best for: students who want a computer-based job — data entry, accounts assistant, DTP operator, office executive — or who want to start their own cyber café, printing or photo-studio work." },
      { type: "h2", text: "PGDCA — Post Graduate Diploma in Computer Application (12 months)" },
      { type: "p", text: "PGDCA is for graduates. It combines financial accounting, DTP, Tally with ERP and MS-Office with assignments and a project, at a level that suits a graduate looking for an office or teaching role." },
      { type: "h2", text: "Quick comparison" },
      {
        type: "table",
        head: ["", "DCA", "ADCA", "PGDCA"],
        rows: [
          ["Duration", "6 months", "12 months", "12 months"],
          ["Who it suits", "After 10th / 12th, beginners", "After 10th / 12th, job seekers", "Graduates"],
          ["MS-Office", "Yes", "Yes", "Yes"],
          ["DTP (Photoshop, CorelDraw)", "—", "Yes", "Yes"],
          ["Tally with ERP / Accounting", "—", "Yes", "Yes"],
          ["Project work", "—", "Yes", "Yes"],
        ],
      },
      { type: "tip", title: "Our advice", text: "If you can give a full year, choose ADCA — you get DCA's foundation plus Tally and design, which open far more jobs. If you need a certificate quickly, start with DCA; you can always add Tally (CFA) or DTP later." },
      { type: "p", text: "Every course at Career Optics ends with an exam, a marksheet and a certificate that carries a QR code, so anyone — an employer, a college or a government office — can verify it online in seconds." },
      { type: "cta", text: "See the full syllabus of every course, module by module.", href: "computer-course.html", label: "View all courses" },
    ],
  },
  {
    slug: "how-to-verify-certificate-online",
    title: "How to Verify a Career Optics Certificate Online in 30 Seconds",
    excerpt:
      "Every certificate, marksheet and admit card we issue can be checked online. Here is how students, parents and employers can do it.",
    category: "Students",
    date: "2026-11-12",
    minutes: 3,
    image: "/image/gallery/sample-certificate.webp",
    imageAlt: "Career Optics course completion certificate with QR code",
    body: [
      { type: "p", text: "A certificate is only as good as the trust behind it. Employers today often ask, “How do we know this certificate is real?” At Career Optics we have answered that question for every student: each certificate, marksheet and admit card can be verified online, free, by anyone." },
      { type: "h2", text: "Method 1 — Scan the QR code" },
      { type: "ol", items: ["Open the camera or any QR scanner on your phone.", "Point it at the QR code printed on the certificate or marksheet.", "Tap the link that appears — our verification page opens with the student's details."] },
      { type: "p", text: "The page shows the student's name, father's name, course, study centre and ATP code, the certificate number and date of issue, and the result. If the details on the paper match the page, the certificate is genuine." },
      { type: "h2", text: "Method 2 — Enter the number on our website" },
      { type: "ol", items: ["Go to www.careeropticscomputer.in and open Student Zone → Certificate Verification.", "Type the Registration No. (for example COCA/2026/00101) or the Certificate No. (for example COCA/CERT/2026/00201).", "Press Verify."] },
      { type: "tip", title: "Checking a result?", text: "Open the Result tab and enter the registration number with the student's date of birth. The marksheet appears subject by subject, with theory and practical marks, percentage and grade." },
      { type: "h2", text: "What the numbers on your certificate mean" },
      {
        type: "table",
        head: ["Number", "Example", "What it is"],
        rows: [
          ["Registration No.", "COCA/2026/00101", "Your own number, given when your admission is approved"],
          ["Certificate No.", "COCA/CERT/2026/00201", "A new number for every certificate issued"],
          ["Serial No.", "26110001", "Year and month of issue, then a running count"],
          ["ATP Code", "CO/26/001", "The code of the study centre where you studied"],
        ],
      },
      { type: "h2", text: "If the details do not match" },
      { type: "p", text: "Do not accept the document. Call or WhatsApp our head office on +91 82525 32179 with a photo of the certificate and we will check our records for you." },
      { type: "cta", text: "Verify a certificate, result, admit card or enrollment now.", href: "/verification.html#certificate", label: "Go to verification" },
    ],
  },
  {
    slug: "improve-typing-speed-hindi-english",
    title: "How to Improve Your Typing Speed in Hindi and English",
    excerpt:
      "A simple 30-day practice plan to build speed and accuracy — the skill many clerk, data-entry and typist jobs test first.",
    category: "Skills",
    date: "2026-11-10",
    minutes: 4,
    image: "/image/typing.webp",
    imageAlt: "English and Hindi typing practice on a laptop",
    body: [
      { type: "p", text: "Many office jobs — clerk, data-entry operator, court and office typist — include a typing test. In these tests accuracy matters as much as speed: a fast typist with many mistakes can still fail. The good news is that typing is a skill anyone can build with daily practice." },
      { type: "h2", text: "Step 1 — Learn the right finger position" },
      { type: "p", text: "Keep your fingers on the home row (A S D F and J K L ;) and type every key with the correct finger, without looking at the keyboard. It feels slow for the first week, but it is the only way to become fast later." },
      { type: "h2", text: "Step 2 — Choose your Hindi layout early" },
      { type: "p", text: "Hindi typing tests may use Inscript, Remington (Gail) or another layout. Check which one your target exam uses and practise only that one. Mixing layouts slows you down." },
      { type: "h2", text: "A 30-day practice plan" },
      {
        type: "table",
        head: ["Days", "Focus", "Daily practice"],
        rows: [
          ["1–7", "Home row, correct fingers, no looking down", "30 minutes of drills"],
          ["8–15", "All rows, numbers and common words", "30 minutes drills + 10 minutes passages"],
          ["16–23", "Full passages, accuracy above 95%", "20 minutes drills + 20 minutes passages"],
          ["24–30", "Timed tests in the exam's pattern", "Two 10-minute timed tests a day"],
        ],
      },
      { type: "h2", text: "Tips that make a real difference" },
      { type: "ul", items: ["Practise every day — 30 minutes daily beats three hours once a week.", "Aim for accuracy first; speed follows naturally.", "Sit straight, keep wrists relaxed and the screen at eye level.", "Track your words per minute (WPM) and accuracy each week.", "Read the exam notification for its required speed and rules on mistakes."] },
      { type: "tip", title: "Learn with Career Optics", text: "Our Typing Speed and Accuracy (TSA) course covers regional language, English and Hindi typing with daily speed tests. At the end you receive a Computer Typing Certificate that shows your English and Hindi speed in WPM and your accuracy." },
      { type: "cta", text: "See the Typing Speed and Accuracy course and its syllabus.", href: "course.html?c=TSA", label: "View the typing course" },
    ],
  },
  {
    slug: "start-computer-centre-franchise",
    title: "Start Your Own Computer Centre: How the Career Optics Franchise Works",
    excerpt:
      "Want to run a computer institute in your town? Here is what a Career Optics study centre gets, what you need, and the steps to open one.",
    category: "Franchise",
    date: "2026-11-08",
    minutes: 5,
    image: "/image/gallery/sample-franchise-licence.webp",
    imageAlt: "Career Optics franchise partner licence",
    body: [
      { type: "p", text: "Demand for computer skills is growing in every town — for jobs, government forms, small businesses and everyday life. Many people want to open a computer centre but worry about courses, certificates, software and a website. A Career Optics franchise takes care of all of that, so you can focus on teaching students." },
      { type: "h2", text: "What an authorised study centre receives" },
      { type: "ul", items: ["A Franchise Partner Licence and your own ATP code", "24 job-oriented courses with complete, module-wise syllabus", "Your own login to the Career Optics ERP — admissions, fees, exams, results and attendance", "Certificates, marksheets, admit cards and ID cards on the academy's official design, each with a verification QR", "A free website page for your centre, with your logo, courses and contact", "Training for you and your staff, and support from the head office"] },
      { type: "h2", text: "Zero royalty on course fees" },
      { type: "p", text: "The course fee you collect from your students stays with your centre. The head office charges only for the documents it issues — admission, admit card, marksheet and certificate — from a prepaid wallet that you recharge when you need to." },
      { type: "h2", text: "What you need to start" },
      { type: "ul", items: ["A classroom or lab of about 300 sq. ft. or more", "At least 5 computers with internet, and a printer", "A centre director, and at least one faculty member with computer training experience", "Willingness to follow the academy's syllabus and exam pattern"] },
      { type: "h2", text: "Four steps to open your centre" },
      { type: "ol", items: ["Apply on our Franchise page or send your details on WhatsApp.", "Our team calls you, checks your centre details and KYC, and shares the franchise agreement.", "Pay the one-time franchise fee to the company's official account. Your centre is created in the ERP the same day.", "Receive your licence, ATP code, ERP login and website page — and take your first admission."] },
      { type: "tip", title: "Pay only into the official account", text: "All fees are paid only into the company's current account, CAREER OPTICS EDUCATION SERVICE PVT LTD (HDFC Bank, Arrah). We never ask for payment into a personal account." },
      { type: "p", text: "Want to see everything in one place — courses, documents, the ERP and the joining process? Download our franchise proposal from the Franchise page." },
      { type: "cta", text: "Read the full franchise details and apply online.", href: "franchise.html", label: "Explore the franchise" },
    ],
  },
];

export const postBySlug = (slug: string) => POSTS.find((p) => p.slug === slug);

export const longDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
