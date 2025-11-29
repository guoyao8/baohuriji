import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { notificationService } from '../services/notification'
import { useFeedingStore } from './feeding'
import { useBabyStore } from './baby'

export interface ReminderSetting {
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

interface ReminderState {
  settings: ReminderSetting[]
  loading: boolean
  fetchReminderSettings: (babyId: string) => Promise<void>
  createDefaultSettings: (babyId: string, isTwins: boolean) => Promise<void>
  updateSetting: (settingId: string, updates: Partial<ReminderSetting>) => Promise<void>
  checkReminders: () => Promise<void>
}

export const useReminderStore = create<ReminderState>((set, get) => ({
  settings: [],
  loading: false,

  fetchReminderSettings: async (babyId: string) => {
    set({ loading: true })
    try {
      const { data, error } = await supabase
        .from('reminder_settings')
        .select('*')
        .eq('baby_id', babyId)

      if (error) throw error
      
      set({ settings: data || [] })
    } catch (error) {
      console.error('获取提醒设置失败:', error)
    } finally {
      set({ loading: false })
    }
  },

  createDefaultSettings: async (babyId: string, isTwins: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('用户未登录')

      const defaultSettings: Array<{
        baby_id: string
        scope: '统一' | 'A' | 'B'
        is_enabled: boolean
        interval_hours: number
        interval_minutes: number
        reminder_type: '震动和铃声'
        ringtone: string
      }> = [
        {
          baby_id: babyId,
          scope: '统一',
          is_enabled: true,
          interval_hours: 3,
          interval_minutes: 0,
          reminder_type: '震动和铃声',
          ringtone: '默认',
        }
      ]

      // 如果是双胎模式，为A和B也创建设置
      if (isTwins) {
        defaultSettings.push(
          {
            baby_id: babyId,
            scope: 'A',
            is_enabled: true,
            interval_hours: 3,
            interval_minutes: 0,
            reminder_type: '震动和铃声',
            ringtone: '默认',
          },
          {
            baby_id: babyId,
            scope: 'B',
            is_enabled: true,
            interval_hours: 3,
            interval_minutes: 0,
            reminder_type: '震动和铃声',
            ringtone: '默认',
          }
        )
      }

      const { data, error } = await supabase
        .from('reminder_settings')
        .insert(defaultSettings)
        .select()

      if (error) throw error
      set({ settings: data || [] })
    } catch (error) {
      console.error('创建默认设置失败:', error)
    }
  },

  updateSetting: async (settingId: string, updates: Partial<ReminderSetting>) => {
    try {
      const { data, error } = await supabase
        .from('reminder_settings')
        .update(updates)
        .eq('id', settingId)
        .select()
        .single()

      if (error) throw error

      set(state => ({
        settings: state.settings.map(setting => 
          setting.id === settingId ? data : setting
        )
      }))
    } catch (error) {
      console.error('更新设置失败:', error)
      throw error
    }
  },

  checkReminders: async () => {
    const { settings } = get()
    const { currentBaby } = useBabyStore.getState()
    const { records } = useFeedingStore.getState()

    if (!currentBaby || settings.length === 0) return

    const now = new Date()
    
    // 检查每个设置
    for (const setting of settings) {
      if (!setting.is_enabled) continue

      // 获取相关的喂养记录
      let relevantRecords = records.filter(record => record.baby_id === currentBaby.id)
      
      // 如果是双胎模式且不是统一提醒，过滤对应宝宝的记录
      if (currentBaby.is_twins && setting.scope !== '统一') {
        relevantRecords = relevantRecords
      }

      // 按时间排序，获取最新的记录
      const latestRecord = relevantRecords
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]

      // 如果没有记录，或者距离上次喂养时间超过设定间隔，触发提醒
      const shouldRemind = !latestRecord || 
        (now.getTime() - new Date(latestRecord.created_at).getTime()) >= 
        (setting.interval_hours * 60 + setting.interval_minutes) * 60 * 1000

      if (shouldRemind) {
        await notificationService.triggerReminder(
          currentBaby.name,
          setting.scope,
          setting
        )
      }
    }
  }
}))
