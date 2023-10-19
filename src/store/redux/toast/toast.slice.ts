import { createSlice } from '@reduxjs/toolkit'

interface InitialState {
  data: {
    id: number
    message: string
    type: 'success' | 'error'
    height: number
  }[]
}
const initialState: InitialState = {
  data: [],
}
const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    addToastMessage: (state, action: { payload: InitialState['data'][0] }) => {
      state.data.push(action.payload)
    },
    deleteToastMessage: (state, action: { payload: number }) => {
      state.data = state.data.filter((el) => el.id !== action.payload)
    },
    resetToastData: (state, action: { payload: InitialState['data'] }) => {
      state.data = action.payload
    },
  },
})

export const { addToastMessage, deleteToastMessage, resetToastData } =
  toastSlice.actions
export default toastSlice.reducer
