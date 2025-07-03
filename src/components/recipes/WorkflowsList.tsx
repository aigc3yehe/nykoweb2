import React, { useEffect, useCallback, useRef } from 'react'
import { useAtom } from 'jotai'
import WorkflowCard from '../home/WorkflowCard'
import { workflowListAtom, fetchWorkflows } from '../../store/workflowStore'

const WorkflowsList: React.FC = () => {
  const [workflowState] = useAtom(workflowListAtom)
  const [, fetchData] = useAtom(fetchWorkflows)
  const isLoadingRef = useRef(false)

  // 初始加载数据
  useEffect(() => {
    if (workflowState.workflows.length === 0) {
      fetchData({ reset: true, view: true })
    }
  }, [fetchData, workflowState.workflows.length])

  // 处理加载更多
  const handleLoadMore = useCallback(() => {
    if (workflowState.hasMore && !workflowState.isLoading && !isLoadingRef.current) {
      isLoadingRef.current = true
      fetchData({ reset: false, view: true }).finally(() => {
        isLoadingRef.current = false
      })
    }
  }, [workflowState.hasMore, workflowState.isLoading, fetchData])

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

  if (workflowState.isLoading && workflowState.workflows.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">Loading workflows...</div>
      </div>
    )
  }

  if (workflowState.error) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-red-500">Error loading workflows: {workflowState.error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 工作流网格列表 - 移动端2列，PC端4列，每个卡片269px宽度，gap 20px */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {workflowState.workflows.map((workflow, index) => (
          <div key={`${workflow.id}-${index}`} className="flex justify-center">
            <WorkflowCard
              item={workflow as any}
              variant="recipes_workflow"
              onClick={() => {
                // TODO: 导航到工作流详情页
                console.log('Navigate to workflow:', workflow.id)
              }}
              onUseClick={() => {
                // TODO: 使用工作流
                console.log('Use workflow:', workflow.id)
              }}
            />
          </div>
        ))}
      </div>

      {/* 加载更多状态 */}
      {workflowState.isLoading && workflowState.workflows.length > 0 && (
        <div className="flex justify-center py-6">
          <div className="text-gray-500">Loading more workflows...</div>
        </div>
      )}

      {/* 无更多数据提示 */}
      {!workflowState.hasMore && workflowState.workflows.length > 0 && (
        <div className="flex justify-center py-6">
          <div className="text-gray-400">No more workflows to load</div>
        </div>
      )}

      {/* 空状态 */}
      {workflowState.workflows.length === 0 && !workflowState.isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-500">No workflows found</div>
        </div>
      )}
    </div>
  )
}

export default WorkflowsList 