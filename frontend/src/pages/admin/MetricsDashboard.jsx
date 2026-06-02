import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Activity, Zap, AlertTriangle, TrendingUp,
  RefreshCw, Clock, Server, BarChart3,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import api     from '../../lib/axios';
import Spinner from '../../components/ui/Spinner';

const COLORS = ['#6d28d9', '#059669', '#2563eb', '#d97706', '#dc2626', '#7c3aed'];

const useGatewayMetrics = () =>
  useQuery({
    queryKey:       ['metrics', 'gateway'],
    queryFn:        () => api.get('/metrics').then(r => r.data),
    refetchInterval: 15000,
  });

const MetricCard = ({ label, value, sub, icon: Icon, color = 'primary', alert }) => (
  <div className={`card p-5 ${alert ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : ''}`}>
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm text-gray-500 dark:text-slate-400">{label}</span>
      <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${
        alert
          ? 'bg-red-100 text-red-600'
          : `bg-${color}-50 dark:bg-${color}-900/30 text-${color}-700`
      }`}>
        <Icon className="h-4 w-4" />
      </div>
    </div>
    <div className={`text-2xl font-bold ${alert ? 'text-red-700' : 'text-gray-900 dark:text-white'}`}>
      {value}
    </div>
    {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
  </div>
);

export default function MetricsDashboard() {
  const { data, isLoading, refetch, isFetching } = useGatewayMetrics();

  const statusData = data?.statusCodes
    ? Object.entries(data.statusCodes).map(([code, count]) => ({ name: code, count }))
    : [];

  const serviceData = data?.services?.map(s => ({
    name:      s.name,
    requests:  s.requests,
    errors:    s.errors,
    avgMs:     parseInt(s.avgTime),
  })) || [];

  const errorRate = parseFloat(data?.gateway?.errorRate) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Performance Metrics
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">
            Real-time gateway monitoring
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 px-4 py-2 border dark:border-slate-600 rounded-xl text-sm text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : !data ? (
        <div className="card p-8 text-center">
          <Server className="h-8 w-8 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Could not connect to gateway metrics</p>
          <p className="text-xs text-gray-400 mt-1">
            Make sure the API Gateway is running on port 3000
          </p>
        </div>
      ) : (
        <>
          {/* Gateway KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Total Requests"
              value={data.gateway.requests.toLocaleString()}
              sub="Since gateway started"
              icon={Activity}
            />
            <MetricCard
              label="Uptime"
              value={data.gateway.uptime}
              sub="Gateway running time"
              icon={Clock}
            />
            <MetricCard
              label="Total Errors"
              value={data.gateway.errors.toLocaleString()}
              sub={`Error rate: ${data.gateway.errorRate}`}
              icon={AlertTriangle}
              alert={errorRate > 5}
            />
            <MetricCard
              label="Active Services"
              value={data.services?.length || 0}
              sub="Microservices tracked"
              icon={Server}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status code distribution */}
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-5">
                Response Status Distribution
              </h2>
              {statusData.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-gray-400">
                  <p className="text-sm">No data yet</p>
                </div>
              ) : (
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width="60%" height={160}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="count"
                      >
                        {statusData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => [v, 'Requests']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2">
                    {statusData.map(({ name, count }, i) => (
                      <div key={name} className="flex items-center gap-2 text-sm">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ background: COLORS[i % COLORS.length] }}
                        />
                        <span className="text-gray-600 dark:text-slate-400">{name}</span>
                        <span className="font-bold text-gray-900 dark:text-white ml-auto">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Service request counts */}
            <div className="card p-6 dark:bg-slate-800">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-5">
                Requests by Service
              </h2>
              {serviceData.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-gray-400">
                  <p className="text-sm">No data yet — make some API calls first</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={serviceData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 10 }}
                      width={80}
                    />
                    <Tooltip />
                    <Bar dataKey="requests" fill="#6d28d9" radius={[0,4,4,0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Service details table */}
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b dark:border-slate-700">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Service Performance
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider bg-gray-50 dark:bg-slate-700/50">
                    <th className="px-6 py-3">Service</th>
                    <th className="px-6 py-3">Requests</th>
                    <th className="px-6 py-3">Errors</th>
                    <th className="px-6 py-3">Avg Response</th>
                    <th className="px-6 py-3">Error Rate</th>
                    <th className="px-6 py-3">Health</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {serviceData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-400 text-sm">
                        No service data yet
                      </td>
                    </tr>
                  ) : (
                    serviceData.map(svc => {
                      const errRate = svc.requests > 0
                        ? Math.round((svc.errors / svc.requests) * 100)
                        : 0;
                      const isUnhealthy = errRate > 10 || svc.avgMs > 2000;

                      return (
                        <tr key={svc.name} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                          <td className="px-6 py-4 font-medium text-gray-900 dark:text-white capitalize">
                            {svc.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">
                            {svc.requests.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className={svc.errors > 0 ? 'text-red-600 font-medium' : 'text-gray-400'}>
                              {svc.errors}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className={
                              svc.avgMs > 2000 ? 'text-red-600 font-medium'
                              : svc.avgMs > 1000 ? 'text-yellow-600 font-medium'
                              : 'text-green-600 font-medium'
                            }>
                              {svc.avgMs}ms
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className={errRate > 5 ? 'text-red-600 font-medium' : 'text-gray-500'}>
                              {errRate}%
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={isUnhealthy ? 'badge-error' : 'badge-success'}>
                              {isUnhealthy ? 'Warning' : 'Healthy'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Slowest routes */}
          {data.slowestRoutes?.length > 0 && (
            <div className="card overflow-hidden">
              <div className="px-6 py-4 border-b dark:border-slate-700 flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  Slowest Routes
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider bg-gray-50 dark:bg-slate-700/50">
                      <th className="px-6 py-3">Route</th>
                      <th className="px-6 py-3">Calls</th>
                      <th className="px-6 py-3">Avg Time</th>
                      <th className="px-6 py-3">Errors</th>
                      <th className="px-6 py-3">Error Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                    {data.slowestRoutes.map((route, i) => (
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                        <td className="px-6 py-3 font-mono text-xs text-gray-700 dark:text-slate-300">
                          {route.route}
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-600 dark:text-slate-400">
                          {route.count}
                        </td>
                        <td className="px-6 py-3 text-sm">
                          <span className={
                            route.avgTime > 2000 ? 'text-red-600 font-bold'
                            : route.avgTime > 1000 ? 'text-yellow-600 font-medium'
                            : 'text-green-600'
                          }>
                            {route.avgTime}ms
                          </span>
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-600 dark:text-slate-400">
                          {route.errors}
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-500">
                          {route.errorRate}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Timestamp */}
          <p className="text-xs text-center text-gray-400">
            Last updated: {new Date(data.timestamp).toLocaleString()} · Auto-refreshes every 15s
          </p>
        </>
      )}
    </div>
  );
}