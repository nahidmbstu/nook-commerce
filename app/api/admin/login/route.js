import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { adminCookie, createSession } from "@/lib/admin-auth";

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    if (!supabaseAdmin || !process.env.ADMIN_SESSION_SECRET) return NextResponse.json({ error: "Admin authentication is not configured." }, { status: 503 });

    const { data, error } = await supabaseAdmin.rpc("verify_admin_password", { login_email: email, login_password: password });
    if (error) {
      console.error("Admin password verification RPC failed:", error.message);
      return NextResponse.json({ error: "Admin verification is unavailable." }, { status: 503 });
    }
    console.log("Admin password verification completed:", { resultType: typeof data, verified: data === true || data === "true" });
    if (!(data === true || data === "true")) return NextResponse.json({ error: "Invalid admin credentials." }, { status: 401 });

    const response = NextResponse.json({ success: true });
    response.cookies.set(adminCookie.name, createSession(email), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: adminCookie.maxAge, path: "/" });
    return response;
  } catch {
    return NextResponse.json({ error: "Invalid login request." }, { status: 400 });
  }
}
