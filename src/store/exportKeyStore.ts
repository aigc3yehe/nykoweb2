import { atom } from 'jotai';

export interface ExportKeyState {
  open: boolean;
}

const initialState: ExportKeyState = {
  open: false
};

export const exportKeyAtom = atom<ExportKeyState>(initialState);

export const hideExportKeyAtom = atom(
  null,
  (get, set) => {
    set(exportKeyAtom, { ...get(exportKeyAtom), open: false });
  }
);

export const showExportKeyAtom = atom(
  null,
  (get, set) => {
    set(exportKeyAtom, { ...get(exportKeyAtom), open: true });
  }
); 