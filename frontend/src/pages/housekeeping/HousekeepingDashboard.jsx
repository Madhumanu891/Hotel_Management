import { useState } from 'react';
import {
  CheckSquare, Clock, AlertTriangle, CheckCircle,
  Play, ChevronDown, ChevronUp, ClipboardList,
  BedDouble, Shield,
} from 'lucide-react';
import {
  useMyTasks, usePropertyTasks, useTaskStats,
  useStartTask, useCompleteTask, useUpdateChecklist, useVerifyTask,
} from '../../hooks/useHousekeeping';
import { useAuthStore } from '../../stores/authStore';
import Spinner from '../../components/ui/Spinner';
import Button  from '../../components/ui/Button';

// ── Priority Badge ──────────────────────────────────────────────────────────
const PriorityBadge = ({ priority }) => {
  const config = {
    urgent: 'bg-red-100 text-red-700 border border-red-200',
    high:   'bg-orange-100 text-orange-700 border border-orange-200',
    normal: 'bg-blue-100 text-blue-700 border border-blue-200',
    low:    'bg-gray-100 text-gray-600 border border-gray-200',
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${config[priority] || config.normal}`}>
      {priority}
    </span>
  );
};

// ── Type Badge ──────────────────────────────────────────────────────────────
const TypeBadge = ({ type }) => {
  const config = {
    checkout_clean: 'badge-error',
    stayover:       'badge-info',
    deep_clean:     'badge-purple',
    inspection:     'badge-success',
    maintenance:    'badge-warning',
  };
  return (
    <span className={config[type] || 'badge-info'}>
      {type?.replace('_', ' ')}
    </span>
  );
};

// ── Checklist Component ─────────────────────────────────────────────────────
const TaskChecklist = ({ task, onUpdate, isUpdating }) => {
  const completed = task.checklist?.filter(c => c.done).length || 0;
  const total     = task.checklist?.length || 0;
  const progress  = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">{completed}/{total} items complete</span>
        <span className="font-medium text-gray-700">{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className="bg-primary-600 h-2 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="space-y-2 mt-3">
        {task.checklist?.map((item, idx) => (
          <label
            key={idx}
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
              item.done ? 'bg-green-50' : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <input
              type="checkbox"
              checked={item.done}
              disabled={task.status === 'completed' || task.status === 'verified' || isUpdating}
              onChange={() => onUpdate(task._id, item.item, !item.done)}
              className="h-5 w-5 rounded text-primary-600 border-gray-300 focus:ring-primary-500"
            />
            <span className={`text-sm flex-1 ${item.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
              {item.item}
            </span>
            {item.done && <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />}
          </label>
        ))}
      </div>
    </div>
  );
};

// ── Task Card ───────────────────────────────────────────────────────────────
const TaskCard = ({ task, onStart, onComplete, onVerify, onChecklistUpdate,
                    isStarting, isCompleting, isVerifying, isUpdating }) => {
  const [expanded, setExpanded] = useState(false);
  const [notes,    setNotes]    = useState('');

  const canStart    = task.status === 'pending';
  const canComplete = task.status === 'in_progress';
  const canVerify   = task.status === 'completed';

  const allDone = task.checklist?.every(c => c.done);

  return (
    <div className={`card overflow-hidden transition-shadow hover:shadow-md ${
      task.priority === 'urgent' ? 'border-l-4 border-l-red-500' :
      task.priority === 'high'   ? 'border-l-4 border-l-orange-400' : ''
    }`}>
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xl font-bold text-gray-900">
                Room {task.roomNumber || '—'}
              </span>
              <PriorityBadge priority={task.priority} />
              <TypeBadge type={task.type} />
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {new Date(task.scheduledFor).toLocaleTimeString('en-IN', {
                  hour: '2-digit', minute: '2-digit',
                })}
              </span>
              {task.duration && (
                <span>{task.duration} min</span>
              )}
              {task.checklist && (
                <span className="flex items-center gap-1">
                  <CheckSquare className="h-3.5 w-3.5" />
                  {task.checklist.filter(c => c.done).length}/{task.checklist.length}
                </span>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="ml-4 text-right">
            {task.status === 'pending'     && <span className="badge-warning">Pending</span>}
            {task.status === 'in_progress' && <span className="badge-info">In Progress</span>}
            {task.status === 'completed'   && <span className="badge-success">Completed</span>}
            {task.status === 'verified'    && <span className="badge-purple">Verified</span>}
          </div>
        </div>

        {task.notes && (
          <p className="mt-2 text-sm text-gray-500 italic">{task.notes}</p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4">
          {canStart && (
            <Button
              onClick={() => onStart(task._id)}
              loading={isStarting}
              className="flex-1 py-2"
            >
              <Play className="h-4 w-4" />
              Start Cleaning
            </Button>
          )}

          {canComplete && (
            <Button
              onClick={() => onComplete(task._id, { notes })}
              loading={isCompleting}
              disabled={!allDone}
              className="flex-1 py-2"
              variant={allDone ? 'primary' : 'secondary'}
            >
              <CheckCircle className="h-4 w-4" />
              {allDone ? 'Mark Complete' : 'Complete All Items First'}
            </Button>
          )}

          {canVerify && (
            <Button
              onClick={() => onVerify(task._id)}
              loading={isVerifying}
              className="flex-1 py-2"
            >
              <Shield className="h-4 w-4" />
              Verify & Close
            </Button>
          )}

          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 rounded-lg border hover:bg-gray-50 transition-colors"
          >
            {expanded
              ? <ChevronUp className="h-5 w-5 text-gray-500" />
              : <ChevronDown className="h-5 w-5 text-gray-500" />
            }
          </button>
        </div>
      </div>

      {/* Expanded checklist */}
      {expanded && (
        <div className="border-t px-5 py-4 bg-gray-50">
          {task.checklist?.length > 0 && (
            <TaskChecklist
              task={task}
              onUpdate={onChecklistUpdate}
              isUpdating={isUpdating}
            />
          )}
          {canComplete && (
            <div className="mt-4">
              <label className="label">Completion notes</label>
              <textarea
                rows={2}
                placeholder="Any notes about the cleaning..."
                className="input resize-none text-sm"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Main Dashboard ──────────────────────────────────────────────────────────
export default function HousekeepingDashboard() {
  const { user }   = useAuthStore();
  const propertyId = user?.propertyId || '69d6817ab880abc410462b20';
  const isManager  = ['hotel_manager', 'super_admin'].includes(user?.role);

  const [filter, setFilter] = useState('all');

  const { data: myTasksData,       isLoading: myLoading }   = useMyTasks(
    filter !== 'all' ? { status: filter } : {}
  );
  const { data: allTasksData,      isLoading: allLoading }  = usePropertyTasks(
    propertyId,
    filter !== 'all' ? { status: filter } : {}
  );
  const { data: stats } = useTaskStats(propertyId);

  const startMutation     = useStartTask();
  const completeMutation  = useCompleteTask();
  const verifyMutation    = useVerifyTask();
  const checklistMutation = useUpdateChecklist();

  const tasks = isManager
    ? (allTasksData?.tasks  || [])
    : (myTasksData?.tasks   || []);

  const isLoading = isManager ? allLoading : myLoading;

  const handleChecklistUpdate = (taskId, item, done) => {
    checklistMutation.mutate({ taskId, item, done });
  };

  const handleComplete = (taskId, data) => {
    completeMutation.mutate({ taskId, ...data });
  };

  const filterTabs = [
    { key: 'all',         label: 'All Tasks' },
    { key: 'pending',     label: 'Pending' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'completed',   label: 'Completed' },
    { key: 'verified',    label: 'Verified' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isManager ? 'Housekeeping Overview' : 'My Tasks'}
        </h1>
        <p className="text-gray-500 mt-1">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Pending',     value: stats.today?.pending,     color: 'bg-yellow-50 text-yellow-700', icon: Clock },
            { label: 'In Progress', value: stats.today?.inProgress,  color: 'bg-blue-50 text-blue-700',    icon: Play },
            { label: 'Completed',   value: stats.today?.completed,   color: 'bg-green-50 text-green-700',  icon: CheckCircle },
            { label: 'Verified',    value: stats.today?.verified,    color: 'bg-purple-50 text-purple-700',icon: Shield },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="card p-5">
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{value ?? 0}</div>
              <div className="text-sm text-gray-500">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filterTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === tab.key
                ? 'bg-primary-700 text-white'
                : 'bg-white text-gray-600 border hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Task list */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : tasks.length === 0 ? (
        <div className="card p-12 text-center">
          <ClipboardList className="h-12 w-12 text-gray-200 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-500">
            {filter === 'all' ? 'No housekeeping tasks assigned yet' : `No ${filter} tasks`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map(task => (
            <TaskCard
              key={task._id}
              task={task}
              onStart={startMutation.mutate}
              onComplete={handleComplete}
              onVerify={verifyMutation.mutate}
              onChecklistUpdate={handleChecklistUpdate}
              isStarting={startMutation.isPending}
              isCompleting={completeMutation.isPending}
              isVerifying={verifyMutation.isPending}
              isUpdating={checklistMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}