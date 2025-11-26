import PostCard from './PostCard'
import type { PostData } from './PostCard'

interface PostCardVariantsProps {
  posts: PostData[]
  variant?: 'feed' | 'compact' | 'grid'
  onLike?: (postId: string) => void
  onComment?: (postId: string) => void
  onShare?: (postId: string) => void
  onMore?: (postId: string) => void
}

const PostCardVariants = ({ 
  posts, 
  variant = 'feed',
  onLike,
  onComment,
  onShare,
  onMore
}: PostCardVariantsProps) => {
  const getContainerClass = () => {
    switch (variant) {
      case 'compact':
        return 'max-w-sm mx-auto'
      case 'grid':
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
      case 'feed':
      default:
        return 'max-w-lg mx-auto'
    }
  }

  const getCardClass = () => {
    switch (variant) {
      case 'compact':
        return 'mb-2'
      case 'grid':
        return ''
      case 'feed':
      default:
        return 'mb-4'
    }
  }

  return (
    <div className={getContainerClass()}>
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onLike={onLike}
          onComment={onComment}
          onShare={onShare}
          onMore={onMore}
          className={getCardClass()}
        />
      ))}
    </div>
  )
}

export default PostCardVariants