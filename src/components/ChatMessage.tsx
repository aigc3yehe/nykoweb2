import React, { useState } from "react";
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
import { GENERATE_IMAGE_SERVICE_CONFIG, TRAIN_MODEL_SERVICE_CONFIG } from "../utils/plan";

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
    | "run_workflow";
  imageUploadState?: ImageUploadState;
  uploadedFiles?: Array<{ name: string; url: string }>;
  modelParam?: {
    modelName?: string;
    description?: string;
  };
  agree?: boolean;
  images?: string[];
  imageWidth?: number;
  imageHeight?: number;
  request_id?: string;
  workflow_name?: string;
  workflow_prompt?: string;
  workflow_input?: string;
  workflow_output?: string;
  workflow_model?: string;
  onAddImage?: () => void;
  onConfirmImages?: () => void;
  onRemoveImage?: (url: string) => void;
  onAgree?: () => void;
  onSelectModel?: (model: string) => void;
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
  imageWidth = 256,
  imageHeight = 256,
  request_id = "",
  workflow_name = "",
  workflow_prompt = "",
  workflow_model = "",
  onAddImage,
  onConfirmImages,
  onRemoveImage,
  onAgree,
  onSelectModel,
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

  const renderGenerateResultComponent = () => {
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
          {GENERATE_IMAGE_SERVICE_CONFIG.cu} Credits
        </div>
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

  // 添加状态跟踪输入内容和是否聚焦
  const [isFocused, setIsFocused] = useState(false);

  // 在组件内部添加状态来跟踪下拉菜单是否显示
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  // 添加模型选项列表
  const modelOptions = [
    { value: 'gpt-4o', label: 'GPT-4o' }
  ];

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

  // 添加工作流创建成功UI
  const renderWorkflowSuccessComponent = () => {
    return (
      <div className={styles.progressIndicator}>
        <img
          src={okIcon}
          alt="Done"
          className={styles.statusIcon}
        />
        <span className={styles.statusText}>
          Save workflow success!
        </span>
      </div>
    );
  };

  // 修改工作流组件，增加创建工作流功能
  const renderCreateWorkflowComponent = () => {
    const isPromptTooLong = workflow_prompt.length > 500;

    return (
      <>
        <div className={styles.workflowContainer}>
          <div className={styles.workflowTitle}>
            {workflow_name} - Workflow
          </div>

          {/* Model选择部分 */}
          <div className={styles.workflowSection}>
            <div className={styles.sectionLabel}>Model:</div>
            <div className={styles.modelSelectContainer}>
              <button
                className={styles.modelSelectButton}
                onClick={() => !isCreatingWorkflow && setShowModelDropdown(!showModelDropdown)}
                disabled={isCreatingWorkflow}
                type="button"
              >
                <span className={styles.buttonText}>
                  {workflow_model || "GPT-4o"}
                </span>
                <img
                  src={selectModelIcon}
                  alt="Select"
                  className={styles.selectModelIcon}
                />
              </button>

              {/* 下拉菜单 */}
              {showModelDropdown && (
                <div className={styles.modelDropdown}>
                  {modelOptions.map((option) => (
                    <div
                      key={option.value}
                      className={`${styles.modelOption} ${workflow_model === option.value ? styles.modelOptionSelected : ''}`}
                      onClick={() => {
                        if (onSelectModel) onSelectModel(option.value);
                        setShowModelDropdown(false);
                      }}
                    >
                      {option.label}
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
              <textarea
                className={styles.promptInput}
                value={workflow_prompt}
                onChange={(e) => onUpdatePrompt && onUpdatePrompt(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Enter your prompt here"
                maxLength={500}
                disabled={isCreatingWorkflow}
              />
              <div className={`${styles.charCount} ${isPromptTooLong ? styles.charCountError : ''}`}>
                Max 500 char
              </div>
            </div>
          </div>

          {/* Reference Image上传部分 */}
          <div className={styles.workflowSection}>
            <div className={styles.sectionLabel}>Reference Image:</div>
            <button
              className={styles.uploadButton}
              onClick={onAddImage}
              disabled={isCreatingWorkflow}
            >
              <img
                src={uploadIcon}
                alt="Upload"
                className={styles.uploadIcon}
              />
              <span>Upload</span>
            </button>
          </div>

          {/* Input类型选择部分 - 修改为只能选择Image选项 */}
          <div className={styles.workflowSection}>
            <div className={styles.sectionLabel}>Input:</div>
            <div className={styles.optionsContainer}>
              <button
                className={`${styles.optionButton} ${styles.optionSelected}`}
                onClick={() => onChangeInput && onChangeInput("Image")}
                disabled={isCreatingWorkflow}
              >
                Image
              </button>
              <button
                className={`${styles.optionButton} ${styles.disabled}`}
                disabled={true}
              >
                Text
              </button>
              <button
                className={`${styles.optionButton} ${styles.disabled}`}
                disabled={true}
              >
                Image + Text
              </button>
            </div>
          </div>

          {/* Output类型选择部分 - 修改为只能选择Image选项 */}
          <div className={styles.workflowSection}>
            <div className={styles.sectionLabel}>Output:</div>
            <div className={styles.optionsContainer}>
              <button
                className={`${styles.optionButton} ${styles.optionSelected}`}
                onClick={() => onChangeOutput && onChangeOutput("Image")}
                disabled={isCreatingWorkflow}
              >
                Image
              </button>
              <button
                className={`${styles.optionButton} ${styles.disabled}`}
                disabled={true}
              >
                Text
              </button>
              <button
                className={`${styles.optionButton} ${styles.disabled}`}
                disabled={true}
              >
                Image + Text
              </button>
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
        </div>

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

    // 文件选择处理函数
    const handleSelectFile = () => {
      // 创建文件选择对话框
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';

      input.onchange = (event) => {
        const target = event.target as HTMLInputElement;
        if (target.files && target.files.length > 0) {
          const file = target.files[0];
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
              Running workflow, please wait...
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`${styles.messageContainer} ${styles[role]}`}>
      <div className={styles.messageContent}>
        {type === "tokenization_agreement" ? (
          <p className={styles.text}>{processContent(content)}</p>
        ) : (
          <p className={styles.text}>{content}</p>
        )}
      </div>

      {role === "assistant" &&
        type === "upload_image" &&
        renderUploadImageComponent()}
      {role === "assistant" &&
        type === "model_config" &&
        renderModelConfigComponent()}
      {role === "assistant" &&
        type === "generate_result" &&
        renderGenerateResultComponent()}
      {role === "assistant" &&
        type === "generating_image" &&
        renderGeneratingImageComponent()}
      {role === "assistant" &&
        type === "tokenization_agreement" &&
        renderTokenizationAgreementComponent()}
      {role === "assistant" &&
        type === "create_workflow" &&
        renderCreateWorkflowComponent()}
      {role === "assistant" &&
        type === "run_workflow" &&
        renderUseWorkflowComponent()}
    </div>
  );
};

export default ChatMessage;
