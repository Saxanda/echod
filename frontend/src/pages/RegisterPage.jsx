import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const FIELDS = [
    { name: "displayName", label: "Display name", type: "text" },
    { name: "username",    label: "Username",      type: "text" },
    { name: "email",       label: "Email",         type: "email" },
    { name: "password",    label: "Password",      type: "password" },
    { name: "confirm",     label: "Confirm password", type: "password" },
];

export default function RegisterPage() {
    const { register } = useAuth();

    const [form, setForm] = useState({ displayName: "", username: "", email: "", password: "", confirm: "" });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) =>
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirm) return setError("Passwords do not match");
        setError("");
        setLoading(true);
        try {
            await register({
                username: form.username,
                displayName: form.displayName,
                email: form.email,
                password: form.password,
            });
            setSuccess(true);
        } catch (err) {
            console.log(err.response?.data);

            const message =
                err.response?.data?.errors?.[0]?.constraints
                    ? Object.values(err.response.data.errors[0].constraints)[0]
                    : err.response?.data?.message || "Registration failed";

            setError(message);
        }
    };

    if (success) {
        return (
            <div className="auth-page">
                <div className="auth-card">
                    <div className="auth-logo">✉️</div>
                    <h2>Check your email</h2>
                    <p>
                        We sent a verification link to <strong>{form.email}</strong>.
                        Please confirm your address to continue.
                    </p>
                    <Link
                        to="/auth/login"
                        className="btn-primary"
                        style={{ display: "block", marginTop: "1.5rem", textAlign: "center" }}
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">ЄchoD</div>
                <h1 className="auth-title">Create account</h1>
                {error && <div className="auth-error">{error}</div>}
                <form onSubmit={handleSubmit} className="auth-form">
                    {FIELDS.map(({ name, label, type }) => (
                        <div className="form-group" key={name}>
                            <label htmlFor={name}>{label}</label>
                            <input
                                id={name}
                                name={name}
                                type={type}
                                value={form[name]}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    ))}
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? "Creating…" : "Create account"}
                    </button>
                </form>
                <div className="auth-links">
                    <Link to="/auth/login">Already have an account? Sign in</Link>
                </div>
            </div>
        </div>
    );
}
