import React, { useEffect, useCallback, useRef } from 'react'
import Banner from '../components/home/Banner'
import PopularWorkflows from '../components/home/PopularWorkflows'
import TrendingStyles from '../components/home/TrendingStyles'
import InspirationFeed from '../components/home/InspirationFeed'
import { useAtom } from 'jotai'
import { imageListAtom, fetchImages } from '../store/imageStore'

const Home: React.FC = () => {
  const [imageState] = useAtom(imageListAtom)
  const [, fetchData] = useAtom(fetchImages)
  const isLoadingRef = useRef(false)

  // 监听滚动，当接近底部时加载更多
  const handleScroll = useCallback(() => {
    // 获取MainContent的滚动容器
    const mainContent = document.querySelector('main')
    if (!mainContent) return

    const scrollTop = mainContent.scrollTop
    const scrollHeight = mainContent.scrollHeight
    const clientHeight = mainContent.clientHeight

    // 当滚动到距离底部200px时触发加载
    if (scrollHeight - scrollTop <= clientHeight + 200 && 
        imageState.hasMore && 
        !imageState.isLoading &&
        !isLoadingRef.current) {
      
      isLoadingRef.current = true
      fetchData({ 
        reset: false, 
        state: 'success',
        view: true
      }).finally(() => {
        isLoadingRef.current = false
      })
    }
  }, [imageState.hasMore, imageState.isLoading, fetchData])

  useEffect(() => {
    // 监听MainContent的滚动
    const mainContent = document.querySelector('main')
    if (mainContent) {
      mainContent.addEventListener('scroll', handleScroll)
      return () => mainContent.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  return (
    <div className="w-full px-6 space-y-[1.875rem] pb-8"> {/* gap: 30px, 添加底部padding */}
      {/* Banner 区域 */}
      <Banner />
      
      {/* Popular Workflows */}
      <PopularWorkflows />
      
      {/* Trending Styles */}
      <TrendingStyles />
      
      {/* Inspiration Feed */}
      <InspirationFeed />
    </div>
  )
}

export default Home 