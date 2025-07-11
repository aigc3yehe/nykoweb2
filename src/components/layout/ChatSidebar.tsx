import React, { useRef, useEffect, useState } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { chatSidebarAtom, closeChatSidebar } from '../../store/chatSidebarStore'
import { chatAtom, clearChat, sendHeartbeat, fetchConnectionStatus, sendMessage } from '../../store/assistantStore'
import { showDialogAtom } from '../../store/dialogStore';
import ChatInput from '../chat/ChatInput'
import ClearIcon from '../../assets/web2/clear.svg'
import CloseChatIcon from '../../assets/web2/close_chat.svg'
import ChatMessage from '../chat/ChatMessage'

const ChatSidebar: React.FC = () => {
  const [sidebarState] = useAtom(chatSidebarAtom)
  const [chatState, setChatState] = useAtom(chatAtom)
  const closeSidebar = useSetAtom(closeChatSidebar)
  const clearChatMessages = useSetAtom(clearChat)
  const showDialog = useSetAtom(showDialogAtom);
  const sendMessageAction = useSetAtom(sendMessage)

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

  // 当侧边栏关闭时不渲染
  if (!sidebarState.isOpen) {
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
    <div className="fixed right-0 top-14 bottom-0 w-full md:w-[34.5rem] bg-white border-l border-design-bg-light-gray z-30 flex flex-col">
      {/* 标题栏 */}
      <div className="flex items-center justify-between h-12 px-6 border-b border-design-line-light-gray">
        {/* 左侧标题和状态 */}
        <div className="flex items-center gap-1.5">
          <h3 className="font-lexend font-medium text-base leading-none text-design-main-text">
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
            className="flex items-center justify-center w-6 h-6 hover:bg-gray-100 rounded transition-colors"
            aria-label="Clear chat"
          >
            <img src={ClearIcon} alt="Clear" className="w-6 h-6" />
          </button>
          <button
            onClick={handleClose}
            className="flex items-center justify-center w-6 h-6 hover:bg-gray-100 rounded transition-colors"
            aria-label="Close chat"
          >
            <img src={CloseChatIcon} alt="Close" className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* 消息列表区域 */}
             <div className="flex-1 overflow-y-auto p-6">
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
           <div ref={messagesEndRef} />
           {/* 留白div，高度与输入框一致 */}
          <div style={{ height: inputHeight, minHeight: 0, pointerEvents: 'none' }} aria-hidden />
         </div>
       </div>

      {/* 聊天输入框 - 悬浮在底部 */}
      <ChatInput onHeightChange={setInputHeight} />
    </div>
  )
}

export default ChatSidebar 