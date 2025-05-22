import { formatUnits, parseEther } from "viem";

export const getAmountWithSlippage = (
  amount: bigint | undefined,
  slippage: string,
  swapType: "EXACT_IN" | "EXACT_OUT"
) => {
  if (amount == null) {
    return 0n;
  }

  const absAmount = amount < 0n ? -amount : amount;
  const slippageMultiplier =
    swapType === "EXACT_IN"
      ? BigInt(1e18) - parseEther(slippage)
      : BigInt(1e18) + parseEther(slippage);
  return (absAmount * slippageMultiplier) / BigInt(1e18);
};

export const formattedBalance = (balance: bigint, decimal = 18) => {
  if (!balance) return "0";
  const full = formatUnits(balance, decimal);
  const [intPart, fracPart = ""] = full.split(".");
  if (!fracPart) return intPart;
  const trimmed = fracPart.slice(0, 5).replace(/0+$/, "");
  return trimmed ? `${intPart}.${trimmed}` : intPart;
};
