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
import {showEditModelAtom, showEditWorkflowAtom} from "../store/editStore.ts";
import {FlaunchStatusResponse, tokenizationStateAtom} from "../store/tokenStore.ts";
import AgentAppsContent from './AgentAppsContent';

const ContentDisplay: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'models' | 'workflows' | 'images' | 'agentApps'>('workflows');
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

  const showEditModel = useSetAtom(showEditModelAtom);
  const showEditWorkflow = useSetAtom(showEditWorkflowAtom);
  const [tokenizationState] = useAtom(tokenizationStateAtom);
  const { data } = tokenizationState;

  // 新增吸顶状态
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);
  const featureCardRef = useRef<HTMLDivElement>(null);
  const contentDisplayRef = useRef<HTMLDivElement>(null);

  // 处理滚动事件的阻止冒泡问题
  const handleWheel = (e: React.WheelEvent) => {
    // 允许滚动事件向上冒泡到主滚动容器
    e.stopPropagation = () => {};
  };

  // 修改setActiveTab函数，同时更新URL参数
  const handleSetActiveTab = (tab: 'models' | 'workflows' | 'images' | 'agentApps') => {
    setActiveTab(tab);
    
    // 更新URL参数
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('tab', tab);
    
    // 保持其他参数不变，只更新tab参数
    navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true });
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
    // 返回时保持当前的tab状态
    const searchParams = new URLSearchParams();
    searchParams.set('tab', activeTab);
    navigate(`${location.pathname}?${searchParams.toString()}`);
  };

  // 点击分享按钮触发x的分享
  const handleShareModelDetail = () => {
    const model = modelDetailState.currentModel
    if (!model) {
      return;
    }
    // 1. 获取当前页面URL并构建设模型链接
    const currentUrl = window.location.href;
    const modelLinkUrl = new URL(currentUrl);
    // 确保分享链接是模型详情页的基础链接，不包含其他可能存在的查询参数，然后添加模型ID和名称
    const baseUrl = `${modelLinkUrl.protocol}//${modelLinkUrl.host}${modelLinkUrl.pathname}`;
    const shareUrl = new URL(baseUrl);
    shareUrl.searchParams.set("model_id", model.id.toString());
    shareUrl.searchParams.set("model_name", model.name);
    const modelLink = shareUrl.toString();

    // 修改 renderTokenizationStatus 函数中的完成状态部分
    let symbol = "";
    if (data && "success" in data && "state" in data) {
      // 如果是 FlaunchStatusResponse
      const statusData = data as FlaunchStatusResponse;
      if (statusData.state === "completed" && statusData.collectionToken) {
        symbol = statusData.collectionToken.symbol;
      }
    }

    console.log(symbol);

    // 2. 根据是否有代币确定分享文本
    let tweetText = "";
    const modelName = model.name;

    if (symbol) {
      tweetText = `This style is insane!\n${modelName} is an amazing AI model I found on @niyoko_agent \nit even has its own token $${symbol}\nCome create and trade with me!\n${modelLink}`;
    } else {
      tweetText = `This style is insane!\n${modelName} is an amazing AI model I found on @niyoko_agent \nCome create and mine with me!\n${modelLink}`;
    }

    // 3. 构建 Twitter Intent URL
    const encodedTweetText = encodeURIComponent(tweetText);
    const twitterUrl = `https://x.com/intent/post?text=${encodedTweetText}`;

    // 4. 在新标签页中打开 Twitter 分享链接
    window.open(twitterUrl, "_blank", "noopener,noreferrer");
  };

  const handleEditModelDetail = () => {
    if (modelDetailState.currentModel) {
      showEditModel(modelDetailState.currentModel);
    }
  }

  // 点击分享按钮触发x的分享
  const handleShareWorkflowDetail = () => {
    const workflow = workflowDetailState.currentWorkflow
    if (!workflow) {
      return;
    }
    // 1. 获取当前页面URL并构建设模型链接
    const currentUrl = window.location.href;
    const workflowLinkUrl = new URL(currentUrl);
    // 确保分享链接是模型详情页的基础链接，不包含其他可能存在的查询参数，然后添加模型ID和名称
    const baseUrl = `${workflowLinkUrl.protocol}//${workflowLinkUrl.host}${workflowLinkUrl.pathname}`;
    const shareUrl = new URL(baseUrl);
    shareUrl.searchParams.set("workflow_id", workflow.id.toString());
    shareUrl.searchParams.set("workflow_name", workflow.name);
    const workflowLink = shareUrl.toString();

    // 修改 renderTokenizationStatus 函数中的完成状态部分
    let symbol = "";
    if (data && "success" in data && "state" in data) {
      // 如果是 FlaunchStatusResponse
      const statusData = data as FlaunchStatusResponse;
      if (statusData.state === "completed" && statusData.collectionToken) {
        symbol = statusData.collectionToken.symbol;
      }
    }

    console.log(symbol);

    // 2. 根据是否有代币确定分享文本
    let tweetText = "";
    const workflowName = workflow.name;

    if (symbol) {
      tweetText = `This style is insane!\n${workflowName} is an amazing AI workflow I found on @niyoko_agent \nit even has its own token $${symbol}\nCome create and trade with me!\n${workflowLink}`;
    } else {
      tweetText = `This style is insane!\n${workflowName} is an amazing AI workflow I found on @niyoko_agent \nCome create and mine with me!\n${workflowLink}`;
    }

    // 3. 构建 Twitter Intent URL
    const encodedTweetText = encodeURIComponent(tweetText);
    const twitterUrl = `https://x.com/intent/post?text=${encodedTweetText}`;

    // 4. 在新标签页中打开 Twitter 分享链接
    window.open(twitterUrl, "_blank", "noopener,noreferrer");
  };


  const handleEditWorkflowDetail = () => {
    if (workflowDetailState.currentWorkflow) {
      showEditWorkflow(workflowDetailState.currentWorkflow);
    }
  }

  // 从URL参数中获取参数并同步状态
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const modelId = searchParams.get('model_id');
    const modelName = searchParams.get('model_name');
    const workflowId = searchParams.get('workflow_id');
    const workflowName = searchParams.get('workflow_name');
    const tabParam = searchParams.get('tab') as 'models' | 'workflows' | 'images' | 'agentApps' | null;

    // 同步tab状态
    if (tabParam && ['models', 'workflows', 'images', 'agentApps'].includes(tabParam)) {
      setActiveTab(tabParam);
    } else if (!modelId && !workflowId) {
      // 如果没有tab参数且不在详情页，设置默认tab并更新URL
      const defaultTab = 'workflows';
      setActiveTab(defaultTab);
      if (!tabParam) {
        searchParams.set('tab', defaultTab);
        navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true });
      }
    }

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
                setActiveTab={handleSetActiveTab}
                ownedOnly={ownedOnly}
                setOwnedOnly={setOwnedOnly}
                sortOption={sortOption}
                setSortOption={setSortOption}
                isModelDetailMode={true}
                modelName={modelDetailState.currentModel?.name || viewingModelName || 'Loading...'}
                onBackClick={handleBackToList}
                tags={modelDetailState.currentModel?.tags}
                onShareClick={handleShareModelDetail}
                onEditClick={handleEditModelDetail}
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
                    setActiveTab={handleSetActiveTab}
                    ownedOnly={ownedOnly}
                    setOwnedOnly={setOwnedOnly}
                    sortOption={sortOption}
                    setSortOption={setSortOption}
                    isWorkflowDetailMode={true}
                    modelName={workflowDetailState.currentWorkflow?.name || viewingWorkflowName || 'Loading...'}
                    onBackClick={handleBackToList}
                    tags={workflowDetailState.currentWorkflow?.tags}
                    onShareClick={handleShareWorkflowDetail}
                    onEditClick={handleEditWorkflowDetail}
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
                setActiveTab={handleSetActiveTab}
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
              ) : activeTab === 'images' ? (
                <ImagesContent ownedOnly={ownedOnly} />
              ) : (
                <AgentAppsContent />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ContentDisplay;