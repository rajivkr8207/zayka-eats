import { createSlice } from '@reduxjs/toolkit';
import {
  loginUser,
  registerUser,
  verifyOtp,
  fetchCurrentUser,
  updateUserProfile,
  logoutUser,
} from './auth.thunk.js';
import { initializeSocket, disconnectSocket } from '../../lib/socket.js';

// Load initial user state from localStorage
const storedToken = localStorage.getItem('zayka_access_token');
let storedUser;
try {
  storedUser = JSON.parse(localStorage.getItem('zayka_user'));
} catch {
  storedUser = null;
}

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: storedUser,
    token: storedToken || null,
    isAuthenticated: Boolean(storedToken),
    isLoading: false,
    error: null,
  },
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken } = action.payload;
      state.user = user;
      state.token = accessToken;
      state.isAuthenticated = true;
      state.error = null;
      if (accessToken) {
        localStorage.setItem('zayka_access_token', accessToken);
        localStorage.setItem('zayka_user', JSON.stringify(user));
        initializeSocket(accessToken);
      }
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('zayka_access_token');
      localStorage.removeItem('zayka_user');
      disconnectSocket();
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    updateUserData: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('zayka_user', JSON.stringify(state.user));
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Verify OTP
      .addCase(verifyOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.user) {
          state.user = action.payload.user;
          state.token = action.payload.accessToken;
          state.isAuthenticated = true;
        }
        state.error = null;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Profile fetch
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      // Profile update
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { setCredentials, clearAuth, clearAuthError, updateUserData } = authSlice.actions;

// Re-export thunks for seamless importing from slice
export {
  loginUser,
  registerUser,
  verifyOtp,
  fetchCurrentUser,
  updateUserProfile,
  logoutUser,
};

export default authSlice.reducer;
