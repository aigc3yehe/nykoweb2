import React, { useEffect, useRef, useCallback } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import styles from './NFTList.module.css';
import NFTCard from './NFTCard';
import { 
  collectionDetailAtom, 
  loadMoreNFTsAtom,
  NFTItem 
} from '../store/collectionDetailStore';
import { showToastAtom } from '../store/imagesStore';

const NFTList: React.FC = () => {
  const [collectionState] = useAtom(collectionDetailAtom);
  const loadMoreNFTs = useSetAtom(loadMoreNFTsAtom);
  const showToast = useSetAtom(showToastAtom);
  const loadingRef = useRef<HTMLDivElement>(null);

  // 无限滚动
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    if (entry.isIntersecting && collectionState.collection?.hasNextPage && !collectionState.isLoading) {
      loadMoreNFTs();
    }
  }, [collectionState.collection?.hasNextPage, collectionState.isLoading, loadMoreNFTs]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.1,
    });

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => observer.disconnect();
  }, [handleIntersection]);

  // 错误处理
  useEffect(() => {
    if (collectionState.error) {
      showToast({
        message: `Failed to load NFTs: ${collectionState.error}`,
        severity: 'error',
      });
    }
  }, [collectionState.error, showToast]);

  const handleNFTClick = (nft: NFTItem) => {
    const magicEdenUrl = `https://magiceden.io/item-details/base/${nft.contractAddress}/${nft.tokenId}`;
    window.open(magicEdenUrl, '_blank', 'noopener,noreferrer');
  };

  if (!collectionState.collection) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>📦</div>
        <p className={styles.emptyText}>No collection data available</p>
      </div>
    );
  }

  const { nfts } = collectionState.collection;

  return (
    <div className={styles.nftList}>
      {nfts.length > 0 ? (
        <>
          <div className={styles.nftGrid}>
            {nfts.map((nft) => (
              <NFTCard
                key={`${nft.contractAddress}-${nft.tokenId}`}
                nft={nft}
                onClick={handleNFTClick}
              />
            ))}
          </div>

          {/* 加载更多触发器 */}
          {collectionState.collection.hasNextPage && (
            <div ref={loadingRef} className={styles.loadingTrigger}>
              {collectionState.isLoading && (
                <div className={styles.loadingState}>
                  <div className={styles.loadingSpinner}></div>
                  <p className={styles.loadingText}>Loading more NFTs...</p>
                </div>
              )}
            </div>
          )}

          {/* 加载完成提示 */}
          {!collectionState.collection.hasNextPage && nfts.length > 0 && (
            <div className={styles.endMessage}>
              <p className={styles.endText}>All NFTs loaded</p>
            </div>
          )}
        </>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🖼️</div>
          <p className={styles.emptyText}>No NFTs found in this collection</p>
          <p className={styles.emptySubtext}>This collection appears to be empty or still loading</p>
        </div>
      )}
    </div>
  );
};

export default NFTList; 