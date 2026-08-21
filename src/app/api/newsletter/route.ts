import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const { email, source = "website" } = await request.json();
  const cleanEmail = String(email ?? "").trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
  const existing = await db.newsletterSubscriber.findUnique({ where: { email: cleanEmail } });
  await db.newsletterSubscriber.upsert({ where: { email: cleanEmail }, create: { email: cleanEmail, source: String(source).slice(0, 50) }, update: { status: "ACTIVE", source: String(source).slice(0, 50) } });
  return NextResponse.json({ success: true, reactivated: existing?.status === "UNSUBSCRIBED", alreadySubscribed: existing?.status === "ACTIVE" });
}
