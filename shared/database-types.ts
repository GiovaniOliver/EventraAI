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
      users: {
        Row: {
          id: string // This is a UUID string from auth.users
          username: string
          display_name: string
          email: string
          is_admin: boolean
          password?: string // Optional as it's managed by auth
          stripe_customer_id?: string
          subscription_tier: string // free, starter, pro, business, enterprise
          subscription_status: string // active, past_due, canceled, unpaid
          created_at: string
        }
        Insert: {
          id: string
          username: string
          display_name: string
          email: string
          is_admin?: boolean
          password?: string
          stripe_customer_id?: string
          subscription_tier?: string
          subscription_status?: string
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          display_name?: string
          email?: string
          is_admin?: boolean
          password?: string
          stripe_customer_id?: string
          subscription_tier?: string
          subscription_status?: string
          created_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          type: string // conference, birthday, webinar, other
          format: string // virtual, in-person, hybrid
          date: string
          owner_id: string
          estimated_guests?: number
          description?: string
          status: string // draft, planning, active, completed, cancelled
          theme?: string
          budget?: number
          location?: string
          start_date?: string
          end_date?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          type: string
          format: string
          date: string
          owner_id: string
          estimated_guests?: number
          description?: string
          status?: string
          theme?: string
          budget?: number
          location?: string
          start_date?: string
          end_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          type?: string
          format?: string
          date?: string
          owner_id?: string
          estimated_guests?: number
          description?: string
          status?: string
          theme?: string
          budget?: number
          location?: string
          start_date?: string
          end_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          event_id: string
          title: string
          description?: string
          status: string // pending, in-progress, completed
          due_date?: string
          assigned_to?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          title: string
          description?: string
          status?: string
          due_date?: string
          assigned_to?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          title?: string
          description?: string
          status?: string
          due_date?: string
          assigned_to?: string
          created_at?: string
          updated_at?: string
        }
      }
      vendors: {
        Row: {
          id: string
          name: string
          category: string
          contact_info: string
          website?: string
          rating?: number
          price_range?: string
          description?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          contact_info: string
          website?: string
          rating?: number
          price_range?: string
          description?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          contact_info?: string
          website?: string
          rating?: number
          price_range?: string
          description?: string
          created_at?: string
          updated_at?: string
        }
      }
      event_vendors: {
        Row: {
          id: string
          event_id: string
          vendor_id: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          vendor_id: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          vendor_id?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
