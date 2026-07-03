/**
 * Hand-maintained database types for the FPC Supabase project, written in
 * the same shape `supabase gen types typescript` emits. Regenerate with the
 * CLI once it's wired up; until then keep in sync with supabase/migrations/.
 */

export type MembershipType = "full" | "junior" | "guest";
export type ResourceType =
  | "hall"
  | "field1"
  | "field2"
  | "field3"
  | "lesson"
  | "event";
export type BookingStatus = "pending" | "confirmed" | "cancelled";
export type LessonType = "private" | "group";

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
      bookings: {
        Row: {
          id: string;
          user_id: string;
          resource: ResourceType;
          starts_at: string;
          ends_at: string;
          status: BookingStatus;
          notes: string | null;
          price_cents: number;
          trainer_id: string | null;
          lesson_type: LessonType | null;
          event_id: string | null;
          ticket_count: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          resource: ResourceType;
          starts_at: string;
          ends_at: string;
          status?: BookingStatus;
          notes?: string | null;
          price_cents?: number;
          trainer_id?: string | null;
          lesson_type?: LessonType | null;
          event_id?: string | null;
          ticket_count?: number | null;
        };
        Update: {
          status?: BookingStatus;
          notes?: string | null;
        };
        Relationships: [];
      };
      trainers: {
        Row: {
          id: string;
          name: string;
          bio: string | null;
          active: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          bio?: string | null;
          active?: boolean;
        };
        Update: {
          name?: string;
          bio?: string | null;
          active?: boolean;
        };
        Relationships: [];
      };
      club_events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          starts_at: string;
          ends_at: string;
          ticket_price_cents: number;
          capacity: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          starts_at: string;
          ends_at: string;
          ticket_price_cents?: number;
          capacity?: number | null;
        };
        Update: {
          title?: string;
          description?: string | null;
          starts_at?: string;
          ends_at?: string;
          ticket_price_cents?: number;
          capacity?: number | null;
        };
        Relationships: [];
      };
      rates: {
        Row: {
          key: string;
          per_hour_cents: number;
        };
        Insert: {
          key: string;
          per_hour_cents: number;
        };
        Update: {
          per_hour_cents?: number;
        };
        Relationships: [];
      };
      club_settings: {
        Row: {
          id: boolean;
          cancellation_hours: number;
        };
        Insert: {
          id?: boolean;
          cancellation_hours?: number;
        };
        Update: {
          cancellation_hours?: number;
        };
        Relationships: [];
      };
    };
    Views: {
      busy_slots: {
        Row: {
          id: string;
          resource: ResourceType;
          trainer_id: string | null;
          starts_at: string;
          ends_at: string;
        };
        Relationships: [];
      };
    };
    Functions: {
      cancel_booking: {
        Args: { booking_id: string };
        Returns: undefined;
      };
    };
    Enums: {
      membership_type: MembershipType;
      resource_type: ResourceType;
      booking_status: BookingStatus;
      lesson_type: LessonType;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
export type Trainer = Database["public"]["Tables"]["trainers"]["Row"];
export type ClubEvent = Database["public"]["Tables"]["club_events"]["Row"];
export type BusySlot = Database["public"]["Views"]["busy_slots"]["Row"];

export const MEMBERSHIP_LABELS: Record<MembershipType, string> = {
  full: "Full member",
  junior: "Junior (Jugend)",
  guest: "Guest",
};
