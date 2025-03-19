import React, { useEffect } from 'react';
import { useAtom } from 'jotai';
import { toastAtom } from '../store/imagesStore';
import styles from './Toast.module.css';

const Toast: React.FC = () => {
  const [toast, setToast] = useAtom(toastAtom);
  
  // 自动关闭通知
  useEffect(() => {
    if (toast.open) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, open: false }));
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [toast.open, setToast]);
  
  if (!toast.open) return null;
  
  const severityClass = {
    success: styles.success,
    error: styles.error,
    warning: styles.warning,
    info: styles.info
  }[toast.severity];
  
  return (
    <div className={`${styles.toast} ${severityClass}`}>
      <div className={styles.message}>{toast.message}</div>
      <button 
        className={styles.closeButton}
        onClick={() => setToast(prev => ({ ...prev, open: false }))}
      >
        ×
      </button>
    </div>
  );
};

export default Toast; 