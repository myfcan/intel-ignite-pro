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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      claude_cache: {
        Row: {
          cache_key: string
          created_at: string | null
          hit_count: number | null
          id: string
          last_used: string | null
          prompt_hash: string
          response_text: string
        }
        Insert: {
          cache_key: string
          created_at?: string | null
          hit_count?: number | null
          id?: string
          last_used?: string | null
          prompt_hash: string
          response_text: string
        }
        Update: {
          cache_key?: string
          created_at?: string | null
          hit_count?: number | null
          id?: string
          last_used?: string | null
          prompt_hash?: string
          response_text?: string
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          achievement_id: string | null
          content: string
          created_at: string | null
          id: string
          likes_count: number | null
          user_id: string | null
        }
        Insert: {
          achievement_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          user_id?: string | null
        }
        Update: {
          achievement_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "user_achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          correct_answer: string | null
          created_at: string | null
          explanation: string | null
          id: string
          lesson_id: string | null
          options: Json | null
          order_index: number
          question: string
          type: Database["public"]["Enums"]["exercise_type"]
        }
        Insert: {
          correct_answer?: string | null
          created_at?: string | null
          explanation?: string | null
          id?: string
          lesson_id?: string | null
          options?: Json | null
          order_index: number
          question: string
          type: Database["public"]["Enums"]["exercise_type"]
        }
        Update: {
          correct_answer?: string | null
          created_at?: string | null
          explanation?: string | null
          id?: string
          lesson_id?: string | null
          options?: Json | null
          order_index?: number
          question?: string
          type?: Database["public"]["Enums"]["exercise_type"]
        }
        Relationships: [
          {
            foreignKeyName: "exercises_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content: Json
          created_at: string | null
          description: string | null
          difficulty_level:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          estimated_time: number | null
          id: string
          is_active: boolean | null
          lesson_type: string | null
          order_index: number
          passing_score: number | null
          title: string
          trail_id: string | null
        }
        Insert: {
          content?: Json
          created_at?: string | null
          description?: string | null
          difficulty_level?:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          estimated_time?: number | null
          id?: string
          is_active?: boolean | null
          lesson_type?: string | null
          order_index: number
          passing_score?: number | null
          title: string
          trail_id?: string | null
        }
        Update: {
          content?: Json
          created_at?: string | null
          description?: string | null
          difficulty_level?:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          estimated_time?: number | null
          id?: string
          is_active?: boolean | null
          lesson_type?: string | null
          order_index?: number
          passing_score?: number | null
          title?: string
          trail_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_trail_id_fkey"
            columns: ["trail_id"]
            isOneToOne: false
            referencedRelation: "trails"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_sessions: {
        Row: {
          converted: boolean | null
          created_at: string | null
          discount_code: string | null
          discount_percentage: number | null
          expires_at: string
          id: string
          selected_plan: string | null
          session_token: string
          user_id: string
          viewed_at: string | null
        }
        Insert: {
          converted?: boolean | null
          created_at?: string | null
          discount_code?: string | null
          discount_percentage?: number | null
          expires_at: string
          id?: string
          selected_plan?: string | null
          session_token: string
          user_id: string
          viewed_at?: string | null
        }
        Update: {
          converted?: boolean | null
          created_at?: string | null
          discount_code?: string | null
          discount_percentage?: number | null
          expires_at?: string
          id?: string
          selected_plan?: string | null
          session_token?: string
          user_id?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pricing_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_templates: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          prompt_text: string
          title: string
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          prompt_text: string
          title: string
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          prompt_text?: string
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saved_templates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      trails: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          order_index: number
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          order_index: number
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          order_index?: number
          title?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_name: string
          achievement_type: string
          earned_at: string | null
          id: string
          lesson_id: string | null
          points_earned: number | null
          user_id: string | null
        }
        Insert: {
          achievement_name: string
          achievement_type: string
          earned_at?: string | null
          id?: string
          lesson_id?: string | null
          points_earned?: number | null
          user_id?: string | null
        }
        Update: {
          achievement_name?: string
          achievement_type?: string
          earned_at?: string | null
          id?: string
          lesson_id?: string | null
          points_earned?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_onboarding_answers: {
        Row: {
          answer_value: string
          answered_at: string | null
          id: string
          question_id: string
          user_id: string
        }
        Insert: {
          answer_value: string
          answered_at?: string | null
          id?: string
          question_id: string
          user_id: string
        }
        Update: {
          answer_value?: string
          answered_at?: string | null
          id?: string
          question_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_onboarding_answers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_playground_sessions: {
        Row: {
          ai_feedback: string | null
          ai_response: string | null
          created_at: string | null
          id: string
          lesson_id: string
          tokens_used: number | null
          user_id: string
          user_prompt: string
        }
        Insert: {
          ai_feedback?: string | null
          ai_response?: string | null
          created_at?: string | null
          id?: string
          lesson_id: string
          tokens_used?: number | null
          user_id: string
          user_prompt: string
        }
        Update: {
          ai_feedback?: string | null
          ai_response?: string | null
          created_at?: string | null
          id?: string
          lesson_id?: string
          tokens_used?: number | null
          user_id?: string
          user_prompt?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_playground_sessions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          age_range: string | null
          created_at: string | null
          familiar_tools: string[] | null
          fear_replacement: string | null
          focus: string | null
          id: string
          interest_areas: string[] | null
          intimidated_by_ai: string | null
          knowledge_level: string | null
          main_goal: string | null
          motivation: string | null
          potential: string | null
          priority_trail: string | null
          readiness_level: string | null
          readiness_score: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          age_range?: string | null
          created_at?: string | null
          familiar_tools?: string[] | null
          fear_replacement?: string | null
          focus?: string | null
          id?: string
          interest_areas?: string[] | null
          intimidated_by_ai?: string | null
          knowledge_level?: string | null
          main_goal?: string | null
          motivation?: string | null
          potential?: string | null
          priority_trail?: string | null
          readiness_level?: string | null
          readiness_score?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          age_range?: string | null
          created_at?: string | null
          familiar_tools?: string[] | null
          fear_replacement?: string | null
          focus?: string | null
          id?: string
          interest_areas?: string[] | null
          intimidated_by_ai?: string | null
          knowledge_level?: string | null
          main_goal?: string | null
          motivation?: string | null
          potential?: string | null
          priority_trail?: string | null
          readiness_level?: string | null
          readiness_score?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          answers: Json | null
          attempts: number | null
          completed_at: string | null
          exercises_completed: number | null
          exercises_total: number | null
          id: string
          last_accessed: string | null
          lesson_id: string | null
          score: number | null
          started_at: string | null
          status: Database["public"]["Enums"]["lesson_status_type"] | null
          time_spent_seconds: number | null
          user_id: string | null
        }
        Insert: {
          answers?: Json | null
          attempts?: number | null
          completed_at?: string | null
          exercises_completed?: number | null
          exercises_total?: number | null
          id?: string
          last_accessed?: string | null
          lesson_id?: string | null
          score?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["lesson_status_type"] | null
          time_spent_seconds?: number | null
          user_id?: string | null
        }
        Update: {
          answers?: Json | null
          attempts?: number | null
          completed_at?: string | null
          exercises_completed?: number | null
          exercises_total?: number | null
          id?: string
          last_accessed?: string | null
          lesson_id?: string | null
          score?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["lesson_status_type"] | null
          time_spent_seconds?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          age: number | null
          created_at: string | null
          daily_interaction_limit: number | null
          daily_time: Database["public"]["Enums"]["daily_time_type"] | null
          email: string
          id: string
          interactions_used_today: number | null
          last_activity_date: string | null
          last_interaction_reset: string | null
          learning_goal:
            | Database["public"]["Enums"]["learning_goal_type"]
            | null
          name: string
          onboarding_completed: boolean | null
          onboarding_completed_at: string | null
          onboarding_started_at: string | null
          plan: Database["public"]["Enums"]["plan_type"] | null
          profession: string | null
          streak_days: number | null
          total_lessons_completed: number | null
          total_points: number | null
          updated_at: string | null
        }
        Insert: {
          age?: number | null
          created_at?: string | null
          daily_interaction_limit?: number | null
          daily_time?: Database["public"]["Enums"]["daily_time_type"] | null
          email: string
          id: string
          interactions_used_today?: number | null
          last_activity_date?: string | null
          last_interaction_reset?: string | null
          learning_goal?:
            | Database["public"]["Enums"]["learning_goal_type"]
            | null
          name: string
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          onboarding_started_at?: string | null
          plan?: Database["public"]["Enums"]["plan_type"] | null
          profession?: string | null
          streak_days?: number | null
          total_lessons_completed?: number | null
          total_points?: number | null
          updated_at?: string | null
        }
        Update: {
          age?: number | null
          created_at?: string | null
          daily_interaction_limit?: number | null
          daily_time?: Database["public"]["Enums"]["daily_time_type"] | null
          email?: string
          id?: string
          interactions_used_today?: number | null
          last_activity_date?: string | null
          last_interaction_reset?: string | null
          learning_goal?:
            | Database["public"]["Enums"]["learning_goal_type"]
            | null
          name?: string
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          onboarding_started_at?: string | null
          plan?: Database["public"]["Enums"]["plan_type"] | null
          profession?: string | null
          streak_days?: number | null
          total_lessons_completed?: number | null
          total_points?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      daily_time_type: "15min" | "30min" | "1h+"
      difficulty_level: "beginner" | "intermediate" | "advanced"
      exercise_type:
        | "multiple_choice"
        | "fill_blank"
        | "drag_drop"
        | "text_input"
        | "playground"
      learning_goal_type: "productivity" | "income" | "curiosity"
      lesson_status_type: "not_started" | "in_progress" | "completed"
      plan_type: "basico" | "ultra" | "pro"
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
      daily_time_type: ["15min", "30min", "1h+"],
      difficulty_level: ["beginner", "intermediate", "advanced"],
      exercise_type: [
        "multiple_choice",
        "fill_blank",
        "drag_drop",
        "text_input",
        "playground",
      ],
      learning_goal_type: ["productivity", "income", "curiosity"],
      lesson_status_type: ["not_started", "in_progress", "completed"],
      plan_type: ["basico", "ultra", "pro"],
    },
  },
} as const
