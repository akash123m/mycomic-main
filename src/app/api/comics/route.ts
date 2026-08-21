import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession, getContentSession } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const includeHidden = new URL(request.url).searchParams.get("includeHidden") === "true";
    const manager = includeHidden ? await getContentSession() : null;
    if (includeHidden && !manager) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const comics = await db.comic.findMany({
      where: includeHidden ? (manager?.role === "AUTHOR" ? { submittedById: manager.id } : undefined) : { isVisible: true },
      include: {
        submittedBy: { select: { id: true, name: true, avatarUrl: true } },
        genres: {
          include: { genre: true },
        },
        chapters: {
          where: includeHidden ? undefined : { isVisible: true, approvalStatus: "APPROVED" },
          orderBy: { number: "asc" },
          include: { pages: { orderBy: { pageNumber: "asc" } } },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(comics);
  } catch (error) {
    console.error("Fetch comics error:", error);
    return NextResponse.json({ error: "Failed to fetch comics" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getContentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const { title, slug, synopsis, coverImage, bannerImage, author, artist, status, genreNames, isFeatured, submissionId } = data;

    if (!title || !slug || !synopsis || !coverImage) {
      return NextResponse.json(
        { error: "Title, slug, synopsis, and cover image are required" },
        { status: 400 }
      );
    }

    // Check slug uniqueness
    const existing = await db.comic.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "A comic with this slug already exists" },
        { status: 400 }
      );
    }

    // Connect/create genres
    const genreConnect = [];
    if (Array.isArray(genreNames)) {
      for (const gName of genreNames) {
        const genre = await db.genre.upsert({
          where: { name: gName },
          update: {},
          create: { name: gName, icon: "📚" },
        });
        genreConnect.push({ genreId: genre.id });
      }
    }

    const submission = submissionId ? await db.comicSubmission.findUnique({ where: { id: submissionId } }) : null;
    if (submissionId && (!submission || submission.status !== "APPROVED")) return NextResponse.json({ error: "Submission must be approved first" }, { status: 400 });

    const comic = await db.comic.create({
      data: {
        title,
        slug,
        synopsis,
        coverImage,
        bannerImage: bannerImage || coverImage,
        author: author || "MyComic Studio",
        artist: artist || "MyComic Studio",
        status: status || "ongoing",
        isFeatured: Boolean(isFeatured),
        submittedById: session.role === "AUTHOR" ? session.id : submission?.userId,
        genres: {
          create: genreConnect,
        },
      },
      include: {
        genres: { include: { genre: true } },
      },
    });

    if (submission) await db.comicSubmission.update({ where: { id: submission.id }, data: { comicId: comic.id } });

    return NextResponse.json(comic, { status: 201 });
  } catch (error) {
    console.error("Create comic error:", error);
    return NextResponse.json({ error: "Failed to create comic" }, { status: 500 });
  }
}
