import React from "react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  viewAllText?: string;
  accentColor?: "primary" | "secondary" | "tertiary";
}

export default function SectionHeader({
  title,
  subtitle,
  viewAllHref,
  viewAllText = "View All",
  accentColor = "primary",
}: SectionHeaderProps) {
  const accentVar = `var(--color-${accentColor})`;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: "16px",
        marginBottom: "clamp(1.25rem, 3vw, 2rem)",
        flexWrap: "wrap",
      }}
    >
      <div>
        <h2
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "var(--font-size-h2)",
            fontWeight: 700,
            color: "var(--color-text-primary)",
            lineHeight: 1.2,
          }}
        >
          {title}
        </h2>

        {/* Accent underline bar */}
        <div
          style={{
            width: "48px",
            height: "3px",
            marginTop: "8px",
            borderRadius: "var(--radius-full)",
            background: `linear-gradient(90deg, ${accentVar}, transparent)`,
          }}
        />

        {subtitle && (
          <p
            style={{
              marginTop: "8px",
              fontSize: "var(--font-size-small)",
              color: "var(--color-text-secondary)",
              maxWidth: "600px",
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {viewAllHref && (
        <a
          href={viewAllHref}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "var(--font-size-small)",
            fontWeight: 600,
            color: accentVar,
            textDecoration: "none",
            transition: "all var(--transition-fast)",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {viewAllText}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </a>
      )}
    </div>
  );
}
