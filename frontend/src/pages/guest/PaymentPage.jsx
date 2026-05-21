import { useNavigate } from 'react-router-dom';
import { CheckCircle, Shield, AlertCircle } from 'lucide-react';
import { useMockCapture } from '../../hooks/usePayments';
import Button from '../../components/ui/Button';
import Alert  from '../../components/ui/Alert';

export default function PaymentPage() {
  const navigate  = useNavigate();
  const booking   = JSON.parse(sessionStorage.getItem('pendingBooking') || 'null');
  const property  = JSON.parse(sessionStorage.getItem('selectedProperty') || 'null');
  const roomType  = JSON.parse(sessionStorage.getItem('selectedRoomType') || 'null');

  const mockCaptureMutation = useMockCapture();

  if (!booking) {
    return (
      <div className="card p-8 text-center">
        <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <p className="font-medium">No pending booking found</p>
        <button onClick={() => navigate('/dashboard/guest/search')} className="btn-primary mt-4">
          Search Hotels
        </button>
      </div>
    );
  }

  if (mockCaptureMutation.isSuccess) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
        <p className="text-gray-500 mb-2">
          Your booking reference is
        </p>
        <p className="text-2xl font-bold text-primary-700 mb-6">
          {booking.bookingRef}
        </p>
        <p className="text-gray-500 mb-8">
          A confirmation email has been sent to your registered email address.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => navigate('/dashboard/guest/bookings')}
            className="btn-primary w-full py-3"
          >
            View My Bookings
          </button>
          <button
            onClick={() => navigate('/dashboard/guest')}
            className="btn-secondary w-full py-3"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handlePay = async () => {
    try {
      await mockCaptureMutation.mutateAsync({
        bookingId:  booking._id,
        bookingRef: booking.bookingRef,
        amount:     booking.pricing?.totalAmount,
      });
      // Clear session storage
      sessionStorage.removeItem('pendingBooking');
    } catch (err) {
      // Error handled by mutation state
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Complete Payment</h1>
        <p className="text-gray-500 mt-1">Secure payment powered by PayPal</p>
      </div>

      {/* Order summary */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Property</span>
            <span className="font-medium">{property?.name}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Room</span>
            <span className="font-medium">{roomType?.name}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Booking ref</span>
            <span className="font-medium font-mono">{booking.bookingRef}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Base price</span>
            <span>₹{booking.pricing?.basePrice?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>GST (18%)</span>
            <span>₹{booking.pricing?.taxAmount?.toLocaleString()}</span>
          </div>
          <div className="border-t pt-3 flex justify-between font-bold text-lg text-gray-900">
            <span>Total</span>
            <span>₹{booking.pricing?.totalAmount?.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {mockCaptureMutation.isError && (
        <Alert type="error" message="Payment failed. Please try again." />
      )}

      {/* Pay button */}
      <div className="card p-6 space-y-4">
        <Button
          onClick={handlePay}
          loading={mockCaptureMutation.isPending}
          className="w-full py-4 text-lg"
        >
          Pay ₹{booking.pricing?.totalAmount?.toLocaleString()}
        </Button>

        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
          <Shield className="h-3.5 w-3.5" />
          <span>256-bit SSL encryption — Your payment is secure</span>
        </div>
      </div>
    </div>
  );
}