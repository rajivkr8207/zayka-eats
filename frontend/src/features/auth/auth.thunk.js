import { createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from './services/auth.service.js';
import { initializeSocket, disconnectSocket } from '../../lib/socket.js';

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      const data = response.data.data;
      if (data.accessToken) {
        initializeSocket(data.accessToken);
      }
      return data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed. Please check your credentials.';
      return rejectWithValue(msg);
    }
  },
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (formData, { rejectWithValue }) => {
    try {
      const isMultipart = formData instanceof FormData;
      const response = await authService.register(formData, isMultipart);
      return response.data.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed.';
      return rejectWithValue(msg);
    }
  },
);

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await authService.verifyOtp({ email, otp });
      const data = response.data.data;
      if (data?.accessToken) {
        initializeSocket(data.accessToken);
      }
      return data;
    } catch (error) {
      const msg = error.response?.data?.message || 'OTP verification failed.';
      return rejectWithValue(msg);
    }
  },
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getProfile();
      const user = response.data.data.user;
      return user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user profile');
    }
  },
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (formData, { rejectWithValue }) => {
    try {
      const isMultipart = formData instanceof FormData;
      const response = await authService.updateProfile(formData, isMultipart);
      const updatedUser = response.data.data.user;
      return updatedUser;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  },
);

export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  try {
    await authService.logout();
  } catch {
    // Continue cleanup even if server request fails
  }
  disconnectSocket();
  return null;
});
