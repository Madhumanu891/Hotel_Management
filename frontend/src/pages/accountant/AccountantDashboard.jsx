import { useState } from 'react';
import {
  DollarSign, TrendingUp, CreditCard, BarChart3,
  Calendar, Download, ArrowUpRight, ArrowDownRight,
  Receipt, PieChart, Filter,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart as RechartsPie,
  Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  useRevenueReport, useOccupancyReport, useBookingStats,
} from '../../hooks/useAccountant';
import { useAuthStore } from '../../stores/authStore';
import Spinner from '../../components/ui/Spinner';

const COLORS = ['#6d28d9', '#2563eb', '#059669', '#d97706', '#dc2626'];

const paymentMethodData = [
  { name: 'PayPal', value: 45 },
  { name: 'Card', value: 30 },
  { name: 'UPI', value: 15 },
  { name: 'Cash', value: 10 },
];

const StatCard = ({ label, value, subValue, icon: Icon, color, trend }) => (
  <div className={`card dark:bg-slate-800 p-5 ${alert ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : ''}`}>
    <div className="flex items-center justify-between mb-4">
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
    <div className="flex items-end justify-between">
      <div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {subValue && <div className="text-xs text-gray-400 mt-0.5">{subValue}</div>}
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
          {trend >= 0
            ? <ArrowUpRight className="h-4 w-4" />
            : <ArrowDownRight className="h-4 w-4" />
          }
          {Math.abs(trend)}%
        </div>
      )}
    </div>
  </div>
);

export default function AccountantDashboard() {
  const { user } = useAuthStore();
  const propertyId = user?.propertyId || '69d6817ab880abc410462b20';
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState(() => {
    const end = new Date().toISOString().split('T')[0];
    const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0];
    return { startDate: start, endDate: end };
  });

  const { data: stats, isLoading: statsLoading } = useBookingStats(propertyId);
  const { data: revenue, isLoading: revenueLoading } = useRevenueReport(
    propertyId, { ...dateRange, groupBy: 'day' }
  );
  const { data: occupancy, isLoading: occupancyLoading } = useOccupancyReport(
    propertyId, dateRange
  );

  const revenueChartData = revenue?.data?.map(d => ({
    date: new Date(d.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    revenue: Math.round(d.revenue / 1000),
    bookings: d.bookings,
  })) || [];

  const occupancyChartData = occupancy?.data?.slice(-14).map(d => ({
    date: new Date(d.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    occupancy: d.occupancyRate,
    rooms: d.occupiedRooms,
  })) || [];

  const totalRevenue = revenue?.summary?.totalRevenue || 0;
  const totalBookings = revenue?.summary?.totalBookings || 0;
  const avgRevenue = revenue?.summary?.averageRevenue || 0;
  const avgOccupancy = occupancy?.summary?.avgOccupancyRate || 0;

  const tabs = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'revenue', label: 'Revenue', icon: TrendingUp },
    { key: 'occupancy', label: 'Occupancy', icon: PieChart },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
          <p className="text-gray-500 mt-1">Revenue analytics and payment overview</p>
        </div>

        {/* Date range picker */}
        <div className="flex items-center gap-3 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl px-4 py-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <input
            type="date"
            className="text-sm text-gray-700 dark:text-slate-300 bg-transparent outline-none"
            value={dateRange.startDate}
            onChange={e => setDateRange(d => ({ ...d, startDate: e.target.value }))}
          />
          <span className="text-gray-400">→</span>
          <input
            type="date"
            className="text-sm text-gray-700 dark:text-slate-300 bg-transparent outline-none"
            value={dateRange.endDate}
            onChange={e => setDateRange(d => ({ ...d, endDate: e.target.value }))}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-slate-800 rounded-xl p-1 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.key
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          {statsLoading || revenueLoading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Total Revenue"
                value={`₹${(totalRevenue / 1000).toFixed(1)}K`}
                subValue={`${dateRange.startDate} to ${dateRange.endDate}`}
                icon={DollarSign}
                color="bg-primary-50 text-primary-700"
                trend={12}
              />
              <StatCard
                label="Total Bookings"
                value={totalBookings}
                subValue="In selected period"
                icon={Receipt}
                color="bg-blue-50 text-blue-700"
                trend={8}
              />
              <StatCard
                label="Avg Revenue/Booking"
                value={`₹${avgRevenue.toLocaleString()}`}
                subValue="Per confirmed booking"
                icon={TrendingUp}
                color="bg-green-50 text-green-700"
                trend={3}
              />
              <StatCard
                label="Avg Occupancy"
                value={`${avgOccupancy}%`}
                subValue="Daily average"
                icon={CreditCard}
                color="bg-orange-50 text-orange-700"
                trend={-2}
              />
            </div>
          )}

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue trend */}
            <div className="card dark:bg-slate-800 p-6">
              <h2 className="font-semibold text-gray-900 mb-6">Revenue Trend</h2>
              {revenueLoading ? (
                <div className="flex justify-center py-8"><Spinner /></div>
              ) : revenueChartData.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-gray-400">
                  <div className="text-center">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No revenue data for selected period</p>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={revenueChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 10 }} unit="K" />
                    <Tooltip
                      formatter={(v) => [`₹${v}K`, 'Revenue']}
                      labelStyle={{ fontWeight: 600 }}
                    />
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

            {/* Payment methods */}
            <div className="card dark:bg-slate-800 p-6">
              <h2 className="font-semibold text-gray-900 mb-6">Payment Methods</h2>
              <ResponsiveContainer width="100%" height={180}>
                <RechartsPie>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {paymentMethodData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v}%`, '']} />
                </RechartsPie>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {paymentMethodData.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ background: COLORS[i] }} />
                      <span className="text-gray-600">{item.name}</span>
                    </div>
                    <span className="font-medium text-gray-900">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Today's summary */}
          <div className="card dark:bg-slate-800 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Today's Summary</h2>
            {statsLoading ? (
              <div className="flex justify-center py-4"><Spinner /></div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Arrivals Today', value: stats?.todayArrivals || 0 },
                  { label: 'Departures Today', value: stats?.todayDepartures || 0 },
                  { label: 'Occupied Rooms', value: stats?.currentOccupancy || 0 },
                  { label: 'Monthly Revenue', value: `₹${((stats?.monthlyRevenue || 0) / 1000).toFixed(0)}K` },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-xl font-bold text-gray-900">{value}</div>
                    <div className="text-xs text-gray-500 mt-1">{label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Revenue Tab */}
      {activeTab === 'revenue' && (
        <div className="space-y-6">
          <div className="card dark:bg-slate-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-gray-900">Revenue Breakdown</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Total: </span>
                <span className="font-bold text-gray-900 text-base">
                  ₹{totalRevenue.toLocaleString()}
                </span>
              </div>
            </div>
            {revenueLoading ? (
              <div className="flex justify-center py-8"><Spinner /></div>
            ) : revenueChartData.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No revenue data for selected period</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={2} />
                  <YAxis tick={{ fontSize: 10 }} unit="K" />
                  <Tooltip
                    formatter={(v, name) => [
                      name === 'revenue' ? `₹${v}K` : v,
                      name === 'revenue' ? 'Revenue' : 'Bookings',
                    ]}
                    labelStyle={{ fontWeight: 600 }}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#6d28d9" radius={[4, 4, 0, 0]} name="revenue" />
                  <Bar dataKey="bookings" fill="#2563eb" radius={[4, 4, 0, 0]} name="bookings" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Revenue summary table */}
          <div className="card dark:bg-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-900">Daily Revenue Summary</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Bookings</th>
                    <th className="px-6 py-3">Revenue</th>
                    <th className="px-6 py-3">Avg/Booking</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {revenue?.data?.slice(-10).reverse().map(d => (
                    <tr key={d.date} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm text-gray-700">
                        {new Date(d.date).toLocaleDateString('en-IN', {
                          weekday: 'short', day: 'numeric', month: 'short',
                        })}
                      </td>
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">
                        {d.bookings}
                      </td>
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">
                        ₹{d.revenue.toLocaleString()}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">
                        ₹{d.avgRevenue?.toLocaleString() || 0}
                      </td>
                    </tr>
                  ))}
                  {(!revenue?.data || revenue.data.length === 0) && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-400 text-sm">
                        No data for selected period
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Occupancy Tab */}
      {activeTab === 'occupancy' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: 'Avg Occupancy Rate',
                value: `${occupancy?.summary?.avgOccupancyRate || 0}%`,
                color: 'bg-primary-50 text-primary-700',
              },
              {
                label: 'Total Rooms',
                value: occupancy?.summary?.totalRooms || 0,
                color: 'bg-blue-50 text-blue-700',
              },
              {
                label: 'Period',
                value: `${dateRange.startDate} → ${dateRange.endDate}`,
                color: 'bg-green-50 text-green-700',
              },
            ].map(({ label, value, color }) => (
              <div key={label} className={`rounded-xl p-5 ${color}`}>
                <div className="text-lg font-bold">{value}</div>
                <div className="text-sm mt-1 opacity-80">{label}</div>
              </div>
            ))}
          </div>

          <div className="card dark:bg-slate-800 p-6">
            <h2 className="font-semibold text-gray-900 mb-6">Daily Occupancy Rate</h2>
            {occupancyLoading ? (
              <div className="flex justify-center py-8"><Spinner /></div>
            ) : occupancyChartData.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <PieChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No occupancy data for selected period</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={occupancyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={1} />
                  <YAxis tick={{ fontSize: 10 }} unit="%" domain={[0, 100]} />
                  <Tooltip
                    formatter={(v, name) => [
                      name === 'occupancy' ? `${v}%` : v,
                      name === 'occupancy' ? 'Occupancy Rate' : 'Rooms Occupied',
                    ]}
                    labelStyle={{ fontWeight: 600 }}
                  />
                  <Legend />
                  <Bar
                    dataKey="occupancy"
                    name="occupancy"
                    radius={[4, 4, 0, 0]}
                    fill="#6d28d9"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Occupancy table */}
          <div className="card dark:bg-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-900">Daily Occupancy Details</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Occupied</th>
                    <th className="px-6 py-3">Total Rooms</th>
                    <th className="px-6 py-3">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {occupancy?.data?.slice(-10).reverse().map(d => (
                    <tr key={d.date} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm text-gray-700">
                        {new Date(d.date).toLocaleDateString('en-IN', {
                          weekday: 'short', day: 'numeric', month: 'short',
                        })}
                      </td>
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">
                        {d.occupiedRooms}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">
                        {d.totalRooms}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-100 rounded-full h-2 max-w-20">
                            <div
                              className="bg-primary-600 h-2 rounded-full"
                              style={{ width: `${d.occupancyRate}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {d.occupancyRate}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!occupancy?.data || occupancy.data.length === 0) && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-400 text-sm">
                        No data for selected period
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}