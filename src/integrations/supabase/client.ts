import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

type SupabaseErrorLike = { message: string };

function notConfiguredError(): SupabaseErrorLike {
  return {
    message:
      "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your environment to enable database-backed features.",
  };
}

// Minimal chainable stub so the app can run without Supabase configured.
function createSupabaseStub() {
  const error = notConfiguredError();

  const builder = {
    select: () => builder,
    eq: () => builder,
    order: () => builder,
    maybeSingle: async () => ({ data: null as any, error }),
    single: async () => ({ data: null as any, error }),
    update: () => builder,
    insert: () => builder,
    delete: () => builder,
    upsert: () => builder,
    then: undefined as any,
  };

  return {
    auth: {
      getUser: async () => ({ data: { user: null as any }, error }),
      signInWithPassword: async () => ({ data: null as any, error }),
      signUp: async () => ({ data: null as any, error }),
      signOut: async () => ({ error }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => undefined } } }),
    },
    from: () => builder,
    rpc: async () => ({ data: null as any, error }),
  } as any;
}

export const supabase =
  SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY
    ? createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
        auth: {
          storage: localStorage,
          persistSession: true,
          autoRefreshToken: true,
        },
      })
    : createSupabaseStub();