import { useState } from 'react';
import {
  Calendar, LogIn, LogOut, BedDouble,
  CheckCircle, Clock, Users, Search, X,
  ChevronRight, AlertCircle, MapPin,
} from 'lucide-react';
import {
  useTodayArrivals, useTodayDepartures,
  useRooms, useCheckIn, useCheckOut,
} from '../../hooks/useReceptionist';
import { useAuthStore } from '../../stores/authStore';
import Spinner from '../../components/ui/Spinner';
import Button  from '../../components/ui/Button';

// ── Room status config ────────────────────────────────────────────────────────
const roomStatus = {
  available:      'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50',
  occupied:       'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-700 dark:text-red-400',
  maintenance:    'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-400',
  out_of_service: 'bg-gray-100 dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-500 dark:text-slate-500',
};

// ── Room Map ──────────────────────────────────────────────────────────────────
const RoomMap = ({ rooms }) => {
  const [selected, setSelected] = useState(null);

  const byFloor = (rooms || []).reduce((acc, room) => {
    const floor = room.floor || 1;
    if (!acc[floor]) acc[floor] = [];
    acc[floor].push(room);
    return acc;
  }, {});

  const floors = Object.keys(byFloor).sort((a, b) => Number(b) - Number(a));

  const legend = [
    { label: 'Available',      color: 'bg-green-100 dark:bg-green-900/30 border-green-300'  },
    { label: 'Occupied',       color: 'bg-red-100 dark:bg-red-900/30 border-red-300'        },
    { label: 'Maintenance',    color: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300'},
    { label: 'Out of Service', color: 'bg-gray-100 dark:bg-slate-700 border-gray-300'       },
  ];

  return (
    <div className="card dark:bg-slate-800 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h2 className="font-semibold text-gray-900 dark:text-white">Room Map</h2>
        <div className="flex flex-wrap items-center gap-3">
          {legend.map(l => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className={`h-3 w-3 rounded border ${l.color}`} />
              <span className="text-xs text-gray-500 dark:text-slate-400">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {floors.length === 0 ? (
        <div className="text-center py-8 text-gray-400 dark:text-slate-500">
          <BedDouble className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">No rooms found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {floors.map(floor => (
            <div key={floor}>
              <div className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Floor {floor}
              </div>
              <div className="flex flex-wrap gap-2">
                {byFloor[floor].map(room => (
                  <button
                    key={room._id}
                    onClick={() => setSelected(selected?._id === room._id ? null : room)}
                    className={`h-12 w-16 rounded-lg border-2 text-sm font-bold transition-all ${
                      roomStatus[room.status] || roomStatus.available
                    } ${selected?._id === room._id ? 'ring-2 ring-primary-500 ring-offset-1' : ''}`}
                    title={`Room ${room.roomNumber} — ${room.status}`}
                  >
                    {room.roomNumber}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="mt-5 pt-5 border-t dark:border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Room {selected.roomNumber}
            </h3>
            <button
              onClick={() => setSelected(null)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500 dark:text-slate-400">Floor: </span>
              <span className="font-medium text-gray-900 dark:text-white">{selected.floor}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-slate-400">Status: </span>
              <span className="font-medium text-gray-900 dark:text-white capitalize">
                {selected.status?.replace('_', ' ')}
              </span>
            </div>
            {selected.features?.length > 0 && (
              <div className="col-span-2">
                <span className="text-gray-500 dark:text-slate-400">Features: </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {selected.features.join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Check-in Modal ────────────────────────────────────────────────────────────
const CheckInModal = ({ booking, rooms, onConfirm, onClose, isLoading }) => {
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const available = (rooms || []).filter(r => r.status === 'available');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Check In Guest</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Booking info */}
        <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl mb-5">
          <div className="font-mono font-bold text-primary-700 dark:text-primary-400 mb-1">
            {booking.bookingRef}
          </div>
          <div className="text-sm text-primary-600 dark:text-primary-300">
            {booking.adults} adult{booking.adults > 1 ? 's' : ''}
            {booking.children > 0 && `, ${booking.children} children`}
          </div>
          <div className="text-sm text-primary-600 dark:text-primary-300 mt-0.5">
            {new Date(booking.checkInDate).toLocaleDateString('en-IN')} →{' '}
            {new Date(booking.checkOutDate).toLocaleDateString('en-IN')}
          </div>
        </div>

        {/* Room selection */}
        <div className="mb-5">
          <label className="label">Assign Room</label>
          {available.length === 0 ? (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-sm text-red-700 dark:text-red-400">
              <AlertCircle className="h-4 w-4" />
              No available rooms right now
            </div>
          ) : (
            <select
              className="input"
              value={selectedRoomId}
              onChange={e => setSelectedRoomId(e.target.value)}
            >
              <option value="">Select a room</option>
              {available.map(room => (
                <option key={room._id} value={room._id}>
                  Room {room.roomNumber} — Floor {room.floor}
                  {room.features?.length > 0 && ` (${room.features.join(', ')})`}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            loading={isLoading}
            disabled={!selectedRoomId}
            onClick={() => onConfirm(booking._id, selectedRoomId)}
          >
            <CheckCircle className="h-4 w-4" />
            Confirm Check-in
          </Button>
        </div>
      </div>
    </div>
  );
};

// ── Booking Row ───────────────────────────────────────────────────────────────
const BookingRow = ({ booking, actionLabel, actionColor = 'primary', onAction }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors">
    <div className="space-y-0.5">
      <div className="font-mono text-sm font-bold text-primary-700 dark:text-primary-400">
        {booking.bookingRef}
      </div>
      <div className="text-sm text-gray-500 dark:text-slate-400 flex items-center gap-3">
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          {booking.adults} guest{booking.adults > 1 ? 's' : ''}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {new Date(booking.checkInDate).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short',
          })}
        </span>
      </div>
    </div>
    <button
      onClick={() => onAction(booking)}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        actionColor === 'primary'
          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-900/50'
          : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/50'
      }`}
    >
      {actionLabel}
      <ChevronRight className="h-3.5 w-3.5" />
    </button>
  </div>
);

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function ReceptionistDashboard() {
  const { user }     = useAuthStore();
  const propertyId   = user?.propertyId || '69d6817ab880abc410462b20';
  const [activeTab,       setActiveTab]       = useState('arrivals');
  const [checkInBooking,  setCheckInBooking]  = useState(null);
  const [searchQuery,     setSearchQuery]     = useState('');

  const { data: arrivalsData,   isLoading: arrivalsLoading }   = useTodayArrivals(propertyId);
  const { data: departuresData, isLoading: departuresLoading } = useTodayDepartures(propertyId);
  const { data: rooms,          isLoading: roomsLoading }      = useRooms(propertyId);

  const checkInMutation  = useCheckIn();
  const checkOutMutation = useCheckOut();

  const arrivals   = arrivalsData?.bookings   || [];
  const departures = departuresData?.bookings || [];

  const filtered = (list) =>
    list.filter(b =>
      b.bookingRef.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const roomStats = {
    available:   (rooms || []).filter(r => r.status === 'available').length,
    occupied:    (rooms || []).filter(r => r.status === 'occupied').length,
    maintenance: (rooms || []).filter(r => r.status === 'maintenance').length,
  };

  const handleCheckIn = async (bookingId, roomId) => {
    await checkInMutation.mutateAsync({ bookingId, roomId });
    setCheckInBooking(null);
  };

  const handleCheckOut = async (booking) => {
    if (window.confirm(`Confirm check-out for ${booking.bookingRef}?`)) {
      await checkOutMutation.mutateAsync(booking._id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Reception Dashboard
        </h1>
        <p className="text-gray-500 dark:text-slate-400 mt-0.5">
          {new Date().toLocaleDateString('en-IN', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today's Arrivals",   value: arrivals.length,   icon: LogIn,     color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'   },
          { label: "Today's Departures", value: departures.length, icon: LogOut,    color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400' },
          { label: 'Available Rooms',    value: roomStats.available,icon: BedDouble, color: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'  },
          { label: 'Occupied Rooms',     value: roomStats.occupied, icon: Users,     color: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'          },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card dark:bg-slate-800 p-5">
            <div className={`h-9 w-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
            <div className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Arrivals / Departures */}
      <div className="card dark:bg-slate-800 overflow-hidden">
        {/* Tabs */}
        <div className="border-b dark:border-slate-700">
          <div className="flex">
            {[
              { key: 'arrivals',   label: `Arrivals (${arrivals.length})`,     icon: LogIn  },
              { key: 'departures', label: `Departures (${departures.length})`, icon: LogOut },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-primary-700 text-primary-700 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search booking reference..."
              className="input pl-9"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {/* List */}
          {activeTab === 'arrivals' ? (
            arrivalsLoading ? (
              <div className="flex justify-center py-6"><Spinner /></div>
            ) : filtered(arrivals).length === 0 ? (
              <div className="text-center py-8 text-gray-400 dark:text-slate-500">
                <Calendar className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">
                  {searchQuery ? 'No matches found' : 'No arrivals today'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered(arrivals).map(b => (
                  <BookingRow
                    key={b._id}
                    booking={b}
                    actionLabel="Check In"
                    actionColor="primary"
                    onAction={() => setCheckInBooking(b)}
                  />
                ))}
              </div>
            )
          ) : (
            departuresLoading ? (
              <div className="flex justify-center py-6"><Spinner /></div>
            ) : filtered(departures).length === 0 ? (
              <div className="text-center py-8 text-gray-400 dark:text-slate-500">
                <Calendar className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">
                  {searchQuery ? 'No matches found' : 'No departures today'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered(departures).map(b => (
                  <BookingRow
                    key={b._id}
                    booking={b}
                    actionLabel="Check Out"
                    actionColor="orange"
                    onAction={handleCheckOut}
                  />
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* Room Map */}
      {roomsLoading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : (
        <RoomMap rooms={rooms} />
      )}

      {/* Check-in modal */}
      {checkInBooking && (
        <CheckInModal
          booking={checkInBooking}
          rooms={rooms}
          onConfirm={handleCheckIn}
          onClose={() => setCheckInBooking(null)}
          isLoading={checkInMutation.isPending}
        />
      )}
    </div>
  );
}