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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      account_settings: {
        Row: {
          created_at: string | null
          default_pit: string | null
          display_name: string | null
          experience_level: string | null
          notifications_enabled: boolean | null
          timezone: string | null
          units: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          default_pit?: string | null
          display_name?: string | null
          experience_level?: string | null
          notifications_enabled?: boolean | null
          timezone?: string | null
          units?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          default_pit?: string | null
          display_name?: string | null
          experience_level?: string | null
          notifications_enabled?: boolean | null
          timezone?: string | null
          units?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_settings_default_pit_fkey"
            columns: ["default_pit"]
            isOneToOne: false
            referencedRelation: "account_overview"
            referencedColumns: ["default_pit_id"]
          },
          {
            foreignKeyName: "account_settings_default_pit_fkey"
            columns: ["default_pit"]
            isOneToOne: false
            referencedRelation: "cook_history_view"
            referencedColumns: ["pit_id"]
          },
          {
            foreignKeyName: "account_settings_default_pit_fkey"
            columns: ["default_pit"]
            isOneToOne: false
            referencedRelation: "pits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "account_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "account_overview"
            referencedColumns: ["user_id"]
          },
        ]
      }
      api_rate_limits: {
        Row: {
          endpoint: string
          request_count: number | null
          user_id: string
          window_start: string | null
        }
        Insert: {
          endpoint: string
          request_count?: number | null
          user_id: string
          window_start?: string | null
        }
        Update: {
          endpoint?: string
          request_count?: number | null
          user_id?: string
          window_start?: string | null
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "account_overview"
            referencedColumns: ["user_id"]
          },
        ]
      }
      cook_events: {
        Row: {
          cook_id: string
          created_at: string | null
          event_type: string
          id: string
          item_id: string | null
          message: string | null
          pit_id: string | null
        }
        Insert: {
          cook_id: string
          created_at?: string | null
          event_type: string
          id?: string
          item_id?: string | null
          message?: string | null
          pit_id?: string | null
        }
        Update: {
          cook_id?: string
          created_at?: string | null
          event_type?: string
          id?: string
          item_id?: string | null
          message?: string | null
          pit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cook_events_cook_id_fkey"
            columns: ["cook_id"]
            isOneToOne: false
            referencedRelation: "cook_history_view"
            referencedColumns: ["cook_id"]
          },
          {
            foreignKeyName: "cook_events_cook_id_fkey"
            columns: ["cook_id"]
            isOneToOne: false
            referencedRelation: "cooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cook_events_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "cook_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cook_events_pit_id_fkey"
            columns: ["pit_id"]
            isOneToOne: false
            referencedRelation: "account_overview"
            referencedColumns: ["default_pit_id"]
          },
          {
            foreignKeyName: "cook_events_pit_id_fkey"
            columns: ["pit_id"]
            isOneToOne: false
            referencedRelation: "cook_history_view"
            referencedColumns: ["pit_id"]
          },
          {
            foreignKeyName: "cook_events_pit_id_fkey"
            columns: ["pit_id"]
            isOneToOne: false
            referencedRelation: "pits"
            referencedColumns: ["id"]
          },
        ]
      }
      cook_items: {
        Row: {
          cook_id: string
          created_at: string | null
          id: string
          name: string
          notes: string | null
          pit_id: string | null
          target_temp: number | null
          updated_at: string | null
          weight: number | null
        }
        Insert: {
          cook_id: string
          created_at?: string | null
          id?: string
          name: string
          notes?: string | null
          pit_id?: string | null
          target_temp?: number | null
          updated_at?: string | null
          weight?: number | null
        }
        Update: {
          cook_id?: string
          created_at?: string | null
          id?: string
          name?: string
          notes?: string | null
          pit_id?: string | null
          target_temp?: number | null
          updated_at?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cook_items_cook_id_fkey"
            columns: ["cook_id"]
            isOneToOne: false
            referencedRelation: "cook_history_view"
            referencedColumns: ["cook_id"]
          },
          {
            foreignKeyName: "cook_items_cook_id_fkey"
            columns: ["cook_id"]
            isOneToOne: false
            referencedRelation: "cooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cook_items_pit_id_fkey"
            columns: ["pit_id"]
            isOneToOne: false
            referencedRelation: "account_overview"
            referencedColumns: ["default_pit_id"]
          },
          {
            foreignKeyName: "cook_items_pit_id_fkey"
            columns: ["pit_id"]
            isOneToOne: false
            referencedRelation: "cook_history_view"
            referencedColumns: ["pit_id"]
          },
          {
            foreignKeyName: "cook_items_pit_id_fkey"
            columns: ["pit_id"]
            isOneToOne: false
            referencedRelation: "pits"
            referencedColumns: ["id"]
          },
        ]
      }
      cook_logs: {
        Row: {
          behavior: Json | null
          cook_id: string
          created_at: string | null
          id: string
          lessons: string | null
          pit_id: string | null
          rating: number | null
          summary: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          behavior?: Json | null
          cook_id: string
          created_at?: string | null
          id?: string
          lessons?: string | null
          pit_id?: string | null
          rating?: number | null
          summary?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          behavior?: Json | null
          cook_id?: string
          created_at?: string | null
          id?: string
          lessons?: string | null
          pit_id?: string | null
          rating?: number | null
          summary?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cook_logs_cook_id_fkey"
            columns: ["cook_id"]
            isOneToOne: false
            referencedRelation: "cook_history_view"
            referencedColumns: ["cook_id"]
          },
          {
            foreignKeyName: "cook_logs_cook_id_fkey"
            columns: ["cook_id"]
            isOneToOne: false
            referencedRelation: "cooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cook_logs_pit_id_fkey"
            columns: ["pit_id"]
            isOneToOne: false
            referencedRelation: "account_overview"
            referencedColumns: ["default_pit_id"]
          },
          {
            foreignKeyName: "cook_logs_pit_id_fkey"
            columns: ["pit_id"]
            isOneToOne: false
            referencedRelation: "cook_history_view"
            referencedColumns: ["pit_id"]
          },
          {
            foreignKeyName: "cook_logs_pit_id_fkey"
            columns: ["pit_id"]
            isOneToOne: false
            referencedRelation: "pits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cook_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "account_overview"
            referencedColumns: ["user_id"]
          },
        ]
      }
      cook_outcomes: {
        Row: {
          adjustments_made: string | null
          bark_quality: number | null
          cook_id: string | null
          created_at: string | null
          final_internal_temp: number | null
          finish_time_actual: string | null
          fire_issues: string | null
          flavor_balance: number | null
          id: string
          moisture_level: number | null
          overall_success: number | null
          pit_temp_high: number | null
          pit_temp_low: number | null
          rest_time_minutes: number | null
          smoke_profile: number | null
          stall_time_minutes: number | null
          start_time_actual: string | null
          tenderness: number | null
          user_id: string | null
          weather_impact: string | null
          wood_used: string | null
          wrap_time: string | null
        }
        Insert: {
          adjustments_made?: string | null
          bark_quality?: number | null
          cook_id?: string | null
          created_at?: string | null
          final_internal_temp?: number | null
          finish_time_actual?: string | null
          fire_issues?: string | null
          flavor_balance?: number | null
          id?: string
          moisture_level?: number | null
          overall_success?: number | null
          pit_temp_high?: number | null
          pit_temp_low?: number | null
          rest_time_minutes?: number | null
          smoke_profile?: number | null
          stall_time_minutes?: number | null
          start_time_actual?: string | null
          tenderness?: number | null
          user_id?: string | null
          weather_impact?: string | null
          wood_used?: string | null
          wrap_time?: string | null
        }
        Update: {
          adjustments_made?: string | null
          bark_quality?: number | null
          cook_id?: string | null
          created_at?: string | null
          final_internal_temp?: number | null
          finish_time_actual?: string | null
          fire_issues?: string | null
          flavor_balance?: number | null
          id?: string
          moisture_level?: number | null
          overall_success?: number | null
          pit_temp_high?: number | null
          pit_temp_low?: number | null
          rest_time_minutes?: number | null
          smoke_profile?: number | null
          stall_time_minutes?: number | null
          start_time_actual?: string | null
          tenderness?: number | null
          user_id?: string | null
          weather_impact?: string | null
          wood_used?: string | null
          wrap_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cook_outcomes_cook_id_fkey"
            columns: ["cook_id"]
            isOneToOne: false
            referencedRelation: "cook_history_view"
            referencedColumns: ["cook_id"]
          },
          {
            foreignKeyName: "cook_outcomes_cook_id_fkey"
            columns: ["cook_id"]
            isOneToOne: false
            referencedRelation: "cooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cook_outcomes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "account_overview"
            referencedColumns: ["user_id"]
          },
        ]
      }
      cook_photos: {
        Row: {
          ai_analysis: Json | null
          cook_id: string
          created_at: string | null
          id: string
          pit_id: string | null
          step_id: string | null
          url: string
        }
        Insert: {
          ai_analysis?: Json | null
          cook_id: string
          created_at?: string | null
          id?: string
          pit_id?: string | null
          step_id?: string | null
          url: string
        }
        Update: {
          ai_analysis?: Json | null
          cook_id?: string
          created_at?: string | null
          id?: string
          pit_id?: string | null
          step_id?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "cook_photos_cook_id_fkey"
            columns: ["cook_id"]
            isOneToOne: false
            referencedRelation: "cook_history_view"
            referencedColumns: ["cook_id"]
          },
          {
            foreignKeyName: "cook_photos_cook_id_fkey"
            columns: ["cook_id"]
            isOneToOne: false
            referencedRelation: "cooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cook_photos_pit_id_fkey"
            columns: ["pit_id"]
            isOneToOne: false
            referencedRelation: "account_overview"
            referencedColumns: ["default_pit_id"]
          },
          {
            foreignKeyName: "cook_photos_pit_id_fkey"
            columns: ["pit_id"]
            isOneToOne: false
            referencedRelation: "cook_history_view"
            referencedColumns: ["pit_id"]
          },
          {
            foreignKeyName: "cook_photos_pit_id_fkey"
            columns: ["pit_id"]
            isOneToOne: false
            referencedRelation: "pits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cook_photos_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "cook_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      cook_pits: {
        Row: {
          cook_id: string
          created_at: string | null
          id: string
          pit_id: string
        }
        Insert: {
          cook_id: string
          created_at?: string | null
          id?: string
          pit_id: string
        }
        Update: {
          cook_id?: string
          created_at?: string | null
          id?: string
          pit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cook_pits_cook_id_fkey"
            columns: ["cook_id"]
            isOneToOne: false
            referencedRelation: "cook_history_view"
            referencedColumns: ["cook_id"]
          },
          {
            foreignKeyName: "cook_pits_cook_id_fkey"
            columns: ["cook_id"]
            isOneToOne: false
            referencedRelation: "cooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cook_pits_pit_id_fkey"
            columns: ["pit_id"]
            isOneToOne: false
            referencedRelation: "account_overview"
            referencedColumns: ["default_pit_id"]
          },
          {
            foreignKeyName: "cook_pits_pit_id_fkey"
            columns: ["pit_id"]
            isOneToOne: false
            referencedRelation: "cook_history_view"
            referencedColumns: ["pit_id"]
          },
          {
            foreignKeyName: "cook_pits_pit_id_fkey"
            columns: ["pit_id"]
            isOneToOne: false
            referencedRelation: "pits"
            referencedColumns: ["id"]
          },
        ]
      }
      cook_ratings: {
        Row: {
          cook_id: string
          created_at: string | null
          id: string
          notes: string | null
          rating: number
          user_id: string
        }
        Insert: {
          cook_id: string
          created_at?: string | null
          id?: string
          notes?: string | null
          rating: number
          user_id: string
        }
        Update: {
          cook_id?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cook_ratings_cook_id_fkey"
            columns: ["cook_id"]
            isOneToOne: false
            referencedRelation: "cook_history_view"
            referencedColumns: ["cook_id"]
          },
          {
            foreignKeyName: "cook_ratings_cook_id_fkey"
            columns: ["cook_id"]
            isOneToOne: false
            referencedRelation: "cooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cook_ratings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "account_overview"
            referencedColumns: ["user_id"]
          },
        ]
      }
      cook_steps: {
        Row: {
          actual_temp: number | null
          actual_time: string | null
          bark_tag: string | null
          cook_id: string
          created_at: string | null
          fire_tag: string | null
          id: string
          notes: string | null
          pit_id: string | null
          planned_temp: number | null
          planned_time: string | null
          step_type: string
          updated_at: string | null
        }
        Insert: {
          actual_temp?: number | null
          actual_time?: string | null
          bark_tag?: string | null
          cook_id: string
          created_at?: string | null
          fire_tag?: string | null
          id?: string
          notes?: string | null
          pit_id?: string | null
          planned_temp?: number | null
          planned_time?: string | null
          step_type: string
          updated_at?: string | null
        }
        Update: {
          actual_temp?: number | null
          actual_time?: string | null
          bark_tag?: string | null
          cook_id?: string
          created_at?: string | null
          fire_tag?: string | null
          id?: string
          notes?: string | null
          pit_id?: string | null
          planned_temp?: number | null
          planned_time?: string | null
          step_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cook_steps_cook_id_fkey"
            columns: ["cook_id"]
            isOneToOne: false
            referencedRelation: "cook_history_view"
            referencedColumns: ["cook_id"]
          },
          {
            foreignKeyName: "cook_steps_cook_id_fkey"
            columns: ["cook_id"]
            isOneToOne: false
            referencedRelation: "cooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cook_steps_pit_id_fkey"
            columns: ["pit_id"]
            isOneToOne: false
            referencedRelation: "account_overview"
            referencedColumns: ["default_pit_id"]
          },
          {
            foreignKeyName: "cook_steps_pit_id_fkey"
            columns: ["pit_id"]
            isOneToOne: false
            referencedRelation: "cook_history_view"
            referencedColumns: ["pit_id"]
          },
          {
            foreignKeyName: "cook_steps_pit_id_fkey"
            columns: ["pit_id"]
            isOneToOne: false
            referencedRelation: "pits"
            referencedColumns: ["id"]
          },
        ]
      }
      cook_summary: {
        Row: {
          cook_id: string
          created_at: string | null
          summary: string | null
        }
        Insert: {
          cook_id: string
          created_at?: string | null
          summary?: string | null
        }
        Update: {
          cook_id?: string
          created_at?: string | null
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cook_summary_cook_id_fkey"
            columns: ["cook_id"]
            isOneToOne: true
            referencedRelation: "cook_history_view"
            referencedColumns: ["cook_id"]
          },
          {
            foreignKeyName: "cook_summary_cook_id_fkey"
            columns: ["cook_id"]
            isOneToOne: true
            referencedRelation: "cooks"
            referencedColumns: ["id"]
          },
        ]
      }
      cook_tags: {
        Row: {
          cook_id: string | null
          id: string
          tag: string
        }
        Insert: {
          cook_id?: string | null
          id?: string
          tag: string
        }
        Update: {
          cook_id?: string | null
          id?: string
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "cook_tags_cook_id_fkey"
            columns: ["cook_id"]
            isOneToOne: false
            referencedRelation: "cook_history_view"
            referencedColumns: ["cook_id"]
          },
          {
            foreignKeyName: "cook_tags_cook_id_fkey"
            columns: ["cook_id"]
            isOneToOne: false
            referencedRelation: "cooks"
            referencedColumns: ["id"]
          },
        ]
      }
      cook_temps: {
        Row: {
          cook_id: string
          id: string
          item_id: string | null
          pit_id: string | null
          recorded_at: string | null
          temp: number
          temp_type: string
        }
        Insert: {
          cook_id: string
          id?: string
          item_id?: string | null
          pit_id?: string | null
          recorded_at?: string | null
          temp: number
          temp_type: string
        }
        Update: {
          cook_id?: string
          id?: string
          item_id?: string | null
          pit_id?: string | null
          recorded_at?: string | null
          temp?: number
          temp_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "cook_temps_cook_id_fkey"
            columns: ["cook_id"]
            isOneToOne: false
            referencedRelation: "cook_history_view"
            referencedColumns: ["cook_id"]
          },
          {
            foreignKeyName: "cook_temps_cook_id_fkey"
            columns: ["cook_id"]
            isOneToOne: false
            referencedRelation: "cooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cook_temps_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "cook_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cook_temps_pit_id_fkey"
            columns: ["pit_id"]
            isOneToOne: false
            referencedRelation: "account_overview"
            referencedColumns: ["default_pit_id"]
          },
          {
            foreignKeyName: "cook_temps_pit_id_fkey"
            columns: ["pit_id"]
            isOneToOne: false
            referencedRelation: "cook_history_view"
            referencedColumns: ["pit_id"]
          },
          {
            foreignKeyName: "cook_temps_pit_id_fkey"
            columns: ["pit_id"]
            isOneToOne: false
            referencedRelation: "pits"
            referencedColumns: ["id"]
          },
        ]
      }
      cook_tracker_notes: {
        Row: {
          cook_id: string | null
          created_at: string | null
          generated_suggestions: string | null
          id: string
          note_1: string | null
          note_2: string | null
          note_3: string | null
          note_4: string | null
          note_5: string | null
          user_id: string | null
        }
        Insert: {
          cook_id?: string | null
          created_at?: string | null
          generated_suggestions?: string | null
          id?: string
          note_1?: string | null
          note_2?: string | null
          note_3?: string | null
          note_4?: string | null
          note_5?: string | null
          user_id?: string | null
        }
        Update: {
          cook_id?: string | null
          created_at?: string | null
          generated_suggestions?: string | null
          id?: string
          note_1?: string | null
          note_2?: string | null
          note_3?: string | null
          note_4?: string | null
          note_5?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cook_tracker_notes_cook_id_fkey"
            columns: ["cook_id"]
            isOneToOne: false
            referencedRelation: "cook_history_view"
            referencedColumns: ["cook_id"]
          },
          {
            foreignKeyName: "cook_tracker_notes_cook_id_fkey"
            columns: ["cook_id"]
            isOneToOne: false
            referencedRelation: "cooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cook_tracker_notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "account_overview"
            referencedColumns: ["user_id"]
          },
        ]
      }
      cooks: {
        Row: {
          actual_start: string | null
          completed_at: string | null
          cooking_style: string | null
          created_at: string | null
          eat_time: string | null
          id: string
          label: string | null
          pit_id: string | null
          plan: Json | null
          prep_session_id: string | null
          smoker_type: string | null
          status: string
          updated_at: string | null
          user_id: string
          wood_type: string | null
        }
        Insert: {
          actual_start?: string | null
          completed_at?: string | null
          cooking_style?: string | null
          created_at?: string | null
          eat_time?: string | null
          id?: string
          label?: string | null
          pit_id?: string | null
          plan?: Json | null
          prep_session_id?: string | null
          smoker_type?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
          wood_type?: string | null
        }
        Update: {
          actual_start?: string | null
          completed_at?: string | null
          cooking_style?: string | null
          created_at?: string | null
          eat_time?: string | null
          id?: string
          label?: string | null
          pit_id?: string | null
          plan?: Json | null
          prep_session_id?: string | null
          smoker_type?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
          wood_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cooks_pit_id_fkey"
            columns: ["pit_id"]
            isOneToOne: false
            referencedRelation: "account_overview"
            referencedColumns: ["default_pit_id"]
          },
          {
            foreignKeyName: "cooks_pit_id_fkey"
            columns: ["pit_id"]
            isOneToOne: false
            referencedRelation: "cook_history_view"
            referencedColumns: ["pit_id"]
          },
          {
            foreignKeyName: "cooks_pit_id_fkey"
            columns: ["pit_id"]
            isOneToOne: false
            referencedRelation: "pits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cooks_prep_session_id_fkey"
            columns: ["prep_session_id"]
            isOneToOne: false
            referencedRelation: "meal_prep_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cooks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "account_overview"
            referencedColumns: ["user_id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          enabled: boolean | null
          key: string
        }
        Insert: {
          enabled?: boolean | null
          key: string
        }
        Update: {
          enabled?: boolean | null
          key?: string
        }
        Relationships: []
      }
      item_catalog: {
        Row: {
          ai_tags: Json | null
          category: string
          cook_time_minutes_per_lb: number | null
          created_at: string | null
          default_cook_temp: number | null
          default_finish_temp: number | null
          group_name: string | null
          hold_behavior: Json | null
          id: string
          name: string
          rest_behavior: Json | null
          stall_behavior: Json | null
          updated_at: string | null
          wrap_behavior: Json | null
        }
        Insert: {
          ai_tags?: Json | null
          category: string
          cook_time_minutes_per_lb?: number | null
          created_at?: string | null
          default_cook_temp?: number | null
          default_finish_temp?: number | null
          group_name?: string | null
          hold_behavior?: Json | null
          id?: string
          name: string
          rest_behavior?: Json | null
          stall_behavior?: Json | null
          updated_at?: string | null
          wrap_behavior?: Json | null
        }
        Update: {
          ai_tags?: Json | null
          category?: string
          cook_time_minutes_per_lb?: number | null
          created_at?: string | null
          default_cook_temp?: number | null
          default_finish_temp?: number | null
          group_name?: string | null
          hold_behavior?: Json | null
          id?: string
          name?: string
          rest_behavior?: Json | null
          stall_behavior?: Json | null
          updated_at?: string | null
          wrap_behavior?: Json | null
        }
        Relationships: []
      }
      item_variants: {
        Row: {
          ai_tags: Json | null
          catalog_id: string | null
          cook_time_modifier: number | null
          created_at: string | null
          default_cook_temp: number | null
          default_finish_temp: number | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          ai_tags?: Json | null
          catalog_id?: string | null
          cook_time_modifier?: number | null
          created_at?: string | null
          default_cook_temp?: number | null
          default_finish_temp?: number | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          ai_tags?: Json | null
          catalog_id?: string | null
          cook_time_modifier?: number | null
          created_at?: string | null
          default_cook_temp?: number | null
          default_finish_temp?: number | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "item_variants_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "item_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_prep_sessions: {
        Row: {
          cooking_style: string | null
          created_at: string | null
          eating_time: string | null
          flavor_bark: number | null
          flavor_smoke: number | null
          flavor_tenderness: number | null
          id: string
          notes: string | null
          pit_id: string | null
          selected_items: Json
          smoker_type: string | null
          thermometer_type: string | null
          tools: Json | null
          updated_at: string | null
          user_id: string | null
          wood_type: string | null
        }
        Insert: {
          cooking_style?: string | null
          created_at?: string | null
          eating_time?: string | null
          flavor_bark?: number | null
          flavor_smoke?: number | null
          flavor_tenderness?: number | null
          id?: string
          notes?: string | null
          pit_id?: string | null
          selected_items: Json
          smoker_type?: string | null
          thermometer_type?: string | null
          tools?: Json | null
          updated_at?: string | null
          user_id?: string | null
          wood_type?: string | null
        }
        Update: {
          cooking_style?: string | null
          created_at?: string | null
          eating_time?: string | null
          flavor_bark?: number | null
          flavor_smoke?: number | null
          flavor_tenderness?: number | null
          id?: string
          notes?: string | null
          pit_id?: string | null
          selected_items?: Json
          smoker_type?: string | null
          thermometer_type?: string | null
          tools?: Json | null
          updated_at?: string | null
          user_id?: string | null
          wood_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_prep_sessions_pit_id_fkey"
            columns: ["pit_id"]
            isOneToOne: false
            referencedRelation: "account_overview"
            referencedColumns: ["default_pit_id"]
          },
          {
            foreignKeyName: "meal_prep_sessions_pit_id_fkey"
            columns: ["pit_id"]
            isOneToOne: false
            referencedRelation: "cook_history_view"
            referencedColumns: ["pit_id"]
          },
          {
            foreignKeyName: "meal_prep_sessions_pit_id_fkey"
            columns: ["pit_id"]
            isOneToOne: false
            referencedRelation: "pits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_prep_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "account_overview"
            referencedColumns: ["user_id"]
          },
        ]
      }
      pit_behavior: {
        Row: {
          avg_stabilization_minutes: number | null
          avg_temp_drift: number | null
          hot_zone_notes: string | null
          id: string
          pit_id: string
          quirks: string | null
          smoke_character: string | null
          updated_at: string | null
          user_id: string
          wind_sensitivity: string | null
          wood_preferences: string | null
        }
        Insert: {
          avg_stabilization_minutes?: number | null
          avg_temp_drift?: number | null
          hot_zone_notes?: string | null
          id?: string
          pit_id: string
          quirks?: string | null
          smoke_character?: string | null
          updated_at?: string | null
          user_id: string
          wind_sensitivity?: string | null
          wood_preferences?: string | null
        }
        Update: {
          avg_stabilization_minutes?: number | null
          avg_temp_drift?: number | null
          hot_zone_notes?: string | null
          id?: string
          pit_id?: string
          quirks?: string | null
          smoke_character?: string | null
          updated_at?: string | null
          user_id?: string
          wind_sensitivity?: string | null
          wood_preferences?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pit_behavior_pit_id_fkey"
            columns: ["pit_id"]
            isOneToOne: false
            referencedRelation: "account_overview"
            referencedColumns: ["default_pit_id"]
          },
          {
            foreignKeyName: "pit_behavior_pit_id_fkey"
            columns: ["pit_id"]
            isOneToOne: false
            referencedRelation: "cook_history_view"
            referencedColumns: ["pit_id"]
          },
          {
            foreignKeyName: "pit_behavior_pit_id_fkey"
            columns: ["pit_id"]
            isOneToOne: false
            referencedRelation: "pits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pit_behavior_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "account_overview"
            referencedColumns: ["user_id"]
          },
        ]
      }
      pit_cook_history: {
        Row: {
          avg_cook_temp: number | null
          cook_id: string
          cook_time_minutes: number | null
          created_at: string | null
          finish_temp: number | null
          id: string
          item_id: string | null
          meat_name: string
          notes: string | null
          pit_id: string
          rest_time_minutes: number | null
          stall_duration_minutes: number | null
          stall_end_temp: number | null
          stall_start_temp: number | null
          user_id: string
          weight: number | null
        }
        Insert: {
          avg_cook_temp?: number | null
          cook_id: string
          cook_time_minutes?: number | null
          created_at?: string | null
          finish_temp?: number | null
          id?: string
          item_id?: string | null
          meat_name: string
          notes?: string | null
          pit_id: string
          rest_time_minutes?: number | null
          stall_duration_minutes?: number | null
          stall_end_temp?: number | null
          stall_start_temp?: number | null
          user_id: string
          weight?: number | null
        }
        Update: {
          avg_cook_temp?: number | null
          cook_id?: string
          cook_time_minutes?: number | null
          created_at?: string | null
          finish_temp?: number | null
          id?: string
          item_id?: string | null
          meat_name?: string
          notes?: string | null
          pit_id?: string
          rest_time_minutes?: number | null
          stall_duration_minutes?: number | null
          stall_end_temp?: number | null
          stall_start_temp?: number | null
          user_id?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pit_cook_history_cook_id_fkey"
            columns: ["cook_id"]
            isOneToOne: false
            referencedRelation: "cook_history_view"
            referencedColumns: ["cook_id"]
          },
          {
            foreignKeyName: "pit_cook_history_cook_id_fkey"
            columns: ["cook_id"]
            isOneToOne: false
            referencedRelation: "cooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pit_cook_history_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "cook_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pit_cook_history_pit_id_fkey"
            columns: ["pit_id"]
            isOneToOne: false
            referencedRelation: "account_overview"
            referencedColumns: ["default_pit_id"]
          },
          {
            foreignKeyName: "pit_cook_history_pit_id_fkey"
            columns: ["pit_id"]
            isOneToOne: false
            referencedRelation: "cook_history_view"
            referencedColumns: ["pit_id"]
          },
          {
            foreignKeyName: "pit_cook_history_pit_id_fkey"
            columns: ["pit_id"]
            isOneToOne: false
            referencedRelation: "pits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pit_cook_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "account_overview"
            referencedColumns: ["user_id"]
          },
        ]
      }
      pit_mapping: {
        Row: {
          airflow: Json | null
          created_at: string | null
          hot_zones: Json | null
          id: string
          photos: Json | null
          pit_id: string
          racks: Json | null
          updated_at: string | null
        }
        Insert: {
          airflow?: Json | null
          created_at?: string | null
          hot_zones?: Json | null
          id?: string
          photos?: Json | null
          pit_id: string
          racks?: Json | null
          updated_at?: string | null
        }
        Update: {
          airflow?: Json | null
          created_at?: string | null
          hot_zones?: Json | null
          id?: string
          photos?: Json | null
          pit_id?: string
          racks?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pit_mapping_pit_id_fkey"
            columns: ["pit_id"]
            isOneToOne: false
            referencedRelation: "account_overview"
            referencedColumns: ["default_pit_id"]
          },
          {
            foreignKeyName: "pit_mapping_pit_id_fkey"
            columns: ["pit_id"]
            isOneToOne: false
            referencedRelation: "cook_history_view"
            referencedColumns: ["pit_id"]
          },
          {
            foreignKeyName: "pit_mapping_pit_id_fkey"
            columns: ["pit_id"]
            isOneToOne: false
            referencedRelation: "pits"
            referencedColumns: ["id"]
          },
        ]
      }
      pits: {
        Row: {
          brand: string | null
          created_at: string | null
          default_temp: number | null
          default_wood: string | null
          fuel_type: string | null
          id: string
          is_default: boolean | null
          model: string | null
          name: string
          notes: string | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          brand?: string | null
          created_at?: string | null
          default_temp?: number | null
          default_wood?: string | null
          fuel_type?: string | null
          id?: string
          is_default?: boolean | null
          model?: string | null
          name: string
          notes?: string | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          brand?: string | null
          created_at?: string | null
          default_temp?: number | null
          default_wood?: string | null
          fuel_type?: string | null
          id?: string
          is_default?: boolean | null
          model?: string | null
          name?: string
          notes?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "account_overview"
            referencedColumns: ["user_id"]
          },
        ]
      }
      preacher_memory: {
        Row: {
          avg_finish_temp: number | null
          avg_rest_duration: number | null
          avg_stall_duration: number | null
          avg_wrap_temp: number | null
          bark_pattern: string | null
          fire_pattern: string | null
          id: string
          meat_type: string | null
          pit_id: string | null
          seasonal_pattern: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avg_finish_temp?: number | null
          avg_rest_duration?: number | null
          avg_stall_duration?: number | null
          avg_wrap_temp?: number | null
          bark_pattern?: string | null
          fire_pattern?: string | null
          id?: string
          meat_type?: string | null
          pit_id?: string | null
          seasonal_pattern?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avg_finish_temp?: number | null
          avg_rest_duration?: number | null
          avg_stall_duration?: number | null
          avg_wrap_temp?: number | null
          bark_pattern?: string | null
          fire_pattern?: string | null
          id?: string
          meat_type?: string | null
          pit_id?: string | null
          seasonal_pattern?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "preacher_memory_pit_id_fkey"
            columns: ["pit_id"]
            isOneToOne: false
            referencedRelation: "account_overview"
            referencedColumns: ["default_pit_id"]
          },
          {
            foreignKeyName: "preacher_memory_pit_id_fkey"
            columns: ["pit_id"]
            isOneToOne: false
            referencedRelation: "cook_history_view"
            referencedColumns: ["pit_id"]
          },
          {
            foreignKeyName: "preacher_memory_pit_id_fkey"
            columns: ["pit_id"]
            isOneToOne: false
            referencedRelation: "pits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "preacher_memory_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "account_overview"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          experience_level: string | null
          flavor_heat: number | null
          flavor_pepper: number | null
          flavor_salt: number | null
          flavor_smoke: number | null
          flavor_sweetness: number | null
          home_region: string | null
          id: string
          profile_complete: boolean | null
          timezone: string | null
          updated_at: string | null
          user_id: string
          wood_preference: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          experience_level?: string | null
          flavor_heat?: number | null
          flavor_pepper?: number | null
          flavor_salt?: number | null
          flavor_smoke?: number | null
          flavor_sweetness?: number | null
          home_region?: string | null
          id?: string
          profile_complete?: boolean | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
          wood_preference?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          experience_level?: string | null
          flavor_heat?: number | null
          flavor_pepper?: number | null
          flavor_salt?: number | null
          flavor_smoke?: number | null
          flavor_sweetness?: number | null
          home_region?: string | null
          id?: string
          profile_complete?: boolean | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
          wood_preference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "account_overview"
            referencedColumns: ["user_id"]
          },
        ]
      }
      stripe_customers: {
        Row: {
          created_at: string | null
          customer_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stripe_customers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "account_overview"
            referencedColumns: ["user_id"]
          },
        ]
      }
      stripe_events: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          type: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id: string
          type?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          type?: string | null
        }
        Relationships: []
      }
      stripe_prices: {
        Row: {
          created_at: string | null
          currency: string | null
          id: string
          interval: string | null
          nickname: string | null
          product_id: string | null
          unit_amount: number | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          id: string
          interval?: string | null
          nickname?: string | null
          product_id?: string | null
          unit_amount?: number | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          id?: string
          interval?: string | null
          nickname?: string | null
          product_id?: string | null
          unit_amount?: number | null
        }
        Relationships: []
      }
      stripe_products: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          id: string
          name: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id: string
          name?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      stripe_subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          price_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id: string
          price_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          price_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stripe_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "account_overview"
            referencedColumns: ["user_id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "account_overview"
            referencedColumns: ["user_id"]
          },
        ]
      }
      usage: {
        Row: {
          count: number | null
          created_at: string | null
          id: string
          month: string
          stage: number
          updated_at: string | null
          user_id: string
          warning_sent: boolean | null
        }
        Insert: {
          count?: number | null
          created_at?: string | null
          id?: string
          month: string
          stage: number
          updated_at?: string | null
          user_id: string
          warning_sent?: boolean | null
        }
        Update: {
          count?: number | null
          created_at?: string | null
          id?: string
          month?: string
          stage?: number
          updated_at?: string | null
          user_id?: string
          warning_sent?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "account_overview"
            referencedColumns: ["user_id"]
          },
        ]
      }
      usage_events: {
        Row: {
          created_at: string | null
          feature: string
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          feature: string
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          feature?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "account_overview"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_feature_flags: {
        Row: {
          feature_key: string
          user_id: string
        }
        Insert: {
          feature_key: string
          user_id: string
        }
        Update: {
          feature_key?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_feature_flags_feature_key_fkey"
            columns: ["feature_key"]
            isOneToOne: false
            referencedRelation: "feature_flags"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "user_feature_flags_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "account_overview"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          beta_features_enabled: boolean | null
          created_at: string | null
          default_pit_id: string | null
          notifications_enabled: boolean | null
          onboarding_complete: boolean | null
          preacher_voice_mode: string | null
          timeline_mode: string | null
          units: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          beta_features_enabled?: boolean | null
          created_at?: string | null
          default_pit_id?: string | null
          notifications_enabled?: boolean | null
          onboarding_complete?: boolean | null
          preacher_voice_mode?: string | null
          timeline_mode?: string | null
          units?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          beta_features_enabled?: boolean | null
          created_at?: string | null
          default_pit_id?: string | null
          notifications_enabled?: boolean | null
          onboarding_complete?: boolean | null
          preacher_voice_mode?: string | null
          timeline_mode?: string | null
          units?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_default_pit_id_fkey"
            columns: ["default_pit_id"]
            isOneToOne: false
            referencedRelation: "account_overview"
            referencedColumns: ["default_pit_id"]
          },
          {
            foreignKeyName: "user_preferences_default_pit_id_fkey"
            columns: ["default_pit_id"]
            isOneToOne: false
            referencedRelation: "cook_history_view"
            referencedColumns: ["pit_id"]
          },
          {
            foreignKeyName: "user_preferences_default_pit_id_fkey"
            columns: ["default_pit_id"]
            isOneToOne: false
            referencedRelation: "pits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "account_overview"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      account_overview: {
        Row: {
          current_period_end: string | null
          default_pit_id: string | null
          default_pit_name: string | null
          default_pit_type: string | null
          display_name: string | null
          experience_level: string | null
          home_region: string | null
          notifications_enabled: boolean | null
          subscription_status: string | null
          timezone: string | null
          units: string | null
          user_id: string | null
        }
        Relationships: []
      }
      billing_overview: {
        Row: {
          status: string | null
          user_id: string | null
        }
        Insert: {
          status?: string | null
          user_id?: string | null
        }
        Update: {
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "account_overview"
            referencedColumns: ["user_id"]
          },
        ]
      }
      cook_history_view: {
        Row: {
          cook_id: string | null
          label: string | null
          last_updated_at: string | null
          pit_id: string | null
          pit_name: string | null
          pit_type: string | null
          rating: number | null
          started_at: string | null
          status: string | null
          summary_notes: string | null
          tags: string[] | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cooks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "account_overview"
            referencedColumns: ["user_id"]
          },
        ]
      }
      daily_usage: {
        Row: {
          count: number | null
          day: string | null
          feature: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "account_overview"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Functions: {
      check_rate_limit: {
        Args: {
          p_endpoint: string
          p_max_requests?: number
          p_user_id: string
          p_window_seconds?: number
        }
        Returns: boolean
      }
      delete_user_account: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      increment_usage: { Args: { stage: number }; Returns: undefined }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      cook_status: "in_progress" | "completed" | "cancelled"
      pit_type:
        | "offset"
        | "pellet"
        | "kamado"
        | "kettle"
        | "vertical"
        | "custom"
      step_type:
        | "fire_up"
        | "bark_check"
        | "spritz"
        | "wrap"
        | "stall_start"
        | "stall_end"
        | "finish"
        | "rest_start"
        | "rest_end"
        | "side_step"
      subscription_status: "active" | "inactive" | "past_due" | "canceled"
      subscription_tier: "free" | "backyard" | "pitmaster"
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
      cook_status: ["in_progress", "completed", "cancelled"],
      pit_type: ["offset", "pellet", "kamado", "kettle", "vertical", "custom"],
      step_type: [
        "fire_up",
        "bark_check",
        "spritz",
        "wrap",
        "stall_start",
        "stall_end",
        "finish",
        "rest_start",
        "rest_end",
        "side_step",
      ],
      subscription_status: ["active", "inactive", "past_due", "canceled"],
      subscription_tier: ["free", "backyard", "pitmaster"],
    },
  },
} as const
