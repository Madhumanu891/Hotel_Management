import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Calendar, Users, Receipt,
  CheckCircle, XCircle, Clock, Download,
  AlertCircle, BedDouble, MapPin, Star,
  Phone, Mail, RefreshCw,
} from 'lucide-react';
import { useBooking, useCancelBooking } from '../../hooks/useBookings';
import { useDownloadInvoice, generateInvoicePDF } from '../../hooks/useInvoice';
import Spinner    from '../../components/ui/Spinner';
import Button     from '../../components/ui/Button';
import Alert      from '../../components/ui/Alert';
import EmptyState from '../../components/ui/EmptyState';

// ── Status config ─────────────────────────────────────────────────────────────
const statusConfig = {
  pending:     {
    label: 'Pending Payment',
    badge: 'badge-warning',
    icon:  Clock,
    bg:    'bg-yellow-50 dark:bg-yellow-900/20',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
  },
  confirmed:   {
    label: 'Confirmed',
    badge: 'badge-success',
    icon:  CheckCircle,
    bg:    'bg-green-50 dark:bg-green-900/20',
    iconColor: 'text-green-600 dark:text-green-400',
  },
  checked_in:  {
    label: 'Checked In',
    badge: 'badge-info',
    icon:  CheckCircle,
    bg:    'bg-blue-50 dark:bg-blue-900/20',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  checked_out: {
    label: 'Completed',
    badge: 'badge-purple',
    icon:  CheckCircle,
    bg:    'bg-purple-50 dark:bg-purple-900/20',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
  cancelled:   {
    label: 'Cancelled',
    badge: 'badge-error',
    icon:  XCircle,
    bg:    'bg-red-50 dark:bg-red-900/20',
    iconColor: 'text-red-600 dark:text-red-400',
  },
};

// ── Timeline component ────────────────────────────────────────────────────────
const BookingTimeline = ({ booking }) => {
  const steps = [
    {
      key:   'created',
      label: 'Booking Created',
      desc:  new Date(booking.createdAt).toLocaleString('en-IN', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
      }),
      done: true,
    },
    {
      key:   'paid',
      label: 'Payment Confirmed',
      desc:  booking.paymentStatus === 'paid' ? 'Payment received' : 'Awaiting payment',
      done:  booking.paymentStatus === 'paid',
    },
    {
      key:   'checkin',
      label: 'Check-in',
      desc:  booking.actualCheckIn
        ? new Date(booking.actualCheckIn).toLocaleString('en-IN', {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
          })
        : new Date(booking.checkInDate).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short',
          }),
      done:  ['checked_in', 'checked_out'].includes(booking.status),
    },
    {
      key:   'checkout',
      label: 'Check-out',
      desc:  booking.actualCheckOut
        ? new Date(booking.actualCheckOut).toLocaleString('en-IN', {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
          })
        : new Date(booking.checkOutDate).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short',
          }),
      done:  booking.status === 'checked_out',
    },
  ];

  if (booking.status === 'cancelled') return null;

  return (
    <div className="card dark:bg-slate-800 p-6">
      <h2 className="font-semibold text-gray-900 dark:text-white mb-5">
        Booking Progress
      </h2>
      <div className="relative">
        {/* Connecting line */}
        <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-200 dark:bg-slate-700" />

        <div className="space-y-5">
          {steps.map((step, idx) => (
            <div key={step.key} className="flex items-start gap-4 relative">
              {/* Step circle */}
              <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                step.done
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500'
              }`}>
                {step.done
                  ? <CheckCircle className="h-4 w-4" />
                  : <span className="text-xs font-bold">{idx + 1}</span>
                }
              </div>
              <div className="pb-1">
                <div className={`text-sm font-semibold ${
                  step.done
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-400 dark:text-slate-500'
                }`}>
                  {step.label}
                </div>
                <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  {step.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Cancel form ───────────────────────────────────────────────────────────────
const CancelForm = ({ booking, onCancel, onClose, isLoading }) => {
  const [reason,      setReason]      = useState('');
  const [customReason, setCustomReason] = useState('');

  const reasons = [
    'Change of plans',
    'Found better option',
    'Emergency',
    'Travel issue',
    'Booked by mistake',
    'Other',
  ];

  const finalReason = reason === 'Other' ? customReason : reason;

  return (
    <div className="card dark:bg-slate-800 border-2 border-red-200 dark:border-red-800 p-6">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
        Cancel Booking
      </h3>
      <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
        Please tell us why you're cancelling so we can improve.
      </p>

      {/* Refund notice */}
      <Alert
        type="warning"
        title="Cancellation Policy"
        message="Cancelling more than 24 hours before check-in gives a full refund. Within 24 hours — 1 night will be charged."
        className="mb-4"
      />

      {/* Reason buttons */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {reasons.map(r => (
          <button
            key={r}
            onClick={() => setReason(r)}
            className={`text-left px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
              reason === r
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:border-gray-300 dark:hover:border-slate-600'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {reason === 'Other' && (
        <textarea
          rows={2}
          className="input resize-none text-sm mb-3"
          placeholder="Please describe your reason..."
          value={customReason}
          onChange={e => setCustomReason(e.target.value)}
        />
      )}

      <div className="flex gap-3">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={onClose}
        >
          Keep Booking
        </Button>
        <Button
          variant="danger"
          className="flex-1"
          loading={isLoading}
          disabled={!finalReason.trim()}
          onClick={() => onCancel(finalReason)}
        >
          <XCircle className="h-4 w-4" />
          Confirm Cancel
        </Button>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function BookingDetailPage() {
  const { id }        = useParams();
  const navigate      = useNavigate();
  const [showCancel, setShowCancel] = useState(false);

  const { data: booking, isLoading, refetch, isFetching } = useBooking(id);
  const invoiceMutation = useDownloadInvoice();
  const cancelMutation  = useCancelBooking();

  const handleDownloadInvoice = async () => {
    try {
      const payment = await invoiceMutation.mutateAsync(booking._id);
      generateInvoicePDF(booking, payment, null);
    } catch (err) {
      console.error('Invoice error:', err);
    }
  };

  const handleCancel = async (reason) => {
    await cancelMutation.mutateAsync({ id: booking._id, reason });
    setShowCancel(false);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!booking) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Booking not found"
        description="This booking doesn't exist or you don't have access to it."
        action={{
          label:   'My Bookings',
          onClick: () => navigate('/dashboard/guest/bookings'),
        }}
      />
    );
  }

  const status   = statusConfig[booking.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  const checkIn  = new Date(booking.checkInDate);
  const checkOut = new Date(booking.checkOutDate);
  const nights   = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

  const canCancel  = ['pending', 'confirmed'].includes(booking.status);
  const canInvoice = ['confirmed', 'checked_in', 'checked_out'].includes(booking.status);

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-12">
      {/* Back */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard/guest/bookings')}
          className="flex items-center gap-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 font-medium text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Bookings
        </button>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 text-gray-400 ${isFetching ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Status header */}
      <div className="card dark:bg-slate-800 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="font-mono text-xl font-bold text-primary-700 dark:text-primary-400">
                {booking.bookingRef}
              </span>
              <span className={status.badge}>{status.label}</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Booked on {new Date(booking.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
          </div>

          <div className={`h-14 w-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${status.bg}`}>
            <StatusIcon className={`h-7 w-7 ${status.iconColor}`} />
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Stay dates */}
        <div className="card dark:bg-slate-800 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary-600" />
            Stay Dates
          </h2>
          <div className="space-y-3">
            <div>
              <div className="text-xs text-gray-400 dark:text-slate-500 mb-0.5">
                Check-in
              </div>
              <div className="font-semibold text-gray-900 dark:text-white text-sm">
                {checkIn.toLocaleDateString('en-IN', {
                  weekday: 'long', day: 'numeric', month: 'long',
                })}
              </div>
              <div className="text-xs text-gray-500 dark:text-slate-400">
                After 2:00 PM
              </div>
            </div>
            <div className="border-l-2 border-primary-300 dark:border-primary-700 pl-3 py-1">
              <div className="text-sm font-bold text-primary-700 dark:text-primary-400">
                {nights} Night{nights > 1 ? 's' : ''}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400 dark:text-slate-500 mb-0.5">
                Check-out
              </div>
              <div className="font-semibold text-gray-900 dark:text-white text-sm">
                {checkOut.toLocaleDateString('en-IN', {
                  weekday: 'long', day: 'numeric', month: 'long',
                })}
              </div>
              <div className="text-xs text-gray-500 dark:text-slate-400">
                Before 11:00 AM
              </div>
            </div>
          </div>
        </div>

        {/* Guest info */}
        <div className="card dark:bg-slate-800 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-primary-600" />
            Guest Details
          </h2>
          <div className="space-y-2.5 text-sm">
            {[
              { label: 'Adults',    value: booking.adults              },
              { label: 'Children',  value: booking.children || 0       },
              ...(booking.roomId ? [{ label: 'Room Assigned', value: `Room ${booking.roomId}` }] : []),
              ...(booking.actualCheckIn ? [{
                label: 'Checked In',
                value: new Date(booking.actualCheckIn).toLocaleTimeString('en-IN', {
                  hour: '2-digit', minute: '2-digit',
                }),
              }] : []),
              ...(booking.actualCheckOut ? [{
                label: 'Checked Out',
                value: new Date(booking.actualCheckOut).toLocaleTimeString('en-IN', {
                  hour: '2-digit', minute: '2-digit',
                }),
              }] : []),
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between">
                <span className="text-gray-500 dark:text-slate-400">{label}</span>
                <span className="font-medium text-gray-900 dark:text-white">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Special requests */}
      {booking.specialRequests && (
        <div className="card dark:bg-slate-800 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">
            Special Requests
          </h2>
          <p className="text-gray-600 dark:text-slate-300 text-sm italic">
            "{booking.specialRequests}"
          </p>
        </div>
      )}

      {/* Timeline */}
      <BookingTimeline booking={booking} />

      {/* Payment summary */}
      <div className="card dark:bg-slate-800 p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Receipt className="h-4 w-4 text-primary-600" />
          Payment Summary
        </h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-600 dark:text-slate-400">
            <span>
              ₹{Math.round((booking.pricing?.basePrice || 0) / nights).toLocaleString()}
              × {nights} night{nights > 1 ? 's' : ''}
            </span>
            <span>₹{(booking.pricing?.basePrice || 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-gray-600 dark:text-slate-400">
            <span>GST (18%)</span>
            <span>₹{(booking.pricing?.taxAmount || 0).toLocaleString()}</span>
          </div>
          <div className="border-t dark:border-slate-700 pt-2.5 flex justify-between font-bold text-gray-900 dark:text-white text-base">
            <span>Total Paid</span>
            <span>₹{(booking.pricing?.totalAmount || 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs pt-1">
            <span className="text-gray-400 dark:text-slate-500">Payment Status</span>
            <span className={booking.paymentStatus === 'paid'
              ? 'text-green-600 dark:text-green-400 font-semibold'
              : 'text-yellow-600 dark:text-yellow-400 font-semibold'
            }>
              {booking.paymentStatus?.toUpperCase() || 'PENDING'}
            </span>
          </div>
        </div>
      </div>

      {/* Cancellation info */}
      {booking.status === 'cancelled' && (
        <div className="card dark:bg-slate-800 p-5 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10">
          <h2 className="font-semibold text-red-700 dark:text-red-400 mb-3">
            Cancellation Details
          </h2>
          <div className="space-y-1.5 text-sm">
            {booking.cancelledAt && (
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-slate-400">Cancelled On</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {new Date(booking.cancelledAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </span>
              </div>
            )}
            {booking.cancellationReason && (
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-slate-400">Reason</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {booking.cancellationReason}
                </span>
              </div>
            )}
            {booking.cancellationRefundAmount > 0 && (
              <div className="flex justify-between pt-2 border-t dark:border-red-800">
                <span className="font-semibold text-gray-900 dark:text-white">
                  Refund Amount
                </span>
                <span className="font-bold text-green-600 dark:text-green-400 text-base">
                  ₹{booking.cancellationRefundAmount.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      {(canInvoice || canCancel) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {canInvoice && (
            <Button
              variant="secondary"
              onClick={handleDownloadInvoice}
              loading={invoiceMutation.isPending}
              className="flex-1 py-3"
            >
              <Download className="h-4 w-4" />
              Download Invoice
            </Button>
          )}
          {canCancel && !showCancel && (
            <Button
              variant="danger"
              onClick={() => setShowCancel(true)}
              className="flex-1 py-3"
            >
              <XCircle className="h-4 w-4" />
              Cancel Booking
            </Button>
          )}
        </div>
      )}

      {/* Cancel form */}
      {showCancel && (
        <CancelForm
          booking={booking}
          onCancel={handleCancel}
          onClose={() => setShowCancel(false)}
          isLoading={cancelMutation.isPending}
        />
      )}
    </div>
  );
}