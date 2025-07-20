import React from 'react'
import { cn } from '../../utils/cn'

interface BannerCardProps {
  title: string
  description: string
  buttonText: string
  backgroundImage: string
  onClick?: () => void
  isMobile?: boolean
}

const BannerCard: React.FC<BannerCardProps> = ({
  title,
  description,
  buttonText,
  backgroundImage,
  onClick,
  isMobile = false
}) => {
  return (
    <div 
      className={cn(
        "relative rounded-xl overflow-hidden",
        // 桌面端样式
        !isMobile && "w-[34.75rem] h-[12.4375rem] p-10", // width: 556px, height: 199px, padding: 40px
        // 移动端样式
        isMobile && "w-full h-[11.9375rem] p-6" // height: 191px, padding: 24px
      )}
    >
      {/* 背景图片 */}
      <img
        src={backgroundImage}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        aria-hidden="true"
      />
      
      {/* 内容区域 */}
      <div className={cn(
        "relative z-10 flex flex-col gap-[0.625rem]", // gap: 10px
        !isMobile && "w-[29.75rem] h-[7.4375rem]", // desktop: width: 476px, height: 119px
        isMobile && "w-full h-full"
      )}>
        {/* 标题 */}
        <h2 className={cn(
          "font-lexend font-semibold leading-[120%] text-white",
          !isMobile && "text-[2rem]", // desktop: 32px
          isMobile && "text-2xl" // mobile: 24px
        )}>
          {title}
        </h2>
        
        {/* 描述 padding bottom 8px*/}
        <p className="font-lexend font-normal text-sm leading-[120%] text-white/80 pb-2">
          {description}
        </p>
        
        {/* 按钮 */}
        <button
          onClick={onClick}
          className={cn(
            "w-fit h-9 px-6 py-1.5 rounded-md border border-white bg-transparent hover:bg-white/10 transition-colors",
            isMobile && "mt-auto" // 移动端按钮贴底
          )}
        >
          <span className="font-lexend font-medium text-base leading-6 text-white">
            {buttonText}
          </span>
        </button>
      </div>
    </div>
  )
}

export default BannerCard 