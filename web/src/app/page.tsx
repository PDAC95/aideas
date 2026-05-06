import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Middleware handles routing: auth → /dashboard, unauth → static landing
  // This is a fallback in case middleware doesn't intercept
  if (user) {
    redirect("/dashboard");
  }

  redirect("/landing/index.html");
}
