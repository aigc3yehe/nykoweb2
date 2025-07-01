import React, { useEffect, useRef, useState } from 'react'
import { useAtom } from 'jotai'
import { featureListAtom, fetchFeatures } from '../../store/featureStore'
import SectionHeader from './SectionHeader'
import WorkflowCard from './WorkflowCard'
import { SOURCE_TYPE } from '../../types/api.type'

const TrendingStyles: React.FC = () => {
  const [featureState] = useAtom(featureListAtom)
  const [, fetchData] = useAtom(fetchFeatures)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  // 获取数据
  useEffect(() => {
    if (featureState.features.length === 0 && !featureState.isLoading) {
      fetchData()
    }
  }, [])

  // 过滤出 models (styles)
  const styles = featureState.features.filter(item => item.source === SOURCE_TYPE.MODEL)

  // 检查滚动状态
  const checkScrollStatus = () => {
    if (!scrollContainerRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }

  // 滚动处理
  const scrollTo = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return
    const scrollAmount = 300
    const currentScroll = scrollContainerRef.current.scrollLeft
    const targetScroll = direction === 'left' 
      ? currentScroll - scrollAmount 
      : currentScroll + scrollAmount

    scrollContainerRef.current.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    })
  }

  useEffect(() => {
    checkScrollStatus()
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', checkScrollStatus)
      return () => container.removeEventListener('scroll', checkScrollStatus)
    }
  }, [styles])

  if (featureState.isLoading && styles.length === 0) {
    return (
      <div className="w-full">
        <SectionHeader title="Trending Styles" />
        <div className="h-[22.25rem] flex items-center justify-center">
          <span className="text-gray-500">Loading...</span>
        </div>
      </div>
    )
  }

  if (styles.length === 0) {
    return null
  }

  return (
    <div className="w-full">
      <SectionHeader
        title="Trending Styles"
        onPrevious={() => scrollTo('left')}
        onNext={() => scrollTo('right')}
        onViewAll={() => console.log('View all styles')}
        canGoPrevious={canScrollLeft}
        canGoNext={canScrollRight}
      />
      
      {/* 滚动容器 - 间距20px */}
      <div 
        ref={scrollContainerRef}
        className="flex gap-5 overflow-x-auto scrollbar-hide scroll-smooth"
      >
        {styles.map((item) => (
          <WorkflowCard
            key={item.id}
            item={item}
            variant="style"
            onClick={() => console.log('Style clicked:', item.id)}
            onUseClick={() => console.log('Use style:', item.id)}
          />
        ))}
      </div>
    </div>
  )
}

export default TrendingStyles 