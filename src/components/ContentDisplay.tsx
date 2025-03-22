import React, { useState } from 'react';
import styles from './ContentDisplay.module.css';
import ContentHeader from './ContentHeader';
import ModelsContent from './ModelsContent';
import ImagesContent from './ImagesContent';
import ModelDetail from './ModelDetail';
import { useAtom, useSetAtom } from 'jotai';
import { clearModelDetail, modelDetailAtom } from '../store/modelStore';

const ContentDisplay: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'models' | 'images'>('models');
  const [ownedOnly, setOwnedOnly] = useState(false);
  const [sortOption, setSortOption] = useState<'New Model' | 'MKT CAP' | 'Popular'>('New Model');
  const [viewingModelId, setViewingModelId] = useState<number | null>(null);
  
  const [modelDetailState] = useAtom(modelDetailAtom);
  const clearDetail = useSetAtom(clearModelDetail);
  
  // 处理查看模型详情
  const handleViewModelDetail = (modelId: number) => {
    setViewingModelId(modelId);
  };
  
  // 处理返回到模型列表
  const handleBackToList = () => {
    setViewingModelId(null);
    clearDetail();
  };
  
  return (
    <div className={styles.contentDisplay}>
      <div className={styles.contentContainer}>
        {viewingModelId ? (
          <>
            <ContentHeader 
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              ownedOnly={ownedOnly}
              setOwnedOnly={setOwnedOnly}
              sortOption={sortOption}
              setSortOption={setSortOption}
              isDetailMode={true}
              modelName={modelDetailState.currentModel?.name || '加载中...'}
              onBackClick={handleBackToList}
            />
            
            <div className={styles.contentBody}>
              <ModelDetail modelId={viewingModelId} />
            </div>
          </>
        ) : (
          <>
            <ContentHeader 
              activeTab={activeTab} 
              setActiveTab={setActiveTab}
              ownedOnly={ownedOnly}
              setOwnedOnly={setOwnedOnly}
              sortOption={sortOption}
              setSortOption={setSortOption}
            />
            
            <div className={styles.contentBody}>
              {activeTab === 'models' ? (
                <ModelsContent 
                  ownedOnly={ownedOnly} 
                  sortOption={sortOption}
                  onModelClick={handleViewModelDetail}
                />
              ) : (
                <ImagesContent ownedOnly={ownedOnly} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ContentDisplay;