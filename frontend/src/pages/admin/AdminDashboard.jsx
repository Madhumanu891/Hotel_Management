import { useState } from 'react';
import {
  Building2, Users, DollarSign,
  CheckCircle, XCircle, AlertCircle, Globe,
  TrendingUp, Activity, RefreshCw, Search,
  Star, MapPin, Plus, Eye, BarChart3,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAllProperties, useSystemHealth, useGlobalStats } from '../../hooks/useAdmin';
import Spinner from '../../components/ui/Spinner';
import PropertyDetailsModal from '../../components/admin/PropertyDetailsModal';

// ── Status Dot ────────────────────────────────────────────────────────────────
const StatusDot = ({ status }) => {
  if (status === 'up') return (
    <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400 text-sm font-medium">
      <span className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
      Online
    </span>
  );
  if (status === 'down') return (
    <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400 text-sm font-medium">
      <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
      Offline
    </span>
  );
  return (
    <span className="flex items-center gap-1.5 text-yellow-600 dark:text-yellow-400 text-sm font-medium">
      <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
      Checking
    </span>
  );
};

// ── System Health Panel ───────────────────────────────────────────────────────
const SystemHealth = () => {
  const { data: services, isLoading, refetch, isFetching } = useSystemHealth();
  const upCount = services?.filter(s => s.status === 'up').length || 0;
  const downCount = services?.filter(s => s.status === 'down').length || 0;

  return (
    <div className="card dark:bg-slate-800">
      <div className="px-6 py-4 border-b dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="h-5 w-5 text-primary-600" />
          <h2 className="font-semibold text-gray-900 dark:text-white">System Health</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-green-600 dark:text-green-400 text-sm font-medium">
            {upCount} online
          </span>
          {downCount > 0 && (
            <span className="text-red-600 dark:text-red-400 text-sm font-medium">
              {downCount} offline
            </span>
          )}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 text-gray-500 dark:text-slate-400 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8"><Spinner /></div>
      ) : (
        <div className="divide-y dark:divide-slate-700">
          {services?.map(svc => (
            <div
              key={svc.name}
              className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${svc.status === 'up'
                  ? 'bg-green-50 dark:bg-green-900/20'
                  : 'bg-red-50 dark:bg-red-900/20'
                  }`}>
                  {svc.status === 'up'
                    ? <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    : <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  }
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {svc.name}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-slate-500">
                    Port {svc.port}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {svc.latency && (
                  <span className={`text-xs font-mono ${svc.latency < 200 ? 'text-green-600 dark:text-green-400'
                    : svc.latency < 500 ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-red-600 dark:text-red-400'
                    }`}>
                    {svc.latency}ms
                  </span>
                )}
                <StatusDot status={svc.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, color, sub }) => (
  <div className="card dark:bg-slate-800 p-6">
    <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>
      <Icon className="h-5 w-5" />
    </div>
    <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
    <div className="text-sm text-gray-500 dark:text-slate-400 mt-1">{label}</div>
    {sub && <div className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{sub}</div>}
  </div>
);

// ── Property Table Row ────────────────────────────────────────────────────────
const PropertyRow = ({ property, onView }) => (
  <tr className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
          {property.images?.[0]?.url ? (
            <img
              src={property.images[0].url}
              alt=""
              className="h-10 w-10 rounded-xl object-cover"
            />
          ) : (
            <Building2 className="h-5 w-5 text-primary-600" />
          )}
        </div>
        <div>
          <div className="font-medium text-gray-900 dark:text-white text-sm">
            {property.name}
          </div>
          <div className="text-xs text-gray-400 dark:text-slate-500 flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {property.location?.city}, {property.location?.state}
          </div>
        </div>
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <Star
            key={i}
            className={`h-3.5 w-3.5 ${i <= property.starRating
              ? 'text-yellow-400 fill-yellow-400'
              : 'text-gray-200 dark:text-slate-600 fill-gray-200 dark:fill-slate-600'
              }`}
          />
        ))}
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="flex flex-wrap gap-1">
        {property.amenities?.slice(0, 3).map(a => (
          <span
            key={a}
            className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 px-2 py-0.5 rounded-full capitalize"
          >
            {a}
          </span>
        ))}
        {property.amenities?.length > 3 && (
          <span className="text-xs text-gray-400 dark:text-slate-500">
            +{property.amenities.length - 3}
          </span>
        )}
      </div>
    </td>
    <td className="px-6 py-4">
      <span className={property.isActive ? 'badge-success' : 'badge-error'}>
        {property.isActive ? 'Active' : 'Inactive'}
      </span>
    </td>
    <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400">
      {new Date(property.createdAt).toLocaleDateString('en-IN')}
    </td>
    <td className="px-6 py-4">
      <button
        onClick={() => onView(property._id)}
        className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
        <Eye className="h-4 w-4" />
      </button>
    </td>
  </tr>
);

// ── Main Admin Dashboard ──────────────────────────────────────────────────────
export default function AdminDashboard({ tab }) {
  const [activeTab, setActiveTab] = useState(tab || 'overview');
  const [searchQuery, setSearchQuery] = useState('');


  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: propertiesData, isLoading: propertiesLoading } = useAllProperties({ limit: 50 });
  const properties = propertiesData?.properties || [];
  const propertyIds = properties.map(p => p._id);
  const { data: globalStats } = useGlobalStats(propertyIds);

  const filteredProperties = properties.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.location?.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabs = [
    { key: 'overview', label: 'Overview', icon: Globe },
    { key: 'properties', label: 'Properties', icon: Building2 },
    { key: 'health', label: 'System', icon: Activity },
  ];


  const handleViewProperty = (id) => {
    setSelectedPropertyId(id);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Super Admin Dashboard
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-0.5">
            System-wide overview and management
          </p>
        </div>
        <Link
          to="/dashboard/admin/metrics"
          className="flex items-center gap-2 px-4 py-2 bg-primary-700 text-white rounded-xl text-sm font-medium hover:bg-primary-800 transition-colors"
        >
          <BarChart3 className="h-4 w-4" />
          View Metrics
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-slate-800 rounded-xl p-1 w-fit overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === t.key
              ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
              }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ─────────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Properties"
              value={properties.length}
              icon={Building2}
              color="bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400"
            />
            <StatCard
              label="Active Properties"
              value={properties.filter(p => p.isActive).length}
              icon={CheckCircle}
              color="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
            />
            <StatCard
              label="Monthly Bookings"
              value={globalStats?.totalBookings || 0}
              icon={TrendingUp}
              color="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
            />
            <StatCard
              label="Monthly Revenue"
              value={`₹${((globalStats?.totalRevenue || 0) / 1000).toFixed(0)}K`}
              icon={DollarSign}
              color="bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400"
            />
          </div>

          {/* Properties by City */}
          <div className="card dark:bg-slate-800 p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary-600" />
              Properties by City
            </h2>
            {propertiesLoading ? (
              <div className="flex justify-center py-4"><Spinner /></div>
            ) : properties.length === 0 ? (
              <p className="text-gray-400 dark:text-slate-500 text-sm text-center py-4">
                No properties found
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {Object.entries(
                  properties.reduce((acc, p) => {
                    const city = p.location?.city || 'Unknown';
                    acc[city] = (acc[city] || 0) + 1;
                    return acc;
                  }, {})
                ).sort((a, b) => b[1] - a[1]).map(([city, count]) => (
                  <div
                    key={city}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-xl"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary-600" />
                      <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                        {city}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-primary-700 dark:text-primary-400">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                to: '/dashboard/admin/properties',
                label: 'Manage Properties',
                desc: 'View and manage all hotel properties',
                icon: Building2,
                color: 'bg-primary-50 dark:bg-primary-900/20 text-primary-600',
              },
              {
                to: '/dashboard/admin/analytics',
                label: 'System Health',
                desc: 'Monitor all microservice status',
                icon: Activity,
                color: 'bg-green-50 dark:bg-green-900/20 text-green-600',
              },
              {
                to: '/dashboard/admin/metrics',
                label: 'Performance Metrics',
                desc: 'Gateway request analytics',
                icon: BarChart3,
                color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600',
              },
            ].map(({ to, label, desc, icon: Icon, color }) => (
              <Link
                key={to}
                to={to}
                className="card dark:bg-slate-800 p-5 hover:shadow-md transition-shadow group"
              >
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
                  {label}
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{desc}</p>
              </Link>
            ))}
          </div>

          {/* System health preview */}
          <SystemHealth />
        </div>
      )}

      {/* ── Properties Tab ────────────────────────────────────────────────────── */}
      {activeTab === 'properties' && (
        <div className="space-y-4">
          {/* Search + actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by property name or city..."
                className="input pl-9"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Properties table */}
          <div className="card dark:bg-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b dark:border-slate-700 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                All Properties
              </h2>
              <span className="text-sm text-gray-500 dark:text-slate-400">
                {filteredProperties.length} properties
              </span>
            </div>

            {propertiesLoading ? (
              <div className="flex justify-center p-8"><Spinner /></div>
            ) : filteredProperties.length === 0 ? (
              <div className="p-8 text-center">
                <Building2 className="h-8 w-8 mx-auto mb-2 text-gray-300 dark:text-slate-600" />
                <p className="text-gray-500 dark:text-slate-400">No properties found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider bg-gray-50 dark:bg-slate-700/50">
                      <th className="px-6 py-3">Property</th>
                      <th className="px-6 py-3">Rating</th>
                      <th className="px-6 py-3">Amenities</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Created</th>
                      <th className="px-6 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                    {filteredProperties.map(property => (
                      <PropertyRow key={property._id} property={property} onView={handleViewProperty} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── System Health Tab ─────────────────────────────────────────────────── */}
      {activeTab === 'health' && (
        <div className="space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Microservices', value: 9, color: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' },
              { label: 'API Gateway', value: 1, color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' },
              { label: 'Infra Services', value: 2, color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className={`rounded-xl p-4 text-center ${color}`}>
                <div className="text-2xl font-bold">{value}</div>
                <div className="text-sm mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          {/* Info box */}
          <div className="card dark:bg-slate-800 p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                  Service Monitor
                </h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                  All requests route through the API Gateway on port 3000.
                  Service health is checked via gateway proxy routes.
                  A 401/404 response means the service is reachable.
                </p>
              </div>
            </div>
          </div>

          <SystemHealth />

          {/* Link to metrics */}
          <div className="text-center">
            <Link
              to="/dashboard/admin/metrics"
              className="inline-flex items-center gap-2 text-sm text-primary-700 dark:text-primary-400 font-medium hover:underline"
            >
              <BarChart3 className="h-4 w-4" />
              View detailed performance metrics →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}