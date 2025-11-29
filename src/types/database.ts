export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password_hash: string
          name: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          name: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          name?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      babies: {
        Row: {
          id: string
          user_id: string
          name: string
          gender: '男' | '女' | null
          birth_date: string
          avatar_url: string | null
          sort_order: number
          is_twins: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          gender?: '男' | '女' | null
          birth_date: string
          avatar_url?: string | null
          sort_order?: number
          is_twins?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          gender?: '男' | '女' | null
          birth_date?: string
          avatar_url?: string | null
          sort_order?: number
          is_twins?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      feeding_records: {
        Row: {
          id: string
          baby_id: string
          user_id: string
          record_type: '母乳' | '配方奶' | '辅食'
          amount_ml: number | null
          amount_kg: number | null
          duration_seconds: number | null
          breast_side: '左' | '右' | '无' | null
          feeding_time: string
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          baby_id: string
          user_id: string
          record_type: '母乳' | '配方奶' | '辅食'
          amount_ml?: number | null
          amount_kg?: number | null
          duration_seconds?: number | null
          breast_side?: '左' | '右' | '无' | null
          feeding_time: string
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          baby_id?: string
          user_id?: string
          record_type?: '母乳' | '配方奶' | '辅食'
          amount_ml?: number | null
          amount_kg?: number | null
          duration_seconds?: number | null
          breast_side?: '左' | '右' | '无' | null
          feeding_time?: string
          note?: string | null
          created_at?: string
        }
      }
      families: {
        Row: {
          id: string
          creator_id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          creator_id?: string
          name?: string
          created_at?: string
        }
      }
      family_members: {
        Row: {
          id: string
          family_id: string
          user_id: string
          role: '管理员' | '家庭成员'
          joined_at: string
        }
        Insert: {
          id?: string
          family_id: string
          user_id: string
          role: '管理员' | '家庭成员'
          joined_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          user_id?: string
          role?: '管理员' | '家庭成员'
          joined_at?: string
        }
      }
      reminder_settings: {
        Row: {
          id: string
          baby_id: string
          scope: '统一' | 'A' | 'B'
          is_enabled: boolean
          interval_hours: number
          interval_minutes: number
          reminder_type: '震动' | '铃声' | '震动和铃声'
          ringtone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          baby_id: string
          scope: '统一' | 'A' | 'B'
          is_enabled?: boolean
          interval_hours?: number
          interval_minutes?: number
          reminder_type?: '震动' | '铃声' | '震动和铃声'
          ringtone?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          baby_id?: string
          scope?: '统一' | 'A' | 'B'
          is_enabled?: boolean
          interval_hours?: number
          interval_minutes?: number
          reminder_type?: '震动' | '铃声' | '震动和铃声'
          ringtone?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}