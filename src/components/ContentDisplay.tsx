import React, { useState, useEffect, useRef } from 'react';
import styles from './ContentDisplay.module.css';
import ContentHeader from './ContentHeader';
import ModelsContent from './ModelsContent';
import ImagesContent from './ImagesContent';
import ModelDetail from './ModelDetail';
import FeatureCard from './FeatureCard';
import { useAtom, useSetAtom } from 'jotai';
import { clearModelDetail, modelDetailAtom, modelIdAndNameAtom } from '../store/modelStore';
import { clearWorkflowDetail, workflowDetailAtom } from '../store/workflowStore';
import { useNavigate, useLocation } from 'react-router-dom';
import WorkflowsContent from "./WorkflowsContent.tsx";
import WorkflowDetail from "./WorkflowDetail.tsx";

const ContentDisplay: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'models' | 'workflows' | 'images'>('workflows');
  const [ownedOnly, setOwnedOnly] = useState(false);
  const [sortOption, setSortOption] = useState<'New Model' | 'Popular'>('Popular');
  const [viewingModelId, setViewingModelId] = useState<number | null>(null);
  const [viewingModelName, setViewingModelName] = useState<string | null>(null);
  const [viewingWorkflowId, setViewingWorkflowId] = useState<number | null>(null);
  const [viewingWorkflowName, setViewingWorkflowName] = useState<string | null>(null);
  const [modelDetailState] = useAtom(modelDetailAtom);
  const [workflowDetailState] = useAtom(workflowDetailAtom);
  const clearDetail = useSetAtom(clearModelDetail);
  const clearWorkflow = useSetAtom(clearWorkflowDetail);
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
    // 只负责更新URL，状态由useEffect根据URL更新
    navigate(`${location.pathname}?model_id=${modelId}&model_name=${encodeURIComponent(modelName)}`);
  };

  // 处理查看工作流详情
  const handleViewWorkflowDetail = (workflowId: number, workflowName: string) => {
    // 只负责更新URL，状态由useEffect根据URL更新
    navigate(`${location.pathname}?workflow_id=${workflowId}&workflow_name=${encodeURIComponent(workflowName)}`);
  };

  // 处理返回到模型列表
  const handleBackToList = () => {
    // 只负责更新URL，状态由useEffect根据URL更新
    navigate(location.pathname);
  };

  // 从URL参数中获取参数并同步状态
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const modelId = searchParams.get('model_id');
    const modelName = searchParams.get('model_name');
    const workflowId = searchParams.get('workflow_id');
    const workflowName = searchParams.get('workflow_name');

    if (modelId && modelName) {
      // 进入模型详情页
      setViewingModelId(parseInt(modelId));
      setViewingModelName(modelName);
      // 清除工作流状态
      setViewingWorkflowId(null);
      setViewingWorkflowName(null);
      clearWorkflow();
    } else if (workflowId && workflowName) {
      // 进入工作流详情页
      setViewingWorkflowId(parseInt(workflowId));
      setViewingWorkflowName(workflowName);
      // 清除模型状态
      setViewingModelId(null);
      setViewingModelName(null);
      clearDetail();
    } else {
      // URL参数为空时，回到列表视图
      setViewingModelId(null);
      setViewingModelName(null);
      setViewingWorkflowId(null);
      setViewingWorkflowName(null);
      clearDetail();
      clearWorkflow();
    }
  }, [location.search]);

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
      { !viewingModelId && !viewingWorkflowId && <div ref={featureCardRef}>
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
                isModelDetailMode={true}
                modelName={modelDetailState.currentModel?.name || viewingModelName || 'Loading...'}
                onBackClick={handleBackToList}
              />
            </div>

            <div className={styles.contentBody} onWheel={handleWheel}>
              <ModelDetail modelId={viewingModelId} />
            </div>
          </>
        ) : viewingWorkflowId ? (
            <>
              <div className={styles.headerWrapper}>
                <ContentHeader
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    ownedOnly={ownedOnly}
                    setOwnedOnly={setOwnedOnly}
                    sortOption={sortOption}
                    setSortOption={setSortOption}
                    isWorkflowDetailMode={true}
                    modelName={workflowDetailState.currentWorkflow?.name || viewingWorkflowName || 'Loading...'}
                    onBackClick={handleBackToList}
                />
              </div>

              <div className={styles.contentBody} onWheel={handleWheel}>
                <WorkflowDetail workflowId={viewingWorkflowId} />
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
              ) : activeTab === 'workflows' ? (
                  <WorkflowsContent
                      ownedOnly={ownedOnly}
                      sortOption={sortOption}
                      onWorkflowClick={handleViewWorkflowDetail}
                  />
              ): (
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