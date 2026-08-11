import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Hotel, LayoutDashboard, Calendar, Users, Settings,
  ClipboardList, ChefHat, BarChart3, LogOut, Menu, X,
  Activity, Building2, DollarSign, Bell, User,
  FileText, Clock, Star, TrendingUp, Utensils,
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useLogout } from '../hooks/useAuth';
import NotificationsPanel from '../components/ui/NotificationsPanel';
import ThemeToggle from '../components/ui/ThemeToggle';
import LanguageSelector from '../components/ui/LanguageSelector';
import ScrollToTop from '../components/ui/ScrollToTop';
import RouteScrollReset from '../components/ui/RouteScrollReset';


// ── Nav config per role ───────────────────────────────────────────────────────
const navByRole = {
  hotel_manager: [
    { to: '/dashboard/manager', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/dashboard/manager/bookings', label: 'Bookings', icon: Calendar },
    { to: '/dashboard/manager/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/dashboard/manager/staff', label: 'Staff', icon: Users },
    { to: '/dashboard/manager/profile', label: 'My Profile', icon: User },
  ],
  receptionist: [
    { to: '/dashboard/receptionist', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/dashboard/receptionist/checkin', label: 'Check-in', icon: ClipboardList },
    { to: '/dashboard/receptionist/checkout', label: 'Check-out', icon: LogOut },
    { to: '/dashboard/receptionist/rooms', label: 'Rooms', icon: Building2 },
    { to: '/dashboard/receptionist/profile', label: 'My Profile', icon: User },
  ],
  housekeeping: [
    { to: '/dashboard/housekeeping', label: 'My Tasks', icon: ClipboardList },
    { to: '/dashboard/housekeeping/all', label: 'All Tasks', icon: LayoutDashboard },
    { to: '/dashboard/housekeeping/profile', label: 'My Profile', icon: User },
  ],
  restaurant_staff: [
    { to: '/dashboard/restaurant', label: 'Kitchen', icon: ChefHat },
    { to: '/dashboard/restaurant/menu', label: 'Menu', icon: Utensils },
    { to: '/dashboard/restaurant/profile', label: 'My Profile', icon: User },
  ],
  hr_manager: [
    { to: '/dashboard/hr', label: 'Overview', icon: LayoutDashboard },
    { to: '/dashboard/hr/staff', label: 'Staff', icon: Users },
    { to: '/dashboard/hr/shifts', label: 'Shifts', icon: Clock },
    { to: '/dashboard/hr/leave', label: 'Leave', icon: FileText },
    { to: '/dashboard/hr/profile', label: 'My Profile', icon: User },
  ],
  accountant: [
    { to: '/dashboard/accountant', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/dashboard/accountant/payments', label: 'Revenue', icon: TrendingUp },
    { to: '/dashboard/accountant/profile', label: 'My Profile', icon: User },
  ],
  super_admin: [
    { to: '/dashboard/admin', label: 'Dashboard', icon: LayoutDashboard },
    // { to: '/dashboard/admin/properties',  label: 'Properties',  icon: Building2       },
    // { to: '/dashboard/admin/users',       label: 'Overview',    icon: Users           },
    // { to: '/dashboard/admin/analytics',   label: 'System',      icon: Activity        },
    { to: '/dashboard/admin/metrics', label: 'Metrics', icon: BarChart3 },
    { to: '/dashboard/admin/profile', label: 'My Profile', icon: User },
  ],
};

const roleLabels = {
  hotel_manager: 'Hotel Manager',
  receptionist: 'Receptionist',
  housekeeping: 'Housekeeping',
  restaurant_staff: 'Restaurant Staff',
  hr_manager: 'HR Manager',
  accountant: 'Accountant',
  super_admin: 'Super Admin',
};

// ── Avatar ────────────────────────────────────────────────────────────────────
const Avatar = ({ name, size = 'sm' }) => {
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm' };
  const initials = (name || 'U')
    .split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {initials}
    </div>
  );
};

export default function StaffLayout() {
  const { user } = useAuthStore();
  const logoutMutation = useLogout();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const role = user?.role || 'receptionist';
  const navItems = navByRole[role] || navByRole.receptionist;
  const roleLabel = roleLabels[role] || role;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-700/50">
        <div className="h-9 w-9 rounded-xl bg-primary-600 flex items-center justify-center flex-shrink-0">
          <Hotel className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="font-bold text-white text-sm">NexoraHotels</div>
          <div className="text-xs text-slate-400">{roleLabel}</div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === `/dashboard/${role === 'super_admin' ? 'admin' : role}`}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
              }`
            }
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-slate-700/50 p-3 space-y-2">
        {/* Theme + Language + Notifications row */}
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-xs text-slate-500">Preferences</span>
          <div className="flex items-center gap-1">
            <LanguageSelector compact />
            <ThemeToggle compact />
            <NotificationsPanel />
          </div>
        </div>

        {/* User info */}
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-slate-700/30">
          <Avatar name={user?.name || user?.email} />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">
              {user?.name || 'Staff Member'}
            </div>
            <div className="text-xs text-slate-400 truncate">{user?.email}</div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={() => logoutMutation.mutate()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 flex-col bg-slate-900 dark:bg-slate-950 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-64 bg-slate-900 flex flex-col h-full shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center justify-between px-4 h-14 bg-white dark:bg-slate-800 border-b dark:border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="font-bold text-gray-900 dark:text-white text-sm">
              NexoraHotels
            </span>
          </div>
          <div className="flex items-center gap-2">
            <NotificationsPanel />
            <ThemeToggle compact />
            <Avatar name={user?.name || user?.email} />
          </div>
        </header>

        {/* Desktop topbar */}
        <header className="hidden lg:flex items-center justify-between px-6 h-14 bg-white dark:bg-slate-800 border-b dark:border-slate-700 flex-shrink-0">
          <div>
            <h1 className="text-sm font-semibold text-gray-900 dark:text-white">
              {roleLabel} Portal
            </h1>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'long', day: 'numeric', month: 'long',
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-slate-400 hidden xl:block">
              {user?.name}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <RouteScrollReset />
          <Outlet />
        </main>
      </div>
      <ScrollToTop />
    </div>
  );
}