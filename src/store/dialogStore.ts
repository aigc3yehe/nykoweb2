import { atom } from 'jotai';

export interface DialogState {
  open: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmButtonColor?: string;
  cancelButtonColor?: string;
}

const initialDialogState: DialogState = {
  open: false,
  message: '',
  onConfirm: () => {},
  onCancel: () => {},
};

export const dialogAtom = atom<DialogState>(initialDialogState);

export const hideDialogAtom = atom(
  null,
  (get, set) => {
    set(dialogAtom, { ...get(dialogAtom), open: false });
  }
);

export const showDialogAtom = atom(
  null,
  (get, set, update: DialogState) => {
    set(dialogAtom, update);
  }
); 