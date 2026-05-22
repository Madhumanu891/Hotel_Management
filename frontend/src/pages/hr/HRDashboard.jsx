import { useState } from 'react';
import {
  Users, Calendar, Clock, CheckCircle,
  XCircle, AlertCircle, Plus, X, ChevronDown,
  UserCheck, FileText,
} from 'lucide-react';
import {
  usePropertyShifts, useLeaveRequests,
  useStaffStats, useCreateShift, useReviewLeave,
} from '../../hooks/useStaff';
import { useAuthStore } from '../../stores/authStore';
import Spinner from '../../components/ui/Spinner';
import Button  from '../../components/ui/Button';

// ── Leave Type Badge ────────────────────────────────────────────────────────
const LeaveTypeBadge = ({ type }) => {
  const config = {
    annual:    'badge-info',
    sick:      'badge-error',
    emergency: 'badge-warning',
    maternity: 'badge-purple',
    paternity: 'badge-purple',
    unpaid:    'bg-gray-100 text-gray-600',
  };
  return (
    <span className={`${config[type] || 'badge-info'} capitalize`}>
      {type}
    </span>
  );
};

// ── Leave Review Card ───────────────────────────────────────────────────────
const LeaveCard = ({ leave, onReview, isReviewing }) => {
  const [expanded,    setExpanded]    = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');

  const fromDate = new Date(leave.fromDate).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
  const toDate = new Date(leave.toDate).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div className="card p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-semibold text-gray-900">{leave.staffName || 'Staff Member'}</span>
            <LeaveTypeBadge type={leave.leaveType} />
            {leave.status === 'pending'  && <span className="badge-warning">Pending Review</span>}
            {leave.status === 'approved' && <span className="badge-success">Approved</span>}
            {leave.status === 'rejected' && <span className="badge-error">Rejected</span>}
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {fromDate} → {toDate}
            </span>
            <span className="font-medium text-gray-700">
              {leave.days} day{leave.days > 1 ? 's' : ''}
            </span>
          </div>
          <p className="text-sm text-gray-600">{leave.reason}</p>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="ml-4 p-1.5 rounded-lg hover:bg-gray-100"
        >
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Review panel */}
      {expanded && leave.status === 'pending' && (
        <div className="mt-4 pt-4 border-t space-y-3">
          <div>
            <label className="label">Review Notes (optional)</label>
            <textarea
              rows={2}
              className="input resize-none text-sm"
              placeholder="Add any notes for the staff member..."
              value={reviewNotes}
              onChange={e => setReviewNotes(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => onReview(leave._id, 'approved', reviewNotes)}
              loading={isReviewing}
              className="flex-1 py-2"
            >
              <CheckCircle className="h-4 w-4" />
              Approve
            </Button>
            <Button
              variant="danger"
              onClick={() => onReview(leave._id, 'rejected', reviewNotes)}
              loading={isReviewing}
              className="flex-1 py-2"
            >
              <XCircle className="h-4 w-4" />
              Reject
            </Button>
          </div>
        </div>
      )}

      {/* Review notes display */}
      {leave.reviewNotes && (
        <div className="mt-3 pt-3 border-t text-sm text-gray-500 italic">
          Review note: {leave.reviewNotes}
        </div>
      )}
    </div>
  );
};

// ── Add Shift Modal ─────────────────────────────────────────────────────────
const AddShiftModal = ({ propertyId, onClose }) => {
  const [form, setForm] = useState({
    staffId:    '',
    staffName:  '',
    staffRole:  'receptionist',
    department: 'reception',
    date:       new Date().toISOString().split('T')[0],
    startTime:  '08:00',
    endTime:    '16:00',
    notes:      '',
  });
  const createShiftMutation = useCreateShift();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createShiftMutation.mutateAsync({ propertyId, ...form });
    onClose();
  };

  const roles = ['receptionist','housekeeping','restaurant_staff','hr_manager','accountant','hotel_manager'];
  const departments = ['reception','housekeeping','restaurant','hr','accounting','management'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Create Shift</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-gray-400" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Staff Name</label>
            <input
              className="input" required
              value={form.staffName}
              onChange={e => setForm({ ...form, staffName: e.target.value })}
              placeholder="Enter staff member name"
            />
          </div>

          <div>
            <label className="label">Staff ID</label>
            <input
              className="input" required
              value={form.staffId}
              onChange={e => setForm({ ...form, staffId: e.target.value })}
              placeholder="MongoDB ID of the staff user"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Role</label>
              <select
                className="input"
                value={form.staffRole}
                onChange={e => setForm({ ...form, staffRole: e.target.value })}
              >
                {roles.map(r => (
                  <option key={r} value={r} className="capitalize">{r.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Department</label>
              <select
                className="input"
                value={form.department}
                onChange={e => setForm({ ...form, department: e.target.value })}
              >
                {departments.map(d => (
                  <option key={d} value={d} className="capitalize">{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Date</label>
            <input
              type="date" className="input" required
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Start Time</label>
              <input
                type="time" className="input"
                value={form.startTime}
                onChange={e => setForm({ ...form, startTime: e.target.value })}
              />
            </div>
            <div>
              <label className="label">End Time</label>
              <input
                type="time" className="input"
                value={form.endTime}
                onChange={e => setForm({ ...form, endTime: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="label">Notes (optional)</label>
            <input
              className="input"
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="Any shift notes..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button className="flex-1" loading={createShiftMutation.isPending} type="submit">
              Create Shift
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Shift Row ───────────────────────────────────────────────────────────────
const ShiftRow = ({ shift }) => {
  const statusConfig = {
    scheduled: 'badge-info',
    confirmed: 'badge-success',
    completed: 'badge-purple',
    absent:    'badge-error',
    swapped:   'badge-warning',
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-5 py-4">
        <div className="font-medium text-gray-900 text-sm">{shift.staffName || 'Unknown'}</div>
        <div className="text-xs text-gray-400 capitalize">{shift.staffRole?.replace('_', ' ')}</div>
      </td>
      <td className="px-5 py-4 text-sm text-gray-600 capitalize">{shift.department}</td>
      <td className="px-5 py-4 text-sm text-gray-600">
        {new Date(shift.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
      </td>
      <td className="px-5 py-4 text-sm text-gray-600">
        {shift.startTime} — {shift.endTime}
        <span className="text-xs text-gray-400 ml-1">({shift.duration}h)</span>
      </td>
      <td className="px-5 py-4">
        <span className={statusConfig[shift.status] || 'badge-info'}>
          {shift.status}
        </span>
      </td>
    </tr>
  );
};

// ── Main HR Dashboard ───────────────────────────────────────────────────────
export default function HRDashboard() {
  const { user }     = useAuthStore();
  const propertyId   = user?.propertyId || '69d6817ab880abc410462b20';

  const [activeTab,    setActiveTab]    = useState('overview');
  const [showAddShift, setShowAddShift] = useState(false);
  const [leaveFilter,  setLeaveFilter]  = useState('pending');
  const [shiftDate,    setShiftDate]    = useState(
    new Date().toISOString().split('T')[0]
  );

  const { data: stats,   isLoading: statsLoading }   = useStaffStats(propertyId);
  const { data: shiftsData, isLoading: shiftsLoading } = usePropertyShifts(
    propertyId, { date: shiftDate }
  );
  const { data: leaveData,  isLoading: leaveLoading }  = useLeaveRequests(
    propertyId, leaveFilter !== 'all' ? { status: leaveFilter } : {}
  );

  const reviewLeaveMutation = useReviewLeave();

  const shifts        = shiftsData?.shifts  || [];
  const leaveRequests = leaveData?.requests || [];

  const pendingLeaves = leaveRequests.filter(l => l.status === 'pending').length;

  const handleReview = (leaveId, status, notes) => {
    reviewLeaveMutation.mutate({ leaveId, status, notes });
  };

  const tabs = [
    { key: 'overview', label: 'Overview',      icon: Users    },
    { key: 'shifts',   label: `Shifts`,         icon: Calendar },
    { key: 'leave',    label: `Leave${pendingLeaves > 0 ? ` (${pendingLeaves})` : ''}`, icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">HR Dashboard</h1>
          <p className="text-gray-500 mt-1">Staff management, shifts and leave requests</p>
        </div>
        {activeTab === 'shifts' && (
          <Button onClick={() => setShowAddShift(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Shift
          </Button>
        )}
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
          {statsLoading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'On Duty Today',    value: stats?.onDutyToday    || 0, icon: UserCheck,   color: 'bg-green-50 text-green-700'  },
                { label: 'Scheduled Today',  value: stats?.scheduledToday || 0, icon: Calendar,    color: 'bg-blue-50 text-blue-700'    },
                { label: 'Pending Leaves',   value: stats?.pendingLeaves  || 0, icon: AlertCircle, color: 'bg-yellow-50 text-yellow-700'},
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="card p-6">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{value}</div>
                  <div className="text-sm text-gray-500 mt-1">{label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Quick actions */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => { setActiveTab('shifts'); setShowAddShift(true); }}
                className="flex items-center gap-3 p-4 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors text-left"
              >
                <div className="h-10 w-10 rounded-xl bg-primary-100 flex items-center justify-center">
                  <Plus className="h-5 w-5 text-primary-700" />
                </div>
                <div>
                  <div className="font-medium text-primary-900">Create Shift</div>
                  <div className="text-sm text-primary-600">Schedule staff for a shift</div>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('leave')}
                className="flex items-center gap-3 p-4 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition-colors text-left"
              >
                <div className="h-10 w-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-yellow-700" />
                </div>
                <div>
                  <div className="font-medium text-yellow-900">Review Leaves</div>
                  <div className="text-sm text-yellow-600">
                    {stats?.pendingLeaves || 0} pending request{stats?.pendingLeaves !== 1 ? 's' : ''}
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shifts tab */}
      {activeTab === 'shifts' && (
        <div className="space-y-4">
          {/* Date picker */}
          <div className="flex items-center gap-4">
            <div>
              <label className="label">Select Date</label>
              <input
                type="date"
                className="input w-48"
                value={shiftDate}
                onChange={e => setShiftDate(e.target.value)}
              />
            </div>
            <div className="pt-5 text-sm text-gray-500">
              {shifts.length} shift{shifts.length !== 1 ? 's' : ''} scheduled
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b">
              <h2 className="font-semibold text-gray-900">
                Shifts for {new Date(shiftDate).toLocaleDateString('en-IN', {
                  weekday: 'long', day: 'numeric', month: 'long',
                })}
              </h2>
            </div>

            {shiftsLoading ? (
              <div className="flex justify-center p-8"><Spinner /></div>
            ) : shifts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p>No shifts scheduled for this date</p>
                <button
                  onClick={() => setShowAddShift(true)}
                  className="mt-3 text-sm text-primary-700 font-medium hover:text-primary-800"
                >
                  + Create a shift
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                      <th className="px-5 py-3">Staff</th>
                      <th className="px-5 py-3">Department</th>
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3">Time</th>
                      <th className="px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {shifts.map(shift => (
                      <ShiftRow key={shift._id} shift={shift} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Leave requests tab */}
      {activeTab === 'leave' && (
        <div className="space-y-4">
          {/* Filter tabs */}
          <div className="flex gap-2">
            {['all', 'pending', 'approved', 'rejected'].map(f => (
              <button
                key={f}
                onClick={() => setLeaveFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  leaveFilter === f
                    ? 'bg-primary-700 text-white'
                    : 'bg-white text-gray-600 border hover:bg-gray-50'
                }`}
              >
                {f}
                {f === 'pending' && pendingLeaves > 0 && (
                  <span className="ml-1.5 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                    {pendingLeaves}
                  </span>
                )}
              </button>
            ))}
          </div>

          {leaveLoading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : leaveRequests.length === 0 ? (
            <div className="card p-8 text-center text-gray-500">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p>No {leaveFilter !== 'all' ? leaveFilter : ''} leave requests</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaveRequests.map(leave => (
                <LeaveCard
                  key={leave._id}
                  leave={leave}
                  onReview={handleReview}
                  isReviewing={reviewLeaveMutation.isPending}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add shift modal */}
      {showAddShift && (
        <AddShiftModal
          propertyId={propertyId}
          onClose={() => setShowAddShift(false)}
        />
      )}
    </div>
  );
}