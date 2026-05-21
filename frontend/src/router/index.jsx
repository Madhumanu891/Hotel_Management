import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute   from './ProtectedRoute';
import PublicRoute      from './PublicRoute';

// Auth pages
import LoginPage        from '../pages/auth/LoginPage';
import RegisterPage     from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage  from '../pages/auth/ResetPasswordPage';

// Layouts
import GuestLayout      from '../layouts/GuestLayout';
import StaffLayout      from '../layouts/StaffLayout';

// Guest pages
import GuestDashboard   from '../pages/guest/GuestDashboard';
import SearchPage       from '../pages/guest/SearchPage';
import HotelDetailPage  from '../pages/guest/HotelDetailPage';
import BookingPage      from '../pages/guest/BookingPage';
import PaymentPage      from '../pages/guest/PaymentPage';
import MyBookingsPage   from '../pages/guest/MyBookingsPage';

// Staff pages
import ManagerDashboard   from '../pages/manager/ManagerDashboard';
import ReceptionistDashboard from '../pages/receptionist/ReceptionistDashboard';
import HousekeepingDashboard from '../pages/housekeeping/HousekeepingDashboard';
import AdminDashboard     from '../pages/admin/AdminDashboard';

export const router = createBrowserRouter([
  // Public routes
  {
    path: '/',
    element: <PublicRoute><LoginPage /></PublicRoute>,
  },
  {
    path: '/login',
    element: <PublicRoute><LoginPage /></PublicRoute>,
  },
  {
    path: '/register',
    element: <PublicRoute><RegisterPage /></PublicRoute>,
  },
  {
    path: '/forgot-password',
    element: <PublicRoute><ForgotPasswordPage /></PublicRoute>,
  },
  {
    path: '/reset-password/:token',
    element: <PublicRoute><ResetPasswordPage /></PublicRoute>,
  },

  // Guest dashboard
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

  // Manager dashboard
  {
    path: '/dashboard/manager',
    element: <ProtectedRoute roles={['hotel_manager', 'super_admin']}><StaffLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <ManagerDashboard /> },
    ],
  },

  // Receptionist dashboard
  {
    path: '/dashboard/receptionist',
    element: <ProtectedRoute roles={['receptionist', 'hotel_manager', 'super_admin']}><StaffLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <ReceptionistDashboard /> },
    ],
  },

  // Housekeeping dashboard
  {
    path: '/dashboard/housekeeping',
    element: <ProtectedRoute roles={['housekeeping', 'hotel_manager', 'super_admin']}><StaffLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <HousekeepingDashboard /> },
    ],
  },

  // Super admin
  {
    path: '/dashboard/admin',
    element: <ProtectedRoute roles={['super_admin']}><StaffLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <AdminDashboard /> },
    ],
  },

  // Catch all
  {
    path: '*',
    element: <LoginPage />,
  },
]);