import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await api.post("/auth/forgot-password", { email });
            setSent(true);
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">🔑</div>
                <h1 className="auth-title">Reset password</h1>
                {sent ? (
                    <p>
                        If <strong>{email}</strong> is registered, you'll receive a reset link shortly.
                    </p>
                ) : (
                    <>
                        {error && <div className="auth-error">{error}</div>}
                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="form-group">
                                <label htmlFor="email">Your email address</label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>
                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? "Sending…" : "Send reset link"}
                            </button>
                        </form>
                    </>
                )}
                <div className="auth-links">
                    <Link to="/auth/login">← Back to login</Link>
                </div>
            </div>
        </div>
    );
}
