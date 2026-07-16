import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateDevelopMessage } from "@/lib/message-generation/develop-server";
import { developMessageGenerationInputSchema } from "@/lib/message-generation/develop-types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return NextResponse.json({ error: "Please sign in to create a message." }, { status: 401 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Please send message details." }, { status: 400 }); }
  const parsed = developMessageGenerationInputSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Please complete the Develop My Message details before creating this message." }, { status: 400 });
  try {
    const result = await generateDevelopMessage(parsed.data);
    return NextResponse.json(result, { status: 200 });
  } catch (routeError) {
    console.error("Develop generation failed", { name: routeError instanceof Error ? routeError.name : "Unknown" });
    return NextResponse.json({ error: "This message could not be created right now. Please try again." }, { status: 500 });
  }
}
