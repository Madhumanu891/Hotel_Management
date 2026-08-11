import { useAuthStore } from '../../stores/authStore';
import { Star, Calendar, MapPin, Search, TrendingUp, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMyBookings } from '../../hooks/useBookings';
import Button from '../../components/ui/Button';


const tierConfig = {
  bronze: { gradient: 'from-orange-400 to-orange-600', label: 'Bronze', next: 'Silver', max: 500 },
  silver: { gradient: 'from-gray-400 to-gray-600', label: 'Silver', next: 'Gold', max: 1000 },
  gold: { gradient: 'from-yellow-400 to-yellow-600', label: 'Gold', next: 'Platinum', max: 2000 },
  platinum: { gradient: 'from-purple-500 to-purple-800', label: 'Platinum', next: null, max: 2000 },
};

export default function GuestDashboard() {
  const { user } = useAuthStore();
  const tier = user?.guestProfile?.loyaltyTier || 'bronze';
  const points = user?.guestProfile?.loyaltyPoints || 0;
  const stays = user?.guestProfile?.totalStays || 0;
  const config = tierConfig[tier] || tierConfig.bronze;
  const progress = Math.min((points / config.max) * 100, 100);

  const { data: bookingsData } = useMyBookings({ limit: 3 });
  const recentBookings = bookingsData?.bookings || [];

  const upcoming = recentBookings.filter(b => ['confirmed', 'checked_in'].includes(b.status)).length;
  const completed = recentBookings.filter(b => b.status === 'checked_out').length;

  return (
    <div className="space-y-6 pb-8">

      {/* Welcome hero */}
      <div className="bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-white/5 -translate-y-10 translate-x-10" />
        <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-white/5 translate-y-6 -translate-x-6" />
        <div className="relative">
          <p className="text-primary-300 text-sm mb-1">Good day 👋</p>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">
            {user?.name || 'Welcome back'}!
          </h1>
          <p className="text-primary-200 mb-6 text-sm sm:text-base">
            Ready for your next adventure?
          </p>
          <Link
            to="/dashboard/guest/search"
            className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-primary-50 transition-colors text-sm shadow-lg"
          >
            <Search className="h-4 w-4" />
            Search Hotels
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Stays', value: stays, icon: MapPin, color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' },
          { label: 'Upcoming', value: upcoming, icon: Clock, color: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' },
          { label: 'Completed', value: completed, icon: TrendingUp, color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' },
          { label: 'Loyalty Points', value: points, icon: Star, color: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card dark:bg-slate-800 p-4">
            <div className={`h-8 w-8 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">{value}</div>
            <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Loyalty card */}
        <div className="md:col-span-3 card dark:bg-slate-800 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Loyalty Status
            </h2>
            <Link
              to="/dashboard/guest/loyalty"
              className="text-xs text-primary-700 dark:text-primary-400 font-medium hover:underline"
            >
              View all perks →
            </Link>
          </div>

          {/* Tier visual */}
          <div className={`rounded-xl bg-gradient-to-r ${config.gradient} p-4 text-white mb-5`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white/70 text-xs mb-0.5">Current Tier</div>
                <div className="text-xl font-bold">{config.label} Member</div>
              </div>
              <div className="text-right">
                <div className="text-white/70 text-xs mb-0.5">Points</div>
                <div className="text-2xl font-bold">{points.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Progress */}
          {config.next && (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-slate-400">{config.label}</span>
                <span className="text-gray-600 dark:text-slate-400">{config.next}</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-2.5">
                <div
                  className={`bg-gradient-to-r ${config.gradient} h-2.5 rounded-full transition-all duration-500`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-2 text-right">
                {Math.max(0, config.max - points)} points to {config.next}
              </p>
            </div>
          )}
          {!config.next && (
            <div className="text-center py-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <p className="text-purple-700 dark:text-purple-400 font-semibold text-sm">
                🏆 Highest tier achieved!
              </p>
            </div>
          )}
        </div>

        {/* Quick search widget */}
        <div className="card dark:bg-slate-800 p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Search className="h-5 w-5 text-primary-600" />
            Quick Search
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const data = Object.fromEntries(new FormData(e.target));
              sessionStorage.setItem('searchParams', JSON.stringify(data));
              navigate('/dashboard/guest/search');
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
          >
            <div>
              <label className="label text-xs">City</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input
                  name="city"
                  type="text"
                  className="input pl-8 text-sm py-2"
                  placeholder="Hyderabad..."
                />
              </div>
            </div>
            <div>
              <label className="label text-xs">Check-in</label>
              <input
                name="checkIn"
                type="date"
                min={new Date().toISOString().split('T')[0]}
                className="input text-sm py-2"
              />
            </div>
            <div>
              <label className="label text-xs">Check-out</label>
              <input
                name="checkOut"
                type="date"
                min={new Date().toISOString().split('T')[0]}
                className="input text-sm py-2"
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" fullWidth className="py-2">
                <search className="h-4 w-4" />
                Search
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Recent bookings */}
      <div className="card dark:bg-slate-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Recent Bookings</h2>
          <Link
            to="/dashboard/guest/bookings"
            className="text-xs text-primary-700 dark:text-primary-400 font-medium hover:underline"
          >
            View all →
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-10 w-10 text-gray-200 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-slate-400 text-sm font-medium">
              No bookings yet
            </p>
            <p className="text-gray-400 dark:text-slate-500 text-xs mt-1 mb-4">
              Start by searching for a hotel
            </p>
            <Link
              to="/dashboard/guest/search"
              className="inline-flex items-center gap-2 btn-primary text-sm py-2"
            >
              <Search className="h-4 w-4" />
              Search Hotels
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentBookings.map(booking => {
              const statusColors = {
                pending: 'badge-warning',
                confirmed: 'badge-success',
                checked_in: 'badge-info',
                checked_out: 'badge-purple',
                cancelled: 'badge-error',
              };
              return (
                <Link
                  key={booking._id}
                  to={`/dashboard/guest/bookings/${booking._id}`}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
                >
                  <div>
                    <div className="font-mono text-sm font-bold text-primary-700 dark:text-primary-400">
                      {booking.bookingRef}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                      {new Date(booking.checkInDate).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short',
                      })} → {new Date(booking.checkOutDate).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short',
                      })}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={statusColors[booking.status] || 'badge-info'}>
                      {booking.status?.replace('_', ' ')}
                    </span>
                    <div className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                      ₹{(booking.pricing?.totalAmount || 0).toLocaleString()}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}