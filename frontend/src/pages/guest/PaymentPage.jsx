import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, CreditCard, CheckCircle,
  Lock, AlertCircle, Calendar, BedDouble,
  XCircle,
} from 'lucide-react';
import { useCreatePaymentOrder, useMockCapture } from '../../hooks/usePayments';
import { useConfirmBooking } from '../../hooks/useBookings';
import Button  from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

export default function PaymentPage() {
  const navigate = useNavigate();

  const [booking] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('currentBooking') || 'null'); }
    catch { return null; }
  });

  const [selectedProperty] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('selectedProperty') || 'null'); }
    catch { return null; }
  });

  const [paymentStep,  setPaymentStep]  = useState('review');
  const [paymentError, setPaymentError] = useState('');

  const createOrderMutation    = useCreatePaymentOrder();
  const mockCaptureMutation    = useMockCapture();
  const confirmBookingMutation = useConfirmBooking();

  useEffect(() => {
    if (!booking) {
      navigate('/dashboard/guest/search');
    }
  }, []);

  if (!booking) {
    return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  }

  const checkIn  = new Date(booking.checkInDate);
  const checkOut = new Date(booking.checkOutDate);
  const nights   = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

  const handlePay = async () => {
    try {
      setPaymentStep('processing');
      setPaymentError('');

      // Step 1 — create payment order
      const order = await createOrderMutation.mutateAsync({
        bookingId:  booking._id,
        bookingRef: booking.bookingRef,
        amount:     booking.pricing?.totalAmount || 0,
      });

      // Step 2 — mock capture (dev mode)
      await mockCaptureMutation.mutateAsync({
        bookingId:  booking._id,
        paymentId:  order?.paymentId,
        bookingRef: booking.bookingRef,
        amount:     booking.pricing?.totalAmount || 0,
      });

      // Step 3 — confirm booking (fallback, RabbitMQ also does this)
      try {
        await confirmBookingMutation.mutateAsync({
          id:        booking._id,
          paymentId: order?.paymentId,
        });
      } catch (err) {
        // Non-critical — event bus handles this
      }

      // Step 4 — cleanup and success
      sessionStorage.removeItem('currentBooking');
      setPaymentStep('success');

    } catch (err) {
      console.error('Payment error:', err);
      setPaymentError(
        err.response?.data?.message || 'Payment failed. Please try again.'
      );
      setPaymentStep('review');
    }
  };

  // ── Success Screen ──────────────────────────────────────────────────────────
  if (paymentStep === 'success') {
    return (
      <div className="max-w-lg mx-auto py-12 px-4 text-center">
        <div className="card dark:bg-slate-800 p-8">
          <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mb-6">
            Payment successful. Your reservation is secured.
          </p>

          <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-5 mb-6 text-left space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-slate-400">Booking Ref</span>
              <span className="font-mono font-bold text-primary-700">
                {booking.bookingRef}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-slate-400">Hotel</span>
              <span className="font-medium text-gray-900 dark:text-white text-right max-w-xs truncate">
                {selectedProperty?.name || 'Your Hotel'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-slate-400">Check-in</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {checkIn.toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-slate-400">Check-out</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {checkOut.toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </span>
            </div>
            <div className="border-t dark:border-slate-600 pt-3 flex justify-between">
              <span className="font-semibold text-gray-900 dark:text-white">Amount Paid</span>
              <span className="font-bold text-green-600 text-lg">
                ₹{(booking.pricing?.totalAmount || 0).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => navigate('/dashboard/guest/bookings')}
              className="w-full py-3"
            >
              View My Bookings
            </Button>
            <button
              onClick={() => navigate('/dashboard/guest/search')}
              className="text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition-colors"
            >
              Search More Hotels
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Payment Review Screen ───────────────────────────────────────────────────
  return (
    <div className="max-w-lg mx-auto space-y-5 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Complete Payment
        </h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">
          Review your booking and pay securely
        </p>
      </div>

      {/* Booking summary card */}
      <div className="card dark:bg-slate-800 p-5">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-wide">
          Booking Summary
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 dark:text-slate-400">Reference</span>
            <span className="font-mono font-bold text-primary-700 dark:text-primary-400">
              {booking.bookingRef}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 dark:text-slate-400">Hotel</span>
            <span className="font-medium text-gray-900 dark:text-white text-right max-w-xs">
              {selectedProperty?.name || '—'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 dark:text-slate-400 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Check-in
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {checkIn.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 dark:text-slate-400 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Check-out
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {checkOut.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 dark:text-slate-400 flex items-center gap-1.5">
              <BedDouble className="h-3.5 w-3.5" />
              Duration
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {nights} night{nights > 1 ? 's' : ''}
            </span>
          </div>

          {/* Price breakdown */}
          <div className="border-t dark:border-slate-700 pt-3 space-y-2">
            <div className="flex justify-between text-gray-500 dark:text-slate-400">
              <span>Base price</span>
              <span>₹{(booking.pricing?.basePrice || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-500 dark:text-slate-400">
              <span>GST (18%)</span>
              <span>₹{(booking.pricing?.taxAmount || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-lg text-gray-900 dark:text-white pt-1 border-t dark:border-slate-700">
              <span>Total</span>
              <span className="text-primary-700 dark:text-primary-400">
                ₹{(booking.pricing?.totalAmount || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Error message */}
      {paymentError && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-400">{paymentError}</p>
        </div>
      )}

      {/* Payment method */}
      <div className="card dark:bg-slate-800 p-5">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-wide">
          Payment Method
        </h2>

        <div className="border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4 bg-blue-50 dark:bg-blue-900/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-16 bg-[#003087] rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xs tracking-wider">PayPal</span>
            </div>
            <div>
              <div className="font-medium text-gray-900 dark:text-white text-sm">
                PayPal / Debit / Credit Card
              </div>
              <div className="text-xs text-gray-500 dark:text-slate-400">
                Safe and secure checkout
              </div>
            </div>
          </div>

          {/* Dev mode notice */}
          <div className="flex items-start gap-2.5 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl mb-4">
            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-700 dark:text-yellow-400 leading-relaxed">
              <span className="font-semibold">Development Mode — </span>
              Payment is simulated. In production this will redirect to real PayPal checkout.
            </p>
          </div>

          <Button
            onClick={handlePay}
            loading={paymentStep === 'processing'}
            disabled={paymentStep === 'processing'}
            className="w-full py-3.5 text-base font-semibold bg-[#0070BA] hover:bg-[#003087] border-0"
          >
            {paymentStep === 'processing' ? (
              'Processing...'
            ) : (
              <>
                <CreditCard className="h-5 w-5" />
                Pay ₹{(booking.pricing?.totalAmount || 0).toLocaleString()}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Security footer */}
      <div className="flex items-center justify-center gap-6 py-2 text-xs text-gray-400 dark:text-slate-500">
        <div className="flex items-center gap-1.5">
          <Lock className="h-3.5 w-3.5" />
          256-bit SSL
        </div>
        <div className="flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5" />
          Secure
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle className="h-3.5 w-3.5" />
          Instant Confirm
        </div>
      </div>
    </div>
  );
}