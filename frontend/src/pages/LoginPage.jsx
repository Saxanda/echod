import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/feed";

    const [form, setForm] = useState({ email: "", password: "", rememberMe: false });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await login({ email: form.email, password: form.password }, form.rememberMe);
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || "Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = () => {
        window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">ЄchoD</div>
                <h1 className="auth-title">Sign in</h1>
                {error && <div className="auth-error">{error}</div>}
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            autoFocus
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-check">
                        <input
                            id="rememberMe"
                            name="rememberMe"
                            type="checkbox"
                            checked={form.rememberMe}
                            onChange={handleChange}
                        />
                        <label htmlFor="rememberMe">Remember me</label>
                    </div>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? "Signing in…" : "Sign in"}
                    </button>
                </form>
                <button onClick={handleGoogle} className="btn-google">
                    <span>G</span> Continue with Google
                </button>
                <div className="auth-links">
                    <Link to="/auth/forgot-password">Forgot your password?</Link>
                    <span>·</span>
                    <Link to="/auth/register">Create account</Link>
                </div>
            </div>
        </div>
    );
}
