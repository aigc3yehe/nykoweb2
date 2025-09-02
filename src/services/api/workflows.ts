import { apiService } from './base'
import { API_ENDPOINTS } from './config'
import type {
  FetchWorkflowsResponse,
  WorkflowDto,
  CreateWorkflowRequest,
  CreateWorkflowResponse,
  UpdateWorkflowRequest,
  UpdateWorkflowVisibilityRequest,
  WorkflowGenerateRequest,
  AigcProcesserResponse,
  RetryGenerateRequest,
  WorkflowQueryParams,
  FetchLikedWorkflowsResponse,
  LikeWorkflowRequest,
  FetchLikeWorkflowResponse
} from './types'

/**
 * 工作流管理API服务
 */
export class WorkflowsApiService {
  /**
   * 获取工作流列表
   * @param params 查询参数
   * @returns 工作流列表响应
   */
  async getWorkflowsList(params?: WorkflowQueryParams): Promise<FetchWorkflowsResponse> {
    return apiService.get<FetchWorkflowsResponse>(
      API_ENDPOINTS.WORKFLOWS.LIST,
      params,
      { requiresAuth: true }
    )
  }

  /**
   * 根据ID获取工作流
   * @param id 工作流ID
   * @param refresh 是否刷新缓存
   * @returns 工作流详情
   */
  async getWorkflowById(id: number, refresh?: boolean): Promise<WorkflowDto> {
    return apiService.get<WorkflowDto>(
      API_ENDPOINTS.WORKFLOWS.GET_BY_ID(id),
      { refresh },
      { requiresAuth: true }
    )
  }

  /**
   * 创建工作流
   * @param request 创建请求参数
   * @returns 创建响应
   */
  async createWorkflow(request: CreateWorkflowRequest): Promise<CreateWorkflowResponse> {
    return apiService.post<CreateWorkflowResponse>(
      API_ENDPOINTS.WORKFLOWS.CREATE,
      request,
      { requiresAuth: true }
    )
  }

  /**
   * 使用工作流生成AI内容
   * @param request 生成请求参数
   * @returns 生成响应
   */
  async generateContent(request: WorkflowGenerateRequest): Promise<AigcProcesserResponse> {
    return apiService.post<AigcProcesserResponse>(
      API_ENDPOINTS.WORKFLOWS.GENERATE,
      request,
      { requiresAuth: true }
    )
  }

  /**
   * 重试工作流生成
   * @param request 重试请求参数
   * @returns 重试响应
   */
  async retryGenerate(request: RetryGenerateRequest): Promise<AigcProcesserResponse> {
    return apiService.post<AigcProcesserResponse>(
      API_ENDPOINTS.WORKFLOWS.RETRY,
      request,
      { requiresAuth: true }
    )
  }

  /**
   * 获取用户点赞的工作流
   */
  async getUserLikedWorkflows(params?: {
    page?: number
    page_size?: number
    order?: string
    desc?: string
    user?: string
  }): Promise<FetchLikedWorkflowsResponse> {
    return apiService.get<FetchLikedWorkflowsResponse>(
      API_ENDPOINTS.WORKFLOWS.USER_LIKED,
      params,
      { requiresAuth: true }
    )
  }

  /** 点赞/取消点赞工作流 */
  async likeWorkflow(id: number, request: LikeWorkflowRequest): Promise<boolean> {
    return apiService.post<boolean>(
      API_ENDPOINTS.WORKFLOWS.LIKE(id),
      request,
      { requiresAuth: true }
    )
  }

  /** 获取工作流点赞状态 */
  async getWorkflowLikeStatus(id: number, user?: string): Promise<FetchLikeWorkflowResponse> {
    return apiService.get<FetchLikeWorkflowResponse>(
      API_ENDPOINTS.WORKFLOWS.LIKE(id),
      { user },
      { requiresAuth: true }
    )
  }

  /**
   * 更新工作流
   * @param id 工作流ID
   * @param request 更新请求参数
   * @returns 更新是否成功
   */
  async updateWorkflow(id: number, request: UpdateWorkflowRequest): Promise<boolean> {
    return apiService.put<boolean>(
      API_ENDPOINTS.WORKFLOWS.UPDATE(id),
      request,
      { requiresAuth: true }
    )
  }

  /**
   * 切换工作流可见性
   * @param id 工作流ID
   * @param request 可见性请求参数
   * @returns 更新是否成功
   */
  async toggleWorkflowVisibility(id: number, request: UpdateWorkflowVisibilityRequest): Promise<boolean> {
    return apiService.patch<boolean>(
      API_ENDPOINTS.WORKFLOWS.TOGGLE_VISIBILITY(id),
      request,
      { requiresAuth: true }
    )
  }
}

// 导出单例实例
export const workflowsApi = new WorkflowsApiService() 