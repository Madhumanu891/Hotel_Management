import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import {
  Hotel, LayoutDashboard, Calendar, Users, Settings,
  ClipboardList, ChefHat, BarChart3, LogOut, Menu, X,User
} from 'lucide-react';
import { Activity } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useLogout } from '../hooks/useAuth';

const navByRole = {
  hotel_manager: [
    { to: '/dashboard/manager', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/dashboard/manager/bookings', label: 'Bookings', icon: Calendar },
    { to: '/dashboard/manager/staff', label: 'Staff', icon: Users },
    { to: '/dashboard/manager/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/dashboard/manager/settings', label: 'Settings', icon: Settings },
  ],
  receptionist: [
    { to: '/dashboard/receptionist', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/dashboard/receptionist/checkin', label: 'Check-in', icon: Calendar },
    { to: '/dashboard/receptionist/checkout', label: 'Check-out', icon: Calendar },
    { to: '/dashboard/receptionist/rooms', label: 'Room Map', icon: Hotel },
  ],
  housekeeping: [
    { to: '/dashboard/housekeeping', label: 'My Tasks', icon: ClipboardList },
    { to: '/dashboard/housekeeping/all', label: 'All Rooms', icon: Hotel },
  ],
  restaurant_staff: [
    { to: '/dashboard/restaurant', label: 'Live Orders', icon: ChefHat },
    { to: '/dashboard/restaurant/menu', label: 'Menu', icon: ClipboardList },
  ],
  super_admin: [
    { to: '/dashboard/admin', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/dashboard/admin/properties', label: 'Properties', icon: Hotel },
    { to: '/dashboard/admin/analytics', label: 'System', icon: Activity },
    { to: '/dashboard/admin/users', label: 'Overview', icon: Users },
  ],
  hr_manager: [
    { to: '/dashboard/hr', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/dashboard/hr/staff', label: 'Staff', icon: Users },
    { to: '/dashboard/hr/shifts', label: 'Shifts', icon: Calendar },
    { to: '/dashboard/hr/leave', label: 'Leave', icon: ClipboardList },
  ],
  accountant: [
    { to: '/dashboard/accountant', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/dashboard/accountant/payments', label: 'Revenue', icon: BarChart3 },
  ],
};

export default function StaffLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuthStore();
  const logoutMutation = useLogout();

  const navItems = navByRole[user?.role] || [];

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-gray-900 text-white w-64">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="h-9 w-9 rounded-xl bg-primary-700 flex items-center justify-center">
          <Hotel className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="font-bold text-sm">NexoraHotels</div>
          <div className="text-xs text-gray-400 capitalize">{user?.role?.replace('_', ' ')}</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={navItems.findIndex(n => n.to === to) === 0}
            className={({ isActive }) => isActive ? 'sidebar-active' : 'sidebar-item'}
            onClick={() => setSidebarOpen(false)}
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <NavLink
        to={`/dashboard/${user?.role === 'super_admin' ? 'admin' : user?.role?.replace('_', '-')}/profile`}
        className={({ isActive }) => isActive ? 'sidebar-active' : 'sidebar-item'}
      >
        <User className="h-5 w-5" />
        My Profile
      </NavLink>

      {/* User + logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="h-8 w-8 rounded-full bg-primary-700 flex items-center justify-center text-xs font-bold">
            {(user?.name || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{user?.name || 'Staff'}</div>
            <div className="text-xs text-gray-400 truncate">{user?.email}</div>
          </div>
        </div>
        <button
          onClick={() => logoutMutation.mutate()}
          className="sidebar-item w-full"
        >
          <LogOut className="h-5 w-5" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-64 h-full">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-primary-700 flex items-center justify-center">
              <Hotel className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold">NexoraHotels</span>
          </div>
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Page */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}