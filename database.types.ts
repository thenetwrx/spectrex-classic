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
      profiles: {
        Row: {
          admin: boolean
          avatar_url: string
          description: string | null
          full_name: string
          global_name: string
          id: string
          premium_since: number | null
          provider_id: string
          public: boolean
          updated_at: number | null
        }
        Insert: {
          admin?: boolean
          avatar_url: string
          description?: string | null
          full_name: string
          global_name: string
          id: string
          premium_since?: number | null
          provider_id: string
          public?: boolean
          updated_at?: number | null
        }
        Update: {
          admin?: boolean
          avatar_url?: string
          description?: string | null
          full_name?: string
          global_name?: string
          id?: string
          premium_since?: number | null
          provider_id?: string
          public?: boolean
          updated_at?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      server_reports: {
        Row: {
          created_at: string
          description: string
          from_id: string
          from_provider_id: string
          id: number
          server_id: string
          server_owner_id: string
          server_owner_provider_id: string
          type: string
        }
        Insert: {
          created_at?: string
          description: string
          from_id: string
          from_provider_id: string
          id?: number
          server_id: string
          server_owner_id: string
          server_owner_provider_id: string
          type: string
        }
        Update: {
          created_at?: string
          description?: string
          from_id?: string
          from_provider_id?: string
          id?: number
          server_id?: string
          server_owner_id?: string
          server_owner_provider_id?: string
          type?: string
        }
        Relationships: []
      }
      servers: {
        Row: {
          approved_at: number | null
          approximate_member_count: string
          approximate_presence_count: string
          banned: boolean
          bumped_at: number
          category: string | null
          created_at: number
          description: string | null
          icon: string | null
          id: number
          invite_link: string | null
          language: string | null
          nsfw: boolean
          owner_id: string
          owner_provider_id: string
          public: boolean
          server_id: string
          server_name: string
          tags: string[]
          updated_at: number
        }
        Insert: {
          approved_at?: number | null
          approximate_member_count: string
          approximate_presence_count: string
          banned?: boolean
          bumped_at: number
          category?: string | null
          created_at: number
          description?: string | null
          icon?: string | null
          id?: number
          invite_link?: string | null
          language?: string | null
          nsfw?: boolean
          owner_id: string
          owner_provider_id: string
          public?: boolean
          server_id: string
          server_name: string
          tags?: string[]
          updated_at: number
        }
        Update: {
          approved_at?: number | null
          approximate_member_count?: string
          approximate_presence_count?: string
          banned?: boolean
          bumped_at?: number
          category?: string | null
          created_at?: number
          description?: string | null
          icon?: string | null
          id?: number
          invite_link?: string | null
          language?: string | null
          nsfw?: boolean
          owner_id?: string
          owner_provider_id?: string
          public?: boolean
          server_id?: string
          server_name?: string
          tags?: string[]
          updated_at?: number
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
