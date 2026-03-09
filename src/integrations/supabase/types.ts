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
      advisor_training_jobs: {
        Row: {
          advisor_id: string
          chunks_processed: number | null
          completed_at: string | null
          created_at: string
          created_by: string
          error_message: string | null
          id: string
          knowledge_sources: string[] | null
          started_at: string | null
          status: string
          total_chunks: number | null
        }
        Insert: {
          advisor_id: string
          chunks_processed?: number | null
          completed_at?: string | null
          created_at?: string
          created_by: string
          error_message?: string | null
          id?: string
          knowledge_sources?: string[] | null
          started_at?: string | null
          status?: string
          total_chunks?: number | null
        }
        Update: {
          advisor_id?: string
          chunks_processed?: number | null
          completed_at?: string | null
          created_at?: string
          created_by?: string
          error_message?: string | null
          id?: string
          knowledge_sources?: string[] | null
          started_at?: string | null
          status?: string
          total_chunks?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "advisor_training_jobs_advisor_id_fkey"
            columns: ["advisor_id"]
            isOneToOne: false
            referencedRelation: "advisors"
            referencedColumns: ["id"]
          },
        ]
      }
      advisors: {
        Row: {
          access_roles: string[] | null
          assigned_user_id: string | null
          avatar_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          graph_nodes: string[] | null
          id: string
          knowledge_refs: string[] | null
          model_config: Json | null
          name: string
          persona_profile: Json
          prompt_dna: Json
          role: string
          sessions_count: number | null
          state: string
          telemetry_enabled: boolean | null
          tenant_id: string
          tier: string | null
          updated_at: string
          vector_index: string | null
        }
        Insert: {
          access_roles?: string[] | null
          assigned_user_id?: string | null
          avatar_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          graph_nodes?: string[] | null
          id?: string
          knowledge_refs?: string[] | null
          model_config?: Json | null
          name: string
          persona_profile?: Json
          prompt_dna?: Json
          role: string
          sessions_count?: number | null
          state?: string
          telemetry_enabled?: boolean | null
          tenant_id: string
          tier?: string | null
          updated_at?: string
          vector_index?: string | null
        }
        Update: {
          access_roles?: string[] | null
          assigned_user_id?: string | null
          avatar_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          graph_nodes?: string[] | null
          id?: string
          knowledge_refs?: string[] | null
          model_config?: Json | null
          name?: string
          persona_profile?: Json
          prompt_dna?: Json
          role?: string
          sessions_count?: number | null
          state?: string
          telemetry_enabled?: boolean | null
          tenant_id?: string
          tier?: string | null
          updated_at?: string
          vector_index?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          created_at: string
          id: string
          session_type: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          session_type?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          session_type?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      colleagues: {
        Row: {
          advisor_id: string | null
          created_at: string | null
          department: string | null
          display_name: string
          id: string
          is_former_employee: boolean | null
          job_title: string | null
          tenant_id: string
        }
        Insert: {
          advisor_id?: string | null
          created_at?: string | null
          department?: string | null
          display_name: string
          id?: string
          is_former_employee?: boolean | null
          job_title?: string | null
          tenant_id: string
        }
        Update: {
          advisor_id?: string | null
          created_at?: string | null
          department?: string | null
          display_name?: string
          id?: string
          is_former_employee?: boolean | null
          job_title?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "colleagues_advisor_id_fkey"
            columns: ["advisor_id"]
            isOneToOne: false
            referencedRelation: "advisors"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          advisor: string
          body: string
          created_at: string
          icon_type: string | null
          id: string
          read: boolean | null
          severity: string
          title: string
          user_id: string
        }
        Insert: {
          advisor: string
          body: string
          created_at?: string
          icon_type?: string | null
          id?: string
          read?: boolean | null
          severity?: string
          title: string
          user_id: string
        }
        Update: {
          advisor?: string
          body?: string
          created_at?: string
          icon_type?: string | null
          id?: string
          read?: boolean | null
          severity?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          display_name: string | null
          id: string
          is_former_employee: boolean | null
          job_title: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          display_name?: string | null
          id: string
          is_former_employee?: boolean | null
          job_title?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          display_name?: string | null
          id?: string
          is_former_employee?: boolean | null
          job_title?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      team_colleagues: {
        Row: {
          colleague_id: string
          id: string
          role: string | null
          team_id: string
        }
        Insert: {
          colleague_id: string
          id?: string
          role?: string | null
          team_id: string
        }
        Update: {
          colleague_id?: string
          id?: string
          role?: string | null
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_colleagues_colleague_id_fkey"
            columns: ["colleague_id"]
            isOneToOne: false
            referencedRelation: "colleagues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_colleagues_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          id: string
          joined_at: string
          role: string
          team_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          role?: string
          team_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          role?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
          region: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          name: string
          region?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          region?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      twin_conversation_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "twin_conversation_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "twin_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      twin_conversations: {
        Row: {
          created_at: string | null
          id: string
          target_id: string
          target_name: string
          target_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          target_id: string
          target_name: string
          target_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          target_id?: string
          target_name?: string
          target_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      twin_memories: {
        Row: {
          advisor_id: string
          content: string
          created_at: string
          id: string
          memory_type: string
        }
        Insert: {
          advisor_id: string
          content: string
          created_at?: string
          id?: string
          memory_type: string
        }
        Update: {
          advisor_id?: string
          content?: string
          created_at?: string
          id?: string
          memory_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "twin_memories_advisor_id_fkey"
            columns: ["advisor_id"]
            isOneToOne: false
            referencedRelation: "advisors"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_user_team_ids: { Args: { _user_id: string }; Returns: string[] }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_team_member: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "vciso" | "soc_analyst"
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
      app_role: ["admin", "vciso", "soc_analyst"],
    },
  },
} as const
