import { useEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import styles from './ChatWindow.module.css';
import clearIcon from '../assets/clear.svg';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { 
  chatAtom, 
  addImage, 
  confirmImages, 
  removeImage, 
  clearChat,
  setUserInfo 
} from '../store/chatStore';

interface ChatWindowProps {
  uuid: string;
  walletAddress?: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ uuid, walletAddress }) => {
  const [chatState] = useAtom(chatAtom);
  const [, addImageAction] = useAtom(addImage);
  const [, confirmImagesAction] = useAtom(confirmImages);
  const [, removeImageAction] = useAtom(removeImage);
  const [, clearChatAction] = useAtom(clearChat);
  const [, setUserInfoAction] = useAtom(setUserInfo);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 设置用户ID
  useEffect(() => {
    setUserInfoAction({ uuid, walletAddress });
  }, [uuid, walletAddress, setUserInfoAction]);

  useEffect(() => {
    // 滚动到最新消息
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatState.messages]);

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
        <button className={styles.clearButton} onClick={clearChatAction}>
          <img src={clearIcon} alt="Clear chat" />
        </button>
      </div>

      {/* 消息列表 */}
      <div className={styles.messagesContainer}>
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
              onAddImage={() => addImageAction(index)}
              onConfirmImages={() => confirmImagesAction(index)}
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

      {/* 底部输入区域组件 */}
      <ChatInput isLoading={chatState.isLoading} />
    </div>
  );
};

export default ChatWindow;