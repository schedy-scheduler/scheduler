import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export interface RegisterData {
  name: string;
  storeName: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const authService = {
  async register(data: RegisterData) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        return { error: authError.message };
      }

      if (!authData.user) {
        return { error: "Erro ao criar usuário" };
      }

      // Sign in to establish session
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (loginError) {
        return { error: loginError.message };
      }

      // Create store for the user
      const storePrefix = uuidv4();
      const { error: storeError } = await supabase.from("stores").insert({
        owner_id: authData.user.id,
        name: data.storeName,
        email: data.email,
        phone: "",
        prefix: storePrefix,
        slug: storePrefix,
      });

      if (storeError) {
        return { error: storeError.message };
      }

      return { data: authData.user };
    } catch (error) {
      return { error: String(error) };
    }
  },

  async login(data: LoginData) {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        return { error: error.message };
      }

      return { data: authData };
    } catch (error) {
      return { error: String(error) };
    }
  },

  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { error: error.message };
      }
      return { data: null };
    } catch (error) {
      return { error: String(error) };
    }
  },

  async getCurrentUser() {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        return { error: error.message };
      }

      return { data: user };
    } catch (error) {
      return { error: String(error) };
    }
  },

  async getSession() {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        return { error: error.message };
      }

      return { data: session };
    } catch (error) {
      return { error: String(error) };
    }
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });

    return subscription;
  },
};
