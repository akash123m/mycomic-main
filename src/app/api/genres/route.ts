import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const genres = await db.genre.findMany({
      include: { _count: { select: { comics: true } } },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(
      genres.map(({ _count, ...genre }) => ({ ...genre, comicCount: _count.comics }))
    );
  } catch (error) {
    console.error("Fetch genres error:", error);
    return NextResponse.json({ error: "Failed to fetch genres" }, { status: 500 });
  }
}
