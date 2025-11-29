import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useBabyStore } from '../stores/baby'
import { Line, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface FeedingRecord {
  id: string
  baby_id: string
  user_id: string
  record_type: '母乳' | '配方奶' | '辅食'
  amount_ml: number | null
  amount_kg: number | null
  duration_seconds: number | null
  breast_side: '左' | '右' | '无' | null
  feeding_time: string
  note: string | null
  created_at: string
}

export default function Statistics() {
  const [viewMode, setViewMode] = useState<'日' | '周'>('日')
  const [records, setRecords] = useState<FeedingRecord[]>([])
  const [loading, setLoading] = useState(false)
  const { babies, currentBaby } = useBabyStore()

  useEffect(() => {
    if (currentBaby) {
      fetchStatistics()
    }
  }, [currentBaby, viewMode])

  const fetchStatistics = async () => {
    if (!currentBaby) return

    setLoading(true)
    try {
      let startDate: Date
      let endDate = new Date()

      if (viewMode === '日') {
        startDate = new Date()
        startDate.setHours(0, 0, 0, 0)
      } else {
        startDate = new Date()
        startDate.setDate(startDate.getDate() - 7)
        startDate.setHours(0, 0, 0, 0)
      }

      const { data, error } = await supabase
        .from('feeding_records')
        .select('*')
        .eq('baby_id', currentBaby.id)
        .gte('feeding_time', startDate.toISOString())
        .lte('feeding_time', endDate.toISOString())
        .order('feeding_time', { ascending: true })

      if (error) throw error
      setRecords(data || [])
    } catch (error) {
      console.error('获取统计数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const getChartData = () => {
    if (viewMode === '日') {
      // 日视图 - 按小时统计
      const hourlyData = Array.from({ length: 24 }, (_, i) => {
        const hourRecords = records.filter(record => {
          const recordHour = new Date(record.feeding_time).getHours()
          return recordHour === i
        })
        
        const totalAmount = hourRecords.reduce((sum, record) => {
          return sum + (record.amount_ml || record.amount_kg || 0)
        }, 0)
        
        return totalAmount
      })

      return {
        labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
        datasets: [
          {
            label: '喂养量',
            data: hourlyData,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
          },
        ],
      }
    } else {
      // 周视图 - 按天统计
      const dailyData = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (6 - i))
        date.setHours(0, 0, 0, 0)
        
        const nextDate = new Date(date)
        nextDate.setDate(nextDate.getDate() + 1)
        
        const dayRecords = records.filter(record => {
          const recordDate = new Date(record.feeding_time)
          return recordDate >= date && recordDate < nextDate
        })
        
        const totalAmount = dayRecords.reduce((sum, record) => {
          return sum + (record.amount_ml || record.amount_kg || 0)
        }, 0)
        
        return totalAmount
      })

      const labels = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (6 - i))
        return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
      })

      return {
        labels,
        datasets: [
          {
            label: '喂养量',
            data: dailyData,
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
          },
        ],
      }
    }
  }

  const getTypeStats = () => {
    const typeStats = {
      '母乳': { count: 0, amount: 0 },
      '配方奶': { count: 0, amount: 0 },
      '辅食': { count: 0, amount: 0 },
    }

    records.forEach(record => {
      typeStats[record.record_type].count++
      typeStats[record.record_type].amount += (record.amount_ml || record.amount_kg || 0)
    })

    return typeStats
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${viewMode}视图 - 喂养趋势`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: '喂养量 (ml/斤)',
        },
      },
    },
  }

  const typeStats = getTypeStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">加载统计数据中...</div>
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
    <div className="space-y-6">
      {/* 页面标题和视图切换 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">数据统计 - {currentBaby.name}</h2>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('日')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              viewMode === '日'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            日视图
          </button>
          <button
            onClick={() => setViewMode('周')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              viewMode === '周'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            周视图
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">喂养类型统计</h3>
          <div className="space-y-3">
            {Object.entries(typeStats).map(([type, stats]) => (
              <div key={type} className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{type}</span>
                <div className="text-right">
                  <div className="text-sm text-gray-900">{stats.count} 次</div>
                  <div className="text-xs text-gray-500">{stats.amount} ml/斤</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">总览</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">总记录数</span>
              <span className="text-sm text-gray-900">{records.length} 条</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">总喂养量</span>
              <span className="text-sm text-gray-900">
                {records.reduce((sum, record) => sum + (record.amount_ml || record.amount_kg || 0), 0)} ml/斤
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">平均喂养量</span>
              <span className="text-sm text-gray-900">
                {records.length > 0 
                  ? Math.round(records.reduce((sum, record) => sum + (record.amount_ml || record.amount_kg || 0), 0) / records.length)
                  : 0
                } ml/斤
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">喂养频率</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">日均次数</span>
              <span className="text-sm text-gray-900">
                {viewMode === '日' 
                  ? records.length
                  : records.length > 0 ? (records.length / 7).toFixed(1) : '0'
                } 次
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">间隔时间</span>
              <span className="text-sm text-gray-900">
                {records.length > 1 
                  ? `${Math.round(24 / (viewMode === '日' ? records.length : records.length / 7))} 小时`
                  : '-'
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 图表 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="h-96">
          {viewMode === '日' ? (
            <Line data={getChartData()} options={chartOptions} />
          ) : (
            <Bar data={getChartData()} options={chartOptions} />
          )}
        </div>
      </div>

      {/* 双胎模式对比 */}
      {babies.length > 1 && babies.some(baby => baby.is_twins) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">双胎对比</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {babies.filter(baby => baby.is_twins).map((baby) => {
              const babyRecords = records.filter(record => record.baby_id === baby.id)
              const totalAmount = babyRecords.reduce((sum, record) => sum + (record.amount_ml || record.amount_kg || 0), 0)
              
              return (
                <div key={baby.id} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">{baby.name}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">记录数</span>
                      <span className="font-medium">{babyRecords.length} 条</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">总喂养量</span>
                      <span className="font-medium">{totalAmount} ml/斤</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">平均喂养量</span>
                      <span className="font-medium">
                        {babyRecords.length > 0 ? Math.round(totalAmount / babyRecords.length) : 0} ml/斤
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}