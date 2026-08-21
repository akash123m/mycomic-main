"use client";

import React, { useState, useEffect, use } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import PdfUploader from "@/components/admin/PdfUploader";
import { ArrowLeft, ArrowRight, Trash2, UploadCloud } from "lucide-react";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function ChapterUploadPage({ params }: PageProps) {
  const { id: comicId } = use(params);
  const router = useRouter();

  const [comicTitle, setComicTitle] = useState("");
  const [chapterNumber, setChapterNumber] = useState<number>(0);
  const [chapterTitle, setChapterTitle] = useState("");
  const [pages, setPages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [heroBanner, setHeroBanner] = useState("");
  const [uploadingBanner, setUploadingBanner] = useState(false);

  useEffect(() => {
    fetch(`/api/comics/${comicId}?includeHidden=true`)
      .then((res) => res.json())
      .then((comic) => {
        if (comic.title) {
          setComicTitle(comic.title);
          setHeroBanner(comic.bannerImage || "");
          const chapterNumbers = (comic.chapters || []).map((chapter: { number: number }) => chapter.number);
          const nextChapterNum = chapterNumbers.length ? Math.max(...chapterNumbers) + 1 : 0;
          setChapterNumber(nextChapterNum);
          setChapterTitle(`Chapter ${nextChapterNum}`);
        }
      });
  }, [comicId]);

  const handleRemovePage = (index: number) => {
    setPages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMovePage = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= pages.length) return;

    setPages((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return updated;
    });
  };

  const handleSaveChapter = async () => {
    if (!chapterTitle) {
      alert("Please enter a chapter title");
      return;
    }
    if (pages.length === 0) {
      alert("Please upload a PDF or add at least one page");
      return;
    }
    if (chapterNumber <= 1 && !heroBanner) {
      alert("Please upload a landscape hero cover for this series before publishing its first chapter.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/comics/${comicId}/chapters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          number: chapterNumber,
          title: chapterTitle,
          pages,
          bannerImage: heroBanner,
        }),
      });

      if (res.ok) {
        router.push("/admin/comics");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to publish chapter");
      }
    } catch {
      alert("Failed to publish chapter");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: "900px" }}>
      <SectionHeader
        title={`Upload Chapter for "${comicTitle || "Comic"}"`}
        subtitle="Upload a PDF file to automatically extract panels or manage extracted page order"
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          padding: "clamp(1.5rem, 4vw, 2.5rem)",
          borderRadius: "var(--radius-xl)",
          background: "var(--color-bg-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        {/* Chapter Info */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "var(--font-size-caption)", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: "6px" }}>
              Chapter Number
            </label>
            <input
              type="number"
              value={chapterNumber}
              onChange={(e) => setChapterNumber(Number(e.target.value))}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "var(--radius-md)",
                background: "var(--color-bg-elevated)",
                border: "1px solid var(--color-border)",
                color: "var(--color-primary)",
                fontWeight: 700,
                outline: "none",
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "var(--font-size-caption)", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: "6px" }}>
              Chapter Title
            </label>
            <input
              type="text"
              value={chapterTitle}
              onChange={(e) => setChapterTitle(e.target.value)}
              placeholder="Chapter Title"
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "var(--radius-md)",
                background: "var(--color-bg-elevated)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text-primary)",
                outline: "none",
              }}
            />
          </div>
        </div>

        {/* PDF Drag & Drop Uploader */}
        {chapterNumber <= 1 && <div style={{ padding: "18px", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", background: "var(--color-bg-elevated)" }}>
          <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>Hero cover <span style={{ color: "var(--color-primary)" }}>(required for first chapter)</span></label>
          <p style={{ color: "var(--color-text-secondary)", fontSize: 12, marginBottom: 12 }}>Upload a wide 16:9 banner. If this series becomes the most popular, this artwork will automatically appear in the homepage hero.</p>
          {heroBanner ? <div style={{ position: "relative", width: "100%", aspectRatio: "16/5", borderRadius: 10, overflow: "hidden", marginBottom: 10 }}><Image src={heroBanner} alt="Hero cover preview" fill sizes="800px" style={{ objectFit: "cover" }} /></div> : null}
          <label style={{ display: "inline-flex", padding: "9px 14px", borderRadius: 8, background: "var(--color-primary)", color: "var(--color-text-inverse)", fontWeight: 700, cursor: "pointer" }}>{uploadingBanner ? "Uploading…" : heroBanner ? "Replace hero cover" : "Upload hero cover"}<input type="file" accept="image/*" disabled={uploadingBanner} style={{ display: "none" }} onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; setUploadingBanner(true); const data = new FormData(); data.append("file", file); data.append("folder", "covers"); try { const response = await fetch("/api/uploads", { method: "POST", body: data }); const result = await response.json(); if (response.ok) setHeroBanner(result.url); else alert(result.error || "Upload failed"); } finally { setUploadingBanner(false); } }} /></label>
        </div>}
        <PdfUploader
          onPagesExtracted={(extractedUrls) => {
            setPages((prev) => [...prev, ...extractedUrls]);
          }}
        />

        {/* Extracted Pages Grid & Reorder Controls */}
        {pages.length > 0 && (
          <div>
            <h4 style={{ fontSize: "var(--font-size-h3)", fontWeight: 700, marginBottom: "16px" }}>
              Extracted Pages ({pages.length})
            </h4>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                gap: "16px",
              }}
            >
              {pages.map((url, i) => (
                <div
                  key={i}
                  style={{
                    position: "relative",
                    borderRadius: "var(--radius-md)",
                    overflow: "hidden",
                    border: "1px solid var(--color-border)",
                    background: "var(--color-bg-elevated)",
                    padding: "8px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <div style={{ position: "relative", width: "100%", aspectRatio: "2/3" }}>
                    <Image src={url} alt={`Page ${i + 1}`} fill sizes="140px" style={{ objectFit: "contain" }} />
                  </div>
                  <span style={{ fontSize: "var(--font-size-caption)", fontWeight: 600 }}>Page {i + 1}</span>
                  <div style={{ display: "flex", gap: "4px" }}>
                    <button
                      onClick={() => handleMovePage(i, "up")}
                      disabled={i === 0}
                      style={{ padding: "4px 8px", fontSize: "12px", background: "var(--color-bg-hover)", borderRadius: "4px" }}
                    >
                      <ArrowLeft size={14} aria-label="Move page left" />
                    </button>
                    <button
                      onClick={() => handleMovePage(i, "down")}
                      disabled={i === pages.length - 1}
                      style={{ padding: "4px 8px", fontSize: "12px", background: "var(--color-bg-hover)", borderRadius: "4px" }}
                    >
                      <ArrowRight size={14} aria-label="Move page right" />
                    </button>
                    <button
                      onClick={() => handleRemovePage(i)}
                      style={{ padding: "4px 8px", fontSize: "12px", background: "rgba(239, 68, 68, 0.2)", color: "var(--color-error)", borderRadius: "4px" }}
                    >
                      <Trash2 size={14} aria-label="Remove page" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button variant="primary" size="lg" onClick={handleSaveChapter} disabled={saving}>
          {!saving && <UploadCloud size={17} aria-hidden />}{saving ? "Publishing Chapter..." : `Publish Chapter ${chapterNumber}`}
        </Button>
      </div>
    </div>
  );
}
