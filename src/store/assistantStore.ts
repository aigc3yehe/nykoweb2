/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { atom } from 'jotai';
import { imageUploadAtom, setImageUploadStateAtom, updateMessageUrlsAtom, showToastAtom, uploadImages } from './imagesStore.ts';
import { fetchContentsAtom } from './contentsStore';
import { PRIVY_TOKEN_HEADER } from '../utils';
import { getAccessToken } from '@privy-io/react-auth';
import { FetchModelDto, WorkflowDto } from '../services/api';
import { contentsApi } from '../services/api/contents';
import type { FetchGenerateContentStateRequest, FetchGenerateContentStateResponse } from '../services/api/types';
import { workflowsApi } from '../services/api/workflows';
import type { WorkflowGenerateRequest } from '../services/api/types';

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

export const workflowAspectRatios: AspectRatio[] = [
  { label: '1:1', value: '1:1', width: 1024, height: 1024 },
  { label: '2:3', value: '2:3', width: 1024, height: 1536 },
  { label: '3:2', value: '3:2', width: 1536, height: 1024 },
  { label: 'auto', value: 'auto', width: 0, height: 0 },
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
      | "run_workflow" | "workflow_generate_result" | "create_workflow_details" | "modify_image" | "uploaded_image"
      | "generating_video" | "video_generate_result" | "animating_image" | "minting_nft" | "generation_timeout" | "tokenization_timeout" | "minting_success"; // 新增超时类型和 minting_success 类型
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
  videos?: string[]; // 新增视频URL数组
  cu?: number;
  imageInfo?: {
    width: number;
    height: number;
  }
  agree?: boolean;
  // 新增：轮询重试相关参数
  retryParams?: {
    taskId: string;
    contentId: number;
    cu: number;
    isWorkflow: boolean;
    isVideo: boolean;
  };
  // 新增：NFT相关字段
  token_id?: string; // NFT的token ID
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
  previous_sub_intent_status?: string; // 新增：上一次子意图状态
  modelParam?: {
    modelName?: string;
    description?: string;
  };
  modelStatus: string | null;
  agree: boolean;
  selectedAspectRatio?: AspectRatio;
  selectedWorkflowAspectRatio?: AspectRatio;
  activeTasks: Record<string, TaskInfo>;
  connection: ConnectionStatus; // 添加连接状态
  heartbeatId?: number; // 存储心跳计时器ID
  loraWeight?: number;
  betaMode: boolean; // 添加Beta模式开关
  currentDetailModel: FetchModelDto | null;
  currentDetailWorkflow: WorkflowDto | null;
  workflow_name: string;
  workflow_description: string;
  workflow_prompt: string;
  workflow_input: string;
  workflow_output: string;
  workflow_model: string;
  workflowCreation: WorkflowCreationState;
  workflowImageValue: string; // 临时URL或S3 URL
  workflowImageFile: File | null; // 保存File对象用于上传
  workflowRunningState: { // 当前正在执行的相关状态
    workflow: WorkflowDto | null;
    width: number | null;
    height: number | null;
    prompt: string | null;
  };
  workflowRunning: {
    isRunning: boolean;
    isSuccess: boolean;
    workflowId?: number;
    error?: string;
  };
  // 添加 Reference Image 相关状态
  workflowReferenceImage: {
    isUploading: boolean;
    uploadedUrl: string;
    fileName: string;
    error?: string;
  };
  workflow_extra_prompt: string; // 新增字段
  // 新增：最新生成图片的状态信息
  latestGeneratedImage: LatestGeneratedImage;
  // 新增：AI服务提供商状态
  aiProviders: AIProvidersState;
  // 新增：轮询重试状态
  pollingRetryState: {
    taskId?: string;
    contentId?: number;
    isWorkflow?: boolean;
    isVideo?: boolean;
  };
  agentToken: string | null;
  // 新增：延迟发送消息功能
  pendingMessage: string | null; // 等待发送的消息
}

// 添加最新生成图片的接口 - 新增aicc_type字段
interface LatestGeneratedImage {
  aicc_status?: string;
  provider?: string; // "gpt-4o" | "sd"
  model?: string; // "gpt-image-1-vip" | "sd"
  source?: string; // "model" | "workflow"
  source_id?: number;
  reference?: string; // 生成的图片 URL
  aicc_width?: number;
  aicc_height?: number;
  aicc_prompt?: string;
  aicc_type?: string; // 新增：'image' | 'video'
  content_id?: number;
}

// 新增：NFT铸造相关接口
export interface TokenizationParams {
  user: string;
  content_id: number;
}

export interface TokenizationResponse {
  message: string;
  data: {
    task_id: string;
  };
}

export interface TokenizationStateResponse {
  message: string;
  data: {
    task_id: string;
    status?: string; // completed, failed
    network?: number;
    tx_hash?: string;
    token_id?: string;
    error?: string;
    collection?: string;
  };
}
// 3. 更新初始状态
const initialState: ChatState = {
  // messages: [
  //   { role: 'user', content: '普通文本消息', type: 'text' },
  //   { role: 'user', content: '用户上传图片', type: 'uploaded_image', images: ['https://aigc3.s3.amazonaws.com/2025_07_11_17_33_32_830657_276a17d7-a7c5-41db-a464-fe14a9d9dc08_0.png'] },
  //   { role: 'user', content: '上传图片', type: 'upload_image', imageUploadState: { totalCount: 1, uploadedCount: 1, isUploading: false, finishUpload: true }, uploadedFiles: [{ name: 'test.png', url: 'https://aigc3.s3.amazonaws.com/2025_07_11_17_33_32_830657_276a17d7-a7c5-41db-a464-fe14a9d9dc08_0.png' }] },
  //   { role: 'assistant', content: '请填写模型信息', type: 'model_config', modelParam: { modelName: 'Test Model', description: 'A test model' } },
  //   { role: 'assistant', content: '图片生成结果', type: 'generate_result', images: ['https://aigc3.s3.amazonaws.com/2025_07_11_17_33_32_830657_276a17d7-a7c5-41db-a464-fe14a9d9dc08_0.png'], cu: 5, imageInfo: { width: 1024, height: 1024 } },
  //   { role: 'assistant', content: '工作流生成结果', type: 'workflow_generate_result', images: ['https://aigc3.s3.amazonaws.com/2025_07_11_17_33_32_830657_276a17d7-a7c5-41db-a464-fe14a9d9dc08_0.png'], cu: 35, imageInfo: { width: 1024, height: 1024 } },
  //   { role: 'assistant', content: '图片生成中...', type: 'generating_image', request_id: 'req1' },
  //   { role: 'assistant', content: '图片修改中...', type: 'modify_image', request_id: 'req2' },
  //   { role: 'assistant', content: '请同意协议', type: 'tokenization_agreement', agree: false },
  //   { role: 'assistant', content: '工作流创建', type: 'create_workflow' },
  //   { role: 'assistant', content: '运行工作流', type: 'run_workflow' },
  //   { role: 'assistant', content: '工作流生成结果', type: 'workflow_generate_result', images: ['https://aigc3.s3.amazonaws.com/2025_07_11_17_33_32_830657_276a17d7-a7c5-41db-a464-fe14a9d9dc08_0.png'], cu: 35, imageInfo: { width: 1024, height: 1024 } },
  //   { role: 'assistant', content: '填写工作流详情', type: 'create_workflow_details' },
  //   { role: 'assistant', content: '上传图片', type: 'uploaded_image', images: ['https://aigc3.s3.amazonaws.com/2025_07_11_17_33_32_830657_276a17d7-a7c5-41db-a464-fe14a9d9dc08_0.png'] },
  //   { role: 'assistant', content: '视频生成中...', type: 'generating_video', request_id: 'req3' },
  //   { role: 'assistant', content: '视频生成结果', type: 'video_generate_result', videos: ['https://www.w3schools.com/html/mov_bbb.mp4'] },
  //   { role: 'assistant', content: '图片动画中...', type: 'animating_image', request_id: 'req4' },
  //   { role: 'assistant', content: 'NFT铸造中...', type: 'minting_nft' },
  //   { role: 'assistant', content: '生成超时', type: 'generation_timeout' },
  //   { role: 'assistant', content: 'NFT超时', type: 'tokenization_timeout' },
  //   { role: 'assistant', content: 'NFT铸造成功', type: 'minting_success', token_id: '123456' },
  //   // 最后一条为已生成图片
  //   { role: 'assistant', content: '最终图片生成', type: 'generate_result', images: ['https://aigc3.s3.amazonaws.com/2025_07_11_17_33_32_830657_276a17d7-a7c5-41db-a464-fe14a9d9dc08_0.png'], cu: 5, imageInfo: { width: 1024, height: 1024 } }
  // ],
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
  previous_sub_intent_status: undefined, // 新增初始化
  modelParam: undefined,
  modelStatus: null,
  agree: false,
  selectedAspectRatio: aspectRatios[0], // 默认选择1:1
  selectedWorkflowAspectRatio: workflowAspectRatios[0], // 默认选择1:1
  activeTasks: {},
  connection: {
    isActive: false,
    inQueue: false
  },
  heartbeatId: undefined,
  loraWeight: 0.5,
  betaMode: false, // 初始化为false
  currentDetailModel: null,
  currentDetailWorkflow: null,
  workflow_name: "",
  workflow_description: "",
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
  },
  // 初始化 Reference Image 状态
  workflowReferenceImage: {
    isUploading: false,
    uploadedUrl: "",
    fileName: "",
    error: undefined
  },
  workflow_extra_prompt: "", // 新增字段
  workflowRunningState: {
    workflow: null,
    width: null,
    height: null,
    prompt: null,
  },
  // 初始化最新生成图片状态
  latestGeneratedImage: {
    aicc_status: undefined,
    provider: undefined,
    model: undefined,
    source: undefined,
    source_id: undefined,
    reference: undefined,
    aicc_width: undefined,
    aicc_height: undefined,
    aicc_prompt: undefined,
    aicc_type: undefined, // 新增初始化
    content_id: undefined,
  },
  // 新增：AI服务提供商初始状态
  aiProviders: {
    providers: [],
    isLoading: false,
    error: null,
    selectedProvider: '',
    selectedModel: ''
  },
  // 新增：初始化轮询重试状态
  pollingRetryState: {},
  agentToken: null,
  pendingMessage: null,
};

// 创建原子状态
export const chatAtom = atom<ChatState>(initialState);

// 新增：设置当前详情模型的 atom
export const setCurrentDetailModelAtom = atom(
  null,
  (get, set, model: FetchModelDto | null) => {
    const chatState = get(chatAtom);
    set(chatAtom, {
      ...chatState,
      currentDetailModel: model
    });

    // 如果有待发送的消息且模型已设置，自动发送消息
    if (model && chatState.pendingMessage) {
      const messageToSend = chatState.pendingMessage;
      // 清除待发送消息
      set(chatAtom, prev => ({ ...prev, pendingMessage: null }));
      // 发送消息
      setTimeout(() => {
        set(sendMessage, messageToSend);
      }, 100); // 小延迟确保状态更新完成
    }
  }
);

// 新增：设置当前详情工作流的 atom
export const setCurrentDetailWorkflowAtom = atom(
  null,
  (get, set, workflow: WorkflowDto | null) => {
    const chatState = get(chatAtom);
    set(chatAtom, {
      ...chatState,
      currentDetailWorkflow: workflow
    });

    // 如果有待发送的消息且工作流已设置，自动发送消息
    if (workflow && chatState.pendingMessage) {
      const messageToSend = chatState.pendingMessage;
      // 清除待发送消息
      set(chatAtom, prev => ({ ...prev, pendingMessage: null }));
      // 发送消息
      setTimeout(() => {
        set(sendMessage, messageToSend);
      }, 100); // 小延迟确保状态更新完成
    }
  }
);

// 图片生成状态检查接口响应类型
export type CheckStatsResponse = {
  data?: {
    id?: string;
    status?: string;  // completed 时为完成，SUCCESS 时为成功
    error?: string;
    date_created?: string;
    upscaled_urls?: string[];
  };
};

// 查询图片生成状态的API - 使用新的接口
export async function checkImageGenerationStatus(request_id: string): Promise<FetchGenerateContentStateResponse> {
  try {

    const request: FetchGenerateContentStateRequest = {
      task_id: request_id,
      refresh: true
    };

    return await contentsApi.getGenerateState(request);
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

// 修改轮询函数，支持视频生成的不同参数
export async function pollImageGenerationTask(taskId: string, content_id: number, cu: number, set: any, get: any, isWorkflow: boolean = false, isVideo: boolean = false): Promise<void> {
  console.log('Start poll image generation task:', taskId, 'isVideo:', isVideo);

  // 存储轮询参数到状态中
  const chatState = get(chatAtom);
  set(chatAtom, {
    ...chatState,
    pollingRetryState: {
      taskId,
      contentId: content_id,
      cu: cu,
      isWorkflow,
      isVideo
    }
  });

  // 根据是否为视频设置不同的轮询参数
  const MAX_POLL_COUNT = isVideo ? 20 : 60; // 视频：20次，图片：60次
  const POLL_INTERVAL = isVideo ? 30000 : 5000; // 视频：30秒，图片：5秒

  for (let pollCount = 0; pollCount < MAX_POLL_COUNT; pollCount++) {
    try {
      console.log(`task ${taskId} the ${pollCount + 1} times`);

      // 等待一段时间再查询
      if (pollCount > 0) {
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
      }

      // 在调用前获取chatState
      const chatState = get(chatAtom);

      // 查询任务状态
      const statusResponse = await checkImageGenerationStatus(taskId);
      console.log('task status:', statusResponse);

      // 如果没有状态信息，继续轮询
      if (!statusResponse?.status) {
        console.log('Status is null, keep task');
        continue;
      }

      const status = statusResponse.status.toLowerCase();
      // 获取生成的内容（图片或视频）
      const generatedUrls = statusResponse.upscaled_urls?.filter(url => url !== null && url !== undefined && url.trim() !== '') || [];
      console.log('task status:', status);

      // 处理不同状态
      if (status === 'completed' || status === 'success' || generatedUrls.length > 0) {
        console.log('task completed:', status);

        console.log('get generated url:', generatedUrls);

        if (generatedUrls.length > 0) {
          // 确定实际的操作类型
          let actualIsWorkflow = isWorkflow;

          if (isWorkflow) {
            // 如果 isWorkflow 为 true，检查之前的 latestGeneratedImage 来判断是否应该继承之前的类型
            const previousSource = chatState.latestGeneratedImage.source;
            if (previousSource === 'model') {
              // 如果之前是 model 生成的图片，这次修改也应该保持 model 类型
              actualIsWorkflow = false;
            } else if (previousSource === 'workflow') {
              // 如果之前是 workflow 生成的图片，这次修改保持 workflow 类型
              actualIsWorkflow = true;
            }
            // 如果 previousSource 为空或其他值，保持原来的 isWorkflow 判断
          }
          // 如果 isWorkflow 为 false，直接使用 model 类型，不需要额外判断

          // 构建最新生成内容的状态信息
          const latestGeneratedImage: LatestGeneratedImage = {
            aicc_status: 'completed',
            provider: actualIsWorkflow ? (isVideo ? 'kling' : 'gpt-4o') : 'sd',
            model: actualIsWorkflow ? (isVideo ? 'kling-video-v1' : 'gpt-image-1-vip') : 'sd',
            source: actualIsWorkflow ? 'workflow' : 'model',
            source_id: actualIsWorkflow ? chatState.workflowRunningState.workflow?.id : chatState.currentDetailModel?.model_id,
            reference: generatedUrls[0], // 使用第一个生成的内容
            aicc_width: actualIsWorkflow ? chatState.workflowRunningState.width : chatState.selectedAspectRatio?.width,
            aicc_height: actualIsWorkflow ? chatState.workflowRunningState.height : chatState.selectedAspectRatio?.height,
            aicc_prompt: actualIsWorkflow ? chatState.workflowRunningState.prompt : undefined,
            aicc_type: isVideo ? 'video' : 'image',
            content_id: content_id,
          };

          // 查找对应的生成中消息
          const messageIndex = chatState.messages.findIndex(
            // @ts-ignore
            msg => (msg.type === 'generating_image' || msg.type === 'modify_image' || msg.type === 'generating_video' || msg.type === 'animating_image') && msg.request_id === taskId
          );

          if (messageIndex !== -1) {
            console.log('Find message, update message');
            const aspectRatio = actualIsWorkflow ? chatState.selectedWorkflowAspectRatio : chatState.selectedAspectRatio;
            let width = 512;
            let height = 512;
            if (aspectRatio && aspectRatio.value !== 'auto') {
              width = aspectRatio.width;
              height = aspectRatio.height;
            }

            // 更新现有消息而不是创建新消息
            const updatedMessages = [...chatState.messages];

            // 根据是否为视频设置不同的消息类型和内容
            if (isVideo) {
              updatedMessages[messageIndex] = {
                ...updatedMessages[messageIndex],
                content: 'Video generation completed',
                type: isWorkflow ? 'video_generate_result' : 'video_generate_result', // 视频结果类型
                videos: generatedUrls, // 使用videos字段存储视频URL
                cu: cu,
                imageInfo: {
                  width: width,
                  height: height
                }
              };
            } else {
              updatedMessages[messageIndex] = {
                ...updatedMessages[messageIndex],
                content: 'Image generation completed',
                type: isWorkflow ? 'workflow_generate_result' : 'generate_result',
                images: generatedUrls,
                cu: cu,
                imageInfo: {
                  width: width,
                  height: height
                }
              };
            }

            // 为工作流任务更新额外的状态
            let updatedWorkflowResult = chatState.workflowGeneratedResult;
            let updatedWorkflowRunning = chatState.workflowRunning;
            let updatedWorkflowImageFile = chatState.workflowImageFile;

            if (actualIsWorkflow) {
              const workflowRunningState = chatState.workflowRunningState;
              let generatedUrl = null;
              if (generatedUrls && generatedUrls.length > 0) {
                generatedUrl = generatedUrls[0];
              }
              updatedWorkflowResult = {
                status: 'workflow_generated',
                generatedImageUrl: generatedUrl,
                workflowInfo: workflowRunningState.workflow,
                width: workflowRunningState.width,
                height: workflowRunningState.height,
                prompt: workflowRunningState.prompt
              };
              updatedWorkflowRunning = {
                isRunning: false,
                isSuccess: true
              };
              updatedWorkflowImageFile = null;
            } else {
              // model 也需要, model也支持修图
              let generatedUrl = null;
              if (generatedUrls && generatedUrls.length > 0) {
                generatedUrl = generatedUrls[0];
              }
              updatedWorkflowResult = {
                status: 'workflow_generated',
                generatedImageUrl: generatedUrl,
                workflowInfo: null,
                width: chatState.selectedAspectRatio?.width || null,
                height: chatState.selectedAspectRatio?.height || null,
                prompt: null
              };
            }

            // 更新消息列表和最新生成内容状态
            set(chatAtom, {
              ...chatState,
              messages: updatedMessages,
              isGenerating: false,
              workflowRunning: updatedWorkflowRunning,
              workflowImageFile: updatedWorkflowImageFile,
              workflowGeneratedResult: updatedWorkflowResult,
              latestGeneratedImage: latestGeneratedImage // 更新：保存最新生成内容状态（包含aicc_type）
            });
          } else {
            console.log('Not found message, create new message');
            // 如果找不到对应消息，创建新消息（兜底方案）
            const aspectRatio = actualIsWorkflow ? chatState.selectedWorkflowAspectRatio : chatState.selectedAspectRatio;
            let width = 512;
            let height = 512;
            if (aspectRatio && aspectRatio.value !== 'auto') {
              width = aspectRatio.width;
              height = aspectRatio.height;
            }

            const resultMessage: Message = {
              role: 'assistant',
              content: isVideo ? 'Video generation completed' : 'Image generation completed',
              type: isVideo ? 'video_generate_result' : (isWorkflow ? 'workflow_generate_result' : 'generate_result'),
              ...(isVideo ? { videos: generatedUrls } : { images: generatedUrls }),
              cu: cu,
              request_id: taskId,
              imageInfo: {
                width: width,
                height: height
              }
            };

            // 为工作流任务更新额外的状态
            let updatedWorkflowResult = chatState.workflowGeneratedResult;
            let updatedWorkflowRunning = chatState.workflowRunning;
            let updatedWorkflowImageFile = chatState.workflowImageFile;

            if (actualIsWorkflow) {
              const workflowRunningState = chatState.workflowRunningState;
              let generatedUrl = null;
              if (generatedUrls && generatedUrls.length > 0) {
                generatedUrl = generatedUrls[0];
              }
              updatedWorkflowResult = {
                status: 'workflow_generated',
                generatedImageUrl: generatedUrl,
                workflowInfo: workflowRunningState.workflow,
                width: workflowRunningState.width,
                height: workflowRunningState.height,
                prompt: workflowRunningState.prompt
              };
              updatedWorkflowRunning = {
                isRunning: false,
                isSuccess: true
              };
              updatedWorkflowImageFile = null;
            }

            // 添加消息到列表和最新生成内容状态
            set(chatAtom, {
              ...get(chatAtom),
              messages: [...filterSystemMessages(chatState.messages), resultMessage],
              workflowRunning: updatedWorkflowRunning,
              isGenerating: false,
              workflowImageFile: updatedWorkflowImageFile,
              workflowGeneratedResult: updatedWorkflowResult,
              latestGeneratedImage: latestGeneratedImage // 新增：保存最新生成内容状态
            });
          }

          // 显示成功通知
          set(showToastAtom, {
            message: isVideo ? 'Video generation completed' : 'Image generation completed',
            severity: 'success'
          });

          // 如果有当前模型，静默刷新内容（获取第1页新内容并与现有内容合并）
          if (chatState.currentDetailModel?.model_id) {
            set(fetchContentsAtom, {
              reset: false,
              typeFilter: 'all',
              source: 'model',
              source_id: chatState.currentDetailModel.model_id,
              disableCache: true
            });
          }
          // 如果是工作流，静默刷新内容（获取第1页新内容并与现有内容合并）
          if (actualIsWorkflow && chatState.currentDetailWorkflow?.workflow_id) {
            set(fetchContentsAtom, {
              reset: false,
              typeFilter: 'all',
              source: 'workflow',
              source_id: chatState.currentDetailWorkflow.workflow_id,
              disableCache: true
            });
          }
        }
        console.log('task finished，exit');
        // 清除轮询重试状态
        set(chatAtom, {
          ...get(chatAtom),
          pollingRetryState: {}
        });
        return;
      } else if (status === 'failed' || status === 'error') {
        console.log('task failed');

        let errorMessage = statusResponse.error;
        if (!errorMessage) {
          errorMessage = isVideo ? 'video generation failed' : 'image generation failed';
        }

        // 查找对应的生成中消息
        const messageIndex = chatState.messages.findIndex(
          // @ts-ignore
          msg => (msg.type === 'generating_image' || msg.type === 'modify_image' || msg.type === 'generating_video' || msg.type === 'animating_image') && msg.request_id === taskId
        );

        if (messageIndex !== -1) {
                      console.log('Find message, update failed message');
          // 更新现有消息为失败消息
          const updatedMessages = [...chatState.messages];
          updatedMessages[messageIndex] = {
            ...updatedMessages[messageIndex],
            content: errorMessage,
            type: 'text', // 改为普通文本消息
            images: undefined, // 清除图片字段
            videos: undefined // 清除视频字段
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
          console.log('Not found message, create new failed message');
          // 如果找不到对应消息，添加失败消息
          set(chatAtom, {
            ...chatState,
            messages: [...filterSystemMessages(chatState.messages), {
              role: 'system',
              content: errorMessage,
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
          message: isVideo ? 'video generation failed' : 'image generation failed',
          severity: 'error'
        });

        // 任务失败，退出轮询
        console.log('task failed, exit');

        // 清除轮询重试状态
        set(chatAtom, {
          ...get(chatAtom),
          pollingRetryState: {}
        });

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
      content: isVideo ? 'Video generation timed out, please check again later or try again' : 'Image generation timed out, please check again later or try again',
      type: 'generation_timeout', // 新增：使用超时类型
      request_id: taskId,
      retryParams: { // 新增：保存重试参数
        taskId,
        contentId: content_id,
        isWorkflow,
        isVideo
      }
    }],
    isGenerating: false
  });

  // 显示超时通知
  set(showToastAtom, {
    message: isVideo ? 'Video generation timed out' : 'Image generation timed out',
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

// 添加自定方消息
export const addMessage = atom(
  null, 
  async (get, set, content: string, messageType: string, request_id: string, url: string, cu: number, width: number, height: number) => {
    const chatState = get(chatAtom);
    
    // 创建消息对象
    const receivedMessage: Message = {
      role: 'assistant',
      content: content,
      type: messageType as 'text' | 'upload_image' | 'generating_image' | 'generate_result' | 'tokenization_agreement' | "create_workflow"
          | "run_workflow" | "workflow_generate_result" | "create_workflow_details" | "modify_image" | "uploaded_image"
          | "generating_video" | "video_generate_result",
      imageUploadState: undefined,
      request_id: request_id || undefined,
      agree: undefined,
      images: [url],
      cu: cu,
      imageInfo: {
        width: width,
        height: height
      }
    };

    // 判断是否为工作流生成的图片
    const isWorkflow = messageType === 'workflow_generate_result';
    
    // 构建最新生成内容的状态信息
    const latestGeneratedImage: LatestGeneratedImage = {
      aicc_status: 'completed',
      provider: isWorkflow ? 'gpt-4o' : 'sd',
      model: isWorkflow ? 'gpt-image-1-vip' : 'sd',
      source: isWorkflow ? 'workflow' : 'model',
      source_id: isWorkflow ? chatState.currentDetailWorkflow?.workflow_id || undefined : chatState.currentDetailModel?.model_id || undefined,
      reference: url,
      aicc_width: width,
      aicc_height: height,
      aicc_prompt: isWorkflow ? chatState.workflowRunningState.prompt || undefined : undefined,
      aicc_type: 'image',
      content_id: undefined,
    };

    // 为工作流任务更新额外的状态
    let updatedWorkflowRunning = chatState.workflowRunning;
    
    if (isWorkflow) {
      updatedWorkflowRunning = {
        isRunning: false,
        isSuccess: true
      };
    }

    // 更新状态
    set(chatAtom, {
      ...chatState,
      messages: [...chatState.messages, receivedMessage],
      isGenerating: false,
      workflowRunning: updatedWorkflowRunning,
      workflowImageFile: null,
      latestGeneratedImage: latestGeneratedImage
    });
  }
)

// 发送消息的操作
export const sendMessage = atom(
  null,
  async (get, set, message: string) => {
    if (!message.trim()) return;

    const chatState = get(chatAtom);
    const betaMode = chatState.betaMode;
    const apiPrefix = betaMode ? '/beta-api' : '/chat-api';

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
      const lora_name = chatState.currentDetailModel?.model_tran?.[0]?.lora_name || undefined;

      // 获取当前模型的model_id
      const model_id = chatState.currentDetailModel?.model_id;

      // 获取当前模型的作者
      const model_creator = chatState.currentDetailModel?.user?.did;

      const model_status = chatState.modelStatus

      const model_name = chatState.currentDetailModel?.name;

      const model_cover = chatState.currentDetailModel?.cover;

      const model_description = chatState.currentDetailModel?.description;

      const agree = chatState.agree

      const wallet_address = chatState.wallet_address

      const current_task_type = chatState.task_type

      const current_task_status = chatState.current_status

      // 当前的工作流相关
      const workflow_id = chatState.currentDetailWorkflow?.workflow_id
      const workflow_provider = chatState.currentDetailWorkflow?.provider;
      const current_workflow_name = chatState.currentDetailWorkflow?.name
      const workflow_input_type = chatState.currentDetailWorkflow?.input_type
      const workflow_cover = chatState.currentDetailWorkflow?.cover;
      const workflow_description = chatState.currentDetailWorkflow?.description;
      const workflow_creator = chatState.currentDetailWorkflow?.user?.did;

      // 获取最新生成图片的状态信息
      const latestGenerated = chatState.latestGeneratedImage;

      // 构建完整的API URL
      const API_URL = `${apiPrefix}/chat`;

      const lora_weight = 0.75 + (chatState.loraWeight || 0) * 0.25

      // 构建请求体
      const requestBody: any = {
        authorization: chatState.agentToken,
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
        workflow_provider,
        workflow_name: current_workflow_name,
        workflow_input_type,
        workflow_cover,
        workflow_description,
        workflow_creator
      };

      // 新增：添加previous_sub_intent_status参数
      if (chatState.previous_sub_intent_status) {
        requestBody.previous_sub_intent_status = chatState.previous_sub_intent_status;
      }

      // 新增：modify image 相关参数
      if (latestGenerated.aicc_status === 'completed') {
        requestBody.aicc_status = latestGenerated.aicc_status;
        requestBody.provider = latestGenerated.provider;
        requestBody.model = latestGenerated.model;
        requestBody.source = latestGenerated.source;
        requestBody.source_id = latestGenerated.source_id;
        requestBody.reference = latestGenerated.reference;
        requestBody.aicc_width = latestGenerated.aicc_width;
        requestBody.aicc_height = latestGenerated.aicc_height;
        requestBody.aicc_prompt = latestGenerated.aicc_prompt;
        requestBody.aicc_type = latestGenerated.aicc_type; // 新增：传递内容类型
      }

      // 发送请求到API
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
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
      const content_id = responseData.content_id; // 新增：获取content_id
      const previous_sub_intent_status = responseData.previous_sub_intent_status;

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
          connection: newConnectionStatus,
          previous_sub_intent_status: previous_sub_intent_status // 新增：更新状态
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

      // 新增：处理NFT铸造确认
      if (task_type === 'mint_nft' && previous_sub_intent_status === 'mint_confirmed') {
        console.log('NFT mint confirmed, starting tokenization process');

        const latestGenerated = chatState.latestGeneratedImage;
        if (latestGenerated.content_id) {
          // 调用NFT铸造
          set(createTokenization, latestGenerated.content_id);
        } else {
          console.error('No content ID available for NFT minting');
          set(showToastAtom, {
            message: 'No content available for NFT minting',
            severity: 'error'
          });
        }
      }

      let isWorkflow = false;
      let isGenerating = false;
      let isVideo = false; // 新增：视频标识
      let messageType = 'text';

      if (status === 'upload_image') {
        messageType = 'upload_image';
      } else if (task_type === 'generation' && request_id) {
        messageType = 'generating_image';
        isGenerating = true;
      } else if (task_type === 'modify_image' && request_id) {
        messageType = 'generating_image';
        isGenerating = true;
        isWorkflow = true;
      } else if (task_type === 'animate_image' && request_id) {
        // 新增：处理图片动画化（生成视频）
        messageType = 'generating_video';
        isGenerating = true;
        isVideo = true;
        isWorkflow = true; // 动画化通常基于现有图片，类似工作流
      } else if (task_type === 'mint_nft' && previous_sub_intent_status === 'mint_confirmed') {
        messageType = 'minting_nft';
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

      if (status === "AICC_COLLECTING_DETAILS" && task_type === 'create_workflow') {
        messageType = 'create_workflow_details'; // 收集工作流信息
      }

      if (status === "AWAITING_WORKFLOW_INPUTS" && task_type === "use_workflow") {
        messageType = 'text'; // 不需要特殊的
      }

      const receivedMessage: Message = {
        role: 'assistant',
        content: content,
        type: messageType as 'text' | 'upload_image' | 'generating_image' | 'generate_result' | 'tokenization_agreement' | "create_workflow"
            | "run_workflow" | "workflow_generate_result" | "create_workflow_details" | "modify_image" | "uploaded_image"
            | "generating_video" | "video_generate_result",
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

      // 如果是执行工作流状态，则保存当前的工作流内容，防止被切换
      const workflowRunningState = latestState.workflowRunningState;
      if (status === "AWAITING_WORKFLOW_INPUTS" && task_type === "use_workflow") {
        // 更新 workflow
        workflowRunningState.workflow = latestState.currentDetailWorkflow
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
        workflow_description: workflow_goal || undefined,
        workflow_prompt: generated_prompt || undefined,
        workflowRunningState: workflowRunningState,
        previous_sub_intent_status: previous_sub_intent_status, // 新增：更新状态
      });

      // 如果 request_id 不为空，则代表创建生成图片/视频任务完成
      console.log('request_id:', request_id, 'content_id:', content_id, 'isVideo:', isVideo);
      if (request_id) {
        // 根据任务类型传递正确的参数
        const cu = isWorkflow ? (isVideo ? 900 : 35) : 5; // kling 900 : flux 35 : model: 5
        pollImageGenerationTask(request_id, content_id, cu, set, get, isWorkflow, isVideo).catch(err => {
          console.error('poll Image Generation Task Failed:', err);
        });
      }

      if (status === 'tokenization' && chatState.currentDetailModel?.model_id) {
        // 使用 fetchTokenizationState 重新加载Token状态
        console.log('reset model images，model id:', chatState.currentDetailModel.model_id);
        // set(fetchTokenizationState, { modelId: chatState.currentModel.id, model_tokenization_id: chatState.currentModel?.model_tokenization?.id || 0})
        // set(fetchModelDetail, chatState.currentModel.id , false)
      }
      if (status === 'tokenization' && chatState.currentDetailWorkflow?.workflow_id) {
        // 使用 fetchTokenizationState 重新加载Token状态
        console.log('reset workflow detailed，workflow id:', chatState.currentDetailWorkflow.workflow_id);
        // set(fetchTokenizationState, { workflow_id: chatState.currentDetailWorkflow.workflow_id, workflow_tokenization_id: chatState.currentDetailWorkflow?.workflow_tokenization?.id || 0})
        // set(fetchWorkflowDetail, chatState.currentDetailWorkflow.workflow_id , false)
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
    input.accept = 'image/jpeg,image/jpg,image/png,image/webp'; // 限制文件格式
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

      // 验证文件格式和大小
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      const maxFileSize = 4 * 1024 * 1024; // 4MB
      const invalidFiles: string[] = [];
      const oversizedFiles: string[] = [];

      // 过滤出有效的文件
      filesToUpload = filesToUpload.filter(file => {
        if (!allowedTypes.includes(file.type)) {
          invalidFiles.push(file.name);
          return false;
        }
        if (file.size > maxFileSize) {
          oversizedFiles.push(file.name);
          return false;
        }
        return true;
      });

      // 显示验证错误信息
      if (invalidFiles.length > 0) {
        set(showToastAtom, {
          message: `Unsupported format: ${invalidFiles.join(', ')}. Only JPG, JPEG, PNG, and WebP are allowed`,
          severity: 'error'
        });
      }

      if (oversizedFiles.length > 0) {
        set(showToastAtom, {
          message: `Files too large: ${oversizedFiles.join(', ')}. Maximum size is 4MB`,
          severity: 'error'
        });
      }

      // 如果没有有效文件，直接返回
      if (filesToUpload.length === 0) {
        target.value = '';
        return;
      }

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
      previous_sub_intent_status: undefined, // 新增：清空状态
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
      },
      workflow_extra_prompt: "", // 清空附加信息
      workflowRunningState: {
        workflow: null,
        width: null,
        height: null,
        prompt: null,
      },
      // 清空最新生成图片状态
      latestGeneratedImage: {
        aicc_status: undefined,
        provider: undefined,
        model: undefined,
        source: undefined,
        source_id: undefined,
        reference: undefined,
        aicc_width: undefined,
        aicc_height: undefined,
        aicc_prompt: undefined,
        aicc_type: undefined, // 新增：清空类型
        content_id: undefined,
      },
      // 新增：AI服务提供商初始状态
      aiProviders: {
        providers: [],
        isLoading: false,
        error: null,
        selectedProvider: '',
        selectedModel: ''
      },
    });
  }
);

// 心跳相关常量
const HEARTBEAT_INTERVAL = 15000; // 15秒发送一次心跳

// 修改心跳检测API函数
export async function sendHeartbeat(userUuid: string, betaMode: boolean, agentToken: string | null = null): Promise<ConnectionStatus> {
  const apiPrefix = betaMode ? '/beta-api' : '/chat-api';

  try {
    const response = await fetch(`${apiPrefix}/heartbeat`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
        'X-User-Id': userUuid,
        'Agent-Authorization': agentToken || ''
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
        const newConnectionStatus = await sendHeartbeat(currentState.userUuid, currentState.betaMode, currentState.agentToken);

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
  const apiPrefix = betaMode ? '/beta-api' : '/chat-api';

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

// 添加设置宽高比的操作
export const setWorkflowAspectRatio = atom(
  null,
  (get, set, aspectRatio: AspectRatio) => {
    const chatState = get(chatAtom);

    set(chatAtom, {
      ...chatState,
      selectedWorkflowAspectRatio: aspectRatio
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

// 工作流值类型枚举 - 添加 VIDEO 类型
export enum WORKFLOW_VALUE_TYPE {
  IMAGE = 'image',
  TEXT = 'text',
  VIDEO = 'video', // 新增 VIDEO 类型
}

// 工作流提供商枚举 - 修改为正确的值
export enum WORKFLOW_PROVIDER {
  GPT_4o = 'gpt-4o',
}

// GPT模型枚举 - 修改为正确的值
export enum WORKFLOW_GPT_MODEL {
  GPT_IMAGE_1 = 'gpt-image-1',
  GPT_IMAGE_1_VIP = 'gpt-image-1-vip',
}

// 将输入类型字符串转换为API需要的枚举类型 - 添加 Video 类型处理
function mapInputOutputType(type: string): WORKFLOW_VALUE_TYPE[] {
  switch (type) {
    case 'Image':
      return [WORKFLOW_VALUE_TYPE.IMAGE];
    case 'Text':
      return [WORKFLOW_VALUE_TYPE.TEXT];
    case 'Image + Text':
      return [WORKFLOW_VALUE_TYPE.IMAGE, WORKFLOW_VALUE_TYPE.TEXT];
    case 'Video': // 新增 Video 类型处理
      return [WORKFLOW_VALUE_TYPE.VIDEO];
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
    const privyToken = await getAccessToken();
    const response = await fetch('/studio-api/workflow/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_BEARER_TOKEN}`,
        [PRIVY_TOKEN_HEADER]: privyToken || "",
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      if (response.status === 409) {
        throw new Error('Failed to create workflow. The name already exists.');
      } else {
        throw new Error(`Create workflow failed with status code ${response.status}`);
      }
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
      // 只有非kling模型时才添加参考图片
      const isKlingProvider = chatState.aiProviders.selectedProvider?.toLowerCase().includes('kling')
      // 准备API参数
      const reference_images = []
      if (!isKlingProvider && chatState.workflowReferenceImage.uploadedUrl) {
        reference_images.push(chatState.workflowReferenceImage.uploadedUrl);
      }

      const params: CreateWorkflowParams = {
        name: chatState.workflow_name || 'New Workflow',
        description: chatState.workflow_description || '',
        creator: chatState.did || '',
        prompt: chatState.workflow_prompt,
        input_type: mapInputOutputType(chatState.workflow_input),
        output_type: mapInputOutputType(chatState.workflow_output),
        provider: chatState.aiProviders.selectedProvider as WORKFLOW_PROVIDER,
        model: chatState.aiProviders.selectedModel as WORKFLOW_GPT_MODEL,
        reference_images: reference_images
      };

      // 调用API
      const response = await createWorkflowAPI(params);

      // 设置成功状态
      set(chatAtom, {
        ...get(chatAtom),
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

// 新增：更新附加提示词
export const updateWorkflowExtraPrompt = atom(
  null,
  (get, set, extraPrompt: string) => {
    const chatState = get(chatAtom);
    set(chatAtom, {
      ...chatState,
      workflow_extra_prompt: extraPrompt
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
    content_id?: number; // 新增：内容id
  };
}

// 运行工作流API函数
export async function runWorkflowAPI(params: RunWorkflowParams): Promise<AigcResponse> {
  try {
    const privyToken = await getAccessToken();
    const response = await fetch('/studio-api/workflow/aigc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_BEARER_TOKEN}`,
        [PRIVY_TOKEN_HEADER]: privyToken || "",
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
          const { uploadFileToS3 } = await import('./imagesStore.ts');

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

      // const workflowId = chatState.currentWorkflow?.id
      const workflowId = chatState.workflowRunningState.workflow?.workflow_id
      const workflowRatio = chatState.selectedWorkflowAspectRatio

      // 准备API参数，使用上传后的图片URL
      const params: RunWorkflowParams = {
        workflow_id: workflowId || 0,
        creator: chatState.did || '',
        image_value: imageValue || undefined,
        text_value: chatState.workflow_extra_prompt || undefined,
      };

      const workflowRunningState = chatState.workflowRunningState;

      if (workflowRatio !== undefined && workflowRatio.value !== 'auto') {
        params.width = workflowRatio.width
        params.height = workflowRatio.height
        workflowRunningState.width = workflowRatio.width
        workflowRunningState.height = workflowRatio.height
      } else {
        workflowRunningState.width = null
        workflowRunningState.height = null
      }

      // 调用API
      const response = await runWorkflowAPI(params);

      // 如果有生成的任务ID，启动轮询
      if (response.data.task_id) {
        workflowRunningState.prompt = (chatState.workflow_extra_prompt || "") + (workflowRunningState.workflow?.prompt || "")
        set(chatAtom, {
          ...get(chatAtom),
          workflowRunningState: workflowRunningState
        });

        let contentId = response.data.content_id;
        const imageId = response.data.image_id;
        if (contentId === undefined && imageId !== undefined) {
          contentId = imageId
        }

        pollImageGenerationTask(response.data.task_id, contentId || 0, 100, set, get, true).catch(err => {
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

// 添加上传单张 Reference Image 的操作
export const uploadWorkflowReferenceImage = atom(
  null,
  async (get, set) => {
    // 创建一个文件选择对话框
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/jpg,image/png,image/webp'; // 限制文件格式
    input.multiple = false; // 只允许选择一张图片

    input.onchange = async (event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];

      if (!file) {
        target.value = '';
        return;
      }

      // 验证文件格式
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        // 显示错误通知
        const { showToastAtom } = await import('./imagesStore.ts');
        set(showToastAtom, {
          message: 'Only JPG, JPEG, PNG, and WebP formats are allowed',
          severity: 'error'
        });
        target.value = '';
        return;
      }

      // 验证文件大小 (4MB = 4 * 1024 * 1024 bytes)
      const maxSize = 4 * 1024 * 1024; // 4MB
      if (file.size > maxSize) {
        // 显示错误通知
        const { showToastAtom } = await import('./imagesStore.ts');
        set(showToastAtom, {
          message: 'File size must be less than 4MB',
          severity: 'error'
        });
        target.value = '';
        return;
      }

      const chatState = get(chatAtom);

      try {
        // 设置上传状态
        set(chatAtom, {
          ...chatState,
          workflowReferenceImage: {
            isUploading: true,
            uploadedUrl: "",
            fileName: file.name,
            error: undefined
          }
        });

        // 导入上传函数
        const { uploadFileToS3 } = await import('./imagesStore.ts');

        // 上传图片到S3
        const uploadedUrl = await uploadFileToS3(file);

        // 上传成功，更新状态
        const updatedChatState = get(chatAtom);
        set(chatAtom, {
          ...updatedChatState,
          workflowReferenceImage: {
            isUploading: false,
            uploadedUrl: uploadedUrl,
            fileName: file.name,
            error: undefined
          }
        });

        // 显示成功通知
        const { showToastAtom } = await import('./imagesStore.ts');
        set(showToastAtom, {
          message: 'Reference image uploaded successfully',
          severity: 'success'
        });

      } catch (error) {
        console.error('Error uploading reference image:', error);

        // 上传失败，更新错误状态
        const errorChatState = get(chatAtom);
        set(chatAtom, {
          ...errorChatState,
          workflowReferenceImage: {
            isUploading: false,
            uploadedUrl: "",
            fileName: "",
            error: error instanceof Error ? error.message : 'Upload failed'
          }
        });

        // 显示错误通知
        const { showToastAtom } = await import('./imagesStore.ts');
        set(showToastAtom, {
          message: 'Failed to upload reference image',
          severity: 'error'
        });
      }
    };

    input.click();
  }
);

// 删除 Reference Image 的操作
export const removeWorkflowReferenceImage = atom(
  null,
  (get, set) => {
    const chatState = get(chatAtom);

    set(chatAtom, {
      ...chatState,
      workflowReferenceImage: {
        isUploading: false,
        uploadedUrl: "",
        fileName: "",
        error: undefined
      }
    });
  }
);

// 修改 runWorkflowFromChatInput 函数，根据工作流输出类型设置正确的消息
export const runWorkflowFromChatInput = atom(
  null,
  async (get, set, params: { textInput?: string }) => {
    const chatState = get(chatAtom);
    const { textInput } = params;

    // 设置执行中状态
    set(chatAtom, {
      ...chatState,
      workflowRunning: {
        isRunning: true,
        isSuccess: false,
        error: undefined
      },
      isGenerating: true
    });

    try {
      // 使用已上传的参考图片
      const imageValue = chatState.workflowReferenceImage.uploadedUrl;
      if (!imageValue) {
        throw new Error('No reference image uploaded');
      }

      // 检查当前工作流的输出类型
      const currentWorkflow = chatState.currentDetailWorkflow;
      const isVideoOutput = currentWorkflow?.output_type?.includes('video') || false;
      const cu = isVideoOutput ? 900 : 50; // GPT 50, Kling 900

      // 添加消息到聊天记录
      const messages = [...filterSystemMessages(chatState.messages)];

      // 添加图片消息 - 使用新的消息类型显示实际图片
      const imageMessage: Message = {
        role: 'user',
        content: '', // 不需要文本内容
        type: 'uploaded_image',
        images: [imageValue] // 显示实际图片
      };
      messages.push(imageMessage);

      // 如果有文本输入，添加文本消息
      if (textInput?.trim()) {
        const textMessage: Message = {
          role: 'user',
          content: textInput.trim(),
          type: 'text'
        };
        messages.push(textMessage);
      }

      // 根据输出类型添加不同的执行中消息
      const runningMessage: Message = {
        role: 'assistant',
        content: 'Got it! Starting the workflow now.',
        type: isVideoOutput ? 'generating_video' : 'modify_image', // 根据输出类型选择消息类型
        request_id: `workflow_${Date.now()}`
      };
      messages.push(runningMessage);

      const workflowRatio = chatState.selectedWorkflowAspectRatio;

      // 准备API参数，类型为 WorkflowGenerateRequest
      const apiParams: WorkflowGenerateRequest = {
        user: chatState.did || '',
        workflow_id: chatState.currentDetailWorkflow?.workflow_id || 0,
        text_value: textInput?.trim() || undefined,
        image_value: imageValue,
        n: 1,
      };

      const workflowRunningState = { ...chatState.workflowRunningState };
      workflowRunningState.workflow = chatState.currentDetailWorkflow;

      if (workflowRatio !== undefined && workflowRatio.value !== 'auto') {
        apiParams.width = workflowRatio.width;
        apiParams.height = workflowRatio.height;
        workflowRunningState.width = workflowRatio.width;
        workflowRunningState.height = workflowRatio.height;
      } else {
        workflowRunningState.width = null;
        workflowRunningState.height = null;
      }

      // 更新消息历史并清空 workflowReferenceImage 状态
      set(chatAtom, {
        ...get(chatAtom),
        messages: messages,
        workflowReferenceImage: {
          isUploading: false,
          uploadedUrl: "",
          fileName: "",
          error: undefined
        }
      });

      // 调用API
      const response = await workflowsApi.generateContent(apiParams);

      // 如果有生成的任务ID，启动轮询
      if (response.task_id) {
        workflowRunningState.prompt = (textInput?.trim() || "") + (workflowRunningState.workflow?.prompt || "");

        set(chatAtom, {
          ...get(chatAtom),
          workflowRunningState: workflowRunningState
        });

        // 更新最后一条消息的request_id
        const updatedMessages = get(chatAtom).messages.map((msg, index, arr) => {
          if (index === arr.length - 1 && (msg.type === 'modify_image' || msg.type === 'generating_video')) {
            return { ...msg, request_id: response.task_id };
          }
          return msg;
        });

        set(chatAtom, {
          ...get(chatAtom),
          messages: updatedMessages
        });

        let contentId = response.content_id;
        // 兼容 image_id 字段
        // @ts-ignore
        const imageId = response.image_id;
        if (contentId === undefined && imageId !== undefined) {
          contentId = imageId;
        }

        // 根据输出类型启动不同的轮询
        pollImageGenerationTask(response.task_id, contentId || 0, cu, set, get, true, isVideoOutput).catch(err => {
          console.error('Poll Generation Task Failed:', err);
        });
      } else {
        set(chatAtom, {
          ...get(chatAtom),
          workflowRunning: {
            isRunning: false,
            isSuccess: true
          },
          isGenerating: false
        });
      }

    } catch (error) {
      console.error('Run workflow from chat input failed:', error);

      // 设置错误状态
      set(chatAtom, {
        ...get(chatAtom),
        workflowRunning: {
          isRunning: false,
          isSuccess: false,
          error: error instanceof Error ? error.message : 'Failed to run workflow'
        },
        isGenerating: false
      });

      // 显示错误提示
      set(showToastAtom, {
        message: error instanceof Error ? error.message : 'Failed to run workflow',
        severity: 'error'
      });
    }
  }
);

// 添加清除最新生成图片状态的操作
export const clearLatestGeneratedImage = atom(
  null,
  (get, set) => {
    const chatState = get(chatAtom);
    set(chatAtom, {
      ...chatState,
      latestGeneratedImage: {
        aicc_status: undefined,
        provider: undefined,
        model: undefined,
        source: undefined,
        source_id: undefined,
        reference: undefined,
        aicc_width: undefined,
        aicc_height: undefined,
        aicc_prompt: undefined,
        aicc_type: undefined, // 新增：清空类型
        content_id: undefined,
      }
    });
  }
);

// 新增：AI服务提供商和模型接口
export interface AIModel {
  name: string;
  support_input_types: string[];
  support_output_types: string[];
}

export interface AIProvider {
  name: string;
  models: AIModel[];
}

export interface AIProvidersResponse {
  message: string;
  data: AIProvider[];
}

// 新增：AI服务提供商状态
export interface AIProvidersState {
  providers: AIProvider[];
  isLoading: boolean;
  error: string | null;
  selectedProvider: string;
  selectedModel: string;
}

// 新增：获取AI服务提供商API函数
export async function fetchAIProvidersAPI(): Promise<AIProvidersResponse> {
  try {
    const privyToken = await getAccessToken();
    const response = await fetch('/studio-api/dashboard/provider/ai', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_BEARER_TOKEN}`,
        [PRIVY_TOKEN_HEADER]: privyToken || "",
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch AI providers with status code ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Fetch AI Providers Failed:', error);
    throw error;
  }
}

// 新增：获取AI服务提供商操作
export const fetchAIProviders = atom(
  null,
  async (get, set) => {
    const chatState = get(chatAtom);

    // 设置加载状态
    set(chatAtom, {
      ...chatState,
      aiProviders: {
        ...chatState.aiProviders,
        isLoading: true,
        error: null
      }
    });

    try {
      const response = await fetchAIProvidersAPI();

      // 设置默认选择的提供商和模型
      let selectedProvider = '';
      let selectedModel = '';

      if (response.data.length > 0) {
        selectedProvider = response.data[0].name;
        if (response.data[0].models.length > 0) {
          selectedModel = response.data[0].models[0].name;
        }
      }

      // 更新状态
      set(chatAtom, {
        ...get(chatAtom),
        aiProviders: {
          providers: response.data,
          isLoading: false,
          error: null,
          selectedProvider,
          selectedModel
        },
        workflow_model: selectedModel // 同时更新工作流模型
      });

    } catch (error) {
      // 设置错误状态
      set(chatAtom, {
        ...get(chatAtom),
        aiProviders: {
          ...chatState.aiProviders,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch AI providers'
        }
      });
    }
  }
);

// 新增：更新选择的提供商
export const updateSelectedProvider = atom(
  null,
  (get, set, providerName: string) => {
    const chatState = get(chatAtom);
    const provider = chatState.aiProviders.providers.find(p => p.name === providerName);

    // 选择该提供商的第一个模型作为默认模型
    const selectedModel = provider?.models[0]?.name || '';

    // 获取第一个模型的支持类型
    const firstModel = provider?.models[0];
    const supportedInputTypes = firstModel?.support_input_types || [];
    const supportedOutputTypes = firstModel?.support_output_types || [];

    // 自动选择第一个支持的输入类型
    let defaultInputType = '';
    const inputTypeOrder = ['image', 'text', 'image,text'];
    for (const type of inputTypeOrder) {
      if (supportedInputTypes.includes(type)) {
        switch (type) {
          case 'image':
            defaultInputType = 'Image';
            break;
          case 'text':
            defaultInputType = 'Text';
            break;
          case 'image,text':
            defaultInputType = 'Image + Text';
            break;
        }
        break;
      }
    }

    // 自动选择第一个支持的输出类型
    let defaultOutputType = '';
    const outputTypeOrder = ['image', 'text', 'video'];
    for (const type of outputTypeOrder) {
      if (supportedOutputTypes.includes(type)) {
        switch (type) {
          case 'image':
            defaultOutputType = 'Image';
            break;
          case 'text':
            defaultOutputType = 'Text';
            break;
          case 'video':
            defaultOutputType = 'Video';
            break;
        }
        break;
      }
    }

    set(chatAtom, {
      ...chatState,
      aiProviders: {
        ...chatState.aiProviders,
        selectedProvider: providerName,
        selectedModel
      },
      workflow_model: selectedModel,
      workflow_input: defaultInputType,
      workflow_output: defaultOutputType
    });
  }
);

// 新增：更新选择的模型
export const updateSelectedModel = atom(
  null,
  (get, set, modelName: string) => {
    const chatState = get(chatAtom);

    set(chatAtom, {
      ...chatState,
      aiProviders: {
        ...chatState.aiProviders,
        selectedModel: modelName
      },
      workflow_model: modelName
    });
  }
);

// 新增：根据选择的模型获取支持的输入输出类型
export const getSupportedTypes = (providers: AIProvider[], providerName: string, modelName: string) => {
  const provider = providers.find(p => p.name === providerName);
  const model = provider?.models.find(m => m.name === modelName);

  return {
    inputTypes: model?.support_input_types || [],
    outputTypes: model?.support_output_types || []
  };
};

// 新增：将API返回的类型转换为显示用的标签
export const formatTypeLabel = (type: string): string => {
  switch (type) {
    case 'image':
      return 'Image';
    case 'text':
      return 'Text';
    case 'image,text':
      return 'Image + Text';
    case 'video':
      return 'Video';
    default:
      return type;
  }
};

// 新增：NFT铸造API函数
export async function createTokenizationAPI(params: TokenizationParams): Promise<TokenizationResponse> {
  try {
    const privyToken = await getAccessToken();
    const response = await fetch('/studio-api/aigc/tokenization', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_BEARER_TOKEN}`,
        [PRIVY_TOKEN_HEADER]: privyToken || "",
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      throw new Error(`Create tokenization failed with status code ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Create Tokenization Failed:', error);
    throw error;
  }
}

// 新增：查询NFT铸造状态API
export async function checkTokenizationStatus(content_id: number, refreshState: boolean = true): Promise<TokenizationStateResponse> {
  try {
    const params = new URLSearchParams({
      content_id: content_id.toString(),
      refreshState: refreshState.toString()
    });

    const response = await fetch(`/studio-api/aigc/tokenization/state?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_BEARER_TOKEN}`,
      }
    });

    if (!response.ok) {
      throw new Error(`Check tokenization status failed with status code ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Check Tokenization Status Failed:', error);
    throw error;
  }
}

// 新增：NFT铸造轮询函数
export async function pollTokenizationTask(contentId: number, set: any, get: any): Promise<void> {
  console.log('Start poll tokenization task:', contentId);

  const MAX_POLL_COUNT = 60; // 最大轮询次数
  const POLL_INTERVAL = 5000; // 5秒轮询间隔

  for (let pollCount = 0; pollCount < MAX_POLL_COUNT; pollCount++) {
    try {
      console.log(`Tokenization task ${contentId} the ${pollCount + 1} times`);

      // 等待一段时间再查询
      if (pollCount > 0) {
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
      }

      // 查询任务状态
      const statusResponse = await checkTokenizationStatus(contentId);
      console.log('Tokenization status:', statusResponse);

      // 获取当前状态
      const chatState = get(chatAtom);

      // 如果没有状态信息，继续轮询
      if (!statusResponse?.data?.status) {
        console.log('Tokenization status is null, keep polling');
        continue;
      }

      const status = statusResponse.data.status.toLowerCase();
      console.log('Tokenization task status:', status);

      // 处理不同状态
      if (status === 'completed') {
        console.log('Tokenization completed:', status);

        // 新增：查找并更新minting_nft消息
        // @ts-ignore
        const messageIndex = chatState.messages.findIndex(msg => msg.type === 'minting_nft');

        if (messageIndex !== -1) {
          console.log('Found minting message, updating to success');
          const updatedMessages = [...chatState.messages];
          const tokenId = statusResponse.data.token_id;

          updatedMessages[messageIndex] = {
            ...updatedMessages[messageIndex],
            content: 'NFT minted successfully!',
            type: 'minting_success', // 使用新的消息类型
            token_id: tokenId // 传递token ID
          };

          // 更新消息列表
          set(chatAtom, {
            ...chatState,
            messages: updatedMessages
          });
        }

        // 显示成功通知
        set(showToastAtom, {
          message: `NFT minted successfully! Token ID: ${statusResponse.data.token_id}`,
          severity: 'success'
        });

        console.log('Tokenization finished, exit');
        return;
      } else if (status === 'failed') {
        console.log('Tokenization failed');

        // 新增：查找并更新minting_nft消息
        // @ts-ignore
        const messageIndex = chatState.messages.findIndex(msg => msg.type === 'minting_nft');

        if (messageIndex !== -1) {
          console.log('Found minting message, updating to failed');
          const updatedMessages = [...chatState.messages];
          updatedMessages[messageIndex] = {
            ...updatedMessages[messageIndex],
            content: `NFT minting failed: ${statusResponse.data.error || 'Unknown error'}`,
            type: 'text' // 改为普通文本消息
          };

          // 更新消息列表
          set(chatAtom, {
            ...chatState,
            messages: updatedMessages
          });
        }

        // 显示失败通知
        set(showToastAtom, {
          message: `NFT minting failed: ${statusResponse.data.error || 'Unknown error'}`,
          severity: 'error'
        });

        console.log('Tokenization failed, exit');
        return;
      }

      // 如果是其他状态（处理中），继续轮询
      console.log('Tokenization in progress, keep polling');

    } catch (error) {
      console.error('Tokenization polling failed:', error);

      // 发生错误时，增加轮询间隔时间，但继续轮询
      const waitTime = Math.min(30000, POLL_INTERVAL * Math.min(5, Math.floor(pollCount / 5) + 1));
      console.log(`Tokenization polling failed, waiting ${waitTime}ms to continue`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  // 达到最大轮询次数，添加超时消息
  console.log('Tokenization polling timeout');
  const finalChatState = get(chatAtom);

  set(chatAtom, {
    ...finalChatState,
    messages: [...filterSystemMessages(finalChatState.messages), {
      role: 'system',
      content: 'NFT minting timed out, please check again later or try again',
      type: 'tokenization_timeout', // 新增：使用超时类型
      retryParams: { // 新增：保存重试参数
        contentId
      }
    }],
  });

  set(showToastAtom, {
    message: 'NFT minting timed out, please check again later',
    severity: 'warning'
  });
}

// 新增：创建NFT铸造操作
export const createTokenization = atom(
  null,
  async (get, set, contentId: number) => {
    const chatState = get(chatAtom);

    if (!chatState.did) {
      set(showToastAtom, {
        message: 'Please connect your wallet first',
        severity: 'error'
      });
      return;
    }

    try {
      // 准备API参数
      const params: TokenizationParams = {
        user: chatState.did,
        content_id: contentId
      };

      console.log('Starting NFT tokenization for content ID:', contentId);

      // 调用API
      await createTokenizationAPI(params);

      // 显示开始铸造提示
      set(showToastAtom, {
        message: 'NFT minting started...',
        severity: 'info'
      });

      // 启动轮询
      pollTokenizationTask(contentId, set, get).catch(err => {
        console.error('Poll Tokenization Task Failed:', err);
      });

    } catch (error) {
      console.error('Create tokenization failed:', error);
      // 显示错误提示
      set(showToastAtom, {
        message: error instanceof Error ? error.message : 'Failed to start NFT minting',
        severity: 'error'
      });
    }
  }
);

// 新增：重试轮询操作
export const retryPolling = atom(
  null,
  async (get, set, messageIndex: number) => {
    const chatState = get(chatAtom);
    const message = chatState.messages[messageIndex];

    if (!message || (!message.retryParams && message.type !== 'tokenization_timeout')) {
      return;
    }

    // 移除超时消息
    const updatedMessages = chatState.messages.filter((_, index) => index !== messageIndex);

    if (message.type === 'generation_timeout' && message.retryParams) {
      const { taskId, contentId, cu, isWorkflow, isVideo } = message.retryParams;

      // 重新添加生成中消息
      const generatingMessage = {
        role: 'assistant' as const,
        content: isVideo ? 'Generating video, please wait...' : 'Generating image, please wait...',
        type: isVideo ? 'generating_video' as const : (isWorkflow ? 'modify_image' as const : 'generating_image' as const),
        request_id: taskId
      };

      set(chatAtom, {
        ...chatState,
        messages: [...updatedMessages, generatingMessage],
        isGenerating: true
      });

      // 重新启动轮询
      pollImageGenerationTask(taskId, contentId, cu, set, get, isWorkflow, isVideo).catch(err => {
        console.error('Retry Poll Image Generation Task Failed:', err);
      });

    } else if (message.type === 'tokenization_timeout' && message.retryParams) {
      const { contentId } = message.retryParams;

      // 重新添加铸造中消息
      const mintingMessage = {
        role: 'assistant' as const,
        content: 'Minting NFT, please wait...',
        type: 'minting_nft' as const
      };

      set(chatAtom, {
        ...chatState,
        messages: [...updatedMessages, mintingMessage]
      });

      // 重新启动轮询
      pollTokenizationTask(contentId, set, get).catch(err => {
        console.error('Retry Poll Tokenization Task Failed:', err);
      });
    }
  }
);

// 添加设置agentToken的atom
export const setAgentTokenAtom = atom(
  null,
  (_, set, token: string | null) => {
    set(chatAtom, prev => ({...prev, agentToken: token}));
  }
);

// 新增：设置延迟发送消息的 atom
export const setPendingMessageAtom = atom(
  null,
  (get, set, message: string | null) => {
    const chatState = get(chatAtom);
    set(chatAtom, {
      ...chatState,
      pendingMessage: message
    });
  }
);