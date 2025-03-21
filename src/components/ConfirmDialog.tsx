import React from 'react';
import { useAtom } from 'jotai';
import { dialogAtom, hideDialogAtom } from '../store/dialogStore';
import styles from './ConfirmDialog.module.css';

const ConfirmDialog: React.FC = () => {
  const [dialog] = useAtom(dialogAtom);
  const [, hideDialog] = useAtom(hideDialogAtom);
  
  if (!dialog.open) return null;
  
  const handleConfirm = () => {
    dialog.onConfirm();
    hideDialog();
  };
  
  const handleCancel = () => {
    dialog.onCancel();
    hideDialog();
  };
  
  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <div className={styles.message}>{dialog.message}</div>
        <div className={styles.buttonContainer}>
          <button 
            className={`${styles.button} ${styles.cancelButton}`}
            onClick={handleCancel}
            style={{ backgroundColor: dialog.cancelButtonColor || '#6366F1' }}
          >
            {dialog.cancelText || '取消'}
          </button>
          <button 
            className={`${styles.button} ${styles.confirmButton}`}
            onClick={handleConfirm}
            style={{ backgroundColor: dialog.confirmButtonColor || '#FF3C3D' }}
          >
            {dialog.confirmText || '确定'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog; 