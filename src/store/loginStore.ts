import { atom } from 'jotai'
import { authService } from '../services/authService'
import { usersApi } from '../services/api/users'
import { authApi } from '../services/api/auth'
import {ApiError, UserBaseInfo} from '../services/api'

export interface GoogleUserInfo {
  id: string
  email: string
  name: string
  picture: string
  tokens: {
    did: string
    access_token: string
    id_token: string
    refresh_token?: string
    expires_in: number
    token_type: string
  }
}

export interface UserState {
  isAuthenticated: boolean
  user: GoogleUserInfo | null
  userDetails: UserBaseInfo | null // 详细的用户信息，来自API
  isLoading: boolean
  error: string | null
}

// 用户状态atom
export const userStateAtom = atom<UserState>({
  isAuthenticated: false,
  user: null,
  userDetails: null,
  isLoading: false,
  error: null
})

// 登录模态框状态
export interface LoginModalState {
  isOpen: boolean
}

export const loginModalAtom = atom<LoginModalState>({
  isOpen: false
})

// 显示登录模态框
export const showLoginModalAtom = atom(
  null,
  (_, set) => {
    set(loginModalAtom, { isOpen: true })
  }
)

// 隐藏登录模态框
export const hideLoginModalAtom = atom(
  null,
  (_, set) => {
    set(loginModalAtom, { isOpen: false })
  }
)

// 初始化用户状态（从localStorage恢复）
export const initUserStateAtom = atom(
  null,
  (_, set) => {
    const user = authService.getCurrentUser()
    if (user && authService.isAuthenticated()) {
      // 重新设置Bearer Token - 修复重新打开应用时token丢失的问题
      if (user.tokens && user.tokens.access_token) {
        authApi.setBearerToken(user.tokens.access_token)
        console.log('Bearer token restored from localStorage')
      }

      set(userStateAtom, {
        isAuthenticated: true,
        user,
        userDetails: null,
        isLoading: false,
        error: null
      })

      // 获取详细用户信息
      set(fetchUserDetailsAtom)
    }
  }
)

// 登录处理
export const loginAtom = atom(
  null,
  async (_, set, { code, state }: { code: string; state: string }) => {
    set(userStateAtom, {
      isAuthenticated: false,
      user: null,
      userDetails: null,
      isLoading: true,
      error: null
    })

    try {
      const userInfo = await authService.handleGoogleCallback(code, state)

      set(userStateAtom, {
        isAuthenticated: true,
        user: userInfo,
        userDetails: null,
        isLoading: false,
        error: null
      })

      // 获取详细用户信息
      set(fetchUserDetailsAtom)

      return userInfo
    } catch (error) {
      console.error('Login failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Login failed'

      set(userStateAtom, {
        isAuthenticated: false,
        user: null,
        userDetails: null,
        isLoading: false,
        error: errorMessage
      })

      throw error
    }
  }
)

// 获取用户详细信息
export const fetchUserDetailsAtom = atom(
  null,
  async (get, set) => {
    const currentState = get(userStateAtom)

    if (!currentState.isAuthenticated || !currentState.user) {
      return
    }

    try {
      const did = currentState.user.tokens.did
      const userDetails = await usersApi.getUserInfo(did, true)

      set(userStateAtom, {
        ...currentState,
        userDetails,
        error: null
      })

      console.log('User details fetched successfully:', userDetails)
    } catch (error) {
      console.error('Failed to fetch user details:', error)

      // 如果是401错误，说明token无效，清空登录状态
      if (error instanceof ApiError && error.statusCode === 401) {
        console.warn('Access token invalid (401), clearing login state')
        set(logoutAtom)
        return
      }

      // 其他错误不清空登录状态，只记录错误
      set(userStateAtom, {
        ...currentState,
        error: error instanceof Error ? error.message : 'Failed to fetch user details'
      })
    }
  }
)

// 登出处理
export const logoutAtom = atom(
  null,
  (_, set) => {
    authService.logout()

    set(userStateAtom, {
      isAuthenticated: false,
      user: null,
      userDetails: null,
      isLoading: false,
      error: null
    })

    // 精选数据是公开的，不需要在登出时清除

    console.log('User logged out successfully')
  }
)