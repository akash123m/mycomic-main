import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { canManageComic, getContentSession } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  const session = await getContentSession();
  const { id } = await params;
  const target = session ? await db.chapter.findUnique({ where: { id }, select: { comicId: true } }) : null;
  if (!session || !target || !(await canManageComic(session.id, session.role, target.comicId))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const { title, number, pages, isVisible } = data;

    if (Array.isArray(pages)) {
      // Re-create pages list if updated
      await db.chapterPage.deleteMany({ where: { chapterId: id } });
      await db.chapterPage.createMany({
        data: pages.map((url: string, index: number) => ({
          chapterId: id,
          pageNumber: index + 1,
          imageUrl: url,
        })),
      });
    }

    const updated = await db.chapter.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(number && { number: Number(number) }),
        ...(isVisible !== undefined && { isVisible: Boolean(isVisible) }),
      },
      include: {
        pages: { orderBy: { pageNumber: "asc" } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update chapter error:", error);
    return NextResponse.json({ error: "Failed to update chapter" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: Params) {
  const session = await getContentSession();
  const { id } = await params;
  const target = session ? await db.chapter.findUnique({ where: { id }, select: { comicId: true } }) : null;
  if (!session || !target || !(await canManageComic(session.id, session.role, target.comicId))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await db.chapter.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete chapter error:", error);
    return NextResponse.json({ error: "Failed to delete chapter" }, { status: 500 });
  }
}
