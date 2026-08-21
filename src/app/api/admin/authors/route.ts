import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession, hashPassword } from "@/lib/auth";

export async function GET() {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await db.user.findMany({ where: { role: "AUTHOR" }, orderBy: { createdAt: "desc" }, select: { id: true, username: true, email: true, name: true, isSuspended: true, submittedComics: { select: { id: true, title: true } } } }));
}

export async function POST(request: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name, username, email, password } = await request.json();
  const handle = String(username ?? "").trim().toLowerCase();
  const cleanEmail = String(email ?? "").trim().toLowerCase();
  if (String(name ?? "").trim().length < 2 || !/^[a-z0-9_.-]{3,30}$/.test(handle) || !/^\S+@\S+\.\S+$/.test(cleanEmail) || String(password ?? "").length < 8) return NextResponse.json({ error: "Enter valid author details" }, { status: 400 });
  if (await db.user.findFirst({ where: { OR: [{ email: cleanEmail }, { username: handle }] } })) return NextResponse.json({ error: "Email or user ID already exists" }, { status: 409 });
  return NextResponse.json(await db.user.create({ data: { name: String(name).trim(), username: handle, email: cleanEmail, passwordHash: await hashPassword(String(password)), role: "AUTHOR" }, select: { id: true, username: true, email: true, name: true } }), { status: 201 });
}
