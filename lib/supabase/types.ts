/**
 * Hand-maintained database types for the FPC Supabase project, written in
 * the same shape `supabase gen types typescript` emits. Regenerate with the
 * CLI once it's wired up; until then keep in sync with supabase/migrations/.
 */

export type MembershipType = "full" | "junior" | "guest";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          membership: MembershipType;
          member_since: string | null;
          stripe_customer_id: string | null;
          newsletter_opt_in: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          membership?: MembershipType;
          member_since?: string | null;
          stripe_customer_id?: string | null;
          newsletter_opt_in?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string | null;
          phone?: string | null;
          newsletter_opt_in?: boolean;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      membership_type: MembershipType;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export const MEMBERSHIP_LABELS: Record<MembershipType, string> = {
  full: "Full member",
  junior: "Junior (Jugend)",
  guest: "Guest",
};
