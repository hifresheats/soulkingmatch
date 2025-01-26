export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      subscription_plans: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          interval: string
          stripe_price_id: string | null
          features: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          interval: string
          stripe_price_id?: string | null
          features?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          interval?: string
          stripe_price_id?: string | null
          features?: Json
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          status: string
          stripe_subscription_id: string | null
          current_period_start: string
          current_period_end: string
          cancel_at_period_end: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          status: string
          stripe_subscription_id?: string | null
          current_period_start: string
          current_period_end: string
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          status?: string
          stripe_subscription_id?: string | null
          current_period_start?: string
          current_period_end?: string
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      payment_history: {
        Row: {
          id: string
          user_id: string
          subscription_id: string
          amount: number
          currency: string
          status: string
          stripe_payment_intent_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subscription_id: string
          amount: number
          currency: string
          status: string
          stripe_payment_intent_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subscription_id?: string
          amount?: number
          currency?: string
          status?: string
          stripe_payment_intent_id?: string | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          content: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          content: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          content?: string
          read?: boolean
          created_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          reporter_id: string
          reported_id: string
          reason: string
          details: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          reporter_id: string
          reported_id: string
          reason: string
          details?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          reporter_id?: string
          reported_id?: string
          reason?: string
          details?: string | null
          status?: string
          created_at?: string
        }
      }
      verifications: {
        Row: {
          id: string
          user_id: string
          type: string
          status: string
          verified_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          status?: string
          verified_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          status?: string
          verified_at?: string | null
          created_at?: string
        }
      }
      matches: {
        Row: {
          id: string
          matched_at: string
          status: string
          user1_id: string
          user2_id: string
        }
        Insert: {
          id?: string
          matched_at?: string
          status?: string
          user1_id: string
          user2_id: string
        }
        Update: {
          id?: string
          matched_at?: string
          status?: string
          user1_id?: string
          user2_id?: string
        }
      }
      messages: {
        Row: {
          content: string
          id: string
          match_id: string
          read_at: string | null
          sender_id: string
          sent_at: string
        }
        Insert: {
          content: string
          id?: string
          match_id: string
          read_at?: string | null
          sender_id: string
          sent_at?: string
        }
        Update: {
          content?: string
          id?: string
          match_id?: string
          read_at?: string | null
          sender_id?: string
          sent_at?: string
        }
      }
      profiles: {
        Row: {
          bio: string | null
          birth_date: string | null
          created_at: string
          full_name: string | null
          gender: string | null
          id: string
          location: string | null
          looking_for: string | null
          photos: string[]
          updated_at: string
          username: string
        }
        Insert: {
          bio?: string | null
          birth_date?: string | null
          created_at?: string
          full_name?: string | null
          gender?: string | null
          id: string
          location?: string | null
          looking_for?: string | null
          photos?: string[]
          updated_at?: string
          username: string
        }
        Update: {
          bio?: string | null
          birth_date?: string | null
          created_at?: string
          full_name?: string | null
          gender?: string | null
          id?: string
          location?: string | null
          looking_for?: string | null
          photos?: string[]
          updated_at?: string
          username?: string
        }
      }
    }
  }
}