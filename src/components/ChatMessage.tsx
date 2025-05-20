import React from "react";
import styles from "./ChatMessage.module.css";
import imageIcon from "../assets/image.svg";
import closeIcon from "../assets/close.svg";
import uploadingIcon from "../assets/uploading.svg";
import okIcon from "../assets/ok.svg";
import checkAgreeIcon from "../assets/check_agree.svg";
import checkedAgreeIcon from "../assets/checked_agree.svg";
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
    | "tokenization_agreement";
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
  onAddImage?: () => void;
  onConfirmImages?: () => void;
  onRemoveImage?: (url: string) => void;
  onAgree?: () => void;
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
  onAddImage,
  onConfirmImages,
  onRemoveImage,
  onAgree,
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
    </div>
  );
};

export default ChatMessage;
