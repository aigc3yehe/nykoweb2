import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import {
  profileImageAtom,
  profileVideoAtom,
  fetchProfileImageAtom,
  fetchProfileVideoAtom,
  loadMoreProfileImageAtom,
  loadMoreProfileVideoAtom,
  likedImageAtom,
  likedVideoAtom,
  fetchLikedImageAtom,
  fetchLikedVideoAtom,
  loadMoreLikedImageAtom,
  loadMoreLikedVideoAtom,
  likeContentAtom,
  type TimeGroup
} from '../../store/contentsStore'
import type { ContentItem } from '../../store/contentsStore'
import { userStateAtom } from '../../store/loginStore'
import { openContentDetailAtom } from '../../store/contentDetailStore'
import { getScaledImageUrl } from '../../utils'
import { cn } from '../../utils/cn'
import LikeIcon from '../../assets/web2/like.svg'
import LikedIcon from '../../assets/web2/liked.svg'
import avatarSvg from '../../assets/mavae/avatar.svg'
import PictureIcon from '../../assets/mavae/Picture_white.svg'
import VideoIconNew from '../../assets/mavae/video_white.svg'
import NanananaIcon from '../../assets/mavae/nananana.svg'
import NanananaIconDark from '../../assets/mavae/dark/nananana.svg'
import WorkflowBuilderIcon from '../../assets/mavae/WorkflowBuilder_white.svg'

interface ProfileContentsListProps {
  type: 'image' | 'video'
  tab: 'published' | 'liked'
}

const ProfileContentsList: React.FC<ProfileContentsListProps> = ({ type, tab }) => {
  const [imageState] = useAtom(profileImageAtom)
  const [videoState] = useAtom(profileVideoAtom)
  const [, fetchImageContents] = useAtom(fetchProfileImageAtom)
  const [, fetchVideoContents] = useAtom(fetchProfileVideoAtom)
  const [, loadMoreImage] = useAtom(loadMoreProfileImageAtom)
  const [, loadMoreVideo] = useAtom(loadMoreProfileVideoAtom)
  const [likedImageState] = useAtom(likedImageAtom)
  const [likedVideoState] = useAtom(likedVideoAtom)
  const [, fetchLikedImages] = useAtom(fetchLikedImageAtom)
  const [, fetchLikedVideos] = useAtom(fetchLikedVideoAtom)
  const [, loadMoreLikedImages] = useAtom(loadMoreLikedImageAtom)
  const [, loadMoreLikedVideos] = useAtom(loadMoreLikedVideoAtom)
  const isLoadingRef = useRef(false)

  // 根据类型选择对应的状态和函数
  const isImage = type === 'image'
  const state = tab === 'liked'
    ? (isImage ? likedImageState : likedVideoState)
    : (isImage ? imageState : videoState)
  const fetchContents = tab === 'liked'
    ? (isImage ? fetchLikedImages : fetchLikedVideos)
    : (isImage ? fetchImageContents : fetchVideoContents)
  const loadMore = tab === 'liked'
    ? (isImage ? loadMoreLikedImages : loadMoreLikedVideos)
    : (isImage ? loadMoreImage : loadMoreVideo)

  useEffect(() => {
    fetchContents({ reset: true }).catch((error: any) => {
      console.error('ProfileContentsList: Failed to fetch contents:', error)
    })
  }, [type, tab, fetchContents])

  // 处理加载更多
  const handleLoadMore = useCallback(() => {
    if (state.hasMore && !state.isLoading && !isLoadingRef.current) {
      isLoadingRef.current = true
      console.log('ProfileContentsList: Loading more', type)
      loadMore().finally(() => {
        isLoadingRef.current = false
      })
    }
  }, [type, state.hasMore, state.isLoading, loadMore])

  // 监听滚动，当接近底部时加载更多
  const handleScroll = useCallback(() => {
    const mainContent = document.querySelector('main')
    if (!mainContent) return

    const scrollTop = mainContent.scrollTop
    const scrollHeight = mainContent.scrollHeight
    const clientHeight = mainContent.clientHeight

    // 当滚动到距离底部200px时触发加载
    if (scrollHeight - scrollTop <= clientHeight + 200) {
      handleLoadMore()
    }
  }, [handleLoadMore])

  useEffect(() => {
    const mainContent = document.querySelector('main')
    if (mainContent) {
      mainContent.addEventListener('scroll', handleScroll)
      return () => mainContent.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  // 根据类型获取对应的分组数据
  const groups = isImage ? (state as any).imageGroups : (state as any).videoGroups

  if (state.isLoading && groups.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">Loading {type === 'image' ? 'images' : 'videos'}...</div>
      </div>
    )
  }

  if (state.error && groups.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <p className="text-red-500 mb-2">Error loading {type === 'image' ? 'images' : 'videos'}: {state.error}</p>
          <button
            onClick={() => fetchContents({ reset: true })}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (groups.length === 0 && !state.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-6"> {/* padding-top: 40px, padding-bottom: 40px, gap: 24px */}
        {/* 图标 */}
        <img 
          src={NanananaIcon} 
          alt="Empty" 
          className="w-[7.5rem] h-[7.5rem] dark:hidden" // 120x120px, 浅色模式显示
        />
        <img 
          src={NanananaIconDark} 
          alt="Empty" 
          className="w-[7.5rem] h-[7.5rem] hidden dark:block" // 120x120px, 深色模式显示
        />
        
        {/* 文本提示 */}
        <div className="flex flex-col items-center gap-1"> {/* 两行文本间距4px */}
          <p className="font-switzer font-medium text-2xl leading-8 text-text-main dark:text-text-main-dark text-center"> {/* font-size: 24px, line-height: 32px */}
            No {type === 'image' ? 'images' : 'videos'} found
          </p>
          <p className="font-switzer font-medium text-sm leading-5 text-[#9CA1AF] text-center"> {/* font-size: 14px, line-height: 20px */}
            {type === 'image' ? 'Create or upload images to see them here' : 'Create or upload videos to see them here'}
          </p>
        </div>

        {/* 创建按钮 */}
        <button className="w-40 h-9 min-w-40 px-4 flex items-center justify-center gap-1 rounded-full bg-link-default dark:bg-link-default-dark hover:bg-link-pressed dark:hover:bg-link-pressed-dark transition-colors"> {/* width: 160px, height: 36px, gap: 4px */}
          <img src={WorkflowBuilderIcon} alt="Create" className="w-5 h-5" /> {/* 20x20px */}
          <span className="font-switzer font-medium text-sm leading-5 text-white"> {/* font-size: 14px, line-height: 20px */}
            Create
          </span>
        </button>
      </div>
    )
  }

  // 内容卡片组件 - 参考 InspirationImageCard 实现
  const ContentCard: React.FC<{ item: ContentItem }> = ({ item }) => {
    const [imageError, setImageError] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const [isLiking, setIsLiking] = useState(false)
    const [localContent, setLocalContent] = useState(item)
    const [, likeContent] = useAtom(likeContentAtom)
    const [userState] = useAtom(userStateAtom)
    const openContentDetail = useSetAtom(openContentDetailAtom)

    // 判断是否为视频
    const isVideo = item.type === 'video'

    // 计算图片高度
    const getImageHeight = () => {
      // 根据屏幕宽度动态计算卡片宽度
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
      const cardWidthRem = isMobile ? ((window.innerWidth - 48) / 16) : 18.375 // 移动端适配宽度，PC端294px
      if (item.width && item.height) {
        return (cardWidthRem * item.height) / item.width
      }
      return 12.5 // 默认200px in rem
    }

    const heightRem = getImageHeight()

    // 获取用户头像
    const getAvatarUrl = () => {
      if (item.user?.avatar) {
        return item.user.avatar
      }
      return avatarSvg
    }

    // 获取用户显示名称
    const getDisplayName = () => {
      if (item.user?.name) {
        return item.user.name
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
    const widthPx = cardWidthRem * 16

    // 处理卡片点击
    const handleCardClick = () => {
      // 默认行为：打开内容详情弹窗（state 为 0 时才强制刷新）
      openContentDetail({ id: item.content_id, state: item.state })
    }

    return (
      <div 
        className="w-full md:w-[18.375rem] md:min-w-[290px] md:max-w-[294px] cursor-pointer rounded-xl bg-secondary dark:bg-secondary-dark pb-2 gap-2 hover:shadow-[0px_8px_16px_0px_rgba(18,18,26,0.1)] transition-shadow" // 移动端全宽，PC端294px，padding-bottom: 8px, gap: 8px, border-radius: 12px, background: #FFFFFF, hover效果
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
          <div className="absolute bottom-0 left-0 right-0 h-[3.25rem] bg-gradient-to-t from-black/72 to-transparent"></div>

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

  return (
    <div className="space-y-8">
      {/* 分组列表 */}
      {groups.map((group: TimeGroup) => (
        <div key={group.groupKey} className="space-y-5">
          {/* 分组标题 */}
          <div className="flex items-center">
            <h3 className="font-lexend font-semibold text-lg text-design-main-text dark:text-design-dark-main-text">
              {group.groupLabel}
            </h3>
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
              ({group.contents.length})
            </span>
          </div>

          {/* 内容网格 - 移动端1列，PC端4列，gap 24px */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {group.contents.map((item) => (
              <ContentCard key={`${item.content_id}`} item={item} />
            ))}
          </div>
        </div>
      ))}

      {/* 加载更多状态 */}
      {state.isLoading && groups.length > 0 && (
        <div className="flex justify-center py-6">
          <div className="text-gray-500">Loading more {type === 'image' ? 'images' : 'videos'}...</div>
        </div>
      )}

      {/* 手动加载更多按钮 */}
      {state.hasMore && !state.isLoading && groups.length > 0 && (
        <div className="flex justify-center py-6">
          <button
            onClick={handleLoadMore}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Load More
          </button>
        </div>
      )}

      {/* 无更多数据提示 */}
      {!state.hasMore && groups.length > 0 && (
        <div className="flex justify-center py-6">
          <div className="text-gray-400">No more {type === 'image' ? 'images' : 'videos'} to load</div>
        </div>
      )}
    </div>
  )
}

export default ProfileContentsList 