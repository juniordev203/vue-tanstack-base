import { ref } from 'vue'

export interface Toast {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
  duration?: number
  open?: boolean
  onOpenChange?: (value: boolean) => void
}

const toasts = ref<Toast[]>([])
let toastCount = 0

function toast(props: Omit<Toast, 'id'>) {
  const id = String(toastCount++)
  const newToast: Toast = {
    ...props,
    id,
    open: true,
    onOpenChange: (open: boolean) => {
      if (!open) dismiss(id)
    },
  }
  toasts.value = [...toasts.value, newToast]

  if (props.duration !== 0) {
    setTimeout(() => {
      dismiss(id)
    }, props.duration ?? 5000)
  }

  return {
    id,
    dismiss: () => dismiss(id),
  }
}

function dismiss(id: string) {
  toasts.value = toasts.value.filter(t => t.id !== id)
}

export function useToast() {
  return {
    toasts,
    toast,
    dismiss,
  }
}
