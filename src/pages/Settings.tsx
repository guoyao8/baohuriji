import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/auth'
import { useBabyStore } from '../stores/baby'

export default function Settings() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { babies } = useBabyStore()

  const settingsItems = [
    {
      title: '账户设置',
      description: '管理您的账户信息',
      icon: '👤',
      path: '/settings',
    },
    {
      title: '宝宝档案',
      description: `管理宝宝信息 (${babies.length}个宝宝)`,
      icon: '👶',
      path: '/settings/baby',
    },
    {
      title: '家庭模式',
      description: '家庭成员协作管理',
      icon: '👨‍👩‍👧‍👦',
      path: '/settings/family',
    },
    {
      title: '喂养提醒',
      description: '设置喂养提醒时间',
      icon: '⏰',
      path: '/settings/reminders',
    },
    {
      title: '后端配置',
      description: '设置Supabase URL与Anon Key',
      icon: '🛠️',
      path: '/settings/backend',
    },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">设置</h2>
          <p className="text-sm text-gray-600 mt-1">管理您的账户和宝宝信息</p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {settingsItems.map((item, index) => (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="text-2xl">{item.icon}</div>
                <div className="text-left">
                  <h3 className="text-base font-medium text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </div>
              <div className="text-gray-400">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 用户信息卡片 */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">账户信息</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">邮箱</span>
            <span className="text-sm font-medium text-gray-900">{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">姓名</span>
            <span className="text-sm font-medium text-gray-900">
              {user?.user_metadata?.name || '未设置'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">宝宝数量</span>
            <span className="text-sm font-medium text-gray-900">{babies.length} 个</span>
          </div>
        </div>
      </div>
    </div>
  )
}
