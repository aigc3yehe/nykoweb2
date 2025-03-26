import React from 'react';
import styles from './ChatMessage.module.css';
import imageIcon from '../assets/image.svg';
import closeIcon from '../assets/close.svg';
import uploadingIcon from '../assets/uploading.svg';
import okIcon from '../assets/ok.svg';

interface ImageUploadState {
  totalCount: number;
  uploadedCount: number;
  isUploading: boolean;
}

export interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'upload_image' | 'model_config' | 'generate_result';
  imageUploadState?: ImageUploadState;
  uploadedFiles?: Array<{name: string, url: string}>;
  modelParam?: {
    modelName?: string;
    description?: string;
  };
  images?: string[];
  request_id?: string;
  onAddImage?: () => void;
  onConfirmImages?: () => void;
  onRemoveImage?: (url: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  role,
  content,
  type = 'text',
  imageUploadState = { totalCount: 0, uploadedCount: 0, isUploading: false },
  uploadedFiles = [],
  modelParam = { modelName: undefined, description: undefined },
  images = [],
  request_id = '',
  onAddImage,
  onConfirmImages,
  onRemoveImage
}) => {
  // 格式化文件名以适应显示
  const formatFileName = (name: string): string => {
    if (name.length <= 9) return name;
    
    const extension = name.split('.').pop() || '';
    const baseName = name.substring(0, name.length - extension.length - 1);
    
    return `${baseName.substring(0, 3)}...${baseName.substring(baseName.length - 2)}.${extension}`;
  };

  const renderGenerateResultComponent = () => {
    return (
      <div className={styles.imageResultContainer}>
        <div className={styles.imageResultHeader}>
          <span className={styles.imageResultTitle}>{content}</span>
        </div>
        <div className={styles.generatedImagesGrid}>
          {images.map((imageUrl, index) => (
            <div key={index} className={styles.generatedImageWrapper}>
              <img 
                src={imageUrl} 
                alt={`Generated Image ${index + 1}`} 
                className={styles.generatedImage}
                onClick={() => {
                  // 可以实现点击查看大图的功能
                  window.open(imageUrl, '_blank');
                }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderUploadImageComponent = () => {
    const { totalCount, uploadedCount, isUploading } = imageUploadState;
    const hasImages = uploadedFiles.length > 0;
    const hasMaxImages = uploadedFiles.length >= 10;
    const canConfirm = hasMaxImages && !isUploading;
    
    return (
      <>
        <div className={styles.uploadImageContainer}>
          <div className={styles.uploadImageHeader}>
            <span className={styles.uploadImageTitle}>Upload Images:</span>
            <div className={styles.uploadButtonGroup}>
              <button 
                className={`${styles.addButton} ${isUploading ? styles.disabled : ''}`}
                onClick={onAddImage}
                disabled={isUploading}
              >
                Add
              </button>
              <button 
                className={`${styles.confirmButton} ${!canConfirm ? styles.disabled : ''}`}
                onClick={onConfirmImages}
                disabled={!canConfirm}
              >
                Confirm
              </button>
            </div>
          </div>
          
          {/* 已上传图片预览 */}
          {hasImages && (
            <div className={styles.uploadedImagesPreview}>
              {uploadedFiles.map((file, index) => (
                <div key={index} className={`${styles.imageItem} ${isUploading ? styles.isUploading : ''}`}>
                  <img src={imageIcon} alt="File" className={styles.imageIcon} />
                  <span className={styles.fileName}>{formatFileName(file.name)}</span>
                  <img
                    src={closeIcon}
                    alt="Remove"
                    className={styles.removeIcon}
                    onClick={() => !isUploading && onRemoveImage && onRemoveImage(file.url)}
                  />
                </div>
              ))}
            </div>
          )}
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
                : `Uploaded your ${uploadedFiles.length} ${uploadedFiles.length === 1 ? 'image' : 'images'}!`
              }
            </span>
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
          <span className={styles.modelConfigValue}>{modelParam?.modelName || '?'}</span>
        </div>
        <div className={styles.modelConfigItem}>
          <span className={styles.modelConfigLabel}>Description: </span>
          <span className={styles.modelConfigValue}>{modelParam?.description || '?'}</span>
        </div>
      </div>
    );
  };

  return (
    <div className={`${styles.messageContainer} ${styles[role]}`}>
      <div className={styles.messageContent}>
        <p className={styles.text}>{content}</p>
      </div>
      
      {role === 'assistant' && type === 'upload_image' && renderUploadImageComponent()}
      {role === 'assistant' && type === 'model_config' && renderModelConfigComponent()}
      {role === 'assistant' && type === 'generate_result' && renderGenerateResultComponent()}
    </div>
  );
};

export default ChatMessage; 