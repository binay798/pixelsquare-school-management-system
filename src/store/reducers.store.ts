import { configureStore } from '@reduxjs/toolkit'
import authReducer from './redux/auth/auth.slice'
import toastReducer from './redux/toast/toast.slice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    toast: toastReducer,
  },
})
