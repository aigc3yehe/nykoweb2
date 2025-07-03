import { apiService } from './base'
import { API_ENDPOINTS } from './config'
import type {
  AICCItemDto,
  AICCContentDto,
  CreativityTopicDto,
  AICCQueryParams
} from './types'

/**
 * AICC (AI内容创作者策划) API服务
 */
export class AiccApiService {
  /**
   * 获取组合AICC内容
   * @param params 查询参数
   * @returns AICC项目列表
   */
  async getAiccList(params: AICCQueryParams): Promise<AICCItemDto[]> {
    return apiService.get<AICCItemDto[]>(
      API_ENDPOINTS.AICC.LIST,
      params,
      { requiresAuth: true }
    )
  }

  /**
   * 获取AICC模型
   * @param params 查询参数
   * @returns AICC模型列表
   */
  async getAiccModels(params: AICCQueryParams): Promise<AICCItemDto[]> {
    return apiService.get<AICCItemDto[]>(
      API_ENDPOINTS.AICC.MODELS,
      params,
      { requiresAuth: true }
    )
  }

  /**
   * 获取AICC工作流
   * @param params 查询参数
   * @returns AICC工作流列表
   */
  async getAiccWorkflows(params: AICCQueryParams): Promise<AICCItemDto[]> {
    return apiService.get<AICCItemDto[]>(
      API_ENDPOINTS.AICC.WORKFLOWS,
      params,
      { requiresAuth: true }
    )
  }

  /**
   * 获取AICC内容详情
   * @param params 查询参数
   * @returns AICC内容列表
   */
  async getAiccContents(params: AICCQueryParams): Promise<AICCContentDto[]> {
    return apiService.get<AICCContentDto[]>(
      API_ENDPOINTS.AICC.CONTENTS,
      params,
      { requiresAuth: true }
    )
  }

  /**
   * 获取创意主题
   * @param refresh 是否刷新缓存
   * @returns 创意主题列表
   */
  async getCreativityTopic(refresh?: boolean): Promise<CreativityTopicDto[]> {
    return apiService.get<CreativityTopicDto[]>(
      API_ENDPOINTS.AICC.CREATIVITY_TOPIC,
      { refresh },
      { requiresAuth: true }
    )
  }
}

// 导出单例实例
export const aiccApi = new AiccApiService() 