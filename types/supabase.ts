export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    // Allows to automatically instanciate createClient with right options
    // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
    __InternalSupabase: {
        PostgrestVersion: "12.2.3 (519615d)"
    }
    graphql_public: {
        Tables: {
            [_ in never]: never
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            graphql: {
                Args: {
                    operationName?: string
                    query?: string
                    variables?: Json
                    extensions?: Json
                }
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
    public: {
        Tables: {
            connection_threads: {
                Row: {
                    body: string | null
                    connection_id: string | null
                    created_at: string | null
                    sender_email: string | null
                    subject: string | null
                    thread_id: string
                }
                Insert: {
                    body?: string | null
                    connection_id?: string | null
                    created_at?: string | null
                    sender_email?: string | null
                    subject?: string | null
                    thread_id?: string
                }
                Update: {
                    body?: string | null
                    connection_id?: string | null
                    created_at?: string | null
                    sender_email?: string | null
                    subject?: string | null
                    thread_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "connection_threads_connection_id_fkey"
                        columns: ["connection_id"]
                        isOneToOne: false
                        referencedRelation: "connections"
                        referencedColumns: ["connection_id"]
                    },
                    {
                        foreignKeyName: "connection_threads_connection_id_fkey"
                        columns: ["connection_id"]
                        isOneToOne: false
                        referencedRelation: "enriched_connections"
                        referencedColumns: ["connection_id"]
                    },
                ]
            }
            connections: {
                Row: {
                    connection_id: string
                    created_at: string
                    event_id: string | null
                    group_id: string | null
                    status: Database["public"]["Enums"]["connection_status"] | null
                    user1_id: string
                    user2_id: string
                }
                Insert: {
                    connection_id: string
                    created_at?: string
                    event_id?: string | null
                    group_id?: string | null
                    status?: Database["public"]["Enums"]["connection_status"] | null
                    user1_id?: string
                    user2_id?: string
                }
                Update: {
                    connection_id?: string
                    created_at?: string
                    event_id?: string | null
                    group_id?: string | null
                    status?: Database["public"]["Enums"]["connection_status"] | null
                    user1_id?: string
                    user2_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "connections_event_id_fkey"
                        columns: ["event_id"]
                        isOneToOne: false
                        referencedRelation: "events"
                        referencedColumns: ["event_id"]
                    },
                    {
                        foreignKeyName: "connections_group_id_fkey"
                        columns: ["group_id"]
                        isOneToOne: false
                        referencedRelation: "groups"
                        referencedColumns: ["group_id"]
                    },
                    {
                        foreignKeyName: "connections_user1_id_fkey"
                        columns: ["user1_id"]
                        isOneToOne: false
                        referencedRelation: "members"
                        referencedColumns: ["user_id"]
                    },
                    {
                        foreignKeyName: "connections_user2_id_fkey"
                        columns: ["user2_id"]
                        isOneToOne: false
                        referencedRelation: "members"
                        referencedColumns: ["user_id"]
                    },
                ]
            }
            event_attendees: {
                Row: {
                    event_id: string
                    registered_status:
                        | Database["public"]["Enums"]["registration_status"]
                        | null
                    user_id: string
                    wants_intro: boolean
                }
                Insert: {
                    event_id: string
                    registered_status?:
                        | Database["public"]["Enums"]["registration_status"]
                        | null
                    user_id: string
                    wants_intro?: boolean
                }
                Update: {
                    event_id?: string
                    registered_status?:
                        | Database["public"]["Enums"]["registration_status"]
                        | null
                    user_id?: string
                    wants_intro?: boolean
                }
                Relationships: [
                    {
                        foreignKeyName: "event_attendees_event_id_fkey"
                        columns: ["event_id"]
                        isOneToOne: false
                        referencedRelation: "events"
                        referencedColumns: ["event_id"]
                    },
                    {
                        foreignKeyName: "event_attendees_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "members"
                        referencedColumns: ["user_id"]
                    },
                ]
            }
            events: {
                Row: {
                    created_at: string
                    event_date: string | null
                    event_id: string
                    event_name: string | null
                    group_id: string | null
                }
                Insert: {
                    created_at?: string
                    event_date?: string | null
                    event_id?: string
                    event_name?: string | null
                    group_id?: string | null
                }
                Update: {
                    created_at?: string
                    event_date?: string | null
                    event_id?: string
                    event_name?: string | null
                    group_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "events_group_id_fkey"
                        columns: ["group_id"]
                        isOneToOne: false
                        referencedRelation: "groups"
                        referencedColumns: ["group_id"]
                    },
                ]
            }
            groups: {
                Row: {
                    created_at: string
                    description: string | null
                    group_id: string
                    group_name: string
                }
                Insert: {
                    created_at?: string
                    description?: string | null
                    group_id?: string
                    group_name: string
                }
                Update: {
                    created_at?: string
                    description?: string | null
                    group_id?: string
                    group_name?: string
                }
                Relationships: []
            }
            members: {
                Row: {
                    class_year: number | null
                    company: string | null
                    created_at: string
                    email: string | null
                    first_name: string | null
                    group_id: string | null
                    job_title: string | null
                    last_name: string | null
                    name: string | null
                    school: string | null
                    updated_at: string | null
                    user_id: string
                }
                Insert: {
                    class_year?: number | null
                    company?: string | null
                    created_at?: string
                    email?: string | null
                    first_name?: string | null
                    group_id?: string | null
                    job_title?: string | null
                    last_name?: string | null
                    name?: string | null
                    school?: string | null
                    updated_at?: string | null
                    user_id: string
                }
                Update: {
                    class_year?: number | null
                    company?: string | null
                    created_at?: string
                    email?: string | null
                    first_name?: string | null
                    group_id?: string | null
                    job_title?: string | null
                    last_name?: string | null
                    name?: string | null
                    school?: string | null
                    updated_at?: string | null
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "members_group_id_fkey"
                        columns: ["group_id"]
                        isOneToOne: false
                        referencedRelation: "groups"
                        referencedColumns: ["group_id"]
                    },
                ]
            }
            user_groups: {
                Row: {
                    created_at: string
                    group_id: string | null
                    id: number
                    role: Database["public"]["Enums"]["group_role"] | null
                    user_id: string | null
                }
                Insert: {
                    created_at?: string
                    group_id?: string | null
                    id?: number
                    role?: Database["public"]["Enums"]["group_role"] | null
                    user_id?: string | null
                }
                Update: {
                    created_at?: string
                    group_id?: string | null
                    id?: number
                    role?: Database["public"]["Enums"]["group_role"] | null
                    user_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "user_groups_group_id_fkey"
                        columns: ["group_id"]
                        isOneToOne: false
                        referencedRelation: "groups"
                        referencedColumns: ["group_id"]
                    },
                ]
            }
            users: {
                Row: {
                    created_at: string
                    email_address: string | null
                    first_name: string | null
                    id: string
                    last_name: string | null
                }
                Insert: {
                    created_at?: string
                    email_address?: string | null
                    first_name?: string | null
                    id?: string
                    last_name?: string | null
                }
                Update: {
                    created_at?: string
                    email_address?: string | null
                    first_name?: string | null
                    id?: string
                    last_name?: string | null
                }
                Relationships: []
            }
        }
        Views: {
            enriched_connections: {
                Row: {
                    connection_id: string | null
                    event_id: string | null
                    latest_created_at: string | null
                    latest_subject: string | null
                    status: Database["public"]["Enums"]["connection_status"] | null
                    user1_id: string | null
                    user1_name: string | null
                    user2_id: string | null
                    user2_name: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "connections_event_id_fkey"
                        columns: ["event_id"]
                        isOneToOne: false
                        referencedRelation: "events"
                        referencedColumns: ["event_id"]
                    },
                    {
                        foreignKeyName: "connections_user1_id_fkey"
                        columns: ["user1_id"]
                        isOneToOne: false
                        referencedRelation: "members"
                        referencedColumns: ["user_id"]
                    },
                    {
                        foreignKeyName: "connections_user2_id_fkey"
                        columns: ["user2_id"]
                        isOneToOne: false
                        referencedRelation: "members"
                        referencedColumns: ["user_id"]
                    },
                ]
            }
        }
        Functions: {
            get_member_columns: {
                Args: Record<PropertyKey, never>
                Returns: string[]
            }
        }
        Enums: {
            connection_status: "email_not_sent" | "pending" | "accepted" | "declined"
            group_role: "owner" | "admin" | "member"
            registration_status: "approved" | "pending_approval" | "waitlist"
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
    graphql_public: {
        Enums: {},
    },
    public: {
        Enums: {
            connection_status: ["email_not_sent", "pending", "accepted", "declined"],
            group_role: ["owner", "admin", "member"],
            registration_status: ["approved", "pending_approval", "waitlist"],
        },
    },
} as const
