import React, { useEffect, useCallback, useRef } from 'react'
import { useAtom } from 'jotai'
import WorkflowCard from '../home/WorkflowCard'
import { modelListAtom, fetchModels } from '../../store/modelStore'

const StylesList: React.FC = () => {
  const [modelState] = useAtom(modelListAtom)
  const [, fetchData] = useAtom(fetchModels)
  const isLoadingRef = useRef(false)

  // 初始加载数据
  useEffect(() => {
    if (modelState.models.length === 0) {
      fetchData({ reset: true, view: true })
    }
  }, [fetchData, modelState.models.length])

  // 处理加载更多
  const handleLoadMore = useCallback(() => {
    if (modelState.hasMore && !modelState.isLoading && !isLoadingRef.current) {
      isLoadingRef.current = true
      fetchData({ reset: false, view: true }).finally(() => {
        isLoadingRef.current = false
      })
    }
  }, [modelState.hasMore, modelState.isLoading, fetchData])

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

  if (modelState.isLoading && modelState.models.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">Loading styles...</div>
      </div>
    )
  }

  if (modelState.error) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-red-500">Error loading styles: {modelState.error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 风格网格列表 - PC端4列，每个卡片269px宽度，gap 20px */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {modelState.models.map((model, index) => (
          <div key={`${model.id}-${index}`} className="flex justify-center">
            <WorkflowCard
              item={model as any}
              variant="recipes_style"
              onClick={() => {
                // TODO: 导航到模型详情页
                console.log('Navigate to model:', model.id)
              }}
              onUseClick={() => {
                // TODO: 使用模型
                console.log('Use model:', model.id)
              }}
            />
          </div>
        ))}
      </div>

      {/* 加载更多状态 */}
      {modelState.isLoading && modelState.models.length > 0 && (
        <div className="flex justify-center py-6">
          <div className="text-gray-500">Loading more styles...</div>
        </div>
      )}

      {/* 无更多数据提示 */}
      {!modelState.hasMore && modelState.models.length > 0 && (
        <div className="flex justify-center py-6">
          <div className="text-gray-400">No more styles to load</div>
        </div>
      )}

      {/* 空状态 */}
      {modelState.models.length === 0 && !modelState.isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-500">No styles found</div>
        </div>
      )}
    </div>
  )
}

export default StylesList 