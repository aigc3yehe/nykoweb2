import React from 'react';
import CloseIcon from '../../assets/web2/close_dialog.svg';

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
  title = 'Tips',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[1001] flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl mx-5 md:w-[33.125rem] max-w-full shadow-xl flex flex-col" style={{ borderRadius: '0.625rem' }}>
        {/* Header */}
        <div className="flex items-center justify-between w-full border-b border-[#E5E7EB] pt-3 pb-3 px-5 gap-2" style={{ minHeight: '3rem' }}>
          <span className="font-lexend font-semibold text-base leading-[100%] text-[#1F2937] capitalize">{title}</span>
          <button onClick={onCancel} className="w-6 h-6 flex items-center justify-center">
            <img src={CloseIcon} alt="close" className="w-6 h-6" />
          </button>
        </div>
        {/* Content */}
        <div className="w-full px-5 pt-5 pb-5 flex flex-col gap-5">
          <div className="font-lexend font-normal text-sm leading-[140%] text-[#4B5563]">{message}</div>
        </div>
        {/* 按钮组 */}
        <div className="flex items-center justify-end gap-2 w-full px-5 pb-5">
          <button
            className="h-[2.375rem] rounded-md px-[1.125rem] bg-[#EEF2FF] font-lexend font-normal text-sm leading-[100%] text-[#4B5563] text-center"
            style={{ minWidth: '4.5rem' }}
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            className="h-[2.375rem] rounded-md px-[1.125rem] bg-[#0900FF] font-lexend font-normal text-sm leading-[100%] text-white text-center"
            style={{ minWidth: '4.5rem' }}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog; 