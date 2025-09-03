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
import { useLang, withLangPrefix } from '../../hooks/useLang'
import NanananaIcon from '../../assets/mavae/nananana.svg'
import NanananaIconDark from '../../assets/mavae/dark/nananana.svg'
import WorkflowBuilderIcon from '../../assets/mavae/WorkflowBuilder_white.svg'

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
  const lang = useLang()
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
      console.log('ProfileWorkflowsList: Loading more published Agent Cases')
      loadMorePublished().finally(() => {
        isLoadingRef.current = false
      })
    }
  }, [tab, state.publishedHasMore, state.isLoading, loadMorePublished])

  const handleWorkflowClick = (workflowId: number) => {
    navigate(withLangPrefix(lang, `/workflow/${workflowId}`))
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
        <div className="text-gray-500">Loading Agent Cases...</div>
      </div>
    )
  }

  // 错误状态
  if (state.error && currentGroups.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <p className="text-red-500 mb-2">Error loading Agent Cases: {state.error}</p>
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
            {tab === 'published' ? 'No published cases found' : 'No liked cases found'}
          </p>
          <p className="font-switzer font-medium text-sm leading-5 text-[#9CA1AF] text-center"> {/* font-size: 14px, line-height: 20px */}
            {tab === 'published' 
              ? 'Create your first agent case to get started' 
              : 'Like some cases to see them here'
            }
          </p>
        </div>

        {/* 创建按钮 */}
        <button className="w-40 h-9 min-w-40 px-4 flex items-center justify-center gap-1 rounded-full bg-link-default dark:bg-link-default-dark hover:bg-link-pressed dark:hover:bg-link-pressed-dark transition-colors"> {/* width: 160px, height: 36px, gap: 4px */}
          <img src={WorkflowBuilderIcon} alt="Builder" className="w-5 h-5" /> {/* 20x20px */}
          <span className="font-switzer font-medium text-sm leading-5 text-white"> {/* font-size: 14px, line-height: 20px */}
            Builder
          </span>
        </button>
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

          {/* 工作流网格 - 移动端1列，PC端5列，gap 24px */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
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
          <div className="text-gray-500">Loading more Agent Cases...</div>
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
          <div className="text-gray-400">No more cases to load</div>
        </div>
      )}
    </div>
  )
}

export default ProfileWorkflowsList 