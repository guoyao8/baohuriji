import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useBabyStore } from '../stores/baby'

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

export default function BabyProfile() {
  const navigate = useNavigate()
  const { babies, fetchBabies } = useBabyStore()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchBabies()
  }, [])

  const handleDelete = async (babyId: string) => {
    if (!confirm('确定要删除这个宝宝档案吗？此操作不可恢复。')) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('babies')
        .delete()
        .eq('id', babyId)

      if (error) throw error
      
      await fetchBabies()
      alert('宝宝档案已删除')
    } catch (error) {
      console.error('删除宝宝档案失败:', error)
      alert('删除失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate)
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - birth.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 30) {
      return `${diffDays} 天`
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      const days = diffDays % 30
      return `${months} 个月 ${days} 天`
    } else {
      const years = Math.floor(diffDays / 365)
      const months = Math.floor((diffDays % 365) / 30)
      return `${years} 岁 ${months} 个月`
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">宝宝档案</h2>
        <button
          onClick={() => navigate('/settings/baby/add')}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
        >
          添加宝宝
        </button>
      </div>

      {babies.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-4xl mb-4">👶</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">还没有宝宝档案</h3>
          <p className="text-gray-600 mb-4">添加您的第一个宝宝档案开始记录喂养信息</p>
          <button
            onClick={() => navigate('/settings/baby/add')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            添加宝宝
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {babies.map((baby) => (
            <div key={baby.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">{baby.gender === '男' ? '👦' : '👧'}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{baby.name}</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>性别: {baby.gender || '未设置'}</div>
                      <div>生日: {new Date(baby.birth_date).toLocaleDateString('zh-CN')}</div>
                      <div>年龄: {calculateAge(baby.birth_date)}</div>
                      {baby.is_twins && (
                        <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          双胎模式
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigate(`/settings/baby/edit/${baby.id}`)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(baby.id)}
                    disabled={loading}
                    className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}