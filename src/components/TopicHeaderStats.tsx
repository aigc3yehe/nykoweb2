import React, { useEffect } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import styles from './TopicHeaderStats.module.css';
import StatsCard from './StatsCard';
import { topicStatsAtom, fetchTopicStats } from '../store/topicStatsStore';

interface TopicHeaderStatsProps {
  topicName: string;
}

const TopicHeaderStats: React.FC<TopicHeaderStatsProps> = ({ topicName }) => {
  const [statsState] = useAtom(topicStatsAtom);
  const fetchStats = useSetAtom(fetchTopicStats);

  // 当topic变化时获取统计数据
  useEffect(() => {
    if (topicName && topicName !== statsState.currentTopic) {
      console.log('[TopicHeaderStats] Fetching stats for topic:', topicName);
      fetchStats(topicName);
    }
  }, [topicName, statsState.currentTopic, fetchStats]);

  // 如果有错误或没有数据，不显示组件
  if (statsState.error || (!statsState.isLoading && !statsState.statsData)) {
    return null;
  }

  // 检查是否有任何有效数据
  const hasValidData = statsState.statsData && (
    statsState.statsData.mindshare.current > 0 ||
    statsState.statsData.creators.current > 0 ||
    statsState.statsData.posts.current > 0 ||
    statsState.statsData.mindshare.history.length > 0 ||
    statsState.statsData.creators.history.length > 0 ||
    statsState.statsData.posts.history.length > 0
  );

  // 如果没有有效数据，不显示组件
  if (!statsState.isLoading && !hasValidData) {
    return null;
  }

  return (
    <div className={styles.statsContainer}>
      <StatsCard
        title="Mindshare"
        current={statsState.statsData?.mindshare.current || 0}
        change24h={statsState.statsData?.mindshare.change24h || 0}
        history={statsState.statsData?.mindshare.history || []}
        isLoading={statsState.isLoading}
        type="mindshare"
      />
      
      <StatsCard
        title="Creators"
        current={statsState.statsData?.creators.current || 0}
        change24h={statsState.statsData?.creators.change24h || 0}
        history={statsState.statsData?.creators.history || []}
        isLoading={statsState.isLoading}
        type="creators"
      />
      
      <StatsCard
        title="Posts"
        current={statsState.statsData?.posts.current || 0}
        change24h={statsState.statsData?.posts.change24h || 0}
        history={statsState.statsData?.posts.history || []}
        isLoading={statsState.isLoading}
        type="posts"
      />
    </div>
  );
};

export default TopicHeaderStats; 