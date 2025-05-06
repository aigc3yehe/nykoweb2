import React, { useState, useEffect, useRef } from 'react';
import styles from './ContentDisplay.module.css';
import ContentHeader from './ContentHeader';
import ModelsContent from './ModelsContent';
import ImagesContent from './ImagesContent';
import ModelDetail from './ModelDetail';
import FeatureCard from './FeatureCard';
import { useAtom, useSetAtom } from 'jotai';
import { clearModelDetail, modelDetailAtom, modelIdAndNameAtom } from '../store/modelStore';
import { useNavigate, useLocation } from 'react-router-dom';

const ContentDisplay: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'models' | 'images'>('models');
  const [ownedOnly, setOwnedOnly] = useState(false);
  const [sortOption, setSortOption] = useState<'New Model' | 'Popular'>('Popular');
  const [viewingModelId, setViewingModelId] = useState<number | null>(null);
  const [viewingModelName, setViewingModelName] = useState<string | null>(null);
  const [modelDetailState] = useAtom(modelDetailAtom);
  const clearDetail = useSetAtom(clearModelDetail);
  const [modelIdAndName] = useAtom(modelIdAndNameAtom);
  const navigate = useNavigate();
  const location = useLocation();

  // 新增吸顶状态
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);
  const featureCardRef = useRef<HTMLDivElement>(null);
  const contentDisplayRef = useRef<HTMLDivElement>(null);

  // 处理滚动事件的阻止冒泡问题
  const handleWheel = (e: React.WheelEvent) => {
    // 允许滚动事件向上冒泡到主滚动容器
    e.stopPropagation = () => {};
  };

  // 处理查看模型详情
  const handleViewModelDetail = (modelId: number, modelName: string) => {
    setViewingModelId(modelId);
    setViewingModelName(modelName);

    // 使用React Router导航，不刷新页面
    navigate(`${location.pathname}?model_id=${modelId}&model_name=${encodeURIComponent(modelName)}`);
  };

  // 处理返回到模型列表
  const handleBackToList = () => {
    setViewingModelId(null);
    clearDetail();

    // 使用React Router导航，清除URL参数
    navigate(location.pathname);
  };

  // 从URL参数中获取model_id和model_name
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const modelId = searchParams.get('model_id');
    const modelName = searchParams.get('model_name');

    if (modelId && modelName) {
      handleViewModelDetail(parseInt(modelId), modelName);
    }
  }, []);

  useEffect(() => {
    if (modelIdAndName.modelId && modelIdAndName.modelName) {
      handleViewModelDetail(modelIdAndName.modelId, modelIdAndName.modelName);
    }
  }, [modelIdAndName]);

  // 新增滚动监听逻辑
  useEffect(() => {
    const handleScroll = () => {
      if (featureCardRef.current && contentDisplayRef.current) {
        const featureCardBottom = featureCardRef.current.getBoundingClientRect().bottom;
        // 当FeatureCard完全滚出可视区域时，ContentHeader变为吸顶
        setIsHeaderSticky(featureCardBottom <= 0);
      }
    };

    // 在主容器上添加滚动监听
    const contentDisplay = contentDisplayRef.current;
    if (contentDisplay) {
      contentDisplay.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      if (contentDisplay) {
        contentDisplay.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  return (
    <div className={`${styles.contentDisplay} ${styles.hideScrollbar}`} ref={contentDisplayRef} onWheel={handleWheel}>
      {/* 特性展示卡片 */}
      { !viewingModelId && <div ref={featureCardRef}>
        <FeatureCard />
      </div> }
      <div className={`${styles.contentContainer} ${isHeaderSticky ? styles.stickyHeader : ''}`}>
        {viewingModelId ? (
          <>
            <div className={styles.headerWrapper}>
              <ContentHeader
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                ownedOnly={ownedOnly}
                setOwnedOnly={setOwnedOnly}
                sortOption={sortOption}
                setSortOption={setSortOption}
                isDetailMode={true}
                modelName={modelDetailState.currentModel?.name || viewingModelName || 'Loading...'}
                onBackClick={handleBackToList}
              />
            </div>

            <div className={styles.contentBody} onWheel={handleWheel}>
              <ModelDetail modelId={viewingModelId} />
            </div>
          </>
        ) : (
          <>
            <div className={styles.headerWrapper}>
              <ContentHeader
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                ownedOnly={ownedOnly}
                setOwnedOnly={setOwnedOnly}
                sortOption={sortOption}
                setSortOption={setSortOption}
              />
            </div>

            <div className={styles.contentBody} onWheel={handleWheel}>
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