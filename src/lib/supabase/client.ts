import { useSession } from "@clerk/nextjs";
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "~/types/database.types";
import { env } from "../../env";

export function useSupabaseClient() {
  const { session } = useSession();

  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      async accessToken() {
        return session?.getToken() ?? null;
      },
    },
  );
}
