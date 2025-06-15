import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom, useSetAtom } from 'jotai';
import styles from './NFTSection.module.css';
import { nftStoreAtom, fetchNFTCollections, clearNFTError, NFTCollection } from '../store/nftStore';
import { showToastAtom } from '../store/imagesStore';
import NFTCollectionCard from './NFTCollectionCard';

const NFTSection: React.FC = () => {
  const [nftState] = useAtom(nftStoreAtom);
  const fetchCollections = useSetAtom(fetchNFTCollections);
  const clearError = useSetAtom(clearNFTError);
  const showToast = useSetAtom(showToastAtom);
  const navigate = useNavigate();

  const handleVirtualsClick = () => {
    window.open('https://app.virtuals.io/virtuals/657', '_blank', 'noopener,noreferrer');
  };

  const handleCollectionClick = (collection: NFTCollection) => {
    console.log('Collection clicked:', collection); // 添加调试日志
    
    // 跳转到 Collection 详情页面
    const params = new URLSearchParams({
      collection: collection.contractAddress,
      name: collection.name,
      description: collection.description,
    });
    
    // 使用 React Router 的 navigate 进行跳转
    const url = `/?${params.toString()}`;
    console.log('Navigating to:', url); // 添加调试日志
    
    navigate(url);
  };

  // 组件挂载时获取数据
  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  // 错误处理 - 显示 Toast
  useEffect(() => {
    if (nftState.error) {
      showToast({
        message: `Failed to load NFT collections: ${nftState.error}`,
        severity: 'error',
      });
      // 清除错误状态，避免重复显示
      clearError();
    }
  }, [nftState.error, showToast, clearError]);

  return (
    <div className={styles.nftSection}>
      <h2 className={styles.sectionTitle}>
        NFTs (By{' '}
        <span 
          className={styles.clickableToken}
          onClick={handleVirtualsClick}
        >
          $MISATO
        </span>
        )
      </h2>
      
      <div className={styles.nftList}>
        {nftState.isLoading ? (
          // 加载状态
          <div className={styles.loadingState}>
            <div className={styles.loadingSpinner}></div>
            <p className={styles.loadingText}>Loading NFT collections...</p>
          </div>
        ) : nftState.collections.length > 0 ? (
          // 有数据时显示横滑列表
          <div className={styles.collectionsScroll}>
            {nftState.collections.map((collection) => (
              <NFTCollectionCard
                key={collection.id}
                collection={collection}
                onClick={handleCollectionClick}
              />
            ))}
          </div>
        ) : (
          // 空状态
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📦</div>
            <p className={styles.emptyText}>No NFT collections available</p>
            <p className={styles.emptySubtext}>Collections will appear here once they are loaded</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NFTSection; 