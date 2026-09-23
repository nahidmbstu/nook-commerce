import { NextResponse } from "next/server";
import { getAdminEmail } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

export async function GET() {
  if (!(await getAdminEmail())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (!supabaseAdmin) return NextResponse.json({ error: "Admin database is not configured." }, { status: 503 });
  const { data, error } = await supabaseAdmin.from("orders").select("id, customer_name, phone_number, address, cart_items, total_price, payment_method, status, created_at").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "Could not load orders." }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(request) {
  if (!(await getAdminEmail())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (!supabaseAdmin) return NextResponse.json({ error: "Admin database is not configured." }, { status: 503 });
  const { id, status } = await request.json();
  if (!id || !STATUSES.includes(status)) return NextResponse.json({ error: "Invalid order status." }, { status: 400 });
  const { error } = await supabaseAdmin.from("orders").update({ status }).eq("id", id);
  if (error) return NextResponse.json({ error: "Could not update order status." }, { status: 500 });
  return NextResponse.json({ success: true });
}
