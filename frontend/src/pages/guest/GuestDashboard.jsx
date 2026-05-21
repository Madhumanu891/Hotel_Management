import { useAuthStore } from '../../stores/authStore';
import { Star, Calendar, MapPin, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function GuestDashboard() {
  const { user } = useAuthStore();
  const tier = user?.guestProfile?.loyaltyTier || 'bronze';
  const points = user?.guestProfile?.loyaltyPoints || 0;

  const tierMax = { bronze: 500, silver: 1000, gold: 2000, platinum: 2000 };
  const progress = Math.min((points / tierMax[tier]) * 100, 100);

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-primary-700 to-primary-900 rounded-2xl p-8 text-white">
        <h1 className="text-2xl font-bold mb-1">
          Welcome back, {user?.name || 'Guest'}!
        </h1>
        <p className="text-primary-200 mb-6">Ready for your next adventure?</p>
        <Link to="/dashboard/guest/search" className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-6 py-3 rounded-xl hover:bg-primary-50 transition-colors">
          <Search className="h-5 w-5" />
          Search Hotels
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Loyalty card */}
        <div className="card p-6 md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Loyalty Status</h2>
            <span className="badge-purple capitalize">{tier} Member</span>
          </div>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-3xl font-bold text-gray-900">{points}</span>
            <span className="text-gray-500 mb-1">points</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
            <div
              className="bg-primary-700 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500">
            {Math.max(0, tierMax[tier] - points)} more points to next tier
          </p>
        </div>

        {/* Quick stats */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Quick Stats</h2>
          <div className="space-y-3">
            {[
              { label: 'Total stays',  value: user?.guestProfile?.totalStays  || 0, icon: MapPin },
              { label: 'Upcoming',     value: 0,                                     icon: Calendar },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <Icon className="h-4 w-4" />
                  <span className="text-sm">{label}</span>
                </div>
                <span className="font-semibold text-gray-900">{value}</span>
              </div>
            ))}
          </div>
          <Link
            to="/dashboard/guest/bookings"
            className="mt-4 block text-center text-sm text-primary-700 font-medium hover:text-primary-800"
          >
            View all bookings →
          </Link>
        </div>
      </div>
    </div>
  );
}