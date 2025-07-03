import { apiService } from './base'
import { API_ENDPOINTS } from './config'
import type {
  ContentsListResponse,
  Content,
  RefreshAigcStateResponse,
  ToggleVisibilityRequest,
  UpdateFlagRequest,
  LikeRequest,
  FetchLikeContentResponse,
  FetchLikedContentsResponse,
  FetchUsageAuthorityRequest,
  FetchUsageAuthorityResponse,
  GenerateContentRequest,
  GenerateContentResponse,
  FetchGenerateContentStateRequest,
  FetchGenerateContentStateResponse,
  ContentQueryParams
} from './types'

/**
 * AIGC内容模块API服务
 */
export class ContentsApiService {
  /**
   * 获取内容列表
   * @param params 查询参数
   * @returns 内容列表响应
   */
  async getContentsList(params?: ContentQueryParams): Promise<ContentsListResponse> {
    const isAuthenticated = Boolean(params?.user)
    return apiService.get<ContentsListResponse>(
      API_ENDPOINTS.CONTENTS.LIST,
      params,
      { requiresAuth: isAuthenticated }
    )
  }

  /**
   * 根据ID获取内容
   * @param id 内容ID
   * @param refresh 是否刷新缓存
   * @returns 内容详情
   */
  async getContentById(id: number, refresh?: boolean): Promise<Content> {
    return apiService.get<Content>(
      API_ENDPOINTS.CONTENTS.GET_BY_ID(id),
      { refresh }
    )
  }

  /**
   * 刷新AI内容生成状态
   * @returns 刷新状态响应
   */
  async refreshAigcState(): Promise<RefreshAigcStateResponse> {
    return apiService.get<RefreshAigcStateResponse>(
      API_ENDPOINTS.CONTENTS.REFRESH
    )
  }

  /**
   * 切换内容可见性
   * @param id 内容ID
   * @param request 可见性请求参数
   * @returns 更新成功返回true
   */
  async toggleVisibility(id: number, request: ToggleVisibilityRequest): Promise<boolean> {
    return apiService.patch<boolean>(
      API_ENDPOINTS.CONTENTS.TOGGLE_VISIBILITY(id),
      request,
      { requiresAuth: true }
    )
  }

  /**
   * 更新内容标记
   * @param id 内容ID
   * @param request 标记请求参数
   * @returns 更新成功返回true
   */
  async updateFlag(id: number, request: UpdateFlagRequest): Promise<boolean> {
    return apiService.patch<boolean>(
      API_ENDPOINTS.CONTENTS.UPDATE_FLAG(id),
      request,
      { requiresAuth: true }
    )
  }

  /**
   * 点赞或取消点赞内容
   * @param id 内容ID
   * @param request 点赞请求参数
   * @returns 操作成功返回true
   */
  async likeContent(id: number, request: LikeRequest): Promise<boolean> {
    return apiService.post<boolean>(
      API_ENDPOINTS.CONTENTS.LIKE(id),
      request,
      { requiresAuth: true }
    )
  }

  /**
   * 获取内容点赞状态
   * @param id 内容ID
   * @param user 用户DID（代理使用）
   * @returns 点赞状态响应
   */
  async getLikeStatus(id: number, user?: string): Promise<FetchLikeContentResponse> {
    return apiService.get<FetchLikeContentResponse>(
      API_ENDPOINTS.CONTENTS.LIKE(id),
      { user },
      { requiresAuth: true }
    )
  }

  /**
   * 获取用户点赞的内容列表
   * @param params 查询参数
   * @returns 点赞内容列表响应
   */
  async getUserLikedContents(params?: {
    page?: number
    page_size?: number
    order?: string
    desc?: string
    user?: string
  }): Promise<FetchLikedContentsResponse> {
    return apiService.get<FetchLikedContentsResponse>(
      API_ENDPOINTS.CONTENTS.USER_LIKED,
      params,
      { requiresAuth: true }
    )
  }

  /**
   * 获取生成权限
   * @param request 权限查询参数
   * @returns 权限响应
   */
  async getGeneratePermission(request: FetchUsageAuthorityRequest): Promise<FetchUsageAuthorityResponse> {
    return apiService.get<FetchUsageAuthorityResponse>(
      API_ENDPOINTS.CONTENTS.GENERATE_PERMISSION,
      request,
      { requiresAuth: true }
    )
  }

  /**
   * 生成AI内容
   * @param request 生成请求参数
   * @returns 生成响应
   */
  async generateContent(request: GenerateContentRequest): Promise<GenerateContentResponse> {
    return apiService.post<GenerateContentResponse>(
      API_ENDPOINTS.CONTENTS.GENERATE,
      request,
      { requiresAuth: true }
    )
  }

  /**
   * 获取生成状态
   * @param request 状态查询参数
   * @returns 生成状态响应
   */
  async getGenerateState(request: FetchGenerateContentStateRequest): Promise<FetchGenerateContentStateResponse> {
    return apiService.get<FetchGenerateContentStateResponse>(
      API_ENDPOINTS.CONTENTS.GENERATE_STATE,
      request,
      { requiresAuth: true }
    )
  }
}

// 导出单例实例
export const contentsApi = new ContentsApiService() 