import React, { useState, useRef, useEffect } from 'react'
import BannerCard from './BannerCard'
import { cn } from '../../utils/cn'

const Banner: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [translateX, setTranslateX] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const banners = [
    {
      id: 1,
      title: "Bring your ideas to life",
      description: "Generate Creations through conversational canvas",
      buttonText: "Generate",
      backgroundImage: "/src/assets/web2/banner_1.png",
      onClick: () => console.log('Generate clicked')
    },
    {
      id: 2,
      title: "Build Custom Workflows",
      description: "Efficient tasks with custom AI workflows",
      buttonText: "Create",
      backgroundImage: "/src/assets/web2/banner_2.png",
      onClick: () => console.log('Create clicked')
    }
  ]

  // 处理触摸/鼠标事件
  const handleStart = (clientX: number) => {
    setIsDragging(true)
    setStartX(clientX)
  }

  const handleMove = (clientX: number) => {
    if (!isDragging) return
    const diff = clientX - startX
    setTranslateX(diff)
  }

  const handleEnd = () => {
    if (!isDragging) return
    setIsDragging(false)
    
    // 判断滑动方向和距离
    if (Math.abs(translateX) > 50) {
      if (translateX > 0 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1)
      } else if (translateX < 0 && currentIndex < banners.length - 1) {
        setCurrentIndex(currentIndex + 1)
      }
    }
    
    setTranslateX(0)
  }

  // 触摸事件处理
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX)
  }

  const handleTouchEnd = () => {
    handleEnd()
  }

  // 鼠标事件处理（用于开发测试）
  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX)
  }

  const handleMouseUp = () => {
    handleEnd()
  }

  const handleMouseLeave = () => {
    if (isDragging) {
      handleEnd()
    }
  }

  return (
    <div className="w-full">
      {/* 桌面端 - 并排显示 */}
      <div className="hidden md:flex gap-[0.875rem] h-[12.4375rem]"> {/* gap: 14px, height: 199px */}
        {banners.map((banner) => (
          <BannerCard key={banner.id} {...banner} />
        ))}
      </div>

      {/* 移动端 - 轮播显示 */}
      <div className="md:hidden flex flex-col gap-[0.875rem] h-[13.0625rem]"> {/* height: 209px, gap: 14px */}
        {/* 轮播容器 */}
        <div 
          ref={containerRef}
          className="relative overflow-hidden h-[11.9375rem]" // height: 191px
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          <div 
            className="flex transition-transform duration-300 ease-out"
            style={{
              transform: `translateX(calc(${-currentIndex * 100}% + ${translateX}px))`,
              transition: isDragging ? 'none' : 'transform 300ms ease-out'
            }}
          >
            {banners.map((banner) => (
              <div key={banner.id} className="w-full flex-shrink-0">
                <BannerCard {...banner} isMobile />
              </div>
            ))}
          </div>
        </div>

        {/* 分页指示器 */}
        <div className="flex justify-center gap-[0.625rem]"> {/* gap: 10px */}
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "h-1 transition-all duration-300",
                index === currentIndex 
                  ? "w-10 bg-design-main-blue dark:bg-design-dark-main-blue" 
                  : "w-10 bg-design-line-light-gray dark:bg-design-dark-line-light-gray"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Banner 