import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute     from './ProtectedRoute';
import PublicRoute        from './PublicRoute';

// Auth
import LoginPage          from '../pages/auth/LoginPage';
import RegisterPage       from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage  from '../pages/auth/ResetPasswordPage';

// Layouts
import GuestLayout        from '../layouts/GuestLayout';
import StaffLayout        from '../layouts/StaffLayout';

// Guest
import GuestDashboard     from '../pages/guest/GuestDashboard';
import SearchPage         from '../pages/guest/SearchPage';
import HotelDetailPage    from '../pages/guest/HotelDetailPage';
import BookingPage        from '../pages/guest/BookingPage';
import PaymentPage        from '../pages/guest/PaymentPage';
import MyBookingsPage     from '../pages/guest/MyBookingsPage';

// Staff
import ManagerDashboard      from '../pages/manager/ManagerDashboard';
import ReceptionistDashboard from '../pages/receptionist/ReceptionistDashboard';
import HousekeepingDashboard from '../pages/housekeeping/HousekeepingDashboard';
import RestaurantDashboard   from '../pages/restaurant/RestaurantDashboard';
import HRDashboard           from '../pages/hr/HRDashboard';
import AdminDashboard        from '../pages/admin/AdminDashboard';

// Accountant placeholder
const AccountantDashboard = () => (
  <div className="card p-8">
    <h1 className="text-xl font-bold text-gray-900 mb-2">Accountant Dashboard</h1>
    <p className="text-gray-500">Payment reports and financial analytics coming soon.</p>
  </div>
);

export const router = createBrowserRouter([
  // Public
  { path: '/',                   element: <PublicRoute><LoginPage /></PublicRoute> },
  { path: '/login',              element: <PublicRoute><LoginPage /></PublicRoute> },
  { path: '/register',           element: <PublicRoute><RegisterPage /></PublicRoute> },
  { path: '/forgot-password',    element: <PublicRoute><ForgotPasswordPage /></PublicRoute> },
  { path: '/reset-password/:token', element: <PublicRoute><ResetPasswordPage /></PublicRoute> },

  // Guest
  {
    path: '/dashboard/guest',
    element: <ProtectedRoute roles={['guest']}><GuestLayout /></ProtectedRoute>,
    children: [
      { index: true,          element: <GuestDashboard /> },
      { path: 'search',       element: <SearchPage /> },
      { path: 'hotels/:slug', element: <HotelDetailPage /> },
      { path: 'book',         element: <BookingPage /> },
      { path: 'payment',      element: <PaymentPage /> },
      { path: 'bookings',     element: <MyBookingsPage /> },
    ],
  },

  // Manager
  {
    path: '/dashboard/manager',
    element: <ProtectedRoute roles={['hotel_manager', 'super_admin']}><StaffLayout /></ProtectedRoute>,
    children: [{ index: true, element: <ManagerDashboard /> }],
  },

  // Receptionist
  {
    path: '/dashboard/receptionist',
    element: <ProtectedRoute roles={['receptionist', 'hotel_manager', 'super_admin']}><StaffLayout /></ProtectedRoute>,
    children: [{ index: true, element: <ReceptionistDashboard /> }],
  },

  // Housekeeping
  {
    path: '/dashboard/housekeeping',
    element: <ProtectedRoute roles={['housekeeping', 'hotel_manager', 'super_admin']}><StaffLayout /></ProtectedRoute>,
    children: [{ index: true, element: <HousekeepingDashboard /> }],
  },

  // Restaurant
  {
    path: '/dashboard/restaurant',
    element: <ProtectedRoute roles={['restaurant_staff', 'hotel_manager', 'super_admin']}><StaffLayout /></ProtectedRoute>,
    children: [{ index: true, element: <RestaurantDashboard /> }],
  },

  // HR
  {
    path: '/dashboard/hr',
    element: <ProtectedRoute roles={['hr_manager', 'hotel_manager', 'super_admin']}><StaffLayout /></ProtectedRoute>,
    children: [{ index: true, element: <HRDashboard /> }],
  },

  // Accountant
  {
    path: '/dashboard/accountant',
    element: <ProtectedRoute roles={['accountant', 'hotel_manager', 'super_admin']}><StaffLayout /></ProtectedRoute>,
    children: [{ index: true, element: <AccountantDashboard /> }],
  },

  // Admin
  {
    path: '/dashboard/admin',
    element: <ProtectedRoute roles={['super_admin']}><StaffLayout /></ProtectedRoute>,
    children: [{ index: true, element: <AdminDashboard /> }],
  },

  // Catch all
  { path: '*', element: <LoginPage /> },
]);