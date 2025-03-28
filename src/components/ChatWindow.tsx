import { useEffect, useRef, useState } from 'react';
import { useAtom } from 'jotai';
import styles from './ChatWindow.module.css';
import clearIcon from '../assets/clear.svg';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { 
  chatAtom, 
  addImage, 
  removeImage, 
  clearChat,
  setUserInfo 
} from '../store/chatStore';
import { showDialogAtom } from '../store/dialogStore';

interface ChatWindowProps {
  uuid: string;
  did?: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ uuid, did }) => {
  const [chatState] = useAtom(chatAtom);
  const [, addImageAction] = useAtom(addImage);
  const [, removeImageAction] = useAtom(removeImage);
  const [, clearChatAction] = useAtom(clearChat);
  const [, setUserInfoAction] = useAtom(setUserInfo);
  const [, showDialog] = useAtom(showDialogAtom);
  
  // 添加滚动相关状态
  const [scrollHeight, setScrollHeight] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [clientHeight, setClientHeight] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const customScrollbarRef = useRef<HTMLDivElement>(null);

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
        const newScrollTop = startScrollTop + scrollRatio * scrollHeight;
        
        messagesContainerRef.current.scrollTop = newScrollTop;
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

  return (
    <div className={styles.chatWindow}>
      {/* 聊天标题栏 */}
      <div className={styles.chatHeader}>
        <div className={styles.headerTitle}>
          <div className={styles.avatar}>
            <img src="/nyko.png" alt="Niyoko" />
          </div>
          <span>you are chatting with Niyoko</span>
        </div>
        <button className={styles.clearButton} onClick={handleClearChat}>
          <img src={clearIcon} alt="Clear chat" />
        </button>
      </div>

      {/* 消息列表容器 */}
      <div className={styles.messagesContainerWrapper}>
        <div 
          ref={messagesContainerRef}
          className={`${styles.messagesContainer} ${styles.hideScrollbar}`}
        >
          {chatState.messages.length === 0 ? (
            <div className={styles.emptyMessages}>
              <p>开始与Niyoko对话吧</p>
            </div>
          ) : (
            chatState.messages.map((message, index) => (
              <ChatMessage 
                key={index}
                role={message.role as 'user' | 'assistant'}
                content={message.content}
                type={message.type || 'text'}
                imageUploadState={message.imageUploadState}
                uploadedFiles={message.uploadedFiles}
                modelParam={message.modelParam}
                images={message.images}
                imageWidth={message.imageInfo?.width || 256}
                imageHeight={message.imageInfo?.height || 256}
                request_id={message.request_id}
                onAddImage={() => addImageAction(index)}
                onConfirmImages={() => {}}
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
      <ChatInput isLoading={chatState.isLoading || chatState.isGenerating} />
    </div>
  );
};

export default ChatWindow;