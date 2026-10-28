export type Json = any;

export interface Database {
  public: {
    Tables: Record<string, {
      Row: Record<string, any>;
      Insert: Record<string, any>;
      Update: Record<string, any>;
    }>;
    Views: Record<string, { Row: Record<string, any> }>;
    Functions: Record<string, any>;
    Enums: Record<string, string>;
  };
}
