import React, { useState, useRef, useEffect } from "react";
import { useLogout } from "@privy-io/react-auth";
import styles from "./AccountPopup.module.css";
import GoldIcon from "../assets/gold.svg";
import PlanPlusIcon from "../assets/plan_plus.svg";
import KeyIcon from "../assets/key.svg";
import LogoutIcon from "../assets/logout.svg";
import CopyIcon from "../assets/copy_address.svg";
import DoneIcon from "../assets/done.svg";
import CreditIcon from "../assets/credit.svg";
import CloseIcon from "../assets/close_account.svg";
import RocketIcon from "../assets/bxs_rocket.svg";
import WalletAssets from "./WalletAssets";
import { Link, useNavigate } from "react-router-dom";
import { PLAN_TYPE, bindReferralCode } from "../services/userService.ts";
import { useAtom } from "jotai";
import { refreshUserPlanAtom, updateReferrals } from "../store/accountStore";
import { accountAtom } from "../store/accountStore";

interface AccountPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: () => void;
  onLogout: () => void;
  userData: {
    name?: string;
    username?: string;
    profilePictureUrl?: string;
    walletAddress?: string;
    plan?: string;
    linked_wallet?: string;
  };
  anchorPosition?: DOMRect | null;
}

const AccountPopup: React.FC<AccountPopupProps> = ({
  isOpen,
  onClose,
  onExport,
  onLogout,
  userData,
  anchorPosition,
}) => {
  const [activeTab, setActiveTab] = useState("Assets");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isEditingReferrer, setIsEditingReferrer] = useState(false);
  const [referrerInput, setReferrerInput] = useState("");
  const [referrerError, setReferrerError] = useState("");
  const [isBindingReferrer, setIsBindingReferrer] = useState(false);
  const [walletCopySuccess, setWalletCopySuccess] = useState(false);
  const [inviteCopySuccess, setInviteCopySuccess] = useState(false);
  const [referrerTwitter, setReferrerTwitter] = useState<string>("");


  const popupRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [, refreshUserPlan] = useAtom(refreshUserPlanAtom);
  const [accountState] = useAtom(accountAtom);
  const [, updateReferralsAtom] = useAtom(updateReferrals);
  const { credits, referrals } = accountState;

  // 在弹窗打开时刷新用户的credits
  useEffect(() => {
    if (isOpen) {
      refreshUserPlan();
    }
  }, [isOpen, refreshUserPlan]);

  // 从store中获取邀请人Twitter信息
  useEffect(() => {
    if (referrals?.referrer_twitter?.username) {
      setReferrerTwitter(referrals.referrer_twitter.username);
    } else if (referrals?.referrer_code) {
      setReferrerTwitter(referrals.referrer_code);
    }
  }, [referrals?.referrer_twitter, referrals?.referrer_code]);

  // 格式化数字，添加千位分隔符，如果为0则显示无限符号
  const formatNumber = (num: number) => {
    if (num === 0) {
      return "0"; // 无限符号
    }
    return new Intl.NumberFormat().format(num);
  };

  // 使用 useLogout hook 实现带回调的登出功能
  const { logout } = useLogout({
    onSuccess: () => {
      console.log("logout success");
      // 调用外部传入的登出回调
      onLogout();
      // 关闭弹窗
      onClose();
      // 可能的其他后续操作，如重定向到首页等
      setIsLoggingOut(false);
    },
  });

  // 处理登出按钮点击
  const handleLogout = () => {
    setIsLoggingOut(true);
    logout();
  };

  // 计算弹窗位置
  const calculatePosition = () => {
    if (!anchorPosition) return {};

    return {
      position: "absolute" as const,
      top: `${anchorPosition.bottom + 8}px`,
      right: `${window.innerWidth - anchorPosition.right}px`,
    };
  };

  // 格式化钱包地址，显示前4位和后4位
  const formatAddress = (address: string | undefined) => {
    if (!address || address.length < 10) return address || "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // 获取高清头像（去掉URL中的_normal）
  const getHDProfilePicture = (url: string | undefined) => {
    if (!url) return "";
    return url.replace("_normal.jpg", ".jpg").replace("_normal.png", ".png");
  };

  // 格式化用户名，添加@前缀
  const formatName = (name: string | undefined) => {
    if (!name) return `@${userData.username}`;
    return `@${name}`;
  };

  // 复制邀请码到剪贴板
  const copyInviteCode = () => {
    if (referrals?.invite_code) {
      navigator.clipboard.writeText(referrals.invite_code);
      setInviteCopySuccess(true);
      setTimeout(() => {
        setInviteCopySuccess(false);
      }, 3000);
    }
  };

  // 复制钱包地址到剪贴板
  const copyWalletAddress = () => {
    if (userData.walletAddress) {
      navigator.clipboard.writeText(userData.walletAddress);
      setWalletCopySuccess(true);
      setTimeout(() => {
        setWalletCopySuccess(false);
      }, 3000);
    }
  };



  // 处理绑定推荐人邀请码
  const handleBindReferrer = async () => {
    if (!referrerInput.trim() || !accountState.did) return;
    
    setIsBindingReferrer(true);
    setReferrerError("");
    
    try {
      const result = await bindReferralCode({
        user: accountState.did,
        referrer_code: referrerInput.trim()
      });
      
      if (result.statusCode === 200) {
        // 成功绑定，更新本地状态
        updateReferralsAtom({
          invite_code: referrals?.invite_code || null,
          referrer_code: referrerInput.trim(),
          point_reward_ratio: referrals?.point_reward_ratio || 0
        });
        setIsEditingReferrer(false);
        setReferrerInput("");
      } else {
        setReferrerError(result.message || "Binding failed");
      }
    } catch (error) {
      setReferrerError((error as Error).message || "Binding failed");
    } finally {
      setIsBindingReferrer(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        ref={popupRef}
        className={styles.accountPopup}
        style={calculatePosition()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 第一部分：用户信息 */}
        <div className={styles.userInfoContainer}>
          <div className={styles.userInfoContent}>
            <img
              src={getHDProfilePicture(userData.profilePictureUrl)}
              alt="avatar"
              className={styles.popupAvatar}
            />
            <div className={styles.userDetails}>
              <div className={styles.userNameRow}>
                <div className={styles.userNameContainer}>
                  <span className={styles.userName}>
                    {formatName(userData.name)}
                  </span>
                  {userData.plan === PLAN_TYPE.PREMIUM_PLUS ? (
                    <div className={styles.premiumPlusBadge}>
                      <img
                        src={PlanPlusIcon}
                        alt="PremiumPlus"
                        width="14"
                        height="14"
                      />
                      <span className={styles.premiumPlusText}>Premium +</span>
                    </div>
                  ) : userData.plan === PLAN_TYPE.PREMIUM ? (
                    <div className={styles.premiumBadge}>
                      <img
                        src={GoldIcon}
                        alt="Premium"
                        width="14"
                        height="14"
                      />
                      <span className={styles.premiumText}>Premium</span>
                    </div>
                  ) : (
                    <div className={styles.freeBadge}>
                      <span className={styles.freeText}>Free</span>
                    </div>
                  )}
                </div>
                <button
                  className={styles.closeButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                >
                  <img src={CloseIcon} alt="close" width="24" height="24" />
                </button>
              </div>
              <div className={styles.walletAddressRow}>
                <span className={styles.walletAddress}>
                  {formatAddress(userData.walletAddress)}
                </span>
                <button
                  className={styles.copyButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    copyWalletAddress();
                  }}
                >
                  <img 
                    src={walletCopySuccess ? DoneIcon : CopyIcon} 
                    alt={walletCopySuccess ? "copied" : "copy"} 
                    width="20" 
                    height="20" 
                  />
                </button>
              </div>
              <Link to="/link-wallet">
                <div className="text-[#6366F1] text-xs leading-none font-normal capitalize">
                  {userData.linked_wallet ? (
                    <>Linked {formatAddress(userData.linked_wallet)} &gt;</>
                  ) : (
                    <>Link to another wallet to this account &gt;</>
                  )}
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* 新增：邀请码模块 */}
        <div className={styles.referralContainer}>
          {/* 用户邀请码展示 */}
          <div className={styles.referralRow}>
            <span className={styles.referralLabel}>
              Referral Code: <span className={styles.referralCode}>{referrals?.invite_code || "Loading..."}</span>
            </span>
            <button
              className={styles.copyButton}
              onClick={(e) => {
                e.stopPropagation();
                copyInviteCode();
              }}
              disabled={!referrals?.invite_code}
            >
              <img 
                src={inviteCopySuccess ? DoneIcon : CopyIcon} 
                alt={inviteCopySuccess ? "copied" : "copy"} 
                width="20" 
                height="20" 
              />
            </button>
          </div>

          {/* 推荐人邀请码 */}
          <div className={styles.referrerSection}>
            {referrals?.referrer_code ? (
              <div className={styles.referralRow}>
                <span className={styles.inviterLabel}>
                  Inviter: @{referrerTwitter || "Loading..."}
                </span>
              </div>
            ) : isEditingReferrer ? (
              <div className={styles.referrerInputSection}>
                <div className={styles.referrerInputContainer}>
                  <input
                    type="text"
                    value={referrerInput}
                    onChange={(e) => setReferrerInput(e.target.value)}
                    placeholder="Enter the code"
                    className={`${styles.referrerInput} ${referrerError ? styles.inputError : ''}`}
                  />
                  <button
                    className={styles.confirmButton}
                    onClick={handleBindReferrer}
                    disabled={!referrerInput.trim() || isBindingReferrer}
                  >
                    {isBindingReferrer ? "Loading..." : "Confirm"}
                  </button>
                </div>
                {referrerError && (
                  <div className={styles.errorMessage}>{referrerError}</div>
                )}
              </div>
            ) : (
              <div 
                className={styles.referrerPrompt}
                onClick={() => setIsEditingReferrer(true)}
              >
                You can bind someone else's invitation code and he can get extra points &gt;
              </div>
            )}
          </div>
        </div>

        {/* 第二部分：标签页 */}
        <div className={styles.tabsContainer}>
          <button
            className={`${styles.tabButton} ${
              activeTab === "Assets" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("Assets")}
          >
            Assets
          </button>
          <button
            style={{
              display: "none",
            }}
            className={`${styles.tabButton} ${
              activeTab === "Activity" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("Activity")}
          >
            Activity
          </button>
        </div>

        {/* 第三部分：内容区域 */}
        <div className={styles.contentContainer}>
          {activeTab === "Assets" ? (
            <div className={styles.assetsContent}>
              <WalletAssets walletAddress={userData.walletAddress} />
            </div>
          ) : (
            <div className={styles.activityContent}>{/* 活动内容占位符 */}</div>
          )}
        </div>

        {/* 第四部分：导出按钮 */}
        <div
          className={styles.exportContainer}
          onClick={() => {
            onClose();
            onExport();
          }}
        >
          <div className={styles.actionRow}>
            <img src={KeyIcon} alt="export" width="16" height="16" />
            <span className={styles.exportText}>Export Private Key</span>
          </div>
        </div>

        {/* 第五部分：Plan & Pricing按钮 */}
        <div
          className={styles.planContainer}
          onClick={() => {
            onClose();
            // 使用React Router的navigate函数导航到pricing页面
            navigate("/pricing");
          }}
        >
          <div className={styles.actionRow}>
            <img src={RocketIcon} alt="export" width="16" height="16" />
            <span className={styles.planText}>Plan & Pricing</span>
          </div>
        </div>

        {/* 新增：第六部分，显示用户Credits */}
        <div
          className={styles.creditsContainer}
          onClick={() => {
            onClose();
            navigate("/pricing");
          }}
        >
          <div className={styles.actionRow}>
            <img src={CreditIcon} alt="credit" width="16" height="16" />
            <span className={styles.creditsLabel}>Credits: {formatNumber(credits || 0)}</span>
          </div>
        </div>

        {/* 第七部分：登出按钮 */}
        <div
          className={`${styles.logoutContainer} ${
            isLoggingOut ? styles.disabled : ""
          }`}
          onClick={isLoggingOut ? undefined : handleLogout}
        >
          <div className={styles.actionRow}>
            <img src={LogoutIcon} alt="logout" width="16" height="16" />
            <span className={styles.logoutText}>
              {isLoggingOut ? "Logging Out..." : "Log Out"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPopup;
