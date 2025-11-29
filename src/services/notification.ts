import { ReminderSetting } from '../stores/reminder'

export interface NotificationOptions {
  title: string
  body: string
  icon?: string
  badge?: string
  sound?: string
  tag?: string
  requireInteraction?: boolean
}

export class NotificationService {
  private static instance: NotificationService
  private audioContext: AudioContext | null = null
  private reminderInterval: NodeJS.Timeout | null = null

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  constructor() {
    this.requestPermission()
    this.initAudioContext()
  }

  private async requestPermission() {
    if ('Notification' in window) {
      await Notification.requestPermission()
    }
  }

  private initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    } catch (error) {
      console.warn('无法初始化音频上下文:', error)
    }
  }

  private playSound(frequency = 800, duration = 200) {
    if (!this.audioContext) return

    try {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime)
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000)

      oscillator.start(this.audioContext.currentTime)
      oscillator.stop(this.audioContext.currentTime + duration / 1000)
    } catch (error) {
      console.warn('无法播放声音:', error)
    }
  }

  private vibrate(pattern: number[]) {
    if ('vibrate' in navigator) {
      try {
        ;(navigator as any).vibrate(pattern)
      } catch (error) {
        console.warn('无法触发震动:', error)
      }
    }
  }

  async showNotification(options: NotificationOptions) {
    if (!('Notification' in window)) {
      console.warn('浏览器不支持通知')
      return
    }

    if (Notification.permission === 'granted') {
      try {
        const notification = new Notification(options.title, {
          body: options.body,
          icon: options.icon || '/icon-192x192.png',
          badge: options.badge || '/icon-72x72.png',
          tag: options.tag || 'feeding-reminder',
          requireInteraction: options.requireInteraction !== false,
        })

        notification.onclick = () => {
          window.focus()
          notification.close()
        }

        return notification
      } catch (error) {
        console.warn('显示通知失败:', error)
      }
    }
  }

  async triggerReminder(babyName: string, scope: string, setting: ReminderSetting) {
    const title = `${babyName} - 喂养提醒`
    const body = scope === '统一' 
      ? `是时候给${babyName}喂奶了！`
      : `是时候给${babyName}(${scope}宝宝)喂奶了！`

    // 显示通知
    await this.showNotification({
      title,
      body,
      requireInteraction: true,
    })

    // 播放声音
    if (setting.reminder_type.includes('铃声')) {
      this.playSound(800, 300)
      // 播放3次
      setTimeout(() => this.playSound(800, 300), 500)
      setTimeout(() => this.playSound(800, 300), 1000)
    }

    // 触发震动
    if (setting.reminder_type.includes('震动')) {
      this.vibrate([200, 100, 200, 100, 200])
    }
  }

  startReminderCheck(intervalMinutes: number = 1) {
    this.stopReminderCheck()
    
    this.reminderInterval = setInterval(() => {
      // 这里可以集成提醒检查逻辑
      console.log('执行提醒检查...')
      // 可以在这里调用 store 的 checkReminders 方法
    }, intervalMinutes * 60 * 1000)
  }

  stopReminderCheck() {
    if (this.reminderInterval) {
      clearInterval(this.reminderInterval)
      this.reminderInterval = null
    }
  }

  // 浏览器后台运行支持
  enableBackgroundSync() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        const reg: any = registration
        if (reg && reg.sync && typeof reg.sync.register === 'function') {
          reg.sync.register('feeding-reminders').catch((error: any) => {
            console.warn('后台同步注册失败:', error)
          })
        }
      })
    }
  }
}

export const notificationService = NotificationService.getInstance()
