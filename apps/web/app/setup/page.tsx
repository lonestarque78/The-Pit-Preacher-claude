import { supabase } from "@/lib/supabase";

export default async function SetupPage() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Please log in</div>;
  }

  const { data: pits } = await supabase
    .from("pits")
    .select("*")
    .eq("user_id", user.id);

  if (!pits || pits.length === 0) {
    return (
      <div style={{ padding: 40 }}>
        <h1>Welcome to Pit Preacher</h1>
        <a href="/setup/pits">Set up your pits</a>
      </div>
    );
  }

  return (
    <div>
      <h1>Redirecting...</h1>
      <script dangerouslySetInnerHTML={{ __html: `window.location.href='/dashboard'` }} />
    </div>
  );
}
