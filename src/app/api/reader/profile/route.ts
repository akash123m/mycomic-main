import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { comparePassword, getReaderSession, hashPassword } from "@/lib/auth";

export async function GET() {
  const session = await getReaderSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await db.user.findUnique({ where: { id: session.id }, select: { id: true, name: true, email: true, avatarUrl: true, bio: true, role: true } }));
}

export async function PUT(request: Request) {
  const session = await getReaderSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name, avatarUrl, bio, currentPassword, newPassword } = await request.json();
  const data: { name?: string; avatarUrl?: string | null; bio?: string | null; passwordHash?: string; mustChangePassword?: boolean } = {};
  if (name !== undefined) {
    if (String(name).trim().length < 2) return NextResponse.json({ error: "Name is too short" }, { status: 400 });
    data.name = String(name).trim();
  }
  if (avatarUrl !== undefined) data.avatarUrl = avatarUrl || null;
  if (bio !== undefined) data.bio = String(bio).slice(0, 500) || null;
  if (newPassword) {
    const user = await db.user.findUnique({ where: { id: session.id } });
    if (!user || !(await comparePassword(String(currentPassword ?? ""), user.passwordHash))) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    if (String(newPassword).length < 8) return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
    data.passwordHash = await hashPassword(newPassword);
    data.mustChangePassword = false;
  }
  return NextResponse.json(await db.user.update({ where: { id: session.id }, data, select: { id: true, name: true, email: true, avatarUrl: true, bio: true, role: true } }));
}
