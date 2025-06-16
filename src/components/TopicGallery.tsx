import React, { useState, useEffect, useRef } from 'react';
import styles from './TopicGallery.module.css';
import { ContentItem } from '../store/topicStore';
import ImageCard from './ImageCard';
import StatePrompt from './StatePrompt';
import { isVideoUrl } from '../utils/tools';

interface TopicGalleryProps {
  contentsList: ContentItem[];
  isLoading: boolean;
  hasMore: boolean;
  loadMoreTriggerRef: (node: HTMLDivElement | null) => void;
}

const TopicGallery: React.FC<TopicGalleryProps> = ({
  contentsList,
  isLoading,
  hasMore,
  loadMoreTriggerRef
}) => {
  // 减少重复日志，只在内容数量变化时记录
  const contentCount = contentsList.length;
  if (contentCount > 0) {
    console.log('[TopicGallery] 🖼️ Displaying', contentCount, 'images');
  }

  // 完全复用WorkflowDetail的瀑布流逻辑
  const [containerHeight, setContainerHeight] = useState(0);
  const [imagePositions, setImagePositions] = useState<{top: number, left: number, height: number}[]>([]);
  const [galleryContainerWidth, setGalleryContainerWidth] = useState(0);
  const galleryContainerRef = useRef<HTMLDivElement>(null);

  // 复用WorkflowDetail的ResizeObserver逻辑
  useEffect(() => {
    const element = galleryContainerRef.current;
    if (!element) return;

    const observer = new ResizeObserver(entries => {
      if (entries[0]) {
        setGalleryContainerWidth(entries[0].contentRect.width);
      }
    });

    observer.observe(element);
    setGalleryContainerWidth(element.clientWidth);

    return () => {
      observer.unobserve(element);
    };
  }, []);

  // 复用WorkflowDetail的瀑布流计算逻辑
  useEffect(() => {
    if (contentsList.length === 0) return;

    const cardWidth = 13.9375; // 223px
    const columnGap = 0.625; // 10px
    const columnCount = 4;
    const columnHeights = Array(columnCount).fill(0);
    const positions: {top: number, left: number, height: number}[] = [];

    contentsList.forEach((content) => {
      const minHeightColumn = columnHeights.indexOf(Math.min(...columnHeights));
      const contentWidth = content.width || 1;
      const contentHeight = content.height || 1;
      const aspectRatio = contentWidth && contentHeight ? contentHeight / contentWidth : 1;
      const imageHeight = cardWidth * aspectRatio;
      const left = minHeightColumn * (cardWidth + columnGap);
      const top = columnHeights[minHeightColumn];

      positions.push({ top, left, height: imageHeight });
      columnHeights[minHeightColumn] += imageHeight + columnGap;
    });

    const newContainerHeight = Math.max(...columnHeights);
    if (Math.abs(newContainerHeight - containerHeight) > 0.1) {
      setContainerHeight(newContainerHeight);
    }

    const newImagePositions = positions;
    if (JSON.stringify(newImagePositions) !== JSON.stringify(imagePositions)) {
      setImagePositions(newImagePositions);
    }
  }, [contentsList, galleryContainerWidth, containerHeight]);

  if (contentsList.length === 0 && !isLoading) {
    return (
      <div className={styles.gallerySection}>
        <h2 className={styles.galleryTitle}>Gallery</h2>
        <StatePrompt message="No images found for this topic" />
      </div>
    );
  }

  return (
    <div className={styles.gallerySection}>
      <h2 className={styles.galleryTitle}>Gallery</h2>

      <div
        className={styles.waterfallContainer}
        ref={galleryContainerRef}
        style={{ height: `${containerHeight}rem` }}
      >
        {contentsList.map((content, index) => {
          if (index >= imagePositions.length) return null;

          // 转换为ImageCard需要的格式
          const imageData = {
            id: content.id,
            url: content.url,
            width: content.width || 0,
            height: content.height || 0,
            creator: content.creator,
            users: {
              twitter: content.users?.twitter || null,
              address: null, // Topic页面暂不需要address信息
            },
            state: 1, // 假设都是完成状态
            like_count: 0,
            source: content.source,
            version: 1,
            task_id: `topic-${content.id}`,
            type: isVideoUrl(content.url) ? 'video' : 'image', // 动态判断类型
            public: 1,
          };

          return (
            <div
              key={content.id}
              className={styles.imageCardContainer}
              style={{
                position: 'absolute',
                top: `${imagePositions[index].top}rem`,
                left: `${imagePositions[index].left}rem`,
                width: '13.9375rem',
                height: `${imagePositions[index].height}rem`
              }}
            >
              <ImageCard
                image={imageData}
                onVisibilityChange={() => {}} // Topic页面不需要编辑功能
                showEditCover={false}
                showCarousel={false}
              />
            </div>
          );
        })}
      </div>

      {hasMore && (
        <div
          ref={loadMoreTriggerRef}
          className={styles.loadMoreTrigger}
          style={{
            height: '100px',
            width: '100%',
            margin: '20px 0',
            backgroundColor: 'transparent', // 用于调试，可以设为'red'来可视化
            display: 'block',
            position: 'static' // 确保在正常文档流中
          }}
        >
          {/* 添加调试文本 */}
          <div style={{ color: '#666', textAlign: 'center', padding: '20px', fontSize: '12px' }}>
            Load More Trigger (Debug)
          </div>
        </div>
      )}

      {isLoading && (
        <StatePrompt message="Loading images..." showIcon={false} />
      )}
    </div>
  );
};

export default TopicGallery;