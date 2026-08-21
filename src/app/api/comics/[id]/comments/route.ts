import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getReaderSession } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const comments = await db.comment.findMany({
      where: { comicId: id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(comments);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getReaderSession();
    if (!session) return NextResponse.json({ error: "Reader login required" }, { status: 401 });
    const { id } = await params;
    const { content } = await req.json();

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Comment text is required" }, { status: 400 });
    }

    const comment = await db.comment.create({
      data: {
        comicId: id,
        userName: session.name,
        content: content.trim(),
      },
    });

    return NextResponse.json({ success: true, comment });
  } catch (error) {
    return NextResponse.json({ error: "Failed to post comment" }, { status: 500 });
  }
}
