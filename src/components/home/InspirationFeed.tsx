import React, { useEffect, useState, useCallback } from 'react'
import { useAtom } from 'jotai'
import { imageListAtom, fetchImages, resetImageList } from '../../store/imageStore'
import InspirationSectionHeader from './InspirationSectionHeader'
import InspirationImageCard from './InspirationImageCard'

const InspirationFeed: React.FC = () => {
  const [imageState] = useAtom(imageListAtom)
  const [, fetchData] = useAtom(fetchImages)
  const [, resetImages] = useAtom(resetImageList)
  const [selectedFilter, setSelectedFilter] = useState('trending')

  // 过滤选项
  const filterOptions = [
    { id: 'trending', label: 'Trending' },
    { id: 'recent', label: 'Recent' },
    { id: 'popular', label: 'Popular' }
  ]

  // 获取数据
  const loadImages = useCallback(async (reset = false) => {
    if (reset) {
      resetImages()
    }
    
    const order = selectedFilter === 'recent' ? 'created_at' : 
                 selectedFilter === 'popular' ? 'like_count' : 'updated_at'
    
    await fetchData({ 
      reset, 
      state: 'success',
      view: true,
      order 
    })
  }, [selectedFilter, fetchData, resetImages])

  // 初始加载和筛选变化时重新加载
  useEffect(() => {
    loadImages(true)
  }, [selectedFilter])

  // 瀑布流布局计算 - 响应式列数
  const getColumnsLayout = () => {
    // 根据屏幕宽度决定列数
    const isMobile = window.innerWidth < 768
    const columns = isMobile ? 1 : 4 // 移动端1列，PC端4列
    
    const columnHeights = new Array(columns).fill(0)
    const columnItems: any[][] = new Array(columns).fill(null).map(() => [])

    imageState.images.forEach((image) => {
      // 找到最短的列
      const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights))
      
      // 计算图片高度（使用rem单位）
      const cardWidthRem = isMobile ? ((window.innerWidth - 48) / 16) : 17.1875 // 移动端适配宽度，PC端275px
      const imageHeightRem = image.width && image.height 
        ? (cardWidthRem * image.height) / image.width
        : 12.5 // 默认200px = 12.5rem
      
      // 添加图片到该列
      columnItems[shortestColumnIndex].push({
        ...image,
        calculatedHeight: imageHeightRem
      })
      
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
        filterOptions={filterOptions}
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
      />
      
      {/* 瀑布流内容 */}
      {imageState.isLoading && imageState.images.length === 0 ? (
        <div className="h-64 flex items-center justify-center">
          <span className="text-gray-500">Loading...</span>
        </div>
      ) : imageState.images.length === 0 ? (
        <div className="h-64 flex items-center justify-center">
          <span className="text-gray-500">No images found</span>
        </div>
      ) : (
        <>
          <div className={`grid gap-3 ${columnCount === 1 ? 'grid-cols-1' : 'grid-cols-4'}`}>
            {columns.map((columnImages, columnIndex) => (
              <div key={columnIndex} className="flex flex-col gap-3">
                {columnImages.map((image: any) => (
                  <InspirationImageCard
                    key={image.id}
                    image={image}
                    imageHeightRem={image.calculatedHeight}
                    onClick={() => console.log('Image clicked:', image.id)}
                    onRecreateClick={() => console.log('Recreate clicked:', image.id)}
                  />
                ))}
              </div>
            ))}
          </div>
          
          {/* 加载更多指示器 */}
          {imageState.isLoading && imageState.images.length > 0 && (
            <div className="py-8 flex items-center justify-center">
              <span className="text-gray-500">Loading more...</span>
            </div>
          )}
          
          {/* 没有更多数据提示 */}
          {!imageState.hasMore && imageState.images.length > 0 && (
            <div className="py-8 flex items-center justify-center">
              <span className="text-gray-400">No more images</span>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default InspirationFeed 