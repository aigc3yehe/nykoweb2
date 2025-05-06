import {useEffect, useRef, useState} from 'react';
import {useAtom} from 'jotai';
import styles from './ChatWindow.module.css';
import clearIcon from '../assets/clear.svg';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
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
  toggleBetaMode
} from '../store/chatStore';
import {showDialogAtom} from '../store/dialogStore';
import {useLogin, usePrivy} from '@privy-io/react-auth';

interface ChatWindowProps {
  uuid: string;
  did?: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ uuid, did }) => {
  const [chatState] = useAtom(chatAtom);
  const [accountState] = useAtom(accountAtom);
  const [, addImageAction] = useAtom(addImage);
  const [, finishUploadImagesAction] = useAtom(finishUploadImages);
  const [, removeImageAction] = useAtom(removeImage);
  const [, clearChatAction] = useAtom(clearChat);
  const [, setUserInfoAction] = useAtom(setUserInfo);
  const [, showDialog] = useAtom(showDialogAtom);
  const [, checkConnection] = useAtom(checkConnectionStatus);
  const [, startHeartbeatAction] = useAtom(startHeartbeat);
  const [, stopHeartbeatAction] = useAtom(stopHeartbeat);
  const [, sendMessageAction] = useAtom(sendMessage);
  const [, toggleBetaModeAction] = useAtom(toggleBetaMode);

  // 添加滚动相关状态
  const [scrollHeight, setScrollHeight] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [clientHeight, setClientHeight] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const customScrollbarRef = useRef<HTMLDivElement>(null);

  const { authenticated } = usePrivy();

  const { login } = useLogin({
    onComplete: async ({ user }) => {
      console.log("login success", user);

      // 如果有用户信息，则调用用户创建API
      if (user) {
        await setUserInfoAction({
          uuid,
          did: user.id
        });
      }
    },
    onError: (error) => {
      console.error("login failed", error);
    },
  });

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
    setUserInfoAction({ uuid, did });
  }, [uuid, did, setUserInfoAction]);

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

  return (
    <div className={styles.chatWindow}>
      {/* 聊天标题栏 */}
      <div className={styles.chatHeader}>
        <div className={styles.headerTitle}>
          <div className={styles.avatar}>
            <img src="/nyko.png" alt="Niyoko" />
          </div>
          <div className={styles.titleWithStatus}>
            <span>you are chatting with Niyoko</span>
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
          {!authenticated || !did ? (
            <div className={styles.emptyMessages}>
              <div className={styles.loginRequired}>
                <p>Please login to start chatting with Niyoko</p>
                <button
                  className={styles.loginButton}
                  onClick={handleLogin}
                >
                  Login
                </button>
              </div>
            </div>
          ) : chatState.messages.length === 0 ? (
            <div className={styles.emptyMessages}>
              {isActive ? (
                <div className={styles.welcomeContainer}>
                  <p className={styles.welcomeText}>You can train models and generate images simply by chatting with Niyoko.</p>
                  <div className={styles.quickOptions}>
                    <button className={styles.quickOptionButton} onClick={() => sendMessageAction('I want to train a model.')}>
                      🧠 I want to train a model.
                    </button>
                    <button className={styles.quickOptionButton} onClick={() => sendMessageAction('I want to finetuning a model.')}>
                      🧠 I want to finetuning a model.
                    </button>
                    <button className={styles.quickOptionButton} onClick={() => sendMessageAction('I want to generate an image.')}>
                      🌄 I want to generate an image.
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
                imageWidth={message.imageInfo?.width || 256}
                imageHeight={message.imageInfo?.height || 256}
                request_id={message.request_id}
                onAddImage={() => addImageAction(index, 30 - (message.uploadedFiles?.length || 0))}
                onConfirmImages={() => finishUploadImagesAction(index)}
                onRemoveImage={(url) => removeImageAction({ messageIndex: index, fileUrl: url })}
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
      <ChatInput isLoading={chatState.isLoading || chatState.isGenerating} disabled={!authenticated || !did || !isActive || uploading} />
    </div>
  );
};

export default ChatWindow;