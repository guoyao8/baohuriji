import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useBabyStore } from '../stores/baby'

export default function AddBaby() {
  const navigate = useNavigate()
  const { addBaby } = useBabyStore()
  
  const [name, setName] = useState('')
  const [gender, setGender] = useState<'男' | '女' | ''>('')
  const [birthDate, setBirthDate] = useState('')
  const [isTwins, setIsTwins] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !birthDate) return

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('用户未登录')

      await addBaby({
        user_id: user.id,
        name,
        gender: gender as '男' | '女' | null,
        birth_date: birthDate,
        avatar_url: null,
        sort_order: 0,
        is_twins: isTwins,
      })

      navigate('/settings/baby')
    } catch (error) {
      console.error('添加宝宝失败:', error)
      alert('添加宝宝失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">添加宝宝</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 宝宝姓名 */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              宝宝姓名 *
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入宝宝姓名"
              required
            />
          </div>

          {/* 性别 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              性别
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="男"
                  checked={gender === '男'}
                  onChange={(e) => setGender(e.target.value as '男' | '女' | '')}
                  className="mr-2"
                />
                男
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="女"
                  checked={gender === '女'}
                  onChange={(e) => setGender(e.target.value as '男' | '女' | '')}
                  className="mr-2"
                />
                女
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value=""
                  checked={gender === ''}
                  onChange={(e) => setGender(e.target.value as '男' | '女' | '')}
                  className="mr-2"
                />
                保密
              </label>
            </div>
          </div>

          {/* 生日 */}
          <div>
            <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-2">
              生日 *
            </label>
            <input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* 双胎模式 */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isTwins}
                onChange={(e) => setIsTwins(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">启用双胎模式</span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              启用后，该宝宝将支持双胎模式下的独立记录和统计
            </p>
          </div>

          {/* 提交按钮 */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '保存中...' : '添加宝宝'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/settings/baby')}
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
