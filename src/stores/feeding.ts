import { create } from 'zustand'
import { supabase } from '../lib/supabase'

interface FeedingRecord {
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

interface FeedingState {
  records: FeedingRecord[]
  todayStats: {
    totalAmount: number
    totalCount: number
    lastFeeding: string | null
  }
  loading: boolean
  error: string | null
  fetchRecords: (babyId: string, limit?: number) => Promise<void>
  fetchTodayStats: (babyId: string) => Promise<void>
  addRecord: (record: Omit<FeedingRecord, 'id' | 'created_at'>) => Promise<void>
}

export const useFeedingStore = create<FeedingState>((set) => ({
  records: [],
  todayStats: {
    totalAmount: 0,
    totalCount: 0,
    lastFeeding: null,
  },
  loading: false,
  error: null,

  fetchRecords: async (babyId: string, limit = 10) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('feeding_records')
        .select('*')
        .eq('baby_id', babyId)
        .order('feeding_time', { ascending: false })
        .limit(limit)
      
      if (error) throw error
      
      set({ records: data || [], loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  fetchTodayStats: async (babyId: string) => {
    set({ loading: true, error: null })
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const { data, error } = await supabase
        .from('feeding_records')
        .select('*')
        .eq('baby_id', babyId)
        .gte('feeding_time', today.toISOString())
        .lt('feeding_time', tomorrow.toISOString())
        .order('feeding_time', { ascending: false })
      
      if (error) throw error
      
      const records = data || []
      const totalAmount = records.reduce((sum, record) => {
        return sum + (record.amount_ml || record.amount_kg || 0)
      }, 0)
      
      const totalCount = records.length
      const lastFeeding = records[0]?.feeding_time || null

      set({
        todayStats: {
          totalAmount,
          totalCount,
          lastFeeding,
        },
        loading: false,
      })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  addRecord: async (record: Omit<FeedingRecord, 'id' | 'created_at'>) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('feeding_records')
        .insert(record)
        .select()
        .single()
      
      if (error) throw error
      
      set((state) => ({
        records: [data, ...state.records],
        loading: false,
      }))
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  },
}))