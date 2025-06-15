import React, { useEffect } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import styles from './TopicCloud.module.css';
import { topicCloudAtom, fetchTopicCloud, TopicCloudItem } from '../store/topicCloudStore';

interface TopicTagProps {
  topic: TopicCloudItem;
  heightPercent: number;
}

const TopicTag: React.FC<TopicTagProps> = ({ topic, heightPercent }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // 跳转到topic页面
    navigate(`?topic=${encodeURIComponent(topic.tag)}`);
  };

  return (
    <div 
      className={styles.topicTag}
      style={{ height: `${heightPercent}%` }}
      onClick={handleClick}
    >
      <span className={styles.topicLabel}>{topic.tag}</span>
    </div>
  );
};

const TopicCloud: React.FC = () => {
  const [topicCloudState] = useAtom(topicCloudAtom);
  const fetchData = useSetAtom(fetchTopicCloud);

  // 页面加载时获取数据
  useEffect(() => {
    if (topicCloudState.topics.length === 0 && !topicCloudState.isLoading) {
      fetchData();
    }
  }, [fetchData, topicCloudState.topics.length, topicCloudState.isLoading]);

  // 计算高度分配百分比（减去间距）
  const calculateHeights = (topics: TopicCloudItem[], gapCount: number): number[] => {
    if (topics.length === 0) return [];
    
    // 总可用高度 = 100% - (间距数量 * 每个间距的百分比)
    // 每个2px间距在100%高度中的占比需要根据实际容器高度计算
    // 这里假设容器高度约为200px，那么2px约为1%
    const gapPercentage = 1; // 每个2px间距约占1%
    const totalGapPercentage = gapCount * gapPercentage;
    const availableHeight = 100 - totalGapPercentage;
    
    const totalValue = topics.reduce((sum, topic) => sum + topic.value, 0);
    if (totalValue === 0) {
      // 如果总值为0，平均分配可用高度
      return topics.map(() => availableHeight / topics.length);
    }
    
    return topics.map(topic => (topic.value / totalValue) * availableHeight);
  };

  // 渲染左列（topics 1-2）
  const renderLeftColumn = () => {
    const leftTopics = topicCloudState.topics.slice(0, 2);
    if (leftTopics.length === 0) return null;

    // 左列：2个元素，1个间距
    const heights = calculateHeights(leftTopics, 1);
    
    return (
      <div className={styles.leftColumn}>
        {leftTopics.map((topic, index) => (
          <TopicTag 
            key={topic.tag} 
            topic={topic} 
            heightPercent={heights[index]} 
          />
        ))}
      </div>
    );
  };

  // 渲染中列（topics 3-5）
  const renderMiddleColumn = () => {
    const middleTopics = topicCloudState.topics.slice(2, 5);
    if (middleTopics.length === 0) return null;

    // 中列：3个元素，2个间距
    const heights = calculateHeights(middleTopics, 2);
    
    return (
      <div className={styles.middleColumn}>
        {middleTopics.map((topic, index) => (
          <TopicTag 
            key={topic.tag} 
            topic={topic} 
            heightPercent={heights[index]} 
          />
        ))}
      </div>
    );
  };

  // 渲染右列（topics 6-10）
  const renderRightColumn = () => {
    const topRightTopics = topicCloudState.topics.slice(5, 8); // 6-8
    const bottomRightTopics = topicCloudState.topics.slice(8, 10); // 9-10
    
    if (topRightTopics.length === 0 && bottomRightTopics.length === 0) return null;

    // 右列上方：3个元素，2个间距
    const topHeights = calculateHeights(topRightTopics, 2);
    // 右列下方：2个元素，1个间距
    const bottomHeights = calculateHeights(bottomRightTopics, 1);
    
    return (
      <div className={styles.rightColumn}>
        {/* 上方80%区域 */}
        <div className={styles.rightTopSection}>
          {topRightTopics.map((topic, index) => (
            <TopicTag 
              key={topic.tag} 
              topic={topic} 
              heightPercent={topHeights[index]} 
            />
          ))}
        </div>
        
        {/* 下方20%区域 */}
        <div className={styles.rightBottomSection}>
          {bottomRightTopics.map((topic, index) => (
            <TopicTag 
              key={topic.tag} 
              topic={topic} 
              heightPercent={bottomHeights[index]} 
            />
          ))}
        </div>
      </div>
    );
  };

  if (topicCloudState.isLoading) {
    return (
      <div className={styles.topicCloudContainer}>
        <div className={styles.loadingState}>
          <span>Loading Topic Cloud...</span>
        </div>
      </div>
    );
  }

  if (topicCloudState.error) {
    return (
      <div className={styles.topicCloudContainer}>
        <div className={styles.errorState}>
          <span>Failed to load topics</span>
        </div>
      </div>
    );
  }

  if (topicCloudState.topics.length === 0) {
    return (
      <div className={styles.topicCloudContainer}>
        <div className={styles.emptyState}>
          <span>No topics available</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.topicCloudContainer}>
      <div className={styles.topicCloudGrid}>
        {renderLeftColumn()}
        {renderMiddleColumn()}
        {renderRightColumn()}
      </div>
    </div>
  );
};

export default TopicCloud; 