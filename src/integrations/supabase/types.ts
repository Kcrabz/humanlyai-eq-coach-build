export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      achievements: {
        Row: {
          category: string | null
          created_at: string | null
          description: string
          icon: string
          id: string
          threshold: number | null
          title: string
          type: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description: string
          icon: string
          id?: string
          threshold?: number | null
          title: string
          type: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string
          icon?: string
          id?: string
          threshold?: number | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      chat_logs: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          token_count: number
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          token_count?: number
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          token_count?: number
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      eq_breakthroughs: {
        Row: {
          category: string
          detected_at: string | null
          id: string
          insight: string
          message: string
          message_id: string
          user_id: string
        }
        Insert: {
          category: string
          detected_at?: string | null
          id?: string
          insight: string
          message: string
          message_id: string
          user_id: string
        }
        Update: {
          category?: string
          detected_at?: string | null
          id?: string
          insight?: string
          message?: string
          message_id?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          coaching_mode: string | null
          created_at: string | null
          eq_archetype: string | null
          first_name: string | null
          id: string
          last_name: string | null
          name: string | null
          onboarded: boolean | null
          security_answer: string | null
          security_question_id: string | null
          subscription_tier: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          coaching_mode?: string | null
          created_at?: string | null
          eq_archetype?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          name?: string | null
          onboarded?: boolean | null
          security_answer?: string | null
          security_question_id?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          coaching_mode?: string | null
          created_at?: string | null
          eq_archetype?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          name?: string | null
          onboarded?: boolean | null
          security_answer?: string | null
          security_question_id?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_security_question_id_fkey"
            columns: ["security_question_id"]
            isOneToOne: false
            referencedRelation: "security_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      request_logs: {
        Row: {
          created_at: string
          email: string | null
          endpoint: string
          id: string
          ip_address: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          endpoint: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          endpoint?: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      security_questions: {
        Row: {
          created_at: string
          id: string
          question: string
        }
        Insert: {
          created_at?: string
          id?: string
          question: string
        }
        Update: {
          created_at?: string
          id?: string
          question?: string
        }
        Relationships: []
      }
      usage_logs: {
        Row: {
          created_at: string
          id: string
          month_year: string
          token_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          month_year: string
          token_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          month_year?: string
          token_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achieved: boolean
          achieved_at: string | null
          achievement_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          achieved?: boolean
          achieved_at?: string | null
          achievement_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          achieved?: boolean
          achieved_at?: string | null
          achievement_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_api_keys: {
        Row: {
          created_at: string | null
          id: string
          openai_api_key: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          openai_api_key?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          openai_api_key?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_streaks: {
        Row: {
          created_at: string | null
          current_streak: number
          id: string
          last_active_date: string | null
          longest_streak: number
          total_active_days: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_streak?: number
          id?: string
          last_active_date?: string | null
          longest_streak?: number
          total_active_days?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_streak?: number
          id?: string
          last_active_date?: string | null
          longest_streak?: number
          total_active_days?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
