import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getReaderSession } from "@/lib/auth";

export async function GET() {
  const session = await getReaderSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await db.comicSubmission.findMany({ where: { userId: session.id }, include: { comic: { select: { slug: true, title: true } } }, orderBy: { createdAt: "desc" } }));
}

export async function POST(request: Request) {
  const session = await getReaderSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { title, description, storyContent, contentUrl, coverUrl } = await request.json();
  if (String(title ?? "").trim().length < 2 || String(description ?? "").trim().length < 20) return NextResponse.json({ error: "Title and a description of at least 20 characters are required" }, { status: 400 });
  if (!String(storyContent ?? "").trim() && !contentUrl) return NextResponse.json({ error: "Story content or a story file is required" }, { status: 400 });
  const submission = await db.comicSubmission.create({ data: { userId: session.id, title: title.trim(), description: description.trim(), storyContent: storyContent?.trim() || null, contentUrl: contentUrl || null, coverUrl: coverUrl || null } });
  return NextResponse.json(submission, { status: 201 });
}
