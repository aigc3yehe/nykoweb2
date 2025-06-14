import React, { useState, useRef, useEffect } from 'react';
import styles from './NFTCard.module.css';
import { NFTItem } from '../store/collectionDetailStore';

interface NFTCardProps {
  nft: NFTItem;
  onClick: (nft: NFTItem) => void;
}

const NFTCard: React.FC<NFTCardProps> = ({ nft, onClick }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // 懒加载
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };

  const handleImageError = () => {
    setIsImageLoaded(false);
  };

  const handleCardClick = () => {
    onClick(nft);
  };

  return (
    <div 
      ref={cardRef}
      className={styles.nftCard}
      onClick={handleCardClick}
    >
      {isInView && (
        <>
          {nft.imageUrl && (
            <img
              src={nft.imageUrl}
              alt={`NFT ${nft.tokenId}`}
              className={`${styles.nftImage} ${isImageLoaded ? styles.loaded : ''}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          )}
          
          {!isImageLoaded && (
            <div className={styles.placeholderImage}>
              <span className={styles.placeholderIcon}>🖼️</span>
            </div>
          )}

          {/* Hover 遮罩层 */}
          <div className={styles.hoverOverlay}></div>

          <div className={styles.nftInfo}>
            <div className={styles.infoContent}>
              <div className={styles.tokenId}>#{nft.tokenId}</div>
              <div className={styles.collectionName}>{nft.collectionName}</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NFTCard; 