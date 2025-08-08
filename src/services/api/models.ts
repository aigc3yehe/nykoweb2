import { apiService } from './base'
import { API_ENDPOINTS } from './config'
import type {
  FetchEnableModelsResponse,
  FetchModelDto,
  ModelGenerateRequest,
  AigcProcesserResponse,
  RetryGenerateRequest,
  ModelQueryParams,
  ModelLikeRequest,
  FetchLikeModelResponse,
  CreateModelRequest,
  CreateModelResponse,
  TrainModelRequest,
  TrainModelResponse,
  FetchTrainStateResponse,
  RefreshTrainModelsStateResponse,
  UpdateModelRequest,
  UpdateModelCarouselRequest,
  UpdateModelCoverRequest,
  UpdateModelFlagRequest,
  UpdateModelVisibilityRequest,
  UpdateModelTagsRequest,
  FetchLikedModelsResponse
} from './types'

/**
 * 模型管理API服务
 */
export class ModelsApiService {
  /**
   * 获取模型列表
   * @param params 查询参数
   * @returns 模型列表响应
   */
  async getModelsList(params?: ModelQueryParams): Promise<FetchEnableModelsResponse> {
    return apiService.get<FetchEnableModelsResponse>(
      API_ENDPOINTS.MODELS.LIST,
      params,
      { requiresAuth: true }
    )
  }

  /** 获取用户点赞的模型列表 */
  async getUserLikedModels(params?: {
    page?: number
    page_size?: number
    order?: string
    desc?: string
    user?: string
  }): Promise<FetchLikedModelsResponse> {
    return apiService.get<FetchLikedModelsResponse>(
      API_ENDPOINTS.MODELS.USER_LIKED,
      params,
      { requiresAuth: true }
    )
  }

  /**
   * 根据ID获取模型详情
   * @param id 模型ID
   * @param refresh 是否刷新缓存
   * @returns 模型详情
   */
  async getModelById(id: number, refresh?: boolean): Promise<FetchModelDto> {
    return apiService.get<FetchModelDto>(
      API_ENDPOINTS.MODELS.GET_BY_ID(id),
      { refresh },
      { requiresAuth: false }
    )
  }

  /**
   * 使用模型生成内容
   * @param request 生成请求参数
   * @returns 生成响应
   */
  async generateContent(request: ModelGenerateRequest): Promise<AigcProcesserResponse> {
    return apiService.post<AigcProcesserResponse>(
      API_ENDPOINTS.MODELS.GENERATE,
      request,
      { requiresAuth: true }
    )
  }

  /**
   * 重试模型生成
   * @param request 重试请求参数
   * @returns 重试响应
   */
  async retryGenerate(request: RetryGenerateRequest): Promise<AigcProcesserResponse> {
    return apiService.post<AigcProcesserResponse>(
      API_ENDPOINTS.MODELS.RETRY,
      request,
      { requiresAuth: true }
    )
  }

  /**
   * 点赞或取消点赞模型
   * @param id 模型ID
   * @param data 点赞请求数据
   * @returns 操作结果
   */
  async likeModel(id: number, data: ModelLikeRequest): Promise<boolean> {
    return apiService.post<boolean>(
      `/models/${id}/like`,
      data,
      { requiresAuth: true }
    )
  }

  /**
   * 获取模型点赞状态
   * @param id 模型ID
   * @param params 查询参数
   * @returns 点赞状态
   */
  async getModelLikeStatus(id: number, params?: { user?: string }): Promise<FetchLikeModelResponse> {
    return apiService.get<FetchLikeModelResponse>(
      `/models/${id}/like`,
      params,
      { requiresAuth: true }
    )
  }

  /**
   * 创建模型
   * @param data 创建模型请求数据
   * @returns 创建结果
   */
  async createModel(data: CreateModelRequest): Promise<CreateModelResponse> {
    return apiService.post<CreateModelResponse>(
      '/model/create',
      data,
      { requiresAuth: true }
    )
  }

  /**
   * 手动训练模型
   * @param data 训练请求数据
   * @returns 训练结果
   */
  async trainModel(data: TrainModelRequest): Promise<TrainModelResponse> {
    return apiService.post<TrainModelResponse>(
      '/model/train',
      data,
      { requiresAuth: true }
    )
  }

  /**
   * 获取训练状态
   * @param taskId 任务ID
   * @returns 训练状态
   */
  async getTrainState(taskId: string): Promise<FetchTrainStateResponse> {
    return apiService.get<FetchTrainStateResponse>(
      '/model/train/state',
      { task_id: taskId },
      { requiresAuth: true }
    )
  }

  /**
   * 刷新所有模型训练状态
   * @returns 刷新结果
   */
  async refreshTrainModelsState(): Promise<RefreshTrainModelsStateResponse> {
    return apiService.get<RefreshTrainModelsStateResponse>(
      '/model/train/refresh',
      undefined,
      { requiresAuth: true }
    )
  }

  /**
   * 获取训练队列大小
   * @returns 队列大小
   */
  async getTrainQueueSize(): Promise<number> {
    return apiService.get<number>(
      '/model/train/queue-size',
      undefined,
      { requiresAuth: false }
    )
  }

  /**
   * 更新模型
   * @param id 模型ID
   * @param data 更新数据
   * @returns 更新结果
   */
  async updateModel(id: number, data: UpdateModelRequest): Promise<boolean> {
    return apiService.put<boolean>(
      `/models/${id}`,
      data,
      { requiresAuth: true }
    )
  }

  /**
   * 更新模型轮播图
   * @param id 模型ID
   * @param data 轮播图数据
   * @returns 更新后的轮播图
   */
  async updateModelCarousel(id: number, data: UpdateModelCarouselRequest): Promise<string[]> {
    return apiService.patch<string[]>(
      `/models/${id}/carousel`,
      data,
      { requiresAuth: true }
    )
  }

  /**
   * 更新模型封面
   * @param id 模型ID
   * @param data 封面数据
   * @returns 更新结果
   */
  async updateModelCover(id: number, data: UpdateModelCoverRequest): Promise<boolean> {
    return apiService.patch<boolean>(
      `/models/${id}/cover`,
      data,
      { requiresAuth: true }
    )
  }

  /**
   * 更新模型标记
   * @param id 模型ID
   * @param data 标记数据
   * @returns 更新结果
   */
  async updateModelFlag(id: number, data: UpdateModelFlagRequest): Promise<boolean> {
    return apiService.patch<boolean>(
      `/models/${id}/flag`,
      data,
      { requiresAuth: true }
    )
  }

  /**
   * 切换模型可见性
   * @param id 模型ID
   * @param data 可见性数据
   * @returns 更新结果
   */
  async updateModelVisibility(id: number, data: UpdateModelVisibilityRequest): Promise<boolean> {
    return apiService.patch<boolean>(
      `/models/${id}/visibility`,
      data,
      { requiresAuth: true }
    )
  }

  /**
   * 更新模型标签
   * @param id 模型ID
   * @param data 标签数据
   * @returns 更新结果
   */
  async updateModelTags(id: number, data: UpdateModelTagsRequest): Promise<boolean> {
    return apiService.patch<boolean>(
      `/models/${id}/tags`,
      data,
      { requiresAuth: true }
    )
  }
}

// 导出单例实例
export const modelsApi = new ModelsApiService()