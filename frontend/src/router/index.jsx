import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

// Auth
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';

// Layouts
import GuestLayout from '../layouts/GuestLayout';
import StaffLayout from '../layouts/StaffLayout';

// Guest
import GuestDashboard from '../pages/guest/GuestDashboard';
import SearchPage from '../pages/guest/SearchPage';
import HotelDetailPage from '../pages/guest/HotelDetailPage';
import BookingPage from '../pages/guest/BookingPage';
import PaymentPage from '../pages/guest/PaymentPage';
import MyBookingsPage from '../pages/guest/MyBookingsPage';

// Staff
import ManagerDashboard from '../pages/manager/ManagerDashboard';
import ReceptionistDashboard from '../pages/receptionist/ReceptionistDashboard';
import HousekeepingDashboard from '../pages/housekeeping/HousekeepingDashboard';
import RestaurantDashboard from '../pages/restaurant/RestaurantDashboard';
import HRDashboard from '../pages/hr/HRDashboard';
import AdminDashboard from '../pages/admin/AdminDashboard';


import AccountantDashboard from '../pages/accountant/AccountantDashboard';

import ProfilePage from '../pages/profile/ProfilePage';

import BookingDetailPage from '../pages/guest/BookingDetailPage';
import LoyaltyPage from '../pages/guest/LoyaltyPage';


// const AccountantDashboard = () => (
//   <div className="card p-8">
//     <h1 className="text-xl font-bold text-gray-900 mb-2">Accountant Dashboard</h1>
//     <p className="text-gray-500">Payment reports and financial analytics coming soon.</p>
//   </div>
// );

export const router = createBrowserRouter([
  // ── Public ──────────────────────────────────────────────────────────────
  { path: '/', element: <PublicRoute><LoginPage /></PublicRoute> },
  { path: '/login', element: <PublicRoute><LoginPage /></PublicRoute> },
  { path: '/register', element: <PublicRoute><RegisterPage /></PublicRoute> },
  { path: '/forgot-password', element: <PublicRoute><ForgotPasswordPage /></PublicRoute> },
  { path: '/reset-password/:token', element: <PublicRoute><ResetPasswordPage /></PublicRoute> },

  // ── Guest ────────────────────────────────────────────────────────────────
  {
    path: '/dashboard/guest',
    element: <ProtectedRoute roles={['guest']}><GuestLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <GuestDashboard /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'hotels/:slug', element: <HotelDetailPage /> },
      { path: 'book', element: <BookingPage /> },
      { path: 'payment', element: <PaymentPage /> },
      { path: 'bookings', element: <MyBookingsPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'bookings/:id', element: <BookingDetailPage /> },
      { path: 'loyalty', element: <LoyaltyPage /> },
    ],
  },

  // ── Manager ──────────────────────────────────────────────────────────────
  {
    path: '/dashboard/manager',
    element: <ProtectedRoute roles={['hotel_manager', 'super_admin']}><StaffLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <ManagerDashboard /> },
      { path: 'bookings', element: <ManagerDashboard /> },
      { path: 'staff', element: <ManagerDashboard /> },
      { path: 'analytics', element: <ManagerDashboard /> },
      { path: 'settings', element: <ManagerDashboard /> },
      { path: 'profile', element: <ProfilePage /> },

    ],
  },

  // ── Receptionist ─────────────────────────────────────────────────────────
  {
    path: '/dashboard/receptionist',
    element: <ProtectedRoute roles={['receptionist', 'hotel_manager', 'super_admin']}><StaffLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <ReceptionistDashboard /> },
      { path: 'checkin', element: <ReceptionistDashboard /> },
      { path: 'checkout', element: <ReceptionistDashboard /> },
      { path: 'rooms', element: <ReceptionistDashboard /> },
      { path: 'profile', element: <ProfilePage /> },

    ],
  },

  // ── Housekeeping ─────────────────────────────────────────────────────────
  {
    path: '/dashboard/housekeeping',
    element: <ProtectedRoute roles={['housekeeping', 'hotel_manager', 'super_admin']}><StaffLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <HousekeepingDashboard /> },
      { path: 'all', element: <HousekeepingDashboard /> },
      { path: 'profile', element: <ProfilePage /> },

    ],
  },

  // ── Restaurant ───────────────────────────────────────────────────────────
  {
    path: '/dashboard/restaurant',
    element: <ProtectedRoute roles={['restaurant_staff', 'hotel_manager', 'super_admin']}><StaffLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <RestaurantDashboard /> },
      { path: 'menu', element: <RestaurantDashboard /> },
      { path: 'profile', element: <ProfilePage /> },

    ],
  },

  // ── HR ───────────────────────────────────────────────────────────────────
  {
    path: '/dashboard/hr',
    element: <ProtectedRoute roles={['hr_manager', 'hotel_manager', 'super_admin']}><StaffLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <HRDashboard /> },
      { path: 'staff', element: <HRDashboard /> },
      { path: 'shifts', element: <HRDashboard /> },
      { path: 'leave', element: <HRDashboard /> },
      { path: 'profile', element: <ProfilePage /> },

    ],
  },

  // ── Accountant ───────────────────────────────────────────────────────────
  {
    path: '/dashboard/accountant',
    element: <ProtectedRoute roles={['accountant', 'hotel_manager', 'super_admin']}><StaffLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <AccountantDashboard /> },
      { path: 'payments', element: <AccountantDashboard /> },
      { path: 'profile', element: <ProfilePage /> },

    ],
  },

  // ── Super Admin ──────────────────────────────────────────────────────────
  {
    path: '/dashboard/admin',
    element: <ProtectedRoute roles={['super_admin']}><StaffLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'properties', element: <AdminDashboard tab="properties" /> },
      { path: 'analytics', element: <AdminDashboard tab="health" /> },
      { path: 'users', element: <AdminDashboard tab="overview" /> },
      { path: 'profile', element: <ProfilePage /> },

    ],
  },

  // ── Catch all ────────────────────────────────────────────────────────────
  { path: '*', element: <LoginPage /> },
]);