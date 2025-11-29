// 服务工作者：喂养提醒后台同步
const CACHE_NAME = 'feeding-diary-v1'
const urlsToCache = [
  '/',
  '/index.html',
  '/icon-192x192.png',
  '/icon-512x512.png'
]

// 安装事件
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  )
})

// 激活事件
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// 后台同步事件
self.addEventListener('sync', event => {
  if (event.tag === 'feeding-reminders') {
    event.waitUntil(checkFeedingReminders())
  }
})

// 推送事件
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {}
  
  const options = {
    body: data.body || '是时候给宝宝喂奶了！',
    icon: data.icon || '/icon-192x192.png',
    badge: data.badge || '/icon-72x72.png',
    vibrate: data.vibrate || [200, 100, 200, 100, 200],
    tag: data.tag || 'feeding-reminder',
    requireInteraction: true,
    actions: [
      {
        action: 'feed',
        title: '立即记录',
        icon: '/icon-48x48.png'
      },
      {
        action: 'snooze',
        title: '稍后提醒',
        icon: '/icon-48x48.png'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification(data.title || '喂养提醒', options)
  )
})

// 通知点击事件
self.addEventListener('notificationclick', event => {
  event.notification.close()

  if (event.action === 'feed') {
    // 打开应用并导航到添加记录页面
    event.waitUntil(
      clients.openWindow('/record/add')
    )
  } else if (event.action === 'snooze') {
    // 稍后提醒 - 可以设置延迟提醒
    event.waitUntil(
      self.registration.showNotification('喂养提醒已推迟', {
        body: '将在15分钟后再次提醒',
        icon: '/icon-192x192.png',
        badge: '/icon-72x72.png',
        tag: 'snooze-notification'
      })
    )
  } else {
    // 点击通知主体
    event.waitUntil(
      clients.openWindow('/home')
    )
  }
})

// 检查喂养提醒
async function checkFeedingReminders() {
  try {
    // 这里可以添加实际的提醒检查逻辑
    // 由于服务工作者无法直接访问 Supabase，需要通过 fetch API
    console.log('执行喂养提醒检查...')
    
    // 可以在这里添加与后端的通信逻辑
    // 比如发送请求到 API 端点来获取需要提醒的数据
    
  } catch (error) {
    console.error('提醒检查失败:', error)
  }
}

// 定期提醒（每小时检查一次）
self.addEventListener('periodicsync', event => {
  if (event.tag === 'hourly-feeding-check') {
    event.waitUntil(checkFeedingReminders())
  }
})