import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Spinner from '../components/feedback/Spinner';

export function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, role, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" label="Checking authentication..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    if (window.location.pathname.startsWith('/member')) {
      return <Navigate to="/member-login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Redirect based on role
    if (role === 'member') {
      return <Navigate to="/member/dashboard" replace />;
    }
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}

export function GuestRoute({ children }) {
  const { isAuthenticated, role, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" label="Loading..." />
      </div>
    );
  }

  if (isAuthenticated) {
    if (role === 'member') {
      return <Navigate to="/member/dashboard" replace />;
    }
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}
