import { apiService } from './base'
import { API_ENDPOINTS } from './config'
import type {
  TagConfigDto,
  UploadFileResponse,
  HealthResponse,
  FeaturedItem,
  UpdateFeaturedRequest,
  AiProviderDto,
  UserShowDto,
  PointsRewardListItemDto,
  BindReferralCodeRequest,
  ReferralQueryParams
} from './types'

/**
 * 标签管理API服务
 */
export class TagsApiService {
  /**
   * 获取所有标签列表
   * @returns 标签名称数组
   */
  async getAllTags(): Promise<string[]> {
    return apiService.get<string[]>(
      API_ENDPOINTS.TAGS.LIST,
      undefined,
      { requiresAuth: true }
    )
  }

  /**
   * 获取特定标签配置
   * @param tagName 标签名称
   * @param refresh 是否刷新缓存
   * @returns 标签配置
   */
  async getTagConfig(tagName: string, refresh?: boolean): Promise<TagConfigDto> {
    return apiService.get<TagConfigDto>(
      API_ENDPOINTS.TAGS.GET_CONFIG(tagName),
      { refresh },
      { requiresAuth: true }
    )
  }

  /**
   * 更新特定标签配置
   * @param tagName 标签名称
   * @param config 标签配置
   * @returns 更新成功返回true
   */
  async updateTagConfig(tagName: string, config: TagConfigDto): Promise<boolean> {
    return apiService.put<boolean>(
      API_ENDPOINTS.TAGS.UPDATE_CONFIG(tagName),
      config,
      {
        requiresAuth: true,
        requiresAgentToken: true,
      }
    )
  }
}

/**
 * 文件上传API服务
 */
export class FilesApiService {
  /**
   * 上传文件
   * @param formData 文件表单数据
   * @returns 上传响应
   */
  async uploadFiles(formData: FormData): Promise<UploadFileResponse[]> {
    return apiService.upload<UploadFileResponse[]>(
      API_ENDPOINTS.FILES.UPLOAD,
      formData,
      { requiresAuth: true }
    )
  }
}

/**
 * 健康检查API服务
 */
export class HealthApiService {
  /**
   * 系统健康检查
   * @returns 健康检查响应
   */
  async checkHealth(): Promise<HealthResponse> {
    return apiService.get<HealthResponse>(
      API_ENDPOINTS.HEALTH.CHECK,
      undefined,
      { requiresAuth: true }
    )
  }
}

/**
 * 仪表盘API服务
 */
export class DashboardApiService {
  /**
   * 获取精选列表
   * @param refresh 是否刷新缓存
   * @returns 精选项目列表
   */
  async getFeaturedList(refresh?: boolean): Promise<FeaturedItem[]> {
    return apiService.get<FeaturedItem[]>(
      API_ENDPOINTS.DASHBOARD.FEATURED,
      { refresh },
      { requiresAuth: true }
    )
  }

  /**
   * 更新精选列表
   * @param request 更新请求参数
   * @returns 更新成功返回true
   */
  async updateFeaturedList(request: UpdateFeaturedRequest): Promise<boolean> {
    return apiService.put<boolean>(
      API_ENDPOINTS.DASHBOARD.FEATURED,
      request,
      {
        requiresAuth: true,
        requiresAgentToken: true,
      }
    )
  }

  /**
   * 获取精选工作流列表（无需认证）
   * @param refresh 是否刷新缓存
   * @returns 精选工作流列表
   */
  async getFeaturedWorkflows(refresh?: boolean): Promise<FeaturedItem[]> {
    return apiService.get<FeaturedItem[]>(
      API_ENDPOINTS.DASHBOARD.FEATURED_WORKFLOWS,
      { refresh }
    )
  }

  /**
   * 获取精选模型列表（无需认证）
   * @param refresh 是否刷新缓存
   * @returns 精选模型列表
   */
  async getFeaturedModels(refresh?: boolean): Promise<FeaturedItem[]> {
    return apiService.get<FeaturedItem[]>(
      API_ENDPOINTS.DASHBOARD.FEATURED_MODELS,
      { refresh }
    )
  }

  /**
   * 获取AI提供商列表
   * @returns AI提供商列表
   */
  async getAiProviders(): Promise<AiProviderDto[]> {
    return apiService.get<AiProviderDto[]>(
      API_ENDPOINTS.DASHBOARD.AI_PROVIDERS,
      undefined,
      { requiresAuth: false }
    )
  }
}

/**
 * 推荐系统API服务
 */
export class ReferralsApiService {
  /**
   * 获取邀请列表
   * @param inviteCode 邀请码
   * @param params 查询参数
   * @returns 被邀请用户列表
   */
  async getInvitesList(inviteCode: string, params?: ReferralQueryParams): Promise<UserShowDto[]> {
    return apiService.get<UserShowDto[]>(
      API_ENDPOINTS.REFERRALS.GET_INVITES(inviteCode),
      params,
      { requiresAuth: true }
    )
  }

  /**
   * 获取邀请奖励列表
   * @param inviteCode 邀请码
   * @param params 查询参数
   * @returns 积分奖励历史记录
   */
  async getRewardsList(inviteCode: string, params?: ReferralQueryParams): Promise<PointsRewardListItemDto[]> {
    return apiService.get<PointsRewardListItemDto[]>(
      API_ENDPOINTS.REFERRALS.GET_REWARDS(inviteCode),
      params,
      { requiresAuth: true }
    )
  }

  /**
   * 绑定推荐码
   * @param referralCode 推荐码
   * @param request 绑定请求参数
   * @returns 绑定成功返回true
   */
  async bindReferralCode(referralCode: string, request?: BindReferralCodeRequest): Promise<boolean> {
    return apiService.post<boolean>(
      API_ENDPOINTS.REFERRALS.BIND_CODE(referralCode),
      request,
      { requiresAuth: true }
    )
  }
}

// 导出单例实例
export const tagsApi = new TagsApiService()
export const filesApi = new FilesApiService()
export const healthApi = new HealthApiService()
export const dashboardApi = new DashboardApiService()
export const referralsApi = new ReferralsApiService() 