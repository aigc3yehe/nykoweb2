import React, { useState } from 'react'
import { cn } from '../../utils/cn'
import { FeaturedItem } from '../../store/featureStore'
import VideoIcon from '../../assets/web2/video.svg'
import UseIcon from '../../assets/web2/use.svg'
import UseCountIcon from '../../assets/web2/use_2.svg'
import LikeIcon from '../../assets/web2/like.svg'
import avatarSvg from '../../assets/Avatar.svg'

interface WorkflowCardProps {
  item: FeaturedItem
  onClick?: () => void
  onUseClick?: () => void
  variant?: 'workflow' | 'style'
}

const WorkflowCard: React.FC<WorkflowCardProps> = ({ 
  item, 
  onClick, 
  onUseClick,
  variant = 'workflow'
}) => {
  const [imageError, setImageError] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // 判断是否为视频
  const isVideo = item.cover?.includes('.mp4') || item.cover?.includes('.webm')

  // 根据variant和屏幕尺寸确定尺寸
  const getCardDimensions = () => {
    if (variant === 'style') {
      // Trending Styles: PC和移动端都是 224x356
      return {
        card: 'w-56 h-[22.5rem]', // 224x356
        cover: 'w-56 h-[19.25rem]', // 224x308
        container: 'w-56',
        showDescription: false
      }
    } else {
      // Popular Workflows: PC 288x306, 移动端 224x266
      return {
        card: 'w-56 md:w-72 h-[16.625rem] md:h-[19.125rem]', // 移动端: 224x266, PC端: 288x306
        cover: 'w-56 md:w-72 h-[13.75rem] md:h-[13.75rem]', // 移动端: 224x220, PC端: 288x220
        container: 'w-56 md:w-72',
        showDescription: true // PC端显示，移动端通过CSS隐藏
      }
    }
  }

  const dimensions = getCardDimensions()

  // 获取用户头像
  const getAvatarUrl = () => {
    if (item.users?.twitter?.profilePictureUrl) {
      return item.users.twitter.profilePictureUrl
    } else if (item.users?.twitter?.username) {
      return `https://unavatar.io/twitter/${item.users.twitter.username}`
    }
    return avatarSvg
  }

  // 获取用户显示名称
  const getDisplayName = () => {
    if (item.users?.twitter?.name) {
      return item.users.twitter.name
    } else if (item.users?.twitter?.username) {
      return item.users.twitter.username
    }
    return "Anonymous"
  }

  // 处理Use按钮点击
  const handleUseClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onUseClick?.()
  }

  return (
    <div 
      className={cn(
        "rounded-xl overflow-hidden cursor-pointer flex-shrink-0 group",
        dimensions.card
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Cover 区域 */}
      <div className={cn(
        "relative rounded-xl overflow-hidden bg-[#E8E8E8] dark:bg-gray-700",
        dimensions.cover
      )}>
        {item.cover && !imageError ? (
          isVideo ? (
            <video
              src={item.cover}
              className="w-full h-full object-cover"
              muted
              playsInline
              preload="metadata"
            />
          ) : (
            <img
              src={item.cover}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-400">No preview</span>
          </div>
        )}

        {/* Video 标签 */}
        {isVideo && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-[0.625rem] py-1.5 bg-black/60 rounded-full">
            <img src={VideoIcon} alt="Video" className="w-4 h-4" />
            <span className="font-lexend text-xs text-white">Video</span>
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
          {/* Use 按钮 */}
          <button
            onClick={handleUseClick}
            className="flex items-center gap-1 h-[1.875rem] px-3 bg-white rounded-md hover:bg-gray-50 transition-colors"
          >
            <img src={UseIcon} alt="Use" className="w-4 h-4" />
            <span className="font-lexend text-sm text-design-main-text">Use</span>
          </button>

          {/* 使用次数和点赞数 */}
          <div className="flex items-center gap-[0.875rem]"> {/* gap: 14px */}
            {/* 使用次数 */}
            <div className="flex items-center gap-1">
              <img src={UseCountIcon} alt="Uses" className="w-4 h-4" />
              <span className="font-lexend text-xs text-design-bg-light-gray">
                {item.usage || 0}
              </span>
            </div>

            {/* 点赞数 */}
            <div className="flex items-center gap-1">
              <img src={LikeIcon} alt="Likes" className="w-4 h-4" />
              <span className="font-lexend text-xs text-design-bg-light-gray">0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Container 区域 - 修复布局 */}
      <div className={cn(
        "pt-3 flex flex-col gap-0.5", // padding-top: 12px, gap: 4px
        dimensions.container
      )}>
        {/* Name */}
        <h3 className="font-lexend font-semibold text-base leading-tight text-design-main-text dark:text-design-dark-main-text truncate">
          {item.name}
        </h3>

        {/* Description - 根据variant和屏幕尺寸决定是否显示 */}
        {dimensions.showDescription && item.description && (
          <p 
            className="font-lexend text-xs leading-[140%] text-design-medium-gray dark:text-design-dark-medium-gray overflow-hidden hidden md:block"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: '1.4',
              maxHeight: 'calc(2 * 1.4 * 0.75rem)', // 2行 * line-height * font-size
            }}
          >
            {item.description}
          </p>
        )}

        {/* User 信息 - 修复字符裁切问题 */}
        <div className="flex items-center gap-1.5 h-4"> {/* 固定高度确保显示完整 */}
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
    </div>
  )
}

export default WorkflowCard