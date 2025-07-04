import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSetAtom } from 'jotai'
import { loginAtom, hideLoginModalAtom } from '../store/loginStore'

const AuthCallback: React.FC = () => {
  const navigate = useNavigate()
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
          navigate('/', { replace: true })
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
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        {status === 'loading' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Authenticating...
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we log you in.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full">
              <svg
                className="w-6 h-6 text-green-600"
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
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Login Successful!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Redirecting you to the homepage...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
              <svg
                className="w-6 h-6 text-red-600"
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
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Authentication Failed
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error}
            </p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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