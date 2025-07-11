import { apiService } from './base'
import { API_ENDPOINTS } from './config'
import type {
  FetchEnableModelsResponse,
  FetchModelDto,
  ModelGenerateRequest,
  AigcProcesserResponse,
  RetryGenerateRequest,
  ModelQueryParams
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
}

// 导出单例实例
export const modelsApi = new ModelsApiService() 