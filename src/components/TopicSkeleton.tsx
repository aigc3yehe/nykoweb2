import React from 'react';
import styles from './TopicSkeleton.module.css';

const TopicSkeleton: React.FC = () => {
  return (
    <div className={styles.topicSkeleton}>
      {/* 顶部骨架 */}
      <div className={styles.headerSkeleton}>
        <div className={styles.backButtonSkeleton}></div>
        <div className={styles.titleSkeleton}></div>
      </div>

      {/* AICC横滚骨架 */}
      <div className={styles.aiccSkeleton}>
        <div className={styles.sectionTitleSkeleton}></div>
        <div className={styles.aiccCardsSkeleton}>
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className={styles.aiccCardSkeleton}></div>
          ))}
        </div>
      </div>

      {/* Gallery骨架 */}
      <div className={styles.gallerySkeleton}>
        <div className={styles.sectionTitleSkeleton}></div>
        <div className={styles.galleryGridSkeleton}>
          {Array.from({ length: 12 }, (_, index) => (
            <div 
              key={index} 
              className={styles.galleryItemSkeleton}
              style={{ height: `${Math.random() * 8 + 12}rem` }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopicSkeleton; 