import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function PublicRoute({ children }) {
  const { token, user } = useAuthStore();

  if (token && user) {
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
    return <Navigate to={routes[user.role] || '/dashboard/guest'} replace />;
  }

  return children;
}