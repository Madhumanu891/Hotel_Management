import { Outlet, NavLink } from 'react-router-dom';
import {
  Hotel, Search, Calendar, User,
  LogOut, Star, Home, Award, Menu, X,
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore }      from '../stores/authStore';
import { useLogout }         from '../hooks/useAuth';
import MobileNav             from '../components/ui/MobileNav';
import NotificationsPanel    from '../components/ui/NotificationsPanel';
import ThemeToggle           from '../components/ui/ThemeToggle';
import LanguageSelector      from '../components/ui/LanguageSelector';
import RouteScrollReset from '../components/ui/RouteScrollReset';
import ScrollToTop from '../components/ui/ScrollToTop';


const navItems = [
  { to: '/dashboard/guest',          label: 'Home',     icon: Home     },
  { to: '/dashboard/guest/search',   label: 'Search',   icon: Search   },
  { to: '/dashboard/guest/bookings', label: 'Bookings', icon: Calendar },
  { to: '/dashboard/guest/loyalty',  label: 'Rewards',  icon: Award    },
  { to: '/dashboard/guest/profile',  label: 'Profile',  icon: User     },
];

const tierColors = {
  bronze:   'text-orange-600 bg-orange-50 dark:bg-orange-900/30 dark:text-orange-400',
  silver:   'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300',
  gold:     'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30 dark:text-yellow-400',
  platinum: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-400',
};

export default function GuestLayout() {
  const { user }       = useAuthStore();
  const logoutMutation = useLogout();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const tier = user?.guestProfile?.loyaltyTier || 'bronze';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors">
      <RouteScrollReset />
      {/* Top Navigation */}
      <nav className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="h-9 w-9 rounded-xl bg-primary-700 flex items-center justify-center">
                <Hotel className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg text-gray-900 dark:text-white hidden sm:block">
                NexoraHotels
              </span>
            </div>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/dashboard/guest'}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                        : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              ))}
            </div>

            {/* Right section */}
            <div className="flex items-center gap-2">
              {/* Tier badge */}
              <span className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${tierColors[tier]}`}>
                <Star className="h-3 w-3" />
                {tier}
              </span>

              {/* User name */}
              <span className="hidden lg:block text-sm font-medium text-gray-700 dark:text-slate-300 max-w-28 truncate">
                {user?.name?.split(' ')[0] || user?.email}
              </span>

              <LanguageSelector compact />
              <ThemeToggle compact />
              <NotificationsPanel />

              {/* Logout — desktop */}
              <button
                onClick={() => logoutMutation.mutate()}
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:block">Logout</span>
              </button>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                {mobileMenuOpen
                  ? <X    className="h-5 w-5" />
                  : <Menu className="h-5 w-5" />
                }
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 space-y-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/dashboard/guest'}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                      : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                {label}
              </NavLink>
            ))}
            <div className="pt-2 border-t dark:border-slate-700 flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-slate-400">
                {user?.name || user?.email}
              </span>
              <button
                onClick={() => logoutMutation.mutate()}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Page content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <MobileNav role={user?.role} />
      <ScrollToTop />
    </div>
  );
}