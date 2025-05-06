import React, { useEffect, useState } from "react";
import { useAtom } from "jotai";
import {
  getTokensForOwner,
  getEthBalance,
  getTokenBalance,
} from "../store/alchemyStore";
import styles from "./WalletAssets.module.css";
import defaultTokenIcon from "../assets/token_default.svg";
import EthIcon from "../assets/eth.svg";
import NikoIcon from "../../public/nyko.png";
import TokenIcon from "./TokenIcon";
import { parseEther } from "viem";
import { formattedBalance } from "../utils/format.ts";
import { OwnedToken } from "alchemy-sdk";

interface WalletAssetsProps {
  walletAddress: string | undefined;
}

const WalletAssets: React.FC<WalletAssetsProps> = ({ walletAddress }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [tokens, setTokens] = useState<OwnedToken[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [ethBalance, setEthBalance] = useState<bigint>(0n);
  const [, fetchTokens] = useAtom(getTokensForOwner);
  const [, fetchEthBalance] = useAtom(getEthBalance);
  const [, fetchTokenBalance] = useAtom(getTokenBalance);

  useEffect(() => {
    const loadAssets = async () => {
      if (!walletAddress) return;

      setIsLoading(true);
      setError(null);

      try {
        // 获取 ETH 余额
        const ethBalance = await fetchEthBalance({
          addressOrName: walletAddress,
        });
        setEthBalance(parseEther(ethBalance));

        // 获取用户持有的代币列表
        const tokenResult = await fetchTokens({
          addressOrName: walletAddress,
          options: {
            contractAddresses: ["0x129966d7D25775b57E3C5b13b2E1c2045FBc4926"],
          },
        });

        // 只获取前 2 个代币
        const topTokens = tokenResult.tokens.slice(0, 2);

        setTokens(topTokens);
      } catch (err) {
        console.error("get assets failed:", err);
        setError("Failed to load assets");
      } finally {
        setIsLoading(false);
      }
    };

    loadAssets();
  }, [walletAddress, fetchTokens, fetchEthBalance, fetchTokenBalance]);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (error) {
    return <div className={styles.errorContainer}>{error}</div>;
  }

  if (tokens.length === 0 && ethBalance === 0n) {
    return <div className={styles.emptyContainer}>No assets found.</div>;
  }

  return (
    <div className={styles.assetListContainer}>
      {/* eth */}
      <div
        className={`${styles.assetItem} ${
          tokens.length > 0 ? styles.withBorder : ""
        }`}
      >
        <div className={styles.assetInfo}>
          <TokenIcon logoURI={EthIcon} />
          <span className={styles.tokenName}>ETH</span>
        </div>
        <div className={styles.tokenBalance}>
          {formattedBalance(ethBalance)}
        </div>
      </div>
      {tokens.map((token, index) => (
        <div
          key={token.contractAddress}
          className={`${styles.assetItem} ${
            index === 0 && tokens.length > 1 ? styles.withBorder : ""
          }`}
        >
          <div className={styles.assetInfo}>
            <TokenIcon
              logoURI={
                token.symbol === "NYKO"
                  ? NikoIcon
                  : token.logo || defaultTokenIcon
              }
            />
            <span className={styles.tokenName}>
              {token.symbol || token.name || "Unknown Token"}
            </span>
          </div>
          <div className={styles.tokenBalance}>
            {formattedBalance(BigInt(token.rawBalance || "0"), token.decimals)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default WalletAssets;
