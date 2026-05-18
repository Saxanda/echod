// frontend/src/pages/ChatPage.jsx
import { useEffect, useRef, useState } from "react";
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

    const bottomRef = useRef(null);

    const myId = String(me?.id || me?._id || "");

    const addMessage = (message) => {
        setMessages((prev) => {
            if (prev.some((m) => m.id === message.id)) {
                return prev;
            }

            return [...prev, message];
        });
    };

    const scrollToBottom = () => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        setLoading(true);

        Promise.all([
            api.get(`/users/id/${userId}`),
            api.get(`/messages/${userId}`),
        ])
            .then(([{ data: user }, { data: msgs }]) => {
                setPartner(user);
                setMessages(Array.isArray(msgs) ? msgs : []);
            })
            .catch((err) => {
                console.error("Failed to load chat:", err);
                setMessages([]);
            })
            .finally(() => setLoading(false));
    }, [userId]);

    useEffect(() => {
        const socket = getSocket();

        if (!socket) return;

        const handler = (msg) => {
            if (
                msg.senderId === String(userId) ||
                msg.receiverId === String(userId)
            ) {
                addMessage(msg);
            }
        };

        socket.on("new_message", handler);

        return () => {
            socket.off("new_message", handler);
        };
    }, [userId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();

        if (!text.trim()) return;

        const msgText = text.trim();
        setText("");

        try {
            const { data } = await api.post(`/messages/${userId}`, {
                text: msgText,
            });

            addMessage(data);
        } catch (err) {
            console.error("Send message failed:", err);
            setText(msgText);
        }
    };

    if (loading) {
        return <div className="page-loading">Loading chat…</div>;
    }

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
                        className={`message ${
                            msg.senderId === myId ? "mine" : "theirs"
                        }`}
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