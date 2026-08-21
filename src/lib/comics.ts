import type { Comic } from "@/types";

type ComicGenreRelation = {
  genre?: { name?: string | null } | null;
  name?: string | null;
};
type ComicGenreValue = ComicGenreRelation | string;

type ComicFromApi = Omit<Comic, "genres"> & {
  genres?: ComicGenreValue[];
};

export type GenreSummary = {
  id: string;
  name: string;
  icon: string;
  comicCount: number;
};

/** Converts Prisma's comic-to-genre relation into the UI comic shape. */
export function normalizeComic(comic: ComicFromApi): Comic {
  return {
    ...comic,
    genres: [...new Set((comic.genres ?? [])
      .map((relation) => typeof relation === "string" ? relation : relation.genre?.name ?? relation.name)
      .filter((name): name is string => Boolean(name)))],
  };
}

export function normalizeComics(data: unknown): Comic[] {
  return Array.isArray(data)
    ? data.map((comic) => normalizeComic(comic as ComicFromApi))
    : [];
}

export function formatViews(views: number): string {
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K`;
  return views.toString();
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
