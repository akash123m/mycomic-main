"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import PasswordInput from "@/components/ui/PasswordInput";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
      } else {
        queryClient.setQueryData(queryKeys.session, { ...data.user, role: "ADMIN" });
        router.push("/admin");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        background: "var(--color-bg-base)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "clamp(1.5rem, 4vw, 2.5rem)",
          borderRadius: "var(--radius-xl)",
          background: "var(--color-bg-surface)",
          border: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "var(--font-size-h2)",
              fontWeight: 700,
            }}
          >
            Admin Sign In
          </h1>
          <p
            style={{
              fontSize: "var(--font-size-small)",
              color: "var(--color-text-secondary)",
              marginTop: "4px",
            }}
          >
            Enter your credentials to access the CMS dashboard
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "var(--radius-md)",
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid var(--color-error)",
              color: "var(--color-error)",
              fontSize: "var(--font-size-caption)",
              marginBottom: "16px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label
              style={{
                display: "block",
                fontSize: "var(--font-size-caption)",
                fontWeight: 600,
                color: "var(--color-text-secondary)",
                marginBottom: "6px",
              }}
            >
              Email Address
            </label>
            <input
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "var(--radius-md)",
                background: "var(--color-bg-elevated)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text-primary)",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "var(--font-size-caption)",
                fontWeight: 600,
                color: "var(--color-text-secondary)",
                marginBottom: "6px",
              }}
            >
              Password
            </label>
            <PasswordInput
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "var(--radius-md)",
                background: "var(--color-bg-elevated)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text-primary)",
                outline: "none",
              }}
            />
          </div>

          <Button variant="primary" size="lg" type="submit" fullWidth disabled={loading}>
            {loading ? "Signing in..." : "Sign In to Admin Panel"}
          </Button>
        </form>
      </div>
    </div>
  );
}
