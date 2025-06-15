import React, { useState, useRef, useEffect } from "react";
import styles from "./ChatMessage.module.css";
import imageIcon from "../assets/image.svg";
import closeIcon from "../assets/close.svg";
import uploadingIcon from "../assets/uploading.svg";
import okIcon from "../assets/ok.svg";
import checkAgreeIcon from "../assets/check_agree.svg";
import checkedAgreeIcon from "../assets/checked_agree.svg";
import selectModelIcon from "../assets/select_model.svg";
import uploadIcon from "../assets/upload.svg";
import createWorkflowIcon from "../assets/create_workflow.svg";
import deleteIcon from "../assets/delete.svg";
import deleteDisableIcon from "../assets/delete_disable.svg";
import { GENERATE_IMAGE_SERVICE_CONFIG, TRAIN_MODEL_SERVICE_CONFIG, RUN_WORKFLOW_SERVICE_CONFIG } from "../utils/plan";
import { WorkflowDetail } from '../store/workflowStore';
import xIcon from "../assets/x.svg";

interface ImageUploadState {
  totalCount: number;
  uploadedCount: number;
  isUploading: boolean;
  finishUpload: boolean;
}

export interface ChatMessageProps {
  role: "user" | "assistant" | "system";
  content: string;
  type?:
    | "text"
    | "upload_image"
    | "model_config"
    | "generate_result"
    | "generating_image"
    | "tokenization_agreement"
    | "create_workflow"
    | "run_workflow"
    | "workflow_generate_result"
    | "create_workflow_details"
    | "modify_image"
    | "uploaded_image"
    | "generating_video"
    | "video_generate_result"
    | "animating_image"
    | "minting_nft";
  imageUploadState?: ImageUploadState;
  uploadedFiles?: Array<{ name: string; url: string }>;
  modelParam?: {
    modelName?: string;
    description?: string;
  };
  agree?: boolean;
  images?: string[];
  videos?: string[];
  imageWidth?: number;
  imageHeight?: number;
  request_id?: string;
  workflow_name?: string;
  workflow_description?: string;
  workflow_prompt?: string;
  workflow_input?: string;
  workflow_output?: string;
  onAddImage?: () => void;
  onConfirmImages?: () => void;
  onRemoveImage?: (url: string) => void;
  onAgree?: () => void;
  onUpdatePrompt?: (text: string) => void;
  onChangeInput?: (type: string) => void;
  onChangeOutput?: (type: string) => void;
  isCreatingWorkflow?: boolean;
  creationSuccess?: boolean;
  onCreateWorkflow?: () => void;
  workflowId?: number;
  workflowImageValue?: string;
  isRunningWorkflow?: boolean;
  onSelectWorkflowImage?: (imageUrl: string, file: File | null) => void;
  onRunWorkflow?: () => void;
  isConfirmedWorkflow?: boolean;
  onNavigateToWorkflow?: (workflowName: string) => void;
  workflowReferenceImage?: {
    isUploading: boolean;
    uploadedUrl: string;
    fileName: string;
    error?: string;
  };
  onUploadReferenceImage?: () => void;
  onRemoveReferenceImage?: () => void;
  workflow_extra_prompt?: string;
  onUpdateWorkflowExtraPrompt?: (prompt: string) => void;
  currentWorkflow?: WorkflowDetail | null;
  isLastMessage?: boolean;
  onPartiallyModify?: () => void;
  onAnimate?: () => void;
  onMintNFT?: () => void;
  aiProviders?: {
    providers: Array<{
      name: string;
      models: Array<{
        name: string;
        support_input_types: string[];
        support_output_types: string[];
      }>;
    }>;
    selectedProvider: string;
    selectedModel: string;
    isLoading: boolean;
  };
  onSelectProvider?: (provider: string) => void;
  onSelectAIModel?: (model: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  role,
  content,
  type = "text",
  imageUploadState = {
    totalCount: 0,
    uploadedCount: 0,
    isUploading: false,
    finishUpload: false,
  },
  uploadedFiles = [],
  modelParam = { modelName: undefined, description: undefined },
  agree = false,
  images = [],
  videos = [],
  imageWidth = 256,
  imageHeight = 256,
  request_id = "",
  workflow_name = "",
  workflow_description = "",
  workflow_prompt = "",
  workflow_input = "",
  workflow_output = "",
  onAddImage,
  onConfirmImages,
  onRemoveImage,
  onAgree,
  onUpdatePrompt,
  onChangeInput,
  onChangeOutput,
  isCreatingWorkflow = false,
  creationSuccess = false,
  onCreateWorkflow,
  workflowImageValue = '',
  isRunningWorkflow = false,
  onSelectWorkflowImage,
  onRunWorkflow,
  isConfirmedWorkflow = false,
  onNavigateToWorkflow,
  workflowReferenceImage,
  onUploadReferenceImage,
  onRemoveReferenceImage,
  workflow_extra_prompt,
  onUpdateWorkflowExtraPrompt,
  currentWorkflow,
  isLastMessage = false,
  onPartiallyModify,
  onAnimate,
  onMintNFT,
  aiProviders,
  onSelectProvider,
  onSelectAIModel,
}) => {
  // 格式化文件名以适应显示
  const formatFileName = (name: string): string => {
    if (name.length <= 9) return name;

    const extension = name.split(".").pop() || "";
    const baseName = name.substring(0, name.length - extension.length - 1);

    return `${baseName.substring(0, 3)}...${baseName.substring(
      baseName.length - 2
    )}.${extension}`;
  };

  // 添加图片生成中组件
  const renderGeneratingImageComponent = () => {
    return (
      <div className={styles.generatingIndicator} key={request_id}>
        <img
          src={uploadingIcon}
          alt="Generating"
          className={styles.uploadingIcon}
        />
        <span className={styles.generatingText}>
          Generating image, please wait...
        </span>
      </div>
    );
  };

  // 添加图片修改中组件
  const renderModifyImageComponent = () => {
    return (
        <div className={styles.generatingIndicator} key={request_id}>
          <img
              src={uploadingIcon}
              alt="Modify"
              className={styles.uploadingIcon}
          />
          <span className={styles.generatingText}>
          Generating image, please wait...(ETA 200 sec)
        </span>
        </div>
    );
  };

  // 处理文本中的链接
  const processContent = (content: string) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = content.split(linkRegex);
    const result = [];

    for (let i = 0; i < parts.length; i += 3) {
      if (i + 2 < parts.length) {
        // 添加链接前的文本
        if (parts[i]) {
          result.push(<span key={`text-${i}`}>{parts[i]}</span>);
        }
        // 添加链接
        result.push(
          <a
            key={`link-${i}`}
            href={parts[i + 2]}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.contentLink}
          >
            {parts[i + 1]}
          </a>
        );
      } else {
        // 添加剩余的文本
        result.push(<span key={`text-${i}`}>{parts[i]}</span>);
      }
    }

    return result;
  };

  // 更新 renderTokenizationAgreementComponent
  const renderTokenizationAgreementComponent = () => {
    return (
      <button
        className={`${styles.agreeButton} ${agree ? styles.disabled : ""}`}
        onClick={onAgree}
        disabled={agree}
      >
        <img
          src={agree ? checkedAgreeIcon : checkAgreeIcon}
          alt="Agree"
          className={styles.agreeButtonIcon}
        />
        I Have Read And Agree
      </button>
    );
  };

  const renderGenerateResultComponent = (cu: number) => {
    // 计算图片展示尺寸，保持原始宽高比，短边固定为 12.5rem (200px)
    let displayWidth = 12.5; // 默认宽度 12.5rem (200px)
    let displayHeight = 12.5; // 默认高度 12.5rem (200px)

    if (images.length > 0 && imageWidth && imageHeight) {
      const aspectRatio = imageWidth / imageHeight;

      if (aspectRatio >= 1) {
        // 宽图：宽度大于高度，高度固定为 12.5rem
        displayHeight = 12.5;
        displayWidth = 12.5 * aspectRatio;
      } else {
        // 长图：高度大于宽度，宽度固定为 12.5rem
        displayWidth = 12.5;
        displayHeight = 12.5 / aspectRatio;
      }
    }

    return (
      <div className={styles.imageResultContainer}>
        <div className={styles.generatedImagesGrid}>
          {/* 只显示第一张图片 */}
          {images.length > 0 && (
            <div
              className={styles.generatedImageWrapper}
              style={{
                width: `${displayWidth}rem`,
                height: `${displayHeight}rem`,
              }}
            >
              <img
                src={images[0]}
                alt="Generated Image"
                className={styles.generatedImage}
              />
            </div>
          )}
        </div>
        <div className="text-[0.625rem] leading-[0.625rem] font-medium text-[#88A4C2] text-start font-['Jura']">
          {cu} Credits
        </div>

        {/* 新增：扩展选项 - 只在最后一条消息时显示 */}
        {isLastMessage && (
          <div className={styles.extensionsContainer}>
            <div className={styles.extensionsLabel}>Extensions</div>
            <div className={styles.extensionsButtons}>
              <button
                className={styles.extensionButton}
                onClick={onPartiallyModify}
              >
                Partially Modify (35 credits)
              </button>
              <button
                className={styles.extensionButton}
                onClick={onAnimate}
              >
                Animate (100 credits)
              </button>
              <button
                className={styles.extensionButton}
                onClick={onMintNFT}
              >
                mint as NFT (20 credits)
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderUploadImageComponent = () => {
    const { totalCount, uploadedCount, isUploading, finishUpload } =
      imageUploadState;
    const hasImages = uploadedFiles.length > 0;
    const hasMaxImages = uploadedFiles.length >= 10;
    const canConfirm = hasMaxImages && !isUploading && !finishUpload;
    const canAddImages =
      !isUploading && !finishUpload && uploadedFiles.length < 30;
    const showSelectImages = uploadedFiles.length == 0;
    const canSelectImage = canAddImages;

    return (
      <>
        <div className={styles.uploadImageContainer}>
          <div className={styles.uploadImageHeader}>
            <span className={styles.uploadImageTitle}>Upload Images:</span>
            <div className={styles.uploadButtonGroup}>
              {showSelectImages ? (
                <button
                  className={`${styles.selectButton} ${
                    canSelectImage ? "" : styles.disabled
                  }`}
                  onClick={onAddImage}
                  disabled={!canSelectImage}
                >
                  Select Images
                </button>
              ) : (
                <>
                  <button
                    className={`${styles.addButton} ${
                      canAddImages ? "" : styles.disabled
                    }`}
                    onClick={onAddImage}
                    disabled={!canAddImages}
                  >
                    Add
                  </button>
                  <button
                    className={`${styles.confirmButton} ${
                      !canConfirm ? styles.disabled : ""
                    }`}
                    onClick={onConfirmImages}
                    disabled={!canConfirm}
                  >
                    Confirm
                  </button>
                </>
              )}
            </div>
          </div>
          {/* 已上传图片预览 */}
          {hasImages && (
            <div className={styles.uploadedImagesPreview}>
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className={`${styles.imageItem} ${
                    isUploading ? styles.isUploading : ""
                  }`}
                >
                  <img
                    src={imageIcon}
                    alt="File"
                    className={styles.imageIcon}
                  />
                  <span className={styles.fileName}>
                    {formatFileName(file.name)}
                  </span>
                  {!finishUpload && (
                    <img
                      src={closeIcon}
                      alt="Remove"
                      className={styles.removeIcon}
                      onClick={() =>
                        !isUploading && onRemoveImage && onRemoveImage(file.url)
                      }
                    />
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="text-xs font-medium text-[#88A4C2] text-end font-['Jura']">
            Cost {TRAIN_MODEL_SERVICE_CONFIG.cu} Credits
          </div>
        </div>

        {/* 上传状态指示器 - 注意这是在uploadImageContainer之外的 */}
        {(isUploading || hasImages) && (
          <div className={styles.progressIndicator}>
            <img
              src={isUploading ? uploadingIcon : okIcon}
              alt={isUploading ? "Uploading" : "Done"}
              className={isUploading ? styles.uploadingIcon : styles.statusIcon}
            />
            <span className={styles.statusText}>
              {isUploading
                ? `Uploading (${uploadedCount}/${totalCount})`
                : `Uploaded your ${uploadedFiles.length} ${
                    uploadedFiles.length === 1 ? "image" : "images"
                  }!`}
            </span>
          </div>
        )}

        {!finishUpload && hasMaxImages && (
          <div className={styles.confirmHint}>
            You've uploaded the maximum of 10 images. Please click Confirm to
            continue.
          </div>
        )}
      </>
    );
  };

  // 添加model_config渲染逻辑
  const renderModelConfigComponent = () => {
    return (
      <div className={styles.modelConfigContainer}>
        <div className={styles.modelConfigItem}>
          <span className={styles.modelConfigLabel}>Model name: </span>
          <span className={styles.modelConfigValue}>
            {modelParam?.modelName || "?"}
          </span>
        </div>
        <div className={styles.modelConfigItem}>
          <span className={styles.modelConfigLabel}>Description: </span>
          <span className={styles.modelConfigValue}>
            {modelParam?.description || "?"}
          </span>
        </div>
      </div>
    );
  };

  // 添加workflow_config渲染逻辑
  const renderWorkflowConfigComponent = () => {
    return (
      <div className={styles.modelConfigContainer}>
        <div className={styles.modelConfigItem}>
          <span className={styles.modelConfigLabel}>Workflow name: </span>
          <span className={styles.modelConfigValue}>
            {workflow_name || "?"}
          </span>
        </div>
        <div className={styles.modelConfigItem}>
          <span className={styles.modelConfigLabel}>Description: </span>
          <span className={styles.modelConfigValue}>
            {workflow_description || "?"}
          </span>
        </div>
      </div>
    );
  };

  // 添加状态跟踪输入内容和是否聚焦
  const [isFocused, setIsFocused] = useState(false);

  // 在组件内部添加状态来跟踪下拉菜单是否显示
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showProviderDropdown, setShowProviderDropdown] = useState(false);

  // 添加滚动条相关状态
  const [scrollHeight, setScrollHeight] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [clientHeight, setClientHeight] = useState(0);

  const promptTextareaRef = useRef<HTMLTextAreaElement>(null);
  const promptScrollbarRef = useRef<HTMLDivElement>(null);

  // 监听textarea的滚动事件
  const handlePromptTextareaScroll = () => {
    if (promptTextareaRef.current) {
      setScrollTop(promptTextareaRef.current.scrollTop);
    }
  };

  // 处理自定义滚动条拖动
  const handlePromptScrollThumbDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();

    const startY = e.clientY;
    const startScrollTop = scrollTop;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (promptTextareaRef.current) {
        const deltaY = moveEvent.clientY - startY;
        const scrollRatio = deltaY / clientHeight;
        promptTextareaRef.current.scrollTop = startScrollTop + scrollRatio * scrollHeight;
        setScrollTop(promptTextareaRef.current.scrollTop);
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
  const getPromptScrollThumbHeight = () => {
    if (scrollHeight <= clientHeight) return 0;
    return Math.max(30, (clientHeight / scrollHeight) * clientHeight);
  };

  const getPromptScrollThumbTop = () => {
    if (scrollHeight <= clientHeight) return 0;
    return (scrollTop / (scrollHeight - clientHeight)) * (clientHeight - getPromptScrollThumbHeight());
  };

  // 显示自定义滚动条的条件
  const showPromptCustomScrollbar = scrollHeight > clientHeight;

  // 监听textarea内容变化，更新滚动状态
  useEffect(() => {
    if (promptTextareaRef.current) {
      setScrollHeight(promptTextareaRef.current.scrollHeight);
      setClientHeight(promptTextareaRef.current.clientHeight);
      setScrollTop(promptTextareaRef.current.scrollTop);
    }
  }, [workflow_prompt]);

  // 获取当前选择的提供商和模型信息
  const getCurrentProvider = () => {
    return aiProviders?.providers.find(p => p.name === aiProviders.selectedProvider);
  };

  const getCurrentModel = () => {
    const provider = getCurrentProvider();
    return provider?.models.find(m => m.name === aiProviders?.selectedModel);
  };

  // 获取支持的输入输出类型
  const getSupportedInputTypes = () => {
    const model = getCurrentModel();
    return model?.support_input_types || [];
  };

  const getSupportedOutputTypes = () => {
    const model = getCurrentModel();
    return model?.support_output_types || [];
  };

  // 检查类型是否被支持
  const isTypeSupported = (type: string, supportedTypes: string[]): boolean => {
    const typeMap: { [key: string]: string } = {
      'Image': 'image',
      'Text': 'text',
      'Image + Text': 'image,text',
      'Video': 'video'
    };

    return supportedTypes.includes(typeMap[type] || type);
  };

  // 添加创建工作流中的状态UI
  const renderCreatingWorkflowComponent = () => {
    return (
      <div className={styles.creatingWorkflowIndicator}>
        <img
          src={createWorkflowIcon}
          alt="Creating"
          className={styles.creatingWorkflowIcon}
        />
        <span className={styles.creatingWorkflowText}>
          Creating workflow, please wait...
        </span>
      </div>
    );
  };

  // 修改工作流创建成功UI
  const renderWorkflowSuccessComponent = () => {
    return (
      <div className={styles.progressIndicator}>
        <img
          src={okIcon}
          alt="Done"
          className={styles.statusIcon}
        />
        <div className={styles.successTextContainer}>
          <span className={styles.statusText}>
            Save workflow success! Check <span
              className={styles.checkWorkflowText}
              onClick={() => onNavigateToWorkflow && onNavigateToWorkflow(workflow_name)}
            >
              {workflow_name}
            </span>
          </span>
        </div>
      </div>
    );
  };

  // 添加渲染 Reference Image 部分的函数
  const renderReferenceImageSection = () => {
    const hasUploadedImage = workflowReferenceImage?.uploadedUrl;
    const isUploading = workflowReferenceImage?.isUploading;

    return (
      <div className={styles.workflowSection}>
        <div className={styles.sectionLabel}>Reference Image (Optional):</div>

        {!hasUploadedImage && !isUploading ? (
          // 未上传图片状态 - 显示上传按钮
          <button
            className={styles.uploadButton}
            onClick={onUploadReferenceImage}
            disabled={isCreatingWorkflow}
          >
            <img
              src={uploadIcon}
              alt="Upload"
              className={styles.uploadIcon}
            />
            <span>Upload</span>
          </button>
        ) : (
          // 已上传图片或上传中状态
          <div className={styles.referenceImageContainer}>
            {isUploading ? (
              // 上传中状态
              <div className={styles.referenceImageUploading}>
                <img
                  src={uploadingIcon}
                  alt="Uploading"
                  className={styles.uploadingIcon}
                />
                <span className={styles.uploadingText}>
                  Uploading {workflowReferenceImage?.fileName}...
                </span>
              </div>
            ) : (
              // 上传完成状态
              <div className={styles.referenceImagePreview}>
                <div className={styles.referenceImageItem}>
                  <img
                    src={imageIcon}
                    alt="Reference"
                    className={styles.referenceImageIcon}
                  />
                  <span className={styles.referenceImageName}>
                    {formatFileName(workflowReferenceImage?.fileName || '')}
                  </span>
                  {!isCreatingWorkflow && (
                    <img
                      src={closeIcon}
                      alt="Remove"
                      className={styles.removeReferenceIcon}
                      onClick={onRemoveReferenceImage}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // 修改工作流组件，去掉Model选择部分，只保留Provider选择但显示为Model
  const renderCreateWorkflowComponent = () => {
    const isPromptTooLong = workflow_prompt.length > 300;
    const supportedInputTypes = getSupportedInputTypes();
    const supportedOutputTypes = getSupportedOutputTypes();

    return (
      <>
      {!creationSuccess && (<div className={styles.workflowContainer}>
        {/* 只有在未创建成功时才显示标题 */}
        <div className={styles.workflowTitle}>
          {workflow_name} - Workflow
        </div>

        {/* Model选择部分 - 实际是Provider选择，但显示为Model */}
        <div className={styles.workflowSection}>
          <div className={styles.sectionLabel}>Model:</div>
          <div className={styles.modelSelectContainer}>
            <button
              className={styles.modelSelectButton}
              onClick={() => !isCreatingWorkflow && setShowProviderDropdown(!showProviderDropdown)}
              disabled={isCreatingWorkflow || aiProviders?.isLoading}
              type="button"
            >
              <span className={styles.buttonText}>
                {aiProviders?.isLoading ? 'Loading...' : (aiProviders?.selectedProvider || 'Select Model')}
              </span>
              <img
                src={selectModelIcon}
                alt="Select"
                className={styles.selectModelIcon}
              />
            </button>

            {/* Provider下拉菜单 */}
            {showProviderDropdown && aiProviders?.providers && (
              <div className={styles.modelDropdown}>
                {aiProviders.providers.map((provider) => (
                  <div
                    key={provider.name}
                    className={`${styles.modelOption} ${aiProviders.selectedProvider === provider.name ? styles.modelOptionSelected : ''}`}
                    onClick={() => {
                      if (onSelectProvider) onSelectProvider(provider.name);
                      setShowProviderDropdown(false);
                    }}
                  >
                    {provider.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Prompt输入部分 */}
        <div className={styles.workflowSection}>
          <div className={styles.sectionLabel}>Prompt:</div>
          <div className={`${styles.promptInputContainer} ${isFocused ? styles.focused : ''}`}>
            <div className={styles.promptTextareaWrapper}>
              <textarea
                ref={promptTextareaRef}
                className={styles.promptInput}
                value={workflow_prompt}
                onChange={(e) => onUpdatePrompt && onUpdatePrompt(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onScroll={handlePromptTextareaScroll}
                placeholder="Enter your prompt here"
                maxLength={300}
                disabled={isCreatingWorkflow}
              />

              {/* 自定义滚动条 */}
              {showPromptCustomScrollbar && (
                <div className={styles.promptCustomScrollbarTrack}>
                  <div
                    ref={promptScrollbarRef}
                    className={styles.promptCustomScrollbarThumb}
                    style={{
                      height: `${getPromptScrollThumbHeight()}px`,
                      top: `${getPromptScrollThumbTop()}px`
                    }}
                    onMouseDown={handlePromptScrollThumbDrag}
                  />
                </div>
              )}
            </div>

            <div className={`${styles.charCount} ${isPromptTooLong ? styles.charCountError : ''}`}>
              Max 300 Chars
            </div>
          </div>
        </div>

        {/* Reference Image上传部分 */}
        {renderReferenceImageSection()}

        {/* Input类型选择部分 */}
        <div className={styles.workflowSection}>
          <div className={styles.sectionLabel}>Input:</div>
          <div className={styles.optionsContainer}>
            {['Image', 'Text', 'Image + Text'].map((type) => {
              const isSupported = isTypeSupported(type, supportedInputTypes);
              const isSelected = workflow_input === type;

              return (
                <button
                  key={type}
                  className={`${styles.optionButton} ${isSelected ? styles.optionSelected : ''} ${!isSupported ? styles.disabled : ''}`}
                  onClick={() => isSupported && onChangeInput && onChangeInput(type)}
                  disabled={isCreatingWorkflow || !isSupported}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        {/* Output类型选择部分 */}
        <div className={styles.workflowSection}>
          <div className={styles.sectionLabel}>Output:</div>
          <div className={styles.optionsContainer}>
            {['Image', 'Text', 'Video'].map((type) => {
              const isSupported = isTypeSupported(type, supportedOutputTypes);
              const isSelected = workflow_output === type;

              return (
                <button
                  key={type}
                  className={`${styles.optionButton} ${isSelected ? styles.optionSelected : ''} ${!isSupported ? styles.disabled : ''}`}
                  onClick={() => isSupported && onChangeOutput && onChangeOutput(type)}
                  disabled={isCreatingWorkflow || !isSupported}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        {/* 确认按钮 */}
        <div className={styles.confirmWorkflowButtonContainer}>
          <button
            className={styles.confirmWorkflowButton}
            onClick={onCreateWorkflow}
            disabled={isCreatingWorkflow}
          >
            Confirm
          </button>
        </div>
      </div>)}

      {/* 创建中状态 */}
      {isCreatingWorkflow && renderCreatingWorkflowComponent()}

      {/* 创建成功状态 */}
      {creationSuccess && renderWorkflowSuccessComponent()}
      </>
    );
  };

  // 使用工作流组件
  const renderUseWorkflowComponent = () => {
    // 如果有store中的workflowImageValue，优先显示它
    const displayImageUrl = workflowImageValue;
    const hasSelectedImage = !!displayImageUrl;

    // 按钮状态判断 - 当运行中或已确认时都禁用
    const isButtonDisabled = isRunningWorkflow || isConfirmedWorkflow;

    // 获取确认按钮文本 - 根据状态显示不同文本
    const getConfirmButtonText = () => {
      if (isConfirmedWorkflow) return "Confirmed";
      return "Confirm";
    };

    // 检查是否应该显示附加信息输入框
    // 只有当 input_type 包含 "text" 或者是 "image + text" 时才显示
    const shouldShowAdditionalInfo = currentWorkflow?.input_type?.toLowerCase().includes('text') ||
                                   currentWorkflow?.input_type?.toLowerCase().includes('image + text');

    // 文件选择处理函数
    const handleSelectFile = () => {
      // 创建文件选择对话框
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/jpeg,image/jpg,image/png,image/webp'; // 限制文件格式

      input.onchange = (event) => {
        const target = event.target as HTMLInputElement;
        if (target.files && target.files.length > 0) {
          const file = target.files[0];

          // 验证文件格式
          const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
          if (!allowedTypes.includes(file.type)) {
            alert('Only JPG, JPEG, PNG, and WebP formats are allowed');
            target.value = '';
            return;
          }

          // 验证文件大小 (4MB = 4 * 1024 * 1024 bytes)
          const maxSize = 4 * 1024 * 1024; // 4MB
          if (file.size > maxSize) {
            alert('File size must be less than 4MB');
            target.value = '';
            return;
          }

          // 创建本地临时URL用于预览
          const tempUrl = URL.createObjectURL(file);
          // 保存文件到全局状态以便后续上传
          if (onSelectWorkflowImage) {
            onSelectWorkflowImage(tempUrl, file);
          }
        }
      };

      input.click();
    };

    return (
      <div className={styles.workflowRunContainer}>
        <div className={styles.workflowRunTitle}>Upload Your Image</div>

        {/* 附加提示词输入框 - 只有当 input_type 包含 text 时才显示 */}
        {shouldShowAdditionalInfo && (
          <div className={styles.workflowSection}>
            <div className={styles.sectionLabel} style={{marginTop: '1rem'}}>Additional Info (Optional)</div>
            <div className={`${styles.promptInputContainer} ${isFocused ? styles.focused : ''}`}>
              <div className={styles.promptTextareaWrapper}>
                <textarea
                  className={styles.promptInput}
                  placeholder="Additional requirements for generated image."
                  value={workflow_extra_prompt || ''}
                  onChange={e => onUpdateWorkflowExtraPrompt && onUpdateWorkflowExtraPrompt(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  maxLength={300}
                  disabled={isButtonDisabled}
                  style={{height: '60px'}}
                />
              </div>
              <div className={styles.charCount}>
                Max 300 Chars
              </div>
            </div>
          </div>
        )}

        {!hasSelectedImage ? (
          // 未选择图片状态
          <div className={styles.uploadImageButtonContainer}>
            <button
              className={styles.uploadImageButton}
              onClick={handleSelectFile}
              disabled={isButtonDisabled}
            >
              Upload Image
            </button>
          </div>
        ) : (
          // 已选择图片状态
          <>
            <div className={styles.workflowImagePreview}>
              {displayImageUrl && (
                <img
                  src={displayImageUrl}
                  alt="Workflow input"
                  className={styles.workflowPreviewImage}
                />
              )}
            </div>

            <div className={styles.workflowButtonGroup}>
              <button
                className={styles.removeImageButton}
                onClick={() => {
                  if (onSelectWorkflowImage && !isButtonDisabled) {
                    onSelectWorkflowImage("", null);
                  }
                }}
                disabled={isButtonDisabled}
              >
                <img
                  src={isButtonDisabled ? deleteDisableIcon : deleteIcon}
                  alt="Delete"
                  width={20}
                  height={20}
                />
              </button>

              <button
                className={styles.confirmWorkflowButton}
                onClick={() => {
                  if (onRunWorkflow && !isButtonDisabled) {
                    onRunWorkflow();
                  }
                }}
                disabled={isButtonDisabled}
              >
                {getConfirmButtonText()}
              </button>
            </div>
          </>
        )}

        {/* 执行工作流中状态 */}
        {isRunningWorkflow && (
          <div className={styles.creatingWorkflowIndicator}>
            <img
              src={createWorkflowIcon}
              alt="Running"
              className={styles.creatingWorkflowIcon}
            />
            <span className={styles.creatingWorkflowText}>
              Running workflow, please wait...(ETA 200 sec)
            </span>
          </div>
        )}
      </div>
    );
  };

  const getScaledImageUrl = (imageUrl: string) => {
    return `https://ik.imagekit.io/xenoai/niyoko/${imageUrl}?tr=w-200,q-90`
  }

  // 添加渲染函数：
  const renderUploadedImageComponent = () => {
    if (!images || images.length === 0) return null;

    // 固定显示尺寸为 12.5rem x 12.5rem
    const displaySize = 12.5;

    return (
      <div className={styles.uploadedImageContainer}>
        <div className={styles.uploadedImageWrapper}>
          <img
            src={getScaledImageUrl(images[0])}
            alt="Uploaded Image"
            className={styles.uploadedImage}
            style={{
              width: `${displaySize}rem`,
              height: 'auto', // 原始比例
              objectFit: 'contain',
              borderRadius: '0.5rem'
            }}
          />
        </div>
      </div>
    );
  };

  // 新增：视频生成中组件
  const renderGeneratingVideoComponent = () => {
    return (
      <div className={styles.generatingIndicator} key={request_id}>
        <img
          src={uploadingIcon}
          alt="Generating"
          className={styles.uploadingIcon}
        />
        <span className={styles.generatingText}>
          Generating video, please wait...(ETA 600 sec)
        </span>
      </div>
    );
  };

  // 新增：视频生成结果组件
  const renderVideoResultComponent = (cu: number) => {
    return (
      <div className={styles.imageResultContainer}>
        <div className={styles.generatedImagesGrid}>
          {/* 显示第一个视频 */}
          {videos.length > 0 && (
            <div
              className={styles.generatedImageWrapper}
              style={{
                width: `${12.5}rem`,
                height: `${12.5}rem`,
              }}
            >
              <video
                src={videos[0]}
                controls
                className={styles.generatedVideo}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  borderRadius: '0.5rem'
                }}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}
        </div>
        <div className="text-[0.625rem] leading-[0.625rem] font-medium text-[#88A4C2] text-start font-['Jura']">
          {cu} Credits
        </div>

        {/* 扩展选项 - 只在最后一条消息时显示 */}
        {isLastMessage && (
          <div className={styles.extensionsContainer}>
            <div className={styles.extensionsLabel}>Extensions</div>
            <div className={styles.extensionsButtons}>
              <button
                className={styles.extensionButton}
                onClick={onPartiallyModify}
              >
                Partially Modify (35 credits)
              </button>
              <button
                className={styles.extensionButton}
                onClick={onAnimate}
              >
                Animate (100 credits)
              </button>
              <button
                className={styles.extensionButton}
                onClick={onMintNFT}
              >
                mint as NFT (20 credits)
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // 新增：动画生成中组件
  const renderAnimatingImageComponent = () => {
    return (
      <div className={styles.generatingIndicator} key={request_id}>
        <img
          src={uploadingIcon}
          alt="Animating"
          className={styles.uploadingIcon}
        />
        <span className={styles.generatingText}>
          Generating video, please wait...(ETA 600 sec)
        </span>
      </div>
    );
  };

  // 新增：NFT铸造中组件
  const renderMintingNFTComponent = () => {
    return (
      <div className={styles.mintingIndicator} key={request_id}>
        {/* 第一行：图标和文本 */}
        <div className={styles.mintingFirstRow}>
          <img
            src={uploadingIcon}
            alt="Minting"
            className={styles.uploadingIcon}
          />
          <span className={styles.generatingText}>
            Minting NFT, please wait...
          </span>
        </div>
        
        {/* 第二行：服务提供商信息 */}
        <div className={styles.serviceProviderInfo}>
          <span className={styles.serviceProviderText}>
            This service is provided by{' '}
            <a 
              href="https://x.com/Misato_virtuals" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.serviceProviderLink}
            >
              @virtuals_misato
            </a>
          </span>
          <div className={styles.serviceProviderIcons} onClick={() => window.open('https://x.com/Misato_virtuals', '_blank')}>
            <img
              src="https://pbs.twimg.com/profile_images/1914882710524534784/jMbLIgZD_400x400.jpg"
              alt="Misato"
              className={styles.serviceProviderAvatar}
            />
            <img
              src={xIcon}
              alt="X"
              className={styles.xIcon}
            />
          </div>
        </div>
      </div>
    );
  };

  const showContent = ! (role === "user" && type === "uploaded_image");

  return (
    <div className={`${styles.messageContainer} ${styles[role]}`}>
      {showContent && (
      <div className={styles.messageContent}>
        {type === "tokenization_agreement" ? (
          <p className={styles.text}>{processContent(content)}</p>
        ) : (
          <p className={styles.text}>{content}</p>
        )}
      </div>
      )}

      {role === "assistant" &&
        type === "upload_image" &&
        renderUploadImageComponent()}
      {role === "assistant" &&
        type === "model_config" &&
        renderModelConfigComponent()}
      {role === "assistant" &&
        type === "create_workflow_details" &&
          renderWorkflowConfigComponent()}
      {role === "assistant" &&
        type === "generate_result" &&
        renderGenerateResultComponent(GENERATE_IMAGE_SERVICE_CONFIG.cu)}
      {role === "assistant" &&
        type === "workflow_generate_result" &&
        renderGenerateResultComponent(RUN_WORKFLOW_SERVICE_CONFIG.cu)}
      {role === "assistant" &&
        type === "video_generate_result" &&
        renderVideoResultComponent(RUN_WORKFLOW_SERVICE_CONFIG.cu)}
      {role === "assistant" &&
        type === "generating_image" &&
        renderGeneratingImageComponent()}
      {role === "assistant" &&
        type === "generating_video" &&
        renderGeneratingVideoComponent()}
      {role === "assistant" &&
        type === "modify_image" &&
          renderModifyImageComponent()}
      {role === "assistant" &&
        type === "tokenization_agreement" &&
        renderTokenizationAgreementComponent()}
      {role === "assistant" &&
        type === "create_workflow" &&
        renderCreateWorkflowComponent()}
      {role === "assistant" &&
        type === "run_workflow" &&
        renderUseWorkflowComponent()}
      {role === "user" &&
        type === "uploaded_image" &&
        renderUploadedImageComponent()}
      {role === "assistant" &&
        type === "animating_image" &&
        renderAnimatingImageComponent()}
      {role === "assistant" &&
        type === "minting_nft" &&
        renderMintingNFTComponent()}
    </div>
  );
};

export default ChatMessage;
