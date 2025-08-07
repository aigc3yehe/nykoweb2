import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import {
  profileImageAtom,
  profileVideoAtom,
  fetchProfileImageAtom,
  fetchProfileVideoAtom,
  loadMoreProfileImageAtom,
  loadMoreProfileVideoAtom,
  type TimeGroup
} from '../../store/contentsStore'
import type { ContentItem } from '../../store/contentsStore'
import RecreateIcon from '../../assets/web2/recreate.svg'
import LikeIcon from '../../assets/web2/like.svg'
import { getScaledImageUrl } from '../../utils'
import { openContentDetailAtom } from '../../store/contentDetailStore'

interface ProfileContentsListProps {
  type: 'image' | 'video'
  tab: 'published' | 'liked' // 预留，暂只支持published
}

const ProfileContentsList: React.FC<ProfileContentsListProps> = ({ type }) => {
  const [imageState] = useAtom(profileImageAtom)
  const [videoState] = useAtom(profileVideoAtom)
  const [, fetchImageContents] = useAtom(fetchProfileImageAtom)
  const [, fetchVideoContents] = useAtom(fetchProfileVideoAtom)
  const [, loadMoreImage] = useAtom(loadMoreProfileImageAtom)
  const [, loadMoreVideo] = useAtom(loadMoreProfileVideoAtom)
  const isLoadingRef = useRef(false)

  // 根据类型选择对应的状态和函数
  const state = type === 'image' ? imageState : videoState
  const fetchContents = type === 'image' ? fetchImageContents : fetchVideoContents
  const loadMore = type === 'image' ? loadMoreImage : loadMoreVideo

  useEffect(() => {
    fetchContents({ reset: true }).catch((error: any) => {
      console.error('ProfileContentsList: Failed to fetch contents:', error)
    })
  }, [type, fetchContents])

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
  const groups = type === 'image' ? (state as any).imageGroups : (state as any).videoGroups

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
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <p className="text-gray-500 mb-2">
            No {type === 'image' ? 'images' : 'videos'} found
          </p>
          <p className="text-gray-400 text-sm">
            {type === 'image' ? 'Create or upload images to see them here' : 'Create or upload videos to see them here'}
          </p>
        </div>
      </div>
    )
  }

  // 内容卡片组件 - 固定219x219px，圆角10px，hover效果
  const ContentCard: React.FC<{ item: ContentItem }> = ({ item }) => {
    const [isHovered, setIsHovered] = useState(false)
    const [imageLoaded, setImageLoaded] = useState(false)
    const [imageError, setImageError] = useState(false)
    const openContentDetail = useSetAtom(openContentDetailAtom)

    // 处理卡片点击
    const handleCardClick = () => {
      openContentDetail(item.content_id)
    }

    return (
      <div 
        className="relative cursor-pointer group w-[10.3125rem] h-[10.3125rem] md:w-[13.6875rem] md:h-[13.6875rem]" // 219px = 13.6875rem
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
      >
        {/* 主内容区域 */}
        <div 
          className="w-full h-full rounded-[0.625rem] overflow-hidden bg-[#E8E8E8] dark:bg-gray-700 relative" // 10px = 0.625rem
        >
          {item.type === 'image' ? (
            <>
              {/* 背景色在图片加载前显示 */}
              {!imageLoaded && !imageError && (
                <div className="w-full h-full bg-[#E8E8E8] dark:bg-gray-700" />
              )}
              <img 
                src={getScaledImageUrl(item.url, 219)} 
                alt=""
                className={`w-full h-full object-cover transition-opacity duration-200 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  setImageError(true)
                  setImageLoaded(true)
                }}
              />
              {imageError && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#E8E8E8] dark:bg-gray-700">
                  <span className="text-gray-500 text-sm">Failed to load</span>
                </div>
              )}
            </>
          ) : (
            <video 
              src={item.url}
              className="w-full h-full object-cover"
              muted
              playsInline
              preload="metadata"
            />
          )}

          {/* Hover 遮罩层 */}
          <div 
            className={`absolute inset-0 bg-gradient-to-b from-transparent to-black/40 transition-opacity duration-200 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Hover 时显示的操作按钮和信息 */}
          <div 
            className={`absolute bottom-3 left-0 right-0 px-3 flex items-center justify-between transition-opacity duration-200 z-10 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Recreate 按钮 */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                // TODO: 重新创建
                console.log('Recreate content:', item.content_id)
              }}
              className="flex items-center gap-1 h-[1.875rem] px-3 bg-white rounded-md hover:bg-gray-50 transition-colors"
            >
              <img src={RecreateIcon} alt="Recreate" className="w-4 h-4" />
              <span className="font-lexend text-sm text-design-main-text">Recreate</span>
            </button>

            {/* 点赞数 */}
            <div className="flex items-center gap-1">
              <img src={LikeIcon} alt="Likes" className="w-4 h-4" />
              <span className="font-lexend text-xs text-white">
                {item.like_count || 0}
              </span>
            </div>
          </div>
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

          {/* 内容网格 - PC端5列，移动端2列，间隔10px */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 justify-items-center lg:justify-items-start"> {/* gap-2.5 = 10px */}
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