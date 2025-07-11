import React, { useState, useRef, useEffect } from "react";
import imageIcon from "../../assets/image.svg";
import closeIcon from "../../assets/close.svg";
import uploadingIcon from "../../assets/uploading.svg";
import okIcon from "../../assets/ok.svg";
import checkAgreeIcon from "../../assets/check_agree.svg";
import checkedAgreeIcon from "../../assets/checked_agree.svg";
import selectModelIcon from "../../assets/select_model.svg";
import uploadIcon from "../../assets/upload.svg";
import createWorkflowIcon from "../../assets/create_workflow.svg";
import deleteIcon from "../../assets/delete.svg";
import deleteDisableIcon from "../../assets/delete_disable.svg";
import {
  TRAIN_MODEL_SERVICE_CONFIG,
} from "../../utils/plan";
import { WorkflowDetail } from '../../store/workflowStore';
import xIcon from "../../assets/x.svg";
import { getScaledImageUrl } from '../../utils/image';
import modifyIcon from '../../assets/web2/modify.svg';
import animateIcon from '../../assets/web2/animate.svg';
import generatingIcon from '../../assets/web2/generating.svg';
import videoIcon from '../../assets/web2/video.svg';

interface ImageUploadState {
  totalCount: number;
  uploadedCount: number;
  isUploading: boolean;
  finishUpload: boolean;
}

export interface ChatMessageProps {
  role: string;
  content: string;
  type?:
    | "text"
    | "upload_image"
    | "model_config"
    | "generate_result"
    | "generating_image"
    | "tokenization_agreement"
    | "create_workflow"
    | "run_workflow"
    | "workflow_generate_result"
    | "create_workflow_details"
    | "modify_image"
    | "uploaded_image"
    | "generating_video"
    | "video_generate_result"
    | "animating_image"
    | "minting_nft"
    | "generation_timeout"
    | "tokenization_timeout"
    | "minting_success";
  imageUploadState?: ImageUploadState;
  uploadedFiles?: Array<{ name: string; url: string }>;
  modelParam?: {
    modelName?: string;
    description?: string;
  };
  agree?: boolean;
  images?: string[];
  videos?: string[];
  cu?: number;
  imageWidth?: number;
  imageHeight?: number;
  request_id?: string;
  workflow_name?: string;
  workflow_description?: string;
  workflow_prompt?: string;
  workflow_input?: string;
  workflow_output?: string;
  token_id?: string;
  onAddImage?: () => void;
  onConfirmImages?: () => void;
  onRemoveImage?: (url: string) => void;
  onAgree?: () => void;
  onUpdatePrompt?: (text: string) => void;
  onChangeInput?: (type: string) => void;
  onChangeOutput?: (type: string) => void;
  isCreatingWorkflow?: boolean;
  creationSuccess?: boolean;
  onCreateWorkflow?: () => void;
  workflowId?: number;
  workflowImageValue?: string;
  isRunningWorkflow?: boolean;
  onSelectWorkflowImage?: (imageUrl: string, file: File | null) => void;
  onRunWorkflow?: () => void;
  isConfirmedWorkflow?: boolean;
  onNavigateToWorkflow?: (workflowName: string) => void;
  workflowReferenceImage?: {
    isUploading: boolean;
    uploadedUrl: string;
    fileName: string;
    error?: string;
  };
  onUploadReferenceImage?: () => void;
  onRemoveReferenceImage?: () => void;
  workflow_extra_prompt?: string;
  onUpdateWorkflowExtraPrompt?: (prompt: string) => void;
  currentWorkflow?: WorkflowDetail | null;
  isLastMessage?: boolean;
  onPartiallyModify?: () => void;
  onAnimate?: () => void;
  onMintNFT?: () => void;
  aiProviders?: {
    providers: Array<{
      name: string;
      models: Array<{
        name: string;
        support_input_types: string[];
        support_output_types: string[];
      }>;
    }>;
    selectedProvider: string;
    selectedModel: string;
    isLoading: boolean;
  };
  onSelectProvider?: (provider: string) => void;
  onRetryPolling?: () => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  role,
  content,
  type = "text",
  imageUploadState = {
    totalCount: 0,
    uploadedCount: 0,
    isUploading: false,
    finishUpload: false,
  },
  uploadedFiles = [],
  modelParam = { modelName: undefined, description: undefined },
  agree = false,
  images = [],
  videos = [],
  cu = 0,
  imageWidth = 256,
  imageHeight = 256,
  request_id = "",
  workflow_name = "",
  workflow_description = "",
  workflow_prompt = "",
  workflow_input = "",
  workflow_output = "",
  token_id,
  onAddImage,
  onConfirmImages,
  onRemoveImage,
  onAgree,
  onUpdatePrompt,
  onChangeInput,
  onChangeOutput,
  isCreatingWorkflow = false,
  creationSuccess = false,
  onCreateWorkflow,
  workflowImageValue = '',
  isRunningWorkflow = false,
  onSelectWorkflowImage,
  onRunWorkflow,
  isConfirmedWorkflow = false,
  onNavigateToWorkflow,
  workflowReferenceImage,
  onUploadReferenceImage,
  onRemoveReferenceImage,
  workflow_extra_prompt,
  onUpdateWorkflowExtraPrompt,
  currentWorkflow,
  isLastMessage = false,
  onPartiallyModify,
  onAnimate,
  onMintNFT,
  aiProviders,
  onSelectProvider,
  onRetryPolling,
}) => {
  // 格式化文件名以适应显示
  const formatFileName = (name: string): string => {
    if (name.length <= 9) return name;

    const extension = name.split(".").pop() || "";
    const baseName = name.substring(0, name.length - extension.length - 1);

    return `${baseName.substring(0, 3)}...${baseName.substring(
      baseName.length - 2
    )}.${extension}`;
  };

  // 添加图片生成中组件
  const renderGeneratingImageComponent = () => {
    return (
      <div className="mt-3 h-8 flex items-center gap-1 px-3 rounded-md bg-design-bg-light-blue font-lexend font-normal text-[12px] leading-[100%] text-[#4B5563] select-none">
        <img
          src={generatingIcon}
          alt="Generating"
          className="w-4 h-4 mr-1 animate-spin"
        />
        Generating image, please wait...
      </div>
    );
  };

  // 添加图片修改中组件
  const renderModifyImageComponent = () => {
    return (
      <div className="h-8 flex items-center gap-1 px-3 rounded-md bg-design-bg-light-blue font-lexend font-normal text-[12px] leading-[100%] text-[#4B5563] select-none">
        <img
          src={generatingIcon}
          alt="Modify"
          className="w-4 h-4 mr-1 animate-spin"
        />
        Modifying image, please wait...(ETA 200 sec)
      </div>
    );
  };

  // 处理文本中的链接
  const processContent = (content: string) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = content.split(linkRegex);
    const result = [];

    for (let i = 0; i < parts.length; i += 3) {
      if (i + 2 < parts.length) {
        // 添加链接前的文本
        if (parts[i]) {
          result.push(<span key={`text-${i}`}>{parts[i]}</span>);
        }
        // 添加链接
        result.push(
          <a
            key={`link-${i}`}
            href={parts[i + 2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline cursor-pointer"
          >
            {parts[i + 1]}
          </a>
        );
      } else {
        // 添加剩余的文本
        result.push(<span key={`text-${i}`}>{parts[i]}</span>);
      }
    }

    return result;
  };

  // 更新 renderTokenizationAgreementComponent
  const renderTokenizationAgreementComponent = () => {
    return (
      <button
        className={`w-60 h-9 gap-1 rounded flex items-center justify-center font-jura font-bold text-base leading-none text-center capitalize cursor-pointer ${
          agree 
            ? 'bg-transparent border border-gray-600/30 text-white/15 cursor-not-allowed' 
            : 'bg-blue-500 text-black'
        }`}
        onClick={onAgree}
        disabled={agree}
      >
        <img
          src={agree ? checkedAgreeIcon : checkAgreeIcon}
          alt="Agree"
          className="w-5 h-5"
        />
        I Have Read And Agree
      </button>
    );
  };

  const renderGenerateResultComponent = (cu: number) => {
    // 图片宽度固定为 276px (17.25rem)，高度根据宽高比计算
    const fixedWidth = 17.25; // 276px / 16 = 17.25rem
    let displayWidth = fixedWidth;
    let displayHeight = fixedWidth; // 默认正方形

    if (images.length > 0 && imageWidth && imageHeight) {
      const aspectRatio = imageWidth / imageHeight;
      // 宽度固定，根据宽高比计算高度
      displayHeight = fixedWidth / aspectRatio;
    }

    return (
      <div className="w-full flex flex-col gap-3 mt-2">
        <div className="flex justify-center items-center w-full">
          {/* 只显示第一张图片 */}
          {images.length > 0 && (
            <div
              className="overflow-hidden rounded-[10px] relative mx-auto"
              style={{
                width: `${displayWidth}rem`,
                height: `${displayHeight}rem`,
              }}
            >
              <img
                src={getScaledImageUrl(images[0], 276)}
                alt="Generated Image"
                className="w-full h-full object-cover transition-transform duration-200 cursor-pointer hover:scale-105"
              />
            </div>
          )}
        </div>
        {/* 新增：扩展选项 - 只在最后一条消息时显示 */}
        {isLastMessage && (
          <div className="w-full flex flex-row gap-2">
            {/* Modify 按钮 */}
            <button
              className="h-8 flex items-center gap-1 px-3 rounded-md bg-design-bg-light-blue font-lexend font-normal text-[12px] leading-[100%] text-[#4B5563] transition-all duration-200 hover:bg-blue-100"
              onClick={onPartiallyModify}
            >
              <img src={modifyIcon} alt="Modify" className="w-4 h-4 mr-1" />
              Modify
            </button>
            {/* Animate 按钮 */}
            <button
              className="h-8 flex items-center gap-1 px-3 rounded-md bg-design-bg-light-blue font-lexend font-normal text-[12px] leading-[100%] text-[#4B5563] transition-all duration-200 hover:bg-blue-100"
              onClick={onAnimate}
            >
              <img src={animateIcon} alt="Animate" className="w-4 h-4 mr-1" />
              Animate
            </button>
          </div>
        )}
      </div>
    );
  };

  // 视频生成中组件
  const renderGeneratingVideoComponent = () => {
    return (
      <div className="mt-3 h-8 flex items-center gap-1 px-3 rounded-md bg-design-bg-light-blue font-lexend font-normal text-[12px] leading-[100%] text-[#4B5563] select-none">
        <img
          src={generatingIcon}
          alt="Generating Video"
          className="w-4 h-4 mr-1 animate-spin"
        />
        Generating video, please wait...(ETA 600 sec)
      </div>
    );
  };

  // 图片动画中组件
  const renderAnimatingImageComponent = () => {
    return (
      <div className="mt-3 h-8 flex items-center gap-1 px-3 rounded-md bg-design-bg-light-blue font-lexend font-normal text-[12px] leading-[100%] text-[#4B5563] select-none">
        <img
          src={generatingIcon}
          alt="Animating"
          className="w-4 h-4 mr-1 animate-spin"
        />
        Animating image, please wait...(ETA 600 sec)
      </div>
    );
  };

  // 视频生成结果组件
  const renderVideoResultComponent = (cu: number) => {
    return (
      <div className="w-full flex flex-col gap-12 mt-2">
        <div className="flex justify-center items-center w-full">
          {videos.length > 0 && (
            <div
              className="overflow-hidden rounded-[10px] relative mx-auto"
              style={{ width: '17.25rem', height: '17.25rem' }}
            >
              <video
                src={videos[0]}
                controls
                className="w-full h-full object-cover rounded-[10px]"
                style={{ background: '#000' }}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}
        </div>
        {/* 可选扩展按钮等可后续补充 */}
      </div>
    );
  };

  // 生成超时/重试组件
  const renderTimeoutRetryComponent = () => {
    return (
      <div className="w-full flex flex-col gap-2 mt-2 p-4 rounded-lg bg-red-50 border border-red-200">
        <div className="font-lexend text-sm text-red-500">{content}</div>
        {isLastMessage && (
          <button
            className="w-fit h-8 px-4 rounded-md bg-red-500 text-white font-lexend text-xs hover:bg-red-600 transition"
            onClick={onRetryPolling}
          >
            Continue refreshing query
          </button>
        )}
      </div>
    );
  };

  // 用户上传图片渲染
  const renderUserUploadedImageComponent = () => {
    if (!images || images.length === 0) return null;
    return (
      <div className="w-full flex flex-col gap-12 mt-2">
        <div className="flex justify-end items-center w-full">
          <div
            className="overflow-hidden rounded-[10px] relative flex-shrink-0"
            style={{ width: '17.25rem', height: '17.25rem' }}
          >
            <img
              src={images[0]}
              alt="User Uploaded"
              className="w-full h-full object-cover rounded-[10px]"
            />
          </div>
        </div>
      </div>
    );
  };

  const showContent = !(role === "user" && type === "uploaded_image");

  return (
    <div className={`flex flex-col ${role === 'user' ? 'items-end' : 'items-start'} mb-4`}>
      {showContent && type !== "minting_success" && (
        <div className={`${
          role === 'user' 
            ? 'p-4 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl bg-design-bg-light-blue text-design-dark-gray max-w-xs' 
            : 'text-design-dark-gray max-w-sm'
        } font-lexend font-normal text-sm leading-140`}>
          {type === "tokenization_agreement" ? (
            <div>{processContent(content)}</div>
          ) : (
            <div>{content}</div>
          )}
        </div>
      )}

      {/* 助手消息的组件渲染 - 添加间距 */}
      {role === "assistant" && (
        <div className="flex flex-col gap-3 max-w-sm">
          {type === "generate_result" && renderGenerateResultComponent(cu)}
          {type === "workflow_generate_result" && renderGenerateResultComponent(cu)}
          {type === "generating_image" && renderGeneratingImageComponent()}
          {type === "modify_image" && renderModifyImageComponent()}
          {type === "tokenization_agreement" && renderTokenizationAgreementComponent()}
          {type === "generating_video" && renderGeneratingVideoComponent()}
          {type === "animating_image" && renderAnimatingImageComponent()}
          {type === "video_generate_result" && renderVideoResultComponent(cu)}
          {(type === 'generation_timeout' || type === 'tokenization_timeout') && renderTimeoutRetryComponent()}
        </div>
      )}
      {role === "user" && type === "uploaded_image" && renderUserUploadedImageComponent()}
    </div>
  );
}

export default ChatMessage; 