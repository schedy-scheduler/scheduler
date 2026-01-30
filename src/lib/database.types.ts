export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.1";
  };
  public: {
    Tables: {
      customers: {
        Row: {
          created_at: string | null;
          email: string;
          id: string;
          name: string;
          phone: string;
          store_id: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          email: string;
          id?: string;
          name: string;
          phone: string;
          store_id: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          email?: string;
          id?: string;
          name?: string;
          phone?: string;
          store_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "customers_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "stores";
            referencedColumns: ["id"];
          },
        ];
      };
      employees: {
        Row: {
          created_at: string | null;
          email: string;
          function: string;
          id: string;
          name: string;
          store_id: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          email: string;
          function: string;
          id?: string;
          name: string;
          store_id: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          email?: string;
          function?: string;
          id?: string;
          name?: string;
          store_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "employees_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "stores";
            referencedColumns: ["id"];
          },
        ];
      };
      schedules: {
        Row: {
          created_at: string | null;
          customer_id: string;
          duration: string | null;
          employee_id: string;
          id: string;
          scheduled_date: string;
          scheduled_time: string;
          service_id: string;
          store_id: string;
          total: number | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          customer_id: string;
          duration?: string | null;
          employee_id: string;
          id?: string;
          scheduled_date: string;
          scheduled_time: string;
          service_id: string;
          store_id: string;
          total?: number | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          customer_id?: string;
          duration?: string | null;
          employee_id?: string;
          id?: string;
          scheduled_date?: string;
          scheduled_time?: string;
          service_id?: string;
          store_id?: string;
          total?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "schedules_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "schedules_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "schedules_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "schedules_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "stores";
            referencedColumns: ["id"];
          },
        ];
      };
      services: {
        Row: {
          created_at: string | null;
          duration: string;
          id: string;
          name: string;
          store_id: string;
          updated_at: string | null;
          value: number;
        };
        Insert: {
          created_at?: string | null;
          duration: string;
          id?: string;
          name: string;
          store_id: string;
          updated_at?: string | null;
          value: number;
        };
        Update: {
          created_at?: string | null;
          duration?: string;
          id?: string;
          name?: string;
          store_id?: string;
          updated_at?: string | null;
          value?: number;
        };
        Relationships: [
          {
            foreignKeyName: "services_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "stores";
            referencedColumns: ["id"];
          },
        ];
      };
      store_hours: {
        Row: {
          created_at: string | null;
          day_of_week: number;
          end_time: string | null;
          id: string;
          is_active: boolean | null;
          start_time: string | null;
          store_id: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          day_of_week: number;
          end_time?: string | null;
          id?: string;
          is_active?: boolean | null;
          start_time?: string | null;
          store_id: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          day_of_week?: number;
          end_time?: string | null;
          id?: string;
          is_active?: boolean | null;
          start_time?: string | null;
          store_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "store_hours_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "stores";
            referencedColumns: ["id"];
          },
        ];
      };
      stores: {
        Row: {
          created_at: string | null;
          email: string;
          id: string;
          name: string;
          owner_id: string;
          phone: string;
          slug: string;
          updated_at: string | null;
          image_url: string | null;
        };
        Insert: {
          created_at?: string | null;
          email: string;
          id?: string;
          name: string;
          owner_id: string;
          phone: string;
          slug: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          email?: string;
          id?: string;
          name?: string;
          owner_id?: string;
          phone?: string;
          slug?: string;
          updated_at?: string | null;
          image_url?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
