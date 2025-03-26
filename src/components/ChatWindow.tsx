import { useEffect, useRef } from 'react';
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
import { dialogAtom, showDialogAtom } from '../store/dialogStore';

interface ChatWindowProps {
  uuid: string;
  walletAddress?: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ uuid, walletAddress }) => {
  const [chatState] = useAtom(chatAtom);
  const [, addImageAction] = useAtom(addImage);
  const [, removeImageAction] = useAtom(removeImage);
  const [, clearChatAction] = useAtom(clearChat);
  const [, setUserInfoAction] = useAtom(setUserInfo);
  const [, showDialog] = useAtom(showDialogAtom);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 设置用户ID
  useEffect(() => {
    setUserInfoAction({ uuid, walletAddress });
  }, [uuid, walletAddress, setUserInfoAction]);

  useEffect(() => {
    // 滚动到最新消息
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
              modelParam={message.modelParam}
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

      {/* 底部输入区域组件 */}
      <ChatInput isLoading={chatState.isLoading} />
    </div>
  );
};

export default ChatWindow;