import React, { useEffect, useState } from 'react';
import { useSetAtom } from 'jotai';
import { getTokensForOwner } from '../store/alchemyStore';
import styles from './WalletAssets.module.css';
import defaultTokenIcon from '../assets/token_default.svg';

interface WalletAssetsProps {
  walletAddress: string | undefined;
}

const WalletAssets: React.FC<WalletAssetsProps> = ({ walletAddress }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [tokens, setTokens] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fetchTokens = useSetAtom(getTokensForOwner);
  
  useEffect(() => {
    const loadAssets = async () => {
      if (!walletAddress) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // 调用 Alchemy API 获取用户持有的代币
        const result = await fetchTokens({ 
          addressOrName: walletAddress
        });
        
        // 获取前两个代币
        setTokens(result.tokens.slice(0, 2));
      } catch (err) {
        console.error('获取资产失败:', err);
        setError('无法获取资产信息');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAssets();
  }, [walletAddress, fetchTokens]);
  
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={styles.errorContainer}>
        {error}
      </div>
    );
  }
  
  if (tokens.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        没有找到资产
      </div>
    );
  }
  
  return (
    <div className={styles.assetListContainer}>
      {tokens.map((token, index) => (
        <div 
          key={token.contractAddress} 
          className={`${styles.assetItem} ${index === 0 && tokens.length > 1 ? styles.withBorder : ''}`}
        >
          <div className={styles.assetInfo}>
            <img 
              src={token.logo || defaultTokenIcon} 
              alt={token.symbol || 'Token'} 
              className={styles.tokenIcon}
              onError={(e) => {
                (e.target as HTMLImageElement).src = defaultTokenIcon;
              }}
            />
            <span className={styles.tokenName}>
              {token.name || token.symbol || '未知代币'}
            </span>
          </div>
          <div className={styles.tokenBalance}>
            {parseFloat(token.balance || '0').toFixed(4)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default WalletAssets; 