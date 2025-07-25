/* eslint-disable @typescript-eslint/ban-ts-comment */
import { atom } from "jotai";
import {
  Alchemy,
  Network,
  AssetTransfersCategory,
  AssetTransfersResponse,
  AssetTransfersWithMetadataResponse,
  GetTokensForOwnerResponse,
} from "alchemy-sdk";
import { SupportedChainId } from "@uniswap/widgets";
import { formatEther } from "viem";

// 配置 Alchemy SDK
const alchemyConfig = {
  apiKey: import.meta.env.VITE_ALCHEMY_API_KEY || "demo", // 使用环境变量中的API密钥
  network: Network.BASE_MAINNET,
};

// 创建 Alchemy SDK 实例
const alchemy = new Alchemy(alchemyConfig);

// 定义状态接口
interface AlchemyState {
  isLoading: boolean;
  error: string | null;
  tokens: GetTokensForOwnerResponse | null;
  transfers: AssetTransfersResponse | AssetTransfersWithMetadataResponse | null;
  balance?: string | null;
  tokenBalance?: Record<string, string> | null;
}

// 初始状态
const initialState: AlchemyState = {
  isLoading: false,
  error: null,
  tokens: null,
  transfers: null,
  balance: null,
  tokenBalance: null,
};

// 创建全局状态 atom
export const alchemyStateAtom = atom<AlchemyState>(initialState);

// getTokensForOwner 接口参数
export interface GetTokensForOwnerOptions {
  contractAddresses?: string[];
  pageKey?: string;
}

// getAssetTransfers 接口参数
export interface GetAssetTransfersParams {
  fromBlock?: string;
  toBlock?: string;
  order?: string;
  fromAddress?: string;
  toAddress?: string;
  contractAddresses?: string[];
  excludeZeroValue?: boolean;
  category?: AssetTransfersCategory[];
  maxCount?: number;
  pageKey?: string;
  withMetadata?: boolean;
}

// 获取用户持有的代币
export const getTokensForOwner = atom(
  null,
  async (
    get,
    set,
    params: { addressOrName: string; options?: GetTokensForOwnerOptions }
  ) => {
    const { addressOrName, options } = params;

    // 更新加载状态
    set(alchemyStateAtom, {
      ...get(alchemyStateAtom),
      isLoading: true,
      error: null,
    });

    try {
      // 调用 Alchemy API 获取用户持有的代币
      const tokens = await alchemy.core.getTokensForOwner(
        addressOrName,
        options
      );

      // 更新状态
      set(alchemyStateAtom, {
        ...get(alchemyStateAtom),
        isLoading: false,
        tokens,
      });

      return tokens;
    } catch (error) {
      // 处理错误
      const errorMessage =
        error instanceof Error ? error.message : "GetTokensForOwner Error";

      set(alchemyStateAtom, {
        ...get(alchemyStateAtom),
        isLoading: false,
        error: errorMessage,
      });

      throw error;
    }
  }
);

// 获取资产转移历史
export const getAssetTransfers = atom(
  null,
  async (get, set, params: GetAssetTransfersParams) => {
    // 更新加载状态
    set(alchemyStateAtom, {
      ...get(alchemyStateAtom),
      isLoading: true,
      error: null,
    });

    try {
      // 调用 Alchemy API 获取资产转移历史
      // @ts-expect-error
      const transfers = await alchemy.core.getAssetTransfers(params);

      // 更新状态
      set(alchemyStateAtom, {
        ...get(alchemyStateAtom),
        isLoading: false,
        transfers,
      });

      return transfers;
    } catch (error) {
      // 处理错误
      const errorMessage =
        error instanceof Error ? error.message : "Get AssetTransfers Error";

      set(alchemyStateAtom, {
        ...get(alchemyStateAtom),
        isLoading: false,
        error: errorMessage,
      });

      throw error;
    }
  }
);

// 添加获取特定地址的 NFT 资产转移历史的便捷方法
export const getNFTTransfersForAddress = atom(
  null,
  async (get, _, params: { address: string; pageKey?: string }) => {
    const { address, pageKey } = params;

    // 构建 getAssetTransfers 参数
    const transferParams: GetAssetTransfersParams = {
      fromBlock: "0x0",
      toAddress: address,
      excludeZeroValue: true,
      category: [AssetTransfersCategory.ERC721, AssetTransfersCategory.ERC1155],
      pageKey,
    };

    // 调用 getAssetTransfers 原子函数
    const setGetAssetTransfers = get(getAssetTransfers);
    // @ts-ignore
    return await setGetAssetTransfers(transferParams);
  }
);

export const getEthBalance = atom(
  null,
  async (get, set, params: { addressOrName: string }) => {
    const { addressOrName } = params;
    // 更新加载状态
    set(alchemyStateAtom, {
      ...get(alchemyStateAtom),
      isLoading: true,
      error: null,
    });
    try {
      const data = await alchemy.core.getBalance(addressOrName);
      const balance = formatEther(data.toBigInt())?.toString();
      // 更新状态
      set(alchemyStateAtom, {
        ...get(alchemyStateAtom),
        isLoading: false,
        balance,
      });
      return balance;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Get Balance Error";
      set(alchemyStateAtom, {
        ...get(alchemyStateAtom),
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  }
);

export const getTokenBalance = atom(
  null,
  async (
    get,
    set,
    params: { addressOrName: string; contractAddress: string }
  ) => {
    const { addressOrName, contractAddress } = params;
    // 更新加载状态
    set(alchemyStateAtom, {
      ...get(alchemyStateAtom),
      isLoading: true,
      error: null,
    });
    try {
      const data = await alchemy.core.getTokenBalances(addressOrName, [
        contractAddress,
      ]);
      console.debug("[ALCHEMY] token balance:", data.tokenBalances?.[0].tokenBalance)
      const balance = data.tokenBalances?.[0].tokenBalance
        ? formatEther(BigInt(data.tokenBalances?.[0].tokenBalance))?.toString()
        : "0";
      // 更新状态
      const tokenBalance = {
        ...get(alchemyStateAtom).tokenBalance,
        [contractAddress]: balance,
      };
      set(alchemyStateAtom, {
        ...get(alchemyStateAtom),
        isLoading: false,
        tokenBalance,
      });
      return balance;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Get Balance Error";
      set(alchemyStateAtom, {
        ...get(alchemyStateAtom),
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  }
);

// 切换网络
export const switchNetwork = atom(null, (_, set, network: Network) => {
  // 创建新的 Alchemy 实例
  const newAlchemy = new Alchemy({
    ...alchemyConfig,
    network,
  });

  // 更新全局 alchemy 实例
  // @ts-ignore
  alchemy.config = newAlchemy.config;

  // 清空当前状态
  set(alchemyStateAtom, {
    ...initialState,
  });
});

// Uniswap JSON RPC URL Map
export const uniswapJsonRpcUrlMap = {
  [SupportedChainId.BASE]: [
    `https://base-mainnet.g.alchemy.com/v2/${
      import.meta.env.VITE_ALCHEMY_API_KEY
    }`,
    "https://mainnet.base.org",
  ],
};

// 导出 alchemy 实例以便直接使用
export { alchemy };
