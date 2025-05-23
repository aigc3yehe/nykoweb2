import React from "react";
import { useAtom } from "jotai";
import { accountAtom } from "../store/accountStore";
import styles from "./WorkflowInfoPanel.module.css";
import avatarSvg from "../assets/Avatar.svg";
import twitterSvg from "../assets/twitter.svg";
import createSvg from "../assets/create.svg";
import shareSvg from "../assets/share.svg";
import coinsSvg from "../assets/coins.svg";
import dexSvg from "../assets/dex.svg";
import virtualsIcon from "../assets/virtuals.svg";
import flaunchIcon from "../assets/flaunch.png";
import codeSvg from "../assets/code.svg";
import { WorkflowDetail, TOKENIZATION_LAUNCHPAD_TYPE } from "../store/workflowStore";
import {
  //fetchTokenizationState,
  //setModelFlag,
  tokenizationStateAtom,
  FlaunchStatusResponse,
} from "../store/tokenStore";
//import { usePrivy } from "@privy-io/react-auth";
import { Link } from "react-router-dom";
import {RUN_WORKFLOW_SERVICE_CONFIG} from "../utils/plan";
import {sendMessage} from "../store/chatStore.ts";

interface WorkflowInfoPanelProps {
  workflow: WorkflowDetail;
}

const WorkflowInfoPanel: React.FC<WorkflowInfoPanelProps> = ({ workflow }) => {
  const [accountState] = useAtom(accountAtom);
  //const showGeneratePopup = useSetAtom(showGeneratePopupAtom);
  //const setTokenizationFlag = useSetAtom(setModelFlag);
  //const fetchState = useSetAtom(fetchTokenizationState);
  const [tokenizationState] = useAtom(tokenizationStateAtom);
  const { data } = tokenizationState;
  const [, sendMessageAction] = useAtom(sendMessage);
  //const { user } = usePrivy();

  // 检查当前用户是否是模型创建者
  const isFlag = workflow.flag !== null && workflow.flag !== "";
  const isShowToken = accountState.did === workflow.creator && !isFlag;

  // 获取Twitter显示名称
  const getDisplayName = () => {
    if (workflow.users.twitter?.name) {
      return workflow.users.twitter.name;
    } else if (workflow.users.twitter?.username) {
      return workflow.users.twitter.username;
    } else {
      // 如果没有Twitter信息，显示缩略的钱包地址
      return (
        workflow.creator.substring(0, 6) +
        "..." +
        workflow.creator.substring(workflow.creator.length - 4)
      );
    }
  };

  // 获取头像URL
  const getAvatarUrl = () => {
    if (workflow.users.twitter?.profilePictureUrl) {
      return workflow.users.twitter.profilePictureUrl;
    } else if (workflow.users.twitter?.username) {
      // 备用方案
      return `https://unavatar.io/twitter/${workflow.users.twitter.username}`;
    } else {
      return avatarSvg;
    }
  };

  // 格式化时间
  const formatCreationTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date
      .toLocaleDateString(undefined, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\//g, ".");
  };

  // 获取LoraName
  const getModelName = () => {
    return workflow.model || "Unknown";
  };

  // 获取训练状态
  const getTrainingStatus = () => {
    return { text: "Ready", className: styles.statusReady, isReady: true };
  };

  const status = getTrainingStatus();

  const handleGenerate = () => {
    // 打开生成弹窗，传入模型信息
    sendMessageAction("I want to use this workflow.").then(() => {
      console.log("run this workflow");
    })
  };

  // 点击分享按钮触发x的分享
  const handleShare = () => {
    // 1. 获取当前页面URL并构建设模型链接
    const currentUrl = window.location.href;
    const workflowLinkUrl = new URL(currentUrl);
    // 确保分享链接是模型详情页的基础链接，不包含其他可能存在的查询参数，然后添加模型ID和名称
    const baseUrl = `${workflowLinkUrl.protocol}//${workflowLinkUrl.host}${workflowLinkUrl.pathname}`;
    const shareUrl = new URL(baseUrl);
    shareUrl.searchParams.set("workflow_id", workflow.id.toString());
    shareUrl.searchParams.set("workflow_name", workflow.name);
    const workflowLink = shareUrl.toString();

    // 修改 renderTokenizationStatus 函数中的完成状态部分
    let symbol = "";
    if (data && "success" in data && "state" in data) {
      // 如果是 FlaunchStatusResponse
      const statusData = data as FlaunchStatusResponse;
      if (statusData.state === "completed" && statusData.collectionToken) {
        symbol = statusData.collectionToken.symbol;
      }
    }

    console.log(symbol);

    // 2. 根据是否有代币确定分享文本
    let tweetText = "";
    const workflowName = workflow.name;

    if (symbol) {
      tweetText = `This style is insane!\n${workflowName} is an amazing AI workflow I found on @niyoko_agent \nit even has its own token $${symbol}\nCome create and trade with me!\n${workflowLink}`;
    } else {
      tweetText = `This style is insane!\n${workflowName} is an amazing AI workflow I found on @niyoko_agent \nCome create and mine with me!\n${workflowLink}`;
    }

    // 3. 构建 Twitter Intent URL
    const encodedTweetText = encodeURIComponent(tweetText);
    const twitterUrl = `https://x.com/intent/post?text=${encodedTweetText}`;

    // 4. 在新标签页中打开 Twitter 分享链接
    window.open(twitterUrl, "_blank", "noopener,noreferrer");
  };

  const handleToken = async () => {
    // 发起 token 化请求
    const flag = "tokenization";
    const workflowId = workflow.id;
    console.log("flag workflowId", flag, workflowId);
    // await setTokenizationFlag({ workflowId, flag, user: user?.id || "" });

    // 立即获取最新状态
    // await fetchState({ workflowId, workflow_tokenization_id: workflow?.model_tokenization?.id || 0, refreshState: true });
  };

  const handleTwitterClick = () => {
    console.log("Twitter clicked");
    // 实现Twitter点击功能
    if (workflow.users.twitter?.username) {
      window.open(
        `https://twitter.com/${workflow.users.twitter?.username}`,
        "_blank"
      );
    } else {
      console.log("No Twitter username found");
    }
  };

  return (
    <div className={styles.infoPanel}>
      {/* 第一行: 创建者信息 */}
      <div className={styles.creatorHeader}>
        <div className={styles.creatorInfo}>
          <img
            src={getAvatarUrl()}
            alt="Creator Avatar"
            className={styles.creatorAvatar}
            onError={(e) => {
              (e.target as HTMLImageElement).src = avatarSvg;
            }}
          />
          <span className={styles.creatorName}>{getDisplayName()}</span>
        </div>

        {workflow.users.twitter && (
          <button className={styles.twitterButton} onClick={handleTwitterClick}>
            <img
              src={twitterSvg}
              alt="Twitter"
              className={styles.twitterIcon}
            />
          </button>
        )}
      </div>

      {/* 第二行: 模型详细信息 */}
      <div className={styles.workflowDetailsContainer}>
        {/* Type */}
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Type</span>
          <span className={styles.detailValue}>Workflow</span>
        </div>

        {/* Keyword (Lora Name) */}
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Model</span>
          <span className={styles.detailValue}>{getModelName()}</span>
        </div>

        {/* Used */}
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Used</span>
          <span className={styles.detailValue}>{workflow.usage}</span>
        </div>

        {/* Published */}
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Published</span>
          <span className={styles.detailValue}>
            {formatCreationTime(workflow.created_at)}
          </span>
        </div>

        {/* Status */}
        <div className={`${styles.detailRow} ${styles.lastRow}`}>
          <span className={styles.detailLabel}>Status</span>
          <span className={`${styles.detailValue} ${status.className}`}>
            {status.text}
          </span>
        </div>
      </div>

      {/* 按钮组 */}
      <div className={styles.actionButtonsContainer}>
        {status.isReady ? (
          <>
            {/* Ready状态下的生成按钮 */}
            <button className={styles.generateButton} onClick={handleGenerate}>
              <img
                src={createSvg}
                alt="Generate"
                className={styles.buttonIcon}
              />
              <div className="flex items-end gap-[1px]">
                <span>Generate</span>
                <span className="!text-xs">
                  ({RUN_WORKFLOW_SERVICE_CONFIG.cu} Credits)
                </span>
              </div>
            </button>

            {/* 分享按钮 */}
            <button className={styles.shareButton} onClick={handleShare}>
              <img src={shareSvg} alt="Share" className={styles.buttonIcon} />
            </button>

            {/* Token按钮 - 仅当用户是模型创建者时显示 */}
            {isShowToken && (
              <button className={styles.mintButton} onClick={handleToken}>
                <img src={coinsSvg} alt="Token" className={styles.buttonIcon} />
              </button>
            )}

            {/* Token按钮 - Dexscreener 跳转 */}
            {workflow?.workflow_tokenization?.meme_token && (
              <Link
                target="_blank"
                to={`https://dexscreener.com/base/${workflow.workflow_tokenization.meme_token}`}
              >
                <button className={styles.dexButton}>
                  <img
                    src={dexSvg}
                    alt="Dexscreener"
                    className={styles.buttonIcon}
                  />
                </button>
              </Link>
            )}
            {/* Token按钮 - Flaunch 跳转 */}
            {workflow?.workflow_tokenization?.meme_token && (
              <Link
                target="_blank"
                to={
                  workflow?.workflow_tokenization?.launchpad ==
                  TOKENIZATION_LAUNCHPAD_TYPE.VIRTUALS
                    ? `https://app.virtuals.io/virtuals/${workflow.workflow_tokenization.metadata?.virtuals_id}`
                    : `https://flaunch.gg/base/coin/${workflow.workflow_tokenization.meme_token}`
                }
              >
                <button
                  className={
                    workflow?.workflow_tokenization?.launchpad ==
                    TOKENIZATION_LAUNCHPAD_TYPE.VIRTUALS
                      ? styles.virtualsButton
                      : styles.flaunchButton
                  }
                >
                  <img
                    src={
                      workflow?.workflow_tokenization?.launchpad ==
                      TOKENIZATION_LAUNCHPAD_TYPE.VIRTUALS
                        ? virtualsIcon
                        : flaunchIcon
                    }
                    alt="Launchpad"
                    className={styles.buttonIcon}
                  />
                </button>
              </Link>
            )}
          </>
        ) : (
          <>
            {/* 训练中状态按钮 */}
            <button className={styles.trainingButton} disabled>
              <img src={codeSvg} alt="Code" className={styles.buttonIcon} />
              <span>Training...</span>
            </button>

            {/* 分享按钮 */}
            <button className={styles.shareButton} onClick={handleShare}>
              <img src={shareSvg} alt="Share" className={styles.buttonIcon} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default WorkflowInfoPanel;
