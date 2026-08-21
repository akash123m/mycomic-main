import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export async function GET(request: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const status = new URL(request.url).searchParams.get("status");
  return NextResponse.json(await db.comicSubmission.findMany({
    where: status && status !== "ALL" ? { status: status as "PENDING" | "APPROVED" | "REJECTED" } : {},
    include: { user: { select: { id: true, name: true, email: true } }, comic: { select: { id: true, slug: true, title: true } } },
    orderBy: { createdAt: "desc" },
  }));
}
