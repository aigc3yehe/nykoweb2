import React, { useEffect, useCallback, useRef } from 'react'
import { useAtom } from 'jotai'
import WorkflowCard from '../home/WorkflowCard'
import { 
  profileWorkflowsAtom, 
  fetchPublishedWorkflowsAtom,
  fetchLikedWorkflowsAtom,
  loadMorePublishedWorkflowsAtom,
  type TimeGroup 
} from '../../store/profileWorkflowStore'
import type { WorkflowDto } from '../../services/api'
import type { FeaturedItem } from '../../store/featuredStore'
import { useNavigate } from 'react-router-dom'

interface ProfileWorkflowsListProps {
  tab: 'published' | 'liked'
}

// 数据转换器：将 WorkflowDto 转换为 FeaturedItem 格式
const convertWorkflowToFeaturedItem = (workflow: WorkflowDto): FeaturedItem => ({
  id: workflow.workflow_id,
  source: 'workflow' as const,
  name: workflow.name || '',
  tags: workflow.tags || [],
  usage: workflow.usage || 0,
  cover: workflow.cover || '',
  like_count: workflow.like_count || 0,
  description: workflow.description,
  user: workflow.user || {
    did: '',
    name: 'Anonymous',
    avatar: '',
    email: ''
  }
})

const ProfileWorkflowsList: React.FC<ProfileWorkflowsListProps> = ({ tab }) => {
  const [state] = useAtom(profileWorkflowsAtom)
  const [, fetchPublished] = useAtom(fetchPublishedWorkflowsAtom)
  const [, fetchLiked] = useAtom(fetchLikedWorkflowsAtom)
  const [, loadMorePublished] = useAtom(loadMorePublishedWorkflowsAtom)
  const isLoadingRef = useRef(false)
  const navigate = useNavigate()
  // 初始加载数据
  useEffect(() => {
    if (tab === 'published') {
      fetchPublished({ reset: false }).catch(error => {
        console.error('ProfileWorkflowsList: Failed to fetch published workflows:', error)
      })
    } else {
      fetchLiked({ reset: false }).catch(error => {
        console.error('ProfileWorkflowsList: Failed to fetch liked workflows:', error)
      })
    }
  }, [tab, fetchPublished, fetchLiked])

  // 处理加载更多
  const handleLoadMore = useCallback(() => {
    if (tab === 'published' && state.publishedHasMore && !state.isLoading && !isLoadingRef.current) {
      isLoadingRef.current = true
      console.log('ProfileWorkflowsList: Loading more published workflows')
      loadMorePublished().finally(() => {
        isLoadingRef.current = false
      })
    }
  }, [tab, state.publishedHasMore, state.isLoading, loadMorePublished])

  const handleWorkflowClick = (workflowId: number) => {
    navigate(`/workflow/${workflowId}`)
  }
  const handleUseWorkflow = (workflowId: number) => {
    console.log('Use workflow:', workflowId)
  }

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

  // 获取当前tab的数据
  const currentGroups = tab === 'published' ? state.publishedGroups : state.likedGroups
  const hasMore = tab === 'published' ? state.publishedHasMore : state.likedHasMore

  // 加载状态
  if (state.isLoading && currentGroups.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">Loading workflows...</div>
      </div>
    )
  }

  // 错误状态
  if (state.error && currentGroups.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <p className="text-red-500 mb-2">Error loading workflows: {state.error}</p>
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

  // 空状态
  if (currentGroups.length === 0 && !state.isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <p className="text-gray-500 mb-2">
            {tab === 'published' ? 'No published workflows found' : 'No liked workflows found'}
          </p>
          <p className="text-gray-400 text-sm">
            {tab === 'published' 
              ? 'Create your first workflow to get started' 
              : 'Like some workflows to see them here'
            }
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* 分组列表 */}
      {currentGroups.map((group: TimeGroup) => (
        <div key={group.groupKey} className="space-y-5">
          {/* 分组标题 */}
          <div className="flex items-center">
            <h3 className="font-lexend font-semibold text-lg text-design-main-text dark:text-design-dark-main-text">
              {group.groupLabel}
            </h3>
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
              ({group.workflows.length})
            </span>
          </div>

          {/* 工作流网格 - 复用recipes页面的样式 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {group.workflows.map((workflow, index) => (
              <div key={`${workflow.workflow_id}-${index}`} className="flex justify-center">
                <WorkflowCard
                  item={convertWorkflowToFeaturedItem(workflow)}
                  variant="profile_workflow"
                  onClick={() => handleWorkflowClick(workflow.workflow_id)}
                  onUseClick={() => handleUseWorkflow(workflow.workflow_id)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* 加载更多状态 */}
      {state.isLoading && currentGroups.length > 0 && (
        <div className="flex justify-center py-6">
          <div className="text-gray-500">Loading more workflows...</div>
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
          <div className="text-gray-400">No more workflows to load</div>
        </div>
      )}
    </div>
  )
}

export default ProfileWorkflowsList 