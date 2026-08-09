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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
      };
      permissions: {
        Row: { code: string; description: string };
        Insert: { code: string; description: string };
        Update: Partial<Database['public']['Tables']['permissions']['Row']>;
        Relationships: [];
      };
      role_permissions: {
        Row: { role_id: string; permission_code: string };
        Insert: { role_id: string; permission_code: string };
        Update: Partial<Database['public']['Tables']['role_permissions']['Row']>;
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
          pass_percent: number;
          distinction_percent: number;
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
        Relationships: [];
      };
      leads: {
        Row: {
          id: string;
          organization_id: string;
          full_name: string;
          phone: string;
          email: string | null;
          city: string | null;
          course_interest_id: string | null;
          message: string | null;
          status: 'new' | 'contacted' | 'converted' | 'closed';
          source: string;
          created_at: string;
          created_by: string | null;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: Partial<Database['public']['Tables']['leads']['Row']> & {
          organization_id: string;
          full_name: string;
          phone: string;
        };
        Update: Partial<Database['public']['Tables']['leads']['Row']>;
        Relationships: [];
      };
      centre_applications: {
        Row: {
          id: string;
          organization_id: string;
          application_number: string;
          applicant_name: string;
          applicant_email: string;
          applicant_phone: string;
          proposed_centre_name: string;
          city: string;
          state: string;
          pincode: string;
          address: string;
          message: string | null;
          status: 'draft' | 'submitted' | 'under_review' | 'changes_requested' | 'approved' | 'rejected';
          reviewed_by: string | null;
          reviewed_at: string | null;
          centre_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['centre_applications']['Row']> & {
          organization_id: string;
          application_number: string;
          applicant_name: string;
          applicant_email: string;
          applicant_phone: string;
          proposed_centre_name: string;
          city: string;
          state: string;
          pincode: string;
          address: string;
        };
        Update: Partial<Database['public']['Tables']['centre_applications']['Row']>;
        Relationships: [];
      };
      centre_application_reviews: {
        Row: {
          id: string;
          application_id: string;
          reviewer_id: string;
          action: 'draft' | 'submitted' | 'under_review' | 'changes_requested' | 'approved' | 'rejected';
          comments: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['centre_application_reviews']['Row']> & {
          application_id: string;
          reviewer_id: string;
          action: 'draft' | 'submitted' | 'under_review' | 'changes_requested' | 'approved' | 'rejected';
        };
        Update: Partial<Database['public']['Tables']['centre_application_reviews']['Row']>;
        Relationships: [];
      };
      students: {
        Row: {
          id: string;
          organization_id: string;
          centre_id: string;
          registration_number: string;
          full_name: string;
          date_of_birth: string | null;
          gender: string | null;
          guardian_name: string | null;
          phone: string;
          email: string | null;
          address: string | null;
          gov_id_last4: string | null;
          gov_id_hmac: string | null;
          user_id: string | null;
          status: 'active' | 'completed' | 'withdrawn' | 'transferred' | 'on_hold';
          created_at: string;
          created_by: string | null;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: Partial<Database['public']['Tables']['students']['Row']> & {
          organization_id: string;
          centre_id: string;
          registration_number: string;
          full_name: string;
          phone: string;
        };
        Update: Partial<Database['public']['Tables']['students']['Row']>;
        Relationships: [];
      };
      enrolments: {
        Row: {
          id: string;
          organization_id: string;
          centre_id: string;
          student_id: string;
          course_id: string;
          status: 'active' | 'completed' | 'withdrawn' | 'transferred' | 'on_hold';
          enrolled_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['enrolments']['Row']> & {
          organization_id: string;
          centre_id: string;
          student_id: string;
          course_id: string;
        };
        Update: Partial<Database['public']['Tables']['enrolments']['Row']>;
        Relationships: [];
      };
      attendance_sessions: {
        Row: {
          id: string;
          organization_id: string;
          centre_id: string;
          course_id: string;
          session_date: string;
          created_at: string;
          created_by: string | null;
        };
        Insert: Partial<Database['public']['Tables']['attendance_sessions']['Row']> & {
          organization_id: string;
          centre_id: string;
          course_id: string;
          session_date: string;
        };
        Update: Partial<Database['public']['Tables']['attendance_sessions']['Row']>;
        Relationships: [];
      };
      attendance_records: {
        Row: {
          id: string;
          session_id: string;
          enrolment_id: string;
          status: 'present' | 'absent' | 'late' | 'excused';
          marked_by: string | null;
          marked_at: string;
        };
        Insert: Partial<Database['public']['Tables']['attendance_records']['Row']> & {
          session_id: string;
          enrolment_id: string;
          status: 'present' | 'absent' | 'late' | 'excused';
        };
        Update: Partial<Database['public']['Tables']['attendance_records']['Row']>;
        Relationships: [];
      };
      fee_plans: {
        Row: {
          id: string;
          organization_id: string;
          centre_id: string;
          enrolment_id: string;
          total_paise: number;
          created_at: string;
          created_by: string | null;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: Partial<Database['public']['Tables']['fee_plans']['Row']> & {
          organization_id: string;
          centre_id: string;
          enrolment_id: string;
          total_paise: number;
        };
        Update: Partial<Database['public']['Tables']['fee_plans']['Row']>;
        Relationships: [];
      };
      fee_instalments: {
        Row: {
          id: string;
          fee_plan_id: string;
          sequence: number;
          due_date: string;
          amount_paise: number;
          status: 'pending' | 'partially_paid' | 'paid' | 'waived';
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['fee_instalments']['Row']> & {
          fee_plan_id: string;
          sequence: number;
          due_date: string;
          amount_paise: number;
        };
        Update: Partial<Database['public']['Tables']['fee_instalments']['Row']>;
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          organization_id: string;
          centre_id: string;
          student_id: string;
          fee_plan_id: string;
          receipt_number: string;
          amount_paise: number;
          method: 'cash' | 'upi' | 'bank_transfer' | 'cheque' | 'card' | 'wallet';
          reference: string | null;
          posted_at: string;
          posted_by: string | null;
        };
        Insert: Partial<Database['public']['Tables']['payments']['Row']> & {
          organization_id: string;
          centre_id: string;
          student_id: string;
          fee_plan_id: string;
          receipt_number: string;
          amount_paise: number;
          method: 'cash' | 'upi' | 'bank_transfer' | 'cheque' | 'card' | 'wallet';
        };
        Update: never;
        Relationships: [];
      };
      payment_allocations: {
        Row: {
          id: string;
          payment_id: string;
          fee_instalment_id: string;
          amount_paise: number;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['payment_allocations']['Row']> & {
          payment_id: string;
          fee_instalment_id: string;
          amount_paise: number;
        };
        Update: never;
        Relationships: [];
      };
      result_publications: {
        Row: {
          id: string;
          organization_id: string;
          centre_id: string;
          course_id: string;
          term_label: string;
          version: number;
          published_at: string | null;
          published_by: string | null;
          created_at: string;
          created_by: string | null;
        };
        Insert: Partial<Database['public']['Tables']['result_publications']['Row']> & {
          organization_id: string;
          centre_id: string;
          course_id: string;
          term_label: string;
        };
        Update: Partial<Database['public']['Tables']['result_publications']['Row']>;
        Relationships: [];
      };
      student_results: {
        Row: {
          id: string;
          publication_id: string;
          enrolment_id: string;
          max_marks: number;
          obtained_marks: number;
          outcome: 'fail' | 'pass' | 'distinction';
          attempt_id: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['student_results']['Row']> & {
          publication_id: string;
          enrolment_id: string;
          max_marks: number;
          obtained_marks: number;
          outcome: 'fail' | 'pass' | 'distinction';
        };
        Update: Partial<Database['public']['Tables']['student_results']['Row']>;
        Relationships: [];
      };
      issued_documents: {
        Row: {
          id: string;
          organization_id: string;
          centre_id: string;
          student_id: string;
          student_result_id: string;
          document_type: 'certificate' | 'marksheet';
          document_number: string;
          status: 'pending' | 'issued' | 'revoked';
          issued_at: string;
          issued_by: string | null;
          revoked_at: string | null;
          revoked_by: string | null;
          revoked_reason: string | null;
        };
        Insert: Partial<Database['public']['Tables']['issued_documents']['Row']> & {
          organization_id: string;
          centre_id: string;
          student_id: string;
          student_result_id: string;
          document_number: string;
        };
        Update: Partial<Database['public']['Tables']['issued_documents']['Row']>;
        Relationships: [];
      };
      student_documents: {
        Row: {
          id: string;
          organization_id: string;
          centre_id: string;
          student_id: string;
          kind: 'photo' | 'id_proof' | 'other';
          storage_path: string;
          original_name: string;
          mime_type: string;
          size_bytes: number;
          uploaded_at: string;
          uploaded_by: string | null;
        };
        Insert: Partial<Database['public']['Tables']['student_documents']['Row']> & {
          organization_id: string;
          centre_id: string;
          student_id: string;
          kind: 'photo' | 'id_proof' | 'other';
          storage_path: string;
          original_name: string;
          mime_type: string;
          size_bytes: number;
        };
        Update: Partial<Database['public']['Tables']['student_documents']['Row']>;
        Relationships: [];
      };
      question_banks: {
        Row: {
          id: string;
          organization_id: string;
          course_id: string | null;
          name: string;
          description: string | null;
          status: 'draft' | 'active' | 'retired';
          created_at: string;
          created_by: string | null;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: Partial<Database['public']['Tables']['question_banks']['Row']> & {
          organization_id: string;
          name: string;
        };
        Update: Partial<Database['public']['Tables']['question_banks']['Row']>;
        Relationships: [];
      };
      questions: {
        Row: {
          id: string;
          bank_id: string;
          organization_id: string;
          type: Database['public']['Enums']['question_type'];
          body: string;
          marks: number;
          negative_marks: number;
          difficulty: 'easy' | 'medium' | 'hard';
          explanation: string | null;
          status: 'draft' | 'active' | 'retired';
          created_at: string;
          created_by: string | null;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: Partial<Database['public']['Tables']['questions']['Row']> & {
          bank_id: string;
          organization_id: string;
          type: Database['public']['Enums']['question_type'];
          body: string;
        };
        Update: Partial<Database['public']['Tables']['questions']['Row']>;
        Relationships: [];
      };
      /**
       * `is_correct` is deliberately absent from Row. It is revoked from
       * `authenticated` at the privilege level (migration 0021, proof R19), so
       * selecting it fails with 42501 rather than returning null. Leaving it
       * out of the type is what stops someone writing that select in the first
       * place — read the key with `question_answer_key` instead.
       */
      question_options: {
        Row: {
          id: string;
          question_id: string;
          organization_id: string;
          body: string;
          display_order: number;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      exams: {
        Row: {
          id: string;
          organization_id: string;
          bank_id: string;
          course_id: string | null;
          title: string;
          instructions: string | null;
          duration_minutes: number;
          opens_at: string;
          closes_at: string;
          max_attempts: number;
          pass_percent: number;
          status: 'draft' | 'published' | 'cancelled';
          created_at: string;
          created_by: string | null;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: Partial<Database['public']['Tables']['exams']['Row']> & {
          organization_id: string;
          bank_id: string;
          title: string;
          duration_minutes: number;
          opens_at: string;
          closes_at: string;
        };
        Update: Partial<Database['public']['Tables']['exams']['Row']>;
        Relationships: [];
      };
      exam_questions: {
        Row: {
          id: string;
          exam_id: string;
          question_id: string;
          organization_id: string;
          display_order: number;
          marks_override: number | null;
        };
        Insert: Partial<Database['public']['Tables']['exam_questions']['Row']> & {
          exam_id: string;
          question_id: string;
          organization_id: string;
          display_order: number;
        };
        Update: Partial<Database['public']['Tables']['exam_questions']['Row']>;
        Relationships: [];
      };
      exam_assignments: {
        Row: {
          id: string;
          exam_id: string;
          organization_id: string;
          centre_id: string;
          created_at: string;
          created_by: string | null;
        };
        Insert: Partial<Database['public']['Tables']['exam_assignments']['Row']> & {
          exam_id: string;
          organization_id: string;
          centre_id: string;
        };
        Update: Partial<Database['public']['Tables']['exam_assignments']['Row']>;
        Relationships: [];
      };
      exam_attempts: {
        Row: {
          id: string;
          exam_id: string;
          student_id: string;
          organization_id: string;
          centre_id: string;
          attempt_number: number;
          started_at: string;
          deadline_at: string;
          submitted_at: string | null;
          status:
            | 'not_started'
            | 'in_progress'
            | 'submitted'
            | 'auto_submitted'
            | 'evaluated';
          score_marks: number | null;
          max_marks: number | null;
        };
        /** Written only by start_exam_attempt / submit_exam_attempt / the sweep.
         *  INSERT, UPDATE and DELETE are revoked from `authenticated`
         *  (migration 0024) — a policy allowing a student to update their own
         *  attempt would be a policy allowing them to write their own deadline. */
        Insert: never;
        Update: never;
        Relationships: [];
      };
      exam_answers: {
        Row: {
          id: string;
          attempt_id: string;
          question_id: string;
          organization_id: string;
          answer: Record<string, unknown>;
          client_seq: number;
          saved_at: string;
          awarded_marks: number | null;
        };
        /** save_exam_answer only — the sequence-number guard is the point. */
        Insert: never;
        Update: never;
        Relationships: [];
      };
      exam_events: {
        Row: {
          id: number;
          attempt_id: string;
          organization_id: string;
          event_type: Database['public']['Enums']['exam_event_type'];
          occurred_at: string;
          metadata: Record<string, unknown>;
        };
        Insert: Partial<Database['public']['Tables']['exam_events']['Row']> & {
          attempt_id: string;
          organization_id: string;
          event_type: Database['public']['Enums']['exam_event_type'];
        };
        /** Insert-only ledger. CLAUDE.md rule 4. */
        Update: never;
        Relationships: [];
      };
      wallet_accounts: {
        Row: {
          id: string;
          organization_id: string;
          centre_id: string;
          created_at: string;
        };
        /** Created lazily by app.ensure_wallet_account — never by the app. */
        Insert: never;
        Update: never;
        Relationships: [];
      };
      wallet_entries: {
        Row: {
          entry_seq: number;
          account_id: string;
          organization_id: string;
          amount_paise: number;
          entry_type: 'recharge' | 'debit' | 'reversal';
          reason: string;
          reference: string | null;
          idempotency_key: string | null;
          created_at: string;
          created_by: string | null;
        };
        /** credit_wallet / debit_wallet only. Insert-only ledger, CLAUDE.md rule 4. */
        Insert: never;
        Update: never;
        Relationships: [];
      };
      public_verification_logs: {
        Row: {
          id: string;
          kind: string;
          query_value: string;
          matched: boolean;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['public_verification_logs']['Row']> & {
          kind: string;
          query_value: string;
          matched: boolean;
        };
        Update: never;
        Relationships: [];
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
        Relationships: [];
      };
      product_categories: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          code: string;
          status: Database['public']['Enums']['catalog_item_status'];
          display_order: number;
          created_at: string;
          created_by: string | null;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: Partial<Database['public']['Tables']['product_categories']['Row']> & {
          organization_id: string;
          name: string;
          code: string;
        };
        Update: Partial<Database['public']['Tables']['product_categories']['Row']>;
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          organization_id: string;
          category_id: string | null;
          sku: string;
          name: string;
          description: string | null;
          image_url: string | null;
          price_paise: number;
          tax_percent: number;
          low_stock_threshold: number;
          is_all_centres: boolean;
          status: Database['public']['Enums']['catalog_item_status'];
          created_at: string;
          created_by: string | null;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: Partial<Database['public']['Tables']['products']['Row']> & {
          organization_id: string;
          sku: string;
          name: string;
          price_paise: number;
        };
        Update: Partial<Database['public']['Tables']['products']['Row']>;
        Relationships: [];
      };
      product_centre_eligibility: {
        Row: {
          product_id: string;
          centre_id: string;
          created_at: string;
        };
        Insert: { product_id: string; centre_id: string };
        Update: never;
        Relationships: [];
      };
      inventory_locations: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          type: string;
          created_at: string;
          created_by: string | null;
        };
        Insert: Partial<Database['public']['Tables']['inventory_locations']['Row']> & {
          organization_id: string;
          name: string;
        };
        Update: Partial<Database['public']['Tables']['inventory_locations']['Row']>;
        Relationships: [];
      };
      inventory_entries: {
        Row: {
          entry_seq: number;
          organization_id: string;
          location_id: string;
          product_id: string;
          quantity_delta: number;
          balance_after: number;
          reason: Database['public']['Enums']['inventory_entry_reason'];
          reference: string | null;
          notes: string | null;
          created_at: string;
          created_by: string | null;
        };
        /** receive_stock / adjust_stock / order functions only — insert-only ledger. */
        Insert: never;
        Update: never;
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          organization_id: string;
          centre_id: string;
          location_id: string | null;
          order_number: string;
          status: Database['public']['Enums']['order_status'];
          subtotal_paise: number;
          tax_paise: number;
          total_paise: number;
          wallet_entry_seq: number | null;
          placed_at: string;
          confirmed_at: string | null;
          dispatched_at: string | null;
          delivered_at: string | null;
          cancelled_at: string | null;
          cancelled_reason: string | null;
          created_by: string | null;
          updated_at: string;
          updated_by: string | null;
        };
        /** create_order / pay_order / dispatch_order / cancel_order only. */
        Insert: never;
        Update: never;
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          product_name_snapshot: string;
          sku_snapshot: string;
          unit_price_paise: number;
          tax_percent: number;
          quantity: number;
          line_subtotal_paise: number;
          line_tax_paise: number;
          line_total_paise: number;
          created_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      shipments: {
        Row: {
          id: string;
          organization_id: string;
          order_id: string;
          courier: string;
          tracking_number: string | null;
          dispatched_at: string;
          delivered_at: string | null;
          created_by: string | null;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      shipment_items: {
        Row: {
          id: string;
          shipment_id: string;
          order_item_id: string;
          quantity: number;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          organization_id: string;
          recipient_user_id: string | null;
          recipient_student_id: string | null;
          type: string;
          title: string;
          body: string | null;
          href: string | null;
          read_at: string | null;
          created_at: string;
        };
        /** app.notify() via triggers only. */
        Insert: never;
        /** mark_notification_read() / mark_all_notifications_read() only. */
        Update: never;
        Relationships: [];
      };
      referral_codes: {
        Row: {
          id: string;
          organization_id: string;
          owner_type: Database['public']['Enums']['referral_owner_type'];
          owner_id: string;
          code: string;
          valid_until: string | null;
          status: Database['public']['Enums']['catalog_item_status'];
          created_at: string;
          created_by: string | null;
        };
        /** create_referral_code() only. */
        Insert: never;
        Update: never;
        Relationships: [];
      };
      referrals: {
        Row: {
          id: string;
          organization_id: string;
          referral_code_id: string;
          referred_entity_type: Database['public']['Enums']['referred_entity_type'];
          referred_entity_id: string;
          qualifying_event: Database['public']['Enums']['commission_event'] | null;
          status: Database['public']['Enums']['referral_status'];
          attributed_at: string | null;
          created_at: string;
          created_by: string | null;
        };
        /** record_referral() / qualify_referral() only. */
        Insert: never;
        Update: never;
        Relationships: [];
      };
      commission_rules: {
        Row: {
          id: string;
          organization_id: string;
          event: Database['public']['Enums']['commission_event'];
          amount_type: Database['public']['Enums']['commission_amount_type'];
          flat_amount_paise: number | null;
          percentage: number | null;
          conditions: Json | null;
          effective_from: string;
          effective_to: string | null;
          status: Database['public']['Enums']['catalog_item_status'];
          created_at: string;
          created_by: string | null;
        };
        Insert: Partial<Database['public']['Tables']['commission_rules']['Row']> & {
          organization_id: string;
          event: Database['public']['Enums']['commission_event'];
          amount_type: Database['public']['Enums']['commission_amount_type'];
        };
        Update: Partial<Database['public']['Tables']['commission_rules']['Row']>;
        Relationships: [];
      };
      commission_entries: {
        Row: {
          id: string;
          organization_id: string;
          referral_id: string;
          commission_rule_id: string;
          beneficiary_type: Database['public']['Enums']['referral_owner_type'];
          beneficiary_id: string;
          base_amount_paise: number | null;
          amount_paise: number;
          status: Database['public']['Enums']['commission_status'];
          wallet_entry_seq: number | null;
          payout_reference: string | null;
          reversed_reason: string | null;
          created_at: string;
          approved_at: string | null;
          approved_by: string | null;
          paid_at: string | null;
          paid_by: string | null;
          reversed_at: string | null;
          reversed_by: string | null;
        };
        /** qualify_referral() only. */
        Insert: never;
        Update: never;
        Relationships: [];
      };
      tickets: {
        Row: {
          id: string;
          organization_id: string;
          centre_id: string;
          number: string;
          requester_type: Database['public']['Enums']['ticket_requester_type'];
          requester_id: string;
          category: string;
          priority: Database['public']['Enums']['ticket_priority'];
          subject: string;
          status: Database['public']['Enums']['ticket_status'];
          assignee_id: string | null;
          first_response_at: string | null;
          resolved_at: string | null;
          closed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        /** create_ticket() / assign_ticket() / resolve_ticket() / close_ticket() / reopen_ticket() only. */
        Insert: never;
        Update: never;
        Relationships: [];
      };
      announcements: {
        Row: {
          id: string;
          organization_id: string;
          scope_type: Database['public']['Enums']['announcement_scope'];
          scope_centre_id: string | null;
          title: string;
          body: string;
          status: Database['public']['Enums']['catalog_item_status'];
          publish_at: string | null;
          expires_at: string | null;
          created_at: string;
          created_by: string | null;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: Partial<Database['public']['Tables']['announcements']['Row']> & {
          organization_id: string;
          title: string;
          body: string;
        };
        Update: Partial<Database['public']['Tables']['announcements']['Row']>;
        Relationships: [];
      };
      ticket_messages: {
        Row: {
          id: string;
          ticket_id: string;
          sender_type: Database['public']['Enums']['ticket_requester_type'];
          sender_id: string;
          body: string;
          is_internal: boolean;
          attachments: string[];
          created_at: string;
        };
        /** add_ticket_message() only. */
        Insert: never;
        Update: never;
        Relationships: [];
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
      question_answer_key: {
        Args: { p_question_id: string };
        Returns: { option_id: string }[];
      };
      save_question_options: {
        Args: { p_question_id: string; p_options: unknown };
        Returns: number;
      };
      /**
       * Service role only — EXECUTE is revoked from `authenticated` as well as
       * from public and anon (migration 0024). Typed here because the cron
       * route calls it; the revoke, not this map, is what stops anyone else.
       */
      credit_wallet: {
        Args: {
          p_centre_id: string;
          p_amount_paise: number;
          p_reason: string;
          p_reference?: string | null;
        };
        Returns: number;
      };
      debit_wallet: {
        Args: {
          p_centre_id: string;
          p_amount_paise: number;
          p_reason: string;
          p_idempotency_key: string;
        };
        Returns: number;
      };
      set_centre_status: {
        Args: { p_centre_id: string; p_status: string; p_reason: string };
        Returns: undefined;
      };
      revoke_certificate: {
        Args: { p_document_number: string; p_reason: string };
        Returns: undefined;
      };
      import_attempt_results: {
        Args: { p_publication_id: string };
        Returns: number;
      };
      sweep_expired_exam_attempts: {
        Args: { p_limit: number };
        Returns: number;
      };
      get_attempt_paper: {
        Args: { p_attempt_id: string };
        Returns: {
          question_id: string;
          display_order: number;
          type: Database['public']['Enums']['question_type'];
          body: string;
          marks: number;
          negative_marks: number;
          /** Sanitised at source — the row type has no is_correct column. */
          options: { id: string; body: string }[];
        }[];
      };
      start_exam_attempt: {
        Args: { p_exam_id: string };
        Returns: {
          attempt_id: string;
          deadline_at: string;
          attempt_number: number;
          resumed: boolean;
        }[];
      };
      save_exam_answer: {
        Args: {
          p_attempt_id: string;
          p_question_id: string;
          p_answer: unknown;
          p_client_seq: number;
        };
        Returns: {
          saved: boolean;
          server_time: string;
          remaining_seconds: number;
        }[];
      };
      exam_attempt_heartbeat: {
        Args: { p_attempt_id: string };
        Returns: {
          server_time: string;
          remaining_seconds: number;
          status: string;
        }[];
      };
      record_exam_event: {
        Args: {
          p_attempt_id: string;
          p_event: Database['public']['Enums']['exam_event_type'];
        };
        Returns: undefined;
      };
      submit_exam_attempt: {
        Args: { p_attempt_id: string };
        Returns: { score_marks: number; max_marks: number }[];
      };
      has_permission: {
        Args: { perm: string; org: string; centre: string | null };
        Returns: boolean;
      };
      can_access_centre: {
        Args: { centre: string };
        Returns: boolean;
      };
      receive_stock: {
        Args: {
          p_location_id: string;
          p_product_id: string;
          p_quantity: number;
          p_reason?: Database['public']['Enums']['inventory_entry_reason'];
          p_reference?: string | null;
        };
        Returns: number;
      };
      adjust_stock: {
        Args: {
          p_location_id: string;
          p_product_id: string;
          p_quantity_delta: number;
          p_notes: string;
          p_reference?: string | null;
        };
        Returns: number;
      };
      create_order: {
        Args: {
          p_centre_id: string;
          p_items: { product_id: string; quantity: number }[];
        };
        Returns: string;
      };
      pay_order: {
        Args: {
          p_order_id: string;
          p_location_id: string;
          p_idempotency_key: string;
        };
        Returns: Database['public']['Enums']['order_status'];
      };
      dispatch_order: {
        Args: {
          p_order_id: string;
          p_courier: string;
          p_tracking_number?: string | null;
        };
        Returns: string;
      };
      mark_order_delivered: {
        Args: { p_order_id: string };
        Returns: undefined;
      };
      cancel_order: {
        Args: { p_order_id: string; p_reason: string };
        Returns: undefined;
      };
      create_referral_code: {
        Args: {
          p_organization_id: string;
          p_owner_type: Database['public']['Enums']['referral_owner_type'];
          p_owner_id: string;
          p_valid_until?: string | null;
        };
        Returns: string;
      };
      record_referral: {
        Args: {
          p_code: string;
          p_referred_entity_type: Database['public']['Enums']['referred_entity_type'];
          p_referred_entity_id: string;
        };
        Returns: string;
      };
      qualify_referral: {
        Args: {
          p_referral_id: string;
          p_event: Database['public']['Enums']['commission_event'];
          p_base_amount_paise?: number | null;
        };
        Returns: string;
      };
      approve_commission: {
        Args: { p_commission_entry_id: string };
        Returns: undefined;
      };
      mark_commission_payable: {
        Args: { p_commission_entry_id: string };
        Returns: undefined;
      };
      pay_commission: {
        Args: { p_commission_entry_id: string; p_payout_reference?: string | null };
        Returns: undefined;
      };
      reverse_commission: {
        Args: { p_commission_entry_id: string; p_reason: string };
        Returns: undefined;
      };
      create_ticket: {
        Args: {
          p_centre_id: string;
          p_category: string;
          p_priority: Database['public']['Enums']['ticket_priority'];
          p_subject: string;
          p_body: string;
        };
        Returns: string;
      };
      add_ticket_message: {
        Args: {
          p_ticket_id: string;
          p_body: string;
          p_is_internal?: boolean;
          p_attachments?: string[];
        };
        Returns: string;
      };
      assign_ticket: {
        Args: { p_ticket_id: string; p_assignee_id: string };
        Returns: undefined;
      };
      resolve_ticket: {
        Args: { p_ticket_id: string };
        Returns: undefined;
      };
      close_ticket: {
        Args: { p_ticket_id: string };
        Returns: undefined;
      };
      reopen_ticket: {
        Args: { p_ticket_id: string };
        Returns: undefined;
      };
      mark_notification_read: {
        Args: { p_notification_id: string };
        Returns: undefined;
      };
      mark_all_notifications_read: {
        Args: Record<string, never>;
        Returns: undefined;
      };
      submit_public_enquiry: {
        Args: {
          p_organization_slug: string;
          p_full_name: string;
          p_phone: string;
          p_email: string | null;
          p_city: string | null;
          p_course_interest_id: string | null;
          p_message: string | null;
        };
        Returns: string;
      };
      submit_centre_application: {
        Args: {
          p_organization_slug: string;
          p_applicant_name: string;
          p_applicant_email: string;
          p_applicant_phone: string;
          p_proposed_centre_name: string;
          p_city: string;
          p_state: string;
          p_pincode: string;
          p_address: string;
          p_message: string | null;
        };
        Returns: string;
      };
      admit_student: {
        Args: {
          p_organization_id: string;
          p_centre_id: string;
          p_course_id: string;
          p_full_name: string;
          p_phone: string;
          p_email: string | null;
          p_date_of_birth: string | null;
          p_gender: string | null;
          p_guardian_name: string | null;
          p_address: string | null;
        };
        Returns: { student_id: string; registration_number: string }[];
      };
      create_fee_plan: {
        Args: {
          p_organization_id: string;
          p_centre_id: string;
          p_enrolment_id: string;
          p_total_paise: number;
          p_instalment_count: number;
          p_first_due_date: string;
        };
        Returns: string;
      };
      post_payment: {
        Args: {
          p_organization_id: string;
          p_centre_id: string;
          p_student_id: string;
          p_fee_plan_id: string;
          p_amount_paise: number;
          p_method: 'cash' | 'upi' | 'bank_transfer' | 'cheque' | 'card' | 'wallet';
          p_reference: string | null;
        };
        Returns: { payment_id: string; receipt_number: string }[];
      };
      link_student_login: {
        Args: { p_student_id: string; p_user_id: string };
        Returns: undefined;
      };
      record_student_result: {
        Args: {
          p_publication_id: string;
          p_enrolment_id: string;
          p_max_marks: number;
          p_obtained_marks: number;
        };
        Returns: 'fail' | 'pass' | 'distinction';
      };
      publish_results: {
        Args: { p_publication_id: string };
        Returns: undefined;
      };
      issue_certificate: {
        Args: { p_student_result_id: string };
        Returns: string;
      };
      verify_certificate: {
        Args: { p_number: string };
        Returns: {
          document_number: string;
          student_name: string;
          course_name: string;
          centre_name: string;
          outcome: 'fail' | 'pass' | 'distinction';
          issued_on: string;
          status: 'pending' | 'issued' | 'revoked';
        }[];
      };
      verify_registration: {
        Args: { p_registration_number: string };
        Returns: {
          registration_number: string;
          student_name: string;
          course_name: string | null;
          centre_name: string;
          enrolment_status: 'active' | 'completed' | 'withdrawn' | 'transferred' | 'on_hold' | null;
        }[];
      };
      approve_centre_application: {
        Args: {
          p_application_id: string;
          p_owner_user_id: string;
          p_reviewer_id: string;
          p_comments: string;
        };
        Returns: {
          centre_id: string;
          centre_code: string;
          already_approved: boolean;
        }[];
      };
      reject_centre_application: {
        Args: {
          p_application_id: string;
          p_reviewer_id: string;
          p_reason: string;
        };
        Returns: undefined;
      };
      invite_centre_staff: {
        Args: {
          p_centre_id: string;
          p_user_id: string;
          p_role_code: string;
          p_full_name: string;
        };
        Returns: string;
      };
      set_membership_status: {
        Args: {
          p_membership_id: string;
          p_status: 'active' | 'suspended' | 'revoked';
        };
        Returns: undefined;
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
      student_document_kind: 'photo' | 'id_proof' | 'other';
      question_type:
        | 'single_choice'
        | 'multiple_choice'
        | 'true_false'
        | 'fill_in'
        | 'short_answer'
        | 'long_answer'
        | 'file_upload';
      question_status: 'draft' | 'active' | 'retired';
      question_difficulty: 'easy' | 'medium' | 'hard';
      exam_status: 'draft' | 'published' | 'cancelled';
      exam_event_type:
        | 'started'
        | 'resumed'
        | 'answer_saved'
        | 'heartbeat'
        | 'focus_lost'
        | 'focus_regained'
        | 'submitted'
        | 'auto_submitted';
      catalog_item_status: 'draft' | 'active' | 'retired';
      order_status:
        | 'pending_payment'
        | 'confirmed'
        | 'processing'
        | 'packed'
        | 'dispatched'
        | 'delivered'
        | 'cancelled'
        | 'returned';
      inventory_entry_reason:
        | 'opening_stock'
        | 'purchase_receipt'
        | 'reservation'
        | 'dispatch'
        | 'return'
        | 'adjustment';
      referral_owner_type: 'centre' | 'user';
      referred_entity_type: 'lead' | 'student' | 'centre';
      referral_status: 'pending' | 'attributed' | 'expired' | 'rejected';
      commission_event: 'centre_approval' | 'student_admission' | 'fee_payment';
      commission_amount_type: 'flat' | 'percentage';
      commission_status: 'pending' | 'approved' | 'payable' | 'paid' | 'reversed';
      ticket_status:
        | 'open'
        | 'assigned'
        | 'waiting_on_support'
        | 'waiting_on_requester'
        | 'resolved'
        | 'closed'
        | 'reopened';
      ticket_priority: 'low' | 'medium' | 'high' | 'urgent';
      ticket_requester_type: 'staff' | 'student';
      announcement_scope: 'organization' | 'centre';
    };
    CompositeTypes: Record<string, never>;
  };
}
