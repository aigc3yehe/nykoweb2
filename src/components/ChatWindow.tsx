import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { useAtom } from 'jotai';
import styles from './ChatWindow.module.css';
import clearIcon from '../assets/clear.svg';
import sendIcon from '../assets/send.svg';
import sendActiveIcon from '../assets/send_activating.svg';
import closeIcon from '../assets/close.svg';
import imageIcon from '../assets/image.svg';
import downIcon from '../assets/down.svg';
import { pxToRem } from '../utils';
import ChatMessage from './ChatMessage';
import { chatAtom, sendChatRequest, updateImageUploadState, updateUploadedFiles, removeUploadedFile, Message } from '../store/chatStore';
import { 
  imageUploadAtom, 
  setImageUploadStateAtom, 
  updateMessageUrlsAtom, 
  showToastAtom, 
  uploadImages 
} from '../store/imagesStore';

interface Tag {
  id: string;
  text: string;
  type: 'normal' | 'closeable' | 'imageRatio';
  value?: string;
  ratio?: string;
}

interface ChatWindowProps {
  uuid: string;
  walletAddress?: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ uuid, walletAddress }) => {
  const [input, setInput] = useState('');
  const [chatState, setChatState] = useAtom(chatAtom);
  const [imageUploadState, setImageUploadState] = useAtom(imageUploadAtom);
  const [, setImageUploadStateAction] = useAtom(setImageUploadStateAtom);
  const [, updateMessageUrls] = useAtom(updateMessageUrlsAtom);
  const [, showToast] = useAtom(showToastAtom);
  const [activeTags, setActiveTags] = useState<Tag[]>([]);
  const [scrollHeight, setScrollHeight] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [clientHeight, setClientHeight] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const customScrollbarRef = useRef<HTMLDivElement>(null);

  // 设置用户ID
  useEffect(() => {
    setChatState(prev => ({
      ...prev,
      userUuid: uuid,
      walletAddress: walletAddress
    }));
  }, [uuid, walletAddress, setChatState]);

  useEffect(() => {
    // 滚动到最新消息
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatState.messages]);

  // 自动调整文本框高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 220)}px`;
      
      // 更新滚动条状态
      setScrollHeight(textareaRef.current.scrollHeight);
      setClientHeight(textareaRef.current.clientHeight);
      setScrollTop(textareaRef.current.scrollTop);
    }
  }, [input]);

  // 监听textarea的滚动事件
  const handleTextareaScroll = () => {
    if (textareaRef.current) {
      setScrollTop(textareaRef.current.scrollTop);
    }
  };

  // 模拟一些实时标签
  useEffect(() => {
    setActiveTags([
      { id: '1', text: 'Task', type: 'normal', value: 'finetuing' },
      { id: '2', text: 'Lora', type: 'closeable', value: 'Artistic Style' },
      { id: '3', text: 'image', type: 'imageRatio', ratio: '16:9' },
      { id: '4', text: 'Base Model', type: 'normal', value: '1sereera34' },
      { id: '5', text: 'Technology', type: 'closeable', value: 'inactive' },
    ]);
  }, []);

  // 处理标签删除
  const handleTagDelete = (tagId: string) => {
    setActiveTags(prev => prev.filter(tag => tag.id !== tagId));
  };

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || chatState.isLoading) return;

    // 添加用户消息到聊天记录
    const userMessage: Message = { 
      role: 'user', 
      content: input
    };
    
    // 更新状态为加载中
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null
    }));
    
    setInput('');

    try {
      // 发送请求到API
      const response = await sendChatRequest(
        userMessage.content,
        chatState.messages,
        chatState.userUuid,
        chatState.walletAddress
      );

      const status = response.status;
      const content = response.content;
      const conversation = response.conversation;

      // 处理API响应
      if (status === 'error') {
        throw new Error(content || '发送消息时出错');
      }

      // 根据status的类型，更新消息的类型
      let messageType = 'text';
      if (status === 'upload_image') {
        messageType = 'upload_image';
      }

      console.log('messageType', messageType);

      const receivedMessage: Message = {
        role: 'assistant',
        content: content,
        type: messageType as 'text' | 'upload_image',
        imageUploadState: messageType === 'upload_image' 
          ? { totalCount: 0, uploadedCount: 0, isUploading: false } 
          : undefined
      };

      const newMessages = [...chatState.messages, userMessage, receivedMessage];

      // 更新消息历史
      setChatState(prev => ({
        ...prev,
        messages: newMessages,
        isLoading: false
      }));
    } catch (error) {
      console.error('发送消息时出错:', error);
      
      // 更新错误状态
      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, { 
          role: 'system', 
          content: error instanceof Error ? error.message : '发送消息时出错，请重试。'
        }],
        isLoading: false,
        error: error instanceof Error ? error.message : '发送消息时出错'
      }));
    }
  };

  // 处理添加图片
  const handleAddImage = async (messageIndex: number) => {
    // 创建一个文件选择对话框
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    
    input.onchange = async (event) => {
      const target = event.target as HTMLInputElement;
      const files = target.files;
      
      if (!files || files.length === 0) return;
      
      // 根据现有的uploadedFiles获取当前消息
      const currentMessage = chatState.messages[messageIndex];
      const existingFiles = currentMessage.uploadedFiles || [];
      
      try {
        // 设置上传状态
        setChatState(prev => ({
          ...prev,
          messages: updateImageUploadState(prev.messages, messageIndex, {
            totalCount: files.length,
            uploadedCount: 0,
            isUploading: true
          })
        }));
        
        // 准备要上传的文件信息
        const filesWithNames = Array.from(files).map(file => ({
          file,
          name: file.name
        }));
        
        // 使用uploadImages函数上传图片
        const uploadedUrls = await uploadImages(
          messageIndex,
          Array.from(files),
          // 设置上传状态的回调
          (state) => setImageUploadStateAction(state),
          // 更新消息URL的回调
          ({ messageId, url, progress }) => {
            // 更新上传进度
            setChatState(prev => ({
              ...prev,
              messages: updateImageUploadState(prev.messages, messageId, {
                uploadedCount: Math.floor(files.length * (progress / 100)),
                isUploading: progress < 100
              })
            }));
            
            // 更新URL到状态
            updateMessageUrls({ messageId, url, progress });
          },
          // 显示通知的回调
          (params) => showToast(params)
        );
        
        // 上传完成后，更新uploadedFiles
        if (uploadedUrls && uploadedUrls.length > 0) {
          // 将新上传的文件与之前的合并
          const newUploadedFiles = [
            ...existingFiles,
            ...uploadedUrls.map((url, index) => ({
              name: filesWithNames[index]?.name || `image_${index}.jpg`,
              url
            }))
          ];
          
          // 更新消息的uploadedFiles
          setChatState(prev => ({
            ...prev,
            messages: updateUploadedFiles(prev.messages, messageIndex, newUploadedFiles)
          }));
        }
        
        // 上传完成，更新上传状态
        setChatState(prev => ({
          ...prev,
          messages: updateImageUploadState(prev.messages, messageIndex, {
            isUploading: false
          })
        }));
      } catch (error) {
        console.error('Error uploading images:', error);
        
        // 更新错误状态
        setChatState(prev => ({
          ...prev,
          messages: updateImageUploadState(prev.messages, messageIndex, {
            isUploading: false
          })
        }));
        
        // 显示错误通知
        showToast({ 
          message: '图片上传失败',
          severity: 'error'
        });
      }
    };
    
    input.click();
  };

  // 处理确认图片
  const handleConfirmImages = async (messageIndex: number) => {
    // 获取对应消息
    const message = chatState.messages[messageIndex];
    if (!message || message.type !== 'upload_image' || !message.uploadedFiles || message.uploadedFiles.length === 0) {
      showToast({ 
        message: '请先上传图片',
        severity: 'warning'
      });
      return;
    }

    try {
      // 获取已上传的图片URL
      const uploadedUrls = message.uploadedFiles.map(file => file.url);
      
      // 显示确认中状态
      setChatState(prev => ({
        ...prev,
        messages: prev.messages.map((msg, idx) => {
          if (idx === messageIndex) {
            return {
              ...msg,
              content: msg.content + "\n[图片已确认]"
            };
          }
          return msg;
        })
      }));
      
      // 这里可以添加向后端发送确认的逻辑
      console.log('图片已确认，URLs:', uploadedUrls);
      
      // 显示成功通知
      showToast({ 
        message: '图片已确认',
        severity: 'success'
      });
      
      // 发送新的请求给后端，带上图片URL
      const response = await sendChatRequest(
        '处理已上传的图片',
        chatState.messages,
        chatState.userUuid,
        chatState.walletAddress,
        uploadedUrls
      );
      
      // 处理响应
      if (response.status === 'error') {
        throw new Error(response.content || '处理图片时出错');
      }
      
      // 更新消息历史
      setChatState(prev => ({
        ...prev,
        messages: response.conversation.map((msg: Message) => msg)
      }));
      
      // 清空上传状态
      setImageUploadStateAction({
        isUploading: false,
        progress: 0,
        uploadedUrls: []
      });
    } catch (error) {
      console.error('处理图片时出错:', error);
      
      // 显示错误通知
      showToast({ 
        message: '处理图片失败',
        severity: 'error'
      });
    }
  };

  // 处理移除图片
  const handleRemoveImage = (messageIndex: number, fileUrl: string) => {
    // 更新消息中的uploadedFiles
    setChatState(prev => ({
      ...prev,
      messages: removeUploadedFile(prev.messages, messageIndex, fileUrl)
    }));
    
    // 从imageUploadState中也移除URL
    setImageUploadStateAction({
      uploadedUrls: imageUploadState.uploadedUrls.filter(url => url !== fileUrl)
    });
  };

  // 处理按键事件
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 清空聊天记录
  const handleClearChat = () => {
    setChatState(prev => ({
      ...prev,
      messages: []
    }));
  };

  // 处理自定义滚动条拖动
  const handleScrollThumbDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    const startY = e.clientY;
    const startScrollTop = scrollTop;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (textareaRef.current) {
        const deltaY = moveEvent.clientY - startY;
        const scrollRatio = deltaY / clientHeight;
        const newScrollTop = startScrollTop + scrollRatio * scrollHeight;
        
        textareaRef.current.scrollTop = newScrollTop;
        setScrollTop(textareaRef.current.scrollTop);
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
              onAddImage={() => handleAddImage(index)}
              onConfirmImages={() => handleConfirmImages(index)}
              onRemoveImage={(url) => handleRemoveImage(index, url)}
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

      {/* 底部区域（实时标签和输入框） */}
      <div className={styles.bottomContainer}>
        {/* 实时标签组件 */}
        {activeTags.length > 0 && (
          <div className={styles.tagsContainer}>
            {activeTags.map(tag => {
              if (tag.type === 'closeable') {
                return (
                  <div key={tag.id} className={styles.tagWithClose}>
                    <img 
                      src={closeIcon} 
                      alt="Close" 
                      className={styles.closeIcon}
                      onClick={() => handleTagDelete(tag.id)}
                    />
                    <span className={styles.text}>{tag.text}</span>
                    <span className={styles.value}>{tag.value}</span>
                  </div>
                );
              } else if (tag.type === 'imageRatio') {
                return (
                  <div key={tag.id} className={styles.imageRatioTag}>
                    <img src={imageIcon} alt="Image" className={styles.leftIcon} />
                    <span className={styles.ratioText}>{tag.ratio}</span>
                    <img src={downIcon} alt="Down" className={styles.rightIcon} />
                  </div>
                );
              } else {
                return (
                  <div key={tag.id} className={styles.tag}>
                    <span className={styles.text}>{tag.text}</span>
                    <span className={styles.value}>{tag.value}</span>
                  </div>
                );
              }
            })}
          </div>
        )}

        {/* 输入框组件 */}
        <div className={`${styles.inputContainer} ${input ? styles.hasContent : ''}`}>
          <div className={styles.textareaWrapper}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              onScroll={handleTextareaScroll}
              placeholder="Write something here..."
              rows={1}
              className={styles.hideScrollbar}
            />
            <div className={styles.sendButtonContainer}>
              <button
                className={styles.sendButton}
                onClick={handleSendMessage}
                disabled={!input.trim() || chatState.isLoading}
              >
                <img src={input.trim() ? sendActiveIcon : sendIcon} alt="Send" />
              </button>
            </div>
          </div>
          
          {/* 自定义滚动条 */}
          {showCustomScrollbar && (
            <div className={styles.customScrollbarTrack}>
              <div 
                ref={customScrollbarRef}
                className={styles.customScrollbarThumb}
                style={{
                  height: `${getScrollThumbHeight()}px`,
                  top: `${getScrollThumbTop()}px`
                }}
                onMouseDown={handleScrollThumbDrag}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;