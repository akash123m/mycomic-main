"use client";

import React, { useEffect, useState, use } from "react";
import Image from "next/image";
import GenreBadge from "@/components/ui/GenreBadge";
import StarRating from "@/components/ui/StarRating";
import ChapterListItem from "@/components/ui/ChapterListItem";
import ShareButtons from "@/components/ui/ShareButtons";
import Button from "@/components/ui/Button";
import ReadingCTAButton from "@/components/reader/ReadingCTAButton";
import LoadingState from "@/components/ui/LoadingState";
import { Heart } from "lucide-react";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default function ComicDetailPage({ params }: PageProps) {
  const { slug } = use(params);
  const [comic, setComic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [ratingMessage, setRatingMessage] = useState("");

  // Comments state
  const [comments, setComments] = useState<any[]>([]);
  const [commentName, setCommentName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetch("/api/comics")
      .then(async (res) => res.ok ? res.json() : fetch("/api/fallback-catalog").then((fallback) => fallback.json()))
      .then((data) => {
        if (Array.isArray(data)) {
          const found = data.find((c: any) => c.slug === slug);
          if (found) {
            const normalizedGenres = Array.from(new Set(
              (found.genres || [])
                .map((genre: any) => typeof genre === "string" ? genre : genre?.genre?.name || genre?.name)
                .filter((genre: unknown): genre is string => typeof genre === "string" && genre.trim().length > 0)
            ));
            setComic({
              ...found,
              genres: normalizedGenres,
            });
            setLikes(found.likes || 0);

            // Trigger genuine view increment
            fetch(`/api/comics/${found.id}/view`, { method: "POST" }).then((response) => response.ok ? response.json() : null).then((result) => { if (typeof result?.views === "number") setComic((current: any) => current ? { ...current, views: result.views } : current); });

            // Fetch genuine comments
            fetch(`/api/comics/${found.id}/comments`)
              .then((r) => r.json())
              .then((cmtData) => {
                if (Array.isArray(cmtData)) setComments(cmtData);
              });
          }
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleLike = async () => {
    if (!comic || liked) return;
    setLiked(true);
    setLikes((l) => l + 1);

    try {
      const res = await fetch(`/api/comics/${comic.id}/like`, { method: "POST" });
      const data = await res.json();
      if (data.likes) setLikes(data.likes);
    } catch {
      // rollback on error
      setLiked(false);
      setLikes((l) => Math.max(0, l - 1));
    }
  };

  const handleRate = async (stars: number) => {
    if (!comic) return;
    setUserRating(stars);
    setRatingMessage("Submitting rating...");

    try {
      const res = await fetch(`/api/comics/${comic.id}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: stars }),
      });
      const data = await res.json();
      if (data.success) {
        setComic((prev: any) => ({
          ...prev,
          rating: data.rating,
          ratingCount: data.ratingCount,
        }));
        setRatingMessage(`Thank you! Rating saved.`);
      }
    } catch {
      setRatingMessage("Failed to submit rating");
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comic || !commentText.trim() || submittingComment) return;

    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/comics/${comic.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: commentName || "ComicFan",
          content: commentText,
        }),
      });
      const data = await res.json();
      if (data.success && data.comment) {
        setComments((prev) => [data.comment, ...prev]);
        setCommentText("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-primary)" }}>
        <LoadingState label="Loading comic details" variant="page" />
      </div>
    );
  }

  if (!comic) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "var(--font-size-h1)" }}>Comic Not Found</h1>
        <a href="/" style={{ color: "var(--color-primary)", fontWeight: 600 }}>← Return to Homepage</a>
      </div>
    );
  }

  return (
    <>
      <section
        className="comic-detail-hero"
        style={{
          position: "relative",
          minHeight: "340px",
          display: "flex",
          alignItems: "flex-end",
          overflow: "hidden",
        }}
      >
        <Image
          src={comic.bannerImage || comic.coverImage}
          alt=""
          fill
          sizes="100vw"
          style={{
            objectFit: "cover",
            filter: "blur(20px) brightness(0.3)",
            transform: "scale(1.1)",
            zIndex: 0,
          }}
          aria-hidden="true"
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, var(--color-bg-base) 0%, transparent 100%)",
            zIndex: 1,
          }}
        />

        <div
          className="container-main comic-hero-inner"
          style={{
            position: "relative",
            zIndex: 2,
            display: "grid",
            gridTemplateColumns: "190px minmax(0, 1fr)",
            gap: "clamp(1rem, 3vw, 2rem)",
            paddingTop: "7px",
            paddingBottom: "clamp(1.5rem, 4vw, 3rem)",
            alignItems: "end",
          }}
        >
          <div
            className="comic-detail-cover"
            style={{
              position: "relative",
              width: "190px",
              aspectRatio: "2/3",
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
              boxShadow: "var(--shadow-lg)",
              border: "2px solid var(--color-border)",
              flexShrink: 0,
            }}
          >
            <Image
              src={comic.coverImage}
              alt={`${comic.title} cover`}
              fill
              sizes="260px"
              style={{ objectFit: "cover" }}
              priority
            />
          </div>

          <div className="comic-hero-copy" style={{ display: "flex", flexDirection: "column", gap: "clamp(8px, 2vw, 14px)" }}>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {(comic.genres as string[]).map((g: string, index: number) => (
                <GenreBadge key={`${g}-${index}`} genre={g as any} clickable />
              ))}
            </div>

            <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "var(--font-size-hero)", fontWeight: 700, lineHeight: 1.1 }}>
              {comic.title}
            </h1>

            <p style={{ fontSize: "var(--font-size-small)", color: "var(--color-text-secondary)" }}>
              By <span style={{ color: "var(--color-primary)", fontWeight: 600 }}>{comic.author}</span> ·{" "}
              <span style={{ textTransform: "capitalize", color: "var(--color-primary)" }}>{comic.status}</span>
            </p>
            {comic.submittedBy && (
              <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-small)" }}>
                Story by <strong style={{ color: "var(--color-primary)" }}>{comic.submittedBy.name}</strong>
              </p>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: "clamp(12px, 3vw, 24px)", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <StarRating
                  rating={comic.rating || 5}
                  size={18}
                  interactive
                  onRate={handleRate}
                />
                <span style={{ fontSize: "var(--font-size-caption)", color: "var(--color-text-tertiary)" }}>
                  ({comic.ratingCount || 1} {comic.ratingCount === 1 ? "rating" : "ratings"})
                </span>
              </div>

              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--font-size-small)", color: "var(--color-text-secondary)" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                {comic.views || 0} Views
              </span>

              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--font-size-small)", color: "var(--color-text-secondary)" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
                {comic.chapters?.length || 0} Chapters
              </span>
            </div>

            {ratingMessage && (
              <p style={{ fontSize: "var(--font-size-caption)", color: "var(--color-primary)", fontWeight: 600 }}>
                {ratingMessage}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="section comic-detail-body" style={{ paddingTop: "clamp(1.5rem, 4vw, 2.5rem)" }}>
        <div className="section-inner comic-detail-content" style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "var(--font-size-h3)", fontWeight: 700, marginBottom: "12px" }}>
              Synopsis
            </h2>
            <p style={{ fontSize: "var(--font-size-body)", color: "var(--color-text-secondary)", lineHeight: 1.8 }}>
              {comic.synopsis}
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
            {comic.chapters?.length > 0 && (
              <ReadingCTAButton location="detail" comicId={comic.id} slug={comic.slug} firstChapter={comic.chapters[0].number} size="lg" />
            )}
            <button
              onClick={handleLike}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 20px",
                borderRadius: "var(--radius-full)",
                background: liked ? "var(--color-secondary)" : "var(--color-bg-elevated)",
                border: "1px solid var(--color-border)",
                color: liked ? "#fff" : "var(--color-text-primary)",
                fontWeight: 600,
                fontSize: "var(--font-size-small)",
                cursor: "pointer",
                transition: "all 200ms ease",
              }}
            >
              <Heart size={16} fill={liked ? "currentColor" : "none"} aria-hidden /> {liked ? "Liked" : "Like"} ({likes})
            </button>
          </div>

          <ShareButtons title={`Read "${comic.title}" on MyComic!`} url={`/comic/${comic.slug}`} />

          {/* ── Chapters List ───────────────────────────────────── */}
          <div>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "var(--font-size-h3)", fontWeight: 700, marginBottom: "16px" }}>
              Chapters
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {comic.chapters?.map((ch: any, i: number) => (
                <ChapterListItem
                  key={ch.id}
                  number={ch.number}
                  title={ch.title}
                  publishedAt={ch.createdAt}
                  views={ch.views || 0}
                  comicSlug={comic.slug}
                  isNew={i === comic.chapters.length - 1}
                />
              ))}
            </div>
          </div>

          {/* ── Live Comments Section ───────────────────────────── */}
          <div style={{ paddingTop: "20px", borderTop: "1px solid var(--color-border)" }}>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "var(--font-size-h3)", fontWeight: 700, marginBottom: "16px" }}>
              Discussion ({comments.length})
            </h2>

            {/* Comment Form */}
            <form
              onSubmit={handlePostComment}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                background: "var(--color-bg-surface)",
                padding: "20px",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--color-border)",
                marginBottom: "24px",
              }}
            >
              <input
                type="text"
                placeholder="Your Name (optional)"
                value={commentName}
                onChange={(e) => setCommentName(e.target.value)}
                style={{
                  padding: "10px 14px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--color-bg-elevated)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text-primary)",
                  fontSize: "var(--font-size-small)",
                }}
              />
              <textarea
                rows={3}
                placeholder="Share your thoughts about this comic..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                required
                style={{
                  padding: "12px 14px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--color-bg-elevated)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text-primary)",
                  fontSize: "var(--font-size-body)",
                  resize: "vertical",
                }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button type="submit" variant="primary" size="md" disabled={submittingComment || !commentText.trim()}>
                  {submittingComment ? "Posting..." : "Post Comment"}
                </Button>
              </div>
            </form>

            {/* Comments List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {comments.length === 0 ? (
                <p style={{ fontSize: "var(--font-size-small)", color: "var(--color-text-tertiary)" }}>
                  No comments yet. Be the first to start the discussion!
                </p>
              ) : (
                comments.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      padding: "14px 18px",
                      borderRadius: "var(--radius-md)",
                      background: "var(--color-bg-surface)",
                      border: "1px solid var(--color-border)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 700, fontSize: "var(--font-size-small)", color: "var(--color-primary)" }}>
                        {c.userName}
                      </span>
                      <span style={{ fontSize: "var(--font-size-caption)", color: "var(--color-text-tertiary)" }}>
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p style={{ fontSize: "var(--font-size-body)", color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
                      {c.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
      <style jsx global>{`
        .comic-detail-hero{padding:28px 0 22px}
        .comic-hero-inner{width:min(100%,1100px);margin-inline:auto;align-items:center!important;padding:0 var(--space-container-x)!important}
        .comic-detail-cover{width:190px!important;box-shadow:0 20px 55px rgba(0,0,0,.55)!important}
        .comic-hero-copy{max-width:720px;padding:10px 0}
        .comic-hero-copy h1{font-size:clamp(2.2rem,5vw,4rem)!important}
        .comic-detail-content{max-width:1040px!important;margin-inline:auto}
        @media(max-width:640px){
          .comic-detail-hero{min-height:0!important;padding:16px 0 14px;align-items:center!important}
          .comic-hero-inner{grid-template-columns:112px minmax(0,1fr)!important;gap:14px!important;align-items:center!important;padding-inline:16px!important}
          .comic-detail-cover{width:112px!important;border-radius:12px!important}
          .comic-hero-copy{gap:7px!important;padding:0;min-width:0}
          .comic-hero-copy h1{font-size:clamp(1.65rem,8vw,2.25rem)!important;line-height:1.05!important;overflow-wrap:anywhere}
          .comic-hero-copy [style*="clamp(12px"]{gap:7px!important}
          .comic-detail-body{padding-top:18px!important}
          .comic-detail-content{gap:20px!important;padding-inline:16px!important}
          .comic-detail-content>div:first-child p{line-height:1.65!important}
        }
        @media(max-width:380px){
          .comic-hero-inner{grid-template-columns:96px minmax(0,1fr)!important;gap:12px!important}
          .comic-detail-cover{width:96px!important}
          .comic-hero-copy h1{font-size:1.5rem!important}
        }
      `}</style>
    </>
  );
}
/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-html-link-for-pages */
