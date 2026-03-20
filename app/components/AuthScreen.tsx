import { IconCalendar, GoogleLogo } from "./Icons";

export default function AuthScreen() {
  return (
    <div className="app">
      {/* Invisible/Clean Nav for the landing page */}
      <nav className="nav" style={{ borderBottom: 'none', background: 'transparent' }}>
        <div className="nav-left">
          <div className="nav-logo">
            <span className="nav-logo-text" style={{ fontSize: '16px' }}>NextDimension AI</span>
          </div>
        </div>
      </nav>

      <div className="auth-container">
        <div className="auth-bg-glow" /> {/* Ethereal background gradient */}
        
        <div className="auth-card">
          <div className="auth-icon-wrap">
             <IconCalendar size={28} />
          </div>
          
          <div className="auth-text-block">
            <h1 className="auth-heading">Schedule meetings<br />with your voice.</h1>
            <p className="auth-desc">
              Connect your Google Calendar and let our ultra-low latency AI assistant handle your booking logistics.
            </p>
          </div>

          <a href="/api/auth/google" className="btn btn-google">
            <GoogleLogo />Continue with Google
          </a>

          <div className="auth-stats">
            <div className="auth-stat">
              <div className="auth-stat-label">Latency</div>
              <div className="auth-stat-value">&lt;400ms</div>
            </div>
            <div className="auth-stat">
              <div className="auth-stat-label">Engine</div>
              <div className="auth-stat-value">GPT-4o Realtime</div>
            </div>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '8px' }}>
            By continuing, you agree to our <a href="/privacy" style={{ color: 'var(--text-secondary)', textDecoration: 'underline' }}>Privacy Policy</a>.
          </div>
        </div>
      </div>
    </div>
  );
}
