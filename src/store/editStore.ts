import { atom } from 'jotai';
import { ModelDetail } from './modelStore';
import { WorkflowDetail } from './workflowStore';

export interface EditModalState {
  open: boolean;
  type: 'model' | 'workflow' | null;
  data: ModelDetail | WorkflowDetail | null;
}

const initialState: EditModalState = {
  open: false,
  type: null,
  data: null
};

export const editModalAtom = atom<EditModalState>(initialState);

export const hideEditModalAtom = atom(
  null,
  (get, set) => {
    set(editModalAtom, { ...get(editModalAtom), open: false });
  }
);

export const showEditModelAtom = atom(
  null,
  (get, set, model: ModelDetail) => {
    set(editModalAtom, {
      open: true,
      type: 'model',
      data: model
    });
  }
);

export const showEditWorkflowAtom = atom(
  null,
  (get, set, workflow: WorkflowDetail) => {
    set(editModalAtom, {
      open: true,
      type: 'workflow',
      data: workflow
    });
  }
); 