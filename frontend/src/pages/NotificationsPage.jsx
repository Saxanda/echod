// frontend/src/pages/NotificationsPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const TYPE_ICONS = {
    NEW_MESSAGE: "✉️",
    NEW_FOLLOWER: "👤",
    NEW_POST: "📝",
};

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        api.get("/notifications")
            .then(({ data }) => {
                setNotifications(data.notifications || []);
            })
            .catch((err) => {
                console.error("Failed to load notifications:", err);
                setNotifications([]);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleClick = async (notif) => {
        if (!notif.read) {
            await api.put(`/notifications/${notif.id}/read`).catch(() => {});

            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === notif.id ? { ...n, read: true } : n
                )
            );
        }

        if (notif.type === "NEW_MESSAGE") {
            navigate(`/messages/${notif.chatUserId}`);
        } else if (notif.type === "NEW_POST") {
            navigate("/feed");
        } else if (notif.type === "NEW_FOLLOWER") {
            navigate(`/profile/${notif.sender?.username}`);
        }
    };

    if (loading) {
        return <div className="page-loading">Loading notifications…</div>;
    }

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
                            className={`notification-item ${n.read ? "" : "unread"}`}
                            onClick={() => handleClick(n)}
                        >
              <span className="notif-icon">
                {TYPE_ICONS[n.type] || "🔔"}
              </span>

                            <div className="notif-body">
                                <p>
                                    <strong>{n.sender?.displayName || "Someone"}</strong>{" "}
                                    {n.text}
                                </p>

                                <span className="notif-time">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
                            </div>

                            {!n.read && <span className="notif-dot" />}
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}