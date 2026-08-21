import { NextResponse } from "next/server";
import { demoComics } from "@/lib/demo-data";
import { readFallbackViews } from "@/lib/fallback-views";

export async function GET() {
  const views = await readFallbackViews();
  return NextResponse.json(demoComics.map((comic) => ({
    ...comic,
    views: views.comics[comic.id] || 0,
    chapters: comic.chapters.map((chapter) => ({ ...chapter, views: views.chapters[chapter.id] || 0 })),
  })));
}
