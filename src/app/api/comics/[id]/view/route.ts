import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getReaderSession } from "@/lib/auth";
import { createHash } from "crypto";
import { Prisma } from "@prisma/client";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getReaderSession();
    if (!session) return NextResponse.json({ error: "Reader login required" }, { status: 401 });
    if (id.startsWith("demo-")) return NextResponse.json({ error: "Database catalog unavailable" }, { status: 503 });
    const viewerKey = createHash("sha256").update(`user:${session.id}`).digest("hex");
    const viewedOn = new Date().toISOString().slice(0, 10);
    const updated = await db.$transaction(async (tx) => {
      await tx.comicView.create({ data: { comicId: id, viewerKey, viewedOn } });
      return tx.comic.update({ where: { id }, data: { views: { increment: 1 } }, select: { views: true } });
    });
    return NextResponse.json({ success: true, counted: true, views: updated.views });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const comic = await db.comic.findUnique({ where: { id }, select: { views: true } });
      return NextResponse.json({ success: true, counted: false, views: comic?.views ?? 0 });
    }
    return NextResponse.json({ error: "Failed to increment view" }, { status: 500 });
  }
}
