import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, CreditCard, CheckCircle,
  Lock, AlertCircle, Calendar, BedDouble,
} from 'lucide-react';
import {
  useCreatePaymentOrder,
  useMockCapture,
  useCapturePayment,
} from '../../hooks/usePayments';
import { useConfirmBooking } from '../../hooks/useBookings';
import Button from '../../components/ui/Button';
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

  const [paymentStep, setPaymentStep] = useState('review'); // review | processing | success
  const [paymentData, setPaymentData] = useState(null);

  const createOrderMutation = useCreatePaymentOrder();
  const mockCaptureMutation = useMockCapture();
  const capturePaymentMutation = useCapturePayment();
  const confirmBookingMutation = useConfirmBooking();

  // Guard
  useEffect(() => {
    if (!booking) {
      navigate('/dashboard/guest/search');
      return;
    }

    const params = new URLSearchParams(window.location.search);

    const token = params.get('token');
    const payerId = params.get('PayerID');
    const status = params.get('status');
    const payBookingId = params.get('bookingId');

    if (status === 'approved' && token) {
      setPaymentStep('processing');

      handleRealCapture(token, payBookingId);

    } else if (status === 'cancel') {
      setPaymentStep('review');
    } setPaymentStep('review');
  
  }, []);
  

const handleRealCapture = async (orderId, payBookingId) => {
  try {

    // REAL PayPal capture
    await capturePaymentMutation.mutateAsync({
      orderId,
      bookingId: payBookingId || booking._id,
    });

    // Optional fallback confirm
    try {
      await confirmBookingMutation.mutateAsync({
        id: payBookingId || booking._id,
      });
    } catch (err) {
      console.warn('Booking confirm fallback skipped');
    }

    sessionStorage.removeItem('currentBooking');

    setPaymentStep('success');

  } catch (err) {
    console.error('Capture failed:', err);

    setPaymentStep('review');
  }
};

if (!booking) {
  return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
}




const checkIn = new Date(booking.checkInDate);
const checkOut = new Date(booking.checkOutDate);
const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

// Step 1 — Create PayPal order (get payment ID)
const handleInitiatePayment = async () => {
  try {
    setPaymentStep('processing');

    const order = await createOrderMutation.mutateAsync({
      bookingId: booking._id,
      bookingRef: booking.bookingRef,
      amount: booking.pricing?.totalAmount || 0,
    });

    setPaymentData(order);

    if (order.approvalUrl && !order.isDev) {
      // Real PayPal — redirect to PayPal for approval
      window.location.href = order.approvalUrl;
    } else {
      // Development mock — simulate payment
      await handleMockCapture(order);
    }

  } catch (err) {
    console.error('Payment error:', err);
    setPaymentStep('review');
  }
};

// Step 2 — Mock capture + confirm booking
const handleMockCapture = async (order) => {
  try {
    // Capture the payment
    await mockCaptureMutation.mutateAsync({
      bookingId: booking._id,
      paymentId: order?.paymentId,
      bookingRef: booking.bookingRef,
      amount: booking.pricing?.totalAmount || 0,
    });

    // Confirm the booking (payment.completed event should do this automatically
    // via RabbitMQ, but we also do it directly as a fallback)
    try {
      await confirmBookingMutation.mutateAsync({
        id: booking._id,
        paymentId: order?.paymentId,
      });
    } catch (confirmErr) {
      // It's ok if this fails — RabbitMQ event will handle it
      console.warn('Direct confirm failed (RabbitMQ will handle it):', confirmErr.message);
    }

    // Clear session storage
    sessionStorage.removeItem('currentBooking');

    setPaymentStep('success');

  } catch (err) {
    console.error('Mock capture error:', err);
    setPaymentStep('review');
  }
};





// Success screen
if (paymentStep === 'success') {
  return (
    <div className="max-w-lg mx-auto py-12 px-4 text-center">
      <div className="card p-8">
        <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Booking Confirmed!
        </h1>
        <p className="text-gray-500 dark:text-slate-400 mb-6">
          Your payment was successful and booking is confirmed.
        </p>

        <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-4 mb-6 text-left space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-slate-400">Booking Ref</span>
            <span className="font-mono font-bold text-primary-700">
              {booking.bookingRef}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-slate-400">Hotel</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {selectedProperty?.name || 'Your Hotel'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-slate-400">Check-in</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {checkIn.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-slate-400">Amount Paid</span>
            <span className="font-bold text-green-600">
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
            className="text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
          >
            Search More Hotels
          </button>
        </div>
      </div>
    </div>
  );
}

return (
  <div className="max-w-lg mx-auto space-y-6 pb-12">
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Complete Payment
      </h1>
      <p className="text-gray-500 dark:text-slate-400 mt-1">
        Secure payment for your booking
      </p>
    </div>

    {/* Booking summary */}
    <div className="card p-5">
      <h2 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm">
        Booking Summary
      </h2>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-slate-400">Reference</span>
          <span className="font-mono font-bold text-primary-700">{booking.bookingRef}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-slate-400">Hotel</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {selectedProperty?.name || 'Your Hotel'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-slate-400 flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" /> Check-in
          </span>
          <span className="font-medium text-gray-900 dark:text-white">
            {checkIn.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-slate-400 flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" /> Check-out
          </span>
          <span className="font-medium text-gray-900 dark:text-white">
            {checkOut.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-slate-400 flex items-center gap-1">
            <BedDouble className="h-3.5 w-3.5" /> Duration
          </span>
          <span className="font-medium text-gray-900 dark:text-white">
            {nights} night{nights > 1 ? 's' : ''}
          </span>
        </div>
        <div className="border-t dark:border-slate-700 pt-2 flex justify-between font-bold text-base">
          <span className="text-gray-900 dark:text-white">Total Amount</span>
          <span className="text-primary-700">
            ₹{(booking.pricing?.totalAmount || 0).toLocaleString()}
          </span>
        </div>
      </div>
    </div>

    {/* Payment method */}
    <div className="card p-5">
      <h2 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm">
        Payment Method
      </h2>

      {/* PayPal button area */}
      <div className="border-2 border-primary-200 dark:border-primary-800 rounded-xl p-4 bg-primary-50 dark:bg-primary-900/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-16 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">PayPal</span>
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white text-sm">
              PayPal / Debit / Credit Card
            </div>
            <div className="text-xs text-gray-500 dark:text-slate-400">
              Secure payment via PayPal gateway
            </div>
          </div>
        </div>

        {/* Dev mode notice */}
        <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg mb-4">
          <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-yellow-700 dark:text-yellow-400">
            <span className="font-semibold">Development Mode:</span> Payment is simulated.
            In production this redirects to real PayPal.
          </div>
        </div>

        <Button
          onClick={handleInitiatePayment}
          loading={paymentStep === 'processing'}
          disabled={paymentStep === 'processing'}
          className="w-full py-3 text-base bg-blue-600 hover:bg-blue-700"
        >
          {paymentStep === 'processing' ? (
            'Processing Payment...'
          ) : (
            <>
              <CreditCard className="h-5 w-5" />
              Pay ₹{(booking.pricing?.totalAmount || 0).toLocaleString()} with PayPal
            </>
          )}
        </Button>
      </div>
    </div>

    {/* Security badges */}
    <div className="flex items-center justify-center gap-6 text-xs text-gray-400 dark:text-slate-500">
      <div className="flex items-center gap-1.5">
        <Lock className="h-3.5 w-3.5" />
        256-bit SSL
      </div>
      <div className="flex items-center gap-1.5">
        <Shield className="h-3.5 w-3.5" />
        Secure Checkout
      </div>
      <div className="flex items-center gap-1.5">
        <CheckCircle className="h-3.5 w-3.5" />
        Instant Confirmation
      </div>
    </div>
  </div>
);
}