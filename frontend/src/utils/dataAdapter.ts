import type { PostData } from '../components/PostCard'

// 后端数据结构（根据实际 API 返回调整）
interface ApiPostData {
  _id: string
  user: {
    name: string
    avatar?: string
    username?: string
  }
  content: string
  images?: string[]
  createdAt: string
  likes: number
  comments: number
  isLiked?: boolean
}

// 数据适配器 - 将后端数据转换为前端组件需要的格式
export const adaptPostData = (apiData: ApiPostData[]): PostData[] => {
  return apiData.map((item) => ({
    id: item._id,
    author: {
      name: item.user.name,
      avatar: item.user.avatar || 'https://via.placeholder.com/40x40',
      username: item.user.username
    },
    content: item.content,
    images: item.images || [],
    timestamp: formatTimestamp(item.createdAt),
    likes: item.likes || 0,
    comments: item.comments || 0,
    isLiked: item.isLiked || false
  }))
}

// 时间格式化工具
const formatTimestamp = (timestamp: string): string => {
  const now = new Date()
  const postTime = new Date(timestamp)
  const diffMs = now.getTime() - postTime.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) {
    return '刚刚'
  } else if (diffMins < 60) {
    return `${diffMins}分钟前`
  } else if (diffHours < 24) {
    return `${diffHours}小时前`
  } else if (diffDays < 7) {
    return `${diffDays}天前`
  } else {
    return postTime.toLocaleDateString('zh-CN', {
      month: 'numeric',
      day: 'numeric'
    })
  }
}

export default adaptPostData