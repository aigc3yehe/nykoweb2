import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAtom, useSetAtom } from 'jotai'
import { getScaledImageUrl } from '../utils'
import { workflowDetailAtom, fetchWorkflowDetailAtom, clearWorkflowDetailAtom } from '../store/workflowDetailStore'
import { userStateAtom } from '../store/loginStore'
import { setCurrentDetailWorkflowAtom, sendMessage } from '../store/assistantStore'
import CloseIcon from '../assets/web2/close.svg'
import avatarSvg from '../assets/Avatar.svg'
import usageSvg from '../assets/web2/usage.svg'
import use2Svg from '../assets/web2/use_2.svg'
import shareSvg from '../assets/web2/share.svg'
import editSvg from '../assets/web2/edit.svg'
import { formatNumber } from '../utils'
import WorkflowGallery from '../components/workflow/WorkflowGallery.tsx'
import { openChatSidebar } from '../store/chatSidebarStore'

const WorkflowDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [state] = useAtom(workflowDetailAtom)
  const [, fetchWorkflowDetail] = useAtom(fetchWorkflowDetailAtom)
  const [, clearWorkflowDetail] = useAtom(clearWorkflowDetailAtom)
  const [userState] = useAtom(userStateAtom)
  const setCurrentDetailWorkflow = useSetAtom(setCurrentDetailWorkflowAtom)
  const sendMessageAction = useSetAtom(sendMessage)
  const openSidebar = useSetAtom(openChatSidebar)
  const workflowId = id ? parseInt(id, 10) : null
  const userDid = userState.user?.tokens?.did || userState.userDetails?.did || ''
  const userRole = userState.userDetails?.role || ''

  // 获取工作流详情
  useEffect(() => {
    if (workflowId) {
      fetchWorkflowDetail({ workflowId }).catch(error => {
        console.error('Failed to fetch workflow detail:', error)
      })
    }
  }, [workflowId, fetchWorkflowDetail])

  // 更新 assistantStore 中的当前工作流
  useEffect(() => {
    if (state.workflow && !state.isLoading) {
      setCurrentDetailWorkflow(state.workflow)
    }
  }, [state.workflow, state.isLoading, setCurrentDetailWorkflow])

  // 清理状态
  useEffect(() => {
    return () => {
      clearWorkflowDetail()
      setCurrentDetailWorkflow(null)
    }
  }, [clearWorkflowDetail, setCurrentDetailWorkflow])

  // 获取用户头像
  const getAvatarUrl = () => {
    if (state.workflow?.user?.avatar) {
      return state.workflow.user.avatar
    }
    return avatarSvg
  }

  // 获取用户显示名称
  const getDisplayName = () => {
    if (state.workflow?.user?.name) {
      return state.workflow.user.name
    }
    return "Anonymous"
  }

  // 处理关闭/返回
  const handleClose = () => {
    navigate(-1) // 返回上一页
  }

  const handleUseNow = () => {
    // 1. 打开右侧聊天窗口
    // 2. 发送消息：I want to use this workflow.
    openSidebar()
    sendMessageAction('I want to use this workflow.')
  }

  // 如果没有有效的工作流ID，显示错误
  if (!workflowId) {
    return (
      <div className="px-5 md:px-6 py-8">
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <p className="text-red-500 mb-2">Invalid workflow ID</p>
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
            <div className="text-gray-500">Loading workflow details...</div>
          </div>
        )}

        {/* 错误状态 */}
        {state.error && !state.isLoading && (
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <p className="text-red-500 mb-2">Error: {state.error}</p>
              <button
                onClick={() => fetchWorkflowDetail({ workflowId, refresh: true })}
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

        {/* 工作流详情内容 */}
        {state.workflow && !state.isLoading && (
          <div className="max-w-7xl mx-auto">
            {/* 用户信息模块 - PC端 */}
            <div className="hidden md:block">
              <div
                className="flex gap-10 h-[28.125rem]"
              >
                {/* 左侧封面 */}
                <div
                  className="w-[28.125rem] h-[28.125rem] flex-shrink-0 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden"
                >
                  {state.workflow.cover ? (
                    <img
                      src={getScaledImageUrl(state.workflow.cover, 450)}
                      alt={state.workflow.name}
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
                <div className="flex flex-col justify-between h-full gap-3 w-full"> {/* 378px/16=23.625rem, 646px/16=40.375rem */}
                  {/* 上半部分 */}
                  <div className="flex flex-col gap-3 w-full">
                    {/* 标题栏+关闭按钮 */}
                    <div className="flex justify-between items-center h-8">
                      <h1 className="font-lexend font-bold text-2xl md:text-[2rem] leading-[100%] text-design-main-text dark:text-design-dark-main-text">
                        {state.workflow.name}
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
                      <div className="flex items-center gap-1.5 h-8">
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
                      {state.workflow.tags && state.workflow.tags.length > 0 && (
                        <div className="flex items-center gap-3 h-6">
                          {state.workflow.tags.map((tag, index) => (
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
                    <div className="flex justify-between items-center border-t border-[#E5E7EB] dark:border-design-dark-line-light-gray pt-[0.875rem] pb-[0.875rem] h-[3.25rem] gap-3"> {/* 14px=0.875rem, 52px=3.25rem */}
                      {/* 左侧：Type/Status/Usage */}
                      <div className="flex items-center gap-5 h-6">
                        {/* Type */}
                        <div className="flex items-center gap-1.5 h-6">
                          <span className="font-lexend font-normal text-sm leading-[100%] text-design-medium-gray dark:text-design-dark-medium-gray align-middle">Type</span>
                          <span className="h-6 rounded-[6px] px-3 py-1 bg-design-bg-light-blue dark:bg-design-dark-bg-light-blue font-lexend font-normal text-xs leading-4 text-center align-middle text-design-main-blue dark:text-design-dark-main-blue">Workflow</span>
                        </div>
                        {/* Status */}
                        <div className="flex items-center gap-1.5 h-6">
                          <span className="font-lexend font-normal text-sm leading-[100%] text-design-medium-gray dark:text-design-dark-medium-gray align-middle">Status</span>
                          <span className="h-6 rounded-[6px] px-3 py-1 bg-[#DBFFE5] dark:bg-green-900 font-lexend font-normal text-xs leading-4 text-center align-middle text-[#319F43] dark:text-green-400">Ready</span>
                        </div>
                        {/* Usage */}
                        <div className="flex items-center gap-1.5 h-6 rounded-[10px]">
                          <img src={usageSvg} alt="usage" className="w-4 h-4" />
                          <span className="font-lexend font-normal text-sm leading-4 text-center align-middle text-design-main-text dark:text-design-dark-main-text">
                            {typeof state.workflow.usage === 'number' ? formatNumber(state.workflow.usage) : '--'}
                          </span>
                        </div>
                      </div>
                      {/* 右侧：更新时间 */}
                      <div className="flex items-center gap-1.5 w-[8.375rem] h-6 rounded-[10px]"> {/* 134px=8.375rem */}
                        <span className="font-lexend font-normal text-sm leading-[100%] text-design-medium-gray dark:text-design-dark-medium-gray align-middle">Updated</span>
                        <span className="font-lexend font-normal text-sm leading-4 text-center align-middle text-design-main-text dark:text-design-dark-main-text">
                          {state.workflow.created_at ? new Date(state.workflow.created_at).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.') : '--'}
                        </span>
                      </div>
                    </div>

                    {/* Nodo Info 区块 */}
                    <div className="flex flex-col gap-3 h-[7.375rem] rounded-xl bg-design-bg-light-gray dark:bg-design-dark-bg-light-gray p-4"> {/* 118px=7.375rem, 16px=1rem */}
                      <span className="font-lexend font-medium text-sm leading-[100%] text-design-main-text dark:text-design-dark-main-text">Nodo Info</span>
                      <div className="flex gap-3.5">
                        {/* Input */}
                        <div className="flex flex-col gap-1.5 w-[12.1875rem] h-[3.75rem] rounded-xl bg-white dark:bg-gray-800 p-3.5"> {/* 195px=12.1875rem, 60px=3.75rem, 14px=0.875rem */}
                          <span className="font-lexend font-normal text-xs leading-[100%] text-design-dark-gray dark:text-design-dark-dark-gray">Input</span>
                          <span className="font-lexend font-medium text-sm leading-4 text-design-main-text dark:text-design-dark-main-text">
                            {state.workflow.input_type || '--'}
                          </span>
                        </div>
                        {/* Model */}
                        <div className="flex flex-col gap-1.5 w-[12.1875rem] h-[3.75rem] rounded-xl bg-white dark:bg-gray-800 p-3.5">
                          <span className="font-lexend font-normal text-xs leading-[100%] text-design-dark-gray dark:text-design-dark-dark-gray">Model</span>
                          <span className="font-lexend font-medium text-sm leading-4 text-design-main-text dark:text-design-dark-main-text">
                            {state.workflow.model || '--'}
                          </span>
                        </div>
                        {/* Output */}
                        <div className="flex flex-col gap-1.5 w-[12.1875rem] h-[3.75rem] rounded-xl bg-white dark:bg-gray-800 p-3.5">
                          <span className="font-lexend font-normal text-xs leading-[100%] text-design-dark-gray dark:text-design-dark-dark-gray">Output</span>
                          <span className="font-lexend font-medium text-sm leading-4 text-design-main-text dark:text-design-dark-main-text">
                            {state.workflow.output_type || '--'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 描述 */}
                    {state.workflow.description && (
                      <div className="font-lexend font-normal text-sm leading-[140%] text-design-dark-gray dark:text-design-dark-dark-gray line-clamp-4">
                        {state.workflow.description}
                      </div>
                    )}
                  </div>

                  {/* 下半部分：按钮组 */}
                  <div className="flex items-center justify-between h-[3rem] w-full"> {/* 48px=3rem */}
                    {/* Use Now按钮 */}
                    <button 
                      onClick={handleUseNow}
                    className="w-[16.6875rem] h-[3rem] flex items-center justify-center gap-1.5 rounded-[6px] bg-design-main-blue dark:bg-design-dark-main-blue hover:bg-blue-800 transition-colors"> {/* 267px=16.6875rem */}
                      <img src={use2Svg} alt="Use Now" className="w-6 h-6" />
                      <span className="font-lexend font-normal text-lg leading-[100%] text-white">Use Now</span>
                    </button>
                    {/* 右侧按钮组 */}
                    <div className="flex items-center gap-3.5 h-[3rem]">
                      {/* 点赞按钮 */}
                      {/*<button className="flex items-center gap-1.5 px-3 h-[3rem] rounded-[6px] bg-design-bg-light-blue dark:bg-design-dark-bg-light-blue">*/}
                      {/*  <img src={likeSvg} alt="Like" className="w-6 h-6" />*/}
                      {/*  <span className="font-lexend font-normal text-base leading-[100%] text-design-main-text dark:text-design-dark-main-text">*/}
                      {/*    /!* TODO: 等后端支持like_count字段后替换为真实数据 *!/*/}
                      {/*    0*/}
                      {/*  </span>*/}
                      {/*</button>*/}
                      {/* 分享按钮 */}
                      <button className="w-[3rem] h-[3rem] flex items-center justify-center rounded-[6px] bg-design-bg-light-blue dark:bg-design-dark-bg-light-blue">
                        <img src={shareSvg} alt="Share" className="w-6 h-6" />
                      </button>
                      {/* 编辑按钮（仅作者或admin可见） */}
                      {(state.workflow.user?.did === userDid || userRole === 'admin') && (
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
                  {state.workflow.name}
                </h1>
                <button
                    onClick={handleClose}
                    className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                >
                  <img src={CloseIcon} alt="Close" className="w-6 h-6" />
                </button>
              </div>
              <div className="flex flex-col gap-3 w-full">
                {/* 标签组 */}
                {state.workflow.tags && state.workflow.tags.length > 0 && (
                    <div className="flex items-center gap-3 h-6">
                      {state.workflow.tags.map((tag, index) => (
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
                  {state.workflow.cover ? (
                      <img
                          src={getScaledImageUrl(state.workflow.cover, 450)}
                          alt={state.workflow.name}
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
                <div className="flex items-center gap-1.5 h-6">
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
                      <span className="h-6 rounded-[6px] px-3 py-1 bg-design-bg-light-blue dark:bg-design-dark-bg-light-blue font-lexend font-normal text-xs leading-4 text-center align-middle text-design-main-blue dark:text-design-dark-main-blue">Workflow</span>
                    </div>
                    {/* Status */}
                    <div className="flex items-center gap-1.5 h-6">
                      <span className="font-lexend font-normal text-sm leading-[100%] text-design-medium-gray dark:text-design-dark-medium-gray align-middle">Status</span>
                      <span className="h-6 rounded-[6px] px-3 py-1 bg-[#DBFFE5] dark:bg-green-900 font-lexend font-normal text-xs leading-4 text-center align-middle text-[#319F43] dark:text-green-400">Ready</span>
                    </div>
                    {/* Usage */}
                    <div className="flex items-center gap-1.5 h-6 rounded-[10px]">
                      <img src={usageSvg} alt="usage" className="w-4 h-4" />
                      <span className="font-lexend font-normal text-sm leading-4 text-center align-middle text-design-main-text dark:text-design-dark-main-text">
                            {typeof state.workflow.usage === 'number' ? formatNumber(state.workflow.usage) : '--'}
                          </span>
                    </div>
                  </div>
                  {/* 右侧：更新时间 */}
                  <div className="flex items-center gap-1.5 w-[8.375rem] h-6 rounded-[10px]"> {/* 134px=8.375rem */}
                    <span className="font-lexend font-normal text-sm leading-[100%] text-design-medium-gray dark:text-design-dark-medium-gray align-middle">Updated</span>
                    <span className="font-lexend font-normal text-sm leading-4 text-center align-middle text-design-main-text dark:text-design-dark-main-text">
                          {state.workflow.created_at ? new Date(state.workflow.created_at).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.') : '--'}
                        </span>
                  </div>
                </div>

                {/* Nodo Info 区块 */}
                <div className="flex flex-col gap-3 rounded-xl bg-design-bg-light-gray dark:bg-design-dark-bg-light-gray p-4"> {/* 118px=7.375rem, 16px=1rem */}
                  <span className="font-lexend font-medium text-sm leading-[100%] text-design-main-text dark:text-design-dark-main-text">Nodo Info</span>
                  <div className="flex gap-3.5">
                    {/* Input */}
                    <div className="flex flex-col gap-1.5 rounded-xl bg-white dark:bg-gray-800 p-3.5"> {/* 195px=12.1875rem, 60px=3.75rem, 14px=0.875rem */}
                      <span className="font-lexend font-normal text-xs leading-[100%] text-design-dark-gray dark:text-design-dark-dark-gray">Input</span>
                      <span className="font-lexend font-medium text-sm leading-4 text-design-main-text dark:text-design-dark-main-text">
                            {state.workflow.input_type || '--'}
                          </span>
                    </div>
                    {/* Model */}
                    <div className="flex flex-col gap-1.5 rounded-xl bg-white dark:bg-gray-800 p-3.5">
                      <span className="font-lexend font-normal text-xs leading-[100%] text-design-dark-gray dark:text-design-dark-dark-gray">Model</span>
                      <span className="font-lexend font-medium text-sm leading-4 text-design-main-text dark:text-design-dark-main-text">
                            {state.workflow.model || '--'}
                          </span>
                    </div>
                    {/* Output */}
                    <div className="flex flex-col gap-1.5 rounded-xl bg-white dark:bg-gray-800 p-3.5">
                      <span className="font-lexend font-normal text-xs leading-[100%] text-design-dark-gray dark:text-design-dark-dark-gray">Output</span>
                      <span className="font-lexend font-medium text-sm leading-4 text-design-main-text dark:text-design-dark-main-text">
                            {state.workflow.output_type || '--'}
                          </span>
                    </div>
                  </div>
                </div>

                {/* 描述 */}
                {state.workflow.description && (
                    <div className="font-lexend font-normal text-sm leading-[140%] text-design-dark-gray dark:text-design-dark-dark-gray line-clamp-4">
                      {state.workflow.description}
                    </div>
                )}
              </div>

            </div>
          </div>
        )}
        {/* Gallery 标题*/}
        {/* Gallery 内容*/}
        <WorkflowGallery workflowId={workflowId} />
      </div>
    </div>
  )
}

export default WorkflowDetail