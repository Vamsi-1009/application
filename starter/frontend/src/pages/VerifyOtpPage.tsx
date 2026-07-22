import { FormEvent, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { apiFetch, ApiError } from "../lib/apiClient";

export function VerifyOtpPage() {
  const location = useLocation();
  const initialEmail = (location.state as { email?: string } | null)?.email ?? "";
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiFetch("/api/auth/verify-otp", { method: "POST", body: JSON.stringify({ email, code }) });
      navigate("/login");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError(null);
    try {
      await apiFetch("/api/auth/resend-otp", { method: "POST", body: JSON.stringify({ email }) });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    }
  }

  return (
    <div className="auth-page">
      <h1>Verify your email</h1>
      <p>Enter the 6-digit code we sent to your email. (No SMTP configured locally? Check the backend's console output.)</p>
      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Code
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            required
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading || code.length !== 6}>{loading ? "Verifying..." : "Verify"}</button>
      </form>
      <button type="button" className="link-button" onClick={handleResend}>Resend code</button>
      <p><Link to="/login">Back to login</Link></p>
    </div>
  );
}
