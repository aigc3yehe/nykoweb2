import React, { useState, useRef, useEffect } from 'react';
import styles from './NFTCollectionCard.module.css';
import { NFTCollection } from '../store/nftStore';

interface NFTCollectionCardProps {
  collection: NFTCollection;
  onClick: (collection: NFTCollection) => void;
}

const NFTCollectionCard: React.FC<NFTCollectionCardProps> = ({ collection, onClick }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // 懒加载实现
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
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const handleCardClick = () => {
    onClick(collection);
  };

  return (
    <div 
      ref={cardRef}
      className={styles.collectionCard}
      onClick={handleCardClick}
    >
      {/* 图片区域 */}
      <div className={styles.imageContainer}>
        {isInView && (
          <>
            {collection.imageUrl && !imageError ? (
              <img
                ref={imgRef}
                src={collection.imageUrl}
                alt={collection.name}
                className={`${styles.collectionImage} ${imageLoaded ? styles.loaded : ''}`}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            ) : (
              <div className={styles.placeholderImage}>
                <span className={styles.placeholderIcon}>🖼️</span>
              </div>
            )}
            
            {/* NFT 数量标签 */}
            <div className={styles.nftCountBadge}>
              <div className={styles.nftIcon}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M1.75 1.75H12.25V12.25H1.75V1.75Z"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M4.375 4.375L9.625 9.625"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9.625 4.375H9.625"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M4.375 9.625H4.375"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className={styles.nftCount}>{collection.totalSupply}</span>
            </div>
          </>
        )}
      </div>

      {/* 信息区域 */}
      <div className={styles.infoContainer}>
        <h3 className={styles.collectionName}>{collection.name}</h3>
      </div>
    </div>
  );
};

export default NFTCollectionCard; 