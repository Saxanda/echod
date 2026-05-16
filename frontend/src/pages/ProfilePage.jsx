import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/PostCard";

export default function ProfilePage() {
    const { username } = useParams();
    const { user: me, updateUser } = useAuth();
    const navigate = useNavigate();
    const isOwn = me?.username === username;

    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [following, setFollowing] = useState(false);
    const [showFollowers, setShowFollowers] = useState(false);

    useEffect(() => {
        setLoading(true);
        setEditing(false);
        Promise.all([
            api.get(`/users/${username}`),
            api.get(`/posts/user/${username}`),
        ])
            .then(([{ data: user }, { data: postsData }]) => {
                setProfile(user);
                setFollowing(user.followedByMe || false);
                setPosts(postsData.posts);
                setEditForm({ displayName: user.displayName, bio: user.bio || "" });
            })
            .catch(() => setError("User not found"))
            .finally(() => setLoading(false));
    }, [username]);

    const handleFollow = async () => {
        try {
            if (following) {
                await api.delete(`/users/${profile.id}/follow`);
                setFollowing(false);
                setProfile((p) => ({ ...p, followersCount: p.followersCount - 1 }));
            } else {
                await api.post(`/users/${profile.id}/follow`);
                setFollowing(true);
                setProfile((p) => ({ ...p, followersCount: p.followersCount + 1 }));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append("displayname", editForm.displayName);
            formData.append("bio", editForm.bio);
            if (editForm.avatarFile) formData.append("avatar", editForm.avatarFile);
            if (editForm.headerFile) formData.append("header", editForm.headerFile);
            const { data } = await api.put("/users/me", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setProfile(data);
            updateUser(data);
            setEditing(false);
        } catch (err) {
            setError("Failed to save profile");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="page-loading">Loading profile…</div>;
    if (error) return <div className="page-error">{error}</div>;

    return (
        <main className="profile-page">
            {/* Header banner */}
            <div className="profile-header">
                <img
                    src={profile.headerPhoto || "/default-header.jpg"}
                    alt=""
                    className="profile-header-img"
                />
                <div className="profile-info">
                    <img
                        src={profile.avatar || "/default-avatar.png"}
                        alt=""
                        className="profile-avatar"
                    />
                    <div className="profile-meta">
                        <h1>{profile.displayName}</h1>
                        <span className="profile-username">@{profile.username}</span>
                        {profile.bio && <p className="profile-bio">{profile.bio}</p>}
                        <div className="profile-stats">
              <span>
                <strong>{profile.followingCount ?? 0}</strong> Following
              </span>
                            <button className="link-btn" onClick={() => setShowFollowers(true)}>
                                <strong>{profile.followersCount ?? 0}</strong> Followers
                            </button>
                        </div>
                    </div>
                    <div className="profile-actions">
                        {isOwn ? (
                            <button
                                className="btn-secondary"
                                onClick={() => setEditing((e) => !e)}
                            >
                                {editing ? "Cancel" : "Edit profile"}
                            </button>
                        ) : (
                            <>
                                <button
                                    className={following ? "btn-secondary" : "btn-primary"}
                                    onClick={handleFollow}
                                >
                                    {following ? "Unfollow" : "Follow"}
                                </button>
                                <button
                                    className="btn-secondary"
                                    onClick={() => navigate(`/messages/${profile.id}`)}
                                >
                                    Message
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit form */}
            {isOwn && editing && (
                <form className="edit-profile-form" onSubmit={handleSaveProfile}>
                    <h2>Edit Profile</h2>
                    <div className="form-group">
                        <label>Display name</label>
                        <input
                            value={editForm.displayName}
                            onChange={(e) => setEditForm((f) => ({ ...f, displayName: e.target.value }))}
                        />
                    </div>
                    <div className="form-group">
                        <label>Bio</label>
                        <textarea
                            value={editForm.bio}
                            onChange={(e) => setEditForm((f) => ({ ...f, bio: e.target.value }))}
                            rows={3}
                        />
                    </div>
                    <div className="form-group">
                        <label>Avatar</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setEditForm((f) => ({ ...f, avatarFile: e.target.files[0] }))}
                        />
                    </div>
                    <div className="form-group">
                        <label>Header photo</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setEditForm((f) => ({ ...f, headerFile: e.target.files[0] }))}
                        />
                    </div>
                    <button type="submit" className="btn-primary" disabled={saving}>
                        {saving ? "Saving…" : "Save changes"}
                    </button>
                </form>
            )}

            {/* Posts */}
            <div className="posts-list" style={{ marginTop: "1.5rem" }}>
                {posts.length === 0 ? (
                    <div className="empty-state">
                        <p>No posts yet.</p>
                    </div>
                ) : (
                    posts.map((post) => <PostCard key={post.id} post={post} />)
                )}
            </div>

            {/* Followers modal */}
            {showFollowers && (
                <div className="modal-overlay" onClick={() => setShowFollowers(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Followers</h2>
                            <button onClick={() => setShowFollowers(false)} className="modal-close">✕</button>
                        </div>
                        <FollowersList userId={profile.id} />
                    </div>
                </div>
            )}
        </main>
    );
}

function FollowersList({ userId }) {
    const [followers, setFollowers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        api.get(`/users/${userId}/followers`).then(({ data }) => setFollowers(data));
    }, [userId]);

    return (
        <ul className="followers-list">
            {followers.length === 0 && <li className="empty-state">No followers yet.</li>}
            {followers.map((f) => (
                <li
                    key={f.id}
                    className="follower-item"
                    onClick={() => navigate(`/profile/${f.username}`)}
                >
                    <img src={f.avatar || "/default-avatar.png"} alt="" />
                    <div>
                        <strong>{f.displayName}</strong>
                        <span>@{f.username}</span>
                    </div>
                </li>
            ))}
        </ul>
    );
}
