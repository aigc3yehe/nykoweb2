import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import styles from './CollectionPage.module.css';
import CollectionInfo from './CollectionInfo';
import NFTList from './NFTList';
import { 
  collectionDetailAtom, 
  fetchCollectionDetailAtom,
  clearCollectionDetailAtom 
} from '../store/collectionDetailStore';

interface CollectionPageProps {
  contractAddress: string;
  name: string;
  description: string;
  onBack: () => void;
}

const CollectionPage: React.FC<CollectionPageProps> = ({
  contractAddress,
  name,
  description,
  onBack,
}) => {
  const [collectionState] = useAtom(collectionDetailAtom);
  const fetchCollectionDetail = useSetAtom(fetchCollectionDetailAtom);
  const clearCollectionDetail = useSetAtom(clearCollectionDetailAtom);
  
  // 自定义滚动条状态
  const [showScrollbar, setShowScrollbar] = useState(false);
  const [scrollbarHeight, setScrollbarHeight] = useState(0);
  const [scrollbarTop, setScrollbarTop] = useState(0);
  const scrollbarRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // 更新滚动条
  const updateScrollbar = useCallback(() => {
    const scrollContainer = document.querySelector('.fullWidthContent') as HTMLElement;
    if (!scrollContainer) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
    const scrollableHeight = scrollHeight - clientHeight;
    
    if (scrollableHeight <= 0) {
      setShowScrollbar(false);
      return;
    }

    setShowScrollbar(true);
    
    // 计算滚动条高度和位置
    const trackHeight = window.innerHeight - 64 - 24; // 减去header和padding
    const thumbHeight = Math.max((clientHeight / scrollHeight) * trackHeight, 20);
    const thumbTop = (scrollTop / scrollableHeight) * (trackHeight - thumbHeight);
    
    setScrollbarHeight(thumbHeight);
    setScrollbarTop(thumbTop);
  }, []);

  // 滚动条拖拽处理
  const handleScrollbarMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      
      const scrollContainer = document.querySelector('.fullWidthContent') as HTMLElement;
      if (!scrollContainer) return;
      
      const trackHeight = window.innerHeight - 64 - 24;
      const thumbHeight = scrollbarHeight;
      const maxThumbTop = trackHeight - thumbHeight;
      
      const rect = document.body.getBoundingClientRect();
      const mouseY = e.clientY - rect.top - 64; // 减去header高度
      const newThumbTop = Math.max(0, Math.min(mouseY - thumbHeight / 2, maxThumbTop));
      
      const scrollRatio = newThumbTop / (trackHeight - thumbHeight);
      const maxScrollTop = scrollContainer.scrollHeight - scrollContainer.clientHeight;
      
      scrollContainer.scrollTop = scrollRatio * maxScrollTop;
    };
    
    const handleMouseUp = () => {
      isDragging.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [scrollbarHeight]);

  // 组件挂载时获取数据
  useEffect(() => {
    fetchCollectionDetail({
      contractAddress,
      name,
      description,
    });

    // 组件卸载时清理状态
    return () => {
      clearCollectionDetail();
    };
  }, [contractAddress, name, description, fetchCollectionDetail, clearCollectionDetail]);

  // 监听滚动事件
  useEffect(() => {
    const scrollContainer = document.querySelector('.fullWidthContent') as HTMLElement;
    if (!scrollContainer) return;

    const handleScroll = () => {
      updateScrollbar();
    };

    const handleResize = () => {
      updateScrollbar();
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    // 初始更新
    setTimeout(updateScrollbar, 100);

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [updateScrollbar]);

  return (
    <div className={styles.collectionPage}>
      <div className={styles.container}>
        {/* Collection 信息区域 */}
        <div className={styles.collectionInfoSection}>
          <CollectionInfo
            name={name}
            contractAddress={contractAddress}
            description={description}
            onBack={onBack}
          />
        </div>

        {/* NFT 列表区域 */}
        <div className={styles.nftListSection}>
          {collectionState.isLoading && !collectionState.collection ? (
            <div className={styles.initialLoadingState}>
              <div className={styles.loadingSpinner}></div>
              <p className={styles.loadingText}>Loading collection...</p>
            </div>
          ) : (
            <NFTList />
          )}
        </div>
      </div>

      {/* 自定义滚动条 */}
      {showScrollbar && (
        <div className={styles.scrollbarTrack}>
          <div
            ref={scrollbarRef}
            className={styles.scrollbarThumb}
            style={{
              height: `${scrollbarHeight}px`,
              top: `${scrollbarTop}px`,
            }}
            onMouseDown={handleScrollbarMouseDown}
          />
        </div>
      )}
    </div>
  );
};

export default CollectionPage; 