"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { requestJson } from "@/lib/api";

export default function NewsletterForm({ source = "website" }: { source?: string }) {
  const [email, setEmail] = useState(""); const [message, setMessage] = useState("");
  const mutation = useMutation({ mutationFn: () => requestJson<{ alreadySubscribed?: boolean; reactivated?: boolean }>("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, source }) }), onSuccess: (data) => { setEmail(""); setMessage(data.alreadySubscribed ? "You are already subscribed." : data.reactivated ? "Subscription reactivated." : "Thanks for subscribing!"); }, onError: () => setMessage("Please enter a valid email.") });
  return <div><form onSubmit={(e) => { e.preventDefault(); if (!mutation.isPending) mutation.mutate(); }} style={{ display: "flex", gap: 8 }}><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" style={{ flex: 1, minWidth: 0, padding: "11px 14px", borderRadius: "var(--radius-full)", background: "var(--color-bg-elevated)", border: "1px solid var(--color-border)", color: "var(--color-text-primary)" }} /><button disabled={mutation.isPending} className="mc-button mc-button-primary" style={{ padding: "10px 18px", borderRadius: "var(--radius-full)", background: "var(--color-primary)", color: "var(--color-text-inverse)", border: 0, fontWeight: 700 }}>{mutation.isPending ? "Joining…" : "Subscribe"}</button></form>{message && <p role="status" style={{ marginTop: 7, fontSize: 12, color: "var(--color-primary)" }}>{message}</p>}</div>;
}
