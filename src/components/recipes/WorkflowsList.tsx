import React, { useEffect, useCallback, useRef } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import WorkflowCard from '../home/WorkflowCard'
import {
  recipesWorkflowsAtom,
  fetchRecipesWorkflowsAtom,
  loadMoreRecipesWorkflowsAtom
} from '../../store/recipesWorkflowStore'
import { useNavigate } from 'react-router-dom'
import { useLang, withLangPrefix } from '../../hooks/useLang'
import type { WorkflowDto } from '../../services/api'
import type { FeaturedItem } from '../../store/featuredStore'
import { useChatSidebar } from '../../hooks/useChatSidebar'
import { setPendingMessageAtom } from '../../store/assistantStore'
import { useI18n } from '../../hooks/useI18n'

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
    name: 'Anonymous', // 这个将在组件中被替换为多语言
    avatar: '',
    email: ''
  }
})

interface WorkflowsListProps {
  sortOption?: string
}

const WorkflowsList: React.FC<WorkflowsListProps> = ({ sortOption = 'All' }) => {
  const { t } = useI18n()
  const [workflowState] = useAtom(recipesWorkflowsAtom)
  const [, fetchData] = useAtom(fetchRecipesWorkflowsAtom)
  const [, loadMore] = useAtom(loadMoreRecipesWorkflowsAtom)
  const isLoadingRef = useRef(false)
  const navigate = useNavigate()
  const lang = useLang()
  const { openChat } = useChatSidebar()
  const setPendingMessage = useSetAtom(setPendingMessageAtom)
  // 将排序选项转换为API参数
  const getSortParams = (option: string) => {
    switch (option) {
      case 'All':
        return { order: 'created_at' as const, desc: 'desc' as const } // 默认排序
      case 'Popular':
        return { order: 'usage' as const, desc: 'desc' as const }
      case 'Recent':
        return { order: 'created_at' as const, desc: 'desc' as const }
      default:
        return { order: 'created_at' as const, desc: 'desc' as const }
    }
  }

  // 初始加载数据
  useEffect(() => {
    if (workflowState.items.length === 0 && !workflowState.isLoading) {
      console.log('WorkflowsList: Starting initial load')
      const sortParams = getSortParams(sortOption)
      fetchData({ reset: true, ...sortParams }).catch(error => {
        console.error('WorkflowsList: Initial load failed:', error)
      })
    }
  }, [fetchData, workflowState.items.length, workflowState.isLoading, sortOption])

  // 处理排序变化
  useEffect(() => {
    if (workflowState.items.length > 0) {
      console.log('WorkflowsList: Sorting changed to', sortOption)
      const sortParams = getSortParams(sortOption)
      fetchData({ reset: true, ...sortParams }).catch(error => {
        console.error('WorkflowsList: Sort change failed:', error)
      })
    }
  }, [sortOption, fetchData, workflowState.items.length])

  // 处理加载更多
  const handleLoadMore = useCallback(() => {
    if (workflowState.hasMore && !workflowState.isLoading && !isLoadingRef.current) {
      isLoadingRef.current = true
      console.log('WorkflowsList: Loading more Agent Cases')
      loadMore().finally(() => {
        isLoadingRef.current = false
      })
    }
  }, [workflowState.hasMore, workflowState.isLoading, loadMore])

  // 处理工作流点击 - 导航到详情页面
  const handleWorkflowClick = (workflowId: number) => {
    navigate(withLangPrefix(lang, `/workflow/${workflowId}`))
  }

  // 处理使用工作流
  const handleUseWorkflow = (workflowId: number) => {
    console.log('Use workflow:', workflowId)
    // 1. 设置延迟发送的消息
    setPendingMessage('I want to use this workflow.')
    // 2. 打开详情页面（详情数据加载完成后会自动发送消息）
    navigate(withLangPrefix(lang, `/workflow/${workflowId}`))
    // 3. 打开右侧聊天窗口（包含登录检查）
    openChat()
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

  // 加载状态
  if (workflowState.isLoading && workflowState.items.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">{t('recipes.loadingAgentCases')}</div>
      </div>
    )
  }

  // 错误状态
  if (workflowState.error && workflowState.items.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <p className="text-red-500 mb-2">{t('recipes.errorLoadingAgentCases')} {workflowState.error}</p>
          <button
            onClick={() => fetchData({ reset: true })}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            {t('recipes.retry')}
          </button>
        </div>
      </div>
    )
  }

  // 空状态
  if (workflowState.items.length === 0 && !workflowState.isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">{t('recipes.noAgentCasesFound')}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 工作流网格列表 - 移动端1列，PC端5列，gap 24px */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {workflowState.items.map((workflow, index) => (
          <div key={`${workflow.workflow_id}-${index}`} className="flex justify-center lg:justify-start">
            <WorkflowCard
              item={convertWorkflowToFeaturedItem(workflow)}
              variant="recipes_workflow"
              onClick={() => handleWorkflowClick(workflow.workflow_id)}
              onUseClick={() => handleUseWorkflow(workflow.workflow_id)}
            />
          </div>
        ))}
      </div>

      {/* 加载更多状态 */}
      {workflowState.isLoading && workflowState.items.length > 0 && (
        <div className="flex justify-center py-6">
          <div className="text-gray-500">{t('recipes.loadingMoreAgentCases')}</div>
        </div>
      )}

      {/* 手动加载更多按钮 */}
      {workflowState.hasMore && !workflowState.isLoading && workflowState.items.length > 0 && (
        <div className="flex justify-center py-6">
          <button
            onClick={handleLoadMore}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {t('home.loadMore')}
          </button>
        </div>
      )}

      {/* 无更多数据提示 */}
      {!workflowState.hasMore && workflowState.items.length > 0 && (
        <div className="flex justify-center py-6">
          <div className="text-gray-400">{t('recipes.noMoreAgentCases')}</div>
        </div>
      )}
    </div>
  )
}

export default WorkflowsList