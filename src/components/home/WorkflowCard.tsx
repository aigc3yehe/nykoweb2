import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSetAtom, useAtom } from 'jotai'
import { cn } from '../../utils'
import { FeaturedItem } from '../../store/featuredStore'
import { getScaledImageUrl } from '../../utils'
import avatarSvg from '../../assets/Avatar.svg'
import { useLang } from '../../hooks/useLang'
import { showDialogAtom } from '../../store/dialogStore'
import { workflowsApi } from '../../services/api/workflows'
import { modelsApi } from '../../services/api/models'
import { userStateAtom } from '../../store/loginStore'
import PictureIcon from '../../assets/mavae/Picture_white.svg'
import VideoIconNew from '../../assets/mavae/video_white.svg'
import UseIconNew from '../../assets/mavae/use_white.svg'
import BookmarkNormalIcon from '../../assets/mavae/Bookmark_normal.svg'
import DeleteIcon from '../../assets/mavae/Delete.svg'
import DeleteIconHover from '../../assets/mavae/Delete_hover.svg'
import DeleteIconDark from '../../assets/mavae/dark/Delete.svg'
import DeleteIconHoverDark from '../../assets/mavae/dark/Delete_hover.svg'
import EditIcon from '../../assets/mavae/Edit.svg'
import EditIconHover from '../../assets/mavae/Edit_hover.svg'
import EditIconDark from '../../assets/mavae/dark/Edit.svg'
import EditIconHoverDark from '../../assets/mavae/dark/Edit_hover.svg'
import ThemeAdaptiveIcon from '../ui/ThemeAdaptiveIcon'
//import BookmarkYellowIcon from '../../assets/mavae/Bookmark_yellow.svg'
//import BookmarkNormalIconDark from '../../assets/mavae/dark/Bookmark_normal.svg'
//import BookmarkYellowIconDark from '../../assets/mavae/dark/Bookmark_yellow.svg'

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
  profileTab?: 'published' | 'liked'
}

const WorkflowCard: React.FC<WorkflowCardProps> = ({
  item,
  onClick,
  onUseClick,
  variant = 'workflow',
  profileTab
}) => {
  const navigate = useNavigate()
  const lang = useLang()
  const showDialog = useSetAtom(showDialogAtom)
  const [userState] = useAtom(userStateAtom)
  const [imageError, setImageError] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isDeleteButtonHovered, setIsDeleteButtonHovered] = useState(false)
  const [isEditButtonHovered, setIsEditButtonHovered] = useState(false)

  if (onUseClick === undefined) {
    console.log('onUseClick is undefined')
  }

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
      // Recipes Workflows/Styles页面: 移动端宽度占满，PC端固定尺寸
      return {
        card: 'w-full md:w-[14.9rem] h-[39.3125rem] md:h-[28.1rem] min-w-full md:min-w-[14.9rem] max-w-full md:max-w-[14.9rem] pb-2 gap-2', // 移动端: 宽度占满, 高度629px, PC端: 238.4x449.6px
        cover: 'w-full md:w-[14.9rem] h-[33.5625rem] md:h-[22.35rem]', // 移动端: 宽度占满, 高度537px, PC端: 238.4x357.6px
        container: 'w-full md:w-[14.9rem]',
        showDescription: true,
        showUser: true
      }
    } else if (variant === 'profile_workflow' || variant === 'profile_style') {
      // Profile Workflows/Styles页面: 与recipes相同的布局样式
      return {
        card: 'w-full md:w-[14.9rem] h-[39.3125rem] md:h-[28.1rem] min-w-full md:min-w-[14.9rem] max-w-full md:max-w-[14.9rem] pb-2 gap-2', // 移动端: 宽度占满, 高度629px, PC端: 238.4x449.6px
        cover: 'w-full md:w-[14.9rem] h-[33.5625rem] md:h-[22.35rem]', // 移动端: 宽度占满, 高度537px, PC端: 238.4x357.6px
        container: 'w-full md:w-[14.9rem]',
        showDescription: true,
        showUser: true
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
        // 根据屏幕尺寸返回不同宽度
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
          return window.innerWidth - 32 // 移动端: 屏幕宽度减去左右padding (16px * 2)
        }
        return 238 // PC端: From w-[14.9rem] (238.4px)
      case 'profile_workflow':
      case 'profile_style':
        // 根据屏幕尺寸返回不同宽度，与recipes相同的逻辑
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
          return window.innerWidth - 32 // 移动端: 屏幕宽度减去左右padding (16px * 2)
        }
        return 238 // PC端: From w-[14.9rem] (238.4px)
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

  // 处理删除按钮点击
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    // 显示删除确认弹窗
    const itemType = variant === 'profile_workflow' ? 'workflow' : 'style'
    showDialog({
      open: true,
      title: `Delete ${itemType}?`,
      message: `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          if (userState.userDetails?.did) {
            if (variant === 'profile_workflow') {
              // 调用工作流可见性切换API，设置为不可见
              const success = await workflowsApi.toggleWorkflowVisibility(item.id, {
                user: userState.userDetails.did,
                visibility: false
              })
              
              if (success) {
                console.log('Workflow deleted successfully:', item.id)
                // 这里可以添加成功提示或者刷新列表
              } else {
                console.error('Failed to delete workflow')
              }
            } else if (variant === 'profile_style') {
              // 调用模型可见性切换API，设置为不可见
              const success = await modelsApi.updateModelVisibility(item.id, {
                user: userState.userDetails.did,
                visibility: false
              })
              
              if (success) {
                console.log('Model deleted successfully:', item.id)
                // 这里可以添加成功提示或者刷新列表
              } else {
                console.error('Failed to delete model')
              }
            }
          }
          // 关闭弹窗
          showDialog({ open: false, title: '', message: '', onConfirm: () => {}, onCancel: () => {} })
        } catch (error) {
          console.error('Error deleting item:', error)
          // 关闭弹窗
          showDialog({ open: false, title: '', message: '', onConfirm: () => {}, onCancel: () => {} })
        }
      },
      onCancel: () => {
        // 关闭弹窗
        showDialog({ open: false, title: '', message: '', onConfirm: () => {}, onCancel: () => {} })
      },
      confirmText: 'Delete',
      cancelText: 'Cancel'
    })
  }

  // 处理编辑按钮点击
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    // 根据variant决定跳转目标
    if (variant === 'profile_workflow') {
      // 工作流编辑页面
      navigate(`/${lang}/workflow/${item.id}/edit`)
    } else if (variant === 'profile_style') {
      // 模型编辑页面
      navigate(`/${lang}/model/${item.id}/edit`)
    }
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
        {variant === 'workflow' || variant === 'style' || variant === 'recipes_workflow' || variant === 'recipes_style' || variant === 'profile_workflow' || variant === 'profile_style' ? (
          <div className="px-2 flex flex-col gap-1 flex-1">
            {/* 第一行 - 标题 */}
            <h3 className="font-switzer font-bold text-sm leading-5 text-text-main dark:text-text-main-dark truncate">
              {item.name}
            </h3>

            {/* 第二行 - 描述 - workflow、recipes和profile显示，style只在PC端显示 */}
            {item.description && (variant === 'workflow' || variant === 'recipes_workflow' || variant === 'recipes_style' || variant === 'profile_workflow' || variant === 'profile_style' || (variant === 'style' && typeof window !== 'undefined' && window.innerWidth >= 768)) && (
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
          variant === 'workflow' || variant === 'style' || variant === 'recipes_workflow' || variant === 'recipes_style' || variant === 'profile_workflow' || variant === 'profile_style' ? (
            <div className={cn(
              "h-4 px-2 flex items-center justify-between",
              variant === 'workflow' || variant === 'style' ? "w-[15rem] md:w-[14.375rem]" : "w-full md:w-[14.9rem]"
            )}>
              {/* 左侧用户信息 */}
              <div className="flex items-center gap-1">
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

              {/* 右侧操作按钮 - 仅在profile模式下且published tab显示，PC端hover显示，移动端默认显示 */}
              {(variant === 'profile_workflow' || variant === 'profile_style') && profileTab === 'published' && (
                <div className={`flex items-center gap-3 ${typeof window !== 'undefined' && window.innerWidth < 768 ? 'block' : isHovered ? 'block' : 'hidden'}`}>
                  {/* 编辑按钮 */}
                  <button
                    onClick={handleEditClick}
                    onMouseEnter={() => setIsEditButtonHovered(true)}
                    onMouseLeave={() => setIsEditButtonHovered(false)}
                    className="w-4 h-4 flex items-center justify-center transition-opacity"
                    title="Edit workflow"
                  >
                    <ThemeAdaptiveIcon
                      lightIcon={EditIcon}
                      darkIcon={EditIconDark}
                      lightSelectedIcon={EditIconHover}
                      darkSelectedIcon={EditIconHoverDark}
                      alt="Edit"
                      size="sm"
                      isSelected={isEditButtonHovered}
                      className="w-4 h-4"
                    />
                  </button>

                                                        {/* 删除按钮 */}
                    <button
                      onClick={handleDeleteClick}
                      onMouseEnter={() => setIsDeleteButtonHovered(true)}
                      onMouseLeave={() => setIsDeleteButtonHovered(false)}
                      className="w-4 h-4 flex items-center justify-center transition-opacity"
                      title="Delete workflow"
                    >
                    <ThemeAdaptiveIcon
                      lightIcon={DeleteIcon}
                      darkIcon={DeleteIconDark}
                      lightSelectedIcon={DeleteIconHover}
                      darkSelectedIcon={DeleteIconHoverDark}
                      alt="Delete"
                      size="sm"
                      isSelected={isDeleteButtonHovered}
                      className="w-4 h-4"
                    />
                  </button>
                </div>
              )}
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