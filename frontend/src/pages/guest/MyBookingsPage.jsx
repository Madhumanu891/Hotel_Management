import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, XCircle,
  ChevronDown, ChevronRight, Search,
  Hotel, BedDouble, Filter,
} from 'lucide-react';
import { useMyBookings, useCancelBooking } from '../../hooks/useBookings';
import Spinner    from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Button     from '../../components/ui/Button';

const statusConfig = {
  pending:     { label: 'Pending Payment', badge: 'badge-warning' },
  confirmed:   { label: 'Confirmed',       badge: 'badge-success' },
  checked_in:  { label: 'Checked In',      badge: 'badge-info'    },
  checked_out: { label: 'Completed',       badge: 'badge-purple'  },
  cancelled:   { label: 'Cancelled',       badge: 'badge-error'   },
};

const BookingCard = ({ booking, onCancel }) => {
  const [expanded, setExpanded] = useState(false);
  const navigate   = useNavigate();
  const status     = statusConfig[booking.status] || statusConfig.confirmed;
  const canCancel  = ['pending', 'confirmed'].includes(booking.status);

  const checkIn  = new Date(booking.checkInDate);
  const checkOut = new Date(booking.checkOutDate);
  const nights   = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  const isPast   = checkOut < new Date();

  return (
    <div className="card dark:bg-slate-800 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Link
                to={`/dashboard/guest/bookings/${booking._id}`}
                className="font-mono font-bold text-primary-700 dark:text-primary-400 hover:underline text-sm"
              >
                {booking.bookingRef}
              </Link>
              <span className={status.badge}>{status.label}</span>
              {isPast && booking.status === 'checked_out' && (
                <span className="badge-purple">Past Stay</span>
              )}
            </div>

            {/* Date row */}
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400 mb-1">
              <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
              <span>
                {checkIn.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                {' → '}
                {checkOut.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>

            {/* Nights + guests */}
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <BedDouble className="h-3.5 w-3.5" />
                {nights} night{nights > 1 ? 's' : ''}
              </span>
              <span>•</span>
              <span>
                {booking.adults} adult{booking.adults > 1 ? 's' : ''}
                {booking.children > 0 && `, ${booking.children} child${booking.children > 1 ? 'ren' : ''}`}
              </span>
            </div>
          </div>

          {/* Amount */}
          <div className="text-right flex-shrink-0">
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              ₹{(booking.pricing?.totalAmount || 0).toLocaleString()}
            </div>
            <div className="text-xs text-gray-400 dark:text-slate-500">
              {booking.paymentStatus === 'paid'
                ? '✓ Paid'
                : 'Payment pending'
              }
            </div>
          </div>
        </div>

        {/* Action row */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t dark:border-slate-700">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition-colors"
            >
              Details
              <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {canCancel && (
              <button
                onClick={() => onCancel(booking._id)}
                className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition-colors"
              >
                <XCircle className="h-3.5 w-3.5" />
                Cancel
              </button>
            )}
            <Link
              to={`/dashboard/guest/bookings/${booking._id}`}
              className="flex items-center gap-1.5 text-xs text-primary-700 dark:text-primary-400 font-semibold hover:underline"
            >
              View Details
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="mt-3 pt-3 border-t dark:border-slate-700 space-y-2 text-sm text-gray-600 dark:text-slate-400">
            <div className="flex justify-between">
              <span>Base Price</span>
              <span className="font-medium text-gray-900 dark:text-white">
                ₹{(booking.pricing?.basePrice || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>GST (18%)</span>
              <span className="font-medium text-gray-900 dark:text-white">
                ₹{(booking.pricing?.taxAmount || 0).toLocaleString()}
              </span>
            </div>
            {booking.specialRequests && (
              <div className="pt-1">
                <span className="font-medium text-gray-700 dark:text-slate-300">
                  Requests:{' '}
                </span>
                <span className="italic">{booking.specialRequests}</span>
              </div>
            )}
            {booking.cancellationRefundAmount > 0 && (
              <div className="flex justify-between text-green-600 dark:text-green-400 font-semibold pt-1">
                <span>Refund Amount</span>
                <span>₹{booking.cancellationRefundAmount.toLocaleString()}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default function MyBookingsPage() {
  const [filter,      setFilter]      = useState('all');
  const [search,      setSearch]      = useState('');
  const cancelMutation = useCancelBooking();

  const { data, isLoading, refetch } = useMyBookings(
    filter !== 'all' ? { status: filter } : {}
  );

  const handleQuickCancel = (id) => {
    if (window.confirm('Cancel this booking?')) {
      cancelMutation.mutate({ id, reason: 'Cancelled by guest' });
    }
  };

  const bookings = (data?.bookings || []).filter(b =>
    !search || b.bookingRef.toLowerCase().includes(search.toLowerCase())
  );

  const tabs = [
    { key: 'all',         label: 'All' },
    { key: 'confirmed',   label: 'Confirmed' },
    { key: 'checked_in',  label: 'Active' },
    { key: 'checked_out', label: 'Completed' },
    { key: 'pending',     label: 'Pending' },
    { key: 'cancelled',   label: 'Cancelled' },
  ];

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Bookings
          </h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-0.5">
            Manage all your reservations
          </p>
        </div>
        <Link
          to="/dashboard/guest/search"
          className="btn-primary text-sm py-2 flex items-center gap-2 w-fit"
        >
          <Hotel className="h-4 w-4" />
          New Booking
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by booking reference..."
          className="input pl-9"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              filter === tab.key
                ? 'bg-primary-700 text-white'
                : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : bookings.length === 0 ? (
        <div className="card dark:bg-slate-800">
          <EmptyState
            icon={Calendar}
            title={search ? 'No matches found' : 'No bookings yet'}
            description={
              search
                ? `No bookings match "${search}"`
                : 'Start by searching for a hotel and making a reservation'
            }
            action={!search ? {
              label:   'Search Hotels',
              onClick: () => window.location.href = '/dashboard/guest/search',
            } : undefined}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Count */}
          <p className="text-sm text-gray-500 dark:text-slate-400">
            {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
            {filter !== 'all' && ` — ${filter.replace('_', ' ')}`}
          </p>

          {bookings.map(booking => (
            <BookingCard
              key={booking._id}
              booking={booking}
              onCancel={handleQuickCancel}
            />
          ))}
        </div>
      )}
    </div>
  );
}