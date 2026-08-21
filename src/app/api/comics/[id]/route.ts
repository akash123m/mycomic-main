import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { canManageComic, getAdminSession, getContentSession } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
  const { id } = await params;
  try {
    const includeHidden = new URL(req.url).searchParams.get("includeHidden") === "true";
    const manager = includeHidden ? await getContentSession() : null;
    if (includeHidden && (!manager || !(await canManageComic(manager.id, manager.role, id)))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const comic = await db.comic.findUnique({
      where: { id },
      include: {
        submittedBy: { select: { id: true, name: true, avatarUrl: true } },
        genres: { include: { genre: true } },
        chapters: {
          where: includeHidden ? undefined : { isVisible: true, approvalStatus: "APPROVED" },
          orderBy: { number: "asc" },
          include: { pages: { orderBy: { pageNumber: "asc" } } },
        },
      },
    });

    if (!comic || (!includeHidden && !comic.isVisible)) {
      return NextResponse.json({ error: "Comic not found" }, { status: 404 });
    }

    return NextResponse.json(comic);
  } catch (error) {
    console.error("Fetch comic error:", error);
    return NextResponse.json({ error: "Failed to fetch comic" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: Params) {
  const session = await getContentSession();
  const { id } = await params;
  if (!session || !(await canManageComic(session.id, session.role, id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const { title, slug, synopsis, coverImage, bannerImage, author, artist, status, genreNames, isFeatured, isVisible } = data;

    // Delete existing comic genres if genreNames provided
    if (Array.isArray(genreNames)) {
      await db.comicGenre.deleteMany({ where: { comicId: id } });
      for (const gName of genreNames) {
        const genre = await db.genre.upsert({
          where: { name: gName },
          update: {},
          create: { name: gName, icon: "📚" },
        });
        await db.comicGenre.create({
          data: { comicId: id, genreId: genre.id },
        });
      }
    }

    const updated = await db.comic.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(slug && { slug }),
        ...(synopsis && { synopsis }),
        ...(coverImage && { coverImage }),
        ...(bannerImage && { bannerImage }),
        ...(author && { author }),
        ...(artist && { artist }),
        ...(status && { status }),
        ...(isFeatured !== undefined && { isFeatured: Boolean(isFeatured) }),
        ...(isVisible !== undefined && { isVisible: Boolean(isVisible) }),
      },
      include: {
        genres: { include: { genre: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update comic error:", error);
    return NextResponse.json({ error: "Failed to update comic" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: Params) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await db.comic.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete comic error:", error);
    return NextResponse.json({ error: "Failed to delete comic" }, { status: 500 });
  }
}
