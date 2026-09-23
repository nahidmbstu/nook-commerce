"use client";

import { useState } from "react";
import { ArrowRight, LockKeyhole } from "lucide-react";

export default function AdminLogin() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsLoading(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.get("email"), password: form.get("password") }) });
    const result = await response.json();
    if (!response.ok) setError(result.error || "Unable to sign in.");
    else window.location.reload();
    setIsLoading(false);
  }

  return <main className="admin-page"><section className="admin-login"><div className="admin-logo">N</div><p className="eyebrow">Private workspace</p><h1>Welcome back.</h1><p className="admin-muted">Sign in to manage your Nook orders.</p><form onSubmit={handleSubmit}><label>Email<input name="email" type="email" autoComplete="username" placeholder="admin@example.com" required /></label><label>Password<input name="password" type="password" autoComplete="current-password" placeholder="Your password" required /></label>{error && <p className="admin-error">{error}</p>}<button className="admin-submit" disabled={isLoading} type="submit"><LockKeyhole size={16} />{isLoading ? "Signing in..." : "Sign in"}<ArrowRight size={16} /></button></form></section></main>;
}
