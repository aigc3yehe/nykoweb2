// 通用类型
export type UserRole = 'admin' | 'user' | 'whitelist' | 'banned'
export type PlanType = 'FREE' | 'PRO' | 'PREMIUM'
export type PaymentMode = 'subscription' | 'payment'
export type ContentState = 'success' | 'pending' | 'failed'
export type ContentType = 'image' | 'video' | 'text' | 'audio'
export type SourceType = 'model' | 'workflow'
export type OrderDirection = 'desc' | 'asc'
export type ContentOrderType = 'created_at' | 'updated_at' | 'id' | 'like_count'
export type AIProvider = 'gpt-4o' | 'sd' | 'kling' | 'flux' | 'veo'
export type AIModel = 'sd' | 'gpt-image-1-vip' | 'kling-video-v1' | 'flux-kontext-pro' | 'pollo-veo3' | 'pollo-kling'

// 用户相关类型
export interface TwitterInfo {
  subject?: string
  username?: string | null
  name?: string | null
  profilePictureUrl?: string | null
  profile_picture_url?: string | null
}

export interface GoogleInfo {
  sub?: string
  email?: string
  name?: string
  picture?: string
}

export interface StripeInfo {
  customer_id?: string
  subscription_id?: string
}

export interface UserPermissions {
  train_model?: boolean
  create_workflow?: boolean
}

export interface ReferralInfo {
  invite_code?: string
  referrer_code?: string
  point_reward_ratio?: number
  referrer?: {
    did: string
    name: string
    avatar: string
    email: string
  }
}

export interface UserBaseInfo {
  did?: string
  name?: string
  avatar?: string
  email?: string
  role?: UserRole
  credit?: number
  geni?: number
  twitter?: TwitterInfo
  google?: GoogleInfo
  stripe?: StripeInfo
  permission?: UserPermissions
  referrals?: ReferralInfo
}

export interface UserShowDto {
  did: string
  name: string
  avatar: string
  email: string
}

// 认证相关类型
export interface LoginRequest {
  provider: string
  google_token?: string
}

export interface LoginResponse {
  user: string
  access_token: string
}

export interface RegisterRequest {
  role: UserRole
  did: string
  email?: string
  expires_in?: string
}

// 用户管理相关类型
export interface UpdateGeniRequest {
  geni: number
}

export interface UpdateRoleRequest {
  role: UserRole
}

export interface PlanState {
  sub_balance: number
  paid_balance: number
  plan_type: PlanType
  next_refresh_at: string
  freeze_plan_until?: string
}

export interface GrantCURequest {
  user: string
  amount: number
}

export interface FreezePlanRequest {
  plan: string
  days: number
}

// 内容相关类型
export interface ContentItem {
  content_id: number
  source_id?: number
  flag?: string
  version?: number
  task_id?: string
  url?: string
  width?: number
  height?: number
  state?: number
  public?: number
  user?: UserShowDto
  source?: SourceType
  is_liked?: boolean
  type?: ContentType
  like_count?: number
  created_at?: string
}

export interface ContentsListResponse {
  contents?: ContentItem[]
  total_count?: number
}

export interface Content {
  type: ContentType
  user?: UserShowDto
  source_info?: {
    id?: number
    name?: string
  }
  source?: string
  url?: string
  text?: string
  task_id?: string
  created_at?: string
  height?: number
  width?: number
  state?: number
  like_count?: number
  is_liked?: boolean
}

export interface RefreshAigcStateResponse {
  all?: number
  success?: number
}

export interface ToggleVisibilityRequest {
  public: boolean
}

export interface UpdateFlagRequest {
  flag: string
}

export interface LikeRequest {
  is_liked: boolean
}

export interface FetchLikeContentResponse {
  is_liked: boolean
  updated_at: Date
}

export interface FetchLikedContentsResponse {
  contents?: ContentItem[]
  total_count?: number
}

export interface FetchUsageAuthorityRequest {
  user: string
  provider: AIProvider
  model?: AIModel
}

export interface FetchUsageAuthorityResponse {
  permission: boolean
  cu?: number
  error?: string
}

export interface GenerateContentRequest {
  user: string
  provider: AIProvider
  model: AIModel
  source: SourceType
  source_id: number
  prompt?: string
  references?: string[]
  input_type?: string[]
  output_type?: string[]
  aigc_config?: Record<string, any>
}

export interface GenerateContentResponse {
  task_id: string
  content_id: number
}

export interface FetchGenerateContentStateRequest {
  task_id: string
  refresh?: boolean
}

export interface FetchGenerateContentStateResponse {
  id: string
  status: string
  error?: string
  upscaled_urls?: string[]
}

// 工作流相关类型
export interface WorkflowDto {
  workflow_id: number
  name?: string
  description?: string
  cover?: string
  flag?: string
  carousel?: string[]
  tags?: string[]
  usage?: number
  cu?: number
  state?: number
  public?: number
  created_at?: Date
  provider?: AIProvider
  model?: AIModel
  input_type?: string
  output_type?: string
  prompt?: string
  reference_images?: string[]
  user?: UserShowDto
}

export interface FetchWorkflowsResponse {
  workflows?: WorkflowDto[]
  total_count?: number
}

export interface CreateWorkflowRequest {
  name: string
  description?: string
  user: string
  prompt?: string
  input_type: string[]
  output_type: string[]
  provider: AIProvider
  model: AIModel
  reference_images?: string[]
}

export interface CreateWorkflowResponse {
  workflow_id: number
}

export interface WorkflowGenerateRequest {
  user: string
  workflow_id: number
  text_value?: string
  image_value?: string
  width?: number
  height?: number
  n?: number
}

export interface RetryGenerateRequest {
  content_id: number
}

export interface AigcProcesserResponse {
  task_id?: string
  content_id?: number
}

// 模型相关类型
export interface ModelTrainingInfo {
  version: number
  train_state: number // 训练状态 (0为排队中, 1为进行中, 2 为完成, -1 为失败)
  task_id?: string
  base_model?: string
  lora_name?: string
}

export interface FetchModelDto {
  model_id: number
  name?: string
  description?: string
  cover?: string
  usage?: number
  cu?: number
  carousel?: string[]
  tags?: string[]
  created_at?: Date
  flag?: string
  model_tran?: ModelTrainingInfo[]
  user?: UserShowDto
  public?: number
}

export interface FetchEnableModelsResponse {
  models?: FetchModelDto[]
  total_count?: number
}

export interface ModelGenerateRequest {
  user: string
  model_id: number
  version?: number
  prompt: string
  base_model: string
  width?: number
  height?: number
  negative_prompt?: string
}

// AICC相关类型
export interface AICCItemDto {
  aicc_id: number
  name?: string
  cover?: string
  source?: SourceType
  created_at?: Date
}

export interface AICCContentDto {
  content_id: number
  url?: string
  source?: SourceType
  source_id?: number
  user?: UserShowDto
  type?: ContentType
  width?: number
  height?: number
  created_at?: Date
}

export interface CreativityTopicDto {
  tag: string
  value: number
}

// 积分相关类型
export interface FetchPointResponse {
  points: number
  referral_points: number
  total_points: number
  geni: number
  ef: number
  cd: number
  current_season_total_points: string
}

export interface FetchPointDto {
  points: number
  season: number
}

export interface FetchLeaderboardDto {
  user: UserShowDto
  points: number
  season: string
  geni: number
}

// 支付相关类型
export interface CreateCheckoutSessionRequest {
  plan: string
  mode: PaymentMode
  days?: number
  success_url: string
  cancel_url: string
}

export interface CreateCheckoutSessionResponseDto {
  session_id: string
  url: string
}

export interface VerifyCheckoutSessionResponseDto {
  success: boolean
  message?: string
  customer_email: string
  payment_status: string
  amount_total: number
  currency?: string
  metadata?: any
}

export interface PaymentInfoResponseDto {
  has_payment: boolean
  payment_mode: PaymentMode
  status: string
  can_cancel: boolean
  plan?: PlanType
  subscription_id?: string
}

export interface CancelSubscriptionResponseDto {
  success: boolean
  message: string
}

export interface StripeWebhookEventResponseDto {
  received: boolean
}

// 标签相关类型
export interface TagConfigDto {
  slug: string
  point_boost: number
  links?: {
    kaito?: string
    website?: string
    cookie?: string
  }
  twitter?: TwitterInfo
}

// 文件上传相关类型
export interface UploadFileResponse {
  name: string
  url: string
}

// 健康检查相关类型
export interface HealthResponse {
  status: string
  services: {
    database: {
      status: string
      connection_pool: any
    }
    redis: string
  }
  timestamp: string
}

// 仪表盘相关类型
export interface FeaturedItem {
  id: number
  source: SourceType
  name: string
  tags: string[]
  usage: number
  cover: string
  description?: string
  user: UserShowDto
}

export interface UpdateFeaturedRequest {
  data: Array<{
    id: number
    source: SourceType
  }>
}

export interface AiProviderDto {
  name: string
  models: Array<{
    name: string
    support_input_types: string[]
    support_output_types: string[]
  }>
}

// 推荐系统相关类型
export interface PointsRewardListItemDto {
  points?: number
  created_at?: Date
  user?: UserShowDto
}

export interface BindReferralCodeRequest {
  user?: string
}

// 分页查询参数
export interface PaginationParams {
  page?: number
  page_size?: number
}

// 排序查询参数
export interface SortParams {
  order?: string
  desc?: OrderDirection
}

// 内容查询参数
export interface ContentQueryParams extends PaginationParams, SortParams {
  source_id?: number
  source?: SourceType
  user?: string
  state?: ContentState
  view?: boolean
  flag?: string
  type?: ContentType
}

// 工作流查询参数
export interface WorkflowQueryParams extends PaginationParams, SortParams {
  user?: string
  view?: boolean
  tag?: string
}

// 模型查询参数
export interface ModelQueryParams extends PaginationParams, SortParams {
  flag?: string
  view?: boolean
  user?: string
  tag?: string
}

// AICC查询参数
export interface AICCQueryParams extends PaginationParams {
  tag: string
  refresh?: boolean
}

// 积分查询参数
export interface PointsQueryParams extends PaginationParams {
  season?: number
}

// 推荐查询参数
export interface ReferralQueryParams extends PaginationParams {
  season?: number
} 