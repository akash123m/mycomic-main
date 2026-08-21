import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getReaderSession } from "@/lib/auth";

const include = { comic: { include: { chapters: { orderBy: { number: "asc" as const } } } }, chapter: true };

export async function GET(request: Request) {
  const session = await getReaderSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const comicId = new URL(request.url).searchParams.get("comicId");
  if (comicId) return NextResponse.json(await db.readingHistory.findUnique({ where: { userId_comicId: { userId: session.id, comicId } }, include }));
  return NextResponse.json(await db.readingHistory.findMany({ where: { userId: session.id }, include, orderBy: { updatedAt: "desc" } }));
}

export async function PUT(request: Request) {
  const session = await getReaderSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { comicId, chapterId, pageIndex = 0, scrollPosition = 0, completed = false } = await request.json();
  if (!comicId || !chapterId || pageIndex < 0) return NextResponse.json({ error: "Invalid reading progress" }, { status: 400 });
  const history = await db.readingHistory.upsert({
    where: { userId_comicId: { userId: session.id, comicId } },
    create: { userId: session.id, comicId, chapterId, pageIndex: Number(pageIndex), scrollPosition: Number(scrollPosition), completed: Boolean(completed) },
    update: { chapterId, pageIndex: Number(pageIndex), scrollPosition: Number(scrollPosition), completed: Boolean(completed) },
    include,
  });
  return NextResponse.json(history);
}
