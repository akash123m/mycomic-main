import React from "react";
import type { Genre } from "@/types";

interface GenreBadgeProps {
  genre: Genre;
  size?: "sm" | "md";
  clickable?: boolean;
}

const genreColorMap: Record<Genre, { bg: string; text: string }> = {
  Fantasy: {
    bg: "rgba(var(--color-secondary-rgb), 0.18)",
    text: "var(--color-secondary)",
  },
  Action: {
    bg: "rgba(var(--color-primary-rgb), 0.18)",
    text: "var(--color-primary)",
  },
  Romance: {
    bg: "rgba(218, 0, 157, 0.18)",
    text: "#ff47b2",
  },
  Horror: {
    bg: "rgba(239, 68, 68, 0.18)",
    text: "#ef4444",
  },
  "Sci-Fi": {
    bg: "rgba(var(--color-tertiary-rgb), 0.18)",
    text: "var(--color-tertiary)",
  },
  Comedy: {
    bg: "rgba(234, 179, 8, 0.18)",
    text: "#eab308",
  },
  Drama: {
    bg: "rgba(168, 85, 247, 0.18)",
    text: "#a855f7",
  },
  Thriller: {
    bg: "rgba(239, 68, 68, 0.15)",
    text: "#f87171",
  },
  Mystery: {
    bg: "rgba(99, 102, 241, 0.18)",
    text: "#818cf8",
  },
  "Slice of Life": {
    bg: "rgba(34, 197, 94, 0.18)",
    text: "#22c55e",
  },
};

export default function GenreBadge({
  genre,
  size = "sm",
  clickable = false,
}: GenreBadgeProps) {
  const colors = genreColorMap[genre] || {
    bg: "rgba(var(--color-primary-rgb), 0.15)",
    text: "var(--color-primary)",
  };

  const Tag = clickable ? "a" : "span";
  const extraProps = clickable
    ? { href: `/genres?filter=${genre.toLowerCase().replace(/\s+/g, "-")}` }
    : {};

  return (
    <Tag
      {...extraProps}
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: size === "sm" ? "3px 10px" : "5px 14px",
        fontSize:
          size === "sm" ? "var(--font-size-caption)" : "var(--font-size-small)",
        fontWeight: 600,
        letterSpacing: "0.03em",
        borderRadius: "var(--radius-full)",
        background: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.text}33`,
        transition: "all var(--transition-fast)",
        cursor: clickable ? "pointer" : "default",
        textDecoration: "none",
        whiteSpace: "nowrap",
      }}
    >
      {genre}
    </Tag>
  );
}
