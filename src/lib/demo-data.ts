import type { Comic } from "@/types";

const makePages = (chapter: 0 | 1, count: number) => Array.from({ length: count }, (_, index) => ({
  id: `after-us-${chapter}-page-${index + 1}`,
  pageNumber: index + 1,
  imageUrl: `/uploads/after-us/chapter-${chapter}/page-${chapter === 0 ? String(index + 1).padStart(2, "0") : index + 1}.jpg`,
}));

export const demoComics: Comic[] = [{
  id: "demo-after-us",
  slug: "after-us",
  title: "AFTER//US",
  synopsis: "A lone survivor wakes in a city reclaimed by nature and watched by something that has waited thousands of days to speak.",
  coverImage: "/afterus.png",
  bannerImage: "/afterus.png",
  genres: ["Sci-Fi", "Mystery", "Drama"],
  rating: 0,
  views: 0,
  likes: 0,
  isFeatured: true,
  status: "ongoing",
  author: "Arialtia",
  artist: "Arialtia",
  createdAt: "2026-08-20T00:00:00.000Z",
  updatedAt: "2026-08-20T00:00:00.000Z",
  chapters: [
    { id: "demo-after-us-chapter-0", number: 0, title: "Chapter 0", pages: makePages(0, 21), publishedAt: "2026-08-20T00:00:00.000Z", views: 0 },
    { id: "demo-after-us-chapter-1", number: 1, title: "The City That Forgot Me", pages: makePages(1, 6), publishedAt: "2026-08-20T00:00:00.000Z", views: 0 },
  ],
}];
