import { create } from 'zustand'
import { supabase } from '../lib/supabase'

interface Family {
  id: string
  creator_id: string
  name: string
  created_at: string
}

interface FamilyMember {
  id: string
  family_id: string
  user_id: string
  role: '管理员' | '家庭成员'
  joined_at: string
  users: {
    id: string
    email: string
    name: string
    avatar_url: string | null
  }
}

interface FamilyState {
  currentFamily: Family | null
  members: FamilyMember[]
  loading: boolean
  error: string | null
  fetchCurrentFamily: () => Promise<void>
  createFamily: (name: string) => Promise<void>
  inviteMember: (email: string) => Promise<void>
  removeMember: (memberId: string) => Promise<void>
  generateInviteCode: () => Promise<string>
}

export const useFamilyStore = create<FamilyState>((set) => ({
  currentFamily: null,
  members: [],
  loading: false,
  error: null,

  fetchCurrentFamily: async () => {
    set({ loading: true, error: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('用户未登录')

      // 获取用户所在的家庭
      const { data: memberData, error: memberError } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', user.id)
        .single()

      if (memberError || !memberData) {
        set({ currentFamily: null, members: [], loading: false })
        return
      }

      // 获取家庭信息
      const { data: familyData, error: familyError } = await supabase
        .from('families')
        .select('*')
        .eq('id', memberData.family_id)
        .single()

      if (familyError) throw familyError

      // 获取家庭成员
      const { data: membersData, error: membersError } = await supabase
        .from('family_members')
        .select(`
          *,
          users!inner(id, email, name, avatar_url)
        `)
        .eq('family_id', memberData.family_id)

      if (membersError) throw membersError

      set({
        currentFamily: familyData,
        members: membersData || [],
        loading: false,
      })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  createFamily: async (name: string) => {
    set({ loading: true, error: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('用户未登录')

      // 创建家庭
      const { data: familyData, error: familyError } = await supabase
        .from('families')
        .insert({
          creator_id: user.id,
          name,
        })
        .select()
        .single()

      if (familyError) throw familyError

      // 创建家庭成员记录（管理员）
      const { error: memberError } = await supabase
        .from('family_members')
        .insert({
          family_id: familyData.id,
          user_id: user.id,
          role: '管理员',
        })

      if (memberError) throw memberError

      set({ currentFamily: familyData, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  },

  inviteMember: async (email: string) => {
    set({ loading: true, error: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('用户未登录')

      // 检查是否是管理员
      const isAdmin = await supabase
        .from('family_members')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', '管理员')
        .single()

      if (!isAdmin.data) throw new Error('只有管理员可以邀请成员')

      // 这里应该实现邀请逻辑，暂时简化处理
      alert(`邀请链接已生成，请分享给 ${email}`)
      
      set({ loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  },

  removeMember: async (memberId: string) => {
    set({ loading: true, error: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('用户未登录')

      // 检查是否是管理员
      const isAdmin = await supabase
        .from('family_members')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', '管理员')
        .single()

      if (!isAdmin.data) throw new Error('只有管理员可以移除成员')

      const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('id', memberId)

      if (error) throw error

      // 重新获取成员列表
      await useFamilyStore.getState().fetchCurrentFamily()
      
      set({ loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  },

  generateInviteCode: async () => {
    // 生成邀请码逻辑
    return 'INVITE-' + Math.random().toString(36).substr(2, 8).toUpperCase()
  },
}))