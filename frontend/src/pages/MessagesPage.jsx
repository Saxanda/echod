import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function MessagesPage() {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        api.get("/messages/conversations")
            .then(({ data }) => {
                setConversations(data.conversations || []);
            })
            .catch((err) => {
                console.error("Failed to load conversations:", err);
                setConversations([]);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="page-loading">Loading messages…</div>;

    return (
        <main className="messages-page">
            <h1 className="page-title">Messages</h1>
            {conversations.length === 0 ? (
                <div className="empty-state">
                    <p>No conversations yet. Message someone from their profile!</p>
                </div>
            ) : (
                <ul className="conversations-list">
                    {conversations.map((conv) => (
                        <li
                            key={conv.id}
                            className="conversation-item"
                            onClick={() => navigate(`/messages/${conv.partner.id}`)}
                        >
                            <img
                                src={conv.partner.avatar || "/default-avatar.png"}
                                alt=""
                                className="conv-avatar"
                            />
                            <div className="conv-info">
                                <div className="conv-name">{conv.partner.displayName}</div>
                                <div className="conv-preview">{conv.lastMessage?.text || "…"}</div>
                            </div>
                            <div className="conv-time">
                                {conv.lastMessage &&
                                    new Date(conv.lastMessage.createdAt).toLocaleDateString()}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}
