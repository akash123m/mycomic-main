"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import SectionHeader from "@/components/ui/SectionHeader";
import ComicCard from "@/components/ui/ComicCard";
import GenreIcon from "@/components/ui/GenreIcon";
import { getComics, getGenres, queryKeys } from "@/lib/api";
import LoadingState from "@/components/ui/LoadingState";

export default function GenresPage() {
  const searchParams = useSearchParams();
  const { data: comics = [], isLoading: loading } = useQuery({
    queryKey: queryKeys.comics,
    queryFn: getComics,
  });
  const { data: genresList = [] } = useQuery({
    queryKey: queryKeys.genres,
    queryFn: getGenres,
  });
  const [selectedGenres, setSelectedGenres] = useState<string[]>(() => searchParams.get("filter") ? [searchParams.get("filter") as string] : []);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("popular");

  const toggleGenre = (genreName: string) => {
    if (genreName === "All") {
      setSelectedGenres([]);
      return;
    }

    setSelectedGenres((prev) =>
      prev.includes(genreName)
        ? prev.filter((g) => g !== genreName)
        : [...prev, genreName]
    );
  };

  // Filter comics by selected genres
  const filteredComics = comics.filter((comic) => {
    const genreMatch = selectedGenres.length === 0 || comic.genres.some((g: string) => selectedGenres.includes(g));
    const statusMatch = status === "all" || comic.status === status;
    const term = search.trim().toLowerCase();
    return genreMatch && statusMatch && (!term || `${comic.title} ${comic.author} ${comic.genres.join(" ")}`.toLowerCase().includes(term));
  });

  // Sort by most views to less views
  const sortedComics = [...filteredComics].sort((a, b) => sort === "rating" ? b.rating - a.rating : sort === "updated" ? new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime() : sort === "az" ? a.title.localeCompare(b.title) : (b.views || 0) - (a.views || 0));

  return (
    <div className="section">
      <div className="section-inner">
        <SectionHeader
          title="Browse by Genre"
          subtitle="Select one or more genres to filter comics (sorted by popularity)"
        />
        <div className="catalog-toolbar"><input aria-label="Search series" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title, author, or genre…" /><select aria-label="Filter by status" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All statuses</option><option value="ongoing">Ongoing</option><option value="completed">Completed</option><option value="hiatus">Hiatus</option></select><select aria-label="Sort series" value={sort} onChange={(event) => setSort(event.target.value)}><option value="popular">Most popular</option><option value="updated">Latest update</option><option value="rating">Top rated</option><option value="az">A–Z</option></select></div>

        {/* ── Multi-select Scrollable Genre Filter Bar ──────────────── */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            overflowX: "auto",
            paddingBottom: "12px",
            marginBottom: "24px",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
          }}
        >
          {/* "All" Filter Pill */}
          <button
            className="filter-button"
            onClick={() => toggleGenre("All")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 18px",
              borderRadius: "var(--radius-full)",
              fontSize: "13px",
              fontWeight: 700,
              whiteSpace: "nowrap",
              cursor: "pointer",
              transition: "all 150ms ease",
              background:
                selectedGenres.length === 0
                  ? "var(--color-primary)"
                  : "var(--color-bg-elevated)",
              color:
                selectedGenres.length === 0
                  ? "var(--color-text-inverse)"
                  : "var(--color-text-secondary)",
              border:
                selectedGenres.length === 0
                  ? "1px solid var(--color-primary)"
                  : "1px solid var(--color-border)",
            }}
          >
            <GenreIcon name="all" size={16} />
            <span>All Comics ({comics.length})</span>
          </button>

          {/* Genre Pills */}
          {genresList.map((g) => {
            const isSelected = selectedGenres.includes(g.name);
            const count = comics.filter((c) =>
              c.genres.includes(g.name)
            ).length;

            return (
              <button
                className="filter-button"
                key={g.name}
                onClick={() => toggleGenre(g.name)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 16px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "13px",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  transition: "all 150ms ease",
                  background: isSelected
                    ? "var(--color-primary)"
                    : "var(--color-bg-elevated)",
                  color: isSelected
                    ? "var(--color-text-inverse)"
                    : "var(--color-text-primary)",
                  border: isSelected
                    ? "1px solid var(--color-primary)"
                    : "1px solid var(--color-border)",
                }}
              >
                <GenreIcon name={g.name} size={15} />
                <span>{g.name}</span>
                <span
                  style={{
                    fontSize: "11px",
                    opacity: 0.8,
                    background: isSelected
                      ? "rgba(0,0,0,0.15)"
                      : "rgba(255,255,255,0.08)",
                    padding: "2px 6px",
                    borderRadius: "10px",
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Filters active indicator */}
        {selectedGenres.length > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
              fontSize: "13px",
              color: "var(--color-text-secondary)",
            }}
          >
            <span>
              Filtering by:{" "}
              <strong style={{ color: "var(--color-primary)" }}>
                {selectedGenres.join(", ")}
              </strong>{" "}
              ({sortedComics.length} found)
            </span>
            <button
              className="filter-button"
              onClick={() => setSelectedGenres([])}
              style={{
                color: "var(--color-secondary)",
                fontWeight: 600,
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              <span>Clear filters</span>
            </button>
          </div>
        )}

        {/* ── Filtered & Sorted Comics Grid ─────────────────────────── */}
        {loading ? (
          <LoadingState label="Loading comics" variant="section" />
        ) : sortedComics.length === 0 ? (
          <div
            style={{
              padding: "40px 20px",
              textAlign: "center",
              background: "var(--color-bg-surface)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--color-border)",
            }}
          >
            <p style={{ color: "var(--color-text-secondary)" }}>
              {comics.length === 0 ? "No series are published yet. Check back after the first chapter goes live." : "No series match these filters."}
            </p>
            <button
              className="filter-button"
              onClick={() => setSelectedGenres([])}
              style={{
                marginTop: "12px",
                padding: "8px 16px",
                background: "var(--color-primary)",
                color: "var(--color-text-inverse)",
                borderRadius: "var(--radius-full)",
                fontWeight: 600,
              }}
            >
              <span>{comics.length === 0 ? "Return Home" : "Clear all filters"}</span>
            </button>
          </div>
        ) : (
          <div className="comic-card-grid">
            {sortedComics.map((comic, idx) => (
              <ComicCard
                key={comic.id}
                title={comic.title}
                slug={comic.slug}
                coverImage={comic.coverImage}
                genres={comic.genres}
                rating={comic.rating}
                chapterCount={comic.chapters?.length || 0}
                views={comic.views || 0}
                likes={comic.likes || 0}
                size="sm"
                rank={idx + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
