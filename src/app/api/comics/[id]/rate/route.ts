import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { rating, userIp = "anonymous" } = await req.json();

    const ratingVal = Math.min(5, Math.max(1, parseInt(rating, 10)));
    if (isNaN(ratingVal)) {
      return NextResponse.json({ error: "Invalid rating value" }, { status: 400 });
    }

    // Upsert user rating
    await db.rating.upsert({
      where: {
        comicId_userIp: { comicId: id, userIp },
      },
      update: { value: ratingVal },
      create: { comicId: id, userIp, value: ratingVal },
    });

    // Recalculate average rating & rating count
    const aggregate = await db.rating.aggregate({
      where: { comicId: id },
      _avg: { value: true },
      _count: { value: true },
    });

    const newAvg = parseFloat((aggregate._avg.value || ratingVal).toFixed(1));
    const newCount = aggregate._count.value || 1;

    const updatedComic = await db.comic.update({
      where: { id },
      data: {
        rating: newAvg,
        ratingCount: newCount,
      },
      select: { rating: true, ratingCount: true },
    });

    return NextResponse.json({
      success: true,
      rating: updatedComic.rating,
      ratingCount: updatedComic.ratingCount,
    });
  } catch (error) {
    console.error("Rating error:", error);
    return NextResponse.json({ error: "Failed to submit rating" }, { status: 500 });
  }
}
