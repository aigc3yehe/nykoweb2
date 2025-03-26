import React, { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import styles from './ExportKeyModal.module.css';
import CloseIcon from '../assets/close_account.svg';

interface ExportKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancel: () => void;
}

const ExportKeyModal: React.FC<ExportKeyModalProps> = ({
  isOpen,
  onClose,
  onCancel
}) => {
  const { ready, authenticated, user, exportWallet } = usePrivy();
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  
  // 检查用户是否已认证
  const isAuthenticated = ready && authenticated;
  
  // 检查用户是否有内嵌钱包
  const hasEmbeddedWallet = user?.linkedAccounts?.find(
    (account) =>
      account.type === 'wallet' &&
      account.walletClientType === 'privy' &&
      account.chainType === 'ethereum'
  );
  
  // 处理导出钱包
  const handleExportWallet = async () => {
    if (!isAuthenticated || !hasEmbeddedWallet) {
      setExportError("无法导出: 没有可用的内嵌钱包");
      return;
    }
    
    try {
      setIsExporting(true);
      setExportError(null);
      
      // 调用 Privy 的 exportWallet 函数
      await exportWallet();
      
      // 导出成功后关闭弹窗
      onClose();
    } catch (error) {
      console.error("导出钱包失败:", error);
      setExportError("导出钱包时发生错误");
    } finally {
      setIsExporting(false);
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onCancel}>
      <div 
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题栏 */}
        <div className={styles.modalHeader}>
          <span className={styles.warningTitle}>Warning</span>
          <button 
            className={styles.closeButton}
            onClick={onClose}
          >
            <img src={CloseIcon} alt="关闭" width="24" height="24" />
          </button>
        </div>
        
        {/* 内容区域 */}
        <div className={styles.modalBody}>
          <p className={styles.warningText}>
            The private key is currently kept safe by privy. Exporting the private key will increase the possibility of private key leakage. Are you sure you want to export it?
          </p>
          
          {/* 错误信息 */}
          {exportError && (
            <p className={styles.errorText}>{exportError}</p>
          )}
          
          {/* 按钮组 */}
          <div className={styles.buttonGroup}>
            <button 
              className={styles.cancelButton}
              onClick={onCancel}
              disabled={isExporting}
            >
              Cancel
            </button>
            <button 
              className={styles.exportButton}
              onClick={handleExportWallet}
              disabled={isExporting || !isAuthenticated || !hasEmbeddedWallet}
            >
              {isExporting ? 'Exporting...' : 'Export'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportKeyModal; 