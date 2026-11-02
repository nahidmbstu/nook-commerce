import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { adminCookie, createSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(request) {
  let email, password;
  try {
    ({ email, password } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid login request." }, { status: 400 });
  }

  if (!email || !password) return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  if (!supabaseAdmin || !process.env.ADMIN_SESSION_SECRET) return NextResponse.json({ error: "Admin authentication is not configured." }, { status: 503 });

  let data, error;
  try {
    ({ data, error } = await supabaseAdmin.rpc("verify_admin_password", { login_email: email, login_password: password }));
  } catch (requestError) {
    console.error("Admin verification request failed:", requestError.message || requestError);
    return NextResponse.json({ error: "Admin verification is unavailable." }, { status: 503 });
  }

  if (error) {
    console.error("Admin password verification RPC failed:", error.message || error);
    return NextResponse.json({ error: "Admin verification is unavailable." }, { status: 503 });
  }

  if (!(data === true || data === "true")) return NextResponse.json({ error: "Invalid admin credentials." }, { status: 401 });

  const response = NextResponse.json({ success: true });
  response.cookies.set(adminCookie.name, createSession(email), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: adminCookie.maxAge, path: "/" });
  return response;
}
