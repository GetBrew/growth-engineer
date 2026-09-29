import type { ReactNode } from 'react'

export type ToastInput = {
  title: ReactNode
  description?: ReactNode
  media?: ReactNode
}

type Deliver = (toast: ToastInput) => void

let deliver: Deliver | null = null
const pending: Array<ToastInput> = []

export const toastManager = {
  add(toast: ToastInput) {
    if (deliver) {
      deliver(toast)
    } else {
      pending.push(toast)
    }
  },
}

export function connectToaster(next: Deliver): () => void {
  deliver = next
  for (const toast of pending.splice(0)) {
    next(toast)
  }
  return () => {
    if (deliver === next) {
      deliver = null
    }
  }
}
