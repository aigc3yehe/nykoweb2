import React, { useState, useRef } from 'react'
import BannerCard from './BannerCard'
import { cn } from '../../utils/cn'
import LifeIcon from '../../assets/mavae/life.svg'
import LifeIconDark from '../../assets/mavae/dark/life.svg'
import WorkflowsIcon from '../../assets/mavae/Workflows.svg'
import WorkflowsIconDark from '../../assets/mavae/dark/Workflows.svg'

const Banner: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [translateX, setTranslateX] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const banners = [
    {
      id: 1,
      title: "Participate in fun creations",
      description: "Use Agent Cases to expand any theme creation",
      buttonText: "Generate",
      icon: LifeIcon,
      iconDark: LifeIconDark,
      onClick: () => console.log('Generate clicked')
    },
    {
      id: 2,
      title: "Build Agent Cases",
      description: "Efficient tasks with custom AI workflows",
      buttonText: "Create",
      icon: WorkflowsIcon,
      iconDark: WorkflowsIconDark,
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
      <div className="hidden md:flex w-full h-[14.25rem] px-8 pb-8 gap-6"> {/* width: 1352px, height: 228px, padding: 32px, gap: 24px */}
        {banners.map((banner) => (
          <BannerCard key={banner.id} {...banner} />
        ))}
      </div>

      {/* 移动端 - 轮播显示 */}
      <div className="md:hidden flex flex-col gap-4 h-[8.25rem] pt-4 px-4 pb-6"> {/* width: 390px, height: 132px, padding: 16px 16px 24px 16px */}
        {/* 轮播容器 */}
        <div
          ref={containerRef}
          className="relative overflow-hidden h-[5.75rem]" // height: 92px
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

          {/* 分页指示器 - 叠加在轮播容器上方 */}
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-0.5">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "h-0.5 transition-all duration-300", // height: 2px
                  index === currentIndex
                    ? "w-[1.375rem] bg-link-default dark:bg-link-default-dark" // width: 22px
                    : "w-[1.375rem] bg-line-subtle dark:bg-line-subtle-dark" // width: 22px
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>


      </div>
    </div>
  )
}

export default Banner