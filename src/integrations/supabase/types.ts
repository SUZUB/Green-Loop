export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      pickup_transactions: {
        Row: {
          created_at: string
          id: string
          picker_id: string
          plastic_type: string | null
          points_earned: number
          recycler_id: string | null
          scan_id: string | null
          weight_kg: number
        }
        Insert: {
          created_at?: string
          id?: string
          picker_id: string
          plastic_type?: string | null
          points_earned?: number
          recycler_id?: string | null
          scan_id?: string | null
          weight_kg?: number
        }
        Update: {
          created_at?: string
          id?: string
          picker_id?: string
          plastic_type?: string | null
          points_earned?: number
          recycler_id?: string | null
          scan_id?: string | null
          weight_kg?: number
        }
        Relationships: []
      }
      item_types: {
        Row: {
          id: string
          item_name: string
          item_category: string
          display_label: string
          credits_per_unit: number
          unit_type: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          item_name: string
          item_category: string
          display_label: string
          credits_per_unit?: number
          unit_type?: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          item_name?: string
          item_category?: string
          display_label?: string
          credits_per_unit?: number
          unit_type?: string
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      transaction_items: {
        Row: {
          id: string
          transaction_id: string
          item_type_id: string | null
          item_name: string
          quantity: number
          weight_kg: number
          credits_per_unit: number
          credits_earned: number
          item_condition: string
          is_rejected: boolean
          rejection_reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          transaction_id: string
          item_type_id?: string | null
          item_name: string
          quantity?: number
          weight_kg?: number
          credits_per_unit?: number
          credits_earned?: number
          item_condition?: string
          is_rejected?: boolean
          rejection_reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          transaction_id?: string
          item_type_id?: string | null
          item_name?: string
          quantity?: number
          weight_kg?: number
          credits_per_unit?: number
          credits_earned?: number
          item_condition?: string
          is_rejected?: boolean
          rejection_reason?: string | null
          created_at?: string
        }
        Relationships: []
      }
      credit_history: {
        Row: {
          id: string
          recycler_id: string
          transaction_id: string | null
          credit_type: string
          amount: number
          balance_before: number
          balance_after: number
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          recycler_id: string
          transaction_id?: string | null
          credit_type?: string
          amount: number
          balance_before: number
          balance_after: number
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          recycler_id?: string
          transaction_id?: string | null
          credit_type?: string
          amount?: number
          balance_before?: number
          balance_after?: number
          description?: string | null
          created_at?: string
        }
        Relationships: []
      }
      qr_code_scans: {
        Row: {
          id: string
          qr_code: string
          recycler_id: string | null
          picker_id: string | null
          scan_status: string
          error_message: string | null
          scan_timestamp: string
        }
        Insert: {
          id?: string
          qr_code: string
          recycler_id?: string | null
          picker_id?: string | null
          scan_status?: string
          error_message?: string | null
          scan_timestamp?: string
        }
        Update: {
          id?: string
          qr_code?: string
          recycler_id?: string | null
          picker_id?: string | null
          scan_status?: string
          error_message?: string | null
          scan_timestamp?: string
        }
        Relationships: []
      }
      camera_logs: {
        Row: {
          id: string
          camera_type: string
          picker_id: string | null
          action_type: string
          items_detected: Json | null
          scan_result: string | null
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          camera_type: string
          picker_id?: string | null
          action_type: string
          items_detected?: Json | null
          scan_result?: string | null
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          camera_type?: string
          picker_id?: string | null
          action_type?: string
          items_detected?: Json | null
          scan_result?: string | null
          error_message?: string | null
          created_at?: string
        }
        Relationships: []
      }
      pickups: {
        Row: {
          id: string
          recycler_id: string
          picker_id: string | null
          lat: number
          lng: number
          address: string
          weight_kg: number
          status: "AVAILABLE" | "ASSIGNED" | "COMPLETED"
          notes: string | null
          verification_token: string | null
          reward_points: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          recycler_id: string
          picker_id?: string | null
          lat: number
          lng: number
          address?: string
          weight_kg?: number
          status?: "AVAILABLE" | "ASSIGNED" | "COMPLETED"
          notes?: string | null
          verification_token?: string | null
          reward_points?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          recycler_id?: string
          picker_id?: string | null
          lat?: number
          lng?: number
          address?: string
          weight_kg?: number
          status?: "AVAILABLE" | "ASSIGNED" | "COMPLETED"
          notes?: string | null
          verification_token?: string | null
          reward_points?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          coin_balance: number
          consecutive_weeks: number
          created_at: string
          full_name: string
          id: string
          lat: number | null
          lng: number | null
          referral_count: number
          role: string
          total_pickups: number
          total_points: number
          total_recycled_kg: number
          updated_at: string
          phone_number: string | null
          address: string | null
          city: string | null
          state: string | null
          postal_code: string | null
          picker_code: string | null
          is_active: boolean
          last_login: string | null
        }
        Insert: {
          avatar_url?: string | null
          coin_balance?: number
          consecutive_weeks?: number
          created_at?: string
          full_name?: string
          id: string
          lat?: number | null
          lng?: number | null
          referral_count?: number
          role?: string
          total_pickups?: number
          total_points?: number
          total_recycled_kg?: number
          updated_at?: string
          phone_number?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          picker_code?: string | null
          is_active?: boolean
          last_login?: string | null
        }
        Update: {
          avatar_url?: string | null
          coin_balance?: number
          consecutive_weeks?: number
          created_at?: string
          full_name?: string
          id?: string
          lat?: number | null
          lng?: number | null
          referral_count?: number
          role?: string
          total_pickups?: number
          total_points?: number
          total_recycled_kg?: number
          updated_at?: string
          phone_number?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          picker_code?: string | null
          is_active?: boolean
          last_login?: string | null
        }
        Relationships: []
      }
      recycling_pickups: {
        Row: {
          created_at: string
          id: string
          pickup_date: string
          points_earned: number
          status: string
          user_id: string
          weight_kg: number
        }
        Insert: {
          created_at?: string
          id?: string
          pickup_date?: string
          points_earned?: number
          status?: string
          user_id: string
          weight_kg?: number
        }
        Update: {
          created_at?: string
          id?: string
          pickup_date?: string
          points_earned?: number
          status?: string
          user_id?: string
          weight_kg?: number
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_desc: string
          badge_icon: string
          badge_key: string
          badge_name: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_desc: string
          badge_icon: string
          badge_key: string
          badge_name: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_desc?: string
          badge_icon?: string
          badge_key?: string
          badge_name?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      complete_pickup_transaction: {
        Args: {
          p_picker_id: string
          p_recycler_id: string
          p_weight_kg: number
        }
        Returns: Json
      }
      process_scan_payment: {
        Args: {
          p_scan_id: string
          p_recycler_id: string
          p_plastic_type: string
          p_weight_kg: number
          p_coins_earned: number
          p_scan_metadata?: Json
        }
        Returns: Json
      }
      log_qr_scan: {
        Args: {
          p_qr_code: string
          p_recycler_id: string
          p_scan_status?: string
          p_error?: string
        }
        Returns: void
      }
      record_pickup: {
        Args: {
          p_picker_id: string
          p_recycler_id: string
          p_weight_kg: number
        }
        Returns: Json
      }
      accept_pickup: {
        Args: { p_pickup_id: string }
        Returns: {
          id: string
          recycler_id: string
          picker_id: string | null
          lat: number
          lng: number
          address: string
          weight_kg: number
          status: "AVAILABLE" | "ASSIGNED" | "COMPLETED"
          notes: string | null
          verification_token: string | null
          reward_points: number
          created_at: string
          updated_at: string
        }
      }
      complete_pickup: {
        Args: { p_pickup_id: string }
        Returns: {
          id: string
          recycler_id: string
          picker_id: string | null
          lat: number
          lng: number
          address: string
          weight_kg: number
          status: "AVAILABLE" | "ASSIGNED" | "COMPLETED"
          notes: string | null
          verification_token: string | null
          reward_points: number
          created_at: string
          updated_at: string
        }
      }
      generate_pickup_token: {
        Args: { p_pickup_id: string }
        Returns: string
      }
      verify_pickup_token: {
        Args: { p_token: string }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
