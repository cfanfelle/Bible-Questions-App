import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wlimfybiamsdyrpfrbwc.supabase.co";
const supabasePublishableKey =
  "sb_publishable_gOZVWMYljU1AoNPeTwXaZQ_gAuRmG_j";

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
