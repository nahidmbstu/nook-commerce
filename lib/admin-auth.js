import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "nook_admin_session";
const SESSION_TTL = 60 * 60 * 24 * 7;

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET;
}

function sign(value) {
  const secret = getSecret();
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not configured");
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function createSession(email) {
  const payload = `${email.toLowerCase()}|${Date.now()}`;
  return `${Buffer.from(payload).toString("base64url")}.${sign(payload)}`;
}

export function verifySession(value) {
  if (!value || !getSecret()) return null;
  const [encoded, signature] = value.split(".");
  if (!encoded || !signature) return null;

  try {
    const payload = Buffer.from(encoded, "base64url").toString("utf8");
    const expected = sign(payload);
    if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
    const separator = payload.lastIndexOf("|");
    const email = payload.slice(0, separator);
    const createdAt = Number(payload.slice(separator + 1));
    if (!email || !Number.isFinite(createdAt) || Date.now() - createdAt > SESSION_TTL * 1000) return null;
    return email;
  } catch {
    return null;
  }
}

export async function getAdminEmail() {
  const cookieStore = await cookies();
  return verifySession(cookieStore.get(COOKIE_NAME)?.value);
}

export const adminCookie = { name: COOKIE_NAME, maxAge: SESSION_TTL };
