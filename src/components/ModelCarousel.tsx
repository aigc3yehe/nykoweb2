import { useState } from 'react';
import styles from './ModelCarousel.module.css';
import leftArrow from '../assets/left.svg';
import rightArrow from '../assets/right.svg';
import emptyCoverIcon from "../assets/empty_cover.png";
import { useAtom, useSetAtom } from 'jotai';
import { fetchEditCarousel } from '../store/modelStore';
import { fetchWorkflowEditCarousel } from '../store/workflowStore';
import { showDialogAtom } from '../store/dialogStore';
import { showToastAtom } from "../store/imagesStore";
import delCarouselIcon from '../assets/del_carousel.svg';
import { isVideoUrl } from '../utils/tools';

interface ModelCarouselProps {
  images: string[];
  cover?: string;
  modelId?: number;
  workflowId?: number;
  showDeleteButton?: boolean;
  onImageChange?: (index: number) => void;
}

export default function ModelCarousel({ 
  images, 
  cover, 
  modelId, 
  workflowId, 
  showDeleteButton = false,
  onImageChange 
}: ModelCarouselProps) {
  // 合并封面图和轮播图
  const allImages = cover ? [cover, ...images] : images;
  const emptyCover = !cover || cover.trim() === '';

  // 当前显示的起始索引
  const [currentIndex, setCurrentIndex] = useState(0);
  const [processDeleteIndex, setProcessDeleteIndex] = useState<number | null>(null);

  // Atoms
  const [, editCarousel] = useAtom(fetchEditCarousel);
  const [, editWorkflowCarousel] = useAtom(fetchWorkflowEditCarousel);
  const showDialog = useSetAtom(showDialogAtom);
  const showToast = useSetAtom(showToastAtom);

  // 计算总页数
  const totalPages = Math.ceil(allImages.length / 2);

  // 获取当前显示的两张图片
  const currentImages = allImages.slice(currentIndex, currentIndex + 2);

  // 处理左右箭头点击
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      onImageChange?.(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < allImages.length - 2) {
      setCurrentIndex(currentIndex + 1);
      onImageChange?.(currentIndex + 1);
    }
  };

  // 处理分页点击
  const handlePageClick = (pageIndex: number) => {
    const newIndex = pageIndex * 2;
    if (newIndex < allImages.length) {
      setCurrentIndex(newIndex);
      onImageChange?.(newIndex);
    }
  };

  // 处理删除carousel图片
  const handleDeleteCarousel = (imageUrl: string, globalIndex: number) => {
    if (processDeleteIndex === globalIndex) return; // 如果正在处理删除操作，忽略重复点击

    showDialog({
      open: true,
      message: 'Are you sure you want to remove this image from the carousel?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: () => {
        setProcessDeleteIndex(globalIndex);

        // 根据类型调用对应的API
        const carouselPromise = modelId 
          ? editCarousel(modelId, imageUrl)
          : editWorkflowCarousel(workflowId!, imageUrl);

        carouselPromise
          .then(() => {
            showToast({
              message: 'Image removed from carousel successfully',
              severity: 'success'
            });
          })
          .catch(() => {
            showToast({
              message: 'Failed to remove image from carousel',
              severity: 'error'
            });
          })
          .finally(() => {
            setProcessDeleteIndex(null);
          });
      },
      onCancel: () => {
        // 取消操作，不需要做任何事
      },
      confirmButtonColor: '#FF3C3D',
      cancelButtonColor: '#6366F1'
    });
  };

  return (
    <div className={styles.carouselContainer}>
      <div className={styles.imagesContainer}>
        {currentImages.map((image, index) => (
          <div key={index} className={styles.imageWrapper}>
            <div className={styles.imageContainer}>
              {isVideoUrl(image) ? (
                <video 
                  src={image || emptyCoverIcon} 
                  className={styles.carouselImage}
                  controls={false}
                  muted
                  playsInline
                  preload="metadata"
                  style={{ objectFit: 'cover' }}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img 
                  src={image || emptyCoverIcon} 
                  alt={`Carousel ${currentIndex + index}`}
                  className={styles.carouselImage}
                />
              )}
              
              {/* 第一张图的删除按钮 */}
              {index === 0 && (
                <>
                  {showDeleteButton && currentIndex > 0 && !emptyCover && (
                    <div className={styles.deleteButtonContainer}>
                      {processDeleteIndex === currentIndex ? (
                        <div className={styles.processingIndicator}>
                          <div className={styles.typingIndicator}>
                            <span></span><span></span><span></span>
                          </div>
                        </div>
                      ) : (
                        <button
                          className={styles.deleteButton}
                          onClick={() => handleDeleteCarousel(currentImages[0], currentIndex)}
                          title="Remove from carousel"
                        >
                          <img src={delCarouselIcon} alt="Delete" className={styles.deleteIcon} />
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
              
              {/* 第二张图的删除按钮 */}
              {index === 1 && (
                <>
                  {showDeleteButton && currentIndex + 1 < allImages.length && (currentIndex + 1) > 0 && !emptyCover && (
                    <div className={styles.deleteButtonContainer}>
                      {processDeleteIndex === (currentIndex + 1) ? (
                        <div className={styles.processingIndicator}>
                          <div className={styles.typingIndicator}>
                            <span></span><span></span><span></span>
                          </div>
                        </div>
                      ) : (
                        <button
                          className={styles.deleteButton}
                          onClick={() => handleDeleteCarousel(currentImages[1], currentIndex + 1)}
                          title="Remove from carousel"
                        >
                          <img src={delCarouselIcon} alt="Delete" className={styles.deleteIcon} />
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 左右箭头 */}
      {currentIndex > 0 && (
        <button 
          className={`${styles.arrowButton} ${styles.leftArrow}`}
          onClick={handlePrev}
        >
          <img src={leftArrow} alt="Previous" />
        </button>
      )}
      
      {currentIndex < allImages.length - 2 && (
        <button 
          className={`${styles.arrowButton} ${styles.rightArrow}`}
          onClick={handleNext}
        >
          <img src={rightArrow} alt="Next" />
        </button>
      )}

      {/* 分页指示器 */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`${styles.paginationDot} ${
                Math.floor(currentIndex / 2) === i ? styles.active : ''
              }`}
              onClick={() => handlePageClick(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}