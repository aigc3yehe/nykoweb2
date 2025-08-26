import React, { useState } from 'react'
import { cn } from '../../utils/cn'
import { FeaturedItem } from '../../store/featuredStore'
import { getScaledImageUrl } from '../../utils'
import VideoIcon from '../../assets/web2/video.svg'
import UseIcon from '../../assets/web2/use.svg'
import UseCountIcon from '../../assets/web2/use_2.svg'
import LikeIcon from '../../assets/web2/like.svg'
import avatarSvg from '../../assets/Avatar.svg'
import PictureIcon from '../../assets/mavae/Picture_white.svg'
import VideoIconNew from '../../assets/mavae/video_white.svg'
import UseIconNew from '../../assets/mavae/use_white.svg'
import BookmarkNormalIcon from '../../assets/mavae/Bookmark_normal.svg'
import BookmarkYellowIcon from '../../assets/mavae/Bookmark_yellow.svg'
import BookmarkNormalIconDark from '../../assets/mavae/dark/Bookmark_normal.svg'
import BookmarkYellowIconDark from '../../assets/mavae/dark/Bookmark_yellow.svg'

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
       // Trending Styles: PC端和workflow一样显示描述，移动端高度416px且不显示描述
       return {
         card: 'w-[15rem] md:w-[14.375rem] h-[26rem] md:h-[27.3125rem] min-w-[15rem] md:min-w-[14.375rem] max-w-[15rem] pb-2 gap-2', // 移动端: 240x416px, PC端: 230x437px
         cover: 'w-[15rem] md:w-[14.375rem] h-[22.5rem] md:h-[21.5625rem]', // 移动端: 240x360px, PC端: 230x345px
         container: 'w-[15rem] md:w-[14.375rem]',
         showDescription: true, // PC端显示描述
         showUser: true
       }
         } else if (variant === 'recipes_workflow' || variant === 'recipes_style') {
       // Recipes Workflows/Styles页面: 统一样式，与workflow相似
       return {
         card: 'w-[14.9rem] h-[28.1rem] min-w-[14.9rem] max-w-[14.9rem] pb-2 gap-2', // width: 238.4px, height: 449.6px, gap: 8px
         cover: 'w-[14.9rem] h-[22.35rem]', // width: 238.4px, height: 357.6px
         container: 'w-[14.9rem]',
         showDescription: true,
         showUser: true
       }
     } else if (variant === 'profile_workflow') {
       // Profile Workflows页面: 移动端动态计算，PC端固定269x252
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
       // Popular Workflows: 新的设计 - PC端: width: 230px, height: 437px; 移动端: width: 240px, height: 452px
       return {
         card: 'w-[15rem] md:w-[14.375rem] h-[28.25rem] md:h-[27.3125rem] min-w-[15rem] md:min-w-[14.375rem] max-w-[15rem] pb-2 gap-2', // 移动端: 240x452px, PC端: 230x437px
         cover: 'w-[15rem] md:w-[14.375rem] h-[22.5rem] md:h-[21.5625rem]', // 移动端: 240x360px, PC端: 230x345px
         container: 'w-[15rem] md:w-[14.375rem]',
         showDescription: true,
         showUser: true
       }
    }
  }

  const dimensions = getCardDimensions()

     const getCoverWidthInPixels = () => {
     switch (variant) {
       case 'workflow':
       case 'style':
         // 根据屏幕尺寸返回不同宽度
         if (typeof window !== 'undefined' && window.innerWidth < 768) {
           return 240 // 移动端: 240px
         }
         return 230 // PC端: 230px
       case 'recipes_workflow':
       case 'recipes_style':
         return 238 // From w-[14.9rem] (238.4px)
       case 'profile_workflow':
       case 'profile_style':
         return 269 // From w-16.8125
       default:
         return 230 // Default fallback
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
        "rounded-xl cursor-pointer flex-shrink-0 group flex flex-col bg-secondary dark:bg-secondary-dark hover:shadow-[0px_8px_16px_0px_rgba(18,18,26,0.1)] transition-shadow", // 移除默认阴影，只保留hover阴影
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
           "relative rounded-t-xl overflow-hidden bg-[#E8E8E8] dark:bg-gray-700", // 改为rounded-t-xl，只保留顶部圆角
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

                 {/* Mask阴影区域 */}
         <div className="absolute bottom-0 left-0 right-0 h-[3.25rem] bg-gradient-to-t from-black/72 to-transparent"></div>

         {/* 类型标签 - 左下角 */}
         <div className="absolute bottom-2 left-2 flex items-center p-0.5 bg-black/20 rounded">
           {isVideo ? (
             <>
               <img src={VideoIconNew} alt="Video" className="w-4 h-4 min-w-4 min-h-4 " />
             </>
           ) : (
             <>
               <img src={PictureIcon} alt="Picture" className="w-4 h-4 min-w-4 min-h-4 " />
             </>
           )}
         </div>

         {/* 使用量和收藏数 - 右下角 */}
         <div className="absolute bottom-2 right-2 flex items-center gap-2">
           {/* 使用量 */}
           <div className="flex items-center gap-0.5 h-5">
             <img src={UseIconNew} alt="Uses" className="w-3 h-3 " />
             <span className="pb-px font-switzer font-medium text-xs leading-4 text-white text-center">
               {item.usage || 0}
             </span>
           </div>

           {/* 收藏数 */}
           <div className="flex items-center gap-0.5 h-5">
             {/* 这里需要根据用户是否收藏来显示不同图标，暂时使用默认图标 */}
             <img src={BookmarkNormalIcon} alt="Bookmark" className="w-3 h-3 " />
             <span className="pb-px font-switzer font-medium text-xs leading-4 text-white text-center">
               {item.like_count || 0}
             </span>
           </div>
         </div>
      </div>

      {/* Container 区域 - 修复布局 */}
      <div 
        className={cn(
          "flex flex-col flex-1", // 添加flex-1确保占满剩余空间
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
                 {/* 作品信息 - 根据variant显示不同样式 */}
         {variant === 'workflow' || variant === 'style' || variant === 'recipes_workflow' || variant === 'recipes_style' ? (
           <div className="px-2 flex flex-col gap-1 flex-1">
             {/* 第一行 - 标题 */}
             <h3 className="font-switzer font-bold text-sm leading-5 text-text-main dark:text-text-main-dark truncate">
               {item.name}
             </h3>

             {/* 第二行 - 描述 - workflow和recipes显示，style只在PC端显示 */}
             {item.description && (variant === 'workflow' || variant === 'recipes_workflow' || variant === 'recipes_style' || (variant === 'style' && typeof window !== 'undefined' && window.innerWidth >= 768)) && (
               <p 
                 className="font-switzer font-normal text-xs leading-4 text-text-secondary dark:text-text-secondary-dark overflow-hidden flex-1"
                 style={{
                   display: '-webkit-box',
                   WebkitLineClamp: 2,
                   WebkitBoxOrient: 'vertical',
                   lineHeight: '1rem',
                   maxHeight: '2rem', // 2行 * line-height
                 }}
               >
                 {item.description}
               </p>
             )}
           </div>
         ) : (
          <>
            {/* Name */}
            <h3 className="font-lexend font-semibold text-sm md:text-base leading-snug text-design-main-text dark:text-design-dark-main-text truncate">
              {item.name}
            </h3>

            {/* Description - 根据variant和屏幕尺寸决定是否显示，并处理可选性 */}
            {dimensions.showDescription && item.description && (
              <p 
                className="font-lexend text-xs leading-[140%] text-design-medium-gray dark:text-design-dark-medium-gray overflow-hidden hidden md:block flex-1"
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
          </>
        )}

                 {/* User 信息 - 根据variant显示不同样式 */}
         {dimensions.showUser && (
           variant === 'workflow' || variant === 'style' || variant === 'recipes_workflow' || variant === 'recipes_style' ? (
             <div className={cn(
               "h-4 px-2 flex items-center gap-1",
               variant === 'workflow' || variant === 'style' ? "w-[15rem] md:w-[14.375rem]" : "w-[14.9rem]"
             )}>
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
           ) : (
            <div className="flex items-center gap-1.5 h-4 mt-auto">
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
          )
        )}
      </div>
    </div>
  )
}

export default WorkflowCard