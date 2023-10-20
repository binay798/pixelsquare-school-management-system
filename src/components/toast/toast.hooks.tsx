import { useDispatch } from '@src/store/hooks.store'
import {
  ToastReduxState,
  addToastMessage,
  deleteToastMessage,
  resetToastData,
} from '@src/store/redux/toast/toast.slice'
import { createContext } from 'react'

export const ToastProvider = createContext<ToastReduxState['data'] | null>(null)

export function useToast() {
  const dispatch = useDispatch()
  const success = (msg: string) => {
    dispatch(
      addToastMessage({
        id: Date.now(),
        message: msg,
        type: 'success',
      })
    )
  }
  const remove = (id: number) => {
    dispatch(deleteToastMessage(id))
  }
  const reset = (data: ToastReduxState['data']) => {
    dispatch(resetToastData(data))
  }

  return { success, remove, reset }
}
