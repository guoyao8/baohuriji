import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBabyStore } from '../stores/baby'
import { useFeedingStore } from '../stores/feeding'

export default function Home() {
  const navigate = useNavigate()
  const { babies, currentBaby, loading: babyLoading } = useBabyStore()
  const { records, todayStats, loading: feedingLoading, fetchRecords, fetchTodayStats } = useFeedingStore()

  useEffect(() => {
    if (currentBaby) {
      fetchRecords(currentBaby.id)
      fetchTodayStats(currentBaby.id)
    }
  }, [currentBaby, fetchRecords, fetchTodayStats])

  if (babyLoading || feedingLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  if (!currentBaby) {
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

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return ''
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}分${remainingSeconds}秒`
  }

  return (
    <div className="space-y-6">
      {/* 宝宝选择 */}
      {babies.length > 1 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">选择宝宝</h3>
          <div className="flex gap-2">
            {babies.map((baby) => (
              <button
                key={baby.id}
                onClick={() => useBabyStore.getState().setCurrentBaby(baby)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  currentBaby.id === baby.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {baby.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 今日统计 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">今日统计 - {currentBaby.name}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{todayStats.totalAmount}</div>
            <div className="text-sm text-gray-600">总喂养量</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{todayStats.totalCount}</div>
            <div className="text-sm text-gray-600">喂养次数</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-lg font-semibold text-purple-600">
              {todayStats.lastFeeding ? formatTime(todayStats.lastFeeding) : '暂无'}
            </div>
            <div className="text-sm text-gray-600">上次喂养</div>
          </div>
        </div>
      </div>

      {/* 最近记录 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">最近记录</h3>
          <button
            onClick={() => navigate('/record/add')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            添加记录
          </button>
        </div>
        
        {records.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            暂无喂养记录
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((record) => (
              <div key={record.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        record.record_type === '母乳' ? 'bg-pink-100 text-pink-800' :
                        record.record_type === '配方奶' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {record.record_type}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {formatTime(record.feeding_time)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700">
                      {record.amount_ml && <span>奶量: {record.amount_ml}ml </span>}
                      {record.amount_kg && <span>辅食: {record.amount_kg}斤 </span>}
                      {record.duration_seconds && <span>时长: {formatDuration(record.duration_seconds)}</span>}
                      {record.breast_side && record.breast_side !== '无' && (
                        <span> 侧乳: {record.breast_side}</span>
                      )}
                    </div>
                    {record.note && (
                      <div className="text-sm text-gray-500 mt-1">{record.note}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}