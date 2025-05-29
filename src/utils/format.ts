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

// 格式化钱包地址，显示前4位和后4位
export const formatAddress = (address: string | undefined) => {
  if (!address || address.length < 10) return address || "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// 格式化数字显示，支持 K (千), M (百万), B (十亿) 单位，并在整数时省略小数位
export const formatNumber = (num: number): string => {
  // 处理非数字、Infinity 或 NaN 的情况
  if (!Number.isFinite(num)) {
    return num.toString(); // 或者返回 'N/A', '-' 等，取决于你的需求
  }

  // 获取数字的绝对值和符号
  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  let value: number;
  let suffix: string = '';

  if (absNum >= 1_000_000_000) { // 大于等于 10 亿 (Billion)
    value = absNum / 1_000_000_000;
    suffix = 'B';
  } else if (absNum >= 1_000_000) { // 大于等于 100 万 (Million)
    value = absNum / 1_000_000;
    suffix = 'M';
  } else if (absNum >= 1_000) { // 大于等于 1 千 (Thousand)
    value = absNum / 1_000;
    suffix = 'K';
  } else {
    // 对于小于 1000 的数字，直接返回其字符串形式
    return num.toString();
  }

  // 格式化数值：
  // 1. toFixed(1) 确保至少有一位小数（如果需要四舍五入）
  // 2. parseFloat() 将字符串转换回数字，这会移除尾部的 .0 (例如 "1.0" 变为 1)
  // 3. toString() 将最终数字转换回字符串
  const formattedValue = parseFloat(value.toFixed(1)).toString();

  return sign + formattedValue + suffix;
};
