import React from 'react';
import styles from './TopicHeader.module.css';
import { TopicInfo } from '../store/topicStore';

interface TopicHeaderProps {
  topicInfo: TopicInfo | null;
}

const TopicHeader: React.FC<TopicHeaderProps> = ({ topicInfo }) => {
  // 暂时只显示空的占位区域，topicInfo为未来功能预留
  void topicInfo; // 避免未使用参数警告
  
  return (
    <div className={styles.topicHeaderStats}>
      {/* 统计数据区域 - 暂时留空的div */}
      <div className={styles.statsPlaceholder}>
        {/* 未来这里会显示统计数据 */}
      </div>
    </div>
  );
};

export default TopicHeader; 