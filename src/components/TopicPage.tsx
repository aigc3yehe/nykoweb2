import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import styles from './TopicPage.module.css';
import { topicAtom, fetchTopicAICC, fetchTopicContents, fetchProjectInfo, switchToTopic } from '../store/topicStore';
import TopicHeaderStats from './TopicHeaderStats';
import TopicAICCSection from './TopicAICCSection';
import TopicGallery from './TopicGallery';
import ProjectInfo from './ProjectInfo';
import StatePrompt from './StatePrompt';
import backIcon from '../assets/back.svg';
import topicIcon from '../assets/topic.svg';

interface TopicPageProps {
  topicName: string;
}

const TopicPage: React.FC<TopicPageProps> = ({ topicName }) => {
  const [topicState] = useAtom(topicAtom);
  const fetchAICC = useSetAtom(fetchTopicAICC);
  const fetchContents = useSetAtom(fetchTopicContents);
  const fetchProject = useSetAtom(fetchProjectInfo);
  const switchTopic = useSetAtom(switchToTopic);
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const observer = useRef<IntersectionObserver | null>(null);
  
  // 添加请求状态跟踪
  const [requestAttempts, setRequestAttempts] = useState(0);
  const [lastRequestTime, setLastRequestTime] = useState<number>(0);

  // ✅ 修复：使用ref跟踪组件是否已卸载，避免内存泄漏
  const isMountedRef = useRef(true);
  const lastTopicRef = useRef<string>('');

  // ✅ 修复：组件卸载时清理
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      console.log('[TopicPage] 🧹 Component unmounting, cleaning up...');
    };
  }, []);

  // ✅ 修复：优化数据请求逻辑，确保首次加载一定触发
  useEffect(() => {
    console.log('[TopicPage] 🔄 Effect triggered for topic:', topicName);

    if (!topicName) {
      console.log('[TopicPage] No topicName provided, skipping fetch');
      return;
    }

    // 🚀 立即切换topic状态，清理旧数据
    if (lastTopicRef.current !== topicName) {
      console.log('[TopicPage] 🔄 Topic change detected, switching immediately:', {
        from: lastTopicRef.current,
        to: topicName
    });

      // 立即切换并清理数据，避免显示错误内容
      switchTopic(topicName);
      lastTopicRef.current = topicName;
      
      // ✅ 修复：首次进入新topic时，立即发起API请求，不依赖缓存检查
      console.log('[TopicPage] 🚀 New topic detected, starting immediate data fetch');
      
      // 并发发起所有API请求
      fetchAICC(topicName).catch(error => {
        console.error('[TopicPage] ❌ AICC fetch failed:', error);
      });
      
      fetchContents({ tag: topicName, reset: true }).catch(error => {
        console.error('[TopicPage] ❌ Contents fetch failed:', error);
      });
      
      fetchProject(topicName).catch(error => {
        console.error('[TopicPage] ❌ Project info fetch failed:', error);
      });

      setRequestAttempts(prev => prev + 1);
      setLastRequestTime(Date.now());
      
      return; // 新topic直接返回，不需要进一步检查
    }
    
    // 如果是相同topic，检查是否需要重新加载（比如手动刷新）
    const hasNoData = topicState.aiccList.length === 0 && 
                      topicState.contentsList.length === 0 && 
                      !topicState.isLoading && 
                      !topicState.isLoadingContents;
    
    if (hasNoData && requestAttempts === 0) {
      console.log('[TopicPage] 🔄 Same topic but no data, triggering initial load');
      
      fetchAICC(topicName).catch(error => {
        console.error('[TopicPage] ❌ AICC fetch failed:', error);
      });
      
      fetchContents({ tag: topicName, reset: true }).catch(error => {
        console.error('[TopicPage] ❌ Contents fetch failed:', error);
      });
      
      fetchProject(topicName).catch(error => {
        console.error('[TopicPage] ❌ Project info fetch failed:', error);
      });

      setRequestAttempts(prev => prev + 1);
      setLastRequestTime(Date.now());
    }
    
  }, [topicName, fetchAICC, fetchContents, fetchProject, switchTopic]); // ✅ 修复：移除循环依赖，只保留基本依赖

  // 简化状态日志
  if (topicState.aiccList.length > 0) {
    console.log('[TopicPage] ✅ AICC Data loaded:', topicState.aiccList.length, 'items');
  }

  const handleBack = () => {
    navigate(-1); // 返回上一页
  };

  // 分页加载逻辑（优化依赖）
  const loadMoreTriggerRef = useCallback((node: HTMLDivElement | null) => {
    if (topicState.isLoadingContents) return;

    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && topicState.contentsHasMore) {
        console.log('[TopicPage] 📄 Loading more contents...');
        fetchContents({ tag: topicName, reset: false });
      }
    }, {
      root: null,
      rootMargin: '500px',
      threshold: 0
    });

    if (node) observer.current.observe(node);
  }, [topicState.isLoadingContents, topicState.contentsHasMore, topicName, fetchContents]);

  // Gallery状态简要日志
  if (topicState.contentsList.length > 0) {
    console.log('[TopicPage] Gallery ready:', topicState.contentsList.length, 'contents');
  }

  // 手动重试函数
  const handleRetry = () => {
    console.log('[TopicPage] 🔄 Manual retry triggered for:', topicName);
    
    // 先切换topic状态，清理数据
    switchTopic(topicName);
    
    // 然后重新加载
    setTimeout(() => {
      fetchAICC(topicName).catch(console.error);
      fetchContents({ tag: topicName, reset: true }).catch(console.error);
      fetchProject(topicName).catch(console.error);
    }, 100);

    setRequestAttempts(prev => prev + 1);
    setLastRequestTime(Date.now());
  };

  // 🧪 临时测试函数：直接测试AICC API
  const testAICCAPI = async () => {
    console.log('[TopicPage] 🧪 Testing AICC API directly for:', topicName);
    try {
      const url = `/studio-api/infofi/aicc?tag=${encodeURIComponent(topicName)}`;
      console.log('[TopicPage] 🧪 Direct API call to:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_BEARER_TOKEN}`,
        }
      });
      
      console.log('[TopicPage] 🧪 Direct API response:', response.status, response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('[TopicPage] 🧪 Direct API data:', data);
      } else {
        const errorText = await response.text();
        console.error('[TopicPage] 🧪 Direct API error:', errorText);
      }
    } catch (error) {
      console.error('[TopicPage] 🧪 Direct API exception:', error);
    }
  };

  // ✅ 修复：添加topic名称一致性检查
  const isCurrentTopic = topicState.currentTopic === topicName;
  const showTopicMismatch = topicState.currentTopic && !isCurrentTopic;

  if (showTopicMismatch) {
    console.warn('[TopicPage] ⚠️ Topic mismatch detected:', {
      pageTopicName: topicName,
      stateCurrentTopic: topicState.currentTopic
    });
  }

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

        {/* Project Info区域 */}
        <ProjectInfo 
          projectInfo={isCurrentTopic ? topicState.projectInfo : null}
          isLoading={topicState.isLoadingProjectInfo}
        />

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
        {showTopicMismatch && (
          <div style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
            ⚠️ State mismatch: {topicState.currentTopic} ≠ {topicName}
          </div>
        )}
      </div>

      {/* Project Info区域 - 替换原来的媒体信息区域 */}
      <ProjectInfo 
        projectInfo={isCurrentTopic ? topicState.projectInfo : null}
        isLoading={topicState.isLoadingProjectInfo}
      />

      <div className={styles.topicContent}>
        {/* 统计数据区域 */}
        <TopicHeaderStats topicName={topicName} />

        {/* AICC横滚区域 */}
        <TopicAICCSection aiccList={isCurrentTopic ? topicState.aiccList : []} />

        {/* Gallery区域 */}
        <TopicGallery 
          contentsList={isCurrentTopic ? topicState.contentsList : []}
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
              {showTopicMismatch && (
                <div style={{ color: '#EF4444', marginTop: '0.5rem' }}>
                  Topic state mismatch detected
                </div>
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
            <button 
              onClick={testAICCAPI} 
              style={{ 
                margin: '0.5rem', 
                padding: '0.75rem 1.5rem', 
                background: '#10B981', 
                color: 'white', 
                border: 'none', 
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              🧪 Test AICC API
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default TopicPage; 