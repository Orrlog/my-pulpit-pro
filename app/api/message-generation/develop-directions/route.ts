import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { developDirectionGenerationInputSchema } from "@/lib/message-generation/develop-directions-schema";
import { generateDevelopDirections } from "@/lib/message-generation/develop-directions-server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return NextResponse.json({ error: "Please sign in to explore Develop My Message directions." }, { status: 401 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Please send direction details." }, { status: 400 }); }
  const parsed = developDirectionGenerationInputSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Please complete the Develop My Message details before exploring directions." }, { status: 400 });
  try {
    return NextResponse.json(await generateDevelopDirections(parsed.data), { status: 200 });
  } catch (routeError) {
    console.error("Develop direction generation failed", { name: routeError instanceof Error ? routeError.name : "Unknown" });
    return NextResponse.json({ error: "Directions could not be created right now. Please try again." }, { status: 500 });
  }
}
