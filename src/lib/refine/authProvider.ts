import type { AuthProvider } from "@refinedev/core";
import { getSupabase } from "../supabaseClient";

/**
 * Refine auth provider that integrates with Supabase Auth
 * This works alongside our existing useAuth store
 */
export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        error: {
          message: error.message,
          name: "LoginError",
        },
      };
    }

    if (data?.user) {
      return {
        success: true,
        redirectTo: "/crm",
      };
    }

    return {
      success: false,
      error: {
        message: "Login failed",
        name: "LoginError",
      },
    };
  },

  logout: async () => {
    const supabase = getSupabase();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        success: false,
        error: {
          message: error.message,
          name: "LogoutError",
        },
      };
    }

    return {
      success: true,
      redirectTo: "/",
    };
  },

  check: async () => {
    const supabase = getSupabase();
    const { data } = await supabase.auth.getSession();
    const { session } = data;

    if (!session) {
      return {
        authenticated: false,
        redirectTo: "/",
        logout: true,
      };
    }

    return {
      authenticated: true,
    };
  },

  getPermissions: async () => {
    const supabase = getSupabase();
    const { data } = await supabase.auth.getUser();
    const user = data.user;

    if (user) {
      // Fetch user role from database
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      return userData?.role || null;
    }

    return null;
  },

  getIdentity: async () => {
    const supabase = getSupabase();
    const { data } = await supabase.auth.getUser();
    const user = data.user;

    if (user) {
      return {
        id: user.id,
        name: user.user_metadata?.name || user.email,
        email: user.email,
        avatar: user.user_metadata?.avatar_url,
      };
    }

    return null;
  },

  onError: async (error) => {
    if (error.statusCode === 401 || error.statusCode === 403) {
      return {
        logout: true,
        redirectTo: "/",
        error,
      };
    }

    return { error };
  },
};
