import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function PostCard({ post, onLikeToggle }) {
    const { user } = useAuth();
    const [liked, setLiked] = useState(post.likedByMe || false);
    const [likesCount, setLikesCount] = useState(post.likesCount || 0);
    const [loading, setLoading] = useState(false);

    const handleLike = async () => {
        if (loading) return;
        setLoading(true);
        try {
            if (liked) {
                await api.delete(`/posts/${post.id}/like`);
                setLiked(false);
                setLikesCount((c) => c - 1);
            } else {
                await api.post(`/posts/${post.id}/like`);
                setLiked(true);
                setLikesCount((c) => c + 1);
            }
            onLikeToggle?.({ ...post, likedByMe: !liked });
        } catch (err) {
            console.error("Like error:", err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) =>
        new Date(date).toLocaleDateString("uk-UA", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

    return (
        <article className="post-card">
            <Link to={`/profile/${post.author?.username}`} className="post-avatar-link">
                <img
                    src={post.author?.avatar || "/default-avatar.png"}
                    alt={post.author?.displayName}
                    className="post-avatar"
                />
            </Link>
            <div className="post-body">
                <div className="post-header">
                    <Link to={`/profile/${post.author?.username}`} className="post-author-name">
                        {post.author?.displayName}
                    </Link>
                    <span className="post-author-username">@{post.author?.username}</span>
                    <span className="post-date">{formatDate(post.createdAt)}</span>
                </div>
                <p className="post-text">{post.text}</p>
                {post.imageUrl && (
                    <img src={post.imageUrl} alt="Post attachment" className="post-image" />
                )}
                <div className="post-actions">
                    <button
                        className={`like-btn ${liked ? "liked" : ""}`}
                        onClick={handleLike}
                        disabled={loading}
                        aria-label={liked ? "Unlike" : "Like"}
                    >
                        <span className="like-icon">{liked ? "♥" : "♡"}</span>
                        <span className="like-count">{likesCount}</span>
                    </button>
                </div>
            </div>
        </article>
    );
}
