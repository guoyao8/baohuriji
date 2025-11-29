import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function BackendSettings() {
  const navigate = useNavigate()
  const [url, setUrl] = useState('')
  const [anon, setAnon] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const u = localStorage.getItem('supabase_url') || ''
    const k = localStorage.getItem('supabase_anon_key') || ''
    setUrl(u)
    setAnon(k)
  }, [])

  const handleSave = () => {
    localStorage.setItem('supabase_url', url.trim())
    localStorage.setItem('supabase_anon_key', anon.trim())
    setSaved(true)
  }

  const handleClear = () => {
    localStorage.removeItem('supabase_url')
    localStorage.removeItem('supabase_anon_key')
    setUrl('')
    setAnon('')
    setSaved(false)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">后端配置</h2>
        <p className="text-sm text-gray-600">设置 Supabase URL 与 Anon Key 以启用真实后端。</p>

        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">Supabase URL</label>
          <input
            id="url"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://your-project-id.supabase.co"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="anon" className="block text-sm font-medium text-gray-700 mb-1">Anon Key</label>
          <input
            id="anon"
            type="text"
            value={anon}
            onChange={(e) => setAnon(e.target.value)}
            placeholder="supabase anon key"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            保存
          </button>
          <button
            onClick={handleClear}
            className="bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200"
          >
            清除
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="ml-auto text-blue-600 hover:text-blue-500"
          >
            返回设置
          </button>
        </div>

        {saved && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-md text-sm">
            已保存配置。请刷新页面以切换到真实后端。
          </div>
        )}
      </div>
    </div>
  )
}

