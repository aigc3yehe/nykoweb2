import React, { useEffect } from 'react';
import { PrivyProvider, usePrivy } from '@privy-io/react-auth';
import { useAtom } from 'jotai';
import { setUser, setWalletAddress, setLoading } from '../store/accountStore';

// Privy应用ID - 应该在环境变量中配置
const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID || "your-privy-app-id";

interface PrivyAuthProviderProps {
  children: React.ReactNode;
}

// Privy认证管理组件
const PrivyAuthManager: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { user, authenticated, ready, wallet } = usePrivy();
  const [, setUserAction] = useAtom(setUser);
  const [, setWalletAddressAction] = useAtom(setWalletAddress);
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

  useEffect(() => {
    // 当钱包信息发生变化时，更新钱包地址
    if (wallet?.address) {
      console.log('wallet.address', wallet.address);
      setWalletAddressAction(wallet.address);
    }
  }, [wallet, setWalletAddressAction]);

  return <>{children}</>;
};

// Privy认证提供者包装器
const PrivyAuthProvider: React.FC<PrivyAuthProviderProps> = ({ children }) => {
  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        // 配置自动创建钱包
        embeddedWallets: {
           createOnLogin: 'all-users',
        },
        // 自定义登录外观
        appearance: {
          theme: 'dark',
          accentColor: '#6366F1', // 使用项目主题色
          logo: '/nyko.png', // 使用项目logo
        },
      }}
    >
      <PrivyAuthManager>{children}</PrivyAuthManager>
    </PrivyProvider>
  );
};

export default PrivyAuthProvider; 