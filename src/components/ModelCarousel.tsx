import React, { useState } from 'react';
import styles from './ModelCarousel.module.css';
import leftArrow from '../assets/left.svg';
import rightArrow from '../assets/right.svg';

interface ModelCarouselProps {
  images: string[];
  coverImage?: string;
}

const ModelCarousel: React.FC<ModelCarouselProps> = ({ images, coverImage }) => {
  // 合并封面图和轮播图
  const allImages = coverImage 
    ? [coverImage, ...images] 
    : images.length > 0 
      ? images 
      : ['/placeholder-image.png']; // 如果没有图片，使用占位图
  
  // 当前显示的起始索引
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // 计算总页数
  const totalPages = Math.ceil(allImages.length / 2);
  
  // 处理前一页
  const handlePrevious = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 2 : Math.max(0, allImages.length - 2)));
  };
  
  // 处理下一页
  const handleNext = () => {
    setCurrentIndex(prev => (prev + 2 < allImages.length ? prev + 2 : 0));
  };
  
  // 获取当前显示的图片
  const currentImages = allImages.slice(currentIndex, currentIndex + 2);
  
  // 如果只有一张图片，添加一个空占位符
  if (currentImages.length === 1) {
    currentImages.push('');
  }
  
  return (
    <div className={styles.carouselContainer}>
      {/* 翻页按钮 */}
      {allImages.length > 2 && (
        <>
          <button 
            className={styles.arrowButton} 
            onClick={handlePrevious}
            style={{ left: '0.625rem', top: '8.75rem' }} // 10px, 140px
          >
            <img src={leftArrow} alt="Previous" width="40" height="40" />
          </button>
          
          <button 
            className={styles.arrowButton} 
            onClick={handleNext}
            style={{ right: '0.625rem', top: '8.75rem' }} // 10px, 140px
          >
            <img src={rightArrow} alt="Next" width="40" height="40" />
          </button>
        </>
      )}
      
      {/* 图片容器 */}
      <div className={styles.imagesContainer}>
        <div className={styles.imageWrapper}>
          {currentImages[0] && (
            <img 
              src={currentImages[0]} 
              alt="Model image 1" 
              className={styles.carouselImage} 
            />
          )}
        </div>
        
        <div className={styles.imageWrapper}>
          {currentImages[1] && (
            <img 
              src={currentImages[1]} 
              alt="Model image 2" 
              className={styles.carouselImage} 
            />
          )}
        </div>
      </div>
      
      {/* 页码指示器 */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              className={`${styles.paginationDot} ${Math.floor(currentIndex / 2) === index ? styles.activeDot : ''}`}
              onClick={() => setCurrentIndex(index * 2)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ModelCarousel; 