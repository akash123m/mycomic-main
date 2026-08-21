"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";

export default function NewComicPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const submissionId = searchParams.get("submission");
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    synopsis: "",
    coverImage: "/images/comic-cover.webp",
    bannerImage: "/images/hero-bg.webp",
    author: "MyComic Studio",
    artist: "MyComic Studio",
    status: "ongoing",
    genreNames: ["Fantasy", "Action"],
  });
  const [loading, setLoading] = useState(false);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const autoSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: autoSlug,
    }));
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append("file", file);
    data.append("folder", "covers");

    try {
      const res = await fetch("/api/uploads", { method: "POST", body: data });
      if (res.ok) {
        const result = await res.json();
        setFormData((prev) => ({ ...prev, coverImage: result.url }));
      }
    } catch {
      alert("Failed to upload image");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/comics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, submissionId }),
      });

      if (res.ok) {
        router.push("/admin/comics");
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to create comic");
      }
    } catch {
      alert("Error submitting form");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "800px" }}>
      <SectionHeader
        title="Add New Comic Series"
        subtitle="Create a new comic title and configure cover art and genres"
      />

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          padding: "clamp(1.5rem, 4vw, 2.5rem)",
          borderRadius: "var(--radius-xl)",
          background: "var(--color-bg-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        <div>
          <label style={{ display: "block", fontSize: "var(--font-size-caption)", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: "6px" }}>
            Comic Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={handleTitleChange}
            placeholder="e.g. AFTER//US"
            required
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

        <div>
          <label style={{ display: "block", fontSize: "var(--font-size-caption)", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: "6px" }}>
            URL Slug
          </label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="after-us"
            required
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: "var(--radius-md)",
              background: "var(--color-bg-elevated)",
              border: "1px solid var(--color-border)",
              color: "var(--color-primary)",
              fontFamily: "var(--font-mono)",
              outline: "none",
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "var(--font-size-caption)", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: "6px" }}>
            Synopsis / Story Description
          </label>
          <textarea
            rows={4}
            value={formData.synopsis}
            onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
            placeholder="Enter comic summary..."
            required
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: "var(--radius-md)",
              background: "var(--color-bg-elevated)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-primary)",
              outline: "none",
              resize: "vertical",
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "var(--font-size-caption)", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: "6px" }}>
            Upload Cover Art Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleCoverUpload}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "var(--radius-md)",
              background: "var(--color-bg-elevated)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-secondary)",
            }}
          />
          {formData.coverImage && (
            <p style={{ fontSize: "var(--font-size-caption)", color: "var(--color-primary)", marginTop: "4px" }}>
              Current Cover URL: {formData.coverImage}
            </p>
          )}
        </div>

        <Button variant="primary" size="lg" type="submit" disabled={loading}>
          {loading ? "Creating Series..." : "Create Comic Series"}
        </Button>
      </form>
    </div>
  );
}
