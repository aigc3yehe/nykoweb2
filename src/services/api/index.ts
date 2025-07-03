// 导出API配置
import {authApi} from "./auth.ts";
import {usersApi} from "./users.ts";
import {contentsApi} from "./contents.ts";
import {workflowsApi} from "./workflows.ts";
import {modelsApi} from "./models.ts";
import {pointsApi} from "./points.ts";
import {paymentsApi} from "./payments.ts";
import {aiccApi} from "./aicc.ts";
import {dashboardApi, filesApi, healthApi, referralsApi, tagsApi} from "./misc.ts";
import {apiService} from "./base.ts";

export { API_CONFIG, API_ENDPOINTS } from './config'

// 导出基础服务和工具类
export { BaseApiService, ApiError } from './base'
export type { ApiResponse, RequestConfig } from './base'

// 导出所有类型
export * from './types'

// 导出认证API服务
export { AuthApiService } from './auth'

// 导出用户API服务
export { UsersApiService } from './users'

// 导出内容API服务
export { ContentsApiService } from './contents'

// 导出工作流API服务
export { WorkflowsApiService } from './workflows'

// 导出模型API服务
export { ModelsApiService } from './models'

// 导出AICC API服务
export { AiccApiService } from './aicc'

// 导出积分API服务
export { PointsApiService } from './points'

// 导出支付API服务
export { PaymentsApiService } from './payments'

// 导出其他API服务
export {
  TagsApiService,
  FilesApiService,
  HealthApiService,
  DashboardApiService,
  ReferralsApiService,
} from './misc'

/**
 * 统一的API服务类
 * 提供所有模块的API访问接口
 */
export class ApiService {
  // 认证服务
  public readonly auth = authApi

  // 用户服务
  public readonly users = usersApi

  // 内容服务
  public readonly contents = contentsApi

  // 工作流服务
  public readonly workflows = workflowsApi

  // 模型服务
  public readonly models = modelsApi

  // AICC服务
  public readonly aicc = aiccApi

  // 积分服务
  public readonly points = pointsApi

  // 支付服务
  public readonly payments = paymentsApi

  // 标签服务
  public readonly tags = tagsApi

  // 文件上传服务
  public readonly files = filesApi

  // 健康检查服务
  public readonly health = healthApi

  // 仪表盘服务
  public readonly dashboard = dashboardApi

  // 推荐系统服务
  public readonly referrals = referralsApi

  /**
   * 设置认证令牌
   * @param token Bearer令牌
   */
  setBearerToken(token: string): void {
    apiService.setBearerToken(token)
  }

  /**
   * 设置代理令牌
   * @param token 代理令牌
   */
  setAgentToken(token: string): void {
    apiService.setAgentToken(token)
  }
}

// 导出统一的API服务实例
export const api = new ApiService()

// 设为默认导出
export default api