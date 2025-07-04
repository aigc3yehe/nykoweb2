import React, { useEffect, useState, useCallback } from 'react'
import { useAtom } from 'jotai'
import {
  contentsAtom,
  filterContentsByTypeAtom,
  loadMoreContentsAtom,
  ContentTypeFilter,
  ContentItem
} from '../../store/contentsStore'
import InspirationSectionHeader from './InspirationSectionHeader'
import InspirationImageCard from './InspirationImageCard'

const InspirationFeed: React.FC = () => {
  const [contentsState] = useAtom(contentsAtom)
  const [, filterByType] = useAtom(filterContentsByTypeAtom)
  const [, loadMore] = useAtom(loadMoreContentsAtom)
  const [selectedFilter, setSelectedFilter] = useState<ContentTypeFilter>('all')

  // 获取数据
  const loadContents = useCallback(async (typeFilter: ContentTypeFilter, reset = true) => {
    try {
      if (reset) {
        await filterByType(typeFilter)
      } else {
        await loadMore()
      }
    } catch (error) {
      console.error('InspirationFeed: Failed to load contents:', error)
    }
  }, [filterByType, loadMore])

  // 初始加载
  useEffect(() => {
    if (contentsState.items.length === 0 && !contentsState.isLoading) {
      console.log('InspirationFeed: Starting initial load with filter:', selectedFilter)
      filterByType(selectedFilter).catch(error => {
        console.error('InspirationFeed: Initial load failed:', error)
      })
    }
  }, [filterByType, selectedFilter]) // 添加正确的依赖

  // 筛选变化时重新加载
  const handleFilterChange = (newFilter: ContentTypeFilter) => {
    console.log('InspirationFeed: Filter changed to', newFilter)
    setSelectedFilter(newFilter)
    loadContents(newFilter, true)
  }

  // 手动加载更多的处理函数
  const handleLoadMore = () => {
    console.log('InspirationFeed: Load more button clicked')
    loadContents(selectedFilter, false)
  }

  // 瀑布流布局计算 - 响应式列数
  const getColumnsLayout = () => {
    // 根据屏幕宽度决定列数
    const isMobile = window.innerWidth < 768
    const columns = isMobile ? 1 : 4 // 移动端1列，PC端4列

    const columnHeights = new Array(columns).fill(0)
    const columnItems: ContentItem[][] = new Array(columns).fill(null).map(() => [])

    contentsState.items.forEach((content) => {
      // 找到最短的列
      const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights))

      // 计算图片高度（使用rem单位）
      const cardWidthRem = isMobile ? ((window.innerWidth - 48) / 16) : 17.1875 // 移动端适配宽度，PC端275px
      const imageHeightRem = content.width && content.height
        ? (cardWidthRem * content.height) / content.width
        : 12.5 // 默认200px = 12.5rem

      // 添加内容到该列
      columnItems[shortestColumnIndex].push({
        ...content,
        calculatedHeight: imageHeightRem
      } as ContentItem & { calculatedHeight: number })

      // 更新列高度 (图片高度 + 用户信息高度 + 间距)
      columnHeights[shortestColumnIndex] += imageHeightRem + 1.625 + 0.75 // 26px + 12px in rem
    })

    return { columns: columnItems, columnCount: columns }
  }

  const { columns, columnCount } = getColumnsLayout()

  return (
    <div className="w-full">
      <InspirationSectionHeader
        title="Inspiration Feed"
        selectedFilter={selectedFilter}
        onFilterChange={handleFilterChange}
      />

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
              onClick={() => loadContents(selectedFilter, true)}
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
                    onClick={() => console.log('Content clicked:', content.content_id)}
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

export default InspirationFeed