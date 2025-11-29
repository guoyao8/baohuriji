import { useState, useEffect } from 'react'
import { useBabyStore } from '../stores/baby'
import { useReminderStore, ReminderSetting } from '../stores/reminder'

export default function ReminderSettings() {
  const { babies, currentBaby } = useBabyStore()
  const { settings, loading, fetchReminderSettings, createDefaultSettings, updateSetting } = useReminderStore()
  const [editingSetting, setEditingSetting] = useState<ReminderSetting | null>(null)

  useEffect(() => {
    if (currentBaby) {
      fetchReminderSettings(currentBaby.id)
    }
  }, [currentBaby, fetchReminderSettings])

  // 如果没有设置，创建默认设置
  useEffect(() => {
    if (currentBaby && settings.length === 0) {
      createDefaultSettings(currentBaby.id, currentBaby.is_twins)
    }
  }, [currentBaby, settings.length, createDefaultSettings])

  const handleToggle = async (setting: ReminderSetting) => {
    await updateSetting(setting.id, { is_enabled: !setting.is_enabled })
  }

  const handleSaveEdit = async () => {
    if (!editingSetting) return

    try {
      await updateSetting(editingSetting.id, {
        interval_hours: editingSetting.interval_hours,
        interval_minutes: editingSetting.interval_minutes,
        reminder_type: editingSetting.reminder_type,
        ringtone: editingSetting.ringtone,
      })
      setEditingSetting(null)
    } catch (error) {
      alert('更新失败，请重试')
    }
  }

  const formatTime = (hours: number, minutes: number) => {
    if (hours === 0 && minutes === 0) return '立即'
    if (hours === 0) return `${minutes}分钟`
    if (minutes === 0) return `${hours}小时`
    return `${hours}小时${minutes}分钟`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">加载提醒设置中...</div>
      </div>
    )
  }

  if (!currentBaby) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">还没有宝宝档案</h3>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">喂养提醒 - {currentBaby.name}</h2>
        <select
          value={currentBaby.id}
          onChange={(e) => {
            const baby = babies.find(b => b.id === e.target.value)
            if (baby) {
              // 这里需要实现切换宝宝的逻辑
              console.log('切换到宝宝:', baby.name)
            }
          }}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {babies.map((baby) => (
            <option key={baby.id} value={baby.id}>
              {baby.name}
            </option>
          ))}
        </select>
      </div>

      {/* 提醒设置列表 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">提醒设置</h3>
          <p className="text-sm text-gray-600 mt-1">管理喂养提醒时间和方式</p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {settings.map((setting) => (
            <div key={setting.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleToggle(setting)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      setting.is_enabled ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        setting.is_enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <div>
                    <div className="font-medium text-gray-900">
                      {setting.scope === '统一' ? '统一提醒' : `${setting.scope}宝宝提醒`}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatTime(setting.interval_hours, setting.interval_minutes)} • {setting.reminder_type}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setEditingSetting(setting)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  编辑
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 编辑模态框 */}
      {editingSetting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              编辑 {editingSetting.scope === '统一' ? '统一提醒' : `${editingSetting.scope}宝宝提醒`}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  间隔时间
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={editingSetting.interval_hours}
                    onChange={(e) => setEditingSetting({
                      ...editingSetting,
                      interval_hours: parseInt(e.target.value) || 0
                    })}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="py-2">小时</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={editingSetting.interval_minutes}
                    onChange={(e) => setEditingSetting({
                      ...editingSetting,
                      interval_minutes: parseInt(e.target.value) || 0
                    })}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="py-2">分钟</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  提醒方式
                </label>
                <select
                  value={editingSetting.reminder_type}
                  onChange={(e) => setEditingSetting({
                    ...editingSetting,
                    reminder_type: e.target.value as '震动' | '铃声' | '震动和铃声'
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="震动">震动</option>
                  <option value="铃声">铃声</option>
                  <option value="震动和铃声">震动和铃声</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  铃声
                </label>
                <select
                  value={editingSetting.ringtone}
                  onChange={(e) => setEditingSetting({
                    ...editingSetting,
                    ringtone: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="默认">默认</option>
                  <option value="轻柔">轻柔</option>
                  <option value="活泼">活泼</option>
                  <option value="温馨">温馨</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveEdit}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                保存
              </button>
              <button
                onClick={() => setEditingSetting(null)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 功能说明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">提醒设置说明</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 统一提醒：适用于单胎模式或双胎模式下的统一提醒</li>
          <li>• A/B宝宝提醒：双胎模式下为每个宝宝设置独立的提醒</li>
          <li>• 提醒将在设定的时间间隔后触发</li>
          <li>• 支持震动、铃声或两者组合的提醒方式</li>
        </ul>
      </div>
    </div>
  )
}