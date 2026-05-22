import { useState } from 'react';
import {
  Calendar, LogIn, LogOut, BedDouble,
  CheckCircle, Clock, Users, Search, X,
  ChevronRight, AlertCircle,
} from 'lucide-react';
import {
  useTodayArrivals, useTodayDepartures,
  useRooms, useCheckIn, useCheckOut,
} from '../../hooks/useReceptionist';
import { useAuthStore } from '../../stores/authStore';
import Spinner from '../../components/ui/Spinner';
import Button  from '../../components/ui/Button';

// ── Room Map ────────────────────────────────────────────────────────────────
const statusColors = {
  available:      'bg-green-100 border-green-300 text-green-700 hover:bg-green-200',
  occupied:       'bg-red-100 border-red-300 text-red-700 hover:bg-red-200',
  maintenance:    'bg-yellow-100 border-yellow-300 text-yellow-700 hover:bg-yellow-200',
  out_of_service: 'bg-gray-100 border-gray-300 text-gray-500',
};

const RoomMap = ({ rooms }) => {
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Group rooms by floor
  const byFloor = (rooms || []).reduce((acc, room) => {
    const floor = room.floor || 1;
    if (!acc[floor]) acc[floor] = [];
    acc[floor].push(room);
    return acc;
  }, {});

  const floors = Object.keys(byFloor).sort((a, b) => Number(b) - Number(a));

  const legend = [
    { status: 'available',      label: 'Available',       color: 'bg-green-100 border-green-300' },
    { status: 'occupied',       label: 'Occupied',        color: 'bg-red-100 border-red-300' },
    { status: 'maintenance',    label: 'Maintenance',     color: 'bg-yellow-100 border-yellow-300' },
    { status: 'out_of_service', label: 'Out of Service',  color: 'bg-gray-100 border-gray-300' },
  ];

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-gray-900">Room Map</h2>
        <div className="flex items-center gap-4">
          {legend.map(l => (
            <div key={l.status} className="flex items-center gap-1.5">
              <div className={`h-3 w-3 rounded border ${l.color}`} />
              <span className="text-xs text-gray-500">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {floors.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <BedDouble className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">No rooms found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {floors.map(floor => (
            <div key={floor}>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Floor {floor}
              </div>
              <div className="flex flex-wrap gap-2">
                {byFloor[floor].map(room => (
                  <button
                    key={room._id}
                    onClick={() => setSelectedRoom(selectedRoom?._id === room._id ? null : room)}
                    className={`h-12 w-16 rounded-lg border-2 text-sm font-bold transition-all ${statusColors[room.status] || statusColors.available}`}
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

      {/* Room detail panel */}
      {selectedRoom && (
        <div className="mt-6 p-4 bg-gray-50 rounded-xl border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Room {selectedRoom.roomNumber}</h3>
            <button onClick={() => setSelectedRoom(null)}>
              <X className="h-4 w-4 text-gray-400" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">Floor: </span>
              <span className="font-medium">{selectedRoom.floor}</span>
            </div>
            <div>
              <span className="text-gray-500">Status: </span>
              <span className="font-medium capitalize">{selectedRoom.status?.replace('_', ' ')}</span>
            </div>
            {selectedRoom.features?.length > 0 && (
              <div className="col-span-2">
                <span className="text-gray-500">Features: </span>
                <span className="font-medium">{selectedRoom.features.join(', ')}</span>
              </div>
            )}
            {selectedRoom.maintenanceNote && (
              <div className="col-span-2">
                <span className="text-gray-500">Note: </span>
                <span className="font-medium text-yellow-700">{selectedRoom.maintenanceNote}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Check-in Modal ──────────────────────────────────────────────────────────
const CheckInModal = ({ booking, rooms, onConfirm, onClose, isLoading }) => {
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const availableRooms = (rooms || []).filter(r => r.status === 'available');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Check In Guest</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-gray-400" /></button>
        </div>

        <div className="space-y-4 mb-6">
          <div className="p-4 bg-primary-50 rounded-xl text-sm">
            <div className="font-semibold text-primary-900 mb-1">{booking.bookingRef}</div>
            <div className="text-primary-700">
              {booking.adults} adult{booking.adults > 1 ? 's' : ''}
              {booking.children > 0 && `, ${booking.children} children`}
            </div>
            <div className="text-primary-700">
              {new Date(booking.checkInDate).toLocaleDateString()} →{' '}
              {new Date(booking.checkOutDate).toLocaleDateString()}
            </div>
          </div>

          <div>
            <label className="label">Assign Room</label>
            {availableRooms.length === 0 ? (
              <div className="p-3 bg-red-50 rounded-lg text-sm text-red-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                No available rooms. Please check room status.
              </div>
            ) : (
              <select
                className="input"
                value={selectedRoomId}
                onChange={e => setSelectedRoomId(e.target.value)}
              >
                <option value="">Select a room</option>
                {availableRooms.map(room => (
                  <option key={room._id} value={room._id}>
                    Room {room.roomNumber} — Floor {room.floor}
                    {room.features?.length > 0 && ` (${room.features.join(', ')})`}
                  </option>
                ))}
              </select>
            )}
          </div>
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

// ── Booking Row ─────────────────────────────────────────────────────────────
const BookingRow = ({ booking, action, actionLabel, actionColor = 'primary', onAction }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
    <div className="space-y-0.5">
      <div className="font-mono text-sm font-bold text-primary-700">{booking.bookingRef}</div>
      <div className="text-sm text-gray-600 flex items-center gap-3">
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          {booking.adults} guest{booking.adults > 1 ? 's' : ''}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {new Date(booking.checkInDate).toLocaleDateString('en-IN')}
        </span>
      </div>
    </div>
    <button
      onClick={() => onAction(booking)}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        actionColor === 'primary'
          ? 'bg-primary-100 text-primary-700 hover:bg-primary-200'
          : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
      }`}
    >
      {actionLabel}
      <ChevronRight className="h-3.5 w-3.5" />
    </button>
  </div>
);

// ── Main Dashboard ──────────────────────────────────────────────────────────
export default function ReceptionistDashboard() {
  const { user }     = useAuthStore();
  const propertyId   = user?.propertyId || '69d6817ab880abc410462b20';
  const [activeTab,     setActiveTab]     = useState('arrivals');
  const [checkInBooking, setCheckInBooking] = useState(null);
  const [searchQuery,   setSearchQuery]   = useState('');

  const { data: arrivalsData,   isLoading: arrivalsLoading }   = useTodayArrivals(propertyId);
  const { data: departuresData, isLoading: departuresLoading } = useTodayDepartures(propertyId);
  const { data: rooms,          isLoading: roomsLoading }       = useRooms(propertyId);

  const checkInMutation  = useCheckIn();
  const checkOutMutation = useCheckOut();

  const arrivals   = arrivalsData?.bookings   || [];
  const departures = departuresData?.bookings || [];

  const filteredArrivals = arrivals.filter(b =>
    b.bookingRef.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredDepartures = departures.filter(b =>
    b.bookingRef.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const roomStats = {
    available:   (rooms || []).filter(r => r.status === 'available').length,
    occupied:    (rooms || []).filter(r => r.status === 'occupied').length,
    maintenance: (rooms || []).filter(r => r.status === 'maintenance').length,
    total:       (rooms || []).length,
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
        <h1 className="text-2xl font-bold text-gray-900">Reception Dashboard</h1>
        <p className="text-gray-500 mt-1">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Room stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Today\'s Arrivals',   value: arrivals.length,        icon: LogIn,     color: 'bg-blue-50 text-blue-700' },
          { label: 'Today\'s Departures', value: departures.length,      icon: LogOut,    color: 'bg-orange-50 text-orange-700' },
          { label: 'Available Rooms',     value: roomStats.available,    icon: BedDouble, color: 'bg-green-50 text-green-700' },
          { label: 'Occupied Rooms',      value: roomStats.occupied,     icon: Users,     color: 'bg-red-50 text-red-700' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Check-in / Check-out queues */}
      <div className="card">
        <div className="border-b">
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
                    ? 'border-primary-700 text-primary-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by booking reference..."
              className="input pl-9"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {/* List */}
          {activeTab === 'arrivals' ? (
            arrivalsLoading ? (
              <div className="flex justify-center py-8"><Spinner /></div>
            ) : filteredArrivals.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Calendar className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">No arrivals today</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredArrivals.map(booking => (
                  <BookingRow
                    key={booking._id}
                    booking={booking}
                    actionLabel="Check In"
                    actionColor="primary"
                    onAction={() => setCheckInBooking(booking)}
                  />
                ))}
              </div>
            )
          ) : (
            departuresLoading ? (
              <div className="flex justify-center py-8"><Spinner /></div>
            ) : filteredDepartures.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Calendar className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">No departures today</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredDepartures.map(booking => (
                  <BookingRow
                    key={booking._id}
                    booking={booking}
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

      {/* Room map */}
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