import { useSelector } from 'react-redux';
import { Navigate, useLocation, Outlet } from 'react-router';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isInitialized } = useSelector((state) => state.auth);
  const location = useLocation();

  // If initial auth check (on browser refresh) has not completed yet, show loading spinner
  if (!isInitialized) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-text-muted font-medium">Verifying session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && (!user?.role || !allowedRoles.includes(user.role))) {
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
