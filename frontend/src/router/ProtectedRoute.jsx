import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const roleRedirects = {
  guest:            '/dashboard/guest',
  receptionist:     '/dashboard/receptionist',
  hotel_manager:    '/dashboard/manager',
  housekeeping:     '/dashboard/housekeeping',
  restaurant_staff: '/dashboard/restaurant',
  hr_manager:       '/dashboard/hr',
  accountant:       '/dashboard/accountant',
  super_admin:      '/dashboard/admin',
};

export default function ProtectedRoute({ children, roles = [] }) {
  const { user, token } = useAuthStore();
  const location        = useLocation();

  // Not logged in — redirect to login
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Wrong role — redirect to their dashboard
  if (roles.length > 0 && !roles.includes(user.role)) {
    const redirect = roleRedirects[user.role] || '/dashboard/guest';
    return <Navigate to={redirect} replace />;
  }

  return children;
}