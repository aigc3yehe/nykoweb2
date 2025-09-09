import React from "react";
import checkAgreeIcon from "../../assets/check_agree.svg";
import checkedAgreeIcon from "../../assets/checked_agree.svg";
import { getScaledImageUrl } from '../../utils/image';
import ModifyIcon from '../../assets/mavae/modify.svg';
import ModifyIconDark from '../../assets/mavae/dark/modify.svg';
import AnimateIcon from '../../assets/mavae/animate.svg';
import AnimateIconDark from '../../assets/mavae/dark/animate.svg';
import LoadingIcon from '../../assets/mavae/Loading.svg';
import LoadingIconDark from '../../assets/mavae/dark/Loading.svg';
import ThemeAdaptiveIcon from '../ui/ThemeAdaptiveIcon';
import { useI18n } from '../../hooks/useI18n';

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
  // currentWorkflow?: WorkflowDetail | null;
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
  agree = false,
  images = [],
  videos = [],
  imageWidth = 256,
  imageHeight = 256,
  onAgree,
  isLastMessage = false,
  onPartiallyModify,
  onAnimate,
  onRetryPolling,
}) => {
  const { t } = useI18n()

  // 添加图片生成中组件
  const renderGeneratingImageComponent = () => {
    return (
      <div className="max-w-[20rem] pt-3 pr-4 pb-3 pl-4 gap-1 rounded-tl-[1.5rem] rounded-tr-[1.5rem] rounded-br-[1.5rem] bg-chat-bg dark:bg-chat-bg-dark font-switzer font-normal text-[0.875rem] leading-[1.25rem] text-text-main dark:text-text-main-dark">
        <div className="flex items-center gap-1">
          <ThemeAdaptiveIcon
            lightIcon={LoadingIcon}
            darkIcon={LoadingIconDark}
            alt="Generating"
            size="sm"
            className="animate-spin"
          />
          <span>{t('chat.generatingImage')}</span>
        </div>
      </div>
    );
  };

  // 添加图片修改中组件
  const renderModifyImageComponent = () => {
    return (
      <div className="max-w-[20rem] pt-3 pr-4 pb-3 pl-4 gap-1 rounded-tl-[1.5rem] rounded-tr-[1.5rem] rounded-br-[1.5rem] bg-chat-bg dark:bg-chat-bg-dark font-switzer font-normal text-[0.875rem] leading-[1.25rem] text-text-main dark:text-text-main-dark">
        <div className="flex items-center gap-1">
          <ThemeAdaptiveIcon
            lightIcon={LoadingIcon}
            darkIcon={LoadingIconDark}
            alt="Modify"
            size="sm"
            className="animate-spin"
          />
          <span>{t('chat.modifyingImage')}</span>
        </div>
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

  const renderGenerateResultComponent = () => {
    // 图片宽度固定为 276px (17.25rem)，高度根据宽高比计算
    const fixedWidth = 17.25; // 276px / 16 = 17.25rem
    const displayWidth = fixedWidth;
    let displayHeight = fixedWidth; // 默认正方形

    if (images.length > 0 && imageWidth && imageHeight) {
      const aspectRatio = imageWidth / imageHeight;
      // 宽度固定，根据宽高比计算高度
      displayHeight = fixedWidth / aspectRatio;
    }

    return (
      <>
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
      </>
    );
  };

  // 视频生成中组件
  const renderGeneratingVideoComponent = () => {
    return (
      <div className="max-w-[20rem] pt-3 pr-4 pb-3 pl-4 gap-1 rounded-tl-[1.5rem] rounded-tr-[1.5rem] rounded-br-[1.5rem] bg-chat-bg dark:bg-chat-bg-dark font-switzer font-normal text-[0.875rem] leading-[1.25rem] text-text-main dark:text-text-main-dark">
        <div className="flex items-center gap-1">
          <ThemeAdaptiveIcon
            lightIcon={LoadingIcon}
            darkIcon={LoadingIconDark}
            alt="Generating Video"
            size="sm"
            className="animate-spin"
          />
          <span>Generating video, please wait...(ETA 600 sec)</span>
        </div>
      </div>
    );
  };

  // 图片动画中组件
  const renderAnimatingImageComponent = () => {
    return (
      <div className="max-w-[20rem] pt-3 pr-4 pb-3 pl-4 gap-1 rounded-tl-[1.5rem] rounded-tr-[1.5rem] rounded-br-[1.5rem] bg-chat-bg dark:bg-chat-bg-dark font-switzer font-normal text-[0.875rem] leading-[1.25rem] text-text-main dark:text-text-main-dark">
        <div className="flex items-center gap-1">
          <ThemeAdaptiveIcon
            lightIcon={LoadingIcon}
            darkIcon={LoadingIconDark}
            alt="Animating"
            size="sm"
            className="animate-spin"
          />
          <span>Animating image, please wait...(ETA 600 sec)</span>
        </div>
      </div>
    );
  };

  // 视频生成结果组件
  const renderVideoResultComponent = () => {
    return (
      <>
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
        {/* 可选扩展按钮等可后续补充 */}
      </>
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
    );
  };

  const showContent = !(role === "user" && type === "uploaded_image");

  return (
    <div className={`flex flex-col ${role === 'user' ? 'items-end' : 'items-start'} mb-4`}>
             {/* 用户消息 - 包括文本和图片 */}
       {role === 'user' && showContent && type !== "minting_success" && (
         <div className="max-w-[20rem] pt-3 pr-4 pb-3 pl-4 gap-[0.625rem] rounded-tl-[1.5rem] rounded-tr-[1.5rem] rounded-bl-[1.5rem] bg-chat-bg dark:bg-chat-bg-dark font-switzer font-normal text-[0.875rem] leading-[1.25rem] text-text-main dark:text-text-main-dark">
           {type === "tokenization_agreement" ? (
             <div>{processContent(content)}</div>
           ) : (
             <div>{content}</div>
           )}
         </div>
       )}

       {/* 用户上传的图片 */}
       {role === "user" && type === "uploaded_image" && (
         <div className="max-w-[20rem] pt-3 pr-4 pb-3 pl-4 gap-[0.625rem] rounded-tl-[1.5rem] rounded-tr-[1.5rem] rounded-bl-[1.5rem] bg-chat-bg dark:bg-chat-bg-dark">
           {renderUserUploadedImageComponent()}
         </div>
       )}

       {/* 助手消息 - 根据是否有图片/视频决定是否使用聊天气泡 */}
       {role === "assistant" && (
         <>
                       {/* 有图片或视频的消息 - 使用聊天气泡包装 */}
            {(type === "generate_result" || type === "workflow_generate_result" || type === "video_generate_result") && (
              <>
                <div className="max-w-[20rem] pt-3 pr-4 pb-3 pl-4 gap-1 rounded-tl-[1.5rem] rounded-tr-[1.5rem] rounded-br-[1.5rem] bg-chat-bg dark:bg-chat-bg-dark font-switzer font-normal text-[0.875rem] leading-[1.25rem] text-text-main dark:text-text-main-dark">
                  <div className="mb-1">{content}</div>
                  {type === "generate_result" && renderGenerateResultComponent()}
                  {type === "workflow_generate_result" && renderGenerateResultComponent()}
                  {type === "video_generate_result" && renderVideoResultComponent()}
                </div>
                {/* 扩展选项按钮 - 只在最后一条消息时显示，放在气泡外面 */}
                {isLastMessage && (
                  <div className="flex flex-row gap-2 mt-2">
                    {/* Modify 按钮 */}
                    <button
                      className="h-8 flex items-center gap-1 px-3 py-2 rounded-[1.5rem] bg-quaternary dark:bg-quaternary-dark font-lexend font-normal text-xs leading-[100%] text-link-default dark:text-link-default-dark transition-all duration-200 hover:bg-quaternary/80 dark:hover:bg-quaternary-dark/80"
                      onClick={onPartiallyModify}
                    >
                      <ThemeAdaptiveIcon
                        lightIcon={ModifyIcon}
                        darkIcon={ModifyIconDark}
                        alt="Modify"
                        size="sm"
                      />
                      <span className="text-center align-middle">Modify</span>
                    </button>
                    {/* Animate 按钮 */}
                    <button
                      className="h-8 flex items-center gap-1 px-3 py-2 rounded-[1.5rem] bg-quaternary dark:bg-quaternary-dark font-lexend font-normal text-xs leading-[100%] text-link-default dark:text-link-default-dark transition-all duration-200 hover:bg-quaternary/80 dark:hover:bg-quaternary-dark/80"
                      onClick={onAnimate}
                    >
                      <ThemeAdaptiveIcon
                        lightIcon={AnimateIcon}
                        darkIcon={AnimateIconDark}
                        alt="Animate"
                        size="sm"
                      />
                      <span className="text-center align-middle">Animate</span>
                    </button>
                  </div>
                )}
              </>
            )}

           {/* 纯文本消息 - 使用聊天气泡 */}
           {type === "text" && (
             <div className="max-w-[20rem] pt-3 pr-4 pb-3 pl-4 gap-1 rounded-tl-[1.5rem] rounded-tr-[1.5rem] rounded-br-[1.5rem] bg-chat-bg dark:bg-chat-bg-dark font-switzer font-normal text-[0.875rem] leading-[1.25rem] text-text-main dark:text-text-main-dark">
               <div>{content}</div>
             </div>
           )}

          {/* 其他类型的消息 - 不使用聊天气泡包装 */}
          {type !== "text" && type !== "generate_result" && type !== "workflow_generate_result" && type !== "video_generate_result" && type !== "generating_image" && type !== "modify_image" && type !== "generating_video" && type !== "animating_image" && (
            <div className="flex flex-col gap-3 max-w-sm">
              {type === "tokenization_agreement" && renderTokenizationAgreementComponent()}
              {(type === 'generation_timeout' || type === 'tokenization_timeout') && renderTimeoutRetryComponent()}
            </div>
          )}

          {/* 生成中的消息 - 使用聊天气泡包装 */}
          {type === "generating_image" && renderGeneratingImageComponent()}
          {type === "modify_image" && renderModifyImageComponent()}
          {type === "generating_video" && renderGeneratingVideoComponent()}
          {type === "animating_image" && renderAnimatingImageComponent()}
        </>
      )}
    </div>
  );
}

export default ChatMessage;