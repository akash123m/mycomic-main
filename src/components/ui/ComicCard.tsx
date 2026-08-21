"use client";

import React from "react";
import Image from "next/image";
import StarRating from "./StarRating";
import GenreBadge from "./GenreBadge";
import StarIcon from "./icons/StarIcon";
import type { Genre, CardSize } from "@/types";

interface ComicCardProps {
  title: string;
  slug: string;
  coverImage: string;
  genres: Genre[];
  rating: number;
  chapterCount: number;
  views?: number;
  likes?: number;
  size?: CardSize;
  rank?: number;
  rankChange?: string;
  badge?: string;
}

function formatViews(views: number): string {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}k`;
  return views.toString();
}

const sizeConfig: Record<
  CardSize,
  {
    titleSize: string;
    padding: string;
  }
> = {
  sm: {
    titleSize: "0.85rem",
    padding: "6px 4px 8px 4px",
  },
  md: {
    titleSize: "0.95rem",
    padding: "10px 8px",
  },
  lg: {
    titleSize: "1.1rem",
    padding: "14px 12px",
  },
};

export default function ComicCard({
  title,
  slug,
  coverImage,
  genres,
  rating,
  chapterCount,
  views = 0,
  likes = 0,
  size = "md",
  rank,
  rankChange,
  badge,
}: ComicCardProps) {
  const config = sizeConfig[size];

  return (
    <article
      style={{
        display: "flex",
        flexDirection: "column",
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
        background: "var(--color-bg-surface)",
        border: "1px solid var(--color-border)",
        textDecoration: "none",
        transition: "all var(--transition-fast)",
        cursor: "pointer",
        height: "100%",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--color-border-hover)";
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "var(--shadow-lg)";
        const overlay = e.currentTarget.querySelector(
          "[data-overlay]"
        ) as HTMLElement;
        if (overlay) overlay.style.opacity = "1";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--color-border)";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
        const overlay = e.currentTarget.querySelector(
          "[data-overlay]"
        ) as HTMLElement;
        if (overlay) overlay.style.opacity = "0";
      }}
    >
      {/* ── Cover Image ────────────────────────────────────────────── */}
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "3/4",
          overflow: "hidden",
          flexShrink: 0,
          background: "var(--color-bg-elevated)",
        }}
      >
        <Image
          src={coverImage}
          alt={`${title} cover`}
          fill
          sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20vw"
          style={{
            objectFit: "cover",
            transition: "transform var(--transition-slow)",
          }}
        />

        {/* Top Badges (Genre Pills - max 2) */}
        <div
          style={{
            position: "absolute",
            top: "6px",
            left: "6px",
            zIndex: 3,
            display: "flex",
            gap: "4px",
            flexWrap: "wrap",
            maxWidth: "calc(100% - 12px)",
          }}
        >
          {badge && (
            <span
              style={{
                display: "inline-block",
                padding: "2px 6px",
                fontSize: "9px",
                fontWeight: 700,
                borderRadius: "4px",
                background: "#00e676",
                color: "#000",
                textTransform: "uppercase",
                letterSpacing: "0.02em",
                boxShadow: "0 2px 4px rgba(0,0,0,0.5)",
              }}
            >
              {badge}
            </span>
          )}

          {genres && [...new Set(genres)].slice(0, badge ? 1 : 2).map((g) => (
            <span
              key={g}
              style={{
                display: "inline-block",
                padding: "2px 6px",
                fontSize: "9px",
                fontWeight: 700,
                borderRadius: "4px",
                background: "rgba(0, 0, 0, 0.75)",
                color: "#00e676",
                border: "1px solid rgba(0, 230, 118, 0.4)",
                textTransform: "uppercase",
                letterSpacing: "0.02em",
                backdropFilter: "blur(4px)",
                boxShadow: "0 2px 4px rgba(0,0,0,0.5)",
                whiteSpace: "nowrap",
              }}
            >
              {g}
            </span>
          ))}
        </div>

        {/* Bottom gradient */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "40%",
            background:
              "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        {/* Large Rank Number Overlay (1, 2, 3...) */}
        {rank !== undefined && (
          <div
            style={{
              position: "absolute",
              bottom: "2px",
              left: "6px",
              zIndex: 2,
              display: "flex",
              alignItems: "baseline",
              gap: "4px",
              lineHeight: 1,
            }}
          >
            <span
              style={{
                fontSize: "clamp(1.6rem, 5vw, 2.4rem)",
                fontWeight: 900,
                fontFamily: "var(--font-heading), system-ui, sans-serif",
                color: "#ffffff",
                textShadow: "0 2px 8px rgba(0, 0, 0, 0.9), 0 0 2px #000",
              }}
            >
              {rank}
            </span>
            {rankChange && (
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  color: rankChange.startsWith("▲") ? "#00e676" : "#ff5252",
                  textShadow: "0 1px 3px rgba(0,0,0,0.9)",
                }}
              >
                {rankChange}
              </span>
            )}
          </div>
        )}

        {/* Hover overlay */}
        <a
          href={`/comic/${slug}`}
          data-overlay
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0, 0, 0, 0.55)",
            opacity: 0,
            transition: "opacity var(--transition-base)",
            zIndex: 4,
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "6px 12px",
              background: "var(--color-primary)",
              color: "var(--color-text-inverse)",
              borderRadius: "var(--radius-full)",
              fontWeight: 700,
              fontSize: "12px",
            }}
          >
            Read
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </span>
        </a>
      </div>

      {/* ── Info ───────────────────────────────────────────────────── */}
      <div
        style={{
          padding: config.padding,
          display: "flex",
          flexDirection: "column",
          gap: "2px",
          flex: 1,
          justifyContent: "space-between",
        }}
      >
        <div>
          <h3
            style={{
              fontSize: config.titleSize,
              fontWeight: 700,
              color: "var(--color-text-primary)",
              lineHeight: 1.25,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </h3>
        </div>

        <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "5px 4px",
          flexWrap: "wrap",
          minWidth: 0,
          overflow: "hidden",
            marginTop: "6px",
            fontSize: "11px",
            color: "var(--color-text-tertiary)",
          }}
        >
          {/* Single Star + Overall Rating */}
          <div style={{ display: "flex", alignItems: "center", gap: "3px", color: "var(--color-primary)", fontWeight: 700, fontSize: "11px" }}>
            <StarIcon width="12" height="12" fill="currentColor" />
            <span style={{ color: "var(--color-text-primary)" }}>{Number(rating || 5).toFixed(1)}</span>
          </div>

          {/* Eye Icon + View Count */}
          <div style={{ display: "flex", alignItems: "center", gap: "3px", color: "var(--color-text-tertiary)", fontSize: "11px" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span>{formatViews(views || 0)}</span>
          </div>

          {/* Heart Icon + Like Count */}
          <div style={{ display: "flex", alignItems: "center", gap: "3px", color: "var(--color-text-tertiary)", fontSize: "11px" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" />
            </svg>
            <span>{formatViews(likes)}</span>
          </div>

          {/* Chapter Count Badge */}
          <span
            style={{
              whiteSpace: "nowrap",
              flexShrink: 0,
              fontWeight: 600,
              fontSize: "10px",
              color: "var(--color-text-secondary)",
              background: "var(--color-bg-elevated)",
              padding: "1px 5px",
              borderRadius: "4px",
              border: "1px solid var(--color-border)",
            }}
          >
            Ch. {chapterCount}
          </span>
        </div>
      </div>
    </article>
  );
}
