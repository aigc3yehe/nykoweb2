import React, { useState, useRef, useEffect } from 'react';
import styles from './EditModelModal.module.css';
import { ModelDetail, fetchEditModel } from '../store/modelStore';
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
  const [tokenInput, setTokenInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // 存储初始值用于比较
  const [initialValues, setInitialValues] = useState({
    name: '',
    description: '',
    topics: '',
    tokenInput: '',
    selectedTokenAssociation: 'flaunch' as TokenAssociation
  });

  const tokenInputRef = useRef<HTMLInputElement>(null);
  const editModel = useSetAtom(fetchEditModel);
  const showToast = useSetAtom(showToastAtom);

  // 判断Token Association是否可编辑
  const isTokenAssociationEditable = !model.model_tokenization?.meme_token;

  // 根据现有tokenization设置初始状态
  useEffect(() => {
    if (isOpen) {
      const initialName = model.name || '';
      const initialDescription = model.description || '';
      const initialTopics = model.tags?.join(' #') ? '#' + model.tags.join(' #') : '';
      const initialTokenInput = model.model_tokenization?.meme_token || '';
      const initialTokenAssociation = (model.model_tokenization?.launchpad as TokenAssociation) || 'flaunch';

      setName(initialName);
      setDescription(initialDescription);
      setTopics(initialTopics);
      setTokenInput(initialTokenInput);
      setSelectedTokenAssociation(initialTokenAssociation);

      // 存储初始值
      setInitialValues({
        name: initialName,
        description: initialDescription,
        topics: initialTopics,
        tokenInput: initialTokenInput,
        selectedTokenAssociation: initialTokenAssociation
      });
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

  // 检查是否有修改
  const hasChanges = () => {
    const currentTopics = topics;
    const currentName = name.trim();
    const currentDescription = description.trim();
    const currentTokenInput = tokenInput.trim();

    // 比较基本字段
    if (currentName !== initialValues.name.trim()) return true;
    if (currentDescription !== initialValues.description.trim()) return true;
    if (currentTopics !== initialValues.topics) return true;

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
        model_id: model.id
      };

      // 只添加修改过的字段
      const currentName = name.trim();
      const currentDescription = description.trim();

      if (currentName !== initialValues.name.trim()) {
        editParams.name = currentName;
      }

      if (currentDescription !== initialValues.description.trim()) {
        editParams.description = currentDescription;
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
      const response = await editModel(editParams);

      if (response.data) {
        showToast({
          message: 'Model updated successfully',
          severity: 'success'
        });

        // 调用外部的onSave回调（如果有）
        onSave?.({
          name: currentName,
          description: currentDescription,
          tags: editParams.tags
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
    return 'Token contract (only on basechain)';
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

          {/* Token Association */}
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
      </div>
    </div>
  );
};

export default EditModelModal;