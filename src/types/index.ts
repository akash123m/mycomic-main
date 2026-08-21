// ─── Genre Types ───────────────────────────────────────────────────────────────

/** Genre names are managed by admins in the database. */
export type Genre = string;

// ─── Chapter Types ─────────────────────────────────────────────────────────────

export interface Chapter {
  id: string;
  number: number;
  title: string;
  /** Array of image URLs for each page/panel */
  pages: Array<{ id?: string; pageNumber: number; imageUrl: string }>;
  publishedAt: string;
  views: number;
  /** Thumbnail for chapter list */
  thumbnail?: string;
}

// ─── Comic Types ───────────────────────────────────────────────────────────────

export type ComicStatus = "ongoing" | "completed" | "hiatus";

export interface Comic {
  id: string;
  slug: string;
  title: string;
  synopsis: string;
  /** Cover image URL (portrait, for cards) */
  coverImage: string;
  /** Banner image URL (wide, for hero/detail headers) */
  bannerImage: string;
  genres: Genre[];
  rating: number;
  views: number;
  likes?: number;
  isFeatured?: boolean;
  submittedBy?: { id: string; name: string; avatarUrl?: string | null } | null;
  chapters: Chapter[];
  status: ComicStatus;
  author: string;
  artist: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Navigation Types ──────────────────────────────────────────────────────────

export interface NavLink {
  label: string;
  href: string;
}

// ─── Component Prop Types ──────────────────────────────────────────────────────

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";
export type CardSize = "sm" | "md" | "lg";

export interface GenreInfo {
  name: Genre;
  description: string;
  icon: string;
  comicCount: number;
}
