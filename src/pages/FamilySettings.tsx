import { useState, useEffect } from 'react'
import { useFamilyStore } from '../stores/family'
import { useAuthStore } from '../stores/auth'

export default function FamilySettings() {
  const [inviteEmail, setInviteEmail] = useState('')
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [newFamilyName, setNewFamilyName] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  
  const { currentFamily, members, loading, error, fetchCurrentFamily, createFamily, inviteMember, removeMember } = useFamilyStore()
  const { user } = useAuthStore()

  useEffect(() => {
    fetchCurrentFamily()
  }, [])

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFamilyName.trim()) return

    try {
      await createFamily(newFamilyName.trim())
      setNewFamilyName('')
      setShowCreateForm(false)
      alert('家庭创建成功！')
    } catch (error) {
      alert('创建家庭失败，请重试')
    }
  }

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return

    try {
      await inviteMember(inviteEmail.trim())
      setInviteEmail('')
      setShowInviteForm(false)
    } catch (error) {
      alert('邀请失败：' + (error as Error).message)
    }
  }

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`确定要移除 ${memberName} 吗？`)) return

    try {
      await removeMember(memberId)
      alert('成员已移除')
    } catch (error) {
      alert('移除失败：' + (error as Error).message)
    }
  }

  const isCurrentUserAdmin = () => {
    if (!user || !currentFamily) return false
    return members.some(member => 
      member.user_id === user.id && member.role === '管理员'
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">家庭模式</h2>
        {!currentFamily && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            创建家庭
          </button>
        )}
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* 创建家庭表单 */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">创建家庭</h3>
          <form onSubmit={handleCreateFamily} className="space-y-4">
            <div>
              <label htmlFor="familyName" className="block text-sm font-medium text-gray-700 mb-2">
                家庭名称
              </label>
              <input
                id="familyName"
                type="text"
                value={newFamilyName}
                onChange={(e) => setNewFamilyName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入家庭名称"
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                创建
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 家庭信息 */}
      {currentFamily && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{currentFamily.name}</h3>
              <p className="text-sm text-gray-600">家庭ID: {currentFamily.id}</p>
            </div>
            {isCurrentUserAdmin() && (
              <button
                onClick={() => setShowInviteForm(true)}
                className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 text-sm"
              >
                邀请成员
              </button>
            )}
          </div>

          {/* 邀请成员表单 */}
          {showInviteForm && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <form onSubmit={handleInviteMember} className="space-y-3">
                <div>
                  <label htmlFor="inviteEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    邀请邮箱
                  </label>
                  <input
                    id="inviteEmail"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入要邀请的邮箱地址"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-green-600 text-white py-1 px-3 rounded-md hover:bg-green-700 text-sm"
                  >
                    发送邀请
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowInviteForm(false)}
                    className="bg-gray-300 text-gray-700 py-1 px-3 rounded-md hover:bg-gray-400 text-sm"
                  >
                    取消
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 家庭成员列表 */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">家庭成员 ({members.length})</h4>
            <div className="space-y-3">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {member.users.name?.charAt(0) || member.users.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {member.users.name || member.users.email}
                      </div>
                      <div className="text-sm text-gray-600">
                        {member.role}
                      </div>
                    </div>
                  </div>
                  {isCurrentUserAdmin() && member.user_id !== user?.id && (
                    <button
                      onClick={() => handleRemoveMember(member.id, member.users.name || member.users.email)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      移除
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 未加入家庭提示 */}
      {!currentFamily && !showCreateForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-4xl mb-4">👨‍👩‍👧‍👦</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">您还没有加入任何家庭</h3>
          <p className="text-gray-600 mb-6">
            创建一个新的家庭或联系家庭管理员获取邀请链接
          </p>
          <div className="space-x-4">
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              创建家庭
            </button>
            <button
              onClick={() => {
                const code = prompt('请输入邀请码：')
                if (code) {
                  alert('邀请码验证功能待实现')
                }
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              加入家庭
            </button>
          </div>
        </div>
      )}

      {/* 功能说明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">家庭模式说明</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 家庭管理员可以邀请新成员和移除现有成员</li>
          <li>• 家庭成员可以查看和记录所有宝宝的喂养信息</li>
          <li>• 支持双胎模式下的独立记录和统计</li>
          <li>• 实时同步所有家庭成员的操作</li>
        </ul>
      </div>
    </div>
  )
}