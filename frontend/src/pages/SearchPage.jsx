import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../api/axios";
import PostCard from "../components/PostCard";

export default function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get("q") || "";

    const [tab, setTab] = useState("posts");
    const [posts, setPosts] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [input, setInput] = useState(query);

    useEffect(() => {
        if (!query) return;
        setLoading(true);
        Promise.all([
            api.get(`/posts/search?q=${encodeURIComponent(query)}`),
            api.get(`/users/search?q=${encodeURIComponent(query)}`),
        ])
            .then(([{ data: p }, { data: u }]) => {
                setPosts(p.posts || []);
                setUsers(u.users || u || []);
            })
            .catch((err) => {
                console.error("Search failed:", err);
                setPosts([]);
                setUsers([]);
            })
            .finally(() => setLoading(false));
    }, [query]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (input.trim()) setSearchParams({ q: input.trim() });
    };

    return (
        <main className="search-page">
            <h1 className="page-title">Search</h1>
            <form className="search-form" onSubmit={handleSearch}>
                <input
                    className="search-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Search people and posts…"
                    autoFocus
                />
                <button type="submit" className="btn-primary">
                    Search
                </button>
            </form>

            {query && (
                <>
                    <div className="search-tabs">
                        <button
                            className={`tab ${tab === "posts" ? "active" : ""}`}
                            onClick={() => setTab("posts")}
                        >
                            Posts {posts.length > 0 && `(${posts.length})`}
                        </button>
                        <button
                            className={`tab ${tab === "users" ? "active" : ""}`}
                            onClick={() => setTab("users")}
                        >
                            People {users.length > 0 && `(${users.length})`}
                        </button>
                    </div>

                    {loading ? (
                        <div className="page-loading">Searching…</div>
                    ) : (
                        <>
                            {tab === "posts" && (
                                <div className="posts-list">
                                    {posts.length === 0 ? (
                                        <div className="empty-state">
                                            <p>No posts found for "{query}".</p>
                                        </div>
                                    ) : (
                                        posts.map((p) => <PostCard key={p.id} post={p} />)
                                    )}
                                </div>
                            )}
                            {tab === "users" && (
                                <ul className="users-list">
                                    {users.length === 0 ? (
                                        <div className="empty-state">
                                            <p>No users found for "{query}".</p>
                                        </div>
                                    ) : (
                                        users.map((u) => (
                                            <li key={u.id} className="user-item">
                                                <Link to={`/profile/${u.username}`} className="user-link">
                                                    <img src={u.avatar || "/default-avatar.png"} alt="" />
                                                    <div>
                                                        <strong>{u.displayName}</strong>
                                                        <span>@{u.username}</span>
                                                    </div>
                                                </Link>
                                            </li>
                                        ))
                                    )}
                                </ul>
                            )}
                        </>
                    )}
                </>
            )}
        </main>
    );
}
