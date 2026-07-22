import { FormEvent, useEffect, useState } from "react";
import { apiFetch, ApiError } from "../lib/apiClient";
import { useAuth } from "../context/AuthContext";
import type { Link as LinkModel } from "../lib/types";

export function DashboardPage() {
  const { user, logout } = useAuth();
  const [links, setLinks] = useState<LinkModel[]>([]);
  const [targetUrl, setTargetUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    apiFetch<{ links: LinkModel[] }>("/api/links")
      .then((data) => setLinks(data.links))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load your links."))
      .finally(() => setLoaded(true));
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setCreating(true);
    try {
      const link = await apiFetch<LinkModel>("/api/links", {
        method: "POST",
        body: JSON.stringify({ targetUrl }),
      });
      setLinks((prev) => [link, ...prev]);
      setTargetUrl("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create the link.");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    const previous = links;
    setLinks((prev) => prev.filter((l) => l.id !== id)); // optimistic
    try {
      await apiFetch(`/api/links/${id}`, { method: "DELETE" });
    } catch {
      setLinks(previous); // roll back on failure
      setError("Could not delete that link.");
    }
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <span>Signed in as {user?.email}</span>
        <button type="button" onClick={logout}>Log out</button>
      </header>

      <form onSubmit={handleCreate} className="create-link-form">
        <input
          type="url"
          placeholder="https://example.com/a-very-long-url"
          value={targetUrl}
          onChange={(e) => setTargetUrl(e.target.value)}
          required
        />
        <button type="submit" disabled={creating}>{creating ? "Creating..." : "Shorten"}</button>
      </form>

      {error && <p className="error">{error}</p>}

      {!loaded ? (
        <p>Loading your links...</p>
      ) : links.length === 0 ? (
        <p>No links yet - create your first one above.</p>
      ) : (
        <ul className="link-list">
          {links.map((link) => (
            <li key={link.id}>
              <a href={link.shortUrl} target="_blank" rel="noopener noreferrer">{link.shortUrl}</a>
              <span className="target-url">&rarr; {link.targetUrl}</span>
              <span className="click-count">{link.clickCount} clicks</span>
              <button type="button" onClick={() => handleDelete(link.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
