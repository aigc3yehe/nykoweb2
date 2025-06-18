import React, { useEffect, useRef, useCallback, useState } from 'react';
import styles from './ModelDetail.module.css';
import { useAtom, useSetAtom } from 'jotai';
import { fetchModelDetail, modelDetailAtom, clearModelDetail } from '../store/modelStore';
import { fetchImages, imageListAtom } from '../store/imageStore';
import {setCurrentModel, clearCurrentModel, clearModelStatus} from '../store/chatStore';
import {
  fetchTokenizationState,
  tokenizationStateAtom,
} from '../store/tokenStore';
import ImageCard from './ImageCard';
import ModelCarousel from './ModelCarousel';
import ModelInfoPanel from './ModelInfoPanel';
import StatePrompt from './StatePrompt';
import TokenizationPanel from './TokenizationPanel';
import {accountAtom} from "../store/accountStore.ts";

interface ModelDetailProps {
  modelId: number;
}

const ModelDetail: React.FC<ModelDetailProps> = ({ modelId }) => {
  const [modelDetailState] = useAtom(modelDetailAtom);
  const [imageListState] = useAtom(imageListAtom);
  const [accountState] = useAtom(accountAtom);
  const fetchDetail = useSetAtom(fetchModelDetail);
  const fetchImagesList = useSetAtom(fetchImages);
  const clearDetail = useSetAtom(clearModelDetail);
  const [tokenizationState] = useAtom(tokenizationStateAtom);
  const { data } = tokenizationState;
  const fetchState = useSetAtom(fetchTokenizationState);
  const setCurrentModelInChat = useSetAtom(setCurrentModel);
  const clearCurrentModelInChat = useSetAtom(clearCurrentModel);
  const clearModelStatusInChat = useSetAtom(clearModelStatus);
  const [showBuyToken, setShowBuyToken] = useState(false);
  const [showEditCover, setShowEditCover] = useState(false);
  const [showCarousel, setShowCarousel] = useState(false);

  const [activeTab, setActiveTab] = useState<'description' | 'tokenization'>('description');

  const { currentModel, isLoading, error } = modelDetailState;
  const { images: originalImages = [], isLoading: imagesLoading, error: imagesError, hasMore } = imageListState;

  // 过滤重复ID的图片
  const uniqueImageIds = new Set<number>();
  const images = originalImages.filter(image => {
    if (!uniqueImageIds.has(image.id)) {
      uniqueImageIds.add(image.id);
      return true;
    }
    return false;
  });

  // 根据用户角色决定view参数
  // 如果是admin查看所有图片，不传view参数，显示所有图片
  // 如果是普通用户查看所有图片，设置view=true，只显示可见的图片
  const viewParam =  accountState.role === 'admin' ? undefined : true;

  // 图片瀑布流相关状态
  const [containerHeight, setContainerHeight] = useState(0);
  const [imagePositions, setImagePositions] = useState<{top: number, left: number, height: number}[]>([]);
  const [galleryContainerWidth, setGalleryContainerWidth] = useState(0);
  const [cardWidth, setCardWidth] = useState(0);

  // 引用
  const observer = useRef<IntersectionObserver | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const galleryContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (accountState.role === 'admin' || accountState.did === currentModel?.creator) {
      setShowEditCover(true)
      setShowCarousel(true)
    } else {
      setShowEditCover(false)
      setShowCarousel(false)
    }
  }, [accountState.did, accountState.role, currentModel?.creator]);

  useEffect(() => {
    // 加载模型详情
    fetchDetail(modelId, true);

    // 加载与模型相关的图片
    fetchImagesList({ reset: true, model_id: modelId, view: viewParam, order: 'like_count' });

    // 组件卸载时清除详情
    return () => {
      clearDetail();
      clearCurrentModelInChat();
      clearModelStatusInChat();
    };
  }, [modelId, fetchDetail, fetchImagesList, clearDetail, clearCurrentModelInChat, clearModelStatusInChat, viewParam]);

  useEffect(() => {
    const element = galleryContainerRef.current;
    if (!element) {
      return; // 如果元素不存在，则不执行任何操作
    }

    const observer = new ResizeObserver(entries => {
      // 当 ResizeObserver 被触发时，更新 galleryContainerWidth
      if (entries[0]) {
        setGalleryContainerWidth(entries[0].contentRect.width);
      }
    });

    observer.observe(element);
    // 设置初始宽度
    setGalleryContainerWidth(element.clientWidth);

    // 添加窗口大小变化监听器以重新计算布局
    const handleResize = () => {
      setGalleryContainerWidth(element.clientWidth);
      setCardWidth(calculateCardWidth());
    };
    
    window.addEventListener('resize', handleResize);
    
    // 设置初始卡片宽度
    setCardWidth(calculateCardWidth());

    return () => {
      // 清理 observer
      observer.unobserve(element);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 定期检查 token 化状态
  useEffect(() => {
    // 首次加载时获取状态
    fetchState({ modelId, model_tokenization_id: modelDetailState?.currentModel?.model_tokenization?.id || 0 })
  }, [fetchState, modelId, modelDetailState?.currentModel?.model_tokenization?.id]);

  useEffect(() => {
    // 修改 renderTokenizationStatus 函数中的完成状态部分

    const hasCommunityTokens = (currentModel?.model_community_tokenization?.length || 0) > 0;
    console.log('hasCommunityTokens', hasCommunityTokens);
    console.log('data', data);
    if (data || hasCommunityTokens) {
      setShowBuyToken(true);
    } else{
      setShowBuyToken(false);
      setActiveTab('description');
    }

    return () => {
      setActiveTab('description');
      setShowBuyToken(false);
    };
  }, [data, setShowBuyToken, setActiveTab, currentModel?.model_community_tokenization?.length]);

  // 监听当前模型变化，更新聊天存储中的当前模型(模型Ready的时候才更新)
  useEffect(() => {
    if (currentModel && currentModel.model_tran?.[0]?.train_state === 2) {
      setCurrentModelInChat(currentModel);
    }
  }, [currentModel, setCurrentModelInChat]);

  // 计算卡片宽度的工具函数
  const calculateCardWidth = () => {
    const isMobile = window.innerWidth <= 768;
    const columnGap = 0.625; // 10px
    const columnCount = isMobile ? 2 : 4;
    
    if (isMobile) {
      // 移动端动态计算：(屏幕宽度 - 父容器边距 - 图片间距) / 列数
      const screenWidth = window.innerWidth / 16; // 转换为rem
      const containerPadding = 1.25; // ContentDisplay的padding: 0.625rem * 2 = 1.25rem (20px)
      const totalGaps = (columnCount - 1) * columnGap; // 图片间距总和
      return (screenWidth - containerPadding - totalGaps) / columnCount;
    } else {
      return 13.9375; // 桌面端: 223px
    }
  };

  // 计算瀑布流布局
  useEffect(() => {
    if (images.length === 0) return;

    // 响应式参数设置
    const isMobile = window.innerWidth <= 768;
    const columnGap = 0.625; // 10px
    const columnCount = isMobile ? 2 : 4;
    const currentCardWidth = cardWidth || calculateCardWidth();
    const columnHeights = Array(columnCount).fill(0);
    const positions: {top: number, left: number, height: number}[] = [];

    images.forEach((image) => {
      // 找出当前高度最小的列
      const minHeightColumn = columnHeights.indexOf(Math.min(...columnHeights));

      // 计算图片高度 (基于原始宽高比)
      const aspectRatio = image.width && image.height ? image.height / image.width : 1;
      const imageHeight = currentCardWidth * aspectRatio;

      // 计算位置
      const left = minHeightColumn * (currentCardWidth + columnGap);
      const top = columnHeights[minHeightColumn];

      // 保存位置信息
      positions.push({ top, left, height: imageHeight });

      // 更新该列的高度
      columnHeights[minHeightColumn] += imageHeight + columnGap;
    });

    // 使用ref来跟踪上一次的高度，避免不必要的更新
    const newContainerHeight = Math.max(...columnHeights);
    if (Math.abs(newContainerHeight - containerHeight) > 0.1) { // 添加一个阈值判断
      setContainerHeight(newContainerHeight);
    }

    // 更新位置状态
    const newImagePositions = positions;
    if (JSON.stringify(newImagePositions) !== JSON.stringify(imagePositions)) {
      setImagePositions(newImagePositions);
    }
  }, [images, galleryContainerWidth, containerHeight, cardWidth]);

  // 修改loadMoreTriggerRef回调函数，保持root为null（使用viewport）
  const loadMoreTriggerRef = useCallback((node: HTMLDivElement | null) => {
    if (imagesLoading) return;

    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchImagesList({ reset: false, model_id: modelId, view: viewParam, order: 'like_count' });
      }
    }, {
      root: null, // 使用viewport作为root
      rootMargin: '100px', // 适当的rootMargin
      threshold: 0.1
    });

    if (node) observer.current.observe(node);
  }, [imagesLoading, hasMore, fetchImagesList, modelId, viewParam]);

  // 添加一个新的useEffect来监听滚动事件
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer || imagesLoading || !hasMore) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      // 当滚动到距离底部200px时加载更多
      if (scrollHeight - scrollTop - clientHeight < 200 && hasMore && !imagesLoading) {
        fetchImagesList({ reset: false, model_id: modelId, view: viewParam, order: 'like_count' });
      }
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [hasMore, imagesLoading, fetchImagesList, modelId, viewParam]);

  if (isLoading) {
    return (
      <div className={styles.modelDetail} ref={scrollContainerRef}>
        <StatePrompt message="Loading Model Details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.modelDetail} ref={scrollContainerRef}>
        <StatePrompt
          message="Failed to Load Model"
          action={{
            text: 'Retry',
            onClick: () => fetchDetail(modelId, true)
          }}
        />
      </div>
    );
  }

  if (!currentModel) {
    return (
      <div className={styles.modelDetail} ref={scrollContainerRef}>
        <StatePrompt message="Model Not Found" />
      </div>
    );
  }

  return (
    <div className={styles.modelDetail} ref={scrollContainerRef}>
      {/* 1. 模型信息部分 - 使用新的布局 */}
      <div className={styles.infoSection}>
        {/* 左侧轮播图组件 */}
        <ModelCarousel
          images={currentModel.carousel || []}
          cover={currentModel.cover}
          modelId={currentModel.id}
          showDeleteButton={showCarousel}
        />

        {/* 右侧信息面板 - 使用新的设计 */}
        <ModelInfoPanel model={currentModel} />
      </div>

      {/* 2. Tab 部分 */}
      <div className={styles.tabSection}>
        <div className={styles.tabHeader}>
          <button
            className={`${styles.tabButton} ${activeTab === 'description' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('description')}
          >
            Description
          </button>
          {showBuyToken && (
              <button
                  className={`${styles.tabButton} ${activeTab === 'tokenization' ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab('tokenization')}
              >
                Buy Token
              </button>
          )}
        </div>

        <div className={styles.tabContent}>
          <div
            className={styles.descriptionContent}
            style={{ display: activeTab === 'description' ? 'block' : 'none' }}
          >
            <p>{currentModel.description || 'empty description'}</p>
          </div>

          <div
            className={styles.tokenizationContent}
            style={{ display: activeTab === 'tokenization' && showBuyToken ? 'block' : 'none' }}
          >
            <TokenizationPanel model={currentModel}/>
          </div>
        </div>
      </div>

      {/* 3. Gallery 部分 */}
      <div className={styles.gallerySection}>
        <h2 className={styles.galleryTitle}>Gallery</h2>

        {images.length === 0 && !imagesLoading ? (
          <StatePrompt message="No Images Found" />
        ) : (
          <div
            className={styles.waterfallContainer}
            ref={galleryContainerRef}
            style={{ height: `${containerHeight}rem` }}
          >
            {images.map((image, index) => {
              // 确保索引有效
              if (index >= imagePositions.length) return null;

              return (
                <div
                  key={image.id}
                  className={styles.imageCardContainer}
                  style={{
                    position: 'absolute',
                    top: `${imagePositions[index].top}rem`,
                    left: `${imagePositions[index].left}rem`,
                    width: `${cardWidth || calculateCardWidth()}rem`,
                    height: `${imagePositions[index].height}rem`
                  }}
                >
                  <ImageCard
                    image={image}
                    onVisibilityChange={(updatedImage) => {
                      // 更新本地图片数据
                      const updatedImages = [...images];
                      updatedImages[index] = updatedImage;
                      // React将会响应这些变化
                      imageListState.images = updatedImages;
                    }}
                    showEditCover={showEditCover}
                    showCarousel={showCarousel}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* 修改loadMoreTrigger的样式和位置 */}
        {hasMore && (
          <div
            ref={loadMoreTriggerRef}
            className={styles.loadMoreTrigger}
            style={{
              height: '30px',
              width: '100%',
              margin: '10px 0',
              opacity: 0,  // 设置为不可见但仍可检测
              position: 'relative',
              bottom: '0'
            }}
          />
        )}

        {imagesLoading && (
          <StatePrompt message="Loading Images..." showIcon={false} />
        )}

        {imagesError && (
          <StatePrompt
            message="Failed to Load Images"
            action={{
              text: 'Retry',
              onClick: () => fetchImagesList({ reset: false, model_id: modelId, view: viewParam, order: 'like_count' })
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ModelDetail;