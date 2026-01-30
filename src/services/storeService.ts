import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

export interface Store {
  name: string;
  email: string;
  phone: string;
}

export type Employee = Database["public"]["Tables"]["employees"]["Row"];
export type Service = Database["public"]["Tables"]["services"]["Row"];

export const storeService = {
  async getStoreBySlug(slug: string): Promise<Store | null> {
    try {
      const { data, error } = await supabase
        .from("stores")
        .select("name, email, phone")
        .eq("slug", slug)
        .single();

      if (error) {
        console.error("Error fetching store:", error);
        return null;
      }

      return data;
    } catch (err) {
      console.error("Error fetching store:", err);
      return null;
    }
  },

  async getStoreIdBySlug(slug: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from("stores")
        .select("id")
        .eq("slug", slug)
        .single();

      if (error) {
        console.error("Error fetching store id:", error);
        return null;
      }

      return data.id;
    } catch (err) {
      console.error("Error fetching store id:", err);
      return null;
    }
  },

  async getEmployeesByStoreId(storeId: string): Promise<Employee[]> {
    try {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("store_id", storeId)
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching employees:", error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error("Error fetching employees:", err);
      return [];
    }
  },

  async getServicesByStoreId(storeId: string): Promise<Service[]> {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("store_id", storeId)
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching services:", error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error("Error fetching services:", err);
      return [];
    }
  },
};
