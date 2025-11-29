import { create } from 'zustand'
import { supabase } from '../lib/supabase'

interface Baby {
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

interface BabyState {
  babies: Baby[]
  currentBaby: Baby | null
  loading: boolean
  error: string | null
  fetchBabies: () => Promise<void>
  setCurrentBaby: (baby: Baby) => void
  addBaby: (baby: Omit<Baby, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
}

export const useBabyStore = create<BabyState>((set) => ({
  babies: [],
  currentBaby: null,
  loading: false,
  error: null,

  fetchBabies: async () => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('babies')
        .select('*')
        .order('sort_order', { ascending: true })
      
      if (error) throw error
      
      set({ babies: data || [], currentBaby: data?.[0] || null, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  setCurrentBaby: (baby: Baby) => {
    set({ currentBaby: baby })
  },

  addBaby: async (baby: Omit<Baby, 'id' | 'created_at' | 'updated_at'>) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('babies')
        .insert(baby)
        .select()
        .single()
      
      if (error) throw error
      
      set((state) => ({
        babies: [...state.babies, data],
        currentBaby: state.currentBaby || data,
        loading: false
      }))
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  },
}))