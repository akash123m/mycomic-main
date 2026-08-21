import { normalizeComics, type GenreSummary } from "@/lib/comics";
import type { Comic } from "@/types";
import { demoComics } from "@/lib/demo-data";

export const queryKeys = {
  comics: ["comics"] as const,
  genres: ["genres"] as const,
  settings: ["settings"] as const,
  session: ["session"] as const,
  profile: ["reader", "profile"] as const,
  history: ["reader", "history"] as const,
  resume: (comicId: string) => ["reader", "history", comicId] as const,
  submissions: ["reader", "submissions"] as const,
  adminSubmissions: (status: string) => ["admin", "submissions", status] as const,
};

export async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json() as Promise<T>;
}

export async function getComics(): Promise<Comic[]> {
  try {
    const comics = normalizeComics(await requestJson<unknown>("/api/comics"));
    return comics.length ? comics : normalizeComics(await requestJson<unknown>("/api/fallback-catalog"));
  } catch {
    try { return normalizeComics(await requestJson<unknown>("/api/fallback-catalog")); }
    catch { return demoComics; }
  }
}

export async function getGenres(): Promise<GenreSummary[]> {
  try {
    const genres = await requestJson<GenreSummary[]>("/api/genres");
    if (genres.length) return genres;
  } catch {}
  const names = ["Action","Adventure","Comedy","Crime","Drama","Fantasy","Historical","Horror","Isekai","Martial Arts","Mecha","Mystery","Post-Apocalyptic","Psychological","Romance","School Life","Sci-Fi","Slice of Life","Sports","Supernatural","Survival","Thriller"];
  return names.map((name) => ({ id: `demo-${name}`, name, icon: "📚", comicCount: demoComics.filter((comic) => comic.genres.includes(name)).length }));
}

export function getSettings<T>(): Promise<T> {
  return requestJson<T>("/api/settings");
}

export type SessionUser = { id: string; name: string; email: string; role: "READER" | "AUTHOR" | "ADMIN" };
export async function getSession(): Promise<SessionUser | null> {
  const response = await fetch("/api/auth/me");
  if (response.status === 401) return null;
  if (!response.ok) throw new Error("Unable to verify session");
  return (await response.json()).user;
}
