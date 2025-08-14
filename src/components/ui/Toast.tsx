import React, { useState, useEffect } from 'react'
import { useAtom } from 'jotai'
import { toastMessagesAtom, removeToastAtom } from '../../store/toastStore'

const Toast: React.FC = () => {
  const [messages] = useAtom(toastMessagesAtom)
  const [, removeToast] = useAtom(removeToastAtom)
  const [visibleMessages, setVisibleMessages] = useState<Set<string>>(new Set())

  // 处理消息的显示和隐藏动画
  useEffect(() => {
    const newVisibleMessages = new Set<string>()
    
    messages.forEach(message => {
      newVisibleMessages.add(message.id)
      
      // 如果消息刚添加，设置显示状态
      if (!visibleMessages.has(message.id)) {
        setTimeout(() => {
          setVisibleMessages(prev => new Set([...prev, message.id]))
        }, 10)
      }
    })
    
    // 移除不再存在的消息
    setVisibleMessages(prev => {
      const updated = new Set<string>()
      messages.forEach(message => {
        if (prev.has(message.id)) {
          updated.add(message.id)
        }
      })
      return updated
    })
  }, [messages, visibleMessages])

  const getToastStyles = (type: 'success' | 'error' | 'info') => {
    switch (type) {
      case 'success':
        return 'bg-green-500 text-white'
      case 'error':
        return 'bg-red-500 text-white'
      case 'info':
        return 'bg-blue-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const handleRemove = (id: string) => {
    setVisibleMessages(prev => {
      const updated = new Set(prev)
      updated.delete(id)
      return updated
    })
    
    // 延迟移除，让动画完成
    setTimeout(() => {
      removeToast(id)
    }, 300)
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`
            px-4 py-3 rounded-lg shadow-lg max-w-sm transition-all duration-300 ease-in-out
            ${getToastStyles(message.type)}
            ${visibleMessages.has(message.id) 
              ? 'opacity-100 translate-x-0 scale-100' 
              : 'opacity-0 translate-x-full scale-95'
            }
          `}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{message.message}</span>
            <button
              onClick={() => handleRemove(message.id)}
              className="ml-3 text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Toast
