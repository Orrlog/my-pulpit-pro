"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateProfileName(formData: FormData) {
  const fullName = String(formData.get("fullName") ?? "").trim() || null;
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You must be signed in to update your profile.");
  }

  const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("id", user.id);

  if (error) {
    throw new Error("Your profile could not be saved. Please try again.");
  }

  revalidatePath("/settings");
}
