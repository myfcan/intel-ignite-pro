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
      courses: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          order_index: number
          title: string
          trail_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          order_index?: number
          title: string
          trail_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          order_index?: number
          title?: string
          trail_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_trail_id_fkey"
            columns: ["trail_id"]
            isOneToOne: false
            referencedRelation: "trails"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnostic_logs: {
        Row: {
          audio_time: number | null
          created_at: string | null
          current_section: number | null
          event_type: string
          id: string
          latency_ms: number | null
          lesson_id: string
          metadata: Json | null
          performance_timestamp: number | null
          target_section: number | null
          user_id: string | null
        }
        Insert: {
          audio_time?: number | null
          created_at?: string | null
          current_section?: number | null
          event_type: string
          id?: string
          latency_ms?: number | null
          lesson_id: string
          metadata?: Json | null
          performance_timestamp?: number | null
          target_section?: number | null
          user_id?: string | null
        }
        Update: {
          audio_time?: number | null
          created_at?: string | null
          current_section?: number | null
          event_type?: string
          id?: string
          latency_ms?: number | null
          lesson_id?: string
          metadata?: Json | null
          performance_timestamp?: number | null
          target_section?: number | null
          user_id?: string | null
        }
        Relationships: []
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
      image_assets: {
        Row: {
          attempt_id: string
          created_at: string
          hash: string | null
          height: number
          id: string
          job_id: string
          mime_type: string
          public_url: string | null
          sha256_bytes: string | null
          status: string
          storage_bucket: string
          storage_path: string
          variation_index: number
          width: number
        }
        Insert: {
          attempt_id: string
          created_at?: string
          hash?: string | null
          height: number
          id?: string
          job_id: string
          mime_type?: string
          public_url?: string | null
          sha256_bytes?: string | null
          status?: string
          storage_bucket?: string
          storage_path: string
          variation_index?: number
          width: number
        }
        Update: {
          attempt_id?: string
          created_at?: string
          hash?: string | null
          height?: number
          id?: string
          job_id?: string
          mime_type?: string
          public_url?: string | null
          sha256_bytes?: string | null
          status?: string
          storage_bucket?: string
          storage_path?: string
          variation_index?: number
          width?: number
        }
        Relationships: [
          {
            foreignKeyName: "image_assets_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "image_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "image_assets_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "image_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      image_attempts: {
        Row: {
          bytes_out: number | null
          cost_estimate: number | null
          created_at: string
          error_code: string | null
          error_message: string | null
          id: string
          job_id: string
          latency_ms: number | null
          model: string
          prompt_final: string
          provider: string
          status: string
        }
        Insert: {
          bytes_out?: number | null
          cost_estimate?: number | null
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          id?: string
          job_id: string
          latency_ms?: number | null
          model: string
          prompt_final: string
          provider: string
          status?: string
        }
        Update: {
          bytes_out?: number | null
          cost_estimate?: number | null
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          id?: string
          job_id?: string
          latency_ms?: number | null
          model?: string
          prompt_final?: string
          provider?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "image_attempts_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "image_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      image_jobs: {
        Row: {
          approved_asset_id: string | null
          cache_hit: boolean
          created_at: string
          created_by: string | null
          error_code: string | null
          error_message: string | null
          hash: string | null
          id: string
          latency_ms: number | null
          metadata: Json
          model: string
          n: number
          preset_id: string
          preset_key: string | null
          preset_version: string | null
          prompt_base: string | null
          prompt_final: string | null
          prompt_scene: string
          provider: string
          size: string
          status: string
          updated_at: string
        }
        Insert: {
          approved_asset_id?: string | null
          cache_hit?: boolean
          created_at?: string
          created_by?: string | null
          error_code?: string | null
          error_message?: string | null
          hash?: string | null
          id?: string
          latency_ms?: number | null
          metadata?: Json
          model?: string
          n?: number
          preset_id: string
          preset_key?: string | null
          preset_version?: string | null
          prompt_base?: string | null
          prompt_final?: string | null
          prompt_scene: string
          provider?: string
          size?: string
          status?: string
          updated_at?: string
        }
        Update: {
          approved_asset_id?: string | null
          cache_hit?: boolean
          created_at?: string
          created_by?: string | null
          error_code?: string | null
          error_message?: string | null
          hash?: string | null
          id?: string
          latency_ms?: number | null
          metadata?: Json
          model?: string
          n?: number
          preset_id?: string
          preset_key?: string | null
          preset_version?: string | null
          prompt_base?: string | null
          prompt_final?: string | null
          prompt_scene?: string
          provider?: string
          size?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_image_jobs_approved_asset"
            columns: ["approved_asset_id"]
            isOneToOne: false
            referencedRelation: "image_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "image_jobs_preset_id_fkey"
            columns: ["preset_id"]
            isOneToOne: false
            referencedRelation: "image_presets"
            referencedColumns: ["id"]
          },
        ]
      }
      image_lab_circuit_state: {
        Row: {
          cooldown_until: string | null
          fail_count: number
          last_failure_at: string | null
          opened_at: string | null
          provider: string
          state: string
          total_count: number
          updated_at: string
        }
        Insert: {
          cooldown_until?: string | null
          fail_count?: number
          last_failure_at?: string | null
          opened_at?: string | null
          provider: string
          state?: string
          total_count?: number
          updated_at?: string
        }
        Update: {
          cooldown_until?: string | null
          fail_count?: number
          last_failure_at?: string | null
          opened_at?: string | null
          provider?: string
          state?: string
          total_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      image_presets: {
        Row: {
          created_at: string
          default_size: string
          id: string
          is_active: boolean
          key: string
          prompt_template: string
          title: string
          version: string
        }
        Insert: {
          created_at?: string
          default_size?: string
          id?: string
          is_active?: boolean
          key: string
          prompt_template: string
          title: string
          version: string
        }
        Update: {
          created_at?: string
          default_size?: string
          id?: string
          is_active?: boolean
          key?: string
          prompt_template?: string
          title?: string
          version?: string
        }
        Relationships: []
      }
      lesson_migrations_audit: {
        Row: {
          completed_at: string | null
          created_at: string | null
          diff_summary: Json | null
          error_message: string | null
          id: string
          lesson_id: string
          migration_status: string
          migration_version: string
          new_content: Json | null
          old_content: Json
          run_id: string
          triggered_by: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          diff_summary?: Json | null
          error_message?: string | null
          id?: string
          lesson_id: string
          migration_status?: string
          migration_version: string
          new_content?: Json | null
          old_content: Json
          run_id: string
          triggered_by?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          diff_summary?: Json | null
          error_message?: string | null
          id?: string
          lesson_id?: string
          migration_status?: string
          migration_version?: string
          new_content?: Json | null
          old_content?: Json
          run_id?: string
          triggered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_migrations_audit_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          audio_url: string | null
          audio_urls: string[] | null
          content: Json
          course_id: string | null
          created_at: string | null
          description: string | null
          difficulty_level:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          erro_criacao: string | null
          estimated_time: number | null
          exercises: Json | null
          exercises_version: number | null
          fase_criacao: string | null
          id: string
          is_active: boolean | null
          lesson_type: string | null
          model: string | null
          order_index: number
          passing_score: number | null
          progresso_criacao: number | null
          status: string | null
          title: string
          trail_id: string | null
          word_timestamps: Json | null
        }
        Insert: {
          audio_url?: string | null
          audio_urls?: string[] | null
          content?: Json
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          difficulty_level?:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          erro_criacao?: string | null
          estimated_time?: number | null
          exercises?: Json | null
          exercises_version?: number | null
          fase_criacao?: string | null
          id?: string
          is_active?: boolean | null
          lesson_type?: string | null
          model?: string | null
          order_index: number
          passing_score?: number | null
          progresso_criacao?: number | null
          status?: string | null
          title: string
          trail_id?: string | null
          word_timestamps?: Json | null
        }
        Update: {
          audio_url?: string | null
          audio_urls?: string[] | null
          content?: Json
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          difficulty_level?:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          erro_criacao?: string | null
          estimated_time?: number | null
          exercises?: Json | null
          exercises_version?: number | null
          fase_criacao?: string | null
          id?: string
          is_active?: boolean | null
          lesson_type?: string | null
          model?: string | null
          order_index?: number
          passing_score?: number | null
          progresso_criacao?: number | null
          status?: string | null
          title?: string
          trail_id?: string | null
          word_timestamps?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_trail_id_fkey"
            columns: ["trail_id"]
            isOneToOne: false
            referencedRelation: "trails"
            referencedColumns: ["id"]
          },
        ]
      }
      missions_daily_templates: {
        Row: {
          created_at: string | null
          description: string
          id: string
          requirement_type: string
          requirement_value: number
          reward_type: string
          reward_value: number
          title: string
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          requirement_type: string
          requirement_value: number
          reward_type: string
          reward_value: number
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          requirement_type?: string
          requirement_value?: number
          reward_type?: string
          reward_value?: number
          title?: string
        }
        Relationships: []
      }
      missoes_diarias: {
        Row: {
          bonus_resgatado: boolean | null
          created_at: string | null
          data: string
          id: string
          missoes: Json
          todas_completas: boolean | null
          user_id: string
        }
        Insert: {
          bonus_resgatado?: boolean | null
          created_at?: string | null
          data: string
          id?: string
          missoes?: Json
          todas_completas?: boolean | null
          user_id: string
        }
        Update: {
          bonus_resgatado?: boolean | null
          created_at?: string | null
          data?: string
          id?: string
          missoes?: Json
          todas_completas?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "missoes_diarias_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_executions: {
        Row: {
          commit_hash: string | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          current_step: number | null
          dry_run_result: Json | null
          error_message: string | null
          id: string
          input_data: Json
          lesson_id: string | null
          lesson_title: string
          logs: Json | null
          mode: string | null
          model: string
          normalized_input: Json | null
          order_index: number | null
          output_content_hash: string | null
          output_data: Json | null
          pipeline_version: string | null
          run_id: string | null
          started_at: string | null
          status: string
          step_progress: Json | null
          total_steps: number | null
          track_id: string | null
          track_name: string | null
          updated_at: string | null
        }
        Insert: {
          commit_hash?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          current_step?: number | null
          dry_run_result?: Json | null
          error_message?: string | null
          id?: string
          input_data: Json
          lesson_id?: string | null
          lesson_title: string
          logs?: Json | null
          mode?: string | null
          model: string
          normalized_input?: Json | null
          order_index?: number | null
          output_content_hash?: string | null
          output_data?: Json | null
          pipeline_version?: string | null
          run_id?: string | null
          started_at?: string | null
          status?: string
          step_progress?: Json | null
          total_steps?: number | null
          track_id?: string | null
          track_name?: string | null
          updated_at?: string | null
        }
        Update: {
          commit_hash?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          current_step?: number | null
          dry_run_result?: Json | null
          error_message?: string | null
          id?: string
          input_data?: Json
          lesson_id?: string | null
          lesson_title?: string
          logs?: Json | null
          mode?: string | null
          model?: string
          normalized_input?: Json | null
          order_index?: number | null
          output_content_hash?: string | null
          output_data?: Json | null
          pipeline_version?: string | null
          run_id?: string | null
          started_at?: string | null
          status?: string
          step_progress?: Json | null
          total_steps?: number | null
          track_id?: string | null
          track_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      points_history: {
        Row: {
          created_at: string
          id: string
          points: number
          reason: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          points: number
          reason: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          points?: number
          reason?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "points_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
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
      system_logs: {
        Row: {
          contexto: string
          created_at: string | null
          detalhes: Json | null
          id: string
          mensagem: string
          tipo: string
        }
        Insert: {
          contexto: string
          created_at?: string | null
          detalhes?: Json | null
          id?: string
          mensagem: string
          tipo: string
        }
        Update: {
          contexto?: string
          created_at?: string | null
          detalhes?: Json | null
          id?: string
          mensagem?: string
          tipo?: string
        }
        Relationships: []
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
      user_daily_missions: {
        Row: {
          completed: boolean
          created_at: string | null
          date: string
          id: string
          mission_id: string
          progress_value: number
          reward_claimed: boolean
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string | null
          date?: string
          id?: string
          mission_id: string
          progress_value?: number
          reward_claimed?: boolean
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string | null
          date?: string
          id?: string
          mission_id?: string
          progress_value?: number
          reward_claimed?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_daily_missions_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions_daily_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      user_gamification_events: {
        Row: {
          coins_delta: number
          created_at: string
          event_reference_id: string | null
          event_type: string
          id: string
          payload: Json | null
          user_id: string
          xp_delta: number
        }
        Insert: {
          coins_delta?: number
          created_at?: string
          event_reference_id?: string | null
          event_type: string
          id?: string
          payload?: Json | null
          user_id: string
          xp_delta?: number
        }
        Update: {
          coins_delta?: number
          created_at?: string
          event_reference_id?: string | null
          event_type?: string
          id?: string
          payload?: Json | null
          user_id?: string
          xp_delta?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_gamification_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_guide_progress: {
        Row: {
          completed_at: string | null
          created_at: string | null
          guide_id: string
          id: string
          started_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          guide_id: string
          id?: string
          started_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          guide_id?: string
          id?: string
          started_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
          audio_progress_percentage: number | null
          completed_at: string | null
          exercises_completed: number | null
          exercises_total: number | null
          id: string
          last_accessed: string | null
          lesson_id: string | null
          score: number | null
          started_at: string | null
          status: Database["public"]["Enums"]["lesson_status_type"] | null
          time_spent: number | null
          time_spent_seconds: number | null
          user_id: string | null
        }
        Insert: {
          answers?: Json | null
          attempts?: number | null
          audio_progress_percentage?: number | null
          completed_at?: string | null
          exercises_completed?: number | null
          exercises_total?: number | null
          id?: string
          last_accessed?: string | null
          lesson_id?: string | null
          score?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["lesson_status_type"] | null
          time_spent?: number | null
          time_spent_seconds?: number | null
          user_id?: string | null
        }
        Update: {
          answers?: Json | null
          attempts?: number | null
          audio_progress_percentage?: number | null
          completed_at?: string | null
          exercises_completed?: number | null
          exercises_total?: number | null
          id?: string
          last_accessed?: string | null
          lesson_id?: string | null
          score?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["lesson_status_type"] | null
          time_spent?: number | null
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
      user_rewards: {
        Row: {
          collected: boolean
          collected_at: string | null
          created_at: string | null
          id: string
          mission_id: string
          reward_type: string
          reward_value: number
          user_id: string
        }
        Insert: {
          collected?: boolean
          collected_at?: string | null
          created_at?: string | null
          id?: string
          mission_id: string
          reward_type: string
          reward_value: number
          user_id: string
        }
        Update: {
          collected?: boolean
          collected_at?: string | null
          created_at?: string | null
          id?: string
          mission_id?: string
          reward_type?: string
          reward_value?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_rewards_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "user_daily_missions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_streaks: {
        Row: {
          best_streak: number
          created_at: string | null
          current_streak: number
          last_active_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          best_streak?: number
          created_at?: string | null
          current_streak?: number
          last_active_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          best_streak?: number
          created_at?: string | null
          current_streak?: number
          last_active_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_unlocked_prompts: {
        Row: {
          category_id: string
          credits_spent: number
          id: string
          prompt_id: string
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          category_id: string
          credits_spent?: number
          id?: string
          prompt_id: string
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          category_id?: string
          credits_spent?: number
          id?: string
          prompt_id?: string
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          age: number | null
          avatar_url: string | null
          coins: number | null
          created_at: string | null
          daily_interaction_limit: number | null
          daily_time: Database["public"]["Enums"]["daily_time_type"] | null
          email: string
          gamification_updated_at: string | null
          id: string
          interactions_used_today: number | null
          is_active: boolean
          last_activity_date: string | null
          last_interaction_reset: string | null
          learning_goal:
            | Database["public"]["Enums"]["learning_goal_type"]
            | null
          name: string
          notifications_enabled: boolean | null
          onboarding_completed: boolean | null
          onboarding_completed_at: string | null
          onboarding_started_at: string | null
          patent_level: number | null
          phone: string | null
          plan: Database["public"]["Enums"]["plan_type"] | null
          power_score: number | null
          profession: string | null
          streak_days: number | null
          total_lessons_completed: number | null
          total_points: number | null
          updated_at: string | null
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          coins?: number | null
          created_at?: string | null
          daily_interaction_limit?: number | null
          daily_time?: Database["public"]["Enums"]["daily_time_type"] | null
          email: string
          gamification_updated_at?: string | null
          id: string
          interactions_used_today?: number | null
          is_active?: boolean
          last_activity_date?: string | null
          last_interaction_reset?: string | null
          learning_goal?:
            | Database["public"]["Enums"]["learning_goal_type"]
            | null
          name: string
          notifications_enabled?: boolean | null
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          onboarding_started_at?: string | null
          patent_level?: number | null
          phone?: string | null
          plan?: Database["public"]["Enums"]["plan_type"] | null
          power_score?: number | null
          profession?: string | null
          streak_days?: number | null
          total_lessons_completed?: number | null
          total_points?: number | null
          updated_at?: string | null
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          coins?: number | null
          created_at?: string | null
          daily_interaction_limit?: number | null
          daily_time?: Database["public"]["Enums"]["daily_time_type"] | null
          email?: string
          gamification_updated_at?: string | null
          id?: string
          interactions_used_today?: number | null
          is_active?: boolean
          last_activity_date?: string | null
          last_interaction_reset?: string | null
          learning_goal?:
            | Database["public"]["Enums"]["learning_goal_type"]
            | null
          name?: string
          notifications_enabled?: boolean | null
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          onboarding_started_at?: string | null
          patent_level?: number | null
          phone?: string | null
          plan?: Database["public"]["Enums"]["plan_type"] | null
          power_score?: number | null
          profession?: string | null
          streak_days?: number | null
          total_lessons_completed?: number | null
          total_points?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      v7_analytics: {
        Row: {
          created_at: string
          duration: number
          events: Json
          id: string
          lesson_id: string
          metrics: Json
          session_id: string
          start_time: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          duration?: number
          events?: Json
          id?: string
          lesson_id: string
          metrics?: Json
          session_id: string
          start_time: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          duration?: number
          events?: Json
          id?: string
          lesson_id?: string
          metrics?: Json
          session_id?: string
          start_time?: string
          user_id?: string | null
        }
        Relationships: []
      }
      validation_alerts: {
        Row: {
          created_at: string | null
          details: Json | null
          guarantee_name: string
          id: string
          message: string
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          test_name: string
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          guarantee_name: string
          id?: string
          message: string
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
          test_name: string
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          guarantee_name?: string
          id?: string
          message?: string
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          test_name?: string
        }
        Relationships: []
      }
    }
    Views: {
      exercises_public: {
        Row: {
          created_at: string | null
          id: string | null
          lesson_id: string | null
          options: Json | null
          order_index: number | null
          question: string | null
          type: Database["public"]["Enums"]["exercise_type"] | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          lesson_id?: string | null
          options?: Json | null
          order_index?: number | null
          question?: string | null
          type?: Database["public"]["Enums"]["exercise_type"] | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          lesson_id?: string | null
          options?: Json | null
          order_index?: number | null
          question?: string | null
          type?: Database["public"]["Enums"]["exercise_type"] | null
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
      image_lab_kpis_last_7d: {
        Row: {
          avg_attempts_per_approved: number | null
          avg_latency_gemini: number | null
          avg_latency_openai: number | null
          fail_rate_gemini: number | null
          fail_rate_openai: number | null
          first_pass_accept_rate: number | null
          total_attempts: number | null
          total_jobs: number | null
        }
        Relationships: []
      }
      v7vv_audit_runs_v1: {
        Row: {
          audit_checked: boolean | null
          audit_http_status: number | null
          audit_scorecard_hash: string | null
          completed_at: string | null
          created_at: string | null
          error_code: string | null
          error_preview: string | null
          forensic_audit_checked: boolean | null
          forensic_audit_passed: boolean | null
          forensic_generated_at: string | null
          forensic_http_status: number | null
          forensic_scorecard_hash: string | null
          lesson_id: string | null
          mode: string | null
          pipeline_version: string | null
          run_id: string | null
          started_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          audit_checked?: never
          audit_http_status?: never
          audit_scorecard_hash?: never
          completed_at?: string | null
          created_at?: string | null
          error_code?: never
          error_preview?: never
          forensic_audit_checked?: never
          forensic_audit_passed?: never
          forensic_generated_at?: never
          forensic_http_status?: never
          forensic_scorecard_hash?: never
          lesson_id?: string | null
          mode?: string | null
          pipeline_version?: string | null
          run_id?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          audit_checked?: never
          audit_http_status?: never
          audit_scorecard_hash?: never
          completed_at?: string | null
          created_at?: string | null
          error_code?: never
          error_preview?: never
          forensic_audit_checked?: never
          forensic_audit_passed?: never
          forensic_generated_at?: never
          forensic_http_status?: never
          forensic_scorecard_hash?: never
          lesson_id?: string | null
          mode?: string | null
          pipeline_version?: string | null
          run_id?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      c05_compute_content_hash: { Args: { p_run_id: string }; Returns: string }
      canonical_jsonb_string: { Args: { input_jsonb: Json }; Returns: string }
      cleanup_stale_image_attempts: { Args: never; Returns: number }
      create_lesson_draft:
        | {
            Args: {
              p_content: Json
              p_estimated_time: number
              p_order_index: number
              p_title: string
              p_trail_id: string
            }
            Returns: string
          }
        | {
            Args: {
              p_audio_url?: string
              p_content: Json
              p_estimated_time: number
              p_exercises?: Json
              p_order_index: number
              p_title: string
              p_trail_id: string
              p_word_timestamps?: Json
            }
            Returns: string
          }
      debug_auth_context: {
        Args: never
        Returns: {
          current_user_id: string
          is_authenticated: boolean
          user_role: string
        }[]
      }
      get_v7vv_audit_runs: {
        Args: { limit_rows?: number; run_id_filter?: string }
        Returns: {
          audit_checked: boolean | null
          audit_http_status: number | null
          audit_scorecard_hash: string | null
          completed_at: string | null
          created_at: string | null
          error_code: string | null
          error_preview: string | null
          forensic_audit_checked: boolean | null
          forensic_audit_passed: boolean | null
          forensic_generated_at: string | null
          forensic_http_status: number | null
          forensic_scorecard_hash: string | null
          lesson_id: string | null
          mode: string | null
          pipeline_version: string | null
          run_id: string | null
          started_at: string | null
          status: string | null
          updated_at: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "v7vv_audit_runs_v1"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      register_gamification_event: {
        Args: {
          p_event_reference_id?: string
          p_event_type: string
          p_payload?: Json
        }
        Returns: Database["public"]["CompositeTypes"]["gamification_result"]
        SetofOptions: {
          from: "*"
          to: "gamification_result"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      app_role: "admin" | "user" | "supervisor"
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
      gamification_result: {
        xp_delta: number | null
        coins_delta: number | null
        new_power_score: number | null
        new_coins: number | null
        new_patent_level: number | null
        patent_name: string | null
        is_new_patent: boolean | null
      }
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
      app_role: ["admin", "user", "supervisor"],
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
