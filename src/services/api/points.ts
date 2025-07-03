import { apiService } from './base'
import { API_ENDPOINTS } from './config'
import type {
  FetchPointResponse,
  FetchPointDto,
  FetchLeaderboardDto,
  PointsQueryParams
} from './types'

/**
 * 积分系统API服务
 */
export class PointsApiService {
  /**
   * 获取当前赛季积分
   * @param user 用户DID（代理使用）
   * @param refresh 是否刷新缓存
   * @returns 当前积分信息
   */
  async getCurrentPoints(user?: string, refresh?: boolean): Promise<FetchPointResponse> {
    return apiService.get<FetchPointResponse>(
      API_ENDPOINTS.POINTS.CURRENT,
      { user, refresh },
      { requiresAuth: true }
    )
  }

  /**
   * 获取积分历史
   * @param user 用户DID
   * @param params 查询参数
   * @returns 积分历史列表
   */
  async getPointsHistory(user: string, params?: PointsQueryParams): Promise<FetchPointDto[]> {
    return apiService.get<FetchPointDto[]>(
      API_ENDPOINTS.POINTS.HISTORY,
      { user, ...params },
      { requiresAuth: true }
    )
  }

  /**
   * 获取积分排行榜
   * @param params 查询参数
   * @returns 排行榜列表
   */
  async getLeaderboard(params?: PointsQueryParams): Promise<FetchLeaderboardDto[]> {
    return apiService.get<FetchLeaderboardDto[]>(
      API_ENDPOINTS.POINTS.LEADERBOARD,
      params,
      { requiresAuth: true }
    )
  }
}

// 导出单例实例
export const pointsApi = new PointsApiService() 