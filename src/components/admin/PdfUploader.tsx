"use client";

import React, { useState } from "react";
import { FileText } from "lucide-react";

interface PdfUploaderProps {
  onPagesExtracted: (imageUrls: string[]) => void;
}

export default function PdfUploader({ onPagesExtracted }: PdfUploaderProps) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const processPdf = async (file: File) => {
    if (file.type !== "application/pdf") {
      alert("Please upload a valid PDF file");
      return;
    }

    setLoading(true);
    setProgress("Loading PDF parser...");

    try {
      // Dynamically load pdfjs-dist
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      const extractedUrls: string[] = [];

      for (let i = 1; i <= numPages; i++) {
        setProgress(`Rendering PDF page ${i} of ${numPages}...`);
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
          await page.render({ canvasContext: context, viewport, canvas } as any).promise;

          // Convert canvas to blob
          const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, "image/webp", 0.9)
          );

          if (blob) {
            setProgress(`Uploading page ${i} of ${numPages}...`);
            const formData = new FormData();
            formData.append(
              "file",
              blob,
              `page-${i}-${Date.now()}.webp`
            );
            formData.append("folder", "chapters");

            const uploadRes = await fetch("/api/uploads", {
              method: "POST",
              body: formData,
            });

            if (uploadRes.ok) {
              const data = await uploadRes.json();
              extractedUrls.push(data.url);
            }
          }
        }
      }

      setProgress(`Completed! ${numPages} pages processed.`);
      onPagesExtracted(extractedUrls);
    } catch (err) {
      console.error("PDF processing failed:", err);
      alert("Failed to extract pages from PDF. Please ensure the PDF is valid.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files?.[0]) processPdf(e.dataTransfer.files[0]);
      }}
      style={{
        border: `2px dashed ${dragOver ? "var(--color-primary)" : "var(--color-border)"}`,
        borderRadius: "var(--radius-xl)",
        padding: "clamp(1.5rem, 4vw, 3rem)",
        textAlign: "center",
        background: dragOver
          ? "rgba(var(--color-primary-rgb), 0.05)"
          : "var(--color-bg-elevated)",
        transition: "all var(--transition-fast)",
      }}
    >
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              border: "3px solid var(--color-border)",
              borderTopColor: "var(--color-primary)",
              borderRadius: "50%",
            }}
            className="animate-spin"
          />
          <p style={{ fontSize: "var(--font-size-small)", fontWeight: 600, color: "var(--color-primary)" }}>
            {progress}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <FileText size={36} strokeWidth={1.6} aria-hidden />
          <h4 style={{ fontSize: "var(--font-size-h3)", fontWeight: 700 }}>
            Upload Chapter PDF
          </h4>
          <p style={{ fontSize: "var(--font-size-small)", color: "var(--color-text-secondary)", maxWidth: "400px" }}>
            Drag and drop your chapter PDF file here, or click to browse. Pages will be automatically extracted into comic panels.
          </p>
          <label
            style={{
              marginTop: "8px",
              padding: "10px 24px",
              fontSize: "var(--font-size-small)",
              fontWeight: 600,
              background: "var(--color-primary)",
              color: "var(--color-text-inverse)",
              borderRadius: "var(--radius-full)",
              cursor: "pointer",
            }}
          >
            Select PDF File
            <input
              type="file"
              accept="application/pdf"
              style={{ display: "none" }}
              onChange={(e) => {
                if (e.target.files?.[0]) processPdf(e.target.files[0]);
              }}
            />
          </label>
        </div>
      )}
    </div>
  );
}
/* eslint-disable @typescript-eslint/no-explicit-any */
