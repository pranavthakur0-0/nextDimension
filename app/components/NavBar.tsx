import { IconCalendar, IconLogOut } from "./Icons";

interface NavBarProps {
  isConnected: boolean;
  onSignOut: () => void;
}

export default function NavBar({ isConnected, onSignOut }: NavBarProps) {
  return (
    <nav className="nav">
      <div className="nav-left">
        <div className="nav-logo">
          <IconCalendar size={16} />
          <span className="nav-logo-text">Scheduler AI</span>
        </div>
        <div className="nav-sep" />
        <span className="nav-ctx">Meeting Assistant</span>
      </div>
      <div className="nav-right">
        {isConnected && (
          <div className="badge-live">
            <span className="badge-dot" />
            Live
          </div>
        )}
        <button className="btn btn-ghost btn-icon" title="Sign out" onClick={onSignOut}>
          <IconLogOut />
        </button>
      </div>
    </nav>
  );
}
