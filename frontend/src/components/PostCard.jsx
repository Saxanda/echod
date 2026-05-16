import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function PostCard({ post, onLikeToggle }) {
    const [liked, setLiked] = useState(post.likedByMe || false);
    const [likesCount, setLikesCount] = useState(post.likesCount || 0);
    const [loading, setLoading] = useState(false);

    const postId = post.id;

    const handleLike = async () => {
        if (loading || !postId) return;

        setLoading(true);

        try {
            const nextLiked = !liked;

            if (liked) {
                await api.delete(`/posts/${postId}/like`);
            } else {
                await api.post(`/posts/${postId}/like`);
            }

            setLiked(nextLiked);
            setLikesCount((count) =>
                nextLiked ? count + 1 : Math.max(0, count - 1)
            );

            onLikeToggle?.({
                ...post,
                likedByMe: nextLiked,
                likesCount: nextLiked ? likesCount + 1 : Math.max(0, likesCount - 1),
            });
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
                    alt={post.author?.displayName || "User avatar"}
                    className="post-avatar"
                />
            </Link>

            <div className="post-body">
                <div className="post-header">
                    <Link to={`/profile/${post.author?.username}`} className="post-author-name">
                        {post.author?.displayName || "Unknown user"}
                    </Link>

                    <span className="post-author-username">
            @{post.author?.username || "unknown"}
          </span>

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
                        disabled={loading || !postId}
                    >
                        <span>{liked ? "♥" : "♡"}</span>
                        <span>{likesCount}</span>
                    </button>
                </div>
            </div>
        </article>
    );
}