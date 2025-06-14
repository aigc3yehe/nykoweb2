import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import styles from './TopicPage.module.css';
import { topicAtom, fetchTopicAICC, fetchTopicContents, fetchProjectInfo } from '../store/topicStore';
import TopicHeader from './TopicHeader';
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
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const observer = useRef<IntersectionObserver | null>(null);
  
  // 添加请求状态跟踪
  const [requestAttempts, setRequestAttempts] = useState(0);
  const [lastRequestTime, setLastRequestTime] = useState<number>(0);

  // 添加ref来跟踪当前加载的topic，避免重复请求
  const currentLoadingTopic = useRef<string>('');

  // 简化数据请求逻辑 - 只依赖topicName，避免状态竞争
  useEffect(() => {
    console.log('[TopicPage] 🔄 Effect triggered for topic:', topicName, 'AICC count:', topicState.aiccList.length);

    // 避免重复加载同一个topic
    if (!topicName || topicName === currentLoadingTopic.current) {
      console.log('[TopicPage] Skipping fetch - same topic or empty topicName');
      return;
    }

    // 检查缓存是否存在且有效
    const cache = topicState.cacheMap.get(topicName);
    const now = Date.now();
    const CACHE_DURATION = 5 * 60 * 1000; // 5分钟
    if (cache && now - cache.timestamp < CACHE_DURATION && cache.aiccList.length > 0) {
      console.log('[TopicPage] Using cache for topic:', topicName);
      return;
    }

    console.log('[TopicPage] Starting data fetch for:', topicName);
    currentLoadingTopic.current = topicName;
    
    // 并行调用所有fetch函数
    console.log('[TopicPage] 🚀 Calling all fetch functions for:', topicName);
    
    const aiccPromise = fetchAICC(topicName);
    const contentsPromise = fetchContents({ tag: topicName, reset: true });
    const projectPromise = fetchProject(topicName);
    
    console.log('[TopicPage] 📡 Individual promises created:', {
      aicc: !!aiccPromise,
      contents: !!contentsPromise,
      project: !!projectPromise
    });
    
    Promise.all([aiccPromise, contentsPromise, projectPromise])
      .then((results) => {
        console.log('[TopicPage] ✅ All fetch functions completed for:', topicName);
        console.log('[TopicPage] 📊 Promise results:', {
          aiccResult: !!results[0],
          contentsResult: !!results[1], 
          projectResult: !!results[2]
        });
      })
      .catch((error) => {
        console.error('[TopicPage] ❌ Promise.all failed for topic:', topicName);
        console.error('[TopicPage] ❌ Error details:', error);
        
        // 检查单个Promise的状态
        aiccPromise.catch(e => console.error('[TopicPage] ❌ AICC Promise failed:', e));
        contentsPromise.catch(e => console.error('[TopicPage] ❌ Contents Promise failed:', e));
        projectPromise.catch(e => console.error('[TopicPage] ❌ Project Promise failed:', e));
      });

    setRequestAttempts(prev => prev + 1);
    setLastRequestTime(Date.now());
  }, [topicName]); // 只依赖topicName，移除currentTopic依赖

  // 简化状态日志
  if (topicState.aiccList.length > 0) {
    console.log('[TopicPage] ✅ AICC Data loaded:', topicState.aiccList.length, 'items');
  }

  const handleBack = () => {
    navigate(-1); // 返回上一页
  };

  // 分页加载逻辑（简化依赖）
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
  }, [topicState.isLoadingContents, topicState.contentsHasMore, topicName]);

  // Gallery状态简要日志
  if (topicState.contentsList.length > 0) {
    console.log('[TopicPage] Gallery ready:', topicState.contentsList.length, 'contents');
  }

  // 手动重试函数
  const handleRetry = () => {
    console.log('[TopicPage] 🔄 Manual retry triggered for:', topicName);
    currentLoadingTopic.current = ''; // 重置加载标记，允许重新加载
    
    // 并行调用所有fetch函数
    const retryAiccPromise = fetchAICC(topicName);
    const retryContentsPromise = fetchContents({ tag: topicName, reset: true });
    const retryProjectPromise = fetchProject(topicName);
    
    Promise.all([retryAiccPromise, retryContentsPromise, retryProjectPromise])
      .then((results) => {
        console.log('[TopicPage] ✅ Retry completed for:', topicName);
        console.log('[TopicPage] 📊 Retry results:', {
          aiccResult: !!results[0],
          contentsResult: !!results[1], 
          projectResult: !!results[2]
        });
      })
      .catch((error) => {
        console.error('[TopicPage] ❌ Retry failed for topic:', topicName, error);
        retryAiccPromise.catch(e => console.error('[TopicPage] ❌ Retry AICC failed:', e));
        retryContentsPromise.catch(e => console.error('[TopicPage] ❌ Retry Contents failed:', e));
        retryProjectPromise.catch(e => console.error('[TopicPage] ❌ Retry Project failed:', e));
      });

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
          projectInfo={topicState.projectInfo}
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
      </div>

      {/* Project Info区域 - 替换原来的媒体信息区域 */}
      <ProjectInfo 
        projectInfo={topicState.projectInfo}
        isLoading={topicState.isLoadingProjectInfo}
      />

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