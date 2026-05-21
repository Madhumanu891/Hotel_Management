// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/auth.store';
import { ROLES, ROLE_HOME_ROUTES } from './constants';

// Layouts
import DashboardLayout from './components/layout/DashboardLayout';
import PublicLayout from './components/layout/PublicLayout';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Guest pages
import SearchPage from './pages/guest/SearchPage';
import HotelDetailPage from './pages/guest/HotelDetailPage';
import MyBookingsPage from './pages/guest/MyBookingsPage';

// Receptionist
import CheckInQueuePage from './pages/receptionist/CheckInQueuePage';
import RoomMapPage from './pages/receptionist/RoomMapPage';

// Manager
import AnalyticsPage from './pages/manager/AnalyticsPage';
import StaffManagementPage from './pages/manager/StaffManagementPage';

// Housekeeping
import HousekeepingTasksPage from './pages/housekeeping/HousekeepingTasksPage';

// Restaurant
import KitchenDisplayPage from './pages/restaurant/KitchenDisplayPage';
import MenuManagementPage from './pages/restaurant/MenuManagementPage';

// HR
import ShiftsPage from './pages/hr/ShiftsPage';
import LeaveRequestsPage from './pages/hr/LeaveRequestsPage';

// Accountant
import PaymentsPage from './pages/accountant/PaymentsPage';

// Super Admin
import PropertiesPage from './pages/admin/PropertiesPage';
import UsersPage from './pages/admin/UsersPage';

// ─── Route Guards ──────────────────────────────────────────────────────────────

/**
 * ProtectedRoute: redirects to /login if not authenticated
 * If roles provided, also checks role access
 */
function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to their own dashboard if they try to access another role's page
    const homeRoute = ROLE_HOME_ROUTES[user?.role] || '/dashboard';
    return <Navigate to={homeRoute} replace />;
  }

  return children;
}

/**
 * PublicRoute: redirects to dashboard if already logged in
 * (so logged-in users can't see the login page)
 */
function PublicRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user) {
    const homeRoute = ROLE_HOME_ROUTES[user.role] || '/dashboard';
    return <Navigate to={homeRoute} replace />;
  }

  return children;
}

/**
 * DashboardRedirect: sends user to their role-specific home
 */
function DashboardRedirect() {
  const { user } = useAuthStore();
  const homeRoute = ROLE_HOME_ROUTES[user?.role] || '/login';
  return <Navigate to={homeRoute} replace />;
}

// ─── App Routes ────────────────────────────────────────────────────────────────
export default function App() {
  const R = ROLES;

  return (
    <BrowserRouter>
      <Routes>

        {/* ── Public / Marketing pages ── */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Navigate to="/search" replace />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/hotels/:slug" element={<HotelDetailPage />} />
        </Route>

        {/* ── Auth pages (redirect if logged in) ── */}
        <Route path="/login" element={
          <PublicRoute><LoginPage /></PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute><RegisterPage /></PublicRoute>
        } />
        <Route path="/forgot-password" element={
          <PublicRoute><ForgotPasswordPage /></PublicRoute>
        } />

        {/* ── Dashboard (all roles, protected) ── */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          {/* Default redirect based on role */}
          <Route index element={<DashboardRedirect />} />

          {/* Guest */}
          <Route path="bookings" element={
            <ProtectedRoute allowedRoles={[R.GUEST]}>
              <MyBookingsPage />
            </ProtectedRoute>
          } />

          {/* Receptionist */}
          <Route path="checkin" element={
            <ProtectedRoute allowedRoles={[R.RECEPTIONIST, R.HOTEL_MANAGER, R.SUPER_ADMIN]}>
              <CheckInQueuePage />
            </ProtectedRoute>
          } />
          <Route path="rooms" element={
            <ProtectedRoute allowedRoles={[R.RECEPTIONIST, R.HOTEL_MANAGER, R.SUPER_ADMIN]}>
              <RoomMapPage />
            </ProtectedRoute>
          } />

          {/* Manager */}
          <Route path="analytics" element={
            <ProtectedRoute allowedRoles={[R.HOTEL_MANAGER, R.SUPER_ADMIN]}>
              <AnalyticsPage />
            </ProtectedRoute>
          } />
          <Route path="staff" element={
            <ProtectedRoute allowedRoles={[R.HOTEL_MANAGER, R.HR_MANAGER, R.SUPER_ADMIN]}>
              <StaffManagementPage />
            </ProtectedRoute>
          } />

          {/* Housekeeping */}
          <Route path="tasks" element={
            <ProtectedRoute allowedRoles={[R.HOUSEKEEPING, R.HOTEL_MANAGER, R.SUPER_ADMIN]}>
              <HousekeepingTasksPage />
            </ProtectedRoute>
          } />

          {/* Restaurant */}
          <Route path="kitchen" element={
            <ProtectedRoute allowedRoles={[R.RESTAURANT_STAFF, R.HOTEL_MANAGER, R.SUPER_ADMIN]}>
              <KitchenDisplayPage />
            </ProtectedRoute>
          } />
          <Route path="menu" element={
            <ProtectedRoute allowedRoles={[R.RESTAURANT_STAFF, R.HOTEL_MANAGER, R.SUPER_ADMIN]}>
              <MenuManagementPage />
            </ProtectedRoute>
          } />

          {/* HR */}
          <Route path="shifts" element={
            <ProtectedRoute allowedRoles={[R.HR_MANAGER, R.HOTEL_MANAGER, R.SUPER_ADMIN]}>
              <ShiftsPage />
            </ProtectedRoute>
          } />
          <Route path="leave" element={
            <ProtectedRoute allowedRoles={[R.HR_MANAGER, R.HOTEL_MANAGER, R.SUPER_ADMIN]}>
              <LeaveRequestsPage />
            </ProtectedRoute>
          } />

          {/* Accountant */}
          <Route path="payments" element={
            <ProtectedRoute allowedRoles={[R.ACCOUNTANT, R.HOTEL_MANAGER, R.SUPER_ADMIN]}>
              <PaymentsPage />
            </ProtectedRoute>
          } />

          {/* Super Admin */}
          <Route path="properties" element={
            <ProtectedRoute allowedRoles={[R.SUPER_ADMIN]}>
              <PropertiesPage />
            </ProtectedRoute>
          } />
          <Route path="users" element={
            <ProtectedRoute allowedRoles={[R.SUPER_ADMIN]}>
              <UsersPage />
            </ProtectedRoute>
          } />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/search" replace />} />

      </Routes>
    </BrowserRouter>
  );
}