import { reactive, readonly } from 'vue'

const state = reactive({ toasts: [] })
let id = 0

export function useToast() {
  const show = (message, type = 'info', duration = 3000) => {
    const toast = { id: ++id, message, type }
    state.toasts.push(toast)
    setTimeout(() => {
      const idx = state.toasts.findIndex(t => t.id === toast.id)
      if (idx !== -1) state.toasts.splice(idx, 1)
    }, duration)
  }

  return {
    toasts: readonly(state.toasts),
    success: (msg, dur) => show(msg, 'success', dur),
    error:   (msg, dur) => show(msg, 'error', dur),
    info:    (msg, dur) => show(msg, 'info', dur),
    remove:  (toastId) => {
      const idx = state.toasts.findIndex(t => t.id === toastId)
      if (idx !== -1) state.toasts.splice(idx, 1)
    },
  }
}
