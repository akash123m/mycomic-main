import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, setSession } from "@/lib/auth";

export async function POST(request: Request) {
  const { name, email, password, confirmPassword, audience } = await request.json();
  const cleanEmail = String(email ?? "").trim().toLowerCase();
  if (String(name ?? "").trim().length < 2) return NextResponse.json({ error: "Name must be at least 2 characters" }, { status: 400 });
  if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
  if (String(password ?? "").length < 8) return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  if (password !== confirmPassword) return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
  if (await db.user.findUnique({ where: { email: cleanEmail } })) return NextResponse.json({ error: "An account already exists" }, { status: 409 });
  const user = await db.user.create({ data: { name: name.trim(), email: cleanEmail, passwordHash: await hashPassword(password), role: audience === "author" ? "AUTHOR" : "READER" } });
  await setSession({ id: user.id, name: user.name, email: user.email, role: user.role });
  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } }, { status: 201 });
}
