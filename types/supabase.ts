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
      analysis_results: {
        Row: {
          id: number
          created_at: string
          user_id: string
          conversation: string
          context: string | null
          strengths: string
          weaknesses: string
          tips: string
          overall: string
          score: number
        }
        Insert: {
          id?: number
          created_at?: string
          user_id: string
          conversation: string
          context?: string | null
          strengths: string
          weaknesses: string
          tips: string
          overall: string
          score: number
        }
        Update: {
          id?: number
          created_at?: string
          user_id?: string
          conversation?: string
          context?: string | null
          strengths?: string
          weaknesses?: string
          tips?: string
          overall?: string
          score?: number
        }
      }
      // Otras tablas...
    }
    // Otras propiedades...
  }
}
