import React, { useState } from 'react'
import { cn } from '../../utils/cn'
import { ContentItem, likeContentAtom } from '../../store/contentsStore'
import { useAtom } from 'jotai'
import { userStateAtom } from '../../store/loginStore'
import { getScaledImageUrl } from '../../utils'
import VideoIcon from '../../assets/web2/video.svg'
import RecreateIcon from '../../assets/web2/use.svg'
import LikeIcon from '../../assets/web2/like.svg'
import LikedIcon from '../../assets/web2/liked.svg'
import avatarSvg from '../../assets/Avatar.svg'

interface InspirationImageCardProps {
  content: ContentItem & { calculatedHeight?: number }
  imageHeightRem?: number
  imageWidthRem?: number
  onClick?: () => void
  onRecreateClick?: () => void
}

const InspirationImageCard: React.FC<InspirationImageCardProps> = ({
  content,
  imageHeightRem,
  imageWidthRem,
  onClick,
  onRecreateClick
}) => {
  const [imageError, setImageError] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isLiking, setIsLiking] = useState(false)
  const [localContent, setLocalContent] = useState(content)
  const [, likeContent] = useAtom(likeContentAtom)
  const [userState] = useAtom(userStateAtom)

  // 判断是否为视频
  const isVideo = content.type === 'video'

  // 如果没有传入高度，则计算高度
  const getImageHeight = () => {
    if (imageHeightRem) return imageHeightRem
    if (content.calculatedHeight) return content.calculatedHeight
    
    const cardWidthRem = 17.1875 // 275px in rem
    if (content.width && content.height) {
      return (cardWidthRem * content.height) / content.width
    }
    return 12.5 // 默认200px in rem
  }

  const heightRem = getImageHeight()

  // 获取用户头像
  const getAvatarUrl = () => {
    if (content.user?.avatar) {
      return content.user.avatar
    }
    return avatarSvg
  }

  // 获取用户显示名称
  const getDisplayName = () => {
    if (content.user?.name) {
      return content.user.name
    }
    return "Anonymous"
  }

  // 处理点赞
  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (isLiking || !userState.isAuthenticated) return

    setIsLiking(true)
    try {
      const newIsLiked = !localContent.is_liked
      await likeContent(localContent.content_id, newIsLiked)
      
      setLocalContent(prev => ({
        ...prev,
        is_liked: newIsLiked,
        like_count: newIsLiked 
          ? (prev.like_count || 0) + 1 
          : Math.max((prev.like_count || 0) - 1, 0)
      }))
    } catch (error) {
      console.error('Failed to toggle like:', error)
    } finally {
      setIsLiking(false)
    }
  }

  // 处理Recreate按钮点击
  const handleRecreateClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onRecreateClick?.()
  }

  const widthPx = (imageWidthRem ? imageWidthRem : 17.1875) * 16

  return (
    <div 
      className="w-full md:w-[17.1875rem] cursor-pointer" // 移动端全宽，PC端275px
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Cover 区域 */}
      <div 
        className="relative w-full rounded-xl overflow-hidden bg-[#E8E8E8] dark:bg-gray-700"
        style={{ height: `${heightRem}rem` }}
      >
        {localContent.url && !imageError ? (
          isVideo ? (
            <video
              src={localContent.url}
              className="w-full h-full object-cover"
              muted
              playsInline
              preload="metadata"
            />
          ) : (
            <img
              src={getScaledImageUrl(localContent.url, widthPx)}
              alt={`Content ${localContent.content_id}`}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-400">
              {localContent.state === 0 ? 'Generating...' : localContent.state === 2 ? 'Failed' : 'No preview'}
            </span>
          </div>
        )}

        {/* Video 标签 */}
        {isVideo && localContent.url && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-[0.625rem] py-1.5 bg-black/60 rounded-full">
            <img src={VideoIcon} alt="Video" className="w-4 h-4" />
            <span className="font-lexend text-xs text-white">0:05</span>
          </div>
        )}

        {/* Hover 遮罩 */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-b from-transparent to-black/40 transition-opacity duration-200",
          isHovered ? "opacity-100" : "opacity-0"
        )} />

        {/* Hover 信息 */}
        <div className={cn(
          "absolute bottom-4 left-0 right-0 px-[0.875rem] flex items-center justify-between transition-opacity duration-200 z-10",
          isHovered ? "opacity-100" : "opacity-0"
        )}>
          {/* Recreate 按钮 */}
          <button
            onClick={handleRecreateClick}
            className="flex items-center gap-1 h-[1.875rem] px-3 bg-white rounded-md hover:bg-gray-50 transition-colors"
          >
            <img src={RecreateIcon} alt="Recreate" className="w-4 h-4" />
            <span className="font-lexend text-sm text-design-main-text">Recreate</span>
          </button>

          {/* 点赞数 */}
          <button
            onClick={handleLikeClick}
            disabled={isLiking || !userState.isAuthenticated}
            className="flex items-center gap-1 transition-opacity"
            style={{ opacity: isLiking ? 0.6 : 1 }}
          >
            <img 
              src={localContent.is_liked ? LikedIcon : LikeIcon} 
              alt="Like" 
              className="w-4 h-4" 
            />
            <span className="font-lexend text-xs text-design-bg-light-gray">
              {localContent.like_count || 0}
            </span>
          </button>
        </div>
      </div>

      {/* Users 区域 - 修复字符裁切问题 */}
      <div className="mt-[0.625rem] flex items-center gap-1.5 h-4"> {/* 固定高度确保显示完整 */}
        <img
          src={getAvatarUrl()}
          alt={getDisplayName()}
          className="w-4 h-4 rounded-full flex-shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).src = avatarSvg
          }}
        />
        <span className="font-lexend text-xs leading-4 text-design-dark-gray dark:text-design-dark-dark-gray truncate">
          {getDisplayName()}
        </span>
      </div>
    </div>
  )
}

export default InspirationImageCard 