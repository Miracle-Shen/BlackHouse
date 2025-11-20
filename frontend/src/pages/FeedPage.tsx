import { FeedStream } from '../components/Feed'
import PostCardExample from '../components/PostCardExample'

const FeedPage = () => {
  // 可以通过环境变量或配置来切换显示模式
  const showExample = true // 设置为 true 显示示例数据，false 显示真实 API 数据

  return (
    <div className="bg-gray-50 min-h-screen">
      {showExample ? <PostCardExample /> : <FeedStream />}
    </div>
  )
}

export default FeedPage