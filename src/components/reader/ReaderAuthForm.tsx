"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { queryKeys, requestJson } from "@/lib/api";
import PasswordInput from "@/components/ui/PasswordInput";

const inputStyle = { width: "100%", padding: "9px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", background: "var(--color-bg-elevated)", color: "var(--color-text-primary)", fontSize: "0.9rem" };

export default function ReaderAuthForm({ mode, audience = "reader" }: { mode: "signin" | "signup"; audience?: "reader" | "author" }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const mutation = useMutation({
    mutationFn: () => requestJson(`/api/reader/auth/${mode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, audience }) }),
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: queryKeys.session }); router.push(audience === "author" ? "/author/dashboard" : "/dashboard"); },
    onError: (err) => setError(err instanceof Error && err.message.includes("409") ? "An account already exists" : mode === "signin" ? "Invalid email or password" : "Please check your details and try again"),
  });
  const submit = (event: React.FormEvent) => {
    event.preventDefault(); setError("");
    if ((mode === "signup" && !form.email.includes("@")) || !form.email.trim() || form.password.length < 8 || (mode === "signup" && (form.name.trim().length < 2 || form.password !== form.confirmPassword))) { setError("Please complete all fields correctly. Passwords need 8+ characters."); return; }
    mutation.mutate();
  };
  return (
    <form onSubmit={submit} style={{ width: "min(100%, 410px)", padding: "clamp(18px, 3vw, 28px)", borderRadius: "var(--radius-xl)", background: "var(--color-bg-surface)", border: "1px solid var(--color-border)", display: "grid", gap: mode === "signup" ? 10 : 13 }}>
      <div><p className="section-label">{audience === "author" ? "Creator studio" : "Reader account"}</p><h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.55rem, 3vw, 2rem)", lineHeight: 1.15, marginTop: 5 }}>{mode === "signin" ? (audience === "author" ? "Author login" : "Welcome back") : (audience === "author" ? "Become an author" : "Join MyComic")}</h1><p style={{ color: "var(--color-text-secondary)", marginTop: 4, fontSize: "0.86rem", lineHeight: 1.4 }}>{audience === "author" ? "Submit original work, manage your profile, and follow review status from one dashboard." : mode === "signin" ? "Continue your stories across every device." : "Create your reader profile and never lose your place."}</p></div>
      {mode === "signup" && <label style={{ fontSize: "0.84rem" }}>Name<input style={{ ...inputStyle, marginTop: 4 }} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" /></label>}
      <label style={{ fontSize: "0.84rem" }}>{audience === "author" && mode === "signin" ? "User ID or email" : "Email"}<input style={{ ...inputStyle, marginTop: 4 }} type={audience === "author" && mode === "signin" ? "text" : "email"} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" /></label>
      <label style={{ fontSize: "0.84rem" }}>Password<PasswordInput style={{ ...inputStyle, marginTop: 4 }} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete={mode === "signin" ? "current-password" : "new-password"} /></label>
      {mode === "signup" && <label style={{ fontSize: "0.84rem" }}>Confirm password<PasswordInput style={{ ...inputStyle, marginTop: 4 }} value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} autoComplete="new-password" /></label>}
      {error && <p role="alert" style={{ color: "var(--color-error)", fontSize: "var(--font-size-small)" }}>{error}</p>}
      <Button type="submit" fullWidth disabled={mutation.isPending}>{mutation.isPending ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}</Button>
      <p style={{ textAlign: "center", color: "var(--color-text-secondary)", fontSize: "var(--font-size-small)" }}>{mode === "signin" ? "New here? " : "Already have an account? "}<a href={audience === "author" ? (mode === "signin" ? "/author/signup" : "/author/signin") : (mode === "signin" ? "/signup" : "/signin")} style={{ color: "var(--color-primary)" }}>{mode === "signin" ? "Create account" : "Sign in"}</a></p>
    </form>
  );
}
