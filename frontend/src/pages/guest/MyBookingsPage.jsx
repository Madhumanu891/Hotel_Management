import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, XCircle, ChevronDown } from 'lucide-react';
import { useMyBookings, useCancelBooking } from '../../hooks/useBookings';
import Spinner from '../../components/ui/Spinner';

const statusConfig = {
  pending: { label: 'Pending Payment', class: 'badge-warning' },
  confirmed: { label: 'Confirmed', class: 'badge-success' },
  checked_in: { label: 'Checked In', class: 'badge-info' },
  checked_out: { label: 'Completed', class: 'badge-purple' },
  cancelled: { label: 'Cancelled', class: 'badge-error' },
  no_show: { label: 'No Show', class: 'badge-error' },
};

const BookingCard = ({ booking, onCancel }) => {
  const [expanded, setExpanded] = useState(false);
  const status = statusConfig[booking.status] || { label: booking.status, class: 'badge-info' };
  const canCancel = ['pending', 'confirmed'].includes(booking.status);

  const checkIn = new Date(booking.checkInDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const checkOut = new Date(booking.checkOutDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const nights = Math.ceil((new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / (1000 * 60 * 60 * 24));

  return (
    <div className="card overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link
                to={`/dashboard/guest/bookings/${booking._id}`}
                className="font-mono text-sm font-bold text-primary-700 hover:text-primary-800 hover:underline"
              >
                {booking.bookingRef}
              </Link>
              <span className={status.class}>{status.label}</span>
            </div>
            <div className="space-y-1.5 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{checkIn} → {checkOut} ({nights} night{nights > 1 ? 's' : ''})</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>
                  {booking.adults} adult{booking.adults > 1 ? 's' : ''}
                  {booking.children > 0 && `, ${booking.children} children`}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xl font-bold text-gray-900">
              ₹{booking.pricing?.totalAmount?.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {booking.paymentStatus === 'paid' ? '✓ Paid' : 'Payment pending'}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            Details
            <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>

          {canCancel && (
            <button
              onClick={() => onCancel(booking._id)}
              className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-medium"
            >
              <XCircle className="h-4 w-4" />
              Cancel
            </button>
          )}
        </div>

        {expanded && (
          <div className="mt-4 pt-4 border-t space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Base price</span>
              <span>₹{booking.pricing?.basePrice?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (18%)</span>
              <span>₹{booking.pricing?.taxAmount?.toLocaleString()}</span>
            </div>
            {booking.specialRequests && (
              <div>
                <span className="font-medium">Special requests: </span>
                <span>{booking.specialRequests}</span>
              </div>
            )}
            {booking.cancellationRefundAmount > 0 && (
              <div className="text-green-600 font-medium">
                Refund: ₹{booking.cancellationRefundAmount?.toLocaleString()}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default function MyBookingsPage() {
  const [filter, setFilter] = useState('all');
  const { data, isLoading } = useMyBookings(filter !== 'all' ? { status: filter } : {});
  const cancelMutation = useCancelBooking();

  const handleCancel = (id) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      cancelMutation.mutate({ id, reason: 'Cancelled by guest' });
    }
  };

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'checked_in', label: 'Active' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
        <p className="text-gray-500 mt-1">View and manage all your reservations</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === tab.key
                ? 'bg-primary-700 text-white'
                : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : data?.bookings?.length === 0 ? (
        <div className="card p-12 text-center">
          <Calendar className="h-12 w-12 text-gray-200 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">No bookings found</h3>
          <p className="text-gray-500 mb-6">Start by searching for a hotel</p>
          <a href="/dashboard/guest/search" className="btn-primary">Search Hotels</a>
        </div>
      ) : (
        <div className="space-y-4">
          {data?.bookings?.map(booking => (
            <BookingCard key={booking._id} booking={booking} onCancel={handleCancel} />
          ))}
        </div>
      )}
    </div>
  );
}