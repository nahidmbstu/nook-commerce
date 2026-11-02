import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Lightweight status endpoint: confirms the app boots and whether the catalog
// database can actually be reached. Safe to call from uptime monitors.
export async function GET() {
  const checks = {
    app: "ok",
    database: { configured: Boolean(supabase), reachable: false },
    catalogSource: "seed"
  };

  if (!supabase) {
    return NextResponse.json({ status: "degraded", ...checks, hint: "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are missing." }, { status: 503 });
  }

  try {
    const { data, error } = await supabase.from("products").select("id").limit(1);
    if (error) throw error;
    checks.database.reachable = true;
    checks.catalogSource = data && data.length ? "database" : "seed";
  } catch (error) {
    console.error("Health check database probe failed:", error?.message || error);
    return NextResponse.json({ status: "degraded", ...checks, hint: "The Supabase project is unreachable. Check the project status and NEXT_PUBLIC_SUPABASE_URL." }, { status: 503 });
  }

  return NextResponse.json({ status: "ok", ...checks });
}
