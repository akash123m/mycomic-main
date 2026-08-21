"use client";

import React, { useEffect, useState } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    showHeroBanner: true,
    showFeaturedSection: true,
    showTrendingSection: true,
    showAllComicsSection: true,
    showHowItWorks: true,
    showGenresSection: true,
    showNewsletter: true,
    showCreatorSection: true,
    heroTitle: "DISCOVER. READ. REMEMBER.",
    heroSubtitle: "Where stories come alive, one panel at a time.",
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setSettings((prev) => ({ ...prev, ...data }));
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
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      alert("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { key: "showHeroBanner", label: "Hero Banner Section", desc: "Main headline banner at top of landing page" },
    { key: "showTrendingSection", label: "Trending & Popular Series", desc: "Ranked Trending and Popular comic tabs" },
    { key: "showAllComicsSection", label: "All Comics / Recently Added", desc: "Complete landing-page grid of the latest visible comics" },
    { key: "showHowItWorks", label: "How It Works Cards", desc: "3-step visual instruction cards" },
    { key: "showGenresSection", label: "Explore Genres Grid", desc: "Category pills and counts grid" },
    { key: "showNewsletter", label: "Newsletter Subscription Section", desc: "Email subscription gradient section" },
    { key: "showCreatorSection", label: "About Creator / Mission Section", desc: "Storyteller mission card section" },
  ];

  return (
    <div style={{ maxWidth: "800px" }}>
      <SectionHeader
        title="Site Settings & Section Controls"
        subtitle="Show/hide landing page sections and edit headline texts"
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
          ✓ Settings saved successfully!
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
        <h3 style={{ fontSize: "var(--font-size-h3)", fontWeight: 700 }}>
          Landing Page Section Visibility
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {sections.map((sec) => {
            const isChecked = Boolean(settings[sec.key as keyof typeof settings]);
            return (
              <label
                key={sec.key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 18px",
                  borderRadius: "var(--radius-lg)",
                  background: "var(--color-bg-elevated)",
                  border: "1px solid var(--color-border)",
                  cursor: "pointer",
                }}
              >
                <div>
                  <span
                    style={{
                      display: "block",
                      fontSize: "var(--font-size-small)",
                      fontWeight: 600,
                      color: "var(--color-text-primary)",
                    }}
                  >
                    {sec.label}
                  </span>
                  <span
                    style={{
                      fontSize: "var(--font-size-caption)",
                      color: "var(--color-text-tertiary)",
                    }}
                  >
                    {sec.desc}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) =>
                    setSettings({ ...settings, [sec.key]: e.target.checked })
                  }
                  style={{ width: "20px", height: "20px", accentColor: "var(--color-primary)" }}
                />
              </label>
            );
          })}
        </div>

        <h3 style={{ fontSize: "var(--font-size-h3)", fontWeight: 700, marginTop: "12px" }}>
          Headline Text Customization
        </h3>

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
            Hero Headline Text
          </label>
          <input
            type="text"
            value={settings.heroTitle}
            onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
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
            Hero Subtitle Text
          </label>
          <input
            type="text"
            value={settings.heroSubtitle}
            onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
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

        <Button variant="primary" size="lg" type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Settings"}
        </Button>
      </form>
    </div>
  );
}
