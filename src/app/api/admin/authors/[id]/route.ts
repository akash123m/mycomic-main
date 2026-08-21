import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const author = await db.user.findFirst({ where: { id, role: "AUTHOR" }, select: { id: true } });
  if (!author) return NextResponse.json({ error: "Author not found" }, { status: 404 });
  await db.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
