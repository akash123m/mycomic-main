import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { comparePassword, setAdminSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const admin = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!admin || admin.role !== "ADMIN" || admin.isSuspended) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isValid = await comparePassword(password, admin.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    await setAdminSession({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: "ADMIN",
    });

    return NextResponse.json({
      success: true,
      user: { id: admin.id, email: admin.email, name: admin.name },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
