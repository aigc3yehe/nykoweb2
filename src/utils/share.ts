/**
 * 复制文本到剪贴板
 * @param text 要复制的文本
 * @returns Promise<boolean> 是否复制成功
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      // 使用现代 Clipboard API
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // 降级到传统方法
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      const result = document.execCommand('copy')
      document.body.removeChild(textArea)
      return result
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}

/**
 * 分享当前页面URL
 * @param customUrl 自定义URL，如果不提供则使用当前页面URL
 * @returns Promise<boolean> 是否分享成功
 */
export const shareCurrentPage = async (customUrl?: string): Promise<boolean> => {
  const url = customUrl || window.location.href
  return await copyToClipboard(url)
}
