import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import { getSocket } from "../sockets/socket";
import PostCard from "../components/PostCard";
import CreatePostForm from "../components/CreatePostForm";

export default function FeedPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchPosts = useCallback(async (p = 1) => {
        try {
            const { data } = await api.get(`/posts/feed?page=${p}&limit=20`);

            // ✅ to save respond
            const posts = Array.isArray(data) ? data : (data.posts ?? data.data ?? []);
            const hasMore = data.hasMore ?? false;

            if (p === 1) setPosts(posts);
            else setPosts((prev) => [...prev, ...posts]);
            setHasMore(hasMore);
        } catch (err) {
            setError("Could not load posts");
            setPosts([]); // ✅ Post
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPosts(1);
    }, [fetchPosts]);

    // Real-time: new posts from followed users
    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;
        const handler = (post) => setPosts((prev) => [post, ...prev]);
        socket.on("post_received", handler);
        return () => socket.off("post_received", handler);
    }, []);

    const handlePostCreated = (newPost) => setPosts((prev) => [newPost, ...prev]);

    const handleLikeToggle = (updated) =>
        setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));

    if (loading) return <div className="page-loading">Loading feed…</div>;

    return (
        <main className="feed-page">
            <h1 className="page-title">Feed</h1>
            <CreatePostForm onPostCreated={handlePostCreated} />
            {error && <div className="page-error">{error}</div>}
            <div className="posts-list">
                {posts.length === 0 ? (
                    <div className="empty-state">
                        <p>No posts yet. Follow someone or write something!</p>
                    </div>
                ) : (
                    posts.map((post) => (
                        <PostCard key={post.id} post={post} onLikeToggle={handleLikeToggle} />
                    ))
                )}
            </div>
            {hasMore && (
                <button
                    className="load-more-btn"
                    onClick={() => {
                        const next = page + 1;
                        setPage(next);
                        fetchPosts(next);
                    }}
                >
                    Load more
                </button>
            )}
        </main>
    );
}
