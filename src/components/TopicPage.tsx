import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import styles from './TopicPage.module.css';
import { topicAtom, fetchTopicAICC, fetchTopicContents } from '../store/topicStore';
import TopicHeader from './TopicHeader';
import TopicAICCSection from './TopicAICCSection';
import TopicGallery from './TopicGallery';
import StatePrompt from './StatePrompt';
import backIcon from '../assets/back.svg';
import topicIcon from '../assets/topic.svg';

interface TopicPageProps {
  topicName: string;
}

const TopicPage: React.FC<TopicPageProps> = ({ topicName }) => {
  console.log('[TopicPage] Component rendered with topicName:', topicName);
  
  const [topicState] = useAtom(topicAtom);
  const fetchAICC = useSetAtom(fetchTopicAICC);
  const fetchContents = useSetAtom(fetchTopicContents);
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const observer = useRef<IntersectionObserver | null>(null);
  
  // 添加请求状态跟踪
  const [requestAttempts, setRequestAttempts] = useState(0);
  const [lastRequestTime, setLastRequestTime] = useState<number>(0);

  // 简化数据请求逻辑
  useEffect(() => {
    console.log('[TopicPage] useEffect triggered:', {
      topicName,
      currentTopic: topicState.currentTopic,
      hasAiccData: topicState.aiccList.length > 0,
      hasContentData: topicState.contentsList.length > 0
    });

    // 简单直接的数据请求逻辑
    if (topicName && topicName !== topicState.currentTopic) {
      console.log('[TopicPage] Starting data fetch for:', topicName);
      fetchAICC(topicName);
      fetchContents({ tag: topicName, reset: true });
      setRequestAttempts(prev => prev + 1);
      setLastRequestTime(Date.now());
    }
  }, [topicName, topicState.currentTopic]);

  // 调试AICC数据加载
  console.log('[TopicPage] Current State:', {
    topic: topicName,
    currentTopic: topicState.currentTopic,
    aiccCount: topicState.aiccList.length,
    contentsCount: topicState.contentsList.length,
    loading: {
      aicc: topicState.isLoading,
      contents: topicState.isLoadingContents
    },
    error: topicState.error,
    firstAicc: topicState.aiccList[0]?.name
  });

  const handleBack = () => {
    navigate(-1); // 返回上一页
  };

  // 分页加载逻辑（简化依赖）
  const loadMoreTriggerRef = useCallback((node: HTMLDivElement | null) => {
    console.log('[TopicPage] loadMoreTriggerRef called:', {
      node: !!node,
      isLoadingContents: topicState.isLoadingContents,
      contentsHasMore: topicState.contentsHasMore,
      topicName
    });

    if (topicState.isLoadingContents) {
      console.log('[TopicPage] Skipping observer setup - already loading');
      return;
    }

    if (observer.current) {
      console.log('[TopicPage] Disconnecting existing observer');
      observer.current.disconnect();
    }

    observer.current = new IntersectionObserver(entries => {
      console.log('[TopicPage] IntersectionObserver triggered:', {
        isIntersecting: entries[0].isIntersecting,
        hasMore: topicState.contentsHasMore,
        topicName,
        entry: entries[0]
      });
      
      if (entries[0].isIntersecting && topicState.contentsHasMore) {
        console.log('[TopicPage] 🚀 Triggering fetchContents for next page');
        fetchContents({ tag: topicName, reset: false });
      } else {
        console.log('[TopicPage] Not triggering load:', {
          isIntersecting: entries[0].isIntersecting,
          hasMore: topicState.contentsHasMore
        });
      }
    }, {
      root: null, // 监听视口滚动
      rootMargin: '500px', // 大幅提前触发点，当元素距离视口底部500px时就开始加载
      threshold: 0 // 元素一旦进入rootMargin范围就触发
    });

    if (node) {
      console.log('[TopicPage] Setting up observer on node');
      observer.current.observe(node);
    } else {
      console.log('[TopicPage] No node provided to observe');
    }
  }, [topicState.isLoadingContents, topicState.contentsHasMore, topicName]);

  // Gallery渲染调试信息
  console.log('[TopicPage] About to render, Gallery props:', {
    contentsListLength: topicState.contentsList.length,
    isLoading: topicState.isLoadingContents,
    hasMore: topicState.contentsHasMore,
    hasLoadMoreTriggerRef: !!loadMoreTriggerRef
  });

  // 手动重试函数
  const handleRetry = () => {
    console.log('[TopicPage] Manual retry triggered for:', topicName);
    fetchAICC(topicName);
    fetchContents({ tag: topicName, reset: true });
    setRequestAttempts(prev => prev + 1);
    setLastRequestTime(Date.now());
  };

  if (topicState.error) {
    return (
      <div className={styles.topicPage} ref={scrollContainerRef}>
        {/* 顶部导航栏 - 使用primedatas1样式 */}
        <div className={styles.topNav}>
          <button className={styles.backButton} onClick={handleBack}>
            <img src={backIcon} alt="Back" />
            <span>Back</span>
          </button>
        </div>

        {/* Tag标题区域 */}
        <div className={styles.tagTitleArea}>
          <img src={topicIcon} alt="Topic" className={styles.topicIcon} />
          <h1 className={styles.tagTitle}>{topicName}</h1>
        </div>

        {/* 媒体信息区域 - 暂时留空 */}
        <div className={styles.mediaInfoArea}></div>

        <StatePrompt message="No relevant topic data found." />
        <button onClick={handleRetry} style={{ margin: '1rem', padding: '0.5rem 1rem', background: '#6366F1', color: 'white', border: 'none', borderRadius: '0.25rem' }}>
          Retry Loading
        </button>
      </div>
    );
  }

  // 简化重试按钮逻辑：没有数据且不在加载中时显示
  const showRetryButton = !topicState.isLoading && 
                          !topicState.isLoadingContents && 
                          topicState.aiccList.length === 0 && 
                          topicState.contentsList.length === 0;

  return (
    <div className={styles.topicPage} ref={scrollContainerRef}>
      {/* 顶部导航栏 - 使用primedatas1样式 */}
      <div className={styles.topNav}>
        <button className={styles.backButton} onClick={handleBack}>
          <img src={backIcon} alt="Back" />
          <span>Back</span>
        </button>
      </div>

      {/* Tag标题区域 */}
      <div className={styles.tagTitleArea}>
        <img src={topicIcon} alt="Topic" className={styles.topicIcon} />
        <h1 className={styles.tagTitle}>{topicName}</h1>
      </div>

      {/* 媒体信息区域 - 暂时留空 */}
      <div className={styles.mediaInfoArea}></div>

      <div className={styles.topicContent}>
        {/* 统计数据区域 */}
        <TopicHeader topicInfo={topicState.topicInfo} />

        {/* AICC横滚区域 */}
        <TopicAICCSection aiccList={topicState.aiccList} />

        {/* Gallery区域 */}
        <TopicGallery 
          contentsList={topicState.contentsList}
          isLoading={topicState.isLoadingContents}
          hasMore={topicState.contentsHasMore}
          loadMoreTriggerRef={loadMoreTriggerRef}
        />

        {/* 调试信息和重试按钮 */}
        {showRetryButton && (
          <div style={{ textAlign: 'center', margin: '2rem 0' }}>
            <div style={{ color: '#9CA3AF', marginBottom: '1rem', fontSize: '0.875rem' }}>
              No data loaded. Request attempts: {requestAttempts}
              {lastRequestTime > 0 && (
                <div>Last attempt: {new Date(lastRequestTime).toLocaleTimeString()}</div>
              )}
            </div>
            <button 
              onClick={handleRetry} 
              style={{ 
                margin: '0.5rem', 
                padding: '0.75rem 1.5rem', 
                background: '#6366F1', 
                color: 'white', 
                border: 'none', 
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Retry Loading Data
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicPage; 