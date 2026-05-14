import { useState, useEffect } from "react";
import api from "../api/axios";
import PostCard from "../components/PostCard";

export default function FavoritesPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api
            .get("/posts/liked")
            .then(({ data }) => {
                setPosts(data.posts || []);
            })
            .catch((error) => {
                console.error("Failed to load favorites:", error);
                setPosts([]);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleLikeToggle = (updated) => {
        if (!updated.likedByMe) {
            setPosts((prev) => prev.filter((p) => p.id !== updated.id));
        } else {
            setPosts((prev) =>
                prev.map((p) => (p.id === updated.id ? updated : p))
            );
        }
    };

    if (loading) return <div className="page-loading">Loading favorites…</div>;

    return (
        <main className="feed-page">
            <h1 className="page-title">Favorites</h1>

            {posts.length === 0 ? (
                <div className="empty-state">
                    <p>You haven't liked any posts yet.</p>
                </div>
            ) : (
                <div className="posts-list">
                    {posts.map((post) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            onLikeToggle={handleLikeToggle}
                        />
                    ))}
                </div>
            )}
        </main>
    );
}