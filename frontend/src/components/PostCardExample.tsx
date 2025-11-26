import PostCard from './PostCard'
import type { PostData } from './PostCard'

// 示例数据
const samplePosts: PostData[] = [
  {
    id: '1',
    author: {
      name: '张三',
      avatar: 'https://via.placeholder.com/40x40',
      username: 'zhangsan'
    },
    content: '今天天气真好，和朋友们一起去公园野餐！🌞\n\n生活就是要这样充满阳光和快乐 ✨',
    images: [
      'https://via.placeholder.com/300x200',
      'https://via.placeholder.com/300x200',
      'https://via.placeholder.com/300x200'
    ],
    timestamp: '2小时前',
    likes: 24,
    comments: 5,
    isLiked: false
  },
  {
    id: '2',
    author: {
      name: '李四',
      avatar: 'https://via.placeholder.com/40x40',
      username: 'lisi'
    },
    content: '刚刚完成了一个新项目，感觉特别有成就感！💪\n\n付出总会有回报的。',
    timestamp: '1天前',
    likes: 56,
    comments: 12,
    isLiked: true
  },
  {
    id: '3',
    author: {
      name: '王五',
      avatar: 'https://via.placeholder.com/40x40',
    },
    content: '分享一张夕阳照片 🌅',
    images: ['https://via.placeholder.com/400x300'],
    timestamp: '3天前',
    likes: 89,
    comments: 23,
    isLiked: false
  }
]

const PostCardExample = () => {
  const handleLike = (postId: string) => {
    console.log('Liked post:', postId)
    // 这里可以调用 API 更新点赞状态
  }

  const handleComment = (postId: string) => {
    console.log('Comment on post:', postId)
    // 导航到评论页面或打开评论弹窗
  }

  const handleShare = (postId: string) => {
    console.log('Share post:', postId)
    // 调用分享功能
  }

  const handleMore = (postId: string) => {
    console.log('More actions for post:', postId)
    // 显示更多操作菜单（举报、收藏等）
  }

  return (
    <div className="max-w-md mx-auto p-4 bg-gray-50 min-h-screen">
      <h1 className="text-lg font-semibold mb-4 text-center">动态列表</h1>
      
      {samplePosts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onLike={handleLike}
          onComment={handleComment}
          onShare={handleShare}
          onMore={handleMore}
        />
      ))}
    </div>
  )
}

export default PostCardExample