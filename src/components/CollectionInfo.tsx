import React, { useState } from 'react';
import styles from './CollectionInfo.module.css';
import backIcon from '../assets/back2.svg';
import copyIcon from '../assets/copy2.svg';
import doneIcon from '../assets/done.svg';
import meIcon from '../assets/me.svg';

interface CollectionInfoProps {
  name: string;
  contractAddress: string;
  description: string;
  onBack: () => void;
}

const CollectionInfo: React.FC<CollectionInfoProps> = ({
  name,
  contractAddress,
  description,
  onBack,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(contractAddress);
      setIsCopied(true);
      
      // 3秒后恢复
      setTimeout(() => {
        setIsCopied(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  const handleMagicEdenClick = () => {
    const magicEdenUrl = `https://magiceden.io/collections/base/${contractAddress}`;
    window.open(magicEdenUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={styles.collectionInfo}>
      <div className={styles.title}>
        <div className={styles.titleContent}>
          <button className={styles.backButton} onClick={onBack}>
            <img src={backIcon} alt="Back" className={styles.backIcon} />
          </button>
          
          <div className={styles.separator}></div>
          
          <h1 className={styles.collectionName}>{name}</h1>
          
          <button 
            className={styles.copyButton} 
            onClick={handleCopyAddress}
            title="Copy contract address"
          >
            <img 
              src={isCopied ? doneIcon : copyIcon} 
              alt={isCopied ? "Copied" : "Copy"} 
              className={styles.copyIcon} 
            />
          </button>
          
          <button 
            className={styles.magicEdenButton} 
            onClick={handleMagicEdenClick}
            title="View on MagicEden"
          >
            <img src={meIcon} alt="MagicEden" className={styles.meIcon} />
          </button>
        </div>
      </div>
      
      <div className={styles.description}>
        <p className={styles.descriptionText}>{description}</p>
      </div>
    </div>
  );
};

export default CollectionInfo; 