import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAtom, useSetAtom } from 'jotai'
import { getScaledImageUrl } from '../utils'
import { modelDetailAtom, fetchModelDetailAtom, clearModelDetailAtom } from '../store/modelDetailStore'
import { userStateAtom } from '../store/loginStore'
import { setCurrentDetailModelAtom, sendMessage } from '../store/assistantStore'
import CloseIcon from '../assets/web2/close.svg'
import avatarSvg from '../assets/Avatar.svg'
import usageSvg from '../assets/web2/usage.svg'
import use2Svg from '../assets/web2/use_2.svg'
import shareSvg from '../assets/web2/share.svg'
import editSvg from '../assets/web2/edit.svg'
import { formatNumber } from '../utils'
import ModelGallery from '../components/model/ModelGallery'
import { useChatSidebar } from '../hooks/useChatSidebar'

const ModelDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [state] = useAtom(modelDetailAtom)
  const [, fetchModelDetail] = useAtom(fetchModelDetailAtom)
  const [, clearModelDetail] = useAtom(clearModelDetailAtom)
  const [userState] = useAtom(userStateAtom)
  const setCurrentDetailModel = useSetAtom(setCurrentDetailModelAtom)
  const sendMessageAction = useSetAtom(sendMessage)
  const { openChat } = useChatSidebar()
  const modelId = id ? parseInt(id, 10) : null
  const userDid = userState.user?.tokens?.did || userState.userDetails?.did || ''
  const userRole = userState.userDetails?.role || ''

  // 获取模型详情
  useEffect(() => {
    if (modelId) {
      fetchModelDetail({ modelId }).catch(error => {
        console.error('Failed to fetch model detail:', error)
      })
    }
  }, [modelId, fetchModelDetail])

  // 更新 assistantStore 中的当前模型
  useEffect(() => {
    if (state.model && !state.isLoading) {
      setCurrentDetailModel(state.model)
    }
  }, [state.model, state.isLoading, setCurrentDetailModel])

  // 清理状态
  useEffect(() => {
    return () => {
      clearModelDetail()
      setCurrentDetailModel(null)
    }
  }, [clearModelDetail, setCurrentDetailModel])

  // 获取用户头像
  const getAvatarUrl = () => {
    // 检查是否有有效的头像URL，排除占位地址
    if (state.model?.user?.avatar &&
        !state.model.user.avatar.includes('example.com') &&
        !state.model.user.avatar.includes('placeholder')) {
      return state.model.user.avatar
    }
    // 使用本地默认头像
    return avatarSvg
  }

  // 获取用户显示名称
  const getDisplayName = () => {
    if (state.model?.user?.name) {
      return state.model.user.name
    }
    return "Anonymous"
  }

  // 处理关闭/返回
  const handleClose = () => {
    navigate(-1) // 返回上一页
  }

  // 获取训练状态文本 // 训练状态 (0为排队中, 1为进行中, 2 为完成, -1 为失败)
  const getTrainStatusText = () => {
    if (!state.model?.model_tran || state.model.model_tran.length === 0) {
      return 'No Training'
    }
    const latestTrain = state.model.model_tran[state.model.model_tran.length - 1]
    if (latestTrain.train_state === 2) return 'Ready'
    if (latestTrain.train_state === 1) return 'Training'
    if (latestTrain.train_state === -1) return 'Failed'
    return 'Training'
  }

  // 是否ready
  const isReady = getTrainStatusText() === 'Ready'

  // 获取训练状态颜色
  const getTrainStatusClasses = () => {
    if (!state.model?.model_tran || state.model.model_tran.length === 0) {
      return 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
    }
    const latestTrain = state.model.model_tran[state.model.model_tran.length - 1]
    if (latestTrain.train_state === 2) {
      return 'bg-[#DBFFE5] dark:bg-green-900 text-[#319F43] dark:text-green-400'
    }
    if (latestTrain.train_state === 1) {
      return 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
    }
    if (latestTrain.train_state === 0) {
      return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400'
    }
    if (latestTrain.train_state === -1) {
      return 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
    }
    return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400'
  }

  const handleUseNow = () => {
    // 1. 打开右侧聊天窗口（包含登录检查）
    // 2. 发送消息：I want to generate an image.
    openChat()
    sendMessageAction('I want to generate an image.')
  }

  // 如果没有有效的模型ID，显示错误
  if (!modelId) {
    return (
      <div className="px-5 md:px-6 py-8">
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <p className="text-red-500 mb-2">Invalid model ID</p>
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* 主容器 - 左右padding */}
      <div className="px-5 md:px-6 md:py-8">
        {/* 加载状态 */}
        {state.isLoading && (
          <div className="flex justify-center items-center h-96">
            <div className="text-gray-500">Loading model details...</div>
          </div>
        )}

        {/* 错误状态 */}
        {state.error && !state.isLoading && (
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <p className="text-red-500 mb-2">Error: {state.error}</p>
              <button
                onClick={() => fetchModelDetail({ modelId, refresh: true })}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors mr-2"
              >
                Retry
              </button>
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        )}

        {/* 模型详情内容 */}
        {state.model && !state.isLoading && (
          <div className="max-w-7xl mx-auto">
            {/* 用户信息模块 - PC端 */}
            <div className="hidden md:block">
              <div className="flex gap-10 h-[28.125rem]">
                {/* 左侧封面 */}
                <div className="w-[28.125rem] h-[28.125rem] flex-shrink-0 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden">
                  {state.model.cover ? (
                    <img
                      src={getScaledImageUrl(state.model.cover, 450)}
                      alt={state.model.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/path/to/fallback-image.png'
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-400">No cover image</span>
                    </div>
                  )}
                </div>

                {/* 右侧详情信息区 - 上下两部分 */}
                <div className="flex flex-col justify-between h-full gap-3 w-full">
                  {/* 上半部分 */}
                  <div className="flex flex-col gap-3 w-full">
                    {/* 标题栏+关闭按钮 */}
                    <div className="flex justify-between items-center h-8">
                      <h1 className="font-lexend font-bold text-2xl md:text-[2rem] leading-[100%] text-design-main-text dark:text-design-dark-main-text">
                        {state.model.name}
                      </h1>
                      <button
                        onClick={handleClose}
                        className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                      >
                        <img src={CloseIcon} alt="Close" className="w-6 h-6" />
                      </button>
                    </div>

                    {/* 用户信息与标签 */}
                    <div className="flex items-center gap-6 h-8">
                      {/* 用户信息 */}
                      <div className="flex items-center gap-1.5 h-8 mt-1.5">
                        <img
                          src={getAvatarUrl()}
                          alt={getDisplayName()}
                          className="w-8 h-8 rounded-full flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = avatarSvg
                          }}
                        />
                        <span className="font-lexend font-normal text-base leading-4 text-design-dark-gray dark:text-design-dark-dark-gray">
                          {getDisplayName()}
                        </span>
                      </div>
                      {/* 标签组 */}
                      {state.model.tags && state.model.tags.length > 0 && (
                        <div className="flex items-center gap-3 h-6">
                          {state.model.tags.map((tag, index) => (
                            <div
                              key={index}
                              className="h-6 px-3 py-1 bg-design-bg-light-blue dark:bg-design-dark-bg-light-blue rounded-full flex items-center"
                            >
                              <span className="font-lexend font-normal text-xs leading-4 text-center text-design-dark-gray dark:text-design-dark-dark-gray">
                                {tag}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 顶部信息条 */}
                    <div className="flex justify-between items-center border-t border-[#E5E7EB] dark:border-design-dark-line-light-gray pt-[0.875rem] pb-[0.875rem] h-[3.25rem] gap-3">
                      {/* 左侧：Type/Status/Usage */}
                      <div className="flex items-center gap-5 h-6">
                        {/* Type */}
                        <div className="flex items-center gap-1.5 h-6">
                          <span className="font-lexend font-normal text-sm leading-[100%] text-design-medium-gray dark:text-design-dark-medium-gray align-middle">Type</span>
                          <span className="h-6 rounded-[6px] px-3 py-1 bg-design-bg-light-blue dark:bg-design-dark-bg-light-blue font-lexend font-normal text-xs leading-4 text-center align-middle text-design-main-blue dark:text-design-dark-main-blue">Model</span>
                        </div>
                        {/* Status */}
                        <div className="flex items-center gap-1.5 h-6">
                          <span className="font-lexend font-normal text-sm leading-[100%] text-design-medium-gray dark:text-design-dark-medium-gray align-middle">Status</span>
                          <span className={`h-6 rounded-[6px] px-3 py-1 font-lexend font-normal text-xs leading-4 text-center align-middle ${getTrainStatusClasses()}`}>
                            {getTrainStatusText()}
                          </span>
                        </div>
                        {/* Usage */}
                        <div className="flex items-center gap-1.5 h-6 rounded-[10px]">
                          <img src={usageSvg} alt="usage" className="w-4 h-4" />
                          <span className="font-lexend font-normal text-sm leading-4 text-center align-middle text-design-main-text dark:text-design-dark-main-text">
                            {typeof state.model.usage === 'number' ? formatNumber(state.model.usage) : '--'}
                          </span>
                        </div>
                      </div>
                      {/* 右侧：更新时间 */}
                      <div className="flex items-center gap-1.5 w-[8.375rem] h-6 rounded-[10px]">
                        <span className="font-lexend font-normal text-sm leading-[100%] text-design-medium-gray dark:text-design-dark-medium-gray align-middle">Updated</span>
                        <span className="font-lexend font-normal text-sm leading-4 text-center align-middle text-design-main-text dark:text-design-dark-main-text">
                          {state.model.created_at ? new Date(state.model.created_at).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.') : '--'}
                        </span>
                      </div>
                    </div>

                    {/* 描述 */}
                    {state.model.description && (
                      <div className="font-lexend font-normal text-sm leading-[140%] text-design-dark-gray dark:text-design-dark-dark-gray line-clamp-4">
                        {state.model.description}
                      </div>
                    )}
                  </div>

                  {/* 下半部分：按钮组 */}
                  <div className="flex items-center justify-between h-[3rem] w-full">
                    {/* Use Now按钮 */}
                    <button
                      onClick={isReady ? handleUseNow : undefined}
                      disabled={!isReady}
                      className={`w-[16.6875rem] h-[3rem] flex items-center justify-center gap-1.5 rounded-[6px] ${isReady ? 'bg-design-main-blue dark:bg-design-dark-main-blue hover:bg-blue-800' : 'bg-[#B9BECC] cursor-not-allowed'} transition-colors`}
                    >
                      <img src={use2Svg} alt="Use Now" className="w-6 h-6" />
                      <span className="font-lexend font-normal text-lg leading-[100%] text-white">{isReady ? 'Use Now' : 'Training'}</span>
                    </button>
                    {/* 右侧按钮组 */}
                    <div className="flex items-center gap-3.5 h-[3rem]">
                      {/* 分享按钮 */}
                      <button className="w-[3rem] h-[3rem] flex items-center justify-center rounded-[6px] bg-design-bg-light-blue dark:bg-design-dark-bg-light-blue">
                        <img src={shareSvg} alt="Share" className="w-6 h-6" />
                      </button>
                      {/* 编辑按钮（仅作者或admin可见） */}
                      {(state.model.user?.did === userDid || userRole === 'admin') && (
                        <button className="w-[3rem] h-[3rem] flex items-center justify-center rounded-[6px] bg-design-bg-light-blue dark:bg-design-dark-bg-light-blue">
                          <img src={editSvg} alt="Edit" className="w-6 h-6" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 移动端布局 - 待后续实现 */}
            <div className="block md:hidden">
              {/* 标题栏+关闭按钮 */}
              <div className="flex justify-between items-center h-12">
                <h1 className="font-lexend font-bold text-xl md:text-[2rem] leading-[100%] text-design-main-text dark:text-design-dark-main-text">
                  {state.model.name}
                </h1>
                <button
                  onClick={handleClose}
                  className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                >
                  <img src={CloseIcon} alt="Close" className="w-6 h-6" />
                </button>
              </div>
              <div className="flex flex-col gap-3 w-full pb-[64px]"> {/* 增加底部padding */}
                {/* 标签组 */}
                {state.model.tags && state.model.tags.length > 0 && (
                  <div className="flex items-center gap-3 h-6">
                    {state.model.tags.map((tag, index) => (
                      <div
                        key={index}
                        className="h-6 px-3 py-1 bg-design-bg-light-blue dark:bg-design-dark-bg-light-blue rounded-full flex items-center"
                      >
                        <span className="font-lexend font-normal text-xs leading-4 text-center text-design-dark-gray dark:text-design-dark-dark-gray">
                          {tag}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {/* 封面 */}
                <div
                  className="w-full aspect-square flex-shrink-0 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden"
                >
                  {state.model.cover ? (
                    <img
                      src={getScaledImageUrl(state.model.cover, 450)}
                      alt={state.model.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/path/to/fallback-image.png'
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-400">No cover image</span>
                    </div>
                  )}
                </div>
                {/* 用户信息 */}
                <div className="flex items-center gap-1.5 h-6 mt-1.5">
                  <img
                    src={getAvatarUrl()}
                    alt={getDisplayName()}
                    className="w-6 h-6 rounded-full flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = avatarSvg
                    }}
                  />
                  <span className="font-lexend font-normal text-sm leading-4 text-design-dark-gray dark:text-design-dark-dark-gray">
                    {getDisplayName()}
                  </span>
                </div>
                {/* 顶部信息条 */}
                <div className="flex flex-col border-t border-[#E5E7EB] dark:border-design-dark-line-light-gray py-3 gap-3">
                  {/* 左侧：Type/Status/Usage */}
                  <div className="flex items-center gap-5 h-6">
                    {/* Type */}
                    <div className="flex items-center gap-1.5 h-6">
                      <span className="font-lexend font-normal text-sm leading-[100%] text-design-medium-gray dark:text-design-dark-medium-gray align-middle">Type</span>
                      <span className="h-6 rounded-[6px] px-3 py-1 bg-design-bg-light-blue dark:bg-design-dark-bg-light-blue font-lexend font-normal text-xs leading-4 text-center align-middle text-design-main-blue dark:text-design-dark-main-blue">Model</span>
                    </div>
                    {/* Status */}
                    <div className="flex items-center gap-1.5 h-6">
                      <span className="font-lexend font-normal text-sm leading-[100%] text-design-medium-gray dark:text-design-dark-medium-gray align-middle">Status</span>
                      <span className={`h-6 rounded-[6px] px-3 py-1 font-lexend font-normal text-xs leading-4 text-center align-middle ${getTrainStatusClasses()}`}>
                        {getTrainStatusText()}
                      </span>
                    </div>
                    {/* Usage */}
                    <div className="flex items-center gap-1.5 h-6 rounded-[10px]">
                      <img src={usageSvg} alt="usage" className="w-4 h-4" />
                      <span className="font-lexend font-normal text-sm leading-4 text-center align-middle text-design-main-text dark:text-design-dark-main-text">
                        {typeof state.model.usage === 'number' ? formatNumber(state.model.usage) : '--'}
                      </span>
                    </div>
                  </div>
                  {/* 右侧：更新时间 */}
                  <div className="flex items-center gap-1.5 w-[8.375rem] h-6 rounded-[10px]">
                    <span className="font-lexend font-normal text-sm leading-[100%] text-design-medium-gray dark:text-design-dark-medium-gray align-middle">Updated</span>
                    <span className="font-lexend font-normal text-sm leading-4 text-center align-middle text-design-main-text dark:text-design-dark-main-text">
                      {state.model.created_at ? new Date(state.model.created_at).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.') : '--'}
                    </span>
                  </div>
                </div>
                {/* 描述 */}
                {state.model.description && (
                  <div className="font-lexend font-normal text-sm leading-[140%] text-design-dark-gray dark:text-design-dark-dark-gray line-clamp-4">
                    {state.model.description}
                  </div>
                )}
              </div>
              {/* 移动端底部按钮组 */}
              <div className="fixed bottom-0 left-0 w-full bg-white px-5 py-3 z-20 border-t flex items-center justify-between md:hidden">
                {/* Use Now按钮 */}
                <button
                  onClick={isReady ? handleUseNow : undefined}
                  disabled={!isReady}
                  className={`w-[10rem] h-[3rem] flex items-center justify-center gap-1.5 rounded-[6px] ${isReady ? 'bg-design-main-blue dark:bg-design-dark-main-blue hover:bg-blue-800' : 'bg-[#B9BECC] cursor-not-allowed'} transition-colors`}
                >
                  <img src={use2Svg} alt="Use Now" className="w-6 h-6" />
                  <span className="font-lexend font-normal text-base leading-[100%] text-white">{isReady ? 'Use Now' : 'Training'}</span>
                </button>
                {/* 右侧按钮组 */}
                <div className="flex items-center gap-3.5 h-[3rem]">
                  {/* 分享按钮 */}
                  <button className="w-[3rem] h-[3rem] flex items-center justify-center rounded-[6px] bg-design-bg-light-blue dark:bg-design-dark-bg-light-blue">
                    <img src={shareSvg} alt="Share" className="w-6 h-6" />
                  </button>
                  {/* 编辑按钮（仅作者或admin可见） */}
                  {(state.model.user?.did === userDid || userRole === 'admin') && (
                    <button className="w-[3rem] h-[3rem] flex items-center justify-center rounded-[6px] bg-design-bg-light-blue dark:bg-design-dark-bg-light-blue">
                      <img src={editSvg} alt="Edit" className="w-6 h-6" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Gallery 内容*/}
        {state.model && state.model.model_id && (
          <ModelGallery modelId={state.model.model_id} />
        )}
      </div>
    </div>
  )
}

export default ModelDetail