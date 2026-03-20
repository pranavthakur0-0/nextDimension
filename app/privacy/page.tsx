export default function PrivacyPolicy() {
  return (
    <div className="app">
      <nav className="nav">
        <div className="nav-left">
          <div className="nav-logo">
            <span className="nav-logo-text" style={{ fontSize: '16px' }}>Scheduler AI</span>
          </div>
        </div>
      </nav>

      <div className="main" style={{ padding: "40px 20px", display: "block", overflowY: "auto", maxWidth: "800px" }}>
        <h1 style={{ fontSize: "32px", marginBottom: "8px", fontWeight: "700", letterSpacing: "-0.02em" }}>Privacy Policy</h1>
        <p style={{ color: "var(--text-tertiary)", marginBottom: "40px", fontSize: "14px" }}>
          Last updated: March 20, 2026
        </p>

        <section style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          <div>
            <h2 style={{ fontSize: "18px", marginBottom: "12px", color: "var(--text-primary)", fontWeight: "600" }}>1. Information We Collect</h2>
            <p style={{ color: "var(--text-secondary)", lineHeight: "1.7", fontSize: "15px" }}>
              Scheduler AI requests access to your Google Calendar to provide voice-based scheduling automation. We strictly collect only the necessary information to function:
              <br /><br />
              • <strong>Calendar Data:</strong> We read your calendar events solely to determine your availability when you request to schedule a meeting.<br />
              • <strong>Event Creation:</strong> We use your calendar permissions to create new scheduled meeting events only when explicitly commanded and confirmed by you via voice.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: "18px", marginBottom: "12px", color: "var(--text-primary)", fontWeight: "600" }}>2. How We Use Your Information</h2>
            <p style={{ color: "var(--text-secondary)", lineHeight: "1.7", fontSize: "15px" }}>
              Your Google Calendar data is processed in real-time by the application and our AI engine strictly for the purpose of interacting with you during an active voice session. 
              We do not store your calendar events, contacts, or meeting history in any long-term external databases. Once your active session ends, the temporary context is discarded.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: "18px", marginBottom: "12px", color: "var(--text-primary)", fontWeight: "600" }}>3. Data Sharing and Disclosure</h2>
            <p style={{ color: "var(--text-secondary)", lineHeight: "1.7", fontSize: "15px" }}>
              We do not sell, rent, or share your personal information or calendar data with any third parties under any circumstances. Your data is passed securely to OpenAI's API exclusively to generate conversational responses during your active session, after which OpenAI immediately discards the ephemeral data according to their zero-retention API policies.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: "18px", marginBottom: "12px", color: "var(--text-primary)", fontWeight: "600" }}>4. Security & Authentication</h2>
            <p style={{ color: "var(--text-secondary)", lineHeight: "1.7", fontSize: "15px" }}>
              Your Google OAuth tokens are securely encrypted and stored locally in your browser cookies. They are never kept permanently on our servers. You have complete control to revoke our application's access at any time via your official Google Account Security Settings.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: "18px", marginBottom: "12px", color: "var(--text-primary)", fontWeight: "600" }}>5. Contact Us</h2>
            <p style={{ color: "var(--text-secondary)", lineHeight: "1.7", fontSize: "15px" }}>
              If you have any questions about this Privacy Policy, please contact the developer via GitHub or email.
            </p>
          </div>
          
          <div style={{ marginTop: "32px", paddingBottom: "64px" }}>
            <a href="/" className="btn btn-ghost" style={{ border: "1px solid var(--border-default)", display: "inline-flex", width: "auto" }}>
              ← Return Home
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
