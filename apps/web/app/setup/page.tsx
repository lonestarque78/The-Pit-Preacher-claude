import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";

export default async function SetupPage() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Please log in</div>;
  }

  const { data: pits } = await supabase
    .from("pits")
    .select("id")
    .eq("user_id", user.id);

  if (!pits || pits.length === 0) {
    redirect("/setup/pits");
  }

  redirect("/dashboard");
}
