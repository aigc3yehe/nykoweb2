import { atom } from 'jotai';
import { Image, ImageDetail, fetchImageDetail } from './imageStore';

interface ModalState {
  isImageDetailsOpen: boolean;
  selectedImage: Image | null;
  imageDetail: ImageDetail | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ModalState = {
  isImageDetailsOpen: false,
  selectedImage: null,
  imageDetail: null,
  isLoading: false,
  error: null
};

export const modalAtom = atom<ModalState>(initialState);

export const openImageDetails = atom(
  null,
  async (_, set, image: Image) => {
    
    // 立即打开模态框，展示已有数据
    set(modalAtom, {
      isImageDetailsOpen: true,
      selectedImage: image,
      imageDetail: null,
      isLoading: true,
      error: null
    });
    
    // 在后台获取详细信息
    try {
      const imageDetail = await fetchImageDetail(image.id);
      
      // 确保状态始终更新，不管模态框状态如何
      set(modalAtom, prevState => ({
        ...prevState,
        imageDetail,
        isLoading: false
      }));
      
    } catch (error) {
      
      // 始终更新错误状态
      set(modalAtom, prevState => ({
        ...prevState,
        error: (error as Error).message,
        isLoading: false
      }));
    }
  }
);

export const closeImageDetails = atom(
  null,
  (_, set) => {
    set(modalAtom, initialState);
  }
); 