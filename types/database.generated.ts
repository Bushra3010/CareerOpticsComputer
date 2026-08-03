// Hand-maintained until `npm run db:types` can run against a reachable Postgres
// connection (needs SUPABASE_DB_URL). Keep in sync with supabase/migrations/*.
// Regenerate with: supabase gen types typescript --project-id <ref> --schema public

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  __InternalSupabase: {
    PostgrestVersion: '12';
  };
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          currency_code: string;
          timezone: string;
          created_at: string;
          created_by: string | null;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: Partial<Database['public']['Tables']['organizations']['Row']> & {
          name: string;
          slug: string;
        };
        Update: Partial<Database['public']['Tables']['organizations']['Row']>;
      };
      profiles: {
        Row: {
          id: string;
          full_name: string;
          phone: string | null;
          is_platform_super_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & {
          id: string;
          full_name: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
      };
      centres: {
        Row: {
          id: string;
          organization_id: string;
          code: string;
          name: string;
          status: 'active' | 'suspended' | 'closed';
          state: string | null;
          city: string | null;
          pincode: string | null;
          address: string | null;
          created_at: string;
          created_by: string | null;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: Partial<Database['public']['Tables']['centres']['Row']> & {
          organization_id: string;
          code: string;
          name: string;
        };
        Update: Partial<Database['public']['Tables']['centres']['Row']>;
      };
      roles: {
        Row: {
          id: string;
          organization_id: string | null;
          code: string;
          name: string;
          is_system_role: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['roles']['Row']> & {
          code: string;
          name: string;
        };
        Update: Partial<Database['public']['Tables']['roles']['Row']>;
      };
      permissions: {
        Row: { code: string; description: string };
        Insert: { code: string; description: string };
        Update: Partial<Database['public']['Tables']['permissions']['Row']>;
      };
      role_permissions: {
        Row: { role_id: string; permission_code: string };
        Insert: { role_id: string; permission_code: string };
        Update: Partial<Database['public']['Tables']['role_permissions']['Row']>;
      };
      memberships: {
        Row: {
          id: string;
          user_id: string;
          organization_id: string;
          centre_id: string | null;
          role_id: string;
          status: 'active' | 'suspended' | 'revoked';
          created_at: string;
          created_by: string | null;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: Partial<Database['public']['Tables']['memberships']['Row']> & {
          user_id: string;
          organization_id: string;
          role_id: string;
        };
        Update: Partial<Database['public']['Tables']['memberships']['Row']>;
      };
      audit_logs: {
        Row: {
          id: string;
          organization_id: string | null;
          actor_id: string | null;
          action: string;
          table_name: string;
          row_id: string | null;
          reason: string | null;
          before_data: Json | null;
          after_data: Json | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['audit_logs']['Row']> & {
          action: string;
          table_name: string;
        };
        Update: never;
      };
      idempotency_keys: {
        Row: {
          key: string;
          organization_id: string | null;
          actor_id: string | null;
          request_hash: string;
          response_body: Json | null;
          status_code: number | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['idempotency_keys']['Row']> & {
          key: string;
          request_hash: string;
        };
        Update: Partial<Database['public']['Tables']['idempotency_keys']['Row']>;
      };
      system_settings: {
        Row: {
          organization_id: string;
          key: string;
          value: Json;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: { organization_id: string; key: string; value: Json; updated_by?: string | null };
        Update: Partial<Database['public']['Tables']['system_settings']['Row']>;
      };
      course_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['course_categories']['Row']> & {
          name: string;
          slug: string;
        };
        Update: Partial<Database['public']['Tables']['course_categories']['Row']>;
      };
      courses: {
        Row: {
          id: string;
          category_id: string | null;
          name: string;
          slug: string;
          short_description: string;
          description: string | null;
          duration_label: string;
          fee_paise: number;
          status: 'draft' | 'published' | 'archived';
          display_order: number;
          created_at: string;
          created_by: string | null;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: Partial<Database['public']['Tables']['courses']['Row']> & {
          name: string;
          slug: string;
          short_description: string;
          duration_label: string;
          fee_paise: number;
        };
        Update: Partial<Database['public']['Tables']['courses']['Row']>;
      };
      document_sequences: {
        Row: {
          id: string;
          organization_id: string;
          centre_id: string | null;
          doc_type: string;
          period: string;
          last_value: number;
        };
        Insert: Partial<Database['public']['Tables']['document_sequences']['Row']> & {
          organization_id: string;
          doc_type: string;
          period: string;
        };
        Update: Partial<Database['public']['Tables']['document_sequences']['Row']>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      next_document_number: {
        Args: {
          p_organization_id: string;
          p_centre_id: string | null;
          p_doc_type: string;
          p_period: string;
        };
        Returns: number;
      };
      has_permission: {
        Args: { perm: string; org: string; centre: string | null };
        Returns: boolean;
      };
      can_access_centre: {
        Args: { centre: string };
        Returns: boolean;
      };
      record_audit_entry: {
        Args: {
          p_organization_id: string | null;
          p_action: string;
          p_table_name: string;
          p_row_id: string | null;
          p_reason: string | null;
          p_before: Json | null;
          p_after: Json | null;
          p_actor_id: string | null;
        };
        Returns: string;
      };
    };
    Enums: {
      membership_status: 'active' | 'suspended' | 'revoked';
      centre_status: 'active' | 'suspended' | 'closed';
    };
    CompositeTypes: Record<string, never>;
  };
}
