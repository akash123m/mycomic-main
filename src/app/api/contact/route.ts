import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const { name, email, message } = await request.json();
  const cleanName = String(name ?? "").trim();
  const cleanEmail = String(email ?? "").trim().toLowerCase();
  const cleanMessage = String(message ?? "").trim();
  if (cleanName.length < 2 || !/^\S+@\S+\.\S+$/.test(cleanEmail) || cleanMessage.length < 10 || cleanMessage.length > 5000) return NextResponse.json({ error: "Enter a valid name, email, and message" }, { status: 400 });
  const data = await db.contactMessage.create({ data: { name: cleanName, email: cleanEmail, message: cleanMessage } });
  return NextResponse.json({ success: true, id: data.id }, { status: 201 });
}
