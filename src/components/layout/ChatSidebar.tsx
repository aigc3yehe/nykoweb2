import React, { useRef, useEffect, useState } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { useLocation } from 'react-router-dom'
import { chatSidebarAtom, closeChatSidebar } from '../../store/chatSidebarStore'
import { chatAtom, clearChat, sendHeartbeat, fetchConnectionStatus, sendMessage } from '../../store/assistantStore'
import { userStateAtom, showLoginModalAtom } from '../../store/loginStore'
import { showDialogAtom } from '../../store/dialogStore';
import { useI18n } from '../../hooks/useI18n'
import ChatInput from '../chat/ChatInput'
import ClearIcon from '../../assets/mavae/clear.svg'
import ClearIconDark from '../../assets/mavae/dark/clear.svg'
import CloseIcon from '../../assets/mavae/close.svg'
import CloseIconDark from '../../assets/mavae/dark/close.svg'
import ChatMessage from '../chat/ChatMessage'
import ThemeAdaptiveIcon from '../ui/ThemeAdaptiveIcon'

const ChatSidebar: React.FC = () => {
  const [sidebarState] = useAtom(chatSidebarAtom)
  const [chatState, setChatState] = useAtom(chatAtom)
  const [userState] = useAtom(userStateAtom)
  const closeSidebar = useSetAtom(closeChatSidebar)
  const clearChatMessages = useSetAtom(clearChat)
  const showDialog = useSetAtom(showDialogAtom);
  const showLoginModal = useSetAtom(showLoginModalAtom)
  const sendMessageAction = useSetAtom(sendMessage)
  const { t } = useI18n()
  const location = useLocation()

  // 添加useRef和useEffect for scrolling - 必须在条件渲染之前
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [inputHeight, setInputHeight] = useState(0)
  const inputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (sidebarState.isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatState.messages, sidebarState.isOpen])

  // 监听输入框高度变化
  useEffect(() => {
    if (!inputRef.current) return
    const updateHeight = () => {
      setInputHeight(inputRef.current!.offsetHeight)
    }
    updateHeight()
    const resizeObserver = new window.ResizeObserver(updateHeight)
    resizeObserver.observe(inputRef.current)
    return () => resizeObserver.disconnect()
  }, [sidebarState.isOpen])

  // 添加心跳useEffect
  useEffect(() => {
    if (!sidebarState.isOpen || !chatState.userUuid) return; // 添加userUuid检查

    const initConnection = async () => {
      try {
        const status = await fetchConnectionStatus(chatState.userUuid, chatState.betaMode);
        setChatState(prev => ({ ...prev, connection: status }));
      } catch (error) {
        console.error('Failed to init connection:', error);
      }
    };

    initConnection();

    const heartbeatInterval = setInterval(async () => {
      if (chatState.connection.isActive) {
        try {
          const status = await sendHeartbeat(chatState.userUuid, chatState.betaMode);
          setChatState(prev => ({ ...prev, connection: status }));
        } catch (error) {
          console.error('Heartbeat failed:', error);
          setChatState(prev => ({ 
            ...prev, 
            connection: { ...prev.connection, isActive: false } 
          }));
        }
      }
    }, 20000);

    return () => {
      clearInterval(heartbeatInterval);
    };
  }, [sidebarState.isOpen, chatState.userUuid, chatState.betaMode, chatState.connection.isActive, setChatState]);

  // 添加重连useEffect
  useEffect(() => {
    if (!sidebarState.isOpen || chatState.connection.isActive || !chatState.userUuid) return; // 添加userUuid检查

    const reconnectInterval = setInterval(async () => {
      try {
        const status = await fetchConnectionStatus(chatState.userUuid, chatState.betaMode);
        setChatState(prev => ({ ...prev, connection: status }));
      } catch (error) {
        console.error('Reconnect failed:', error);
      }
    }, 3000);

    return () => {
      clearInterval(reconnectInterval);
    };
  }, [sidebarState.isOpen, chatState.connection.isActive, chatState.userUuid, chatState.betaMode, setChatState]);

  // 判断是否在workflow或model详情页
  const isDetailPage = (() => {
    const path = location.pathname
    return /\/(en|zh-CN|zh-HK)\/workflow\//.test(path) || /\/(en|zh-CN|zh-HK)\/model\//.test(path)
  })()

  // 判断是否在需要隐藏聊天侧边栏的页面
  const shouldHideChatSidebar = (() => {
    const path = location.pathname
    // match /{lang}/pricing, /{lang}/workflow/builder, /{lang}/workflow/{id}/edit, /{lang}/style/trainer
    return /\/(en|zh-CN|zh-HK)\/pricing$/.test(path) ||
           /\/(en|zh-CN|zh-HK)\/workflow\/builder(\/.*)?$/.test(path) ||
           /\/(en|zh-CN|zh-HK)\/workflow\/.*\/edit$/.test(path) ||
           /\/(en|zh-CN|zh-HK)\/style\/trainer(\/.*)?$/.test(path)
  })()

  // 当侧边栏关闭时、不在详情页面时或在需要隐藏的页面时不渲染
  if (!sidebarState.isOpen || !isDetailPage || shouldHideChatSidebar) {
    return null
  }

  // 获取连接状态
  const getConnectionStatus = () => {
    if (chatState.connection.isActive) {
      return { color: '#00FF48', label: '已连接' }
    } else if (chatState.connection.inQueue) {
      return { color: '#FCD34D', label: '排队中' }
    } else {
      return { color: '#EF4444', label: '连接错误' }
    }
  }

  const connectionStatus = getConnectionStatus()

  const handleClear = () => {
    showDialog({
      open: true,
      title: 'Clear Chat History?',
      message: 'Are you sure you want to clear the chat history?',
      onConfirm: () => {
        clearChatMessages()
        showDialog({ open: false, title: '', message: '', onConfirm: () => {}, onCancel: () => {} })
      },
      onCancel: () => {
        showDialog({ open: false, title: '', message: '', onConfirm: () => {}, onCancel: () => {} })
      },
      confirmText: 'Delete',
      cancelText: 'Cancel',
    });
  }

  const handleClose = () => {
    closeSidebar()
  }

  const handleAnimate = () => {
    sendMessageAction('I want to animate this image.');
    console.log('handleAnimate')
  }

  const handlePartiallyModify = () => {
    sendMessageAction('I want to partially modify this image.');
    console.log('handlePartiallyModify')
  }

  return (
    <div className="fixed right-0 top-14 md:top-24 md:right-8 md:bottom-4 w-full md:w-[24.375rem] md:rounded-[1.25rem] bg-pop-ups dark:bg-pop-ups-dark z-30 flex flex-col bottom-0">
      {/* 标题栏 */}
      <div className="flex items-center justify-between h-[3.375rem] px-4 md:px-4 border-b border-line-subtle dark:border-line-subtle-dark bg-pop-ups dark:bg-pop-ups-dark rounded-t-[1.25rem]">
        {/* 左侧标题和状态 */}
        <div className="flex items-center gap-1.5">
          <h3 className="font-lexend font-medium text-base leading-none text-text-main dark:text-text-main-dark">
            Chat with Mavae
          </h3>
          <div 
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: connectionStatus.color }}
            title={connectionStatus.label}
          />
        </div>

        {/* 右侧按钮组 */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleClear}
            className="flex items-center justify-center w-6 h-6 hover:bg-tertiary dark:hover:bg-tertiary-dark rounded transition-colors"
            aria-label="Clear chat"
          >
            <ThemeAdaptiveIcon
              lightIcon={ClearIcon}
              darkIcon={ClearIconDark}
              alt="Clear"
              size="sm"
            />
          </button>
          <button
            onClick={handleClose}
            className="flex items-center justify-center w-6 h-6 hover:bg-tertiary dark:hover:bg-tertiary-dark rounded transition-colors"
            aria-label="Close chat"
          >
            <ThemeAdaptiveIcon
              lightIcon={CloseIcon}
              darkIcon={CloseIconDark}
              alt="Close"
              size="sm"
            />
          </button>
        </div>
      </div>

      {/* 消息列表区域 */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-hide pb-24">
        {!userState.isAuthenticated ? (
          // 未登录状态 - 显示登录提示
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="max-w-sm mx-auto">
              <h3 className="text-lg font-medium text-text-main dark:text-text-main-dark mb-4">
                {t('auth.loginRequired')} {/* en: Login Required / zh: 需要登录 */}
              </h3>
              <p className="text-text-secondary dark:text-text-secondary-dark mb-6">
                {t('auth.chatLoginMessage')} {/* en: Please log in to start chatting with Mavae / zh: 请登录后开始与 Mavae 聊天 */}
              </p>
              <button
                onClick={() => {
                  showLoginModal()
                  closeSidebar() // 关闭侧边栏，让用户专注于登录
                }}
                className="px-6 py-3 bg-link-default dark:bg-link-default-dark text-text-inverse dark:text-text-inverse-dark rounded-lg hover:bg-link-pressed dark:hover:bg-link-pressed transition-colors font-medium"
              >
                {t('auth.loginNow')} {/* en: Login Now / zh: 立即登录 */}
              </button>
            </div>
          </div>
        ) : (
          // 已登录状态 - 显示聊天界面
          <div className="flex flex-col min-h-full">
            {chatState.messages.map((message, index) => (
              <ChatMessage 
                key={index} 
                {...message}
                imageWidth={message.imageInfo?.width || 256}
                imageHeight={message.imageInfo?.height || 256}
                isLastMessage={index === chatState.messages.length - 1}
                onAnimate={handleAnimate}
                onPartiallyModify={handlePartiallyModify}
              />
            ))}
            
            {/* AI回复loading状态 */}
            {chatState.isLoading && (
              <div className="flex items-start mt-4">
                <div className="flex-1 min-w-0">
                  <div className="ai-typing">
                    <div className="ai-typing-dot ai-typing-dot-1 bg-design-main-blue dark:bg-design-dark-main-blue"></div>
                    <div className="ai-typing-dot ai-typing-dot-2 bg-design-light-green dark:bg-design-dark-light-green"></div>
                    <div className="ai-typing-dot ai-typing-dot-3 bg-design-medium-gray dark:bg-design-dark-medium-gray"></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
            {/* 留白div，高度与输入框一致 */}
            <div style={{ height: inputHeight, minHeight: 0, pointerEvents: 'none' }} aria-hidden />
          </div>
        )}
      </div>

      {/* 聊天输入框 - 悬浮在底部 - 只在已登录时显示 */}
      {userState.isAuthenticated && <ChatInput onHeightChange={setInputHeight} />}
    </div>
  )
}

export default ChatSidebar