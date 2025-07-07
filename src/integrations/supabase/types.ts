export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          changed_fields: string[] | null
          created_at: string
          dealership_id: string
          id: number
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          changed_fields?: string[] | null
          created_at?: string
          dealership_id: string
          id?: number
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          changed_fields?: string[] | null
          created_at?: string
          dealership_id?: string
          id?: number
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_dealership_id_fkey"
            columns: ["dealership_id"]
            isOneToOne: false
            referencedRelation: "dealerships"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          dealership_id: string
          dealership_name: string
          email: string | null
          first_name: string
          id: string
          last_name: string
          notes: string | null
          phone: string | null
          state: string | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          dealership_id: string
          dealership_name: string
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          dealership_id?: string
          dealership_name?: string
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_customers_dealership"
            columns: ["dealership_id"]
            isOneToOne: false
            referencedRelation: "dealerships"
            referencedColumns: ["id"]
          },
        ]
      }
      dealerships: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          email: string | null
          id: string
          license_number: string | null
          name: string
          phone: string | null
          settings: Json | null
          state: string | null
          updated_at: string
          website: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          license_number?: string | null
          name: string
          phone?: string | null
          settings?: Json | null
          state?: string | null
          updated_at?: string
          website?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          license_number?: string | null
          name?: string
          phone?: string | null
          settings?: Json | null
          state?: string | null
          updated_at?: string
          website?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount_due: number | null
          amount_paid: number | null
          created_at: string
          created_by: string | null
          customer_id: string
          dealership_id: string
          due_date: string | null
          id: string
          invoice_number: string
          invoice_type: string
          issued_at: string | null
          line_items: Json | null
          notes: string | null
          service_job_id: string | null
          status: string | null
          subtotal: number
          tax_amount: number | null
          tax_rate: number | null
          terms: string | null
          total_amount: number
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          amount_due?: number | null
          amount_paid?: number | null
          created_at?: string
          created_by?: string | null
          customer_id: string
          dealership_id: string
          due_date?: string | null
          id?: string
          invoice_number: string
          invoice_type: string
          issued_at?: string | null
          line_items?: Json | null
          notes?: string | null
          service_job_id?: string | null
          status?: string | null
          subtotal?: number
          tax_amount?: number | null
          tax_rate?: number | null
          terms?: string | null
          total_amount?: number
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          amount_due?: number | null
          amount_paid?: number | null
          created_at?: string
          created_by?: string | null
          customer_id?: string
          dealership_id?: string
          due_date?: string | null
          id?: string
          invoice_number?: string
          invoice_type?: string
          issued_at?: string | null
          line_items?: Json | null
          notes?: string | null
          service_job_id?: string | null
          status?: string | null
          subtotal?: number
          tax_amount?: number | null
          tax_rate?: number | null
          terms?: string | null
          total_amount?: number
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_dealership_id_fkey"
            columns: ["dealership_id"]
            isOneToOne: false
            referencedRelation: "dealerships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_service_job_id_fkey"
            columns: ["service_job_id"]
            isOneToOne: false
            referencedRelation: "service_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_to: string | null
          created_at: string
          customer_id: string | null
          dealership_id: string
          dealership_name: string
          estimated_value: number | null
          id: string
          next_follow_up: string | null
          notes: string | null
          priority: string
          source: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          customer_id?: string | null
          dealership_id: string
          dealership_name: string
          estimated_value?: number | null
          id?: string
          next_follow_up?: string | null
          notes?: string | null
          priority?: string
          source?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          customer_id?: string | null
          dealership_id?: string
          dealership_name?: string
          estimated_value?: number | null
          id?: string
          next_follow_up?: string | null
          notes?: string | null
          priority?: string
          source?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_leads_dealership"
            columns: ["dealership_id"]
            isOneToOne: false
            referencedRelation: "dealerships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          channel: string
          created_at: string
          dealership_id: string
          id: string
          is_read: boolean | null
          message: string
          read_at: string | null
          reference_id: string | null
          reference_type: string | null
          sent_at: string | null
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          channel: string
          created_at?: string
          dealership_id: string
          id?: string
          is_read?: boolean | null
          message: string
          read_at?: string | null
          reference_id?: string | null
          reference_type?: string | null
          sent_at?: string | null
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          channel?: string
          created_at?: string
          dealership_id?: string
          id?: string
          is_read?: boolean | null
          message?: string
          read_at?: string | null
          reference_id?: string | null
          reference_type?: string | null
          sent_at?: string | null
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_dealership_id_fkey"
            columns: ["dealership_id"]
            isOneToOne: false
            referencedRelation: "dealerships"
            referencedColumns: ["id"]
          },
        ]
      }
      parts: {
        Row: {
          bin_location: string | null
          brand: string | null
          category: string | null
          created_at: string
          created_by: string | null
          dealership_id: string
          description: string | null
          id: string
          name: string
          part_number: string
          quantity: number
          reorder_threshold: number | null
          sale_price: number | null
          supplier_name: string | null
          supplier_part_number: string | null
          unit_cost: number | null
          updated_at: string
        }
        Insert: {
          bin_location?: string | null
          brand?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          dealership_id: string
          description?: string | null
          id?: string
          name: string
          part_number: string
          quantity?: number
          reorder_threshold?: number | null
          sale_price?: number | null
          supplier_name?: string | null
          supplier_part_number?: string | null
          unit_cost?: number | null
          updated_at?: string
        }
        Update: {
          bin_location?: string | null
          brand?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          dealership_id?: string
          description?: string | null
          id?: string
          name?: string
          part_number?: string
          quantity?: number
          reorder_threshold?: number | null
          sale_price?: number | null
          supplier_name?: string | null
          supplier_part_number?: string | null
          unit_cost?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "parts_dealership_id_fkey"
            columns: ["dealership_id"]
            isOneToOne: false
            referencedRelation: "dealerships"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          dealership_id: string
          id: string
          invoice_id: string
          notes: string | null
          payment_date: string
          payment_method: string
          payment_number: string
          processed_by: string | null
          reference_number: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          dealership_id: string
          id?: string
          invoice_id: string
          notes?: string | null
          payment_date?: string
          payment_method: string
          payment_number: string
          processed_by?: string | null
          reference_number?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          dealership_id?: string
          id?: string
          invoice_id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string
          payment_number?: string
          processed_by?: string | null
          reference_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_dealership_id_fkey"
            columns: ["dealership_id"]
            isOneToOne: false
            referencedRelation: "dealerships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          dealership_id: string
          dealership_name: string
          email: string
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          role_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          dealership_id: string
          dealership_name: string
          email: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          role_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          dealership_id?: string
          dealership_name?: string
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          role_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_dealership"
            columns: ["dealership_id"]
            isOneToOne: false
            referencedRelation: "dealerships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_profiles_role"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          created_by: string | null
          dealership_id: string
          delivery_emails: string[] | null
          delivery_method: string | null
          description: string | null
          id: string
          is_public: boolean | null
          last_run_at: string | null
          name: string
          next_run_at: string | null
          parameters: Json | null
          report_type: string
          schedule_cron: string | null
          schedule_enabled: boolean | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          dealership_id: string
          delivery_emails?: string[] | null
          delivery_method?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          last_run_at?: string | null
          name: string
          next_run_at?: string | null
          parameters?: Json | null
          report_type: string
          schedule_cron?: string | null
          schedule_enabled?: boolean | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          dealership_id?: string
          delivery_emails?: string[] | null
          delivery_method?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          last_run_at?: string | null
          name?: string
          next_run_at?: string | null
          parameters?: Json | null
          report_type?: string
          schedule_cron?: string | null
          schedule_enabled?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_dealership_id_fkey"
            columns: ["dealership_id"]
            isOneToOne: false
            referencedRelation: "dealerships"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          dealership_id: string
          id: string
          name: string
          permissions: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          dealership_id: string
          id?: string
          name: string
          permissions?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          dealership_id?: string
          id?: string
          name?: string
          permissions?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "roles_dealership_id_fkey"
            columns: ["dealership_id"]
            isOneToOne: false
            referencedRelation: "dealerships"
            referencedColumns: ["id"]
          },
        ]
      }
      service_jobs: {
        Row: {
          advisor_id: string | null
          complaint: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          customer_id: string
          dealership_id: string
          description: string | null
          id: string
          internal_notes: string | null
          job_number: string
          labor_hours: number | null
          labor_rate: number | null
          labor_total: number | null
          notes: string | null
          parts_total: number | null
          parts_used: Json | null
          photos: string[] | null
          priority: string | null
          scheduled_at: string | null
          service_type: string
          started_at: string | null
          status: string | null
          technician_id: string | null
          total_amount: number | null
          updated_at: string
          vehicle_id: string | null
          vehicle_info: Json | null
          work_performed: string | null
        }
        Insert: {
          advisor_id?: string | null
          complaint?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          customer_id: string
          dealership_id: string
          description?: string | null
          id?: string
          internal_notes?: string | null
          job_number: string
          labor_hours?: number | null
          labor_rate?: number | null
          labor_total?: number | null
          notes?: string | null
          parts_total?: number | null
          parts_used?: Json | null
          photos?: string[] | null
          priority?: string | null
          scheduled_at?: string | null
          service_type: string
          started_at?: string | null
          status?: string | null
          technician_id?: string | null
          total_amount?: number | null
          updated_at?: string
          vehicle_id?: string | null
          vehicle_info?: Json | null
          work_performed?: string | null
        }
        Update: {
          advisor_id?: string | null
          complaint?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string
          dealership_id?: string
          description?: string | null
          id?: string
          internal_notes?: string | null
          job_number?: string
          labor_hours?: number | null
          labor_rate?: number | null
          labor_total?: number | null
          notes?: string | null
          parts_total?: number | null
          parts_used?: Json | null
          photos?: string[] | null
          priority?: string | null
          scheduled_at?: string | null
          service_type?: string
          started_at?: string | null
          status?: string | null
          technician_id?: string | null
          total_amount?: number | null
          updated_at?: string
          vehicle_id?: string | null
          vehicle_info?: Json | null
          work_performed?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_jobs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_jobs_dealership_id_fkey"
            columns: ["dealership_id"]
            isOneToOne: false
            referencedRelation: "dealerships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_jobs_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          body_style: string | null
          condition: string | null
          created_at: string
          created_by: string | null
          date_acquired: string | null
          date_sold: string | null
          dealership_id: string
          drivetrain: string | null
          engine: string | null
          exterior_color: string | null
          features: string[] | null
          fuel_type: string | null
          id: string
          interior_color: string | null
          key_count: number | null
          location: string | null
          make: string | null
          mileage: number | null
          model: string | null
          notes: string | null
          photos: string[] | null
          purchase_price: number | null
          sale_price: number | null
          sold_to: string | null
          status: string | null
          transmission: string | null
          trim: string | null
          updated_at: string
          vin: string
          year: number | null
        }
        Insert: {
          body_style?: string | null
          condition?: string | null
          created_at?: string
          created_by?: string | null
          date_acquired?: string | null
          date_sold?: string | null
          dealership_id: string
          drivetrain?: string | null
          engine?: string | null
          exterior_color?: string | null
          features?: string[] | null
          fuel_type?: string | null
          id?: string
          interior_color?: string | null
          key_count?: number | null
          location?: string | null
          make?: string | null
          mileage?: number | null
          model?: string | null
          notes?: string | null
          photos?: string[] | null
          purchase_price?: number | null
          sale_price?: number | null
          sold_to?: string | null
          status?: string | null
          transmission?: string | null
          trim?: string | null
          updated_at?: string
          vin: string
          year?: number | null
        }
        Update: {
          body_style?: string | null
          condition?: string | null
          created_at?: string
          created_by?: string | null
          date_acquired?: string | null
          date_sold?: string | null
          dealership_id?: string
          drivetrain?: string | null
          engine?: string | null
          exterior_color?: string | null
          features?: string[] | null
          fuel_type?: string | null
          id?: string
          interior_color?: string | null
          key_count?: number | null
          location?: string | null
          make?: string | null
          mileage?: number | null
          model?: string | null
          notes?: string | null
          photos?: string[] | null
          purchase_price?: number | null
          sale_price?: number | null
          sold_to?: string | null
          status?: string | null
          transmission?: string | null
          trim?: string | null
          updated_at?: string
          vin?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_dealership_id_fkey"
            columns: ["dealership_id"]
            isOneToOne: false
            referencedRelation: "dealerships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_sold_to_fkey"
            columns: ["sold_to"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_default_roles: {
        Args: { dealership_uuid: string }
        Returns: undefined
      }
      create_notification: {
        Args: {
          dealership_uuid: string
          user_uuid: string
          title_text: string
          message_text: string
          notification_type?: string
          reference_type_text?: string
          reference_uuid?: string
        }
        Returns: string
      }
      generate_invoice_number: {
        Args: { dealership_uuid: string }
        Returns: string
      }
      generate_job_number: {
        Args: { dealership_uuid: string }
        Returns: string
      }
      generate_payment_number: {
        Args: { dealership_uuid: string }
        Returns: string
      }
      get_dashboard_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          dealership_id: string
          dealership_name: string
          total_sales: number
          total_revenue: number
          available_vehicles: number
          low_stock_parts: number
          active_service_jobs: number
          total_customers: number
          new_leads: number
        }[]
      }
      user_has_permission: {
        Args: { permission_name: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role:
        | "admin"
        | "sales_manager"
        | "sales_rep"
        | "technician"
        | "inventory_manager"
        | "accountant"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: [
        "admin",
        "sales_manager",
        "sales_rep",
        "technician",
        "inventory_manager",
        "accountant",
      ],
    },
  },
} as const
