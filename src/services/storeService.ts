import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

type Store = Database["public"]["Tables"]["stores"]["Row"];
type StoreInsert = Database["public"]["Tables"]["stores"]["Insert"];
type StoreUpdate = Database["public"]["Tables"]["stores"]["Update"];

export const storeService = {
  async getByOwnerId(ownerId: string) {
    try {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("owner_id", ownerId)
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data: data as Store };
    } catch (error) {
      return { error: String(error) };
    }
  },

  async getById(id: string) {
    try {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data: data as Store };
    } catch (error) {
      return { error: String(error) };
    }
  },

  async create(store: StoreInsert) {
    try {
      const { data, error } = await supabase
        .from("stores")
        .insert(store)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data: data as Store };
    } catch (error) {
      return { error: String(error) };
    }
  },

  async update(id: string, store: StoreUpdate) {
    try {
      const { data, error } = await supabase
        .from("stores")
        .update(store)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data: data as Store };
    } catch (error) {
      return { error: String(error) };
    }
  },

  async delete(id: string) {
    try {
      const { error } = await supabase.from("stores").delete().eq("id", id);

      if (error) {
        return { error: error.message };
      }

      return { data: null };
    } catch (error) {
      return { error: String(error) };
    }
  },

  async checkSlugExists(slug: string) {
    try {
      const { data, error } = await supabase
        .from("stores")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

      if (error) {
        return { error: error.message };
      }

      return { data: !!data };
    } catch (error) {
      return { error: String(error) };
    }
  },

  async uploadStoreImage(storeId: string, file: File) {
    try {
      const fileName = `${storeId}/${Date.now()}-${file.name}`;

      const { data, error } = await supabase.storage
        .from("stores")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        return { error: error.message };
      }

      // Get public URL
      const { data: publicData } = supabase.storage
        .from("stores")
        .getPublicUrl(fileName);

      return { data: publicData.publicUrl };
    } catch (error) {
      return { error: String(error) };
    }
  },
};
