"use client";

import { useQuery } from "@tanstack/react-query";
import Button from "@/components/ui/Button";
import { getSession, queryKeys, requestJson } from "@/lib/api";

type Resume = { comicId: string; pageIndex: number; chapter: { number: number } };

export default function ReadingCTAButton({ location, comicId, slug, firstChapter = 1, size = "md" }: { location: "navbar" | "card" | "detail"; comicId?: string; slug?: string; firstChapter?: number; size?: "sm" | "md" | "lg" }) {
  const { data: session } = useQuery({ queryKey: queryKeys.session, queryFn: getSession, staleTime: 5 * 60_000 });
  const { data: history = [] } = useQuery({
    queryKey: queryKeys.history,
    queryFn: () => requestJson<Resume[]>("/api/reader/history"),
    enabled: session?.role === "READER" && Boolean(comicId),
  });
  const resume = history.find((item) => item.comicId === comicId);
  if (location === "navbar") {
    if (session) return <Button href={session.role === "ADMIN" ? "/admin" : session.role === "AUTHOR" ? "/author/dashboard" : "/dashboard"} size="sm">Dashboard</Button>;
    return <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "center", flexWrap: "wrap" }}><Button href="/signin" variant="ghost" size="sm">Login</Button><Button href="/signup" size="sm">Sign Up</Button></div>;
  }
  const startPath = session?.role === "READER" ? `/comic/${slug}/read/${resume?.chapter.number ?? firstChapter}${resume ? `?page=${resume.pageIndex}` : ""}` : `/signin?next=${encodeURIComponent(`/comic/${slug}/read/${firstChapter}`)}`;
  return <Button href={startPath} size={size}>{session?.role === "READER" && resume ? "Continue Reading" : "Start Reading"}</Button>;
}
