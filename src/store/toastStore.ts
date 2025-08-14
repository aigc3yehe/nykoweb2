import { atom } from 'jotai'

export interface ToastMessage {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
  duration?: number
}

export const toastMessagesAtom = atom<ToastMessage[]>([])

export const addToastAtom = atom(
  null,
  (get, set, message: Omit<ToastMessage, 'id'>) => {
    const currentMessages = get(toastMessagesAtom)
    const id = Date.now().toString()
    const newMessage: ToastMessage = {
      id,
      duration: 3000,
      ...message
    }
    
    set(toastMessagesAtom, [...currentMessages, newMessage])
    
    // 自动移除toast
    setTimeout(() => {
      set(removeToastAtom, id)
    }, newMessage.duration || 3000)
  }
)

export const removeToastAtom = atom(
  null,
  (get, set, id: string) => {
    const currentMessages = get(toastMessagesAtom)
    set(toastMessagesAtom, currentMessages.filter(msg => msg.id !== id))
  }
)

export const clearToastsAtom = atom(
  null,
  (_, set) => {
    set(toastMessagesAtom, [])
  }
)
