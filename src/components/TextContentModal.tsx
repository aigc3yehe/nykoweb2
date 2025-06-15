import React, { useEffect } from 'react';
import styles from './TextContentModal.module.css';

interface TextContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  content: string;
}

const TextContentModal: React.FC<TextContentModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  content
}) => {
  // 处理ESC键关闭
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // 防止背景滚动
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // 处理背景点击关闭
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={handleBackdropClick}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <div className={styles.headerText}>
            <h2 className={styles.modalTitle}>{title}</h2>
            <p className={styles.modalSubtitle}>{subtitle}</p>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className={styles.modalBody}>
          <div className={styles.contentText}>
            {content.split('\n').map((line, index) => (
              <p key={index} className={styles.contentParagraph}>
                {line}
              </p>
            ))}
          </div>
        </div>
        
        <div className={styles.modalFooter}>
          <button className={styles.closeActionButton} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextContentModal; 