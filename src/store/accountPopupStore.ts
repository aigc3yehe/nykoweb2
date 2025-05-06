import { atom } from 'jotai';

export interface AccountPopupState {
  open: boolean;
  userData: {
    name?: string;
    username?: string;
    profilePictureUrl?: string;
    walletAddress?: string;
    plan?: string;
  };
  anchorPosition: DOMRect | null;
  onExport: () => void;
  onLogout: () => void;
}

const initialPopupState: AccountPopupState = {
  open: false,
  userData: {},
  anchorPosition: null,
  onExport: () => {},
  onLogout: () => {},
};

export const accountPopupAtom = atom<AccountPopupState>(initialPopupState);

export const hideAccountPopupAtom = atom(
  null,
  (get, set) => {
    set(accountPopupAtom, { ...get(accountPopupAtom), open: false });
  }
);

export const showAccountPopupAtom = atom(
  null,
  (get, set, update: Partial<AccountPopupState>) => {
    set(accountPopupAtom, { ...get(accountPopupAtom), ...update, open: true });
  }
);