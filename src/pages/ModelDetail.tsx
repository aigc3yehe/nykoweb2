import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAtom, useSetAtom } from 'jotai'
import { modelDetailAtom, fetchModelDetailAtom, clearModelDetailAtom } from '../store/modelDetailStore'
import { setCurrentDetailModelAtom } from '../store/assistantStore'
import { useI18n } from '../hooks/useI18n'
import ModelGallery from '../components/model/ModelGallery'
import ModelCover from '../components/model/ModelCover'
import ModelInfo from '../components/model/ModelInfo'

const ModelDetail: React.FC = () => {
  const { t } = useI18n()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [state] = useAtom(modelDetailAtom)
  const [, fetchModelDetail] = useAtom(fetchModelDetailAtom)
  const [, clearModelDetail] = useAtom(clearModelDetailAtom)
  const setCurrentDetailModel = useSetAtom(setCurrentDetailModelAtom)
  const modelId = id ? parseInt(id, 10) : null

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



  // 如果没有有效的模型ID，显示错误
  if (!modelId) {
    return (
      <div className="px-5 md:px-6 py-8">
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <p className="text-red-500 mb-2">{t('pages.invalidModelId')}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              {t('pages.goBack')}
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
            <div className="text-gray-500">{t('pages.loadingModelDetails')}</div>
          </div>
        )}

        {/* 错误状态 */}
        {state.error && !state.isLoading && (
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <p className="text-red-500 mb-2">{t('pages.errorPrefix')}{state.error}</p>
              <button
                onClick={() => fetchModelDetail({ modelId, refresh: true })}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors mr-2"
              >
                {t('pages.retry')}
              </button>
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                {t('pages.goBack')}
              </button>
            </div>
          </div>
        )}

        {/* 模型详情内容 */}
        {state.model && !state.isLoading && (
          <div className="mx-auto">
            {/* PC端 - 左右布局 */}
            <div className="hidden md:block">
              <div className="flex h-[37.5rem] rounded-xl bg-secondary dark:bg-secondary-dark">
                {/* 左侧封面 */}
                <ModelCover
                  cover={state.model.cover}
                  name={state.model.name}
                  usage={state.model.usage}
                  like_count={state.model.like_count}
                  is_liked={state.model.is_liked}
                />

                {/* 右侧详情信息区 */}
                <ModelInfo />
              </div>
            </div>

            {/* 移动端 - 上下布局 */}
            <div className="block md:hidden">
              <div className="flex flex-col">
                {/* 上方封面 */}
                <div className="w-full rounded-t-xl bg-secondary dark:bg-secondary-dark">
                  <ModelCover
                    cover={state.model.cover}
                    name={state.model.name}
                    usage={state.model.usage}
                    like_count={state.model.like_count}
                    is_liked={state.model.is_liked}
                    className="w-full h-[25rem]"
                  />
                </div>

                {/* 下方详情信息区 */}
                <div className="w-full rounded-b-xl bg-secondary dark:bg-secondary-dark">
                  <ModelInfo />
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