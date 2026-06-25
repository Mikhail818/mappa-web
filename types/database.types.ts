export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          created_at: string
          event_name: string
          id: string
          properties: Json
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_name: string
          id?: string
          properties?: Json
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_name?: string
          id?: string
          properties?: Json
          user_id?: string | null
        }
        Relationships: []
      }
      blocked_users: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
        }
        Relationships: []
      }
      club_members: {
        Row: {
          club_id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          club_id: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          club_id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_members_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clubs: {
        Row: {
          city: string
          court_ids: string[]
          created_at: string
          description: string | null
          id: string
          name: string
          website: string | null
        }
        Insert: {
          city: string
          court_ids?: string[]
          created_at?: string
          description?: string | null
          id?: string
          name: string
          website?: string | null
        }
        Update: {
          city?: string
          court_ids?: string[]
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          website?: string | null
        }
        Relationships: []
      }
      court_ratings: {
        Row: {
          court_id: string
          created_at: string
          id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          court_id: string
          created_at?: string
          id?: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          court_id?: string
          created_at?: string
          id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      courts: {
        Row: {
          address: string | null
          city: string
          cost_range: string | null
          court_count: number | null
          court_rating: number | null
          created_at: string
          id: string
          is_indoor: boolean
          is_public: boolean
          lat: number | null
          lights: boolean
          lng: number | null
          name: string
          opening_hours: string | null
          parking: boolean
          peak_times: string | null
          phone: string | null
          shade_available: boolean
          surface: string
          type: string
          water_fountain: boolean
          website: string | null
        }
        Insert: {
          address?: string | null
          city: string
          cost_range?: string | null
          court_count?: number | null
          court_rating?: number | null
          created_at?: string
          id?: string
          is_indoor?: boolean
          is_public?: boolean
          lat?: number | null
          lights?: boolean
          lng?: number | null
          name: string
          opening_hours?: string | null
          parking?: boolean
          peak_times?: string | null
          phone?: string | null
          shade_available?: boolean
          surface?: string
          type?: string
          water_fountain?: boolean
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string
          cost_range?: string | null
          court_count?: number | null
          court_rating?: number | null
          created_at?: string
          id?: string
          is_indoor?: boolean
          is_public?: boolean
          lat?: number | null
          lights?: boolean
          lng?: number | null
          name?: string
          opening_hours?: string | null
          parking?: boolean
          peak_times?: string | null
          phone?: string | null
          shade_available?: boolean
          surface?: string
          type?: string
          water_fountain?: boolean
          website?: string | null
        }
        Relationships: []
      }
      event_joins: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          court_id: string | null
          created_at: string | null
          creator_id: string
          description: string | null
          event_type: string
          id: string
          max_players: number
          scheduled_at: string
          status: string
          title: string
        }
        Insert: {
          court_id?: string | null
          created_at?: string | null
          creator_id: string
          description?: string | null
          event_type?: string
          id?: string
          max_players?: number
          scheduled_at: string
          status?: string
          title: string
        }
        Update: {
          court_id?: string | null
          created_at?: string | null
          creator_id?: string
          description?: string | null
          event_type?: string
          id?: string
          max_players?: number
          scheduled_at?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
      experiment_assignments: {
        Row: {
          assigned_at: string
          feature_name: string
          id: string
          user_id: string
          variant: string
        }
        Insert: {
          assigned_at?: string
          feature_name: string
          id?: string
          user_id: string
          variant: string
        }
        Update: {
          assigned_at?: string
          feature_name?: string
          id?: string
          user_id?: string
          variant?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          created_at: string
          email: string | null
          id: string
          message: string
          metadata: Json
          status: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          message: string
          metadata?: Json
          status?: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          message?: string
          metadata?: Json
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      football_booking_players: {
        Row: {
          booking_id: string
          display_name: string | null
          id: string
          joined_at: string
          status: string
          user_id: string | null
        }
        Insert: {
          booking_id: string
          display_name?: string | null
          id?: string
          joined_at?: string
          status?: string
          user_id?: string | null
        }
        Update: {
          booking_id?: string
          display_name?: string | null
          id?: string
          joined_at?: string
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      football_bookings: {
        Row: {
          cancelled_at: string | null
          cancelled_by: string | null
          confirmed_at: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          currency: string
          ends_at: string
          format: string
          id: string
          notes: string | null
          pitch_id: string
          player_count: number
          requester_id: string
          slot_range: unknown
          starts_at: string
          status: string
          total_price_cents: number | null
          updated_at: string
          venue_notes: string | null
        }
        Insert: {
          cancelled_at?: string | null
          cancelled_by?: string | null
          confirmed_at?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          currency?: string
          ends_at: string
          format?: string
          id?: string
          notes?: string | null
          pitch_id: string
          player_count?: number
          requester_id: string
          slot_range?: unknown
          starts_at: string
          status?: string
          total_price_cents?: number | null
          updated_at?: string
          venue_notes?: string | null
        }
        Update: {
          cancelled_at?: string | null
          cancelled_by?: string | null
          confirmed_at?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          currency?: string
          ends_at?: string
          format?: string
          id?: string
          notes?: string | null
          pitch_id?: string
          player_count?: number
          requester_id?: string
          slot_range?: unknown
          starts_at?: string
          status?: string
          total_price_cents?: number | null
          updated_at?: string
          venue_notes?: string | null
        }
        Relationships: []
      }
      football_pitch_availability: {
        Row: {
          closes_at: string
          created_at: string
          day_of_week: number
          effective_from: string
          effective_to: string | null
          id: string
          is_active: boolean
          opens_at: string
          pitch_id: string
        }
        Insert: {
          closes_at: string
          created_at?: string
          day_of_week: number
          effective_from?: string
          effective_to?: string | null
          id?: string
          is_active?: boolean
          opens_at: string
          pitch_id: string
        }
        Update: {
          closes_at?: string
          created_at?: string
          day_of_week?: number
          effective_from?: string
          effective_to?: string | null
          id?: string
          is_active?: boolean
          opens_at?: string
          pitch_id?: string
        }
        Relationships: []
      }
      football_pitch_blackouts: {
        Row: {
          created_at: string
          created_by: string | null
          ends_at: string
          id: string
          pitch_id: string
          reason: string | null
          starts_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          ends_at: string
          id?: string
          pitch_id: string
          reason?: string | null
          starts_at: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          ends_at?: string
          id?: string
          pitch_id?: string
          reason?: string | null
          starts_at?: string
        }
        Relationships: []
      }
      football_pitches: {
        Row: {
          capacity_players: number
          created_at: string
          currency: string
          floodlights: boolean
          format: string
          id: string
          indoor: boolean
          is_active: boolean
          min_booking_minutes: number
          name: string
          price_per_hour_cents: number | null
          slot_granularity_minutes: number
          surface: string
          updated_at: string
          venue_id: string
        }
        Insert: {
          capacity_players?: number
          created_at?: string
          currency?: string
          floodlights?: boolean
          format?: string
          id?: string
          indoor?: boolean
          is_active?: boolean
          min_booking_minutes?: number
          name: string
          price_per_hour_cents?: number | null
          slot_granularity_minutes?: number
          surface?: string
          updated_at?: string
          venue_id: string
        }
        Update: {
          capacity_players?: number
          created_at?: string
          currency?: string
          floodlights?: boolean
          format?: string
          id?: string
          indoor?: boolean
          is_active?: boolean
          min_booking_minutes?: number
          name?: string
          price_per_hour_cents?: number | null
          slot_granularity_minutes?: number
          surface?: string
          updated_at?: string
          venue_id?: string
        }
        Relationships: []
      }
      football_venue_admins: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
          venue_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string
          user_id: string
          venue_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
          venue_id?: string
        }
        Relationships: []
      }
      football_venues: {
        Row: {
          address: string | null
          amenities: Json
          city: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          lat: number | null
          lng: number | null
          name: string
          owner_id: string | null
          phone: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          amenities?: Json
          city: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          lat?: number | null
          lng?: number | null
          name: string
          owner_id?: string | null
          phone?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          amenities?: Json
          city?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          lat?: number | null
          lng?: number | null
          name?: string
          owner_id?: string | null
          phone?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      match_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          match_id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          match_id: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          match_id?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: []
      }
      match_reports: {
        Row: {
          created_at: string
          id: string
          match_id: string
          notes: string | null
          reported_id: string
          reporter_id: string
          showed_up: boolean
          skill_match_quality: string | null
          skill_stars: number | null
          skipped: boolean
          would_play_again: boolean | null
        }
        Insert: {
          created_at?: string
          id?: string
          match_id: string
          notes?: string | null
          reported_id: string
          reporter_id: string
          showed_up?: boolean
          skill_match_quality?: string | null
          skill_stars?: number | null
          skipped?: boolean
          would_play_again?: boolean | null
        }
        Update: {
          created_at?: string
          id?: string
          match_id?: string
          notes?: string | null
          reported_id?: string
          reporter_id?: string
          showed_up?: boolean
          skill_match_quality?: string | null
          skill_stars?: number | null
          skipped?: boolean
          would_play_again?: boolean | null
        }
        Relationships: []
      }
      match_stats: {
        Row: {
          aces: number | null
          break_points_faced: number | null
          break_points_won: number | null
          created_at: string
          double_faults: number | null
          first_serve_pct: number | null
          id: string
          match_id: string
          player_id: string
          unforced_errors: number | null
          winners: number | null
        }
        Insert: {
          aces?: number | null
          break_points_faced?: number | null
          break_points_won?: number | null
          created_at?: string
          double_faults?: number | null
          first_serve_pct?: number | null
          id?: string
          match_id: string
          player_id: string
          unforced_errors?: number | null
          winners?: number | null
        }
        Update: {
          aces?: number | null
          break_points_faced?: number | null
          break_points_won?: number | null
          created_at?: string
          double_faults?: number | null
          first_serve_pct?: number | null
          id?: string
          match_id?: string
          player_id?: string
          unforced_errors?: number | null
          winners?: number | null
        }
        Relationships: []
      }
      matches: {
        Row: {
          court_id: string | null
          created_at: string
          dispute_opponent_sets: number | null
          dispute_player_sets: number | null
          dispute_score_sets: Json | null
          disputed_at: string | null
          disputed_by: string | null
          expires_at: string | null
          id: string
          match_type: string
          notes: string | null
          opponent_id: string
          opponent_sets: number | null
          player_id: string
          player_sets: number | null
          scheduled_at: string | null
          score_sets: Json | null
          score_submitted_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          court_id?: string | null
          created_at?: string
          dispute_opponent_sets?: number | null
          dispute_player_sets?: number | null
          dispute_score_sets?: Json | null
          disputed_at?: string | null
          disputed_by?: string | null
          expires_at?: string | null
          id?: string
          match_type?: string
          notes?: string | null
          opponent_id: string
          opponent_sets?: number | null
          player_id: string
          player_sets?: number | null
          scheduled_at?: string | null
          score_sets?: Json | null
          score_submitted_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          court_id?: string | null
          created_at?: string
          dispute_opponent_sets?: number | null
          dispute_player_sets?: number | null
          dispute_score_sets?: Json | null
          disputed_at?: string | null
          disputed_by?: string | null
          expires_at?: string | null
          id?: string
          match_type?: string
          notes?: string | null
          opponent_id?: string
          opponent_sets?: number | null
          player_id?: string
          player_sets?: number | null
          scheduled_at?: string | null
          score_sets?: Json | null
          score_submitted_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      open_match_joins: {
        Row: {
          id: string
          joined_at: string
          open_match_id: string
          slot_index: number
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          open_match_id: string
          slot_index?: number
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          open_match_id?: string
          slot_index?: number
          user_id?: string
        }
        Relationships: []
      }
      open_match_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          open_match_id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          open_match_id: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          open_match_id?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: []
      }
      open_matches: {
        Row: {
          court_id: string | null
          created_at: string
          creator_id: string
          id: string
          match_type: string
          max_players: number
          notes: string | null
          scheduled_at: string
          status: string
        }
        Insert: {
          court_id?: string | null
          created_at?: string
          creator_id: string
          id?: string
          match_type?: string
          max_players?: number
          notes?: string | null
          scheduled_at: string
          status?: string
        }
        Update: {
          court_id?: string | null
          created_at?: string
          creator_id?: string
          id?: string
          match_type?: string
          max_players?: number
          notes?: string | null
          scheduled_at?: string
          status?: string
        }
        Relationships: []
      }
      player_affinities: {
        Row: {
          last_updated_at: string
          play_count: number
          positive_count: number
          user_a: string
          user_b: string
        }
        Insert: {
          last_updated_at?: string
          play_count?: number
          positive_count?: number
          user_a: string
          user_b: string
        }
        Update: {
          last_updated_at?: string
          play_count?: number
          positive_count?: number
          user_a?: string
          user_b?: string
        }
        Relationships: []
      }
      player_favorites: {
        Row: {
          created_at: string
          player_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          player_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          player_id?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          acquisition_source: string | null
          attendance_rate: number
          availability: string
          availability_slots: string[]
          avatar_url: string | null
          bio: string | null
          cancellation_rate: number
          created_at: string
          date_of_birth: string | null
          email: string | null
          full_name: string
          gender: string | null
          handedness: string
          home_city: string
          id: string
          is_coach: boolean
          is_founding_player: boolean
          is_lead_tester: boolean
          is_seeded: boolean
          is_venue_owner: boolean
          languages: string[]
          last_active_at: string | null
          lat: number | null
          lng: number | null
          losses: number
          matchmaking_rating: number | null
          onboarding_completed: boolean
          playing_style: string | null
          playing_tags: string[]
          preferred_courts: string[]
          preferred_match_type: string | null
          preferred_surface: string | null
          rank_delta: number
          rank_snapshot: number | null
          rating: number
          referral_code: string | null
          referred_by: string | null
          reliability_score: number
          response_rate: number
          skill_level: string
          updated_at: string
          weekly_play_target: number
          wins: number
          xp: number
        }
        Insert: {
          acquisition_source?: string | null
          attendance_rate?: number
          availability?: string
          availability_slots?: string[]
          avatar_url?: string | null
          bio?: string | null
          cancellation_rate?: number
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name?: string
          gender?: string | null
          handedness?: string
          home_city?: string
          id: string
          is_coach?: boolean
          is_founding_player?: boolean
          is_lead_tester?: boolean
          is_seeded?: boolean
          is_venue_owner?: boolean
          languages?: string[]
          last_active_at?: string | null
          lat?: number | null
          lng?: number | null
          losses?: number
          matchmaking_rating?: number | null
          onboarding_completed?: boolean
          playing_style?: string | null
          playing_tags?: string[]
          preferred_courts?: string[]
          preferred_match_type?: string | null
          preferred_surface?: string | null
          rank_delta?: number
          rank_snapshot?: number | null
          rating?: number
          referral_code?: string | null
          referred_by?: string | null
          reliability_score?: number
          response_rate?: number
          skill_level?: string
          updated_at?: string
          weekly_play_target?: number
          wins?: number
          xp?: number
        }
        Update: {
          acquisition_source?: string | null
          attendance_rate?: number
          availability?: string
          availability_slots?: string[]
          avatar_url?: string | null
          bio?: string | null
          cancellation_rate?: number
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name?: string
          gender?: string | null
          handedness?: string
          home_city?: string
          id?: string
          is_coach?: boolean
          is_founding_player?: boolean
          is_lead_tester?: boolean
          is_seeded?: boolean
          is_venue_owner?: boolean
          languages?: string[]
          last_active_at?: string | null
          lat?: number | null
          lng?: number | null
          losses?: number
          matchmaking_rating?: number | null
          onboarding_completed?: boolean
          playing_style?: string | null
          playing_tags?: string[]
          preferred_courts?: string[]
          preferred_match_type?: string | null
          preferred_surface?: string | null
          rank_delta?: number
          rank_snapshot?: number | null
          rating?: number
          referral_code?: string | null
          referred_by?: string | null
          reliability_score?: number
          response_rate?: number
          skill_level?: string
          updated_at?: string
          weekly_play_target?: number
          wins?: number
          xp?: number
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
          user_id: string
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
      recurring_matches: {
        Row: {
          court_id: string | null
          created_at: string
          creator_id: string
          id: string
          is_active: boolean
          match_type: string
          next_session_at: string | null
          opponent_id: string
          preferred_hour: number
          recurrence: string
        }
        Insert: {
          court_id?: string | null
          created_at?: string
          creator_id: string
          id?: string
          is_active?: boolean
          match_type?: string
          next_session_at?: string | null
          opponent_id: string
          preferred_hour?: number
          recurrence: string
        }
        Update: {
          court_id?: string | null
          created_at?: string
          creator_id?: string
          id?: string
          is_active?: boolean
          match_type?: string
          next_session_at?: string | null
          opponent_id?: string
          preferred_hour?: number
          recurrence?: string
        }
        Relationships: []
      }
      reliability_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          match_id: string | null
          player_id: string
          score_delta: number
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          match_id?: string | null
          player_id: string
          score_delta: number
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          match_id?: string | null
          player_id?: string
          score_delta?: number
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          reason: string
          reported_id: string
          reporter_id: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          reported_id: string
          reporter_id: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          reported_id?: string
          reporter_id?: string
        }
        Relationships: []
      }
      venue_owner_applications: {
        Row: {
          business_name: string
          business_type: string
          contact_email: string
          contact_name: string
          contact_phone: string
          created_at: string
          id: string
          notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
          venue_address: string | null
          venue_city: string
          venue_description: string | null
          venue_name: string
        }
        Insert: {
          business_name: string
          business_type: string
          contact_email: string
          contact_name: string
          contact_phone: string
          created_at?: string
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
          venue_address?: string | null
          venue_city: string
          venue_description?: string | null
          venue_name: string
        }
        Update: {
          business_name?: string
          business_type?: string
          contact_email?: string
          contact_name?: string
          contact_phone?: string
          created_at?: string
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          venue_address?: string | null
          venue_city?: string
          venue_description?: string | null
          venue_name?: string
        }
        Relationships: []
      }
    }
    Views: {
      owner_booking_analytics: {
        Row: {
          booking_id: string | null
          created_at: string | null
          currency: string | null
          ends_at: string | null
          owner_id: string | null
          pitch_id: string | null
          pitch_name: string | null
          player_count: number | null
          starts_at: string | null
          status: string | null
          total_price_cents: number | null
          venue_id: string | null
          venue_name: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_reliability_event: {
        Args: {
          p_event_type: string
          p_match_id?: string
          p_player_id: string
          p_score_delta: number
        }
        Returns: undefined
      }
      adjust_matchmaking_rating: {
        Args: { p_direction: string; p_reporter_id: string }
        Returns: undefined
      }
      approve_owner_application: {
        Args: { p_admin_id: string; p_application_id: string }
        Returns: undefined
      }
      auto_resolve_disputes: { Args: never; Returns: undefined }
      cancel_match: { Args: { match_id: string }; Returns: undefined }
      confirm_football_booking: {
        Args: { p_booking_id: string; p_venue_notes?: string }
        Returns: Database["public"]["Tables"]["football_bookings"]["Row"]
      }
      expire_pending_matches: { Args: never; Returns: undefined }
      is_admin: { Args: never; Returns: boolean }
      recalculate_reliability: {
        Args: { p_player_id: string }
        Returns: undefined
      }
      record_affinity: {
        Args: { p_positive: boolean; p_user_a: string; p_user_b: string }
        Returns: undefined
      }
      refresh_rank_deltas: { Args: never; Returns: undefined }
      reject_owner_application: {
        Args: { p_admin_id: string; p_application_id: string; p_notes?: string }
        Returns: undefined
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

export type Profile = Tables<"profiles">
export type Match = Tables<"matches">
export type Court = Tables<"courts">
export type OpenMatch = Tables<"open_matches">
export type OpenMatchJoin = Tables<"open_match_joins">
export type MatchMessage = Tables<"match_messages">
export type OpenMatchMessage = Tables<"open_match_messages">
export type FootballVenue = Tables<"football_venues">
export type FootballPitch = Tables<"football_pitches">
export type FootballBooking = Tables<"football_bookings">
export type FootballPitchAvailability = Tables<"football_pitch_availability">
export type FootballPitchBlackout = Tables<"football_pitch_blackouts">
export type VenueOwnerApplication = Tables<"venue_owner_applications">
export type PlayerFavorite = Tables<"player_favorites">
export type AnalyticsEvent = Tables<"analytics_events">
export type OwnerBookingAnalytics = Tables<"owner_booking_analytics">
