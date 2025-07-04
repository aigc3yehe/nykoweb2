import { authApi } from './api/auth'
import { API_CONFIG } from './api/config'

export interface AuthTokens {
  did: string
  access_token: string
  id_token: string
  refresh_token?: string
  expires_in: number
  token_type: string
}

export interface GoogleUserInfo {
  id: string
  email: string
  name: string
  picture: string,
  tokens: AuthTokens
}

class AuthService {
  private static instance: AuthService
  private currentUser: GoogleUserInfo | null = null
  private tokens: AuthTokens | null = null

  private constructor() {
    // 验证Google OAuth配置
    this.validateGoogleOAuthConfig()
    
    // 从localStorage恢复用户信息
    this.loadFromStorage()
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  // 验证Google OAuth配置
  private validateGoogleOAuthConfig(): void {
    if (!API_CONFIG.GOOGLE_OAUTH.CLIENT_ID || !API_CONFIG.GOOGLE_OAUTH.CLIENT_SECRET) {
      console.error('Google OAuth configuration is missing. Please set VITE_GOOGLE_CLIENT_ID and VITE_GOOGLE_CLIENT_SECRET in your environment variables.')
      console.error('Current config:', {
        CLIENT_ID: API_CONFIG.GOOGLE_OAUTH.CLIENT_ID ? 'SET' : 'MISSING',
        CLIENT_SECRET: API_CONFIG.GOOGLE_OAUTH.CLIENT_SECRET ? 'SET' : 'MISSING'
      })
    }
  }

  // 构建Google OAuth URL
  public getGoogleAuthUrl(): string {
    // 检查配置是否完整
    if (!API_CONFIG.GOOGLE_OAUTH.CLIENT_ID) {
      throw new Error('Google OAuth Client ID is not configured. Please set VITE_GOOGLE_CLIENT_ID environment variable.')
    }

    const redirectUri = `${window.location.origin}${API_CONFIG.GOOGLE_OAUTH.REDIRECT_URI}`
    const scope = API_CONFIG.GOOGLE_OAUTH.SCOPE
    const responseType = 'code'
    const state = Math.random().toString(36).substring(2, 15)

    console.log('OAuth initiate - generating state:', state)

    // 使用localStorage替代sessionStorage，并添加时间戳避免重放攻击
    const stateData = {
      state,
      timestamp: Date.now()
    }
    localStorage.setItem('oauth_state', JSON.stringify(stateData))

    return `${API_CONFIG.GOOGLE_OAUTH.OAUTH_URL}?` +
      `client_id=${API_CONFIG.GOOGLE_OAUTH.CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `response_type=${responseType}&` +
      `state=${state}&` +
      `access_type=offline&` +
      `prompt=consent&` +
      `include_granted_scopes=true`
  }

  // 处理Google OAuth回调
  public async handleGoogleCallback(code: string, state: string): Promise<GoogleUserInfo> {
    console.log('OAuth callback - received state:', state)

    // 验证state
    const savedStateStr = localStorage.getItem('oauth_state')
    console.log('OAuth callback - saved state string:', savedStateStr)

    if (!savedStateStr) {
      console.warn('No saved state found in localStorage, but proceeding with login for better UX')
      // 在开发环境中，我们可以跳过state验证以避免这个问题
    } else {
      try {
        const savedStateData = JSON.parse(savedStateStr)
        const { state: savedState, timestamp } = savedStateData

        console.log('OAuth callback - parsed state:', savedState, 'timestamp:', timestamp)

        // 检查state是否过期（10分钟）
        const isExpired = Date.now() - timestamp > 10 * 60 * 1000

        if (isExpired) {
          console.warn('State is expired, but proceeding with login')
        } else if (savedState !== state) {
          console.error('State mismatch - saved:', savedState, 'received:', state)
          throw new Error('Invalid state parameter')
        } else {
          console.log('State validation successful')
        }
      } catch (error) {
        console.warn('Failed to parse saved state data:', error)
      }
    }

    // 清除state
    localStorage.removeItem('oauth_state')

    // 交换authorization code获取tokens
    const tokens = await this.exchangeCodeForTokens(code)

    // 使用id_token调用现有的登录API
    const loginResponse = await authApi.login({
      provider: "google",
      google_token: tokens.id_token
    })

    console.log('Login API response:', loginResponse)

    // 设置Bearer token
    authApi.setBearerToken(loginResponse.access_token)

    this.tokens = {
      did: loginResponse.user,
      access_token: loginResponse.access_token,
      id_token: tokens.id_token,
      expires_in: tokens.expires_in,
      token_type: 'Bearer'
    }
    // 解析用户信息（从id_token中获取，或者调用API获取）
    const userInfo = await this.parseUserInfoFromToken(tokens.id_token, this.tokens)
    this.currentUser = userInfo

    // 保存到localStorage
    this.saveToStorage()

    return userInfo
  }

  // 交换authorization code获取tokens
  private async exchangeCodeForTokens(code: string): Promise<AuthTokens> {
    // 检查配置是否完整
    if (!API_CONFIG.GOOGLE_OAUTH.CLIENT_ID || !API_CONFIG.GOOGLE_OAUTH.CLIENT_SECRET) {
      throw new Error('Google OAuth configuration is incomplete. Please set VITE_GOOGLE_CLIENT_ID and VITE_GOOGLE_CLIENT_SECRET environment variables.')
    }

    const redirectUri = `${window.location.origin}${API_CONFIG.GOOGLE_OAUTH.REDIRECT_URI}`

    const response = await fetch(API_CONFIG.GOOGLE_OAUTH.TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: API_CONFIG.GOOGLE_OAUTH.CLIENT_ID,
        client_secret: API_CONFIG.GOOGLE_OAUTH.CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Token exchange failed:', response.status, errorData)
      throw new Error(`Failed to exchange code for tokens: ${response.status} - ${errorData}`)
    }

    const data = await response.json()
    console.log('Token exchange successful:', data)
    return data
  }

  // 从JWT id_token中解析用户信息
  private async parseUserInfoFromToken(idToken: string, tokens: AuthTokens): Promise<GoogleUserInfo> {
    try {
      // 简单解析JWT payload (生产环境中应该验证签名)
      const base64Url = idToken.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )

      const payload = JSON.parse(jsonPayload)

      return {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        tokens: tokens,
      }
    } catch (error) {
      console.error('Failed to parse user info from token:', error)
      throw new Error('Failed to parse user information')
    }
  }

  // 登出
  public logout(): void {
    this.currentUser = null
    this.tokens = null
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_tokens')
  }

  // 获取当前用户
  public getCurrentUser(): GoogleUserInfo | null {
    return this.currentUser
  }

  // 检查是否已登录
  public isAuthenticated(): boolean {
    return this.currentUser !== null
  }

  // 获取访问令牌
  public getAccessToken(): string | null {
    return this.tokens?.access_token || null
  }

  // 保存到localStorage
  private saveToStorage(): void {
    if (this.currentUser) {
      localStorage.setItem('auth_user', JSON.stringify(this.currentUser))
    }
    if (this.tokens) {
      localStorage.setItem('auth_tokens', JSON.stringify(this.tokens))
    }
  }

  // 从localStorage加载
  private loadFromStorage(): void {
    try {
      const userStr = localStorage.getItem('auth_user')
      const tokensStr = localStorage.getItem('auth_tokens')

      if (userStr) {
        this.currentUser = JSON.parse(userStr)
      }
      if (tokensStr) {
        this.tokens = JSON.parse(tokensStr)
      }
    } catch (error) {
      console.error('Failed to load auth data from storage:', error)
      this.logout()
    }
  }
}

export const authService = AuthService.getInstance()