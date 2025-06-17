import React, {useEffect, useRef, useState} from 'react';
import {useAtom} from 'jotai';
import styles from './ChatWindow.module.css';
import clearIcon from '../assets/clear.svg';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

import WarningIcon from "../assets/warning.svg";
import {accountAtom} from "../store/accountStore";
import {
  addImage,
  chatAtom,
  checkConnectionStatus,
  clearChat,
  finishUploadImages,
  removeImage,
  sendMessage,
  setUserInfo,
  startHeartbeat,
  stopHeartbeat,
  toggleBetaMode,
  agree,
  createWorkflow,
  updateWorkflowPrompt,
  updateWorkflowInput,
  updateWorkflowOutput,
  setWorkflowImage,
  runWorkflow,
  uploadWorkflowReferenceImage,
  removeWorkflowReferenceImage,
  updateWorkflowExtraPrompt,
  fetchAIProviders,
  updateSelectedProvider,
  retryPolling,
} from '../store/chatStore';
import {showDialogAtom} from '../store/dialogStore';
import {useLogin, usePrivy} from '@privy-io/react-auth';
import {useNavigate} from "react-router-dom";
import {fetchWorkflows} from '../store/workflowStore';


const ChatWindow: React.FC = () => {
  const [chatState] = useAtom(chatAtom);
  const [accountState] = useAtom(accountAtom);
  const [, addImageAction] = useAtom(addImage);
  const [, finishUploadImagesAction] = useAtom(finishUploadImages);
  const [, agreeAction] = useAtom(agree);
  const [, removeImageAction] = useAtom(removeImage);
  const [, clearChatAction] = useAtom(clearChat);
  const [, setUserInfoAction] = useAtom(setUserInfo);
  const [, showDialog] = useAtom(showDialogAtom);
  const [, checkConnection] = useAtom(checkConnectionStatus);
  const [, startHeartbeatAction] = useAtom(startHeartbeat);
  const [, stopHeartbeatAction] = useAtom(stopHeartbeat);
  const [, sendMessageAction] = useAtom(sendMessage);
  const [, toggleBetaModeAction] = useAtom(toggleBetaMode);
  const [, createWorkflowAction] = useAtom(createWorkflow);
  const [, updateWorkflowPromptAction] = useAtom(updateWorkflowPrompt);
  const [, updateWorkflowInputAction] = useAtom(updateWorkflowInput);
  const [, updateWorkflowOutputAction] = useAtom(updateWorkflowOutput);
  const [, setWorkflowImageAction] = useAtom(setWorkflowImage);
  const [, runWorkflowAction] = useAtom(runWorkflow);
  const [, fetchWorkflowsAction] = useAtom(fetchWorkflows);
  const [, uploadWorkflowReferenceImageAction] = useAtom(uploadWorkflowReferenceImage);
  const [, removeWorkflowReferenceImageAction] = useAtom(removeWorkflowReferenceImage);
  const [, updateWorkflowExtraPromptAction] = useAtom(updateWorkflowExtraPrompt);
  const [, fetchAIProvidersAction] = useAtom(fetchAIProviders);
  const [, updateSelectedProviderAction] = useAtom(updateSelectedProvider);
  const [, retryPollingAction] = useAtom(retryPolling);
  // 当前工作流消耗的积分
  const [currentWorkflowCredit, setCurrentWorkflowCredit] = useState(50);
  // 当前模型消耗的积分
  const [currentModelCredit, setCurrentModelCredit] = useState(5);

  // 添加滚动相关状态
  const [scrollHeight, setScrollHeight] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [clientHeight, setClientHeight] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const customScrollbarRef = useRef<HTMLDivElement>(null);

  const { authenticated } = usePrivy();
  const navigate = useNavigate();

  const { login } = useLogin();

  const handleLogin = async () => {
    try {
      // 使用Twitter作为OAuth提供者
      // await initOAuth({ provider: 'twitter' });
      login();
    } catch (error) {
      console.error("login Twitter failed:", error);
    }
  };

  const uploading = chatState.messages.some(msg => msg.imageUploadState?.isUploading)

  // 设置用户ID
  useEffect(() => {
    const uuid = accountState.twitter?.subject;
    const wallet_address = accountState.walletAddress || undefined;
    const did = accountState.did || undefined;
    setUserInfoAction({ uuid, did, wallet_address });
  }, [accountState, setUserInfoAction]);

  // 监听左侧当前工作流
  useEffect(() => {
    const workflow = chatState.currentWorkflow;
    if (workflow) {
      setCurrentWorkflowCredit(workflow.cu);
    } else {
      setCurrentWorkflowCredit(50);
    }
  }, [chatState.currentWorkflow]);

  // 监听左侧当前模型
  useEffect(() => {
    const model = chatState.currentModel;
    if (model) {
      setCurrentModelCredit(model.cu);
    } else {
      setCurrentModelCredit(5);
    }
  }, [chatState.currentModel]);

  // 监听工作流创建成功状态，刷新工作流列表
  useEffect(() => {
    if (chatState.workflowCreation.isSuccess && chatState.workflowCreation.workflowId) {
      // 刷新工作流列表
      fetchWorkflowsAction({ reset: true });
    }
  }, [chatState.workflowCreation.isSuccess, chatState.workflowCreation.workflowId, fetchWorkflowsAction]);

  // 更新滚动状态
  useEffect(() => {
    const updateScrollInfo = () => {
      if (messagesContainerRef.current) {
        setScrollHeight(messagesContainerRef.current.scrollHeight);
        setClientHeight(messagesContainerRef.current.clientHeight);
        setScrollTop(messagesContainerRef.current.scrollTop);
      }
    };

    // 初始更新
    updateScrollInfo();

    // 添加滚动事件监听器
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', updateScrollInfo);
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', updateScrollInfo);
      }
    };
  }, [chatState.messages]);

  useEffect(() => {
    // 滚动到最新消息
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    // 更新滚动状态
    if (messagesContainerRef.current) {
      setScrollHeight(messagesContainerRef.current.scrollHeight);
      setClientHeight(messagesContainerRef.current.clientHeight);
      setScrollTop(messagesContainerRef.current.scrollTop);
    }
  }, [chatState.messages]);

  const handleClearChat = () => {
    showDialog({
      open: true,
      message: 'Delete Chat History?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: () => clearChatAction(),
      onCancel: () => {},
      confirmButtonColor: '#FF3C3D',
      cancelButtonColor: '#6366F1'
    });
  };



  // 处理自定义滚动条拖动
  const handleScrollThumbDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();

    const startY = e.clientY;
    const startScrollTop = scrollTop;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (messagesContainerRef.current) {
        const deltaY = moveEvent.clientY - startY;
        const scrollRatio = deltaY / clientHeight;
        messagesContainerRef.current.scrollTop = startScrollTop + scrollRatio * scrollHeight;
        setScrollTop(messagesContainerRef.current.scrollTop);
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // 计算滚动条高度和位置
  const getScrollThumbHeight = () => {
    if (scrollHeight <= clientHeight) return 0;
    return Math.max(30, (clientHeight / scrollHeight) * clientHeight);
  };

  const getScrollThumbTop = () => {
    if (scrollHeight <= clientHeight) return 0;
    return (scrollTop / (scrollHeight - clientHeight)) * (clientHeight - getScrollThumbHeight());
  };

  // 显示自定义滚动条的条件
  const showCustomScrollbar = scrollHeight > clientHeight;

  // 处理检查连接状态按钮点击
  const handleCheckConnection = () => {
    checkConnection();
  };

  // 获取连接状态信息
  const { connection } = chatState;
  const isActive = connection?.isActive;
  const inQueue = connection?.inQueue;
  const position = connection?.position;
  const estimateWaitTime = connection?.estimateWaitTime;

  // 管理心跳
  useEffect(() => {
    const isActive = chatState.connection?.isActive;
    const inQueue = chatState.connection?.inQueue;

    // 当连接状态变为活跃时启动心跳
    if ((isActive || inQueue) && !chatState.heartbeatId) {
      console.log('start heartbeat');
      startHeartbeatAction();
    }

    // 当连接状态变为非活跃时停止心跳
    if ((!isActive && !inQueue) && chatState.heartbeatId) {
      console.log('stop heartbeat');
      stopHeartbeatAction();
    }

    // 组件卸载时清理心跳
    return () => {
      if (chatState.heartbeatId) {
        console.log('remove heartbeat');
        stopHeartbeatAction();
      }
    };
  }, [chatState.connection?.inQueue, chatState.connection?.isActive, chatState.heartbeatId, startHeartbeatAction, stopHeartbeatAction]);

  // 修改工作流跳转处理函数
  const handleNavigateToWorkflow = (workflowName: string) => {
    // 从 chatState 中获取 workflowId
    const workflowId = chatState.workflowCreation.workflowId;
    if (workflowId) {
      // 跳转到主页面并带上工作流参数
      navigate(`/?workflow_id=${workflowId}&workflow_name=${encodeURIComponent(workflowName)}`);
    }
  };

  const maintenance = false; // TODO: 维护状态，请设置为true

  // 新增：扩展选项处理函数
  const handlePartiallyModify = (imageUrl?: string) => {
    if (imageUrl) {
      sendMessageAction('I want to partially modify this image.');
    }
  };

  const handleAnimate = (imageUrl?: string) => {
    if (imageUrl) {
      sendMessageAction('I want to animate this image.');
    }
  };

  const handleMintNFT = (imageUrl?: string) => {
    if (imageUrl) {
      sendMessageAction('I want to mint this image as NFT.');
    }
  };

  // 在组件挂载时获取AI服务提供商数据
  useEffect(() => {
    if (authenticated && accountState.did && !chatState.aiProviders.providers.length && !chatState.aiProviders.isLoading) {
      fetchAIProvidersAction();
    }
  }, [authenticated, accountState.did, chatState.aiProviders.providers.length, chatState.aiProviders.isLoading, fetchAIProvidersAction]);

  return (
    <div className={styles.chatWindow}>
      {maintenance && (
        <>
          {/* 维护title */}
          <div className={styles.maintenanceBanner}>
            <div className={styles.maintenanceInfo}>
              <img src={WarningIcon} alt="Warning" className={styles.warningIcon} />
              <span className={styles.maintenanceText}>Maintenance in progress. We'll be back soon!</span>
            </div>
          </div>
        </>
      )}
      {/* 聊天标题栏 */}
      <div className={styles.chatHeader}>
        <div className={styles.headerTitle}>
          <div className={styles.avatar}>
            <img src="/nyko.png" alt="Niyoko" />
          </div>
          <div className={styles.titleWithStatus}>
            <span>Chatting with Niyoko</span>
            <div
              className={styles.statusDot}
              style={{
                backgroundColor: isActive ? '#34C759' : inQueue ? '#FACC15' : '#FF3C3D'
              }}
              title={isActive ? 'Connected' : inQueue ? 'In Queue' : 'Disconnected'}
            />
          </div>
        </div>
        <div className={styles.headerControls}>
          {accountState.role === 'admin' && (
            <button
              className={`${styles.betaButton} ${chatState.betaMode ? styles.betaActive : ''}`}
              onClick={toggleBetaModeAction}
              title={chatState.betaMode ? 'Disable Beta API' : 'Enable Beta API'}
            >
              Beta
            </button>
          )}
          <button className={styles.clearButton} onClick={handleClearChat}>
            <img src={clearIcon} alt="Clear chat" />
          </button>
        </div>
      </div>

      {/* 消息列表容器 */}
      <div className={styles.messagesContainerWrapper}>
        <div
          ref={messagesContainerRef}
          className={`${styles.messagesContainer} ${styles.hideScrollbar}`}
        >
          {!authenticated || !accountState.did ? (
            <div className={styles.emptyMessages}>
              <div className={styles.loginRequired}>
                <p>Please log in to start chatting with Niyoko</p>
                <button
                  className={styles.loginButton}
                  onClick={handleLogin}
                >
                  Log in
                </button>
              </div>
            </div>
          ) : chatState.messages.length === 0 ? (
            <div className={styles.emptyMessages}>
              {isActive ? (
                <div className={styles.welcomeContainer}>
                  <p className={styles.welcomeText}>You can train models and generate images simply by chatting with Niyoko.</p>
                  <div className={styles.quickOptions}>
                    <button className={styles.quickOptionButton} onClick={() => sendMessageAction('launch a token for this model.')}>
                      💎 launch a token
                    </button>
                    <button className={styles.quickOptionButton} onClick={() => sendMessageAction('I want to FINETUNE a model.')}>
                      🧠 Finetune a model (7,500 Credits)
                    </button>
                    <button className={styles.quickOptionButton} onClick={() => sendMessageAction('I want to create a workflow.')}>
                      ⏳ Create a workflow (800 Credits)
                    </button>
                    <button className={styles.quickOptionButton} onClick={() => sendMessageAction('I want to generate an image.')}>
                      🌄 Generate an image ({currentModelCredit} Credits)
                    </button>
                    <button className={styles.quickOptionButton} onClick={() => sendMessageAction('I want to use this workflow.')}>
                      ✨ Use this workflow ({currentWorkflowCredit} Credits)
                    </button>
                  </div>
                </div>
              ) : inQueue ? (
                <div className={styles.queueStatus}>
                  <p>You are currently in queue. Position: {position}</p>
                  {estimateWaitTime && (
                    <p>Estimated waiting time: {Math.ceil(estimateWaitTime)} seconds.</p>
                  )}
                  <button
                    className={styles.checkStatusButton}
                    onClick={handleCheckConnection}
                    disabled={chatState.isLoading}
                  >
                    {chatState.isLoading ? 'Checking...' : 'Check status'}
                  </button>
                </div>
              ) : (
                <div className={styles.queueStatus}>
                  <p>Waiting to connect to Niyoko...</p>
                  <button
                    className={styles.checkStatusButton}
                    onClick={handleCheckConnection}
                    disabled={chatState.isLoading}
                  >
                    {chatState.isLoading ? 'Checking...' : 'Check status'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            chatState.messages.map((message, index) => (
              <ChatMessage
                key={index}
                role={message.role as 'user' | 'assistant' | 'system'}
                content={message.content}
                type={message.type || 'text'}
                imageUploadState={message.imageUploadState}
                uploadedFiles={message.uploadedFiles}
                modelParam={message.modelParam}
                images={message.images}
                cu={message.cu}
                imageWidth={message.imageInfo?.width || 256}
                imageHeight={message.imageInfo?.height || 256}
                videos={message.videos}
                request_id={message.request_id}
                agree={message.agree}
                token_id={message.token_id}
                workflow_name={chatState.workflow_name}
                workflow_description={chatState.workflow_description}
                workflow_prompt={chatState.workflow_prompt}
                workflow_input={chatState.workflow_input}
                workflow_output={chatState.workflow_output}
                isCreatingWorkflow={chatState.workflowCreation.isCreating}
                creationSuccess={chatState.workflowCreation.isSuccess}
                onAddImage={() => addImageAction(index, 30 - (message.uploadedFiles?.length || 0))}
                onConfirmImages={() => finishUploadImagesAction(index)}
                onRemoveImage={(url) => removeImageAction({ messageIndex: index, fileUrl: url })}
                onAgree={() => agreeAction(index)}
                onUpdatePrompt={(text) => updateWorkflowPromptAction(text)}
                onChangeInput={(type) => updateWorkflowInputAction(type)}
                onChangeOutput={(type) => updateWorkflowOutputAction(type)}
                onCreateWorkflow={createWorkflowAction}
                workflowId={message.type === 'run_workflow' ? chatState.workflowCreation.workflowId : undefined}
                workflowImageValue={chatState.workflowImageValue}
                isRunningWorkflow={chatState.workflowRunning.isRunning}
                isConfirmedWorkflow={chatState.workflowRunning.isSuccess}
                onSelectWorkflowImage={(url, file) => setWorkflowImageAction({ url, file })}
                onRunWorkflow={runWorkflowAction}
                onNavigateToWorkflow={handleNavigateToWorkflow}
                workflowReferenceImage={chatState.workflowReferenceImage}
                onUploadReferenceImage={uploadWorkflowReferenceImageAction}
                onRemoveReferenceImage={removeWorkflowReferenceImageAction}
                workflow_extra_prompt={chatState.workflow_extra_prompt}
                onUpdateWorkflowExtraPrompt={updateWorkflowExtraPromptAction}
                currentWorkflow={chatState.currentWorkflow}
                isLastMessage={index === chatState.messages.length - 1 &&
                  (message.type === 'generate_result' ||
                   message.type === 'workflow_generate_result' ||
                   message.type === 'generation_timeout' ||
                   message.type === 'tokenization_timeout' ||
                   message.type === 'minting_success')}
                onPartiallyModify={() => handlePartiallyModify(message.images?.[0])}
                onAnimate={() => handleAnimate(message.images?.[0])}
                onMintNFT={() => handleMintNFT(message.images?.[0])}
                onRetryPolling={() => retryPollingAction(index)}
                aiProviders={chatState.aiProviders}
                onSelectProvider={updateSelectedProviderAction}
              />
            ))
          )}
          {chatState.isLoading && (
            <div className={`${styles.message} ${styles.loading}`}>
              <div className={styles.typingIndicator}>
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 自定义滚动条 */}
        {showCustomScrollbar && (
          <div className={styles.messagesScrollbarTrack}>
            <div
              ref={customScrollbarRef}
              className={styles.messagesScrollbarThumb}
              style={{
                height: `${getScrollThumbHeight()}px`,
                top: `${getScrollThumbTop()}px`
              }}
              onMouseDown={handleScrollThumbDrag}
            />
          </div>
        )}
      </div>

      {/* 底部输入区域组件 */}
      <ChatInput isLoading={chatState.isLoading || chatState.isGenerating} disabled={!authenticated || !accountState.did || !isActive || uploading} />
    </div>
  );
};

export default ChatWindow;