"use client";

import React, { useEffect, useState } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import { Plus, Palette, Settings } from "lucide-react";

export default function AdminDashboardOverview() {
  const [stats, setStats] = useState({
    comicsCount: 0,
    chaptersCount: 0,
    viewsCount: 0,
  });

  useEffect(() => {
    fetch("/api/comics?includeHidden=true")
      .then((res) => res.json())
      .then((comics) => {
        if (Array.isArray(comics)) {
          const totalChapters = comics.reduce(
            (acc, c) => acc + (c.chapters?.length || 0),
            0
          );
          const totalViews = comics.reduce(
            (acc, c) => acc + (c.views || 0),
            0
          );
          setStats({
            comicsCount: comics.length,
            chaptersCount: totalChapters,
            viewsCount: totalViews,
          });
        }
      });
  }, []);

  return (
    <div>
      <SectionHeader
        title="Dashboard Overview"
        subtitle="Quick overview of your MyComic platform performance and content"
      />

      {/* ── Stat Cards ─────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "var(--space-card-gap)",
          marginBottom: "32px",
        }}
      >
        {[
          {
            label: "Total Comics",
            value: stats.comicsCount,
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            ),
            color: "var(--color-primary)",
          },
          {
            label: "Published Chapters",
            value: stats.chaptersCount,
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            ),
            color: "var(--color-secondary)",
          },
          {
            label: "Total Reads / Views",
            value: stats.viewsCount,
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            ),
            color: "var(--color-tertiary)",
          },
        ].map((card) => (
          <div
            key={card.label}
            style={{
              padding: "20px",
              borderRadius: "var(--radius-lg)",
              background: "var(--color-bg-surface)",
              border: "1px solid var(--color-border)",
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <span style={{ fontSize: "2.5rem" }}>{card.icon}</span>
            <div>
              <span
                style={{
                  fontSize: "1.75rem",
                  fontWeight: 700,
                  color: card.color,
                  fontFamily: "var(--font-heading)",
                  display: "block",
                  lineHeight: 1.1,
                }}
              >
                {card.value}
              </span>
              <span
                style={{
                  fontSize: "var(--font-size-caption)",
                  color: "var(--color-text-secondary)",
                }}
              >
                {card.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Quick Actions ─────────────────────────────────────────── */}
      <div
        style={{
          padding: "24px",
          borderRadius: "var(--radius-xl)",
          background: "var(--color-bg-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        <h3
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "var(--font-size-h3)",
            fontWeight: 700,
            marginBottom: "16px",
          }}
        >
          Quick Management Actions
        </h3>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Button variant="primary" size="md" href="/admin/comics/new">
            <Plus size={17} aria-hidden /> Add New Comic
          </Button>
          <Button variant="secondary" size="md" href="/admin/theme">
            <Palette size={17} aria-hidden /> Customize Theme Colors
          </Button>
          <Button variant="ghost" size="md" href="/admin/settings">
            <Settings size={17} aria-hidden /> Section Visibility & Texts
          </Button>
        </div>
      </div>
    </div>
  );
}
