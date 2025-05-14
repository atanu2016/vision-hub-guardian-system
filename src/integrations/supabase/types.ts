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
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          is_admin: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
          is_admin?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          updated_at?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: { user_id?: string }
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
