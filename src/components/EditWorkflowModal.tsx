import React, { useState, useRef, useEffect } from 'react';
import styles from './EditWorkflowModal.module.css';
import { WorkflowDetail, fetchEditWorkflow } from '../store/workflowStore';
import { useSetAtom } from 'jotai';
import { showToastAtom } from '../store/imagesStore';
import CloseIcon from '../assets/close_account.svg';
import FlaunchIcon from '../assets/flaunch.png';
import VirtualsIcon from '../assets/virtual_logo.png';
import uploadIcon from '../assets/upload.svg';
import uploadingIcon from '../assets/uploading.svg';
import imageIcon from '../assets/image.svg';
import closeIcon from '../assets/close.svg';

interface EditWorkflowModalProps {
  isOpen: boolean;
  workflow: WorkflowDetail;
  onClose: () => void;
  onSave?: (updatedWorkflow: Partial<WorkflowDetail>) => void;
}

type TokenAssociation = 'flaunch' | 'virtuals' | 'others';

interface ReferenceImageState {
  file: File | null;
  uploadedUrl: string | null;
  fileName: string | null;
  isUploading: boolean;
}

const EditWorkflowModal: React.FC<EditWorkflowModalProps> = ({
  isOpen,
  workflow,
  onClose,
  onSave
}) => {
  const [name, setName] = useState(workflow.name || '');
  const [description, setDescription] = useState(workflow.description || '');
  const [prompt, setPrompt] = useState(workflow.prompt || '');
  const [topics, setTopics] = useState(workflow.tags?.join(' #') ? '#' + workflow.tags.join(' #') : '');
  const [selectedTokenAssociation, setSelectedTokenAssociation] = useState<TokenAssociation>('flaunch');
  const [tokenInput, setTokenInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [referenceImage, setReferenceImage] = useState<ReferenceImageState>({
    file: null,
    uploadedUrl: null,
    fileName: null,
    isUploading: false
  });

  // 存储初始值用于比较
  const [initialValues, setInitialValues] = useState({
    name: '',
    description: '',
    prompt: '',
    topics: '',
    tokenInput: '',
    selectedTokenAssociation: 'flaunch' as TokenAssociation,
    hasReferenceImage: false,
    initialReferenceImageUrl: null as string | null // 新增：存储初始的参考图片URL
  });

  const tokenInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editWorkflow = useSetAtom(fetchEditWorkflow);
  const showToast = useSetAtom(showToastAtom);

  // 判断Token Association是否可编辑
  const isTokenAssociationEditable = !workflow.workflow_tokenization?.meme_token;

  // 新增：图片预览状态
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // 根据现有tokenization设置初始状态
  useEffect(() => {
    if (isOpen) {
      const initialName = workflow.name || '';
      const initialDescription = workflow.description || '';
      const initialPrompt = workflow.prompt || '';
      const initialTopics = workflow.tags?.join(' #') ? '#' + workflow.tags.join(' #') : '';
      const initialTokenInput = workflow.workflow_tokenization?.meme_token || '';
      const initialTokenAssociation = (workflow.workflow_tokenization?.launchpad as TokenAssociation) || 'flaunch';
      const initialReferenceImageUrl = workflow.reference_images?.[0] || null;

      setName(initialName);
      setDescription(initialDescription);
      setPrompt(initialPrompt);
      setTopics(initialTopics);
      setTokenInput(initialTokenInput);
      setSelectedTokenAssociation(initialTokenAssociation);

      // 设置参考图片状态
      if (initialReferenceImageUrl) {
        console.log('Setting initial reference image:', initialReferenceImageUrl);
        // 从URL中提取文件名，或者使用默认名称
        const fileName = initialReferenceImageUrl.split('/').pop() || 'reference_image';
        setReferenceImage({
          file: null,
          uploadedUrl: initialReferenceImageUrl,
          fileName: fileName,
          isUploading: false
        });
      } else {
        // 只有在没有初始参考图片时才重置
        setReferenceImage({
          file: null,
          uploadedUrl: null,
          fileName: null,
          isUploading: false
        });
      }

      // 存储初始值
      setInitialValues({
        name: initialName,
        description: initialDescription,
        prompt: initialPrompt,
        topics: initialTopics,
        tokenInput: initialTokenInput,
        selectedTokenAssociation: initialTokenAssociation,
        hasReferenceImage: !!initialReferenceImageUrl,
        initialReferenceImageUrl: initialReferenceImageUrl
      });
    }
  }, [isOpen, workflow]);

  // 检测是否为移动端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 处理图片预览
  const handleImagePreviewToggle = () => {
    if (isMobile) {
      setShowImagePreview(!showImagePreview);
    }
  };

  const handleMouseEnter = () => {
    if (!isMobile) {
      setShowImagePreview(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setShowImagePreview(false);
    }
  };

  // 普通的topic输入处理
  const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTopics(e.target.value);
  };

  const handleTokenAssociationSelect = (association: TokenAssociation) => {
    if (isTokenAssociationEditable) {
      setSelectedTokenAssociation(association);
    }
  };

  // 处理Reference Image上传
  const handleUploadReferenceImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 验证文件格式
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showToast({
        message: 'Only JPG, JPEG, PNG, and WebP formats are allowed',
        severity: 'error'
      });
      return;
    }

    // 验证文件大小 (4MB)
    const maxSize = 4 * 1024 * 1024;
    if (file.size > maxSize) {
      showToast({
        message: 'File size must be less than 4MB',
        severity: 'error'
      });
      return;
    }

    setReferenceImage(prev => ({
      ...prev,
      file,
      fileName: file.name,
      isUploading: true
    }));

    try {
      // 导入上传函数
      const { uploadFileToS3 } = await import('../store/imagesStore');

      // 上传图片到S3
      const uploadedUrl = await uploadFileToS3(file);

      setReferenceImage(prev => ({
        ...prev,
        uploadedUrl,
        isUploading: false
      }));

      showToast({
        message: 'Reference image uploaded successfully',
        severity: 'success'
      });

    } catch (error) {
      console.error('Upload failed:', error);
      setReferenceImage(prev => ({
        ...prev,
        isUploading: false,
        file: null,
        fileName: null
      }));

      showToast({
        message: 'Failed to upload reference image',
        severity: 'error'
      });
    }
  };

  const handleRemoveReferenceImage = () => {
    setReferenceImage({
      file: null,
      uploadedUrl: null,
      fileName: null,
      isUploading: false
    });
  };

  const formatFileName = (fileName: string) => {
    if (fileName.length <= 20) return fileName;
    const ext = fileName.split('.').pop();
    const name = fileName.substring(0, fileName.lastIndexOf('.'));
    return `${name.substring(0, 15)}...${ext}`;
  };

  // 检查是否有修改
  const hasChanges = () => {
    const currentName = name.trim();
    const currentDescription = description.trim();
    const currentPrompt = prompt.trim();
    const currentTopics = topics;
    const currentTokenInput = tokenInput.trim();

    // 比较基本字段
    if (currentName !== initialValues.name.trim()) return true;
    if (currentDescription !== initialValues.description.trim()) return true;
    if (currentPrompt !== initialValues.prompt.trim()) return true;
    if (currentTopics !== initialValues.topics) return true;

    // 检查参考图片的变化
    const currentHasReferenceImage = !!referenceImage.uploadedUrl;
    const initialHasReferenceImage = !!initialValues.initialReferenceImageUrl;

    // 如果参考图片状态发生变化（从无到有，或从有到无，或URL发生变化）
    if (currentHasReferenceImage !== initialHasReferenceImage) return true;
    if (currentHasReferenceImage && referenceImage.uploadedUrl !== initialValues.initialReferenceImageUrl) return true;

    // 比较token相关字段（只有在可编辑时才考虑）
    if (isTokenAssociationEditable) {
      if (currentTokenInput !== initialValues.tokenInput.trim()) return true;
      if (selectedTokenAssociation !== initialValues.selectedTokenAssociation) return true;
    }

    return false;
  };

  const handleSave = async () => {
    if (isSaving || !hasChanges()) return;

    setIsSaving(true);

    try {
      const editParams: any = {
        workflow_id: workflow.id
      };

      // 只添加修改过的字段
      const currentName = name.trim();
      const currentDescription = description.trim();
      const currentPrompt = prompt.trim();

      if (currentName !== initialValues.name.trim()) {
        editParams.name = currentName;
      }

      if (currentDescription !== initialValues.description.trim()) {
        editParams.description = currentDescription;
      }

      if (currentPrompt !== initialValues.prompt.trim()) {
        editParams.prompt = currentPrompt;
      }

      // 检查tags是否有修改 - 修改标签提取逻辑
      if (topics !== initialValues.topics) {
        // 使用正则表达式提取支持空格的标签
        const tagsRegex = /#([^#]+)/g;
        const matches = Array.from(topics.matchAll(tagsRegex));
        const tagsArray = matches
          .map(match => match[1].trim()) // 提取标签内容并去除首尾空格
          .filter(tag => tag.length > 0); // 过滤空标签

        editParams.tags = tagsArray;
      }

      // 检查参考图片变化
      const currentHasReferenceImage = !!referenceImage.uploadedUrl;
      const initialHasReferenceImage = !!initialValues.initialReferenceImageUrl;

      // 如果参考图片状态发生变化，或者URL发生变化
      if (currentHasReferenceImage !== initialHasReferenceImage ||
          (currentHasReferenceImage && referenceImage.uploadedUrl !== initialValues.initialReferenceImageUrl)) {

        if (referenceImage.uploadedUrl) {
          // 有新的参考图片
          editParams.reference_images = [referenceImage.uploadedUrl];
        } else {
          // 参考图片被删除，传递空数组
          editParams.reference_images = [];
        }
      }

      // 检查token相关修改（只有在可编辑时）
      if (isTokenAssociationEditable) {
        const currentTokenInput = tokenInput.trim();
        const tokenChanged = currentTokenInput !== initialValues.tokenInput.trim();
        const associationChanged = selectedTokenAssociation !== initialValues.selectedTokenAssociation;

        if (tokenChanged || associationChanged) {
          if (currentTokenInput) {
            editParams.token = {
              address: currentTokenInput,
              launchpad: selectedTokenAssociation
            };
          }
        }
      }

      // 调用编辑API
      const response = await editWorkflow(editParams);

      if (response.data) {
        showToast({
          message: 'Workflow updated successfully',
          severity: 'success'
        });

        // 调用外部的onSave回调（如果有）
        onSave?.({
          name: currentName,
          description: currentDescription,
          prompt: currentPrompt,
          tags: editParams.tags
        });

        onClose();
      } else {
        throw new Error('Failed to update workflow');
      }
    } catch (error) {
      console.error('Save workflow failed:', error);
      showToast({
        message: 'Failed to update workflow',
        severity: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getTokenAssociationValue = () => {
    if (!isTokenAssociationEditable && workflow.workflow_tokenization?.meme_token) {
      return workflow.workflow_tokenization.meme_token;
    }

    return tokenInput || '';
  };

  const getTokenAssociationPlaceholder = () => {
    return 'Token contract (only on basechain)';
  };

  // 修改渲染Reference Image部分
  const renderReferenceImageSection = () => {
    const hasUploadedImage = referenceImage.uploadedUrl;
    const isUploading = referenceImage.isUploading;

    return (
      <div className={styles.fieldContainer}>
        <label className={styles.fieldLabel}>Reference Image (Optional):</label>

        {!hasUploadedImage && !isUploading ? (
          // 未上传图片状态 - 显示上传按钮
          <button
            className={styles.uploadButton}
            onClick={handleUploadReferenceImage}
            disabled={isSaving}
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
                  Uploading {formatFileName(referenceImage.fileName || '')}...
                </span>
              </div>
            ) : (
              // 上传完成状态 - 添加预览功能
              <div className={styles.referenceImageWrapper}>
                <div
                  className={styles.referenceImagePreview}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  onClick={handleImagePreviewToggle}
                >
                  <div className={styles.referenceImageItem}>
                    <img
                      src={imageIcon}
                      alt="Reference"
                      className={styles.referenceImageIcon}
                    />
                    <span className={styles.referenceImageName}>
                      {formatFileName(referenceImage.fileName || '')}
                    </span>
                    {!isSaving && (
                      <img
                        src={closeIcon}
                        alt="Remove"
                        className={styles.removeReferenceIcon}
                        onClick={(e) => {
                          e.stopPropagation(); // 防止触发预览
                          handleRemoveReferenceImage();
                        }}
                      />
                    )}
                  </div>
                </div>

                {/* 图片预览弹出层 */}
                {showImagePreview && referenceImage.uploadedUrl && (
                  <div className={styles.imagePreviewTooltip}>
                    <img
                      src={referenceImage.uploadedUrl}
                      alt="Preview"
                      className={styles.previewImage}
                      onError={() => {
                        // 如果图片加载失败，隐藏预览
                        setShowImagePreview(false);
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div
        className={styles.editModal}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题栏 */}
        <div className={styles.headerContainer}>
          <span className={styles.headerTitle}>
            {workflow.name} - Workflow
          </span>
          <button
            className={styles.closeButton}
            onClick={onClose}
          >
            <img src={CloseIcon} alt="close" width="24" height="24" />
          </button>
        </div>

        {/* 内容区域 */}
        <div className={styles.contentContainer}>
          {/* Name输入框 */}
          <div className={`${styles.fieldContainer} ${styles.nameFieldContainer}`}>
            <label className={styles.fieldLabel}>Name:</label>
            <input
              type="text"
              className={styles.textInput}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter workflow name"
              disabled={isSaving}
            />
          </div>

          {/* Description输入框 */}
          <div className={`${styles.fieldContainer} ${styles.descriptionFieldContainer}`}>
            <div className={styles.descriptionLabelRow}>
              <label className={styles.fieldLabel}>Description:</label>
              <span className={styles.charLimit}>
                Max 700 char
              </span>
            </div>
            <textarea
              className={styles.textArea}
              value={description}
              onChange={(e) => {
                if (e.target.value.length <= 700) {
                  setDescription(e.target.value);
                }
              }}
              placeholder="Enter workflow description"
              maxLength={700}
              disabled={isSaving}
            />
          </div>

          {/* Prompt输入框 */}
          <div className={`${styles.fieldContainer} ${styles.promptFieldContainer}`}>
            <div className={styles.descriptionLabelRow}>
              <label className={styles.fieldLabel}>Prompt:</label>
              <span className={styles.charLimit}>
                Max 700 char
              </span>
            </div>
            <textarea
              className={styles.textArea}
              value={prompt}
              onChange={(e) => {
                if (e.target.value.length <= 700) {
                  setPrompt(e.target.value);
                }
              }}
              placeholder="Enter workflow prompt"
              maxLength={700}
              disabled={isSaving}
            />
          </div>

          {/* Reference Image 部分 */}
          {renderReferenceImageSection()}

          {/* Topic输入框 */}
          <div className={`${styles.fieldContainer} ${styles.topicFieldContainer}`}>
            <label className={styles.fieldLabel}>#Topic:</label>
            <input
              type="text"
              className={styles.textInput}
              value={topics}
              onChange={handleTopicChange}
              placeholder="Start with #, separate with SPACE, max 3, lowercase recommended."
              disabled={isSaving}
            />
          </div>

          {/* Associated token */}
          <div className={`${styles.fieldContainer} ${styles.tokenAssociationContainer}`}>
            <label className={styles.fieldLabel}>Associated Token:</label>
            <input
              ref={tokenInputRef}
              type="text"
              className={isTokenAssociationEditable ? styles.textInput : styles.readonlyInput}
              value={getTokenAssociationValue()}
              onChange={(e) => isTokenAssociationEditable && setTokenInput(e.target.value)}
              placeholder={getTokenAssociationPlaceholder()}
              readOnly={!isTokenAssociationEditable}
              disabled={isSaving}
            />
            <div className={styles.tokenSelectorContainer}>
              {/* Flaunch选项 */}
              <div
                className={`${styles.tokenOption} ${
                  selectedTokenAssociation === 'flaunch' ? styles.selected : ''
                } ${!isTokenAssociationEditable ? styles.disabled : ''}`}
                onClick={() => handleTokenAssociationSelect('flaunch')}
              >
                <div className={styles.tokenOptionContent}>
                  <img
                    src={FlaunchIcon}
                    alt="Flaunch"
                    className={styles.tokenIcon}
                  />
                  <span className={styles.tokenOptionText}>Flaunch</span>
                </div>
              </div>

              {/* Virtuals选项 */}
              <div
                className={`${styles.tokenOption} ${
                  selectedTokenAssociation === 'virtuals' ? styles.selected : ''
                } ${!isTokenAssociationEditable ? styles.disabled : ''}`}
                onClick={() => handleTokenAssociationSelect('virtuals')}
              >
                <div className={styles.tokenOptionContent}>
                  <img
                    src={VirtualsIcon}
                    alt="Virtuals"
                    className={styles.virtualsIcon}
                  />
                  <span className={styles.tokenOptionText}>Virtuals</span>
                </div>
              </div>

              {/* Others选项 */}
              <div
                className={`${styles.tokenOption} ${
                  selectedTokenAssociation === 'others' ? styles.selected : ''
                } ${!isTokenAssociationEditable ? styles.disabled : ''}`}
                onClick={() => handleTokenAssociationSelect('others')}
              >
                <div className={styles.tokenOptionContent}>
                  <span className={styles.tokenOptionText}>Others</span>
                </div>
              </div>
            </div>
          </div>

          {/* 确认按钮 */}
          <div className={styles.confirmButtonContainer}>
            <button
              className={styles.confirmButton}
              onClick={handleSave}
              disabled={isSaving || !hasChanges()}
            >
              <span className={styles.confirmButtonText}>
                {isSaving ? 'Saving...' : 'Confirm'}
              </span>
            </button>
          </div>
        </div>

        {/* 隐藏的文件输入 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
      </div>
    </div>
  );
};

export default EditWorkflowModal;