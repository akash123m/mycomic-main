"use client";

import React, { useState, useEffect, useRef } from "react";
import type { NavLink } from "@/types";
import ReadingCTAButton from "@/components/reader/ReadingCTAButton";
import { useQuery } from "@tanstack/react-query";
import { getComics, queryKeys } from "@/lib/api";

const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Browse", href: "/#browse" },
  { label: "Updates", href: "/#updates" },
  { label: "Genres", href: "/genres" },
];

export default function Navbar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const collapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { data: comics = [] } = useQuery({ queryKey: queryKeys.comics, queryFn: getComics, enabled: searchOpen });
  const searchResults = searchTerm.trim() ? comics.filter((comic) => `${comic.title} ${comic.author} ${comic.genres.join(" ")}`.toLowerCase().includes(searchTerm.trim().toLowerCase())).slice(0, 5) : [];
  const submitSearch = () => { if (searchResults[0]) window.location.href = `/comic/${searchResults[0].slug}`; };
  const cancelSearchCollapse = () => { if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current); collapseTimerRef.current = null; };
  const scheduleSearchCollapse = () => { cancelSearchCollapse(); collapseTimerRef.current = setTimeout(() => { if (document.activeElement !== searchInputRef.current) { setSearchOpen(false); setSearchTerm(""); } }, 2000); };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => () => cancelSearchCollapse(), []);

  // Lock body scroll when sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  return (
    <>
      {/* ── Main Navbar ─────────────────────────────────────────────── */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: "var(--z-sticky)" as unknown as number,
          transition: "all var(--transition-base)",
          background: scrolled
            ? "rgba(5, 5, 5, 0.85)"
            : "rgba(5, 5, 5, 0.4)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: scrolled
            ? "1px solid var(--color-border)"
            : "1px solid transparent",
        }}
      >
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            maxWidth: "var(--space-container-max)",
            marginInline: "auto",
            paddingInline: "var(--space-container-x)",
            height: "64px",
          }}
        >
          {/* ── Brand ──────────────────────────────────────────────── */}
          <a
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              textDecoration: "none",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(1.25rem, 2.5vw, 1.5rem)",
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              <span style={{ color: "var(--color-primary)" }}>My</span>
              <span style={{ color: "var(--color-text-primary)" }}>Comic</span>
            </span>
          </a>

          {/* ── Desktop Nav Links ──────────────────────────────────── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "32px",
            }}
            className="nav-desktop"
          >
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                style={{
                  fontSize: "var(--font-size-small)",
                  fontWeight: 500,
                  color: "var(--color-text-secondary)",
                  textDecoration: "none",
                  transition: "color var(--transition-fast)",
                  position: "relative",
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
            ))}
          </div>

          {/* ── Right Side (Desktop) ───────────────────────────────── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
            className="nav-desktop"
          >
            {/* Expandable comic search */}
            <div onMouseEnter={cancelSearchCollapse} onMouseLeave={scheduleSearchCollapse} style={{ position: "relative", width: searchOpen ? "260px" : "40px", height: "40px", borderRadius: "var(--radius-full)", border: searchOpen ? "1px solid var(--color-primary)" : "1px solid transparent", background: searchOpen ? "var(--color-bg-elevated)" : "transparent", transition: "width 360ms cubic-bezier(.22,1,.36,1), border-color 240ms ease, background-color 240ms ease" }}>
            <input ref={searchInputRef} value={searchTerm} onFocus={cancelSearchCollapse} onBlur={scheduleSearchCollapse} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") submitSearch(); if (e.key === "Escape") { setSearchOpen(false); setSearchTerm(""); } }} placeholder="Search comics…" aria-label="Search comics" tabIndex={searchOpen ? 0 : -1} style={{ position: "absolute", inset: 0, width: "100%", padding: "0 42px 0 15px", borderRadius: "var(--radius-full)", background: "transparent", border: "none", color: "var(--color-text-primary)", outline: "none", opacity: searchOpen ? 1 : 0, transform: searchOpen ? "translateX(0)" : "translateX(10px)", pointerEvents: searchOpen ? "auto" : "none", transition: "opacity 240ms ease, transform 360ms cubic-bezier(.22,1,.36,1)" }} />
            <button
              className="navbar-search-button"
              type="button"
              aria-label={searchOpen ? "Submit search" : "Open search"}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "40px", position: "absolute", right: 0,
                height: "40px",
                borderRadius: "var(--radius-full)",
                background: searchOpen ? "transparent" : "var(--color-bg-elevated)",
                border: searchOpen ? "none" : "1px solid var(--color-border)",
                transition: "all var(--transition-fast)",
              }}
              onClick={() => searchOpen ? submitSearch() : setSearchOpen(true)}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--color-primary)";
                e.currentTarget.style.background = "var(--color-bg-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = searchOpen ? "transparent" : "var(--color-border)";
                e.currentTarget.style.background = searchOpen ? "transparent" : "var(--color-bg-elevated)";
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
            {searchOpen && searchTerm && <div style={{ position: "absolute", top: "48px", left: 0, right: 0, padding: "6px", borderRadius: "12px", background: "var(--color-bg-elevated)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-lg)", overflow: "hidden" }}>{searchResults.length ? searchResults.map((comic) => <a key={comic.id} href={`/comic/${comic.slug}`} style={{ display: "block", padding: "9px 10px", borderRadius: "8px", color: "var(--color-text-primary)", textDecoration: "none", fontSize: "var(--font-size-small)" }}>{comic.title}<span style={{ display: "block", color: "var(--color-text-tertiary)", fontSize: "11px" }}>{comic.genres.join(" · ")}</span></a>) : <p style={{ padding: "9px 10px", color: "var(--color-text-tertiary)", fontSize: "12px" }}>No matching comics</p>}</div>}
            </div>

            {/* CTA */}
            <ReadingCTAButton location="navbar" />
          </div>

          {/* ── Hamburger (Mobile) ─────────────────────────────────── */}
          <button
            aria-label="Open menu"
            className="nav-mobile-only"
            onClick={() => setSidebarOpen(true)}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "5px",
              padding: "8px",
              background: "none",
              border: "none",
            }}
          >
            <span
              style={{
                display: "block",
                width: "22px",
                height: "2px",
                background: "var(--color-text-primary)",
                borderRadius: "2px",
                transition: "all var(--transition-fast)",
              }}
            />
            <span
              style={{
                display: "block",
                width: "16px",
                height: "2px",
                background: "var(--color-primary)",
                borderRadius: "2px",
                transition: "all var(--transition-fast)",
              }}
            />
            <span
              style={{
                display: "block",
                width: "22px",
                height: "2px",
                background: "var(--color-text-primary)",
                borderRadius: "2px",
                transition: "all var(--transition-fast)",
              }}
            />
          </button>
        </nav>
      </header>

      {/* ── Mobile Sidebar Overlay ──────────────────────────────────── */}
      {sidebarOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999,
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
            animation: "fadeIn 200ms ease forwards",
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Mobile Sidebar ─────────────────────────────────────────── */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: "280px",
          maxWidth: "80vw",
          zIndex: 1000,
          background: "var(--color-bg-surface)",
          borderRight: "1px solid var(--color-border)",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 350ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Close button */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "32px",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "1.25rem",
              fontWeight: 700,
            }}
          >
            <span style={{ color: "var(--color-primary)" }}>My</span>
            <span style={{ color: "var(--color-text-primary)" }}>Comic</span>
          </span>

          <button
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "36px",
              height: "36px",
              borderRadius: "var(--radius-md)",
              background: "var(--color-bg-elevated)",
              border: "1px solid var(--color-border)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Sidebar Links */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setSidebarOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 16px",
                fontSize: "var(--font-size-body)",
                fontWeight: 500,
                color: "var(--color-text-secondary)",
                textDecoration: "none",
                borderRadius: "var(--radius-md)",
                transition: "all var(--transition-fast)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--color-bg-hover)";
                e.currentTarget.style.color = "var(--color-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--color-text-secondary)";
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Sidebar CTA */}
        <div style={{ marginTop: "auto", paddingTop: "24px" }}>
          <div onClick={() => setSidebarOpen(false)}><ReadingCTAButton location="navbar" /></div>
        </div>
      </aside>

      {/* ── Responsive Styles ──────────────────────────────────────── */}
      <style jsx global>{`
        /* Desktop: show desktop elements, hide mobile */
        .nav-mobile-only {
          display: none !important;
        }

        @media (max-width: 768px) {
          .nav-desktop {
            display: none !important;
          }
          .nav-mobile-only {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
}
/* eslint-disable @next/next/no-html-link-for-pages */
