import { useState } from 'react'

// Simple SVG icons as components
const HeartIcon = ({ size = 16, filled = false }: { size?: number; filled?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
)

const CommentIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)

const ShareIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
    <polyline points="16,6 12,2 8,6"/>
    <line x1="12" y1="2" x2="12" y2="15"/>
  </svg>
)

const MoreIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="1"/>
    <circle cx="19" cy="12" r="1"/>
    <circle cx="5" cy="12" r="1"/>
  </svg>
)

export interface PostData {
  id: string
  author: {
    name: string
    avatar: string
    username?: string
  }
  content: string
  images?: string[]
  timestamp: string
  likes: number
  comments: number
  isLiked?: boolean
}

interface PostCardProps {
  post: PostData
  onLike?: (postId: string) => void
  onComment?: (postId: string) => void
  onShare?: (postId: string) => void
  onMore?: (postId: string) => void
  className?: string
}

const PostCard = ({ 
  post, 
  onLike, 
  onComment, 
  onShare, 
  onMore, 
  className = '' 
}: PostCardProps) => {
  const [isLiked, setIsLiked] = useState(post.isLiked || false)
  const [likeCount, setLikeCount] = useState(post.likes)

  const handleLike = () => {
    const newLikedState = !isLiked
    setIsLiked(newLikedState)
    setLikeCount(prev => newLikedState ? prev + 1 : prev - 1)
    onLike?.(post.id)
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <img 
            src={post.author.avatar} 
            alt={post.author.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h4 className="font-medium text-gray-900 text-sm">{post.author.name}</h4>
            {post.author.username && (
              <p className="text-xs text-gray-500">@{post.author.username}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{post.timestamp}</span>
          {onMore && (
            <button 
              onClick={() => onMore(post.id)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <MoreIcon size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mb-3">
        <p className="text-gray-900 text-sm leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
      </div>

      {/* Images */}
      {post.images && post.images.length > 0 && (
        <div className="mb-4">
          {post.images.length === 1 ? (
            <img 
              src={post.images[0]} 
              alt="Post image"
              className="w-full rounded-lg object-cover max-h-80"
            />
          ) : (
            <div className={`grid gap-2 rounded-lg overflow-hidden ${
              post.images.length === 2 ? 'grid-cols-2' : 
              post.images.length === 3 ? 'grid-cols-3' : 
              'grid-cols-2'
            }`}>
              {post.images.slice(0, 4).map((image, index) => (
                <div key={index} className="relative">
                  <img 
                    src={image} 
                    alt={`Post image ${index + 1}`}
                    className="w-full h-32 object-cover"
                  />
                  {index === 3 && post.images!.length > 4 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-medium">
                        +{post.images!.length - 4}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleLike}
            className="flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded-full transition-colors group"
          >
            <HeartIcon 
              size={16} 
              filled={isLiked}
            />
            <span className={`text-xs ${
              isLiked ? 'text-red-500' : 'text-gray-500'
            }`}>
              {likeCount}
            </span>
          </button>

          {onComment && (
            <button 
              onClick={() => onComment(post.id)}
              className="flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded-full transition-colors group"
            >
              <CommentIcon size={16} />
              <span className="text-xs text-gray-500">{post.comments}</span>
            </button>
          )}

          {onShare && (
            <button 
              onClick={() => onShare(post.id)}
              className="flex items-center gap-1 hover:bg-green-50 px-2 py-1 rounded-full transition-colors group"
            >
              <ShareIcon size={16} />
              <span className="text-xs text-gray-500">分享</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default PostCard