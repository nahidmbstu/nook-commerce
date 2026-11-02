import { NextResponse } from "next/server";
import { getAdminEmail } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await getAdminEmail())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (!supabaseAdmin) return NextResponse.json({ error: "Admin database is not configured." }, { status: 503 });

  let data, error;
  try {
    ({ data, error } = await supabaseAdmin.from("orders").select("id, customer_name, phone_number, address, cart_items, total_price, payment_method, status, created_at").order("created_at", { ascending: false }));
  } catch (requestError) {
    console.error("Admin order list failed:", requestError.message || requestError);
    return NextResponse.json({ error: "Could not reach the orders database." }, { status: 503 });
  }

  if (error) {
    console.error("Admin order list failed:", error.message || error);
    return NextResponse.json({ error: "Could not load orders." }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function PATCH(request) {
  if (!(await getAdminEmail())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (!supabaseAdmin) return NextResponse.json({ error: "Admin database is not configured." }, { status: 503 });
  const { id, status } = await request.json();
  if (!id || !STATUSES.includes(status)) return NextResponse.json({ error: "Invalid order status." }, { status: 400 });

  let error;
  try {
    ({ error } = await supabaseAdmin.from("orders").update({ status }).eq("id", id));
  } catch (requestError) {
    console.error("Admin order update failed:", requestError.message || requestError);
    return NextResponse.json({ error: "Could not reach the orders database." }, { status: 503 });
  }

  if (error) {
    console.error("Admin order update failed:", error.message || error);
    return NextResponse.json({ error: "Could not update order status." }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
