import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { comparePassword, setSession } from "@/lib/auth";

export async function POST(request: Request) {
  const { email, password, audience } = await request.json();
  const login = String(email ?? "").trim().toLowerCase();
  const user = await db.user.findFirst({ where: { OR: [{ email: login }, { username: login }] } });
  const allowedRole = audience === "author" ? "AUTHOR" : "READER";
  if (!user || user.role !== allowedRole || user.isSuspended || !(await comparePassword(String(password ?? ""), user.passwordHash))) {
    return NextResponse.json({ error: "Invalid user ID/email or password" }, { status: 401 });
  }
  await setSession({ id: user.id, name: user.name, email: user.email, role: user.role });
  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, mustChangePassword: user.mustChangePassword } });
}
