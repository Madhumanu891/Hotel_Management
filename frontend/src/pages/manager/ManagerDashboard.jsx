import { useState } from 'react';
import {
  TrendingUp, Users, BedDouble, DollarSign,
  ArrowUpRight, ArrowDownRight, Calendar, AlertTriangle,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { useAuthStore } from '../../stores/authStore';
import Spinner from '../../components/ui/Spinner';

const useManagerStats = (propertyId) =>
  useQuery({
    queryKey: ['analytics', 'stats', propertyId],
    queryFn: () =>
      api.get(`/api/analytics/${propertyId}/stats`).then(r => r.data.data),
    enabled: !!propertyId,
    refetchInterval: 60000, // Refresh every minute
  });

const useRevenueReport = (propertyId) => {
  const end = new Date().toISOString().split('T')[0];
  const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  return useQuery({
    queryKey: ['analytics', 'revenue', propertyId],
    queryFn: () =>
      api.get(`/api/analytics/${propertyId}/revenue`, {
        params: { startDate: start, endDate: end, groupBy: 'day' },
      }).then(r => r.data.data),
    enabled: !!propertyId,
  });
};

const usePropertyBookings = (propertyId) =>
  useQuery({
    queryKey: ['bookings', 'property', propertyId],
    queryFn: () =>
      api.get(`/api/bookings/property/${propertyId}`, {
        params: { limit: 10 },
      }).then(r => r.data),
    enabled: !!propertyId,
  });

const StatCard = ({ label, value, icon: Icon, change, color = 'primary' }) => {
  const colors = {
    primary: 'bg-primary-50 text-primary-700',
    green: 'bg-green-50 text-green-700',
    blue: 'bg-blue-50 text-blue-700',
    orange: 'bg-orange-50 text-orange-700',
  };
  const isPositive = change >= 0;

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
    </div>
  );
};

const statusConfig = {
  pending: 'badge-warning',
  confirmed: 'badge-success',
  checked_in: 'badge-info',
  checked_out: 'badge-purple',
  cancelled: 'badge-error',
};

export default function ManagerDashboard() {
  const { user } = useAuthStore();
  const propertyId = user?.propertyId || '69d6817ab880abc410462b20';

  const { data: stats, isLoading: statsLoading } = useManagerStats(propertyId);
  const { data: revenue, isLoading: revenueLoading } = useRevenueReport(propertyId);
  const { data: bookingsData } = usePropertyBookings(propertyId);

  const recentBookings = bookingsData?.bookings?.slice(0, 8) || [];

  // Format revenue chart data
  const chartData = revenue?.data?.slice(-14).map(d => ({
    date: new Date(d.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    revenue: Math.round(d.revenue / 1000), // in thousands
    bookings: d.bookings,
  })) || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
          <p className="text-gray-500 mt-1">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="badge-purple px-3 py-1.5 text-sm">
          Live Data
        </div>
      </div>

      {/* Stats row */}
      {statsLoading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Today's Arrivals"
            value={stats?.todayArrivals || 0}
            icon={Calendar}
            color="primary"
          />
          <StatCard
            label="Today's Departures"
            value={stats?.todayDepartures || 0}
            icon={Users}
            color="blue"
          />
          <StatCard
            label="Currently Occupied"
            value={stats?.currentOccupancy || 0}
            icon={BedDouble}
            color="green"
          />
          <StatCard
            label="Monthly Revenue"
            value={`₹${((stats?.monthlyRevenue || 0) / 1000).toFixed(0)}K`}
            icon={DollarSign}
            color="orange"
          />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue chart */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-6">Revenue (Last 14 days)</h2>
          {revenueLoading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : chartData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400">
              <div className="text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No revenue data yet</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} unit="K" />
                <Tooltip
                  formatter={(value) => [`₹${value}K`, 'Revenue']}
                  labelStyle={{ fontWeight: 600 }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6d28d9"
                  strokeWidth={2.5}
                  dot={{ fill: '#6d28d9', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Bookings chart */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-6">Bookings (Last 14 days)</h2>
          {revenueLoading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : chartData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400">
              <div className="text-center">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No booking data yet</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value) => [value, 'Bookings']}
                  labelStyle={{ fontWeight: 600 }}
                />
                <Bar dataKey="bookings" fill="#6d28d9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent bookings */}
      <div className="card">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Bookings</h2>
          <span className="text-sm text-gray-500">{bookingsData?.pagination?.total || 0} total</span>
        </div>
        <div className="overflow-x-auto">
          {recentBookings.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p>No bookings yet</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Booking Ref</th>
                  <th className="px-6 py-3">Check-in</th>
                  <th className="px-6 py-3">Check-out</th>
                  <th className="px-6 py-3">Guests</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentBookings.map(booking => (
                  <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm font-medium text-primary-700">
                      {booking.bookingRef}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(booking.checkInDate).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(booking.checkOutDate).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {booking.adults + (booking.children || 0)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      ₹{booking.pricing?.totalAmount?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={statusConfig[booking.status] || 'badge-info'}>
                        {booking.status?.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Quick alerts */}
      {(stats?.todayArrivals > 0 || stats?.currentOccupancy > 0) && (
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Today's Attention
          </h2>
          <div className="space-y-3">
            {stats?.todayArrivals > 0 && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg text-sm">
                <span className="text-blue-800">{stats.todayArrivals} guests arriving today</span>
                <span className="badge-info">Check-in ready</span>
              </div>
            )}
            {stats?.todayDepartures > 0 && (
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg text-sm">
                <span className="text-orange-800">{stats.todayDepartures} guests departing today</span>
                <span className="badge-warning">Prepare checkout</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}