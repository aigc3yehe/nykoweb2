import { atom } from 'jotai';
import { User, Twitter, Google } from '@privy-io/react-auth';

export interface AccountState {
  user: User | null;
  twitter: Twitter | null;
  google: Google | null;
  walletAddress: string | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  error: string | null;
  credits: number;
}

// 初始账户状态
const initialState: AccountState = {
  user: null,
  twitter: null,
  google: null,
  walletAddress: '0x4272e3150A81B9735ccc58692f5dd3Cf73fB3B92', // 测试钱包地址
  isLoading: false,
  isLoggedIn: false,
  error: null,
  credits: 0 
};

// 创建账户状态原子
export const accountAtom = atom<AccountState>(initialState);

// 设置用户信息
export const setUser = atom(
  null,
  (get, set, user: User | null) => {
    const state = get(accountAtom);
    
    set(accountAtom, {
      ...state,
      user,
      twitter: user?.twitter || null,
      google: user?.google || null,
      isLoggedIn: !!user,
      // 如果用户有嵌入式钱包，更新钱包地址
      walletAddress: user?.wallet?.address || state.walletAddress
    });
  }
);

// 设置钱包地址
export const setWalletAddress = atom(
  null,
  (get, set, address: string | null) => {
    const state = get(accountAtom);
    
    set(accountAtom, {
      ...state,
      walletAddress: address
    });
  }
);

// 设置加载状态
export const setLoading = atom(
  null,
  (get, set, isLoading: boolean) => {
    const state = get(accountAtom);
    
    set(accountAtom, {
      ...state,
      isLoading
    });
  }
);

// 设置错误状态
export const setError = atom(
  null,
  (get, set, error: string | null) => {
    const state = get(accountAtom);
    
    set(accountAtom, {
      ...state,
      error
    });
  }
);

// 设置积分
export const setCredits = atom(
  null,
  (get, set, credits: number) => {
    const state = get(accountAtom);
    
    set(accountAtom, {
      ...state,
      credits
    });
  }
);

// 登出
export const logout = atom(
  null,
  (get, set) => {
    set(accountAtom, initialState);
  }
); 