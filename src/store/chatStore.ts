import { atom } from 'jotai';

export interface Message {
  role: string;
  content: string;
  type?: 'text' | 'upload_image';
  imageUploadState?: {
    totalCount: number;
    uploadedCount: number;
    isUploading: boolean;
  };
  uploadedFiles?: Array<{name: string, url: string}>;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  userUuid: string;
  walletAddress?: string;
}

// 初始状态
const initialState: ChatState = {
  messages: [],
  isLoading: false,
  error: null,
  userUuid: '',
  walletAddress: ''
};

// 创建原子状态
export const chatAtom = atom<ChatState>(initialState);

// 与后端通信的API
export async function sendChatRequest(message: string, history: Message[], userUuid: string, walletAddress?: string, urls?: string[]) {
  const API_URL = '/api/chat';
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        conversation_history: history,
        user_uuid: userUuid,
        wallet_address: walletAddress,
        urls: urls || []
      }),
    });

    if (!response.ok) {
      throw new Error(`API请求失败，状态码 ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('发送消息时出错:', error);
    throw error;
  }
}

// 添加图片上传状态更新操作
export function updateImageUploadState(messages: Message[], messageIndex: number, newState: Partial<Message['imageUploadState']>) {
  return messages.map((msg, index) => {
    if (index === messageIndex && msg.type === 'upload_image' && msg.imageUploadState) {
      return {
        ...msg,
        imageUploadState: {
          ...msg.imageUploadState,
          ...newState
        }
      };
    }
    return msg;
  });
}

// 添加上传文件管理
export function updateUploadedFiles(messages: Message[], messageIndex: number, files: Array<{name: string, url: string}>) {
  return messages.map((msg, index) => {
    if (index === messageIndex && msg.type === 'upload_image') {
      return {
        ...msg,
        uploadedFiles: files
      };
    }
    return msg;
  });
}

// 移除上传文件
export function removeUploadedFile(messages: Message[], messageIndex: number, fileUrl: string) {
  return messages.map((msg, index) => {
    if (index === messageIndex && msg.type === 'upload_image' && msg.uploadedFiles) {
      return {
        ...msg,
        uploadedFiles: msg.uploadedFiles.filter(file => file.url !== fileUrl)
      };
    }
    return msg;
  });
}