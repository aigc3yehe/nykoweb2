import {ChangeEvent, useEffect, useRef, useState, useCallback} from 'react';
import {useAtom} from 'jotai';
import styles from './ChatInput.module.css';
import sendIcon from '../assets/send.svg';
import sendActiveIcon from '../assets/send_activating.svg';
import closeIcon from '../assets/close.svg';
import imageIcon from '../assets/image.svg';
import downIcon from '../assets/down.svg';
import {AspectRatio, workflowAspectRatios, aspectRatios, chatAtom, sendMessage, setAspectRatio, setWorkflowAspectRatio, setLoraWeight, uploadWorkflowReferenceImage, removeWorkflowReferenceImage, runWorkflowFromChatInput} from '../store/chatStore';

interface Tag {
  id: string;
  text: string;
  type: 'normal' | 'closeable' | 'imageRatio' | 'lora' | 'lora_weight' | 'workflow_image_ratio' | 'upload_workflow_image' | 'uploaded_workflow_image';
  value?: string;
  ratio?: string;
  weight?: number;
  fileName?: string;
}

interface ChatInputProps {
  isLoading: boolean;
  disabled: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ isLoading, disabled }) => {
  const [input, setInput] = useState('');
  const [chatState] = useAtom(chatAtom);
  const [, sendMessageAction] = useAtom(sendMessage);
  const [, setAspectRatioAction] = useAtom(setAspectRatio);
  const [, setLoraWeightAction] = useAtom(setLoraWeight);
  const [, setWorkflowAspectRatioAction] = useAtom(setWorkflowAspectRatio);
  const [, uploadWorkflowReferenceImageAction] = useAtom(uploadWorkflowReferenceImage);
  const [, removeWorkflowReferenceImageAction] = useAtom(removeWorkflowReferenceImage);
  const [, runWorkflowFromChatInputAction] = useAtom(runWorkflowFromChatInput);

  const [activeTags, setActiveTags] = useState<Tag[]>([]);
  const [scrollHeight, setScrollHeight] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [clientHeight, setClientHeight] = useState(0);
  const [showRatioDropdown, setShowRatioDropdown] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showWorkflowRatioDropdown, setShowWorkflowRatioDropdown] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const customScrollbarRef = useRef<HTMLDivElement>(null);
  const ratioDropdownRef = useRef<HTMLDivElement>(null);
  const loraSliderRefs = useRef<HTMLDivElement>(null);

  // 计算是否处于工作流模式且已上传图片
  const isWorkflowWithImage = chatState.task_type === "use_workflow" && 
                              chatState.currentWorkflow && 
                              chatState.workflowReferenceImage.uploadedUrl;

  // 计算发送按钮是否可用
  const isSendEnabled = isWorkflowWithImage || (!isLoading && !disabled && input.trim());

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

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ratioDropdownRef.current && !ratioDropdownRef.current.contains(event.target as Node)) {
        setShowRatioDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 处理滑块点击和拖动的统一逻辑
  const handleSliderInteraction = useCallback((e: React.MouseEvent | MouseEvent) => {
    const sliderRef = loraSliderRefs;
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    let newStrength = Math.max(0, Math.min(1, x / width));
    // 四舍五入到两位小数
    newStrength = Math.round(newStrength * 100) / 100;

    // 更新全局状态
    setLoraWeightAction(newStrength);
  }, [setLoraWeightAction]);

  // 处理滑块拖动
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleSliderInteraction(e);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleSliderInteraction]);

  // 格式化文件名以适应显示
  const formatFileName = (name: string): string => {
    if (name.length <= 9) return name;

    const extension = name.split(".").pop() || "";
    const baseName = name.substring(0, name.length - extension.length - 1);

    return `${baseName.substring(0, 3)}...${baseName.substring(
      baseName.length - 2
    )}.${extension}`;
  };

  // 根据task_type设置标签
  useEffect(() => {
    const baseTags: Tag[] = [];

    // 如果有task_type且不是chat，则添加Task标签
    if (chatState.task_type && chatState.task_type !== 'chat') {
      baseTags.push({
        id: 'task',
        text: 'Task',
        type: 'normal',
        value: chatState.task_value
      });
    }

    // 如果是使用工作流任务，并且有当前工作流，则添加Workflow名称标签
    if (chatState.task_type === "use_workflow" && chatState.currentWorkflow) {
      baseTags.push({
        id: 'workflow_name',
        text: 'Workflow',
        type: 'normal',
        value: chatState.currentWorkflow.name
      });
    }

    if (chatState.currentWorkflow && chatState.task_type === "use_workflow") {
      baseTags.push({
        id: 'workflow_image_ratio',
        text: 'image',
        type: 'workflow_image_ratio',
        ratio: chatState.selectedWorkflowAspectRatio?.value || '1:1'
      });

      // 添加工作流参考图片相关的tag
      if (chatState.workflowReferenceImage.uploadedUrl) {
        // 已上传图片的tag
        baseTags.push({
          id: 'uploaded_workflow_image',
          text: 'Reference',
          type: 'uploaded_workflow_image',
          fileName: chatState.workflowReferenceImage.fileName
        });
      } else {
        // 上传按钮的tag
        baseTags.push({
          id: 'upload_workflow_image',
          text: 'Upload image',
          type: 'upload_workflow_image'
        });
      }
    }

    // 如果当前进入到模型详情，则添加Base Model 和 LoraName标签
    if (chatState.currentModel && chatState.task_type === 'generation') {
      const models = chatState.currentModel?.model_tran || []
      if (models.length > 0 && models[0].lora_name && chatState.task_type === 'generation'){
        baseTags.push({
          id: 'lora_name',
          text: 'Lora',
          type: 'lora',
          value: models[0].lora_name || undefined
        })
        baseTags.push({
          id: 'lora_weight',
          text: 'Strength',
          type: 'lora_weight',
          weight: chatState.loraWeight
        })
      }
      if (models.length > 0 && models[0].base_model_hash && models[0].lora_name && chatState.task_type === 'generation'){
        baseTags.push({
          id: 'image_ratio',
          text: 'image',
          type: 'imageRatio',
          ratio: chatState.selectedAspectRatio?.value || '1:1'
        })
      }
    }

    setActiveTags(baseTags);
  }, [chatState.task_value, chatState.task_type, chatState.currentModel, chatState.selectedAspectRatio, chatState.selectedWorkflowAspectRatio, chatState.loraWeight, chatState.currentWorkflow, chatState.workflowReferenceImage]);

  // 监听textarea的滚动事件
  const handleTextareaScroll = () => {
    if (textareaRef.current) {
      setScrollTop(textareaRef.current.scrollTop);
    }
  };

  // 处理标签删除
  const handleTagDelete = (tagId: string) => {
    setActiveTags(prev => prev.filter(tag => tag.id !== tagId));
  };

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSendMessage = async () => {
    if (!isSendEnabled) return;

    // 如果是工作流模式且已上传图片，运行工作流
    if (isWorkflowWithImage) {
      await runWorkflowFromChatInputAction({ textInput: input.trim() });
      setInput(''); // 清空输入框
    } else {
      // 否则发送普通消息
      const message = input.trim();
      setInput('');
      await sendMessageAction(message);
    }
  };

  // 处理按键事件
  const handleKeyPress = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      await handleSendMessage();
    }
  };

  // 处理宽高比选择
  const handleAspectRatioSelect = (ratio: AspectRatio) => {
    setAspectRatioAction(ratio);
    setShowRatioDropdown(false);
  };

  // 处理宽高比标签点击
  const handleRatioTagClick = () => {
    setShowRatioDropdown(prev => !prev);
  };

  const handleWorkflowRatioTagClick = () => {
    setShowWorkflowRatioDropdown(prev => !prev);
  };

  const handleWorkflowRatioSelect = (ratio: AspectRatio) => {
    setWorkflowAspectRatioAction(ratio);
    setShowWorkflowRatioDropdown(false);
  };

  // 处理上传工作流参考图片
  const handleUploadWorkflowImage = () => {
    if (!disabled) {
      uploadWorkflowReferenceImageAction();
    }
  };

  // 处理删除工作流参考图片
  const handleRemoveWorkflowImage = () => {
    if (!disabled) {
      removeWorkflowReferenceImageAction();
    }
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
        textareaRef.current.scrollTop = startScrollTop + scrollRatio * scrollHeight;
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
                <div
                  key={tag.id}
                  className={styles.imageRatioTag}
                  onClick={handleRatioTagClick}
                  ref={ratioDropdownRef}
                >
                  <img src={imageIcon} alt="Image" className={styles.leftIcon} />
                  <span className={styles.ratioText}>{tag.ratio}</span>
                  <img src={downIcon} alt="Down" className={styles.rightIcon} />

                  {/* 宽高比下拉菜单 */}
                  {showRatioDropdown && (
                    <div className={styles.ratioDropdown}>
                      {aspectRatios.map((ratio) => (
                        <div
                          key={ratio.value}
                          className={`${styles.ratioItem} ${chatState.selectedAspectRatio?.value === ratio.value ? styles.ratioItemSelected : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAspectRatioSelect(ratio);
                          }}
                        >
                          {ratio.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            } else if (tag.type === 'workflow_image_ratio') {
              return (
                <div
                  key={tag.id}
                  className={styles.imageRatioTag}
                  onClick={handleWorkflowRatioTagClick}
                  ref={ratioDropdownRef}
                >
                  <img src={imageIcon} alt="Image" className={styles.leftIcon} />
                  <span className={styles.ratioText}>{tag.ratio}</span>
                  <img src={downIcon} alt="Down" className={styles.rightIcon} />

                  {/* 宽高比下拉菜单 */}
                  {showWorkflowRatioDropdown && (
                    <div className={styles.ratioDropdown}>
                      {workflowAspectRatios.map((ratio) => (
                        <div
                          key={ratio.value}
                          className={`${styles.ratioItem} ${chatState.selectedWorkflowAspectRatio?.value === ratio.value ? styles.ratioItemSelected : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWorkflowRatioSelect(ratio);
                          }}
                        >
                          {ratio.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            } else if (tag.type === 'upload_workflow_image') {
              return (
                <div
                  key={tag.id}
                  className={styles.uploadWorkflowImageTag}
                  onClick={handleUploadWorkflowImage}
                >
                  <span className={styles.uploadText}>{tag.text}</span>
                </div>
              );
            } else if (tag.type === 'uploaded_workflow_image') {
              return (
                <div key={tag.id} className={styles.uploadedWorkflowImageTag}>
                  <div className={styles.uploadedImageItem}>
                    <img
                      src={imageIcon}
                      alt="File"
                      className={styles.imageIcon}
                    />
                    <span className={styles.fileName}>
                      {formatFileName(tag.fileName || '')}
                    </span>
                    <img
                      src={closeIcon}
                      alt="Remove"
                      className={styles.removeIcon}
                      onClick={handleRemoveWorkflowImage}
                    />
                  </div>
                </div>
              );
            } else if (tag.type === 'lora_weight') {
              return (
                  <div
                      key={tag.id}
                      className={styles.loraTag}
                      ref={loraSliderRefs}
                      onClick={(e) => !disabled && handleSliderInteraction(e)}
                      onMouseDown={(e) => {
                        if (disabled) return;
                        e.preventDefault();
                        setIsDragging(true);
                        handleSliderInteraction(e);
                      }}
                  >
                    <span className={styles.loraText}>{tag.text}</span>
                    <div
                        className={styles.strengthBackground}
                        style={{
                          width: `${(tag.weight || 0.0) * 95}%`,
                          transition: isDragging ? 'none' : 'width 0.1s ease-out',
                          borderRadius: (tag.weight || 0.0) >= 0.93 ? '6.25rem' : '6.25rem 0 0 6.25rem'
                        }}
                    ></div>
                    <span className={styles.strengthValue}>{(tag.weight || 0.0).toFixed(2)}</span>
                  </div>
              );
            }else if (tag.type === 'lora') {
              return (
                <div key={tag.id} className={styles.tag}>
                  <span className={styles.text}>{tag.text}</span>
                  <span className={styles.value}>{tag.value}</span>
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
            placeholder={isWorkflowWithImage ? "Additional text (optional)..." : "Type a message..."}
            rows={1}
            className={styles.hideScrollbar}
          />
          <div className={styles.sendButtonContainer}>
            <button
              className={styles.sendButton}
              onClick={handleSendMessage}
              disabled={!isSendEnabled}
            >
              <img src={isSendEnabled ? sendActiveIcon : sendIcon} alt="Send" />
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
  );
};

export default ChatInput;