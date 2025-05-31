import React, { useState, useRef, useEffect } from 'react';
import styles from './EditWorkflowModal.module.css';
import { WorkflowDetail, TOKENIZATION_LAUNCHPAD_TYPE, fetchEditWorkflow } from '../store/workflowStore';
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

  const tokenInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editWorkflow = useSetAtom(fetchEditWorkflow);
  const showToast = useSetAtom(showToastAtom);

  // 判断Token Association是否可编辑
  const isTokenAssociationEditable = !workflow.workflow_tokenization?.meme_token;

  // 根据现有tokenization设置初始状态
  useEffect(() => {
    if (isOpen) {
      setName(workflow.name || '');
      setDescription(workflow.description || '');
      setPrompt(workflow.prompt || '');
      setTopics(workflow.tags?.join(' #') ? '#' + workflow.tags.join(' #') : '');
      
      // 根据现有tokenization设置token association和输入值
      if (workflow.workflow_tokenization?.launchpad) {
        setSelectedTokenAssociation(workflow.workflow_tokenization.launchpad as TokenAssociation);
        setTokenInput(workflow.workflow_tokenization.meme_token || '');
      } else {
        setSelectedTokenAssociation('flaunch');
        setTokenInput('');
      }
      
      // 重置reference image状态
      setReferenceImage({
        file: null,
        uploadedUrl: null,
        fileName: null,
        isUploading: false
      });
    }
  }, [isOpen, workflow]);

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

    setReferenceImage(prev => ({
      ...prev,
      file,
      fileName: file.name,
      isUploading: true
    }));

    try {
      // 模拟上传过程
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 这里应该调用实际的上传API
      const uploadedUrl = URL.createObjectURL(file);
      
      setReferenceImage(prev => ({
        ...prev,
        uploadedUrl,
        isUploading: false
      }));
    } catch (error) {
      console.error('Upload failed:', error);
      setReferenceImage(prev => ({
        ...prev,
        isUploading: false,
        file: null,
        fileName: null
      }));
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

  const handleSave = async () => {
    if (isSaving) return;

    setIsSaving(true);
    
    try {
      // 解析topics为tags数组
      const tagsArray = topics
        .split(' ')
        .filter(tag => tag.startsWith('#') && tag.length > 1)
        .map(tag => tag.substring(1)); // 移除#前缀

      const editParams: any = {
        workflow_id: workflow.id,
        name: name.trim(),
        description: description.trim(),
        tags: tagsArray
      };

      // 只有当token输入有值且可编辑时才添加token参数
      if (isTokenAssociationEditable && tokenInput.trim()) {
        editParams.token = {
          address: tokenInput.trim(),
          launchpad: selectedTokenAssociation
        };
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
          name: name.trim(),
          description: description.trim(),
          prompt: prompt.trim(),
          tags: tagsArray
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
    return 'Input hash';
  };

  // 渲染Reference Image部分
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
              // 上传完成状态
              <div className={styles.referenceImagePreview}>
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
                      onClick={handleRemoveReferenceImage}
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

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
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
                Max 300 char
              </span>
            </div>
            <textarea
              className={styles.textArea}
              value={description}
              onChange={(e) => {
                if (e.target.value.length <= 300) {
                  setDescription(e.target.value);
                }
              }}
              placeholder="Enter workflow description"
              maxLength={300}
              disabled={isSaving}
            />
          </div>

          {/* Prompt输入框 */}
          <div className={`${styles.fieldContainer} ${styles.promptFieldContainer}`}>
            <div className={styles.descriptionLabelRow}>
              <label className={styles.fieldLabel}>Prompt:</label>
              <span className={styles.charLimit}>
                Max 300 char
              </span>
            </div>
            <textarea
              className={styles.textArea}
              value={prompt}
              onChange={(e) => {
                if (e.target.value.length <= 300) {
                  setPrompt(e.target.value);
                }
              }}
              placeholder="Enter workflow prompt"
              maxLength={300}
              disabled={isSaving}
            />
          </div>

          {/* Reference Image 部分 */}
          {renderReferenceImageSection()}

          {/* Topic输入框 - 改回普通input */}
          <div className={`${styles.fieldContainer} ${styles.topicFieldContainer}`}>
            <label className={styles.fieldLabel}>#Topic:</label>
            <input
              type="text"
              className={styles.textInput}
              value={topics}
              onChange={handleTopicChange}
              placeholder="Enter topics like #AI #ML #Workflow"
              disabled={isSaving}
            />
          </div>

          {/* Token Association */}
          <div className={`${styles.fieldContainer} ${styles.tokenAssociationContainer}`}>
            <label className={styles.fieldLabel}>Token Association:</label>
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
              disabled={isSaving}
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