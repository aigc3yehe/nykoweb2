import React, { useState, useRef, useEffect } from 'react';
import styles from './EditModelModal.module.css';
import { ModelDetail, TOKENIZATION_LAUNCHPAD_TYPE, fetchEditModel } from '../store/modelStore';
import { useSetAtom } from 'jotai';
import { showToastAtom } from '../store/imagesStore';
import CloseIcon from '../assets/close_account.svg';
import FlaunchIcon from '../assets/flaunch.png';
import VirtualsIcon from '../assets/virtual_logo.png';

interface EditModelModalProps {
  isOpen: boolean;
  model: ModelDetail;
  onClose: () => void;
  onSave?: (updatedModel: Partial<ModelDetail>) => void;
}

type TokenAssociation = 'flaunch' | 'virtuals' | 'others';

const EditModelModal: React.FC<EditModelModalProps> = ({ 
  isOpen, 
  model, 
  onClose, 
  onSave 
}) => {
  const [name, setName] = useState(model.name || '');
  const [description, setDescription] = useState(model.description || '');
  const [topics, setTopics] = useState(model.tags?.join(' #') ? '#' + model.tags.join(' #') : '');
  const [selectedTokenAssociation, setSelectedTokenAssociation] = useState<TokenAssociation>('flaunch');
  const [tokenInput, setTokenInput] = useState(''); // 新增token输入状态
  const [isSaving, setIsSaving] = useState(false);
  
  const tokenInputRef = useRef<HTMLInputElement>(null);
  const editModel = useSetAtom(fetchEditModel);
  const showToast = useSetAtom(showToastAtom);

  // 判断Token Association是否可编辑 - 修改为动态判断
  const isTokenAssociationEditable = !model.model_tokenization?.meme_token;

  // 根据现有tokenization设置初始状态
  useEffect(() => {
    if (isOpen) {
      setName(model.name || '');
      setDescription(model.description || '');
      setTopics(model.tags?.join(' #') ? '#' + model.tags.join(' #') : '');
      
      // 根据现有tokenization设置token association和输入值
      if (model.model_tokenization?.launchpad) {
        setSelectedTokenAssociation(model.model_tokenization.launchpad as TokenAssociation);
        setTokenInput(model.model_tokenization.meme_token || '');
      } else {
        setSelectedTokenAssociation('flaunch');
        setTokenInput('');
      }
    }
  }, [isOpen, model]);

  // 普通的topic输入处理
  const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTopics(e.target.value);
  };

  const handleTokenAssociationSelect = (association: TokenAssociation) => {
    if (isTokenAssociationEditable) {
      setSelectedTokenAssociation(association);
    }
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
        model_id: model.id,
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
      const response = await editModel(editParams);
      
      if (response.data) {
        showToast({
          message: 'Model updated successfully',
          severity: 'success'
        });
        
        // 调用外部的onSave回调（如果有）
        onSave?.({
          name: name.trim(),
          description: description.trim(),
          tags: tagsArray
        });
        
        onClose();
      } else {
        throw new Error('Failed to update model');
      }
    } catch (error) {
      console.error('Save model failed:', error);
      showToast({
        message: 'Failed to update model',
        severity: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getTokenAssociationValue = () => {
    // 如果存在tokenization，显示meme_token
    if (model.model_tokenization?.meme_token) {
      return model.model_tokenization.meme_token;
    }
    
    return tokenInput || '';
  };

  const getTokenAssociationPlaceholder = () => {
    return 'Input hash';
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
            {model.name} - Model
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
              placeholder="Enter model name"
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
              placeholder="Enter model description"
              maxLength={300}
              disabled={isSaving}
            />
          </div>

          {/* Topic输入框 - 改回普通input */}
          <div className={`${styles.fieldContainer} ${styles.topicFieldContainer}`}>
            <label className={styles.fieldLabel}>#Topic:</label>
            <input
              type="text"
              className={styles.textInput}
              value={topics}
              onChange={handleTopicChange}
              placeholder="Enter topics like #AI #ML #Model"
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
      </div>
    </div>
  );
};

export default EditModelModal; 