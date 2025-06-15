# Topic页面开发完整方案
> 开发日期：2024年12月10日  
> 功能：用户可以从models或workflow上的hashtag点击进入topic页面

## 需求概述

### 功能要点
- 用户从models或workflow的hashtag（class="_tagsContainer_"）点击进入topic页面
- 概念上hashtag、tag和topic是一回事
- topic页面展示所有跟这个topic/tag相关的aicc和aicc生成的image
- 路由：`/?topic=topicname`
- 页面布局和现在的primedata页面非常类似

### API信息
- **基础URL**: `/studio-api/` (通过vite.config.ts代理到 `http://170.106.196.194:5576/`)
- **Swagger文档**: `http://170.106.196.194:5576/api`
- **认证方式**: Bearer Token（使用现有环境变量）
- **环境变量名**: `VITE_BEARER_TOKEN`

## 1. 路由和导航实现

### 1.1 URL参数处理规则
```typescript
// URL编码规则
const encodeTopicName = (topic: string): string => {
  return encodeURIComponent(topic.trim().toLowerCase());
};

const decodeTopicName = (encodedTopic: string): string => {
  return decodeURIComponent(encodedTopic);
};

// 示例：
// "AI Art" -> "ai%20art"
// "图像生成" -> "%E5%9B%BE%E5%83%8F%E7%94%9F%E6%88%90"
```

### 1.2 路由处理
修改 `src/components/MainLayout.tsx`：
```typescript
// 在现有路由中添加topic路由处理
<Route path="*" element={
  <div className={styles.contentContainer}>
    <div className={styles.contentSection}>
      <TokenMarquee />
      {/* 根据URL参数决定显示TopicPage还是ContentDisplay */}
      <TopicPageRouter />
    </div>
    <div className={styles.chatSection}>
      <ChatWindow />
    </div>
  </div>
} />
```

### 1.3 hashtag点击事件
修改 `src/components/ContentHeader.tsx` 中的 `.tag` 元素：
```typescript
// 在ContentHeader.tsx中为tags添加点击事件
<span 
  key={index} 
  className={styles.tag}
  onClick={() => handleTagClick(tag)}
  style={{ cursor: 'pointer' }}
>
  {tag}
</span>

const handleTagClick = (tag: string) => {
  navigate(`/?topic=${encodeTopicName(tag)}`);
};
```

## 2. 环境变量配置

使用现有的环境变量：
```env
# 使用现有的Bearer Token（无需新增）
VITE_BEARER_TOKEN=现有的认证token值
```

## 3. 状态管理设计

### 3.1 创建 topicStore.ts
```typescript
// src/store/topicStore.ts
import { atom } from 'jotai';

export interface TopicInfo {
  tag: string;
  // 统计数据（暂时预留）
  midshare?: number;
  followers?: number;
  creators?: number;
  posts?: number;
}

export interface AICCItem {
  id: number;
  name: string;
  cover: string;
  source: 'model' | 'workflow';
  created_at: string;
  tags: string[];
}

export interface ContentItem {
  id: number;
  source_id: number;
  source: 'model' | 'workflow';
  url: string;
  creator: string;
  width: number;
  height: number;
  users: {
    twitter: {
      username: string;
      avatar: string;
    };
  };
  type: 'image' | 'video' | 'text' | 'audio';
}

export interface TopicState {
  currentTopic: string;
  topicInfo: TopicInfo | null;
  aiccList: AICCItem[];
  contentsList: ContentItem[];
  contentsPage: number;
  contentsPageSize: number;
  contentsHasMore: boolean;
  isLoading: boolean;
  isLoadingContents: boolean;
  error: string | null;
  cacheMap: Map<string, TopicCache>; // 缓存机制
}

interface TopicCache {
  topicInfo: TopicInfo | null;
  aiccList: AICCItem[];
  contentsList: ContentItem[];
  contentsPage: number;
  contentsHasMore: boolean;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

const initialState: TopicState = {
  currentTopic: '',
  topicInfo: null,
  aiccList: [],
  contentsList: [],
  contentsPage: 1,
  contentsPageSize: 30, // 与WorkflowDetail保持一致
  contentsHasMore: true,
  isLoading: false,
  isLoadingContents: false,
  error: null,
  cacheMap: new Map(),
};

export const topicAtom = atom<TopicState>(initialState);

// URL编码工具函数
const encodeTopicName = (topic: string): string => {
  return encodeURIComponent(topic.trim().toLowerCase());
};

const decodeTopicName = (encodedTopic: string): string => {
  return decodeURIComponent(encodedTopic);
};
```

### 3.2 API集成函数
```typescript
// 获取topic相关的AICC
export const fetchTopicAICC = atom(
  null,
  async (get, set, tag: string) => {
    const state = get(topicAtom);
    
    // 检查缓存
    const cache = state.cacheMap.get(tag);
    const now = Date.now();
    if (cache && now - cache.timestamp < CACHE_DURATION) {
      set(topicAtom, {
        ...state,
        currentTopic: tag,
        topicInfo: cache.topicInfo,
        aiccList: cache.aiccList,
        contentsList: cache.contentsList,
        contentsPage: cache.contentsPage,
        contentsHasMore: cache.contentsHasMore,
        isLoading: false,
        error: null,
      });
      return;
    }

    set(topicAtom, { ...state, isLoading: true, error: null, currentTopic: tag });

    try {
      // 使用vite.config.ts中配置的/studio-api代理
      const response = await fetch(`/studio-api/infofi/aicc?tag=${encodeURIComponent(tag)}`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_BEARER_TOKEN}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load topic data');
      }

      const result = await response.json();
      
      set(topicAtom, {
        ...state,
        topicInfo: { tag },
        aiccList: result.data || [],
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set(topicAtom, {
        ...state,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

// 获取topic相关的内容（分页）
export const fetchTopicContents = atom(
  null,
  async (get, set, { tag, reset = false }: { tag: string; reset?: boolean }) => {
    const state = get(topicAtom);
    
    if (!reset && !state.contentsHasMore) return;

    set(topicAtom, { 
      ...state, 
      isLoadingContents: true,
      contentsPage: reset ? 1 : state.contentsPage
    });

    try {
      const page = reset ? 1 : state.contentsPage;
      // 使用vite.config.ts中配置的/studio-api代理
      const response = await fetch(
        `/studio-api/infofi/aicc/contents?tag=${encodeURIComponent(tag)}&page=${page}&pageSize=${state.contentsPageSize}`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_BEARER_TOKEN}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load topic contents');
      }

      const result = await response.json();
      const newContents = result.data || [];
      
      // 更新缓存
      const updatedCache = {
        topicInfo: state.topicInfo,
        aiccList: state.aiccList,
        contentsList: reset ? newContents : [...state.contentsList, ...newContents],
        contentsPage: page + 1,
        contentsHasMore: newContents.length === state.contentsPageSize,
        timestamp: Date.now(),
      };
      
      const newCacheMap = new Map(state.cacheMap);
      newCacheMap.set(tag, updatedCache);

      set(topicAtom, {
        ...state,
        contentsList: reset ? newContents : [...state.contentsList, ...newContents],
        contentsPage: page + 1,
        contentsHasMore: newContents.length === state.contentsPageSize,
        isLoadingContents: false,
        cacheMap: newCacheMap,
      });
    } catch (error) {
      set(topicAtom, {
        ...state,
        isLoadingContents: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);
```

## 4. 组件架构设计

### 4.1 TopicPageRouter组件
```typescript
// src/components/TopicPageRouter.tsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import ContentDisplay from './ContentDisplay';
import TopicPage from './TopicPage';

const decodeTopicName = (encodedTopic: string): string => {
  return decodeURIComponent(encodedTopic);
};

const TopicPageRouter: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const topicParam = searchParams.get('topic');

  if (topicParam) {
    const decodedTopic = decodeTopicName(topicParam);
    return <TopicPage topicName={decodedTopic} />;
  }

  return <ContentDisplay />;
};

export default TopicPageRouter;
```

### 4.2 主要TopicPage组件
```typescript
// src/components/TopicPage.tsx
import React, { useEffect, useRef, useCallback } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import styles from './TopicPage.module.css';
import { topicAtom, fetchTopicAICC, fetchTopicContents } from '../store/topicStore';
import TopicHeader from './TopicHeader';
import TopicAICCSection from './TopicAICCSection';
import TopicGallery from './TopicGallery';
import TopicRelatedTweets from './TopicRelatedTweets';
import StatePrompt from './StatePrompt';
import backIcon from '../assets/Back.svg';

interface TopicPageProps {
  topicName: string;
}

const TopicPage: React.FC<TopicPageProps> = ({ topicName }) => {
  const [topicState] = useAtom(topicAtom);
  const fetchAICC = useSetAtom(fetchTopicAICC);
  const fetchContents = useSetAtom(fetchTopicContents);
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (topicName && topicName !== topicState.currentTopic) {
      fetchAICC(topicName);
      fetchContents({ tag: topicName, reset: true });
    }
  }, [topicName, fetchAICC, fetchContents, topicState.currentTopic]);

  const handleBack = () => {
    navigate(-1); // 返回上一页
  };

  // 分页加载逻辑（复用WorkflowDetail的实现）
  const loadMoreTriggerRef = useCallback((node: HTMLDivElement | null) => {
    if (topicState.isLoadingContents) return;

    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && topicState.contentsHasMore) {
        fetchContents({ tag: topicName, reset: false });
      }
    }, {
      root: null,
      rootMargin: '100px',
      threshold: 0.1
    });

    if (node) observer.current.observe(node);
  }, [topicState.isLoadingContents, topicState.contentsHasMore, fetchContents, topicName]);

  if (topicState.isLoading) {
    return (
      <div className={styles.topicPage} ref={scrollContainerRef}>
        <StatePrompt message="Loading topic data..." />
      </div>
    );
  }

  if (topicState.error) {
    return (
      <div className={styles.topicPage} ref={scrollContainerRef}>
        <div className={styles.topicHeader}>
          <button className={styles.backButton} onClick={handleBack}>
            <img src={backIcon} alt="Back" />
          </button>
          <h1 className={styles.topicTitle}>#{topicName}</h1>
        </div>
        <StatePrompt message="No relevant topic data found." />
      </div>
    );
  }

  return (
    <div className={styles.topicPage} ref={scrollContainerRef}>
      {/* 顶部导航和标题 */}
      <div className={styles.topicHeader}>
        <button className={styles.backButton} onClick={handleBack}>
          <img src={backIcon} alt="Back" />
        </button>
        <h1 className={styles.topicTitle}>#{topicName}</h1>
      </div>

      <div className={styles.topicContent}>
        <div className={styles.mainContent}>
          {/* 统计数据区域 - 暂时留空 */}
          <TopicHeader topicInfo={topicState.topicInfo} />

          {/* AICC横滚区域 - 复用FeatureCard的横滚实现 */}
          <TopicAICCSection aiccList={topicState.aiccList} />

          {/* Gallery区域 - 完全复用WorkflowDetail的瀑布流 */}
          <TopicGallery 
            contentsList={topicState.contentsList}
            isLoading={topicState.isLoadingContents}
            hasMore={topicState.contentsHasMore}
            loadMoreTriggerRef={loadMoreTriggerRef}
          />
        </div>

        {/* 右侧Related Tweets - 移动端隐藏 */}
        <div className={styles.sidebar}>
          <TopicRelatedTweets />
        </div>
      </div>
    </div>
  );
};

export default TopicPage;
```

### 4.3 TopicHeader组件（统计数据占位）
```typescript
// src/components/TopicHeader.tsx
import React from 'react';
import styles from './TopicHeader.module.css';
import { TopicInfo } from '../store/topicStore';

interface TopicHeaderProps {
  topicInfo: TopicInfo | null;
}

const TopicHeader: React.FC<TopicHeaderProps> = ({ topicInfo }) => {
  // 暂时只显示空的占位区域
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
```

### 4.4 TopicAICCSection（横滚实现）
```typescript
// src/components/TopicAICCSection.tsx
// 完全复用FeatureCard的横滚实现和样式
import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './TopicAICCSection.module.css'; // 复用FeatureCard的marquee样式
import { AICCItem } from '../store/topicStore';

interface TopicAICCSectionProps {
  aiccList: AICCItem[];
}

const TopicAICCSection: React.FC<TopicAICCSectionProps> = ({ aiccList }) => {
  const navigate = useNavigate();
  const marqueeRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [dragDistance, setDragDistance] = useState(0);

  // 复用FeatureCard的拖拽逻辑
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!marqueeRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - marqueeRef.current.offsetLeft);
    setScrollLeft(marqueeRef.current.scrollLeft);
    setDragDistance(0);
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !marqueeRef.current) return;
    e.preventDefault();
    const x = e.pageX - marqueeRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    setDragDistance(Math.abs(walk));
    marqueeRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleItemClick = (item: AICCItem, e: React.MouseEvent) => {
    e.preventDefault();
    if (dragDistance > 10) return; // 防止拖拽时触发点击

    // 根据source类型跳转到相应页面
    if (item.source === 'model') {
      navigate(`/?model=${item.id}`);
    } else if (item.source === 'workflow') {
      navigate(`/?workflow=${item.id}`);
    }
  };

  if (aiccList.length === 0) {
    return (
      <div className={styles.aiccSection}>
        <h2 className={styles.sectionTitle}>Related AICCs</h2>
        <div className={styles.emptyMessage}>No AICCs found for this topic</div>
      </div>
    );
  }

  return (
    <div className={styles.aiccSection}>
      <h2 className={styles.sectionTitle}>Related AICCs</h2>
      
      <div
        className={styles.marqueeWrapper}
        ref={marqueeRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className={styles.marqueeContent}>
          {aiccList.map((item) => (
            <div
              key={`${item.source}-${item.id}`}
              className={styles.aiccCard}
              onClick={(e) => handleItemClick(item, e)}
            >
              <div className={styles.aiccCardContent}>
                <img
                  src={item.cover}
                  alt={item.name}
                  className={styles.aiccCoverImage}
                  draggable={false}
                />
                <div className={styles.aiccOverlay} />
                <div className={styles.aiccInfo}>
                  <div className={styles.aiccTags}>
                    {item.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className={styles.aiccTag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className={styles.aiccName}>{item.name}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopicAICCSection;
```

### 4.5 TopicGallery（完全复用WorkflowDetail瀑布流）
```typescript
// src/components/TopicGallery.tsx
// 完全复用WorkflowDetail的瀑布流实现
import React, { useState, useEffect, useRef } from 'react';
import styles from './TopicGallery.module.css'; // 复用WorkflowDetail的样式
import { ContentItem } from '../store/topicStore';
import ImageCard from './ImageCard';
import StatePrompt from './StatePrompt';

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
      const aspectRatio = content.width && content.height ? content.height / content.width : 1;
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
            width: content.width,
            height: content.height,
            creator: content.creator,
            users: content.users,
            state: 1, // 假设都是完成状态
            like_count: 0,
            // 其他必要字段
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
            height: '30px',
            width: '100%',
            margin: '10px 0',
            opacity: 0,
            position: 'relative',
            bottom: '0'
          }}
        />
      )}

      {isLoading && (
        <StatePrompt message="Loading images..." showIcon={false} />
      )}
    </div>
  );
};

export default TopicGallery;
```

### 4.6 TopicRelatedTweets（占位组件）
```typescript
// src/components/TopicRelatedTweets.tsx
import React from 'react';
import styles from './TopicRelatedTweets.module.css';

const TopicRelatedTweets: React.FC = () => {
  return (
    <div className={styles.relatedTweets}>
      <h3 className={styles.tweetsTitle}>Related Tweets</h3>
      <div className={styles.tweetsPlaceholder}>
        {/* 暂时没有数据，先留着div占位 */}
        <div className={styles.emptyMessage}>
          Coming soon...
        </div>
      </div>
    </div>
  );
};

export default TopicRelatedTweets;
```

## 5. 样式设计

### 5.1 TopicPage主样式
```css
/* src/components/TopicPage.module.css */
.topicPage {
  width: 57.625rem; /* 922px，与ContentDisplay一致 */
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem 0;
  min-height: 100vh;
}

.topicHeader {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(55, 65, 81, 0.3);
}

.backButton {
  width: 2rem;
  height: 2rem;
  border-radius: 0.25rem;
  padding: 0.5rem;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.backButton:hover {
  background: rgba(55, 65, 81, 0.3);
}

.topicTitle {
  font-family: 'Jura', sans-serif;
  font-weight: 700;
  font-size: 1.5rem;
  color: #F3F4F6;
  margin: 0;
}

.topicContent {
  display: flex;
  gap: 2rem;
  flex: 1;
}

.mainContent {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.sidebar {
  width: 20rem;
  flex-shrink: 0;
}

/* 移动端隐藏侧边栏 */
@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
  
  .topicContent {
    gap: 0;
  }
}
```

### 5.2 TopicHeader样式
```css
/* src/components/TopicHeader.module.css */
.topicHeaderStats {
  width: 100%;
  margin-bottom: 1rem;
}

.statsPlaceholder {
  /* 统计数据区域占位样式 */
  height: 2rem;
  /* 暂时留空，等待API支持后添加具体样式 */
}
```

### 5.3 TopicAICCSection样式
```css
/* src/components/TopicAICCSection.module.css */
/* 完全复用FeatureCard.module.css的marquee相关样式 */

.aiccSection {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sectionTitle {
  font-family: 'Jura', sans-serif;
  font-weight: 500;
  font-size: 1rem;
  color: white;
  margin: 0;
}

.emptyMessage {
  color: #9CA3AF;
  font-family: 'Jura', sans-serif;
  text-align: center;
  padding: 2rem;
}

.marqueeWrapper {
  width: 100%;
  height: 14.375rem; /* 与FeatureCard一致 */
  overflow: hidden;
  position: relative;
  touch-action: pan-x;
  -webkit-overflow-scrolling: touch;
}

.marqueeContent {
  display: flex;
  gap: 1.25rem;
  white-space: nowrap;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -webkit-touch-callout: none;
}

.aiccCard {
  width: 11.625rem; /* 与FeatureCard一致 */
  height: 14.375rem;
  border-radius: 0.5rem;
  border: 1px solid #3741514D;
  background: linear-gradient(135.58deg, rgba(99, 102, 241, 0.4) 15.46%, rgba(99, 102, 241, 0.05) 40.45%, rgba(99, 102, 241, 0.05) 73.77%, rgba(99, 102, 241, 0.4) 98.76%);
  flex-shrink: 0;
  position: relative;
  cursor: pointer;
  user-select: none;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
}

.aiccCardContent {
  width: 10.875rem;
  height: 13.625rem;
  border-radius: 0.375rem;
  gap: 1.5rem;
  padding: 1rem 0.75rem;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  overflow: hidden;
  user-select: none;
}

.aiccCoverImage {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0.375rem;
  z-index: 1;
  transition: transform 0.3s ease;
  user-select: none;
  pointer-events: none;
}

.aiccCard:hover .aiccCoverImage {
  transform: scale(1.15);
}

.aiccOverlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0, #000000 90%);
  border-radius: 0.375rem;
  z-index: 2;
}

.aiccInfo {
  width: 9.375rem;
  height: 2.625rem;
  border-radius: 0.25rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  z-index: 3;
  user-select: none;
}

.aiccTags {
  width: 9.375rem;
  height: 1.125rem;
  gap: 0.25rem;
  display: flex;
  flex-wrap: nowrap;
  overflow: hidden;
  user-select: none;
}

.aiccTag {
  height: 1.125rem;
  border-radius: 62.4375rem;
  gap: 0.5rem;
  padding: 0.25rem 0.375rem;
  background: #0000004D;
  backdrop-filter: blur(1.25rem);
  font-family: 'Jura', sans-serif;
  font-weight: 500;
  font-size: 0.625rem;
  line-height: 100%;
  color: white;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 0;
  user-select: none;
}

.aiccName {
  font-family: 'Jura', sans-serif;
  font-weight: 700;
  font-size: 1.125rem;
  line-height: 130%;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  user-select: none;
}
```

### 5.4 TopicGallery样式
```css
/* src/components/TopicGallery.module.css */
/* 完全复用WorkflowDetail.module.css的gallery相关样式 */

.gallerySection {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.galleryTitle {
  font-family: 'Jura', sans-serif;
  font-weight: 500;
  font-size: 1rem;
  color: white;
  margin: 0;
}

.waterfallContainer {
  width: 100%;
  position: relative;
  margin: 0 auto;
}

.imageCardContainer {
  transition: transform 0.3s ease;
}

.loadMoreTrigger {
  height: 30px;
  width: 100%;
  margin: 10px 0;
  opacity: 0;
  position: relative;
  bottom: 0;
}
```

### 5.5 TopicRelatedTweets样式
```css
/* src/components/TopicRelatedTweets.module.css */
.relatedTweets {
  width: 100%;
  background: rgba(31, 41, 55, 0.2);
  border-radius: 0.5rem;
  padding: 1rem;
  backdrop-filter: blur(30px);
}

.tweetsTitle {
  font-family: 'Jura', sans-serif;
  font-weight: 700;
  font-size: 1rem;
  color: #F3F4F6;
  margin: 0 0 1rem 0;
}

.tweetsPlaceholder {
  min-height: 10rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.emptyMessage {
  color: #9CA3AF;
  font-family: 'Jura', sans-serif;
  font-size: 0.875rem;
  text-align: center;
}
```

## 6. 骨架屏实现

### 6.1 TopicSkeleton组件
```typescript
// src/components/TopicSkeleton.tsx
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
```

### 6.2 骨架屏样式
```css
/* src/components/TopicSkeleton.module.css */
.topicSkeleton {
  width: 57.625rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem 0;
}

.headerSkeleton {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(55, 65, 81, 0.3);
}

.backButtonSkeleton {
  width: 2rem;
  height: 2rem;
  border-radius: 0.25rem;
  background: rgba(55, 65, 81, 0.3);
  animation: shimmer 1.5s ease-in-out infinite;
}

.titleSkeleton {
  width: 8rem;
  height: 1.5rem;
  border-radius: 0.25rem;
  background: rgba(55, 65, 81, 0.3);
  animation: shimmer 1.5s ease-in-out infinite;
}

.aiccSkeleton {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sectionTitleSkeleton {
  width: 6rem;
  height: 1rem;
  border-radius: 0.25rem;
  background: rgba(55, 65, 81, 0.3);
  animation: shimmer 1.5s ease-in-out infinite;
}

.aiccCardsSkeleton {
  display: flex;
  gap: 1.25rem;
  overflow: hidden;
}

.aiccCardSkeleton {
  width: 11.625rem;
  height: 14.375rem;
  border-radius: 0.5rem;
  background: rgba(55, 65, 81, 0.3);
  flex-shrink: 0;
  animation: shimmer 1.5s ease-in-out infinite;
}

.gallerySkeleton {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.galleryGridSkeleton {
  display: grid;
  grid-template-columns: repeat(4, 13.9375rem);
  gap: 0.625rem;
}

.galleryItemSkeleton {
  width: 13.9375rem;
  border-radius: 0.5rem;
  background: rgba(55, 65, 81, 0.3);
  animation: shimmer 1.5s ease-in-out infinite;
}

@keyframes shimmer {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}
```

## 7. 开发计划和时间安排

### Phase 1: 基础架构（1-2天）
1. ✅ 创建topicStore.ts状态管理
2. ✅ 创建基础组件结构
3. ✅ 实现路由和导航逻辑
4. ✅ 配置环境变量

### Phase 2: 核心功能（2-3天）
1. 🔄 实现TopicPage主组件
2. 🔄 实现hashtag点击跳转
3. 🔄 集成API数据获取
4. 🔄 实现缓存机制

### Phase 3: UI实现（2-3天）
1. 🔄 实现TopicAICCSection横滚
2. 🔄 实现TopicGallery瀑布流
3. 🔄 添加骨架屏和加载状态
4. 🔄 实现响应式设计

### Phase 4: 优化和测试（1-2天）
1. ⏳ 性能优化
2. ⏳ 错误处理完善
3. ⏳ 移动端适配
4. ⏳ 功能测试

## 8. 实现要点总结

### 8.1 完全复用现有实现
- **Gallery瀑布流**: 100%复用`WorkflowDetail.tsx`的瀑布流逻辑和样式
- **AICC横滚**: 100%复用`FeatureCard.tsx`的横滚交互和样式
- **ImageCard组件**: 直接使用现有的`ImageCard`组件
- **状态管理**: 采用与其他页面一致的Jotai原子化管理

### 8.2 缓存机制设计
- 5分钟缓存时间，避免重复请求
- 基于Map的内存缓存，支持多个topic并存
- 智能缓存更新，只刷新有变化的部分

### 8.3 URL编码处理
- 中文topic名称：使用`encodeURIComponent`编码
- 特殊字符处理：确保URL安全性
- 大小写统一：转换为小写存储

### 8.4 错误处理策略
- API请求失败：显示"No relevant topic data found."
- 空数据状态：友好的空状态提示
- 网络错误：自动重试机制

### 8.5 性能优化措施
- 虚拟滚动：Gallery使用现有的瀑布流优化
- 懒加载：分页加载Gallery内容
- 图片优化：复用现有的图片缩放逻辑
- 防抖处理：拖拽滚动防抖

### 8.6 移动端适配
- 侧边栏：移动端自动隐藏Related Tweets
- 触摸交互：支持触摸拖拽横滚
- 响应式布局：自适应不同屏幕尺寸

### 8.7 开发注意事项
1. **使用现有API代理**：通过vite.config.ts中的`/studio-api`代理
2. **环境变量配置**：使用现有的`VITE_BEARER_TOKEN`认证token
3. **完全复用现有组件**：最大化代码复用，保持设计一致性
4. **缓存策略**：避免重复请求，提升用户体验
5. **错误处理**：优雅处理各种异常情况
6. **性能优化**：确保在各种设备上流畅运行

## 9. API接口说明

### 9.1 获取Topic相关AICC
```
GET /studio-api/infofi/aicc?tag={topicName}
Headers:
  Authorization: Bearer {VITE_BEARER_TOKEN}

Response:
{
  "message": "string",
  "data": [
    {
      "id": "number",
      "name": "string", 
      "cover": "string",
      "source": "model" | "workflow",
      "created_at": "Date",
      "tags": ["string"]
    }
  ]
}
```

### 9.2 获取Topic相关内容
```
GET /studio-api/infofi/aicc/contents?tag={topicName}&page={page}&pageSize={pageSize}
Headers:
  Authorization: Bearer {VITE_BEARER_TOKEN}

Response:
{
  "message": "string",
  "data": [
    {
      "id": "number",
      "source_id": "number",
      "source": "model" | "workflow", 
      "url": "string",
      "creator": "string",
      "width": "number",
      "height": "number",
      "users": {
        "twitter": {
          "username": "string",
          "avatar": "string"
        }
      },
      "type": "image" | "video" | "text" | "audio"
    }
  ]
}
```

---

**完成标准**: 用户能够通过点击hashtag进入topic页面，查看相关的AICC和Gallery内容，交互体验与现有页面保持一致。 