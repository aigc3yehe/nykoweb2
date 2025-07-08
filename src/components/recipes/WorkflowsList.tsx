import React, { useEffect, useCallback, useRef } from 'react'
import { useAtom } from 'jotai'
import WorkflowCard from '../home/WorkflowCard'
import {
  recipesWorkflowsAtom,
  fetchRecipesWorkflowsAtom,
  loadMoreRecipesWorkflowsAtom
} from '../../store/recipesWorkflowStore'
import { useNavigate } from 'react-router-dom'
import type { WorkflowDto } from '../../services/api'
import type { FeaturedItem } from '../../store/featuredStore'

// 数据转换器：将 WorkflowDto 转换为 FeaturedItem 格式
const convertWorkflowToFeaturedItem = (workflow: WorkflowDto): FeaturedItem => ({
  id: workflow.workflow_id,
  source: 'workflow' as const,
  name: workflow.name || '',
  tags: workflow.tags || [],
  usage: workflow.usage || 0,
  cover: workflow.cover || '',
  description: workflow.description,
  user: workflow.user || {
    did: '',
    name: 'Anonymous',
    avatar: '',
    email: ''
  }
})

const WorkflowsList: React.FC = () => {
  const [workflowState] = useAtom(recipesWorkflowsAtom)
  const [, fetchData] = useAtom(fetchRecipesWorkflowsAtom)
  const [, loadMore] = useAtom(loadMoreRecipesWorkflowsAtom)
  const isLoadingRef = useRef(false)
  const navigate = useNavigate()
  // 初始加载数据
  useEffect(() => {
    if (workflowState.items.length === 0 && !workflowState.isLoading) {
      console.log('WorkflowsList: Starting initial load')
      fetchData({ reset: true }).catch(error => {
        console.error('WorkflowsList: Initial load failed:', error)
      })
    }
  }, [fetchData, workflowState.items.length, workflowState.isLoading])

  // 处理加载更多
  const handleLoadMore = useCallback(() => {
    if (workflowState.hasMore && !workflowState.isLoading && !isLoadingRef.current) {
      isLoadingRef.current = true
      console.log('WorkflowsList: Loading more workflows')
      loadMore().finally(() => {
        isLoadingRef.current = false
      })
    }
  }, [workflowState.hasMore, workflowState.isLoading, loadMore])

  // 处理工作流点击 - 导航到详情页面
  const handleWorkflowClick = (workflowId: number) => {
    navigate(`/workflow/${workflowId}`)
  }

  // 处理使用工作流
  const handleUseWorkflow = (workflowId: number) => {
    console.log('Use workflow:', workflowId)
    // TODO: 实现使用工作流的逻辑
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
        <div className="text-gray-500">Loading workflows...</div>
      </div>
    )
  }

  // 错误状态
  if (workflowState.error && workflowState.items.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <p className="text-red-500 mb-2">Error loading workflows: {workflowState.error}</p>
          <button
            onClick={() => fetchData({ reset: true })}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // 空状态
  if (workflowState.items.length === 0 && !workflowState.isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">No workflows found</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 工作流网格列表 - 移动端2列，PC端4列，每个卡片269px宽度，gap 20px */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {workflowState.items.map((workflow, index) => (
          <div key={`${workflow.workflow_id}-${index}`} className="flex justify-center">
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
          <div className="text-gray-500">Loading more workflows...</div>
        </div>
      )}

      {/* 手动加载更多按钮 */}
      {workflowState.hasMore && !workflowState.isLoading && workflowState.items.length > 0 && (
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
      {!workflowState.hasMore && workflowState.items.length > 0 && (
        <div className="flex justify-center py-6">
          <div className="text-gray-400">No more workflows to load</div>
        </div>
      )}
    </div>
  )
}

export default WorkflowsList