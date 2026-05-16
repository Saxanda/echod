import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV = [
    { to: "/feed",          label: "Feed",          icon: "🏠" },
    { to: "/favorites",     label: "Favorites",     icon: "♥"  },
    { to: "/messages",      label: "Messages",      icon: "✉️" },
    { to: "/notifications", label: "Notifications", icon: "🔔" },
    { to: "/search",        label: "Search",        icon: "🔍" },
];

export default function Header() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/auth/login");
    };

    return (
        <header className="app-header">
            <Link to="/feed" className="header-logo">ЄchoD</Link>
            <nav className="header-nav">
                {NAV.map(({ to, label, icon }) => (
                    <Link
                        key={to}
                        to={to}
                        className={`nav-link ${location.pathname.startsWith(to) ? "active" : ""}`}
                        title={label}
                    >
                        <span className="nav-icon">{icon}</span>
                        <span className="nav-label">{label}</span>
                    </Link>
                ))}
            </nav>
            <div className="header-user">
                {user && (
                    <>
                        <Link to={`/profile/${user.username}`} className="header-profile-link">
                            <img
                                src={user.avatar || "/default-avatar.png"}
                                alt={user.displayName}
                                className="header-avatar"
                            />
                            <span className="header-displayname">{user.displayName}</span>
                        </Link>
                        <button onClick={handleLogout} className="logout-btn" title="Logout">
                            ⎋ Logout
                        </button>
                    </>
                )}
            </div>
        </header>
    );
}
