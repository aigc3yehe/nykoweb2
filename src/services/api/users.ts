import { apiService } from './base'
import { API_ENDPOINTS } from './config'
import type {
  UserBaseInfo,
  UpdateGeniRequest,
  UpdateRoleRequest,
  PlanState,
  GrantCURequest,
  FreezePlanRequest
} from './types'

/**
 * 用户模块API服务
 */
export class UsersApiService {
  /**
   * 获取用户信息
   * @param did 用户DID
   * @param refresh 是否刷新缓存
   * @returns 用户基础信息
   */
  async getUserInfo(did: string, refresh?: boolean): Promise<UserBaseInfo> {
    return apiService.get<UserBaseInfo>(
      API_ENDPOINTS.USERS.GET_USER(did),
      { refresh },
      { requiresAuth: true }
    )
  }

  /**
   * 更新用户GENI乘数
   * @param did 用户DID
   * @param request 更新请求参数
   * @returns 更新成功返回true
   */
  async updateGeni(did: string, request: UpdateGeniRequest): Promise<boolean> {
    return apiService.patch<boolean>(
      API_ENDPOINTS.USERS.UPDATE_GENI(did),
      request,
      {
        requiresAuth: true,
        requiresAgentToken: true,
      }
    )
  }

  /**
   * 更新用户角色
   * @param did 用户DID
   * @param request 更新请求参数
   * @returns 更新成功返回true
   */
  async updateRole(did: string, request: UpdateRoleRequest): Promise<boolean> {
    return apiService.patch<boolean>(
      API_ENDPOINTS.USERS.UPDATE_ROLE(did),
      request,
      {
        requiresAuth: true,
        requiresAgentToken: true,
      }
    )
  }

  /**
   * 获取用户计划状态
   * @param did 用户DID
   * @param refresh 是否刷新缓存
   * @returns 用户计划状态信息
   */
  async getUserPlan(did: string, refresh?: boolean): Promise<PlanState> {
    return apiService.get<PlanState>(
      API_ENDPOINTS.USERS.GET_PLAN(did),
      { refresh },
      { requiresAuth: true }
    )
  }

  /**
   * 授予用户CU
   * @param did 用户DID
   * @param request 授予请求参数
   * @returns 更新后的计划状态
   */
  async grantCU(did: string, request: GrantCURequest): Promise<PlanState> {
    return apiService.post<PlanState>(
      API_ENDPOINTS.USERS.GRANT_CU(did),
      request,
      {
        requiresAuth: true,
        requiresAgentToken: true,
      }
    )
  }

  /**
   * 冻结用户计划
   * @param did 用户DID
   * @param request 冻结请求参数
   * @returns 更新成功返回true
   */
  async freezePlan(did: string, request: FreezePlanRequest): Promise<boolean> {
    return apiService.post<boolean>(
      API_ENDPOINTS.USERS.FREEZE_PLAN(did),
      request,
      {
        requiresAuth: true,
        requiresAgentToken: true,
      }
    )
  }
}

// 导出单例实例
export const usersApi = new UsersApiService() 