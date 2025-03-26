import { atom } from 'jotai';
import { imageUploadAtom, setImageUploadStateAtom, updateMessageUrlsAtom, showToastAtom, uploadImages } from './imagesStore';
import { ModelDetail } from './modelStore';

// 添加宽高比相关接口
export interface AspectRatio {
  label: string;
  value: string;
  width: number;
  height: number;
}

export const aspectRatios: AspectRatio[] = [
  { label: '1:1', value: '1:1', width: 1024, height: 1024 },
  { label: '3:4', value: '3:4', width: 768, height: 1024 },
  { label: '9:16', value: '9:16', width: 1080, height: 1920 },
  { label: '4:3', value: '4:3', width: 1024, height: 768 },
  { label: '16:9', value: '16:9', width: 1920, height: 1080 },
];

export interface Message {
  role: string;
  content: string;
  type?: 'text' | 'upload_image' | 'model_config';
  imageUploadState?: {
    totalCount: number;
    uploadedCount: number;
    isUploading: boolean;
  };
  uploadedFiles?: Array<{name: string, url: string}>;
  modelParam?: {
    modelName?: string;
    description?: string;
  }
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  userUuid: string;
  walletAddress?: string;
  urls: Array<{name: string, url: string}>;
  task_type?: string;
  modelParam?: {
    modelName?: string;
    description?: string;
  };
  currentModel?: ModelDetail | null;
  selectedAspectRatio?: AspectRatio; // 添加选中的宽高比
}

// 初始状态
const initialState: ChatState = {
  messages: [],
  isLoading: false,
  error: null,
  userUuid: '',
  walletAddress: '0x4272e3150A81B9735ccc58692f5dd3Cf73fB3B92', // 测试钱包地址
  urls: [],
  task_type: 'chat',
  modelParam: undefined,
  currentModel: null,
  selectedAspectRatio: aspectRatios[0] // 默认选择1:1
};

// 创建原子状态
export const chatAtom = atom<ChatState>(initialState);

// 与后端通信的API
export async function sendChatRequest(message: string, history: Message[], userUuid: string, creator?: string, urls?: string[],
  model_id?: number, width?: number, height?: number, lora_name?: string, lora_weight?: number
) {
  const API_URL = '/api/chat';
  
  try {
    const conversation_history = history.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        conversation_history: conversation_history,
        user_uuid: userUuid,
        creator: creator,
        urls: urls || [],
        model_id: model_id,
        width: width,
        height: height,
        lora_name: lora_name,
        lora_weight: lora_weight
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

// ==== 新增的操作函数 ====

// 发送消息的操作
export const sendMessage = atom(
  null,
  async (get, set, message: string) => {
    if (!message.trim()) return;
    
    const chatState = get(chatAtom);
    
    // 添加用户消息到聊天记录
    const userMessage: Message = { 
      role: 'user', 
      content: message
    };
    
    // 更新状态为加载中
    set(chatAtom, {
      ...chatState,
      messages: [...chatState.messages, userMessage],
      isLoading: true,
      error: null
    });
    
    try {
      // 获取当前选择的宽高比
      const { width, height } = chatState.selectedAspectRatio || { width: 1024, height: 1024 };
      
      // 获取当前模型的lora_name
      const lora_name = chatState.currentModel?.model_tran?.[0]?.lora_name || undefined;

      // 获取当前模型的model_id
      const model_id = chatState.currentModel?.id;
      
      // 发送请求到API
      const response = await sendChatRequest(
        userMessage.content,
        chatState.messages,
        chatState.userUuid,
        chatState.walletAddress,
        chatState.urls.map(url => url.url),
        model_id,
        width,
        height,
        lora_name,
        0.85 // 默认lora权重
      );

      const status = response.status;
      const content = response.content;
      const task_type = response.task_type;
      const model = response.model; // 获取model字段
      const request_id = response.request_id; // 获取生成图片任务的request_id
      
      // 处理API响应
      if (status === 'error') {
        throw new Error(content || '发送消息时出错');
      }

      // 如果status为Completed, 则代表创建训练模型任务完成
      if (status === 'Completed') {
        console.log('训练模型任务完成');
      }

      // 根据status的类型，更新消息的类型
      let messageType = 'text';
      if (status === 'upload_image') {
        messageType = 'upload_image';
      }

      const receivedMessage: Message = {
        role: 'assistant',
        content: content,
        type: messageType as 'text' | 'upload_image',
        imageUploadState: messageType === 'upload_image' 
          ? { totalCount: 0, uploadedCount: 0, isUploading: false } 
          : undefined
      };

      // 更新消息历史
      const updatedMessages = [...chatState.messages, userMessage, receivedMessage];
      
      // 如果返回了model信息，更新model_config消息和chatAtom的modelParam
      let finalMessages = updatedMessages;
      let updatedModelParam = chatState.modelParam;
      
      if (model && model.name && model.description) {
        const modelParam = {
          modelName: model.name,
          description: model.description
        };
        
        // 更新modelParam
        updatedModelParam = modelParam;
        
        // 查找并更新model_config消息
        finalMessages = updatedMessages.map(msg => {
          if (msg.type === 'model_config') {
            return {
              ...msg,
              modelParam
            };
          }
          return msg;
        });
      }
      
      set(chatAtom, {
        ...chatState,
        messages: finalMessages,
        isLoading: false,
        task_type: task_type,
        modelParam: updatedModelParam
      });
    } catch (error) {
      console.error('发送消息时出错:', error);
      
      // 更新错误状态
      set(chatAtom, {
        ...chatState,
        messages: [...chatState.messages, { 
          role: 'system', 
          content: error instanceof Error ? error.message : '发送消息时出错，请重试。'
        }],
        isLoading: false,
        error: error instanceof Error ? error.message : '发送消息时出错',
      });
    }
  }
);

// 添加检查图片数量并添加model_config消息的功能
export function checkAndAddModelConfigMessage(messages: Message[]): Message[] {
  // 找到upload_image类型的消息
  const uploadImageMsgIndex = messages.findIndex(msg => msg.type === 'upload_image');
  if (uploadImageMsgIndex === -1) return messages;
  
  const uploadImageMsg = messages[uploadImageMsgIndex];
  const hasEnoughImages = uploadImageMsg.uploadedFiles && uploadImageMsg.uploadedFiles.length >= 10;
  
  // 检查是否已有model_config消息
  const hasModelConfigMsg = messages.some((msg, index) => 
    msg.type === 'model_config' && index === uploadImageMsgIndex + 1
  );
  
  if (hasEnoughImages && !hasModelConfigMsg) {
    // 需要添加model_config消息
    const modelConfigMsg: Message = {
      role: 'assistant',
      content: 'Okay, give your model a name and description.',
      type: 'model_config',
      modelParam: {
        modelName: messages[0]?.modelParam?.modelName || undefined,
        description: messages[0]?.modelParam?.description || undefined
      }
    };
    
    // 插入model_config消息到upload_image消息后面
    return [
      ...messages.slice(0, uploadImageMsgIndex + 1),
      modelConfigMsg,
      ...messages.slice(uploadImageMsgIndex + 1)
    ];
  } else if (!hasEnoughImages && hasModelConfigMsg) {
    // 需要移除model_config消息
    return messages.filter((msg, index) => 
      !(msg.type === 'model_config' && index === uploadImageMsgIndex + 1)
    );
  }
  
  return messages;
}

// 修改addImage函数来处理model_config消息
export const addImage = atom(
  null,
  async (get, set, messageIndex: number) => {
    // 创建一个文件选择对话框
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    
    input.onchange = async (event) => {
      const target = event.target as HTMLInputElement;
      const files = target.files;
      
      if (!files || files.length === 0) return;
      
      const chatState = get(chatAtom);
      const showToastAction = get(showToastAtom);
      
      // 根据现有的uploadedFiles获取当前消息
      const currentMessage = chatState.messages[messageIndex];
      const existingFiles = currentMessage.uploadedFiles || [];
      
      try {
        // 设置上传状态
        set(chatAtom, {
          ...chatState,
          messages: updateImageUploadState(chatState.messages, messageIndex, {
            totalCount: files.length,
            uploadedCount: 0,
            isUploading: true
          })
        });
        
        // 准备要上传的文件信息
        const filesWithNames = Array.from(files).map(file => ({
          file,
          name: file.name
        }));
        
        // 使用uploadImages函数上传图片
        const uploadedUrls = await uploadImages(
          messageIndex,
          Array.from(files),
          // 设置上传状态的回调
          (state) => set(setImageUploadStateAtom, state),
          // 更新消息URL的回调
          ({ messageId, url, progress }) => {
            const updatedChatState = get(chatAtom);
            
            // 更新上传进度
            set(chatAtom, {
              ...updatedChatState,
              messages: updateImageUploadState(updatedChatState.messages, messageId, {
                uploadedCount: Math.floor(files.length * (progress / 100)),
                isUploading: progress < 100
              })
            });
            
            // 更新URL到状态
            set(updateMessageUrlsAtom, { messageId, url, progress });
          },
          // 显示通知的回调
          (params) => set(showToastAtom, params)
        );
        
        // 上传完成后，更新uploadedFiles
        if (uploadedUrls && uploadedUrls.length > 0) {
          // 将新上传的文件与之前的合并
          const newUploadedFiles = [
            ...existingFiles,
            ...uploadedUrls.map((url, index) => ({
              name: filesWithNames[index]?.name || `image_${index}.jpg`,
              url
            }))
          ];
          
          const finalChatState = get(chatAtom);

          const updatedMessages = updateUploadedFiles(finalChatState.messages, messageIndex, newUploadedFiles);
          // 检查图片数量并处理model_config消息
          const finalMessages = checkAndAddModelConfigMessage(updatedMessages);
          
          set(chatAtom, {
            ...finalChatState,
            messages: finalMessages,
            urls: newUploadedFiles
          });
        }
        
        // 上传完成，更新上传状态
        const lastChatState = get(chatAtom);
        set(chatAtom, {
          ...lastChatState,
          messages: updateImageUploadState(lastChatState.messages, messageIndex, {
            isUploading: false
          })
        });
      } catch (error) {
        console.error('Error uploading images:', error);
        
        const errorChatState = get(chatAtom);
        
        // 更新错误状态
        set(chatAtom, {
          ...errorChatState,
          messages: updateImageUploadState(errorChatState.messages, messageIndex, {
            isUploading: false
          })
        });
        
        // 显示错误通知
        set(showToastAtom, { 
          message: '图片上传失败',
          severity: 'error'
        });
      }
    };
    
    input.click();
  }
);


// 修改removeImage函数来处理model_config消息
export const removeImage = atom(
  null,
  (get, set, params: { messageIndex: number, fileUrl: string }) => {
    const { messageIndex, fileUrl } = params;
    const chatState = get(chatAtom);
    const imageUploadState = get(imageUploadAtom);
    
    // 更新消息中的uploadedFiles
    const updatedMessages = removeUploadedFile(chatState.messages, messageIndex, fileUrl);
    
    // 检查图片数量并处理model_config消息
    const finalMessages = checkAndAddModelConfigMessage(updatedMessages);
    
    set(chatAtom, {
      ...chatState,
      messages: finalMessages,
      urls: chatState.urls.filter(url => url.url !== fileUrl)
    });
    
    // 从imageUploadState中也移除URL
    set(setImageUploadStateAtom, {
      uploadedUrls: imageUploadState.uploadedUrls.filter(url => url !== fileUrl)
    });
  }
);

// 清空聊天操作
export const clearChat = atom(
  null,
  (get, set) => {
    const chatState = get(chatAtom);
    set(chatAtom, {
      ...chatState,
      messages: [],
      urls: [],
      task_type: 'chat',
      modelParam: undefined,
    });
  }
);

// 更新用户信息
export const setUserInfo = atom(
  null,
  (get, set, params: { uuid: string, walletAddress?: string }) => {
    const { uuid, walletAddress } = params;
    const chatState = get(chatAtom);
    set(chatAtom, {
      ...chatState,
      userUuid: uuid,
      walletAddress: walletAddress
    });
  }
);

// 设置当前正在查看的模型详情
export const setCurrentModel = atom(
  null,
  (get, set, model: ModelDetail | null) => {
    const chatState = get(chatAtom);
    
    set(chatAtom, {
      ...chatState,
      currentModel: model
    });
  }
);

// 清除当前模型详情（退出模型详情页时调用）
export const clearCurrentModel = atom(
  null,
  (get, set) => {
    const chatState = get(chatAtom);
    
    set(chatAtom, {
      ...chatState,
      currentModel: null
    });
  }
);

// 添加设置宽高比的操作
export const setAspectRatio = atom(
  null,
  (get, set, aspectRatio: AspectRatio) => {
    const chatState = get(chatAtom);
    
    set(chatAtom, {
      ...chatState,
      selectedAspectRatio: aspectRatio
    });
  }
);