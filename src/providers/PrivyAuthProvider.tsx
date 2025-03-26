import React, { useEffect } from 'react';
import { PrivyProvider, usePrivy } from '@privy-io/react-auth';
import { useAtom } from 'jotai';
import { setUser, setLoading } from '../store/accountStore';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {WagmiProvider} from '@privy-io/wagmi';

import {privyConfig} from './privyConfig';
import {wagmiConfig} from './wagmiConfig';

// Privy应用ID - 应该在环境变量中配置
const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID || "your-privy-app-id";

const queryClient = new QueryClient();

interface PrivyAuthProviderProps {
  children: React.ReactNode;
}

// Privy认证管理组件
const PrivyAuthManager: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { user, authenticated, ready } = usePrivy();
  const [, setUserAction] = useAtom(setUser);
  const [, setLoadingAction] = useAtom(setLoading);

  useEffect(() => {
    // 更新加载状态
    setLoadingAction(!ready);
  }, [ready, setLoadingAction]);

  useEffect(() => {
    // 当认证状态或用户信息发生变化时，更新用户信息
    if (ready) {
      setUserAction(authenticated ? user : null);
    }
  }, [authenticated, user, ready, setUserAction]);

  return <>{children}</>;
};

// Privy认证提供者包装器
const PrivyAuthProvider: React.FC<PrivyAuthProviderProps> = ({ children }) => {
  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={privyConfig}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <PrivyAuthManager>{children}</PrivyAuthManager>
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
};

export default PrivyAuthProvider; 