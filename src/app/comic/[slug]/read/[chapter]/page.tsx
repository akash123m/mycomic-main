"use client";

/* eslint-disable react-hooks/preserve-manual-memoization -- reader navigation intentionally captures immutable chapter-boundary values */

import React, { useState, useEffect, useCallback, use } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getComics, getSession, queryKeys, requestJson } from "@/lib/api";
import LoadingState from "@/components/ui/LoadingState";
import { ArrowLeft, ChevronLeft, ChevronRight, Menu } from "lucide-react";

type ReadingMode = "scroll" | "page";

type PageProps = {
  params: Promise<{ slug: string; chapter: string }>;
};

export default function ComicReaderPage({ params }: PageProps) {
  const { slug, chapter: chapterParam } = use(params);
  const chapterNum = parseInt(chapterParam, 10);
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: comics = [], isLoading: loading } = useQuery({ queryKey: queryKeys.comics, queryFn: getComics });
  const { data: session } = useQuery({ queryKey: queryKeys.session, queryFn: getSession });
  const comic = comics.find((item) => item.slug === slug);
  const chapter = comic?.chapters?.find((item) => item.number === chapterNum);
  const [mode, setMode] = useState<ReadingMode>(() => searchParams.get("mode") === "page" ? "page" : "scroll");
  const [currentPage, setCurrentPage] = useState(() => Math.max(0, Number(searchParams.get("page")) || 0));
  const [progress, setProgress] = useState(0);
  const [viewState, setViewState] = useState<{ id: string; views: number } | null>(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [imageWidth, setImageWidth] = useState<"standard" | "wide">("standard");
  const [autoScrolling, setAutoScrolling] = useState(false);

  const pageUrls: string[] = chapter?.pages?.map((page) => page.imageUrl) || [];
  const totalPages = pageUrls.length;
  const chapterIndex = comic?.chapters?.findIndex((item) => item.id === chapter?.id) ?? -1;
  const previousChapter = chapterIndex > 0 ? comic?.chapters?.[chapterIndex - 1] : undefined;
  const nextChapter = chapterIndex >= 0 ? comic?.chapters?.[chapterIndex + 1] : undefined;
  const previousChapterNumber = previousChapter?.number;
  const previousChapterLastPage = previousChapter ? Math.max(0, previousChapter.pages.length - 1) : 0;
  const nextChapterNumber = nextChapter?.number;
  const chapterViews = viewState && viewState.id === chapter?.id ? viewState.views : (chapter?.views || 0);
  const displayedProgress = mode === "page" && totalPages > 0 ? ((currentPage + 1) / totalPages) * 100 : progress;

  useEffect(() => {
    if (!chapter) return;
    const key = `mycomic:chapter-view:${chapter.id}`;
    const today = new Date().toISOString().slice(0, 10);
    if (window.localStorage.getItem(key) === today) return;
    window.localStorage.setItem(key, today);
    fetch(`/api/chapters/${chapter.id}/view`, { method: "POST" })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { if (typeof data?.views === "number") setViewState({ id: chapter.id, views: data.views }); })
      .catch(() => undefined);
  }, [chapter]);
  const saveProgress = useMutation({
    mutationFn: (payload: object) => requestJson("/api/reader/history", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }),
    onSuccess: () => {
      if (comic) queryClient.invalidateQueries({ queryKey: queryKeys.resume(comic.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.history });
    },
  });

  useEffect(() => {
    if (session?.role !== "READER" || !comic || !chapter) return;
    const timer = window.setTimeout(() => saveProgress.mutate({ comicId: comic.id, chapterId: chapter.id, pageIndex: mode === "page" ? currentPage : Math.max(0, Math.round((displayedProgress / 100) * Math.max(0, totalPages - 1))), scrollPosition: displayedProgress, completed: currentPage === totalPages - 1 && totalPages > 0 }), 1500);
    return () => window.clearTimeout(timer);
  }, [session?.role, comic, chapter, currentPage, displayedProgress, mode, totalPages, saveProgress]);

  useEffect(() => {
    if (mode !== "scroll") return;
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) setProgress(Math.min(100, (scrollTop / docHeight) * 100));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [mode]);

  useEffect(() => {
    if (!autoScrolling || mode !== "scroll") return;
    let frame = 0;
    const step = () => {
      const atEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
      if (atEnd) { setAutoScrolling(false); return; }
      window.scrollBy({ top: 1.35, behavior: "auto" });
      frame = window.requestAnimationFrame(step);
    };
    frame = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(frame);
  }, [autoScrolling, mode]);

  const goNext = useCallback(() => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((p) => p + 1);
      window.scrollTo(0, 0);
    } else if (nextChapterNumber !== undefined) {
      setCurrentPage(0);
      router.push(`/comic/${slug}/read/${nextChapterNumber}?mode=page&page=0`);
    }
  }, [currentPage, totalPages, nextChapterNumber, router, slug]);

  const goPrev = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage((p) => p - 1);
      window.scrollTo(0, 0);
    } else if (previousChapterNumber !== undefined) {
      setCurrentPage(previousChapterLastPage);
      router.push(`/comic/${slug}/read/${previousChapterNumber}?mode=page&page=${previousChapterLastPage}`);
    }
  }, [currentPage, previousChapterLastPage, previousChapterNumber, router, slug]);

  // Keyboard navigation
  useEffect(() => {
    if (mode !== "page") return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        goNext();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [mode, goNext, goPrev]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", color: "var(--color-primary)" }}>
        <LoadingState label="Preparing chapter panels" variant="page" />
      </div>
    );
  }

  if (!comic || !chapter) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", flexDirection: "column", gap: "16px" }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "var(--font-size-h1)" }}>Chapter Not Found</h1>
        <a href={`/comic/${slug}`} style={{ color: "var(--color-primary)", fontWeight: 600, display:"inline-flex", alignItems:"center", gap:7 }}><ArrowLeft size={16}/> Back to comic</a>
      </div>
    );
  }

  return (
    <div onClick={(event) => { if (mode !== "scroll") return; const target = event.target as HTMLElement; if (target.closest("button,a,select,input")) return; setAutoScrolling((value) => !value); }} style={{ background: "var(--color-bg-base)", minHeight: "100vh", cursor: mode === "scroll" ? (autoScrolling ? "pause" : "s-resize") : "default" }}>
      {/* ── Progress Bar ──────────────────────────────────────────── */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: "3px", zIndex: 1000, display: controlsVisible ? "block" : "none", background: "var(--color-bg-elevated)" }}>
        <div style={{ height: "100%", width: `${displayedProgress}%`, background: "linear-gradient(90deg, var(--color-primary), var(--color-tertiary))", transition: "width 200ms ease" }} />
      </div>

      {/* ── Top Bar ───────────────────────────────────────────────── */}
      <div className="glass-heavy" style={{ position: "fixed", top: "3px", left: 0, right: 0, zIndex: 999, display: controlsVisible ? "flex" : "none", alignItems: "center", justifyContent: "space-between", padding: "0 var(--space-container-x)", height: "56px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
          <a href={`/comic/${slug}`} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", borderRadius: "var(--radius-md)", background: "var(--color-bg-elevated)", border: "1px solid var(--color-border)", textDecoration: "none" }}>
            <ArrowLeft size={17} aria-hidden />
          </a>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: "var(--font-size-small)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Ch. {chapter.number}: {chapter.title}</p>
            <p style={{ fontSize: "var(--font-size-caption)", color: "var(--color-text-tertiary)" }}>{comic.title} · {chapterViews.toLocaleString()} views</p>
          </div>
        </div>

        <div className="reader-mode-controls" style={{ display: "flex", borderRadius: "var(--radius-full)", overflow: "hidden", border: "1px solid var(--color-border)", flexShrink: 0 }}>
          <button onClick={() => setMode("scroll")} style={{ padding: "6px 14px", fontSize: "var(--font-size-caption)", fontWeight: 600, background: mode === "scroll" ? "var(--color-primary)" : "var(--color-bg-elevated)", color: mode === "scroll" ? "var(--color-text-inverse)" : "var(--color-text-secondary)" }}>Scroll</button>
          <button onClick={() => setMode("page")} style={{ padding: "6px 14px", fontSize: "var(--font-size-caption)", fontWeight: 600, background: mode === "page" ? "var(--color-primary)" : "var(--color-bg-elevated)", color: mode === "page" ? "var(--color-text-inverse)" : "var(--color-text-secondary)" }}>Page</button>
        </div>

        <div className="reader-extra-controls" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <select aria-label="Jump to chapter" value={chapter.number} onChange={(event) => { setCurrentPage(0); router.push(`/comic/${slug}/read/${event.target.value}${mode === "page" ? "?mode=page&page=0" : ""}`); }} style={{ padding: "6px 10px", border: "1px solid var(--color-border)", borderRadius: "8px", background: "var(--color-bg-elevated)", fontSize: "12px" }}>
            {comic.chapters.map((item) => <option key={item.id} value={item.number}>Ch. {item.number}</option>)}
          </select>
          <button onClick={() => setImageWidth((value) => value === "standard" ? "wide" : "standard")} aria-label="Toggle image width" style={{ padding: "6px 10px", border: "1px solid var(--color-border)", borderRadius: "8px", fontSize: "12px" }}>{imageWidth === "standard" ? "Fit width" : "Standard"}</button>
          <button onClick={() => setControlsVisible(false)} aria-label="Hide reader controls" style={{ padding: "6px 10px", border: "1px solid var(--color-border)", borderRadius: "8px", fontSize: "12px" }}>Hide</button>
        </div>
      </div>

      {!controlsVisible && <button onClick={() => setControlsVisible(true)} aria-label="Show reader controls" title="Reader menu" style={{ position: "fixed", top: 16, right: 16, zIndex: 999, width: 42, height: 42, display: "grid", placeItems: "center", padding: 0, borderRadius: "12px", background: "rgba(14,14,14,.92)", border: "1px solid var(--color-border)", boxShadow: "0 6px 24px rgba(0,0,0,.45)" }}><Menu size={19}/></button>}
      {autoScrolling && <div aria-live="polite" style={{ position: "fixed", left: 14, bottom: controlsVisible ? 72 : 14, zIndex: 998, padding: "7px 10px", borderRadius: 8, background: "rgba(14,14,14,.88)", border: "1px solid var(--color-border)", color: "var(--color-primary)", fontSize: 11, pointerEvents: "none" }}>Auto-scroll · click to pause</div>}

      {/* ── Main Reader Canvas ────────────────────────────────────── */}
      <div style={{ maxWidth: imageWidth === "wide" ? "1100px" : "800px", marginInline: "auto", paddingTop: controlsVisible ? "64px" : "3px", paddingBottom: "90px", transition: "max-width 200ms ease" }}>
        {mode === "scroll" ? (
          <div title="Click the page or black space to start or pause auto-scroll" style={{ display: "flex", flexDirection: "column" }}>
            {pageUrls.map((url, i) => (
              <div key={i} style={{ position: "relative", width: "100%", aspectRatio: "2/3" }}>
                <Image src={url} alt={`Page ${i + 1}`} fill sizes="800px" style={{ objectFit: "contain" }} priority={i < 2} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", paddingInline: "12px" }}>
            {/* Comic Image with Tap-to-Turn */}
            <div
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                if (clickX > rect.width / 2) {
                  goNext();
                } else {
                  goPrev();
                }
              }}
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "600px",
                aspectRatio: "2/3",
                cursor: "pointer",
              }}
            >
              <Image
                src={pageUrls[currentPage]}
                alt={`Page ${currentPage + 1}`}
                fill
                sizes="600px"
                style={{ objectFit: "contain" }}
                priority
              />
            </div>

            {/* Desktop-only Floating Side Arrows (outside image margins) */}
            <div className="desktop-arrows-only">
              <button
                onClick={goPrev}
                disabled={currentPage === 0 && !previousChapter}
                style={{
                  position: "fixed",
                  left: "clamp(12px, 4vw, 40px)",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: "var(--color-bg-elevated)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text-primary)",
                  opacity: currentPage === 0 && !previousChapter ? 0.3 : 1,
                  cursor: currentPage === 0 && !previousChapter ? "default" : "pointer",
                }}
              >
                <ChevronLeft size={22} aria-hidden />
              </button>
              <button
                onClick={goNext}
                disabled={currentPage === totalPages - 1 && !nextChapter}
                style={{
                  position: "fixed",
                  right: "clamp(12px, 4vw, 40px)",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: "var(--color-bg-elevated)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text-primary)",
                  opacity: currentPage === totalPages - 1 && !nextChapter ? 0.3 : 1,
                  cursor: currentPage === totalPages - 1 && !nextChapter ? "default" : "pointer",
                }}
              >
                <ChevronRight size={22} aria-hidden />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Fixed Bottom Control Bar (Mobile & Desktop) ─────────────── */}
      <div
        className="glass-heavy"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 999,
          display: controlsVisible ? "flex" : "none",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 var(--space-container-x)",
          height: "60px",
          borderTop: "1px solid var(--color-border)",
        }}
      >
        {/* Prev Button */}
        {mode === "page" ? (
          <button
            onClick={goPrev}
            disabled={currentPage === 0 && !previousChapter}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              borderRadius: "var(--radius-full)",
              background: currentPage === 0 && !previousChapter ? "transparent" : "var(--color-bg-elevated)",
              border: `1px solid ${currentPage === 0 && !previousChapter ? "transparent" : "var(--color-border)"}`,
              color: currentPage === 0 && !previousChapter ? "var(--color-text-tertiary)" : "var(--color-text-primary)",
              fontSize: "var(--font-size-small)",
              fontWeight: 600,
              cursor: currentPage === 0 && !previousChapter ? "default" : "pointer",
            }}
          >
            {currentPage === 0 && previousChapter ? "← Previous chapter" : "← Prev Page"}
          </button>
        ) : (
          <a
            href={previousChapter ? `/comic/${slug}/read/${previousChapter.number}` : "#"}
            style={{
              fontSize: "var(--font-size-small)",
              fontWeight: 600,
              color: previousChapter ? "var(--color-text-secondary)" : "var(--color-text-tertiary)",
              textDecoration: "none",
              pointerEvents: previousChapter ? "auto" : "none",
            }}
          >
            ← Prev Ch.
          </a>
        )}

        {/* Page / Chapter Counter */}
        <span style={{ fontSize: "var(--font-size-small)", fontWeight: 700, color: "var(--color-primary)" }}>
          {mode === "page" ? `Page ${currentPage + 1} of ${totalPages}` : `Ch. ${chapterNum}`}
        </span>

        {/* Next Button */}
        {mode === "page" ? (
          <button
            onClick={goNext}
            disabled={currentPage === totalPages - 1 && !nextChapter}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              borderRadius: "var(--radius-full)",
              background: currentPage === totalPages - 1 && !nextChapter ? "transparent" : "var(--color-primary)",
              color: currentPage === totalPages - 1 && !nextChapter ? "var(--color-text-tertiary)" : "var(--color-text-inverse)",
              fontSize: "var(--font-size-small)",
              fontWeight: 600,
              cursor: currentPage === totalPages - 1 && !nextChapter ? "default" : "pointer",
              border: "none",
            }}
          >
            {currentPage === totalPages - 1 && nextChapter ? "Next chapter →" : "Next Page →"}
          </button>
        ) : (
          <a
            href={nextChapter ? `/comic/${slug}/read/${nextChapter.number}` : `/comic/${slug}`}
            style={{
              fontSize: "var(--font-size-small)",
              fontWeight: 600,
              color: "var(--color-primary)",
              textDecoration: "none",
            }}
          >
            {nextChapter ? "Next Ch. →" : "Series page →"}
          </a>
        )}
      </div>

      <style jsx global>{`
        @media (max-width: 1024px) {
          .desktop-arrows-only {
            display: none !important;
          }
          .reader-extra-controls { position: fixed; left: 12px; right: 12px; bottom: 72px; justify-content: center; padding: 8px; border: 1px solid var(--color-border); border-radius: 12px; background: rgba(14,14,14,.94); }
        }
      `}</style>
    </div>
  );
}
