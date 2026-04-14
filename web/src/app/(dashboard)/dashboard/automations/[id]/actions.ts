"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateAutomationStatus(
  automationId: string,
  newStatus: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("automations")
    .update({ status: newStatus })
    .eq("id", automationId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/automations");
  revalidatePath(`/dashboard/automations/${automationId}`);
  return { success: true };
}
