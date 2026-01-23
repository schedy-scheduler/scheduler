import { useEffect, useState } from "react";
import { authService } from "@/services/authService";
import { storeService } from "@/services/storeService";
import type { User } from "@supabase/supabase-js";

export interface Store {
  id: string;
  owner_id: string;
  name: string;
  email?: string;
  phone?: string;
  image_url?: string;
  prefix?: string;
  slug?: string;
  opening_hours?: string;
  closing_hours?: string;
  onboarding_completed?: boolean;
}

export interface AuthUser extends User {
  name?: string;
  store?: Store;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    authService.getSession().then((result) => {
      if (result.data?.user) {
        loadUserWithStore(result.data.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const subscription = authService.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUserWithStore(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const loadUserWithStore = async (authUser: User) => {
    try {
      // Get store data
      const storeResult = await storeService.getByOwnerId(authUser.id);

      const authUserWithStore: AuthUser = {
        ...authUser,
        name: authUser.user_metadata?.name || authUser.email?.split("@")[0],
        store: storeResult.data || undefined,
      };

      setUser(authUserWithStore);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
      setUser({
        ...authUser,
        name: authUser.user_metadata?.name || authUser.email?.split("@")[0],
      });
      setLoading(false);
    }
  };

  return { user, loading };
};
