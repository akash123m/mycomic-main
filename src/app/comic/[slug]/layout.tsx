import type { Metadata } from "next";
import { demoComics } from "@/lib/demo-data";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const comic = demoComics.find((item) => item.slug === slug);
  if (!comic) return { title: "Series" };
  return {
    title: comic.title,
    description: comic.synopsis,
    openGraph: { title: comic.title, description: comic.synopsis, type: "article", images: [comic.bannerImage || comic.coverImage] },
    twitter: { card: "summary_large_image", title: comic.title, description: comic.synopsis, images: [comic.bannerImage || comic.coverImage] },
  };
}

export default function ComicLayout({ children }: { children: React.ReactNode }) { return children; }
