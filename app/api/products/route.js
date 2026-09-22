import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const { data, error } = await supabase.from("products").select("id, title, description, price, image_url, is_available").eq("is_available", true).order("id");
  if (error) return NextResponse.json({ error: "Could not load products." }, { status: 500 });
  return NextResponse.json(data);
}
