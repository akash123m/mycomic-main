"use client";

import React from "react";
import { formatDate, formatViews } from "@/lib/comics";

interface ChapterListItemProps {
  number: number;
  title: string;
  publishedAt: string;
  views: number;
  comicSlug: string;
  isNew?: boolean;
}

export default function ChapterListItem({
  number,
  title,
  publishedAt,
  views,
  comicSlug,
  isNew = false,
}: ChapterListItemProps) {
  return (
    <a
      href={`/comic/${comicSlug}/read/${number}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "clamp(10px, 2vw, 16px)",
        padding: "clamp(10px, 2vw, 14px) clamp(12px, 2vw, 16px)",
        borderRadius: "var(--radius-md)",
        background: "var(--color-bg-surface)",
        border: "1px solid var(--color-border)",
        textDecoration: "none",
        transition: "all var(--transition-fast)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--color-bg-hover)";
        e.currentTarget.style.borderColor = "var(--color-border-hover)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "var(--color-bg-surface)";
        e.currentTarget.style.borderColor = "var(--color-border)";
      }}
    >
      {/* Chapter number */}
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "clamp(32px, 5vw, 40px)",
          height: "clamp(32px, 5vw, 40px)",
          borderRadius: "var(--radius-md)",
          background: "var(--color-bg-elevated)",
          fontWeight: 700,
          fontSize: "var(--font-size-small)",
          color: "var(--color-primary)",
          flexShrink: 0,
        }}
      >
        {number}
      </span>

      {/* Title + date */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <h4
            style={{
              fontSize: "var(--font-size-small)",
              fontWeight: 600,
              color: "var(--color-text-primary)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </h4>
          {isNew && (
            <span
              style={{
                padding: "1px 8px",
                fontSize: "10px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                background: "var(--color-primary)",
                color: "var(--color-text-inverse)",
                borderRadius: "var(--radius-full)",
                flexShrink: 0,
              }}
            >
              New
            </span>
          )}
        </div>
        <p
          style={{
            fontSize: "var(--font-size-caption)",
            color: "var(--color-text-tertiary)",
            marginTop: "2px",
          }}
        >
          {formatDate(publishedAt)}
        </p>
      </div>

      {/* Views */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          fontSize: "var(--font-size-caption)",
          color: "var(--color-text-tertiary)",
          flexShrink: 0,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        {formatViews(views)}
      </div>

      {/* Arrow */}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </a>
  );
}
