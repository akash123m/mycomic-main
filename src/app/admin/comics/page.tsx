"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import { Eye, EyeOff, FilePenLine, FilePlus2, Plus, Trash2 } from "lucide-react";
import { ActionToast, ConfirmDialog, type ConfirmState } from "@/components/ui/ConfirmDialog";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api";
import LoadingState from "@/components/ui/LoadingState";

interface ComicItem {
  id: string;
  slug: string;
  title: string;
  coverImage: string;
  author: string;
  status: string;
  chapters: { id: string }[];
  views: number;
  isVisible: boolean;
}

export default function AdminComicsPage() {
  const queryClient=useQueryClient();
  const [comics, setComics] = useState<ComicItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmState,setConfirmState]=useState<ConfirmState>(null);
  const [toast,setToast]=useState<{message:string;tone:"success"|"error"}|null>(null);

  const fetchComics = () => {
    fetch("/api/comics?includeHidden=true")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setComics(data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchComics();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    try {
      const res = await fetch(`/api/comics/${id}`, { method: "DELETE" });
      if (res.ok) {
        setComics((prev) => prev.filter((c) => c.id !== id));
        setToast({message:`${title} and its chapters were deleted.`,tone:"success"});
      } else {
        setToast({message:"The comic could not be deleted.",tone:"error"});
      }
    } catch {
      setToast({message:"The comic could not be deleted.",tone:"error"});
    }
    setConfirmState(null);
  };

  const handleVisibility = async (comic: ComicItem) => {
    const res = await fetch(`/api/comics/${comic.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isVisible: !comic.isVisible }) });
    if (res.ok) {setComics((current) => current.map((item) => item.id === comic.id ? { ...item, isVisible: !item.isVisible } : item));queryClient.invalidateQueries({queryKey:queryKeys.comics});setToast({message:`${comic.title} is now ${comic.isVisible?"hidden":"visible"}.`,tone:"success"});}
    else setToast({message:"Could not update comic visibility.",tone:"error"});
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <SectionHeader
          title="Comic Management"
          subtitle="Manage all your series, upload new chapters, and update artwork"
        />
        <Button variant="primary" size="md" href="/admin/comics/new">
          <Plus size={16} aria-hidden /> Add New Comic
        </Button>
      </div>

      {loading ? (
        <LoadingState label="Loading comics" variant="section" />
      ) : comics.length === 0 ? (
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            background: "var(--color-bg-surface)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--color-border)",
          }}
        >
          <p style={{ color: "var(--color-text-secondary)" }}>No comics found. Create your first comic!</p>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {comics.map((comic) => (
            <div
              key={comic.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                padding: "16px",
                borderRadius: "var(--radius-lg)",
                background: "var(--color-bg-surface)",
                border: "1px solid var(--color-border)",
                flexWrap: "wrap",
              }}
            >
              {/* Cover */}
              <div
                style={{
                  position: "relative",
                  width: "60px",
                  height: "80px",
                  borderRadius: "var(--radius-md)",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                <Image
                  src={comic.coverImage}
                  alt={comic.title}
                  fill
                  sizes="60px"
                  style={{ objectFit: "cover" }}
                />
              </div>

              {/* Title info */}
              <div style={{ flex: 1, minWidth: "180px" }}>
                <h3
                  style={{
                    fontSize: "var(--font-size-small)",
                    fontWeight: 700,
                    color: "var(--color-text-primary)",
                  }}
                >
                  {comic.title}
                </h3>
                <p
                  style={{
                    fontSize: "var(--font-size-caption)",
                    color: "var(--color-text-secondary)",
                    marginTop: "2px",
                  }}
                >
                  Slug: <code style={{ color: "var(--color-primary)" }}>{comic.slug}</code> · {comic.chapters?.length || 0} Chapters · {comic.views} Reads
                </p>
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <Button
                  variant="primary"
                  size="sm"
                  href={`/admin/comics/${comic.id}/chapters/upload`}
                >
                  <FilePlus2 size={15} aria-hidden /> Upload Chapter PDF
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  href={`/admin/comics/${comic.id}/edit`}
                >
                  <FilePenLine size={15} aria-hidden /> Edit Comic
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmState({title:comic.isVisible?"Hide this comic?":"Show this comic?",description:comic.isVisible?"Readers will no longer find or open this comic. You can show it again later.":"This comic and its visible chapters will become available to readers.",confirmLabel:comic.isVisible?"Hide comic":"Show comic",tone:"warning",onConfirm:()=>{handleVisibility(comic);setConfirmState(null)}})}
                >
                  {comic.isVisible ? <EyeOff size={15} aria-hidden /> : <Eye size={15} aria-hidden />} {comic.isVisible ? "Hide Comic" : "Show Comic"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmState({title:"Delete comic permanently?",description:`${comic.title} and every chapter, page, rating, comment, and reading record attached to it will be permanently removed.`,confirmLabel:"Delete comic",tone:"danger",onConfirm:()=>handleDelete(comic.id,comic.title)})}
                  style={{ color: "var(--color-error)" }}
                >
                  <Trash2 size={15} aria-hidden /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <ConfirmDialog state={confirmState} onClose={()=>setConfirmState(null)}/>
      {toast&&<ActionToast message={toast.message} tone={toast.tone} onClose={()=>setToast(null)}/>} 
    </div>
  );
}
