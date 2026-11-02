import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { seedProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!supabase) {
    return NextResponse.json(seedProducts, { headers: { "x-catalog-source": "seed" } });
  }

  const { data, error } = await supabase
    .from("products")
    .select("id, title, description, price, image_url, is_available")
    .eq("is_available", true)
    .order("id");

  if (error) {
    console.error("Product query failed:", error.message || error);
    return NextResponse.json(seedProducts, { headers: { "x-catalog-source": "seed-fallback" } });
  }

  if (!data || data.length === 0) {
    console.warn("Product table returned no rows; serving the local seed catalog.");
    return NextResponse.json(seedProducts, { headers: { "x-catalog-source": "seed-empty" } });
  }

  return NextResponse.json(data, { headers: { "x-catalog-source": "database" } });
}
