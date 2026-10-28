/** Shared by every page that carries it; written once here. */
export default function SiteHeader() {
  return (
    <header id="siteHeader" data-cms-scope="header" className="fixed top-0 left-0 right-0 z-50">
      <div className="navbar min-h-1 rounded-0xl px-3 flex items-center justify-between">
        <a href="index.html" className="flex items-center gap-0 shrink-0">
          <img src="/logo.png" alt="Career Optics Computer Centre" className="logo-img w-[80px] transition hover:scale-105" />
        </a>
        <nav className="hidden lg:flex items-center gap-1">
          <a href="index.html" className="nav-link">
            {" "}Home{" "}
          </a>
          {" "}
          {" "}
          <a href="about.html" className="nav-link">
            {" "}About Us{" "}
          </a>
          <div className="desktop-dropdown">
            <button type="button" className="nav-link desktop-dropdown-btn">
              {" "}Academic Course{" "}
              <i data-lucide="chevron-down" className="dropdown-chevron w-4 h-4">
                {" "}
              </i>
              {" "}
            </button>
            <div className="desktop-dropdown-menu">
              <a href="bihar_board.html">
                {" "}
                <span className="dropdown-icon">
                  {" "}
                  <i data-lucide="book"></i>
                  {" "}
                </span>
                {" "}
                <span>
                  {" "}
                  <b className="dropdown-title">
                    {" "}BSEB IX - X{" "}
                  </b>
                  {" "}
                  <small className="dropdown-description">
                    {" "}
                  </small>
                  {" "}
                </span>
                {" "}
              </a>
              {" "}
              <a href="bihar_arts.html">
                {" "}
                <span className="dropdown-icon">
                  {" "}
                  <i data-lucide="school"></i>
                  {" "}
                </span>
                {" "}
                <span>
                  {" "}
                  <b className="dropdown-title">
                    {" "}BSEB XII Arts{" "}
                  </b>
                  {" "}
                </span>
                {" "}
              </a>
              {" "}
              <a href="commerce.html">
                {" "}
                <span className="dropdown-icon">
                  {" "}
                  <i data-lucide="school"></i>
                  {" "}
                </span>
                {" "}
                <span>
                  {" "}
                  <b className="dropdown-title">
                    {" "}BSEB Commerce{" "}
                  </b>
                  {" "}
                </span>
                {" "}
              </a>
              {" "}
              <a href="pcs.html">
                {" "}
                <span className="dropdown-icon">
                  {" "}
                  <i data-lucide="book-open"></i>
                  {" "}
                </span>
                {" "}
                <span>
                  {" "}
                  <b className="dropdown-title">
                    {" "}Competative Exam{" "}
                  </b>
                  {" "}
                </span>
                {" "}
              </a>
              {" "}
              <a href="spoken-english.html">
                {" "}
                <span className="dropdown-icon">
                  {" "}
                  <i data-lucide="mic"></i>
                  {" "}
                </span>
                {" "}
                <span>
                  {" "}
                  <b className="dropdown-title">
                    {" "}Spoken Englsih{" "}
                  </b>
                  {" "}
                  <small className="dropdown-description">
                    {" "}Pesronality Development{" "}
                  </small>
                  {" "}
                </span>
                {" "}
              </a>
            </div>
          </div>
          <div className="desktop-dropdown">
            <button type="button" className="nav-link desktop-dropdown-btn">
              {" "}Our Course{" "}
              <i data-lucide="chevron-down" className="dropdown-chevron w-4 h-4">
                {" "}
              </i>
              {" "}
            </button>
            <div className="desktop-dropdown-menu">
              <a href="computer-course.html">
                {" "}
                <span className="dropdown-icon">
                  {" "}
                  <i data-lucide="computer"></i>
                  {" "}
                </span>
                {" "}
                <span>
                  {" "}
                  <b className="dropdown-title">
                    {" "}Certified Computer Courses{" "}
                  </b>
                  {" "}
                  <small className="dropdown-description">
                    {" "}Computer fundamentals & office{" "}
                  </small>
                  {" "}
                </span>
                {" "}
              </a>
              {" "}
              <a href="accounting.html">
                {" "}
                <span className="dropdown-icon">
                  {" "}
                  <i data-lucide="calculator"></i>
                  {" "}
                </span>
                {" "}
                <span>
                  {" "}
                  <b className="dropdown-title">
                    {" "}Accounting & Taxation{" "}
                  </b>
                  {" "}
                  <small className="dropdown-description">
                    {" "}Tally, GST & accounting{" "}
                  </small>
                  {" "}
                </span>
                {" "}
              </a>
              {" "}
              <a href="graphics.html">
                {" "}
                <span className="dropdown-icon">
                  {" "}
                  <i data-lucide="pen-tool"></i>
                  {" "}
                </span>
                {" "}
                <span>
                  {" "}
                  <b className="dropdown-title">
                    {" "}Graphic & Architecture{" "}
                  </b>
                  {" "}
                  <small className="dropdown-description">
                    {" "}Tally, GST & accounting{" "}
                  </small>
                  {" "}
                </span>
                {" "}
              </a>
              {" "}
              <a href="coding.html">
                {" "}
                <span className="dropdown-icon">
                  {" "}
                  <i data-lucide="code-2"></i>
                  {" "}
                </span>
                {" "}
                <span>
                  {" "}
                  <b className="dropdown-title">
                    {" "}Programming{" "}
                  </b>
                  {" "}
                  <small className="dropdown-description">
                    {" "}Learn modern programming{" "}
                  </small>
                  {" "}
                </span>
                {" "}
              </a>
              {" "}
              <a href="website-designer.html">
                {" "}
                <span className="dropdown-icon">
                  {" "}
                  <i data-lucide="laptop"></i>
                  {" "}
                </span>
                {" "}
                <span>
                  {" "}
                  <b className="dropdown-title">
                    {" "}Web Development{" "}
                  </b>
                  {" "}
                  <small className="dropdown-description">
                    {" "}HTML, CSS, JS & responsive design{" "}
                  </small>
                  {" "}
                </span>
                {" "}
              </a>
              {" "}
              {" "}
              <a href="">
                {" "}
                <span className="dropdown-icon">
                  {" "}
                  <i data-lucide="megaphone"></i>
                  {" "}
                </span>
                {" "}
                <span>
                  {" "}
                  <b className="dropdown-title">
                    {" "}Digital Marketing{" "}
                  </b>
                  {" "}
                  <small className="dropdown-description">
                    {" "}Soial media Marketing{" "}
                  </small>
                  {" "}
                </span>
                {" "}
              </a>
            </div>
          </div>
          <div className="desktop-dropdown">
            <button type="button" className="nav-link desktop-dropdown-btn">
              {" "}AI Program{" "}
              <i data-lucide="chevron-down" className="dropdown-chevron w-4 h-4">
                {" "}
              </i>
              {" "}
            </button>
            <div className="desktop-dropdown-menu">
              <a href="ai_foundation.html">
                {" "}
                <span className="dropdown-icon">
                  {" "}
                  <i data-lucide="bot"></i>
                  {" "}
                </span>
                {" "}
                <span>
                  {" "}
                  <b className="dropdown-title">
                    {" "}AI Foundation{" "}
                  </b>
                  {" "}
                  <small className="dropdown-description">
                    {" "}AI & Prompt Engineering{" "}
                  </small>
                  {" "}
                </span>
                {" "}
              </a>
              {" "}
              <a href="ai_automation.html">
                {" "}
                <span className="dropdown-icon">
                  {" "}
                  <i data-lucide="award"></i>
                  {" "}
                </span>
                {" "}
                <span>
                  {" "}
                  <b className="dropdown-title">
                    {" "}AI Tools & Automation{" "}
                  </b>
                  {" "}
                  <small className="dropdown-description">
                    {" "}Automation & Productivity{" "}
                  </small>
                  {" "}
                </span>
                {" "}
              </a>
              {" "}
              <a href="ai_carrer.html">
                {" "}
                <span className="dropdown-icon">
                  {" "}
                  <i data-lucide="file-check"></i>
                  {" "}
                </span>
                {" "}
                <span>
                  {" "}
                  <b className="dropdown-title">
                    {" "}AI Career Program{" "}
                  </b>
                  {" "}
                  <small className="dropdown-description">
                    {" "}Learn → Freelance → Earn{" "}
                  </small>
                  {" "}
                </span>
                {" "}
              </a>
            </div>
          </div>
          <div className="desktop-dropdown">
            <button type="button" className="nav-link desktop-dropdown-btn">
              {" "}Franchise Zone{" "}
              <i data-lucide="chevron-down" className="dropdown-chevron w-4 h-4">
                {" "}
              </i>
              {" "}
            </button>
            <div className="desktop-dropdown-menu">
              <a href="franchise.html">
                {" "}
                <span className="dropdown-icon">
                  {" "}
                  <i data-lucide="building-2"></i>
                  {" "}
                </span>
                {" "}
                <span>
                  {" "}
                  <b className="dropdown-title">
                    {" "}Franchise Opportunity{" "}
                  </b>
                  {" "}
                  <small className="dropdown-description">
                    {" "}Start your training center{" "}
                  </small>
                  {" "}
                </span>
                {" "}
              </a>
              {" "}
              <a href="#franchise">
                {" "}
                <span className="dropdown-icon">
                  {" "}
                  <i data-lucide="send"></i>
                  {" "}
                </span>
                {" "}
                <span>
                  {" "}
                  <b className="dropdown-title">
                    {" "}Apply Franchise{" "}
                  </b>
                  {" "}
                  <small className="dropdown-description">
                    {" "}Submit franchise application{" "}
                  </small>
                  {" "}
                </span>
                {" "}
              </a>
              {" "}
              <a href="/computercentre/login?as=franchise">
                {" "}
                <span className="dropdown-icon">
                  {" "}
                  <i data-lucide="log-in"></i>
                  {" "}
                </span>
                {" "}
                <span>
                  {" "}
                  <b className="dropdown-title">
                    {" "}Franchise Login{" "}
                  </b>
                  {" "}
                  <small className="dropdown-description">
                    {" "}Login to Franchise portal{" "}
                  </small>
                  {" "}
                </span>
                {" "}
              </a>
              {" "}
              <a href="#franchise">
                {" "}
                <span className="dropdown-icon">
                  {" "}
                  <i data-lucide="badge-check"></i>
                  {" "}
                </span>
                {" "}
                <span>
                  {" "}
                  <b className="dropdown-title">
                    {" "}Center Verification{" "}
                  </b>
                  {" "}
                  <small className="dropdown-description">
                    {" "}Verify your center{" "}
                  </small>
                  {" "}
                </span>
                {" "}
              </a>
            </div>
          </div>
          <div className="desktop-dropdown">
            <button type="button" className="nav-link desktop-dropdown-btn">
              {" "}Student Zone{" "}
              <i data-lucide="chevron-down" className="dropdown-chevron w-4 h-4">
                {" "}
              </i>
              {" "}
            </button>
            <div className="desktop-dropdown-menu">
              <a href="/computercentre/login?as=student">
                {" "}
                <span className="dropdown-icon">
                  {" "}
                  <i data-lucide="log-in"></i>
                  {" "}
                </span>
                {" "}
                <span>
                  {" "}
                  <b className="dropdown-title">
                    {" "}Student Login{" "}
                  </b>
                  {" "}
                  <small className="dropdown-description">
                    {" "}Login to student portal{" "}
                  </small>
                  {" "}
                </span>
                {" "}
              </a>
              {" "}
              <a href="/verification.html#certificate">
                {" "}
                <span className="dropdown-icon">
                  {" "}
                  <i data-lucide="award"></i>
                  {" "}
                </span>
                {" "}
                <span>
                  {" "}
                  <b className="dropdown-title">
                    {" "}Certificate{" "}
                  </b>
                  {" "}
                  <small className="dropdown-description">
                    {" "}Certificate verification{" "}
                  </small>
                  {" "}
                </span>
                {" "}
              </a>
              {" "}
              <a href="/verification.html#result">
                {" "}
                <span className="dropdown-icon">
                  {" "}
                  <i data-lucide="file-check"></i>
                  {" "}
                </span>
                {" "}
                <span>
                  {" "}
                  <b className="dropdown-title">
                    {" "}Result{" "}
                  </b>
                  {" "}
                  <small className="dropdown-description">
                    {" "}Check examination result{" "}
                  </small>
                  {" "}
                </span>
                {" "}
              </a>
              {" "}
              <a href="/verification.html#admit">
                {" "}
                <span className="dropdown-icon">
                  {" "}
                  <i data-lucide="id-card"></i>
                  {" "}
                </span>
                {" "}
                <span>
                  {" "}
                  <b className="dropdown-title">
                    {" "}Admit Card{" "}
                  </b>
                  {" "}
                  <small className="dropdown-description">
                    {" "}Download admit card{" "}
                  </small>
                  {" "}
                </span>
                {" "}
              </a>
            </div>
          </div>
          <div className="desktop-dropdown">
            <button type="button" className="nav-link desktop-dropdown-btn">
              {" "}Job Internship{" "}
              <i data-lucide="chevron-down" className="dropdown-chevron w-4 h-4">
                {" "}
              </i>
              {" "}
            </button>
            <div className="desktop-dropdown-menu">
              <a href="internship_telecaller.html">
                {" "}
                <span className="dropdown-icon">
                  {" "}
                  <i data-lucide="headset"></i>
                  {" "}
                </span>
                {" "}
                <span>
                  {" "}
                  <b className="dropdown-title">
                    {" "}Telecaller/Counseller{" "}
                  </b>
                  {" "}
                  <small className="dropdown-description">
                    {" "}Build practical experience{" "}
                  </small>
                  {" "}
                </span>
                {" "}
              </a>
              {" "}
              <a href="internship_backoffice.html">
                {" "}
                <span className="dropdown-icon">
                  {" "}
                  <i data-lucide="database"></i>
                  {" "}
                </span>
                {" "}
                <span>
                  {" "}
                  <b className="dropdown-title">
                    {" "}Data Entry Operator{" "}
                  </b>
                  {" "}
                  <small className="dropdown-description">
                    {" "}Entry level opportunities{" "}
                  </small>
                  {" "}
                </span>
                {" "}
              </a>
              {" "}
              <a href="internship_accounting.html">
                {" "}
                <span className="dropdown-icon">
                  {" "}
                  <i data-lucide="file-spreadsheet"></i>
                  {" "}
                </span>
                {" "}
                <span>
                  {" "}
                  <b className="dropdown-title">
                    {" "}Accounting Expert{" "}
                  </b>
                  {" "}
                  <small className="dropdown-description">
                    {" "}Accounting & Finance{" "}
                  </small>
                  {" "}
                </span>
                {" "}
              </a>
              {" "}
              <a href="internship_graphic-designer.html">
                {" "}
                <span className="dropdown-icon">
                  {" "}
                  <i data-lucide="palette"></i>
                  {" "}
                </span>
                {" "}
                <span>
                  {" "}
                  <b className="dropdown-title">
                    {" "}Graphic Designer{" "}
                  </b>
                  {" "}
                  <small className="dropdown-description">
                    {" "}Creative career opportunity{" "}
                  </small>
                  {" "}
                </span>
                {" "}
              </a>
              {" "}
              <a href="internship_website-designer.html">
                {" "}
                <span className="dropdown-icon">
                  {" "}
                  <i data-lucide="code"></i>
                  {" "}
                </span>
                {" "}
                <span>
                  {" "}
                  <b className="dropdown-title">
                    {" "}Frontend Developer{" "}
                  </b>
                  {" "}
                  <small className="dropdown-description">
                    {" "}Web designer opportunity{" "}
                  </small>
                  {" "}
                </span>
                {" "}
              </a>
              {" "}
              <a href="intrenship_website-developer.html">
                {" "}
                <span className="dropdown-icon">
                  {" "}
                  <i data-lucide="server"></i>
                  {" "}
                </span>
                {" "}
                <span>
                  {" "}
                  <b className="dropdown-title">
                    {" "}Backend Developer{" "}
                  </b>
                  {" "}
                  <small className="dropdown-description">
                    {" "}Web development opportunity{" "}
                  </small>
                  {" "}
                </span>
                {" "}
              </a>
              {" "}
              <a href="internship_digital-marketing.html">
                {" "}
                <span className="dropdown-icon">
                  {" "}
                  <i data-lucide="megaphone"></i>
                  {" "}
                </span>
                {" "}
                <span>
                  {" "}
                  <b className="dropdown-title">
                    {" "}Digital Maketing{" "}
                  </b>
                  {" "}
                  <small className="dropdown-description">
                    {" "}Online Earning Opportunity{" "}
                  </small>
                  {" "}
                </span>
                {" "}
              </a>
            </div>
          </div>
          <a href="carrer.html" className="nav-link">
            {" "}Career{" "}
          </a>
          {" "}
          {" "}
          <a href="#contact" className="nav-link">
            {" "}Contact{" "}
          </a>
        </nav>
        <button id="menuBtn" type="button" aria-label="Open menu" aria-expanded="false" className="lg:hidden flex items-center justify-center w-11 h-11 rounded-xl bg-red-30 text-blue-600 hover:bg-blue-100 transition">
          <i data-lucide="menu" className="w-5 h-5">
            {" "}
          </i>
        </button>
      </div>
      <div id="mobileMenu" className="mobile-menu lg:hidden">
        <div className="p-3">
          <a href="index.html" className="mobile-link">
            {" "}
            <span className="mobile-link-left">
              {" "}
              <i data-lucide="home"></i>
              {" "}Home{" "}
            </span>
            {" "}
          </a>
          {" "}
          {" "}
          <a href="#about" className="mobile-link">
            {" "}
            <span className="mobile-link-left">
              {" "}
              <i data-lucide="info"></i>
              {" "}About Us{" "}
            </span>
            {" "}
          </a>
          <div className="mobile-dropdown">
            <button type="button" className="mobile-dropdown-btn">
              {" "}
              <span className="mobile-link-left">
                {" "}
                <i data-lucide="graduation-cap"></i>
                {" "}Our Course{" "}
              </span>
              {" "}
              <i data-lucide="chevron-down" className="arrow">
                {" "}
              </i>
              {" "}
            </button>
            <div className="mobile-submenu">
              <div className="mobile-submenu-inner">
                <a href="#courses">
                  {" "}
                  <i data-lucide="computer"></i>
                  {" "}Computer Courses{" "}
                </a>
                {" "}
                <a href="#courses">
                  {" "}
                  <i data-lucide="calculator"></i>
                  {" "}Accounting & Taxation{" "}
                </a>
                {" "}
                <a href="#courses">
                  {" "}
                  <i data-lucide="code-2"></i>
                  {" "}Programming Language{" "}
                </a>
                {" "}
                <a href="#courses">
                  {" "}
                  <i data-lucide="laptop"></i>
                  {" "}Web Designing With A.I{" "}
                </a>
                {" "}
                <a href="#courses">
                  {" "}
                  <i data-lucide="megaphone"></i>
                  {" "}Digital Marketing With A.I{" "}
                </a>
                {" "}
                <a href="#courses">
                  {" "}
                  <i data-lucide="palette"></i>
                  {" "}Graphic Designing{" "}
                </a>
                {" "}
                <a href="#courses">
                  {" "}
                  <i data-lucide="ruler"></i>
                  {" "}Architecture & Sketch{" "}
                </a>
                {" "}
                <a href="#courses">
                  {" "}
                  <i data-lucide="video"></i>
                  {" "}Video Mixing{" "}
                </a>
                {" "}
                <a href="#courses">
                  {" "}
                  <i data-lucide="languages"></i>
                  {" "}Spoken English{" "}
                </a>
              </div>
            </div>
          </div>
          <div className="mobile-dropdown">
            <button type="button" className="mobile-dropdown-btn">
              {" "}
              <span className="mobile-link-left">
                {" "}
                <i data-lucide="building-2"></i>
                {" "}Franchise Zone{" "}
              </span>
              {" "}
              <i data-lucide="chevron-down" className="arrow">
                {" "}
              </i>
              {" "}
            </button>
            <div className="mobile-submenu">
              <div className="mobile-submenu-inner">
                <a href="#franchise">
                  {" "}
                  <i data-lucide="briefcase"></i>
                  {" "}Franchise Opportunity{" "}
                </a>
                {" "}
                <a href="#franchise">
                  {" "}
                  <i data-lucide="send"></i>
                  {" "}Apply Franchise{" "}
                </a>
                {" "}
                <a href="/computercentre/login?as=franchise">
                  {" "}
                  <i data-lucide="log-in"></i>
                  {" "}Franchise Login{" "}
                </a>
                {" "}
                <a href="#franchise">
                  {" "}
                  <i data-lucide="badge-check"></i>
                  {" "}Center Verification{" "}
                </a>
              </div>
            </div>
          </div>
          <div className="mobile-dropdown">
            <button type="button" className="mobile-dropdown-btn">
              {" "}
              <span className="mobile-link-left">
                {" "}
                <i data-lucide="graduation-cap"></i>
                {" "}Student Zone{" "}
              </span>
              {" "}
              <i data-lucide="chevron-down" className="arrow">
                {" "}
              </i>
              {" "}
            </button>
            <div className="mobile-submenu">
              <div className="mobile-submenu-inner">
                <a href="/computercentre/login?as=student">
                  {" "}
                  <i data-lucide="log-in"></i>
                  {" "}Student Login{" "}
                </a>
                {" "}
                <a href="/verification.html#certificate">
                  {" "}
                  <i data-lucide="award"></i>
                  {" "}Certificate{" "}
                </a>
                {" "}
                <a href="/verification.html#result">
                  {" "}
                  <i data-lucide="file-check"></i>
                  {" "}Result{" "}
                </a>
                {" "}
                <a href="/computercentre/login?as=student">
                  {" "}
                  <i data-lucide="id-card"></i>
                  {" "}ID Card{" "}
                </a>
                {" "}
                <a href="/computercentre/login?as=student">
                  {" "}
                  <i data-lucide="credit-card"></i>
                  {" "}Online Payment{" "}
                </a>
                {" "}
                <a href="/verification.html#admit">
                  {" "}
                  <i data-lucide="id-card"></i>
                  {" "}Admit Card{" "}
                </a>
              </div>
            </div>
          </div>
          <div className="mobile-dropdown">
            <button type="button" className="mobile-dropdown-btn">
              {" "}
              <span className="mobile-link-left">
                {" "}
                <i data-lucide="briefcase"></i>
                {" "}Job Internship{" "}
              </span>
              {" "}
              <i data-lucide="chevron-down" className="arrow">
                {" "}
              </i>
              {" "}
            </button>
            <div className="mobile-submenu">
              <div className="mobile-submenu-inner">
                <a href="#internship">
                  {" "}
                  <i data-lucide="clipboard-check"></i>
                  {" "}Internship Program{" "}
                </a>
                {" "}
                <a href="#internship">
                  {" "}
                  <i data-lucide="send"></i>
                  {" "}Apply Internship{" "}
                </a>
                {" "}
                <a href="#internship">
                  {" "}
                  <i data-lucide="database"></i>
                  {" "}Data Entry Operator{" "}
                </a>
                {" "}
                <a href="#internship">
                  {" "}
                  <i data-lucide="palette"></i>
                  {" "}Graphic Designer{" "}
                </a>
                {" "}
                <a href="#internship">
                  {" "}
                  <i data-lucide="code"></i>
                  {" "}Frontend Developer{" "}
                </a>
                {" "}
                <a href="#internship">
                  {" "}
                  <i data-lucide="server"></i>
                  {" "}Backend Developer{" "}
                </a>
              </div>
            </div>
          </div>
          <a href="#hire" className="mobile-link">
            {" "}
            <span className="mobile-link-left">
              {" "}
              <i data-lucide="handshake"></i>
              {" "}Hire Us{" "}
            </span>
            {" "}
          </a>
          {" "}
          {" "}
          <a href="#contact" className="mobile-link">
            {" "}
            <span className="mobile-link-left">
              {" "}
              <i data-lucide="phone"></i>
              {" "}Contact{" "}
            </span>
            {" "}
          </a>
          <div className="mobile-actions">
            <a href="/computercentre/login" className="login-button">
              {" "}Login{" "}
            </a>
            {" "}
            <a href="#admission" className="join-button">
              {" "}Join Now{" "}
              <i data-lucide="arrow-right" className="w-4 h-4">
                {" "}
              </i>
              {" "}
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
