import { useState } from 'react';
import {
  Building2, Users, DollarSign, BedDouble,
  CheckCircle, XCircle, AlertCircle, Globe,
  TrendingUp, Activity, RefreshCw, Search,
  Star, MapPin,
} from 'lucide-react';
import { useAllProperties, useSystemHealth, useGlobalStats } from '../../hooks/useAdmin';
import Spinner from '../../components/ui/Spinner';

// ── Health Status Dot ───────────────────────────────────────────────────────
const StatusDot = ({ status }) => {
  if (status === 'up') return (
    <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
      <span className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
      Online
    </span>
  );
  if (status === 'down') return (
    <span className="flex items-center gap-1.5 text-red-600 text-sm font-medium">
      <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
      Offline
    </span>
  );
  return (
    <span className="flex items-center gap-1.5 text-yellow-600 text-sm font-medium">
      <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
      Checking
    </span>
  );
};

// ── System Health Panel ─────────────────────────────────────────────────────
const SystemHealth = () => {
  const { data: services, isLoading, refetch, isFetching } = useSystemHealth();

  const upCount   = services?.filter(s => s.status === 'up').length   || 0;
  const downCount = services?.filter(s => s.status === 'down').length || 0;

  return (
    <div className="card">
      <div className="px-6 py-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="h-5 w-5 text-primary-700" />
          <h2 className="font-semibold text-gray-900">System Health</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-green-600 font-medium">{upCount} online</span>
            {downCount > 0 && (
              <span className="text-red-600 font-medium">{downCount} offline</span>
            )}
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 text-gray-500 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8"><Spinner /></div>
      ) : (
        <div className="divide-y">
          {services?.map(svc => (
            <div key={svc.name} className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                  svc.status === 'up' ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  {svc.status === 'up'
                    ? <CheckCircle className="h-4 w-4 text-green-600" />
                    : <XCircle    className="h-4 w-4 text-red-600" />
                  }
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{svc.name}</div>
                  <div className="text-xs text-gray-400">Port {svc.port}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {svc.latency && (
                  <span className={`text-xs font-mono ${svc.latency < 200 ? 'text-green-600' : svc.latency < 500 ? 'text-yellow-600' : 'text-red-600'}`}>
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

// ── Property Row ────────────────────────────────────────────────────────────
const PropertyRow = ({ property }) => (
  <tr className="hover:bg-gray-50 transition-colors">
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
          {property.images?.[0]?.url
            ? <img src={property.images[0].url} alt="" className="h-10 w-10 rounded-xl object-cover" />
            : <Building2 className="h-5 w-5 text-primary-600" />
          }
        </div>
        <div>
          <div className="font-medium text-gray-900 text-sm">{property.name}</div>
          <div className="text-xs text-gray-400 flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {property.location?.city}, {property.location?.state}
          </div>
        </div>
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="flex items-center gap-1">
        {[1,2,3,4,5].map(i => (
          <Star
            key={i}
            className={`h-3.5 w-3.5 ${i <= property.starRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`}
          />
        ))}
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="flex flex-wrap gap-1">
        {property.amenities?.slice(0, 3).map(a => (
          <span key={a} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">{a}</span>
        ))}
        {property.amenities?.length > 3 && (
          <span className="text-xs text-gray-400">+{property.amenities.length - 3}</span>
        )}
      </div>
    </td>
    <td className="px-6 py-4">
      <span className={property.isActive ? 'badge-success' : 'badge-error'}>
        {property.isActive ? 'Active' : 'Inactive'}
      </span>
    </td>
    <td className="px-6 py-4 text-sm text-gray-500">
      {new Date(property.createdAt).toLocaleDateString('en-IN')}
    </td>
  </tr>
);

// ── Main Admin Dashboard ────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [activeTab,   setActiveTab]   = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: propertiesData, isLoading: propertiesLoading } = useAllProperties({
    limit: 50,
  });

  const properties  = propertiesData?.properties || [];
  const propertyIds = properties.map(p => p._id);

  const { data: globalStats } = useGlobalStats(propertyIds);

  const filteredProperties = properties.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.location?.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabs = [
    { key: 'overview',   label: 'Overview',   icon: Globe },
    { key: 'properties', label: 'Properties', icon: Building2 },
    { key: 'health',     label: 'System',     icon: Activity },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">System-wide overview and management</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Global stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: 'Total Properties',
                value: properties.length,
                icon:  Building2,
                color: 'bg-primary-50 text-primary-700',
              },
              {
                label: 'Active Properties',
                value: properties.filter(p => p.isActive).length,
                icon:  CheckCircle,
                color: 'bg-green-50 text-green-700',
              },
              {
                label: 'Monthly Bookings',
                value: globalStats?.totalBookings || 0,
                icon:  TrendingUp,
                color: 'bg-blue-50 text-blue-700',
              },
              {
                label: 'Monthly Revenue',
                value: `₹${((globalStats?.totalRevenue || 0) / 1000).toFixed(0)}K`,
                icon:  DollarSign,
                color: 'bg-orange-50 text-orange-700',
              },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="card p-6">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{value}</div>
                <div className="text-sm text-gray-500 mt-1">{label}</div>
              </div>
            ))}
          </div>

          {/* Cities coverage */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary-600" />
              Properties by City
            </h2>
            {propertiesLoading ? (
              <div className="flex justify-center py-4"><Spinner /></div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {Object.entries(
                  properties.reduce((acc, p) => {
                    const city = p.location?.city || 'Unknown';
                    acc[city] = (acc[city] || 0) + 1;
                    return acc;
                  }, {})
                ).sort((a, b) => b[1] - a[1]).map(([city, count]) => (
                  <div key={city} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary-600" />
                      <span className="text-sm font-medium text-gray-700">{city}</span>
                    </div>
                    <span className="text-sm font-bold text-primary-700">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* System health preview */}
          <SystemHealth />
        </div>
      )}

      {/* Properties tab */}
      {activeTab === 'properties' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search properties by name or city..."
              className="input pl-9"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">All Properties</h2>
              <span className="text-sm text-gray-500">{filteredProperties.length} properties</span>
            </div>
            {propertiesLoading ? (
              <div className="flex justify-center p-8"><Spinner /></div>
            ) : filteredProperties.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Building2 className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p>No properties found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                      <th className="px-6 py-3">Property</th>
                      <th className="px-6 py-3">Rating</th>
                      <th className="px-6 py-3">Amenities</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredProperties.map(property => (
                      <PropertyRow key={property._id} property={property} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* System Health tab */}
      {activeTab === 'health' && (
        <div className="space-y-4">
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <div>
                <h2 className="font-semibold text-gray-900">Service Monitor</h2>
                <p className="text-sm text-gray-500">
                  All requests go through API Gateway on port 3000. Services are checked via gateway routes.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <div className="text-2xl font-bold text-green-700">8</div>
                <div className="text-sm text-green-600">Total Services</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-2xl font-bold text-blue-700">1</div>
                <div className="text-sm text-blue-600">API Gateway</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <div className="text-2xl font-bold text-purple-700">2</div>
                <div className="text-sm text-purple-600">Infra (Redis + RabbitMQ)</div>
              </div>
            </div>
          </div>
          <SystemHealth />
        </div>
      )}
    </div>
  );
}