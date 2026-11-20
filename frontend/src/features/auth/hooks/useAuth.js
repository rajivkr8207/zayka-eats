import { useSelector, useDispatch } from 'react-redux';
import {
  loginUser,
  registerUser,
  verifyOtp,
  fetchCurrentUser,
  updateUserProfile,
  logoutUser,
  clearAuth,
  clearAuthError,
} from '../auth.slice.js';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated, isLoading, error } = useSelector((state) => state.auth);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login: (credentials) => dispatch(loginUser(credentials)),
    register: (formData) => dispatch(registerUser(formData)),
    verifyOtpCode: (payload) => dispatch(verifyOtp(payload)),
    fetchProfile: () => dispatch(fetchCurrentUser()),
    updateProfile: (data) => dispatch(updateUserProfile(data)),
    logout: () => dispatch(logoutUser()),
    clearSession: () => dispatch(clearAuth()),
    clearError: () => dispatch(clearAuthError()),
  };
};

export default useAuth;
