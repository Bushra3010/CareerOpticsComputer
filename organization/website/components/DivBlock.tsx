/** Shared by every page that carries it; written once here. */
export default function DivBlock() {
  return (
    <div className="modern-call-wrapper">
      <div className="call-popup" id="callPopup">
        <div className="call-popup-header">
          <div className="call-icon-small">
            <svg viewBox="0 0 24 24">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67 A2 2 0 0 1 4.11 2h3 a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91 a16 16 0 0 0 6 6l1.27-1.27 a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 A2 2 0 0 1 22 16.92z"></path>
            </svg>
          </div>
          <div>
            <p className="call-popup-title">
              Need Help?
            </p>
            <div className="call-popup-subtitle">
              Our team is ready to help
            </div>
          </div>
        </div>
        <div className="call-number">
          📞 7519884465
        </div>
        <a href="tel:+918084510393" className="call-now">
          <svg viewBox="0 0 24 24">
            <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67 A2 2 0 0 1 4.11 2h3 a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91 a16 16 0 0 0 6 6l1.27-1.27 a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 A2 2 0 0 1 22 16.92z"></path>
          </svg>
          Call Now{" "}
        </a>
      </div>
      <button type="button" className="modern-call-btn" id="callButton" aria-label="Call us">
        <svg viewBox="0 0 24 24">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67 A2 2 0 0 1 4.11 2h3 a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91 a16 16 0 0 0 6 6l1.27-1.27 a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 A2 2 0 0 1 22 16.92z"></path>
        </svg>
        <span className="call-online-dot"></span>
        {" "}
      </button>
    </div>
  );
}
