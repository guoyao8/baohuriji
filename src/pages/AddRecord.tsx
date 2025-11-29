import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useBabyStore } from '../stores/baby'
import { useFeedingStore } from '../stores/feeding'

export default function AddRecord() {
  const navigate = useNavigate()
  const { babies, currentBaby } = useBabyStore()
  const { addRecord } = useFeedingStore()
  
  const [recordType, setRecordType] = useState<'母乳' | '配方奶' | '辅食'>('配方奶')
  const [selectedBaby, setSelectedBaby] = useState(currentBaby?.id || '')
  const [amount, setAmount] = useState('')
  const [duration, setDuration] = useState('')
  const [breastSide, setBreastSide] = useState<'左' | '右' | '无'>('无')
  const [feedingTime, setFeedingTime] = useState(
    new Date().toISOString().slice(0, 16)
  )
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBaby) return

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('用户未登录')

      const record = {
        baby_id: selectedBaby,
        user_id: user.id,
        record_type: recordType,
        amount_ml: recordType === '配方奶' || recordType === '母乳' ? parseInt(amount) || null : null,
        amount_kg: recordType === '辅食' ? parseFloat(amount) || null : null,
        duration_seconds: duration ? parseInt(duration) * 60 : null,
        breast_side: recordType === '母乳' ? breastSide : '无',
        feeding_time: new Date(feedingTime).toISOString(),
        note: note || null,
      }

      await addRecord(record)
      navigate('/home')
    } catch (error) {
      console.error('添加记录失败:', error)
      alert('添加记录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  if (babies.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">还没有宝宝档案</h3>
        <button
          onClick={() => navigate('/settings/baby/add')}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          添加宝宝
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">添加喂养记录</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 宝宝选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择宝宝
            </label>
            <select
              value={selectedBaby}
              onChange={(e) => setSelectedBaby(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">请选择宝宝</option>
              {babies.map((baby) => (
                <option key={baby.id} value={baby.id}>
                  {baby.name}
                </option>
              ))}
            </select>
          </div>

          {/* 喂养类型 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              喂养类型
            </label>
            <div className="flex gap-2">
              {(['配方奶', '母乳', '辅食'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setRecordType(type)}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    recordType === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* 喂养量 */}
          {(recordType === '配方奶' || recordType === '母乳') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                奶量 (ml)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入奶量"
                min="0"
              />
            </div>
          )}

          {/* 辅食量 */}
          {recordType === '辅食' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                辅食量 (斤)
              </label>
              <input
                type="number"
                step="0.1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入辅食量"
                min="0"
              />
            </div>
          )}

          {/* 喂养时长 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              喂养时长 (分钟)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入喂养时长"
              min="0"
            />
          </div>

          {/* 侧乳选择 */}
          {recordType === '母乳' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                侧乳
              </label>
              <div className="flex gap-2">
                {(['左', '右', '无'] as const).map((side) => (
                  <button
                    key={side}
                    type="button"
                    onClick={() => setBreastSide(side)}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      breastSide === side
                        ? 'bg-pink-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {side}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 喂养时间 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              喂养时间
            </label>
            <input
              type="datetime-local"
              value={feedingTime}
              onChange={(e) => setFeedingTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* 备注 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              备注 (可选)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入备注信息"
            />
          </div>

          {/* 提交按钮 */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '保存中...' : '保存记录'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/home')}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}