import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const roleRoutes = {
  guest:            '/dashboard/guest',
  receptionist:     '/dashboard/receptionist',
  hotel_manager:    '/dashboard/manager',
  housekeeping:     '/dashboard/housekeeping',
  restaurant_staff: '/dashboard/restaurant',
  hr_manager:       '/dashboard/hr',
  accountant:       '/dashboard/accountant',
  super_admin:      '/dashboard/admin',
};

export default function PublicRoute({ children }) {
  const { token, user } = useAuthStore();

  if (token && user) {
    const redirect = roleRoutes[user.role] || '/dashboard/guest';
    return <Navigate to={redirect} replace />;
  }

  return children;
}