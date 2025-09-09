import React, { useState } from 'react'
import { cn } from '../../utils'
import { ContentItem, likeContentAtom } from '../../store/contentsStore'
import { useAtom, useSetAtom } from 'jotai'
import { userStateAtom } from '../../store/loginStore'
import { openContentDetailAtom } from '../../store/contentDetailStore'
import { getScaledImageUrl } from '../../utils'
import LikeIcon from '../../assets/web2/like.svg'
import LikedIcon from '../../assets/web2/liked.svg'
import avatarSvg from '../../assets/mavae/avatar.svg'
import PictureIcon from '../../assets/mavae/Picture_white.svg'
import VideoIconNew from '../../assets/mavae/video_white.svg'
import MaskImage from '../../assets/mavae/Mask.svg'

interface InspirationImageCardProps {
  content: ContentItem & { calculatedHeight?: number }
  imageHeightRem?: number
  imageWidthRem?: number
  onClick?: () => void
}

const InspirationImageCard: React.FC<InspirationImageCardProps> = ({
  content,
  imageHeightRem,
  imageWidthRem,
  onClick
}) => {
  const [imageError, setImageError] = useState(false)
  const [, setIsHovered] = useState(false)
  const [isLiking, setIsLiking] = useState(false)
  const [localContent, setLocalContent] = useState(content)
  const [, likeContent] = useAtom(likeContentAtom)
  const [userState] = useAtom(userStateAtom)
  const openContentDetail = useSetAtom(openContentDetailAtom)

  // 判断是否为视频
  const isVideo = content.type === 'video'

  // 如果没有传入高度，则计算高度
  const getImageHeight = () => {
    if (imageHeightRem) return imageHeightRem
    if (content.calculatedHeight) return content.calculatedHeight

    // 根据屏幕宽度动态计算卡片宽度
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
    const cardWidthRem = isMobile ? ((window.innerWidth - 48) / 16) : 18.375 // 移动端适配宽度，PC端294px
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

  // 根据屏幕宽度动态计算图片宽度
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const cardWidthRem = isMobile ? ((window.innerWidth - 48) / 16) : 18.375
  const widthPx = (imageWidthRem ? imageWidthRem : cardWidthRem) * 16

  // 处理卡片点击
  const handleCardClick = () => {
    if (onClick) {
      onClick()
    } else {
      // 默认行为：打开内容详情弹窗（state 为 0 时才强制刷新）
      openContentDetail({ id: content.content_id, state: content.state })
    }
  }

  return (
    <div
      className="w-full md:w-[18.375rem] cursor-pointer rounded-xl bg-secondary dark:bg-secondary-dark pb-2 gap-2 hover:shadow-[0px_8px_16px_0px_rgba(18,18,26,0.1)] transition-shadow" // 移动端全宽，PC端294px，padding-bottom: 8px, gap: 8px, border-radius: 12px, background: #FFFFFF, hover效果
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Cover 区域 */}
      <div
        className="relative w-full rounded-t-xl overflow-hidden bg-[#E8E8E8] dark:bg-gray-700" // 改为rounded-t-xl，只保留顶部圆角
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

        {/* Mask阴影区域 */}
        <img
          src={MaskImage}
          alt="Mask"
          className="absolute bottom-0 left-0 right-0 w-full h-[3.25rem] object-cover opacity-80"
        />

        {/* 类型标签 - 左下角 */}
        <div className="absolute bottom-2 left-2 flex items-center p-0.5 bg-black/20 rounded">
          {isVideo ? (
            <>
              <img src={VideoIconNew} alt="Video" className="w-4 h-4 min-w-4 min-h-4" />
            </>
          ) : (
            <>
              <img src={PictureIcon} alt="Picture" className="w-4 h-4 min-w-4 min-h-4" />
            </>
          )}
        </div>

        {/* 点赞数 - 右下角 */}
        <div className="absolute bottom-2 right-2 flex items-center gap-0.5 h-5">
          <button
            onClick={handleLikeClick}
            disabled={isLiking || !userState.isAuthenticated}
            className="flex items-center gap-0.5 h-5 transition-opacity"
            style={{ opacity: isLiking ? 0.6 : 1 }}
          >
            <img
              src={localContent.is_liked ? LikedIcon : LikeIcon}
              alt="Like"
              className="w-3 h-3"
            />
            <span className={cn(
              "pb-px font-switzer font-medium text-xs leading-4 text-center",
              localContent.is_liked ? "text-[#F6465D]" : "text-white"
            )}>
              {localContent.like_count || 0}
            </span>
          </button>
        </div>
      </div>

      {/* Users 区域 */}
      <div className="h-4 mt-2 px-2 flex items-center gap-1"> {/* height: 16px, padding: 8px, gap: 4px */}
        <img
          src={getAvatarUrl()}
          alt={getDisplayName()}
          className="w-4 h-4 rounded-full flex-shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).src = avatarSvg
          }}
        />
        <span className="font-switzer font-normal text-xs leading-4 text-text-secondary dark:text-text-secondary-dark truncate">
          {getDisplayName()}
        </span>
      </div>
    </div>
  )
}

export default InspirationImageCard