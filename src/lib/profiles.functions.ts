import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("id, email, full_name, phone, position")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

export const getAllProfilesAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: isAdmin, error: rErr } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (rErr) throw new Error(rErr.message);
    if (!isAdmin) throw new Error("Forbidden");
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("id, email, full_name, phone, position, created_at")
      .order("created_at");
    if (error) throw new Error(error.message);
    return data;
  });