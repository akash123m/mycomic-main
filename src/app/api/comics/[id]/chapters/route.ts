import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { canManageComic, getContentSession } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  const session = await getContentSession();
  const { id: comicId } = await params;
  if (!session || !(await canManageComic(session.id, session.role, comicId))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const { number, title, pdfUrl, pages, bannerImage } = data;

    if (
      number === undefined ||
      number === null ||
      isNaN(Number(number)) ||
      !title ||
      !Array.isArray(pages) ||
      pages.length === 0
    ) {
      return NextResponse.json(
        { error: "Chapter number, title, and page images are required" },
        { status: 400 }
      );
    }

    const chapter = await db.chapter.create({
      data: {
        comicId,
        number: Number(number),
        title,
        pdfUrl: pdfUrl || null,
        approvalStatus: session.role === "ADMIN" ? "APPROVED" : "PENDING",
        isVisible: session.role === "ADMIN",
        pages: {
          create: pages.map((url: string, index: number) => ({
            pageNumber: index + 1,
            imageUrl: url,
          })),
        },
      },
      include: {
        pages: { orderBy: { pageNumber: "asc" } },
      },
    });

    // Touch updated time on comic
    await db.comic.update({
      where: { id: comicId },
      data: { updatedAt: new Date(), ...(bannerImage ? { bannerImage } : {}) },
    });

    return NextResponse.json(chapter, { status: 201 });
  } catch (error) {
    console.error("Create chapter error:", error);
    return NextResponse.json({ error: "Failed to create chapter" }, { status: 500 });
  }
}
