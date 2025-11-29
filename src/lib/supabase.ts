import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/database'

const runtimeUrl = typeof window !== 'undefined' ? localStorage.getItem('supabase_url') || '' : ''
const runtimeAnon = typeof window !== 'undefined' ? localStorage.getItem('supabase_anon_key') || '' : ''

const envUrl = import.meta.env.VITE_SUPABASE_URL || ''
const envAnon = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

const supabaseUrl = runtimeUrl || envUrl
const supabaseAnonKey = runtimeAnon || envAnon

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

function createMockSupabase() {
  const keyUser = 'mock_user'
  function getStoredUser() {
    const raw = localStorage.getItem(keyUser)
    if (!raw) return null
    try { return JSON.parse(raw) } catch { return null }
  }
  function setStoredUser(user: any) {
    localStorage.setItem(keyUser, JSON.stringify(user))
  }
  return {
    auth: {
      async signInWithPassword({ email }: { email: string; password: string }) {
        const user = getStoredUser() || { id: 'mock-' + Date.now(), email, user_metadata: { name: email.split('@')[0] } }
        setStoredUser(user)
        return { data: { user }, error: null }
      },
      async signUp({ email, password, options }: any) {
        const name = options?.data?.name || email
        const user = { id: 'mock-' + Date.now(), email, user_metadata: { name } }
        setStoredUser(user)
        return { data: { user }, error: null }
      },
      async signOut() {
        localStorage.removeItem(keyUser)
        return { error: null }
      },
      async getUser() {
        const user = getStoredUser()
        return { data: { user } }
      },
    },
    from(table: string) {
      const key = 'mock_table_' + table
      function getRows() {
        const raw = localStorage.getItem(key)
        if (!raw) return []
        try { return JSON.parse(raw) } catch { return [] }
      }
      function setRows(rows: any[]) {
        localStorage.setItem(key, JSON.stringify(rows))
      }
      const api = {
        async select() {
          return { data: getRows(), error: null }
        },
        order() { return api },
        eq() { return api },
        gte() { return api },
        async insert(record: any) {
          const rows = getRows()
          rows.unshift(record)
          setRows(rows)
          return { data: [record], error: null }
        },
      }
      return api
    },
  } as any
}

export const supabase = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : createMockSupabase()
