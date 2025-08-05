import React, { useState, useEffect, useRef } from 'react'
import { useAtom } from 'jotai'
import InputIcon from '../assets/web2/input.svg'
import ModelIcon from '../assets/web2/model.svg'
import OutputIcon from '../assets/web2/output.svg'
import GptIcon from '../assets/web2/gpt.svg'
import DownIcon from '../assets/web2/down.svg'
import CoverSelectIcon from '../assets/web2/cover_select.svg'
import CloseIcon from '../assets/web2/close.svg'
import {
  availableModelsAtom,
  isLoadingProvidersAtom,
  providersErrorAtom,
  selectedModelAtom,
  availableInputTypesAtom,
  availableOutputTypesAtom,
  selectedInputTypeAtom,
  selectedOutputTypeAtom,
  workflowFormAtom,
  fetchAiProvidersAtom,
  selectModelAtom,
  updateWorkflowFormAtom,
  currentModelAtom
} from '../store/workflowBuilderStore'
import { uploadFileToS3 } from '../store/imagesStore'

const WorkflowBuilder: React.FC = () => {
  // Store状态
  const [availableModels] = useAtom(availableModelsAtom)
  const [isLoadingProviders] = useAtom(isLoadingProvidersAtom)
  const [providersError] = useAtom(providersErrorAtom)
  const [selectedModel] = useAtom(selectedModelAtom)
  const [availableInputTypes] = useAtom(availableInputTypesAtom)
  const [availableOutputTypes] = useAtom(availableOutputTypesAtom)
  const [selectedInputType, setSelectedInputType] = useAtom(selectedInputTypeAtom)
  const [selectedOutputType, setSelectedOutputType] = useAtom(selectedOutputTypeAtom)
  const [workflowForm] = useAtom(workflowFormAtom)
  const [currentModel] = useAtom(currentModelAtom)

  // Store actions
  const [, fetchAiProviders] = useAtom(fetchAiProvidersAtom)
  const [, selectModel] = useAtom(selectModelAtom)
  const [, updateWorkflowForm] = useAtom(updateWorkflowFormAtom)

  // 本地状态
  const [refImage, setRefImage] = useState<File | null>(null)
  const [refImageUrl, setRefImageUrl] = useState<string | null>(null)
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false)
  const [isUploadingRefImage, setIsUploadingRefImage] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // 拖拽相关状态
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0 })
  const [isMobile, setIsMobile] = useState(false)
  const [dragVelocity, setDragVelocity] = useState({ x: 0, y: 0 })
  const [lastTouchTime, setLastTouchTime] = useState(0)
  const canvasRef = useRef<HTMLDivElement>(null)

  // 检测是否为移动端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024) // lg breakpoint
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // 组件挂载时获取AI提供商数据
  useEffect(() => {
    fetchAiProviders()
  }, [fetchAiProviders])

  // 边界限制函数
  const constrainPosition = (position: { x: number, y: number }) => {
    const maxOffset = 200 // 最大偏移量
    return {
      x: Math.max(-maxOffset, Math.min(maxOffset, position.x)),
      y: Math.max(-maxOffset, Math.min(maxOffset, position.y))
    }
  }

  // 移除React的触摸事件处理，改用原生事件监听器
  // const handleTouchStart = (e: React.TouchEvent) => {
  //   if (!isMobile) return
  //   
  //   const touch = e.touches[0]
  //   const now = Date.now()
  //   setIsDragging(true)
  //   setDragStart({
  //     x: touch.clientX - canvasPosition.x,
  //     y: touch.clientY - canvasPosition.y
  //   })
  //   setLastTouchTime(now)
  //   setDragVelocity({ x: 0, y: 0 })
  // }

  // const handleTouchEnd = () => {
  //   if (!isMobile) return
  //   setIsDragging(false)
  //   
  //   // 惯性滚动
  //   if (Math.abs(dragVelocity.x) > 0.5 || Math.abs(dragVelocity.y) > 0.5) {
  //     const inertia = 0.95
  //     let currentVelocity = { ...dragVelocity }
  //     
  //     const applyInertia = () => {
  //       if (Math.abs(currentVelocity.x) < 0.1 && Math.abs(currentVelocity.y) < 0.1) return
  //       
  //       const newPosition = {
  //         x: canvasPosition.x + currentVelocity.x * 16, // 16ms per frame
  //         y: canvasPosition.y + currentVelocity.y * 16
  //       }
  //       
  //       const constrainedPosition = constrainPosition(newPosition)
  //       setCanvasPosition(constrainedPosition)
  //       
  //       currentVelocity = {
  //         x: currentVelocity.x * inertia,
  //         y: currentVelocity.y * inertia
  //       }
  //       
  //       requestAnimationFrame(applyInertia)
  //     }
  //     
  //     requestAnimationFrame(applyInertia)
  //   }
  // }

  // 鼠标拖拽处理（用于测试）
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isMobile) return
    
    setIsDragging(true)
    setDragStart({
      x: e.clientX - canvasPosition.x,
      y: e.clientY - canvasPosition.y
    })
    setDragVelocity({ x: 0, y: 0 })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMobile || !isDragging) return
    
    const newPosition = {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    }
    
    const constrainedPosition = constrainPosition(newPosition)
    setCanvasPosition(constrainedPosition)
  }

  const handleMouseUp = () => {
    if (!isMobile) return
    setIsDragging(false)
  }

  // 重置画布位置
  const resetCanvasPosition = () => {
    setCanvasPosition({ x: 0, y: 0 })
    setDragVelocity({ x: 0, y: 0 })
  }

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      console.error('Please select an image file')
      return
    }
    
    setRefImage(file)
    setRefImageUrl(URL.createObjectURL(file))
    
    try {
      setIsUploadingRefImage(true)
      const uploadedUrl = await uploadFileToS3(file)
      // 将上传的 URL 保存到 workflow form 中
      const currentForm = workflowForm
      updateWorkflowForm({ referenceImages: [...currentForm.referenceImages, uploadedUrl] })
    } catch (error) {
      console.error('Failed to upload reference image:', error)
      // 如果上传失败，清除图片
      handleRemoveRefImage()
    } finally {
      setIsUploadingRefImage(false)
    }
  }

  const handleRefImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleFileUpload(e.target.files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files && files[0]) {
      await handleFileUpload(files[0])
    }
  }

  const handleRemoveRefImage = () => {
    setRefImage(null)
    setRefImageUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const InputTypeButton = ({ type, isSelected, onClick }: { type: string, isSelected: boolean, onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`h-[2.125rem] px-3 rounded-full text-sm font-lexend font-normal leading-5 transition-colors ${
        isSelected 
          ? 'bg-[#22C55E] text-white' 
          : 'border border-[#E5E7EB] text-[#4B5563] hover:bg-gray-50'
      }`}
    >
      {type}
    </button>
  )

  const OutputTypeButton = ({ type, isSelected, isDisabled, onClick }: {
    type: string,
    isSelected: boolean,
    isDisabled: boolean,
    onClick: () => void
  }) => (
    <button
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      className={`h-[2.125rem] px-3 rounded-full text-sm font-lexend font-normal leading-5 transition-colors ${
        isSelected && !isDisabled
          ? 'bg-[#EAB308] text-white' 
          : 'border border-[#E5E7EB] text-[#4B5563] hover:bg-gray-50'
      } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {type}
    </button>
  )

  // 点击外部关闭下拉菜单
  React.useEffect(() => {
    if (!isModelDropdownOpen) return
    const handleClick = () => {
      setIsModelDropdownOpen(false)
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [isModelDropdownOpen])

  // 添加事件监听器，设置passive: false
  useEffect(() => {
    const canvas = canvasRef.current
    
    if (!isMobile || !canvas) {
      return
    }

    const handleTouchMovePassive = (e: TouchEvent) => {
      if (isDragging) {
        e.preventDefault()
        
        const touch = e.touches[0]
        const now = Date.now()
        const deltaTime = now - lastTouchTime
        
        const newPosition = {
          x: touch.clientX - dragStart.x,
          y: touch.clientY - dragStart.y
        }
        
        // 计算速度
        if (deltaTime > 0) {
          const velocity = {
            x: (newPosition.x - canvasPosition.x) / deltaTime,
            y: (newPosition.y - canvasPosition.y) / deltaTime
          }
          setDragVelocity(velocity)
        }
        
        const constrainedPosition = constrainPosition(newPosition)
        setCanvasPosition(constrainedPosition)
        setLastTouchTime(now)
      }
    }

    const handleTouchStartPassive = (e: TouchEvent) => {
      if (!isMobile) return
      
      const touch = e.touches[0]
      const now = Date.now()
      setIsDragging(true)
      setDragStart({
        x: touch.clientX - canvasPosition.x,
        y: touch.clientY - canvasPosition.y
      })
      setLastTouchTime(now)
      setDragVelocity({ x: 0, y: 0 })
    }

    const handleTouchEndPassive = () => {
      if (!isMobile) return
      setIsDragging(false)
      
      // 惯性滚动
      if (Math.abs(dragVelocity.x) > 0.5 || Math.abs(dragVelocity.y) > 0.5) {
        const inertia = 0.95
        let currentVelocity = { ...dragVelocity }
        
        const applyInertia = () => {
          if (Math.abs(currentVelocity.x) < 0.1 && Math.abs(currentVelocity.y) < 0.1) return
          
          const newPosition = {
            x: canvasPosition.x + currentVelocity.x * 16, // 16ms per frame
            y: canvasPosition.y + currentVelocity.y * 16
          }
          
          const constrainedPosition = constrainPosition(newPosition)
          setCanvasPosition(constrainedPosition)
          
          currentVelocity = {
            x: currentVelocity.x * inertia,
            y: currentVelocity.y * inertia
          }
          
          requestAnimationFrame(applyInertia)
        }
        
        requestAnimationFrame(applyInertia)
      }
    }

    canvas.addEventListener('touchmove', handleTouchMovePassive, { passive: false })
    canvas.addEventListener('touchstart', handleTouchStartPassive, { passive: false })
    canvas.addEventListener('touchend', handleTouchEndPassive, { passive: false })

    return () => {
      canvas.removeEventListener('touchmove', handleTouchMovePassive)
      canvas.removeEventListener('touchstart', handleTouchStartPassive)
      canvas.removeEventListener('touchend', handleTouchEndPassive)
    }
  }, [isMobile, isDragging, dragStart, canvasPosition, lastTouchTime, dragVelocity])

  // 如果正在加载，显示加载状态
  if (isLoadingProviders) {
    return (
      <div className="flex items-center justify-center h-full w-full p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0900FF] mx-auto mb-4"></div>
          <span className="font-lexend text-sm text-[#4B5563]">Loading AI providers...</span>
        </div>
      </div>
    )
  }

  // 如果加载出错，显示错误状态
  if (providersError) {
    return (
      <div className="flex items-center justify-center h-full w-full p-8">
        <div className="text-center">
          <span className="font-lexend text-sm text-red-500">Error: {providersError}</span>
          <button 
            onClick={() => fetchAiProviders()}
            className="mt-4 px-4 py-2 bg-[#0900FF] text-white rounded-lg hover:bg-blue-800 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center h-full w-full p-4 lg:p-8 relative overflow-hidden">
      {/* 移动端拖拽提示 */}
      {isMobile && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-black bg-opacity-75 text-white px-4 py-2 rounded-full text-xs font-lexend backdrop-blur-sm border border-white border-opacity-20">
          <div className="flex items-center gap-2">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
            <span>{isDragging ? '拖拽中...' : '拖拽移动画布'}</span>
          </div>
        </div>
      )}

      {/* 移动端重置按钮 */}
      {isMobile && (canvasPosition.x !== 0 || canvasPosition.y !== 0) && (
        <button
          onClick={resetCanvasPosition}
          className="absolute top-4 right-4 z-20 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          title="重置画布位置"
        >
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      )}

      {/* 可拖拽画布容器 */}
      <div
        ref={canvasRef}
        className={`w-full h-full flex items-center justify-center ${
          isMobile ? 'cursor-grab active:cursor-grabbing' : ''
        }`}
        style={{
          transform: isMobile ? `translate(${canvasPosition.x}px, ${canvasPosition.y}px)` : 'none',
          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          userSelect: isMobile ? 'none' : 'auto',
          touchAction: isMobile ? 'none' : 'auto'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* 节点组容器+连线 */}
        <div className="w-full h-auto lg:h-[32.75rem] flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-0">
          {/* User Input 节点 */}
          <div className="w-full max-w-80 h-[13.5rem] border-2 border-[#22C55E] rounded-2xl p-4 bg-white flex flex-col gap-4 z-10">
            {/* 标题 */}
            <div className="h-8 flex items-center gap-3">
              <img src={InputIcon} alt="Input" className="w-8 h-8" />
              <span className="font-lexend font-normal text-lg leading-7 text-[#1F2937]">User Input</span>
            </div>
            {/* 内容区 */}
            <div className="w-full flex flex-col gap-2 border-t border-[#E5E7EB] pt-4 pb-4">
              <span className="font-semibold text-sm leading-5 text-[#1F2937]" style={{ fontFamily: 'PingFang SC' }}>Type</span>
              <div className="h-[2.125rem] flex gap-2">
                {availableInputTypes.map(type => (
                  <InputTypeButton
                    key={type}
                    type={type}
                    isSelected={selectedInputType === type}
                    onClick={() => setSelectedInputType(type)}
                  />
                ))}
              </div>
            </div>
          </div>
          {/* 连线1 */}
          <div className="hidden lg:block w-8 h-px bg-[#9CA3AF] border" />
          {/* Model 节点 */}
          <div className="w-full max-w-80 h-auto lg:h-[32.75rem] border-2 border-[#0900FF] rounded-2xl p-4 bg-white flex flex-col gap-4 z-10">
            {/* 标题 */}
            <div className="h-8 flex items-center gap-3">
              <img src={ModelIcon} alt="Model" className="w-8 h-8" />
              <span className="font-lexend font-normal text-lg leading-7 text-[#1F2937]">Model</span>
            </div>
            {/* 内容区 */}
            <div className="w-full flex flex-col gap-4 border-t border-[#E5E7EB] pt-4 pb-4">
              {/* Model 选择 */}
              <div className="w-full h-[4.875rem] flex flex-col gap-2">
                <span className="font-semibold text-sm leading-5 text-[#1F2937]" style={{ fontFamily: 'PingFang SC' }}>Model</span>
                <div
                  className="w-full max-w-72 h-14 flex items-center justify-between bg-[#EEF2FF] rounded-[0.625rem] p-3 gap-2 cursor-pointer relative"
                  onClick={e => {
                    e.stopPropagation()
                    setIsModelDropdownOpen(v => !v)
                  }}
                >
                  <div className="flex items-center gap-2">
                    <img src={GptIcon} alt="GPT" className="w-8 h-8" />
                    <div className="w-[12.4375rem] h-8 flex flex-col gap-2">
                      <span className="font-lexend font-normal text-sm leading-none text-[#4B5563]">{currentModel?.name || 'Select Model'}</span>
                      <span className="font-lexend font-light text-xs leading-none text-[#9CA3AF]">{currentModel?.provider || 'No provider selected'}</span>
                    </div>
                  </div>
                  <img src={DownIcon} alt="Down" className="w-4 h-4" />
                  {/* 下拉菜单 */}
                  {isModelDropdownOpen && (
                    <div
                      className="absolute left-0 top-16 w-full bg-white border border-[#E5E7EB] rounded-[0.625rem] shadow-lg z-20 max-h-48 overflow-y-auto"
                      onClick={e => e.stopPropagation()}
                    >
                      {availableModels.map(model => (
                        <div
                          key={`${model.provider}-${model.name}`}
                          className={`flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-[#EEF2FF] ${selectedModel === model.name ? 'bg-[#EEF2FF]' : ''}`}
                          onClick={() => {
                            selectModel(model.name)
                            setIsModelDropdownOpen(false)
                          }}
                        >
                          <img src={GptIcon} alt={model.name} className="w-6 h-6" />
                          <div className="flex flex-col">
                            <span className="font-lexend font-normal text-sm text-[#4B5563]">{model.name}</span>
                            <span className="font-lexend font-light text-xs text-[#9CA3AF]">{model.provider}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {/* Prompt 输入 */}
              <div className="w-full max-w-72 h-[12.5625rem] flex flex-col gap-2">
                <span className="font-semibold text-sm leading-5 text-[#1F2937]" style={{ fontFamily: 'PingFang SC' }}>Prompt</span>
                <textarea
                  value={workflowForm.prompt}
                  onChange={(e) => updateWorkflowForm({ prompt: e.target.value })}
                  placeholder="Write a Prompt here"
                  className="w-full max-w-72 h-[11.1875rem] border border-[#E5E7EB] rounded-[0.625rem] p-3 font-lexend font-normal text-sm leading-none text-[#1F2937] placeholder:text-[#9CA3AF] placeholder:font-lexend placeholder:font-normal placeholder:text-xs placeholder:leading-none resize-none focus:outline-none focus:ring-2 focus:ring-[#0900FF] focus:border-transparent"
                />
              </div>
              {/* Reference Image 可选 */}
              <div className="w-full h-[6.3125rem] flex flex-col gap-2">
                <span className="font-semibold text-sm leading-5 text-[#1F2937]" style={{ fontFamily: 'PingFang SC' }}>Reference Image (Option)</span>
                {refImage && refImageUrl ? (
                  <div className="relative w-full h-[4.9375rem]">
                    <img
                      src={refImageUrl}
                      alt="ref"
                      className="w-full h-full object-cover rounded-[0.625rem]"
                    />
                    {isUploadingRefImage && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-[0.625rem] flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      </div>
                    )}
                    <button
                      type="button"
                      className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center bg-white bg-opacity-80 rounded-full hover:bg-gray-100"
                      onClick={handleRemoveRefImage}
                      disabled={isUploadingRefImage}
                    >
                      <img src={CloseIcon} alt="Remove" className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div
                    className={`w-full h-[4.9375rem] border border-dashed rounded-[0.625rem] flex flex-col items-center justify-center gap-1.5 px-6 py-4 relative transition-colors cursor-pointer ${
                      isUploadingRefImage 
                        ? 'opacity-50 cursor-not-allowed' 
                        : isDragOver 
                          ? 'border-[#0900FF] bg-blue-50' 
                          : 'border-[#E5E7EB] hover:border-[#0900FF]'
                    }`}
                    style={{ borderWidth: '1px', borderStyle: 'dashed', borderRadius: '0.625rem' }}
                    onClick={isUploadingRefImage ? undefined : () => fileInputRef.current?.click()}
                    onDragOver={isUploadingRefImage ? undefined : handleDragOver}
                    onDragLeave={isUploadingRefImage ? undefined : handleDragLeave}
                    onDrop={isUploadingRefImage ? undefined : handleDrop}
                  >
                    {isUploadingRefImage ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0900FF] mb-2"></div>
                        <span className="font-lexend font-normal text-xs leading-[100%] text-[#9CA3AF] text-center">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <img src={CoverSelectIcon} alt="select" className="w-8 h-[1.9375rem] mb-2" />
                        <span className="font-lexend font-normal text-xs leading-[100%] text-[#9CA3AF] text-center">
                          {isDragOver ? 'Drop image here' : 'Click to upload Or drag'}
                        </span>
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleRefImageChange}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* 连线2 */}
          <div className="hidden lg:block w-8 h-px bg-[#9CA3AF] border" />
          {/* Workflow Output 节点 */}
          <div className="w-full max-w-80 h-[13.5rem] border-2 border-[#EAB308] rounded-2xl p-4 bg-white flex flex-col gap-4 z-10">
            {/* 标题 */}
            <div className="h-8 flex items-center gap-3">
              <img src={OutputIcon} alt="Output" className="w-8 h-8" />
              <span className="font-lexend font-normal text-lg leading-7 text-[#1F2937]">Workflow Output</span>
            </div>
            {/* 内容区 */}
            <div className="w-full flex flex-col gap-2 border-t border-[#E5E7EB] pt-4 pb-4">
              <span className="font-semibold text-sm leading-5 text-[#1F2937]" style={{ fontFamily: 'PingFang SC' }}>Type</span>
              <div className="h-[2.125rem] flex gap-2">
                {availableOutputTypes.map(type => (
                  <OutputTypeButton
                    key={type}
                    type={type}
                    isSelected={selectedOutputType === type}
                    isDisabled={false}
                    onClick={() => setSelectedOutputType(type)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkflowBuilder