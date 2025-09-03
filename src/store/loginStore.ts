import { atom } from 'jotai'
import { authService } from '../services/authService'
import { usersApi } from '../services/api/users'
import { authApi } from '../services/api/auth'
import {ApiError, UserBaseInfo, PlanState} from '../services/api'
import { chatAtom } from './assistantStore.ts'
import { setAgentTokenAtom } from './assistantStore.ts'

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
  userPlan: PlanState | null // 用户计划状态信息
  isLoading: boolean
  isUserDataLoaded: boolean // 用户数据是否完全加载（包括userDetails和userPlan）
  error: string | null
}

// 用户状态atom
export const userStateAtom = atom<UserState>({
  isAuthenticated: false,
  user: null,
  userDetails: null,
  userPlan: null,
  isLoading: false,
  isUserDataLoaded: false,
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
  (get, set) => {
    const user = authService.getCurrentUser()
    if (user && authService.isAuthenticated()) {
      // 重新设置Bearer Token - 修复重新打开应用时token丢失的问题
      if (user.tokens && user.tokens.access_token) {
        authApi.setBearerToken(user.tokens.access_token)
        console.log('Bearer token restored from localStorage')
        set(setAgentTokenAtom, user.tokens.access_token)
      }

      const currentUserState = get(userStateAtom)

      set(userStateAtom, {
        isAuthenticated: true,
        user,
        userDetails: currentUserState.userDetails,
        userPlan: currentUserState.userPlan,
        isLoading: false,
        isUserDataLoaded: currentUserState.userDetails !== null && currentUserState.userPlan !== null,
        error: null
      })

      // 获取用户数据（userDetails和userPlan）
      set(fetchUserDataAtom)
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
      userPlan: null,
      isLoading: true,
      isUserDataLoaded: false,
      error: null
    })

    try {
      const userInfo = await authService.handleGoogleCallback(code, state)

      set(userStateAtom, {
        isAuthenticated: true,
        user: userInfo,
        userDetails: null,
        userPlan: null,
        isLoading: false,
        isUserDataLoaded: false,
        error: null
      })

      // 获取用户数据（userDetails和userPlan）
      set(fetchUserDataAtom)

      return userInfo
    } catch (error) {
      console.error('Login failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Login failed'

      set(userStateAtom, {
        isAuthenticated: false,
        user: null,
        userDetails: null,
        userPlan: null,
        isLoading: false,
        isUserDataLoaded: false,
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
      const agentToken = currentState.user.tokens.access_token
      const did = currentState.user.tokens.did
      const userDetails = await usersApi.getUserInfo(did, true)

      set(userStateAtom, {
        ...currentState,
        userDetails,
        isUserDataLoaded: currentState.userPlan !== null, // 只有当userPlan也存在时才标记为已加载
        error: null
      })

      // 新增：更新assistantStore的chatState
      set(chatAtom, prev => ({
        ...prev,
        userUuid: userDetails.did || '',
        did: userDetails.did,
        agentToken: agentToken
      }));

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

// 获取用户计划状态
export const fetchUserPlanAtom = atom(
  null,
  async (get, set) => {
    const currentState = get(userStateAtom)

    if (!currentState.isAuthenticated || !currentState.user) {
      return
    }

    try {
      const did = currentState.user.tokens.did
      const userPlan = await usersApi.getUserPlan(did, true)

      set(userStateAtom, {
        ...currentState,
        userPlan,
        isUserDataLoaded: currentState.userDetails !== null, // 只有当userDetails也存在时才标记为已加载
        error: null
      })

      console.log('User plan fetched successfully:', userPlan)
    } catch (error) {
      console.error('Failed to fetch user plan:', error)

      // 如果是401错误，说明token无效，清空登录状态
      if (error instanceof ApiError && error.statusCode === 401) {
        console.warn('Access token invalid (401), clearing login state')
        set(logoutAtom)
        return
      }

      // 其他错误不清空登录状态，只记录错误
      set(userStateAtom, {
        ...currentState,
        error: error instanceof Error ? error.message : 'Failed to fetch user plan'
      })
    }
  }
)

// 统一获取用户数据（userDetails和userPlan）
export const fetchUserDataAtom = atom(
  null,
  async (get, set) => {
    const currentState = get(userStateAtom)

    if (!currentState.isAuthenticated || !currentState.user) {
      return
    }

    // 如果数据已经完全加载，直接返回
    if (currentState.isUserDataLoaded) {
      return
    }

    try {
      const agentToken = currentState.user.tokens.access_token
      const did = currentState.user.tokens.did

      // 并行获取用户详情和计划状态
      const [userDetails, userPlan] = await Promise.all([
        currentState.userDetails ? Promise.resolve(currentState.userDetails) : usersApi.getUserInfo(did, true),
        currentState.userPlan ? Promise.resolve(currentState.userPlan) : usersApi.getUserPlan(did, true)
      ])

      set(userStateAtom, {
        ...currentState,
        userDetails,
        userPlan,
        isUserDataLoaded: true,
        error: null
      })

      // 更新assistantStore的chatState
      set(setAgentTokenAtom, agentToken)
      set(chatAtom, prev => ({
        ...prev,
        userUuid: userDetails.did || '',
        did: userDetails.did,
        agentToken: agentToken
      }))

      console.log('User data fetched successfully:', { userDetails, userPlan })
    } catch (error) {
      console.error('Failed to fetch user data:', error)

      // 如果是401错误，说明token无效，清空登录状态
      if (error instanceof ApiError && error.statusCode === 401) {
        console.warn('Access token invalid (401), clearing login state')
        set(logoutAtom)
        return
      }

      // 其他错误不清空登录状态，只记录错误
      set(userStateAtom, {
        ...currentState,
        error: error instanceof Error ? error.message : 'Failed to fetch user data'
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
      userPlan: null,
      isLoading: false,
      isUserDataLoaded: false,
      error: null
    })

    // 新增：清空assistantStore的chatState相关字段
    set(chatAtom, prev => ({
      ...prev,
      userUuid: '',
      did: undefined
    }));

    console.log('User logged out successfully')
  }
)