import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useLang, withLangPrefix } from '../hooks/useLang'
import { useSetAtom } from 'jotai'
import { loginAtom, hideLoginModalAtom } from '../store/loginStore'

const AuthCallback: React.FC = () => {
  const navigate = useNavigate()
  const lang = useLang()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string>('')
  const login = useSetAtom(loginAtom)
  const hideLoginModal = useSetAtom(hideLoginModalAtom)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code')
        const state = searchParams.get('state')
        const errorParam = searchParams.get('error')

        // 检查是否有错误参数
        if (errorParam) {
          setError(`OAuth Error: ${errorParam}`)
          setStatus('error')
          return
        }

        // 检查必需的参数
        if (!code || !state) {
          setError('Missing required parameters')
          setStatus('error')
          return
        }

        // 使用新的登录流程处理Google OAuth回调
        // loginAtom会自动处理token设置和用户详细信息获取
        const userInfo = await login({ code, state })

        console.log('Login successful:', userInfo)

        // 确保登录模态框关闭
        hideLoginModal()

        setStatus('success')

        // 延迟跳转，让用户看到成功消息
        setTimeout(() => {
          navigate(withLangPrefix(lang, '/'), { replace: true })
        }, 2000)

      } catch (error) {
        console.error('Authentication failed:', error)
        setError(error instanceof Error ? error.message : 'Authentication failed')
        setStatus('error')
      }
    }

    handleCallback()
  }, [searchParams, navigate, login, hideLoginModal])

  const handleRetry = () => {
    navigate(withLangPrefix(lang, '/'), { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary dark:bg-secondary-dark">
      <div className="w-full max-w-md p-8 bg-pop-ups dark:bg-pop-ups-dark rounded-xl shadow-glass border border-line-subtle dark:border-line-subtle-dark">
        {status === 'loading' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-link-default dark:border-link-default-dark mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-text-main dark:text-text-main-dark mb-2 font-switzer">
              Authenticating...
            </h2>
            <p className="text-text-secondary dark:text-text-secondary-dark font-switzer">
              Please wait while we log you in.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-text-success/10 dark:bg-text-success/10 rounded-full">
              <svg
                className="w-6 h-6 text-text-success dark:text-text-success"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-text-main dark:text-text-main-dark mb-2 font-switzer">
              Login Successful!
            </h2>
            <p className="text-text-secondary dark:text-text-secondary-dark font-switzer">
              Redirecting you to the homepage...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-text-error/10 dark:bg-text-error/10 rounded-full">
              <svg
                className="w-6 h-6 text-text-error dark:text-text-error"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-text-main dark:text-text-main-dark mb-2 font-switzer">
              Authentication Failed
            </h2>
            <p className="text-text-secondary dark:text-text-secondary-dark mb-4 font-switzer">
              {error}
            </p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-link-default dark:bg-link-default-dark hover:bg-link-pressed dark:hover:bg-link-pressed text-text-inverse dark:text-text-inverse-dark rounded-lg transition-colors font-switzer"
            >
              Return to Homepage
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default AuthCallback