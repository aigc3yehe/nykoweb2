import React, { useEffect, useCallback, useRef } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { contentsAtom, loadMoreContentsAtom, fetchContentsAtom, ContentItem } from '../../store/contentsStore.ts'
import InspirationImageCard from '../home/InspirationImageCard.tsx'

interface WorkflowGalleryProps {
  workflowId: number
}

const WorkflowGallery: React.FC<WorkflowGalleryProps> = ({ workflowId }) => {
  const [contentsState] = useAtom(contentsAtom)
  const setFetchContents = useSetAtom(fetchContentsAtom)
  const [, loadMore] = useAtom(loadMoreContentsAtom)
  const isLoadingRef = useRef(false)

  // 加载指定workflow的内容
  const loadContents = useCallback(async (reset = true) => {
    try {
      await setFetchContents({
        reset,
        typeFilter: 'all',
        source: 'workflow',
        source_id: workflowId,
      })
    } catch (error) {
      console.error('WorkflowGallery: Failed to load contents:', error)
    }
  }, [setFetchContents, workflowId])

  // 初始加载
  useEffect(() => {
    loadContents(true)
    // eslint-disable-next-line
  }, [workflowId])

  // 加载更多
  const handleLoadMore = useCallback(() => {
    loadMore()
  }, [loadMore])

  // 自动加载更多（监听main滚动）
  const handleScroll = useCallback(() => {
    const mainContent = document.querySelector('main')
    if (!mainContent) return
    const scrollTop = mainContent.scrollTop
    const scrollHeight = mainContent.scrollHeight
    const clientHeight = mainContent.clientHeight
    if (
      scrollHeight - scrollTop <= clientHeight + 200 &&
      contentsState.hasMore &&
      !contentsState.isLoading &&
      !isLoadingRef.current
    ) {
      isLoadingRef.current = true
      handleLoadMore()
      setTimeout(() => {
        isLoadingRef.current = false
      }, 1000)
    }
  }, [contentsState.hasMore, contentsState.isLoading, handleLoadMore])

  useEffect(() => {
    const mainContent = document.querySelector('main')
    if (mainContent) {
      mainContent.addEventListener('scroll', handleScroll)
      return () => mainContent.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  // 瀑布流布局
  const getColumnsLayout = () => {
    const isMobile = window.innerWidth < 768
    const columns = isMobile ? 1 : 4
    const columnHeights = new Array(columns).fill(0)
    const columnItems: ContentItem[][] = new Array(columns).fill(null).map(() => [])
    contentsState.items.forEach((content) => {
      const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights))
      const cardWidthRem = isMobile ? ((window.innerWidth - 48) / 16) : 17.1875
      const imageHeightRem = content.width && content.height
        ? (cardWidthRem * content.height) / content.width
        : 12.5
      columnItems[shortestColumnIndex].push({
        ...content,
        calculatedHeight: imageHeightRem
      } as ContentItem & { calculatedHeight: number })
      columnHeights[shortestColumnIndex] += imageHeightRem + 1.625 + 0.75
    })
    return { columns: columnItems, columnCount: columns }
  }

  const { columns, columnCount } = getColumnsLayout()

  return (
    <div className="w-full">
      {/* Gallery 标题 */}
      <div className="mt-5 mb-3 md:my-6">
        <h2 className="font-lexend font-bold text-xl md:text-2xl leading-8 text-design-main-text dark:text-design-dark-main-text">Gallery</h2>
      </div>
      {/* 瀑布流内容 */}
      {contentsState.isLoading && contentsState.items.length === 0 ? (
        <div className="h-64 flex items-center justify-center">
          <span className="text-gray-500">Loading...</span>
        </div>
      ) : contentsState.error && contentsState.items.length === 0 ? (
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-2">Failed to load contents</p>
            <button
              onClick={() => loadContents(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      ) : contentsState.items.length === 0 ? (
        <div className="h-64 flex items-center justify-center">
          <span className="text-gray-500">No contents found</span>
        </div>
      ) : (
        <>
          <div className={`grid gap-3 ${columnCount === 1 ? 'grid-cols-1' : 'grid-cols-4'}`}>
            {columns.map((columnItems, columnIndex) => (
              <div key={columnIndex} className="flex flex-col gap-3">
                {columnItems.map((content: ContentItem & { calculatedHeight?: number }) => (
                  <InspirationImageCard
                    key={content.content_id}
                    content={content}
                    imageHeightRem={content.calculatedHeight}
                    onRecreateClick={() => console.log('Recreate clicked:', content.content_id)}
                  />
                ))}
              </div>
            ))}
          </div>
          {/* 加载更多指示器 */}
          {contentsState.isLoading && contentsState.items.length > 0 && (
            <div className="py-8 flex items-center justify-center">
              <span className="text-gray-500">Loading more...</span>
            </div>
          )}
          {/* 加载更多按钮 */}
          {contentsState.hasMore && !contentsState.isLoading && contentsState.items.length > 0 && (
            <div className="py-8 flex items-center justify-center">
              <button
                onClick={handleLoadMore}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Load More
              </button>
            </div>
          )}
          {/* 没有更多数据提示 */}
          {!contentsState.hasMore && contentsState.items.length > 0 && (
            <div className="py-8 flex items-center justify-center">
              <span className="text-gray-400">No more contents</span>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default WorkflowGallery