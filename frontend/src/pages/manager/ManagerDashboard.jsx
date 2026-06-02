import { useState } from 'react';
import {
  TrendingUp, Users, BedDouble, DollarSign,
  Calendar, Activity, BarChart3, RefreshCw,
  ArrowUpRight, ArrowDownRight, Clock,
  CheckCircle, XCircle, Building2,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  useManagerStats, useRevenueChart,
  useOccupancyChart, usePropertyBookings,
  usePropertyDetails, useStaffOverview,
} from '../../hooks/useManager';
import { useAuthStore } from '../../stores/authStore';
import Spinner from '../../components/ui/Spinner';

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, icon: Icon, color, trend }) => (
  <div className="card dark:bg-slate-800 p-5">
    <div className="flex items-center justify-between mb-3">
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      {trend !== undefined && (
        <span className={`flex items-center gap-1 text-xs font-semibold ${
          trend >= 0
            ? 'text-green-600 dark:text-green-400'
            : 'text-red-600 dark:text-red-400'
        }`}>
          {trend >= 0
            ? <ArrowUpRight className="h-3.5 w-3.5" />
            : <ArrowDownRight className="h-3.5 w-3.5" />
          }
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
    <div className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{label}</div>
    {sub && <div className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{sub}</div>}
  </div>
);

// ── Booking Status Badge ──────────────────────────────────────────────────────
const statusBadge = {
  pending:     'badge-warning',
  confirmed:   'badge-success',
  checked_in:  'badge-info',
  checked_out: 'badge-purple',
  cancelled:   'badge-error',
};

// ── Recent Bookings Table ─────────────────────────────────────────────────────
const BookingsTable = ({ bookings, isLoading }) => {
  if (isLoading) return <div className="flex justify-center py-8"><Spinner /></div>;

  if (!bookings?.length) return (
    <div className="text-center py-8">
      <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-200 dark:text-slate-600" />
      <p className="text-gray-400 dark:text-slate-500 text-sm">No bookings yet</p>
    </div>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider bg-gray-50 dark:bg-slate-700/50">
            <th className="px-4 py-3">Reference</th>
            <th className="px-4 py-3">Check-in</th>
            <th className="px-4 py-3">Nights</th>
            <th className="px-4 py-3">Guests</th>
            <th className="px-4 py-3">Amount</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
          {bookings.slice(0, 10).map(b => {
            const nights = Math.ceil(
              (new Date(b.checkOutDate) - new Date(b.checkInDate))
              / (1000 * 60 * 60 * 24)
            );
            return (
              <tr key={b._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-bold text-primary-700 dark:text-primary-400">
                  {b.bookingRef}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-slate-400">
                  {new Date(b.checkInDate).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short',
                  })}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-slate-400">
                  {nights}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-slate-400">
                  {b.adults}A {b.children > 0 && `${b.children}C`}
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                  ₹{(b.pricing?.totalAmount || 0).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <span className={statusBadge[b.status] || 'badge-info'}>
                    {b.status?.replace('_', ' ')}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function ManagerDashboard() {
  const { user }     = useAuthStore();
  const propertyId   = user?.propertyId || '69d6817ab880abc410462b20';
  const [activeTab,  setActiveTab]  = useState('overview');
  const [dateRange,  setDateRange]  = useState(() => {
    const end   = new Date().toISOString().split('T')[0];
    const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0];
    return { startDate: start, endDate: end };
  });

  const { data: stats,      isLoading: statsLoading }     = useManagerStats(propertyId);
  const { data: revenue,    isLoading: revenueLoading }   = useRevenueChart(
    propertyId, { ...dateRange, groupBy: 'day' }
  );
  const { data: occupancy,  isLoading: occupancyLoading } = useOccupancyChart(
    propertyId, dateRange
  );
  const { data: bookingsData, isLoading: bookingsLoading } = usePropertyBookings(
    propertyId, { limit: 10, page: 1 }
  );
  const { data: property }   = usePropertyDetails(propertyId);
  const { data: staffStats } = useStaffOverview(propertyId);

  const revenueData = revenue?.data?.slice(-14).map(d => ({
    date:     new Date(d.date).toLocaleDateString('en-IN', {
      month: 'short', day: 'numeric',
    }),
    revenue:  Math.round((d.revenue || 0) / 1000),
    bookings: d.bookings || 0,
  })) || [];

  const occupancyData = occupancy?.data?.slice(-14).map(d => ({
    date:      new Date(d.date).toLocaleDateString('en-IN', {
      month: 'short', day: 'numeric',
    }),
    occupancy: d.occupancyRate || 0,
  })) || [];

  const tabs = [
    { key: 'overview',   label: 'Overview',  icon: Activity   },
    { key: 'bookings',   label: 'Bookings',  icon: Calendar   },
    { key: 'analytics',  label: 'Analytics', icon: BarChart3  },
    { key: 'staff',      label: 'Staff',     icon: Users      },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Manager Dashboard
          </h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-0.5">
            {property?.name || 'Your Property'} — {new Date().toLocaleDateString('en-IN', {
              weekday: 'long', day: 'numeric', month: 'long',
            })}
          </p>
        </div>

        {/* Date range */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl px-3 py-2 text-sm">
          <Calendar className="h-4 w-4 text-gray-400" />
          <input
            type="date"
            className="text-gray-700 dark:text-slate-300 bg-transparent outline-none text-sm"
            value={dateRange.startDate}
            onChange={e => setDateRange(d => ({ ...d, startDate: e.target.value }))}
          />
          <span className="text-gray-400">→</span>
          <input
            type="date"
            className="text-gray-700 dark:text-slate-300 bg-transparent outline-none text-sm"
            value={dateRange.endDate}
            onChange={e => setDateRange(d => ({ ...d, endDate: e.target.value }))}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-slate-800 rounded-xl p-1 overflow-x-auto scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Overview ──────────────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPIs */}
          {statsLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="card dark:bg-slate-800 p-5 animate-pulse">
                  <div className="h-10 w-10 bg-gray-200 dark:bg-slate-700 rounded-xl mb-3" />
                  <div className="h-7 bg-gray-200 dark:bg-slate-700 rounded w-16 mb-2" />
                  <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-24" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Monthly Revenue"
                value={`₹${((stats?.monthlyRevenue || 0) / 1000).toFixed(1)}K`}
                icon={DollarSign}
                color="bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400"
                trend={12}
              />
              <StatCard
                label="Monthly Bookings"
                value={stats?.monthlyBookings || 0}
                icon={Calendar}
                color="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                trend={8}
              />
              <StatCard
                label="Current Occupancy"
                value={`${stats?.currentOccupancy || 0}%`}
                icon={BedDouble}
                color="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                trend={-3}
              />
              <StatCard
                label="Today's Arrivals"
                value={stats?.todayArrivals || 0}
                icon={Users}
                color="bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400"
              />
            </div>
          )}

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue chart */}
            <div className="card dark:bg-slate-800 p-6 lg:col-span-2">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-5">
                Revenue (Last 14 Days)
              </h2>
              {revenueLoading ? (
                <div className="flex justify-center py-8"><Spinner /></div>
              ) : revenueData.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-gray-400 dark:text-slate-500">
                  <div className="text-center">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No revenue data for period</p>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis tick={{ fontSize: 10 }} unit="K" />
                    <Tooltip
                      formatter={(v, n) => [
                        n === 'revenue' ? `₹${v}K` : v,
                        n === 'revenue' ? 'Revenue' : 'Bookings',
                      ]}
                      contentStyle={{
                        borderRadius: '8px',
                        border: 'none',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#6d28d9"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Today summary */}
            <div className="card dark:bg-slate-800 p-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
                Today's Summary
              </h2>
              {statsLoading ? (
                <div className="flex justify-center py-4"><Spinner /></div>
              ) : (
                <div className="space-y-4">
                  {[
                    {
                      label: 'Arrivals',
                      value: stats?.todayArrivals    || 0,
                      icon:  CheckCircle,
                      color: 'text-green-600 bg-green-50 dark:bg-green-900/20',
                    },
                    {
                      label: 'Departures',
                      value: stats?.todayDepartures  || 0,
                      icon:  XCircle,
                      color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
                    },
                    {
                      label: 'Occupied Rooms',
                      value: stats?.currentOccupancy || 0,
                      icon:  BedDouble,
                      color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
                    },
                    {
                      label: 'Staff on Duty',
                      value: staffStats?.onDutyToday || 0,
                      icon:  Users,
                      color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
                    },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                          {label}
                        </span>
                      </div>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent bookings */}
          <div className="card dark:bg-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b dark:border-slate-700">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Recent Bookings
              </h2>
            </div>
            <BookingsTable
              bookings={bookingsData?.bookings}
              isLoading={bookingsLoading}
            />
          </div>
        </div>
      )}

      {/* ── Bookings Tab ──────────────────────────────────────────────────────── */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {/* Status filter */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {['all','pending','confirmed','checked_in','checked_out','cancelled'].map(s => (
              <button
                key={s}
                className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap capitalize bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border dark:border-slate-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-700 dark:hover:text-primary-400 transition-colors"
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="card dark:bg-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b dark:border-slate-700 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                All Bookings
              </h2>
              <span className="text-sm text-gray-500 dark:text-slate-400">
                {bookingsData?.pagination?.total || 0} total
              </span>
            </div>
            <BookingsTable
              bookings={bookingsData?.bookings}
              isLoading={bookingsLoading}
            />
          </div>
        </div>
      )}

      {/* ── Analytics Tab ─────────────────────────────────────────────────────── */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Revenue chart */}
          <div className="card dark:bg-slate-800 p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-5">
              Revenue Trend
            </h2>
            {revenueLoading ? (
              <div className="flex justify-center py-8"><Spinner /></div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={2} />
                  <YAxis tick={{ fontSize: 10 }} unit="K" />
                  <Tooltip
                    formatter={(v) => [`₹${v}K`, 'Revenue']}
                    contentStyle={{ borderRadius: '8px', border: 'none' }}
                  />
                  <Bar dataKey="revenue" fill="#6d28d9" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Occupancy chart */}
          <div className="card dark:bg-slate-800 p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-5">
              Occupancy Rate
            </h2>
            {occupancyLoading ? (
              <div className="flex justify-center py-8"><Spinner /></div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={occupancyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={2} />
                  <YAxis tick={{ fontSize: 10 }} unit="%" domain={[0,100]} />
                  <Tooltip
                    formatter={(v) => [`${v}%`, 'Occupancy']}
                    contentStyle={{ borderRadius: '8px', border: 'none' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="occupancy"
                    stroke="#059669"
                    strokeWidth={2.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Revenue summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: 'Total Revenue',
                value: `₹${((revenue?.summary?.totalRevenue || 0) / 1000).toFixed(1)}K`,
                sub: 'Selected period',
                icon: DollarSign,
                color: 'bg-primary-50 dark:bg-primary-900/20 text-primary-700',
              },
              {
                label: 'Avg Occupancy',
                value: `${occupancy?.summary?.avgOccupancyRate || 0}%`,
                sub: 'Daily average',
                icon: BedDouble,
                color: 'bg-green-50 dark:bg-green-900/20 text-green-700',
              },
              {
                label: 'Total Bookings',
                value: revenue?.summary?.totalBookings || 0,
                sub: 'Confirmed stays',
                icon: Calendar,
                color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700',
              },
            ].map(({ label, value, sub, icon: Icon, color }) => (
              <div key={label} className="card dark:bg-slate-800 p-5">
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">{value}</div>
                <div className="text-sm text-gray-500 dark:text-slate-400">{label}</div>
                <div className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Staff Tab ─────────────────────────────────────────────────────────── */}
      {activeTab === 'staff' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              {
                label: 'On Duty Today',
                value: staffStats?.onDutyToday    || 0,
                color: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400',
                icon: Users,
              },
              {
                label: 'Scheduled Today',
                value: staffStats?.scheduledToday || 0,
                color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
                icon: Clock,
              },
              {
                label: 'Pending Leaves',
                value: staffStats?.pendingLeaves  || 0,
                color: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400',
                icon: Activity,
              },
            ].map(({ label, value, color, icon: Icon }) => (
              <div key={label} className="card dark:bg-slate-800 p-5">
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
                <div className="text-sm text-gray-500 dark:text-slate-400">{label}</div>
              </div>
            ))}
          </div>

          {/* Department breakdown */}
          <div className="card dark:bg-slate-800 p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
              Staff by Department
            </h2>
            <div className="space-y-3">
              {[
                { dept: 'Reception',     icon: '🛎️', count: 3 },
                { dept: 'Housekeeping',  icon: '🧹', count: 5 },
                { dept: 'Restaurant',    icon: '🍽️', count: 4 },
                { dept: 'HR & Admin',    icon: '👥', count: 2 },
                { dept: 'Accounts',      icon: '💰', count: 2 },
              ].map(({ dept, icon, count }) => (
                <div key={dept} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{icon}</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      {dept}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {count} staff
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}