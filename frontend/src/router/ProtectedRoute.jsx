import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function ProtectedRoute({ children, roles = [] }) {
  const { user, token } = useAuthStore();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    // Redirect to correct dashboard for their role
    const routes = {
      guest:            '/dashboard/guest',
      receptionist:     '/dashboard/receptionist',
      hotel_manager:    '/dashboard/manager',
      housekeeping:     '/dashboard/housekeeping',
      restaurant_staff: '/dashboard/restaurant',
      hr_manager:       '/dashboard/hr',
      accountant:       '/dashboard/accountant',
      super_admin:      '/dashboard/admin',
    };
    return <Navigate to={routes[user.role] || '/login'} replace />;
  }

  return children;
}