import { FormEvent, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch, ApiError } from "../lib/apiClient";

export function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    // Client-side checks are UX only - the backend re-validates everything.
    if (password.length < 10) {
      setError("Password must be at least 10 characters.");
      return;
    }

    setLoading(true);
    try {
      await apiFetch("/api/auth/signup", { method: "POST", body: JSON.stringify({ email, password }) });
      navigate("/verify-otp", { state: { email } });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <h1>Create your TinyLink account</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={10} />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>{loading ? "Sending code..." : "Sign up"}</button>
      </form>
      <p>Already have an account? <Link to="/login">Log in</Link></p>
    </div>
  );
}
