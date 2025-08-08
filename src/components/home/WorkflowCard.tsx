import React, { useState } from 'react'
import { cn } from '../../utils/cn'
import { FeaturedItem } from '../../store/featuredStore'
import { getScaledImageUrl } from '../../utils'
import VideoIcon from '../../assets/web2/video.svg'
import UseIcon from '../../assets/web2/use.svg'
import UseCountIcon from '../../assets/web2/use_2.svg'
import LikeIcon from '../../assets/web2/like.svg'
import avatarSvg from '../../assets/Avatar.svg'

interface MobileStyle {
  width: string
  height: string
  coverHeight: string
}

interface CardDimensions {
  card: string
  cover: string
  container: string
  showDescription: boolean
  showUser: boolean
  mobileStyle?: MobileStyle
}

interface WorkflowCardProps {
  item: FeaturedItem
  onClick?: () => void
  onUseClick?: () => void
  variant?: 'workflow' | 'style' | 'recipes_workflow' | 'recipes_style' | 'profile_workflow' | 'profile_style'
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
  const getCardDimensions = (): CardDimensions => {
    if (variant === 'style') {
      // Trending Styles: PC和移动端都是 224x356
      return {
        card: 'w-56 h-[22.5rem]', // 224x356
        cover: 'w-56 h-[19.25rem]', // 224x308
        container: 'w-56',
        showDescription: false,
        showUser: true
      }
    } else if (variant === 'recipes_workflow') {
      // Recipes Workflows页面: 移动端动态计算，PC端固定269x306
      return {
        card: 'w-16.8125 h-[19.125rem]', // PC端: 269x306
        cover: 'w-16.8125 h-[13.75rem]', // PC端: 269x220
        container: 'w-16.8125',
        showDescription: true,
        showUser: true,
        mobileStyle: {
          // 移动端：宽度=(100vw-60px)/2，cover高度=宽度*(154/165)，文本区域2.875rem
          width: 'calc((100vw - 60px) / 2)',
          height: 'calc(((100vw - 60px) / 2) * (154/165) + 2.875rem)',
          coverHeight: 'calc(((100vw - 60px) / 2) * (154/165))' // cover宽高比 165:154
        }
      }
    } else if (variant === 'profile_workflow') {
      // Recipes Workflows页面: 移动端动态计算，PC端固定269x252
      return {
        card: 'w-16.8125 h-[15.625rem]', // PC端: 269x252
        cover: 'w-16.8125 h-[13.75rem]', // PC端: 269x220
        container: 'w-16.8125',
        showDescription: false,
        showUser: false,
        mobileStyle: {
          // 移动端：宽度=(100vw-60px)/2，cover高度=宽度*(154/165)，文本区域1.875rem
          width: 'calc((100vw - 60px) / 2)',
          height: 'calc(((100vw - 60px) / 2) * (154/165) + 1.875rem)',
          coverHeight: 'calc(((100vw - 60px) / 2) * (154/165))' // cover宽高比 165:154
        }
      }
    } else if (variant === 'recipes_style') {
      // Recipes Styles页面: 移动端动态计算，PC端固定269x418
      return {
        card: 'w-16.8125 h-[26.125rem]', // PC端: 269x418
        cover: 'w-16.8125 h-[23.125rem]', // PC端: 269x370
        container: 'w-16.8125',
        showDescription: false,
        showUser: true,
        mobileStyle: {
          // 移动端：宽度=(100vw-60px)/2，cover高度=宽度*(228/165)，文本区域2.875rem
          width: 'calc((100vw - 60px) / 2)',
          height: 'calc(((100vw - 60px) / 2) * (228/165) + 2.875rem)',
          coverHeight: 'calc(((100vw - 60px) / 2) * (228/165))' // cover宽高比 165:228
        }
      }
    } else if (variant === 'profile_style') {
      // Profile Styles页面: 移动端动态计算，PC端固定269x402
      return {
        card: 'w-16.8125 h-[25.125rem]', // PC端: 269x402
        cover: 'w-16.8125 h-[23.125rem]', // PC端: 269x370
        container: 'w-16.8125',
        showDescription: false,
        showUser: false,
        mobileStyle: {
          // 移动端：宽度=(100vw-60px)/2，cover高度=宽度*(228/165)，文本区域1.875rem
          width: 'calc((100vw - 60px) / 2)',
          height: 'calc(((100vw - 60px) / 2) * (228/165) + 1.875rem)',
          coverHeight: 'calc(((100vw - 60px) / 2) * (228/165))' // cover宽高比 165:228
        }
      }
    } else {
      // Popular Workflows: PC 288x306, 移动端 224x266
      return {
        card: 'w-56 md:w-72 h-[16.625rem] md:h-[19.125rem]', // 移动端: 224x266, PC端: 288x306
        cover: 'w-56 md:w-72 h-[13.75rem] md:h-[13.75rem]', // 移动端: 224x220, PC端: 288x220
        container: 'w-56 md:w-72',
        showDescription: true, // PC端显示，移动端通过CSS隐藏
        showUser: true
      }
    }
  }

  const dimensions = getCardDimensions()

  const getCoverWidthInPixels = () => {
    switch (variant) {
      case 'workflow':
        return 288 // From md:w-72
      case 'style':
        return 224 // From w-56
      case 'recipes_workflow':
      case 'profile_workflow':
      case 'recipes_style':
      case 'profile_style':
        return 269 // From w-16.8125
      default:
        return 288 // Default fallback
    }
  }

  // 获取用户头像 - 新的用户数据结构
  const getAvatarUrl = () => {
    // 新的API结构：item.user.avatar
    if (item.user?.avatar) {
      return item.user.avatar
    }
    return avatarSvg
  }

  // 获取用户显示名称 - 新的用户数据结构
  const getDisplayName = () => {
    // 新的API结构：item.user.name
    if (item.user?.name) {
      return item.user.name
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
        "rounded-xl cursor-pointer flex-shrink-0 group",
        // 根据variant决定是否有移动端样式覆盖
        !dimensions.mobileStyle && dimensions.card,
        dimensions.mobileStyle && "[width:var(--mobile-width)] [height:var(--mobile-height)] lg:w-16.8125",
        variant === 'recipes_workflow' && dimensions.mobileStyle && "lg:h-[19.125rem]",
        variant === 'profile_workflow' && dimensions.mobileStyle && "lg:h-[15.625rem]",
        variant === 'recipes_style' && dimensions.mobileStyle && "lg:h-[26.125rem]",
        variant === 'profile_style' && dimensions.mobileStyle && "lg:h-[25.125rem]"
      )}
      style={
        dimensions.mobileStyle ? {
          // 通过CSS变量设置，CSS类中通过媒体查询控制
          '--mobile-width': dimensions.mobileStyle.width,
          '--mobile-height': dimensions.mobileStyle.height,
          '--mobile-cover-height': dimensions.mobileStyle.coverHeight,
        } as React.CSSProperties : undefined
      }
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Cover 区域 */}
      <div 
        className={cn(
          "relative rounded-xl overflow-hidden bg-[#E8E8E8] dark:bg-gray-700",
          // 根据variant决定是否有移动端样式覆盖
          !dimensions.mobileStyle && dimensions.cover,
          dimensions.mobileStyle && "[width:var(--mobile-width)] [height:var(--mobile-cover-height)] lg:w-16.8125",
          variant === 'recipes_workflow' && dimensions.mobileStyle && "lg:h-[13.75rem]",
          variant === 'profile_workflow' && dimensions.mobileStyle && "lg:h-[13.75rem]",
          variant === 'recipes_style' && dimensions.mobileStyle && "lg:h-[23.125rem]",
          variant === 'profile_style' && dimensions.mobileStyle && "lg:h-[23.125rem]"
        )}
      >
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
              src={getScaledImageUrl(item.cover, getCoverWidthInPixels())}
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
              <span className="font-lexend text-xs text-design-bg-light-gray">
                {item.like_count || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Container 区域 - 修复布局 */}
      <div 
        className={cn(
          "pt-3 flex flex-col gap-0.5", // padding-top: 12px, gap: 4px
          // 根据variant决定是否有移动端样式覆盖
          !dimensions.mobileStyle && dimensions.container,
          dimensions.mobileStyle && `[width:var(--mobile-width)] [height:var(--mobile-text-height)] lg:h-auto lg:w-16.8125`
        )}
        style={
          dimensions.mobileStyle ? {
            '--mobile-text-height': `calc(${dimensions.mobileStyle.height} - ${dimensions.mobileStyle.coverHeight})`
          } as React.CSSProperties : undefined
        }
      >
        {/* Name */}
        <h3 className="font-lexend font-semibold text-sm md:text-base leading-snug text-design-main-text dark:text-design-dark-main-text truncate">
          {item.name}
        </h3>

        {/* Description - 根据variant和屏幕尺寸决定是否显示，并处理可选性 */}
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
        {dimensions.showUser && (
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
        )}
      </div>
    </div>
  )
}

export default WorkflowCard