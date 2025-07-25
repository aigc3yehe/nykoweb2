import React, { useEffect, useCallback, useRef } from 'react'
import { useAtom } from 'jotai'
import WorkflowCard from '../home/WorkflowCard'
import {
  profileModelsAtom,
  fetchPublishedModelsAtom,
  fetchLikedModelsAtom,
  loadMorePublishedModelsAtom,
  type TimeGroup
} from '../../store/profileModelStore'
import type { FetchModelDto } from '../../services/api/types'
import type { FeaturedItem } from '../../store/featuredStore'

interface ProfileModelsListProps {
  tab: 'published' | 'liked'
}

// 数据转换器：将 FetchModelDto 转换为 FeaturedItem 格式
const convertModelToFeaturedItem = (model: FetchModelDto): FeaturedItem => ({
  id: model.model_id,
  source: 'model' as const,
  name: model.name || '',
  tags: model.tags || [],
  usage: model.usage || 0,
  cover: model.cover || '',
  description: model.description,
  user: model.user || {
    did: '',
    name: 'Anonymous',
    avatar: '',
    email: ''
  }
})

const ProfileModelsList: React.FC<ProfileModelsListProps> = ({ tab }) => {
  const [state] = useAtom(profileModelsAtom)
  const [, fetchPublished] = useAtom(fetchPublishedModelsAtom)
  const [, fetchLiked] = useAtom(fetchLikedModelsAtom)
  const [, loadMorePublished] = useAtom(loadMorePublishedModelsAtom)
  const isLoadingRef = useRef(false)

  useEffect(() => {
    if (tab === 'published') {
      fetchPublished({ reset: false }).catch(error => {
        console.error('ProfileModelsList: Failed to fetch published models:', error)
      })
    } else {
      fetchLiked({ reset: false }).catch(error => {
        console.error('ProfileModelsList: Failed to fetch liked models:', error)
      })
    }
  }, [tab, fetchPublished, fetchLiked])

  // 处理加载更多
  const handleLoadMore = useCallback(() => {
    if (tab === 'published' && state.publishedHasMore && !state.isLoading && !isLoadingRef.current) {
      isLoadingRef.current = true
      console.log('ProfileModelsList: Loading more published models')
      loadMorePublished().finally(() => {
        isLoadingRef.current = false
      })
    }
  }, [tab, state.publishedHasMore, state.isLoading, loadMorePublished])

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

  const currentGroups = tab === 'published' ? state.publishedGroups : state.likedGroups
  const hasMore = tab === 'published' ? state.publishedHasMore : state.likedHasMore

  if (state.isLoading && currentGroups.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">Loading styles...</div>
      </div>
    )
  }

  if (state.error && currentGroups.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <p className="text-red-500 mb-2">Error loading styles: {state.error}</p>
          <button
            onClick={() => {
              if (tab === 'published') {
                fetchPublished({ reset: true })
              } else {
                fetchLiked({ reset: true })
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (currentGroups.length === 0 && !state.isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <p className="text-gray-500 mb-2">
            {tab === 'published' ? 'No published styles found' : 'No liked styles found'}
          </p>
          <p className="text-gray-400 text-sm">
            {tab === 'published'
              ? 'Create your first style to get started'
              : 'Like some styles to see them here'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {currentGroups.map((group: TimeGroup) => (
        <div key={group.groupKey} className="space-y-5">
          <div className="flex items-center">
            <h3 className="font-lexend font-semibold text-lg text-design-main-text dark:text-design-dark-main-text">
              {group.groupLabel}
            </h3>
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
              ({group.models.length})
            </span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {group.models.map((model, index) => (
              <div key={`${model.model_id}-${index}`} className="flex justify-center">
                <WorkflowCard
                  item={convertModelToFeaturedItem(model)}
                  variant="profile_style"
                  onClick={() => {
                    // TODO: 导航到模型详情页
                    console.log('Navigate to model:', model.model_id)
                  }}
                  onUseClick={() => {
                    // TODO: 使用模型
                    console.log('Use model:', model.model_id)
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {/* 加载更多状态 */}
      {state.isLoading && currentGroups.length > 0 && (
        <div className="flex justify-center py-6">
          <div className="text-gray-500">Loading more styles...</div>
        </div>
      )}

      {/* 手动加载更多按钮 */}
      {hasMore && !state.isLoading && currentGroups.length > 0 && (
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
      {!hasMore && currentGroups.length > 0 && (
        <div className="flex justify-center py-6">
          <div className="text-gray-400">No more styles to load</div>
        </div>
      )}
    </div>
  )
}

export default ProfileModelsList 