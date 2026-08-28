/* eslint-disable @typescript-eslint/no-empty-object-type */
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
      admin_users: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          is_blocked: boolean
          role: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          is_blocked?: boolean
          role: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          is_blocked?: boolean
          role?: string
        }
        Relationships: []
      }
      banners: {
        Row: {
          created_at: string
          id: number
          image_url: string
          is_active: boolean
          link_url: string | null
          sort_order: number
          subtitle: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: never
          image_url: string
          is_active?: boolean
          link_url?: string | null
          sort_order?: number
          subtitle?: string
          title?: string
        }
        Update: {
          created_at?: string
          id?: never
          image_url?: string
          is_active?: boolean
          link_url?: string | null
          sort_order?: number
          subtitle?: string
          title?: string
        }
        Relationships: []
      }
      complaints: {
        Row: {
          agency: string
          created_at: string
          details: string | null
          id: string
          latitude: number | null
          location_label: string | null
          longitude: number | null
          merchant: string | null
          official_price: number | null
          photo_urls: string[]
          practiced_price: number | null
          product: string
          status: string
          type: string
          user_id: string
        }
        Insert: {
          agency: string
          created_at?: string
          details?: string | null
          id?: string
          latitude?: number | null
          location_label?: string | null
          longitude?: number | null
          merchant?: string | null
          official_price?: number | null
          photo_urls?: string[]
          practiced_price?: number | null
          product: string
          status?: string
          type?: string
          user_id?: string
        }
        Update: {
          agency?: string
          created_at?: string
          details?: string | null
          id?: string
          latitude?: number | null
          location_label?: string | null
          longitude?: number | null
          merchant?: string | null
          official_price?: number | null
          photo_urls?: string[]
          practiced_price?: number | null
          product?: string
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaints_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mercuriale: {
        Row: {
          category: string
          category_id: number | null
          group_id: number | null
          group_name: string
          id: number
          price_retail: number
          price_semi: number
          price_wholesale: number
          product: string
          sort_order: number
          subcategory: string
          subcategory_id: number | null
          unit: string
        }
        Insert: {
          category: string
          category_id?: number | null
          group_id?: number | null
          group_name: string
          id?: never
          price_retail: number
          price_semi: number
          price_wholesale: number
          product: string
          sort_order?: number
          subcategory: string
          subcategory_id?: number | null
          unit: string
        }
        Update: {
          category?: string
          category_id?: number | null
          group_id?: number | null
          group_name?: string
          id?: never
          price_retail?: number
          price_semi?: number
          price_wholesale?: number
          product?: string
          sort_order?: number
          subcategory?: string
          subcategory_id?: number | null
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "mercuriale_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "mercuriale_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mercuriale_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "mercuriale_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mercuriale_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "mercuriale_subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      mercuriale_categories: {
        Row: {
          created_at: string
          description: string | null
          group_id: number
          id: number
          name: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          group_id: number
          id?: never
          name: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          group_id?: number
          id?: never
          name?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "mercuriale_categories_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "mercuriale_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      mercuriale_groups: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: never
          name: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: never
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      mercuriale_subcategories: {
        Row: {
          category_id: number
          created_at: string
          description: string | null
          id: number
          name: string
          sort_order: number
        }
        Insert: {
          category_id: number
          created_at?: string
          description?: string | null
          id?: never
          name: string
          sort_order?: number
        }
        Update: {
          category_id?: number
          created_at?: string
          description?: string | null
          id?: never
          name?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "mercuriale_subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "mercuriale_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      news: {
        Row: {
          content: string | null
          excerpt: string
          id: number
          published_date: string
          sort_order: number
          source: string
          tag: string
          tag_color: string
          title: string
        }
        Insert: {
          content?: string | null
          excerpt: string
          id?: never
          published_date?: string
          sort_order?: number
          source?: string
          tag: string
          tag_color?: string
          title: string
        }
        Update: {
          content?: string | null
          excerpt?: string
          id?: never
          published_date?: string
          sort_order?: number
          source?: string
          tag?: string
          tag_color?: string
          title?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: number
          sent_by: string | null
          title: string
        }
        Insert: {
          body?: string
          created_at?: string
          id?: never
          sent_by?: string | null
          title: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: never
          sent_by?: string | null
          title?: string
        }
        Relationships: []
      }
      premium_plans: {
        Row: {
          code: string
          features: string[]
          id: number
          is_active: boolean
          name: string
          period_months: number
          price_fcfa: number
          sort_order: number
        }
        Insert: {
          code: string
          features?: string[]
          id?: never
          is_active?: boolean
          name: string
          period_months?: number
          price_fcfa: number
          sort_order?: number
        }
        Update: {
          code?: string
          features?: string[]
          id?: never
          is_active?: boolean
          name?: string
          period_months?: number
          price_fcfa?: number
          sort_order?: number
        }
        Relationships: []
      }
      products: {
        Row: {
          aganor_certified: boolean
          allergens: string[] | null
          authentic: boolean
          authenticity_note: string | null
          barcode: string
          brand: string | null
          category: string | null
          image_url: string | null
          ingredients: string[] | null
          name: string
          nutri_score: string | null
          origin: string | null
          warnings: string[] | null
        }
        Insert: {
          aganor_certified?: boolean
          allergens?: string[] | null
          authentic?: boolean
          authenticity_note?: string | null
          barcode: string
          brand?: string | null
          category?: string | null
          image_url?: string | null
          ingredients?: string[] | null
          name: string
          nutri_score?: string | null
          origin?: string | null
          warnings?: string[] | null
        }
        Update: {
          aganor_certified?: boolean
          allergens?: string[] | null
          authentic?: boolean
          authenticity_note?: string | null
          barcode?: string
          brand?: string | null
          category?: string | null
          image_url?: string | null
          ingredients?: string[] | null
          name?: string
          nutri_score?: string | null
          origin?: string | null
          warnings?: string[] | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      push_tokens: {
        Row: {
          created_at: string
          id: string
          platform: string
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          platform?: string
          token: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          platform?: string
          token?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_articles: {
        Row: {
          created_at: string
          news_id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          news_id: number
          user_id: string
        }
        Update: {
          created_at?: string
          news_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_articles_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
        ]
      }
      scan_history: {
        Row: {
          barcode: string | null
          brand: string | null
          created_at: string
          id: string
          image_url: string | null
          nutri_score: string | null
          product_name: string
          status: string
          user_id: string
        }
        Insert: {
          barcode?: string | null
          brand?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          nutri_score?: string | null
          product_name: string
          status?: string
          user_id?: string
        }
        Update: {
          barcode?: string | null
          brand?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          nutri_score?: string | null
          product_name?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          plan_code: string
          source: string
          started_at: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_code: string
          source?: string
          started_at?: string
          status?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_code?: string
          source?: string
          started_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_code_fkey"
            columns: ["plan_code"]
            isOneToOne: false
            referencedRelation: "premium_plans"
            referencedColumns: ["code"]
          },
        ]
      }
      webtv: {
        Row: {
          description: string
          duration: string
          id: number
          is_published: boolean
          published_date: string
          sort_order: number
          tag: string
          thumbnail_url: string | null
          title: string
          video_url: string | null
        }
        Insert: {
          description?: string
          duration: string
          id?: never
          is_published?: boolean
          published_date?: string
          sort_order?: number
          tag: string
          thumbnail_url?: string | null
          title: string
          video_url?: string | null
        }
        Update: {
          description?: string
          duration?: string
          id?: never
          is_published?: boolean
          published_date?: string
          sort_order?: number
          tag?: string
          thumbnail_url?: string | null
          title?: string
          video_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_backoffice_admin: {
        Args: { required_roles: string[] }
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
