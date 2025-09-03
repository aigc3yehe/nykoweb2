import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAtom, useSetAtom } from 'jotai'
import { workflowDetailAtom, fetchWorkflowDetailAtom, clearWorkflowDetailAtom } from '../store/workflowDetailStore'
import { setCurrentDetailWorkflowAtom } from '../store/assistantStore'
import WorkflowGallery from '../components/workflow/WorkflowGallery.tsx'
import WorkflowCover from '../components/workflow/WorkflowCover'
import WorkflowInfo from '../components/workflow/WorkflowInfo'

const WorkflowDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [state] = useAtom(workflowDetailAtom)
  const [, fetchWorkflowDetail] = useAtom(fetchWorkflowDetailAtom)
  const [, clearWorkflowDetail] = useAtom(clearWorkflowDetailAtom)
  const setCurrentDetailWorkflow = useSetAtom(setCurrentDetailWorkflowAtom)
  const workflowId = id ? parseInt(id, 10) : null

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



  // 如果没有有效的工作流ID，显示错误
  if (!workflowId) {
    return (
      <div className="px-5 md:px-6 py-8">
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <p className="text-red-500 mb-2">Invalid workflow ID</p>
            <button
              onClick={() => navigate(-1)}
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
    <div className="min-h-screen">
      {/* 主容器 - 左右padding */}
      <div className="px-5 md:px-6 md:py-8">
        {/* 加载状态 */}
        {state.isLoading && (
          <div className="flex justify-center items-center h-96">
            <div className="text-gray-500">Loading Agent Case details...</div>
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
                onClick={() => navigate(-1)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        )}

                {/* 工作流详情内容 */}
        {state.workflow && !state.isLoading && (
          <div className="mx-auto">
            {/* PC端 - 左右布局 */}
            <div className="hidden md:block">
              <div className="flex h-[37.5rem] rounded-xl bg-secondary dark:bg-secondary-dark">
                {/* 左侧封面 */}
                <WorkflowCover
                  cover={state.workflow.cover}
                  name={state.workflow.name}
                  usage={state.workflow.usage}
                  like_count={state.workflow.like_count}
                  is_liked={state.workflow.is_liked}
                />

                {/* 右侧详情信息区 */}
                <WorkflowInfo workflow={state.workflow} />
              </div>
            </div>

            {/* 移动端 - 上下布局 */}
            <div className="block md:hidden">
              <div className="flex flex-col">
                {/* 上方封面 */}
                <div className="w-full rounded-t-xl bg-secondary dark:bg-secondary-dark">
                  <WorkflowCover
                    cover={state.workflow.cover}
                    name={state.workflow.name}
                    usage={state.workflow.usage}
                    like_count={state.workflow.like_count}
                    is_liked={state.workflow.is_liked}
                    className="w-full h-[25rem]"
                  />
                </div>

                {/* 下方详情信息区 */}
                <div className="w-full rounded-b-xl bg-secondary dark:bg-secondary-dark">
                  <WorkflowInfo workflow={state.workflow} />
                </div>
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