import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { status, reviewNote, comicId } = await request.json();
  if (!["PENDING", "APPROVED", "REJECTED"].includes(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  const submission = await db.comicSubmission.update({ where: { id }, data: { status, reviewNote: reviewNote || null, comicId: comicId || null }, include: { user: true } });
  if (status === "APPROVED" && comicId) await db.comic.update({ where: { id: comicId }, data: { submittedById: submission.userId } });
  return NextResponse.json(submission);
}
