import { useState, useRef } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const MAX_LENGTH = 280;

export default function CreatePostForm({ onPostCreated }) {
    const { user } = useAuth();
    const [text, setText] = useState("");
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const fileRef = useRef();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImage(file);
        setPreview(URL.createObjectURL(file));
    };

    const removeImage = () => {
        setImage(null);
        setPreview(null);
        if (fileRef.current) fileRef.current.value = "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim() && !image) return;
        if (text.length > MAX_LENGTH) return;
        setLoading(true);
        setError("");
        try {
            const formData = new FormData();
            formData.append("text", text);
            if (image) formData.append("image", image);
            const { data } = await api.post("/posts", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            onPostCreated?.(data);
            setText("");
            removeImage();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create post");
        } finally {
            setLoading(false);
        }
    };

    const remaining = MAX_LENGTH - text.length;
    const isOverLimit = remaining < 0;
    const isNearLimit = remaining <= 20;

    return (
        <form className="create-post-form" onSubmit={handleSubmit}>
            <img
                src={user?.avatar || "/default-avatar.png"}
                alt=""
                className="create-post-avatar"
            />
            <div className="create-post-content">
        <textarea
            className="create-post-textarea"
            placeholder="What's happening?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
        />
                {preview && (
                    <div className="create-post-preview">
                        <img src={preview} alt="Preview" />
                        <button type="button" onClick={removeImage} className="remove-image-btn">
                            ✕
                        </button>
                    </div>
                )}
                {error && <p className="form-error">{error}</p>}
                <div className="create-post-footer">
                    <div className="create-post-tools">
                        <button
                            type="button"
                            className="attach-image-btn"
                            onClick={() => fileRef.current?.click()}
                            title="Attach image"
                        >
                            🖼
                        </button>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileRef}
                            onChange={handleImageChange}
                            style={{ display: "none" }}
                        />
                    </div>
                    <div className="create-post-right">
            <span
                className={`char-counter ${isNearLimit ? "warn" : ""} ${isOverLimit ? "over" : ""}`}
            >
              {remaining}
            </span>
                        <button
                            type="submit"
                            className="submit-post-btn"
                            disabled={loading || isOverLimit || (!text.trim() && !image)}
                        >
                            {loading ? "Posting…" : "Post"}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
}
