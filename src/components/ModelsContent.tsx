import React, { useEffect, useRef, useCallback } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import styles from './ModelsContent.module.css';
import { modelListAtom, fetchModels } from '../store/modelStore';
import { accountAtom } from '../store/accountStore';
import ModelCard from './ModelCard';

interface ModelsContentProps {
  ownedOnly: boolean;
  sortOption: 'New Model' | 'MKT CAP' | 'Popular';
}

const ModelsContent: React.FC<ModelsContentProps> = ({ ownedOnly, sortOption }) => {
  const [modelListState] = useAtom(modelListAtom);
  const fetchModelsList = useSetAtom(fetchModels);
  const [accountState] = useAtom(accountAtom);
  
  const { models = [], isLoading, error, hasMore } = modelListState;
  const observer = useRef<IntersectionObserver | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const getOrderFromSortOption = (option: string): 'created_at' | 'usage' => {
    switch (option) {
      case 'Popular':
        return 'usage';
      case 'New Model':
      case 'MKT CAP':
      default:
        return 'created_at';
    }
  };
  
  useEffect(() => {
    fetchModelsList({ reset: true, ownedOnly });
  }, [sortOption, ownedOnly, fetchModelsList]);
  
  const filteredModels = models || [];

  const lastModelElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading) return;
    
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchModelsList({ reset: false, ownedOnly });
      }
    }, {
      root: scrollContainerRef.current,
      rootMargin: '100px', // 增加根元素边距，提前触发加载
      threshold: 0.1
    });
    
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore, fetchModelsList, ownedOnly]);
  
  return (
    <div className={styles.modelsContent} ref={scrollContainerRef}>
      {filteredModels.length === 0 && !isLoading ? (
        <div className={styles.noModels}>
          <p>未找到模型</p>
          {ownedOnly && <p>您当前未拥有任何模型</p>}
        </div>
      ) : (
        <div className={styles.modelsGrid}>
          {filteredModels.map((model, index) => {
            if (index === filteredModels.length - 1) {
              return (
                <div ref={lastModelElementRef} key={model.id} className={styles.modelCardContainer}>
                  <ModelCard model={model} />
                </div>
              );
            } else {
              return (
                <div key={model.id} className={styles.modelCardContainer}>
                  <ModelCard model={model} />
                </div>
              );
            }
          })}
        </div>
      )}
      
      {isLoading && (
        <div className={styles.loadingContainer}>
          <p>加载中...</p>
        </div>
      )}
      
      {error && (
        <div className={styles.errorContainer}>
          <p>加载失败: {error}</p>
          <button onClick={() => fetchModelsList({ reset: false, ownedOnly })}>重试</button>
        </div>
      )}
    </div>
  );
};

export default ModelsContent;