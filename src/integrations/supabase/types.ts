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
      advanced_settings: {
        Row: {
          auth_background_url: string | null
          auth_logo_url: string | null
          debug_mode: boolean | null
          id: string
          log_level: string | null
          log_retention_days: number | null
          mfa_enabled: boolean | null
          mfa_secret: string | null
          min_log_level: string | null
          server_port: string | null
          updated_at: string | null
        }
        Insert: {
          auth_background_url?: string | null
          auth_logo_url?: string | null
          debug_mode?: boolean | null
          id?: string
          log_level?: string | null
          log_retention_days?: number | null
          mfa_enabled?: boolean | null
          mfa_secret?: string | null
          min_log_level?: string | null
          server_port?: string | null
          updated_at?: string | null
        }
        Update: {
          auth_background_url?: string | null
          auth_logo_url?: string | null
          debug_mode?: boolean | null
          id?: string
          log_level?: string | null
          log_retention_days?: number | null
          mfa_enabled?: boolean | null
          mfa_secret?: string | null
          min_log_level?: string | null
          server_port?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      alert_settings: {
        Row: {
          camera_offline: boolean
          email_address: string | null
          email_notifications: boolean
          id: string
          motion_detection: boolean
          notification_sound: string | null
          push_notifications: boolean
          storage_warning: boolean
          updated_at: string | null
        }
        Insert: {
          camera_offline?: boolean
          email_address?: string | null
          email_notifications?: boolean
          id?: string
          motion_detection?: boolean
          notification_sound?: string | null
          push_notifications?: boolean
          storage_warning?: boolean
          updated_at?: string | null
        }
        Update: {
          camera_offline?: boolean
          email_address?: string | null
          email_notifications?: boolean
          id?: string
          motion_detection?: boolean
          notification_sound?: string | null
          push_notifications?: boolean
          storage_warning?: boolean
          updated_at?: string | null
        }
        Relationships: []
      }
      camera_recording_status: {
        Row: {
          camera_id: string
          enabled: boolean
          id: string
          updated_at: string | null
        }
        Insert: {
          camera_id: string
          enabled?: boolean
          id?: string
          updated_at?: string | null
        }
        Update: {
          camera_id?: string
          enabled?: boolean
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "camera_recording_status_camera_id_fkey"
            columns: ["camera_id"]
            isOneToOne: true
            referencedRelation: "cameras"
            referencedColumns: ["id"]
          },
        ]
      }
      cameras: {
        Row: {
          connectiontype: string | null
          group: string | null
          id: string
          ipaddress: string
          lastseen: string
          location: string
          manufacturer: string | null
          model: string | null
          motiondetection: boolean | null
          name: string
          onvifpath: string | null
          password: string | null
          port: number | null
          recording: boolean | null
          rtmpurl: string | null
          status: string
          thumbnail: string | null
          username: string | null
        }
        Insert: {
          connectiontype?: string | null
          group?: string | null
          id?: string
          ipaddress: string
          lastseen?: string
          location: string
          manufacturer?: string | null
          model?: string | null
          motiondetection?: boolean | null
          name: string
          onvifpath?: string | null
          password?: string | null
          port?: number | null
          recording?: boolean | null
          rtmpurl?: string | null
          status?: string
          thumbnail?: string | null
          username?: string | null
        }
        Update: {
          connectiontype?: string | null
          group?: string | null
          id?: string
          ipaddress?: string
          lastseen?: string
          location?: string
          manufacturer?: string | null
          model?: string | null
          motiondetection?: boolean | null
          name?: string
          onvifpath?: string | null
          password?: string | null
          port?: number | null
          recording?: boolean | null
          rtmpurl?: string | null
          status?: string
          thumbnail?: string | null
          username?: string | null
        }
        Relationships: []
      }
      database_config: {
        Row: {
          db_type: string
          id: string
          mysql_database: string | null
          mysql_host: string | null
          mysql_password: string | null
          mysql_port: string | null
          mysql_ssl: boolean | null
          mysql_user: string | null
          updated_at: string | null
        }
        Insert: {
          db_type?: string
          id?: string
          mysql_database?: string | null
          mysql_host?: string | null
          mysql_password?: string | null
          mysql_port?: string | null
          mysql_ssl?: boolean | null
          mysql_user?: string | null
          updated_at?: string | null
        }
        Update: {
          db_type?: string
          id?: string
          mysql_database?: string | null
          mysql_host?: string | null
          mysql_password?: string | null
          mysql_port?: string | null
          mysql_ssl?: boolean | null
          mysql_user?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          is_admin: boolean | null
          mfa_enrolled: boolean | null
          mfa_required: boolean | null
          mfa_secret: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
          is_admin?: boolean | null
          mfa_enrolled?: boolean | null
          mfa_required?: boolean | null
          mfa_secret?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          mfa_enrolled?: boolean | null
          mfa_required?: boolean | null
          mfa_secret?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      recording_settings: {
        Row: {
          continuous: boolean
          days_of_week: string[] | null
          id: string
          motion_detection: boolean
          quality: string | null
          schedule_type: string
          time_end: string | null
          time_start: string | null
          updated_at: string | null
        }
        Insert: {
          continuous?: boolean
          days_of_week?: string[] | null
          id?: string
          motion_detection?: boolean
          quality?: string | null
          schedule_type?: string
          time_end?: string | null
          time_start?: string | null
          updated_at?: string | null
        }
        Update: {
          continuous?: boolean
          days_of_week?: string[] | null
          id?: string
          motion_detection?: boolean
          quality?: string | null
          schedule_type?: string
          time_end?: string | null
          time_start?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      smtp_config: {
        Row: {
          enabled: boolean | null
          from_email: string | null
          id: string
          password: string | null
          port: string | null
          server: string | null
          updated_at: string | null
          use_ssl: boolean | null
          username: string | null
        }
        Insert: {
          enabled?: boolean | null
          from_email?: string | null
          id?: string
          password?: string | null
          port?: string | null
          server?: string | null
          updated_at?: string | null
          use_ssl?: boolean | null
          username?: string | null
        }
        Update: {
          enabled?: boolean | null
          from_email?: string | null
          id?: string
          password?: string | null
          port?: string | null
          server?: string | null
          updated_at?: string | null
          use_ssl?: boolean | null
          username?: string | null
        }
        Relationships: []
      }
      storage_settings: {
        Row: {
          id: string
          nasaddress: string | null
          naspassword: string | null
          naspath: string | null
          nasusername: string | null
          overwriteoldest: boolean
          path: string | null
          retentiondays: number
          s3accesskey: string | null
          s3bucket: string | null
          s3endpoint: string | null
          s3region: string | null
          s3secretkey: string | null
          type: string
        }
        Insert: {
          id?: string
          nasaddress?: string | null
          naspassword?: string | null
          naspath?: string | null
          nasusername?: string | null
          overwriteoldest?: boolean
          path?: string | null
          retentiondays?: number
          s3accesskey?: string | null
          s3bucket?: string | null
          s3endpoint?: string | null
          s3region?: string | null
          s3secretkey?: string | null
          type?: string
        }
        Update: {
          id?: string
          nasaddress?: string | null
          naspassword?: string | null
          naspath?: string | null
          nasusername?: string | null
          overwriteoldest?: boolean
          path?: string | null
          retentiondays?: number
          s3accesskey?: string | null
          s3bucket?: string | null
          s3endpoint?: string | null
          s3region?: string | null
          s3secretkey?: string | null
          type?: string
        }
        Relationships: []
      }
      system_logs: {
        Row: {
          created_at: string | null
          details: string | null
          id: string
          level: string
          message: string
          source: string
          timestamp: string
        }
        Insert: {
          created_at?: string | null
          details?: string | null
          id?: string
          level: string
          message: string
          source: string
          timestamp?: string
        }
        Update: {
          created_at?: string | null
          details?: string | null
          id?: string
          level?: string
          message?: string
          source?: string
          timestamp?: string
        }
        Relationships: []
      }
      system_stats: {
        Row: {
          id: string
          last_updated: string | null
          offline_cameras: number | null
          online_cameras: number | null
          recording_cameras: number | null
          storage_percentage: number | null
          storage_total: string | null
          storage_used: string | null
          total_cameras: number | null
          uptime_hours: number | null
        }
        Insert: {
          id?: string
          last_updated?: string | null
          offline_cameras?: number | null
          online_cameras?: number | null
          recording_cameras?: number | null
          storage_percentage?: number | null
          storage_total?: string | null
          storage_used?: string | null
          total_cameras?: number | null
          uptime_hours?: number | null
        }
        Update: {
          id?: string
          last_updated?: string | null
          offline_cameras?: number | null
          online_cameras?: number | null
          recording_cameras?: number | null
          storage_percentage?: number | null
          storage_total?: string | null
          storage_used?: string | null
          total_cameras?: number | null
          uptime_hours?: number | null
        }
        Relationships: []
      }
      user_camera_access: {
        Row: {
          camera_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          camera_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          camera_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_camera_access_camera_id_fkey"
            columns: ["camera_id"]
            isOneToOne: false
            referencedRelation: "cameras"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      webhooks: {
        Row: {
          active: boolean
          created_at: string | null
          events: string[]
          id: string
          name: string
          updated_at: string | null
          url: string
        }
        Insert: {
          active?: boolean
          created_at?: string | null
          events?: string[]
          id?: string
          name: string
          updated_at?: string | null
          url: string
        }
        Update: {
          active?: boolean
          created_at?: string | null
          events?: string[]
          id?: string
          name?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_admin_status: {
        Args: { user_id?: string }
        Returns: boolean
      }
      get_user_role: {
        Args: { _user_id?: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
      is_admin: {
        Args: { user_id?: string }
        Returns: boolean
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
    }
    Enums: {
      user_role: "superadmin" | "admin" | "operator" | "user"
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
    Enums: {
      user_role: ["superadmin", "admin", "operator", "user"],
    },
  },
} as const
