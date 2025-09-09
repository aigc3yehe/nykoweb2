import React, { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { chatAtom, sendMessage, runWorkflowFromChatInput, setLoraWeight } from '../../store/assistantStore'
import DisableEnterIcon from '../../assets/mavae/disable_enter.svg'
import DisableEnterIconDark from '../../assets/mavae/dark/disable_enter.svg'
import InputEnterIcon from '../../assets/mavae/input_enter.svg'
import InputEnterIconDark from '../../assets/mavae/dark/input_enter.svg'
import UploadImgIcon from '../../assets/mavae/input_image_add.svg'
import UploadImgIconDark from '../../assets/mavae/dark/input_image_add.svg'
import AiccTypeIcon from '../../assets/mavae/input_workflow_type.svg'
import AiccTypeIconDark from '../../assets/mavae/dark/input_workflow_type.svg'
import ImageCloseIcon from '../../assets/mavae/input_image_close.svg'
import ImageCloseIconDark from '../../assets/mavae/dark/input_image_close.svg'
import { getScaledImageUrl } from '../../utils'
import { uploadWorkflowReferenceImage, removeWorkflowReferenceImage } from '../../store/assistantStore';
import ThemeAdaptiveIcon from '../ui/ThemeAdaptiveIcon'
import imageIcon from '../../assets/mavae/input_size_img.svg';
import imageIconDark from '../../assets/mavae/dark/input_size_img.svg';
import downIcon from '../../assets/mavae/input_size_down.svg';
import { useI18n } from '../../hooks/useI18n';
import downIconDark from '../../assets/mavae/dark/input_size_down.svg';
import upIcon from '../../assets/mavae/input_size_up.svg';
import upIconDark from '../../assets/mavae/dark/input_size_up.svg';
import type { AspectRatio } from '../../store/assistantStore';
import { workflowAspectRatios, aspectRatios, setWorkflowAspectRatio, setAspectRatio } from '../../store/assistantStore';

interface ChatInputProps {
  onHeightChange?: (height: number) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onHeightChange }) => {
  const { t } = useI18n()
  const [message, setMessage] = useState('')
  const [chatState] = useAtom(chatAtom)
  const sendMsg = useSetAtom(sendMessage)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const loraWeight = chatState.loraWeight ?? 0.5
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const setWorkflowAspectRatioAction = useSetAtom(setWorkflowAspectRatio);
  const setAspectRatioAction = useSetAtom(setAspectRatio);
  const uploadWorkflowReferenceImageAction = useSetAtom(uploadWorkflowReferenceImage);
  const removeWorkflowReferenceImageAction = useSetAtom(removeWorkflowReferenceImage);
  const runWorkflowFromChatInputAction = useSetAtom(runWorkflowFromChatInput);
  const setLoraWeightAction = useSetAtom(setLoraWeight);

  // 自动调整输入框高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      const scrollHeight = textareaRef.current.scrollHeight
      const maxHeight = 20 * 6 // 6行
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`
    }
  }, [message])

  // 监听输入框实际高度变化
  useLayoutEffect(() => {
    if (!containerRef.current) return
    const updateHeight = () => {
      if (onHeightChange) onHeightChange(containerRef.current!.offsetHeight)
    }
    updateHeight()
    const resizeObserver = new window.ResizeObserver(updateHeight)
    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [onHeightChange])

  // 处理滑块拖拽
  const sliderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && sliderRef.current) {
        const rect = sliderRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const width = rect.width
        const newWeight = Math.max(0, Math.min(1, x / width))
        setLoraWeightAction(parseFloat(newWeight.toFixed(2)))
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, setLoraWeightAction])

  const handleSend = async () => {
    if (!canSend) return;
    // 如果是工作流模式且已上传图片，拦截并调用 runWorkflowFromChatInput
    if (isWorkflowWithImage) {
      await runWorkflowFromChatInputAction({ textInput: message.trim() });
      setMessage('');
    } else if (message.trim()) {
      await sendMsg(message.trim());
      setMessage('');
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // 处理强度滑块交互
  const handleSliderInteraction = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const width = rect.width
    const newWeight = Math.max(0, Math.min(1, x / width))
    setLoraWeightAction(parseFloat(newWeight.toFixed(2)))
  }

  // 计算是否处于工作流模式且已上传图片
  const isWorkflowWithImage = chatState.task_type === "use_workflow" && 
                              chatState.currentDetailWorkflow && 
                              chatState.workflowReferenceImage.uploadedUrl;
  const canSend = (message.trim() || chatState.workflowReferenceImage.uploadedUrl) && !chatState.isLoading
  const isDisabled = chatState.isLoading || chatState.isGenerating

  return (
    <div ref={containerRef} className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6 z-10">
      <div className="w-full bg-pop-ups dark:bg-pop-ups-dark border-2 border-line-subtle dark:border-line-subtle-dark rounded-[1.25rem] shadow-sm focus-within:border-link-default dark:focus-within:border-link-default-dark transition-colors duration-200">
        <div className="p-3">
          {/* 上半部分 */}
          <div className="flex flex-col gap-3">
            {/* 第一行 - 显示当前工作流或模型 */}
            <div className="flex gap-1.5">
              {/* 工作流详情显示 */}
              {chatState.currentDetailWorkflow && chatState.task_type === "use_workflow" && (
                <div className="flex items-center gap-1 h-14 p-1 rounded bg-tertiary dark:bg-tertiary-dark">
                  {/* 工作流封面 */}
                  <div className="w-8 h-12 rounded overflow-hidden bg-gray-200 flex-shrink-0">
                    {chatState.currentDetailWorkflow.cover ? (
                      <img
                        src={getScaledImageUrl(chatState.currentDetailWorkflow.cover, 50)}
                        alt={chatState.currentDetailWorkflow.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.backgroundColor = '#E8E8E8'
                          ;(e.target as HTMLImageElement).src = ''
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}
                  </div>
                  {/* 工作流名称 */}
                  <div className="flex items-center">
                    <span className="font-switzer font-normal text-xs leading-5 text-text-main dark:text-text-main-dark">
                      {chatState.currentDetailWorkflow.name}
                    </span>
                  </div>
                </div>
              )}

              {/* 模型详情显示 */}
              {chatState.currentDetailModel && chatState.task_type === "generation" && (
                <div className="flex items-center gap-1 h-14 p-1 rounded bg-tertiary dark:bg-tertiary-dark">
                  {/* 模型封面 */}
                  <div className="w-8 h-12 rounded overflow-hidden bg-gray-200 flex-shrink-0">
                    {chatState.currentDetailModel.cover ? (
                      <img
                        src={getScaledImageUrl(chatState.currentDetailModel.cover, 50)}
                        alt={chatState.currentDetailModel.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.backgroundColor = '#E8E8E8'
                          ;(e.target as HTMLImageElement).src = ''
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}
                  </div>
                  {/* 模型信息 */}
                  <div className="flex flex-col justify-center gap-1 h-14">
                    {/* 模型名称 */}
                    <span className="font-switzer font-normal text-xs leading-5 text-text-main dark:text-text-main-dark">
                      {chatState.currentDetailModel.name}
                    </span>
                    {/* Strength 标签 */}
                    <span className="font-lexend font-normal text-[0.625rem] leading-none text-design-lightest-gray">
                      {t('chat.strength')}
                    </span>
                    {/* 强度滑块 - 新设计 */}
                    <div
                        ref={sliderRef}
                        className="relative w-24 h-5.5 bg-gray-200 rounded-xl cursor-pointer flex items-center justify-center overflow-hidden"
                        onClick={handleSliderInteraction}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          setIsDragging(true)
                          handleSliderInteraction(e)
                        }}
                    >
                      {/* 进度条背景 */}
                      <div
                          className="absolute top-0 left-0 h-full rounded-xl transition-all duration-150"
                          style={{
                            width: `${loraWeight * 100}%`,
                            backgroundColor: '#00FF48'
                          }}
                      />
                      {/* 数值显示 */}
                      <div className="relative z-10">
                      <span className="font-lexend font-normal text-sm leading-none text-center" style={{ color: '#1F2937' }}>
                        {loraWeight.toFixed(2)}
                      </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 工作流图片上传组件 */}
              {chatState.currentDetailWorkflow && chatState.task_type === "use_workflow" &&
               chatState.currentDetailWorkflow.input_type &&
               chatState.currentDetailWorkflow.input_type.includes('image') && (
                <>
                  {/* 如果没有上传图片，显示上传按钮 */}
                  {!chatState.workflowReferenceImage.uploadedUrl && (
                    <button
                      onClick={() => uploadWorkflowReferenceImageAction()}
                      disabled={chatState.workflowReferenceImage.isUploading}
                      className="w-14 h-14 bg-tertiary dark:bg-tertiary-dark rounded flex items-center justify-center hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {chatState.workflowReferenceImage.isUploading ? (
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <ThemeAdaptiveIcon
                          lightIcon={UploadImgIcon}
                          darkIcon={UploadImgIconDark}
                          alt="Upload"
                          size="lg"
                        />
                      )}
                    </button>
                  )}

                  {/* 如果已上传图片，显示图片预览和文件名 */}
                  {chatState.workflowReferenceImage.uploadedUrl && (
                    <div className="relative group w-14 h-14 rounded p-1 bg-tertiary dark:bg-tertiary-dark">
                      <div className="w-full h-full rounded overflow-hidden">
                        <img
                          src={chatState.workflowReferenceImage.uploadedUrl}
                          alt={chatState.workflowReferenceImage.fileName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {/* 删除按钮 - 鼠标悬停时显示，位置在右上角 */}
                      <button
                        onClick={removeWorkflowReferenceImageAction}
                        className="absolute top-0 right-0 w-5 h-5 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200"
                        style={{ transform: 'translate(50%, -50%)' }}
                      >
                        <ThemeAdaptiveIcon
                          lightIcon={ImageCloseIcon}
                          darkIcon={ImageCloseIconDark}
                          alt="Remove"
                          size="sm"
                        />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* 第二行 - 输入框 */}
            <div className="w-full">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isDisabled}
                placeholder="What do you want to create?"
                rows={1}
                className="w-full min-h-5 h-5 max-h-[7.5rem] overflow-hidden resize-none border-none outline-none bg-transparent font-switzer font-medium text-xs leading-5 p-0 text-text-main dark:text-text-main-dark placeholder:text-text-tips dark:placeholder:text-text-tips-dark disabled:opacity-50"
                style={{ lineHeight: '1.25rem' }}
              />
            </div>
          </div>

          {/* 下半部分 */}
          <div className="flex items-center justify-between h-8 mt-3">
            {/* 左侧选项组 */}
            <div className="flex items-center h-full gap-3">
              {/* 类型标签 */}
              {chatState.currentDetailModel && chatState.task_type === "generation" && (
                <div className="flex items-center gap-1 h-8 pt-2 pb-2 pl-3.5 pr-3.5 bg-tertiary dark:bg-tertiary-dark rounded-full">
                  <ThemeAdaptiveIcon
                    lightIcon={AiccTypeIcon}
                    darkIcon={AiccTypeIconDark}
                    alt="Type"
                    size="sm"
                  />
                  <span className="font-lexend font-normal text-sm leading-[100%] text-center align-middle text-link-default dark:text-link-default-dark">
                    Style
                  </span>
                </div>
              )}

              {chatState.currentDetailWorkflow && chatState.task_type === "use_workflow" && (
                <div className="flex items-center gap-1 h-8 pt-2 pb-2 pl-3.5 pr-3.5 bg-tertiary dark:bg-tertiary-dark rounded-full">
                  <ThemeAdaptiveIcon
                    lightIcon={AiccTypeIcon}
                    darkIcon={AiccTypeIconDark}
                    alt="Type"
                    size="sm"
                  />
                  <span className="font-lexend font-normal text-sm leading-[100%] text-center align-middle text-link-default dark:text-link-default-dark">
                    Workflow
                  </span>
                </div>
              )}

              {/* 宽高比下拉菜单（只显示一个，优先工作流） */}
              <div className="flex gap-2">
              {chatState.currentDetailWorkflow && chatState.task_type === "use_workflow" && (
                <AspectRatioDropdown
                  options={workflowAspectRatios}
                  selected={chatState.selectedWorkflowAspectRatio}
                  onSelect={setWorkflowAspectRatioAction}
                />
              )}
              {chatState.currentDetailModel && chatState.task_type === "generation" && (
                <AspectRatioDropdown
                  options={aspectRatios}
                  selected={chatState.selectedAspectRatio}
                  onSelect={setAspectRatioAction}
                />
              )}
            </div>
            </div>

            {/* 右侧发送按钮 */}
            <button
              onClick={handleSend}
              disabled={!canSend || isDisabled}
              className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                canSend 
                  ? 'bg-link-default dark:bg-link-default-dark' 
                  : 'bg-tertiary dark:bg-tertiary-dark'
              } disabled:cursor-not-allowed`}
              aria-label="Send message"
            >
              <ThemeAdaptiveIcon
                lightIcon={canSend ? InputEnterIcon : DisableEnterIcon}
                darkIcon={canSend ? InputEnterIconDark : DisableEnterIconDark}
                alt="Send"
                size="sm"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Tailwind 风格宽高比下拉菜单组件
const AspectRatioDropdown: React.FC<{
  options: AspectRatio[];
  selected: AspectRatio | undefined;
  onSelect: (ratio: AspectRatio) => void;
}> = ({ options, selected, onSelect }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block">
      <button
        className="flex items-center justify-center h-8 pt-2 pb-2 pl-3.5 pr-3.5 gap-1 rounded-full border border-line-subtle dark:border-line-subtle-dark bg-tertiary dark:bg-tertiary-dark hover:bg-tertiary dark:hover:bg-tertiary-dark transition min-w-[4.5rem]"
        onClick={() => setOpen(!open)}
        type="button"
      >
        <ThemeAdaptiveIcon
          lightIcon={imageIcon}
          darkIcon={imageIconDark}
          alt="ratio"
          size="sm"
        />
        <span className="pb-0.5 font-lexend font-normal text-sm leading-[100%] text-text-secondary dark:text-text-secondary-dark text-center align-middle">
          {selected?.label || options[0].label}
        </span>
        <ThemeAdaptiveIcon
          lightIcon={open ? upIcon : downIcon}
          darkIcon={open ? upIconDark : downIconDark}
          alt={open ? "up" : "down"}
          size="sm"
        />
      </button>
      {open && (
        <div className="absolute left-0 bottom-full mb-2 w-50 min-w-[12.5rem] pt-2 pb-2 rounded-lg bg-switch-bg dark:bg-switch-bg-dark shadow-lg z-20" style={{ boxShadow: '0px 8px 16px 0px #12121A1A, 0px 4px 8px 0px #12121A33' }}>
          {options.map((ratio) => (
            <div
              key={ratio.value}
              className="w-50 h-10 pt-3 pb-3 pl-4 pr-4 gap-2 font-switzer font-medium text-sm leading-5 text-text-main dark:text-text-main-dark text-left align-middle cursor-pointer hover:bg-switch-hover dark:hover:bg-switch-hover-dark transition-colors"
              onClick={() => { onSelect(ratio); setOpen(false); }}
            >
              {ratio.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatInput