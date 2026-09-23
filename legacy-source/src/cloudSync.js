import { isSupabaseConfigured, supabase } from "./supabaseClient.js";

const CLOUD_TABLE = "user_notebooks";

export function isCloudSyncConfigured() {
  return isSupabaseConfigured && Boolean(supabase);
}

export async function getCurrentSession() {
  if (!supabase) {
    return { data: { session: null }, error: null };
  }

  return supabase.auth.getSession();
}

export function onAuthStateChange(callback) {
  if (!supabase) {
    return {
      data: {
        subscription: {
          unsubscribe() {},
        },
      },
    };
  }

  return supabase.auth.onAuthStateChange(callback);
}

export async function signInWithPassword(email, password) {
  return supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export async function signUpWithPassword(email, password) {
  return supabase.auth.signUp({
    email,
    password,
  });
}

export async function requestPasswordReset(email, redirectTo) {
  if (!supabase) {
    return { data: null, error: new Error("Supabase ist nicht konfiguriert.") };
  }

  return supabase.auth.resetPasswordForEmail(email, redirectTo ? { redirectTo } : undefined);
}

export async function updateCloudPassword(password) {
  if (!supabase) {
    return { data: null, error: new Error("Supabase ist nicht konfiguriert.") };
  }

  return supabase.auth.updateUser({ password });
}

export async function signOutFromCloud(scope = "local") {
  if (!supabase) {
    return { error: null };
  }

  return supabase.auth.signOut({ scope });
}

export async function fetchCloudNotebook(userId) {
  const { data, error } = await supabase
    .from(CLOUD_TABLE)
    .select("data, updated_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data
    ? {
        data: data.data,
        updatedAt: data.updated_at,
      }
    : null;
}

export async function saveCloudNotebook(userId, appData, updatedAt) {
  const payload = {
    user_id: userId,
    data: appData,
    updated_at: updatedAt,
  };

  const { error } = await supabase.from(CLOUD_TABLE).upsert(payload, {
    onConflict: "user_id",
  });

  if (error) {
    throw error;
  }

  return payload;
}

export function subscribeToCloudNotebook(userId, onChange) {
  if (!supabase) {
    return () => {};
  }

  const channel = supabase
    .channel(`user-notebook-${userId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: CLOUD_TABLE,
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onChange(payload.new ?? null);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
