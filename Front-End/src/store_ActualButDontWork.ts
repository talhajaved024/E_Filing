import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the shape of your state object
interface InitialState {
  sidebarShow: boolean;
}

// Initialize your state
const initialState: InitialState = {
  sidebarShow: true,
};

const slice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    setSidebarState: (state, action: PayloadAction<Partial<InitialState>>) => {
      return { ...state, ...action.payload };
    },
  },
});

export const { setSidebarState } = slice.actions;

// Create your store
const store = configureStore({
  reducer: {
    sidebar: slice.reducer,
  },
});

export default store;