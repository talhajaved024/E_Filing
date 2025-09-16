import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit'

interface InitialState {
  sidebarShow: boolean
  sidebarUnfoldable: boolean
}

const initialState: InitialState = {
  sidebarShow: true,
  sidebarUnfoldable: true,
}

const slice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    setSidebarState: (state, action: PayloadAction<Partial<InitialState>>) => {
      return { ...state, ...action.payload }
    },
  },
})

export const { setSidebarState } = slice.actions

export const store = configureStore({
  reducer: {
    sidebar: slice.reducer,
  },
})

// ✅ Export RootState type
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
