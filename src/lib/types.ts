export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          timezone: string;
          review_time: string;
          quiet_hours_start: string | null;
          quiet_hours_end: string | null;
          notifications_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          timezone?: string;
          review_time?: string;
          quiet_hours_start?: string | null;
          quiet_hours_end?: string | null;
          notifications_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          timezone?: string;
          review_time?: string;
          quiet_hours_start?: string | null;
          quiet_hours_end?: string | null;
          notifications_enabled?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string;
          icon: string;
          is_default: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color?: string;
          icon?: string;
          is_default?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          name?: string;
          color?: string;
          icon?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      todos: {
        Row: {
          id: string;
          user_id: string;
          category_id: string | null;
          title: string;
          description: string | null;
          reminder_time: string | null;
          is_recurring: boolean;
          recurrence_type: 'daily' | 'interval' | 'weekly' | 'monthly';
          recurrence_interval: number;
          recurrence_days: number[] | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id?: string | null;
          title: string;
          description?: string | null;
          reminder_time?: string | null;
          is_recurring?: boolean;
          recurrence_type?: 'daily' | 'interval' | 'weekly' | 'monthly';
          recurrence_interval?: number;
          recurrence_days?: number[] | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          category_id?: string | null;
          title?: string;
          description?: string | null;
          reminder_time?: string | null;
          is_recurring?: boolean;
          recurrence_type?: 'daily' | 'interval' | 'weekly' | 'monthly';
          recurrence_interval?: number;
          recurrence_days?: number[] | null;
          is_active?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      todo_completions: {
        Row: {
          id: string;
          todo_id: string;
          user_id: string;
          completed_date: string;
          completed_at: string;
          skipped: boolean;
        };
        Insert: {
          id?: string;
          todo_id: string;
          user_id: string;
          completed_date: string;
          completed_at?: string;
          skipped?: boolean;
        };
        Update: {
          skipped?: boolean;
        };
        Relationships: [];
      };
      daily_reviews: {
        Row: {
          id: string;
          user_id: string;
          review_date: string;
          completed_count: number;
          missed_count: number;
          skipped_count: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          review_date: string;
          completed_count: number;
          missed_count: number;
          skipped_count: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          completed_count?: number;
          missed_count?: number;
          skipped_count?: number;
          notes?: string | null;
        };
        Relationships: [];
      };
      push_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          endpoint: string;
          keys_p256dh: string;
          keys_auth: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          endpoint: string;
          keys_p256dh: string;
          keys_auth: string;
          created_at?: string;
        };
        Update: {
          endpoint?: string;
          keys_p256dh?: string;
          keys_auth?: string;
        };
        Relationships: [];
      };
      weight_entries: {
        Row: {
          id: string;
          user_id: string;
          weight: number;
          unit: 'kg' | 'lbs';
          date: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          weight: number;
          unit?: 'kg' | 'lbs';
          date?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          weight?: number;
          unit?: 'kg' | 'lbs';
          date?: string;
          notes?: string | null;
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
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Convenience types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Todo = Database["public"]["Tables"]["todos"]["Row"];
export type TodoCompletion = Database["public"]["Tables"]["todo_completions"]["Row"];
export type DailyReview = Database["public"]["Tables"]["daily_reviews"]["Row"];
export type PushSubscription = Database["public"]["Tables"]["push_subscriptions"]["Row"];

// Extended types for UI
export type TodoWithCompletion = Todo & {
  category: Category | null;
  completion: TodoCompletion | null;
};

export type DailySummary = {
  date: string;
  totalTodos: number;
  completedCount: number;
  skippedCount: number;
  missedCount: number;
  completionRate: number;
};

export type StreakInfo = {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
};

export type WeightEntry = Database["public"]["Tables"]["weight_entries"]["Row"];
