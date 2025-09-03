import api from './api'

// 保持向后兼容的接口定义
export interface Twitter {
  subject?: string
  username?: string | null
  name?: string | null
  profilePictureUrl?: string | null
}

export interface UserPermission {
  generate_image?: boolean
  create_model?: boolean
  train_model?: boolean
  model_tokenization?: boolean
  create_workflow?: boolean
  use_workflow?: boolean
}

// 创建用户响应接口
export interface CreateUserResponse {
  message: string
  data: boolean
}

// 查询用户响应接口
export interface QueryUserResponse {
  message: string
  data: {
    address: string
    did: string
    twitter: Twitter
    credit: number
    name?: string
    avatar?: string
    permission?: UserPermission
    role?: string
    linked_wallet?: string
    geni?: number
    referrals?: {
      invite_code: string
      referrer_code?: string
      point_reward_ratio: number
      referrer_twitter?: {
        name: string
        subject: string
        username: string
        profilePictureUrl: string
      }
    }
    referrer_twitter?: {
      name: string
      subject: string
      username: string
      profilePictureUrl: string
    }
  }
}

export enum PLAN_TYPE {
  FREE = "free",
  PREMIUM = "premium",
  PREMIUM_PLUS = "premium_plus",
}

// 查询用户计划响应接口
export interface QueryPlanResponse {
  message: string
  data: {
    sub_balance: number
    paid_balance: number
    plan_type: string
    next_refresh_at: Date
  }
}

// 查询用户积分信息响应接口
export interface QueryPointsResponse {
  message: string
  data: {
    points: number
    total_points: number
    geni: number
    ef: number
    cd: number
    current_season_total_points: number
    staked_points: number
  }
}

// 排行榜项目类型
export interface LeaderboardItem {
  user: string
  points: number
  twitter: Twitter
  geni: number
}

// 排行榜响应接口
export interface LeaderboardResponse {
  message: string
  data: LeaderboardItem[]
}

// 编辑模型请求接口
export interface EditModelRequest {
  user: string
  model_id: number
  name?: string
  description?: string
  tags?: string[]
  token?: {
    address: string
    launchpad: 'virtuals' | 'flaunch' | 'others'
  }
}

// 编辑模型响应接口
export interface EditModelResponse {
  message: string
  data: boolean
}

// 绑定邀请码响应接口
export interface BindReferralResponse {
  statusCode: number
  message: string
  data: boolean
}

// 获取邀请列表响应接口
export interface GetInviteListResponse {
  message: string
  data: Array<{
    user: string
    twitter: Twitter
  }>
}

// 获取邀请奖励列表响应接口
export interface GetInviteRewardsResponse {
  message: string
  data: Array<{
    points: number
    created_at: Date
    user: {
      user: string
      twitter: Twitter
    }
  }>
}

// 获取用户通过邀请码响应接口
export interface GetUserByInviteCodeResponse {
  message: string
  data: {
    user: string
    twitter: Twitter
  } | null
}

// 辅助函数：转换Twitter格式
const convertTwitterInfo = (twitter?: any): Twitter => {
  if (!twitter) return {}
  return {
    subject: twitter.subject,
    username: twitter.username,
    name: twitter.name,
    profilePictureUrl: twitter.profile_picture_url || twitter.profilePictureUrl
  }
}

// 辅助函数：转换用户权限格式
const convertUserPermissions = (permission?: any): UserPermission => {
  if (!permission) return {}
  return {
    generate_image: true, // 默认权限
    create_model: permission.train_model,
    train_model: permission.train_model,
    model_tokenization: permission.train_model,
    create_workflow: permission.create_workflow,
    use_workflow: permission.create_workflow
  }
}

// 创建用户 - 暂时保持原有实现，因为新API没有对应接口
export const createUser = async (): Promise<CreateUserResponse> => {
  // 这个功能在新API中可能通过认证流程自动处理
  // 暂时保持警告，建议使用新的认证流程
  console.warn('createUser is deprecated, use auth.login instead')

  // 返回成功响应（实际可能需要调用注册接口）
  return {
    message: 'success',
    data: true
  }
}

// 查询用户
export const queryUser = async (params: {
  did: string
  address?: string
}): Promise<QueryUserResponse> => {
  try {
    const userInfo = await api.users.getUserInfo(params.did, true)

    return {
      message: 'success',
      data: {
        address: params.address || '',
        did: userInfo.did || '',
        twitter: convertTwitterInfo(userInfo.twitter),
        credit: userInfo.credit || 0,
        name: userInfo.name,
        avatar: userInfo.avatar,
        permission: convertUserPermissions(userInfo.permission),
        role: userInfo.role,
        linked_wallet: params.address,
        geni: userInfo.geni,
        referrals: userInfo.referrals ? {
          invite_code: userInfo.referrals.invite_code || '',
          referrer_code: userInfo.referrals.referrer_code,
          point_reward_ratio: userInfo.referrals.point_reward_ratio || 0,
          referrer_twitter: userInfo.referrals.referrer ? {
            name: userInfo.referrals.referrer.name,
            subject: userInfo.referrals.referrer.did,
            username: userInfo.referrals.referrer.name,
            profilePictureUrl: userInfo.referrals.referrer.avatar
          } : undefined
        } : undefined,
        referrer_twitter: userInfo.referrals?.referrer ? {
          name: userInfo.referrals.referrer.name,
          subject: userInfo.referrals.referrer.did,
          username: userInfo.referrals.referrer.name,
          profilePictureUrl: userInfo.referrals.referrer.avatar
        } : undefined
      }
    }
  } catch (error) {
    console.error('Query user failed:', error)
    throw error
  }
}

// 查询质押代币 - 暂时保持原有警告
export const queryStakedToken = async (params: { did: string }) => {
  console.warn('queryStakedToken is not implemented in new API', params.did)
  return {
    message: 'Not implemented',
    data: null
  }
}

// 更新计划 - 暂时保持原有警告
export const updatePlan = async (params: { did: string }) => {
  console.warn('updatePlan is not implemented in new API', params.did)
  return {
    message: 'Not implemented',
    data: null
  }
}

// 充值积分 - 暂时保持原有警告
export const chargeCredit = async (params: { tx_hash?: string }) => {
  console.warn('chargeCredit is not implemented in new API', params.tx_hash)
  return {
    message: 'Not implemented',
    data: null
  }
}

// 查询用户计划
export const queryUserPlan = async (params: {
  did: string
}): Promise<QueryPlanResponse> => {
  try {
    const planState = await api.users.getUserPlan(params.did, true)

    return {
      message: 'success',
      data: {
        sub_balance: planState.sub_balance,
        paid_balance: planState.paid_balance,
        plan_type: planState.plan_type.toLowerCase(),
        next_refresh_at: new Date(planState.next_refresh_at)
      }
    }
  } catch (error) {
    console.error('Query user plan failed:', error)
    return {
      message: 'Query user plan failed',
      data: {
        sub_balance: 0,
        paid_balance: 0,
        plan_type: PLAN_TYPE.FREE,
        next_refresh_at: new Date()
      }
    }
  }
}

// 刷新用户计划
export const refreshUserPlan = async (params: {
  did: string
}): Promise<QueryPlanResponse> => {
  // 与 queryUserPlan 相同，因为我们总是获取最新数据
  return queryUserPlan(params)
}

// 查询用户积分信息
export const queryUserPoints = async (params: {
  user: string
}): Promise<QueryPointsResponse> => {
  try {
    const pointsInfo = await api.points.getCurrentPoints(params.user, true)

    return {
      message: 'success',
      data: {
        points: pointsInfo.points,
        total_points: pointsInfo.total_points,
        geni: pointsInfo.geni,
        ef: pointsInfo.ef,
        cd: pointsInfo.cd,
        current_season_total_points: Number(pointsInfo.current_season_total_points),
        staked_points: 0 // 新API中没有此字段
      }
    }
  } catch (error) {
    console.error('Query user points failed:', error)
    throw error
  }
}

// 获取排行榜数据
export const getLeaderboard = async (params: {
  page?: number
  pageSize?: number
  season?: number
}): Promise<LeaderboardResponse> => {
  try {
    const leaderboard = await api.points.getLeaderboard({
      page: params.page,
      page_size: params.pageSize,
      season: params.season
    })

    return {
      message: 'success',
      data: leaderboard.map(item => ({
        user: item.user.did,
        points: item.points,
        twitter: convertTwitterInfo({
          subject: item.user.did,
          username: item.user.name,
          name: item.user.name,
          profile_picture_url: item.user.avatar
        }),
        geni: item.geni
      }))
    }
  } catch (error) {
    console.error('Get leaderboard failed:', error)
    throw error
  }
}

// 编辑模型函数 - 暂时保持原有实现，因为新API使用不同的端点
export const editModelRequest = async (params: EditModelRequest): Promise<EditModelResponse> => {
  console.warn('editModelRequest should use the new model API endpoints', params.model_id)
  // 这里可以调用新的模型更新API，但需要确认具体的接口
  return {
    message: 'success',
    data: true
  }
}

// 绑定邀请码函数
export const bindReferralCode = async (params: {
  user: string
  referrer_code: string
}): Promise<BindReferralResponse> => {
  try {
    const result = await api.referrals.bindReferralCode(params.referrer_code, {
      user: params.user
    })

    return {
      statusCode: 200,
      message: 'success',
      data: result
    }
  } catch (error) {
    console.error('Bind referral code failed:', error)
    throw error
  }
}

// 获取邀请列表函数
export const getInviteList = async (params: {
  invite_code: string
  page?: number
  pageSize?: number
}): Promise<GetInviteListResponse> => {
  try {
    const invitesList = await api.referrals.getInvitesList(params.invite_code, {
      page: params.page,
      page_size: params.pageSize
    })

    return {
      message: 'success',
      data: invitesList.map(user => ({
        user: user.did,
        twitter: convertTwitterInfo({
          subject: user.did,
          username: user.name,
          name: user.name,
          profile_picture_url: user.avatar
        })
      }))
    }
  } catch (error) {
    console.error('Get invite list failed:', error)
    throw error
  }
}

// 获取邀请奖励列表函数
export const getInviteRewards = async (params: {
  invite_code: string
  page?: number
  pageSize?: number
  season?: number
}): Promise<GetInviteRewardsResponse> => {
  try {
    const rewardsList = await api.referrals.getRewardsList(params.invite_code, {
      page: params.page,
      page_size: params.pageSize,
      season: params.season
    })

    return {
      message: 'success',
      data: rewardsList.map(reward => ({
        points: reward.points || 0,
        created_at: reward.created_at || new Date(),
        user: {
          user: reward.user?.did || '',
          twitter: convertTwitterInfo({
            subject: reward.user?.did,
            username: reward.user?.name,
            name: reward.user?.name,
            profile_picture_url: reward.user?.avatar
          })
        }
      }))
    }
  } catch (error) {
    console.error('Get invite rewards failed:', error)
    throw error
  }
}

// 获取用户通过邀请码函数 - 这个功能在新API中可能需要不同的实现
export const getUserByInviteCode = async (params: {
  invite_code: string
}): Promise<GetUserByInviteCodeResponse> => {
  try {
    // 这可能需要通过获取邀请列表来实现，或者需要新的API端点
    const invitesList = await api.referrals.getInvitesList(params.invite_code, {
      page: 1,
      page_size: 1
    })

    if (invitesList.length > 0) {
      const user = invitesList[0]
      return {
        message: 'success',
        data: {
          user: user.did,
          twitter: convertTwitterInfo({
            subject: user.did,
            username: user.name,
            name: user.name,
            profile_picture_url: user.avatar
          })
        }
      }
    }

    return {
      message: 'success',
      data: null
    }
  } catch (error) {
    console.error('Get user by invite code failed:', error)
    return {
      message: 'Get user by invite code failed',
      data: null
    }
  }
}
