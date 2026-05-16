import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const TYPE_ICONS = {
    message: "✉️",
    follow:  "👤",
    post:    "📝",
};

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        api.get("/notifications")
            .then(({ data }) => setNotifications(data))
            .finally(() => setLoading(false));
    }, []);

    const handleClick = async (notif) => {
        if (!notif.isRead) {
            await api.patch(`/notifications/${notif.id}/read`).catch(() => {});
            setNotifications((prev) =>
                prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
            );
        }
        if (notif.type === "message") navigate(`/messages/${notif.refId}`);
        else if (notif.type === "post") navigate("/feed");
        else if (notif.type === "follow") navigate(`/profile/${notif.refUsername}`);
    };

    if (loading) return <div className="page-loading">Loading notifications…</div>;

    return (
        <main className="notifications-page">
            <h1 className="page-title">Notifications</h1>
            {notifications.length === 0 ? (
                <div className="empty-state">
                    <p>No notifications yet.</p>
                </div>
            ) : (
                <ul className="notifications-list">
                    {notifications.map((n) => (
                        <li
                            key={n.id}
                            className={`notification-item ${n.isRead ? "" : "unread"}`}
                            onClick={() => handleClick(n)}
                        >
                            <span className="notif-icon">{TYPE_ICONS[n.type] || "🔔"}</span>
                            <div className="notif-body">
                                <p>{n.message}</p>
                                <span className="notif-time">
                  {new Date(n.createdAt).toLocaleDateString()}
                </span>
                            </div>
                            {!n.isRead && <span className="notif-dot" />}
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}
