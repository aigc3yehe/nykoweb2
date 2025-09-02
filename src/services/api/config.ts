// API 配置文件
export const API_CONFIG = {
  // 基础URL
  // BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://api.mavae.ai',
  BASE_URL: import.meta.env.VITE_API_BASE_URL || '/mavae_api',

  // 默认请求头
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },

  // Bearer Token 头名称
  BEARER_TOKEN_HEADER: 'Authorization',

  // Privy Token 头名称
  PRIVY_TOKEN_HEADER: 'X-Privy-Token',

  // Agent Token 头名称
  AGENT_TOKEN_HEADER: 'X-Agent-Token',

  // 默认超时时间 (30秒)
  TIMEOUT: 30000,

  // 分页默认配置
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
  },

  // 重试配置
  RETRY: {
    ATTEMPTS: 3,
    DELAY: 1000, // 1秒
  },

  // Google OAuth 配置
  GOOGLE_OAUTH: {
    CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
    CLIENT_SECRET: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '',
    REDIRECT_URI: '/api/auth/callback/google',
    SCOPE: 'openid email profile',
    OAUTH_URL: 'https://accounts.google.com/o/oauth2/auth',
    TOKEN_URL: 'https://oauth2.googleapis.com/token',
  },
} as const

// API 端点路径
export const API_ENDPOINTS = {
  // 认证模块
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
  },

  // 用户模块
  USERS: {
    GET_USER: (did: string) => `/users/${did}`,
    UPDATE_GENI: (did: string) => `/users/${did}/geni`,
    UPDATE_ROLE: (did: string) => `/users/${did}/role`,
    GET_PLAN: (did: string) => `/users/${did}/plan`,
    GRANT_CU: (did: string) => `/users/${did}/plan/grant`,
    FREEZE_PLAN: (did: string) => `/users/${did}/plan/freeze`,
  },

  // 内容模块
  CONTENTS: {
    LIST: '/contents',
    GET_BY_ID: (id: number) => `/contents/${id}`,
    REFRESH: '/contents/refresh',
    TOGGLE_VISIBILITY: (id: number) => `/contents/${id}/visibility`,
    UPDATE_FLAG: (id: number) => `/contents/${id}/flag`,
    LIKE: (id: number) => `/contents/${id}/like`,
    USER_LIKED: '/contents/user/liked',
    GENERATE_PERMISSION: '/contents/generate/permission',
    GENERATE: '/contents/generate',
    GENERATE_STATE: '/contents/generate/state',
  },

  // 工作流模块
  WORKFLOWS: {
    LIST: '/workflows',
    GET_BY_ID: (id: number) => `/workflows/${id}`,
    CREATE: '/workflow',
    GENERATE: '/workflows/generate',
    RETRY: '/workflows/generate/retry',
    USER_LIKED: '/workflows/user/liked',
    LIKE: (id: number) => `/workflows/${id}/like`,
  },

  // 模型模块
  MODELS: {
    LIST: '/models',
    GET_BY_ID: (id: number) => `/models/${id}`,
    GENERATE: '/model/aigc',
    RETRY: '/model/aigc/retry',
    USER_LIKED: '/models/user/liked',
  },

  // AICC模块
  AICC: {
    LIST: '/aicc',
    MODELS: '/aicc/models',
    WORKFLOWS: '/aicc/workflows',
    CONTENTS: '/aicc/contents',
    CREATIVITY_TOPIC: '/aicc/creativity-topic',
  },

  // 积分模块
  POINTS: {
    CURRENT: '/points/current',
    HISTORY: '/points',
    LEADERBOARD: '/points/leaderboard',
  },

  // 支付模块
  PAYMENTS: {
    // Stripe支付
    STRIPE: {
      CREATE_SESSION: '/payments/stripe/checkout-sessions',
      VERIFY_SESSION: (sessionId: string) => `/payments/stripe/checkout-sessions/${sessionId}/verify`,
      GET_INFO: (userId: string) => `/payments/stripe/subscriptions/${userId}`,
      CANCEL: (userId: string) => `/payments/stripe/subscriptions/${userId}`,
      PORTAL: (userId: string) => `/payments/portal/${userId}`,
      WEBHOOK: '/payments/stripe/webhooks',
    },
    // Hel支付
    HEL: {
      WEBHOOK: '/payments/hel/webhooks',
      GET_TRANSACTION: (signature: string) => `/payments/hel/transactions/signature/${signature}`,
    },
    // 兼容旧版本
    CREATE_SESSION: '/payments/checkout-sessions',
    VERIFY_SESSION: (sessionId: string) => `/payments/checkout-sessions/${sessionId}/verify`,
    GET_INFO: (userId: string) => `/payments/subscriptions/${userId}`,
    CANCEL: (userId: string) => `/payments/subscriptions/${userId}`,
    WEBHOOK: '/payments/webhooks',
  },

  // 标签模块
  TAGS: {
    LIST: '/tags',
    GET_CONFIG: (tagName: string) => `/tags/${tagName}`,
    UPDATE_CONFIG: (tagName: string) => `/tags/${tagName}`,
  },

  // 文件上传
  FILES: {
    UPLOAD: '/aws',
  },

  // 健康检查
  HEALTH: {
    CHECK: '/health',
  },

  // 仪表盘
  DASHBOARD: {
    FEATURED: '/dashboard/featured',
    FEATURED_WORKFLOWS: '/dashboard/featured/workflows',
    FEATURED_MODELS: '/dashboard/featured/models',
    AI_PROVIDERS: '/dashboard/provider/ai',
  },

  // 推荐系统
  REFERRALS: {
    GET_INVITES: (inviteCode: string) => `/referrals/codes/${inviteCode}/invites`,
    GET_REWARDS: (inviteCode: string) => `/referrals/codes/${inviteCode}/rewards`,
    BIND_CODE: (referralCode: string) => `/referrals/codes/${referralCode}/bind`,
  },
} as const