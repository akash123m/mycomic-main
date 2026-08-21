import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET ?? "change-me");
const COOKIE_NAME = "mycomic_session_v2";

export type SessionPayload = {
  id: string;
  email: string;
  name: string;
  role: "READER" | "AUTHOR" | "ADMIN";
};

export const hashPassword = (password: string) => bcrypt.hash(password, 12);
export const comparePassword = (password: string, hash: string) => bcrypt.compare(password, hash);

export async function createToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(SECRET_KEY);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function setSession(payload: SessionPayload) {
  const store = await cookies();
  store.set(COOKIE_NAME, await createToken(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
  store.delete("mycomic_session");
}

export async function getSession() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload) return null;
  const user = await db.user.findUnique({ where: { id: payload.id }, select: { id: true, email: true, name: true, role: true, isSuspended: true } });
  if (!user || user.isSuspended) return null;
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

export async function getAdminSession() {
  const session = await getSession();
  return session?.role === "ADMIN" ? session : null;
}

export async function getReaderSession() {
  const session = await getSession();
  return session?.role === "READER" ? session : null;
}

export async function getContentSession() {
  const session = await getSession();
  return session?.role === "ADMIN" || session?.role === "AUTHOR" ? session : null;
}

export async function canManageComic(userId: string, role: SessionPayload["role"], comicId: string) {
  if (role === "ADMIN") return true;
  if (role !== "AUTHOR") return false;
  return Boolean(await db.comic.findFirst({ where: { id: comicId, submittedById: userId }, select: { id: true } }));
}

// Backwards-compatible aliases used by the existing admin routes.
export const setAdminSession = setSession;
export const clearAdminSession = clearSession;
