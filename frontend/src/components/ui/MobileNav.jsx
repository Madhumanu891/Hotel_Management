import { NavLink } from 'react-router-dom';
import { Home, Search, Calendar, Award } from 'lucide-react';

const guestNav = [
  { to: '/dashboard/guest',          label: 'Home',     icon: Home,     end: true  },
  { to: '/dashboard/guest/search',   label: 'Search',   icon: Search,   end: false },
  { to: '/dashboard/guest/bookings', label: 'Bookings', icon: Calendar, end: false },
  { to: '/dashboard/guest/loyalty',  label: 'Rewards',  icon: Award,    end: false },
];

export default function MobileNav({ role }) {
  if (role !== 'guest') return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-800 border-t dark:border-slate-700 md:hidden shadow-lg">
      <div className="grid grid-cols-4">
        {guestNav.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                isActive
                  ? 'text-primary-700 dark:text-primary-400'
                  : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`h-5 w-5 ${isActive ? 'stroke-2' : 'stroke-1.5'}`} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}