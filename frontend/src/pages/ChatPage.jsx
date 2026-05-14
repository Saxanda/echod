import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { getSocket } from "../sockets/socket";

export default function ChatPage() {
    const { userId } = useParams();
    const { user: me } = useAuth();
    const [partner, setPartner] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(true);
    const bottomRef = useRef();

    const scrollToBottom = () =>
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });

    useEffect(() => {
        Promise.all([
            api.get(`/users/id/${userId}`),
            api.get(`/messages/${userId}`),
        ])
            .then(([{ data: user }, { data: msgs }]) => {
                setPartner(user);
                setMessages(msgs);
            })
            .finally(() => setLoading(false));
    }, [userId]);

    // Real-time incoming messages
    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;
        const handler = (msg) => {
            if (
                String(msg.senderId) === String(userId) ||
                String(msg.receiverId) === String(userId)
            ) {
                setMessages((prev) => [...prev, msg]);
            }
        };
        socket.on("message_received", handler);
        return () => socket.off("message_received", handler);
    }, [userId]);

    useEffect(scrollToBottom, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        const msgText = text;
        setText("");
        try {
            const { data } = await api.post("/messages", {
                receiverId: userId,
                text: msgText,
            });
            setMessages((prev) => [...prev, data]);
        } catch (err) {
            setText(msgText); // restore on error
        }
    };

    if (loading) return <div className="page-loading">Loading chat…</div>;

    return (
        <main className="chat-page">
            <div className="chat-header">
                <img src={partner?.avatar || "/default-avatar.png"} alt="" />
                <div>
                    <strong>{partner?.displayName}</strong>
                    <span className="chat-username">@{partner?.username}</span>
                </div>
            </div>
            <div className="chat-messages">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`message ${String(msg.senderId) === String(me.id) ? "mine" : "theirs"}`}
                    >
                        <p>{msg.text}</p>
                        <span className="msg-time">
              {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
              })}
            </span>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>
            <form className="chat-input-form" onSubmit={handleSend}>
                <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type a message…"
                    className="chat-input"
                    autoFocus
                />
                <button type="submit" className="btn-primary" disabled={!text.trim()}>
                    Send
                </button>
            </form>
        </main>
    );
}
