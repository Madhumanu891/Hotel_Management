import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Calendar, Users, MapPin, Clock,
  CheckCircle, XCircle, Download, Phone, Mail,
  BedDouble, Receipt, AlertCircle,
} from 'lucide-react';
import { useBooking } from '../../hooks/useBookings';
import { useDownloadInvoice, generateInvoicePDF } from '../../hooks/useInvoice';
import { useCancelBooking } from '../../hooks/useBookings';
import Spinner from '../../components/ui/Spinner';
import Button  from '../../components/ui/Button';
import { useState } from 'react';

const statusConfig = {
  pending:     { label: 'Pending Payment', color: 'badge-warning', icon: Clock         },
  confirmed:   { label: 'Confirmed',       color: 'badge-success', icon: CheckCircle   },
  checked_in:  { label: 'Checked In',      color: 'badge-info',    icon: CheckCircle   },
  checked_out: { label: 'Completed',       color: 'badge-purple',  icon: CheckCircle   },
  cancelled:   { label: 'Cancelled',       color: 'badge-error',   icon: XCircle       },
  no_show:     { label: 'No Show',         color: 'badge-error',   icon: AlertCircle   },
};

export default function BookingDetailPage() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const { data: booking, isLoading } = useBooking(id);
  const invoiceMutation  = useDownloadInvoice();
  const cancelMutation   = useCancelBooking();

  if (isLoading) {
    return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  }

  if (!booking) {
    return (
      <div className="card p-8 text-center">
        <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <p className="font-medium text-gray-900">Booking not found</p>
        <Link to="/dashboard/guest/bookings" className="btn-primary mt-4 inline-block">
          My Bookings
        </Link>
      </div>
    );
  }

  const status   = statusConfig[booking.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  const checkIn  = new Date(booking.checkInDate).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const checkOut = new Date(booking.checkOutDate).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const nights = Math.ceil(
    (new Date(booking.checkOutDate) - new Date(booking.checkInDate))
    / (1000 * 60 * 60 * 24)
  );

  const canCancel  = ['pending', 'confirmed'].includes(booking.status);
  const canInvoice = ['confirmed', 'checked_in', 'checked_out'].includes(booking.status);

  const handleDownloadInvoice = async () => {
    const payment = await invoiceMutation.mutateAsync(booking._id);
    generateInvoicePDF(booking, payment, null);
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) return;
    await cancelMutation.mutateAsync({ id: booking._id, reason: cancelReason });
    setShowCancel(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Back */}
      <button
        onClick={() => navigate('/dashboard/guest/bookings')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 font-medium text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to My Bookings
      </button>

      {/* Status header */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-2xl font-bold text-primary-700">
                {booking.bookingRef}
              </span>
              <span className={status.color}>{status.label}</span>
            </div>
            <p className="text-sm text-gray-500">
              Booked on {new Date(booking.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
          </div>

          <div className={`h-14 w-14 rounded-full flex items-center justify-center ${
            booking.status === 'confirmed' || booking.status === 'checked_out'
              ? 'bg-green-100'
              : booking.status === 'cancelled'
              ? 'bg-red-100'
              : 'bg-primary-100'
          }`}>
            <StatusIcon className={`h-7 w-7 ${
              booking.status === 'confirmed' || booking.status === 'checked_out'
                ? 'text-green-600'
                : booking.status === 'cancelled'
                ? 'text-red-600'
                : 'text-primary-600'
            }`} />
          </div>
        </div>
      </div>

      {/* Main details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Stay details */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary-600" />
            Stay Details
          </h2>
          <div className="space-y-3 text-sm">
            <div>
              <div className="text-gray-400 text-xs mb-0.5">Check-in</div>
              <div className="font-medium text-gray-900">{checkIn}</div>
              <div className="text-xs text-gray-500">After 2:00 PM</div>
            </div>
            <div className="border-l-2 border-primary-200 pl-3 py-1">
              <div className="text-primary-700 font-semibold text-sm">
                {nights} Night{nights > 1 ? 's' : ''}
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-xs mb-0.5">Check-out</div>
              <div className="font-medium text-gray-900">{checkOut}</div>
              <div className="text-xs text-gray-500">Before 11:00 AM</div>
            </div>
          </div>
        </div>

        {/* Guest details */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Users className="h-4 w-4 text-primary-600" />
            Guest Details
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Adults</span>
              <span className="font-medium">{booking.adults}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Children</span>
              <span className="font-medium">{booking.children || 0}</span>
            </div>
            {booking.roomId && (
              <div className="flex justify-between">
                <span className="text-gray-500">Room Assigned</span>
                <span className="font-medium badge-info">Room {booking.roomId}</span>
              </div>
            )}
            {booking.actualCheckIn && (
              <div className="flex justify-between">
                <span className="text-gray-500">Checked In At</span>
                <span className="font-medium">
                  {new Date(booking.actualCheckIn).toLocaleTimeString('en-IN', {
                    hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              </div>
            )}
            {booking.actualCheckOut && (
              <div className="flex justify-between">
                <span className="text-gray-500">Checked Out At</span>
                <span className="font-medium">
                  {new Date(booking.actualCheckOut).toLocaleTimeString('en-IN', {
                    hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Special requests */}
      {booking.specialRequests && (
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-2 text-sm">Special Requests</h2>
          <p className="text-gray-600 text-sm italic">"{booking.specialRequests}"</p>
        </div>
      )}

      {/* Pricing breakdown */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Receipt className="h-4 w-4 text-primary-600" />
          Payment Summary
        </h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>
              ₹{Math.round((booking.pricing?.basePrice || 0) / nights).toLocaleString()}
              × {nights} night{nights > 1 ? 's' : ''}
            </span>
            <span>₹{(booking.pricing?.basePrice || 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>GST (18%)</span>
            <span>₹{(booking.pricing?.taxAmount || 0).toLocaleString()}</span>
          </div>
          <div className="border-t pt-3 flex justify-between font-bold text-gray-900 text-base">
            <span>Total</span>
            <span>₹{(booking.pricing?.totalAmount || 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-400 pt-1">
            <span>Payment Status</span>
            <span className={`font-medium ${
              booking.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {booking.paymentStatus?.toUpperCase() || 'PENDING'}
            </span>
          </div>
        </div>
      </div>

      {/* Cancellation info */}
      {booking.status === 'cancelled' && (
        <div className="card p-5 border-red-200 bg-red-50">
          <h2 className="font-semibold text-red-700 mb-2">Cancellation Details</h2>
          <div className="space-y-1 text-sm text-red-600">
            {booking.cancelledAt && (
              <div>Cancelled on: {new Date(booking.cancelledAt).toLocaleDateString('en-IN')}</div>
            )}
            {booking.cancellationReason && (
              <div>Reason: {booking.cancellationReason}</div>
            )}
            {booking.cancellationRefundAmount > 0 && (
              <div className="font-semibold text-green-600 mt-2">
                Refund Amount: ₹{booking.cancellationRefundAmount.toLocaleString()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {canInvoice && (
          <Button
            variant="secondary"
            onClick={handleDownloadInvoice}
            loading={invoiceMutation.isPending}
            className="flex-1 py-2.5"
          >
            <Download className="h-4 w-4" />
            Download Invoice
          </Button>
        )}

        {canCancel && !showCancel && (
          <Button
            variant="danger"
            onClick={() => setShowCancel(true)}
            className="flex-1 py-2.5"
          >
            <XCircle className="h-4 w-4" />
            Cancel Booking
          </Button>
        )}
      </div>

      {/* Cancel form */}
      {showCancel && (
        <div className="card p-6 border-red-200">
          <h3 className="font-semibold text-gray-900 mb-3">Confirm Cancellation</h3>
          <p className="text-sm text-gray-500 mb-4">
            Please tell us why you are cancelling. A refund may apply based on our cancellation policy.
          </p>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                'Change of plans',
                'Found better option',
                'Emergency',
                'Travel issue',
                'Other',
              ].map(reason => (
                <button
                  key={reason}
                  onClick={() => setCancelReason(reason)}
                  className={`text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                    cancelReason === reason
                      ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
            <textarea
              rows={2}
              placeholder="Additional details (optional)..."
              className="input resize-none text-sm"
              value={cancelReason.includes('Other') || !['Change of plans','Found better option','Emergency','Travel issue','Other'].includes(cancelReason) ? cancelReason : ''}
              onChange={e => setCancelReason(e.target.value)}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancel(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                Keep Booking
              </button>
              <Button
                variant="danger"
                onClick={handleCancel}
                loading={cancelMutation.isPending}
                disabled={!cancelReason.trim()}
                className="flex-1 py-2.5"
              >
                Confirm Cancellation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}