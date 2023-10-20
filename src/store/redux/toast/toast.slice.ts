import { createSlice } from '@reduxjs/toolkit'

export interface ToastReduxState {
  data: {
    id: number
    message: string
    type: 'success' | 'error'
  }[]
}
const initialState: ToastReduxState = {
  data: [],
}
const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    addToastMessage: (
      state,
      action: { payload: ToastReduxState['data'][0] }
    ) => {
      state.data.push(action.payload)
    },
    deleteToastMessage: (state, action: { payload: number }) => {
      state.data = state.data.filter((el) => el.id !== action.payload)
    },
    resetToastData: (state, action: { payload: ToastReduxState['data'] }) => {
      state.data = action.payload
    },
  },
})

export const { addToastMessage, deleteToastMessage, resetToastData } =
  toastSlice.actions
export default toastSlice.reducer
