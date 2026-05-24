import { Outlet, NavLink } from 'react-router-dom';
import {
  Hotel, Search, Calendar, User, LogOut, Star, Home,
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useLogout } from '../hooks/useAuth';
import MobileNav from '../components/ui/MobileNav';

export default function GuestLayout() {
  const { user }       = useAuthStore();
  const logoutMutation = useLogout();

  const tierColors = {
    bronze:   'text-orange-600 bg-orange-50',
    silver:   'text-gray-600 bg-gray-100',
    gold:     'text-yellow-600 bg-yellow-50',
    platinum: 'text-purple-600 bg-purple-50',
  };
  const tier = user?.guestProfile?.loyaltyTier || 'bronze';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary-700 flex items-center justify-center">
                <Hotel className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg text-gray-900 hidden sm:block">
                NexoraHotels
              </span>
            </div>

            {/* Desktop Nav links */}
            <div className="hidden md:flex items-center gap-1">
              {[
                { to: '/dashboard/guest',          label: 'Home',     icon: Home     },
                { to: '/dashboard/guest/search',   label: 'Search',   icon: Search   },
                { to: '/dashboard/guest/bookings', label: 'Bookings', icon: Calendar },
                { to: '/dashboard/guest/profile',  label: 'Profile',  icon: User     },
              ].map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/dashboard/guest'}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              ))}
            </div>

            {/* User section */}
            <div className="flex items-center gap-3">
              <span className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${tierColors[tier]}`}>
                <Star className="h-3 w-3" />
                {tier}
              </span>
              <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-24 truncate">
                {user?.name || user?.email}
              </span>
              <button
                onClick={() => logoutMutation.mutate()}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:block">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Page content — extra bottom padding for mobile nav */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <MobileNav role={user?.role} />
    </div>
  );
}