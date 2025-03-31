import React, { useEffect, useRef, useCallback } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import styles from './ModelsContent.module.css';
import { modelListAtom, fetchModels } from '../store/modelStore';
import ModelCard from './ModelCard';
import StatePrompt from './StatePrompt';

interface ModelsContentProps {
  ownedOnly: boolean;
  sortOption: 'New Model' | 'MKT CAP' | 'Popular';
  onModelClick: (modelId: number, modelName: string) => void;
}

const ModelsContent: React.FC<ModelsContentProps> = ({ ownedOnly, sortOption, onModelClick }) => {
  const [modelListState] = useAtom(modelListAtom);
  const fetchModelsList = useSetAtom(fetchModels);
  
  const { models = [], isLoading, error, hasMore } = modelListState;
  const observer = useRef<IntersectionObserver | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
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
        <StatePrompt 
          message={ownedOnly ? "You Don't Own Any Models" : "No Models Found"} 
        />
      ) : (
        <div className={styles.modelsGrid}>
          {filteredModels.map((model, index) => {
            if (index === filteredModels.length - 1) {
              return (
                <div 
                  ref={lastModelElementRef} 
                  key={model.id} 
                  className={styles.modelCardContainer}
                  onClick={() => onModelClick(model.id, model.name)}
                >
                  <ModelCard model={model} />
                </div>
              );
            } else {
              return (
                <div 
                  key={model.id} 
                  className={styles.modelCardContainer}
                  onClick={() => onModelClick(model.id, model.name)}
                >
                  <ModelCard model={model} />
                </div>
              );
            }
          })}
        </div>
      )}
      
      {isLoading && (
        <StatePrompt message="Loading Models..." />
      )}
      
      {error && (
        <StatePrompt 
          message="Failed to Load Models"
          action={{
            text: 'Retry',
            onClick: () => fetchModelsList({ reset: false, ownedOnly })
          }}
        />
      )}
    </div>
  );
};

export default ModelsContent;