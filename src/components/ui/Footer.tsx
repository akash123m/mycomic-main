"use client";

import React from "react";
import NewsletterForm from "./NewsletterForm";
import { Heart } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: "Home", href: "/" },
    { label: "Browse", href: "/#browse" },
    { label: "Genres", href: "/genres" },
    { label: "About", href: "/about" },
  ];

  const legalLinks = [
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Content Reporting", href: "/report" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <footer
      style={{
        background: "var(--color-bg-surface)",
        borderTop: "1px solid var(--color-border)",
        marginTop: "auto",
      }}
    >
      {/* Gradient line at top */}
      <div className="gradient-divider" />

      <div
        className="container-main"
        style={{
          paddingBlock: "clamp(2rem, 5vw, 4rem)",
        }}
      >
        {/* ── Footer Grid ──────────────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "clamp(1.5rem, 4vw, 3rem)",
          }}
        >
          {/* Column 1: Brand */}
          <div style={{ maxWidth: "300px" }}>
            <span
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.35rem",
                fontWeight: 700,
                display: "block",
                marginBottom: "12px",
              }}
            >
              <span style={{ color: "var(--color-primary)" }}>My</span>
              <span style={{ color: "var(--color-text-primary)" }}>Comic</span>
            </span>
            <p
              style={{
                fontSize: "var(--font-size-small)",
                color: "var(--color-text-secondary)",
                lineHeight: 1.7,
              }}
            >
              Where stories come alive, one panel at a time. Discover original
              comics, follow your favorite series, and immerse yourself in
              worlds beyond imagination.
            </p>

            {/* Social icons */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "16px",
              }}
            >
              {["twitter", "instagram", "discord", "youtube"].map(
                (social) => (
                  <a
                    key={social}
                    href="#"
                    aria-label={social}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "36px",
                      height: "36px",
                      borderRadius: "var(--radius-md)",
                      background: "var(--color-bg-elevated)",
                      border: "1px solid var(--color-border)",
                      transition: "all var(--transition-fast)",
                      textDecoration: "none",
                      color: "var(--color-text-secondary)",
                      fontSize: "14px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor =
                        "var(--color-primary)";
                      e.currentTarget.style.color = "var(--color-primary)";
                      e.currentTarget.style.background =
                        "rgba(var(--color-primary-rgb), 0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor =
                        "var(--color-border)";
                      e.currentTarget.style.color =
                        "var(--color-text-secondary)";
                      e.currentTarget.style.background =
                        "var(--color-bg-elevated)";
                    }}
                  >
                    <SocialIcon name={social} />
                  </a>
                )
              )}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4
              style={{
                fontSize: "var(--font-size-small)",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "16px",
              }}
            >
              Quick Links
            </h4>
            <ul
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    style={{
                      fontSize: "var(--font-size-small)",
                      color: "var(--color-text-secondary)",
                      textDecoration: "none",
                      transition: "color var(--transition-fast)",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "var(--color-primary)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color =
                        "var(--color-text-secondary)")
                    }
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div>
            <h4
              style={{
                fontSize: "var(--font-size-small)",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "16px",
              }}
            >
              Legal
            </h4>
            <ul
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    style={{
                      fontSize: "var(--font-size-small)",
                      color: "var(--color-text-secondary)",
                      textDecoration: "none",
                      transition: "color var(--transition-fast)",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "var(--color-primary)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color =
                        "var(--color-text-secondary)")
                    }
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h4
              style={{
                fontSize: "var(--font-size-small)",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "16px",
              }}
            >
              Stay Updated
            </h4>
            <p
              style={{
                fontSize: "var(--font-size-caption)",
                color: "var(--color-text-secondary)",
                marginBottom: "12px",
                lineHeight: 1.6,
              }}
            >
              Get notified when new chapters drop.
            </p>
            <NewsletterForm source="footer" />
          </div>
        </div>

        {/* ── Bottom bar ───────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "8px",
            marginTop: "clamp(1.5rem, 4vw, 3rem)",
            paddingTop: "clamp(1rem, 2vw, 1.5rem)",
            borderTop: "1px solid var(--color-border)",
          }}
        >
          <p
            style={{
              fontSize: "var(--font-size-caption)",
              color: "var(--color-text-tertiary)",
            }}
          >
            © {currentYear} MyComic. All rights reserved.
          </p>
          <p
            style={{
              fontSize: "var(--font-size-caption)",
              color: "var(--color-text-tertiary)",
            }}
          >
            Made with{" "}
            <Heart size={14} strokeWidth={2} style={{ color: "var(--color-secondary)", display: "inline", verticalAlign: "-2px" }} aria-hidden /> for
            comic lovers
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ── Social Icons (inline SVGs) ────────────────────────────────────────── */
function SocialIcon({ name }: { name: string }) {
  switch (name) {
    case "twitter":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case "instagram":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      );
    case "discord":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
        </svg>
      );
    case "youtube":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    default:
      return null;
  }
}
