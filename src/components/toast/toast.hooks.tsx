import { useDispatch } from '@src/store/hooks.store'
import {
  addToastMessage,
  deleteToastMessage,
  resetToastData,
} from '@src/store/redux/toast/toast.slice'
import { createContext } from 'react'

export const ToastProvider = createContext<
  { id: number; message: string; type: 'success' | 'error' }[] | null
>(null)

export function useToast() {
  const dispatch = useDispatch()
  const success = (msg: string) => {
    dispatch(
      addToastMessage({
        id: Date.now(),
        message: msg,
        type: 'success',
        height: 50,
      })
    )
  }
  const remove = (id: number) => {
    dispatch(deleteToastMessage(id))
  }
  const reset = (
    data: {
      id: number
      message: string
      type: 'success' | 'error'
      height: number
    }[]
  ) => {
    dispatch(resetToastData(data))
  }

  return { success, remove, reset }
}
