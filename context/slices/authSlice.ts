import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import storage from 'redux-persist/lib/storage';
import { persistReducer } from 'redux-persist';
import { AuthData, User } from '@/types/auth';

type AuthState = {
  user: User | null;
  accessToken: string | null;
  userId: string | null;
  isAuthenticated: boolean;
};

const initialState: AuthState = {
  user: null,
  accessToken: null,
  userId: null,
  isAuthenticated: false,
};

// ✅ PERSIST CONFIG (PUT HERE)
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'accessToken', 'userId', 'isAuthenticated'],
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<AuthData>) => {
      const payload = action.payload;

      state.accessToken = payload.accessToken;
      state.userId = payload.user_id;
      state.user = payload.user;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.userId = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, logout } = authSlice.actions;

// ✅ EXPORT PERSISTED REDUCER, NOT NORMAL REDUCER
export default persistReducer(authPersistConfig, authSlice.reducer);
