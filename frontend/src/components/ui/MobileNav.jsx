import { NavLink } from 'react-router-dom';
import { Home, Search, Calendar, User } from 'lucide-react';

export default function MobileNav({ role }) {
  const guestNav = [
    { to: '/dashboard/guest',          label: 'Home',     icon: Home     },
    { to: '/dashboard/guest/search',   label: 'Search',   icon: Search   },
    { to: '/dashboard/guest/bookings', label: 'Bookings', icon: Calendar },
    { to: '/dashboard/guest/profile',  label: 'Profile',  icon: User     },
  ];

  if (role !== 'guest') return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t md:hidden">
      <div className="grid grid-cols-4">
        {guestNav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard/guest'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                isActive ? 'text-primary-700' : 'text-gray-400'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}