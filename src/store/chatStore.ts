/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { atom } from 'jotai';
import { imageUploadAtom, setImageUploadStateAtom, updateMessageUrlsAtom, showToastAtom, uploadImages } from './imagesStore';
import { ModelDetail } from './modelStore';
import { fetchImages } from './imageStore';
import { fetchModelDetail } from './modelStore.ts'
import {fetchTokenizationState} from "./tokenStore.ts";
import {fetchWorkflowDetail, WorkflowDetail} from "./workflowStore.ts";

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
  { label: '5:6', value: '5:6', width: 856, height: 1024 },
  //{ label: '9:16', value: '9:16', width: 1080, height: 1920 }, // 暂时不这两个尺寸
  { label: '4:3', value: '4:3', width: 1024, height: 768 },
  { label: '6:5', value: '6:5', width: 1024, height: 856 },
  //{ label: '16:9', value: '16:9', width: 1920, height: 1080 },
];

// 任务状态类型
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

// 任务信息类型
export interface TaskInfo {
  taskId: string;
  status: TaskStatus;
  checkCount: number;
  lastCheck: number;
  generatedImages?: string[];
}

export interface Message {
  role: string;
  content: string;
  type?: 'text' | 'upload_image' | 'model_config' | 'generate_result' | 'generating_image' | 'tokenization_agreement' | "create_workflow"
      | "run_workflow";
  imageUploadState?: {
    totalCount: number;
    uploadedCount: number;
    isUploading: boolean;
    finishUpload: boolean;
  };
  uploadedFiles?: Array<{name: string, url: string}>;
  modelParam?: {
    modelName?: string;
    description?: string;
  }
  request_id?: string;
  images?: string[];
  imageInfo?: {
    width: number;
    height: number;
  }
  agree?: boolean;
}

// 1. 添加连接状态接口
export interface ConnectionStatus {
  isActive: boolean;
  inQueue: boolean;
  position?: number;
  status?: string;
  message?: string;
  queueLength?: number;
  estimateWaitTime?: number;
}

// 2. 扩展ChatState包含连接状态
export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;
  userUuid: string;
  did?: string;
  wallet_address?: string;
  urls: Array<{name: string, url: string}>;
  task_type?: string;
  task_value?: string;
  current_status?: string; // 当前对话任务状态
  modelParam?: {
    modelName?: string;
    description?: string;
  };
  currentModel?: ModelDetail | null;
  modelStatus: string | null;
  agree: boolean;
  selectedAspectRatio?: AspectRatio;
  activeTasks: Record<string, TaskInfo>;
  connection: ConnectionStatus; // 添加连接状态
  heartbeatId?: number; // 存储心跳计时器ID
  loraWeight?: number;
  betaMode: boolean; // 添加Beta模式开关
  currentWorkflow: WorkflowDetail | null;
  workflowStatus: string | null;
  workflow_name: string;
  workflow_prompt: string;
  workflow_input: string;
  workflow_output: string;
  workflow_model: string;
  workflowCreation: WorkflowCreationState;
  workflowImageValue: string; // 临时URL或S3 URL
  workflowImageFile: File | null; // 保存File对象用于上传
  workflowRunning: {
    isRunning: boolean;
    isSuccess: boolean;
    workflowId?: number;
    error?: string;
  };
}

// 3. 更新初始状态
const initialState: ChatState = {
  messages: [],
  isLoading: false,
  isGenerating: false,
  error: null,
  userUuid: '',
  did: '0x4272e3150A81B9735ccc58692f5dd3Cf73fB3B92', // 测试privy did
  wallet_address: undefined,
  urls: [],
  task_type: 'chat',
  current_status: 'init',
  task_value: 'chat',
  modelParam: undefined,
  currentModel: null,
  modelStatus: null,
  agree: false,
  selectedAspectRatio: aspectRatios[0], // 默认选择1:1
  activeTasks: {},
  connection: {
    isActive: false,
    inQueue: false
  },
  heartbeatId: undefined,
  loraWeight: 0.5,
  betaMode: false, // 初始化为false
  currentWorkflow: null,
  workflowStatus: null,
  workflow_name: "",
  workflow_prompt: "",
  workflow_input: "image",
  workflow_output: "image",
  workflow_model: "gpt-4o",
  workflowCreation: {
    isCreating: false,
    isSuccess: false
  },
  workflowImageValue: "",
  workflowImageFile: null,
  workflowRunning: {
    isRunning: false,
    isSuccess: false
  }
};

// 创建原子状态
export const chatAtom = atom<ChatState>(initialState);

// 图片生成状态检查接口响应类型
export type CheckStatsResponse = {
  data?: {
    id?: string;
    status?: string;  // completed 时为完成
    date_created?: string;
    upscaled_urls?: string[];
  };
};

// 查询图片生成状态的API
export async function checkImageGenerationStatus(request_id: string, isWorkflow: boolean): Promise<CheckStatsResponse> {
  try {
    const status_url = isWorkflow ? `/studio-api/workflow/aigc/state?task_id=${request_id}` : `/studio-api/model/aigc/state?task_id=${request_id}&refreshState=true`
    const response = await fetch(status_url, {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_BEARER_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error(`Status check failed with status code ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Check Image Generation Failed:', error);
    throw error;
  }
}

/**
 * 过滤掉消息数组中的系统消息
 * @param messages 消息数组
 * @returns 过滤后的消息数组（不包含系统消息）
 */
export function filterSystemMessages(messages: Message[]): Message[] {
  return messages.filter(message => message.role !== 'system');
}

/**
 * 判断消息数组中是否包含系统消息
 * @param messages 消息数组
 * @returns 是否包含系统消息
 */
export function hasSystemMessage(messages: Message[]): boolean {
  return messages.some(message => message.role === 'system');
}

// 简化的轮询函数 - 使用 for 循环
export async function pollImageGenerationTask(taskId: string, set: any, get: any, isWorkflow: boolean=false): Promise<void> {
  console.log('Start poll image generation task:', taskId);

  // 最大轮询次数和间隔时间
  const MAX_POLL_COUNT = 60; // 最多轮询60次
  const POLL_INTERVAL = 5000; // 每次间隔5秒

  for (let pollCount = 0; pollCount < MAX_POLL_COUNT; pollCount++) {
    try {
      console.log(`task ${taskId} the ${pollCount + 1} times`);

      // 等待一段时间再查询
      if (pollCount > 0) {
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
      }

      // 查询任务状态
      const statusResponse = await checkImageGenerationStatus(taskId, isWorkflow);
      console.log('task status:', statusResponse);

      // 获取当前状态
      const chatState = get(chatAtom);

      // 如果没有状态信息，继续轮询
      if (!statusResponse?.data?.status) {
        console.log('status is null，keep task');
        continue;
      }

      const status = statusResponse.data.status.toLowerCase();
      console.log('task status:', status);

      // 处理不同状态
      if (status === 'completed') {
        console.log('task completed:', status);

        // 获取生成的图片
        const generatedImages = statusResponse.data.upscaled_urls || [];
        console.log('get image url:', generatedImages);

        if (generatedImages.length > 0) {
          // 查找对应的 generating_image 消息

          const messageIndex = chatState.messages.findIndex(
            // @ts-ignore
            msg => msg.type === 'generating_image' && msg.request_id === taskId
          );
          if (messageIndex !== -1) {
            console.log('find message，update message');
            const aspectRatio = chatState.selectedAspectRatio
            let width = 512;
            let height = 512;
            if (aspectRatio) {
              width = aspectRatio.width;
              height = aspectRatio.height;
            }
            // 更新现有消息而不是创建新消息
            const updatedMessages = [...chatState.messages];
            updatedMessages[messageIndex] = {
              ...updatedMessages[messageIndex],
              content: 'Image generation completed',
              type: 'generate_result',
              images: generatedImages,
              imageInfo: {
                width: width,
                height: height
              }
            };

            // 更新消息列表
            set(chatAtom, {
              ...chatState,
              messages: updatedMessages,
              isGenerating: false
            });
          } else {
            console.log('not found message，create new message');
            // 如果找不到对应消息，创建新消息（兜底方案）
            const aspectRatio = chatState.selectedAspectRatio
            let width = 512;
            let height = 512;
            if (aspectRatio) {
              width = aspectRatio.width;
              height = aspectRatio.height;
            }
            const resultMessage: Message = {
              role: 'assistant',
              content: 'Image generation completed',
              type: 'generate_result',
              images: generatedImages,
              request_id: taskId,
              imageInfo: {
                width: width,
                height: height
              }
            };

            // 添加消息到列表
            // 任务完成，退出轮询
            if (isWorkflow) {
              set(chatAtom, {
                ...get(chatAtom),
                messages: [...filterSystemMessages(chatState.messages), resultMessage],
                workflowRunning: {
                  isRunning: false,
                  isSuccess: true
                },
                isGenerating: false,
                workflowImageFile: null // 清除文件对象
              });
            } else {
              set(chatAtom, {
                ...chatState,
                messages: [...filterSystemMessages(chatState.messages), resultMessage],
                isGenerating: false
              });
            }
          }

          // 显示成功通知
          set(showToastAtom, {
            message: 'Image generation completed',
            severity: 'success'
          });

          // 如果有当前模型，重新加载与模型相关的图片
          if (chatState.currentModel?.id) {
            console.log('reset model images，model id:', chatState.currentModel.id);
            // 使用 fetchImages 重新加载图片
            set(fetchImages, { reset: true, model_id: chatState.currentModel.id });
          }
          if (isWorkflow && chatState.currentWorkflow?.id) {
            console.log('reset model images，workflow id:', chatState.currentWorkflow.id);
            // 使用 fetchImages 重新加载图片
            set(fetchImages, { reset: true, workflow_id: chatState.currentWorkflow.id });
          }
        }
        console.log('task finished，exit');
        return;
      } else if (status === 'failed' || status === 'error') {
        console.log('task failed');

        // 查找对应的 generating_image 消息
        const messageIndex = chatState.messages.findIndex(
          // @ts-ignore
          msg => msg.type === 'generating_image' && msg.request_id === taskId
        );

        if (messageIndex !== -1) {
          console.log('find message，update failed message');
          // 更新现有消息为失败消息
          const updatedMessages = [...chatState.messages];
          updatedMessages[messageIndex] = {
            ...updatedMessages[messageIndex],
            content: 'Image generation failed',
            type: 'text', // 改为普通文本消息
            images: undefined // 清除图片字段
          };

          // 更新消息列表
          set(chatAtom, {
            ...chatState,
            messages: updatedMessages,
            workflowRunning: {
              isRunning: false,
              isSuccess: true
            },
            isGenerating: false,
            workflowImageFile: null // 清除文件对象
          });
        } else {
          console.log('not found message，create new failed message');
          // 如果找不到对应消息，添加失败消息
          set(chatAtom, {
            ...chatState,
            messages: [...filterSystemMessages(chatState.messages), {
              role: 'system',
              content: 'image generation failed',
              request_id: taskId
            }],
            workflowRunning: {
              isRunning: false,
              isSuccess: true
            },
            isGenerating: false,
            workflowImageFile: null // 清除文件对象
          });
        }

        // 显示失败通知
        set(showToastAtom, {
          message: 'image generation failed',
          severity: 'error'
        });

        // 任务失败，退出轮询
        console.log('task failed, exit');
        return;
      }

      // 如果是其他状态（处理中、等待中），继续轮询
      console.log('task doing，keep doing');

    } catch (error) {
      console.error('task failed:', error);

      // 发生错误时，增加轮询间隔时间，但继续轮询
      const waitTime = Math.min(30000, POLL_INTERVAL * Math.min(5, Math.floor(pollCount / 5) + 1));
      console.log(`failed，waiting ${waitTime}ms keep task`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  // 达到最大轮询次数，添加超时消息
  console.log('more than times，task maybe failed');
  const finalChatState = get(chatAtom);
  set(chatAtom, {
    ...finalChatState,
    messages: [...filterSystemMessages(finalChatState.messages), {
      role: 'system',
      content: 'Image generation timed out, please check again later or try again',
      request_id: taskId
    }],
    isGenerating: false
  });

  // 显示超时通知
  set(showToastAtom, {
    message: 'Image generation timed out',
    severity: 'warning'
  });
}

// ==== 辅助函数 ====

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

// 更新上传状态
export function updateUploadedState(messages: Message[], messageIndex: number, state: boolean) {
  return messages.map((msg, index) => {
    if (index === messageIndex && msg.type === 'upload_image' && msg.imageUploadState) {
      const newState = {
        ...msg.imageUploadState,
        finishUpload: state
      }
      return {
        ...msg,
        imageUploadState: newState,
      };
    }
    return msg;
  });
}

// 更新同意状态
export function updateAgreeState(messages: Message[], messageIndex: number) {
  return messages.map((msg, index) => {
    if (index === messageIndex && msg.type === 'tokenization_agreement') {
      return {
        ...msg,
        agree: true,
      };
    }
    return msg;
  });
}

// ==== 操作函数 ====

// 发送消息的操作
export const sendMessage = atom(
  null,
  async (get, set, message: string) => {
    if (!message.trim()) return;

    const chatState = get(chatAtom);
    const betaMode = chatState.betaMode;
    const apiPrefix = betaMode ? '/beta-api' : '/api';

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
      isGenerating: false,
      error: null
    });

    try {
      // 获取当前选择的宽高比
      const { width, height } = chatState.selectedAspectRatio || { width: 1024, height: 1024 };

      // 获取当前模型的lora_name
      const lora_name = chatState.currentModel?.model_tran?.[0]?.lora_name || undefined;

      // 获取当前模型的model_id
      const model_id = chatState.currentModel?.id;

      // 获取当前模型的作者
      const model_creator = chatState.currentModel?.creator;

      const model_status = chatState.modelStatus

      const model_name = chatState.currentModel?.name;

      const model_cover = chatState.currentModel?.cover;

      const model_description = chatState.currentModel?.description;

      const agree = chatState.agree

      const wallet_address = chatState.wallet_address

      const current_task_type = chatState.task_type

      const current_task_status = chatState.current_status

      const workflow_id = chatState.currentWorkflow?.id
      const current_workflow_name = chatState.currentWorkflow?.name
      const workflow_cover = chatState.currentWorkflow?.cover;
      const workflow_description = chatState.currentWorkflow?.description;
      const workflow_creator = chatState.currentWorkflow?.creator;

      // 构建完整的API URL
      const API_URL = `${apiPrefix}/chat`;

      const lora_weight = 0.75 + (chatState.loraWeight || 0) * 0.25

      // 发送请求到API
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversation_history: chatState.messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          user_uuid: chatState.userUuid,
          creator: chatState.did,
          urls: chatState.urls.map(url => url.url),
          model_id,
          width,
          height,
          lora_name,
          lora_weight: lora_weight,
          model_creator,
          model_name,
          model_cover,
          model_description,
          wallet_address,
          model_status,
          agree,
          task_type: current_task_type,
          current_task_status,
          workflow_id,
          workflow_name: current_workflow_name,
          workflow_cover,
          workflow_description,
          workflow_creator
        }),
      });

      if (!response.ok) {
        throw new Error(`Internal service error`);
      }

      const responseData = await response.json();

      // 获取最新状态（可能在API请求期间已被心跳更新）
      const latestState = get(chatAtom);

      const status = responseData.status;
      const content = responseData.content;
      const task_type = responseData.task_type;
      const model = responseData.model;
      const request_id = responseData.request_id;

      const workflow_name = responseData.workflow_name;
      const workflow_goal = responseData.workflow_goal;
      const generated_prompt = responseData.generated_prompt;

      let task_value = task_type;
      if (task_type === 'finetuing') {
          task_value = "fine tuning";
      }

      const api_exception = responseData.api_exception;
      if (api_exception) {
        console.log("AI Call API exception", api_exception);
      }

      // 处理特殊状态：full 和 queue
      if (status === 'full' || status === 'queue') {
        // 更新连接状态
        const newConnectionStatus: ConnectionStatus = {
          isActive: false,
          inQueue: status === 'queue',
          position: status === 'queue' ? 99 : undefined,
          message: content // 使用返回的提示消息
        };

        // 停止心跳
        if (latestState.heartbeatId && status === 'full') {
          set(stopHeartbeat);
        }

        // 更新状态 - 使用最新状态作为基础
        set(chatAtom, {
          ...latestState,
          messages: [...filterSystemMessages(latestState.messages), {
            role: 'system',
            content: content // 使用返回的提示消息
          }],
          isLoading: false,
          isGenerating: false,
          connection: newConnectionStatus
        });

        // 显示通知
        set(showToastAtom, {
          message: status === 'full' ? 'Chat time has ended' : 'You have entered the queue',
          severity: 'warning'
        });

        return;
      }

      // 处理错误状态
      if (status === 'error') {
        throw new Error(content || 'send message error');
      }

      // 如果status为Completed, 则代表创建训练模型任务完成
      if (status === 'Completed') {
        console.log('create train model success');
      }

      let isGenerating = false;
      let messageType = 'text';
      if (status === 'upload_image') {
        messageType = 'upload_image';
      } else if (task_type === 'generation' && request_id) {
        messageType = 'generating_image';
        isGenerating = true;
      }

      if (status === "tokenization_agreement" && task_type === 'tokenization') {
        // "agreement": "tokenization_agreement",
        // tokenization
        messageType = 'tokenization_agreement';
      }

      if (status === "AICC_DETAILS_PROVIDED" && task_type === 'create_workflow') {
        messageType = 'create_workflow';
      }

      if (status === "AWAITING_WORKFLOW_INPUTS" && task_type === "use_workflow") {
        messageType = 'run_workflow';
      }

      const receivedMessage: Message = {
        role: 'assistant',
        content: content,
        type: messageType as 'text' | 'upload_image' | 'generating_image' | 'generate_result' | 'tokenization_agreement' | "create_workflow"
            | "run_workflow",
        imageUploadState: messageType === 'upload_image'
          ? { totalCount: 0, uploadedCount: 0, isUploading: false, finishUpload: false }
          : undefined,
        request_id: request_id || undefined,
        agree: messageType === 'tokenization_agreement' ? agree : undefined,
      };

      // 更新消息历史 - 使用最新状态的消息列表
      const updatedMessages = [...latestState.messages, receivedMessage];

      // 如果返回了model信息，更新model_config消息和chatAtom的modelParam
      let finalMessages = updatedMessages;
      let updatedModelParam = latestState.modelParam;

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

      // 更新状态 - 使用最新状态作为基础
      set(chatAtom, {
        ...latestState,
        messages: filterSystemMessages(finalMessages),
        isLoading: false,
        isGenerating: isGenerating,
        task_type: task_type,
        current_status: status,
        task_value: task_value,
        modelParam: updatedModelParam,
        workflow_name: workflow_name || undefined,
        workflow_prompt: generated_prompt || workflow_goal || undefined,
      });

      // 如果 request_id 不为空，则代表创建生成图片任务完成
      console.log('request_id:', request_id);
      if (request_id) {
        pollImageGenerationTask(request_id, set, get).catch(err => {
          console.error('poll Image Generation Task Failed:', err);
        });
      }

      if (status === 'tokenization' && chatState.currentModel?.id) {
        // 使用 fetchTokenizationState 重新加载Token状态
        console.log('reset model images，model id:', chatState.currentModel.id);
        set(fetchTokenizationState, { modelId: chatState.currentModel.id, model_tokenization_id: chatState.currentModel?.model_tokenization?.id || 0})
        set(fetchModelDetail, chatState.currentModel.id , false)
      }
      if (status === 'tokenization' && chatState.currentWorkflow?.id) {
        // 使用 fetchTokenizationState 重新加载Token状态
        console.log('reset workflow detailed，workflow id:', chatState.currentWorkflow.id);
        set(fetchTokenizationState, { workflow_id: chatState.currentWorkflow.id, workflow_tokenization_id: chatState.currentWorkflow?.workflow_tokenization?.id || 0})
        set(fetchWorkflowDetail, chatState.currentWorkflow.id , false)
      }
    } catch (error) {
      console.error('Send Message Failed:', error);

      // 获取最新状态
      const latestState = get(chatAtom);

      // 更新错误状态 - 使用最新状态作为基础
      const errorMsg = "Internal service error"
      set(chatAtom, {
        ...latestState,
        messages: [...filterSystemMessages(latestState.messages), {
          role: 'system',
          // content: error instanceof Error ? error.message: 'Send Message error, Please retry later'
          content: errorMsg
        }],
        isLoading: false,
        isGenerating: false,
        // error: error instanceof Error ? error.message : 'Send Message error',
        error: errorMsg,
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
  const finishUpload = uploadImageMsg.imageUploadState && uploadImageMsg.imageUploadState.finishUpload
  const hasEnoughImages = uploadImageMsg.uploadedFiles && uploadImageMsg.uploadedFiles.length >= 10 && finishUpload;

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
  async (get, set, messageIndex: number, maxSize: number) => {
    // 创建一个文件选择对话框
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;

    input.onchange = async (event) => {
      const target = event.target as HTMLInputElement;
      const currentFiles = target.files;

      if (!currentFiles || currentFiles.length === 0) {
        target.value = '';
        return;
      }

      const originalFileCount = currentFiles.length;
      let filesToUpload = Array.from(currentFiles);

      if (originalFileCount > maxSize) {
        filesToUpload = filesToUpload.slice(0, maxSize);
        set(showToastAtom, {
          message: `You selected ${originalFileCount} images, only uploading the first ${maxSize}`,
          severity: 'warning'
        });
      }

      const chatState = get(chatAtom);

      // 根据现有的uploadedFiles获取当前消息
      const currentMessage = chatState.messages[messageIndex];
      const existingFiles = currentMessage.uploadedFiles || [];

      try {
        // 设置上传状态
        set(chatAtom, {
          ...chatState,
          messages: updateImageUploadState(chatState.messages, messageIndex, {
            totalCount: filesToUpload.length,
            uploadedCount: 0,
            isUploading: true
          })
        });

        // 准备要上传的文件信息
        const filesWithNames = filesToUpload.map(file => ({
          file,
          name: file.name
        }));

        // 使用uploadImages函数上传图片
        const uploadedUrls = await uploadImages(
          messageIndex,
          filesToUpload,
          // 设置上传状态的回调
          (state) => set(setImageUploadStateAtom, state),
          // 更新消息URL的回调
          ({ messageId, url, progress }) => {
            const updatedChatState = get(chatAtom);

            // 更新上传进度
            set(chatAtom, {
              ...updatedChatState,
              messages: updateImageUploadState(updatedChatState.messages, messageId, {
                uploadedCount: Math.floor(filesToUpload.length * (progress / 100)),
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
          message: 'Image upload failed',
          severity: 'error'
        });
      }
    };

    input.click();
  }
);

// 修改removeImage函数来处理model_config消息
export const agree = atom(
    null,
    (get, set, messageIndex: number ) => {
      const chatState = get(chatAtom);

      // 更新同意协议情况
      const updatedMessages = updateAgreeState(chatState.messages, messageIndex);

      set(chatAtom, {
        ...chatState,
        messages: updatedMessages,
        agree: true
      });
    }
);

// 修改removeImage函数来处理model_config消息
export const finishUploadImages = atom(
    null,
    (get, set, messageIndex: number ) => {
      const chatState = get(chatAtom);

      // 更新消息中的uploadedFiles
      const updatedMessages = updateUploadedState(chatState.messages, messageIndex, true);

      // 检查图片数量并处理model_config消息
      const finalMessages = checkAndAddModelConfigMessage(updatedMessages);

      set(chatAtom, {
        ...chatState,
        messages: finalMessages
      });
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
      workflowCreation: {
        isCreating: false,
        isSuccess: false
      },
      workflowImageValue: "",
      workflowImageFile: null,
      workflowRunning: {
        isRunning: false,
        isSuccess: false
      }
    });
  }
);

// 心跳相关常量
const HEARTBEAT_INTERVAL = 15000; // 15秒发送一次心跳

// 修改心跳检测API函数
export async function sendHeartbeat(userUuid: string, betaMode: boolean): Promise<ConnectionStatus> {
  const apiPrefix = betaMode ? '/beta-api' : '/api';

  try {
    const response = await fetch(`${apiPrefix}/heartbeat`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
        'X-User-Id': userUuid
      }
    });

    if (!response.ok) {
      throw new Error(`Heartbeat request failed, status code ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Heartbeat request failed:', error);
    throw error;
  }
}

// 修改启动心跳的操作
export const startHeartbeat = atom(
  null,
  (get, set) => {
    const chatState = get(chatAtom);

    // 如果已经有心跳计时器，先清除
    if (chatState.heartbeatId) {
      clearInterval(chatState.heartbeatId);
    }

    // 创建新的心跳计时器
    const heartbeatId = window.setInterval(async () => {
      try {
        const currentState = get(chatAtom);

        // 检查用户是否仍然活跃或在排队中
        if ((!currentState.connection.isActive && !currentState.connection.inQueue) || !currentState.userUuid) {
          // 如果用户不再活跃且不在排队中，停止心跳
          set(stopHeartbeat);
          return;
        }

        // 如果当前正在加载聊天回复，暂时跳过这次心跳
        if (currentState.isLoading) {
          console.log('chat ing. continue heartbeat');
          return;
        }

        // 发送心跳并获取新的连接状态
        const newConnectionStatus = await sendHeartbeat(currentState.userUuid, currentState.betaMode);

        // 重新获取最新状态
        const latestState = get(chatAtom);

        // 如果这段时间内已经开始加载聊天，不要覆盖状态
        if (latestState.isLoading) {
          console.log('chat ing. continue heartbeat');
          return;
        }

        // 更新连接状态
        set(chatAtom, {
          ...latestState,
          connection: newConnectionStatus
        });

        // 如果用户不再活跃且不在排队中，停止心跳
        if (!newConnectionStatus.isActive && !newConnectionStatus.inQueue) {
          set(stopHeartbeat);

          set(showToastAtom, {
            message: 'Your session has ended or been replaced',
            severity: 'warning'
          });
        }
      } catch (error) {
        console.error('Heartbeat request failed:', error);
      }
    }, HEARTBEAT_INTERVAL);

    // 更新心跳ID到状态
    set(chatAtom, {
      ...chatState,
      heartbeatId
    });
  }
);

// 停止心跳的操作
export const stopHeartbeat = atom(
  null,
  (get, set) => {
    const chatState = get(chatAtom);

    if (chatState.heartbeatId) {
      clearInterval(chatState.heartbeatId);

      set(chatAtom, {
        ...chatState,
        heartbeatId: undefined
      });
    }
  }
);

// 修改检查连接状态的操作，使用betaMode
export const checkConnectionStatus = atom(
  null,
  async (get, set) => {
    const chatState = get(chatAtom);
    const { userUuid, betaMode } = chatState;

    if (!userUuid) {
      console.warn('check Connection Status failed: userUuid is null');
      return;
    }

    try {
      set(chatAtom, {
        ...chatState,
        isLoading: true
      });

      const connectionStatus = await fetchConnectionStatus(userUuid, betaMode);

      set(chatAtom, {
        ...chatState,
        connection: connectionStatus,
        isLoading: false
      });

      // 如果用户变为活跃状态，启动心跳
      if (connectionStatus.isActive) {
        set(startHeartbeat);
      } else if (chatState.heartbeatId) {
        // 如果用户不再活跃但心跳仍在运行，停止心跳
        set(stopHeartbeat);
      }

      return connectionStatus;
    } catch (error) {
      console.error('check connection status failed:', error);

      set(chatAtom, {
        ...chatState,
        error: error instanceof Error ? error.message : 'Check connection status error',
        isLoading: false
      });
    }
  }
);

// 4. 添加获取连接状态的API函数
export async function fetchConnectionStatus(userUuid: string, betaMode: boolean): Promise<ConnectionStatus> {
  const apiPrefix = betaMode ? '/beta-api' : '/api';

  try {
    const response = await fetch(`${apiPrefix}/initial-connection/${userUuid}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_BEARER_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Internal service error');
    }

    return await response.json();
  } catch (error) {
    console.error('get connection status failed:', error);
    throw error;
  }
}

// 6. 修改setUserInfo操作，在did更新时检查连接状态
export const setUserInfo = atom(
  null,
  async (get, set, params: { uuid: string | undefined | null, did?: string, wallet_address?: string }) => {
    const { uuid, did, wallet_address } = params;
    const chatState = get(chatAtom);
    const prevDid = chatState.did;

    // 更新用户信息
    set(chatAtom, {
      ...chatState,
      userUuid: uuid || "",
      did: did,
      wallet_address: wallet_address
    });

    console.log('user is login success, check connection status:', prevDid);
    set(checkConnectionStatus);
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

// 设置当前正在查看的模型详情
export const setModelStatus = atom(
    null,
    (get, set, status: string | null) => {
      const chatState = get(chatAtom);
      console.log("current model status", status)
      set(chatAtom, {
        ...chatState,
        modelStatus: status
      });
    }
);

// 清除当前模型详情（退出模型详情页时调用）
export const clearModelStatus = atom(
    null,
    (get, set) => {
      const chatState = get(chatAtom);

      set(chatAtom, {
        ...chatState,
        modelStatus: null
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

// 添加到导出列表中
export const setLoraWeight = atom(
  null,
  (get, set, weight: number) => {
    const chatState = get(chatAtom);
    set(chatAtom, {
      ...chatState,
      loraWeight: weight
    });
  }
);

// 添加切换Beta模式的操作
export const toggleBetaMode = atom(
  null,
  (get, set) => {
    const chatState = get(chatAtom);

    set(chatAtom, {
      ...chatState,
      betaMode: !chatState.betaMode
    });
  }
);

// 工作流值类型枚举 - 修改为正确的值
export enum WORKFLOW_VALUE_TYPE {
  IMAGE = 'image',
  TEXT = 'text',
}

// 工作流提供商枚举 - 修改为正确的值
export enum WORKFLOW_PROVIDER {
  GPT_4o = 'gpt-4o',
}

// GPT模型枚举 - 修改为正确的值
export enum WORKFLOW_GPT_MODEL {
  GPT_IMAGE_1 = 'gpt-image-1',
}

// 将输入类型字符串转换为API需要的枚举类型 - 修改映射逻辑
function mapInputOutputType(type: string): WORKFLOW_VALUE_TYPE[] {
  switch (type) {
    case 'Image':
      return [WORKFLOW_VALUE_TYPE.IMAGE];
    case 'Text':
      return [WORKFLOW_VALUE_TYPE.TEXT];
    default:
      return [WORKFLOW_VALUE_TYPE.IMAGE];
  }
}

// 创建工作流接口
interface CreateWorkflowParams {
  name: string;
  description?: string;
  creator: string;
  prompt?: string;
  input_type?: WORKFLOW_VALUE_TYPE[];
  output_type?: WORKFLOW_VALUE_TYPE[];
  provider: WORKFLOW_PROVIDER;
  model: WORKFLOW_GPT_MODEL;
  reference_images?: string[];
}

// 创建工作流响应
interface CreateWorkflowResponse {
  message: string;
  data: {
    workflow_id: number;
  }
}


// 创建工作流API函数
export async function createWorkflowAPI(params: CreateWorkflowParams): Promise<CreateWorkflowResponse> {
  try {
    const response = await fetch('/studio-api/workflow/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_BEARER_TOKEN}`
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      throw new Error(`Create workflow failed with status code ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Create Workflow Failed:', error);
    throw error;
  }
}

// 创建工作流状态
interface WorkflowCreationState {
  isCreating: boolean;
  isSuccess: boolean;
  workflowId?: number;
  error?: string;
}

// 创建工作流操作 - 修改API参数
export const createWorkflow = atom(
  null,
  async (get, set) => {
    const chatState = get(chatAtom);

    // 设置创建中状态
    set(chatAtom, {
      ...chatState,
      workflowCreation: {
        isCreating: true,
        isSuccess: false,
        error: undefined
      }
    });

    try {
      // 准备API参数
      const params: CreateWorkflowParams = {
        name: chatState.workflow_name || 'New Workflow',
        description: '', // 可以添加描述输入框或使用其他字段
        creator: chatState.did || '',
        prompt: chatState.workflow_prompt,
        input_type: mapInputOutputType(chatState.workflow_input),
        output_type: mapInputOutputType(chatState.workflow_output),
        provider: WORKFLOW_PROVIDER.GPT_4o, // 使用正确的枚举值
        model: WORKFLOW_GPT_MODEL.GPT_IMAGE_1, // 使用正确的枚举值
        reference_images: chatState.urls.map(url => url.url) // 使用已上传的图片
      };

      // 调用API
      const response = await createWorkflowAPI(params);

      // 设置成功状态
      set(chatAtom, {
        ...get(chatAtom), // 重新获取最新状态
        workflowCreation: {
          isCreating: false,
          isSuccess: true,
          workflowId: response.data.workflow_id
        }
      });

      // 显示成功提示
      set(showToastAtom, {
        message: 'Workflow created successfully',
        severity: 'success'
      });

    } catch (error) {
      // 设置错误状态
      set(chatAtom, {
        ...get(chatAtom),
        workflowCreation: {
          isCreating: false,
          isSuccess: false,
          error: error instanceof Error ? error.message : 'Failed to create workflow'
        }
      });

      // 显示错误提示
      set(showToastAtom, {
        message: error instanceof Error ? error.message : 'Failed to create workflow',
        severity: 'error'
      });
    }
  }
);

// 更新工作流提示文本
export const updateWorkflowPrompt = atom(
  null,
  (get, set, prompt: string) => {
    const chatState = get(chatAtom);

    set(chatAtom, {
      ...chatState,
      workflow_prompt: prompt
    });
  }
);

// 更新工作流输入类型
export const updateWorkflowInput = atom(
  null,
  (get, set, inputType: string) => {
    const chatState = get(chatAtom);

    set(chatAtom, {
      ...chatState,
      workflow_input: inputType
    });
  }
);

// 更新工作流输出类型
export const updateWorkflowOutput = atom(
  null,
  (get, set, outputType: string) => {
    const chatState = get(chatAtom);

    set(chatAtom, {
      ...chatState,
      workflow_output: outputType
    });
  }
);

// 更新工作流模型
export const updateWorkflowModel = atom(
  null,
  (get, set, model: string) => {
    const chatState = get(chatAtom);

    set(chatAtom, {
      ...chatState,
      workflow_model: model
    });
  }
);

// 运行工作流接口
interface RunWorkflowParams {
  workflow_id: number;
  creator: string;
  text_value?: string;
  image_value?: string;
  width?: number;
  height?: number;
}

// 运行工作流响应
interface AigcResponse {
  message: string;
  data: {
    image_id?: number; // 图片id
    task_id?: string; // 任务id
  };
}

// 运行工作流API函数
export async function runWorkflowAPI(params: RunWorkflowParams): Promise<AigcResponse> {
  try {
    const response = await fetch('/studio-api/workflow/aigc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_BEARER_TOKEN}`
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      throw new Error(`Run workflow failed with status code ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Run Workflow Failed:', error);
    throw error;
  }
}

// 设置工作流图片 - 修改为同时保存临时URL和File
export const setWorkflowImage = atom(
  null,
  (get, set, params: { url: string, file: File | null }) => {
    const { url, file } = params;
    const chatState = get(chatAtom);

    set(chatAtom, {
      ...chatState,
      workflowImageValue: url,
      workflowImageFile: file
    });
  }
);

// 运行工作流操作 - 修改为先上传图片
export const runWorkflow = atom(
  null,
  async (get, set) => {
    const chatState = get(chatAtom);

    // 设置执行中状态
    set(chatAtom, {
      ...chatState,
      workflowRunning: {
        isRunning: true,
        isSuccess: false,
        error: undefined
      }
    });

    try {
      let imageValue = chatState.workflowImageValue;

      // 如果有图片文件需要上传
      if (chatState.workflowImageFile && !imageValue.startsWith('http')) {
        try {
          // 导入上传函数
          const { uploadFileToS3 } = await import('./imagesStore');

          // 上传图片到S3
          imageValue = await uploadFileToS3(chatState.workflowImageFile);

          // 更新S3 URL到状态
          set(chatAtom, {
            ...get(chatAtom),
            workflowImageValue: imageValue
          });

        } catch (error) {
          console.error('Failed to upload image:', error);
          throw new Error('Failed to upload image. Please try again.');
        }
      }

      const workflowId = chatState.currentWorkflow?.id
      // 准备API参数，使用上传后的图片URL
      const params: RunWorkflowParams = {
        workflow_id: workflowId || 0,
        creator: chatState.did || '',
        image_value: imageValue || undefined,
        width: chatState.selectedAspectRatio?.width || 1024,
        height: chatState.selectedAspectRatio?.height || 1024
      };

      // 调用API
      const response = await runWorkflowAPI(params);

      // 如果有生成的任务ID，启动轮询
      if (response.data.task_id) {
        pollImageGenerationTask(response.data.task_id, set, get, true).catch(err => {
          console.error('Poll Image Generation Task Failed:', err);
        });
      } else {
        set(chatAtom, {
          ...get(chatAtom),
          workflowRunning: {
            isRunning: false,
            isSuccess: true
          },
          workflowImageFile: null // 清除文件对象
        });
      }

      // 显示成功提示
      // set(showToastAtom, {
      //   message: 'Workflow started successfully',
      //   severity: 'success'
      // });

    } catch (error) {
      // 设置错误状态
      set(chatAtom, {
        ...get(chatAtom),
        workflowRunning: {
          isRunning: false,
          isSuccess: false,
          error: error instanceof Error ? error.message : 'Failed to run workflow'
        }
      });

      // 显示错误提示
      set(showToastAtom, {
        message: error instanceof Error ? error.message : 'Failed to run workflow',
        severity: 'error'
      });
    }
  }
);

// 设置当前正在查看的工作流详情
export const setCurrentWorkflow = atom(
    null,
    (get, set, workflow: WorkflowDetail | null) => {
      const chatState = get(chatAtom);

      set(chatAtom, {
        ...chatState,
        currentWorkflow: workflow
      });
    }
);

// 清除当前工作流详情（退出工作流详情页时调用）
export const clearCurrentWorkflow = atom(
    null,
    (get, set) => {
      const chatState = get(chatAtom);

      set(chatAtom, {
        ...chatState,
        currentWorkflow: null
      });
    }
);

// 清除当前模型详情（退出模型详情页时调用）
export const clearWorkflowStatus = atom(
    null,
    (get, set) => {
      const chatState = get(chatAtom);

      set(chatAtom, {
        ...chatState,
        workflowStatus: null
      });
    }
);