"use client";

import React, { useEffect, useState } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";

export default function AdminThemePage() {
  const [primaryColor, setPrimaryColor] = useState("#9dfb2b");
  const [secondaryColor, setSecondaryColor] = useState("#da009d");
  const [tertiaryColor, setTertiaryColor] = useState("#079ea8");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.primaryColor) setPrimaryColor(data.primaryColor);
        if (data.secondaryColor) setSecondaryColor(data.secondaryColor);
        if (data.tertiaryColor) setTertiaryColor(data.tertiaryColor);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primaryColor,
          secondaryColor,
          tertiaryColor,
        }),
      });

      if (res.ok) {
        setSaved(true);
        // Force refresh root CSS vars immediately
        const root = document.documentElement;
        root.style.setProperty("--color-primary", primaryColor);
        root.style.setProperty("--color-secondary", secondaryColor);
        root.style.setProperty("--color-tertiary", tertiaryColor);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      alert("Failed to save theme settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "800px" }}>
      <SectionHeader
        title="Theme Color Customizer"
        subtitle="Change color codes below to immediately re-theme the entire website"
      />

      {saved && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            background: "rgba(34, 197, 94, 0.15)",
            border: "1px solid var(--color-success)",
            color: "var(--color-success)",
            fontSize: "var(--font-size-small)",
            fontWeight: 600,
            marginBottom: "20px",
          }}
        >
          ✓ Theme colors saved and updated globally!
        </div>
      )}

      <form
        onSubmit={handleSave}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          padding: "clamp(1.5rem, 4vw, 2.5rem)",
          borderRadius: "var(--radius-xl)",
          background: "var(--color-bg-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        {/* Primary Color */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: "var(--font-size-small)",
              fontWeight: 700,
              color: "var(--color-text-primary)",
              marginBottom: "4px",
            }}
          >
            Primary Accent Color (CTAs, active highlights)
          </label>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "var(--radius-md)",
                border: "none",
                cursor: "pointer",
                background: "transparent",
              }}
            />
            <input
              type="text"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: "var(--radius-md)",
                background: "var(--color-bg-elevated)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text-primary)",
                fontFamily: "var(--font-mono)",
                fontWeight: 600,
              }}
            />
          </div>
        </div>

        {/* Secondary Color */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: "var(--font-size-small)",
              fontWeight: 700,
              color: "var(--color-text-primary)",
              marginBottom: "4px",
            }}
          >
            Secondary Accent Color (Genre tags, gradients)
          </label>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <input
              type="color"
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "var(--radius-md)",
                border: "none",
                cursor: "pointer",
                background: "transparent",
              }}
            />
            <input
              type="text"
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: "var(--radius-md)",
                background: "var(--color-bg-elevated)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text-primary)",
                fontFamily: "var(--font-mono)",
                fontWeight: 600,
              }}
            />
          </div>
        </div>

        {/* Tertiary Color */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: "var(--font-size-small)",
              fontWeight: 700,
              color: "var(--color-text-primary)",
              marginBottom: "4px",
            }}
          >
            Tertiary Accent Color (Subtle accents, links)
          </label>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <input
              type="color"
              value={tertiaryColor}
              onChange={(e) => setTertiaryColor(e.target.value)}
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "var(--radius-md)",
                border: "none",
                cursor: "pointer",
                background: "transparent",
              }}
            />
            <input
              type="text"
              value={tertiaryColor}
              onChange={(e) => setTertiaryColor(e.target.value)}
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: "var(--radius-md)",
                background: "var(--color-bg-elevated)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text-primary)",
                fontFamily: "var(--font-mono)",
                fontWeight: 600,
              }}
            />
          </div>
        </div>

        {/* Preview Palette */}
        <div>
          <span
            style={{
              display: "block",
              fontSize: "var(--font-size-caption)",
              fontWeight: 600,
              color: "var(--color-text-tertiary)",
              marginBottom: "8px",
            }}
          >
            Live Palette Preview
          </span>
          <div
            style={{
              height: "40px",
              borderRadius: "var(--radius-md)",
              background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor}, ${tertiaryColor})`,
            }}
          />
        </div>

        <Button variant="primary" size="lg" type="submit" disabled={loading}>
          {loading ? "Saving Theme..." : "Save Theme Colors"}
        </Button>
      </form>
    </div>
  );
}
