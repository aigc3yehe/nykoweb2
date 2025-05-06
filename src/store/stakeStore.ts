/* eslint-disable @typescript-eslint/ban-ts-comment */
import { atom } from "jotai";
import { formatEther } from "viem";
import { publicClient } from "../providers/wagmiConfig";
import NikoTokenLockerAbi from "../abi/INikoTokenLocker.json";

// 定义状态接口
interface StakeState {
  isLoading: boolean;
  error: string | null;
  amount: number;
  pendingClaim: number;
  unstakeTime: number;
}

// 初始状态
const initialState: StakeState = {
  isLoading: false,
  error: null,
  amount: 0,
  pendingClaim: 0,
  unstakeTime: 0,
};

// 创建全局状态 atom
export const stakeStateAtom = atom<StakeState>(initialState);

// Get token staked info
export const getStakedInfo = atom(
  null,
  async (get, set, params: { contract: string, user: string }) => {
    const { contract, user } = params;
    const stakeInfo = await publicClient.readContract({
      abi: NikoTokenLockerAbi,
      address: contract as `0x${string}`,
      functionName: "stakedInfo",
      args: [user as `0x${string}`]
    });
    console.log("stakeInfo:", stakeInfo);
    const amount = formatEther((stakeInfo as { amount: bigint })?.amount);
    const pendingClaim = formatEther(
      (stakeInfo as { pendingClaim: bigint })?.pendingClaim
    );
    const unstakeTime = (
      stakeInfo as { unstakeTime: bigint }
    )?.unstakeTime?.toString();

    // 更新加载状态
    set(stakeStateAtom, {
      ...get(stakeStateAtom),
      isLoading: true,
      error: null,
    });

    try {
      // 更新状态
      set(stakeStateAtom, {
        ...get(stakeStateAtom),
        isLoading: false,
        amount: Number(amount),
        pendingClaim: Number(pendingClaim),
        unstakeTime: Number(unstakeTime),
      });

      return stakeInfo;
    } catch (error) {
      // 处理错误
      const errorMessage =
        error instanceof Error ? error.message : "GetTokensForOwner Error";

      set(stakeStateAtom, {
        ...get(stakeStateAtom),
        isLoading: false,
        error: errorMessage,
      });

      throw error;
    }
  }
);
