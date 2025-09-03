import React from 'react';
import CloseIcon from '../../assets/web2/close_dialog.svg';
import CloseIconDark from '../../assets/mavae/dark/close.svg';
import { useI18n } from '../../hooks/useI18n';
import ThemeAdaptiveIcon from './ThemeAdaptiveIcon';

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}) => {
  const { t } = useI18n();
  
  if (!open) return null;
  
  const displayTitle = title || t('common.tips');
  const displayConfirmText = confirmText || t('common.confirm');
  const displayCancelText = cancelText || t('common.cancel');
  
  return (
    <div className="fixed inset-0 z-[1001] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-pop-ups dark:bg-pop-ups-dark rounded-xl mx-5 md:w-[33.125rem] max-w-full shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between w-full border-b border-line-subtle dark:border-line-subtle-dark pt-3 pb-3 px-5 gap-2" style={{ minHeight: '3rem' }}>
          <span className="font-lexend font-semibold text-base leading-[100%] text-text-main dark:text-text-main-dark capitalize">
            {displayTitle}
          </span>
          <button 
            onClick={onCancel} 
            className="w-6 h-6 flex items-center justify-center hover:opacity-70 transition-opacity"
          >
            <ThemeAdaptiveIcon
              lightIcon={CloseIcon}
              darkIcon={CloseIconDark}
              alt="close"
              className="w-6 h-6"
            />
          </button>
        </div>
        {/* Content */}
        <div className="w-full px-5 pt-5 pb-5 flex flex-col gap-5">
          <div className="font-lexend font-normal text-sm leading-[140%] text-text-secondary dark:text-text-secondary-dark">
            {message}
          </div>
        </div>
        {/* 按钮组 */}
        <div className="flex items-center justify-end gap-2 w-full px-5 pb-5">
          <button
            className="h-[2.375rem] rounded-md px-[1.125rem] bg-quaternary dark:bg-quaternary-dark hover:bg-switch-hover dark:hover:bg-switch-hover-dark font-lexend font-normal text-sm leading-[100%] text-text-secondary dark:text-text-secondary-dark text-center transition-colors"
            style={{ minWidth: '4.5rem' }}
            onClick={onCancel}
          >
            {displayCancelText}
          </button>
          <button
            className="h-[2.375rem] rounded-md px-[1.125rem] bg-link-default dark:bg-link-default-dark hover:bg-link-pressed dark:hover:bg-link-pressed-dark font-lexend font-normal text-sm leading-[100%] text-white text-center transition-colors"
            style={{ minWidth: '4.5rem' }}
            onClick={onConfirm}
          >
            {displayConfirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;