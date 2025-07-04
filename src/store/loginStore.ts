import { atom } from 'jotai'
import { authService, GoogleUserInfo } from '../services/authService'

// 登录模态框状态接口
interface LoginModalState {
  isOpen: boolean
}

// 用户状态接口
interface UserState {
  isAuthenticated: boolean
  user: GoogleUserInfo | null
  isLoading: boolean
}

// 初始状态
const initialLoginState: LoginModalState = {
  isOpen: false
}

const initialUserState: UserState = {
  isAuthenticated: false,
  user: null,
  isLoading: false
}

// 登录模态框状态原子
export const loginModalAtom = atom<LoginModalState>(initialLoginState)

// 用户状态原子
export const userStateAtom = atom<UserState>(initialUserState)

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

// 设置用户登录状态
export const setUserAtom = atom(
  null,
  (_, set, user: GoogleUserInfo) => {
    set(userStateAtom, {
      isAuthenticated: true,
      user,
      isLoading: false
    })
    // 登录成功后关闭模态框
    set(loginModalAtom, { isOpen: false })
  }
)

// 用户登出
export const logoutUserAtom = atom(
  null,
  (_, set) => {
    authService.logout()
    set(userStateAtom, {
      isAuthenticated: false,
      user: null,
      isLoading: false
    })
  }
)

// 初始化用户状态（从localStorage恢复）
export const initUserStateAtom = atom(
  null,
  (_, set) => {
    const user = authService.getCurrentUser()
    const isAuthenticated = authService.isAuthenticated()
    
    set(userStateAtom, {
      isAuthenticated,
      user,
      isLoading: false
    })
  }
) 